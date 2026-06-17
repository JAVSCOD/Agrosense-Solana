#!/bin/bash
set -e

psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" <<-EOSQL
  CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator123';
EOSQL

echo "wal_level = replica" >> "$PGDATA/postgresql.conf"
echo "max_wal_senders = 10" >> "$PGDATA/postgresql.conf"
echo "wal_keep_size = 64" >> "$PGDATA/postgresql.conf"

echo "host replication replicator 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
