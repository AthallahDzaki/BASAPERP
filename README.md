# 🚀 ERP Dashboard - Next.js Full Stack

Modern ERP Dashboard dengan **Next.js 15**, **MongoDB**, dan **Tailwind CSS**. Full-stack dalam satu project tanpa Express terpisah!

## ✨ Features

- ✅ **Full Stack** - Next.js dengan API Routes (tanpa Express!)
- ✅ **MongoDB** - Mongoose ODM dengan connection pooling yang aman
- ✅ **Modern UI** - Tailwind CSS dengan Odoo-style navbar
- ✅ **File-based Routing** - Next.js App Router
- ✅ **Hot Reload** - Development mode dengan auto-refresh
- ✅ **No CORS** - Frontend dan Backend dalam 1 origin
- ✅ **Serverless Ready** - Easy deploy ke Vercel
- ✅ **Connection Management** - Auto cleanup & monitoring
- ✅ **Rate Limiting** - DDoS protection (100 req/min)
- ✅ **Real-time Monitor** - Visual dashboard untuk tracking connections

## 📦 Tech Stack

- **Next.js 15.1** - React Framework
- **React 19** - UI Library
- **MongoDB** - Database NoSQL
- **Mongoose** - MongoDB ODM
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icons

## 📦 Modules

- **Products** - Product catalog management
- **Bill of Materials (BOM)** - Product components
- **Request for Quotation (RFQ)** - Vendor quotations
- **Purchase Orders (PO)** - Purchase management
- **Vendors** - Vendor relationships
- **Sales Orders** - Customer orders (Enhanced!)
- **Customers** - Customer database
- **Quotations** - Customer quotations
- **Manufacturing Orders** - Production management
- **Employees** - Employee management with HR features ⭐ NEW!

## � Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Buat account di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `.env.local`

**Option B: Local MongoDB**
```bash
# Download MongoDB Community Edition
# https://www.mongodb.com/try/download/community
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/erp_dashboard
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/erp_dashboard

NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.js          # Root layout with navigation
│   ├── page.js            # Dashboard home page
│   ├── globals.css        # Global styles
│   ├── products/          # Products module
│   ├── bom/              # Bill of Materials module
│   ├── rfq/              # Request for Quotation module
│   ├── po/               # Purchase Order module
│   ├── vendor/           # Vendors module
│   ├── sales/            # Sales Orders module
│   ├── customer/         # Customers module
│   └── quotation/        # Quotations module
└── components/
    └── Navbar.js          # Navigation component

```

## 🎨 Design Features

- **Gradient Headers**: Eye-catching gradient headers for each module
- **Card-based Layout**: Clean card design with shadows and borders
- **Color-coded Modules**: Each module has its unique color theme
- **Interactive Elements**: Smooth hover effects and transitions
- **Modern Forms**: Well-designed form inputs with focus states
- **Responsive Tables**: Data tables that work on all screen sizes

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `node test-connection.js` - Test MongoDB connection management

## 🔍 Monitoring & Health Check

### Visual Dashboard
```
http://localhost:3000/monitor
```
Real-time monitoring untuk:
- Connection pool usage
- Active connections
- Memory usage
- Error tracking
- Auto-refresh every 5 seconds

### API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Connection statistics
curl http://localhost:3000/api/monitor

# Warmup connection (prevent cold start)
curl -X POST http://localhost:3000/api/health
```

### Test Connection Management
```bash
node test-connection.js
```

## 🛡️ Security Features

### Connection Pooling
- **Max Connections**: 10 (prevent overload)
- **Min Connections**: 2 (always ready)
- **Idle Timeout**: 10 seconds
- **Auto Cleanup**: 60 seconds after idle

### Rate Limiting
- **Max Requests**: 100 per minute per IP
- **Protection**: DDoS prevention
- **Security Headers**: XSS, CSRF protection

### Connection Safety
- ✅ Connection reuse (no leaks)
- ✅ Auto-reconnect on disconnect
- ✅ Graceful shutdown
- ✅ Timeout protection
- ✅ Error recovery

## 📚 Documentation

- **[DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)** - Step-by-step deploy guide
- **[MONGODB_MONITORING.md](./MONGODB_MONITORING.md)** - Monitoring documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details

## 🚀 Deploy ke Vercel

1. **Setup MongoDB Atlas**
   - Create cluster
   - Whitelist IP: `0.0.0.0/0`
   - Get connection string

2. **Deploy**
   ```bash
   git push origin main
   ```

3. **Set Environment Variable di Vercel**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp_dashboard
   ```

4. **Monitor After Deploy**
   ```bash
   # Check health
   curl https://your-app.vercel.app/api/health
   
   # Visual monitoring
   https://your-app.vercel.app/monitor
   ```

Lihat [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) untuk detail lengkap.

## 🌟 Key Improvements

1. **Modern UI/UX**: Complete redesign with Tailwind CSS
2. **Better Navigation**: Fixed navbar with smooth transitions
3. **Consistent Design**: Unified design language across all modules
4. **Better Forms**: Improved form layouts with validation states
5. **Enhanced Tables**: Better table designs with hover states
6. **Mobile-first**: Fully responsive design

## 📄 License

MIT License

## 👨‍💻 Author

Built with ❤️ using Next.js and Tailwind CSS
