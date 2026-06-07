-- Create tables for our campus logistics MVP

-- 1. Profiles Table (linked to Supabase Auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'khach_hang' CHECK (role IN ('khach_hang', 'shipper', 'quan_tri')),
    reputation INTEGER NOT NULL DEFAULT 100,
    orders_completed INTEGER NOT NULL DEFAULT 0,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    balance NUMERIC NOT NULL DEFAULT 200000 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Orders Table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    shipper_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_type TEXT NOT NULL CHECK (order_type IN ('do_an', 'do_uong', 'in_an')),
    delivery_location TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    notes TEXT,
    shipping_fee NUMERIC NOT NULL CHECK (shipping_fee >= 0),
    item_cost NUMERIC NOT NULL DEFAULT 0 CHECK (item_cost >= 0),
    total_amount NUMERIC NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'cho_nhan' CHECK (status IN ('cho_nhan', 'da_nhan', 'dang_giao', 'hoan_thanh', 'da_huy')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
CREATE POLICY "Orders are viewable by anyone in the system." ON public.orders
    FOR SELECT USING (true);

CREATE POLICY "Customers can create orders." ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own orders before they are accepted." ON public.orders
    FOR UPDATE USING (
        auth.uid() = customer_id 
        AND (status = 'cho_nhan' OR status = 'da_huy')
    );

CREATE POLICY "Shippers can accept and update orders they delivery." ON public.orders
    FOR UPDATE USING (
        (auth.uid() = shipper_id) 
        OR 
        (status = 'cho_nhan' AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'shipper'
        ))
    );

CREATE POLICY "Admins can manage all orders." ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'quan_tri'
        )
    );

-- 3. Printing Details Table (holds options for PDF printing orders)
CREATE TABLE public.printing_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    copies INTEGER NOT NULL DEFAULT 1 CHECK (copies > 0),
    is_color BOOLEAN NOT NULL DEFAULT false,
    is_double_sided BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security for printing details
ALTER TABLE public.printing_details ENABLE ROW LEVEL SECURITY;

-- Printing Details Policies
CREATE POLICY "Printing details are viewable by everyone." ON public.printing_details
    FOR SELECT USING (true);

CREATE POLICY "Users can insert printing details for their orders." ON public.printing_details
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND customer_id = auth.uid()
        )
    );

-- 4. Ratings Table
CREATE TABLE public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    from_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    to_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT ratings_unique_order_direction UNIQUE (order_id, from_id)
);

-- Enable Row Level Security for ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings Policies
CREATE POLICY "Ratings are viewable by everyone." ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for orders they were involved in." ON public.ratings
    FOR INSERT WITH CHECK (
        auth.uid() = from_id 
        AND EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id 
            AND (customer_id = auth.uid() OR shipper_id = auth.uid())
        )
    );

-- 5. Trigger: Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id),
        CASE 
            WHEN new.email LIKE '%admin%' THEN 'quan_tri'
            WHEN new.email LIKE '%shipper%' THEN 'shipper'
            ELSE 'khach_hang'
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Trigger: Automatically update shipper orders count and reputation on order complete
CREATE OR REPLACE FUNCTION public.handle_completed_order()
RETURNS TRIGGER AS $$
BEGIN
    IF new.status = 'hoan_thanh' AND old.status <> 'hoan_thanh' THEN
        -- Add 1 to completed orders
        UPDATE public.profiles
        SET orders_completed = orders_completed + 1,
            reputation = LEAST(reputation + 5, 200) -- Max cap at 200 points
        WHERE id = new.shipper_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_status_completed
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_completed_order();

-- 7. Chats Table (holds in-app messages between customers and shippers)
CREATE TABLE public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    sender_name TEXT NOT NULL,
    sender_avatar TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Chats Policies
CREATE POLICY "Chats are viewable by anyone in the system." ON public.chats
    FOR SELECT USING (true);

CREATE POLICY "Users can insert messages into their orders." ON public.chats
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 8. Activity Logs Table (audit trail for key application events)
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role TEXT CHECK (actor_role IN ('khach_hang', 'shipper', 'quan_tri')),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('auth', 'order', 'rating', 'chat', 'profile', 'wallet', 'system')),
    entity_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security for activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Activity Logs Policies
CREATE POLICY "Admins can view activity logs." ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'quan_tri'
        )
    );

CREATE POLICY "Authenticated users can insert their own activity logs." ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = actor_id);

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- 9. Order Status History Table (timeline for each order lifecycle change)
CREATE TABLE public.order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_role TEXT CHECK (actor_role IN ('khach_hang', 'shipper', 'quan_tri')),
    from_status TEXT CHECK (from_status IN ('cho_nhan', 'da_nhan', 'dang_giao', 'hoan_thanh', 'da_huy')),
    to_status TEXT NOT NULL CHECK (to_status IN ('cho_nhan', 'da_nhan', 'dang_giao', 'hoan_thanh', 'da_huy')),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order history is viewable by admins and participants." ON public.order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'quan_tri'
        )
        OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_id AND (o.customer_id = auth.uid() OR o.shipper_id = auth.uid())
        )
    );

CREATE POLICY "Authenticated users can insert order history for their own actions." ON public.order_status_history
    FOR INSERT WITH CHECK (auth.uid() = actor_id);

CREATE INDEX idx_order_status_history_created_at ON public.order_status_history (created_at DESC);
