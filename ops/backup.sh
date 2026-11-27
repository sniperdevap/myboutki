#!/bin/bash
# Daily backup of the myboutiki database, photos and settings. Keeps 14 days.
set -e
B=/opt/myboutki/backups; D=$B/$(date +%F); mkdir -p "$D"; chmod 700 "$B"
rm -f /opt/myboutki/data/.bk.db
docker exec myboutki-pay-pay-1 node --experimental-sqlite --no-warnings -e "new (require('node:sqlite').DatabaseSync)('/data/myboutki.db').exec(\"VACUUM INTO '/data/.bk.db'\")"
mv /opt/myboutki/data/.bk.db "$D/myboutki.db"
for x in img private; do rm -rf "$D/$x"; [ -d /opt/myboutki/data/$x ] && cp -al /opt/myboutki/data/$x "$D/$x"; done
cp -a /opt/myboutki/data/*.json /opt/myboutki/data/*.jsonl /opt/myboutki/data/secret.key /opt/myboutki/data/setup.sha "$D/" 2>/dev/null || true
find "$B" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
echo "$(date -u +%FT%TZ) backup ok $(du -sh "$D" | cut -f1)" >> "$B/backup.log"
