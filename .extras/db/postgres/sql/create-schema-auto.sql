
-- "user-private schema" (Default-Schema: public)
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION auto;

ALTER ROLE auto SET search_path = 'auto';
