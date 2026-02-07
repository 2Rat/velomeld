-- ═══════════════════════════════════════════════════════
-- 2Rat Radwegemelder – Supabase Datenbank-Setup
-- Dieses Script im Supabase SQL-Editor ausführen
-- ═══════════════════════════════════════════════════════

-- 1. PostGIS aktivieren (für Geodaten)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Meldungen-Tabelle
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy INTEGER,
  heading DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  comment TEXT DEFAULT '',
  photo_count INTEGER DEFAULT 0,
  
  -- Geo-Punkt für räumliche Abfragen
  geom GEOMETRY(Point, 4326),
  
  -- Metadaten
  device_id TEXT,           -- anonyme Geräte-ID (kein Nutzerkonto nötig)
  project_id UUID,          -- für spätere Beteiligungsprojekte
  status TEXT DEFAULT 'new', -- new | reviewed | resolved | rejected
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Geo-Punkt automatisch aus lat/lon setzen
CREATE OR REPLACE FUNCTION update_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_geom
  BEFORE INSERT OR UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_geom();

-- Indizes für Performance
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_timestamp ON reports(timestamp DESC);
CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_reports_geom ON reports USING GIST(geom);

-- 3. Fotos-Tabelle (Metadaten, Bilder selbst im Storage)
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,   -- Pfad im Supabase Storage
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_report ON photos(report_id);

-- 4. Storage-Bucket für Fotos anlegen
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Row Level Security (RLS) aktivieren
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Jeder darf Meldungen lesen (öffentliche Karte!)
CREATE POLICY "Meldungen lesen" ON reports
  FOR SELECT USING (true);

-- Jeder darf Meldungen erstellen (keine Registrierung nötig)
CREATE POLICY "Meldungen erstellen" ON reports
  FOR INSERT WITH CHECK (true);

-- Fotos: gleiche Regeln
CREATE POLICY "Fotos lesen" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Fotos erstellen" ON photos
  FOR INSERT WITH CHECK (true);

-- Storage: Fotos hochladen und lesen erlauben
CREATE POLICY "Fotos hochladen" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Fotos öffentlich lesen" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- ═══ FERTIG ═══
-- Jetzt die Supabase-URL und den anon-Key in die App eintragen.
