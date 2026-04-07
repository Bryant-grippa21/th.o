import React, { useState } from "react";
import { Button } from "./ui/Button";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  Edit2,
  Package,
  Star,
  TrendingUp,
  DollarSign,
  CreditCard,
  BarChart3,
  Store,
  Users,
  FileText,
  AlertTriangle,
  Shield,
  Clock,
  Truck,
  Percent,
  Zap,
  Award,
  TrendingDown,
  Activity,
  Bell,
  HelpCircle,
  Trophy
} from "lucide-react";
import { motion } from "framer-motion";

// ==========================================================
// COMPONENTES REUTILIZABLES
// ==========================================================

// Componente para tarjetas de KPI
const KPICard = ({ title, value, subtitle, icon, color, trend, trendValue }) => (
  <div className="rounded-2xl p-5 shadow-sm hover:shadow-md transition-all" style={{ backgroundColor: "#FFFFFF" }}>
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}15` }}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold" style={{ color: "#091A2D" }}>{value}</p>
    <p className="text-sm mt-1" style={{ color: "#6E98AF" }}>{title}</p>
    {subtitle && <p className="text-xs mt-1" style={{ color: "#D6D0C4" }}>{subtitle}</p>}
  </div>
);

// Componente para alertas
const AlertCard = ({ type, title, message, action, actionText }) => {
  const colors = {
    warning: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", icon: AlertTriangle },
    danger: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B", icon: AlertTriangle },
    info: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF", icon: Bell },
    success: { bg: "#D1FAE5", border: "#10B981", text: "#065F46", icon: Shield }
  };
  const Icon = colors[type].icon;
  return (
    <div className="rounded-2xl p-4 border-l-4" style={{ backgroundColor: colors[type].bg, borderLeftColor: colors[type].border }}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5" style={{ color: colors[type].border }} />
        <div className="flex-1">
          <p className="font-semibold text-sm" style={{ color: colors[type].text }}>{title}</p>
          <p className="text-xs mt-1" style={{ color: colors[type].text }}>{message}</p>
          {action && (
            <button className="text-xs font-semibold mt-2 hover:underline" style={{ color: colors[type].border }}>
              {actionText || "Ver detalles"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para gráfica de barras mejorada
const BarChart = ({ data, title, color, height = 200 }) => {
  const maxValue = Math.max(...data.values);
  return (
    <div className="space-y-3">
      <h4 className="font-semibold" style={{ color: "#091A2D" }}>{title}</h4>
      <div className="flex items-end gap-2" style={{ height: `${height}px` }}>
        {data.labels.map((label, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full">
              <div 
                className="w-full rounded-t-lg transition-all hover:opacity-80"
                style={{ 
                  backgroundColor: color,
                  height: `${(data.values[idx] / maxValue) * (height - 30)}px`,
                  minHeight: "20px"
                }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${data.values[idx]}
              </div>
            </div>
            <span className="text-xs" style={{ color: "#6E98AF" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function UserProfile({ userData, onBack, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  
  const userType = userData.userType;
  const isJuridicoDetallista = userType === "Jurídico Detallista";
  const isJuridicoMayorista = userType === "Jurídico Mayorista";
  const isNatural = userType === "Usuario Natural";

  // ==========================================================
  // DATOS EXISTENTES (preservados)
  // ==========================================================
  
  // Datos de compras (para Natural y Detallista)
  const purchases = [
    { id: 1, date: "15/03/2026", total: 127.50, items: 3, status: "Entregado", products: ["Taladro percutor", "Juego de llaves", "Guantes anticorte"] },
    { id: 2, date: "28/02/2026", total: 45.90, items: 2, status: "En camino", products: ["Esmeril angular", "Casco de seguridad"] },
    { id: 3, date: "10/02/2026", total: 89.99, items: 1, status: "Entregado", products: ["Taladro percutor profesional"] }
  ];

  // Datos de favoritos (para Natural y Detallista)
  const favorites = [
    { id: 1, name: "Taladro percutor 1/2 profesional", price: 89.99, rating: 4.7, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80" },
    { id: 2, name: "Juego de llaves combinadas 12 piezas", price: 24.90, rating: 4.8, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80" },
    { id: 3, name: "Casco de seguridad con ajuste rápido", price: 14.50, rating: 4.4, image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=200&q=80" }
  ];

  // Datos de créditos (para Detallista)
  const credits = [
    {
      id: 1,
      amount: 5000,
      used: 2350,
      remaining: 2650,
      payments: [
        { id: 1, date: "10/03/2026", amount: 500, status: "Pagado" },
        { id: 2, date: "25/03/2026", amount: 350, status: "Pagado" }
      ],
      nextPayment: "15/04/2026",
      nextPaymentAmount: 450
    }
  ];

  // Datos de proveedores (para Detallista)
  const topSuppliers = [
    { id: 1, name: "Distribuidora Atlas", purchases: 12, total: 8750.50 },
    { id: 2, name: "Pinturas Mayor Pro", purchases: 8, total: 4560.75 },
    { id: 3, name: "FerreMax Detalle", purchases: 6, total: 3240.00 }
  ];

  // ==========================================================
  // DATOS MEJORADOS PARA DASHBOARD - MAYORISTA
  // ==========================================================
  
  // KPI principales para Mayorista
  const wholesalerKPIs = {
    dailySales: 12500,
    weeklySales: 78450,
    monthlySales: 245800,
    activeCredit: 187500,
    riskPercentage: 8.5,
    collectedToday: 34500,
    coveredByTHO: 12500,
    averageTicket: 1450,
    activeOrders: 42
  };

  // Cartera por estado
  const portfolioStatus = {
    onTime: 145000,
    atRisk: 28500,
    default: 14000
  };

  // Top clientes
  const topClients = [
    { id: 1, name: "Ferretería El Constructor", amount: 45600, daysOverdue: 0, risk: "low" },
    { id: 2, name: "Pinturas del Centro", amount: 32400, daysOverdue: 5, risk: "medium" },
    { id: 3, name: "FerreNova Retail", amount: 28750, daysOverdue: 12, risk: "high" },
    { id: 4, name: "Construcciones Delta", amount: 23400, daysOverdue: 0, risk: "low" },
    { id: 5, name: "Materiales El Ávila", amount: 19800, daysOverdue: 8, risk: "medium" }
  ];

  // Alertas inteligentes para Mayorista
  const wholesalerAlerts = [
    { type: "warning", title: "Cliente en riesgo", message: "FerreNova Retail tiene 12 días de retraso en pago ($8,450)", action: true },
    { type: "info", title: "Crecimiento detectado", message: "Ventas aumentaron 23% esta semana vs semana anterior", action: false },
    { type: "danger", title: "Concentración de riesgo", message: "Top 3 clientes representan 45% de tu cartera", action: true }
  ];

  // Evolución histórica de ventas
  const salesEvolution = {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"],
    values: [18500, 19200, 17800, 21000, 24500, 27800]
  };

  // Ventas por categoría
  const salesByCategory = [
    { name: "Herramientas", value: 45, amount: 110610 },
    { name: "Ferretería", value: 28, amount: 68824 },
    { name: "Seguridad", value: 17, amount: 41786 },
    { name: "Pintura", value: 10, amount: 24580 }
  ];

  // Disciplina del canal
  const channelDiscipline = {
    blockedClients: 8,
    reinstated: 3,
    avgDefaultDays: 18,
    disciplinedPercentage: 72,
    sanctionedPercentage: 28
  };

  // ==========================================================
  // DATOS MEJORADOS PARA DASHBOARD - DETALLISTA
  // ==========================================================
  
  // KPI principales para Detallista
  const retailerKPIs = {
    monthlyPurchases: 18500,
    activeCredit: 8750,
    creditLimit: 15000,
    upcomingPayments: 3450,
    daysUntilNextPayment: 5,
    avgPaymentDays: 12,
    complianceRate: 85,
    blocksCount: 1,
    nextBlockRisk: 8
  };

  // Estado del crédito
  const creditStatus = {
    healthy: 5200,
    warning: 2350,
    critical: 1200
  };

  // Facturas abiertas
  const openInvoices = [
    { id: "F-2024-001", amount: 2350, dueDate: "2026-04-10", daysLeft: 4, product: "Taladros industriales" },
    { id: "F-2024-002", amount: 1850, dueDate: "2026-04-15", daysLeft: 9, product: "Kit herramientas" },
    { id: "F-2024-003", amount: 1250, dueDate: "2026-04-18", daysLeft: 12, product: "Material de seguridad" }
  ];

  // Alertas para Detallista
  const retailerAlerts = [
    { type: "warning", title: "⚠️ Pago próximo a vencer", message: "Factura F-2024-001 vence en 4 días ($2,350)", action: true, actionText: "Pagar ahora" },
    { type: "danger", title: "🚨 Riesgo de bloqueo", message: "Si no pagas $2,350 antes del 10/04, serás bloqueado por 30 días", action: true, actionText: "Simular pago" },
    { type: "info", title: "📊 Historial de bloqueos", message: "Has sido bloqueado 1 vez. Pagaste $450 para reincorporarte.", action: false }
  ];

  // Ventas B2C del detallista
  const retailerSales = {
    daily: 450,
    weekly: 3150,
    monthly: 14200,
    averageTicket: 28.50,
    transactions: 498
  };

  // Rentabilidad por producto
  const productProfitability = [
    { name: "Taladro percutor", margin: 32, sales: 89, revenue: 8011 },
    { name: "Juego de llaves", margin: 45, sales: 234, revenue: 5826 },
    { name: "Guantes anticorte", margin: 28, sales: 445, revenue: 4445 },
    { name: "Casco seguridad", margin: 35, sales: 178, revenue: 2581 }
  ];

  // Rotación de inventario
  const inventoryTurnover = [
    { name: "Taladro percutor", turnover: 4.2, daysInStock: 24, status: "good" },
    { name: "Juego de llaves", turnover: 6.8, daysInStock: 15, status: "excellent" },
    { name: "Rodillo pintura", turnover: 2.1, daysInStock: 48, status: "warning" }
  ];

  // Comparativa compras vs ventas
  const purchaseVsSales = {
    labels: ["Ene", "Feb", "Mar", "Abr"],
    purchases: [4200, 3850, 5100, 4850],
    sales: [3850, 4100, 5300, 4920]
  };

  // Score de cumplimiento
  const complianceScore = {
    score: 72,
    level: "Bueno",
    nextLevel: "Excelente",
    pointsNeeded: 28
  };

  const PALETTE = {
    spaceCadet: "#1B3149",
    pastelGray: "#D6D0C4",
    crystalBlue: "#6E98AF",
    sizzlingSunrise: "#FEDC00",
    maastrichtBlue: "#091A2D",
    page: "#F3F1EC",
    white: "#FFFFFF",
  };

  // Configuración de tabs según el tipo de usuario
  const getTabs = () => {
    const baseTabs = [
      { id: "dashboard", label: "Dashboard", icon: Activity }
    ];
    
    if (isNatural) {
      baseTabs.push(
        { id: "purchases", label: "Mis compras", icon: ShoppingBag },
        { id: "favorites", label: "Favoritos", icon: Heart }
      );
    }
    
    if (isJuridicoDetallista) {
      baseTabs.push(
        { id: "credits", label: "Créditos", icon: CreditCard },
        { id: "sales", label: "Ventas B2C", icon: TrendingUp },
        { id: "inventory", label: "Inventario", icon: Package },
        { id: "suppliers", label: "Proveedores", icon: Store }
      );
    }
    
    if (isJuridicoMayorista) {
      baseTabs.push(
        { id: "portfolio", label: "Cartera", icon: CreditCard },
        { id: "clients", label: "Clientes", icon: Users },
        { id: "channel", label: "Canal", icon: Shield }
      );
    }
    
    baseTabs.push({ id: "settings", label: "Configuración", icon: Settings });
    
    return baseTabs;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      {/* Header */}
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a la tienda</span>
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Banner de perfil */}
        <div className="relative mb-8 overflow-hidden rounded-3xl" style={{ backgroundColor: PALETTE.spaceCadet }}>
          <div className="relative z-10 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}>
                <User className="h-12 w-12" style={{ color: PALETTE.maastrichtBlue }} />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">{userData.name}</h1>
                <p className="text-sm opacity-90">{userData.userType}</p>
                <div className="flex items-center gap-2 mt-2 text-sm opacity-75">
                  <Calendar className="h-4 w-4" />
                  <span>Miembro desde {userData.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10"><Package className="h-full w-full" /></div>
        </div>

        {/* Selector de período */}
        <div className="mb-6 flex justify-end gap-2">
          {["day", "week", "month", "year"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedPeriod === period ? "text-white" : "opacity-60 hover:opacity-100"
              }`}
              style={{
                backgroundColor: selectedPeriod === period ? PALETTE.sizzlingSunrise : "transparent",
                color: selectedPeriod === period ? PALETTE.maastrichtBlue : PALETTE.crystalBlue
              }}
            >
              {period === "day" ? "Hoy" : period === "week" ? "Semana" : period === "month" ? "Mes" : "Año"}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b overflow-x-auto" style={{ borderColor: PALETTE.pastelGray }}>
          {getTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "border-b-2" : "opacity-60 hover:opacity-100"
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

        {/* ==========================================================
            DASHBOARD MAYORISTA
        ========================================================== */}
        {activeTab === "dashboard" && isJuridicoMayorista && (
          <div className="space-y-6">
            {/* KPIs principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Ventas del mes" value={`$${wholesalerKPIs.monthlySales.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} trend="up" trendValue="12" />
              <KPICard title="Crédito activo" value={`$${wholesalerKPIs.activeCredit.toLocaleString()}`} icon={<CreditCard className="h-5 w-5" style={{ color: PALETTE.crystalBlue }} />} color={PALETTE.crystalBlue} />
              <KPICard title="Cartera en riesgo" value={`${wholesalerKPIs.riskPercentage}%`} subtitle={`$${(wholesalerKPIs.activeCredit * wholesalerKPIs.riskPercentage / 100).toLocaleString()}`} icon={<AlertTriangle className="h-5 w-5" style={{ color: "#F59E0B" }} />} color="#F59E0B" trend="down" trendValue="3" />
              <KPICard title="Cobros hoy" value={`$${wholesalerKPIs.collectedToday.toLocaleString()}`} icon={<Calendar className="h-5 w-5" style={{ color: "#10B981" }} />} color="#10B981" />
            </div>

            {/* Alertas inteligentes */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}>
                <Bell className="h-5 w-5" /> Alertas inteligentes
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {wholesalerAlerts.map((alert, idx) => (
                  <AlertCard key={idx} type={alert.type} title={alert.title} message={alert.message} action={alert.action} />
                ))}
              </div>
            </div>

            {/* Gráficas */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <BarChart data={salesEvolution} title="Evolución de ventas (últimas 6 semanas)" color={PALETTE.sizzlingSunrise} height={250} />
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <h3 className="font-semibold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Estado de cartera</h3>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-sm mb-1"><span>Al día</span><span>${portfolioStatus.onTime.toLocaleString()}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 rounded-full h-2" style={{ width: `${(portfolioStatus.onTime / (portfolioStatus.onTime + portfolioStatus.atRisk + portfolioStatus.default)) * 100}%` }}></div></div></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>En riesgo</span><span>${portfolioStatus.atRisk.toLocaleString()}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-yellow-500 rounded-full h-2" style={{ width: `${(portfolioStatus.atRisk / (portfolioStatus.onTime + portfolioStatus.atRisk + portfolioStatus.default)) * 100}%` }}></div></div></div>
                  <div><div className="flex justify-between text-sm mb-1"><span>En mora</span><span>${portfolioStatus.default.toLocaleString()}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-red-500 rounded-full h-2" style={{ width: `${(portfolioStatus.default / (portfolioStatus.onTime + portfolioStatus.atRisk + portfolioStatus.default)) * 100}%` }}></div></div></div>
                </div>
              </div>
            </div>

            {/* Top clientes */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}><Users className="h-5 w-5" /> Top 5 clientes por facturación</h3>
              <div className="space-y-3">
                {topClients.map(client => (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                    <div><p className="font-semibold">{client.name}</p><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>${client.amount.toLocaleString()}</p></div>
                    <div className="text-right"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${client.risk === 'low' ? 'bg-green-100 text-green-700' : client.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{client.risk === 'low' ? '✓' : client.risk === 'medium' ? '⚠️' : '🔴'} {client.risk === 'low' ? 'Al día' : client.risk === 'medium' ? `${client.daysOverdue} días` : 'En mora'}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disciplina del canal */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}><Shield className="h-5 w-5" /> Disciplina del canal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-2xl font-bold">{channelDiscipline.blockedClients}</p><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Clientes bloqueados</p></div>
                  <div><p className="text-2xl font-bold">{channelDiscipline.reinstated}</p><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Reincorporados (+30%)</p></div>
                  <div><p className="text-2xl font-bold">{channelDiscipline.avgDefaultDays}</p><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Días promedio en mora</p></div>
                  <div><p className="text-2xl font-bold">{channelDiscipline.disciplinedPercentage}%</p><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Clientes disciplinados</p></div>
                </div>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}><Activity className="h-5 w-5" /> Performance comercial</h3>
                {salesByCategory.map(cat => (<div key={cat.name} className="mb-3"><div className="flex justify-between text-sm mb-1"><span>{cat.name}</span><span>${cat.amount.toLocaleString()}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="rounded-full h-2" style={{ width: `${cat.value}%`, backgroundColor: PALETTE.crystalBlue }}></div></div></div>))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            DASHBOARD DETALLISTA
        ========================================================== */}
        {activeTab === "dashboard" && isJuridicoDetallista && (
          <div className="space-y-6">
            {/* KPIs principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Compras del mes" value={`$${retailerKPIs.monthlyPurchases.toLocaleString()}`} icon={<ShoppingBag className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} />
              <KPICard title="Crédito activo" value={`$${retailerKPIs.activeCredit.toLocaleString()}`} subtitle={`Límite: $${retailerKPIs.creditLimit.toLocaleString()}`} icon={<CreditCard className="h-5 w-5" style={{ color: PALETTE.crystalBlue }} />} color={PALETTE.crystalBlue} />
              <KPICard title="Próximos vencimientos" value={`$${retailerKPIs.upcomingPayments.toLocaleString()}`} subtitle={`En ${retailerKPIs.daysUntilNextPayment} días`} icon={<Calendar className="h-5 w-5" style={{ color: "#F59E0B" }} />} color="#F59E0B" />
              <KPICard title="Score de cumplimiento" value={`${retailerKPIs.complianceRate}%`} icon={<Award className="h-5 w-5" style={{ color: "#10B981" }} />} color="#10B981" />
            </div>

            {/* Estado del crédito */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Estado de tu crédito</h3>
                <div className="relative pt-4">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-500 rounded-full h-4" style={{ width: `${(creditStatus.healthy / retailerKPIs.creditLimit) * 100}%` }}></div>
                    <div className="bg-yellow-500 rounded-full h-4 mt-1" style={{ width: `${(creditStatus.warning / retailerKPIs.creditLimit) * 100}%` }}></div>
                    <div className="bg-red-500 rounded-full h-4 mt-1" style={{ width: `${(creditStatus.critical / retailerKPIs.creditLimit) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-4 text-xs">
                    <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span> Saludable</span>
                    <span><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span> Alerta</span>
                    <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span> Crítico</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: retailerKPIs.nextBlockRisk <= 7 ? "#FEE2E2" : PALETTE.page }}>
                  <p className="text-sm font-semibold" style={{ color: retailerKPIs.nextBlockRisk <= 7 ? "#991B1B" : PALETTE.maastrichtBlue }}>⚠️ Si no pagas $2,350 antes del 10/04, serás bloqueado por 30 días</p>
                  <button className="mt-2 text-sm font-semibold hover:underline" style={{ color: PALETTE.sizzlingSunrise }}>Simular pago →</button>
                </div>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Alertas</h3>
                {retailerAlerts.map((alert, idx) => (<AlertCard key={idx} type={alert.type} title={alert.title} message={alert.message} action={alert.action} actionText={alert.actionText} />))}
              </div>
            </div>

            {/* Ventas B2C */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <DollarSign className="h-8 w-8 mb-2" style={{ color: PALETTE.sizzlingSunrise }} />
                <p className="text-2xl font-bold">${retailerSales.monthly.toLocaleString()}</p>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Ventas del mes</p>
                <p className="text-xs mt-2">Ticket promedio: ${retailerSales.averageTicket}</p>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <TrendingUp className="h-8 w-8 mb-2" style={{ color: PALETTE.crystalBlue }} />
                <p className="text-2xl font-bold">{retailerSales.transactions}</p>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Transacciones</p>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <Percent className="h-8 w-8 mb-2" style={{ color: "#10B981" }} />
                <p className="text-2xl font-bold">32%</p>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Margen promedio</p>
              </div>
            </div>

            {/* Productos más rentables */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Productos más rentables</h3>
              {productProfitability.map(p => (
                <div key={p.name} className="flex items-center justify-between p-3 border-b">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>{p.sales} unidades vendidas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${p.revenue}</p>
                    <p className="text-xs" style={{ color: "#10B981" }}>Margen: {p.margin}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparativa compras vs ventas */}
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Compras vs Ventas (últimos 4 meses)</h3>
              <BarChart data={{ labels: purchaseVsSales.labels, values: purchaseVsSales.purchases }} title="Compras" color="#EF4444" height={200} />
              <div className="mt-4">
                <BarChart data={{ labels: purchaseVsSales.labels, values: purchaseVsSales.sales }} title="Ventas" color={PALETTE.sizzlingSunrise} height={200} />
              </div>
            </div>

            {/* Score de cumplimiento y ranking */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl p-6 shadow-sm text-center" style={{ backgroundColor: PALETTE.white }}>
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 mb-4" style={{ borderColor: PALETTE.sizzlingSunrise }}>
                  <span className="text-3xl font-bold">{complianceScore.score}</span>
                </div>
                <h3 className="text-xl font-bold">{complianceScore.level}</h3>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Te faltan {complianceScore.pointsNeeded} puntos para alcanzar nivel {complianceScore.nextLevel}</p>
                <button className="mt-4 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Ver cómo mejorar</button>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}><Trophy className="h-5 w-5" /> Ranking de ferreterías</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2"><span className="font-medium">🥇 Ferretería El Constructor</span><span className="text-sm font-bold">98 pts</span></div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg"><span className="font-medium">🥈 Ferretería El Constructor</span><span className="text-sm font-bold">85 pts</span></div>
                  <div className="flex items-center justify-between p-2"><span className="font-medium">🥉 Pinturas del Centro</span><span className="text-sm font-bold">79 pts</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            MIS COMPRAS - Natural y Detallista
        ========================================================== */}
        {activeTab === "purchases" && (isNatural || isJuridicoDetallista) && (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: PALETTE.white }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5" style={{ color: PALETTE.crystalBlue }} />
                      <span className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>Pedido #{purchase.id}</span>
                      <span className="rounded-full px-2 py-1 text-xs" style={{ backgroundColor: purchase.status === "Entregado" ? "#DFF6F1" : "#FEF3C7", color: purchase.status === "Entregado" ? "#0F766E" : "#B45309" }}>{purchase.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm" style={{ color: PALETTE.crystalBlue }}>
                      <Calendar className="h-4 w-4" /><span>{purchase.date}</span><span>{purchase.items} productos</span>
                    </div>
                    <div className="text-sm">{purchase.products.join(", ")}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>${purchase.total}</p>
                    <button className="mt-2 text-sm flex items-center gap-1 hover:underline">Ver detalles <ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==========================================================
            FAVORITOS - Natural y Detallista
        ========================================================== */}
        {activeTab === "favorites" && (isNatural || isJuridicoDetallista) && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => (
              <div key={item.id} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: PALETTE.white }}>
                <img src={item.image} alt={item.name} className="h-48 w-full object-cover" />
                <div className="p-4">
                  <h4 className="font-semibold line-clamp-2" style={{ color: PALETTE.maastrichtBlue }}>{item.name}</h4>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-current" style={{ color: PALETTE.sizzlingSunrise }} />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>${item.price}</span>
                    <button className="rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Agregar al carrito</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==========================================================
            CRÉDITOS - Solo Detallista
        ========================================================== */}
        {activeTab === "credits" && isJuridicoDetallista && (
          <div className="space-y-4">
            {credits.map((credit) => (
              <div key={credit.id} className="space-y-4">
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="h-6 w-6" style={{ color: PALETTE.sizzlingSunrise }} />
                    <h3 className="text-lg font-bold" style={{ color: PALETTE.maastrichtBlue }}>Crédito disponible</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div><p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Límite de crédito</p><p className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>${credit.amount}</p></div>
                    <div><p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Utilizado</p><p className="text-2xl font-bold" style={{ color: "#B42318" }}>${credit.used}</p></div>
                    <div><p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Disponible</p><p className="text-2xl font-bold" style={{ color: "#0F766E" }}>${credit.remaining}</p></div>
                  </div>
                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                    <p className="text-sm font-semibold" style={{ color: PALETTE.maastrichtBlue }}>Próximo pago: {credit.nextPayment} - ${credit.nextPaymentAmount}</p>
                    <button className="mt-2 text-sm font-semibold hover:underline" style={{ color: PALETTE.sizzlingSunrise }}>Pagar crédito</button>
                  </div>
                </div>
                <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Historial de pagos</h3>
                  {credit.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: PALETTE.pastelGray }}>
                      <div className="flex items-center gap-3"><Calendar className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} /><span className="text-sm">{payment.date}</span></div>
                      <span className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>${payment.amount}</span>
                      <span className="text-sm" style={{ color: "#0F766E" }}>{payment.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==========================================================
            VENTAS B2C - Detallista
        ========================================================== */}
        {activeTab === "sales" && isJuridicoDetallista && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <TrendingUp className="h-8 w-8 mb-2" style={{ color: PALETTE.sizzlingSunrise }} />
                <p className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>${retailerSales.monthly.toLocaleString()}</p>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Ventas del mes</p>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <DollarSign className="h-8 w-8 mb-2" style={{ color: PALETTE.crystalBlue }} />
                <p className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>${retailerSales.averageTicket}</p>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Ticket promedio</p>
              </div>
              <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                <ShoppingBag className="h-8 w-8 mb-2" style={{ color: "#10B981" }} />
                <p className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>{retailerSales.transactions}</p>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Transacciones</p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            INVENTARIO - Detallista
        ========================================================== */}
        {activeTab === "inventory" && isJuridicoDetallista && (
          <div className="space-y-4">
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Rotación de inventario</h3>
              {inventoryTurnover.map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 border-b">
                  <div>
                    <p className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>{item.name}</p>
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Rotación: {item.turnover}x/mes</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs ${item.status === 'excellent' ? 'bg-green-100 text-green-700' : item.status === 'good' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {item.status === 'excellent' ? '✓ Excelente' : item.status === 'good' ? '👍 Bueno' : '⚠️ Lenta rotación'}
                    </span>
                    <p className="text-xs mt-1" style={{ color: PALETTE.crystalBlue }}>{item.daysInStock} días en inventario</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================================
            PROVEEDORES - Detallista
        ========================================================== */}
        {activeTab === "suppliers" && isJuridicoDetallista && (
          <div className="space-y-4">
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Proveedores más comprados</h3>
              {topSuppliers.map(supplier => (
                <div key={supplier.id} className="flex items-center justify-between p-3 border-b">
                  <div>
                    <p className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>{supplier.name}</p>
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>{supplier.purchases} compras</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: PALETTE.maastrichtBlue }}>${supplier.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================================
            CARTERA - Mayorista
        ========================================================== */}
        {activeTab === "portfolio" && isJuridicoMayorista && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <KPICard title="Cartera total" value={`$${(portfolioStatus.onTime + portfolioStatus.atRisk + portfolioStatus.default).toLocaleString()}`} icon={<CreditCard className="h-5 w-5" />} color={PALETTE.crystalBlue} />
              <KPICard title="Al día" value={`$${portfolioStatus.onTime.toLocaleString()}`} icon={<Shield className="h-5 w-5" />} color="#10B981" />
              <KPICard title="En riesgo + mora" value={`$${(portfolioStatus.atRisk + portfolioStatus.default).toLocaleString()}`} icon={<AlertTriangle className="h-5 w-5" />} color="#F59E0B" />
            </div>
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Facturas abiertas</h3>
              {openInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 border-b">
                  <div>
                    <p className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>Factura {inv.id}</p>
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>{inv.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: PALETTE.maastrichtBlue }}>${inv.amount}</p>
                    <p className={`text-xs ${inv.daysLeft <= 5 ? 'text-red-500' : 'text-gray-500'}`}>Vence en {inv.daysLeft} días</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================================
            CLIENTES - Mayorista
        ========================================================== */}
        {activeTab === "clients" && isJuridicoMayorista && (
          <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}><Users className="h-5 w-5" /> Análisis de clientes</h3>
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="p-4 rounded-xl" style={{ backgroundColor: PALETTE.page }}><p className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>23</p><p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Clientes activos</p></div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: PALETTE.page }}><p className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>8</p><p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Nuevos este mes</p></div>
            </div>
            {topClients.map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 border-b">
                <div>
                  <p className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>{client.name}</p>
                  <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>${client.amount.toLocaleString()} en compras</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs ${client.risk === 'low' ? 'bg-green-100 text-green-700' : client.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {client.risk === 'low' ? '✓ Cumplidor' : client.risk === 'medium' ? '⚠️ Atención' : '🔴 Crítico'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==========================================================
            CANAL - Mayorista
        ========================================================== */}
        {activeTab === "channel" && isJuridicoMayorista && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}><Shield className="h-5 w-5" /> Disciplina del canal</h3>
              <div className="space-y-4">
                <div><div className="flex justify-between text-sm"><span>Clientes disciplinados</span><span>{channelDiscipline.disciplinedPercentage}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 rounded-full h-2" style={{ width: `${channelDiscipline.disciplinedPercentage}%` }}></div></div></div>
                <div><div className="flex justify-between text-sm"><span>Clientes sancionados</span><span>{channelDiscipline.sanctionedPercentage}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-red-500 rounded-full h-2" style={{ width: `${channelDiscipline.sanctionedPercentage}%` }}></div></div></div>
              </div>
              <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                <p className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>📊 Evolución del canal</p>
                <p className="text-sm mt-1" style={{ color: PALETTE.crystalBlue }}>El canal mejoró 12% en cumplimiento este mes</p>
              </div>
            </div>
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}><Bell className="h-5 w-5" /> Recomendaciones</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center"><Zap className="h-4 w-4 text-yellow-600" /></div>
                  <div><p className="font-semibold text-sm" style={{ color: PALETTE.maastrichtBlue }}>Incentivar a buenos pagadores</p><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Ofrece mejores condiciones a clientes con +90% cumplimiento</p></div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
                  <div><p className="font-semibold text-sm" style={{ color: PALETTE.maastrichtBlue }}>Revisar clientes en mora</p><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Tienes 3 clientes con más de 15 días de retraso</p></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            CONFIGURACIÓN - Todos
        ========================================================== */}
        {activeTab === "settings" && (
          <div className="space-y-3">
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Preferencias de cuenta</h3>
              <div className="space-y-3">
                <button className="flex w-full items-center justify-between rounded-xl p-3 hover:bg-gray-50 transition-colors">
                  <span style={{ color: PALETTE.maastrichtBlue }}>Cambiar contraseña</span>
                  <ChevronRight className="h-5 w-5" style={{ color: PALETTE.crystalBlue }} />
                </button>
              </div>
            </div>
            <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.maastrichtBlue }}>Preferencias de visualización</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ color: PALETTE.maastrichtBlue }}>Idioma</span>
                  <select className="rounded-lg border px-3 py-1" style={{ borderColor: PALETTE.pastelGray }}>
                    <option>Español</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: PALETTE.maastrichtBlue }}>Moneda preferida</span>
                  <select className="rounded-lg border px-3 py-1" style={{ borderColor: PALETTE.pastelGray }}>
                    <option>USD ($)</option>
                    <option>VES (Bs.)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}