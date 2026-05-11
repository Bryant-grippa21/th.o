import React, { useState, useEffect } from "react";
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Calendar,
  ArrowLeft,
  Package,
  Star,
  TrendingUp,
  DollarSign,
  CreditCard,
  Store,
  Users,
  AlertTriangle,
  Shield,
  Clock as ClockIcon,
  Truck,
  Award,
  Activity,
  Bell,
  ThumbsUp,
  ThumbsDown,
  Plus,
  FileIcon,
  Upload,
  Copy,
  Check,
  Building,
  Smartphone,
  Banknote,
  Box,
  FileSpreadsheet,
  X,
  Pencil,
  Trash2,
  Save,
  Search,
  AlertCircle,
  Inbox,
  Send,
  CheckCircle,
  Package as PackageIcon,
  Building2,
  Crown,
  LayoutDashboard,
  History,
  HelpingHand,
  Filter,
  TrendingDown,
  Wallet,
  FileText,
  MessageSquare,
  UserCheck,
  Eye,
  Calendar as CalendarIcon,
  Target,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Flag,
  RotateCcw,
  Timer,
  Wallet as WalletIcon,
  Receipt,
  BookOpen,
  ClipboardList,
  MapPin,
  Briefcase,
  Percent,
  Layers,
  GitBranch,
  Sparkles,
  Brain,
  Trophy,
  Medal,
  Ban,
  MapPin as MapPinIcon,
  RefreshCw,
  PackageOpen,
  TrendingDown as TrendingDownIcon,
  Info
} from "lucide-react";

import { KPICard, ProgressBar, AlertCard, SimulationCard } from "../../components/shared";

export default function PurchaseHistoryTab ({ PALETTE }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const purchaseHistory = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      date: "15/03/2024",
      total: 1250.00,
      status: "delivered",
      paymentMethod: "Transferencia bancaria",
      paymentStatus: "Pagado",
      shippingAddress: "Av. Principal #123, Centro, Ciudad",
      trackingNumber: "TRK-123456789",
      estimatedDelivery: "20/03/2024",
      items: [
        { name: "Taladro percutor profesional", quantity: 2, unitPrice: 450, total: 900 },
        { name: "Juego de brocas", quantity: 1, unitPrice: 350, total: 350 }
      ],
      timeline: [
        { date: "15/03/2024", status: "Pedido confirmado", completed: true },
        { date: "16/03/2024", status: "En preparación", completed: true },
        { date: "17/03/2024", status: "Enviado", completed: true },
        { date: "20/03/2024", status: "Entregado", completed: true }
      ]
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      date: "28/02/2024",
      total: 2340.00,
      status: "shipped",
      paymentMethod: "Crédito",
      paymentStatus: "Pendiente",
      shippingAddress: "Calle Comercio #45, Norte, Ciudad",
      trackingNumber: "TRK-987654321",
      estimatedDelivery: "05/03/2024",
      items: [
        { name: "Esmeril angular", quantity: 3, unitPrice: 380, total: 1140 },
        { name: "Disco de corte", quantity: 10, unitPrice: 120, total: 1200 }
      ],
      timeline: [
        { date: "28/02/2024", status: "Pedido confirmado", completed: true },
        { date: "29/02/2024", status: "En preparación", completed: true },
        { date: "01/03/2024", status: "Enviado", completed: true },
        { date: "05/03/2024", status: "Entregado", completed: false }
      ]
    },
    {
      id: 3,
      orderNumber: "ORD-2024-003",
      date: "10/02/2024",
      total: 890.50,
      status: "delivered",
      paymentMethod: "Tarjeta de crédito",
      paymentStatus: "Pagado",
      shippingAddress: "Av. Industrial #789, Sur, Ciudad",
      trackingNumber: "TRK-456789123",
      estimatedDelivery: "15/02/2024",
      items: [
        { name: "Guantes anticorte", quantity: 5, unitPrice: 45, total: 225 },
        { name: "Casco seguridad", quantity: 3, unitPrice: 55, total: 165 },
        { name: "Gafas protectoras", quantity: 4, unitPrice: 30, total: 120 }
      ],
      timeline: [
        { date: "10/02/2024", status: "Pedido confirmado", completed: true },
        { date: "11/02/2024", status: "En preparación", completed: true },
        { date: "12/02/2024", status: "Enviado", completed: true },
        { date: "14/02/2024", status: "Entregado", completed: true }
      ]
    },
    {
      id: 4,
      orderNumber: "ORD-2024-004",
      date: "05/01/2024",
      total: 3150.00,
      status: "processing",
      paymentMethod: "Crédito",
      paymentStatus: "Pendiente",
      shippingAddress: "Calle Centro #234, Este, Ciudad",
      trackingNumber: null,
      estimatedDelivery: "15/01/2024",
      items: [
        { name: "Taladro percutor", quantity: 5, unitPrice: 450, total: 2250 },
        { name: "Juego de llaves", quantity: 2, unitPrice: 450, total: 900 }
      ],
      timeline: [
        { date: "05/01/2024", status: "Pedido confirmado", completed: true },
        { date: "06/01/2024", status: "En preparación", completed: false },
        { date: "10/01/2024", status: "Enviado", completed: false },
        { date: "15/01/2024", status: "Entregado", completed: false }
      ]
    },
    {
      id: 5,
      orderNumber: "ORD-2024-005",
      date: "20/03/2024",
      total: 5670.00,
      status: "pending",
      paymentMethod: "Crédito",
      paymentStatus: "Pendiente",
      shippingAddress: "Av. Principal #123, Centro, Ciudad",
      trackingNumber: null,
      estimatedDelivery: "30/03/2024",
      items: [
        { name: "Compresor de aire", quantity: 1, unitPrice: 3200, total: 3200 },
        { name: "Manguera de aire", quantity: 2, unitPrice: 185, total: 370 },
        { name: "Pistola de pintura", quantity: 1, unitPrice: 2100, total: 2100 }
      ],
      timeline: [
        { date: "20/03/2024", status: "Pedido confirmado", completed: true },
        { date: "22/03/2024", status: "En preparación", completed: false },
        { date: "25/03/2024", status: "Enviado", completed: false },
        { date: "30/03/2024", status: "Entregado", completed: false }
      ]
    }
  ];

  const statusConfig = {
    pending: { label: "Pendiente", icon: "⏳", color: "bg-yellow-100 text-yellow-700" },
    processing: { label: "En proceso", icon: "🔄", color: "bg-blue-100 text-blue-700" },
    shipped: { label: "Enviado", icon: "🚚", color: "bg-purple-100 text-purple-700" },
    delivered: { label: "Entregado", icon: "📦", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Cancelado", icon: "❌", color: "bg-red-100 text-red-700" }
  };

  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendiente" },
    { value: "processing", label: "En proceso" },
    { value: "shipped", label: "Enviado" },
    { value: "delivered", label: "Entregado" },
    { value: "cancelled", label: "Cancelado" }
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== "all") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const getFilteredOrders = () => {
    let filtered = [...purchaseHistory];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (startDate) {
      filtered = filtered.filter(o => {
        const [day, month, year] = o.date.split('/');
        const orderDate = new Date(`${year}-${month}-${day}`);
        const start = new Date(startDate);
        return orderDate >= start;
      });
    }

    if (endDate) {
      filtered = filtered.filter(o => {
        const [day, month, year] = o.date.split('/');
        const orderDate = new Date(`${year}-${month}-${day}`);
        const end = new Date(endDate);
        return orderDate <= end;
      });
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();
  const activeFiltersCount = getActiveFiltersCount();

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    return dateStr;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: "⏳",
      processing: "🔄",
      shipped: "🚚",
      delivered: "📦",
      cancelled: "❌",
      all: "📋"
    };
    return icons[status] || "📋";
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
            Filtros de búsqueda
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-yellow-400 text-black">
                {activeFiltersCount} filtros activos
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
            style={{ backgroundColor: showFilters ? PALETTE.sizzlingSunrise : "#F3F4F6", color: showFilters ? "#091A2D" : "#6B7280" }}
          >
            {showFilters ? "Ocultar filtros ↑" : "Mostrar filtros ↓"}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">🔍 Buscar por número de orden</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: "#6E98AF" }} />
                <input
                  type="text"
                  placeholder="Ej: ORD-2024-001..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm"
                  style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📊 Estado del pedido</label>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusFilter(!showStatusFilter)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm w-full justify-between"
                    style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getStatusIcon(statusFilter)}</span>
                      <span>{statusOptions.find(o => o.value === statusFilter)?.label || "Todos"}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 transform rotate-90" />
                  </button>
                  {showStatusFilter && (
                    <div className="absolute left-0 top-full mt-1 z-10 w-full rounded-xl border shadow-lg bg-white">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setStatusFilter(option.value);
                            setShowStatusFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center gap-2 ${statusFilter === option.value ? "bg-yellow-50" : ""
                            }`}
                          style={{ color: statusFilter === option.value ? "#FEDC00" : "#091A2D" }}
                        >
                          <span>{getStatusIcon(option.value)}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📅 Fecha desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📅 Fecha hasta</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                />
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 text-red-600 hover:bg-red-50 transition-all"
                >
                  <X className="h-3 w-3" />
                  Limpiar todos los filtros
                </button>
              </div>
            )}

            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "#D6D0C4" }}>
                <span className="text-xs text-gray-500">Filtros aplicados:</span>
                {searchTerm && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                    🔍 "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    {getStatusIcon(statusFilter)} {statusOptions.find(o => o.value === statusFilter)?.label}
                    <button onClick={() => setStatusFilter("all")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {startDate && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                    📅 Desde: {formatDisplayDate(startDate)}
                    <button onClick={() => setStartDate("")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {endDate && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                    📅 Hasta: {formatDisplayDate(endDate)}
                    <button onClick={() => setEndDate("")} className="hover:text-red-500">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Mostrando <strong className="text-gray-700">{filteredOrders.length}</strong> de <strong>{purchaseHistory.length}</strong> pedidos
        </p>
      </div>

      <div className="rounded-xl p-4 shadow-sm bg-white">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
          Historial de compras realizadas
        </h3>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay pedidos que coincidan con los filtros seleccionados</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="mt-3 text-sm text-yellow-600 underline">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const status = statusConfig[order.status];
              return (
                <div key={order.id} className="p-4 rounded-xl border hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-bold text-lg">{order.orderNumber}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Fecha: {order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>${order.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{order.paymentMethod} • {order.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="border-t border-b py-2 my-2">
                    <p className="text-xs text-gray-500 mb-1">Productos:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
                    <div className="flex gap-4 text-xs text-gray-500">
                      {order.trackingNumber && (
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Guía: {order.trackingNumber}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Entrega estimada: {order.estimatedDelivery}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(order)}
                        className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                        style={{ backgroundColor: "#F3F4F6", color: "#091A2D" }}
                      >
                        <Eye className="h-3 w-3" />
                        Ver detalles
                      </button>
                      {order.status === "shipped" && order.trackingNumber && (
                        <button
                          className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                          style={{ backgroundColor: PALETTE.sizzlingSunrise, color: "#091A2D" }}
                        >
                          <MapPinIcon className="h-3 w-3" />
                          Rastrear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowOrderDetail(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Detalles del pedido</h3>
              <button onClick={() => setShowOrderDetail(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Número de orden</p>
                  <p className="font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="font-semibold">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estado</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full inline-block ${statusConfig[selectedOrder.status]?.color}`}>
                    {statusConfig[selectedOrder.status]?.icon} {statusConfig[selectedOrder.status]?.label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-lg" style={{ color: PALETTE.maastrichtBlue }}>${selectedOrder.total.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Productos</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">Cantidad: {item.quantity} x ${item.unitPrice}</p>
                      </div>
                      <p className="font-semibold">${item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Información de envío</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-sm flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-gray-500" /> {selectedOrder.shippingAddress}</p>
                  {selectedOrder.trackingNumber && (
                    <p className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-gray-500" /> Número de seguimiento: {selectedOrder.trackingNumber}</p>
                  )}
                  <p className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> Entrega estimada: {selectedOrder.estimatedDelivery}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm mb-2">Seguimiento del pedido</p>
                <div className="relative">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 mb-4 last:mb-0">
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}>
                          {step.completed ? <Check className="h-4 w-4 text-white" /> : <ClockIcon className="h-4 w-4 text-white" />}
                        </div>
                        {idx < selectedOrder.timeline.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.status}</p>
                        <p className="text-xs text-gray-400">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// COMPONENTE DE RENTABILIDAD CON FILTROS AVANZADOS (VERSIÓN COMPLETA)
// Incluye: Filtro de fechas personalizadas, análisis por ubicación, gráficos por período
