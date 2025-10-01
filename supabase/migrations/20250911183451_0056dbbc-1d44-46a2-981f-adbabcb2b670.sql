-- Create lab panels table for available tests
CREATE TABLE public.lab_panels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'basic', 'comprehensive', 'specialty'
  biomarkers TEXT[] NOT NULL, -- Array of biomarker names
  base_price INTEGER NOT NULL, -- Price in cents
  lab_provider TEXT NOT NULL DEFAULT 'quest', -- 'quest', 'labcorp'
  sample_type TEXT NOT NULL DEFAULT 'blood', -- 'blood', 'urine', 'saliva'
  fasting_required BOOLEAN DEFAULT false,
  turnaround_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for lab purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  clinic_id UUID,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'completed', 'cancelled'
  order_type TEXT NOT NULL DEFAULT 'lab_panel', -- 'lab_panel', 'analysis_only'
  total_amount INTEGER NOT NULL, -- Total in cents
  lab_fee INTEGER, -- Lab cost in cents
  authorization_fee INTEGER DEFAULT 1250, -- $12.50 in cents
  draw_fee INTEGER DEFAULT 1000, -- $10.00 in cents
  processing_fee INTEGER, -- Our fee in cents
  stripe_payment_intent_id TEXT,
  fullscript_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table for individual panel/analysis items
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  lab_panel_id UUID REFERENCES public.lab_panels(id),
  lab_report_id UUID REFERENCES public.lab_reports(id), -- For analysis-only orders
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL, -- Price in cents
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplement_products table for Fullscript catalog cache
CREATE TABLE public.supplement_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fullscript_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  description TEXT,
  category TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  form TEXT, -- 'capsule', 'tablet', 'liquid', etc.
  size_info TEXT, -- '60 capsules', '30ml', etc.
  price_cents INTEGER,
  deep_link_url TEXT,
  contraindications TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_lab_panels_category ON public.lab_panels(category);
CREATE INDEX idx_lab_panels_active ON public.lab_panels(is_active);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_supplement_products_fullscript_id ON public.supplement_products(fullscript_id);
CREATE INDEX idx_supplement_products_category ON public.supplement_products(category);

-- Enable RLS on all new tables
ALTER TABLE public.lab_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lab_panels
CREATE POLICY "Lab panels are viewable by everyone"
ON public.lab_panels FOR SELECT
USING (is_active = true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for order_items
CREATE POLICY "Users can view their order items"
ON public.order_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.orders o 
  WHERE o.id = order_items.order_id 
  AND o.user_id = auth.uid()
));

CREATE POLICY "Users can create their order items"
ON public.order_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders o 
  WHERE o.id = order_items.order_id 
  AND o.user_id = auth.uid()
));

-- RLS Policies for supplement_products
CREATE POLICY "Supplement products are viewable by everyone"
ON public.supplement_products FOR SELECT
USING (is_active = true);

-- Create triggers for updated_at
CREATE TRIGGER update_lab_panels_updated_at
  BEFORE UPDATE ON public.lab_panels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplement_products_updated_at
  BEFORE UPDATE ON public.supplement_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample lab panels
INSERT INTO public.lab_panels (name, description, category, biomarkers, base_price, lab_provider) VALUES
('Basic Health Panel', 'Essential markers for overall health assessment', 'basic', 
 ARRAY['CBC with Differential', 'Comprehensive Metabolic Panel', 'Lipid Panel', 'TSH'], 
 8900, 'quest'),
('Comprehensive Metabolic', 'Advanced metabolic and nutritional analysis', 'comprehensive',
 ARRAY['CBC', 'CMP', 'Lipid Panel', 'TSH', 'Free T3', 'Free T4', 'Vitamin D', 'B12', 'Folate', 'Iron Panel'],
 15900, 'quest'),
('Hormone Optimization', 'Complete hormone analysis for men and women', 'specialty',
 ARRAY['Total Testosterone', 'Free Testosterone', 'Estradiol', 'DHEA-S', 'Cortisol AM', 'IGF-1', 'LH', 'FSH'],
 18900, 'quest'),
('Methylation & Detox', 'Genetic methylation and detoxification pathways', 'specialty',
 ARRAY['Homocysteine', 'Methylmalonic Acid', 'MTHFR', 'Glutathione', 'SAM/SAH Ratio'],
 22900, 'quest'),
('Cardiovascular Risk', 'Advanced cardiac and inflammatory markers', 'comprehensive',
 ARRAY['Lipid Panel', 'ApoB', 'Lp(a)', 'hsCRP', 'Homocysteine', 'Fibrinogen', 'MPO'],
 16900, 'quest');