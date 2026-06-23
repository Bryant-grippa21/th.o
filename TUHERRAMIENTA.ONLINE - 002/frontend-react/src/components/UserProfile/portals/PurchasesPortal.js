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
  Info,
  ShoppingCart
} from "lucide-react";

import { KPICard, ProgressBar, AlertCard, SimulationCard } from "../components/shared";
import InvoiceManagementTab from "../tabs/InvoiceManagement";
import PurchaseHistoryTab from "../tabs/PurchaseHistory";

export default function PurchasesPortal({ userData, onBack, addToCartFromStore, cartCount = 0, onOpenCart, onViewProduct }) {
  const [activeTab, setActiveTab] = useState("store");
  const [showBlockSimulation, setShowBlockSimulation] = useState(false);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [showSupplierFilter, setShowSupplierFilter] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSupplierName, setSelectedSupplierName] = useState("all");
  const [showSupplierNameFilter, setShowSupplierNameFilter] = useState(false);
  const [storeSearchTerm, setStoreSearchTerm] = useState("");
  const [storeCategoryFilter, setStoreCategoryFilter] = useState("all");

  const PALETTE = {
    spaceCadet: "#1B3149",
    pastelGray: "#D6D0C4",
    crystalBlue: "#6E98AF",
    sizzlingSunrise: "#FEDC00",
    maastrichtBlue: "#091A2D",
    page: "#F3F1EC",
    white: "#FFFFFF",
  };

  const credits = [
    { id: 1, invoiceNumber: "F-2024-001", totalAmount: 15000, paidAmount: 8750, debtAmount: 6250, nextPayment: "15/04/2026", nextPaymentAmount: 450, isOverdue: false, supplier: "Distribuidora Atlas", daysUntilDue: 3 },
    { id: 2, invoiceNumber: "F-2024-002", totalAmount: 8000, paidAmount: 3200, debtAmount: 4800, nextPayment: "20/04/2026", nextPaymentAmount: 400, isOverdue: false, supplier: "Pinturas Mayor Pro", daysUntilDue: 8 },
    { id: 3, invoiceNumber: "F-2024-003", totalAmount: 5000, paidAmount: 0, debtAmount: 5000, nextPayment: "30/04/2026", nextPaymentAmount: 500, isOverdue: true, supplier: "FerreMax Detalle", daysUntilDue: -2 },
    { id: 4, invoiceNumber: "F-2024-004", totalAmount: 12000, paidAmount: 3000, debtAmount: 9000, nextPayment: "05/05/2026", nextPaymentAmount: 600, isOverdue: false, supplier: "Distribuidora Atlas", daysUntilDue: 13 }
  ];

  const totalCreditAmount = credits.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalPaid = credits.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalDebt = credits.reduce((sum, c) => sum + c.debtAmount, 0);
  const hasOverdue = credits.some(c => c.isOverdue);
  const overdueAmount = credits.filter(c => c.isOverdue).reduce((sum, c) => sum + c.debtAmount, 0);

  const paymentHistory = [
    { date: "10/03/2026", amount: 500, invoice: "F-2024-001", status: "Pagado" },
    { date: "25/03/2026", amount: 350, invoice: "F-2024-001", status: "Pagado" },
    { date: "05/03/2026", amount: 300, invoice: "F-2024-002", status: "Pagado" },
    { date: "15/02/2026", amount: 1000, invoice: "F-2024-001", status: "Pagado" },
    { date: "20/01/2026", amount: 500, invoice: "F-2024-003", status: "Pagado" }
  ];

  const avgPaymentDays = 12;
  const complianceRate = 85;
  const blocksCount = 1;
  const reinstatementAmount = 450;

  const blockHistory = [
    { date: "15/02/2026", reason: "Mora superior a 15 días", debtAmount: 1500, paidToReactivate: 450, daysBlocked: 3 }
  ];

  const mayoristaProducts = [
    { id: "m-1", name: "Juego de llaves combinadas 12 piezas", description: "Acero reforzado con estuche organizador para compras B2B.", category: "Ferretería general", price: 24.9, stock: 220, rating: 4.8, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80", sellerName: "Distribuidora Atlas", sellerRole: "MAYORISTA" },
    { id: "m-2", name: "Kit destornilladores magnéticos", description: "Puntas resistentes para reposición de inventario en tienda.", category: "Ferretería general", price: 17.25, stock: 310, rating: 4.3, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=80", sellerName: "Distribuidora Atlas", sellerRole: "MAYORISTA" },
    { id: "m-3", name: "Pintura caucho blanco galón", description: "Producto publicado por mayorista para detallistas.", category: "Pintura y acabados", price: 19.8, stock: 160, rating: 4.6, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80", sellerName: "Pinturas Mayor Pro", sellerRole: "MAYORISTA" },
    { id: "m-4", name: "Disco de corte metal 4 1/2 caja", description: "Caja para abastecimiento de ferreterías detallistas.", category: "Consumibles", price: 32.5, stock: 95, rating: 4.7, image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80", sellerName: "Materiales El Ávila", sellerRole: "MAYORISTA" },
    { id: "m-5", name: "Casco de seguridad por docena", description: "Presentación mayorista para reventa.", category: "Seguridad industrial", price: 126, stock: 48, rating: 4.5, image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80", sellerName: "Suministros Centro", sellerRole: "MAYORISTA" },
    { id: "m-6", name: "Guantes anticorte paquete x24", description: "Compra por volumen para portal de detallistas.", category: "Seguridad industrial", price: 86.4, stock: 72, rating: 4.9, image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1200&q=80", sellerName: "Suministros Centro", sellerRole: "MAYORISTA" }
  ];

  const storeCategories = ["all", ...new Set(mayoristaProducts.map((product) => product.category))];
  const filteredStoreProducts = mayoristaProducts.filter((product) => {
    const text = `${product.name} ${product.description} ${product.category} ${product.sellerName}`.toLowerCase();
    const matchesSearch = text.includes(storeSearchTerm.toLowerCase());
    const matchesCategory = storeCategoryFilter === "all" || product.category === storeCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddMayoristaProduct = (product) => {
    const normalizedProduct = {
      ...product,
      seller: product.sellerName,
      sellerType: "Mayorista",
      originalPrice: product.price,
      line: product.category,
      seller: product.sellerName,
      discount: 0,
    };

    if (addToCartFromStore) {
      addToCartFromStore(normalizedProduct, 1);
    } else {
      alert(`${product.name} agregado al carrito B2B.`);
    }
  };

  const handleViewMayoristaProduct = (product) => {
    const normalizedProduct = {
      ...product,
      line: product.category,
      seller: product.sellerName,
      sellerType: "Mayorista",
      originalPrice: product.price,
      discount: 0,
    };

    if (onViewProduct) {
      onViewProduct(normalizedProduct);
    }
  };

  const suppliersData = [
    { id: 1, name: "Distribuidora Atlas", totalPurchases: 15, totalAmount: 15680.50, pendingInvoices: [{ id: 1, invoiceNumber: "F-2024-001", amount: 6250, dueDate: "15/05/2026" }, { id: 2, invoiceNumber: "F-2024-004", amount: 9000, dueDate: "05/06/2026" }], paidInvoices: [{ id: 3, invoiceNumber: "F-2024-006", amount: 430.50, paidDate: "10/03/2026" }], totalDebt: 15250, totalPaid: 430.50, paymentStatus: "pending" },
    { id: 2, name: "Pinturas Mayor Pro", totalPurchases: 10, totalAmount: 7890.75, pendingInvoices: [{ id: 1, invoiceNumber: "F-2024-002", amount: 4800, dueDate: "20/05/2026" }], paidInvoices: [{ id: 2, invoiceNumber: "F-2024-007", amount: 1200.50, paidDate: "05/02/2026" }, { id: 3, invoiceNumber: "F-2024-008", amount: 890.25, paidDate: "15/03/2026" }], totalDebt: 4800, totalPaid: 2090.75, paymentStatus: "partial" },
    { id: 3, name: "FerreMax Detalle", totalPurchases: 8, totalAmount: 5240.00, pendingInvoices: [{ id: 1, invoiceNumber: "F-2024-003", amount: 5000, dueDate: "30/05/2026" }], paidInvoices: [{ id: 2, invoiceNumber: "F-2024-009", amount: 240.00, paidDate: "20/01/2026" }], totalDebt: 5000, totalPaid: 240.00, paymentStatus: "overdue" },
    { id: 4, name: "Ferretería Central", totalPurchases: 6, totalAmount: 12450.00, pendingInvoices: [], paidInvoices: [{ id: 1, invoiceNumber: "F-2024-005", amount: 3500, paidDate: "05/04/2026" }, { id: 2, invoiceNumber: "F-2024-010", amount: 8950.00, paidDate: "10/03/2026" }], totalDebt: 0, totalPaid: 12450.00, paymentStatus: "paid" },
    { id: 5, name: "Materiales El Ávila", totalPurchases: 4, totalAmount: 18900.00, pendingInvoices: [{ id: 1, invoiceNumber: "F-2024-011", amount: 8900, dueDate: "25/06/2026" }], paidInvoices: [{ id: 2, invoiceNumber: "F-2024-012", amount: 10000, paidDate: "15/02/2026" }], totalDebt: 8900, totalPaid: 10000.00, paymentStatus: "pending" },
  ];

  const filteredSuppliers = suppliersData.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase());
    const matchesFilter = supplierFilter === "all" || supplier.paymentStatus === supplierFilter;
    const matchesSupplierName = selectedSupplierName === "all" || supplier.name === selectedSupplierName;
    return matchesSearch && matchesFilter && matchesSupplierName;
  });

  const alerts = [
    { type: "danger", title: "⚠️ Pago vencido", message: "Factura F-2024-003 lleva 2 días de retraso. Paga hoy para evitar bloqueo.", action: true, actionText: "Pagar ahora" },
    { type: "warning", title: "Próximo vencimiento", message: "Factura F-2024-001 vence en 3 días. Monto: $450", action: true, actionText: "Programar pago" },
    { type: "info", title: "Riesgo de bloqueo", message: "Si no pagas la factura vencida en 5 días, serás bloqueado por 30 días.", action: true, actionText: "Simular" }
  ];

  const monthlyPurchases = suppliersData.reduce((sum, supplier) => sum + supplier.totalAmount, 0);
  const nextDueTotal = credits
    .filter((credit) => credit.debtAmount > 0 && credit.daysUntilDue <= 15)
    .reduce((sum, credit) => sum + credit.nextPaymentAmount, 0);
  const debtLevel = totalCreditAmount > 0 ? (totalDebt / totalCreditAmount) * 100 : 0;
  const paymentCapacity = 74;
  const currentStatus = hasOverdue
    ? "en_riesgo"
    : paymentCapacity < 45
    ? "bloqueado"
    : "al_dia";

  const tabs = [
    { id: "store", label: "Tienda mayorista", icon: Store },
    { id: "dashboard", label: "1. Resumen general", icon: LayoutDashboard },
    { id: "invoices", label: "2. Gestión de facturas", icon: CreditCard },
    { id: "alerts", label: "3. Alertas", icon: Bell },
    { id: "blockHistory", label: "4. Historial de bloqueos", icon: History },
    { id: "suppliers", label: "5. Proveedores", icon: Building2 },
    { id: "purchases", label: "Compras realizadas", icon: ShoppingBag }
  ];

  const handlePayInvoice = (invoiceNumber, supplierName = "") => {
    if (supplierName) {
      alert(`Iniciando pago de todas las facturas pendientes de ${supplierName}`);
    } else {
      alert(`Iniciando pago de factura ${invoiceNumber}`);
    }
  };

  const handleSimulateBlock = () => {
    setShowBlockSimulation(!showBlockSimulation);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
                <span>Cambiar portal</span>
              </button>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <p className="text-xs text-white/70">Portal de</p>
                <p className="text-sm font-semibold text-white">Compras realizadas B2B</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenCart}
                className="relative flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito</span>
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>
                    {cartCount}
                  </span>
                )}
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-white/60">Mi cuenta</p>
                <p className="text-sm font-semibold text-white">{userData.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6 lg:px-8">
        <div className="relative mb-6 overflow-hidden rounded-2xl" style={{ backgroundColor: PALETTE.spaceCadet }}>
          <div className="relative z-10 p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}>
                <CreditCard className="h-8 w-8" style={{ color: PALETTE.maastrichtBlue }} />
              </div>
              <div>
                <h1 className="text-xl font-bold">{userData.name}</h1>
                <p className="text-sm opacity-90">Dashboard de Compras realizadas • B2B</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`mb-5 p-3 rounded-xl flex items-center justify-between ${hasOverdue ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'}`}>
          <div className="flex items-center gap-2">
            {hasOverdue ? <AlertTriangle className="h-5 w-5 text-red-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
            <div>
              <p className="font-semibold text-sm">{hasOverdue ? "⚠️ Estado: En riesgo de bloqueo" : "✅ Estado: Al día"}</p>
              <p className="text-xs">{hasOverdue ? `Tienes $${overdueAmount.toLocaleString()} en pagos vencidos` : "Todos tus pagos están al corriente"}</p>
            </div>
          </div>
          {hasOverdue && (
            <button onClick={() => handlePayInvoice("vencidas")} className="text-xs px-3 py-1 rounded-lg bg-red-600 text-white font-semibold">
              Pagar vencidas
            </button>
          )}
        </div>

        <div className="mb-5 flex gap-1 border-b overflow-x-auto" style={{ borderColor: PALETTE.pastelGray }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "border-b-2" : "opacity-60 hover:opacity-100"
                }`}
              style={{
                borderColor: activeTab === tab.id ? PALETTE.sizzlingSunrise : "transparent",
                color: PALETTE.maastrichtBlue
              }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "store" && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 shadow-sm bg-white">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}>
                    <Store className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                    Tienda de productos mayoristas
                  </h3>
                  <p className="text-xs text-gray-500">Productos publicados por mayoristas para que el detallista compre desde su portal.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:w-[520px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: PALETTE.crystalBlue }} />
                    <input value={storeSearchTerm} onChange={(event) => setStoreSearchTerm(event.target.value)} placeholder="Buscar producto o mayorista" className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm" style={{ borderColor: PALETTE.pastelGray }} />
                  </div>
                  <select value={storeCategoryFilter} onChange={(event) => setStoreCategoryFilter(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="all">Todas las categorías</option>
                    {storeCategories.filter((category) => category !== "all").map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredStoreProducts.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-[1.5rem] border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ borderColor: PALETTE.pastelGray }}
                >
                  <div className="relative h-52 overflow-hidden" style={{ backgroundColor: PALETTE.pastelGray }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black uppercase tracking-wide" style={{ color: PALETTE.spaceCadet }}>
                      {product.category}
                    </span>
                    <span className="absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: PALETTE.spaceCadet }}>
                      {product.sellerName}
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: PALETTE.crystalBlue }}>Mayorista</p>
                      <h4 className="line-clamp-2 min-h-[3rem] text-lg font-black" style={{ color: PALETTE.maastrichtBlue }}>{product.name}</h4>
                      <p className="line-clamp-2 text-sm" style={{ color: PALETTE.spaceCadet }}>{product.description}</p>
                    </div>

                    <div className="flex items-center gap-1" style={{ color: PALETTE.sizzlingSunrise }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`h-4 w-4 ${index < Math.round(product.rating) ? "fill-current" : ""}`} />
                      ))}
                      <span className="ml-1 text-xs font-semibold" style={{ color: PALETTE.crystalBlue }}>{product.rating}</span>
                    </div>

                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium" style={{ color: PALETTE.crystalBlue }}>Precio B2B</p>
                        <p className="text-2xl font-black" style={{ color: PALETTE.maastrichtBlue }}>${product.price.toLocaleString()}</p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Stock: {product.stock}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => handleAddMayoristaProduct(product)}
                        className="rounded-full px-3 py-2 text-sm font-black transition hover:scale-[1.02]"
                        style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                      >
                        Agregar
                      </button>
                      <button
                        onClick={() => handleViewMayoristaProduct(product)}
                        className="rounded-full border px-3 py-2 text-sm font-black transition hover:scale-[1.02]"
                        style={{ borderColor: PALETTE.spaceCadet, color: PALETTE.spaceCadet }}
                      >
                        Ver producto
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredStoreProducts.length === 0 && (
              <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                <Package className="mx-auto mb-3 h-12 w-12 opacity-30" />
                No hay productos mayoristas que coincidan con los filtros.
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-5">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Compras del mes"
                value={`$${monthlyPurchases.toLocaleString()}`}
                icon={<ShoppingBag className="h-4 w-4" />}
                color={PALETTE.sizzlingSunrise}
              />
              <KPICard
                title="Crédito activo total"
                value={`$${totalDebt.toLocaleString()}`}
                icon={<CreditCard className="h-4 w-4" />}
                color={PALETTE.crystalBlue}
              />
              <KPICard
                title="Próximos vencimientos"
                value={`$${nextDueTotal.toLocaleString()}`}
                icon={<Calendar className="h-4 w-4" />}
                color="#F59E0B"
              />
              <KPICard
                title="Estado actual"
                value={
                  currentStatus === "al_dia"
                    ? "Al día"
                    : currentStatus === "en_riesgo"
                    ? "En riesgo"
                    : "Bloqueado"
                }
                icon={
                  currentStatus === "al_dia" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )
                }
                color={
                  currentStatus === "al_dia"
                    ? "#10B981"
                    : currentStatus === "en_riesgo"
                    ? "#F59E0B"
                    : "#EF4444"
                }
              />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-xl p-4 shadow-sm bg-white">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
                  Nivel de endeudamiento
                </h3>

                <div className="space-y-3">
                  <ProgressBar
                    value={debtLevel}
                    max={100}
                    color={debtLevel > 70 ? "#EF4444" : debtLevel > 45 ? "#F59E0B" : "#10B981"}
                    label={`${debtLevel.toFixed(1)}% de tu crédito sigue pendiente`}
                  />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Total financiado</p>
                      <p className="font-black">${totalCreditAmount.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="text-xs text-red-600">Deuda pendiente</p>
                      <p className="font-black text-red-600">${totalDebt.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="text-xs text-green-600">Monto pagado</p>
                      <p className="font-black text-green-600">${totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-3">
                      <p className="text-xs text-yellow-700">Próximo pago</p>
                      <p className="font-black text-yellow-700">${credits.reduce((sum, c) => sum + c.nextPaymentAmount, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4 shadow-sm bg-white">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
                  Capacidad de pago
                </h3>

                <div className="space-y-3">
                  <ProgressBar
                    value={paymentCapacity}
                    max={100}
                    color={paymentCapacity >= 70 ? "#10B981" : paymentCapacity >= 45 ? "#F59E0B" : "#EF4444"}
                    label={`${paymentCapacity}% de capacidad estimada para próximos pagos`}
                  />

                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-sm font-semibold text-blue-800">
                      Insight TH.O
                    </p>
                    <p className="mt-1 text-xs text-blue-700">
                      Mantén tus pagos antes del vencimiento para evitar bloqueos y mejorar tus condiciones de compra B2B.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-green-50 p-2">
                      <p className="font-black text-green-700">{complianceRate}%</p>
                      <p className="text-gray-500">Cumplimiento</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-2">
                      <p className="font-black text-yellow-700">{avgPaymentDays}</p>
                      <p className="text-gray-500">Días prom.</p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2">
                      <p className="font-black text-red-700">{blocksCount}</p>
                      <p className="text-gray-500">Bloqueos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 shadow-sm bg-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
                Próximos vencimientos
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {credits.filter(c => c.debtAmount > 0).map(credit => (
                  <div key={credit.id} className="flex justify-between items-center p-3 rounded-xl border">
                    <div>
                      <p className="font-medium text-sm">Factura {credit.invoiceNumber}</p>
                      <p className="text-xs text-gray-500">{credit.supplier}</p>
                      <p className={`text-xs ${credit.isOverdue ? 'text-red-600' : credit.daysUntilDue <= 5 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {credit.isOverdue ? `Vencida hace ${Math.abs(credit.daysUntilDue)} días` : `Vence en ${credit.daysUntilDue} días`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${credit.nextPaymentAmount}</p>
                      <button onClick={() => handlePayInvoice(credit.invoiceNumber)} className="text-xs px-2 py-1 rounded mt-1 bg-yellow-400 font-semibold">
                        Pagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "invoices" && (
          <InvoiceManagementTab credits={credits} handlePayInvoice={handlePayInvoice} PALETTE={PALETTE} />
        )}

        {activeTab === "purchases" && (
          <PurchaseHistoryTab PALETTE={PALETTE} />
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <KPICard title="Vencidas" value={credits.filter(c => c.isOverdue).length} icon={<AlertTriangle className="h-4 w-4" />} color="#EF4444" />
              <KPICard title="Por vencer" value={credits.filter(c => !c.isOverdue && c.daysUntilDue <= 5).length} icon={<ClockIcon className="h-4 w-4" />} color="#F59E0B" />
              <KPICard title="Riesgo bloqueo" value={hasOverdue ? "Alto" : "Bajo"} icon={<Ban className="h-4 w-4" />} color={hasOverdue ? "#EF4444" : "#10B981"} />
              <KPICard title="Monto vencido" value={`$${overdueAmount.toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} color="#EF4444" />
            </div>

            {alerts.map((alert, idx) => (
              <AlertCard
                key={idx}
                type={alert.type}
                title={alert.title}
                message={alert.message}
                action={alert.action}
                actionText={alert.actionText}
                onAction={alert.actionText === "Simular" ? handleSimulateBlock : () => handlePayInvoice("vencidas")}
              />
            ))}

            <SimulationCard
              title="Simulación de bloqueo"
              message="Calcula qué pasará si no pagas a tiempo."
              buttonText={showBlockSimulation ? "Ocultar simulación" : "Simular riesgo"}
              onSimulate={handleSimulateBlock}
            />

            {showBlockSimulation && (
              <div className="rounded-xl p-4 shadow-sm bg-white border-l-4 border-red-500">
                <h4 className="font-semibold text-sm mb-3 text-red-600">⚠️ Si no pagas a tiempo</h4>
                <div className="space-y-2 text-sm">
                  <p>• Si no pagas <strong>${overdueAmount.toLocaleString()}</strong>, el sistema puede bloquear tus compras B2B en <strong>5 días</strong>.</p>
                  <p>• Para reinsertarte deberás pagar la deuda vencida y un <strong>30%</strong> adicional.</p>
                  <p>• Costo estimado de reinserción: <strong>${(overdueAmount * 1.3).toLocaleString()}</strong>.</p>
                  <button onClick={() => handlePayInvoice("vencidas")} className="mt-2 w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">
                    Pagar ahora y evitar bloqueo
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl p-4 shadow-sm bg-white">
              <h3 className="font-bold mb-3">Educación financiera TH.O</h3>
              <div className="p-3 rounded-lg bg-blue-50">
                <p className="text-sm font-semibold text-blue-800">📘 Disciplina financiera</p>
                <p className="text-xs text-blue-700 mt-1">
                  Pagar antes del vencimiento mejora tu perfil, evita bloqueos y te permite acceder a mejores condiciones con mayoristas.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "blockHistory" && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 shadow-sm bg-white">
              <h3 className="font-bold mb-3">Historial de bloqueos</h3>
              {blockHistory.length > 0 ? (
                <div className="space-y-3">
                  {blockHistory.map((block, idx) => (
                    <div key={idx} className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm">Bloqueo del {block.date}</p>
                        <span className="text-xs text-red-600">{block.daysBlocked} días bloqueado</span>
                      </div>
                      <p className="text-xs mt-1">Motivo: {block.reason}</p>
                      <p className="text-xs">Deuda al momento: ${block.debtAmount}</p>
                      <p className="text-xs font-semibold text-red-600">Pagaste para reactivarte: ${block.paidToReactivate} (30% de la deuda)</p>
                      <p className="text-xs text-gray-500 mt-2">Impacto financiero: Perdiste {block.daysBlocked} días de ventas a crédito</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No tienes bloqueos registrados</p>
              )}
            </div>

            <div className="rounded-xl p-4 shadow-sm bg-white">
              <h3 className="font-bold mb-3">Impacto financiero de bloqueos</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <p className="text-2xl font-bold text-red-600">${reinstatementAmount}</p>
                  <p className="text-xs text-gray-600">Total pagado en reinserciones (30%)</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 text-center">
                  <p className="text-2xl font-bold text-yellow-600">{blocksCount}</p>
                  <p className="text-xs text-gray-600">Número de bloqueos</p>
                </div>
              </div>
              <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  {blocksCount > 0
                    ? "⚠️ Cada bloqueo afecta tu historial crediticio. Mantén tus pagos al día para evitar futuros bloqueos y acceder a mejores condiciones."
                    : "✅ Excelente! No tienes bloqueos. Mantén este comportamiento para seguir accediendo a crédito."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "suppliers" && (
          <div className="rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="p-4 border-b">
              <h3 className="font-bold">Análisis de proveedores</h3>
            </div>

            <div className="p-4 border-b" style={{ borderColor: "#D6D0C4" }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: "#6E98AF" }} />
                  <input
                    type="text"
                    placeholder="Buscar proveedor por nombre..."
                    value={supplierSearchTerm}
                    onChange={(e) => {
                      setSupplierSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm"
                    style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }}
                  />

                  {showSuggestions && supplierSearchTerm.trim() !== "" && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl border shadow-lg bg-white max-h-60 overflow-y-auto">
                      {suppliersData.filter(supplier => supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())).slice(0, 8).map(supplier => (
                        <button key={supplier.id} onClick={() => { setSupplierSearchTerm(supplier.name); setShowSuggestions(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center justify-between">
                          <div><p className="text-sm font-medium">{supplier.name}</p><p className="text-xs text-gray-500">{supplier.totalPurchases} compras · ${supplier.totalAmount.toLocaleString()}</p></div>
                          <div className={`px-2 py-0.5 rounded-full text-xs ${supplier.paymentStatus === "paid" ? "bg-green-100 text-green-700" : supplier.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-700" : supplier.paymentStatus === "overdue" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                            {supplier.paymentStatus === "paid" ? "Pagado" : supplier.paymentStatus === "partial" ? "Pago parcial" : supplier.paymentStatus === "overdue" ? "Vencido" : "Pendiente"}
                          </div>
                        </button>
                      ))}
                      {suppliersData.filter(s => s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())).length === 0 && (<div className="px-4 py-3 text-sm text-gray-500 text-center">No se encontraron proveedores</div>)}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowSupplierFilter(!showSupplierFilter)} className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm whitespace-nowrap" style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }}>
                    <Filter className="h-4 w-4" />
                    {supplierFilter === "all" ? "Todos los estados" : supplierFilter === "paid" ? "✓ Pagado" : supplierFilter === "partial" ? "⚠️ Pago parcial" : supplierFilter === "pending" ? "⏳ Pendiente" : "❗ Vencido"}
                    {supplierFilter !== "all" && (<span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-yellow-400 text-black">1</span>)}
                  </button>
                  {showSupplierFilter && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-48 rounded-xl border shadow-lg bg-white">
                      {[{ value: "all", label: "Todos los estados", icon: null }, { value: "paid", label: "✓ Pagado", icon: "✅" }, { value: "partial", label: "⚠️ Pago parcial", icon: "⚠️" }, { value: "pending", label: "⏳ Pendiente", icon: "⏳" }, { value: "overdue", label: "❗ Vencido", icon: "❗" }].map((option) => (
                        <button key={option.value} onClick={() => { setSupplierFilter(option.value); setShowSupplierFilter(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl flex items-center gap-2 ${supplierFilter === option.value ? "bg-yellow-50" : ""}`} style={{ color: supplierFilter === option.value ? "#FEDC00" : "#091A2D" }}>
                          <span>{option.icon}</span>{option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setShowSupplierNameFilter(!showSupplierNameFilter)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm whitespace-nowrap ${selectedSupplierName !== "all" ? "bg-yellow-50 border-yellow-400" : ""}`} style={{ borderColor: "#D6D0C4", backgroundColor: selectedSupplierName !== "all" ? "#FEFCE8" : "#FFFFFF" }}>
                    <Building2 className="h-4 w-4" />
                    {selectedSupplierName === "all" ? "Todos los proveedores" : selectedSupplierName}
                    {selectedSupplierName !== "all" && (<span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-yellow-400 text-black">1</span>)}
                  </button>
                  {showSupplierNameFilter && (
                    <div className="absolute right-0 top-full mt-1 z-10 w-64 rounded-xl border shadow-lg bg-white max-h-80 overflow-y-auto">
                      <button onClick={() => { setSelectedSupplierName("all"); setShowSupplierNameFilter(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-xl flex items-center gap-2 ${selectedSupplierName === "all" ? "bg-yellow-50" : ""}`} style={{ color: selectedSupplierName === "all" ? "#FEDC00" : "#091A2D" }}>
                        <span>📋</span>Todos los proveedores
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      {suppliersData.map((supplier) => (
                        <button key={supplier.id} onClick={() => { setSelectedSupplierName(supplier.name); setShowSupplierNameFilter(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${selectedSupplierName === supplier.name ? "bg-yellow-50" : ""}`} style={{ color: selectedSupplierName === supplier.name ? "#FEDC00" : "#091A2D" }}>
                          <div className="flex items-center gap-2"><span>🏢</span><div><p className="text-sm">{supplier.name}</p><p className="text-xs text-gray-400">{supplier.totalPurchases} compras · ${supplier.totalAmount.toLocaleString()}</p></div></div>
                          {supplier.totalDebt > 0 && (<span className="text-xs text-red-500">${supplier.totalDebt.toLocaleString()}</span>)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {(supplierSearchTerm || supplierFilter !== "all" || selectedSupplierName !== "all") && (
                  <button onClick={() => { setSupplierSearchTerm(""); setSupplierFilter("all"); setSelectedSupplierName("all"); setShowSuggestions(false); }} className="px-4 py-2 rounded-xl text-sm border border-gray-300 hover:bg-gray-50 whitespace-nowrap">
                    Limpiar todos los filtros
                  </button>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500 flex justify-between items-center flex-wrap gap-2">
                <span>{filteredSuppliers.length} proveedor(es) encontrado(s)</span>
                <div className="flex gap-3">
                  {supplierSearchTerm && (<span className="text-yellow-600">🔍 "{supplierSearchTerm}"</span>)}
                  {selectedSupplierName !== "all" && (<span className="text-blue-600">🏢 Mostrando solo: {selectedSupplierName}</span>)}
                </div>
              </div>
            </div>

            <div className="divide-y">
              {filteredSuppliers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No se encontraron proveedores que coincidan con los filtros</p>
                  <button onClick={() => { setSupplierSearchTerm(""); setSupplierFilter("all"); setSelectedSupplierName("all"); }} className="mt-3 text-sm text-yellow-600 underline">Limpiar todos los filtros</button>
                </div>
              ) : (
                filteredSuppliers.map(supplier => (
                  <div key={supplier.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-base">{supplier.name}</p>
                        <p className="text-xs text-gray-500">{supplier.totalPurchases} compras · Total: ${supplier.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Condición: {supplier.paymentStatus === "paid" ? "contado / crédito limpio" : supplier.paymentStatus === "partial" ? "crédito parcial" : supplier.paymentStatus === "overdue" ? "crédito en riesgo" : "crédito abierto"}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${supplier.paymentStatus === "paid" ? "bg-green-100 text-green-700" : supplier.paymentStatus === "partial" ? "bg-yellow-100 text-yellow-700" : supplier.paymentStatus === "overdue" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                        {supplier.paymentStatus === "paid" ? "✓ Pagado" : supplier.paymentStatus === "partial" ? "⚠️ Pago parcial" : supplier.paymentStatus === "overdue" ? "❗ Vencido" : "⏳ Pendiente"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${supplier.totalDebt > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className="text-xs text-red-600">Monto adeudado</p>
                        <p className={`text-lg font-bold ${supplier.totalDebt > 0 ? 'text-red-600' : 'text-green-600'}`}>${supplier.totalDebt.toLocaleString()}</p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <p className="text-xs text-blue-600">Precio promedio vs mercado</p>
                        <p className="text-sm font-bold text-blue-700">
                          {supplier.id % 2 === 0 ? "3.5% más barato" : "2.1% más alto"}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-yellow-50">
                        <p className="text-xs text-yellow-700">Frecuencia de compra</p>
                        <p className="text-sm font-bold text-yellow-700">
                          {supplier.totalPurchases >= 10 ? "Alta" : "Media"}
                        </p>
                      </div>
                    </div>

                    {supplier.pendingInvoices.length > 0 && (<p className="text-xs text-red-500 mt-1">{supplier.pendingInvoices.length} factura(s) pendiente(s)</p>)}
                        {supplier.totalDebt === 0 && (<p className="text-xs text-green-500 mt-1">✓ Sin deuda pendiente</p>)}
                      </div>
                      <div className="p-2 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-600">Monto pagado</p>
                        <p className="text-lg font-bold text-green-600">${supplier.totalPaid.toLocaleString()}</p>
                      </div>
                    </div>

                    {supplier.pendingInvoices.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" />Facturas pendientes ({supplier.pendingInvoices.length})</p>
                        <div className="space-y-1.5">
                          {supplier.pendingInvoices.map(invoice => (
                            <div key={invoice.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                              <div><p className="text-xs font-medium">{invoice.invoiceNumber}</p><p className="text-xs text-gray-500">Vence: {invoice.dueDate}</p></div>
                              <div className="flex items-center gap-2"><p className="text-sm font-bold text-red-600">${invoice.amount.toLocaleString()}</p><button onClick={() => handlePayInvoice(invoice.invoiceNumber)} className="text-xs px-2 py-1 rounded-lg bg-yellow-400">Pagar</button></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {supplier.paidInvoices.length > 0 && (
                      <div><p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" />Facturas pagadas ({supplier.paidInvoices.length})</p>
                        <div className="space-y-1">
                          {supplier.paidInvoices.map(invoice => (
                            <div key={invoice.id} className="flex justify-between items-center p-1.5"><div><p className="text-xs">{invoice.invoiceNumber}</p><p className="text-xs text-gray-400">Pagado: {invoice.paidDate}</p></div><p className="text-xs text-green-600">${invoice.amount.toLocaleString()}</p></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {supplier.totalDebt > 0 && (<button onClick={() => handlePayInvoice("todas", supplier.name)} className="w-full mt-3 text-center text-sm font-semibold py-2 rounded-lg bg-yellow-400">Pagar todas las facturas pendientes (${supplier.totalDebt.toLocaleString()})</button>)}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
