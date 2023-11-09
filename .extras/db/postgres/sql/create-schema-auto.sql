
-- "user-private schema" (Default-Schema: public)
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION buch;

ALTER ROLE buch SET search_path = 'buch';
