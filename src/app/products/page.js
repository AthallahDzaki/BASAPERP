'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Save, Search, Edit, Trash2, Eye } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import { useAPI, useAPICall } from '@/hooks/useAPI'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  const { data: productsData, loading, error, setData } = useAPI(
    () => productsAPI.getAll({ page: currentPage, limit: 10, search: searchTerm }),
    [currentPage, searchTerm]
  )
  
  const { execute: createProduct, loading: creating } = useAPICall()
  const { execute: updateProduct, loading: updating } = useAPICall()
  const { execute: deleteProduct, loading: deleting } = useAPICall()

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    uom: 'Unit',
    category: 'finished_good',
    type: 'storable',
    price: '',
    cost: '',
    stockQty: 0,
    minStockQty: 0,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      uom: 'Unit',
      category: 'finished_good',
      type: 'storable',
      price: '',
      cost: '',
      stockQty: 0,
      minStockQty: 0,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await updateProduct(productsAPI.update, editingId, formData)
        alert('Product updated successfully!')
      } else {
        await createProduct(productsAPI.create, formData)
        alert('Product created successfully!')
      }
      
      // Refresh data
      const result = await productsAPI.getAll({ page: currentPage, limit: 10, search: searchTerm })
      setData(result.data)
      resetForm()
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      uom: product.uom,
      category: product.category,
      type: product.type,
      price: product.price,
      cost: product.cost,
      stockQty: product.stockQty,
      minStockQty: product.minStockQty,
    })
    setEditingId(product._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      await deleteProduct(productsAPI.delete, id)
      alert('Product deleted successfully!')
      
      // Refresh data
      const result = await productsAPI.getAll({ page: currentPage, limit: 10, search: searchTerm })
      setData(result.data)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-8 py-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Products</h1>
              <p className="text-green-50 mt-1">Manage your product catalog</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>{showForm ? 'Cancel' : 'Add Product'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {!showForm && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* General Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">1</span>
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU / Code *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Enter SKU"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter product description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">2</span>
              Product Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measure
                </label>
                <select
                  name="uom"
                  value={formData.uom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="Unit">Unit</option>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Liter">Liter</option>
                  <option value="ml">ml</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="raw_material">Raw Material</option>
                  <option value="semi_finished">Semi Finished</option>
                  <option value="finished_good">Finished Good</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="storable">Storable</option>
                  <option value="service">Service</option>
                  <option value="consumable">Consumable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">3</span>
              Pricing & Inventory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stockQty"
                  value={formData.stockQty}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Stock Quantity
                </label>
                <input
                  type="number"
                  name="minStockQty"
                  value={formData.minStockQty}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || updating}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{creating || updating ? 'Saving...' : (editingId ? 'Update Product' : 'Save Product')}</span>
            </button>
          </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {!showForm && productsData && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productsData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No products found. Click &quotAdd Product&quot to create one.
                    </td>
                  </tr>
                ) : (
                  productsData.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        Rp {product.price?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`font-medium ${product.stockQty < product.minStockQty ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stockQty}
                        </span>
                        <span className="text-gray-500"> / {product.minStockQty}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={deleting}
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
