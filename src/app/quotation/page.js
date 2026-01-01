'use client'

import { useState } from 'react'
import { FileText, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { useAPI, useAPICall } from '@/hooks/useAPI'
import { quotationsAPI, customersAPI, productsAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function QuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const { data: quotations, loading: quotationsLoading, error: quotationsError, refetch: refetchQuotations } = useAPI(quotationsAPI.getAll)
  const { data: customers, loading: customersLoading } = useAPI(customersAPI.getAll)
  const { data: products, loading: productsLoading } = useAPI(productsAPI.getAll)

  const { execute: createQuotation, loading: creating } = useAPICall(quotationsAPI.create)
  const { execute: updateQuotation, loading: updating } = useAPICall(quotationsAPI.update)
  const { execute: deleteQuotation, loading: deleting } = useAPICall(quotationsAPI.delete)

  const [formData, setFormData] = useState({
    customer: '',
    quotationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, discount: 0 }],
    taxRate: 11,
    terms: '',
    status: 'draft',
    notes: ''
  })

  const formatCurrency = (amount) => {
    const safeAmount = Number(amount) || 0
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(safeAmount)
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unitPrice) || 0
      const discount = Number(item.discount) || 0
      const itemTotal = qty * price
      const itemDiscount = itemTotal * (discount / 100)
      return sum + (itemTotal - itemDiscount)
    }, 0)
    
    const taxAmount = subtotal * (Number(formData.taxRate) / 100 || 0)
    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000)
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, unitPrice: 0, discount: 0 }]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    // normalize numeric inputs where appropriate
    if (field === 'quantity') {
      newItems[index][field] = Number(value) || 0
    } else if (field === 'unitPrice' || field === 'discount') {
      newItems[index][field] = Number(value) || 0
    } else {
      newItems[index][field] = value
    }
    
    if (field === 'product' && value) {
      // products is expected to be an array
      const selectedProduct = Array.isArray(products) ? products.find(p => p._id === value) : undefined
      if (selectedProduct) {
        // try common property names
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

    if (formData.items.some(item => !item.product || Number(item.quantity) <= 0)) {
      showAlert('Please fill all item details', 'error')
      return
    }

    const dataToSubmit = {
      ...formData,
      subtotal,
      taxAmount,
      total
    }

    try {
      if (editingQuotation) {
        await updateQuotation(editingQuotation._id, dataToSubmit)
        showAlert('Quotation updated successfully!')
      } else {
        await createQuotation(dataToSubmit)
        showAlert('Quotation created successfully!')
      }
      setShowModal(false)
      resetForm()
      refetchQuotations()
    } catch (error) {
      showAlert(error?.message || 'Failed to save Quotation', 'error')
    }
  }

  const handleEdit = (quotation) => {
    setEditingQuotation(quotation)
    setFormData({
      customer: quotation.customer?._id || '',
      quotationDate: quotation.quotationDate?.split('T')[0] || '',
      expiryDate: quotation.expiryDate?.split('T')[0] || '',
      items: quotation.items.map(item => ({
        product: item.product?._id || '',
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? 0,
        discount: item.discount ?? 0
      })),
      taxRate: quotation.taxRate ?? 11,
      terms: quotation.terms ?? '',
      status: quotation.status ?? 'draft',
      notes: quotation.notes ?? ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Quotation?')) return
    
    try {
      await deleteQuotation(id)
      showAlert('Quotation deleted successfully!')
      refetchQuotations()
    } catch (error) {
      showAlert(error?.message || 'Failed to delete Quotation', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      customer: '',
      quotationDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      items: [{ product: '', quantity: 1, unitPrice: 0, discount: 0 }],
      taxRate: 11,
      terms: '',
      status: 'draft',
      notes: ''
    })
    setEditingQuotation(null)
  }

  const filteredQuotations = (quotations || []).filter(q =>
    (q.quotationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      expired: 'bg-orange-100 text-orange-700'
    }
    return colors[status] || colors.draft
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'} text-white`}>
          {alert.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quotations</h1>
              <p className="text-gray-600">Manage customer quotations</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Quotation
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {quotationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : quotationsError ? (
          <div className="text-center py-12 text-red-600">{quotationsError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Quotation #</th>
                  <th className="px-6 py-4 text-left font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Expiry</th>
                  <th className="px-6 py-4 text-left font-semibold">Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{quotation.quotationNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{quotation.customer?.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(quotation.quotationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {quotation.expiryDate ? new Date(quotation.expiryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(quotation.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(quotation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(quotation._id)}
                          disabled={deleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredQuotations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No Quotations found
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
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}
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
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers?.map((customer) => (
                      <option key={customer._id} value={customer._id}>{customer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quotation Date *</label>
                  <input
                    type="date"
                    value={formData.quotationDate}
                    onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Items *</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      {/* Product */}
                      <div className="flex-1 flex flex-col">
                        <label htmlFor={`product-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Product *
                        </label>
                        <select
                          id={`product-${index}`}
                          value={item.product}
                          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                          required
                        >
                          <option value="">Select Product</option>
                          {Array.isArray(products) && products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="w-24 flex flex-col">
                        <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                          placeholder="Qty"
                          required
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="w-32 flex flex-col">
                        <label htmlFor={`unitPrice-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Unit Price *
                        </label>
                        <input
                          id={`unitPrice-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                          placeholder="Price"
                          required
                        />
                      </div>

                      {/* Discount */}
                      <div className="w-24 flex flex-col">
                        <label htmlFor={`discount-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Disc %
                        </label>
                        <input
                          id={`discount-${index}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                          placeholder="Disc %"
                        />
                      </div>

                      {/* Total */}
                      <div className="w-32 flex flex-col items-end">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                        <div className="w-full px-4 py-2 border-2 border-transparent rounded-lg text-gray-700 font-medium text-right" aria-live="polite">
                          {formatCurrency((Number(item.quantity || 0) * Number(item.unitPrice || 0) * (1 - Number(item.discount || 0) / 100)) || 0)}
                        </div>
                      </div>

                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500"
                  placeholder="Enter payment terms, delivery terms, etc."
                />
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span className="font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                  <span>TOTAL:</span>
                  <span className="text-indigo-600">{formatCurrency(total)}</span>
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
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {(creating || updating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingQuotation ? 'Update Quotation' : 'Create Quotation'}
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