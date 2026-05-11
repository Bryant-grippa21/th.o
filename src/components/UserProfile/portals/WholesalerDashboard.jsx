import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Gauge,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  PackageOpen,
  SlidersHorizontal,
  Receipt,
  Search,
  Shield,
  ShoppingBag,
  Store,
  TrendingUp,
  Users,
  Wallet,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trophy,
  Truck,
  X,
} from "lucide-react";

const PALETTE = {
  spaceCadet: "#1B3149",
  pastelGray: "#D6D0C4",
  crystalBlue: "#6E98AF",
  sizzlingSunrise: "#FEDC00",
  maastrichtBlue: "#091A2D",
  page: "#F3F1EC",
  white: "#FFFFFF",
  softBorder: "rgba(9,26,45,0.10)",
  success: "#0F766E",
  warning: "#F59E0B",
  danger: "#B42318",
};

const formatUSD = (value) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

function KPICard({ title, value, subtitle, icon, color = PALETTE.sizzlingSunrise, trend, tone = "neutral" }) {
  const toneMap = {
    neutral: "bg-white",
    success: "bg-green-50",
    warning: "bg-yellow-50",
    danger: "bg-red-50",
    info: "bg-blue-50",
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${toneMap[tone] || toneMap.neutral}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="rounded-xl p-2" style={{ backgroundColor: `${color}18`, color }}>
          {icon}
        </div>
        {trend && (
          <span className={`rounded-full px-2 py-1 text-xs font-bold ${trend.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black" style={{ color: PALETTE.maastrichtBlue }}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: PALETTE.crystalBlue }}>{title}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-600">{label}</span>
          <span className="font-bold">{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function AlertCard({ type = "info", title, message }) {
  const styles = {
    info: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    warning: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    danger: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
    success: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" },
  };
  const color = styles[type] || styles.info;

  return (
    <div className="rounded-xl border-l-4 p-3" style={{ backgroundColor: color.bg, borderLeftColor: color.border }}>
      <p className="text-sm font-bold" style={{ color: color.text }}>{title}</p>
      <p className="mt-1 text-xs" style={{ color: color.text }}>{message}</p>
    </div>
  );
}

function SectionCard({ title, icon, children, action }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-black" style={{ color: PALETTE.maastrichtBlue }}>
          {icon}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function RiskPill({ risk }) {
  const config = {
    low: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };
  const label = { low: "Bajo", medium: "Medio", high: "Alto" }[risk] || "Medio";
  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${config[risk] || config.medium}`}>Riesgo {label}</span>;
}

export default function WholesalerDashboard({ userData = {}, onBack, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSalesTab, setActiveSalesTab] = useState("volume");
  const [timeRange, setTimeRange] = useState("month");
  const [salesProductFilter, setSalesProductFilter] = useState("all");
  const [salesCategoryFilter, setSalesCategoryFilter] = useState("all");
  const [salesRegionFilter, setSalesRegionFilter] = useState("all");
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [selectedClientName, setSelectedClientName] = useState("all");
  const [showInvoiceFilters, setShowInvoiceFilters] = useState(true);
  const [productSort, setProductSort] = useState("mostSold");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [receivedOrders, setReceivedOrders] = useState([
    {
      id: 1,
      productName: "Taladro percutor industrial",
      buyer: "Ferretería El Constructor",
      buyerType: "Detallista",
      quantity: 10,
      offeredPrice: 8500,
      status: "pending",
      date: "2026-05-03",
      message: "Necesito 10 unidades para reposición semanal.",
    },
    {
      id: 2,
      productName: "Juego de llaves combinadas",
      buyer: "Pinturas del Centro",
      buyerType: "Detallista",
      quantity: 18,
      offeredPrice: 1250,
      status: "pending",
      date: "2026-05-04",
      message: "Compra recurrente para sucursal Caracas.",
    },
  ]);
  const [orderHistory, setOrderHistory] = useState([
    { id: 101, productName: "Casco de seguridad premium", buyer: "Ferretería Central", quantity: 20, totalAmount: 10000, status: "completed", date: "2026-04-29" },
    { id: 102, productName: "Cinta métrica láser", buyer: "Materiales El Ávila", quantity: 15, totalAmount: 8900, status: "completed", date: "2026-04-27" },
  ]);

  const productsData = [
    { id: 1, name: "Taladro percutor industrial", unitsSold: 1245, revenue: 112050, cost: 72832, margin: 39218, marginPercent: 35.0, category: "Herramientas eléctricas", region: "Centro", stock: 220, turnoverDays: 18, stockoutRisk: "low", lowRotation: false, sellerOrigin: "TH.O", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Juego de llaves combinadas", unitsSold: 2340, revenue: 58266, cost: 33794, margin: 24472, marginPercent: 42.0, category: "Herramientas manuales", region: "Norte", stock: 80, turnoverDays: 12, stockoutRisk: "medium", lowRotation: false, sellerOrigin: "Vendedor", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Casco de seguridad premium", unitsSold: 1870, revenue: 37400, cost: 23188, margin: 14212, marginPercent: 38.0, category: "Equipo de protección", region: "Sur", stock: 35, turnoverDays: 9, stockoutRisk: "high", lowRotation: false, sellerOrigin: "TH.O", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80" },
    { id: 4, name: "Esmeril angular profesional", unitsSold: 890, revenue: 66750, cost: 45390, margin: 21360, marginPercent: 32.0, category: "Herramientas eléctricas", region: "Oeste", stock: 145, turnoverDays: 31, stockoutRisk: "low", lowRotation: false, sellerOrigin: "Vendedor", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Cinta métrica láser", unitsSold: 260, revenue: 42000, cost: 23100, margin: 18900, marginPercent: 45.0, category: "Herramientas de medición", region: "Centro", stock: 420, turnoverDays: 74, stockoutRisk: "low", lowRotation: true, sellerOrigin: "TH.O", image: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?auto=format&fit=crop&w=300&q=80" },
  ];

  const clients = [
    {
      id: 1,
      name: "Ferretería El Constructor",
      totalPurchases: 12,
      totalAmount: 125680,
      invoiceTotal: 20100,
      pendingAmount: 15600,
      paidAmount: 4500,
      invoiceCreatedAt: "2026-05-01",
      invoiceDueAt: "2026-05-30",
      nextPaymentAt: "2026-05-15",
      paymentStatus: "pending",
      risk: "medium",
      daysOverdue: 0,
      blocks: 0,
      frequency: "Semanal",
      type: "Recurrente",
      region: "Valencia",
      thoGenerated: true,
    },
    {
      id: 2,
      name: "Pinturas del Centro",
      totalPurchases: 8,
      totalAmount: 78900,
      invoiceTotal: 18100,
      pendingAmount: 12500,
      paidAmount: 5600,
      invoiceCreatedAt: "2026-05-04",
      invoiceDueAt: "2026-06-02",
      nextPaymentAt: "2026-05-18",
      paymentStatus: "partial",
      risk: "medium",
      daysOverdue: 0,
      blocks: 1,
      frequency: "Quincenal",
      type: "Reactivado",
      region: "Caracas",
      thoGenerated: false,
    },
    {
      id: 3,
      name: "FerreNova Retail",
      totalPurchases: 6,
      totalAmount: 52340,
      invoiceTotal: 11650,
      pendingAmount: 8450,
      paidAmount: 3200,
      invoiceCreatedAt: "2026-03-07",
      invoiceDueAt: "2026-04-05",
      nextPaymentAt: "Vencido",
      paymentStatus: "overdue",
      risk: "high",
      daysOverdue: 12,
      blocks: 2,
      frequency: "Mensual",
      type: "Recurrente",
      region: "Maracaibo",
      thoGenerated: true,
    },
    {
      id: 4,
      name: "Construcciones Delta",
      totalPurchases: 5,
      totalAmount: 90000,
      invoiceTotal: 25000,
      pendingAmount: 0,
      paidAmount: 25000,
      invoiceCreatedAt: "2026-04-10",
      invoiceDueAt: "2026-05-09",
      nextPaymentAt: "Pagada",
      paymentStatus: "paid",
      risk: "low",
      daysOverdue: 0,
      blocks: 0,
      frequency: "Mensual",
      type: "Nuevo",
      region: "Barquisimeto",
      thoGenerated: false,
    },
    {
      id: 5,
      name: "Materiales El Ávila",
      totalPurchases: 4,
      totalAmount: 45000,
      invoiceTotal: 20900,
      pendingAmount: 8900,
      paidAmount: 12000,
      invoiceCreatedAt: "2026-05-27",
      invoiceDueAt: "2026-06-25",
      nextPaymentAt: "2026-06-10",
      paymentStatus: "pending",
      risk: "medium",
      daysOverdue: 0,
      blocks: 0,
      frequency: "Quincenal",
      type: "Nuevo",
      region: "Caracas",
      thoGenerated: true,
    },
  ];

  const invoices = [
    { id: 101, client: "Ferretería El Constructor", invoiceNumber: "FAC-2026-001", amount: 15600, dueDate: "2026-05-15", status: "pending", coveredByTHO: false, coverageHours: 0 },
    { id: 201, client: "Pinturas del Centro", invoiceNumber: "FAC-2026-006", amount: 12500, dueDate: "2026-05-20", status: "pending", coveredByTHO: false, coverageHours: 0 },
    { id: 301, client: "FerreNova Retail", invoiceNumber: "FAC-2026-010", amount: 8450, dueDate: "2026-04-05", status: "overdue", coveredByTHO: true, coverageHours: 18 },
    { id: 501, client: "Materiales El Ávila", invoiceNumber: "FAC-2026-016", amount: 8900, dueDate: "2026-06-25", status: "pending", coveredByTHO: false, coverageHours: 0 },
    { id: 601, client: "Ferretería Central", invoiceNumber: "FAC-2026-020", amount: 12500, dueDate: "2026-04-29", status: "covered", coveredByTHO: true, coverageHours: 22 },
  ];

  const collectionFlow = [
    { date: "2026-05-04", expected: 12500, real: 34500 },
    { date: "2026-05-05", expected: 8900, real: 7200 },
    { date: "2026-05-06", expected: 15600, real: 0 },
    { date: "2026-05-07", expected: 7200, real: 0 },
    { date: "2026-05-08", expected: 23400, real: 0 },
  ];

  const discipline = {
    blockedClients: 7,
    reinstatements: 3,
    avgOverdueDays: 11.8,
    disciplinedPercent: 82,
    sanctionedPercent: 18,
    clients: [
      { name: "FerreNova Retail", status: "Bloqueado", overdueDays: 12, recoveryPayment: 34, action: "Puede reincorporarse" },
      { name: "Pinturas del Centro", status: "Observación", overdueDays: 5, recoveryPayment: 18, action: "Monitorear" },
      { name: "Materiales El Ávila", status: "Disciplinado", overdueDays: 0, recoveryPayment: 0, action: "Mantener" },
    ],
  };

  const salesByPeriod = [
    { label: "Día", amount: 12500 },
    { label: "Semana", amount: 78450 },
    { label: "Mes", amount: 245800 },
  ];

  const salesRegions = ["Centro", "Norte", "Sur", "Este", "Oeste"];

  const selectedRangeLabel =
    timeRange === "day" ? "Día" : timeRange === "week" ? "Semana" : "Mes";

  const selectedRangeDate =
    timeRange === "day"
      ? "04/05/2026"
      : timeRange === "week"
      ? "Semana del 04/05/2026 al 10/05/2026"
      : "Mayo 2026";

  const salesVolumeRows = productsData.flatMap((product) => {
    const dayFactor = product.sellerOrigin === "TH.O" ? 0.08 : 0.05;
    const weekFactor = product.sellerOrigin === "TH.O" ? 0.34 : 0.28;

    const baseAmount =
      timeRange === "day"
        ? Math.round(product.revenue * dayFactor)
        : timeRange === "week"
        ? Math.round(product.revenue * weekFactor)
        : product.revenue;

    const baseUnits =
      timeRange === "day"
        ? Math.round(product.unitsSold * dayFactor)
        : timeRange === "week"
        ? Math.round(product.unitsSold * weekFactor)
        : product.unitsSold;

    const regionWeights = [0.32, 0.24, 0.18, 0.14, 0.12];

    return salesRegions.map((region, index) => ({
      ...product,
      region,
      salesAmount: Math.round(baseAmount * regionWeights[index]),
      salesUnits: Math.round(baseUnits * regionWeights[index]),
    }));
  });

  const filteredSalesVolumeBaseRows = salesVolumeRows.filter((row) => {
    const matchesProduct = salesProductFilter === "all" || row.name === salesProductFilter;
    const matchesCategory = salesCategoryFilter === "all" || row.category === salesCategoryFilter;
    const matchesRegion = salesRegionFilter === "all" || row.region === salesRegionFilter;

    return matchesProduct && matchesCategory && matchesRegion;
  });

  const filteredSalesVolumeRows =
    salesRegionFilter === "all"
      ? productsData
          .filter((product) => {
            const matchesProduct = salesProductFilter === "all" || product.name === salesProductFilter;
            const matchesCategory = salesCategoryFilter === "all" || product.category === salesCategoryFilter;

            return matchesProduct && matchesCategory;
          })
          .map((product) => {
            const productRows = salesVolumeRows.filter((row) => row.id === product.id);

            return {
              ...product,
              region: "Todas las regiones",
              salesAmount: productRows.reduce((sum, row) => sum + row.salesAmount, 0),
              salesUnits: productRows.reduce((sum, row) => sum + row.salesUnits, 0),
            };
          })
      : filteredSalesVolumeBaseRows;

  const salesVolumeTotal = filteredSalesVolumeRows.reduce((sum, row) => sum + row.salesAmount, 0);
  const salesUnitsTotal = filteredSalesVolumeRows.reduce((sum, row) => sum + row.salesUnits, 0);

  const summary = useMemo(() => {
    const monthlySales = productsData.reduce((sum, product) => sum + product.revenue, 0);
    const activeInvoicing = invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.amount, 0);
    const riskyInvoices = invoices.filter((invoice) => invoice.status === "overdue" || invoice.status === "covered").reduce((sum, invoice) => sum + invoice.amount, 0);
    const covered = invoices.filter((invoice) => invoice.coveredByTHO).reduce((sum, invoice) => sum + invoice.amount, 0);
    const collectedToday = collectionFlow[0]?.real || 0;
    const activeOrders = receivedOrders.filter((order) => order.status === "pending").length;
    const ticketAverage = monthlySales / Math.max(orderHistory.length + receivedOrders.length, 1);
    const thoSales = productsData.filter((product) => product.sellerOrigin === "TH.O").reduce((sum, product) => sum + product.revenue, 0);

    return {
      monthlySales,
      weeklySales: 78450,
      dailySales: 12500,
      activeInvoicing,
      riskyInvoices,
      riskPercent: activeInvoicing > 0 ? (riskyInvoices / activeInvoicing) * 100 : 0,
      covered,
      collectedToday,
      activeOrders,
      ticketAverage,
      thoSalesPercent: monthlySales > 0 ? (thoSales / monthlySales) * 100 : 0,
      expectedCashflow: collectionFlow.reduce((sum, item) => sum + item.expected, 0),
      realCashflow: collectionFlow.reduce((sum, item) => sum + item.real, 0),
      avgCoverageHours: 20,
    };
  }, [invoices, productsData, collectionFlow, orderHistory.length, receivedOrders]);

  const filteredClients = clients.filter((client) => {
    const matchesSearch = !invoiceSearchTerm || client.name.toLowerCase().includes(invoiceSearchTerm.toLowerCase());
    const matchesStatus = invoiceStatusFilter === "all" || client.paymentStatus === invoiceStatusFilter || (invoiceStatusFilter === "risk" && ["medium", "high"].includes(client.risk));
    const matchesClient = selectedClientName === "all" || client.name === selectedClientName;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const filteredInventoryProducts = [...productsData]
    .filter((product) => {
      if (productStatusFilter === "lowRotation") {
        return product.lowRotation;
      }

      if (productStatusFilter === "stockout") {
        return product.stockoutRisk === "high";
      }

      return true;
    })
    .sort((a, b) => {
      if (productSort === "mostSold") {
        return b.unitsSold - a.unitsSold;
      }

      if (productSort === "leastSold") {
        return a.unitsSold - b.unitsSold;
      }

      return 0;
    });

  const handleOrderAction = (orderId, action) => {
    const order = receivedOrders.find((item) => item.id === orderId);
    if (!order) return;

    if (action === "accept") {
      setOrderHistory((prev) => [
        {
          id: Date.now(),
          productName: order.productName,
          buyer: order.buyer,
          quantity: order.quantity,
          totalAmount: order.offeredPrice * order.quantity,
          status: "completed",
          date: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    }

    setReceivedOrders((prev) => prev.map((item) => (item.id === orderId ? { ...item, status: action === "accept" ? "accepted" : "rejected" } : item)));
  };

  const tabs = [
    { id: "overview", label: "Visión general", icon: LayoutDashboard },
    { id: "sales", label: "Ventas", icon: BarChart3 },
    { id: "invoices", label: "Facturación y riesgo", icon: FileText },
    { id: "cashflow", label: "Cobranza / flujo", icon: Wallet },
    { id: "products", label: "Productos", icon: Package },
    { id: "discipline", label: "Disciplina del canal", icon: Shield },
    { id: "orders", label: "Pedidos", icon: ShoppingBag, badge: receivedOrders.filter((order) => order.status === "pending").length },
  ];

  const renderMiniBars = (items, maxKey = "amount", color = PALETTE.sizzlingSunrise) => {
    const max = Math.max(...items.map((item) => item[maxKey]), 1);
    return (
      <div className="flex h-40 items-end gap-2">
        {items.map((item) => (
          <div key={item.label || item.date} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-xl" style={{ height: `${Math.max((item[maxKey] / max) * 120, 12)}px`, backgroundColor: color }} />
            <span className="text-xs text-gray-500">{item.label || item.date.slice(5)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
                <span>Volver a la tienda</span>
              </button>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <p className="text-xs text-white/70">Centro de control</p>
                <p className="text-sm font-semibold text-white">Mayorista TH.O</p>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <section className="relative mb-6 overflow-hidden rounded-3xl" style={{ backgroundColor: PALETTE.spaceCadet }}>
          <div className="relative z-10 p-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}>
                  <Building2 className="h-10 w-10" style={{ color: PALETTE.maastrichtBlue }} />
                </div>
                <div>
                  <h1 className="text-2xl font-black">{userData.name || "Distribuidora mayorista"}</h1>
                  <p className="text-sm opacity-90">{userData.userType || "Jurídico mayorista"}</p>
                  <p className="mt-1 text-xs opacity-75">Panel financiero + comercial + riesgo operativo</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-3"><p className="text-white/60">Ventas mes</p><p className="font-black">{formatUSD(summary.monthlySales)}</p></div>
                <div className="rounded-2xl bg-white/10 p-3"><p className="text-white/60">Facturación activa</p><p className="font-black">{formatUSD(summary.activeInvoicing)}</p></div>
                <div className="rounded-2xl bg-white/10 p-3"><p className="text-white/60">Riesgo</p><p className="font-black">{formatPercent(summary.riskPercent)}</p></div>
              </div>
            </div>
          </div>
          <Package className="absolute -right-10 -top-10 h-56 w-56 text-white opacity-5" />
        </section>

        <nav className="mb-5 flex gap-1 overflow-x-auto border-b" style={{ borderColor: PALETTE.pastelGray }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-sm font-bold transition-all ${activeTab === tab.id ? "border-b-2" : "opacity-60 hover:opacity-100"}`}
              style={{ borderColor: activeTab === tab.id ? PALETTE.sizzlingSunrise : "transparent", color: PALETTE.maastrichtBlue }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{tab.badge}</span>}
            </button>
          ))}
        </nav>

        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Ventas hoy" value={formatUSD(summary.dailySales)} subtitle="Semana y mes disponibles" icon={<DollarSign className="h-5 w-5" />} trend="+8%" />
              <KPICard title="Facturación activa" value={formatUSD(summary.activeInvoicing)} subtitle="Facturas pendientes abiertas" icon={<Receipt className="h-5 w-5" />} color={PALETTE.crystalBlue} tone="info" />
              <KPICard title="Facturación en riesgo" value={formatPercent(summary.riskPercent)} subtitle={`${formatUSD(summary.riskyInvoices)} expuestos`} icon={<AlertTriangle className="h-5 w-5" />} color={PALETTE.warning} tone="warning" />
              <KPICard title="Cobros recibidos hoy" value={formatUSD(summary.collectedToday)} subtitle="Flujo real del día" icon={<Wallet className="h-5 w-5" />} color={PALETTE.success} tone="success" />
              <KPICard title="Facturas cubiertas por TH.O" value={formatUSD(summary.covered)} subtitle={`${invoices.filter((item) => item.coveredByTHO).length} operaciones cubiertas`} icon={<Shield className="h-5 w-5" />} color={PALETTE.maastrichtBlue} />
              <KPICard title="Ticket promedio" value={formatUSD(summary.ticketAverage)} subtitle="Pedido promedio" icon={<Gauge className="h-5 w-5" />} color={PALETTE.crystalBlue} />
              <KPICard title="Pedidos activos" value={summary.activeOrders} subtitle="Solicitudes pendientes" icon={<Inbox className="h-5 w-5" />} color={PALETTE.warning} />
              <KPICard title="Ventas generadas por TH.O" value={formatPercent(summary.thoSalesPercent)} subtitle="Origen canal TH.O" icon={<TrendingUp className="h-5 w-5" />} color={PALETTE.success} trend="+12%" />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard title="Alertas inteligentes" icon={<AlertTriangle className="h-4 w-4" style={{ color: PALETTE.warning }} />}>
                <div className="space-y-2">
                  <AlertCard type="warning" title="Cliente cercano a mora" message="Pinturas del Centro muestra deterioro de comportamiento. Revisar próximas facturas." />
                  <AlertCard type="danger" title="Concentración de facturación" message="Top 3 clientes concentran 45% de la facturación pendiente." />
                  <AlertCard type="success" title="Canal saludable" message="82% de clientes se mantiene disciplinado frente a sanciones TH.O." />
                </div>
              </SectionCard>

              <SectionCard title="Estado de facturación" icon={<FileText className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                <div className="space-y-4">
                  <ProgressBar label="Facturación al día" value={145000} max={187500} color={PALETTE.success} />
                  <ProgressBar label="Facturación en observación" value={28500} max={187500} color={PALETTE.warning} />
                  <ProgressBar label="Facturación en mora" value={14000} max={187500} color={PALETTE.danger} />
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "sales" && (
          <div className="space-y-5">
            <SectionCard
              title="Dashboard de ventas"
              icon={<BarChart3 className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
            >
              <p className="mb-4 text-sm text-gray-500">
                Analiza el crecimiento comercial desde tres vistas: volumen, clientes y performance.
              </p>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    id: "volume",
                    title: "Volumen de ventas",
                    description: "Día, semana, mes, producto, categoría, región, vendedor y origen",
                    icon: BarChart3,
                  },
                  {
                    id: "clients",
                    title: "Análisis de clientes",
                    description: "Top clientes, nuevos vs recurrentes, reactivados, frecuencia y ticket promedio",
                    icon: Users,
                  },
                  {
                    id: "performance",
                    title: "Performance comercial",
                    description: "Vendedores, % generado por TH.O, conversión y evolución histórica",
                    icon: TrendingUp,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSalesTab(tab.id)}
                      className="rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        borderColor: activeSalesTab === tab.id ? PALETTE.sizzlingSunrise : PALETTE.softBorder,
                        backgroundColor: activeSalesTab === tab.id ? "#FFFBEB" : PALETTE.white,
                      }}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div className="rounded-xl p-2" style={{ backgroundColor: `${PALETTE.sizzlingSunrise}22`, color: PALETTE.maastrichtBlue }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>{tab.title}</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-500">{tab.description}</p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {activeSalesTab === "volume" && (
              <div className="space-y-5">
                <SectionCard
                  title="Volumen de ventas"
                  icon={<BarChart3 className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        Lista de productos con ventas por período, producto, categoría y región.
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Período seleccionado: <strong>{selectedRangeLabel}</strong> · {selectedRangeDate}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["day", "week", "month"].map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className="rounded-full px-4 py-2 text-sm font-bold"
                          style={{
                            backgroundColor: timeRange === range ? PALETTE.sizzlingSunrise : PALETTE.page,
                            color: PALETTE.maastrichtBlue,
                          }}
                        >
                          {range === "day" ? "Día" : range === "week" ? "Semana" : "Mes"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <select
                      value={salesProductFilter}
                      onChange={(event) => setSalesProductFilter(event.target.value)}
                      className="rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="all">Todos los productos</option>
                      {productsData.map((product) => (
                        <option key={product.id} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={salesCategoryFilter}
                      onChange={(event) => setSalesCategoryFilter(event.target.value)}
                      className="rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="all">Todas las categorías</option>
                      {[...new Set(productsData.map((product) => product.category))].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={salesRegionFilter}
                      onChange={(event) => setSalesRegionFilter(event.target.value)}
                      className="rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="all">Todas las regiones</option>
                      {salesRegions.map((region) => (
                        <option key={region} value={region}>
                          Región {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </SectionCard>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard
                    title={timeRange === "day" ? "Ventas del día" : timeRange === "week" ? "Ventas de la semana" : "Ventas del mes"}
                    value={formatUSD(salesVolumeTotal)}
                    subtitle={`${new Set(filteredSalesVolumeRows.map((row) => row.name)).size} productos filtrados`}
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                  <KPICard
                    title="Unidades vendidas"
                    value={salesUnitsTotal.toLocaleString()}
                    subtitle="Según período seleccionado"
                    icon={<Package className="h-5 w-5" />}
                    color={PALETTE.crystalBlue}
                  />
                  <KPICard
                    title="Categorías activas"
                    value={new Set(filteredSalesVolumeRows.map((product) => product.category)).size}
                    icon={<BarChart3 className="h-5 w-5" />}
                    color={PALETTE.success}
                  />
                  <KPICard
                    title="Regiones activas"
                    value={new Set(filteredSalesVolumeRows.map((product) => product.region)).size}
                    icon={<Store className="h-5 w-5" />}
                    color={PALETTE.warning}
                  />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
                  <SectionCard
                    title={timeRange === "day" ? "Ventas por producto del día" : timeRange === "week" ? "Ventas por producto de la semana" : "Ventas por producto del mes"}
                    icon={<Package className="h-4 w-4" style={{ color: PALETTE.success }} />}
                  >
                    <div className="space-y-4">
                      {filteredSalesVolumeRows.map((product) => {
                        const amount = product.salesAmount;
                        const units = product.salesUnits;
                        const maxAmount = Math.max(...filteredSalesVolumeRows.map((item) => item.salesAmount), 1);

                        return (
                          <div key={`${product.id}-${product.region}`} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>{product.name}</p>
                                <p className="text-xs text-gray-500">
                                  {product.category} · {product.region === "Todas las regiones" ? "Todas las regiones" : `Región ${product.region}`} · Origen {product.sellerOrigin}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-black">{formatUSD(amount)}</p>
                                <p className="text-xs text-gray-500">{units.toLocaleString()} unidades</p>
                              </div>
                            </div>
                            <ProgressBar
                              value={amount}
                              max={maxAmount}
                              color={product.sellerOrigin === "TH.O" ? PALETTE.sizzlingSunrise : PALETTE.crystalBlue}
                            />
                          </div>
                        );
                      })}

                      {filteredSalesVolumeRows.length === 0 && (
                        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                          No hay productos que coincidan con los filtros seleccionados.
                        </div>
                      )}
                    </div>
                  </SectionCard>

                  <div className="space-y-5">
                    <SectionCard title="Ventas por origen" icon={<Store className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                      <div className="space-y-4">
                        <ProgressBar label="Generadas por TH.O" value={summary.thoSalesPercent} max={100} color={PALETTE.sizzlingSunrise} />
                        <ProgressBar label="Generadas por vendedor" value={100 - summary.thoSalesPercent} max={100} color={PALETTE.crystalBlue} />
                      </div>
                    </SectionCard>

                    <SectionCard title="Ventas por vendedor" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                      <div className="space-y-4">
                        {[
                          ["María Gómez", 64300],
                          ["Carlos Díaz", 51400],
                          ["Luis Pérez", 37800],
                          ["TH.O automático", summary.monthlySales * (summary.thoSalesPercent / 100)],
                        ].map(([seller, amount]) => (
                          <div key={seller}>
                            <div className="mb-1 flex justify-between text-sm">
                              <span className="font-bold">{seller}</span>
                              <span>{formatUSD(amount)}</span>
                            </div>
                            <ProgressBar
                              value={amount}
                              max={summary.monthlySales}
                              color={seller === "TH.O automático" ? PALETTE.crystalBlue : PALETTE.sizzlingSunrise}
                            />
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </div>
                </div>
              </div>
            )}

            {activeSalesTab === "clients" && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Clientes nuevos" value={clients.filter((client) => client.type === "Nuevo").length} icon={<Users className="h-5 w-5" />} color={PALETTE.success} />
                  <KPICard title="Clientes recurrentes" value={clients.filter((client) => client.type === "Recurrente").length} icon={<RotateCcw className="h-5 w-5" />} color={PALETTE.crystalBlue} />
                  <KPICard title="Clientes reactivados" value={clients.filter((client) => client.type === "Reactivado").length} icon={<RefreshCw className="h-5 w-5" />} color={PALETTE.warning} />
                  <KPICard title="Ticket promedio por cliente" value={formatUSD(clients.reduce((sum, client) => sum + client.totalAmount, 0) / clients.length)} icon={<Receipt className="h-5 w-5" />} />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <SectionCard title="Top clientes por facturación" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                    <div className="space-y-3">
                      {[...clients].sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5).map((client) => (
                        <div key={client.id} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder }}>
                          <div>
                            <p className="font-bold" style={{ color: PALETTE.maastrichtBlue }}>{client.name}</p>
                            <p className="text-xs text-gray-500">{client.type} · Frecuencia {client.frequency} · {client.totalPurchases} compras</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black">{formatUSD(client.totalAmount)}</p>
                            <p className="text-xs text-gray-500">Ticket {formatUSD(client.totalAmount / client.totalPurchases)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Clientes nuevos vs recurrentes" icon={<RotateCcw className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                    <div className="space-y-4">
                      <ProgressBar label="Recurrentes" value={clients.filter((client) => client.type === "Recurrente").length} max={clients.length} color={PALETTE.success} />
                      <ProgressBar label="Nuevos" value={clients.filter((client) => client.type === "Nuevo").length} max={clients.length} color={PALETTE.sizzlingSunrise} />
                      <ProgressBar label="Reactivados" value={clients.filter((client) => client.type === "Reactivado").length} max={clients.length} color={PALETTE.crystalBlue} />
                    </div>
                    <div className="mt-4 rounded-xl bg-yellow-50 p-3">
                      <p className="text-sm font-bold text-yellow-800">Insight TH.O</p>
                      <p className="mt-1 text-xs text-yellow-700">La frecuencia semanal concentra los clientes de mayor facturación. Los reactivados son una oportunidad de recuperación comercial.</p>
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}

            {activeSalesTab === "performance" && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Ventas generadas por TH.O" value={formatPercent(summary.thoSalesPercent)} subtitle={formatUSD(summary.monthlySales * (summary.thoSalesPercent / 100))} icon={<Sparkles className="h-5 w-5" />} color={PALETTE.warning} />
                  <KPICard title="Conversión pedidos → despachos" value="76%" subtitle="Pedidos completados" icon={<CheckCircle className="h-5 w-5" />} color={PALETTE.success} />
                  <KPICard title="Mejor vendedor" value="María" subtitle="Ventas: $64,300" icon={<Trophy className="h-5 w-5" />} />
                  <KPICard title="Pedidos activos" value={summary.activeOrders} icon={<ShoppingBag className="h-5 w-5" />} color={PALETTE.crystalBlue} />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <SectionCard title="Ventas por vendedor" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                    <div className="space-y-3">
                      {[
                        { name: "María Gómez", amount: 64300, percent: 92 },
                        { name: "Carlos Díaz", amount: 51400, percent: 74 },
                        { name: "Luis Pérez", amount: 37800, percent: 54 },
                        { name: "TH.O automático", amount: summary.monthlySales * (summary.thoSalesPercent / 100), percent: 100 },
                      ].map((seller) => (
                        <div key={seller.name}>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="font-bold">{seller.name}</span>
                            <span>{formatUSD(seller.amount)}</span>
                          </div>
                          <ProgressBar value={seller.percent} max={100} color={seller.name === "TH.O automático" ? PALETTE.crystalBlue : PALETTE.sizzlingSunrise} />
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Conversión y evolución histórica" icon={<Truck className="h-4 w-4" style={{ color: PALETTE.success }} />}>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-blue-50 p-3"><p className="text-xl font-black text-blue-700">142</p><p className="text-xs text-blue-700">Pedidos</p></div>
                      <div className="rounded-xl bg-green-50 p-3"><p className="text-xl font-black text-green-700">108</p><p className="text-xs text-green-700">Despachos</p></div>
                      <div className="rounded-xl bg-yellow-50 p-3"><p className="text-xl font-black text-yellow-700">76%</p><p className="text-xs text-yellow-700">Conversión</p></div>
                    </div>
                    <div className="mt-4">
                      {renderMiniBars([
                        { label: "Ene", amount: 62 },
                        { label: "Feb", amount: 68 },
                        { label: "Mar", amount: 71 },
                        { label: "Abr", amount: 74 },
                        { label: "May", amount: 76 },
                      ], "amount", PALETTE.crystalBlue)}
                    </div>
                  </SectionCard>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "invoices" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Facturas activas"
                value={invoices.filter((invoice) => invoice.status !== "paid").length}
                subtitle="Facturas abiertas en el sistema"
                icon={<FileText className="h-5 w-5" />}
                color={PALETTE.crystalBlue}
              />

              <KPICard
                title="Facturas al día"
                value={invoices.filter((invoice) => invoice.status === "paid").length}
                subtitle="Sin deuda pendiente"
                icon={<CheckCircle className="h-5 w-5" />}
                color={PALETTE.success}
                tone="success"
              />

              <KPICard
                title="Facturas por cobrar"
                value={invoices.filter((invoice) => ["pending", "covered"].includes(invoice.status)).length}
                subtitle={`${formatUSD(
                  invoices
                    .filter((invoice) => ["pending", "covered"].includes(invoice.status))
                    .reduce((sum, invoice) => sum + invoice.amount, 0)
                )} pendiente`}
                icon={<Receipt className="h-5 w-5" />}
                color={PALETTE.warning}
                tone="warning"
              />

              <KPICard
                title="Facturas en mora"
                value={invoices.filter((invoice) => invoice.status === "overdue").length}
                subtitle={`${formatUSD(
                  invoices
                    .filter((invoice) => invoice.status === "overdue")
                    .reduce((sum, invoice) => sum + invoice.amount, 0)
                )} en mora`}
                icon={<AlertTriangle className="h-5 w-5" />}
                color={PALETTE.danger}
                tone="danger"
              />
            </div>

            <SectionCard
              title="Filtros de facturación"
              icon={<Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
              action={<button onClick={() => setShowInvoiceFilters((value) => !value)} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{showInvoiceFilters ? "Ocultar" : "Mostrar"}</button>}
            >
              {showInvoiceFilters && (
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={invoiceSearchTerm} onChange={(e) => setInvoiceSearchTerm(e.target.value)} placeholder="Buscar cliente..." className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm" style={{ borderColor: PALETTE.pastelGray }} />
                  </div>
                  <select value={invoiceStatusFilter} onChange={(e) => setInvoiceStatusFilter(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="partial">Pago parcial</option>
                    <option value="overdue">Vencidas</option>
                    <option value="paid">Al día</option>
                    <option value="risk">En riesgo</option>
                  </select>
                  <select value={selectedClientName} onChange={(e) => setSelectedClientName(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="all">Todos los clientes</option>
                    {clients.map((client) => <option key={client.id} value={client.name}>{client.name}</option>)}
                  </select>
                </div>
              )}
            </SectionCard>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <SectionCard title="Riesgo por cliente" icon={<Users className="h-4 w-4" style={{ color: PALETTE.warning }} />}>
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <div key={client.id} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>{client.name}</p>
                          <p className="text-xs text-gray-500">
                            Creada: {client.invoiceCreatedAt} · Vence: {client.invoiceDueAt} · Próximo pago: {client.nextPaymentAt} · {client.blocks} bloqueos
                          </p>
                        </div>
                        <RiskPill risk={client.risk} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">Total de factura</p>
                          <p className="font-black">{formatUSD(client.invoiceTotal)}</p>
                        </div>
                        <div className="rounded-xl bg-green-50 p-3">
                          <p className="text-xs text-green-700">Monto abonado</p>
                          <p className="font-black text-green-700">{formatUSD(client.paidAmount)}</p>
                        </div>
                        <div className="rounded-xl bg-red-50 p-3">
                          <p className="text-xs text-red-700">Monto pendiente</p>
                          <p className="font-black text-red-700">{formatUSD(client.pendingAmount)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="text-xs text-gray-500">Mora</p>
                          <p className="font-black">{client.daysOverdue} días</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Alertas críticas" icon={<AlertTriangle className="h-4 w-4" style={{ color: PALETTE.danger }} />}>
                <div className="space-y-2">
                  <AlertCard type="danger" title="Cliente en mora" message="FerreNova Retail: 12 días de atraso. Factura cubierta por TH.O." />
                  <AlertCard type="warning" title="Deterioro de comportamiento" message="Pinturas del Centro pasó de 18 a 28 días promedio de pago." />
                  <AlertCard type="info" title="Concentración top 10" message="El 62% de la exposición está concentrado en los principales clientes." />
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "cashflow" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Flujo esperado semana" value={formatUSD(summary.expectedCashflow)} icon={<Calendar className="h-5 w-5" />} />
              <KPICard title="Cobros reales" value={formatUSD(summary.realCashflow)} icon={<Wallet className="h-5 w-5" />} color={PALETTE.success} tone="success" />
              <KPICard title="Monto cubierto TH.O" value={formatUSD(summary.covered)} icon={<Shield className="h-5 w-5" />} color={PALETTE.maastrichtBlue} />
              <KPICard title="Tiempo promedio cobertura" value={`${summary.avgCoverageHours}h`} icon={<Clock className="h-5 w-5" />} color={PALETTE.warning} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <SectionCard title="Cobros proyectados por fecha" icon={<Calendar className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                <div className="space-y-3">
                  {collectionFlow.map((item) => (
                    <div key={item.date} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder }}>
                      <span className="font-bold">{item.date}</span>
                      <div className="text-right">
                        <p className="font-black text-green-700">{formatUSD(item.expected)}</p>
                        <p className="text-xs text-gray-500">proyectado</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
              <SectionCard title="Cobros reales vs esperados" icon={<BarChart3 className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                {renderMiniBars(collectionFlow.map((item) => ({ label: item.date.slice(5), amount: item.expected, real: item.real })), "amount", PALETTE.crystalBlue)}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-green-50 p-3"><p className="text-xs text-green-700">Real</p><p className="font-black text-green-700">{formatUSD(summary.realCashflow)}</p></div>
                  <div className="rounded-xl bg-blue-50 p-3"><p className="text-xs text-blue-700">Esperado</p><p className="font-black text-blue-700">{formatUSD(summary.expectedCashflow)}</p></div>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Productos más vendidos" value={productsData[1].name} subtitle={`${productsData[1].unitsSold.toLocaleString()} unidades`} icon={<Package className="h-5 w-5" />} />
              <KPICard title="Baja rotación" value={productsData.filter((item) => item.lowRotation).length} subtitle="Productos para revisar" icon={<PackageOpen className="h-5 w-5" />} color={PALETTE.warning} tone="warning" />
              <KPICard title="Margen promedio" value={formatPercent(productsData.reduce((sum, item) => sum + item.marginPercent, 0) / productsData.length)} icon={<DollarSign className="h-5 w-5" />} color={PALETTE.success} />
              <KPICard title="Quiebres de stock" value={productsData.filter((item) => item.stockoutRisk === "high").length} subtitle="Riesgo alto" icon={<AlertTriangle className="h-5 w-5" />} color={PALETTE.danger} tone="danger" />
            </div>

            <SectionCard title="Filtros de productos" icon={<SlidersHorizontal className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Ordenar productos
                  </label>

                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: PALETTE.pastelGray }}
                  >
                    <option value="mostSold">Más vendido a menos vendido</option>
                    <option value="leastSold">Menos vendido a más vendido</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Estado del producto
                  </label>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: PALETTE.pastelGray }}
                  >
                    <option value="all">Todos los productos</option>
                    <option value="lowRotation">Baja rotación</option>
                    <option value="stockout">Quiebre de stock</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
                  {filteredInventoryProducts.length} productos visibles
                </span>
                <span className="rounded-full bg-yellow-50 px-3 py-1 font-semibold text-yellow-700">
                  Orden: {productSort === "mostSold" ? "más vendidos primero" : "menos vendidos primero"}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                  Filtro: {productStatusFilter === "all" ? "todos" : productStatusFilter === "lowRotation" ? "baja rotación" : "quiebre de stock"}
                </span>
              </div>
            </SectionCard>

            <SectionCard title="Rendimiento e inventario" icon={<Package className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
              <div className="space-y-4">
                {filteredInventoryProducts.map((product) => (
                  <div key={product.id} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                    <div className="flex gap-4">
                      <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category} · Más vendido en: {product.region}</p>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-xs font-bold ${product.stockoutRisk === "high" ? "bg-red-100 text-red-700" : product.stockoutRisk === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{product.stockoutRisk === "high" ? "Quiebre probable" : product.stockoutRisk === "medium" ? "Vigilar stock" : "Stock sano"}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                          <div><p className="text-xs text-gray-500">Ventas</p><p className="font-black">{formatUSD(product.revenue)}</p></div>
                          <div><p className="text-xs text-gray-500">Unidades</p><p className="font-black">{product.unitsSold}</p></div>
                          <div><p className="text-xs text-gray-500">Margen</p><p className="font-black">{formatPercent(product.marginPercent)}</p></div>
                          <div><p className="text-xs text-gray-500">Stock</p><p className="font-black">{product.stock}</p></div>
                          <div><p className="text-xs text-gray-500">Rotación</p><p className="font-black">{product.turnoverDays} días</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredInventoryProducts.length === 0 && (
                  <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No hay productos que coincidan con el filtro seleccionado.
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "discipline" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Clientes bloqueados" value={discipline.blockedClients} icon={<X className="h-5 w-5" />} color={PALETTE.danger} tone="danger" />
              <KPICard title="Reincorporaciones" value={discipline.reinstatements} subtitle="Pagaron +30%" icon={<CheckCircle className="h-5 w-5" />} color={PALETTE.success} tone="success" />
              <KPICard title="Tiempo promedio de mora" value={`${discipline.avgOverdueDays} días`} icon={<Clock className="h-5 w-5" />} color={PALETTE.warning} />
              <KPICard title="Clientes disciplinados" value={formatPercent(discipline.disciplinedPercent)} icon={<Shield className="h-5 w-5" />} color={PALETTE.success} />
            </div>
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <SectionCard title="Salud del canal" icon={<Gauge className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                <div className="space-y-4">
                  <ProgressBar label="Disciplinados" value={discipline.disciplinedPercent} max={100} color={PALETTE.success} />
                  <ProgressBar label="Sancionados" value={discipline.sanctionedPercent} max={100} color={PALETTE.danger} />
                  <AlertCard type="success" title="Insight" message="El mercado se está ordenando: la mayoría mantiene comportamiento sano después de las reglas TH.O." />
                </div>
              </SectionCard>
              <SectionCard title="Clientes y sanciones" icon={<Users className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                <div className="space-y-3">
                  {discipline.clients.map((client) => (
                    <div key={client.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder }}>
                      <div>
                        <p className="font-black">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.overdueDays} días de mora · Pago recuperación {client.recoveryPayment}%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{client.status}</p>
                        <p className="text-xs text-gray-500">{client.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-5">
            <SectionCard title="Solicitudes de compra pendientes" icon={<Inbox className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
              <div className="space-y-4">
                {receivedOrders.filter((order) => order.status === "pending").map((order) => (
                  <div key={order.id} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-black">{order.productName}</p>
                        <p className="text-xs text-gray-500">{order.buyer} · {order.buyerType} · {order.date}</p>
                        <p className="mt-2 rounded-xl bg-blue-50 p-2 text-xs text-blue-700">{order.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-green-700">{formatUSD(order.offeredPrice * order.quantity)}</p>
                        <p className="text-xs text-gray-500">{order.quantity} unidades</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleOrderAction(order.id, "accept")} className="flex-1 rounded-xl bg-green-500 py-2 font-bold text-white">Aceptar</button>
                      <button onClick={() => handleOrderAction(order.id, "reject")} className="flex-1 rounded-xl bg-red-500 py-2 font-bold text-white">Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Historial de pedidos procesados" icon={<History className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
              <div className="space-y-2">
                {orderHistory.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder }}>
                    <div>
                      <p className="font-bold">{order.productName}</p>
                      <p className="text-xs text-gray-500">{order.buyer} · {order.quantity} unidades · {order.date}</p>
                    </div>
                    <p className="font-black text-green-700">{formatUSD(order.totalAmount)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}
