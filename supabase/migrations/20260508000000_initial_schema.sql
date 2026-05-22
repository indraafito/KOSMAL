-- =============================================
-- KOSMAL — Fresh Database Migration
-- Role model: user / admin (Guest = no login)
-- =============================================


-- =========================================================
-- 0. TEARDOWN — Hapus semua objek lama
-- =========================================================

DROP TRIGGER IF EXISTS on_auth_user_created   ON auth.users;
DROP TRIGGER IF EXISTS profiles_updated_at    ON public.profiles;
DROP TRIGGER IF EXISTS kos_updated_at         ON public.kos;
DROP TRIGGER IF EXISTS bookings_updated_at    ON public.bookings;

DROP TABLE IF EXISTS public.messages        CASCADE;
DROP TABLE IF EXISTS public.conversations   CASCADE;
DROP TABLE IF EXISTS public.bookings        CASCADE;
DROP TABLE IF EXISTS public.reports         CASCADE;
DROP TABLE IF EXISTS public.view_history    CASCADE;
DROP TABLE IF EXISTS public.wishlist        CASCADE;
DROP TABLE IF EXISTS public.reviews         CASCADE;
DROP TABLE IF EXISTS public.kos             CASCADE;
DROP TABLE IF EXISTS public.user_roles      CASCADE;
DROP TABLE IF EXISTS public.profiles        CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user()        CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at()         CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(app_role, uuid) CASCADE;

DROP TYPE IF EXISTS public.app_role        CASCADE;
DROP TYPE IF EXISTS public.kos_type        CASCADE;
DROP TYPE IF EXISTS public.kos_status      CASCADE;
DROP TYPE IF EXISTS public.booking_status  CASCADE;
DROP TYPE IF EXISTS public.review_status   CASCADE;
DROP TYPE IF EXISTS public.report_status   CASCADE;
DROP TYPE IF EXISTS public.report_target   CASCADE;

DROP POLICY IF EXISTS "kos-images public read"  ON storage.objects;
DROP POLICY IF EXISTS "kos-images owner write"  ON storage.objects;
DROP POLICY IF EXISTS "kos-images owner update" ON storage.objects;
DROP POLICY IF EXISTS "kos-images owner delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars public read"     ON storage.objects;
DROP POLICY IF EXISTS "avatars own write"       ON storage.objects;
DROP POLICY IF EXISTS "avatars own update"      ON storage.objects;
DROP POLICY IF EXISTS "proofs tenant write"     ON storage.objects;
DROP POLICY IF EXISTS "proofs tenant read own"  ON storage.objects;
DROP POLICY IF EXISTS "proofs admin read"       ON storage.objects;


-- =========================================================
-- 1. ENUMS
-- =========================================================
CREATE TYPE public.app_role      AS ENUM ('user', 'admin');
CREATE TYPE public.kos_type      AS ENUM ('Putra', 'Putri', 'Campur');
CREATE TYPE public.kos_status    AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.review_status AS ENUM ('visible', 'hidden');
CREATE TYPE public.report_status AS ENUM ('open', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE public.report_target AS ENUM ('kos', 'review', 'user');


-- =========================================================
-- 2. set_updated_at (tidak bergantung tabel apapun)
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- =========================================================
-- 3. PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  avatar_url TEXT,
  bio        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =========================================================
-- 4. USER_ROLES  ← harus ada SEBELUM has_role()
-- =========================================================
CREATE TABLE public.user_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       app_role    NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- 5. has_role()  ← dibuat SETELAH user_roles ada
-- =========================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;


-- =========================================================
-- 6. HANDLE NEW USER (trigger signup)
-- =========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'phone'
  );

  -- Semua user baru = 'user'; admin hanya bisa di-set manual
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- =========================================================
-- 7. KOS
-- =========================================================
CREATE TABLE public.kos (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                    TEXT         NOT NULL,
  slug                    TEXT         NOT NULL UNIQUE,
  description             TEXT         NOT NULL DEFAULT '',
  type                    kos_type     NOT NULL DEFAULT 'Campur',
  area                    TEXT         NOT NULL,
  address                 TEXT         NOT NULL,

  owner_name              TEXT         NOT NULL DEFAULT '',
  owner_whatsapp          TEXT         NOT NULL DEFAULT '',

  price                   INTEGER      NOT NULL CHECK (price >= 0),
  price_max               NUMERIC,
  price_period            TEXT         NOT NULL DEFAULT 'bulan',
  price_type              TEXT         NOT NULL DEFAULT 'fixed',

  available               INTEGER      NOT NULL DEFAULT 0,
  rating                  NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews_count           INTEGER      NOT NULL DEFAULT 0,

  image                   TEXT,
  photos                  TEXT[]       NOT NULL DEFAULT '{}',
  gallery                 TEXT[]       NOT NULL DEFAULT '{}',

  facilities              TEXT[]       NOT NULL DEFAULT '{}',
  all_facilities          TEXT[]       NOT NULL DEFAULT '{}',
  rules                   TEXT[]       NOT NULL DEFAULT '{}',
  nearby                  JSONB        NOT NULL DEFAULT '[]'::jsonb,

  ai_review_summary       TEXT,
  ai_summary_review_count INTEGER      NOT NULL DEFAULT 0,

  status                  kos_status   NOT NULL DEFAULT 'pending',
  verified                BOOLEAN      NOT NULL DEFAULT false,

  created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);
ALTER TABLE public.kos ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_kos_status ON public.kos(status);
CREATE INDEX idx_kos_area   ON public.kos(area);
CREATE INDEX idx_kos_owner  ON public.kos(owner_id);

CREATE TRIGGER kos_updated_at
  BEFORE UPDATE ON public.kos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =========================================================
-- 8. REVIEWS
-- =========================================================
CREATE TABLE public.reviews (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  kos_id     UUID          NOT NULL REFERENCES public.kos(id) ON DELETE CASCADE,
  tenant_id  UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating     INTEGER       NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text       TEXT          NOT NULL,
  status     review_status NOT NULL DEFAULT 'visible',
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT reviews_unique_user_kos UNIQUE (tenant_id, kos_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reviews_kos ON public.reviews(kos_id);


-- =========================================================
-- 9. WISHLIST
-- =========================================================
CREATE TABLE public.wishlist (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kos_id     UUID        NOT NULL REFERENCES public.kos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, kos_id)
);
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- 10. VIEW HISTORY
-- =========================================================
CREATE TABLE public.view_history (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kos_id    UUID        NOT NULL REFERENCES public.kos(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.view_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_view_history_tenant ON public.view_history(tenant_id, viewed_at DESC);


-- =========================================================
-- 11. REPORTS
-- =========================================================
CREATE TABLE public.reports (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type report_target NOT NULL,
  target_id   UUID          NOT NULL,
  reason      TEXT          NOT NULL,
  status      report_status NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- 12. RLS POLICIES
-- =========================================================

-- profiles
CREATE POLICY "profiles read own or admin" ON public.profiles FOR SELECT USING (auth.uid() = id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles read public basic" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles update own"        ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles admin update"      ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "user_roles read own or admin" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "user_roles admin manage"      ON public.user_roles FOR ALL    USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- kos
CREATE POLICY "kos public read approved" ON public.kos FOR SELECT USING (status = 'approved' OR owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "kos user insert"          ON public.kos FOR INSERT WITH CHECK (auth.uid() = owner_id AND has_role(auth.uid(), 'user'));
CREATE POLICY "kos owner update"         ON public.kos FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "kos owner delete"         ON public.kos FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "kos admin all"            ON public.kos FOR ALL    USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- reviews
CREATE POLICY "reviews public read visible" ON public.reviews FOR SELECT USING (status = 'visible' OR tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "reviews user insert"         ON public.reviews FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "reviews user update own"     ON public.reviews FOR UPDATE USING (auth.uid() = tenant_id);
CREATE POLICY "reviews user delete own"     ON public.reviews FOR DELETE USING (auth.uid() = tenant_id);
CREATE POLICY "reviews admin all"           ON public.reviews FOR ALL    USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- wishlist
CREATE POLICY "wishlist user manage" ON public.wishlist FOR ALL USING (auth.uid() = tenant_id) WITH CHECK (auth.uid() = tenant_id);

-- view_history
CREATE POLICY "history user manage" ON public.view_history FOR ALL USING (auth.uid() = tenant_id) WITH CHECK (auth.uid() = tenant_id);

-- reports
CREATE POLICY "reports insert auth"       ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "reports read own or admin" ON public.reports FOR SELECT USING (auth.uid() = reporter_id OR has_role(auth.uid(), 'admin'));
CREATE POLICY "reports admin update"      ON public.reports FOR UPDATE USING (has_role(auth.uid(), 'admin'));


-- =========================================================
-- 13. STORAGE BUCKETS & POLICIES
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('kos-images', 'kos-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars',    'avatars',    true)  ON CONFLICT DO NOTHING;

CREATE POLICY "kos-images public read"  ON storage.objects FOR SELECT USING (bucket_id = 'kos-images');
CREATE POLICY "kos-images admin write"  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kos-images' AND has_role(auth.uid(),'admin'));
CREATE POLICY "kos-images admin update" ON storage.objects FOR UPDATE USING  (bucket_id = 'kos-images' AND has_role(auth.uid(),'admin'));
CREATE POLICY "kos-images admin delete" ON storage.objects FOR DELETE USING  (bucket_id = 'kos-images' AND has_role(auth.uid(),'admin'));

CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars own write"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars own update"  ON storage.objects FOR UPDATE USING  (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
