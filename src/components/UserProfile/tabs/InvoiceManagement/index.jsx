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

export default function InvoiceManagementTab ({ credits, handlePayInvoice, PALETTE }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showSupplierNameFilter, setShowSupplierNameFilter] = useState(false);

  const uniqueSuppliers = ["all", ...new Set(credits.map(c => c.supplier))];

  const statusOptions = [
    { value: "all", label: "Todas", icon: null },
    { value: "active", label: "Activas", icon: "🟢" },
    { value: "overdue", label: "Vencidas", icon: "🔴" },
    { value: "paid", label: "Pagadas", icon: "✅" }
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== "all") count++;
    if (supplierFilter !== "all") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSupplierFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const getFilteredCredits = () => {
    let filtered = [...credits];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.invoiceNumber.toLowerCase().includes(term) ||
        c.supplier.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(c => c.debtAmount > 0 && !c.isOverdue);
      } else if (statusFilter === "overdue") {
        filtered = filtered.filter(c => c.isOverdue);
      } else if (statusFilter === "paid") {
        filtered = filtered.filter(c => c.debtAmount === 0);
      }
    }

    if (supplierFilter !== "all") {
      filtered = filtered.filter(c => c.supplier === supplierFilter);
    }

    if (startDate) {
      filtered = filtered.filter(c => {
        const dueDate = new Date(c.nextPayment.split('/').reverse().join('-'));
        const start = new Date(startDate);
        return dueDate >= start;
      });
    }

    if (endDate) {
      filtered = filtered.filter(c => {
        const dueDate = new Date(c.nextPayment.split('/').reverse().join('-'));
        const end = new Date(endDate);
        return dueDate <= end;
      });
    }

    return filtered;
  };

  const filteredCredits = getFilteredCredits();
  const activeFiltersCount = getActiveFiltersCount();

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    return dateStr;
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
              <label className="text-xs font-medium text-gray-600 mb-2 block">🔍 Buscar por factura o proveedor</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: "#6E98AF" }} />
                <input
                  type="text"
                  placeholder="Ej: F-2024-001 o Distribuidora Atlas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm"
                  style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📊 Estado</label>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusFilter(!showStatusFilter)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm w-full justify-between"
                    style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }}
                  >
                    <div className="flex items-center gap-2">
                      {statusOptions.find(o => o.value === statusFilter)?.icon}
                      <span>{statusOptions.find(o => o.value === statusFilter)?.label}</span>
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
                          <span>{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">🏢 Proveedor</label>
                <div className="relative">
                  <button
                    onClick={() => setShowSupplierNameFilter(!showSupplierNameFilter)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm w-full justify-between ${supplierFilter !== "all" ? "bg-yellow-50 border-yellow-400" : ""
                      }`}
                    style={{ borderColor: "#D6D0C4", backgroundColor: supplierFilter !== "all" ? "#FEFCE8" : "#FFFFFF" }}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{supplierFilter === "all" ? "Todos" : supplierFilter}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 transform rotate-90" />
                  </button>
                  {showSupplierNameFilter && (
                    <div className="absolute left-0 top-full mt-1 z-10 w-full rounded-xl border shadow-lg bg-white max-h-60 overflow-y-auto">
                      {uniqueSuppliers.map((supplier) => (
                        <button
                          key={supplier}
                          onClick={() => {
                            setSupplierFilter(supplier);
                            setShowSupplierNameFilter(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center justify-between ${supplierFilter === supplier ? "bg-yellow-50" : ""
                            }`}
                          style={{ color: supplierFilter === supplier ? "#FEDC00" : "#091A2D" }}
                        >
                          <span>{supplier === "all" ? "📋 Todos los proveedores" : `🏢 ${supplier}`}</span>
                          {supplier !== "all" && credits.filter(c => c.supplier === supplier).length > 0 && (
                            <span className="text-xs text-gray-400">({credits.filter(c => c.supplier === supplier).length})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📅 Vencimiento desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📅 Vencimiento hasta</label>
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
                    {statusOptions.find(o => o.value === statusFilter)?.icon} {statusOptions.find(o => o.value === statusFilter)?.label}
                    <button onClick={() => setStatusFilter("all")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {supplierFilter !== "all" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    🏢 {supplierFilter}
                    <button onClick={() => setSupplierFilter("all")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {startDate && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                    📅 Desde: {formatDisplayDate(startDate.split('-').reverse().join('/'))}
                    <button onClick={() => setStartDate("")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {endDate && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                    📅 Hasta: {formatDisplayDate(endDate.split('-').reverse().join('/'))}
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
          Mostrando <strong className="text-gray-700">{filteredCredits.length}</strong> de <strong>{credits.length}</strong> facturas
        </p>
        {filteredCredits.length === 0 && activeFiltersCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-yellow-600 underline">
            Limpiar filtros para ver todas
          </button>
        )}
      </div>

      <div className="rounded-xl p-4 shadow-sm bg-white">
        <h3 className="font-bold mb-4">Facturas abiertas</h3>

        {filteredCredits.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay facturas que coincidan con los filtros seleccionados</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="mt-3 text-sm text-yellow-600 underline">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCredits.map(credit => (
              <div key={credit.id} className="p-4 rounded-xl border hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <p className="font-bold text-lg">{credit.invoiceNumber}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${credit.isOverdue ? 'bg-red-100 text-red-600' :
                        credit.debtAmount === 0 ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {credit.isOverdue ? "🔴 VENCIDA" : credit.debtAmount === 0 ? "✅ PAGADA" : "🟢 ACTIVA"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {credit.supplier}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePayInvoice(credit.invoiceNumber)}
                    className="text-sm px-4 py-1.5 rounded-lg bg-yellow-400 font-semibold hover:bg-yellow-500 transition-colors"
                    disabled={credit.debtAmount === 0}
                    style={{ opacity: credit.debtAmount === 0 ? 0.5 : 1 }}
                  >
                    {credit.debtAmount === 0 ? "Pagada" : "Pagar"}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  <div className="text-center p-2 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-bold text-sm">${credit.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-green-50">
                    <p className="text-xs text-green-600">Pagado</p>
                    <p className="font-bold text-sm text-green-600">${credit.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-red-50">
                    <p className="text-xs text-red-600">Adeudado</p>
                    <p className="font-bold text-sm text-red-600">${credit.debtAmount.toLocaleString()}</p>
                  </div>
                </div>

                {credit.debtAmount > 0 && (
                  <div className="mt-3 pt-2 border-t flex justify-between items-center flex-wrap gap-2">
                    <p className="text-xs text-gray-500">
                      Próximo pago: {credit.nextPayment} - <strong>${credit.nextPaymentAmount}</strong>
                    </p>
                    {credit.daysUntilDue !== undefined && (
                      <p className={`text-xs ${credit.isOverdue ? 'text-red-600' : credit.daysUntilDue <= 5 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {credit.isOverdue
                          ? `⚠️ Vencida hace ${Math.abs(credit.daysUntilDue)} días`
                          : credit.daysUntilDue <= 5
                            ? `⏰ Vence en ${credit.daysUntilDue} días`
                            : `📅 Vence en ${credit.daysUntilDue} días`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeFiltersCount > 0 && filteredCredits.length > 0 && (
        <div className="rounded-xl p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-800">Resumen de búsqueda</p>
              <p className="text-xs text-blue-700 mt-1">
                Se encontraron {filteredCredits.length} factura(s) con los filtros aplicados.
                Deuda total filtrada: <strong>${filteredCredits.filter(c => c.debtAmount > 0).reduce((sum, c) => sum + c.debtAmount, 0).toLocaleString()}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// COMPONENTE DE HISTORIAL DE COMPRAS
