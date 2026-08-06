#!/usr/bin/env sh
# Overlay Wealth — PostgreSQL backup helper.
#
# Usage: DATABASE_URL=postgres://... ./scripts/db-backup.sh [output-dir]
# Requires the `pg_dump` CLI (postgresql-client). Writes a timestamped gzipped
# dump. Schedule this via a cron job / Render cron job / CI schedule and copy
# the output off-box for real durability.
set -eu

OUT_DIR="${1:-/backups}"
mkdir -p "$OUT_DIR"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[db-backup] DATABASE_URL is not set." >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$OUT_DIR/overlay-wealth-$STAMP.sql.gz"

echo "[db-backup] Dumping database to $DEST ..."
pg_dump "$DATABASE_URL" | gzip > "$DEST"
echo "[db-backup] Done: $DEST ($(wc -c < "$DEST") bytes)"
