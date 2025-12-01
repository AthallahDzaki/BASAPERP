# ✅ MongoDB Connection Safety Checklist

## Pre-Deploy Checklist

### 🔧 Configuration
- [ ] Environment variable `MONGODB_URI` sudah di-set
- [ ] MongoDB Atlas cluster sudah dibuat
- [ ] IP Whitelist: `0.0.0.0/0` (allow all untuk Vercel)
- [ ] Database user sudah dibuat dengan password yang kuat
- [ ] `.env.local` sudah ada dan tidak di-commit ke git

### 📁 Code Implementation
- [ ] `src/lib/mongodb.js` menggunakan connection pooling
- [ ] Max pool size: 10 connections
- [ ] Min pool size: 2 connections
- [ ] Idle timeout: 10 seconds
- [ ] Socket timeout: 45 seconds
- [ ] Auto cleanup enabled (60 seconds)
- [ ] Graceful shutdown implemented
- [ ] Error handling ada di semua API routes

### 🔒 Security
- [ ] Rate limiting enabled (100 req/min)
- [ ] Security headers implemented
- [ ] No hardcoded credentials
- [ ] HTTPS enabled (auto di Vercel)
- [ ] CORS properly configured

### 📊 Monitoring
- [ ] Health check endpoint: `/api/health`
- [ ] Monitor endpoint: `/api/monitor`
- [ ] Visual dashboard: `/monitor`
- [ ] Test script: `test-connection.js` works

---

## Post-Deploy Checklist

### ✅ Immediate Tests (5 minutes after deploy)

1. **Health Check**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   - [ ] Response status: 200 OK
   - [ ] `"status": "healthy"`
   - [ ] `"success": true`
   - [ ] Response time < 1000ms

2. **Visual Dashboard**
   ```
   https://your-app.vercel.app/monitor
   ```
   - [ ] Page loads successfully
   - [ ] Shows green status card
   - [ ] Active connections: 2-10
   - [ ] No error count

3. **MongoDB Atlas**
   - [ ] Login ke MongoDB Atlas
   - [ ] Go to: Cluster → Metrics → Connections
   - [ ] Current connections: 2-10 (not 100+)
   - [ ] No spike dalam grafik

4. **API Routes**
   ```bash
   curl https://your-app.vercel.app/api/products
   curl https://your-app.vercel.app/api/customers
   ```
   - [ ] All endpoints return 200
   - [ ] Data terlihat dengan benar
   - [ ] Response time < 1000ms

---

## Monitoring Schedule

### 📅 First Hour
**Check every 10 minutes:**
- [ ] Health endpoint responds
- [ ] MongoDB connections ≤ 10
- [ ] No errors di Vercel logs
- [ ] Visual dashboard shows healthy

### 📅 First Day
**Check every 1 hour:**
- [ ] Connection count stable
- [ ] Response times normal
- [ ] No memory leaks
- [ ] Auto cleanup working

### 📅 First Week
**Check daily:**
- [ ] MongoDB Atlas connections graph normal
- [ ] No unexpected spikes
- [ ] Vercel function invocations normal
- [ ] No timeout errors

---

## Warning Signs 🚨

### 🔴 CRITICAL (Fix Immediately)
- ❌ MongoDB connections > 50
- ❌ Health check returns "unhealthy"
- ❌ Connections tidak pernah turun
- ❌ Response time > 5 seconds
- ❌ Many errors di Vercel logs

**Action:**
1. Check `/api/health` endpoint
2. Check `/api/monitor` stats
3. Check Vercel logs: `vercel logs --follow`
4. If needed: Redeploy atau terminate connections di MongoDB Atlas

### ⚠️ WARNING (Monitor Closely)
- ⚠️ Connections consistently > 15
- ⚠️ Response time > 1 second
- ⚠️ Occasional timeouts
- ⚠️ Memory usage increasing

**Action:**
1. Check monitoring dashboard
2. Analyze traffic patterns
3. Consider scaling if traffic legitimate

### ✅ HEALTHY
- ✅ Connections: 2-10
- ✅ Response time: < 500ms
- ✅ No errors
- ✅ Auto cleanup working
- ✅ Memory stable

---

## Troubleshooting Guide

### Problem: Connections > 50

**Diagnosis:**
```bash
curl https://your-app.vercel.app/api/monitor
```
Check `poolSize.active`

**Solutions:**
1. **Option 1: Redeploy**
   - Go to Vercel dashboard
   - Click "Redeploy" button
   - Wait 2 minutes
   - Check connections again

2. **Option 2: Terminate in MongoDB**
   - MongoDB Atlas → Cluster
   - Click "..." → "Terminate All Connections"
   - Redeploy Vercel app

3. **Option 3: Check Code**
   - Verify `maxPoolSize: 10` in mongodb.js
   - Check for connection leaks in custom code
   - Review recent changes

### Problem: Health Check Fails

**Diagnosis:**
```bash
curl https://your-app.vercel.app/api/health
```
Check error message

**Solutions:**
1. Check MongoDB Atlas is online
2. Verify `MONGODB_URI` in Vercel env vars
3. Check IP whitelist includes `0.0.0.0/0`
4. Test connection string locally

### Problem: Slow Response Times

**Diagnosis:**
```bash
curl -w "@-" -o /dev/null -s https://your-app.vercel.app/api/health <<'EOF'
time_total: %{time_total}s
EOF
```

**Solutions:**
1. Check MongoDB Atlas region (should be close to Vercel)
2. Review query performance
3. Add indexes to frequently queried fields
4. Consider caching for static data

### Problem: Auto Cleanup Not Working

**Diagnosis:**
```bash
# Wait 2 minutes with no traffic
curl https://your-app.vercel.app/api/monitor
```
Check if connections dropped

**Solutions:**
1. Verify `maxIdleTimeMS: 10000` in mongodb.js
2. Check serverless timeout settings
3. Review Vercel function logs

---

## Maintenance Tasks

### Daily
- [ ] Check health endpoint
- [ ] Review MongoDB Atlas metrics
- [ ] Scan Vercel logs for errors

### Weekly
- [ ] Review connection patterns
- [ ] Check for memory leaks
- [ ] Update dependencies if needed
- [ ] Backup MongoDB data

### Monthly
- [ ] Performance review
- [ ] Security audit
- [ ] Update documentation
- [ ] Optimize slow queries

---

## Emergency Contacts

### MongoDB Atlas Issues
- Dashboard: https://cloud.mongodb.com
- Support: https://www.mongodb.com/support

### Vercel Issues
- Dashboard: https://vercel.com/dashboard
- Support: https://vercel.com/support

### Quick Commands
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Monitor stats
curl https://your-app.vercel.app/api/monitor

# Vercel logs
vercel logs --follow

# MongoDB connections (Atlas CLI)
mongosh "your-connection-string" --eval "db.serverStatus().connections"
```

---

## Success Metrics

### ✅ Green Status (Everything OK)
| Metric | Target | Current |
|--------|--------|---------|
| Connections | 2-10 | __ |
| Response Time | < 500ms | __ |
| Error Rate | < 1% | __ |
| Uptime | > 99.9% | __ |
| Memory Usage | < 100MB | __ |

### 📊 How to Check
```bash
# Run this and fill the table above
curl https://your-app.vercel.app/api/monitor | json_pp
```

---

## Final Notes

✅ **Normal Behavior:**
- Connections spike to 10 during high traffic
- Connections drop to 0 after 60s idle
- First request after idle takes ~500ms (cold start)
- Subsequent requests take ~100-200ms

❌ **Abnormal Behavior:**
- Connections never drop below 20
- All requests take > 5 seconds
- Frequent timeout errors
- Memory usage constantly increasing

---

## 🎉 Sign-off

**Date deployed:** _______________
**Deployed by:** _______________
**Initial connection count:** _______________
**All checks passed:** [ ] Yes [ ] No

**Signature:** _______________

---

Keep this checklist handy and refer to it whenever you deploy or notice unusual behavior! 🔍
