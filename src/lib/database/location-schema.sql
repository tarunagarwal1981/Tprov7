-- =============================================
-- LOCATION DATABASE SCHEMA
-- =============================================

-- Cities table for storing location data
CREATE TABLE public.cities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT,
  coordinates JSONB, -- {lat: number, lng: number}
  population INTEGER,
  timezone TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_cities_name ON public.cities(name);
CREATE INDEX idx_cities_country ON public.cities(country);
CREATE INDEX idx_cities_state ON public.cities(state);
CREATE INDEX idx_cities_popular ON public.cities(is_popular) WHERE is_popular = true;
CREATE INDEX idx_cities_active ON public.cities(is_active) WHERE is_active = true;
CREATE INDEX idx_cities_search ON public.cities USING gin(to_tsvector('english', name || ' ' || COALESCE(state, '') || ' ' || country));

-- Countries table for reference
CREATE TABLE public.countries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- ISO 3166-1 alpha-2
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- States/Provinces table
CREATE TABLE public.states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
  code TEXT, -- State/Province code
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for cities
ALTER TABLE public.cities ADD CONSTRAINT fk_cities_country 
  FOREIGN KEY (country) REFERENCES public.countries(name);

-- RLS Policies
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users
CREATE POLICY "Allow read access to cities" ON public.cities
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow read access to countries" ON public.countries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow read access to states" ON public.states
  FOR SELECT USING (is_active = true);

-- Allow admin users to manage cities
CREATE POLICY "Allow admin to manage cities" ON public.cities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Allow admin to manage countries" ON public.countries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Allow admin to manage states" ON public.states
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Functions for location management
CREATE OR REPLACE FUNCTION public.search_cities(
  search_query TEXT,
  country_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  country TEXT,
  state TEXT,
  coordinates JSONB,
  population INTEGER,
  is_popular BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.country,
    c.state,
    c.coordinates,
    c.population,
    c.is_popular
  FROM public.cities c
  WHERE 
    c.is_active = true
    AND (
      search_query IS NULL 
      OR c.name ILIKE '%' || search_query || '%'
      OR c.state ILIKE '%' || search_query || '%'
      OR to_tsvector('english', c.name || ' ' || COALESCE(c.state, '') || ' ' || c.country) 
         @@ plainto_tsquery('english', search_query)
    )
    AND (country_filter IS NULL OR c.country = country_filter)
  ORDER BY 
    c.is_popular DESC,
    c.population DESC NULLS LAST,
    c.name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular cities
CREATE OR REPLACE FUNCTION public.get_popular_cities(
  country_filter TEXT DEFAULT 'India',
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  country TEXT,
  state TEXT,
  coordinates JSONB,
  population INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.country,
    c.state,
    c.coordinates,
    c.population
  FROM public.cities c
  WHERE 
    c.is_active = true
    AND c.is_popular = true
    AND c.country = country_filter
  ORDER BY 
    c.population DESC NULLS LAST,
    c.name ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert initial data
INSERT INTO public.countries (code, name) VALUES
('IN', 'India'),
('US', 'United States'),
('GB', 'United Kingdom'),
('AU', 'Australia'),
('CA', 'Canada'),
('DE', 'Germany'),
('FR', 'France'),
('IT', 'Italy'),
('ES', 'Spain'),
('JP', 'Japan'),
('CN', 'China'),
('BR', 'Brazil'),
('MX', 'Mexico'),
('RU', 'Russia'),
('ZA', 'South Africa');

-- Insert popular Indian cities
INSERT INTO public.cities (name, country, state, coordinates, is_popular, population) VALUES
('Mumbai', 'India', 'Maharashtra', '{"lat": 19.0760, "lng": 72.8777}', true, 12442373),
('Delhi', 'India', 'Delhi', '{"lat": 28.7041, "lng": 77.1025}', true, 11034555),
('Bangalore', 'India', 'Karnataka', '{"lat": 12.9716, "lng": 77.5946}', true, 8443675),
('Hyderabad', 'India', 'Telangana', '{"lat": 17.3850, "lng": 78.4867}', true, 6993262),
('Chennai', 'India', 'Tamil Nadu', '{"lat": 13.0827, "lng": 80.2707}', true, 4681087),
('Kolkata', 'India', 'West Bengal', '{"lat": 22.5726, "lng": 88.3639}', true, 4486679),
('Pune', 'India', 'Maharashtra', '{"lat": 18.5204, "lng": 73.8567}', true, 3124458),
('Ahmedabad', 'India', 'Gujarat', '{"lat": 23.0225, "lng": 72.5714}', true, 5570585),
('Jaipur', 'India', 'Rajasthan', '{"lat": 26.9124, "lng": 75.7873}', true, 3073350),
('Surat', 'India', 'Gujarat', '{"lat": 21.1702, "lng": 72.8311}', true, 4467797),
('Goa', 'India', 'Goa', '{"lat": 15.2993, "lng": 74.1240}', true, 1458545),
('Kerala', 'India', 'Kerala', '{"lat": 10.8505, "lng": 76.2711}', true, 33406061),
('Udaipur', 'India', 'Rajasthan', '{"lat": 24.5854, "lng": 73.7125}', true, 451100),
('Manali', 'India', 'Himachal Pradesh', '{"lat": 32.2432, "lng": 77.1892}', true, 8065),
('Shimla', 'India', 'Himachal Pradesh', '{"lat": 31.1048, "lng": 77.1734}', true, 169578),
('Darjeeling', 'India', 'West Bengal', '{"lat": 27.0360, "lng": 88.2627}', true, 118805),
('Ooty', 'India', 'Tamil Nadu', '{"lat": 11.4102, "lng": 76.6950}', true, 88430),
('Munnar', 'India', 'Kerala', '{"lat": 10.0889, "lng": 77.0595}', true, 68365),
('Alleppey', 'India', 'Kerala', '{"lat": 9.4981, "lng": 76.3388}', true, 174164),
('Kodaikanal', 'India', 'Tamil Nadu', '{"lat": 10.2381, "lng": 77.4892}', true, 36501),
('Coorg', 'India', 'Karnataka', '{"lat": 12.3375, "lng": 75.8069}', true, 554829);

-- Insert states for India
INSERT INTO public.states (name, country_id, code) VALUES
('Maharashtra', (SELECT id FROM public.countries WHERE code = 'IN'), 'MH'),
('Delhi', (SELECT id FROM public.countries WHERE code = 'IN'), 'DL'),
('Karnataka', (SELECT id FROM public.countries WHERE code = 'IN'), 'KA'),
('Telangana', (SELECT id FROM public.countries WHERE code = 'IN'), 'TG'),
('Tamil Nadu', (SELECT id FROM public.countries WHERE code = 'IN'), 'TN'),
('West Bengal', (SELECT id FROM public.countries WHERE code = 'IN'), 'WB'),
('Gujarat', (SELECT id FROM public.countries WHERE code = 'IN'), 'GJ'),
('Rajasthan', (SELECT id FROM public.countries WHERE code = 'IN'), 'RJ'),
('Goa', (SELECT id FROM public.countries WHERE code = 'IN'), 'GA'),
('Kerala', (SELECT id FROM public.countries WHERE code = 'IN'), 'KL'),
('Himachal Pradesh', (SELECT id FROM public.countries WHERE code = 'IN'), 'HP');

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT SELECT ON public.cities TO authenticated;
GRANT SELECT ON public.countries TO authenticated;
GRANT SELECT ON public.states TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_cities TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_popular_cities TO authenticated;
