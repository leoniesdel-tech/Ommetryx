-- Rechte der drei Laufzeit-Benutzer (CLAUDE.md Abschnitt 9: Identität und Maße getrennt).
-- Ausführen als Besitzer der Datenbank: npm run db:rechte (nach jeder Migration unschädlich wiederholbar).
--
--   ommetryx_app       nur Bereich app       (Shops, Artikel, Konfiguration, Team)
--   ommetryx_identity  nur Bereich identity  (E-Mail, Login, Einwilligungen, Zuordnung)
--   ommetryx_body      nur Bereich body      (Körpermaße)

REVOKE ALL ON SCHEMA app, identity, body FROM PUBLIC;

-- app
GRANT USAGE ON SCHEMA app TO ommetryx_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO ommetryx_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA app TO ommetryx_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ommetryx_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO ommetryx_app;

-- identity
GRANT USAGE ON SCHEMA identity TO ommetryx_identity;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA identity TO ommetryx_identity;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA identity TO ommetryx_identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ommetryx_identity;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO ommetryx_identity;

-- body
GRANT USAGE ON SCHEMA body TO ommetryx_body;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA body TO ommetryx_body;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA body TO ommetryx_body;
ALTER DEFAULT PRIVILEGES IN SCHEMA body GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ommetryx_body;
ALTER DEFAULT PRIVILEGES IN SCHEMA body GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO ommetryx_body;

-- Ausdrücklich keine Kreuzrechte: niemand außer dem Besitzer sieht zwei Bereiche.
REVOKE ALL ON ALL TABLES IN SCHEMA identity, body FROM ommetryx_app;
REVOKE ALL ON ALL TABLES IN SCHEMA app, body FROM ommetryx_identity;
REVOKE ALL ON ALL TABLES IN SCHEMA app, identity FROM ommetryx_body;
