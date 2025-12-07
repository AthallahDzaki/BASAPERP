'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { useAPI, useAPICall } from '@/hooks/useAPI'
import { bomAPI, productsAPI } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function BOMPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBOM, setEditingBOM] = useState(null)
  const [alert, setAlert] = useState({ show: false, message: '', type: '' })

  // Fetch data via useAPI
  const { data: boms, loading: bomsLoading, error: bomsError } = useAPI(bomAPI.getAll)
  const { data: products, loading: productsLoading } = useAPI(productsAPI.getAll)

  // Local state to drive UI so we can explicitly update it after mutations
  const [bomsState, setBomsState] = useState([])

  // API calls
  const { execute: createBOM, loading: creating } = useAPICall(bomAPI.create)
  const { execute: updateBOM, loading: updating } = useAPICall(bomAPI.update)
  const { execute: deleteBOM, loading: deleting } = useAPICall(bomAPI.delete)
  // use this execute to fetch all BOMs on demand and update bomsState
  const { execute: fetchAllBOMs } = useAPICall(bomAPI.getAll)

  // Sync initial data loaded by useAPI into local state
  useEffect(() => {
    if (boms) {
      setBomsState(boms)
    }
  }, [boms])

  // Form state - gunakan "product" untuk id dalam UI; kita akan transform ke "component" saat submit
  const [formData, setFormData] = useState({
    product: '',
    quantity: 1,
    components: [{ product: '', quantity: 1, unitOfMeasure: 'pcs' }]
  })

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000)
  }

  const handleAddComponent = () => {
    setFormData((prev) => ({
      ...prev,
      components: [...prev.components, { product: '', quantity: 1, unitOfMeasure: 'pcs' }]
    }))
  }

  const handleRemoveComponent = (index) => {
    setFormData((prev) => {
      const newComponents = prev.components.filter((_, i) => i !== index)
      return { ...prev, components: newComponents }
    })
  }

  const handleComponentChange = (index, field, value) => {
    setFormData((prev) => {
      const newComponents = prev.components.map((c, i) => {
        if (i !== index) return c
        if (field === 'quantity') {
          const num = parseFloat(value)
          return { ...c, quantity: isNaN(num) ? 0 : num }
        }
        return { ...c, [field]: value }
      })
      return { ...prev, components: newComponents }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.product) {
      showAlert('Please select a product', 'error')
      return
    }

    if (formData.components.some(c => !c.product || c.quantity <= 0)) {
      showAlert('Please fill all component details and ensure quantities > 0', 'error')
      return
    }

    // Transform payload: UI uses components[].product, API expects components[].component
    const payload = {
      product: formData.product,
      quantity: formData.quantity,
      components: formData.components.map(c => ({
        component: c.product, // server expects `component`
        quantity: c.quantity,
        unitOfMeasure: c.unitOfMeasure
      }))
    }

    try {
      if (editingBOM) {
        await updateBOM(editingBOM._id, payload)
        showAlert('BOM updated successfully!')
      } else {
        await createBOM(payload)
        showAlert('BOM created successfully!')
      }

      // Fetch latest list and update local state so UI reflects new data
      try {
        const res = await fetchAllBOMs()
        // fetchAllBOMs may return response shaped as { data: [...] } or directly [...]
        const latest = res?.data ?? res
        if (latest) setBomsState(latest)
      } catch (err) {
        console.warn('Failed to re-fetch BOMs after save:', err)
      }

      setShowModal(false)
      resetForm()
    } catch (error) {
      showAlert(error?.message || 'Failed to save BOM', 'error')
      console.error(error)
    }
  }

  const handleEdit = (bom) => {
    setEditingBOM(bom)
    setFormData({
      product: bom.product?._id || '',
      quantity: bom.quantity || 1,
      components: (bom.components || []).map(c => ({
        product: c.component?._id || c.product?._id || '',
        quantity: c.quantity || 1,
        unitOfMeasure: c.unitOfMeasure || 'pcs'
      }))
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this BOM?')) return
    
    try {
      await deleteBOM(id)
      showAlert('BOM deleted successfully!')

      // re-fetch and update local state
      try {
        const res = await fetchAllBOMs()
        const latest = res?.data ?? res
        if (latest) setBomsState(latest)
      } catch (err) {
        console.warn('Failed to re-fetch BOMs after delete:', err)
      }
    } catch (error) {
      showAlert(error?.message || 'Failed to delete BOM', 'error')
    }
  }

  const resetForm = () => {
    setFormData({
      product: '',
      quantity: 1,
      components: [{ product: '', quantity: 1, unitOfMeasure: 'pcs' }]
    })
    setEditingBOM(null)
  }

  const filteredBOMs = (bomsState || []).filter(bom =>
    bom.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.bomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8">
      {/* Alert */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          alert.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Bill of Materials</h1>
              <p className="text-gray-600">Manage product components and assemblies</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create BOM
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search BOMs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {bomsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : bomsError ? (
          <div className="text-center py-12 text-red-600">{bomsError}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">BOM Number</th>
                  <th className="px-6 py-4 text-left font-semibold">Product</th>
                  <th className="px-6 py-4 text-left font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-left font-semibold">Components</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBOMs.map((bom) => (
                  <tr key={bom._id} className="hover:bg-purple-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{bom._id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{bom.product?.name}</div>
                      <div className="text-sm text-gray-500">{bom.product?.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{bom.quantity}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {bom.components?.length || 0} components
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(bom)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(bom._id)}
                          disabled={deleting}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBOMs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No BOMs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingBOM ? 'Edit BOM' : 'Create New BOM'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product & Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product *
                  </label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10)
                      setFormData({ ...formData, quantity: isNaN(n) ? 1 : n })
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    required
                  />
                </div>
              </div>

              {/* Components */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Components *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Component
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.components.map((component, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <select
                        value={component.product}
                        onChange={(e) => handleComponentChange(index, 'product', e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                        required
                      >
                        <option value="">Select Component</option>
                        {products?.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={component.quantity}
                        onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                        className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                        placeholder="Qty"
                        required
                      />

                      <select
                        value={component.unitOfMeasure}
                        onChange={(e) => handleComponentChange(index, 'unitOfMeasure', e.target.value)}
                        className="w-32 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500"
                      >
                        <option value="pcs">Pcs</option>
                        <option value="kg">Kg</option>
                        <option value="g">G</option>
                        <option value="l">L</option>
                        <option value="ml">Ml</option>
                        <option value="m">M</option>
                        <option value="cm">Cm</option>
                      </select>

                      {formData.components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
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
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {(creating || updating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBOM ? 'Update BOM' : 'Create BOM'}
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