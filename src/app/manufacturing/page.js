'use client'

import { useState } from 'react'
import { Factory, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { useAPI, useAPICall } from '@/hooks/useAPI'
import { manufacturingOrdersAPI, productsAPI, bomAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ManufacturingOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingMO, setEditingMO] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  const { data: manufacturingOrders, loading: moLoading, error: moError, refetch: refetchMOs } = useAPI(manufacturingOrdersAPI.getAll)
  const { data: products, loading: productsLoading } = useAPI(productsAPI.getAll)
  const { data: boms, loading: bomsLoading } = useAPI(bomAPI.getAll)

  const { execute: createMO, loading: creating } = useAPICall(manufacturingOrdersAPI.create)
  const { execute: updateMO, loading: updating } = useAPICall(manufacturingOrdersAPI.update)
  const { execute: deleteMO, loading: deleting } = useAPICall(manufacturingOrdersAPI.delete)

  const [formData, setFormData] = useState({
    product: '',
    bom: '',
    quantity: 1,
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    workCenter: '',
    priority: 'normal',
    status: 'draft',
    notes: ''
  })

  const [filteredBOMs, setFilteredBOMs] = useState([])

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000)
  }

  const handleProductChange = (productId) => {
    setFormData({ ...formData, product: productId, bom: '' })
    
    // Filter BOMs by selected product
    if (productId && boms) {
      const filtered = boms.filter(bom => bom.product._id === productId)
      setFilteredBOMs(filtered)
    } else {
      setFilteredBOMs([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.product || !formData.bom) {
      showAlert('Please select product and BOM', 'error')
      return
    }

    if (formData.quantity <= 0) {
      showAlert('Quantity must be greater than 0', 'error')
      return
    }

    try {
      if (editingMO) {
        await updateMO(editingMO._id, formData)
        showAlert('Manufacturing Order updated successfully!')
      } else {
        await createMO(formData)
        showAlert('Manufacturing Order created successfully!')
      }
      setShowModal(false)
      resetForm()
      refetchMOs()
    } catch (error) {
      showAlert(error.message || 'Failed to save Manufacturing Order', 'error')
    }
  }

  const handleEdit = (mo) => {
    setEditingMO(mo)
    setFormData({
      product: mo.product._id,
      bom: mo.bom._id,
      quantity: mo.quantity,
      plannedStartDate: mo.plannedStartDate?.split('T')[0] || '',
      plannedEndDate: mo.plannedEndDate?.split('T')[0] || '',
      actualStartDate: mo.actualStartDate?.split('T')[0] || '',
      actualEndDate: mo.actualEndDate?.split('T')[0] || '',
      workCenter: mo.workCenter || '',
      priority: mo.priority,
      status: mo.status,
      notes: mo.notes || ''
    })
    
    // Filter BOMs for this product
    if (boms) {
      const filtered = boms.filter(bom => bom.product._id === mo.product._id)
      setFilteredBOMs(filtered)
    }
    
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this Manufacturing Order?')) return
    
    try {
      await deleteMO(id)
      showAlert('Manufacturing Order deleted successfully!')
      refetchMOs()
    } catch (error) {
      showAlert(error.message || 'Failed to delete Manufacturing Order', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      product: '',
      bom: '',
      quantity: 1,
      plannedStartDate: new Date().toISOString().split('T')[0],
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      workCenter: '',
      priority: 'normal',
      status: 'draft',
      notes: ''
    })
    setFilteredBOMs([])
    setEditingMO(null)
  }

  const filteredMOs = manufacturingOrders?.filter(mo =>
    mo.moNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mo.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      planned: 'bg-blue-100 text-blue-700',
      ready: 'bg-cyan-100 text-cyan-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || colors.draft
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    }
    return colors[priority] || colors.normal
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-8">
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
            <div className="p-3 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl shadow-lg">
              <Factory className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manufacturing Orders</h1>
              <p className="text-gray-600">Manage production planning and execution</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create MO
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Manufacturing Orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-gray-900"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {moLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          </div>
        ) : moError ? (
          <div className="text-center py-12 text-red-600">{moError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">MO Number</th>
                  <th className="px-6 py-4 text-left font-semibold">Product</th>
                  <th className="px-6 py-4 text-left font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-left font-semibold">Priority</th>
                  <th className="px-6 py-4 text-left font-semibold">Planned Start</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMOs.map((mo) => (
                  <tr key={mo._id} className="hover:bg-teal-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{mo.moNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{mo.product?.name}</div>
                      <div className="text-sm text-gray-500">{mo.workCenter}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{mo.quantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(mo.priority)}`}>
                        {mo.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {mo.plannedStartDate ? new Date(mo.plannedStartDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mo.status)}`}>
                        {mo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(mo)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mo._id)}
                          disabled={deleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMOs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No Manufacturing Orders found
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
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingMO ? 'Edit Manufacturing Order' : 'Create New Manufacturing Order'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
                  <select
                    value={formData.product}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    required
                  >
                    <option value="">Select Product</option>
                    {products?.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BOM *</label>
                  <select
                    value={formData.bom}
                    onChange={(e) => setFormData({ ...formData, bom: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    required
                    disabled={!formData.product}
                  >
                    <option value="">Select BOM</option>
                    {filteredBOMs.map((bom) => (
                      <option key={bom._id} value={bom._id}>
                        {bom._id} (Qty: {bom.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Center</label>
                  <input
                    type="text"
                    value={formData.workCenter}
                    onChange={(e) => setFormData({ ...formData, workCenter: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    placeholder="e.g., Assembly Line 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="planned">Planned</option>
                    <option value="ready">Ready</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Planned Start Date *</label>
                    <input
                      type="date"
                      value={formData.plannedStartDate}
                      onChange={(e) => setFormData({ ...formData, plannedStartDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Planned End Date</label>
                    <input
                      type="date"
                      value={formData.plannedEndDate}
                      onChange={(e) => setFormData({ ...formData, plannedEndDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual Start Date</label>
                    <input
                      type="date"
                      value={formData.actualStartDate}
                      onChange={(e) => setFormData({ ...formData, actualStartDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Actual End Date</label>
                    <input
                      type="date"
                      value={formData.actualEndDate}
                      onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-teal-500 text-gray-900"
                  placeholder="Additional notes or instructions..."
                />
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
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {(creating || updating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingMO ? 'Update MO' : 'Create MO'}
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
