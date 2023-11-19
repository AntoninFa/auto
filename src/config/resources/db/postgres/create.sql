CREATE SCHEMA IF NOT EXISTS AUTHORIZATION auto;
ALTER ROLE auto SET search_path = 'auto';

CREATE TYPE getriebeType AS ENUM ('MANUELL', 'AUTOMATIK');
CREATE TYPE herstellerType AS ENUM ('VOLKSWAGEN', 'AUDI', 'DAIMLER', 'RENAULT');

CREATE TABLE IF NOT EXISTS auto (
    id                  integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE autospace,
    version             integer NOT NULL DEFAULT 0,
    modellbezeichnung   varchar(40) NOT NULL,
    hersteller          herstellerType,
    fin                 varchar(17) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
    kilometerstand      integer NOT NULL CHECK (kilometerstand >= 0),
    auslieferungstag    date,
    grundpreis          decimal(8,2) NOT NULL,
    ist_aktuelles_modell  boolean NOT NULL DEFAULT TRUE,
    getriebe_art             getriebeType,
    erzeugt             timestamp NOT NULL DEFAULT NOW(),
    aktualisiert        timestamp NOT NULL DEFAULT NOW()
) TABLESPACE autospace;

CREATE TABLE IF NOT EXISTS ausstattung (
    id                  integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE autospace,
    bezeichnung         varchar(32) NOT NULL,
    preis               decimal(8,2) NOT NULL,
    verfuegbar          boolean NOT NULL DEFAULT TRUE,
    auto_id             integer NOT NULL REFERENCES auto
) TABLESPACE autospace;
CREATE INDEX IF NOT EXISTS ausstattung_auto_id_idx ON ausstattung(auto_id) TABLESPACE autospace;

CREATE TABLE IF NOT EXISTS eigentuemer (
    id                  integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE autospace,
    eigentuemer         varchar(40) NOT NULL,
    geburtsdatum        date,
    fuehrerscheinnummer varchar(40),
    auto_id             integer NOT NULL UNIQUE USING INDEX TABLESPACE autospace REFERENCES auto
) TABLESPACE autospace;

