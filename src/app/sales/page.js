'use client'

import { useState } from 'react'
import { TrendingUp, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { useAPI, useAPICall } from '@/hooks/useAPI'
import { salesOrdersAPI, customersAPI, productsAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function SalesOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSO, setEditingSO] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const { data: salesOrders, loading: soLoading, error: soError, refetch: refetchSOs } = useAPI(salesOrdersAPI.getAll)
  const { data: customers, loading: customersLoading } = useAPI(customersAPI.getAll)
  const { data: productsData, loading: productsLoading } = useAPI(productsAPI.getAll)

  // normalize product list: support either array or { products: [...] }
  const products = Array.isArray(productsData) ? productsData : (productsData?.products || [])

  const { execute: createSO, loading: creating } = useAPICall(salesOrdersAPI.create)
  const { execute: updateSO, loading: updating } = useAPICall(salesOrdersAPI.update)
  const { execute: deleteSO, loading: deleting } = useAPICall(salesOrdersAPI.delete)

  const [formData, setFormData] = useState({
    customer: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    items: [{ product: '', quantity: 1, unitPrice: 0 }],
    discountType: 'percentage',
    discountValue: 0,
    taxRate: 11,
    shippingAddress: '',
    status: 'draft',
    notes: ''
  })

  const formatCurrency = (amount) => {
    const safe = Number(amount) || 0
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(safe)
  }

  // Use formData values (which are normalized) to calculate totals for UI
  const calculateTotals = (data = formData) => {
    const subtotal = (data.items || []).reduce((sum, item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unitPrice) || 0
      return sum + (qty * price)
    }, 0)

    let discountAmount = 0
    const discountValue = Number(data.discountValue) || 0
    if (data.discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100)
    } else {
      discountAmount = discountValue
    }

    const afterDiscount = subtotal - discountAmount
    const taxAmount = afterDiscount * (Number(data.taxRate) / 100 || 0)
    const total = afterDiscount + taxAmount

    return { subtotal, discountAmount, afterDiscount, taxAmount, total }
  }

  const { subtotal, discountAmount, afterDiscount, taxAmount, total } = calculateTotals()

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000)
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, unitPrice: 0 }]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  // handleItemChange sekarang melakukan parsing/normalisasi numeric dengan aman
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    if (field === 'quantity') {
      newItems[index][field] = Number(value) || 0
    } else if (field === 'unitPrice') {
      newItems[index][field] = Number(value) || 0
    } else {
      newItems[index][field] = value
    }

    // Auto-fill price when product is selected (support various product shapes)
    if (field === 'product' && value) {
      const selectedProduct = products.find(p => p._id === value)
      if (selectedProduct) {
        newItems[index].unitPrice = Number(selectedProduct.price ?? selectedProduct.unitPrice ?? 0)
      }
    }

    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.customer) {
      showAlert('Please select a customer', 'error')
      return
    }

    if (formData.items.some(item => !item.product || (Number(item.quantity) || 0) <= 0)) {
      showAlert('Please fill all item details', 'error')
      return
    }

    // Build sanitized items (ensure numeric fields and include subtotal per item)
    const sanitizedItems = (formData.items || []).map(item => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unitPrice) || 0
      const subtotalItem = quantity * unitPrice
      return {
        product: item.product,
        quantity,
        unitPrice,
        subtotal: subtotalItem
      }
    })

    const subtotalSum = sanitizedItems.reduce((s, it) => s + (Number(it.subtotal) || 0), 0)

    let discountAmt = 0
    const discountValue = Number(formData.discountValue) || 0
    if (formData.discountType === 'percentage') {
      discountAmt = subtotalSum * (discountValue / 100)
    } else {
      discountAmt = discountValue
    }

    const afterDisc = subtotalSum - discountAmt
    const taxAmt = afterDisc * (Number(formData.taxRate) / 100 || 0)
    const grandTotal = afterDisc + taxAmt

    // Map client statuses to backend-accepted statuses.
    // Currently backend expects e.g. 'quotation','confirmed','locked','cancelled'
    // We map 'draft' -> 'quotation'. Adjust mapping here if backend supports different set.
    const statusMap = {
      draft: 'quotation'
      // add other mappings if needed, e.g. processing: 'confirmed'
    }
    const statusToSend = statusMap[formData.status] ?? formData.status

    const dataToSubmit = {
      ...formData,
      items: sanitizedItems,
      subtotal: subtotalSum,
      discountAmount: discountAmt,
      taxAmount: taxAmt,
      total: grandTotal,
      status: statusToSend
    }

    try {
      if (editingSO) {
        await updateSO(editingSO._id, dataToSubmit)
        showAlert('Sales Order updated successfully!')
      } else {
        await createSO(dataToSubmit)
        showAlert('Sales Order created successfully!')
      }
      setShowModal(false)
      resetForm()
      refetchSOs()
    } catch (error) {
      showAlert(error?.message || 'Failed to save Sales Order', 'error')
    }
  }

  const handleEdit = (so) => {
    setEditingSO(so)
    setFormData({
      customer: so.customer?._id || '',
      orderDate: so.orderDate?.split('T')[0] || '',
      deliveryDate: so.deliveryDate?.split('T')[0] || '',
      items: (so.items || []).map(item => ({
        product: item.product?._id || item.product || '',
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0
      })),
      discountType: so.discountType || 'percentage',
      discountValue: Number(so.discountValue) || 0,
      taxRate: Number(so.taxRate) || 11,
      shippingAddress: so.shippingAddress || '',
      status: so.status || 'draft',
      notes: so.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Sales Order?')) return

    try {
      await deleteSO(id)
      showAlert('Sales Order deleted successfully!')
      refetchSOs()
    } catch (error) {
      showAlert(error?.message || 'Failed to delete Sales Order', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      customer: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      items: [{ product: '', quantity: 1, unitPrice: 0 }],
      discountType: 'percentage',
      discountValue: 0,
      taxRate: 11,
      shippingAddress: '',
      status: 'draft',
      notes: ''
    })
    setEditingSO(null)
  }

  const filteredSOs = (salesOrders || []).filter(so =>
    (so.soNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (so.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || colors.draft
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-8">
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {alert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sales Orders</h1>
              <p className="text-gray-600">Manage customer orders and sales</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Sales Order
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Sales Orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-900"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {soLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : soError ? (
          <div className="text-center py-12 text-red-600">{soError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">SO Number</th>
                  <th className="px-6 py-4 text-left font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left font-semibold">Order Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSOs.map((so) => (
                  <tr key={so._id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{so.soNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{so.customer?.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(so.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(so.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(so.status)}`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(so)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(so._id)}
                          disabled={deleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSOs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No Sales Orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingSO ? 'Edit Sales Order' : 'Create New Sales Order'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
                  <select
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers?.map((customer) => (
                      <option key={customer._id} value={customer._id}>{customer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
                  <input
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                <textarea
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Items *</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                        required
                      >
                        <option value="">Select Product</option>
                        {products?.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - {formatCurrency(product.price ?? product.unitPrice ?? 0)}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                        placeholder="Qty"
                        required
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-40 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 text-gray-900"
                        placeholder="Unit Price"
                        required
                      />

                      <div className="text-gray-700 font-medium w-40">
                        {formatCurrency((Number(item.quantity || 0) * Number(item.unitPrice || 0)) || 0)}
                      </div>

                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Discount ({formData.discountType === 'percentage' ? `${formData.discountValue}%` : 'Fixed'}):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>After Discount:</span>
                  <span className="font-semibold">{formatCurrency(afterDiscount)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                  <span>GRAND TOTAL:</span>
                  <span className="text-orange-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {(creating || updating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSO ? 'Update Sales Order' : 'Create Sales Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}