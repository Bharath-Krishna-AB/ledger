-- Run this in your Supabase SQL Editor

-- 1. Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant TEXT NOT NULL,
    merchant_id TEXT,
    transaction_id TEXT,
    payment_date DATE NOT NULL,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create purchase_items table
CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    price NUMERIC NOT NULL,
    quantity INTEGER DEFAULT 1,
    warranty_months INTEGER DEFAULT 0,
    return_window_days INTEGER DEFAULT 0,
    warranty_expiry_date DATE,
    return_deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies so users can only see their own purchases
CREATE POLICY "Users can insert their own purchases"
    ON public.purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own purchases"
    ON public.purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
    ON public.purchases FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchases"
    ON public.purchases FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase items"
    ON public.purchase_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own purchase items"
    ON public.purchase_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase items"
    ON public.purchase_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase items"
    ON public.purchase_items FOR DELETE
    USING (auth.uid() = user_id);
