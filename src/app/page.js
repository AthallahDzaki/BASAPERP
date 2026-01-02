'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Package, 
  ClipboardList, 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp,
  Factory,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { productsAPI, salesOrdersAPI, vendorsAPI, customersAPI, healthAPI } from '@/lib/api'

export default function Home() {
  const [stats, setStats] = useState({
    products: { total: 0, lowStock: 0 },
    sales: { total: 0, revenue: 0 },
    apiStatus: 'checking'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Check API health
        const health = await healthAPI.check()
        
        // Fetch product stats
        const productStats = await productsAPI.getStats()
        
        // Fetch sales stats
        const salesStats = await salesOrdersAPI.getStats()

        const vendorStats = await vendorsAPI.getStats();

        const customerStats = await customersAPI.getStats()

        console.log(customerStats);
        
        setStats({
          products: {
            total: productStats.data.overview.totalProducts || 0,
            lowStock: productStats.data.overview.lowStock || 0,
          },
          sales: {
            total: salesStats.data.overview.totalOrders || 0,
            revenue: salesStats.data.overview.totalRevenue || 0,
          },
          vendor: {
            total: vendorStats.data.vendorCount.active || 0
          },
          customer: customerStats.data.customerCount || 0,
          apiStatus: health.status
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({ ...prev, apiStatus: 'error' }))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])
  const modules = [
    {
      title: 'Manufacturing Order',
      description: 'Manage production orders and manufacturing processes',
      icon: Factory,
      href: '/manufacturing',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Products',
      description: 'Create and manage product catalog',
      icon: Package,
      href: '/products',
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Bill of Materials',
      description: 'Define product components and structure',
      icon: ClipboardList,
      href: '/bom',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Request for Quotation',
      description: 'Create and manage RFQs with vendors',
      icon: FileText,
      href: '/rfq',
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Purchase Order',
      description: 'Generate and track purchase orders',
      icon: ShoppingCart,
      href: '/po',
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Vendors',
      description: 'Manage vendor relationships and information',
      icon: Users,
      href: '/vendor',
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      title: 'Sales Order',
      description: 'Create and process customer sales orders',
      icon: TrendingUp,
      href: '/sales',
      color: 'bg-teal-500',
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Customers',
      description: 'Manage customer database and information',
      icon: Users,
      href: '/customer',
      color: 'bg-cyan-500',
      gradient: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Quotations',
      description: 'Create and send quotations to customers',
      icon: FileText,
      href: '/quotation',
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      title: 'Employees',
      description: 'Manage employee information and records',
      icon: Users,
      href: '/employees',
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-pink-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ERP Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your business operations with our comprehensive enterprise resource planning solution
          </p>
        
        {/* API Status */}
        <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white shadow-md">
          <div className={`w-3 h-3 rounded-full ${stats.apiStatus === 'healthy' ? 'bg-green-500' : stats.apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'} animate-pulse`}></div>
          <span className="text-sm font-medium text-gray-700">
            API Status: {stats.apiStatus === 'healthy' ? '✅ Connected' : stats.apiStatus === 'error' ? '❌ Error' : '🔄 Checking...'}
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.products.total}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sales Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.sales.total}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                Rp {(stats.sales.revenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.products.lowStock}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vendors</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.vendor.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.customer}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-xl">
              <TrendingUp className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon
          return (
            <Link
              key={module.href}
              href={module.href}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className={`h-2 bg-gradient-to-r ${module.gradient}`} />
              <div className="p-6">
                <div className={`inline-flex p-3 rounded-xl ${module.color} bg-opacity-10 mb-4`}>
                  <Icon className={`w-8 h-8 ${module.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {module.description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
    </ProtectedRoute>
  )
}
