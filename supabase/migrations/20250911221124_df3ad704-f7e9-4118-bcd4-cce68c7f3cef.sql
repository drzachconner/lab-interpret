-- Ticket 2: Enhanced data model for HIPAA-compliant de-identification

-- Add missing fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auth_id TEXT,
ADD COLUMN IF NOT EXISTS sex TEXT,
ADD COLUMN IF NOT EXISTS age_bucket TEXT,
ADD COLUMN IF NOT EXISTS fs_token TEXT; -- Will be encrypted at app level

-- Create lab_orders table
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    panel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    raw_result JSONB, -- Encrypted blob for original data
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interpretations table  
CREATE TABLE IF NOT EXISTS public.interpretations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    lab_order_id UUID NOT NULL,
    analysis JSONB NOT NULL, -- De-identified analysis results
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interpretations ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_orders (user can only access their own)
CREATE POLICY "Users can view their own lab orders" 
ON public.lab_orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lab orders" 
ON public.lab_orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab orders" 
ON public.lab_orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lab orders" 
ON public.lab_orders 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for interpretations (user can only access their own)
CREATE POLICY "Users can view their own interpretations" 
ON public.interpretations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interpretations" 
ON public.interpretations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interpretations" 
ON public.interpretations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interpretations" 
ON public.interpretations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_lab_orders_updated_at
    BEFORE UPDATE ON public.lab_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interpretations_updated_at
    BEFORE UPDATE ON public.interpretations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lab_orders_user_id ON public.lab_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_status ON public.lab_orders(status);
CREATE INDEX IF NOT EXISTS idx_interpretations_user_id ON public.interpretations(user_id);
CREATE INDEX IF NOT EXISTS idx_interpretations_lab_order_id ON public.interpretations(lab_order_id);