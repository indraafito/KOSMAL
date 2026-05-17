
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('tenant', 'owner', 'admin');
CREATE TYPE public.kos_type AS ENUM ('Putra', 'Putri', 'Campur');
CREATE TYPE public.kos_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.booking_status AS ENUM ('pending', 'awaiting_payment', 'awaiting_verification', 'confirmed', 'rejected', 'cancelled');
CREATE TYPE public.review_status AS ENUM ('visible', 'hidden');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE public.report_target AS ENUM ('kos', 'review', 'user');

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- USER_ROLES + has_role()
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =========================================================
-- AUTO-CREATE PROFILE + DEFAULT ROLE on signup
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'tenant'::app_role);
  IF _role = 'admin' THEN _role := 'tenant'; END IF; -- never self-grant admin
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- KOS
-- =========================================================
CREATE TABLE public.kos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  type kos_type NOT NULL DEFAULT 'Campur',
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  available INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  gallery TEXT[] NOT NULL DEFAULT '{}',
  facilities TEXT[] NOT NULL DEFAULT '{}',
  all_facilities TEXT[] NOT NULL DEFAULT '{}',
  rules TEXT[] NOT NULL DEFAULT '{}',
  nearby JSONB NOT NULL DEFAULT '[]'::jsonb,
  status kos_status NOT NULL DEFAULT 'pending',
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_kos_status ON public.kos(status);
CREATE INDEX idx_kos_area ON public.kos(area);
CREATE INDEX idx_kos_owner ON public.kos(owner_id);
CREATE TRIGGER kos_updated_at BEFORE UPDATE ON public.kos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- BOOKINGS
-- =========================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kos_id UUID NOT NULL REFERENCES public.kos(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1 CHECK (duration_months > 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  payment_proof_url TEXT,
  status booking_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_bookings_tenant ON public.bookings(tenant_id);
CREATE INDEX idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX idx_bookings_kos ON public.bookings(kos_id);
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- REVIEWS
-- =========================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kos_id UUID NOT NULL REFERENCES public.kos(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  status review_status NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_reviews_kos ON public.reviews(kos_id);

-- =========================================================
-- WISHLIST
-- =========================================================
CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kos_id UUID NOT NULL REFERENCES public.kos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, kos_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- VIEW HISTORY
-- =========================================================
CREATE TABLE public.view_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kos_id UUID NOT NULL REFERENCES public.kos(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.view_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_view_history_tenant ON public.view_history(tenant_id, viewed_at DESC);

-- =========================================================
-- CONVERSATIONS + MESSAGES
-- =========================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kos_id UUID REFERENCES public.kos(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, owner_id)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- =========================================================
-- REPORTS
-- =========================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type report_target NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- profiles
CREATE POLICY "profiles read own" ON public.profiles FOR SELECT USING (auth.uid() = id OR has_role(auth.uid(),'admin'));
CREATE POLICY "profiles read public basic" ON public.profiles FOR SELECT USING (true); -- name & avatar are public-ish; client only selects safe cols
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles admin update" ON public.profiles FOR UPDATE USING (has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "user_roles read own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles admin manage" ON public.user_roles FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- kos
CREATE POLICY "kos public read approved" ON public.kos FOR SELECT USING (status = 'approved' OR owner_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "kos owner insert" ON public.kos FOR INSERT WITH CHECK (auth.uid() = owner_id AND has_role(auth.uid(),'owner'));
CREATE POLICY "kos owner update" ON public.kos FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "kos owner delete" ON public.kos FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "kos admin all" ON public.kos FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- bookings
CREATE POLICY "bookings read involved" ON public.bookings FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = owner_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "bookings tenant insert" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "bookings tenant update own" ON public.bookings FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "bookings owner update" ON public.bookings FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "bookings admin all" ON public.bookings FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- reviews
CREATE POLICY "reviews public read visible" ON public.reviews FOR SELECT USING (status = 'visible' OR tenant_id = auth.uid() OR has_role(auth.uid(),'admin'));
CREATE POLICY "reviews tenant insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "reviews tenant update own" ON public.reviews FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "reviews tenant delete own" ON public.reviews FOR DELETE USING (auth.uid() = tenant_id);
CREATE POLICY "reviews admin all" ON public.reviews FOR ALL USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- wishlist
CREATE POLICY "wishlist tenant manage" ON public.wishlist FOR ALL USING (auth.uid() = tenant_id) WITH CHECK (auth.uid() = tenant_id);

-- view_history
CREATE POLICY "history tenant manage" ON public.view_history FOR ALL USING (auth.uid() = tenant_id) WITH CHECK (auth.uid() = tenant_id);

-- conversations
CREATE POLICY "conv read participants" ON public.conversations FOR SELECT USING (auth.uid() = tenant_id OR auth.uid() = owner_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "conv insert tenant" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "conv update participants" ON public.conversations FOR UPDATE USING (auth.uid() = tenant_id OR auth.uid() = owner_id);

-- messages
CREATE POLICY "msg read participants" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.tenant_id = auth.uid() OR c.owner_id = auth.uid()))
  OR has_role(auth.uid(),'admin')
);
CREATE POLICY "msg insert participants" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.tenant_id = auth.uid() OR c.owner_id = auth.uid())
  )
);

-- reports
CREATE POLICY "reports insert auth" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports read own or admin" ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR has_role(auth.uid(),'admin'));
CREATE POLICY "reports admin update" ON public.reports FOR UPDATE USING (has_role(auth.uid(),'admin'));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('kos-images','kos-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars','avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs','payment-proofs', false) ON CONFLICT DO NOTHING;

-- kos-images: anyone view; owner upload to own folder
CREATE POLICY "kos-images public read" ON storage.objects FOR SELECT USING (bucket_id = 'kos-images');
CREATE POLICY "kos-images owner write" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id='kos-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "kos-images owner update" ON storage.objects FOR UPDATE USING (
  bucket_id='kos-images' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "kos-images owner delete" ON storage.objects FOR DELETE USING (
  bucket_id='kos-images' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- avatars
CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars own write" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars own update" ON storage.objects FOR UPDATE USING (
  bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- payment-proofs: tenant uploads to own folder; owner & admin can read via signed URLs (we'll use service role server-side or direct path with policies)
CREATE POLICY "proofs tenant write" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id='payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "proofs tenant read own" ON storage.objects FOR SELECT USING (
  bucket_id='payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "proofs admin read" ON storage.objects FOR SELECT USING (
  bucket_id='payment-proofs' AND has_role(auth.uid(),'admin')
);
