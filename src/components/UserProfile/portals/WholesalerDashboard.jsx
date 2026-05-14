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
  ChevronUp,
  ChevronDown,
  Download,
  FileText,
  Filter,
  Gauge,
  History,
  Inbox,
  LayoutDashboard,
  LogOut,
  Package,
  PackageOpen,
  Plus,
  Upload,
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
  const [periodStart, setPeriodStart] = useState("2026-05-01");
  const [periodEnd, setPeriodEnd] = useState("2026-05-31");
  const [calendarMonth, setCalendarMonth] = useState("2026-05");
  const [isPeriodCalendarOpen, setIsPeriodCalendarOpen] = useState(false);
  const [salesSort, setSalesSort] = useState("desc");
  const [salesMetric, setSalesMetric] = useState("volume");
  const [clientSort, setClientSort] = useState("amountDesc");
  const [clientSellerFilter, setClientSellerFilter] = useState("all");
  const [performanceSort, setPerformanceSort] = useState("amountDesc");
  const [performanceSellerFilter, setPerformanceSellerFilter] = useState("all");
  const [invoiceSellerFilter, setInvoiceSellerFilter] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedUrbanization, setSelectedUrbanization] = useState("all");
  const [invoiceDueSort, setInvoiceDueSort] = useState("soonest");
  const [invoiceGroupByClient, setInvoiceGroupByClient] = useState(false);
  const [cashflowSellerFilter, setCashflowSellerFilter] = useState("all");
  const [activeDisciplineView, setActiveDisciplineView] = useState("own");
  const [activeOrdersView, setActiveOrdersView] = useState("accept");
  const [activeInventoryTab, setActiveInventoryTab] = useState("inventory");
  const [openLegendSections, setOpenLegendSections] = useState({});
  const [openFilterSections, setOpenFilterSections] = useState({
    salesVolume: true,
    clientAnalysis: true,
    performance: true,
  });
  const [salesProductFilter, setSalesProductFilter] = useState("all");
  const [salesCategoryFilter, setSalesCategoryFilter] = useState("all");
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("all");
  const [selectedClientName, setSelectedClientName] = useState("all");
  const [showInvoiceFilters, setShowInvoiceFilters] = useState(true);
  const [productSort, setProductSort] = useState("mostSold");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [receivedOrders, setReceivedOrders] = useState([
    {
      id: 1,
      orderNumber: "PED-2026-001",
      productName: "Taladro percutor industrial",
      buyer: "Ferretería El Constructor",
      buyerType: "Detallista",
      zone: "Centro",
      seller: "María Gómez",
      quantity: 10,
      offeredPrice: 8500,
      status: "pending",
      date: "2026-05-03",
      message: "Necesito 10 unidades para reposición semanal.",
      items: [
        { sku: "THO-TAL-001", name: "Taladro percutor industrial", unitPrice: 8500, quantity: 10 },
        { sku: "THO-BRO-010", name: "Set de brocas", unitPrice: 280, quantity: 12 },
      ],
    },
    {
      id: 2,
      orderNumber: "PED-2026-002",
      productName: "Juego de llaves combinadas",
      buyer: "Pinturas del Centro",
      buyerType: "Detallista",
      zone: "Norte",
      seller: "Carlos Díaz",
      quantity: 18,
      offeredPrice: 1250,
      status: "pending",
      date: "2026-05-04",
      message: "Compra recurrente para sucursal Caracas.",
      items: [
        { sku: "THO-LLA-002", name: "Juego de llaves combinadas", unitPrice: 1250, quantity: 18 },
        { sku: "THO-GUA-003", name: "Guantes anticorte", unitPrice: 220, quantity: 20 },
      ],
    },
  ]);
  const [orderHistory, setOrderHistory] = useState([
    { id: 101, productName: "Casco de seguridad premium", buyer: "Ferretería Central", quantity: 20, totalAmount: 10000, status: "completed", date: "2026-04-29" },
    { id: 102, productName: "Cinta métrica láser", buyer: "Materiales El Ávila", quantity: 15, totalAmount: 8900, status: "completed", date: "2026-04-27" },
  ]);


  const [dispatchOrders, setDispatchOrders] = useState([
    {
      id: 301,
      orderNumber: "PED-2026-010",
      buyer: "Materiales El Ávila",
      zone: "Centro",
      seller: "María Gómez",
      status: "to_dispatch",
      date: "2026-05-05",
      items: [
        { sku: "THO-CAS-003", name: "Casco de seguridad premium", unitPrice: 500, quantity: 20 },
        { sku: "THO-GUA-003", name: "Guantes anticorte", unitPrice: 220, quantity: 40 },
      ],
    },
    {
      id: 302,
      orderNumber: "PED-2026-011",
      buyer: "Ferretería Central",
      zone: "Sur",
      seller: "Luis Pérez",
      status: "dispatched",
      date: "2026-04-27",
      dispatchedAt: "2026-04-28",
      paymentDueAt: "2026-05-28",
      items: [
        { sku: "THO-CIN-005", name: "Cinta métrica láser", unitPrice: 593, quantity: 15 },
      ],
    },
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
      zone: "Centro",
      seller: "María Gómez",
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
      zone: "Norte",
      seller: "Carlos Díaz",
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
      zone: "Oeste",
      seller: "Luis Pérez",
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
      zone: "Sur",
      seller: "Luis Pérez",
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
      zone: "Norte",
      seller: "Carlos Díaz",
      thoGenerated: true,
    },
  ];

  const invoices = [
    { id: 101, client: "Ferretería El Constructor", invoiceNumber: "FAC-2026-001", orderNumber: "PED-2026-001", amount: 15600, dueDate: "2026-05-15", status: "pending", coveredByTHO: false, coverageHours: 0, zone: "Centro", seller: "María Gómez" },
    { id: 102, client: "Ferretería El Constructor", invoiceNumber: "FAC-2026-002", orderNumber: "PED-2026-003", amount: 4500, dueDate: "2026-05-22", status: "pending", coveredByTHO: false, coverageHours: 0, zone: "Centro", seller: "María Gómez" },
    { id: 201, client: "Pinturas del Centro", invoiceNumber: "FAC-2026-006", orderNumber: "PED-2026-002", amount: 12500, dueDate: "2026-05-20", status: "pending", coveredByTHO: false, coverageHours: 0, zone: "Norte", seller: "Carlos Díaz" },
    { id: 301, client: "FerreNova Retail", invoiceNumber: "FAC-2026-010", orderNumber: "PED-2026-007", amount: 8450, dueDate: "2026-04-05", status: "overdue", coveredByTHO: true, coverageHours: 18, zone: "Oeste", seller: "Luis Pérez" },
    { id: 501, client: "Materiales El Ávila", invoiceNumber: "FAC-2026-016", orderNumber: "PED-2026-012", amount: 8900, dueDate: "2026-06-25", status: "pending", coveredByTHO: false, coverageHours: 0, zone: "Centro", seller: "María Gómez" },
    { id: 601, client: "Ferretería Central", invoiceNumber: "FAC-2026-020", orderNumber: "PED-2026-011", amount: 12500, dueDate: "2026-04-29", status: "covered", coveredByTHO: true, coverageHours: 22, zone: "Sur", seller: "Luis Pérez" },
  ];

  const collectionFlow = [
    { date: "2026-05-04", expected: 12500, real: 34500, invoiceNumber: "FAC-2026-020", orderNumber: "PED-2026-011", client: "Ferretería Central", zone: "Sur", seller: "Luis Pérez" },
    { date: "2026-05-05", expected: 8900, real: 7200, invoiceNumber: "FAC-2026-016", orderNumber: "PED-2026-012", client: "Materiales El Ávila", zone: "Centro", seller: "María Gómez" },
    { date: "2026-05-06", expected: 15600, real: 0, invoiceNumber: "FAC-2026-001", orderNumber: "PED-2026-001", client: "Ferretería El Constructor", zone: "Centro", seller: "María Gómez" },
    { date: "2026-05-07", expected: 7200, real: 0, invoiceNumber: "FAC-2026-002", orderNumber: "PED-2026-003", client: "Ferretería El Constructor", zone: "Centro", seller: "María Gómez" },
    { date: "2026-05-08", expected: 23400, real: 0, invoiceNumber: "FAC-2026-006", orderNumber: "PED-2026-002", client: "Pinturas del Centro", zone: "Norte", seller: "Carlos Díaz" },
  ];

  const discipline = {
    blockedClients: 7,
    reinstatements: 3,
    avgOverdueDays: 11.8,
    disciplinedPercent: 82,
    sanctionedPercent: 18,
    ownDelinquents: [
      { name: "FerreNova Retail", status: "Bloqueado", overdueDays: 12, zone: "Oeste", seller: "Luis Pérez", action: "Bloqueado por mora con este mayorista" },
      { name: "Pinturas del Centro", status: "Observación", overdueDays: 5, zone: "Norte", seller: "Carlos Díaz", action: "Monitorear próxima factura" },
    ],
    platformDelinquents: [
      { name: "Suministros La 33", status: "Sancionado", overdueDays: 18, zone: "Centro", seller: "Otro mayorista", action: "Moroso con otro mayorista" },
      { name: "FerreBarinas", status: "Bloqueado", overdueDays: 21, zone: "Sur", seller: "Otro mayorista", action: "Bloqueo de plataforma" },
      { name: "Materiales Plus", status: "Sancionado", overdueDays: 9, zone: "Este", seller: "Otro mayorista", action: "Evaluar antes de vender" },
    ],
  };

  const salesByPeriod = [
    { label: "Día", amount: 12500 },
    { label: "Semana", amount: 78450 },
    { label: "Mes", amount: 245800 },
  ];

  const salesRegions = ["Centro", "Norte", "Sur", "Este", "Oeste"];

  const locationData = [
    {
      state: "Carabobo",
      zone: "Centro",
      cities: [
        { name: "Valencia", zone: "Centro", urbanizations: ["El Viñedo", "Prebo", "La Trigaleña"] },
        { name: "San Diego", zone: "Centro", urbanizations: ["Los Jarales", "Monteserino", "La Esmeralda"] },
      ],
    },
    {
      state: "Distrito Capital",
      zone: "Norte",
      cities: [
        { name: "Caracas", zone: "Norte", urbanizations: ["Chacao", "La Urbina", "Catia"] },
        { name: "Baruta", zone: "Norte", urbanizations: ["Las Mercedes", "Prados del Este", "Santa Fe"] },
      ],
    },
    {
      state: "Lara",
      zone: "Sur",
      cities: [
        { name: "Barquisimeto", zone: "Sur", urbanizations: ["Centro", "Cabudare", "La Mora"] },
        { name: "Quíbor", zone: "Sur", urbanizations: ["Casco Central", "El Molino", "La Ceiba"] },
      ],
    },
    {
      state: "Zulia",
      zone: "Oeste",
      cities: [
        { name: "Maracaibo", zone: "Oeste", urbanizations: ["Cecilio Acosta", "La Limpia", "Bella Vista"] },
        { name: "San Francisco", zone: "Oeste", urbanizations: ["Sierra Maestra", "El Bajo", "San Felipe"] },
      ],
    },
    {
      state: "Anzoátegui",
      zone: "Este",
      cities: [
        { name: "Barcelona", zone: "Este", urbanizations: ["Nueva Barcelona", "Lechería", "El Moriche"] },
        { name: "Puerto La Cruz", zone: "Este", urbanizations: ["Guanire", "Pozuelos", "El Paraíso"] },
      ],
    },
  ];

  const sellers = [
    { name: "María Gómez", zone: "Centro", amount: 64300, orders: 41, assistedPercent: 92 },
    { name: "Carlos Díaz", zone: "Norte", amount: 51400, orders: 35, assistedPercent: 88 },
    { name: "Luis Pérez", zone: "Sur", amount: 37800, orders: 27, assistedPercent: 74 },
    { name: "Ana Rivas", zone: "Este", amount: 32900, orders: 24, assistedPercent: 81 },
    { name: "Pedro Castillo", zone: "Oeste", amount: 29400, orders: 19, assistedPercent: 76 },
    { name: "TH.O automático", zone: "Todas", amount: 92300, orders: 62, assistedPercent: 0 },
  ];

  const selectedStateData = locationData.find((item) => item.state === selectedState);
  const availableCities = selectedStateData?.cities || [];
  const selectedCityData = availableCities.find((city) => city.name === selectedCity);
  const availableUrbanizations = selectedCityData?.urbanizations || [];

  const selectedLocationZone =
    selectedUrbanization !== "all" && selectedCityData
      ? selectedCityData.zone
      : selectedCity !== "all" && selectedCityData
      ? selectedCityData.zone
      : selectedState !== "all" && selectedStateData
      ? selectedStateData.zone
      : "all";

  const filteredSellersByLocation = sellers.filter(
    (seller) =>
      seller.name === "TH.O automático" ||
      selectedLocationZone === "all" ||
      seller.zone === selectedLocationZone
  );

  const getLocationLabel = (fallbackZone = "") => {
    if (selectedUrbanization !== "all") return selectedUrbanization;
    if (selectedCity !== "all") return selectedCity;
    if (selectedState !== "all") return selectedState;
    return fallbackZone || "Todas";
  };

  const buildExcelTable = (sheetName, rows) => {
    const headers = rows?.length ? Object.keys(rows[0]) : ["Sin datos"];
    const escapeCell = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const tableRows = rows?.length
      ? rows
          .map(
            (row) =>
              `<tr>${headers.map((header) => `<td>${escapeCell(row[header])}</td>`).join("")}</tr>`
          )
          .join("")
      : `<tr><td>No hay datos para exportar.</td></tr>`;

    return `
      <table>
        <thead>
          <tr><th colspan="${headers.length}" class="sheet-title">${escapeCell(sheetName)}</th></tr>
          <tr>${headers.map((header) => `<th>${escapeCell(header)}</th>`).join("")}</tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
  };

  const downloadExcelWorkbook = (reportName, sheets) => {
    const workbook = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
          <style>
            table {
              border-collapse: collapse;
              font-family: Arial, sans-serif;
              font-size: 12pt;
              text-align: left;
              margin-bottom: 28px;
              width: 100%;
            }
            .sheet-title {
              background: #091A2D;
              color: #FFFFFF;
              font-weight: bold;
              border: 1px solid #D6D0C4;
              padding: 8px;
            }
            th {
              background: #FEDC00;
              color: #091A2D;
              font-weight: bold;
              border: 1px solid #D6D0C4;
              padding: 8px;
            }
            td {
              border: 1px solid #D6D0C4;
              padding: 8px;
            }
          </style>
        </head>
        <body>
          ${sheets.map((sheet) => buildExcelTable(sheet.name, sheet.rows)).join("<br/>")}
        </body>
      </html>
    `;

    const blob = new Blob([workbook], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToExcel = (reportName, rows) => {
    if (!rows?.length) {
      alert("No hay datos para exportar.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const escapeCell = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const tableRows = rows
      .map(
        (row) =>
          `<tr>${headers.map((header) => `<td>${escapeCell(row[header])}</td>`).join("")}</tr>`
      )
      .join("");

    const workbook = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12pt;
              text-align: left; }
            th { background: #FEDC00; color: #091A2D; font-weight: bold; border: 1px solid #D6D0C4; padding: 8px; }
            td { border: 1px solid #D6D0C4; padding: 8px; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map((header) => `<th>${escapeCell(header)}</th>`).join("")}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([workbook], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  function LegendBox({ items, title = "Cómo se calcula", id = "general" }) {
    const isOpen = openLegendSections[id] || false;

    return (
      <div className="rounded-xl border bg-blue-50/70" style={{ borderColor: "#BFDBFE" }}>
        <button
          type="button"
          onClick={() =>
            setOpenLegendSections((prev) => ({
              ...prev,
              [id]: !prev[id],
            }))
          }
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs font-black text-blue-800"
        >
          <span>{title}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {isOpen && (
          <div className="px-3 pb-3 text-xs text-blue-800">
            <ul className="list-disc space-y-1 pl-4">
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthLabel = () => {
    const [year, month] = calendarMonth.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const moveCalendarMonth = (direction) => {
    const [year, month] = calendarMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    setCalendarMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  };

  const getCalendarDays = () => {
    const [year, month] = calendarMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const days = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month - 1, day));
    }

    return days;
  };

  const isDateInRange = (dateString) => {
    if (!periodStart || !periodEnd) return false;

    const current = new Date(`${dateString}T00:00:00`);
    const start = new Date(`${periodStart}T00:00:00`);
    const end = new Date(`${periodEnd}T00:00:00`);
    const from = start <= end ? start : end;
    const to = start <= end ? end : start;

    return current >= from && current <= to;
  };

  const handleCalendarDayClick = (date) => {
    const value = toInputDate(date);

    if (!periodStart || periodEnd) {
      setPeriodStart(value);
      setPeriodEnd("");
      return;
    }

    if (value === periodStart) {
      setPeriodEnd("");
      return;
    }

    setPeriodEnd(value);
  };

  const resetPeriodSelection = () => {
    setPeriodStart("");
    setPeriodEnd("");
  };

  const resetSalesVolumeFilters = () => {
    setPeriodStart("2026-05-01");
    setPeriodEnd("2026-05-31");
    setSalesSort("desc");
    setSalesMetric("volume");
    setSalesProductFilter("all");
    setSalesCategoryFilter("all");
    setSelectedState("all");
    setSelectedCity("all");
    setSelectedUrbanization("all");
  };

  const resetClientFilters = () => {
    setPeriodStart("2026-05-01");
    setPeriodEnd("2026-05-31");
    setClientSellerFilter("all");
    setClientSort("amountDesc");
    setSelectedState("all");
    setSelectedCity("all");
    setSelectedUrbanization("all");
  };

  const resetPerformanceFilters = () => {
    setPeriodStart("2026-05-01");
    setPeriodEnd("2026-05-31");
    setPerformanceSellerFilter("all");
    setPerformanceSort("amountDesc");
    setSelectedState("all");
    setSelectedCity("all");
    setSelectedUrbanization("all");
  };

  function LocationFilters({ compact = false }) {
    return (
      <>
        <select
          value={selectedState}
          onChange={(event) => {
            setSelectedState(event.target.value);
            setSelectedCity("all");
            setSelectedUrbanization("all");
            setClientSellerFilter("all");
            setPerformanceSellerFilter("all");
            setInvoiceSellerFilter("all");
            setCashflowSellerFilter("all");
          }}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: PALETTE.pastelGray }}
        >
          <option value="all">Estado</option>
          {locationData.map((location) => (
            <option key={location.state} value={location.state}>
              {location.state}
            </option>
          ))}
        </select>

        <select
          value={selectedCity}
          onChange={(event) => {
            setSelectedCity(event.target.value);
            setSelectedUrbanization("all");
            setClientSellerFilter("all");
            setPerformanceSellerFilter("all");
            setInvoiceSellerFilter("all");
            setCashflowSellerFilter("all");
          }}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: PALETTE.pastelGray }}
          disabled={selectedState === "all"}
        >
          <option value="all">Ciudad</option>
          {availableCities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>

        <select
          value={selectedUrbanization}
          onChange={(event) => {
            setSelectedUrbanization(event.target.value);
            setClientSellerFilter("all");
            setPerformanceSellerFilter("all");
            setInvoiceSellerFilter("all");
            setCashflowSellerFilter("all");
          }}
          className="w-full rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: PALETTE.pastelGray }}
          disabled={selectedCity === "all"}
        >
          <option value="all">Urbanización</option>
          {availableUrbanizations.map((urbanization) => (
            <option key={urbanization} value={urbanization}>
              {urbanization}
            </option>
          ))}
        </select>
      </>
    );
  }

  function CollapsibleFilterSection({ id, title, icon, children }) {
    const isOpen = openFilterSections[id] ?? true;

    return (
      <SectionCard
        title={title}
        icon={icon}
        action={
          <button
            type="button"
            onClick={() =>
              setOpenFilterSections((prev) => ({
                ...prev,
                [id]: !isOpen,
              }))
            }
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition hover:bg-gray-50"
            style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
          >
            {isOpen ? "Ocultar filtros" : "Mostrar filtros"}
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        }
      >
        {isOpen && children}
      </SectionCard>
    );
  }

  function PeriodFilter() {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsPeriodCalendarOpen((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-left text-sm"
          style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
        >
          <span>{selectedRangeDate || "Seleccionar período"}</span>
          <Calendar className="h-4 w-4 text-gray-500" />
        </button>

        {isPeriodCalendarOpen && (
          <div className="absolute left-0 top-12 z-40 w-[320px] rounded-xl border bg-white p-3 shadow-2xl" style={{ borderColor: PALETTE.pastelGray }}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => moveCalendarMonth(-1)} className="rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-gray-100" style={{ color: PALETTE.maastrichtBlue }}>‹</button>
              <p className="text-sm font-black capitalize" style={{ color: PALETTE.maastrichtBlue }}>{getMonthLabel()}</p>
              <button type="button" onClick={() => moveCalendarMonth(1)} className="rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-gray-100" style={{ color: PALETTE.maastrichtBlue }}>›</button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-500">
              {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((day) => <span key={day}>{day}</span>)}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {getCalendarDays().map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="h-8" />;

                const dateString = toInputDate(date);
                const isStart = dateString === periodStart;
                const isEnd = dateString === periodEnd;
                const isInRange = isDateInRange(dateString);

                return (
                  <button
                    key={dateString}
                    type="button"
                    onClick={() => handleCalendarDayClick(date)}
                    className="h-8 rounded-lg text-xs font-bold transition-all"
                    style={{
                      backgroundColor: isStart || isEnd ? PALETTE.sizzlingSunrise : isInRange ? "#FFF7C2" : PALETTE.white,
                      color: PALETTE.maastrichtBlue,
                      border: isStart || isEnd ? `1px solid ${PALETTE.sizzlingSunrise}` : `1px solid ${PALETTE.pastelGray}`,
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
              Primer clic: fecha inicial. Segundo clic: fecha final. Para un solo día, selecciona solo una fecha.
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={resetPeriodSelection}
                className="rounded-xl border px-4 py-2 text-sm font-black transition hover:bg-gray-50"
                style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
              >
                Refrescar fecha
              </button>

              <button
                type="button"
                onClick={() => setIsPeriodCalendarOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-black transition hover:opacity-90"
                style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
              >
                Confirmar fecha
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }


  function MiniExcel({ columns, rows, maxHeight = "318px", emptyMessage = "No hay datos para mostrar." }) {
    return (
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: PALETTE.softBorder }}>
        <div className="overflow-auto" style={{ maxHeight }}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-3 py-2 text-left text-xs font-black uppercase tracking-wide text-gray-500">{column.label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-sm text-gray-500">{emptyMessage}</td></tr>
              ) : rows.map((row, index) => (
                <tr key={row.id || row.key || index} className="hover:bg-yellow-50/40">
                  {columns.map((column) => <td key={column.key} className="whitespace-nowrap px-3 py-2 text-gray-700">{column.render ? column.render(row) : row[column.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const formatDateShort = (dateString) => {
    if (!dateString) return "Sin fecha";
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRangeDays = () => {
    if (!periodStart && !periodEnd) return 0;
    const startValue = periodStart || periodEnd;
    const endValue = periodEnd || periodStart;
    const start = new Date(`${startValue}T00:00:00`);
    const end = new Date(`${endValue}T00:00:00`);
    return Math.abs(Math.round((end - start) / (1000 * 60 * 60 * 24))) + 1;
  };

  const selectedRangeLabel =
    getRangeDays() >= 28 ? "Mes" : getRangeDays() >= 7 ? "Semana" : getRangeDays() > 1 ? "Rango" : "Día";

  const selectedRangeDate =
    periodStart === periodEnd || !periodEnd
      ? formatDateShort(periodStart)
      : `${formatDateShort(periodStart)} - ${formatDateShort(periodEnd)}`;

  const salesVolumeRows = productsData.flatMap((product) => {
    const dayFactor = product.sellerOrigin === "TH.O" ? 0.08 : 0.05;
    const weekFactor = product.sellerOrigin === "TH.O" ? 0.34 : 0.28;

    const periodFactor = Math.min(Math.max(getRangeDays(), 1) / 31, 1);

    const baseAmount = Math.round(product.revenue * periodFactor);
    const baseUnits = Math.round(product.unitsSold * periodFactor);

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
    const matchesRegion = selectedLocationZone === "all" || row.region === selectedLocationZone;

    return matchesProduct && matchesCategory && matchesRegion;
  });

  const filteredSalesVolumeRows =
    selectedLocationZone === "all"
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


  const sortedSalesRows = [...filteredSalesVolumeRows].sort((a, b) => {
    const keyA = salesMetric === "profitability" ? a.margin || 0 : a.salesAmount || 0;
    const keyB = salesMetric === "profitability" ? b.margin || 0 : b.salesAmount || 0;
    return salesSort === "desc" ? keyB - keyA : keyA - keyB;
  });

  const periodSalesMultiplier = Math.min(Math.max(getRangeDays(), 1) / 31, 1);

  const locationOriginPercentMap = {
    Centro: 62,
    Norte: 54,
    Sur: 48,
    Este: 57,
    Oeste: 43,
  };

  const thoOriginPercentBase =
    selectedLocationZone === "all"
      ? summary.thoSalesPercent
      : locationOriginPercentMap[selectedLocationZone] || summary.thoSalesPercent;

  const salesSellerRows = sellers
    .filter(
      (seller) =>
        seller.name !== "TH.O automático" &&
        (selectedLocationZone === "all" || seller.zone === selectedLocationZone)
    )
    .map((seller) => {
      const amount = Math.round(seller.amount * periodSalesMultiplier);

      return {
        ...seller,
        amount,
        orders: Math.max(1, Math.round(seller.orders * periodSalesMultiplier)),
        zone: getLocationLabel(seller.zone),
      };
    });

  const sellerOriginAmount = salesSellerRows.reduce((sum, seller) => sum + seller.amount, 0);
  const thoOriginAmount = Math.round(
    salesVolumeTotal * (thoOriginPercentBase / 100) * (selectedLocationZone === "all" ? 1 : 0.95)
  );
  const originTotalAmount = Math.max(thoOriginAmount + sellerOriginAmount, 1);
  const thoOriginPercent = Math.round((thoOriginAmount / originTotalAmount) * 100);
  const sellerOriginPercent = 100 - thoOriginPercent;

  const salesSellerTotal = Math.max(...salesSellerRows.map((seller) => seller.amount), 1);

  const filteredClientRows = clients
    .filter((client) => selectedLocationZone === "all" || client.zone === selectedLocationZone)
    .filter((client) => clientSellerFilter === "all" || client.seller === clientSellerFilter)
    .sort((a, b) => {
      if (clientSort === "amountDesc") return b.totalAmount - a.totalAmount;
      if (clientSort === "amountAsc") return a.totalAmount - b.totalAmount;
      if (clientSort === "ordersDesc") return b.totalPurchases - a.totalPurchases;
      if (clientSort === "ordersAsc") return a.totalPurchases - b.totalPurchases;
      return 0;
    });

  const avgOrdersInPeriod = filteredClientRows.length
    ? filteredClientRows.reduce((sum, client) => sum + client.totalPurchases, 0) / filteredClientRows.length
    : 0;

  const clientPeriodMultiplier = Math.min(Math.max(getRangeDays(), 1) / 31, 1);

  const adjustedClientRows = filteredClientRows.map((client) => ({
    ...client,
    periodAmount: Math.round(client.totalAmount * clientPeriodMultiplier),
    periodPurchases: Math.max(1, Math.round(client.totalPurchases * clientPeriodMultiplier)),
  }));

  const filteredSellers = sellers
    .filter((seller) => selectedLocationZone === "all" || seller.zone === selectedLocationZone || seller.zone === "Todas")
    .filter((seller) => performanceSellerFilter === "all" || seller.name === performanceSellerFilter)
    .sort((a, b) => {
      if (performanceSort === "amountDesc") return b.amount - a.amount;
      if (performanceSort === "amountAsc") return a.amount - b.amount;
      if (performanceSort === "ordersDesc") return b.orders - a.orders;
      if (performanceSort === "ordersAsc") return a.orders - b.orders;
      return 0;
    });

  const filteredInvoiceRows = invoices
    .filter((invoice) => selectedLocationZone === "all" || invoice.zone === selectedLocationZone)
    .filter((invoice) => invoiceSellerFilter === "all" || invoice.seller === invoiceSellerFilter)
    .filter((invoice) => {
      const matchesSearch = !invoiceSearchTerm || invoice.client.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) || invoice.invoiceNumber.toLowerCase().includes(invoiceSearchTerm.toLowerCase());
      const matchesStatus = invoiceStatusFilter === "all" || invoice.status === invoiceStatusFilter || (invoiceStatusFilter === "risk" && ["overdue", "covered"].includes(invoice.status));
      const matchesClient = selectedClientName === "all" || invoice.client === selectedClientName;
      return matchesSearch && matchesStatus && matchesClient;
    })
    .sort((a, b) => {
      const diff = new Date(`${a.dueDate}T00:00:00`) - new Date(`${b.dueDate}T00:00:00`);
      return invoiceDueSort === "soonest" ? diff : -diff;
    });

  const groupedInvoiceRows = invoiceGroupByClient
    ? Object.values(filteredInvoiceRows.reduce((acc, invoice) => {
        if (!acc[invoice.client]) {
          acc[invoice.client] = { id: invoice.client, client: invoice.client, invoiceNumber: `${invoice.client} (0)`, orderNumber: "Agrupado", amount: 0, dueDate: invoice.dueDate, status: "Agrupado", zone: invoice.zone, seller: invoice.seller, invoiceCount: 0 };
        }
        acc[invoice.client].amount += invoice.amount;
        acc[invoice.client].invoiceCount += 1;
        acc[invoice.client].invoiceNumber = `${invoice.client} (${acc[invoice.client].invoiceCount} facturas)`;
        if (new Date(`${invoice.dueDate}T00:00:00`) < new Date(`${acc[invoice.client].dueDate}T00:00:00`)) acc[invoice.client].dueDate = invoice.dueDate;
        return acc;
      }, {}))
    : filteredInvoiceRows;

  const filteredCollectionFlow = collectionFlow
    .filter((item) => selectedLocationZone === "all" || item.zone === selectedLocationZone)
    .filter((item) => cashflowSellerFilter === "all" || item.seller === cashflowSellerFilter)
    .filter((item) => item.date >= periodStart && item.date <= periodEnd);

  const inventoryOnlyProducts = filteredInventoryProducts.map((product) => {
    const avgDailySales = Math.max(product.unitsSold / 30, 1);
    return { ...product, avgDailySales, stockDaysLeft: Math.round(product.stock / avgDailySales) };
  });

  const acceptOrders = receivedOrders.filter((order) => order.status === "pending");
  const toDispatchOrders = dispatchOrders.filter((order) => order.status === "to_dispatch");
  const dispatchedOrders = dispatchOrders.filter((order) => order.status === "dispatched");

  const markOrderAsDispatched = (orderId) => {
    const today = new Date().toISOString().split("T")[0];
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setDispatchOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: "dispatched", dispatchedAt: today, paymentDueAt: due.toISOString().split("T")[0] } : order));
  };

  const handleOrderAction = (orderId, action) => {
    const order = receivedOrders.find((item) => item.id === orderId);
    if (!order) return;

    if (action === "accept") {
      setDispatchOrders((prev) => [
        {
          id: Date.now(),
          orderNumber: order.orderNumber || `PED-${Date.now()}`,
          productName: order.productName,
          buyer: order.buyer,
          zone: order.zone,
          seller: order.seller,
          items: order.items || [{ name: order.productName, unitPrice: order.offeredPrice, quantity: order.quantity }],
          status: "to_dispatch",
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
    { id: "products", label: "Inventario y stock", icon: Package },
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

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "volume", title: "Volumen de ventas", icon: BarChart3 },
                  { id: "clients", title: "Análisis de clientes", icon: Users },
                  { id: "performance", title: "Performance comercial", icon: TrendingUp },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSalesTab(tab.id)}
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      style={{
                        borderColor: activeSalesTab === tab.id ? PALETTE.sizzlingSunrise : PALETTE.softBorder,
                        backgroundColor: activeSalesTab === tab.id ? PALETTE.sizzlingSunrise : PALETTE.white,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.title}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {activeSalesTab === "volume" && (
              <div className="space-y-5">
                <CollapsibleFilterSection
                  id="salesVolume"
                  title="Volumen de ventas"
                  icon={<BarChart3 className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
                >
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-500">
                        Lista de productos con ventas por período, categoría y ubicación.
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Período seleccionado: <strong>{selectedRangeLabel}</strong> · {selectedRangeDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetSalesVolumeFilters}
                      className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition hover:bg-gray-50"
                      style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
                    >
                      Limpiar filtros
                    </button>

                    <button
                      onClick={() => exportToExcel("ventas_producto", sortedSalesRows.map((row) => ({
                        Producto: row.name,
                        Categoría: row.category,
                        Ubicación: getLocationLabel(row.region),
                        Origen: row.sellerOrigin,
                        Unidades: row.salesUnits,
                        Ventas: formatUSD(row.salesAmount),
                        "% Venta total": `${salesVolumeTotal > 0 ? ((row.salesAmount / salesVolumeTotal) * 100).toFixed(1) : "0.0"}%`,
                        Utilidad: formatUSD(row.margin || 0),
                      })))}
                      className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold"
                      style={{ color: PALETTE.maastrichtBlue }}
                    >
                      <Download className="mr-1 h-4 w-4" /> Excel
                    </button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="w-full">
                      <PeriodFilter />
                    </div>

                    <select
                      value={salesSort}
                      onChange={(event) => setSalesSort(event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="desc">Mayor a menor</option>
                      <option value="asc">Menor a mayor</option>
                    </select>

                    <select
                      value={salesMetric}
                      onChange={(event) => setSalesMetric(event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="volume">Volumen</option>
                      <option value="profitability">Rentabilidad</option>
                    </select>

                    <select
                      value={salesCategoryFilter}
                      onChange={(event) => setSalesCategoryFilter(event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="all">Todas las categorías</option>
                      {[...new Set(productsData.map((product) => product.category))].map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    <LocationFilters />
                  </div>
                  <div className="mt-3">
                    <LegendBox id="ventas-volumen" items={["Ventas = unidades vendidas por precio estimado.", "Utilidad = ventas menos costo. Si no hay costo, queda en 0.", "Los filtros de ubicación afectan totales y filas para que cuadren los montos."]} />
                  </div>

                </CollapsibleFilterSection>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard
                    title={`Ventas del ${selectedRangeLabel.toLowerCase()}`}
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
                    title="Utilidad generada"
                    value={formatUSD(sortedSalesRows.reduce((sum, product) => sum + (product.margin || 0), 0))}
                    subtitle="Ventas - costo registrado"
                    icon={<TrendingUp className="h-5 w-5" />}
                    color={PALETTE.success}
                  />
                  <KPICard
                    title="Ubicaciones activas"
                    value={new Set(filteredSalesVolumeRows.map((product) => product.region)).size}
                    icon={<Store className="h-5 w-5" />}
                    color={PALETTE.warning}
                  />
                </div>

                <div className="space-y-5">
                  <SectionCard
                    title={`Ventas por producto del ${selectedRangeLabel.toLowerCase()}`}
                    icon={<Package className="h-4 w-4" style={{ color: PALETTE.success }} />}
                  >
                    <MiniExcel
                      maxHeight="318px"
                      columns={[
                        { key: "name", label: "Producto" },
                        { key: "category", label: "Categoría" },
                        { key: "region", label: "Ubicación", render: (row) => getLocationLabel(row.region) },
                        { key: "sellerOrigin", label: "Origen" },
                        { key: "salesUnits", label: "Unidades" },
                        { key: "salesAmount", label: "Ventas", render: (row) => formatUSD(row.salesAmount) },
                        {
                          key: "salesShare",
                          label: "% venta total",
                          render: (row) =>
                            `${salesVolumeTotal > 0 ? ((row.salesAmount / salesVolumeTotal) * 100).toFixed(1) : "0.0"}%`,
                        },
                        { key: "margin", label: "Utilidad", render: (row) => formatUSD(row.margin || 0) },
                      ]}
                      rows={sortedSalesRows}
                    />
                  </SectionCard>

                  <div className="grid gap-5 xl:grid-cols-2">
                    <SectionCard title="Ventas por origen" icon={<Store className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                      <MiniExcel
                        maxHeight="318px"
                        columns={[
                          { key: "origin", label: "Origen" },
                          { key: "amount", label: "Monto", render: (row) => formatUSD(row.amount) },
                          { key: "percent", label: "% del total", render: (row) => `${row.percent}%` },
                        ]}
                        rows={[
                          {
                            id: "tho",
                            origin: "Generadas por TH.O",
                            amount: thoOriginAmount,
                            percent: thoOriginPercent,
                          },
                          {
                            id: "seller",
                            origin: "Generadas por vendedor",
                            amount: sellerOriginAmount,
                            percent: sellerOriginPercent,
                          },
                        ]}
                      />
                    </SectionCard>

                    <SectionCard title="Ventas por vendedor" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                      <MiniExcel
                        maxHeight="318px"
                        columns={[
                          { key: "name", label: "Vendedor" },
                          { key: "zone", label: "Ubicación" },
                          { key: "amount", label: "Ventas", render: (seller) => formatUSD(seller.amount) },
                          { key: "orders", label: "Pedidos" },
                          {
                            key: "share",
                            label: "% del total",
                            render: (seller) =>
                              `${salesSellerTotal > 0 ? ((seller.amount / salesSellerTotal) * 100).toFixed(1) : "0.0"}%`,
                          },
                        ]}
                        rows={salesSellerRows}
                        emptyMessage="No hay vendedores asignados a esta ubicación."
                      />
                    </SectionCard>
                  </div>
                </div>
              </div>
            )}

            {activeSalesTab === "clients" && (
              <div className="space-y-5">
                <CollapsibleFilterSection id="clientAnalysis" title="Filtros de análisis de clientes" icon={<Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetClientFilters}
                      className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition hover:bg-gray-50"
                      style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
                    >
                      Limpiar filtros
                    </button>

                    <button
                      onClick={() => exportToExcel("analisis_clientes", adjustedClientRows.map((client) => ({
                        cliente: client.name,
                        ubicación: getLocationLabel(client.zone),
                        vendedor: client.seller,
                        facturación: formatUSD(client.periodAmount),
                        compras: client.periodPurchases,
                        tipo: client.type,
                        frecuencia: client.frequency,
                        ticket_promedio: formatUSD(client.periodAmount / client.periodPurchases)
                      })))}
                      className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold"
                      style={{ color: PALETTE.maastrichtBlue }}
                    >
                      <Download className="mr-1 inline h-4 w-4" />Excel
                    </button>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="w-full">
                      <PeriodFilter />
                    </div>

                    <LocationFilters />

                    <select value={clientSellerFilter} onChange={(event) => setClientSellerFilter(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                      <option value="all">Todos los vendedores</option>
                      {filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => <option key={seller.name} value={seller.name}>{seller.name}</option>)}
                    </select>

                    <select value={clientSort} onChange={(event) => setClientSort(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                      <option value="amountDesc">Compra mayor a menor</option>
                      <option value="amountAsc">Compra menor a mayor</option>
                      <option value="ordersDesc">Pedidos mayor a menor</option>
                      <option value="ordersAsc">Pedidos menor a mayor</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <LegendBox id="clientes-analisis" items={["Cliente nuevo = primera compra dentro del período seleccionado.", "Cliente reactivado = vuelve a comprar luego de 30+ días sin pedidos.", `Promedio de pedidos = ${avgOrdersInPeriod.toFixed(1)} por cliente en el período.`]} />
                  </div>
                </CollapsibleFilterSection>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Clientes nuevos" value={adjustedClientRows.filter((client) => client.type === "Nuevo").length} icon={<Users className="h-5 w-5" />} color={PALETTE.success} />
                  <KPICard title="Clientes recurrentes" value={adjustedClientRows.filter((client) => client.type === "Recurrente").length} icon={<RotateCcw className="h-5 w-5" />} color={PALETTE.crystalBlue} />
                  <KPICard title="Clientes reactivados" value={adjustedClientRows.filter((client) => client.type === "Reactivado").length} icon={<RefreshCw className="h-5 w-5" />} color={PALETTE.warning} />
                  <KPICard title="Ticket promedio por cliente" value={formatUSD(adjustedClientRows.reduce((sum, client) => sum + client.periodAmount, 0) / Math.max(adjustedClientRows.length, 1))} icon={<Receipt className="h-5 w-5" />} />
                </div>



                <div className="space-y-5">
                  <SectionCard title="Top clientes por facturación" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                    <MiniExcel
                      maxHeight="318px"
                      columns={[
                        { key: "name", label: "Cliente" },
                        { key: "type", label: "Tipo" },
                        { key: "frequency", label: "Frecuencia" },
                        { key: "periodPurchases", label: "Compras" },
                        { key: "periodAmount", label: "Facturación", render: (client) => formatUSD(client.periodAmount) },
                        {
                          key: "averageTicket",
                          label: "Ticket promedio",
                          render: (client) => formatUSD(client.periodAmount / client.periodPurchases),
                        },
                        { key: "zone", label: "Ubicación", render: (client) => getLocationLabel(client.zone) },
                        { key: "seller", label: "Vendedor" },
                      ]}
                      rows={adjustedClientRows.slice(0, 8)}
                    />
                  </SectionCard>

                  <SectionCard title="Clientes nuevos vs recurrentes" icon={<RotateCcw className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                    <div className="space-y-4">
                      <ProgressBar label="Recurrentes" value={adjustedClientRows.filter((client) => client.type === "Recurrente").length} max={Math.max(adjustedClientRows.length, 1)} color={PALETTE.success} />
                      <ProgressBar label="Nuevos" value={adjustedClientRows.filter((client) => client.type === "Nuevo").length} max={Math.max(adjustedClientRows.length, 1)} color={PALETTE.sizzlingSunrise} />
                      <ProgressBar label="Reactivados" value={adjustedClientRows.filter((client) => client.type === "Reactivado").length} max={Math.max(adjustedClientRows.length, 1)} color={PALETTE.crystalBlue} />
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
                <CollapsibleFilterSection id="performance" title="Filtros de performance comercial" icon={<Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                  <div className="mb-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={resetPerformanceFilters}
                      className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition hover:bg-gray-50"
                      style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
                    >
                      Limpiar filtros
                    </button>

                    <button
                      onClick={() => downloadExcelWorkbook("performance_comercial", [
                        {
                          name: "Resumen performance",
                          rows: [
                            {
                              "Total ventas": formatUSD(filteredSellers.reduce((sum, seller) => sum + seller.amount, 0)),
                              "% pedidos c/asis": `${Math.round(
                                filteredSellers.reduce((sum, seller) => sum + seller.assistedPercent, 0) /
                                  Math.max(filteredSellers.length, 1)
                              )}%`,
                              "Nro pedidos totales": filteredSellers.reduce((sum, seller) => sum + seller.orders, 0),
                            },
                          ],
                        },
                        {
                          name: "Detalle vendedores",
                          rows: filteredSellers.map((seller) => ({
                            vendedor: seller.name,
                            ubicación: seller.zone,
                            ventas: formatUSD(seller.amount),
                            "Nro de pedidos en los que asistió": seller.orders,
                            "% del total": `${
                              salesSellerTotal > 0
                                ? ((seller.amount / salesSellerTotal) * 100).toFixed(2)
                                : "0.00"
                            }%`,
                          })),
                        },
                      ])}
                      className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold"
                      style={{ color: PALETTE.maastrichtBlue }}
                    >
                      <Download className="mr-1 inline h-4 w-4" />Excel
                    </button>
                  </div>

                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="w-full">
                      <PeriodFilter />
                    </div>

                    <LocationFilters />

                    <select value={performanceSellerFilter} onChange={(event) => setPerformanceSellerFilter(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                      <option value="all">Todos los vendedores</option>
                      {filteredSellersByLocation.map((seller) => <option key={seller.name} value={seller.name}>{seller.name}</option>)}
                    </select>

                    <select value={performanceSort} onChange={(event) => setPerformanceSort(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                      <option value="amountDesc">Venta mayor a menor</option>
                      <option value="amountAsc">Venta menor a mayor</option>
                      <option value="ordersDesc">Pedidos mayor a menor</option>
                      <option value="ordersAsc">Pedidos menor a mayor</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <LegendBox id="performance-comercial" items={["% con asistencia = ventas con vendedor ÷ ventas totales.", "% sin asistencia = ventas generadas por TH.O automático.", "Conversión = pedidos despachados ÷ pedidos recibidos."]} />
                  </div>
                </CollapsibleFilterSection>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Ventas generadas por TH.O" value={formatPercent(summary.thoSalesPercent)} subtitle={formatUSD(summary.monthlySales * (summary.thoSalesPercent / 100))} icon={<Sparkles className="h-5 w-5" />} color={PALETTE.warning} />
                  <KPICard title="Conversión pedidos → despachos" value="76%" subtitle="Pedidos completados" icon={<CheckCircle className="h-5 w-5" />} color={PALETTE.success} />
                  <KPICard title="Mejor vendedor" value="María" subtitle="Ventas: $64,300" icon={<Trophy className="h-5 w-5" />} />
                  <KPICard title="Pedidos activos" value={summary.activeOrders} icon={<ShoppingBag className="h-5 w-5" />} color={PALETTE.crystalBlue} />
                </div>



                <div className="space-y-5">
                  <SectionCard title="Ventas por vendedor" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                    <MiniExcel
                      maxHeight="318px"
                      columns={[
                        { key: "name", label: "Vendedor" },
                        { key: "zone", label: "Ubicación" },
                        { key: "amount", label: "Ventas", render: (seller) => formatUSD(seller.amount) },
                        { key: "orders", label: "Pedidos" },
                        { key: "assistedPercent", label: "% asistencia", render: (seller) => `${seller.assistedPercent}%` },
                      ]}
                      rows={filteredSellers}
                    />
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
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input value={invoiceSearchTerm} onChange={(e) => setInvoiceSearchTerm(e.target.value)} placeholder="Buscar cliente..." className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm" style={{ borderColor: PALETTE.pastelGray }} />
                  </div>
                  <select value={invoiceStatusFilter} onChange={(e) => setInvoiceStatusFilter(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="partial">Pago parcial</option>
                    <option value="overdue">Vencidas</option>
                    <option value="paid">Al día</option>
                    <option value="risk">En riesgo</option>
                  </select>
                  <select value={selectedClientName} onChange={(e) => setSelectedClientName(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="all">Todos los clientes</option>
                    {clients.map((client) => <option key={client.id} value={client.name}>{client.name}</option>)}
                  </select>
                    <LocationFilters />
                  <select value={invoiceSellerFilter} onChange={(e) => setInvoiceSellerFilter(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="all">Todos los vendedores</option>
                    {filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => <option key={seller.name} value={seller.name}>{seller.name}</option>)}
                  </select>
                  <select value={invoiceDueSort} onChange={(e) => setInvoiceDueSort(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="soonest">Vence más pronto</option>
                    <option value="latest">Vence más tarde</option>
                  </select>
                  <label className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <input type="checkbox" checked={invoiceGroupByClient} onChange={(e) => setInvoiceGroupByClient(e.target.checked)} />
                    Agrupar por cliente
                  </label>
                </div>
              )}
            </SectionCard>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <SectionCard title="Riesgo por cliente" icon={<Users className="h-4 w-4" style={{ color: PALETTE.warning }} />}>
                <div className="space-y-3">
                  <LegendBox items={["Un renglón = una factura abierta; un cliente puede tener varias facturas.", "Si agrupas por cliente, se suman facturas y se muestra el vencimiento más cercano.", "Cercanía de vencimiento = fecha de vencimiento contra hoy."]} />
                  <MiniExcel
                    maxHeight="318px"
                    columns={[
                      { key: "invoiceNumber", label: "Nro. factura" },
                      { key: "orderNumber", label: "Pedido" },
                      { key: "client", label: "Cliente" },
                      { key: "zone", label: "Zona" },
                      { key: "seller", label: "Vendedor" },
                      { key: "dueDate", label: "Vence", render: (row) => formatDateShort(row.dueDate) },
                      { key: "amount", label: "Monto", render: (row) => formatUSD(row.amount) },
                      { key: "status", label: "Estado" },
                    ]}
                    rows={groupedInvoiceRows}
                  />
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
                <div className="mb-3 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                  <PeriodFilter />
                    <LocationFilters />
                  <select value={cashflowSellerFilter} onChange={(event) => setCashflowSellerFilter(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                    <option value="all">Todos los vendedores</option>
                    {filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => <option key={seller.name} value={seller.name}>{seller.name}</option>)}
                  </select>
                </div>
                <LegendBox items={["Cobro proyectado = facturas con vencimiento dentro del período.", "Incluye número de factura, pedido y cliente para conciliación.", "Puedes filtrar por día, semana o rango personalizado."]} />
                <div className="mt-3">
                  <MiniExcel
                    maxHeight="318px"
                    columns={[
                      { key: "date", label: "Fecha" },
                      { key: "invoiceNumber", label: "Factura" },
                      { key: "orderNumber", label: "Pedido" },
                      { key: "client", label: "Cliente" },
                      { key: "expected", label: "Proyectado", render: (row) => formatUSD(row.expected) },
                      { key: "real", label: "Real", render: (row) => formatUSD(row.real) },
                    ]}
                    rows={filteredCollectionFlow}
                  />
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
            <SectionCard
              title="Inventario y stock"
              icon={<Package className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
            >
              <p className="mb-4 text-sm text-gray-500">
                Administra tu catálogo publicado: carga productos, actualiza precios, fotos, descripciones y stock.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    backgroundColor: PALETTE.sizzlingSunrise,
                    color: PALETTE.maastrichtBlue,
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Subir producto manualmente
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    backgroundColor: PALETTE.maastrichtBlue,
                    color: PALETTE.white,
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Subida masiva de productos
                </button>
              </div>
            </SectionCard>

            <SectionCard
              title="Productos publicados"
              icon={<PackageOpen className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
            >
              <LegendBox
                items={[
                  "Haz clic en cualquier producto para editarlo.",
                  "Puedes modificar foto, descripción, precio y stock.",
                  "Los cambios se reflejan automáticamente en el marketplace.",
                ]}
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {productsData.map((product) => (
                  <button
                    key={product.id}
                    className="rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      borderColor: PALETTE.softBorder,
                      backgroundColor: PALETTE.white,
                    }}
                  >
                    <div className="flex gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className="font-black leading-5"
                              style={{ color: PALETTE.maastrichtBlue }}
                            >
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {product.category}
                            </p>
                          </div>

                          <div
                            className="rounded-full px-2 py-1 text-[10px] font-bold"
                            style={{
                              backgroundColor: `${PALETTE.success}22`,
                              color: PALETTE.success,
                            }}
                          >
                            Publicado
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-xl bg-gray-50 p-2">
                            <p className="text-[11px] text-gray-500">Precio</p>
                            <p className="font-black">
                              {formatUSD(product.price || product.revenue / 10)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gray-50 p-2">
                            <p className="text-[11px] text-gray-500">Stock</p>
                            <p className="font-black">{product.stock} unidades</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className="rounded-full px-2 py-1 text-[11px] font-bold"
                            style={{
                              backgroundColor: `${PALETTE.crystalBlue}22`,
                              color: PALETTE.crystalBlue,
                            }}
                          >
                            Editar foto
                          </span>

                          <span
                            className="rounded-full px-2 py-1 text-[11px] font-bold"
                            style={{
                              backgroundColor: `${PALETTE.warning}22`,
                              color: PALETTE.warning,
                            }}
                          >
                            Editar descripción
                          </span>

                          <span
                            className="rounded-full px-2 py-1 text-[11px] font-bold"
                            style={{
                              backgroundColor: `${PALETTE.sizzlingSunrise}22`,
                              color: PALETTE.maastrichtBlue,
                            }}
                          >
                            Editar precio
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

{activeTab === "discipline" && (
          <div className="space-y-5">
            <SectionCard title="Filtros de disciplina del canal" icon={<Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                <PeriodFilter />
                <LocationFilters />
              </div>
            </SectionCard>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Clientes bloqueados" value={discipline.blockedClients} icon={<X className="h-5 w-5" />} color={PALETTE.danger} tone="danger" />
              <KPICard title="Reincorporaciones" value={discipline.reinstatements} subtitle="Clientes reincorporados" icon={<CheckCircle className="h-5 w-5" />} color={PALETTE.success} tone="success" />
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
              <SectionCard title="Clientes sancionados" icon={<Users className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button onClick={() => setActiveDisciplineView("own")} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: activeDisciplineView === "own" ? PALETTE.sizzlingSunrise : PALETTE.page, color: PALETTE.maastrichtBlue }}>Morosos con este mayorista</button>
                  <button onClick={() => setActiveDisciplineView("platform")} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: activeDisciplineView === "platform" ? PALETTE.sizzlingSunrise : PALETTE.page, color: PALETTE.maastrichtBlue }}>Morosos con otros mayoristas</button>
                </div>
                <div className="space-y-3">
                  {(activeDisciplineView === "own" ? discipline.ownDelinquents : discipline.platformDelinquents).map((client) => (
                    <div key={client.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder }}>
                      <div>
                        <p className="font-black">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.overdueDays} días de mora · Zona {client.zone} · Vendedor {client.seller}</p>
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
            <SectionCard title="Gestión de pedidos" icon={<ShoppingBag className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                <PeriodFilter />
                    <LocationFilters />
                <select value={cashflowSellerFilter} onChange={(event) => setCashflowSellerFilter(event.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                  <option value="all">Todos los vendedores</option>
                  {filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => <option key={seller.name} value={seller.name}>{seller.name}</option>)}
                </select>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { id: "accept", label: `Por aceptar (${acceptOrders.length})` },
                  { id: "dispatch", label: `Por despachar (${toDispatchOrders.length})` },
                  { id: "dispatched", label: `Despachados (${dispatchedOrders.length})` },
                ].map((view) => (
                  <button key={view.id} onClick={() => setActiveOrdersView(view.id)} className="rounded-full px-4 py-2 text-sm font-bold" style={{ backgroundColor: activeOrdersView === view.id ? PALETTE.sizzlingSunrise : PALETTE.page, color: PALETTE.maastrichtBlue }}>
                    {view.label}
                  </button>
                ))}
              </div>
            </SectionCard>

            {activeOrdersView === "accept" && (
              <SectionCard title="Pedidos por aceptar" icon={<Inbox className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} action={<button onClick={() => exportToExcel("pedidos_por_aceptar", acceptOrders.map((order) => ({ pedido: order.orderNumber, cliente: order.buyer, zona: order.zone, vendedor: order.seller, total: (order.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) })))} className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold"><Download className="mr-1 inline h-3 w-3" />Excel</button>}>
                <div className="space-y-4">
                  {acceptOrders.map((order) => (
                    <div key={order.id} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                      <div className="mb-3 flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="font-black">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.buyer} · Zona {order.zone} · Vendedor {order.seller} · {order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-green-700">{formatUSD((order.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}</p>
                          <p className="text-xs text-gray-500">{(order.items || []).length} artículos</p>
                        </div>
                      </div>

                      <MiniExcel maxHeight="318px" columns={[
                        { key: "sku", label: "SKU" },
                        { key: "name", label: "Artículo" },
                        { key: "unitPrice", label: "Precio unit.", render: (item) => formatUSD(item.unitPrice) },
                        { key: "quantity", label: "Cantidad" },
                        { key: "total", label: "Total", render: (item) => formatUSD(item.unitPrice * item.quantity) },
                      ]} rows={order.items || []} />

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => handleOrderAction(order.id, "accept")} className="flex-1 rounded-xl bg-green-500 py-2 font-bold text-white">Aceptar</button>
                        <button onClick={() => handleOrderAction(order.id, "reject")} className="flex-1 rounded-xl bg-red-500 py-2 font-bold text-white">Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {activeOrdersView === "dispatch" && (
              <SectionCard title="Pedidos por despachar" icon={<Truck className="h-4 w-4" style={{ color: PALETTE.warning }} />}>
                <MiniExcel maxHeight="318px" columns={[
                  { key: "orderNumber", label: "Pedido" },
                  { key: "buyer", label: "Cliente" },
                  { key: "zone", label: "Zona" },
                  { key: "seller", label: "Vendedor" },
                  { key: "total", label: "Total", render: (order) => formatUSD((order.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)) },
                  { key: "action", label: "Despachar", render: (order) => <button onClick={() => markOrderAsDispatched(order.id)} className="rounded-lg bg-green-500 px-3 py-1 text-xs font-bold text-white">Marcar despachado</button> },
                ]} rows={toDispatchOrders} />
                <p className="mt-3 text-xs text-gray-500">Al marcar como despachado, empieza a contar el plazo de 30 días hasta la fecha de pago.</p>
              </SectionCard>
            )}

            {activeOrdersView === "dispatched" && (
              <SectionCard title="Histórico de pedidos despachados" icon={<History className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                <MiniExcel maxHeight="318px" columns={[
                  { key: "orderNumber", label: "Pedido" },
                  { key: "buyer", label: "Cliente" },
                  { key: "zone", label: "Zona" },
                  { key: "seller", label: "Vendedor" },
                  { key: "dispatchedAt", label: "Despachado", render: (row) => formatDateShort(row.dispatchedAt) },
                  { key: "paymentDueAt", label: "Fecha pago", render: (row) => formatDateShort(row.paymentDueAt) },
                  { key: "total", label: "Total", render: (order) => formatUSD((order.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)) },
                ]} rows={dispatchedOrders} />
              </SectionCard>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
