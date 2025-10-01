-- Create tables for email reminder system

-- Table for user supplement orders
CREATE TABLE public.supplement_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  supplement_name TEXT NOT NULL,
  dosage_per_day TEXT,
  supply_days INTEGER DEFAULT 30,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for recommended future tests
CREATE TABLE public.future_test_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lab_panel_id TEXT NOT NULL,
  recommended_date DATE NOT NULL,
  reason TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  last_reminder_sent TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for email reminder queue
CREATE TABLE public.email_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('supplement_refill', 'future_test')),
  reference_id UUID NOT NULL, -- points to supplement_orders.id or future_test_recommendations.id
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.future_test_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supplement_orders
CREATE POLICY "Users can view their own supplement orders" 
ON public.supplement_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplement orders" 
ON public.supplement_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement orders" 
ON public.supplement_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for future_test_recommendations
CREATE POLICY "Users can view their own test recommendations" 
ON public.future_test_recommendations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test recommendations" 
ON public.future_test_recommendations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test recommendations" 
ON public.future_test_recommendations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for email_reminders
CREATE POLICY "Users can view their own email reminders" 
ON public.email_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can manage all email reminders for background jobs
CREATE POLICY "Service role can manage email reminders" 
ON public.email_reminders 
FOR ALL 
USING (auth.role() = 'service_role');

-- Function to schedule supplement refill reminders
CREATE OR REPLACE FUNCTION public.schedule_supplement_refill_reminder(
  p_user_id UUID,
  p_supplement_order_id UUID,
  p_supplement_name TEXT,
  p_supply_days INTEGER
) RETURNS void AS $$
DECLARE
  reminder_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Schedule reminder 7 days before supplement runs out
  reminder_date := (SELECT order_date + INTERVAL '1 day' * (p_supply_days - 7) FROM supplement_orders WHERE id = p_supplement_order_id);
  
  -- Only schedule if the reminder date is in the future
  IF reminder_date > now() THEN
    INSERT INTO email_reminders (
      user_id,
      email_type,
      reference_id,
      scheduled_for,
      subject,
      body
    ) VALUES (
      p_user_id,
      'supplement_refill',
      p_supplement_order_id,
      reminder_date,
      'Time to Reorder: ' || p_supplement_name,
      'Based on your supplement protocol, you should be running low on ' || p_supplement_name || '. Order your refill now to maintain consistent results.'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule future test reminders
CREATE OR REPLACE FUNCTION public.schedule_future_test_reminder(
  p_user_id UUID,
  p_lab_panel_id TEXT,
  p_recommended_date DATE,
  p_reason TEXT
) RETURNS UUID AS $$
DECLARE
  recommendation_id UUID;
  reminder_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Create the recommendation record
  INSERT INTO future_test_recommendations (
    user_id,
    lab_panel_id,
    recommended_date,
    reason
  ) VALUES (
    p_user_id,
    p_lab_panel_id,
    p_recommended_date,
    p_reason
  ) RETURNING id INTO recommendation_id;
  
  -- Schedule reminder 14 days before recommended date
  reminder_date := p_recommended_date::timestamp - INTERVAL '14 days';
  
  -- Only schedule if the reminder date is in the future
  IF reminder_date > now() THEN
    INSERT INTO email_reminders (
      user_id,
      email_type,
      reference_id,
      scheduled_for,
      subject,
      body
    ) VALUES (
      p_user_id,
      'future_test',
      recommendation_id,
      reminder_date,
      'Recommended Follow-up Testing',
      'Based on your recent analysis, we recommend retesting: ' || p_lab_panel_id || '. Reason: ' || p_reason
    );
  END IF;
  
  RETURN recommendation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process email reminder queue (to be called by cron job)
CREATE OR REPLACE FUNCTION public.process_email_reminders() RETURNS INTEGER AS $$
DECLARE
  reminder_record RECORD;
  processed_count INTEGER := 0;
BEGIN
  -- Get all pending reminders that are due
  FOR reminder_record IN 
    SELECT er.*, u.email, u.user_metadata
    FROM email_reminders er
    JOIN auth.users u ON er.user_id = u.id
    WHERE er.status = 'pending' 
    AND er.scheduled_for <= now()
    ORDER BY er.scheduled_for
    LIMIT 100
  LOOP
    -- Here you would integrate with your email service (Resend, SendGrid, etc.)
    -- For now, we'll just mark as sent and log
    
    UPDATE email_reminders 
    SET status = 'sent', sent_at = now() 
    WHERE id = reminder_record.id;
    
    -- Update the related records
    IF reminder_record.email_type = 'supplement_refill' THEN
      UPDATE supplement_orders 
      SET last_reminder_sent = now() 
      WHERE id = reminder_record.reference_id;
    ELSIF reminder_record.email_type = 'future_test' THEN
      UPDATE future_test_recommendations 
      SET reminder_sent = true, last_reminder_sent = now() 
      WHERE id = reminder_record.reference_id;
    END IF;
    
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_supplement_orders_updated_at
  BEFORE UPDATE ON public.supplement_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_future_test_recommendations_updated_at
  BEFORE UPDATE ON public.future_test_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();