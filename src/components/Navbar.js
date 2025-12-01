'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  Package, 
  ClipboardList, 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp,
  ChevronDown,
  Factory,
  Search,
  Grid,
  User
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownRef = useRef(null)

  // Menu structure bergaya Odoo
  const menuStructure = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/',
      icon: Home,
    },
    {
      id: 'manufacturing',
      label: 'Manufacturing',
      icon: Factory,
      items: [
        { href: '/products', label: 'Products', icon: Package },
        { href: '/bom', label: 'Bill of Materials', icon: ClipboardList },
      ]
    },
    {
      id: 'purchase',
      label: 'Purchase',
      icon: ShoppingCart,
      items: [
        { href: '/rfq', label: 'Request for Quotation', icon: FileText },
        { href: '/po', label: 'Purchase Orders', icon: ShoppingCart },
        { href: '/vendor', label: 'Vendors', icon: Users },
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: TrendingUp,
      items: [
        { href: '/quotation', label: 'Quotations', icon: FileText },
        { href: '/sales', label: 'Sales Orders', icon: TrendingUp },
        { href: '/customer', label: 'Customers', icon: Users },
      ]
    },
  ]

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isMenuActive = (menu) => {
    if (menu.href) return isActive(menu.href)
    return menu.items?.some(item => isActive(item.href))
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = (menuId) => {
    setOpenDropdown(openDropdown === menuId ? null : menuId)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-800 shadow-lg">
      <div className="mx-auto px-4">
        <div className="flex items-center h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mr-8 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              ERP
            </span>
          </Link>

          {/* Menu Items - Odoo Style */}
          <div className="flex items-center space-x-1 flex-1" ref={dropdownRef}>
            {menuStructure.map((menu) => {
              const MenuIcon = menu.icon
              const hasDropdown = menu.items && menu.items.length > 0
              const isMenuItemActive = isMenuActive(menu)

              if (!hasDropdown) {
                // Simple link without dropdown
                return (
                  <Link
                    key={menu.id}
                    href={menu.href}
                    className={`
                      flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all
                      ${isMenuItemActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <MenuIcon className="w-4 h-4" />
                    <span className="hidden md:block">{menu.label}</span>
                  </Link>
                )
              }

              // Dropdown menu
              return (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => toggleDropdown(menu.id)}
                    className={`
                      flex items-center space-x-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all
                      ${isMenuItemActive || openDropdown === menu.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <MenuIcon className="w-4 h-4" />
                    <span className="hidden md:block">{menu.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === menu.id ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Content */}
                  {openDropdown === menu.id && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-fadeIn">
                      {menu.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`
                              flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors
                              ${isActive(item.href)
                                ? 'bg-emerald-50 text-emerald-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                              }
                            `}
                          >
                            <ItemIcon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-2 ml-auto">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
              <Grid className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </nav>
  )
}
