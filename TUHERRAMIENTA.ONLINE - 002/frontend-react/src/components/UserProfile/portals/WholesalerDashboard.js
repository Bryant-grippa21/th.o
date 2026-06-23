import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
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
  MapPin,
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
  User,
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

const formatExcelNumber = (value) => {
  const number = Number(value || 0);
  const hasDecimals = Math.abs(number % 1) > 0.000001;
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(number);
};

const formatPercent = (value) => `${Number(value || 0).toFixed(1).replace(".", ",")}%`;
const safePercent = (value, decimals = 1) => Number.isFinite(Number(value)) ? `${Number(value).toFixed(decimals).replace(".", ",")}%` : "N/A";
const formatDecimal = (value, decimals = 1) => Number.isFinite(Number(value)) ? Number(value).toFixed(decimals).replace(".", ",") : "0";
const VALID_SALE_STATUSES = ["DESPACHADO", "COBRADO", "VENCIDO"];
const getDaysBetween = (from, to) => Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / (1000 * 60 * 60 * 24));
const addDays = (dateString, days) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
};

const SERVER_TODAY = "2026-05-15";
const SUBTRACT = (a, b) => Number(a || 0) - Number(b || 0);
const getInvoiceStatusLabel = (status) => ({
  pending: "Al día",
  dueSoon: "Próxima a vencer",
  overdue: "Vencida",
  paid: "Pagada",
  covered: "Cubierta por TH.O",
}[status] || status);
const getCommissionStatus = (amount, paid = false) => Number(amount || 0) <= 0 ? "No aplica" : paid ? "Pagada" : "Pendiente";

function KPICard({ title, value, subtitle, icon, color = PALETTE.sizzlingSunrise, trend, tone = "neutral" }) {
  const [showFormula, setShowFormula] = useState(false);
  const toneMap = {
    neutral: "bg-white",
    success: "bg-green-50",
    warning: "bg-yellow-50",
    danger: "bg-red-50",
    info: "bg-blue-50",
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${toneMap[tone] || toneMap.neutral}`}>
      <div className="mb-3 grid grid-cols-[1fr_auto_auto] items-center gap-2">
        <p className="min-w-0 whitespace-normal break-words text-xs font-black uppercase tracking-[0.14em]" style={{ color: PALETTE.crystalBlue }}>{title}</p>
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); setShowFormula((value) => !value); }}
          className="shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] transition hover:bg-slate-100"
          style={{ borderColor: `${color}55`, color }}
        >
          {showFormula ? "▾" : "▸"} Fórmula
        </button>
        <div className="shrink-0 rounded-xl p-2" style={{ backgroundColor: `${color}18`, color }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-black" style={{ color: PALETTE.maastrichtBlue }}>{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      {trend && (
        <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${trend.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {trend}
        </span>
      )}
      {showFormula && (
        <div className="mt-3 rounded-2xl border p-3 text-xs font-semibold leading-relaxed shadow-inner" style={{ backgroundColor: PALETTE.maastrichtBlue, borderColor: PALETTE.spaceCadet, color: PALETTE.white }}>
          <p className="font-black uppercase tracking-[0.12em]" style={{ color: PALETTE.sizzlingSunrise }}>Fórmula</p>
          <p className="mt-1 text-white/90">{subtitle || title}</p>
          <p className="mt-3 font-black uppercase tracking-[0.12em]" style={{ color: PALETTE.sizzlingSunrise }}>Finalidad</p>
          <p className="mt-1 text-white/90">Ayuda a entender el comportamiento de este indicador dentro del período y filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}


function ExecutiveKPICard({ title, value, subtitle, icon, accent = PALETTE.sizzlingSunrise, tone = "neutral", wide = false, onClick }) {
  const [showFormula, setShowFormula] = useState(false);
  const bgMap = {
    neutral: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
    success: "linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 72%)",
    warning: "linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 72%)",
    danger: "linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 72%)",
    blue: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 72%)",
    dark: "linear-gradient(135deg, #0B1F35 0%, #1B3149 100%)",
  };
  const isDark = tone === "dark";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => { if (onClick && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick(); } }}
      className={`group relative overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${onClick ? "cursor-pointer" : ""} ${wide ? "sm:col-span-2" : ""}`}
      style={{
        background: bgMap[tone] || bgMap.neutral,
        borderColor: isDark ? "rgba(255,255,255,0.12)" : PALETTE.softBorder,
      }}
    >
      <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-10" style={{ backgroundColor: accent }} />
      <div className="relative grid grid-cols-[1fr_auto_auto] items-center gap-2">
        <p className={`min-w-0 whitespace-normal break-words text-[11px] font-black uppercase tracking-[0.16em] ${isDark ? "text-white/70" : "text-slate-500"}`}>{title}</p>
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); setShowFormula((value) => !value); }}
          className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] transition ${isDark ? "border-white/20 text-white hover:bg-white/10" : "hover:bg-slate-100"}`}
          style={isDark ? undefined : { borderColor: `${accent}55`, color: accent }}
        >
          {showFormula ? "▾" : "▸"} Fórmula
        </button>
        <div className="shrink-0 rounded-2xl p-3" style={{ backgroundColor: isDark ? "rgba(255,255,255,0.10)" : `${accent}18`, color: isDark ? PALETTE.sizzlingSunrise : accent }}>
          {icon}
        </div>
      </div>
      <div className="relative mt-3 min-w-0">
        <p className={`truncate text-2xl font-black ${isDark ? "text-white" : "text-slate-950"}`}>{value}</p>
        {subtitle && <p className={`mt-1 truncate text-xs font-semibold ${isDark ? "text-white/65" : "text-slate-500"}`}>{subtitle}</p>}
      </div>
      {showFormula && (
        <div
          className="relative mt-3 rounded-2xl border p-3 text-xs font-semibold leading-relaxed shadow-inner"
          style={{ backgroundColor: PALETTE.maastrichtBlue, borderColor: PALETTE.spaceCadet, color: PALETTE.white }}
        >
          <p className="font-black uppercase tracking-[0.12em]" style={{ color: PALETTE.sizzlingSunrise }}>Fórmula</p>
          <p className="mt-1 text-white/90">{subtitle || title}</p>
          <p className="mt-3 font-black uppercase tracking-[0.12em]" style={{ color: PALETTE.sizzlingSunrise }}>Finalidad</p>
          <p className="mt-1 text-white/90">Ayuda a interpretar este KPI y tomar decisiones según el período y filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}

function OverviewBlock({ title, subtitle, icon, children, onDetail, accent = PALETTE.sizzlingSunrise }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border bg-white shadow-sm" style={{ borderColor: PALETTE.softBorder }}>
      <div className="flex flex-col gap-4 border-b px-5 py-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: PALETTE.softBorder }}>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl p-2.5" style={{ backgroundColor: `${accent}18`, color: accent }}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-black" style={{ color: PALETTE.maastrichtBlue }}>{title}</h3>
            {subtitle && <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {/* Las tarjetas KPI navegan directamente a su pestaña correspondiente. */}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      {label && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-gray-600">{label}</span>
          <span className="font-bold">{formatPercent(pct).replace(",0%", "%")}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const SALES_CARD_TONES = {
  blue: {
    accent: "#3B82F6",
    soft: "#EFF6FF",
    glow: "rgba(59,130,246,0.16)",
  },
  green: {
    accent: "#22C55E",
    soft: "#F0FDF4",
    glow: "rgba(34,197,94,0.16)",
  },
  yellow: {
    accent: "#FBBF24",
    soft: "#FFFBEB",
    glow: "rgba(251,191,36,0.18)",
  },
  purple: {
    accent: "#8B5CF6",
    soft: "#F5F3FF",
    glow: "rgba(139,92,246,0.16)",
  },
  orange: {
    accent: "#F97316",
    soft: "#FFF7ED",
    glow: "rgba(249,115,22,0.16)",
  },
};

function SoftProgressBar({ percent, tone = "blue" }) {
  const colors = SALES_CARD_TONES[tone] || SALES_CARD_TONES.blue;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min(Number(percent || 0), 100)}%`,
          backgroundColor: colors.accent,
        }}
      />
    </div>
  );
}

function OriginVisualCard({ label, amount, percent, icon: Icon, tone = "blue" }) {
  const colors = SALES_CARD_TONES[tone] || SALES_CARD_TONES.blue;

  return (
    <article
      className="rounded-2xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{
        borderColor: PALETTE.softBorder,
        backgroundColor: colors.soft,
      }}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-5">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white shadow-lg"
            style={{ color: colors.accent, boxShadow: `0 16px 30px ${colors.glow}` }}
          >
            <Icon className="h-8 w-8" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black" style={{ color: PALETTE.maastrichtBlue }}>
              {label}
            </p>
            <p className="mt-2 text-3xl font-black tracking-tight" style={{ color: colors.accent }}>
              {formatUSD(amount)}
            </p>
            <div className="mt-5 w-64 max-w-full">
              <SoftProgressBar percent={percent} tone={tone} />
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-black" style={{ color: colors.accent }}>
            {formatPercent(percent)}
          </p>
          <p className="mt-1 text-sm text-gray-500">del total</p>
        </div>
      </div>
    </article>
  );
}

function SellerVisualCard({ seller, percent, tone = "blue" }) {
  const colors = SALES_CARD_TONES[tone] || SALES_CARD_TONES.blue;

  return (
    <article
      className="rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: PALETTE.softBorder }}
    >
      <div className="flex items-center gap-4">
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ backgroundColor: colors.soft, color: colors.accent }}
        >
          <User className="h-8 w-8" />
        </div>

        <div>
          <h4 className="text-base font-black" style={{ color: PALETTE.maastrichtBlue }}>
            {seller.name}
          </h4>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{seller.zone}</span>
          </div>
        </div>
      </div>

      <div className="my-6 h-px bg-slate-200" />

      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div
            className="grid h-14 w-14 place-items-center rounded-full"
            style={{ backgroundColor: colors.soft, color: colors.accent }}
          >
            <DollarSign className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ventas</p>
            <p className="text-lg font-black" style={{ color: PALETTE.maastrichtBlue }}>
              {formatExcelNumber(seller.amount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="grid h-14 w-14 place-items-center rounded-full"
            style={{ backgroundColor: colors.soft, color: colors.accent }}
          >
            <Package className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pedidos</p>
            <p className="text-lg font-black" style={{ color: PALETTE.maastrichtBlue }}>
              {seller.orders}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SoftProgressBar percent={percent} tone={tone} />
        <p className="mt-5 text-base text-gray-500">
          <span className="font-black" style={{ color: colors.accent }}>
            {formatPercent(percent)}
          </span>{" "}
          del total
        </p>
      </div>
    </article>
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
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState([]);
  const [clientSellerFilter, setClientSellerFilter] = useState([]);
  const [performanceSort, setPerformanceSort] = useState("amountDesc");
  const [performanceSellerFilter, setPerformanceSellerFilter] = useState([]);
  const [invoiceSellerFilter, setInvoiceSellerFilter] = useState([]);
  const [selectedState, setSelectedState] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [selectedUrbanization, setSelectedUrbanization] = useState([]);
  const [invoiceDueSort, setInvoiceDueSort] = useState("soonest");
  const [invoiceGroupByClient, setInvoiceGroupByClient] = useState(false);
  const [cashflowSellerFilter, setCashflowSellerFilter] = useState([]);
  const [cashflowZoneFilter, setCashflowZoneFilter] = useState([]);
  const [cashflowClientSearch, setCashflowClientSearch] = useState("");
  const [cashflowStatusFilter, setCashflowStatusFilter] = useState([]);
  const [cashflowBeneficiaryFilter, setCashflowBeneficiaryFilter] = useState([]);
  const [cashflowCommissionStatusFilter, setCashflowCommissionStatusFilter] = useState([]);
  const [activeDisciplineView, setActiveDisciplineView] = useState("own");
  const [activeOrdersView, setActiveOrdersView] = useState("accept");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [expandedOrderIds, setExpandedOrderIds] = useState({});
  const [activeInventoryTab, setActiveInventoryTab] = useState("inventory");
  const [activeCashflowTab, setActiveCashflowTab] = useState("committed");
  const [commissionPaidStatus, setCommissionPaidStatus] = useState({});
  const [paymentRejectionModal, setPaymentRejectionModal] = useState(null);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState("");
  const [paymentRejectionReasons, setPaymentRejectionReasons] = useState({});
  const [openLegendSections, setOpenLegendSections] = useState({});
  const [openFilterSections, setOpenFilterSections] = useState({
    salesVolume: true,
    clientAnalysis: true,
    performance: true,
  });
  const [salesProductFilter, setSalesProductFilter] = useState("");
  const [salesCategoryFilter, setSalesCategoryFilter] = useState([]);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState([]);
  const [selectedClientName, setSelectedClientName] = useState("all");
  const [showInvoiceFilters, setShowInvoiceFilters] = useState(true);
  const [productSort, setProductSort] = useState("mostSold");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [productRotationSearch, setProductRotationSearch] = useState("");
  const [productRotationCategoryFilter, setProductRotationCategoryFilter] = useState("all");
  const [publishedProductSearch, setPublishedProductSearch] = useState("");
  const [publishedCategoryFilter, setPublishedCategoryFilter] = useState("all");
  const [publishedSubcategoryFilter, setPublishedSubcategoryFilter] = useState("all");
  const [publishedLineFilter, setPublishedLineFilter] = useState("all");
  const [expandedPublishedProductId, setExpandedPublishedProductId] = useState(null);
  const [paymentValidationStatus, setPaymentValidationStatus] = useState({});
  const [notificationTypeFilter, setNotificationTypeFilter] = useState([]);
  const salesRegions = ["Centro", "Norte", "Sur", "Este", "Oeste"];


  const asArray = (value) => Array.isArray(value) ? value : value && value !== "all" ? [value] : [];
  const hasMulti = (value) => asArray(value).length > 0;
  const matchesMulti = (value, selected) => !hasMulti(selected) || asArray(selected).includes(value);
  const clearDependentLocationFilters = () => {
    setClientSellerFilter([]);
    setPerformanceSellerFilter([]);
    setInvoiceSellerFilter([]);
    setCashflowSellerFilter([]);
  };

  function MultiSelectFilter({ label, options = [], value, onChange, disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const normalizedOptions = Array.isArray(options) ? options : [];
    const values = asArray(value).filter((item) => normalizedOptions.some((option) => (typeof option === "string" ? option : option.value) === item));
    const summary = values.length === 0 ? label : values.length === 1
      ? (normalizedOptions.find((option) => (typeof option === "string" ? option : option.value) === values[0])?.label || values[0])
      : `${values.length} seleccionados`;

    const toggle = (optionValue) => {
      if (optionValue === "all") {
        onChange([]);
        return;
      }
      const nextValues = values.includes(optionValue)
        ? values.filter((item) => item !== optionValue)
        : [...values, optionValue];
      onChange(nextValues);
    };

    return (
      <div className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
          className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          style={{ borderColor: PALETTE.pastelGray }}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full z-[120] mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-2 shadow-xl" style={{ borderColor: PALETTE.pastelGray }}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
              <input type="checkbox" checked={values.length === 0} onChange={() => toggle("all")} />
              Todos
            </label>
            {normalizedOptions.map((option) => {
              const optionValue = typeof option === "string" ? option : option.value;
              const optionLabel = typeof option === "string" ? option : option.label;
              return (
                <label key={optionValue} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
                  <input type="checkbox" checked={values.includes(optionValue)} onChange={() => toggle(optionValue)} />
                  <span className="truncate">{optionLabel}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  }


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

  const [productsData, setProductsData] = useState([
    { id: 1, name: "Taladro percutor industrial", unitsSold: 1245, revenue: 112050, cost: 72832, margin: 39218, marginPercent: 35.0, category: "Herramientas eléctricas", line: "Línea industrial", region: "Centro", stock: 220, turnoverDays: 18, stockoutRisk: "low", lowRotation: false, sellerOrigin: "TH.O", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80" },
    { id: 2, name: "Juego de llaves combinadas", unitsSold: 2340, revenue: 58266, cost: 33794, margin: 24472, marginPercent: 42.0, category: "Herramientas manuales", line: "Línea ferretera", region: "Norte", stock: 80, turnoverDays: 12, stockoutRisk: "medium", lowRotation: false, sellerOrigin: "Vendedor", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80" },
    { id: 3, name: "Casco de seguridad premium", unitsSold: 1870, revenue: 37400, cost: 23188, margin: 14212, marginPercent: 38.0, category: "Equipo de protección", line: "Línea seguridad", region: "Sur", stock: 35, turnoverDays: 9, stockoutRisk: "high", lowRotation: false, sellerOrigin: "TH.O", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80" },
    { id: 4, name: "Esmeril angular profesional", unitsSold: 890, revenue: 66750, cost: 45390, margin: 21360, marginPercent: 32.0, category: "Herramientas eléctricas", line: "Línea industrial", region: "Oeste", stock: 145, turnoverDays: 31, stockoutRisk: "low", lowRotation: false, sellerOrigin: "Vendedor", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80" },
    { id: 5, name: "Cinta métrica láser", unitsSold: 260, revenue: 42000, cost: 23100, margin: 18900, marginPercent: 45.0, category: "Herramientas de medición", line: "Línea medición", region: "Centro", stock: 420, turnoverDays: 74, stockoutRisk: "low", lowRotation: true, sellerOrigin: "TH.O", image: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?auto=format&fit=crop&w=300&q=80" },
    ...Array.from({ length: 25 }, (_, index) => {
      const number = index + 6;
      const categories = ["Herramientas eléctricas", "Herramientas manuales", "Equipo de protección", "Herramientas de medición"];
      const category = categories[index % categories.length];
      const unitsSold = 180 + index * 37;
      const revenue = 9200 + index * 1840;
      const cost = Math.round(revenue * (0.58 + (index % 4) * 0.03));
      const margin = revenue - cost;
      return {
        id: number,
        name: `Artículo mayorista ${String(number).padStart(2, "0")}`,
        unitsSold,
        revenue,
        cost,
        margin,
        marginPercent: revenue > 0 ? (margin / revenue) * 100 : 0,
        category,
        line: index % 2 === 0 ? "Línea industrial" : "Línea ferretera",
        region: salesRegions[index % salesRegions.length],
        stock: 40 + index * 8,
        turnoverDays: 10 + (index % 12) * 5,
        stockoutRisk: index % 7 === 0 ? "high" : index % 5 === 0 ? "medium" : "low",
        lowRotation: index % 6 === 0,
        sellerOrigin: index % 3 === 0 ? "TH.O" : "Vendedor",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80",
      };
    }),
  ]);

  const getProductSubcategory = (product) => {
    const subcategories = {
      "Herramientas eléctricas": product.name.includes("Taladro") ? "Taladros" : "Corte y desbaste",
      "Herramientas manuales": "Llaves y dados",
      "Equipo de protección": "Seguridad industrial",
      "Herramientas de medición": "Medición láser",
    };

    return subcategories[product.category] || "General";
  };


  const getHistoricalUnitPrice = (product) => {
    const value = product.historicalUnitPrice ?? product.unitPriceUsed ?? product.price ?? (product.unitsSold ? product.revenue / product.unitsSold : 0);
    return Number(value || 0);
  };

  const getHistoricalUnitCost = (product) => {
    const value = product.historicalUnitCost ?? product.unitCostUsed ?? product.unitCost ?? (product.unitsSold ? product.cost / product.unitsSold : product.cost || 0);
    return Number(value || 0);
  };

  const getHistoricalUtility = (product, units) => {
    const unitPrice = getHistoricalUnitPrice(product);
    const unitCost = getHistoricalUnitCost(product);
    if (!unitPrice || !unitCost || unitCost <= 0) return 0;
    return Math.round(Math.max(unitPrice - unitCost, 0) * Number(units || 0));
  };

  const publishedProductCategories = [...new Set(productsData.map((product) => product.category))];
  const publishedProductLines = [...new Set(productsData.map((product) => product.line || "Sin línea"))];
  const publishedProductSubcategories = [
    ...new Set(
      productsData
        .filter((product) => publishedCategoryFilter === "all" || product.category === publishedCategoryFilter)
        .map((product) => getProductSubcategory(product))
    ),
  ];

  const filteredPublishedProducts = productsData.filter((product) => {
    const search = publishedProductSearch.trim().toLowerCase();
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search) ||
      getProductSubcategory(product).toLowerCase().includes(search);

    const matchesCategory =
      publishedCategoryFilter === "all" || product.category === publishedCategoryFilter;

    const matchesSubcategory =
      publishedSubcategoryFilter === "all" || getProductSubcategory(product) === publishedSubcategoryFilter;

    const matchesLine = publishedLineFilter === "all" || (product.line || "Sin línea") === publishedLineFilter;
    const isActive = product.status !== "inactive";

    return isActive && matchesSearch && matchesCategory && matchesSubcategory && matchesLine;
  });

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
      urbanization: "El Viñedo",
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
      urbanization: "Catia",
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
      urbanization: "La Limpia",
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
      urbanization: "Nueva Segovia",
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
      urbanization: "Catia",
      seller: "Carlos Díaz",
      thoGenerated: true,
    },
  ];

  const invoices = [
    { id: 101, client: "Ferretería El Constructor", invoiceNumber: "FAC-2026-001", orderNumber: "PED-2026-001", amount: 15600, paidAmount: 0, coveredAmount: 0, dueDate: "2026-05-15", dispatchDate: "2026-04-15", closeDate: null, status: "dueSoon", coveredByTHO: false, coverageHours: 0, zone: "Centro", seller: "María Gómez", commissionTHOPaid: false, commissionSellerPaid: false },
    { id: 102, client: "Ferretería El Constructor", invoiceNumber: "FAC-2026-002", orderNumber: "PED-2026-003", amount: 4500, paidAmount: 0, coveredAmount: 0, dueDate: "2026-05-22", dispatchDate: "2026-04-22", closeDate: null, status: "dueSoon", coveredByTHO: false, coverageHours: 0, zone: "Centro", seller: "María Gómez", commissionTHOPaid: false, commissionSellerPaid: false },
    { id: 201, client: "Pinturas del Centro", invoiceNumber: "FAC-2026-006", orderNumber: "PED-2026-002", amount: 12500, paidAmount: 0, coveredAmount: 0, dueDate: "2026-05-20", dispatchDate: "2026-04-20", closeDate: null, status: "dueSoon", coveredByTHO: false, coverageHours: 0, zone: "Norte", seller: "Carlos Díaz", commissionTHOPaid: false, commissionSellerPaid: false },
    { id: 301, client: "FerreNova Retail", invoiceNumber: "FAC-2026-010", orderNumber: "PED-2026-007", amount: 8450, paidAmount: 0, coveredAmount: 8450, dueDate: "2026-04-05", dispatchDate: "2026-03-06", closeDate: "2026-05-03", status: "covered", coveredByTHO: true, coverageHours: 18, zone: "Oeste", seller: "Luis Pérez", commissionTHOPaid: false, commissionSellerPaid: true },
    { id: 501, client: "Materiales El Ávila", invoiceNumber: "FAC-2026-016", orderNumber: "PED-2026-012", amount: 8900, paidAmount: 0, coveredAmount: 0, dueDate: "2026-06-25", dispatchDate: "2026-05-26", closeDate: null, status: "pending", coveredByTHO: false, coverageHours: 0, zone: "Norte", seller: "María Gómez", commissionTHOPaid: false, commissionSellerPaid: false },
    { id: 601, client: "Ferretería Central", invoiceNumber: "FAC-2026-020", orderNumber: "PED-2026-011", amount: 12500, paidAmount: 12500, coveredAmount: 0, dueDate: "2026-04-29", dispatchDate: "2026-03-30", closeDate: "2026-05-04", status: "paid", coveredByTHO: false, coverageHours: 22, zone: "Sur", seller: "Luis Pérez", commissionTHOPaid: true, commissionSellerPaid: false },
    { id: 701, client: "Suministros La Guaira", invoiceNumber: "FAC-2026-028", orderNumber: "PED-2026-018", amount: 7300, paidAmount: 0, coveredAmount: 0, dueDate: "2026-05-01", dispatchDate: "2026-04-01", closeDate: null, status: "overdue", coveredByTHO: false, coverageHours: 0, zone: "Este", seller: "Sin vendedor asignado", commissionTHOPaid: false, commissionSellerPaid: false },
  ];

  const paymentNotifications = [
    { id: "PAY-001", invoiceNumber: "FAC-2026-001", client: "Ferretería El Constructor", amount: 7300, bank: "Banco Mercantil", reference: "REF-845120", date: "2026-05-14", method: "Transferencia" },
    { id: "PAY-002", invoiceNumber: "FAC-2026-006", client: "Pinturas del Centro", amount: 5600, bank: "Banesco", reference: "REF-239880", date: "2026-05-13", method: "Pago móvil" },
    { id: "PAY-003", invoiceNumber: "FAC-2026-016", client: "Materiales El Ávila", amount: 8900, bank: "Banco de Venezuela", reference: "REF-778410", date: "2026-05-12", method: "Transferencia" },
  ];

  const validatedPaymentsByInvoice = paymentNotifications.reduce((acc, payment) => {
    if (paymentValidationStatus[payment.id] === "validated") {
      acc[payment.invoiceNumber] = (acc[payment.invoiceNumber] || 0) + Number(payment.amount || 0);
    }
    return acc;
  }, {});

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
        { name: "Barquisimeto", zone: "Sur", urbanizations: ["Nueva Segovia", "Cabudare", "La Mora"] },
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

  const selectedStates = asArray(selectedState);
  const stateSources = selectedStates.length ? locationData.filter((item) => selectedStates.includes(item.state)) : locationData;
  const availableCities = stateSources.flatMap((item) => item.cities || []);
  const selectedCities = asArray(selectedCity);
  const citySources = selectedCities.length ? availableCities.filter((city) => selectedCities.includes(city.name)) : availableCities;
  const availableUrbanizations = [...new Set(citySources.flatMap((city) => city.urbanizations || []))];

  const selectedLocationZones = (() => {
    if (asArray(selectedUrbanization).length) return [...new Set(citySources.filter((city) => (city.urbanizations || []).some((u) => asArray(selectedUrbanization).includes(u))).map((city) => city.zone))];
    if (selectedCities.length) return [...new Set(citySources.map((city) => city.zone))];
    if (selectedStates.length) return [...new Set(stateSources.map((item) => item.zone))];
    return [];
  })();

  const selectedLocationZone = selectedLocationZones.length === 1 ? selectedLocationZones[0] : "all";
  const matchesLocationZone = (zone) => selectedLocationZones.length === 0 || selectedLocationZones.includes(zone) || zone === "Todas";

  const filteredSellersByLocation = sellers.filter(
    (seller) => seller.name === "TH.O automático" || matchesLocationZone(seller.zone)
  );

  const zoneToState = {
    Centro: "Carabobo",
    Norte: "Distrito Capital",
    Sur: "Lara",
    Este: "Anzoátegui",
    Oeste: "Zulia",
    Todas: "Todas las regiones",
  };

  const findLocationByCity = (cityName = "") => {
    if (!cityName) return null;
    for (const stateRecord of locationData) {
      const city = (stateRecord.cities || []).find((item) => item.name === cityName);
      if (city) return { stateRecord, city };
    }
    return null;
  };

  const getLocationParts = (fallbackZone = "", cityName = "", urbanizationName = "") => {
    const selectedUrbanizationValues = asArray(selectedUrbanization);
    const selectedCityValues = asArray(selectedCity);

    const byExplicitCity = findLocationByCity(cityName);
    if (byExplicitCity) {
      const preferredUrbanization = urbanizationName || selectedUrbanizationValues.find((urbanization) => (byExplicitCity.city.urbanizations || []).includes(urbanization)) || (byExplicitCity.city.urbanizations || [])[0] || "";
      return { state: byExplicitCity.stateRecord.state, city: byExplicitCity.city.name, urbanization: preferredUrbanization };
    }

    if (!fallbackZone || fallbackZone === "Todas") return { state: "Todas las regiones", city: "", urbanization: "" };
    const stateRecord = locationData.find((location) => location.zone === fallbackZone || location.state === fallbackZone);
    if (!stateRecord) return { state: zoneToState[fallbackZone] || fallbackZone, city: "", urbanization: "" };

    const matchingCityByUrbanization = stateRecord.cities.find((city) =>
      selectedUrbanizationValues.some((urbanization) => (city.urbanizations || []).includes(urbanization))
    );
    const matchingCity = stateRecord.cities.find((city) => selectedCityValues.includes(city.name));
    const city = matchingCityByUrbanization || matchingCity || stateRecord.cities[0] || {};
    const urbanization = urbanizationName || selectedUrbanizationValues.find((urbanization) => (city.urbanizations || []).includes(urbanization)) || (city.urbanizations || [])[0] || "";

    return { state: stateRecord.state, city: city.name || "", urbanization };
  };

  const getLocationLabel = (fallbackZone = "", cityName = "", urbanizationName = "") => {
    const parts = getLocationParts(fallbackZone, cityName, urbanizationName);
    return [parts.state, parts.city, parts.urbanization].filter(Boolean).join(" / ");
  };

  const getClientLocationLabel = (clientName = "", fallbackZone = "") => {
    const client = clients.find((item) => item.name === clientName);
    return getLocationLabel(client?.zone || fallbackZone, client?.region || "", client?.urbanization || "");
  };

  const excelMoneyTerms = [
    "monto", "ventas", "venta", "utilidad", "facturación", "facturacion", "ticket promedio",
    "saldo", "comisión", "comision", "flujo", "cartera", "cobrado", "cubierto",
    "capital", "ingreso", "precio", "costo", "base cerrada", "total artículo", "total articulo"
  ];

  const isExcelMoneyColumn = (header, value) => {
    const headerLabel = String(header || "").toLowerCase();
    const cellValue = String(value ?? "").trim().toLowerCase();
    if (headerLabel.includes("%")) return false;
    if (headerLabel.includes("usd")) return true;
    if (cellValue.startsWith("usd ") || cellValue.startsWith("us$")) return true;
    return excelMoneyTerms.some((term) => headerLabel.includes(term));
  };

  const getExcelHeaderLabel = (header, sampleValue) => {
    if (isExcelMoneyColumn(header, sampleValue) && !/usd/i.test(String(header))) return `${header} USD`;
    return header;
  };

  const stripPercentSymbol = (value) => {
    if (value === null || value === undefined || value === "") return value;
    const text = String(value).trim();
    if (text === "N/A" || text === "-") return text;
    return text.endsWith("%") ? text.slice(0, -1) : text;
  };

  const normalizeTableCell = (header, value) => {
    if (String(header || "").includes("%")) return stripPercentSymbol(value);
    return value;
  };

  const getProductSku = (product) => product?.sku || `THO-${String(product?.id || 0).padStart(4, "0")}`;
  const clientRifMap = {
    "Ferretería El Constructor": "J-30124567-8",
    "Pinturas del Centro": "J-30987654-1",
    "FerreNova Retail": "J-40234567-9",
    "Construcciones Delta": "J-29876543-2",
    "Materiales El Ávila": "J-31567890-4",
    "Ferretería Central": "J-28765432-5",
    "Suministros La Guaira": "J-27654321-6",
  };

  const getClientRif = (clientName = "") => clientRifMap[clientName] || "J-00000000-0";

  const addRifToExcelRows = (rows = []) => rows.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return row;
    const keys = Object.keys(row);
    const clientKey = keys.find((key) => key.toLowerCase() === "cliente");
    if (!clientKey || keys.some((key) => key.toLowerCase() === "rif")) return row;
    return keys.reduce((acc, key) => {
      if (key === clientKey) acc.RIF = getClientRif(row[key]);
      acc[key] = row[key];
      return acc;
    }, {});
  });


  const getExcelCellValue = (header, value) => {
    if (String(header || "").includes("%")) return stripPercentSymbol(value);
    if (!isExcelMoneyColumn(header, value)) return value;
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "number") return value;
    const raw = String(value).trim();
    if (raw === "-" || raw === "N/A") return raw;
    const cleaned = raw
      .replace(/^USD\s*/i, "")
      .replace(/^US\$\s*/i, "")
      .replace(/\s/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : raw.replace(/^USD\s*/i, "").replace(/^US\$\s*/i, "");
  };

  const buildExcelTable = (sheetName, rows) => {
    const excelRows = addRifToExcelRows(rows || []);
    const headers = excelRows?.length ? Object.keys(excelRows[0]) : ["Sin datos"];
    const escapeCell = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const tableRows = excelRows?.length
      ? excelRows
          .map(
            (row) =>
              `<tr>${headers.map((header) => `<td>${escapeCell(getExcelCellValue(header, row[header]))}</td>`).join("")}</tr>`
          )
          .join("")
      : `<tr><td>No hay datos para exportar.</td></tr>`;

    return `
      <table>
        <thead>
          <tr><th colspan="${headers.length}" class="sheet-title">${escapeCell(sheetName)}</th></tr>
          <tr>${headers.map((header) => `<th>${escapeCell(wrapHeaderLabel(getExcelHeaderLabel(header, excelRows?.[0]?.[header])))}</th>`).join("")}</tr>
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
              background: #091A2D;
              color: #FFFFFF;
              font-weight: bold;
              border: 1px solid #D6D0C4;
              padding: 8px;
              white-space: normal;
              mso-wrap-style: square;
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
    rows = addRifToExcelRows(rows || []);
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
          `<tr>${headers.map((header) => `<td>${escapeCell(getExcelCellValue(header, row[header]))}</td>`).join("")}</tr>`
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
            th { background: #091A2D; color: #FFFFFF; font-weight: bold; border: 1px solid #D6D0C4; padding: 8px; white-space: normal; mso-wrap-style: square; }
            td { border: 1px solid #D6D0C4; padding: 8px; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map((header) => `<th>${escapeCell(wrapHeaderLabel(getExcelHeaderLabel(header, rows?.[0]?.[header])))}</th>`).join("")}</tr>
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

  const buildBlockedClientsRows = (clients, sourceLabel) =>
    clients
      .filter((client) => client.status === "Bloqueado")
      .map((client) => ({
        "Cliente": client.name,
        "Lista": sourceLabel,
        "Estado": client.status,
        "Días de mora": client.overdueDays,
        "Ubicación": getLocationLabel(client.zone, client.region || "", client.urbanization || ""),
        "Vendedor / Mayorista": client.seller,
        "Acción": client.action,
      }));

  const exportBlockedClientsList = (reportName, clients, sourceLabel) => {
    exportToExcel(reportName, buildBlockedClientsRows(clients, sourceLabel));
  };


  const exportDisciplineFullExcel = () => {
    downloadExcelWorkbook("disciplina_del_canal", [
      { name: "Bloqueados con este mayorista", rows: buildBlockedClientsRows(discipline.ownDelinquents, "Bloqueados con este mayorista") },
      { name: "Bloqueados con otros mayoristas", rows: buildBlockedClientsRows(discipline.platformDelinquents, "Bloqueados con otros mayoristas") },
      {
        name: "Salud del canal",
        rows: [
          { Indicador: "Clientes bloqueados", Valor: discipline.blockedClients },
          { Indicador: "Reincorporaciones", Valor: discipline.reinstatements },
          { Indicador: "Tiempo promedio de mora", Valor: `${formatDecimal(discipline.avgOverdueDays)} días` },
          { Indicador: "Clientes disciplinados", Valor: formatPercent(discipline.disciplinedPercent) },
          { Indicador: "Clientes sancionados", Valor: formatPercent(discipline.sanctionedPercent) },
        ],
      },
    ]);
  };

  const exportSalesDashboardExcel = () => {
    const escapeCell = (value) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");

    const originRows = [
      ["Sin asistencia de vendedor", formatExcelNumber(thoOriginAmount), formatPercent(thoOriginPercent)],
      ["Con asistencia de vendedor", formatExcelNumber(sellerOriginAmount), formatPercent(sellerOriginPercent)],
    ];

    const sellerRows = salesSellerRows.map((seller) => [
      seller.name,
      getLocationLabel(seller.zone),
      formatExcelNumber(seller.amount),
      seller.orders,
      formatPercent(getSellerAssistedOrdersPercent(seller)),
    ]);

    const productRows = productAnalysisRows.map((row) => [
      getProductSku(row),
      row.name,
      row.category,
      getLocationLabel(row.region),
      row.sellerOrigin,
      row.salesUnits,
      formatExcelNumber(row.salesAmount),
      safePercent(row.salesShare),
      formatExcelNumber(row.utilityUSD || 0),
      row.utilityPercent === null ? "N/A" : safePercent(row.utilityPercent),
    ]);

    const sectionTitle = (title, colspan) =>
      `<tr><th colspan="${colspan}" class="section-title">${escapeCell(title)}</th></tr>`;

    const headerRow = (headers) =>
      `<tr>${headers.map((header) => `<th>${escapeCell(wrapHeaderLabel(getExcelHeaderLabel(header)))}</th>`).join("")}</tr>`;

    const dataRows = (headers, rows) =>
      rows.length
        ? rows
            .map((row) => `<tr>${row.map((cell, index) => `<td>${escapeCell(getExcelCellValue(headers[index], cell))}</td>`).join("")}</tr>`)
            .join("")
        : `<tr><td colspan="8">No hay datos para exportar.</td></tr>`;

    const spacer = `<tr class="spacer"><td colspan="8"></td></tr>`;

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
              width: 100%;
            }
            th {
              background: #091A2D;
              color: #FFFFFF;
              font-weight: bold;
              border: 1px solid #D6D0C4;
              padding: 8px;
              white-space: normal;
              mso-wrap-style: square;
            }
            td {
              border: 1px solid #D6D0C4;
              padding: 8px;
            }
            .section-title {
              background: #091A2D;
              color: #FFFFFF;
              text-align: center;
              font-size: 14pt;
            }
            .spacer td {
              height: 18px;
              background: #FFFFFF;
              border: 1px solid #E5E7EB;
            }
          </style>
        </head>
        <body>
          <table>
            ${sectionTitle("Ventas por origen", 3)}
            ${headerRow(["Origen", "Monto USD", "% del total"])}
            ${dataRows(["Origen", "Monto USD", "% del total"], originRows)}
            ${spacer}

            ${sectionTitle("Ventas por vendedor", 5)}
            ${headerRow(["Vendedor", "Ubicación", "Ventas USD", "Pedidos", "% del total de pedidos con asistencia"])}
            ${dataRows(["Vendedor", "Ubicación", "Ventas USD", "Pedidos", "% del total de pedidos con asistencia"], sellerRows)}
            ${spacer}

            ${sectionTitle("Ventas por producto del periodo seleccionado", 10)}
            ${headerRow(["SKU", "Producto", "Categoría", "Ubicación", "Origen", "Unidades", "Ventas USD", "% venta total", "Utilidad USD", "% utilidad"])}
            ${dataRows(["SKU", "Producto", "Categoría", "Ubicación", "Origen", "Unidades", "Ventas USD", "% venta total", "Utilidad USD", "% utilidad"], productRows)}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([workbook], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "dashboard_ventas.xls";
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
    setSalesProductFilter("");
    setSalesCategoryFilter([]);
    setSelectedState([]);
    setSelectedCity([]);
    setSelectedUrbanization([]);
  };

  const resetClientFilters = () => {
    setPeriodStart("2026-05-01");
    setPeriodEnd("2026-05-31");
    setClientSellerFilter([]);
    setClientSort("amountDesc");
    setSelectedState([]);
    setSelectedCity([]);
    setSelectedUrbanization([]);
  };

  const resetPerformanceFilters = () => {
    setPeriodStart("2026-05-01");
    setPeriodEnd("2026-05-31");
    setPerformanceSellerFilter([]);
    setPerformanceSort("amountDesc");
    setSelectedState([]);
    setSelectedCity([]);
    setSelectedUrbanization([]);
  };

  function LocationFilters({ compact = false }) {
    return (
      <>
        <MultiSelectFilter
          label="Estado"
          value={selectedState}
          onChange={(value) => {
            setSelectedState(value);
            setSelectedCity([]);
            setSelectedUrbanization([]);
            clearDependentLocationFilters();
          }}
          options={locationData.map((location) => location.state)}
        />
        <MultiSelectFilter
          label="Ciudad"
          value={selectedCity}
          onChange={(value) => {
            setSelectedCity(value);
            setSelectedUrbanization([]);
            clearDependentLocationFilters();
          }}
          options={[...new Set(availableCities.map((city) => city.name))]}
        />
        <MultiSelectFilter
          label="Urbanización"
          value={selectedUrbanization}
          onChange={(value) => {
            setSelectedUrbanization(value);
            clearDependentLocationFilters();
          }}
          options={availableUrbanizations}
        />
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
          <div className="absolute right-0 top-12 z-50 w-[360px] rounded-xl border bg-white p-4 shadow-2xl" style={{ borderColor: PALETTE.pastelGray }}>
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
                if (!date) return <div key={`empty-${index}`} className="h-9" />;

                const dateString = toInputDate(date);
                const isStart = dateString === periodStart;
                const isEnd = dateString === periodEnd;
                const isInRange = isDateInRange(dateString);

                return (
                  <button
                    key={dateString}
                    type="button"
                    onClick={() => handleCalendarDayClick(date)}
                    className="h-9 rounded-lg text-xs font-bold transition-all"
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


  function wrapHeaderLabel(label) {
    return String(label || "")
      .replace(/Comisión TH\.O captación estimada USD/gi, "Comisión TH.O\nCaptación estimada USD")
      .replace(/Comisión TH\.O plataforma USD/gi, "Comisión TH.O\nPlataforma USD")
      .replace(/Comisión vendedor estimada USD/gi, "Comisión vendedor\nEstimada USD")
      .replace(/Total comisiones estimadas USD/gi, "Total comisiones\nEstimadas USD")
      .replace(/Flujo neto esperado USD/gi, "Flujo neto\nEsperado USD")
      .replace(/Comisión pendiente USD/gi, "Comisión\nPendiente USD")
      .replace(/Comisión pagada USD/gi, "Comisión\nPagada USD")
      .replace(/Total comisión TH\.O USD/gi, "Total comisión\nTH.O USD")
      .replace(/Volumen total ventas USD/gi, "Volumen total\nVentas USD")
      .replace(/Total de la factura USD/gi, "Total de la\nfactura USD")
      .replace(/Saldo pendiente USD/gi, "Saldo pendiente\nUSD")
      .replace(/Stock para X días/gi, "Stock para\nX días");
  }

  function MiniExcel({ columns, rows, maxHeight = "760px", emptyMessage = "No hay datos para mostrar." }) {
    const normalizedColumns = useMemo(() => {
      const sourceColumns = Array.isArray(columns) ? columns : [];
      const hasClientColumn = sourceColumns.some((column) => String(column?.key || "").toLowerCase() === "client" || String(column?.label || "").toLowerCase() === "cliente");
      const hasRifColumn = sourceColumns.some((column) => String(column?.key || "").toLowerCase() === "rif" || String(column?.label || "").toLowerCase() === "rif");
      if (!hasClientColumn || hasRifColumn) return sourceColumns;
      const output = [];
      sourceColumns.forEach((column) => {
        const isClientColumn = String(column?.key || "").toLowerCase() === "client" || String(column?.label || "").toLowerCase() === "cliente";
        if (isClientColumn) output.push({ key: `rif-${column.key}`, label: "RIF", render: (row) => getClientRif(row[column.key] || row.client || row.Cliente || row.name || row.cliente) });
        output.push(column);
      });
      return output;
    }, [columns]);

    return (
      <div className="w-full overflow-hidden rounded-xl border" style={{ borderColor: PALETTE.softBorder }}>
        <div className="w-full overflow-auto" style={{ maxHeight }}>
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
              <tr>{normalizedColumns.map((column) => <th key={column.key} className="whitespace-normal px-3 py-2 text-left text-xs font-black uppercase leading-tight tracking-wide text-white">{wrapHeaderLabel(column.label).split("\n").map((part, idx) => <React.Fragment key={idx}>{idx > 0 && <br />}{part}</React.Fragment>)}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.length === 0 ? (
                <tr><td colSpan={normalizedColumns.length} className="px-3 py-6 text-center text-sm text-gray-500">{emptyMessage}</td></tr>
              ) : rows.map((row, index) => (
                <tr key={row.id || row.key || index} className="hover:bg-yellow-50/40">
                  {normalizedColumns.map((column) => <td key={column.key} className="whitespace-nowrap px-3 py-2 text-gray-700">{normalizeTableCell(column.label, column.render ? column.render(row) : row[column.key])}</td>)}
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

    // Distribucion comercial por zona: el producto tiene una zona natural fuerte y
    // participaciones menores en las demas. Esto permite que al filtrar por
    // ubicacion el ranking se recalculen segun las ventas reales del filtro,
    // no segun la posicion global original.
    const rawRegionWeights = salesRegions.map((region, index) => {
      if (region === product.region) return 0.55;
      return 0.06 + (((product.id + index * 3) % 5) * 0.025);
    });
    const totalRegionWeight = rawRegionWeights.reduce((sum, weight) => sum + weight, 0);
    const regionWeights = rawRegionWeights.map((weight) => weight / totalRegionWeight);

    return salesRegions.map((region, index) => ({
      ...product,
      region,
      salesAmount: Math.round(baseAmount * regionWeights[index]),
      salesUnits: Math.round(baseUnits * regionWeights[index]),
    }));
  });

  const filteredSalesVolumeBaseRows = salesVolumeRows.filter((row) => {
    const matchesProduct = !salesProductFilter.trim() || row.name.toLowerCase().includes(salesProductFilter.trim().toLowerCase());
    const matchesCategory = matchesMulti(row.category, salesCategoryFilter);
    const matchesRegion = matchesLocationZone(row.region);

    return matchesProduct && matchesCategory && matchesRegion;
  });

  const filteredSalesVolumeRows =
    selectedLocationZones.length === 0
      ? productsData
          .filter((product) => {
            const matchesProduct = !salesProductFilter.trim() || product.name.toLowerCase().includes(salesProductFilter.trim().toLowerCase());
            const matchesCategory = matchesMulti(product.category, salesCategoryFilter);

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
    const monthlySales = salesVolumeTotal;
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
  }, [invoices, productsData, collectionFlow, orderHistory.length, receivedOrders, salesVolumeTotal]);

  const filteredClients = clients.filter((client) => {
    const matchesSearch = !invoiceSearchTerm || client.name.toLowerCase().includes(invoiceSearchTerm.toLowerCase());
    const matchesStatus = !hasMulti(invoiceStatusFilter) || matchesMulti(client.paymentStatus, invoiceStatusFilter) || (asArray(invoiceStatusFilter).includes("risk") && ["medium", "high"].includes(client.risk));
    return matchesSearch && matchesStatus;
  });

  const inventoryCategoryOptions = [...new Set(productsData.map((product) => product.category).filter(Boolean))];

  const filteredInventoryProducts = [...productsData]
    .filter((product) => !productRotationSearch || product.name.toLowerCase().includes(productRotationSearch.toLowerCase()) || getProductSku(product).toLowerCase().includes(productRotationSearch.toLowerCase()))
    .filter((product) => productRotationCategoryFilter === "all" || product.category === productRotationCategoryFilter)
    .filter((product) => matchesLocationZone(product.region))
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
    selectedLocationZones.length === 0
      ? summary.thoSalesPercent
      : locationOriginPercentMap[selectedLocationZone] || summary.thoSalesPercent;

  const salesSellerRows = sellers
    .filter(
      (seller) =>
        seller.name !== "TH.O automático" &&
        (matchesLocationZone(seller.zone))
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

  const rawSellerOriginAmount = salesSellerRows.reduce((sum, seller) => sum + seller.amount, 0);
  const sellerOriginAmount = Math.min(rawSellerOriginAmount, salesVolumeTotal);
  const thoOriginAmount = Math.max(salesVolumeTotal - sellerOriginAmount, 0);
  const originTotalAmount = Math.max(salesVolumeTotal, 1);
  const thoOriginPercent = Number(((thoOriginAmount / originTotalAmount) * 100).toFixed(1));
  const sellerOriginPercent = Number(((sellerOriginAmount / originTotalAmount) * 100).toFixed(1));

  const salesSellerTotal = salesSellerRows.reduce((sum, seller) => sum + seller.amount, 0);
  const salesSellerOrdersTotal = salesSellerRows.reduce((sum, seller) => sum + seller.orders, 0);
  const getSellerAssistedOrdersPercent = (seller) =>
    salesSellerOrdersTotal > 0 ? (seller.orders / salesSellerOrdersTotal) * 100 : 0;
  const selectedSalesLocationLabel = selectedLocationZones.length === 0 ? "Todas las regiones" : getLocationLabel(selectedLocationZone);

  const filteredClientRows = clients
    .filter((client) => matchesLocationZone(client.zone))
    .filter((client) => matchesMulti(client.seller, clientSellerFilter))
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
    .filter((seller) => matchesLocationZone(seller.zone) || seller.zone === "Todas")
    .filter((seller) => matchesMulti(seller.name, performanceSellerFilter))
    .sort((a, b) => {
      if (performanceSort === "amountDesc") return b.amount - a.amount;
      if (performanceSort === "amountAsc") return a.amount - b.amount;
      if (performanceSort === "ordersDesc") return b.orders - a.orders;
      if (performanceSort === "ordersAsc") return a.orders - b.orders;
      return 0;
    });

  const normalizedInvoices = invoices.map((invoice) => {
    const sellerAssigned = invoice.seller && invoice.seller !== "Sin vendedor asignado";
    const dispatchDate = invoice.dispatchDate || addDays(invoice.dueDate, -30);
    const calculatedDueDate = addDays(dispatchDate, 30);
    const validatedPaymentAmount = Number(validatedPaymentsByInvoice[invoice.invoiceNumber] || 0);
    const effectivePaidAmount = Number(invoice.paidAmount || 0) + validatedPaymentAmount;
    const pendingAmount = Math.max(Number(invoice.amount || 0) - effectivePaidAmount - Number(invoice.coveredAmount || 0), 0);
    const daysToDue = getDaysBetween(SERVER_TODAY, calculatedDueDate);
    const status = pendingAmount <= 0
      ? (Number(invoice.coveredAmount || 0) > 0 || invoice.coveredByTHO ? "covered" : "paid")
      : daysToDue < 0
      ? "overdue"
      : daysToDue <= 10
      ? "dueSoon"
      : "pending";
    const isClosed = ["paid", "covered"].includes(status);
    const closedAmount = isClosed ? Number(invoice.amount || 0) : 0;
    const platformCommission = sellerAssigned ? closedAmount * 0.015 : 0;
    const sellerCommission = sellerAssigned ? closedAmount * 0.05 : 0;
    const captureCommission = sellerAssigned ? 0 : closedAmount * 0.05;
    const estimatedPlatformCommission = sellerAssigned ? pendingAmount * 0.015 : 0;
    const estimatedSellerCommission = sellerAssigned ? pendingAmount * 0.05 : 0;
    const estimatedCaptureCommission = sellerAssigned ? 0 : pendingAmount * 0.05;
    return {
      ...invoice,
      paidAmount: effectivePaidAmount,
      validatedPaymentAmount,
      dispatchDate,
      dueDate: calculatedDueDate,
      calculatedDueDate,
      status,
      pendingAmount,
      sellerAssigned,
      daysToDue,
      expectedCollectionDate: calculatedDueDate,
      statusLabel: getInvoiceStatusLabel(status),
      platformCommission,
      sellerCommission,
      captureCommission,
      totalCommission: platformCommission + sellerCommission + captureCommission,
      netFlow: closedAmount - (platformCommission + sellerCommission + captureCommission),
      estimatedPlatformCommission,
      estimatedSellerCommission,
      estimatedCaptureCommission,
      estimatedTotalCommission: estimatedPlatformCommission + estimatedSellerCommission + estimatedCaptureCommission,
      expectedNetFlow: pendingAmount - (estimatedPlatformCommission + estimatedSellerCommission + estimatedCaptureCommission),
      commissionTHOStatus: getCommissionStatus(platformCommission + captureCommission, invoice.commissionTHOPaid),
      commissionSellerStatus: getCommissionStatus(sellerCommission, invoice.commissionSellerPaid),
      paidBy: status === "covered" ? "TH.O" : status === "paid" ? "Ferretería" : "Pendiente",
    };
  });

  const filteredInvoiceRows = normalizedInvoices
    .filter((invoice) => matchesLocationZone(invoice.zone))
    .filter((invoice) => matchesMulti(invoice.seller, invoiceSellerFilter))
    .filter((invoice) => {
      const matchesSearch = !invoiceSearchTerm || invoice.client.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) || invoice.invoiceNumber.toLowerCase().includes(invoiceSearchTerm.toLowerCase());
      const matchesStatus = !hasMulti(invoiceStatusFilter) || matchesMulti(invoice.status, invoiceStatusFilter) || (asArray(invoiceStatusFilter).includes("risk") && ["overdue", "covered"].includes(invoice.status));
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const diff = new Date(`${a.dueDate}T00:00:00`) - new Date(`${b.dueDate}T00:00:00`);
      return invoiceDueSort === "soonest" ? diff : -diff;
    });

  // Regla documental: facturación y riesgo analiza facturas individuales. No agrupar por cliente.
  const groupedInvoiceRows = filteredInvoiceRows;

  const filteredCollectionFlow = collectionFlow
    .filter((item) => matchesLocationZone(item.zone))
    .filter((item) => matchesMulti(item.seller, cashflowSellerFilter))
    .filter((item) => item.date >= periodStart && item.date <= periodEnd);


  const cashflowBaseInvoices = normalizedInvoices
    .filter((invoice) => matchesLocationZone(invoice.zone))
    .filter((invoice) => matchesMulti(invoice.seller, cashflowSellerFilter))
    .filter((invoice) => !cashflowClientSearch || invoice.client.toLowerCase().includes(cashflowClientSearch.toLowerCase()) || invoice.invoiceNumber.toLowerCase().includes(cashflowClientSearch.toLowerCase()))
    .filter((invoice) => matchesMulti(invoice.status, cashflowStatusFilter))
    .filter((invoice) => (invoice.dueDate >= periodStart && invoice.dueDate <= periodEnd) || (invoice.closeDate && invoice.closeDate >= periodStart && invoice.closeDate <= periodEnd));

  const cashflowCommittedRows = cashflowBaseInvoices
    .filter((invoice) => ["pending", "dueSoon", "overdue"].includes(invoice.status))
    .sort((a, b) => new Date(`${a.expectedCollectionDate}T00:00:00`) - new Date(`${b.expectedCollectionDate}T00:00:00`));

  const cashflowCommissionRows = cashflowBaseInvoices
    .filter((invoice) => ["paid", "covered"].includes(invoice.status))
    .filter((invoice) => !hasMulti(cashflowCommissionStatusFilter) || asArray(cashflowCommissionStatusFilter).some((status) => [invoice.commissionTHOStatus, invoice.commissionSellerStatus].includes(status)))
    .sort((a, b) => new Date(`${b.closeDate || b.dueDate}T00:00:00`) - new Date(`${a.closeDate || a.dueDate}T00:00:00`));

  const cashflowBeneficiaryRows = Object.values(cashflowCommissionRows.reduce((acc, invoice) => {
    if (!acc["TH.O"]) acc["TH.O"] = { beneficiary: "TH.O", invoices: 0, baseClosed: 0, platformCommission: 0, captureCommission: 0, totalTHOCommission: 0, sellerCommission: 0, paidCommission: 0, pendingCommission: 0 };
    const thoAmount = invoice.platformCommission + invoice.captureCommission;
    if (thoAmount > 0) {
      acc["TH.O"].invoices += 1;
      acc["TH.O"].baseClosed += invoice.amount;
      acc["TH.O"].platformCommission += invoice.platformCommission;
      acc["TH.O"].captureCommission += invoice.captureCommission;
      acc["TH.O"].totalTHOCommission += thoAmount;
      if (invoice.commissionTHOStatus === "Pagada") acc["TH.O"].paidCommission += thoAmount;
      else acc["TH.O"].pendingCommission += thoAmount;
    }
    if (invoice.sellerCommission > 0) {
      if (!acc[invoice.seller]) acc[invoice.seller] = { beneficiary: invoice.seller, invoices: 0, baseClosed: 0, platformCommission: 0, captureCommission: 0, totalTHOCommission: 0, sellerCommission: 0, paidCommission: 0, pendingCommission: 0 };
      acc[invoice.seller].invoices += 1;
      acc[invoice.seller].baseClosed += invoice.amount;
      acc[invoice.seller].sellerCommission += invoice.sellerCommission;
      if (invoice.commissionSellerStatus === "Pagada") acc[invoice.seller].paidCommission += invoice.sellerCommission;
      else acc[invoice.seller].pendingCommission += invoice.sellerCommission;
    }
    return acc;
  }, {}))
    .filter((row) => row.invoices > 0)
    .filter((row) => matchesMulti(row.beneficiary, cashflowBeneficiaryFilter))
    .filter((row) => !hasMulti(cashflowCommissionStatusFilter) || asArray(cashflowCommissionStatusFilter).some((status) => status === "Pagada" ? row.paidCommission > 0 : status === "Pendiente" ? row.pendingCommission > 0 : true))
    .sort((a, b) => b.pendingCommission - a.pendingCommission);

  const cashflowKpis = {
    pendingPortfolio: cashflowCommittedRows.reduce((sum, row) => sum + row.pendingAmount, 0),
    collectedPeriod: cashflowCommissionRows.filter((row) => row.status === "paid").reduce((sum, row) => sum + row.paidAmount, 0),
    coveredTHO: cashflowCommissionRows.filter((row) => row.status === "covered").reduce((sum, row) => sum + row.coveredAmount, 0),
    closedGrossIncome: cashflowCommissionRows.reduce((sum, row) => sum + Number(row.amount || 0), 0),
    platformCommission: cashflowCommissionRows.reduce((sum, row) => sum + row.platformCommission, 0),
    sellerCommission: cashflowCommissionRows.reduce((sum, row) => sum + row.sellerCommission, 0),
    captureCommission: cashflowCommissionRows.reduce((sum, row) => sum + row.captureCommission, 0),
    totalCommissions: cashflowCommissionRows.reduce((sum, row) => sum + row.totalCommission, 0),
    closedNetFlow: cashflowCommissionRows.reduce((sum, row) => sum + row.netFlow, 0),
    committedCollections: cashflowCommittedRows.reduce((sum, row) => sum + row.pendingAmount, 0),
    estimatedCommissions: cashflowCommittedRows.reduce((sum, row) => sum + row.estimatedTotalCommission, 0),
    expectedNetFlow: cashflowCommittedRows.reduce((sum, row) => sum + row.expectedNetFlow, 0),
  };


  const inventoryOnlyProducts = filteredInventoryProducts.map((product) => {
    const avgDailySales = Math.max(product.unitsSold / 30, 1);
    return { ...product, avgDailySales, stockDaysLeft: Math.round(product.stock / avgDailySales) };
  });


  const productAnalysisRows = sortedSalesRows.map((row, index) => {
    const sales = row.salesAmount || 0;
    const utility = getHistoricalUtility(row, row.salesUnits);
    const previousSales = Math.round(sales * (0.82 + (index % 5) * 0.04));
    const avgDaily = Math.max(Math.round((row.salesUnits || 0) / 30), 0);
    return {
      ...row,
      ranking: index + 1,
      uniqueClients: Math.max(1, Math.min(clients.length, Math.ceil((row.salesUnits || 0) / 80))),
      orderCount: Math.max(1, Math.ceil((row.salesUnits || 0) / 45)),
      salesShare: salesVolumeTotal > 0 ? (sales / salesVolumeTotal) * 100 : 0,
      utilityUSD: utility,
      utilityPercent: sales > 0 ? (utility / sales) * 100 : null,
      growthPercent: previousSales > 0 ? ((sales - previousSales) / previousSales) * 100 : null,
      stockDays: avgDaily > 0 ? (row.stock || 0) / avgDaily : null,
    };
  });

  const clientTotalAmount = adjustedClientRows.reduce((sum, client) => sum + client.periodAmount, 0);
  const globalHistoricalUtilityRate = salesVolumeTotal > 0
    ? productAnalysisRows.reduce((sum, row) => sum + Number(row.utilityUSD || 0), 0) / salesVolumeTotal
    : 0;
  const clientAnalysisRows = adjustedClientRows
    .filter((client) => !clientSearchTerm.trim() || client.name.toLowerCase().includes(clientSearchTerm.trim().toLowerCase()))
    .filter((client) => matchesMulti(client.type, clientTypeFilter))
    .map((client, index) => {
      const utility = Math.round(client.periodAmount * globalHistoricalUtilityRate);
      const previous = Math.round(client.periodAmount * (0.78 + (index % 4) * 0.08));
      const compliance = client.risk === "low" ? 98 : client.risk === "medium" ? 88 : 64;
      return {
        ...client,
        purchaseFrequencyDays: client.frequency === "Semanal" ? 7 : client.frequency === "Quincenal" ? 15 : 30,
        participation: clientTotalAmount > 0 ? (client.periodAmount / clientTotalAmount) * 100 : 0,
        averageTicket: client.periodPurchases > 0 ? client.periodAmount / client.periodPurchases : 0,
        utilityUSD: utility,
        utilityPercent: client.periodAmount > 0 ? (utility / client.periodAmount) * 100 : null,
        growthPercent: previous > 0 ? ((client.periodAmount - previous) / previous) * 100 : null,
        avgPaymentDays: client.paymentStatus === "paid" ? 21 : client.paymentStatus === "overdue" ? 43 : 29,
        compliance,
        locationLabel: getLocationLabel(client.zone, client.region, client.urbanization || ""),
      };
    });

  const performanceRows = filteredSellers.map((seller, index) => {
    const assignedClients = clients.filter((client) => client.seller === seller.name).length || (seller.name === "TH.O automático" ? 0 : 1);
    const activeClients = clients.filter((client) => client.seller === seller.name && client.totalPurchases > 0).length;
    const assistedOrders = seller.name === "TH.O automático" ? 0 : Math.round(seller.orders * ((seller.assistedPercent || 0) / 100));
    const previousAmount = Math.round(seller.amount * (0.82 + (index % 3) * 0.07));
    return {
      ...seller,
      locationLabel: getLocationLabel(seller.zone),
      assignedClients,
      activeClients,
      activeClientPercent: assignedClients > 0 ? (activeClients / assignedClients) * 100 : null,
      newClients: clients.filter((client) => client.seller === seller.name && client.type === "Nuevo").length,
      reactivatedClients: clients.filter((client) => client.seller === seller.name && client.type === "Reactivado").length,
      utilityUSD: Math.round(seller.amount * globalHistoricalUtilityRate),
      assistedOrders,
      assistancePercent: seller.orders > 0 ? (assistedOrders / seller.orders) * 100 : null,
      averageTicket: seller.orders > 0 ? seller.amount / seller.orders : null,
      growthPercent: previousAmount > 0 ? ((seller.amount - previousAmount) / previousAmount) * 100 : null,
    };
  });

  const performanceTotalOrders = performanceRows.reduce((sum, seller) => sum + Number(seller.orders || 0), 0);
  const performanceAssistedOrders = performanceRows.reduce((sum, seller) => sum + Number(seller.assistedOrders || 0), 0);
  const performanceUnassistedOrders = Math.max(performanceTotalOrders - performanceAssistedOrders, 0);
  const performanceAssistedPercent = performanceTotalOrders > 0 ? (performanceAssistedOrders / performanceTotalOrders) * 100 : 0;
  const performanceUnassistedPercent = performanceTotalOrders > 0 ? (performanceUnassistedOrders / performanceTotalOrders) * 100 : 0;

  const invoiceRiskRows = groupedInvoiceRows.map((invoice) => {
    const dispatchDate = invoice.dispatchDate;
    const dueDate = invoice.calculatedDueDate || invoice.dueDate;
    const isPaid = invoice.status === "paid";
    const isCovered = invoice.status === "covered";
    const daysToDue = isPaid || isCovered ? 0 : invoice.daysToDue;
    const pendingAmount = invoice.pendingAmount;
    const statusLabel = invoice.statusLabel;
    const ageLabel = isPaid ? "Pagada" : isCovered ? "Cubierta por TH.O" : daysToDue >= 0 ? "Por vencer" : `Mora ${Math.abs(daysToDue)} días`;
    return { ...invoice, dispatchDate, calculatedDueDate: dueDate, daysToDue, pendingAmount, statusLabel, ageLabel, locationLabel: getClientLocationLabel(invoice.client, invoice.zone) };
  });

  const invoiceOpenRows = invoiceRiskRows.filter((invoice) => ["pending", "dueSoon", "overdue"].includes(invoice.status));
  const invoicePaidRows = invoiceRiskRows.filter((invoice) => invoice.status === "paid");
  const invoiceOverdueRows = invoiceRiskRows.filter((invoice) => invoice.status === "overdue");

  const inventoryMonitoringRows = inventoryOnlyProducts.map((product, index) => {
    const previousUnits = Math.round(product.unitsSold * (0.75 + (index % 5) * 0.05));
    const stockDays = product.stockDaysLeft || 0;
    const statusLabel = product.lowRotation ? "Baja rotación" : stockDays < 15 ? "Quiebre probable" : stockDays <= 30 ? "Vigilar stock" : "Stock sano";
    return {
      ...product,
      ranking: index + 1,
      topZone: getLocationLabel(product.region),
      utilityUSD: getHistoricalUtility(product, product.unitsSold),
      growthPercent: previousUnits > 0 ? ((product.unitsSold - previousUnits) / previousUnits) * 100 : null,
      stockDaysLabel: product.unitsSold > 0 ? `${stockDays} días` : "Sin consumo",
      statusLabel,
    };
  }).filter((product) => productStatusFilter === "all" || product.statusLabel === productStatusFilter)
    .map((product, index) => ({ ...product, ranking: index + 1 }));

  const overviewMetrics = (() => {
    const ordersPeriod = Math.max(receivedOrders.length + orderHistory.length + dispatchOrders.length, 1);
    const activeClientsCount = new Set(clients.filter((client) => matchesLocationZone(client.zone)).map((client) => client.name)).size;
    const grossUtility = productAnalysisRows.reduce((sum, row) => sum + Number(row.utilityUSD || 0), 0);
    const pendingPortfolio = normalizedInvoices.filter((invoice) => ["pending", "dueSoon", "overdue"].includes(invoice.status)).reduce((sum, invoice) => sum + invoice.pendingAmount, 0);
    const overdueAmount = normalizedInvoices.filter((invoice) => invoice.status === "overdue").reduce((sum, invoice) => sum + invoice.pendingAmount, 0);
    const newClients = clientAnalysisRows.filter((client) => client.type === "Nuevo").length;
    const recurringClients = clientAnalysisRows.filter((client) => client.type === "Recurrente").length;
    const reactivatedClients = clientAnalysisRows.filter((client) => client.type === "Reactivado").length;
    const topClient = [...clientAnalysisRows].sort((a, b) => (b.periodAmount || 0) - (a.periodAmount || 0))[0];
    const assistedOrders = performanceRows.reduce((sum, seller) => sum + Number(seller.assistedOrders || 0), 0);
    const totalSellerOrders = performanceRows.reduce((sum, seller) => sum + Number(seller.orders || 0), 0);
    const bestSeller = [...performanceRows].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0];
    const zoneTotals = salesVolumeRows.reduce((acc, row) => {
      acc[row.region] = (acc[row.region] || 0) + Number(row.salesAmount || 0);
      return acc;
    }, {});
    const topZone = Object.entries(zoneTotals).sort((a, b) => b[1] - a[1])[0];
    const topProduct = [...productAnalysisRows].sort((a, b) => (b.salesUnits || 0) - (a.salesUnits || 0))[0];
    const topUtilityProduct = [...productAnalysisRows].sort((a, b) => (b.utilityUSD || 0) - (a.utilityUSD || 0))[0];
    return {
      salesPeriod: salesVolumeTotal,
      ordersPeriod,
      activeClientsCount,
      ticketAverage: salesVolumeTotal / Math.max(ordersPeriod, 1),
      grossUtility,
      closedNetFlow: cashflowKpis.closedNetFlow,
      pendingPortfolio,
      overdueAmount,
      coveredTHO: cashflowKpis.coveredTHO,
      committedCollections: cashflowKpis.committedCollections,
      pendingCommissions: cashflowBeneficiaryRows.reduce((sum, row) => sum + Number(row.pendingCommission || 0), 0),
      newClients,
      recurringClients,
      reactivatedClients,
      purchaseFrequency: ordersPeriod / Math.max(activeClientsCount, 1),
      topClient,
      assistedOrders,
      unassistedOrders: Math.max(totalSellerOrders - assistedOrders, 0),
      assistancePercent: totalSellerOrders > 0 ? (assistedOrders / totalSellerOrders) * 100 : 0,
      bestSeller,
      topZone,
      topProduct,
      topUtilityProduct,
      stockoutCount: inventoryMonitoringRows.filter((product) => product.statusLabel === "Quiebre probable").length,
      watchStockCount: inventoryMonitoringRows.filter((product) => product.statusLabel === "Vigilar stock").length,
      lowRotationCount: inventoryMonitoringRows.filter((product) => product.statusLabel === "Baja rotación").length,
    };
  })();

  const updatePublishedProduct = (productId, updates) => {
    setProductsData((prev) => prev.map((product) => (product.id === productId ? { ...product, ...updates } : product)));
  };

  const openManualProductForm = () => {
    const name = window.prompt("Nombre del producto");
    if (!name) return;
    const stock = Number(window.prompt("Stock disponible", "0") || 0);
    const price = Number(window.prompt("Precio de venta", "0") || 0);
    const cost = Number(window.prompt("Costo del producto", "0") || 0);
    const margin = Math.max(price - cost, 0);
    setProductsData((prev) => [
      {
        id: Date.now(),
        name,
        unitsSold: 0,
        price,
        unitCost: cost,
        historicalUnitPrice: price,
        historicalUnitCost: cost,
        revenue: price,
        cost,
        margin,
        marginPercent: price > 0 ? (margin / price) * 100 : 0,
        category: "Sin categoría",
        line: "Sin línea",
        region: "Centro",
        stock,
        turnoverDays: 0,
        stockoutRisk: stock <= 0 ? "high" : "low",
        lowRotation: false,
        sellerOrigin: "Vendedor",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80",
      },
      ...prev,
    ]);
  };

  const handleBulkUpload = () => {
    alert("Subida masiva lista: conecta aquí el lector de Excel/CSV o la API cuando el backend esté disponible.");
  };

  const editProductStock = (product) => {
    const nextStock = window.prompt(`Nuevo stock para ${product.name}`, product.stock);
    if (nextStock === null) return;
    updatePublishedProduct(product.id, { stock: Math.max(Number(nextStock) || 0, 0) });
  };

  const editProductPrice = (product) => {
    const nextPrice = window.prompt(`Nuevo precio para ${product.name}`, product.price || getHistoricalUnitPrice(product));
    if (nextPrice === null) return;
    updatePublishedProduct(product.id, { price: Math.max(Number(nextPrice) || 0, 0) });
  };

  const editProductCost = (product) => {
    const nextCost = window.prompt(`Nuevo costo unitario para ${product.name}`, product.unitCost || getHistoricalUnitCost(product));
    if (nextCost === null) return;
    updatePublishedProduct(product.id, { unitCost: Math.max(Number(nextCost) || 0, 0) });
  };

  const editProductDescription = (product) => {
    const description = window.prompt(`Descripción para ${product.name}`, product.description || "");
    if (description === null) return;
    updatePublishedProduct(product.id, { description });
  };

  const unpublishProduct = (product) => {
    if (window.confirm(`¿Dar de baja ${product.name}? Dejará de aparecer en publicados.`)) {
      updatePublishedProduct(product.id, { status: "inactive" });
    }
  };

  const orderDetailRows = (orders) =>
    orders.flatMap((order) =>
      (order.items || []).map((item) => ({
        Pedido: order.orderNumber,
        Cliente: order.buyer,
        Ubicación: getLocationLabel(order.zone),
        Vendedor: order.seller,
        Fecha: order.date,
        SKU: item.sku,
        Descripción: item.name,
        "Cantidad pedida": item.quantity,
        "Precio unitario USD": formatExcelNumber(item.unitPrice),
        "Total artículo USD": formatExcelNumber(item.unitPrice * item.quantity),
      }))
    );

  const normalizedOrderSearchTerm = orderSearchTerm.trim().toLowerCase();
  const matchesOrderSearch = (order) => {
    if (!normalizedOrderSearchTerm) return true;
    const values = [
      order.orderNumber,
      order.buyer,
      order.seller,
      order.zone,
      order.rif,
      ...(order.items || []).flatMap((item) => [item.sku, item.name]),
    ];
    return values.some((value) => String(value || "").toLowerCase().includes(normalizedOrderSearchTerm));
  };

  const acceptOrders = receivedOrders.filter((order) => order.status === "pending" && matchesOrderSearch(order));
  const toDispatchOrders = dispatchOrders.filter((order) => order.status === "to_dispatch" && matchesOrderSearch(order));
  const dispatchedOrders = dispatchOrders.filter((order) => order.status === "dispatched" && matchesOrderSearch(order));

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

  const handleValidatePayment = (paymentId) => {
    setPaymentValidationStatus((prev) => ({ ...prev, [paymentId]: "validated" }));
  };

  const openRejectPaymentModal = (payment) => {
    setPaymentRejectionModal(payment);
    setPaymentRejectionReason("");
  };

  const confirmRejectPayment = () => {
    const reason = paymentRejectionReason.trim();
    if (!paymentRejectionModal || !reason) return;
    setPaymentValidationStatus((prev) => ({ ...prev, [paymentRejectionModal.id]: "rejected" }));
    setPaymentRejectionReasons((prev) => ({ ...prev, [paymentRejectionModal.id]: reason }));
    setPaymentRejectionModal(null);
    setPaymentRejectionReason("");
  };

  const handleNotificationAction = (item) => {
    if (item.cashflowTab) setActiveCashflowTab(item.cashflowTab);
    setActiveTab(item.tab);
  };

  const markCommissionPaid = (key) => {
    setCommissionPaidStatus((prev) => ({ ...prev, [key]: true }));
  };

  const pendingPaymentNotifications = paymentNotifications.filter((payment) => !paymentValidationStatus[payment.id]);
  const systemNotifications = [
    ...pendingPaymentNotifications.map((payment) => ({
      id: payment.id,
      type: "Pago por validar",
      title: `Factura ${payment.invoiceNumber}`,
      description: `${payment.client} reportó un pago por ${formatUSD(payment.amount)} vía ${payment.method}.`,
      date: payment.date,
      actionLabel: "Validar pago",
      tab: "cashflow",
      cashflowTab: "payments",
      resolved: false,
    })),
    ...receivedOrders.filter((order) => order.status === "pending").map((order) => ({
      id: `ORDER-${order.id}`,
      type: "Nuevo pedido",
      title: order.orderNumber,
      description: `${order.buyer} envió un pedido de ${order.productName}.`,
      date: order.date,
      actionLabel: "Ir a pedidos",
      tab: "orders",
      resolved: false,
    })),
    { id: "SYS-001", type: "Sistema", title: "Factura próxima a vencer", description: "Hay facturas dentro del rango de 10 días para vencer.", date: "2026-05-15", actionLabel: "Revisar riesgo", tab: "invoices", resolved: false },
  ].filter((item) => !hasMulti(notificationTypeFilter) || matchesMulti(item.type, notificationTypeFilter));

  const tabs = [
    { id: "overview", label: "Visión general", icon: LayoutDashboard },
    { id: "sales", label: "Ventas", icon: BarChart3 },
    { id: "invoices", label: "Estado de factura", icon: FileText },
    { id: "cashflow", label: "Cobranza / flujo", icon: Wallet },
    { id: "products", label: "Inventario y stock", icon: Package },
    { id: "discipline", label: "Disciplina del canal", icon: Shield },
    { id: "orders", label: "Pedidos", icon: ShoppingBag, badge: receivedOrders.filter((order) => order.status === "pending").length },
    { id: "notifications", label: "Notificaciones", icon: Bell, badge: systemNotifications.filter((item) => !item.resolved).length },
    { id: "manual", label: "Manual de usuario", icon: FileText },
  ];

  const downloadWordDocument = (filename, title, paragraphs) => {
    const content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1>${paragraphs.map((text) => `<p>${text}</p>`).join("")}</body></html>`;
    const blob = new Blob([content], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

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
          <div className="mx-auto flex w-full max-w-none items-center justify-between">
            <div className="flex items-center gap-3">
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

      <main className="mx-auto w-full max-w-none px-4 py-6 sm:px-6 lg:px-8 2xl:px-10">
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
            <section className="relative overflow-visible rounded-[2rem] border p-6 shadow-sm" style={{ borderColor: PALETTE.softBorder, background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 58%, #FFF7C2 100%)" }}>
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-20" style={{ backgroundColor: PALETTE.sizzlingSunrise }} />
              <div className="absolute right-16 top-10 hidden h-24 w-24 rounded-full opacity-10 lg:block" style={{ backgroundColor: PALETTE.crystalBlue }} />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black shadow-sm" style={{ color: PALETTE.maastrichtBlue }}>
                    <Sparkles className="h-3.5 w-3.5" style={{ color: PALETTE.sizzlingSunrise }} />
                    Panel ejecutivo mayorista
                  </div>
                  <h2 className="text-3xl font-black tracking-tight" style={{ color: PALETTE.maastrichtBlue }}>Visión general</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Fotografía ejecutiva del negocio: ventas, cartera, clientes, fuerza comercial e inventario en una sola lectura.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[320px]">
                  <span className="self-start rounded-full bg-white px-4 py-2 text-xs font-black shadow-sm" style={{ color: PALETTE.maastrichtBlue }}>
                    Periodo: {periodStart} - {periodEnd}
                  </span>
                  <div className="relative z-30 w-full sm:w-[340px]">
                    <PeriodFilter />
                  </div>
                </div>
              </div>

              <div className="relative mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ExecutiveKPICard title="Ventas del período" value={formatUSD(overviewMetrics.salesPeriod)} subtitle={`${overviewMetrics.ordersPeriod} pedidos registrados`} icon={<DollarSign className="h-5 w-5" />} accent={PALETTE.sizzlingSunrise} tone="dark" onClick={() => setActiveTab("sales")} />
                <ExecutiveKPICard title="Utilidad bruta estimada" value={formatUSD(overviewMetrics.grossUtility)} subtitle="Ventas menos costo registrado" icon={<TrendingUp className="h-5 w-5" />} accent={PALETTE.success} tone="success" onClick={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }} />
                <ExecutiveKPICard title="Flujo neto cerrado" value={formatUSD(overviewMetrics.closedNetFlow)} subtitle="Ingreso cerrado menos comisiones" icon={<Wallet className="h-5 w-5" />} accent={PALETTE.crystalBlue} tone="blue" onClick={() => setActiveTab("cashflow")} />
                <ExecutiveKPICard title="Cartera pendiente" value={formatUSD(overviewMetrics.pendingPortfolio)} subtitle="Facturas abiertas por cobrar" icon={<Receipt className="h-5 w-5" />} accent={PALETTE.warning} tone="warning" onClick={() => setActiveTab("invoices")} />
              </div>
            </section>

            <OverviewBlock
              title="Resumen ejecutivo"
              subtitle="Tamaño del negocio durante el período seleccionado."
              icon={<LayoutDashboard className="h-5 w-5" />}
              accent={PALETTE.sizzlingSunrise}
              onDetail={() => setActiveTab("sales")}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                <ExecutiveKPICard title="Ventas" value={formatUSD(overviewMetrics.salesPeriod)} icon={<DollarSign className="h-5 w-5" />} accent={PALETTE.sizzlingSunrise} onClick={() => setActiveTab("sales")} />
                <ExecutiveKPICard title="Pedidos" value={overviewMetrics.ordersPeriod} icon={<ShoppingBag className="h-5 w-5" />} accent={PALETTE.crystalBlue} onClick={() => setActiveTab("orders")} />
                <ExecutiveKPICard title="Clientes activos" value={overviewMetrics.activeClientsCount} icon={<Users className="h-5 w-5" />} accent={PALETTE.success} onClick={() => { setActiveTab("sales"); setActiveSalesTab("clients"); }} />
                <ExecutiveKPICard title="Ticket promedio" value={formatUSD(overviewMetrics.ticketAverage)} icon={<Gauge className="h-5 w-5" />} accent={PALETTE.crystalBlue} onClick={() => setActiveTab("sales")} />
                <ExecutiveKPICard title="Utilidad bruta" value={formatUSD(overviewMetrics.grossUtility)} icon={<TrendingUp className="h-5 w-5" />} accent={PALETTE.success} tone="success" onClick={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }} />
                <ExecutiveKPICard title="Flujo neto cerrado" value={formatUSD(overviewMetrics.closedNetFlow)} icon={<Wallet className="h-5 w-5" />} accent={PALETTE.maastrichtBlue} onClick={() => setActiveTab("cashflow")} />
              </div>
            </OverviewBlock>

            <div className="grid gap-5 xl:grid-cols-2">
              <OverviewBlock
                title="Salud financiera"
                subtitle="Cartera, mora, coberturas y comisiones pendientes."
                icon={<Receipt className="h-5 w-5" />}
                accent={PALETTE.crystalBlue}
                onDetail={() => setActiveTab("cashflow")}
              >
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  <ExecutiveKPICard title="Cartera pendiente" value={formatUSD(overviewMetrics.pendingPortfolio)} icon={<Receipt className="h-5 w-5" />} accent={PALETTE.warning} tone="warning" onClick={() => setActiveTab("invoices")} />
                  <ExecutiveKPICard title="Facturas vencidas" value={formatUSD(overviewMetrics.overdueAmount)} icon={<AlertTriangle className="h-5 w-5" />} accent={PALETTE.danger} tone="danger" onClick={() => setActiveTab("invoices")} />
                  <ExecutiveKPICard title="Cubierto por TH.O" value={formatUSD(overviewMetrics.coveredTHO)} icon={<Shield className="h-5 w-5" />} accent={PALETTE.maastrichtBlue} onClick={() => setActiveTab("cashflow")} />
                  <ExecutiveKPICard title="Cobros comprometidos" value={formatUSD(overviewMetrics.committedCollections)} icon={<Calendar className="h-5 w-5" />} accent={PALETTE.crystalBlue} onClick={() => setActiveTab("cashflow")} />
                  <ExecutiveKPICard title="Comisiones pendientes" value={formatUSD(overviewMetrics.pendingCommissions)} icon={<FileText className="h-5 w-5" />} accent={PALETTE.warning} onClick={() => setActiveTab("cashflow")} />
                </div>
              </OverviewBlock>

              <OverviewBlock
                title="Actividad comercial"
                subtitle="Comportamiento de compra y calidad de la cartera."
                icon={<Users className="h-5 w-5" />}
                accent={PALETTE.success}
                onDetail={() => { setActiveTab("sales"); setActiveSalesTab("clients"); }}
              >
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  <ExecutiveKPICard title="Clientes nuevos" value={overviewMetrics.newClients} icon={<Plus className="h-5 w-5" />} accent={PALETTE.success} onClick={() => { setActiveTab("sales"); setActiveSalesTab("clients"); }} />
                  <ExecutiveKPICard title="Recurrentes" value={overviewMetrics.recurringClients} icon={<RefreshCw className="h-5 w-5" />} accent={PALETTE.crystalBlue} onClick={() => { setActiveTab("sales"); setActiveSalesTab("clients"); }} />
                  <ExecutiveKPICard title="Reactivados" value={overviewMetrics.reactivatedClients} icon={<RotateCcw className="h-5 w-5" />} accent={PALETTE.warning} onClick={() => { setActiveTab("sales"); setActiveSalesTab("clients"); }} />
                  <ExecutiveKPICard title="Frecuencia promedio" value={formatDecimal(overviewMetrics.purchaseFrequency)} subtitle="pedidos por cliente activo" icon={<History className="h-5 w-5" />} accent={PALETTE.maastrichtBlue} onClick={() => { setActiveTab("sales"); setActiveSalesTab("clients"); }} />
                  <ExecutiveKPICard title="Top cliente" value={overviewMetrics.topClient?.name || "Sin datos"} subtitle={overviewMetrics.topClient ? formatUSD(overviewMetrics.topClient.periodAmount) : ""} icon={<Trophy className="h-5 w-5" />} accent={PALETTE.sizzlingSunrise} wide onClick={() => { setActiveTab("sales"); setActiveSalesTab("clients"); }} />
                </div>
              </OverviewBlock>

              <OverviewBlock
                title="Fuerza comercial"
                subtitle="Dependencia de asistencia, vendedor líder y zona más activa."
                icon={<TrendingUp className="h-5 w-5" />}
                accent={PALETTE.warning}
                onDetail={() => { setActiveTab("sales"); setActiveSalesTab("performance"); }}
              >
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  <ExecutiveKPICard title="Con asistencia" value={overviewMetrics.assistedOrders} icon={<User className="h-5 w-5" />} accent={PALETTE.success} onClick={() => { setActiveTab("sales"); setActiveSalesTab("performance"); }} />
                  <ExecutiveKPICard title="Sin asistencia" value={overviewMetrics.unassistedOrders} icon={<Store className="h-5 w-5" />} accent={PALETTE.crystalBlue} onClick={() => { setActiveTab("sales"); setActiveSalesTab("performance"); }} />
                  <ExecutiveKPICard title="% asistencia" value={safePercent(overviewMetrics.assistancePercent)} icon={<Gauge className="h-5 w-5" />} accent={PALETTE.warning} onClick={() => { setActiveTab("sales"); setActiveSalesTab("performance"); }} />
                  <ExecutiveKPICard title="Mejor vendedor" value={overviewMetrics.bestSeller?.name || "Sin datos"} subtitle={overviewMetrics.bestSeller ? formatUSD(overviewMetrics.bestSeller.amount) : ""} icon={<Trophy className="h-5 w-5" />} accent={PALETTE.sizzlingSunrise} onClick={() => { setActiveTab("sales"); setActiveSalesTab("performance"); }} />
                  <ExecutiveKPICard title="Zona más activa" value={overviewMetrics.topZone ? getLocationLabel(overviewMetrics.topZone[0]) : "Sin datos"} subtitle={overviewMetrics.topZone ? formatUSD(overviewMetrics.topZone[1]) : ""} icon={<MapPin className="h-5 w-5" />} accent={PALETTE.maastrichtBlue} wide onClick={() => { setActiveTab("sales"); setActiveSalesTab("performance"); }} />
                </div>
              </OverviewBlock>

              <OverviewBlock
                title="Productos e inventario"
                subtitle="Productos líderes y alertas de rotación/stock."
                icon={<Package className="h-5 w-5" />}
                accent={PALETTE.sizzlingSunrise}
                onDetail={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }}
              >
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  <ExecutiveKPICard title="Producto más vendido" value={overviewMetrics.topProduct?.name || "Sin datos"} subtitle={overviewMetrics.topProduct ? `${overviewMetrics.topProduct.salesUnits} unidades` : ""} icon={<PackageOpen className="h-5 w-5" />} accent={PALETTE.crystalBlue} wide onClick={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }} />
                  <ExecutiveKPICard title="Mayor utilidad" value={overviewMetrics.topUtilityProduct?.name || "Sin datos"} subtitle={overviewMetrics.topUtilityProduct ? formatUSD(overviewMetrics.topUtilityProduct.utilityUSD) : ""} icon={<DollarSign className="h-5 w-5" />} accent={PALETTE.success} onClick={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }} />
                  <ExecutiveKPICard title="Quiebre probable" value={overviewMetrics.stockoutCount} icon={<AlertTriangle className="h-5 w-5" />} accent={PALETTE.danger} tone="danger" onClick={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }} />
                  <ExecutiveKPICard title="Vigilar stock" value={overviewMetrics.watchStockCount} icon={<Clock className="h-5 w-5" />} accent={PALETTE.warning} tone="warning" onClick={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }} />
                  <ExecutiveKPICard title="Baja rotación" value={overviewMetrics.lowRotationCount} icon={<History className="h-5 w-5" />} accent={PALETTE.maastrichtBlue} onClick={() => { setActiveTab("products"); setActiveInventoryTab("rotation"); }} />
                </div>
              </OverviewBlock>
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
                      onClick={exportSalesDashboardExcel}
                      className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold"
                      style={{ color: PALETTE.maastrichtBlue }}
                    >
                      <Download className="mr-1 h-4 w-4" /> Excel
                    </button>
                    </div>
                  </div>

                  <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
                    <div className="relative w-full min-w-0">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        value={salesProductFilter}
                        onChange={(event) => setSalesProductFilter(event.target.value)}
                        placeholder="Buscar producto..."
                        className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm"
                        style={{ borderColor: PALETTE.pastelGray }}
                      />
                    </div>

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

                    <MultiSelectFilter
                      label="Todas las categorías"
                      value={salesCategoryFilter}
                      onChange={setSalesCategoryFilter}
                      options={[...new Set(productsData.map((product) => product.category))]}
                    />

                    <LocationFilters />
                  </div>
                  <div className="mt-3">
                    <LegendBox id="ventas-volumen" items={["Ventas = unidades vendidas por precio estimado.", "Utilidad = ventas menos costo. Si no hay costo, queda en 0.", "Los filtros de ubicación afectan totales y filas para que cuadren los montos."]} />
                  </div>

                </CollapsibleFilterSection>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <KPICard
                    title={`Ventas del ${selectedRangeLabel.toLowerCase()}`}
                    value={formatUSD(salesVolumeTotal)}
                    subtitle={`${new Set(filteredSalesVolumeRows.map((row) => row.name)).size} productos filtrados`}
                    icon={<DollarSign className="h-5 w-5" />}
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
                    value={selectedSalesLocationLabel}
                    icon={<Store className="h-5 w-5" />}
                    color={PALETTE.warning}
                  />
                </div>

                <div className="space-y-5">
                  <SectionCard
                    title="Ventas por producto del periodo seleccionado"
                    icon={<Package className="h-4 w-4" style={{ color: PALETTE.success }} />}
                  >
                    <MiniExcel
                      columns={[
                        { key: "ranking", label: "Ranking" },
                        { key: "sku", label: "SKU", render: (row) => getProductSku(row) },
                        { key: "name", label: "Producto" },
                        { key: "category", label: "Categoría" },
                        { key: "salesUnits", label: "Unidades vendidas" },
                        { key: "uniqueClients", label: "Nº clientes" },
                        { key: "orderCount", label: "Nº pedidos" },
                        { key: "salesAmount", label: "Ventas USD", render: (row) => formatExcelNumber(row.salesAmount) },
                        { key: "salesShare", label: "% venta total", render: (row) => safePercent(row.salesShare) },
                        { key: "utilityUSD", label: "Utilidad USD", render: (row) => formatExcelNumber(row.utilityUSD) },
                        { key: "utilityPercent", label: "Utilidad %", render: (row) => row.utilityPercent === null ? "N/A" : safePercent(row.utilityPercent) },
                        { key: "growthPercent", label: "Crecimiento %", render: (row) => row.growthPercent === null ? "N/A" : safePercent(row.growthPercent) },
                        { key: "stock", label: "Stock actual" },
                        { key: "stockDays", label: "Stock para X días", render: (row) => row.stockDays === null ? "Sin consumo" : `${formatDecimal(row.stockDays)} días` },
                      ]}
                      rows={productAnalysisRows}
                    />
                  </SectionCard>

                  <div className="space-y-5">
                    <SectionCard title="Ventas por origen" icon={<Store className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}>
                      <p className="mb-6 text-sm text-gray-500">
                        Resumen de ventas agrupadas por su origen.
                      </p>

                      <div className="grid gap-5 lg:grid-cols-2">
                        <OriginVisualCard
                          label="Sin asistencia de vendedor"
                          amount={thoOriginAmount}
                          percent={thoOriginPercent}
                          icon={Store}
                          tone="blue"
                        />
                        <OriginVisualCard
                          label="Con asistencia de vendedor"
                          amount={sellerOriginAmount}
                          percent={sellerOriginPercent}
                          icon={User}
                          tone="green"
                        />
                      </div>
                    </SectionCard>

                    <SectionCard title="Ventas por vendedor" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                      <p className="mb-6 text-sm text-gray-500">
                        Rendimiento de ventas por cada vendedor.
                      </p>

                      {salesSellerRows.length > 0 ? (
                        <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2">
                          {salesSellerRows.map((seller) => {
                            const percent = getSellerAssistedOrdersPercent(seller);
                            return (
                              <div key={seller.name} className="rounded-2xl border bg-white p-4" style={{ borderColor: PALETTE.softBorder }}>
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>{seller.name}</p>
                                    <p className="text-xs text-gray-500">{getLocationLabel(seller.zone)} · {seller.orders} pedidos</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-black">{formatExcelNumber(seller.amount)}</p>
                                    <p className="text-xs font-bold text-gray-500">{formatPercent(percent)} del total de pedidos con asistencia</p>
                                  </div>
                                </div>
                                <ProgressBar value={seller.amount} max={salesSellerTotal} color={PALETTE.sizzlingSunrise} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                          No hay vendedores asignados a esta ubicación.
                        </div>
                      )}
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
                        ubicación: getLocationLabel(client.zone, client.region || "", client.urbanization || ""),
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

                  <div className="grid gap-2 xl:grid-cols-8">
                    <div className="relative min-w-0">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input value={clientSearchTerm} onChange={(event) => setClientSearchTerm(event.target.value)} placeholder="Buscar cliente..." className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm" style={{ borderColor: PALETTE.pastelGray }} />
                    </div>

                    <div className="w-full min-w-0">
                      <PeriodFilter />
                    </div>

                    <MultiSelectFilter label="Todos los tipos" value={clientTypeFilter} onChange={setClientTypeFilter} options={["Nuevo", "Recurrente", "Reactivado"]} />

                    <LocationFilters />

                    <MultiSelectFilter label="Todos los vendedores" value={clientSellerFilter} onChange={setClientSellerFilter} options={filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => seller.name)} />

                    <select value={clientSort} onChange={(event) => setClientSort(event.target.value)} className="w-full min-w-0 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
                      <option value="amountDesc">Compra mayor a menor</option>
                      <option value="amountAsc">Compra menor a mayor</option>
                      <option value="ordersDesc">Pedidos mayor a menor</option>
                      <option value="ordersAsc">Pedidos menor a mayor</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <LegendBox id="clientes-analisis" items={["Cliente nuevo = primera compra dentro del período seleccionado.", "Cliente reactivado = vuelve a comprar luego de 30+ días sin pedidos.", `Promedio de pedidos = ${formatDecimal(avgOrdersInPeriod)} por cliente en el período.`]} />
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
                        { key: "purchaseFrequencyDays", label: "Frecuencia de compra", render: (client) => `${client.purchaseFrequencyDays} días` },
                        { key: "periodPurchases", label: "Cantidad de compras" },
                        { key: "periodAmount", label: "Facturación USD", render: (client) => formatExcelNumber(client.periodAmount) },
                        { key: "participation", label: "% participación", render: (client) => safePercent(client.participation) },
                        { key: "averageTicket", label: "Ticket promedio", render: (client) => formatUSD(client.averageTicket) },
                        { key: "utilityUSD", label: "Utilidad USD", render: (client) => formatExcelNumber(client.utilityUSD) },
                        { key: "utilityPercent", label: "Utilidad %", render: (client) => client.utilityPercent === null ? "N/A" : safePercent(client.utilityPercent) },
                        { key: "growthPercent", label: "Crecimiento %", render: (client) => client.growthPercent === null ? "N/A" : safePercent(client.growthPercent) },
                        { key: "avgPaymentDays", label: "Días promedio de pago", render: (client) => `${client.avgPaymentDays} días` },
                        { key: "compliance", label: "Cumplimiento", render: (client) => safePercent(client.compliance, 0) },
                        { key: "locationLabel", label: "Ubicación" },
                        { key: "seller", label: "Vendedor" },
                      ]}
                      rows={clientAnalysisRows}
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
                          rows: performanceRows.filter((seller) => seller.name !== "TH.O automático").map((seller) => ({
                            vendedor: seller.name,
                            ubicación: seller.locationLabel,
                            clientes_asignados: seller.assignedClients,
                            clientes_activos: seller.activeClients,
                            porcentaje_clientes_activos: seller.activeClientPercent === null ? "N/A" : safePercent(seller.activeClientPercent),
                            clientes_nuevos: seller.newClients,
                            clientes_reactivados: seller.reactivatedClients,
                            volumen_total_ventas_usd: formatExcelNumber(seller.amount),
                            utilidad_usd: formatUSD(seller.utilityUSD),
                            cantidad_total_pedidos: seller.orders,
                            pedidos_con_asistencia: seller.assistedOrders,
                            porcentaje_asistencia: seller.assistancePercent === null ? "N/A" : safePercent(seller.assistancePercent),
                            ticket_promedio: seller.averageTicket === null ? "N/A" : formatExcelNumber(seller.averageTicket),
                            crecimiento: seller.growthPercent === null ? "N/A" : safePercent(seller.growthPercent),
                          })),
                        },
                      ])}
                      className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-2 text-sm font-bold"
                      style={{ color: PALETTE.maastrichtBlue }}
                    >
                      <Download className="mr-1 inline h-4 w-4" />Excel
                    </button>
                  </div>

                  <div className="grid gap-2 xl:grid-cols-6">
                    <div className="w-full min-w-0">
                      <PeriodFilter />
                    </div>

                    <LocationFilters />

                    <MultiSelectFilter label="Todos los vendedores" value={performanceSellerFilter} onChange={setPerformanceSellerFilter} options={filteredSellersByLocation.map((seller) => seller.name)} />

                    <select value={performanceSort} onChange={(event) => setPerformanceSort(event.target.value)} className="w-full min-w-0 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: PALETTE.pastelGray }}>
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

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <KPICard title="Total de pedidos en la zona" value={performanceTotalOrders} subtitle="Pedidos según filtros activos" icon={<ShoppingBag className="h-5 w-5" />} color={PALETTE.crystalBlue} />
                  <KPICard title="Pedidos con asistencia" value={performanceAssistedOrders} subtitle={`${safePercent(performanceAssistedPercent)} del total`} icon={<CheckCircle className="h-5 w-5" />} color={PALETTE.success} tone="success" />
                  <KPICard title="Pedidos sin asistencia" value={performanceUnassistedOrders} subtitle={`${safePercent(performanceUnassistedPercent)} del total`} icon={<Sparkles className="h-5 w-5" />} color={PALETTE.warning} tone="warning" />
                </div>



                <div className="space-y-5">
                  <SectionCard title="Ventas por vendedor" icon={<Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                    <MiniExcel
                      columns={[
                        { key: "name", label: "Vendedor" },
                        { key: "locationLabel", label: "Ubicación" },
                        { key: "assignedClients", label: "Clientes asignados" },
                        { key: "activeClients", label: "Clientes activos" },
                        { key: "activeClientPercent", label: "% clientes activos", render: (seller) => seller.activeClientPercent === null ? "N/A" : safePercent(seller.activeClientPercent) },
                        { key: "newClients", label: "Clientes nuevos" },
                        { key: "reactivatedClients", label: "Clientes reactivados" },
                        { key: "amount", label: "Volumen total ventas USD", render: (seller) => formatExcelNumber(seller.amount) },
                        { key: "utilityUSD", label: "Utilidad USD", render: (seller) => formatExcelNumber(seller.utilityUSD) },
                        { key: "orders", label: "Cantidad total de pedidos" },
                        { key: "assistedOrders", label: "Pedidos con asistencia" },
                        { key: "assistancePercent", label: "% asistencia", render: (seller) => seller.assistancePercent === null ? "N/A" : safePercent(seller.assistancePercent) },
                        { key: "averageTicket", label: "Ticket promedio", render: (seller) => seller.averageTicket === null ? "N/A" : formatExcelNumber(seller.averageTicket) },
                        { key: "growthPercent", label: "Crecimiento %", render: (seller) => seller.growthPercent === null ? "N/A" : safePercent(seller.growthPercent) },
                      ]}
                      rows={performanceRows}
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
                  <MultiSelectFilter
                    label="Todos los estados"
                    value={invoiceStatusFilter}
                    onChange={setInvoiceStatusFilter}
                    options={[{ value: "pending", label: "Pendientes" }, { value: "overdue", label: "Vencidas" }, { value: "covered", label: "Cubiertas por TH.O" }, { value: "paid", label: "Pagadas" }, { value: "risk", label: "En riesgo" }]}
                  />
                    <LocationFilters />
                  <MultiSelectFilter
                    label="Todos los vendedores"
                    value={invoiceSellerFilter}
                    onChange={setInvoiceSellerFilter}
                    options={filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => seller.name)}
                  />
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

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Facturas activas"
                value={invoiceOpenRows.length}
                subtitle="Facturas abiertas en el sistema"
                icon={<FileText className="h-5 w-5" />}
                color={PALETTE.crystalBlue}
              />

              <KPICard
                title="Facturas al día"
                value={invoiceRiskRows.filter((invoice) => invoice.status === "pending").length}
                subtitle="Más de 10 días para vencer"
                icon={<CheckCircle className="h-5 w-5" />}
                color={PALETTE.success}
                tone="success"
              />

              <KPICard
                title="Facturas por cobrar"
                value={invoiceOpenRows.length}
                subtitle={`${formatUSD(invoiceOpenRows.reduce((sum, invoice) => sum + invoice.pendingAmount, 0))} pendiente`}
                icon={<Receipt className="h-5 w-5" />}
                color={PALETTE.warning}
                tone="warning"
              />

              <KPICard
                title="Facturas en mora"
                value={invoiceOverdueRows.length}
                subtitle={`${formatUSD(invoiceOverdueRows.reduce((sum, invoice) => sum + invoice.pendingAmount, 0))} en mora`}
                icon={<AlertTriangle className="h-5 w-5" />}
                color={PALETTE.danger}
                tone="danger"
              />
            </div>




            <div className="space-y-5">
              <SectionCard
                title="Estado de factura"
                icon={<Users className="h-4 w-4" style={{ color: PALETTE.warning }} />}
                action={
                  <button
                    type="button"
                    onClick={() =>
                      exportToExcel("riesgo_por_cliente", invoiceRiskRows.map((row) => ({
                        "Nro factura": row.invoiceNumber,
                        Pedido: row.orderNumber,
                        Cliente: row.client,
                        "Ubicación / Zona": row.locationLabel,
                        Vendedor: row.seller,
                        "Fecha despacho": formatDateShort(row.dispatchDate),
                        "Fecha vencimiento": formatDateShort(row.calculatedDueDate),
                        "Días para vencer / mora": row.daysToDue,
                        Antigüedad: row.ageLabel,
                        "Total de la factura USD": formatExcelNumber(row.amount),
                        "Saldo pendiente USD": formatExcelNumber(row.pendingAmount),
                        "Estado factura": row.statusLabel,
                      })))
                    }
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      backgroundColor: PALETTE.sizzlingSunrise,
                      color: PALETTE.maastrichtBlue,
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Excel
                  </button>
                }
              >
                <div className="space-y-3">
                  <LegendBox items={["Un renglón = una factura individual; no se agrupa por cliente.", "Fecha de vencimiento = fecha de despacho + 30 días calendario.", "Total de la factura USD muestra el monto original; Saldo pendiente USD descuenta pagos validados, pagos parciales y coberturas TH.O.", "Próxima a vencer = 10 días o menos; vencida = saldo pendiente con fecha vencida."]} />
                  <MiniExcel
                    columns={[
                      { key: "invoiceNumber", label: "Nro factura" },
                      { key: "orderNumber", label: "Pedido" },
                      { key: "client", label: "Cliente" },
                      { key: "locationLabel", label: "Ubicación / Zona" },
                      { key: "seller", label: "Vendedor" },
                      { key: "dispatchDate", label: "Fecha despacho", render: (row) => formatDateShort(row.dispatchDate) },
                      { key: "calculatedDueDate", label: "Fecha vencimiento", render: (row) => formatDateShort(row.calculatedDueDate) },
                      { key: "daysToDue", label: "Días para vencer / mora" },
                      { key: "ageLabel", label: "Antigüedad" },
                      { key: "amount", label: "Total de la factura USD", render: (row) => formatExcelNumber(row.amount) },
                      { key: "pendingAmount", label: "Saldo pendiente USD", render: (row) => formatExcelNumber(row.pendingAmount) },
                      { key: "statusLabel", label: "Estado factura" },
                    ]}
                    rows={invoiceRiskRows}
                  />
                </div>
              
              </SectionCard>

            </div>
          </div>
        )}

        {activeTab === "cashflow" && (
          <div className="space-y-5">
            <SectionCard
              title="Cobranza y flujo de caja"
              icon={<Wallet className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
              action={<span className="text-xs font-bold text-gray-500">Fecha servidor: {formatDateShort(SERVER_TODAY)}</span>}
            >
              <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={cashflowClientSearch} onChange={(event) => setCashflowClientSearch(event.target.value)} placeholder="Buscar cliente o factura..." className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm" style={{ borderColor: PALETTE.pastelGray }} />
                </div>
                <PeriodFilter />
                <LocationFilters />
                <MultiSelectFilter label="Todos los vendedores" value={cashflowSellerFilter} onChange={setCashflowSellerFilter} options={[...filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => seller.name), "Sin vendedor asignado"]} />
                <MultiSelectFilter label="Todos los estados" value={cashflowStatusFilter} onChange={setCashflowStatusFilter} options={[{ value: "pending", label: "Al día" }, { value: "dueSoon", label: "Próxima a vencer" }, { value: "overdue", label: "Vencida" }, { value: "paid", label: "Pagada" }, { value: "covered", label: "Cubierta por TH.O" }]} />
                <MultiSelectFilter label="Todos los beneficiarios" value={cashflowBeneficiaryFilter} onChange={setCashflowBeneficiaryFilter} options={["TH.O", ...sellers.filter((seller) => seller.name !== "TH.O automático").map((seller) => seller.name)]} />
                <MultiSelectFilter label="Estado comisión" value={cashflowCommissionStatusFilter} onChange={setCashflowCommissionStatusFilter} options={["Pendiente", "Pagada", "No aplica"]} />
              </div>
              <LegendBox items={["El crédito inicia al marcar el pedido como despachado y vence a 30 días.", "Las comisiones reales nacen solo cuando la factura queda pagada o cubierta por TH.O.", "Cliente con vendedor: TH.O 1,5% y vendedor 5%. Cliente sin vendedor: TH.O captación 5%."]} />
            </SectionCard>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "committed", label: "Cobros comprometidos", icon: Calendar },
                { id: "payments", label: "Notificaciones de pago", icon: Receipt, badge: pendingPaymentNotifications.length },
                { id: "commissions", label: "Pago de comisiones", icon: DollarSign },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCashflowTab(item.id)}
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    style={{
                      borderColor: activeCashflowTab === item.id ? PALETTE.sizzlingSunrise : PALETTE.softBorder,
                      backgroundColor: activeCashflowTab === item.id ? PALETTE.sizzlingSunrise : PALETTE.white,
                      color: PALETTE.maastrichtBlue,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.badge > 0 && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">{item.badge}</span>}
                  </button>
                );
              })}
            </div>

            {activeCashflowTab === "committed" && (
              <>


            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <KPICard title="Cartera pendiente" value={formatUSD(cashflowKpis.pendingPortfolio)} icon={<Receipt className="h-5 w-5" />} color={PALETTE.warning} tone="warning" />
              <KPICard title="Cobrado en el período" value={formatUSD(cashflowKpis.collectedPeriod)} icon={<Wallet className="h-5 w-5" />} color={PALETTE.success} tone="success" />
              <KPICard title="Cubierto por TH.O" value={formatUSD(cashflowKpis.coveredTHO)} icon={<Shield className="h-5 w-5" />} color={PALETTE.maastrichtBlue} />
              <KPICard title="Ingreso bruto cerrado" value={formatUSD(cashflowKpis.closedGrossIncome)} icon={<DollarSign className="h-5 w-5" />} />
              <KPICard title="Comisión TH.O plataforma" value={formatUSD(cashflowKpis.platformCommission)} icon={<Sparkles className="h-5 w-5" />} color={PALETTE.crystalBlue} />
              <KPICard title="Comisión vendedores" value={formatUSD(cashflowKpis.sellerCommission)} icon={<Users className="h-5 w-5" />} color={PALETTE.success} />
              <KPICard title="Comisión TH.O captación" value={formatUSD(cashflowKpis.captureCommission)} icon={<Store className="h-5 w-5" />} color={PALETTE.warning} />
              <KPICard title="Comisiones totales" value={formatUSD(cashflowKpis.totalCommissions)} icon={<FileText className="h-5 w-5" />} color={PALETTE.danger} />
              <KPICard title="Flujo neto cerrado" value={formatUSD(cashflowKpis.closedNetFlow)} icon={<TrendingUp className="h-5 w-5" />} color={PALETTE.success} tone="success" />
              <KPICard title="Cobros comprometidos" value={formatUSD(cashflowKpis.committedCollections)} icon={<Calendar className="h-5 w-5" />} color={PALETTE.crystalBlue} />
              <KPICard title="Comisiones estimadas" value={formatUSD(cashflowKpis.estimatedCommissions)} icon={<Clock className="h-5 w-5" />} color={PALETTE.warning} />
              <KPICard title="Flujo neto esperado" value={formatUSD(cashflowKpis.expectedNetFlow)} icon={<Gauge className="h-5 w-5" />} color={PALETTE.success} tone="success" />
            </div>



            <LegendBox
              id="formulas-kpi-cobranza"
              title="Cómo se calcula cada KPI"
              items={[
                "Cartera pendiente = suma de saldos pendientes de facturas abiertas.",
                "Cobrado en el período = suma de pagos recibidos según fecha real de pago.",
                "Cubierto por TH.O = suma de montos cubiertos por TH.O.",
                "Ingreso bruto cerrado = cobrado en el período + cubierto por TH.O.",
                "Comisión TH.O plataforma = monto cerrado × 1,5% en clientes con vendedor.",
                "Comisión vendedores = monto cerrado × 5% en clientes con vendedor.",
                "Comisión TH.O captación = monto cerrado × 5% en clientes sin vendedor.",
                "Comisiones totales = plataforma + vendedores + captación.",
                "Flujo neto cerrado = ingreso bruto cerrado - comisiones totales.",
                "Cobros comprometidos = saldo pendiente de facturas abiertas.",
                "Comisiones estimadas = comisiones calculadas sobre cobros comprometidos.",
                "Flujo neto esperado = cobros comprometidos - comisiones estimadas.",
              ]}
            />
            <SectionCard
              title="Cobros comprometidos"
              icon={<Calendar className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
              action={<button type="button" onClick={() => exportToExcel("cobros_comprometidos", cashflowCommittedRows.map((row) => ({ Factura: row.invoiceNumber, Pedido: row.orderNumber, Cliente: row.client, Ubicación: getClientLocationLabel(row.client, row.zone), "Vendedor asignado": row.seller, "Fecha despacho": formatDateShort(row.dispatchDate), "Fecha esperada de cobro": formatDateShort(row.expectedCollectionDate), "Estado factura": row.statusLabel, "Saldo pendiente USD": formatExcelNumber(row.pendingAmount), "Comisión TH.O estimada USD": formatExcelNumber(row.estimatedPlatformCommission), "Comisión vendedor estimada USD": formatExcelNumber(row.estimatedSellerCommission), "Comisión TH.O captación estimada USD": formatExcelNumber(row.estimatedCaptureCommission), "Total comisiones estimadas USD": formatExcelNumber(row.estimatedTotalCommission), "Flujo neto esperado USD": formatExcelNumber(row.expectedNetFlow) })))} className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}><Download className="h-4 w-4" />Excel</button>}
            >
              <MiniExcel maxHeight="620px" columns={[
                { key: "invoiceNumber", label: "Factura" },
                { key: "orderNumber", label: "Pedido" },
                { key: "client", label: "Cliente" },
                { key: "zone", label: "Ubicación", render: (row) => getClientLocationLabel(row.client, row.zone) },
                { key: "seller", label: "Vendedor asignado" },
                { key: "dispatchDate", label: "Fecha despacho", render: (row) => formatDateShort(row.dispatchDate) },
                { key: "expectedCollectionDate", label: "Fecha esperada de cobro", render: (row) => formatDateShort(row.expectedCollectionDate) },
                { key: "statusLabel", label: "Estado factura" },
                { key: "pendingAmount", label: "Saldo pendiente USD", render: (row) => formatExcelNumber(row.pendingAmount) },
                { key: "estimatedPlatformCommission", label: "Comisión TH.O estimada USD", render: (row) => formatExcelNumber(row.estimatedPlatformCommission) },
                { key: "estimatedSellerCommission", label: "Comisión vendedor estimada USD", render: (row) => formatExcelNumber(row.estimatedSellerCommission) },
                { key: "estimatedCaptureCommission", label: "Comisión TH.O captación estimada USD", render: (row) => formatExcelNumber(row.estimatedCaptureCommission) },
                { key: "estimatedTotalCommission", label: "Total comisiones estimadas USD", render: (row) => formatExcelNumber(row.estimatedTotalCommission) },
                { key: "expectedNetFlow", label: "Flujo neto esperado USD", render: (row) => formatExcelNumber(row.expectedNetFlow) },
              ]} rows={cashflowCommittedRows} />
            </SectionCard>

            <SectionCard
              title="Comisiones por pagar de facturas cobradas"
              icon={<Receipt className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}
              action={<button type="button" onClick={() => exportToExcel("comisiones_por_pagar_facturas_cobradas", cashflowCommissionRows.map((row) => ({ Factura: row.invoiceNumber, Pedido: row.orderNumber, Cliente: row.client, Ubicación: getClientLocationLabel(row.client, row.zone), "Vendedor asignado": row.seller, "Fecha cierre": formatDateShort(row.closeDate), "Monto cerrado USD": formatExcelNumber(row.amount), "Pagado por": row.paidBy, "Comisión TH.O plataforma USD": formatExcelNumber(row.platformCommission), "Comisión vendedor USD": formatExcelNumber(row.sellerCommission), "Comisión TH.O captación USD": formatExcelNumber(row.captureCommission), "Total comisiones USD": formatExcelNumber(row.totalCommission), "Flujo neto USD": formatExcelNumber(row.netFlow), "Estado comisión TH.O": row.commissionTHOStatus, "Estado comisión vendedor": row.commissionSellerStatus })))} className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}><Download className="h-4 w-4" />Excel</button>}
            >
              <MiniExcel maxHeight="620px" columns={[
                { key: "invoiceNumber", label: "Factura" },
                { key: "orderNumber", label: "Pedido" },
                { key: "client", label: "Cliente" },
                { key: "zone", label: "Ubicación", render: (row) => getClientLocationLabel(row.client, row.zone) },
                { key: "seller", label: "Vendedor asignado" },
                { key: "closeDate", label: "Fecha cierre", render: (row) => formatDateShort(row.closeDate) },
                { key: "amount", label: "Monto cerrado USD", render: (row) => formatExcelNumber(row.amount) },
                { key: "paidBy", label: "Pagado por" },
                { key: "platformCommission", label: "Comisión TH.O plataforma USD", render: (row) => formatExcelNumber(row.platformCommission) },
                { key: "sellerCommission", label: "Comisión vendedor USD", render: (row) => formatExcelNumber(row.sellerCommission) },
                { key: "captureCommission", label: "Comisión TH.O captación USD", render: (row) => formatExcelNumber(row.captureCommission) },
                { key: "totalCommission", label: "Total comisiones USD", render: (row) => formatExcelNumber(row.totalCommission) },
                { key: "netFlow", label: "Flujo neto USD", render: (row) => formatExcelNumber(row.netFlow) },
                { key: "commissionTHOStatus", label: "Estado comisión TH.O" },
                { key: "commissionSellerStatus", label: "Estado comisión vendedor" },
              ]} rows={cashflowCommissionRows} />
            </SectionCard>

            <SectionCard
              title="Resumen de comisiones por beneficiario"
              icon={<Users className="h-4 w-4" style={{ color: PALETTE.success }} />}
              action={<button type="button" onClick={() => exportToExcel("resumen_comisiones_beneficiario", cashflowBeneficiaryRows.map((row) => ({ Beneficiario: row.beneficiary, "Facturas generadoras": row.invoices, "Base cerrada USD": formatExcelNumber(row.baseClosed), "Comisión plataforma USD": formatExcelNumber(row.platformCommission), "Comisión captación USD": formatExcelNumber(row.captureCommission), "Total comisión TH.O USD": formatExcelNumber(row.totalTHOCommission), "Comisión vendedor USD": formatExcelNumber(row.sellerCommission), "Comisión pagada USD": formatExcelNumber(row.paidCommission), "Comisión pendiente USD": formatExcelNumber(row.pendingCommission) })))} className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}><Download className="h-4 w-4" />Excel</button>}
            >
              <MiniExcel maxHeight="620px" columns={[
                { key: "beneficiary", label: "Beneficiario" },
                { key: "invoices", label: "Facturas generadoras" },
                { key: "baseClosed", label: "Base cerrada USD", render: (row) => formatExcelNumber(row.baseClosed) },
                { key: "platformCommission", label: "Comisión plataforma USD", render: (row) => formatExcelNumber(row.platformCommission) },
                { key: "captureCommission", label: "Comisión captación USD", render: (row) => formatExcelNumber(row.captureCommission) },
                { key: "totalTHOCommission", label: "Total comisión TH.O USD", render: (row) => formatExcelNumber(row.totalTHOCommission) },
                { key: "sellerCommission", label: "Comisión vendedor USD", render: (row) => formatExcelNumber(row.sellerCommission) },
                { key: "paidCommission", label: "Comisión pagada USD", render: (row) => formatExcelNumber(row.paidCommission) },
                { key: "pendingCommission", label: "Comisión pendiente USD", render: (row) => formatExcelNumber(row.pendingCommission) },
              ]} rows={cashflowBeneficiaryRows} />
            </SectionCard>

              </>
            )}

            {activeCashflowTab === "payments" && (
              <div className="space-y-5">
              <SectionCard title="Notificaciones de pago" icon={<Receipt className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                <div className="space-y-3">
                  {pendingPaymentNotifications.map((payment) => (
                    <div key={payment.id} className="rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ borderColor: PALETTE.softBorder }}>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">{formatDateShort(payment.date)}</span>
                          </div>
                          <h4 className="text-base font-black" style={{ color: PALETTE.maastrichtBlue }}>Factura {payment.invoiceNumber}</h4>
                          <p className="text-sm text-gray-600">{payment.client} reportó un pago en la plataforma.</p>
                        </div>
                        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-[760px] lg:grid-cols-6">
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wide text-gray-500">Monto USD</p><p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>{formatExcelNumber(payment.amount)}</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wide text-gray-500">Banco</p><p className="font-bold" style={{ color: PALETTE.maastrichtBlue }}>{payment.bank}</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wide text-gray-500">Referencia</p><p className="font-bold" style={{ color: PALETTE.maastrichtBlue }}>{payment.reference}</p></div>
                          <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wide text-gray-500">Método</p><p className="font-bold" style={{ color: PALETTE.maastrichtBlue }}>{payment.method}</p></div>
                          <button
                            type="button"
                            onClick={() => handleValidatePayment(payment.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition hover:-translate-y-0.5"
                            style={{
                              backgroundColor: paymentValidationStatus[payment.id] === "validated" ? PALETTE.success : PALETTE.sizzlingSunrise,
                              color: paymentValidationStatus[payment.id] === "validated" ? PALETTE.white : PALETTE.maastrichtBlue,
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Validado
                          </button>
                          <button
                            type="button"
                            onClick={() => openRejectPaymentModal(payment)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5"
                            style={{
                              backgroundColor: paymentValidationStatus[payment.id] === "rejected" ? PALETTE.danger : PALETTE.white,
                              color: paymentValidationStatus[payment.id] === "rejected" ? PALETTE.white : PALETTE.maastrichtBlue,
                              borderColor: paymentValidationStatus[payment.id] === "rejected" ? PALETTE.danger : PALETTE.softBorder,
                            }}
                          >
                            <X className="h-4 w-4" />
                            Rechazado
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              </div>
            )}


            {activeCashflowTab === "commissions" && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Vendedores pendiente" value={formatUSD(cashflowBeneficiaryRows.filter((row) => row.beneficiary !== "TH.O").reduce((sum, row) => sum + Number(row.pendingCommission || 0), 0))} icon={<Users className="h-5 w-5" />} color={PALETTE.warning} tone="warning" />
                  <KPICard title="Vendedores pagado" value={formatUSD(cashflowBeneficiaryRows.filter((row) => row.beneficiary !== "TH.O").reduce((sum, row) => sum + Number(row.paidCommission || 0), 0))} icon={<CheckCircle className="h-5 w-5" />} color={PALETTE.success} tone="success" />
                  <KPICard title="TH.O pendiente" value={formatUSD(cashflowBeneficiaryRows.filter((row) => row.beneficiary === "TH.O").reduce((sum, row) => sum + Number(row.pendingCommission || 0), 0))} icon={<Sparkles className="h-5 w-5" />} color={PALETTE.warning} />
                  <KPICard title="TH.O pagado" value={formatUSD(cashflowBeneficiaryRows.filter((row) => row.beneficiary === "TH.O").reduce((sum, row) => sum + Number(row.paidCommission || 0), 0))} icon={<Wallet className="h-5 w-5" />} color={PALETTE.success} />
                </div>

                <SectionCard title="Comisiones vendedores" icon={<Users className="h-4 w-4" style={{ color: PALETTE.success }} />}>
                  <MiniExcel maxHeight="520px" columns={[
                    { key: "invoiceNumber", label: "Factura" },
                    { key: "orderNumber", label: "Pedido" },
                    { key: "rif", label: "RIF", render: (row) => getClientRif(row.client) },
                    { key: "client", label: "Cliente" },
                    { key: "seller", label: "Vendedor" },
                    { key: "sellerCommission", label: "Comisión vendedor USD", render: (row) => formatExcelNumber(row.sellerCommission) },
                    { key: "commissionSellerStatus", label: "Estado", render: (row) => commissionPaidStatus[`seller-${row.invoiceNumber}`] ? "Pagada" : row.commissionSellerStatus },
                    { key: "action", label: "Acción", render: (row) => row.sellerCommission > 0 && !commissionPaidStatus[`seller-${row.invoiceNumber}`] ? <button type="button" onClick={() => markCommissionPaid(`seller-${row.invoiceNumber}`)} className="rounded-lg px-3 py-1 text-xs font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Marcar pagada</button> : "-" },
                  ]} rows={cashflowCommissionRows.filter((row) => Number(row.sellerCommission || 0) > 0)} />
                </SectionCard>

                <SectionCard title="Comisiones TH.O" icon={<Sparkles className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
                  <MiniExcel maxHeight="520px" columns={[
                    { key: "invoiceNumber", label: "Factura" },
                    { key: "orderNumber", label: "Pedido" },
                    { key: "rif", label: "RIF", render: (row) => getClientRif(row.client) },
                    { key: "client", label: "Cliente" },
                    { key: "platformCommission", label: "Comisión TH.O plataforma USD", render: (row) => formatExcelNumber(row.platformCommission) },
                    { key: "captureCommission", label: "Comisión TH.O captación USD", render: (row) => formatExcelNumber(row.captureCommission) },
                    { key: "commissionTHOStatus", label: "Estado", render: (row) => commissionPaidStatus[`tho-${row.invoiceNumber}`] ? "Pagada" : row.commissionTHOStatus },
                    { key: "action", label: "Acción", render: (row) => (row.platformCommission + row.captureCommission) > 0 && !commissionPaidStatus[`tho-${row.invoiceNumber}`] ? <button type="button" onClick={() => markCommissionPaid(`tho-${row.invoiceNumber}`)} className="rounded-lg px-3 py-1 text-xs font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Marcar pagada</button> : "-" },
                  ]} rows={cashflowCommissionRows.filter((row) => Number(row.platformCommission || 0) + Number(row.captureCommission || 0) > 0)} />
                </SectionCard>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-5">
            <SectionCard
              title="Inventario y stock"
              icon={<Package className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
            >
              <p className="mb-4 text-sm text-gray-500">
                Administra tu catálogo publicado y revisa la rotación del stock desde dos vistas.
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { id: "inventory", label: "Productos publicados", icon: PackageOpen },
                  { id: "rotation", label: "Rotación y stock crítico", icon: RefreshCw },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveInventoryTab(item.id)}
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-sm"
                      style={{
                        borderColor: activeInventoryTab === item.id ? PALETTE.sizzlingSunrise : PALETTE.softBorder,
                        backgroundColor: activeInventoryTab === item.id ? PALETTE.sizzlingSunrise : PALETTE.white,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {activeInventoryTab === "inventory" && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openManualProductForm}
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
                    onClick={handleBulkUpload}
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
              )}
            </SectionCard>

            {activeInventoryTab === "inventory" && (
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

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={publishedProductSearch}
                    onChange={(event) => setPublishedProductSearch(event.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm"
                    style={{ borderColor: PALETTE.pastelGray }}
                  />
                </div>

                <select
                  value={publishedCategoryFilter}
                  onChange={(event) => {
                    setPublishedCategoryFilter(event.target.value);
                    setPublishedSubcategoryFilter("all");
                  }}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.pastelGray }}
                >
                  <option value="all">Todas las categorías</option>
                  {publishedProductCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={publishedSubcategoryFilter}
                  onChange={(event) => setPublishedSubcategoryFilter(event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.pastelGray }}
                >
                  <option value="all">Todas las sub-categorías</option>
                  {publishedProductSubcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>

                <select
                  value={publishedLineFilter}
                  onChange={(event) => setPublishedLineFilter(event.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.pastelGray }}
                >
                  <option value="all">Todas las líneas</option>
                  {publishedProductLines.map((line) => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold text-gray-600">
                  {filteredPublishedProducts.length} productos visibles
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                  Categoría: {publishedCategoryFilter === "all" ? "todas" : publishedCategoryFilter}
                </span>
                <span className="rounded-full bg-yellow-50 px-3 py-1 font-semibold text-yellow-700">
                  Sub-categoría: {publishedSubcategoryFilter === "all" ? "todas" : publishedSubcategoryFilter}
                </span>
                <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700">
                  Línea: {publishedLineFilter === "all" ? "todas" : publishedLineFilter}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {filteredPublishedProducts.map((product) => {
                  const isExpanded = expandedPublishedProductId === product.id;
                  return (
                    <div
                      key={product.id}
                      className="w-full rounded-2xl border text-left transition-all hover:shadow-md"
                      style={{
                        borderColor: PALETTE.softBorder,
                        backgroundColor: PALETTE.white,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedPublishedProductId(isExpanded ? null : product.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-base font-black leading-5" style={{ color: PALETTE.maastrichtBlue }}>
                              {product.name}
                            </p>
                            <span className="rounded-full px-2 py-1 text-[10px] font-bold" style={{ backgroundColor: `${PALETTE.success}22`, color: PALETTE.success }}>
                              Publicado
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Haz clic para desplegar precio, costo, stock y opciones.</p>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray-50" style={{ color: PALETTE.maastrichtBlue }}>
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="border-t px-4 py-4" style={{ borderColor: PALETTE.softBorder }}>
                          <div className="grid gap-4 md:grid-cols-[88px_1fr_auto] md:items-center">
                            <img src={product.image} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />

                            <div>
                              <p className="text-xs text-gray-500">
                                {product.category} · {getProductSubcategory(product)} · {product.line || "Sin línea"}
                              </p>

                              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                                <div className="rounded-xl bg-gray-50 p-2">
                                  <p className="text-[11px] text-gray-500">Precio</p>
                                  <p className="font-black">{formatUSD(product.price || getHistoricalUnitPrice(product))}</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-2">
                                  <p className="text-[11px] text-gray-500">Costo</p>
                                  <p className="font-black">{getHistoricalUnitCost(product) > 0 ? formatUSD(product.unitCost || getHistoricalUnitCost(product)) : "Sin costo"}</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-2">
                                  <p className="text-[11px] text-gray-500">Stock</p>
                                  <p className="font-black">{product.stock} unidades</p>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-2">
                                  <p className="text-[11px] text-gray-500">Ubicación fuerte</p>
                                  <p className="font-black">{getLocationLabel(product.region)}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 md:max-w-[170px] md:justify-end">
                              <button type="button" onClick={() => editProductDescription(product)} className="rounded-full px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: `${PALETTE.warning}22`, color: PALETTE.warning }}>Editar descripción</button>
                              <button type="button" onClick={() => editProductPrice(product)} className="rounded-full px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: `${PALETTE.sizzlingSunrise}22`, color: PALETTE.maastrichtBlue }}>Editar precio</button>
                              <button type="button" onClick={() => editProductCost(product)} className="rounded-full px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: `${PALETTE.success}22`, color: PALETTE.success }}>Editar costo</button>
                              <button type="button" onClick={() => editProductStock(product)} className="rounded-full px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: `${PALETTE.crystalBlue}22`, color: PALETTE.crystalBlue }}>Editar stock</button>
                              <button type="button" onClick={() => unpublishProduct(product)} className="rounded-full px-2 py-1 text-[11px] font-bold" style={{ backgroundColor: `${PALETTE.danger}22`, color: PALETTE.danger }}>Dar de baja</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredPublishedProducts.length === 0 && (
                  <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                    No hay productos que coincidan con la búsqueda o filtros seleccionados.
                  </div>
                )}
              </div>
              </SectionCard>
            )}

            {activeInventoryTab === "rotation" && (
              <div className="space-y-5">
                <SectionCard
                  title="Filtros de rotación"
                  icon={<Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
                >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        value={productRotationSearch}
                        onChange={(event) => setProductRotationSearch(event.target.value)}
                        placeholder="Buscar producto o SKU..."
                        className="w-full rounded-xl border bg-white py-2 pl-9 pr-3 text-sm"
                        style={{ borderColor: PALETTE.pastelGray }}
                      />
                    </div>
                    <PeriodFilter />
                    <select
                      value={productRotationCategoryFilter}
                      onChange={(event) => setProductRotationCategoryFilter(event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="all">Todas las categorías</option>
                      {inventoryCategoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <LocationFilters />
                    <select
                      value={productStatusFilter}
                      onChange={(event) => setProductStatusFilter(event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="all">Todos los estados</option>
                      <option value="Stock sano">Stock sano</option>
                      <option value="Vigilar stock">Vigilar stock</option>
                      <option value="Quiebre probable">Quiebre probable</option>
                      <option value="Baja rotación">Baja rotación</option>
                    </select>
                    <select
                      value={productSort}
                      onChange={(event) => setProductSort(event.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
                    >
                      <option value="mostSold">Más rotación a menos rotación</option>
                      <option value="leastSold">Menos rotación a más rotación</option>
                    </select>
                  </div>
                </SectionCard>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <KPICard
                    title="Baja rotación"
                    value={inventoryMonitoringRows.filter((product) => product.statusLabel === "Baja rotación").length}
                    subtitle="Productos para revisar"
                    icon={<PackageOpen className="h-5 w-5" />}
                    color={PALETTE.warning}
                    tone="warning"
                  />

                  <KPICard
                    title="Días promedio de stock"
                    value={`${Math.round(inventoryOnlyProducts.reduce((sum, product) => sum + product.stockDaysLeft, 0) / Math.max(inventoryOnlyProducts.length, 1))} días`}
                    subtitle="Stock ÷ venta diaria promedio"
                    icon={<Clock className="h-5 w-5" />}
                    color={PALETTE.crystalBlue}
                  />

                  <KPICard
                    title="Quiebres de stock"
                    value={inventoryMonitoringRows.filter((product) => product.statusLabel === "Quiebre probable").length}
                    subtitle="Riesgo alto"
                    icon={<AlertTriangle className="h-5 w-5" />}
                    color={PALETTE.danger}
                    tone="danger"
                  />

                  <KPICard
                    title="Productos visibles"
                    value={inventoryMonitoringRows.length}
                    subtitle="Según filtros de inventario"
                    icon={<Package className="h-5 w-5" />}
                    color={PALETTE.success}
                  />
                </div>

                

                <SectionCard
                  title="Monitoreo de inventario y stock"
                  icon={<RefreshCw className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
                >

                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        exportToExcel("monitoreo_inventario_stock", inventoryMonitoringRows.map((product) => ({
                          Ranking: product.ranking,
                          SKU: getProductSku(product),
                          Producto: product.name,
                          Categoria: product.category,
                          "Ubicación / Zona más vendida": getLocationLabel(product.topZone),
                          "Unidades vendidas": product.unitsSold,
                          "Ventas USD": formatExcelNumber(product.revenue),
                          "Utilidad USD": formatExcelNumber(product.utilityUSD),
                          "Crecimiento %": product.growthPercent === null ? "N/A" : safePercent(product.growthPercent),
                          "Stock actual": product.stock,
                          "Stock para X dias": product.stockDaysLabel,
                          Estado: product.statusLabel,
                        })))
                      }
                      className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black transition-all hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        backgroundColor: PALETTE.sizzlingSunrise,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Excel
                    </button>
                  </div>

                  <LegendBox
                    id="rotacion-stock"
                    items={[
                      "Rotación = unidades vendidas en el período contra stock disponible.",
                      "Stock para = stock actual ÷ venta diaria promedio.",
                      "Quiebre de stock indica productos con riesgo alto de agotarse.",
                    ]}
                  />

                  <div className="mt-4">
                    <MiniExcel
                      columns={[
                        { key: "ranking", label: "Ranking" },
                        { key: "sku", label: "SKU", render: (product) => getProductSku(product) },
                        { key: "name", label: "Producto" },
                        { key: "category", label: "Categoría" },
                        { key: "topZone", label: "Ubicación / Zona más vendida", render: (product) => getLocationLabel(product.topZone) },
                        { key: "unitsSold", label: "Unidades vendidas" },
                        { key: "revenue", label: "Ventas USD", render: (product) => formatExcelNumber(product.revenue) },
                        { key: "utilityUSD", label: "Utilidad USD", render: (product) => formatExcelNumber(product.utilityUSD) },
                        { key: "growthPercent", label: "Crecimiento %", render: (product) => product.growthPercent === null ? "N/A" : safePercent(product.growthPercent) },
                        { key: "stock", label: "Stock actual" },
                        { key: "stockDaysLabel", label: "Stock para X días" },
                        { key: "statusLabel", label: "Estado" },
                      ]}
                      rows={inventoryMonitoringRows}
                    />
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        )}

{activeTab === "discipline" && (
          <div className="space-y-5">
            <SectionCard
              title="Filtros de disciplina del canal"
              icon={<Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
              action={<button onClick={exportDisciplineFullExcel} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}><Download className="mr-1 inline h-3 w-3" />Excel disciplina completo</button>}
            >
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
            <div className="space-y-5">
              <SectionCard
                title="Clientes bloqueados"
                icon={<Users className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}
                action={
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      onClick={() => exportBlockedClientsList("clientes_bloqueados_este_mayorista", discipline.ownDelinquents, "Bloqueados con este mayorista")}
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: PALETTE.maastrichtBlue }}
                    >
                      <Download className="mr-1 inline h-3 w-3" />
                      Excel este mayorista
                    </button>
                    <button
                      onClick={() => exportBlockedClientsList("clientes_bloqueados_otro_mayorista", discipline.platformDelinquents, "Bloqueados con otros mayoristas")}
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                    >
                      <Download className="mr-1 inline h-3 w-3" />
                      Excel otro mayorista
                    </button>
                  </div>
                }
              >
                <div className="mb-3 flex flex-wrap gap-2">
                  <button onClick={() => setActiveDisciplineView("own")} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: activeDisciplineView === "own" ? PALETTE.sizzlingSunrise : PALETTE.page, color: PALETTE.maastrichtBlue }}>Bloqueados con este mayorista</button>
                  <button onClick={() => setActiveDisciplineView("platform")} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: activeDisciplineView === "platform" ? PALETTE.sizzlingSunrise : PALETTE.page, color: PALETTE.maastrichtBlue }}>Bloqueados con otros mayoristas</button>
                </div>
                <div className="space-y-3">
                  {(activeDisciplineView === "own" ? discipline.ownDelinquents : discipline.platformDelinquents)
                    .filter((client) => client.status === "Bloqueado")
                    .map((client) => (
                    <div key={client.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder }}>
                      <div>
                        <p className="font-black">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.overdueDays} días de mora · {getLocationLabel(client.zone, client.region || "", client.urbanization || "")} · Vendedor {client.seller}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{client.status}</p>
                        <p className="text-xs text-gray-500">{client.action}</p>
                      </div>
                    </div>
                  ))}

                  {(activeDisciplineView === "own" ? discipline.ownDelinquents : discipline.platformDelinquents).filter((client) => client.status === "Bloqueado").length === 0 && (
                    <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                      No hay clientes bloqueados en esta vista.
                    </div>
                  )}
                </div>
              </SectionCard>

<SectionCard
                title="Salud del canal"
                icon={<Gauge className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
                action={<button onClick={() => exportToExcel("salud_del_canal", [
                  { Indicador: "Disciplinados", Valor: formatPercent(discipline.disciplinedPercent) },
                  { Indicador: "Sancionados", Valor: formatPercent(discipline.sanctionedPercent) },
                  { Indicador: "Tiempo promedio de mora", Valor: `${formatDecimal(discipline.avgOverdueDays)} días` },
                ])} className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}><Download className="mr-1 inline h-3 w-3" />Excel</button>}
              >
                <div className="space-y-4">
                  <ProgressBar label="Disciplinados" value={discipline.disciplinedPercent} max={100} color={PALETTE.success} />
                  <ProgressBar label="Sancionados" value={discipline.sanctionedPercent} max={100} color={PALETTE.danger} />
                  <AlertCard type="success" title="Insight" message="El mercado se está ordenando: la mayoría mantiene comportamiento sano después de las reglas TH.O." />
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-5">
            <SectionCard
              title="Centro de notificaciones"
              icon={<Bell className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
              action={
                <MultiSelectFilter
                  label="Todos los tipos"
                  value={notificationTypeFilter}
                  onChange={setNotificationTypeFilter}
                  options={["Pago por validar", "Nuevo pedido", "Sistema"]}
                />
              }
            >
              <div className="space-y-3">
                {systemNotifications.length === 0 ? (
                  <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-500" style={{ borderColor: PALETTE.softBorder }}>
                    No hay notificaciones pendientes.
                  </div>
                ) : systemNotifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => handleNotificationAction(notification)}
                    className="flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:flex-row lg:items-center lg:justify-between"
                    style={{ borderColor: PALETTE.softBorder }}
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>{notification.type}</span>
                        <span className="text-xs font-bold text-gray-500">{formatDateShort(notification.date)}</span>
                      </div>
                      <h4 className="text-base font-black" style={{ color: PALETTE.maastrichtBlue }}>{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                    </div>
                    <span className="rounded-xl border px-4 py-2 text-xs font-black" style={{ borderColor: PALETTE.softBorder, color: PALETTE.maastrichtBlue }}>{notification.actionLabel}</span>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        )}



        {activeTab === "manual" && (
          <div className="space-y-5">
            <SectionCard
              title="Manual de usuario"
              icon={<FileText className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}
            >
              <p className="mb-5 text-sm text-gray-600">Documentos operativos para consultar normas de uso y políticas internas de TH.O.</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: PALETTE.softBorder }}>
                  <h3 className="text-lg font-black" style={{ color: PALETTE.maastrichtBlue }}>Normas de uso</h3>
                  <p className="mt-2 text-sm text-gray-600">Reglas de compra, venta, cobranza, comisiones, penalizaciones y comportamiento dentro de la plataforma.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => alert("Normas de uso: documento disponible para descarga.")} className="rounded-xl border px-4 py-2 text-sm font-black" style={{ borderColor: PALETTE.softBorder, color: PALETTE.maastrichtBlue }}>Ver documento</button>
                    <button type="button" onClick={() => downloadWordDocument("normas_de_uso_THO.doc", "Normas de uso TH.O", ["Reglas de compra y venta dentro de la plataforma.", "Reglas de cobranza, pagos, validaciones y comisiones.", "El incumplimiento de las normas puede generar bloqueos o revisiones internas."])} className="rounded-xl px-4 py-2 text-sm font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Descargar Word</button>
                  </div>
                </div>
                <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: PALETTE.softBorder }}>
                  <h3 className="text-lg font-black" style={{ color: PALETTE.maastrichtBlue }}>Políticas internas</h3>
                  <p className="mt-2 text-sm text-gray-600">Lineamientos internos, privacidad, protección de datos, auditoría y uso responsable del ecosistema.</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => alert("Políticas internas: documento disponible para descarga.")} className="rounded-xl border px-4 py-2 text-sm font-black" style={{ borderColor: PALETTE.softBorder, color: PALETTE.maastrichtBlue }}>Ver documento</button>
                    <button type="button" onClick={() => downloadWordDocument("politicas_internas_THO.doc", "Políticas internas TH.O", ["Políticas de privacidad, seguridad y protección de datos.", "Reglas de auditoría, gobierno interno y trazabilidad.", "Procedimientos internos para atención, validación y control de operaciones."])} className="rounded-xl px-4 py-2 text-sm font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Descargar Word</button>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-5">
            <SectionCard title="Gestión de pedidos" icon={<ShoppingBag className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />}>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={orderSearchTerm} onChange={(event) => setOrderSearchTerm(event.target.value)} placeholder="Buscar pedido, cliente, RIF o producto..." className="w-full rounded-xl border py-2 pl-9 pr-3 text-sm" style={{ borderColor: PALETTE.pastelGray }} />
                </div>
                <PeriodFilter />
                    <LocationFilters />
                <MultiSelectFilter label="Todos los vendedores" value={cashflowSellerFilter} onChange={setCashflowSellerFilter} options={filteredSellersByLocation.filter((seller) => seller.name !== "TH.O automático").map((seller) => seller.name)} />
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
              <SectionCard title="Pedidos por aceptar" icon={<Inbox className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} action={<button onClick={() => exportToExcel("pedidos_por_aceptar_detalle", orderDetailRows(acceptOrders))} className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold"><Download className="mr-1 inline h-3 w-3" />Excel</button>}>
                <div className="space-y-4">
                  {acceptOrders.map((order) => {
                    const isExpanded = expandedOrderIds[order.id] ?? false;
                    const orderTotal = (order.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

                    return (
                      <div key={order.id} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderIds((prev) => ({
                              ...prev,
                              [order.id]: !isExpanded,
                            }))
                          }
                          className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                        >
                          <div>
                            <p className="font-black">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{order.buyer} · {getLocationLabel(order.zone)} · Vendedor {order.seller} · {order.date}</p>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <p className="font-black text-green-700">{formatUSD(orderTotal)}</p>
                              <p className="text-xs text-gray-500">{(order.items || []).length} artículos</p>
                            </div>
                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="mt-4">
                            <MiniExcel maxHeight="318px" columns={[
                              { key: "sku", label: "SKU" },
                              { key: "name", label: "Artículo" },
                              { key: "unitPrice", label: "Precio unit. USD", render: (item) => formatExcelNumber(item.unitPrice) },
                              { key: "quantity", label: "Cantidad" },
                              { key: "total", label: "Total USD", render: (item) => formatExcelNumber(item.unitPrice * item.quantity) },
                            ]} rows={order.items || []} />

                            <div className="mt-3 flex gap-2">
                              <button onClick={() => handleOrderAction(order.id, "accept")} className="flex-1 rounded-xl bg-green-500 py-2 font-bold text-white">Aceptar</button>
                              <button onClick={() => handleOrderAction(order.id, "reject")} className="flex-1 rounded-xl bg-red-500 py-2 font-bold text-white">Rechazar</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {activeOrdersView === "dispatch" && (
              <SectionCard
                title="Pedidos por despachar"
                icon={<Truck className="h-4 w-4" style={{ color: PALETTE.warning }} />}
                action={
                  <button
                    onClick={() =>
                      exportToExcel(
                        "pedidos_por_despachar",
                        orderDetailRows(toDispatchOrders)
                      )
                    }
                    className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold"
                    style={{ color: PALETTE.maastrichtBlue }}
                  >
                    <Download className="mr-1 inline h-3 w-3" />Excel
                  </button>
                }
              >
                <div className="space-y-4">
                  {toDispatchOrders.map((order) => {
                    const isExpanded = expandedOrderIds[order.id] ?? false;
                    const orderTotal = (order.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

                    return (
                      <div key={order.id} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderIds((prev) => ({
                              ...prev,
                              [order.id]: !isExpanded,
                            }))
                          }
                          className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                        >
                          <div>
                            <p className="font-black">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              {order.buyer} · {getLocationLabel(order.zone)} · Vendedor {order.seller} · {order.date}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <p className="font-black text-green-700">{formatUSD(orderTotal)}</p>
                              <p className="text-xs text-gray-500">{(order.items || []).length} artículos</p>
                            </div>
                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="mt-4">
                            <MiniExcel maxHeight="318px" columns={[
                              { key: "sku", label: "SKU" },
                              { key: "name", label: "Artículo" },
                              { key: "unitPrice", label: "Precio unit. USD", render: (item) => formatExcelNumber(item.unitPrice) },
                              { key: "quantity", label: "Cantidad" },
                              { key: "total", label: "Total USD", render: (item) => formatExcelNumber(item.unitPrice * item.quantity) },
                            ]} rows={order.items || []} />

                            <div className="mt-3">
                              <button
                                onClick={() => markOrderAsDispatched(order.id)}
                                className="w-full rounded-xl bg-green-500 py-2 font-bold text-white"
                              >
                                Marcar despachado
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {toDispatchOrders.length === 0 && (
                    <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                      No hay pedidos por despachar.
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-gray-500">Al marcar como despachado, empieza a contar el plazo de 30 días hasta la fecha de pago.</p>
              </SectionCard>
            )}

            {activeOrdersView === "dispatched" && (
              <SectionCard
                title="Histórico de pedidos despachados"
                icon={<History className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />}
                action={
                  <button
                    onClick={() =>
                      exportToExcel(
                        "historico_pedidos_despachados",
                        orderDetailRows(dispatchedOrders).map((row) => ({ ...row, despachado: formatDateShort(dispatchedOrders.find((order) => order.orderNumber === row.Pedido)?.dispatchedAt), fecha_pago: formatDateShort(dispatchedOrders.find((order) => order.orderNumber === row.Pedido)?.paymentDueAt) }))
                      )
                    }
                    className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold"
                    style={{ color: PALETTE.maastrichtBlue }}
                  >
                    <Download className="mr-1 inline h-3 w-3" />Excel
                  </button>
                }
              >
                <div className="space-y-4">
                  {dispatchedOrders.map((order) => {
                    const isExpanded = expandedOrderIds[order.id] ?? false;
                    const orderTotal = (order.items || []).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

                    return (
                      <div key={order.id} className="rounded-xl border p-4" style={{ borderColor: PALETTE.softBorder }}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOrderIds((prev) => ({
                              ...prev,
                              [order.id]: !isExpanded,
                            }))
                          }
                          className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                        >
                          <div>
                            <p className="font-black">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              {order.buyer} · {getLocationLabel(order.zone)} · Vendedor {order.seller} · Despachado {formatDateShort(order.dispatchedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <p className="font-black text-green-700">{formatUSD(orderTotal)}</p>
                              <p className="text-xs text-gray-500">Pago: {formatDateShort(order.paymentDueAt)}</p>
                            </div>
                            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="mt-4">
                            <MiniExcel maxHeight="318px" columns={[
                              { key: "sku", label: "SKU" },
                              { key: "name", label: "Artículo" },
                              { key: "unitPrice", label: "Precio unit. USD", render: (item) => formatExcelNumber(item.unitPrice) },
                              { key: "quantity", label: "Cantidad" },
                              { key: "total", label: "Total USD", render: (item) => formatExcelNumber(item.unitPrice * item.quantity) },
                            ]} rows={order.items || []} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {dispatchedOrders.length === 0 && (
                    <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
                      No hay pedidos despachados para mostrar.
                    </div>
                  )}
                </div>
              </SectionCard>
            )}
          </div>
        )}


        {paymentRejectionModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
              <h3 className="text-xl font-black" style={{ color: PALETTE.maastrichtBlue }}>Razón del rechazo</h3>
              <p className="mt-2 text-sm text-gray-600">Indica por qué se rechaza el pago reportado para la factura {paymentRejectionModal.invoiceNumber}.</p>
              <textarea
                value={paymentRejectionReason}
                onChange={(event) => setPaymentRejectionReason(event.target.value)}
                placeholder="Ejemplo: referencia bancaria no coincide, monto incompleto, comprobante ilegible..."
                className="mt-4 min-h-[120px] w-full rounded-2xl border p-3 text-sm outline-none"
                style={{ borderColor: PALETTE.pastelGray }}
              />
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => { setPaymentRejectionModal(null); setPaymentRejectionReason(""); }} className="rounded-xl border px-4 py-2 text-sm font-black" style={{ borderColor: PALETTE.softBorder, color: PALETTE.maastrichtBlue }}>Cancelar</button>
                <button type="button" disabled={!paymentRejectionReason.trim()} onClick={confirmRejectPayment} className="rounded-xl px-4 py-2 text-sm font-black disabled:opacity-50" style={{ backgroundColor: PALETTE.danger, color: PALETTE.white }}>Confirmar rechazo</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
