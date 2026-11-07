-- ==============================================================================
-- Smart Personal Expense Tracker and Budget Management System
-- Database Schema for Supabase PostgreSQL
-- ==============================================================================

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- 2. Create TRANSACTIONS table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(user_id, category);

-- Enable RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions RLS policies
CREATE POLICY "Users can view own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
    ON public.transactions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
    ON public.transactions FOR DELETE 
    USING (auth.uid() = user_id);

-- 3. Create BUDGETS table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_category_month_year UNIQUE (user_id, category, month, year)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON public.budgets(user_id, year, month);

-- Enable RLS for budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Budgets RLS policies
CREATE POLICY "Users can view own budgets" 
    ON public.budgets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" 
    ON public.budgets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" 
    ON public.budgets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" 
    ON public.budgets FOR DELETE 
    USING (auth.uid() = user_id);

-- 4. Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, currency, created_at, updated_at)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Account Holder'),
        COALESCE(new.raw_user_meta_data->>'currency', 'INR'),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
