# MongoDB Connection Management & Monitoring

## 🔒 Fitur Keamanan

### 1. **Connection Pooling**
- **Min Pool**: 2 connections (always ready)
- **Max Pool**: 10 connections (mencegah overload)
- **Idle Timeout**: 10 detik (close koneksi yang tidak dipakai)
- **Socket Timeout**: 45 detik (prevent hanging connections)

### 2. **Auto Cleanup** 
- Koneksi idle > 60 detik otomatis ditutup di production
- Graceful shutdown saat server mati
- Auto-reconnect jika koneksi terputus

### 3. **Health Monitoring**
- Real-time connection status
- Pool statistics
- Error tracking

---

## 📊 Monitoring Endpoints

### 1. Health Check
```bash
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "message": "API and Database are running",
  "responseTime": "45ms",
  "poolStats": {
    "readyState": 1,
    "host": "cluster0.mongodb.net",
    "name": "erp_dashboard",
    "activeConnections": 3,
    "availableConnections": 7
  },
  "timestamp": "2025-12-01T10:30:00.000Z"
}
```

### 2. Connection Monitor
```bash
GET /api/monitor
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connects": 5,
    "disconnects": 0,
    "errors": 0,
    "currentState": "connected",
    "poolSize": {
      "active": 3,
      "available": 7
    },
    "memory": {
      "used": 45,
      "total": 120,
      "unit": "MB"
    }
  }
}
```

### 3. Warmup (Prevent Cold Start)
```bash
POST /api/health
```

---

## 🚀 Cara Deploy ke Vercel

### 1. Set Environment Variable di Vercel
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_dashboard?retryWrites=true&w=majority
```

### 2. Deploy
```bash
git add .
git commit -m "Add secure MongoDB connection management"
git push origin main
```

### 3. Monitor Setelah Deploy

#### Cek Health:
```bash
curl https://your-app.vercel.app/api/health
```

#### Cek Connection Stats:
```bash
curl https://your-app.vercel.app/api/monitor
```

#### Warmup (jika perlu):
```bash
curl -X POST https://your-app.vercel.app/api/health
```

---

## 🛡️ Perlindungan dari Masalah Lama

### ❌ **Masalah Lama (yang Anda alami):**
```javascript
// Tiap request bikin koneksi baru
export async function GET() {
  await mongoose.connect(MONGODB_URI); // ❌ NEW CONNECTION!
  const data = await Model.find();
  return NextResponse.json(data);
  // Connection tidak ditutup!
}
```
**Hasil**: MongoDB Atlas penuh dengan 500+ connections yang nggak ditutup!

### ✅ **Solusi Sekarang:**
```javascript
// Reuse connection dari pool
export async function GET() {
  await connectDB(); // ✅ REUSE EXISTING CONNECTION!
  const data = await Model.find();
  return NextResponse.json(data);
  // Connection otomatis kembali ke pool
}
```
**Hasil**: Max 10 connections, idle otomatis ditutup setelah 60 detik!

---

## 📈 Expected Behavior di Vercel

### Cold Start (First Request):
1. Request masuk
2. Buat connection pool (2-10 connections)
3. Response time: ~500-1000ms

### Warm Requests (Subsequent):
1. Request masuk
2. Reuse connection dari pool
3. Response time: ~50-200ms

### Idle Timeout (No Requests):
1. Setelah 60 detik idle
2. Auto-close semua connections
3. Freed resources

### Next Request After Idle:
1. Cold start lagi
2. Buat connection pool baru

---

## 🔍 Troubleshooting

### Jika Koneksi Masih Tinggi:

1. **Cek di MongoDB Atlas**:
   - Go to: Cluster → Metrics → Connections
   - Should see: Max 10 connections per deployment

2. **Cek Health Endpoint**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
   - Should return: `"status": "healthy"`

3. **Cek Monitor**:
   ```bash
   curl https://your-app.vercel.app/api/monitor
   ```
   - Check: `poolSize.active` should be ≤ 10

### Jika Masih Bermasalah:

1. **Force Cleanup**:
   - Redeploy aplikasi di Vercel
   - Connections otomatis closed

2. **Cek Logs**:
   ```bash
   vercel logs
   ```
   - Look for: Connection error messages

3. **Manual Cleanup di MongoDB Atlas**:
   - Cluster → ... → Terminate All Connections
   - (Hanya sebagai last resort)

---

## ✅ Checklist Keamanan

- [x] Connection pooling (max 10)
- [x] Idle timeout (10s)
- [x] Socket timeout (45s)
- [x] Auto cleanup (60s)
- [x] Graceful shutdown
- [x] Health monitoring
- [x] Error tracking
- [x] Connection reuse
- [x] Rate limiting (middleware.js)

---

## 📞 Quick Commands

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Monitor stats
curl https://your-app.vercel.app/api/monitor

# Warmup
curl -X POST https://your-app.vercel.app/api/health

# Reset monitor (development only)
curl -X DELETE https://your-app.vercel.app/api/monitor
```

---

## 🎯 Expected Metrics di Production

| Metric | Expected Value | Alert If |
|--------|---------------|----------|
| Active Connections | 2-10 | > 10 |
| Response Time | 50-200ms | > 1000ms |
| Error Rate | < 1% | > 5% |
| Idle Cleanup | Every 60s | Never |
| Pool Utilization | 20-80% | > 90% |

---

Dengan setup ini, Anda **TIDAK akan mengalami masalah koneksi tinggi lagi** di Vercel! 🎉
