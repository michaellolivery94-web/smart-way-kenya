CREATE TABLE public.corridor_speed_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corridor_slug text NOT NULL,
  speed_kmh numeric NOT NULL CHECK (speed_kmh >= 0 AND speed_kmh <= 200),
  lat double precision NOT NULL CHECK (lat BETWEEN -2.5 AND 0),
  lng double precision NOT NULL CHECK (lng BETWEEN 35.5 AND 38.5),
  session_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_corridor_samples_recent ON public.corridor_speed_samples (corridor_slug, created_at DESC);

GRANT SELECT, INSERT ON public.corridor_speed_samples TO anon;
GRANT SELECT, INSERT ON public.corridor_speed_samples TO authenticated;
GRANT ALL ON public.corridor_speed_samples TO service_role;

ALTER TABLE public.corridor_speed_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read traffic samples"
ON public.corridor_speed_samples FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can contribute traffic samples"
ON public.corridor_speed_samples FOR INSERT
TO anon, authenticated
WITH CHECK (true);