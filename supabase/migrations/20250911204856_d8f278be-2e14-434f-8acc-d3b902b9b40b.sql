-- Fix security issues by setting search_path for functions

-- Update schedule_supplement_refill_reminder function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update schedule_future_test_reminder function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update process_email_reminders function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;