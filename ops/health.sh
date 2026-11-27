#!/bin/bash
# Runs every 2 minutes: restarts the API or nginx if they stop answering.
L=/opt/myboutki/health.log
ok() { curl -fsS -m 10 -o /dev/null http://127.0.0.1:18090/api/config; }
if ! ok; then sleep 20; if ! ok; then docker restart myboutki-pay-pay-1 >/dev/null 2>&1; echo "$(date -u +%FT%TZ) api not answering - restarted" >> $L; fi; fi
if ! systemctl is-active --quiet nginx; then nginx -t >/dev/null 2>&1 && systemctl start nginx && echo "$(date -u +%FT%TZ) nginx was stopped - started" >> $L; fi
curl -fsS -m 15 -o /dev/null --resolve myboutiki.com:443:127.0.0.1 https://myboutiki.com/ || echo "$(date -u +%FT%TZ) site check failed" >> $L
U=$(df --output=pcent / | tail -1 | tr -dc 0-9); [ "${U:-0}" -gt 90 ] && echo "$(date -u +%FT%TZ) disk ${U}% full" >> $L
[ -f $L ] && tail -n 500 $L > $L.tmp && mv $L.tmp $L
exit 0
