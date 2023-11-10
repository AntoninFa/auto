-- (1) PowerShell:
--     cd .extras\compose\db\mysql
--     docker compose up
-- (1) 2. PowerShell:
--     docker compose exec db bash
--         mysql --user=root --password=p < /sql/create-db-auto.sql
--         exit
--     docker compose down

-- https://dev.mysql.com/doc/refman/8.1/en/mysql.html
--   mysqlsh ist *NICHT* im Docker-Image enthalten

-- https://dev.mysql.com/doc/refman/8.1/en/create-user.html
-- https://dev.mysql.com/doc/refman/8.1/en/role-names.html
CREATE USER IF NOT EXISTS auto IDENTIFIED BY 'p';
GRANT USAGE ON *.* TO auto;

-- https://dev.mysql.com/doc/refman/8.1/en/create-database.html
-- https://dev.mysql.com/doc/refman/8.1/en/charset.html
-- SHOW CHARACTER SET;
CREATE DATABASE IF NOT EXISTS auto CHARACTER SET utf8;

GRANT ALL PRIVILEGES ON auto.* to auto;

-- https://dev.mysql.com/doc/refman/8.1/en/create-tablespace.html
-- .idb-Datei innerhalb vom "data"-Verzeichnis
CREATE TABLESPACE `autospace` ADD DATAFILE 'autospace.ibd' ENGINE=INNODB;
