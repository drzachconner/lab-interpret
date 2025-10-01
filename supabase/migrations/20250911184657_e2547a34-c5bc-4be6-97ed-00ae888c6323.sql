-- Insert sample supplement products for AI recommendations
INSERT INTO public.supplement_products (fullscript_id, name, brand, description, category, ingredients, form, size_info, price_cents, deep_link_url, contraindications) VALUES
('FS-VD3K2-001', 'Vitamin D3 + K2', 'Thorne', 'High-potency vitamin D3 with K2 for bone and cardiovascular health', 'vitamins', '[{"name":"Vitamin D3","amount":"5000 IU"},{"name":"Vitamin K2 (MK-7)","amount":"90 mcg"}]'::jsonb, 'liquid', '30 mL', 2800, 'https://supplements.labpilot.com/product/vitamin-d3-k2-thorne', ARRAY['warfarin', 'anticoagulant therapy']),

('FS-METHYL-B-002', 'Methyl B-Complex', 'Designs for Health', 'Methylated B vitamins for optimal absorption and methylation support', 'b-vitamins', '[{"name":"Methylfolate","amount":"800 mcg"},{"name":"Methylcobalamin","amount":"1000 mcg"},{"name":"Riboflavin-5-P","amount":"25 mg"},{"name":"B6 (P5P)","amount":"25 mg"}]'::jsonb, 'capsule', '60 capsules', 3600, 'https://supplements.labpilot.com/product/methyl-b-complex-dfh', ARRAY['concurrent high-dose niacin']),

('FS-OMEGA3-003', 'EPA/DHA Fish Oil', 'Nordic Naturals', 'Concentrated omega-3 fatty acids for cardiovascular and brain health', 'omega-3', '[{"name":"EPA","amount":"750 mg"},{"name":"DHA","amount":"500 mg"}]'::jsonb, 'softgel', '60 softgels', 4200, 'https://supplements.labpilot.com/product/epa-dha-nordic', ARRAY['fish allergy', 'seafood allergy']),

('FS-MAGNESIUM-004', 'Magnesium Glycinate', 'Pure Encapsulations', 'Highly bioavailable magnesium for muscle and nervous system support', 'minerals', '[{"name":"Magnesium (as Magnesium Glycinate)","amount":"120 mg"}]'::jsonb, 'capsule', '180 capsules', 2400, 'https://supplements.labpilot.com/product/magnesium-glycinate-pe', ARRAY['kidney disease']),

('FS-PROBIOTICS-005', 'Multi-Strain Probiotic', 'Klaire Labs', '50 billion CFU multi-strain probiotic for digestive health', 'probiotics', '[{"name":"Lactobacillus acidophilus","amount":"15 billion CFU"},{"name":"Bifidobacterium longum","amount":"10 billion CFU"},{"name":"Lactobacillus rhamnosus","amount":"15 billion CFU"},{"name":"Bifidobacterium bifidum","amount":"10 billion CFU"}]'::jsonb, 'capsule', '60 capsules', 5200, 'https://supplements.labpilot.com/product/probiotic-klaire', ARRAY['immunocompromised conditions']),

('FS-CURCUMIN-006', 'Curcumin Phytosome', 'Thorne', 'Enhanced absorption curcumin for anti-inflammatory support', 'herbs', '[{"name":"Curcumin Phytosome","amount":"500 mg"}]'::jsonb, 'capsule', '60 capsules', 3800, 'https://supplements.labpilot.com/product/curcumin-thorne', ARRAY['gallbladder disease', 'bile duct obstruction']),

('FS-COENZQ10-007', 'CoQ10 Ubiquinol', 'Jarrow Formulas', 'Active form of CoQ10 for cellular energy and cardiovascular support', 'antioxidants', '[{"name":"Ubiquinol","amount":"100 mg"}]'::jsonb, 'softgel', '60 softgels', 4800, 'https://supplements.labpilot.com/product/coq10-jarrow', ARRAY['blood thinning medications']),

('FS-ZINC-008', 'Zinc Bisglycinate', 'Designs for Health', 'Chelated zinc for immune function and wound healing', 'minerals', '[{"name":"Zinc (as Zinc Bisglycinate)","amount":"15 mg"}]'::jsonb, 'capsule', '90 capsules', 1800, 'https://supplements.labpilot.com/product/zinc-dfh', ARRAY['copper deficiency risk with high doses']),

('FS-ASHWAGANDHA-009', 'KSM-66 Ashwagandha', 'Gaia Herbs', 'Standardized ashwagandha extract for stress and cortisol support', 'adaptogens', '[{"name":"KSM-66 Ashwagandha","amount":"300 mg"}]'::jsonb, 'capsule', '60 capsules', 2600, 'https://supplements.labpilot.com/product/ashwagandha-gaia', ARRAY['pregnancy', 'autoimmune conditions']),

('FS-IRON-010', 'Iron Bisglycinate', 'Pure Encapsulations', 'Gentle, well-absorbed iron for iron deficiency support', 'minerals', '[{"name":"Iron (as Iron Bisglycinate)","amount":"18 mg"}]'::jsonb, 'capsule', '90 capsules', 2200, 'https://supplements.labpilot.com/product/iron-pe', ARRAY['hemochromatosis', 'iron overload']),

('FS-BERBERINE-011', 'Berberine HCL', 'Integrative Therapeutics', 'Berberine for metabolic and blood sugar support', 'metabolic', '[{"name":"Berberine HCL","amount":"500 mg"}]'::jsonb, 'capsule', '90 capsules', 3200, 'https://supplements.labpilot.com/product/berberine-it', ARRAY['pregnancy', 'breastfeeding']),

('FS-NAC-012', 'N-Acetyl Cysteine', 'NOW Foods', 'Antioxidant and liver detoxification support', 'antioxidants', '[{"name":"N-Acetyl Cysteine","amount":"600 mg"}]'::jsonb, 'capsule', '100 capsules', 2000, 'https://supplements.labpilot.com/product/nac-now', ARRAY['asthma medications']),

('FS-DIGESTIVE-013', 'Digestive Enzymes', 'Enzymedica', 'Comprehensive digestive enzyme blend', 'digestive', '[{"name":"Amylase","amount":"23000 DU"},{"name":"Protease","amount":"80000 HUT"},{"name":"Lipase","amount":"4000 FIP"},{"name":"Cellulase","amount":"800 CU"}]'::jsonb, 'capsule', '90 capsules', 2800, 'https://supplements.labpilot.com/product/enzymes-enzymedica', ARRAY[]::text[]),

('FS-METHYLFOLATE-014', 'Methylfolate', 'Seeking Health', 'Active form of folate for methylation and DNA synthesis', 'b-vitamins', '[{"name":"5-MTHF (Methylfolate)","amount":"1000 mcg"}]'::jsonb, 'capsule', '100 capsules', 2400, 'https://supplements.labpilot.com/product/methylfolate-sh', ARRAY['MTHFR mutations require monitoring']),

('FS-RHODIOLA-015', 'Rhodiola Rosea', 'Life Extension', 'Adaptogenic herb for stress resilience and energy', 'adaptogens', '[{"name":"Rhodiola Rosea Extract","amount":"250 mg"},{"name":"Rosavins","amount":"7.5 mg"},{"name":"Salidrosides","amount":"2.5 mg"}]'::jsonb, 'capsule', '60 capsules', 2200, 'https://supplements.labpilot.com/product/rhodiola-le', ARRAY['bipolar disorder', 'mania']);