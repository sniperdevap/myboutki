#!/bin/bash
# Installs backups + health checks on the server and prints a status report.
cd "$(dirname "$0")"
install -m 755 backup.sh /opt/myboutki/backup.sh
install -m 755 health.sh /opt/myboutki/health.sh
printf '%s\n' 'SHELL=/bin/bash' '*/2 * * * * root /opt/myboutki/health.sh' '30 0 * * * root /opt/myboutki/backup.sh' > /etc/cron.d/myboutki
chmod 644 /etc/cron.d/myboutki
systemctl enable --now cron >/dev/null 2>&1; systemctl enable nginx docker >/dev/null 2>&1
echo "=== BACKUP"; /opt/myboutki/backup.sh && tail -1 /opt/myboutki/backups/backup.log; ls /opt/myboutki/backups
echo "=== SYSTEM"; uptime; free -m | sed -n 2p; df -h / | tail -1
echo "enabled: $(systemctl is-enabled nginx docker cron | tr '\n' ' ') active: $(systemctl is-active nginx docker cron | tr '\n' ' ')"
echo "cert $(echo | openssl s_client -servername myboutiki.com -connect 127.0.0.1:443 2>/dev/null | openssl x509 -noout -enddate)"
(systemctl list-timers 2>/dev/null | grep -i certbot) || (ls /etc/cron.d | grep -i certbot) || echo NO_CERTBOT_RENEW
docker inspect -f 'api restarts={{.RestartCount}} started={{.State.StartedAt}} policy={{.HostConfig.RestartPolicy.Name}}' myboutki-pay-pay-1
echo "=== API ERRORS 24h"; docker logs --since 24h myboutki-pay-pay-1 2>&1 | grep -iE "error|fail|exception" | grep -v "^$" | tail -12
echo "=== CHECKS"
for u in / /ar/ /admin/ /api/feed /api/config /sitemap.xml /api/sitemap.xml /privacy/ /delete-account/; do curl -s -o /dev/null -m 15 -w "$u %{http_code} %{time_total}s\n" https://myboutiki.com$u; done
curl -s -m 25 'http://127.0.0.1:18090/api/pay/health?methods=1'; echo
echo "=== TRAFFIC"
python3 - <<'PY'
import json,time,collections
now=time.time()*1000;ev=[]
for ln in open('/opt/myboutki/data/events.jsonl'):
    try: ev.append(json.loads(ln))
    except: pass
for name,ms in [('24h',864e5),('7d',7*864e5),('all',1e15)]:
    e=[x for x in ev if now-x.get('t',0)<ms]
    print(name,'visitors',len({x.get('v') for x in e}),'events',len(e),'mobile',len({x.get('v') for x in e if x.get('m')}))
    print('  by event',dict(collections.Counter(x.get('e') for x in e).most_common(12)))
    if name!='all':
        print('  countries',dict(collections.Counter(x.get('cc') for x in e if x.get('cc')).most_common(8)))
        print('  sources',dict(collections.Counter(x.get('src') for x in e if x.get('src')).most_common(8)))
PY
echo INSTALL-DONE
