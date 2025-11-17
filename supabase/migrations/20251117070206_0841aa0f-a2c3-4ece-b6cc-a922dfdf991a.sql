-- Drop unique constraint on name since subcategories can have same name under different parent categories
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- Add parent_id to categories table to support hierarchical structure
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Clear existing categories
DELETE FROM public.categories;

-- Create main categories
INSERT INTO public.categories (id, name, slug, description, parent_id) VALUES
('11111111-1111-1111-1111-111111111111', 'Men', 'men', 'Men''s luxury fashion and accessories', NULL),
('22222222-2222-2222-2222-222222222222', 'Women', 'women', 'Women''s luxury fashion and accessories', NULL),
('33333333-3333-3333-3333-333333333333', 'Children', 'children', 'Children''s luxury fashion and accessories', NULL);

-- Men's subcategories
INSERT INTO public.categories (name, slug, description, parent_id) VALUES
('Jerseys', 'men-jerseys', 'Men''s sports jerseys', '11111111-1111-1111-1111-111111111111'),
('Shirts', 'men-shirts', 'Men''s designer shirts', '11111111-1111-1111-1111-111111111111'),
('Pants', 'men-pants', 'Men''s designer pants', '11111111-1111-1111-1111-111111111111'),
('Suits', 'men-suits', 'Men''s designer suits', '11111111-1111-1111-1111-111111111111'),
('Jackets', 'men-jackets', 'Men''s designer jackets', '11111111-1111-1111-1111-111111111111'),
('Shoes', 'men-shoes', 'Men''s designer shoes', '11111111-1111-1111-1111-111111111111'),
('Sneakers', 'men-sneakers', 'Men''s designer sneakers', '11111111-1111-1111-1111-111111111111'),
('Bags', 'men-bags', 'Men''s designer bags', '11111111-1111-1111-1111-111111111111'),
('Watches', 'men-watches', 'Men''s luxury watches', '11111111-1111-1111-1111-111111111111'),
('Accessories', 'men-accessories', 'Men''s designer accessories', '11111111-1111-1111-1111-111111111111'),
('Fragrances', 'men-fragrances', 'Men''s designer fragrances', '11111111-1111-1111-1111-111111111111');

-- Women's subcategories
INSERT INTO public.categories (name, slug, description, parent_id) VALUES
('Jerseys', 'women-jerseys', 'Women''s sports jerseys', '22222222-2222-2222-2222-222222222222'),
('Dresses', 'women-dresses', 'Women''s designer dresses', '22222222-2222-2222-2222-222222222222'),
('Tops', 'women-tops', 'Women''s designer tops', '22222222-2222-2222-2222-222222222222'),
('Skirts', 'women-skirts', 'Women''s designer skirts', '22222222-2222-2222-2222-222222222222'),
('Pants', 'women-pants', 'Women''s designer pants', '22222222-2222-2222-2222-222222222222'),
('Jackets', 'women-jackets', 'Women''s designer jackets', '22222222-2222-2222-2222-222222222222'),
('Shoes', 'women-shoes', 'Women''s designer shoes', '22222222-2222-2222-2222-222222222222'),
('Heels', 'women-heels', 'Women''s designer heels', '22222222-2222-2222-2222-222222222222'),
('Handbags', 'women-handbags', 'Women''s designer handbags', '22222222-2222-2222-2222-222222222222'),
('Jewelry', 'women-jewelry', 'Women''s designer jewelry', '22222222-2222-2222-2222-222222222222'),
('Watches', 'women-watches', 'Women''s luxury watches', '22222222-2222-2222-2222-222222222222'),
('Accessories', 'women-accessories', 'Women''s designer accessories', '22222222-2222-2222-2222-222222222222'),
('Beauty', 'women-beauty', 'Women''s beauty products', '22222222-2222-2222-2222-222222222222'),
('Fragrances', 'women-fragrances', 'Women''s designer fragrances', '22222222-2222-2222-2222-222222222222');

-- Children's subcategories
INSERT INTO public.categories (name, slug, description, parent_id) VALUES
('Jerseys', 'children-jerseys', 'Children''s sports jerseys', '33333333-3333-3333-3333-333333333333'),
('Clothing', 'children-clothing', 'Children''s designer clothing', '33333333-3333-3333-3333-333333333333'),
('Shoes', 'children-shoes', 'Children''s designer shoes', '33333333-3333-3333-3333-333333333333'),
('Sneakers', 'children-sneakers', 'Children''s designer sneakers', '33333333-3333-3333-3333-333333333333'),
('Bags', 'children-bags', 'Children''s designer bags', '33333333-3333-3333-3333-333333333333'),
('Accessories', 'children-accessories', 'Children''s designer accessories', '33333333-3333-3333-3333-333333333333');