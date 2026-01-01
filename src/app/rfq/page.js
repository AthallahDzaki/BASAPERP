'use client'

import { useState } from 'react'
import { FileText, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { useAPI, useAPICall } from '@/hooks/useAPI'
import { rfqAPI, vendorsAPI, productsAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function RFQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingRFQ, setEditingRFQ] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const { data: rfqs, loading: rfqsLoading, error: rfqsError, refetch: refetchRFQs } = useAPI(rfqAPI.getAll)
  const { data: vendors, loading: vendorsLoading } = useAPI(vendorsAPI.getAll)
  const { data: products, loading: productsLoading } = useAPI(productsAPI.getAll)

  const { execute: createRFQ, loading: creating } = useAPICall(rfqAPI.create)
  const { execute: updateRFQ, loading: updating } = useAPICall(rfqAPI.update)
  const { execute: deleteRFQ, loading: deleting } = useAPICall(rfqAPI.delete)

  const [formData, setFormData] = useState({
    vendor: '',
    requestDate: new Date().toISOString().split('T')[0],
    requiredBy: '',
    status: 'draft',
    items: [{ product: '', quantity: 1, estimatedPrice: 0 }]
  })

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000)
  }

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 1, estimatedPrice: 0 }]
    })
  }

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: newItems })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.vendor) {
      showAlert('Please select a vendor', 'error')
      return
    }

    if (formData.items.some(item => !item.product || item.quantity <= 0)) {
      showAlert('Please fill all item details', 'error')
      return
    }

    try {
      if (editingRFQ) {
        await updateRFQ(editingRFQ._id, formData)
        showAlert('RFQ updated successfully!')
      } else {
        await createRFQ(formData)
        showAlert('RFQ created successfully!')
      }
      setShowModal(false)
      resetForm()
      refetchRFQs()
    } catch (error) {
      showAlert(error.message || 'Failed to save RFQ', 'error')
    }
  }

  const handleEdit = (rfq) => {
    setEditingRFQ(rfq)
    setFormData({
      vendor: rfq.vendor._id,
      requestDate: rfq.requestDate?.split('T')[0] || '',
      requiredBy: rfq.requiredBy?.split('T')[0] || '',
      status: rfq.status,
      items: rfq.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        estimatedPrice: item.estimatedPrice
      }))
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this RFQ?')) return
    
    try {
      await deleteRFQ(id)
      showAlert('RFQ deleted successfully!')
      refetchRFQs()
    } catch (error) {
      showAlert(error.message || 'Failed to delete RFQ', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      vendor: '',
      requestDate: new Date().toISOString().split('T')[0],
      requiredBy: '',
      status: 'draft',
      items: [{ product: '', quantity: 1, estimatedPrice: 0 }]
    })
    setEditingRFQ(null)
  }

  const filteredRFQs = rfqs?.filter(rfq =>
    rfq.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rfq.vendor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      sent: 'bg-blue-100 text-blue-700',
      received: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || colors.draft
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-8">
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
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Request for Quotation</h1>
              <p className="text-gray-600">Manage vendor quotation requests</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create RFQ
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search RFQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {rfqsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : rfqsError ? (
          <div className="text-center py-12 text-red-600">{rfqsError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">RFQ Number</th>
                  <th className="px-6 py-4 text-left font-semibold">Vendor</th>
                  <th className="px-6 py-4 text-left font-semibold">Request Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Required By</th>
                  <th className="px-6 py-4 text-left font-semibold">Items</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRFQs.map((rfq) => (
                  <tr key={rfq._id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{rfq.rfqNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{rfq.vendor?.name}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(rfq.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {rfq.requiredBy ? new Date(rfq.requiredBy).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {rfq.items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rfq.status)}`}>
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(rfq)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rfq._id)}
                          disabled={deleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRFQs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No RFQs found
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingRFQ ? 'Edit RFQ' : 'Create New RFQ'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor *
                  </label>
                  <select
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors?.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Date *
                  </label>
                  <input
                    type="date"
                    value={formData.requestDate}
                    onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required By Date
                  </label>
                  <input
                    type="date"
                    value={formData.requiredBy}
                    onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Items *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

<div className="space-y-3">
  {formData.items.map((item, index) => (
    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      {/* Product: wrapper column sehingga label di atas select */}
      <div className="flex-1 flex flex-col">
        <label
          htmlFor={`product-${index}`}
          className="text-xs font-medium text-gray-600 mb-1"
        >
          Product
        </label>
        <select
          id={`product-${index}`}
          value={item.product}
          onChange={(e) => handleItemChange(index, 'product', e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          required
        >
          <option value="">Select Product</option>
          {products?.map((product) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity: fixed width column */}
      <div className="w-32 flex flex-col">
        <label
          htmlFor={`quantity-${index}`}
          className="text-xs font-medium text-gray-600 mb-1"
        >
          Quantity
        </label>
        <input
          id={`quantity-${index}`}
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value || '0'))}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          placeholder="Qty"
          required
        />
      </div>

      {/* Est. Price with label above (sudah column) */}
      <div className="w-40 flex flex-col">
        <label
          htmlFor={`estimatedPrice-${index}`}
          className="text-xs font-medium text-gray-600 mb-1"
        >
          Est. Price
        </label>
        <input
          id={`estimatedPrice-${index}`}
          type="number"
          min="0"
          step="0.01"
          value={item.estimatedPrice}
          onChange={(e) => handleItemChange(index, 'estimatedPrice', e.target.value === '' ? '' : parseFloat(e.target.value))}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500"
          placeholder="Est. Price"
          name="Price"
        />
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
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {(creating || updating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingRFQ ? 'Update RFQ' : 'Create RFQ'}
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
