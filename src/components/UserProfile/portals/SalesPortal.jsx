import React, { useMemo, useState } from "react";
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

import { KPICard, ProgressBar, AlertCard, SimulationCard } from "../components/shared";
import InventoryTurnoverTab from "../tabs/InventoryTurnover";

//===================================
//CANAL DE VENTAS (DETALLISTAS)
//===================================


function ProfitabilityTab({ PALETTE }) {
  const getTodayInputDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedStartDate, setSelectedStartDate] = useState(getTodayInputDate());
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(getTodayInputDate().slice(0, 7));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const palette = {
    spaceCadet: "#1B3149",
    pastelGray: "#D6D0C4",
    crystalBlue: "#6E98AF",
    sizzlingSunrise: "#FEDC00",
    maastrichtBlue: "#091A2D",
    page: "#F3F1EC",
    white: "#FFFFFF",
    success: "#0F766E",
    danger: "#B42318",
    softBorder: "rgba(9,26,45,0.10)",
    ...PALETTE,
  };

  const formatUSD = (value) =>
    new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSelectedPeriodLabel = () => {
    if (!selectedStartDate && !selectedEndDate) return "Sin fecha seleccionada";
    if (selectedStartDate && !selectedEndDate) return formatDate(selectedStartDate);
    if (!selectedStartDate && selectedEndDate) return formatDate(selectedEndDate);

    if (selectedStartDate === selectedEndDate) {
      return formatDate(selectedStartDate);
    }

    return `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`;
  };

  const getDateRangeDays = () => {
    if (!selectedStartDate && !selectedEndDate) return [];

    const startValue = selectedStartDate || selectedEndDate;
    const endValue = selectedEndDate || selectedStartDate;

    const start = new Date(`${startValue}T00:00:00`);
    const end = new Date(`${endValue}T00:00:00`);
    const from = start <= end ? start : end;
    const to = start <= end ? end : start;

    const days = [];
    const current = new Date(from);

    while (current <= to) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const day = String(current.getDate()).padStart(2, "0");
      days.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getSelectedPeriodType = () => {
    const days = getDateRangeDays().length;

    if (days >= 28) return "mes";
    if (days >= 7) return "semana";
    if (days > 1) return "rango";
    return "día";
  };

  const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthLabel = () => {
    const [year, month] = calendarMonth.split("-").map(Number);
    const date = new Date(year, month - 1, 1);

    return date.toLocaleDateString("es-ES", {
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
    const leadingDays = firstDay.getDay();
    const days = [];

    for (let i = 0; i < leadingDays; i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(year, month - 1, day));
    }

    return days;
  };

  const isDateInRange = (dateString) => {
    if (!selectedStartDate || !selectedEndDate) return false;

    const current = new Date(`${dateString}T00:00:00`);
    const start = new Date(`${selectedStartDate}T00:00:00`);
    const end = new Date(`${selectedEndDate}T00:00:00`);
    const from = start <= end ? start : end;
    const to = start <= end ? end : start;

    return current >= from && current <= to;
  };

  const handleCalendarDayClick = (date) => {
    const value = toInputDate(date);

    if (!selectedStartDate || selectedEndDate) {
      setSelectedStartDate(value);
      setSelectedEndDate("");
      return;
    }

    if (value === selectedStartDate) {
      setSelectedEndDate("");
      return;
    }

    setSelectedEndDate(value);
  };

  const productsData = [
    {
      id: 1,
      name: "Taladro percutor",
      unitsSold: 89,
      revenue: 8011,
      cost: 5340,
      margin: 2671,
      marginPercent: 33.3,
      image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas eléctricas",
      salesByLocation: [
        { location: "Centro", units: 35, revenue: 3150, bestDate: "2024-03-05", bestUnits: 12 },
        { location: "Norte", units: 28, revenue: 2520, bestDate: "2024-03-03", bestUnits: 8 },
        { location: "Sur", units: 26, revenue: 2341, bestDate: "2024-03-07", bestUnits: 7 },
      ],
      salesByWeek: [
        { label: "Sem 1", units: 89, revenue: 8011 },
        { label: "Sem 2", units: 70, revenue: 6300 },
      ],
      salesByMonth: [
        { label: "Enero", units: 120, revenue: 10800 },
        { label: "Febrero", units: 95, revenue: 8550 },
        { label: "Marzo", units: 159, revenue: 14311 },
      ],
    },
    {
      id: 2,
      name: "Juego de llaves",
      unitsSold: 234,
      revenue: 5826,
      cost: 3500,
      margin: 2326,
      marginPercent: 39.9,
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas manuales",
      salesByLocation: [
        { location: "Norte", units: 85, revenue: 2117, bestDate: "2024-03-05", bestUnits: 18 },
        { location: "Centro", units: 70, revenue: 1743, bestDate: "2024-03-03", bestUnits: 15 },
        { location: "Sur", units: 45, revenue: 1121, bestDate: "2024-03-07", bestUnits: 10 },
        { location: "Este", units: 34, revenue: 846, bestDate: "2024-03-06", bestUnits: 8 },
      ],
      salesByWeek: [
        { label: "Sem 1", units: 234, revenue: 5826 },
        { label: "Sem 2", units: 202, revenue: 5029 },
      ],
      salesByMonth: [
        { label: "Enero", units: 180, revenue: 4482 },
        { label: "Febrero", units: 210, revenue: 5229 },
        { label: "Marzo", units: 234, revenue: 5826 },
      ],
    },
    {
      id: 3,
      name: "Guantes anticorte",
      unitsSold: 445,
      revenue: 4445,
      cost: 3111,
      margin: 1334,
      marginPercent: 30.0,
      image:
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=300&q=80",
      category: "Seguridad industrial",
      salesByLocation: [
        { location: "Centro", units: 190, revenue: 1900, bestDate: "2024-03-04", bestUnits: 40 },
        { location: "Sur", units: 155, revenue: 1550, bestDate: "2024-03-07", bestUnits: 36 },
        { location: "Oeste", units: 100, revenue: 995, bestDate: "2024-03-02", bestUnits: 24 },
      ],
      salesByWeek: [
        { label: "Sem 1", units: 445, revenue: 4445 },
        { label: "Sem 2", units: 360, revenue: 3600 },
      ],
      salesByMonth: [
        { label: "Enero", units: 300, revenue: 3000 },
        { label: "Febrero", units: 390, revenue: 3900 },
        { label: "Marzo", units: 445, revenue: 4445 },
      ],
    },
    {
      id: 4,
      name: "Casco seguridad",
      unitsSold: 178,
      revenue: 2581,
      cost: 1806,
      margin: 775,
      marginPercent: 30.0,
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80",
      category: "Seguridad industrial",
      salesByLocation: [
        { location: "Sur", units: 75, revenue: 1088, bestDate: "2024-03-05", bestUnits: 18 },
        { location: "Centro", units: 63, revenue: 914, bestDate: "2024-03-03", bestUnits: 14 },
        { location: "Norte", units: 40, revenue: 579, bestDate: "2024-03-08", bestUnits: 11 },
      ],
      salesByWeek: [
        { label: "Sem 1", units: 178, revenue: 2581 },
        { label: "Sem 2", units: 160, revenue: 2320 },
      ],
      salesByMonth: [
        { label: "Enero", units: 120, revenue: 1740 },
        { label: "Febrero", units: 150, revenue: 2175 },
        { label: "Marzo", units: 178, revenue: 2581 },
      ],
    },
    {
      id: 5,
      name: "Cinta métrica láser",
      unitsSold: 12,
      revenue: 720,
      cost: 840,
      margin: -120,
      marginPercent: -16.7,
      image:
        "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas de medición",
      salesByLocation: [
        { location: "Este", units: 7, revenue: 420, bestDate: "2024-03-04", bestUnits: 3 },
        { location: "Centro", units: 5, revenue: 300, bestDate: "2024-03-06", bestUnits: 2 },
      ],
      salesByWeek: [
        { label: "Sem 1", units: 12, revenue: 720 },
        { label: "Sem 2", units: 9, revenue: 540 },
      ],
      salesByMonth: [
        { label: "Enero", units: 15, revenue: 900 },
        { label: "Febrero", units: 10, revenue: 600 },
        { label: "Marzo", units: 12, revenue: 720 },
      ],
    },
  ];

  const categories = [...new Set(productsData.map((product) => product.category))];
  const products = productsData.map((product) => product.name);
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const normalizedCategorySearch = categorySearch.trim().toLowerCase();
  const allLocations = [
    "all",
    ...new Set(
      productsData.flatMap((product) =>
        product.salesByLocation.map((sale) => sale.location)
      )
    ),
  ];

  const filteredProducts = useMemo(() => {
    return productsData
      .map((product) => {
        const baseLocationSales =
          selectedLocation === "all"
            ? product.salesByLocation
            : product.salesByLocation.filter(
                (sale) => sale.location === selectedLocation
              );

        const selectedDays = getDateRangeDays();

        if (!selectedDays.length) {
          return {
            ...product,
            visibleLocations: [],
            displayUnitsSold: 0,
            displayRevenue: 0,
            displayCost: 0,
            displayMargin: 0,
            displayMarginPercent: 0,
            displayBestLocation: null,
            dailyRows: [],
          };
        }

        const dailyRows = selectedDays.map((dateValue, dayIndex) => {
          const dayLocations = baseLocationSales
            .map((sale, locationIndex) => {
              const isBestDate = sale.bestDate === dateValue;
              const selectedDayNumber = Number(dateValue.slice(-2)) || 1;
              const rotationFactor =
                ((selectedDayNumber + locationIndex + product.id + dayIndex) % 5) + 1;
              const dailyUnits = isBestDate
                ? sale.bestUnits
                : Math.max(0, Math.round(sale.units * (rotationFactor / 100)));
              const averageUnitPrice = sale.revenue / Math.max(sale.units, 1);

              return {
                ...sale,
                units: dailyUnits,
                revenue: Math.round(averageUnitPrice * dailyUnits),
                selectedDate: dateValue,
              };
            })
            .filter((sale) => sale.units > 0);

          return {
            date: dateValue,
            units: dayLocations.reduce((sum, sale) => sum + sale.units, 0),
            revenue: dayLocations.reduce((sum, sale) => sum + sale.revenue, 0),
            locations: dayLocations,
          };
        }).filter((day) => day.units > 0);

        const locationSales = dailyRows.flatMap((day) => day.locations);

        const unitsSold = locationSales.reduce((sum, sale) => sum + sale.units, 0);
        const revenue = locationSales.reduce((sum, sale) => sum + sale.revenue, 0);
        const costRatio = product.revenue > 0 ? product.cost / product.revenue : 0;
        const cost = Math.round(revenue * costRatio);
        const margin = revenue - cost;
        const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
        const bestLocation =
          [...locationSales].sort((a, b) => b.units - a.units)[0] || null;

        return {
          ...product,
          visibleLocations: locationSales,
          displayUnitsSold: unitsSold,
          displayRevenue: revenue,
          displayCost: cost,
          displayMargin: margin,
          displayMarginPercent: marginPercent,
          displayBestLocation: bestLocation,
          dailyRows,
        };
      })
      .filter((product) => {
        const matchesProduct =
          !normalizedProductSearch ||
          product.name.toLowerCase().includes(normalizedProductSearch);

        const matchesCategory =
          !normalizedCategorySearch ||
          product.category.toLowerCase().includes(normalizedCategorySearch);

        const hasSelectedDate = getDateRangeDays().length > 0;
        const hasSalesInLocation =
          selectedLocation === "all" || product.visibleLocations.length > 0;

        return matchesProduct && matchesCategory && hasSalesInLocation && hasSelectedDate;
      });
  }, [normalizedProductSearch, normalizedCategorySearch, selectedLocation, selectedStartDate, selectedEndDate]);

  const totalRevenue = filteredProducts.reduce(
    (sum, product) => sum + product.displayRevenue,
    0
  );
  const totalCost = filteredProducts.reduce(
    (sum, product) => sum + product.displayCost,
    0
  );
  const totalMargin = totalRevenue - totalCost;
  const averageMarginPercent =
    totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  const bestProduct = [...filteredProducts].sort(
    (a, b) => b.displayMargin - a.displayMargin
  )[0];

  const activeFiltersCount = [
    selectedStartDate !== getTodayInputDate() || selectedEndDate !== "",
    productSearch.trim() !== "",
    categorySearch.trim() !== "",
    selectedLocation !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    const today = getTodayInputDate();
    setSelectedStartDate(today);
    setSelectedEndDate("");
    setCalendarMonth(today.slice(0, 7));
    setProductSearch("");
    setCategorySearch("");
    setSelectedLocation("all");
    setIsCalendarOpen(false);
  };

  const getPeriodRows = (product) => {
    if (!product.dailyRows?.length) return [];

    return product.dailyRows.map((day) => ({
      label: formatDate(day.date),
      units: day.units,
      revenue: day.revenue,
    }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <Filter className="h-4 w-4" style={{ color: palette.sizzlingSunrise }} />
              Filtros de rentabilidad
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                  {activeFiltersCount} activos
                </span>
              )}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Al filtrar por ubicación solo aparecen productos con ventas en esa ubicación.
            </p>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              <X className="h-3 w-3" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.05fr_1fr_1fr_0.9fr]">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Período
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCalendarOpen((value) => !value)}
                className="flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-left text-sm"
                style={{ borderColor: palette.pastelGray, color: palette.maastrichtBlue }}
              >
                <span>
                  {selectedStartDate
                    ? selectedEndDate
                      ? `${formatDate(selectedStartDate)} - ${formatDate(selectedEndDate)}`
                      : formatDate(selectedStartDate)
                    : "Seleccionar fecha o rango"}
                </span>
                <CalendarIcon className="h-4 w-4 text-gray-500" />
              </button>

              {isCalendarOpen && (
                <div
                  className="absolute left-0 top-12 z-40 w-[320px] rounded-xl border bg-white p-3 shadow-2xl"
                  style={{ borderColor: palette.pastelGray }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => moveCalendarMonth(-1)}
                      className="rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-gray-100"
                      style={{ color: palette.maastrichtBlue }}
                    >
                      ‹
                    </button>

                    <p className="text-sm font-black capitalize" style={{ color: palette.maastrichtBlue }}>
                      {getMonthLabel()}
                    </p>

                    <button
                      type="button"
                      onClick={() => moveCalendarMonth(1)}
                      className="rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-gray-100"
                      style={{ color: palette.maastrichtBlue }}
                    >
                      ›
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-500">
                    {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-7 gap-1">
                    {getCalendarDays().map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="h-8" />;
                      }

                      const dateString = toInputDate(date);
                      const isStart = dateString === selectedStartDate;
                      const isEnd = dateString === selectedEndDate;
                      const isInRange = isDateInRange(dateString);

                      return (
                        <button
                          key={dateString}
                          type="button"
                          onClick={() => handleCalendarDayClick(date)}
                          className="h-8 rounded-lg text-xs font-bold transition-all"
                          style={{
                            backgroundColor:
                              isStart || isEnd
                                ? palette.sizzlingSunrise
                                : isInRange
                                ? "#FFF7C2"
                                : palette.white,
                            color: palette.maastrichtBlue,
                            border:
                              isStart || isEnd
                                ? `1px solid ${palette.sizzlingSunrise}`
                                : `1px solid ${palette.pastelGray}`,
                          }}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    Primer clic: fecha inicial. Segundo clic: fecha final. Para un solo día, selecciona una sola fecha.
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-black transition hover:opacity-90"
                    style={{
                      backgroundColor: palette.sizzlingSunrise,
                      color: palette.maastrichtBlue,
                    }}
                  >
                    Confirmar fecha
                  </button>
                </div>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Evaluando: <strong>{getSelectedPeriodLabel()}</strong>
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Producto
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                list="profitability-products"
                placeholder="Buscar producto..."
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
                style={{ borderColor: palette.pastelGray }}
              />
              <datalist id="profitability-products">
                {products.map((product) => (
                  <option key={product} value={product} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Categoría
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                list="profitability-categories"
                placeholder="Buscar categoría..."
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
                style={{ borderColor: palette.pastelGray }}
              />
              <datalist id="profitability-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Ubicación
            </label>
            <select
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: palette.pastelGray }}
            >
              <option value="all">Todas las ubicaciones</option>
              {allLocations
                .filter((location) => location !== "all")
                .map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ingresos filtrados"
          value={formatUSD(totalRevenue)}
          icon={<DollarSign className="h-4 w-4" style={{ color: palette.sizzlingSunrise }} />}
          color={palette.sizzlingSunrise}
        />
        <KPICard
          title="Costo filtrado"
          value={formatUSD(totalCost)}
          icon={<Package className="h-4 w-4" style={{ color: "#EF4444" }} />}
          color="#EF4444"
        />
        <KPICard
          title="Ganancia filtrada"
          value={formatUSD(totalMargin)}
          icon={<Trophy className="h-4 w-4" style={{ color: "#10B981" }} />}
          color="#10B981"
        />
        <KPICard
          title="Margen promedio"
          value={`${averageMarginPercent.toFixed(1)}%`}
          icon={<BarChart3 className="h-4 w-4" style={{ color: palette.crystalBlue }} />}
          color={palette.crystalBlue}
        />
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <DollarSign className="h-4 w-4" style={{ color: palette.sizzlingSunrise }} />
            Rentabilidad por producto
            <span className="text-xs font-normal text-gray-400">
              ({filteredProducts.length} productos)
            </span>
          </h3>

          {selectedLocation !== "all" && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Mostrando solo ventas en {selectedLocation}
            </span>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-8 text-center text-sm text-gray-500">
            No hay productos con ventas para la fecha o ubicación seleccionada.
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {filteredProducts.map((product) => {
              const periodRows = getPeriodRows(product);
              const maxPeriodRevenue = Math.max(
                ...periodRows.map((row) => row.revenue),
                1
              );

              return (
                <div
                  key={product.id}
                  className="rounded-xl border p-3 transition-all hover:shadow-md"
                  style={{ borderColor: palette.softBorder }}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-bold"
                          style={{ color: palette.maastrichtBlue }}
                        >
                          {product.name}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {product.category}
                          </span>
                          {product.displayBestLocation && (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              <MapPin className="h-3 w-3" />
                              {selectedLocation === "all"
                                ? `Mejor ubicación: ${product.displayBestLocation.location}`
                                : `Ubicación: ${selectedLocation}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        backgroundColor:
                          product.displayMarginPercent > 35
                            ? "#D1FAE5"
                            : product.displayMarginPercent > 20
                            ? "#FEF3C7"
                            : "#FEE2E2",
                        color:
                          product.displayMarginPercent > 35
                            ? "#065F46"
                            : product.displayMarginPercent > 20
                            ? "#92400E"
                            : "#991B1B",
                      }}
                    >
                      {product.displayMarginPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <div className="rounded-lg bg-gray-50 p-2 text-center">
                      <p className="text-xs text-gray-500">Unidades</p>
                      <p className="text-sm font-black">{product.displayUnitsSold}</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-2 text-center">
                      <p className="text-xs text-green-600">Ingresos</p>
                      <p className="text-sm font-black text-green-700">
                        {formatUSD(product.displayRevenue)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-2 text-center">
                      <p className="text-xs text-red-600">Costo</p>
                      <p className="text-sm font-black text-red-700">
                        {formatUSD(product.displayCost)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-2 text-center">
                      <p className="text-xs text-yellow-700">Ganancia</p>
                      <p className="text-sm font-black text-yellow-700">
                        {formatUSD(product.displayMargin)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <ProgressBar
                      value={Math.max(product.displayMargin, 0)}
                      max={Math.max(product.displayRevenue, 1)}
                      color={palette.sizzlingSunrise}
                      showPercentage={false}
                    />
                  </div>

                  <div className="mt-3 border-t pt-3" style={{ borderColor: palette.pastelGray }}>
                    <p className="mb-2 text-xs font-bold text-gray-700">
                      Ventas del {getSelectedPeriodType()}
                    </p>

                    <div className="space-y-2">
                      {periodRows.map((row) => (
                        <div key={row.label} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-gray-500">{row.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max((row.revenue / maxPeriodRevenue) * 100, 8)}%`,
                                backgroundColor: palette.sizzlingSunrise,
                              }}
                            />
                          </div>
                          <span className="w-20 text-right text-xs font-bold">
                            {formatUSD(row.revenue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {bestProduct && (
          <div className="mt-4 rounded-xl bg-yellow-50 p-3">
            <p className="text-sm font-bold text-yellow-800">
              Producto más rentable: {bestProduct.name}
            </p>
            <p className="text-xs text-yellow-700">
              {formatUSD(bestProduct.displayMargin)} de ganancia en el filtro actual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesPortal({ userData, onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSalesSection, setActiveSalesSection] = useState("summary");
  const [showSimulation, setShowSimulation] = useState(false);
  const [activeOrdersSection, setActiveOrdersSection] = useState("questions");
  const [questionReplies, setQuestionReplies] = useState({});

  const PALETTE = {
    spaceCadet: "#1B3149",
    pastelGray: "#D6D0C4",
    crystalBlue: "#6E98AF",
    sizzlingSunrise: "#FEDC00",
    maastrichtBlue: "#091A2D",
    page: "#F3F1EC",
    white: "#FFFFFF",
  };

  const [receivedOrders, setReceivedOrders] = useState([
    { id: 1, productId: 1, productName: "Taladro percutor profesional", buyer: "Construcciones Pérez", buyerType: "Mayorista", quantity: 5, offeredPrice: 4200, originalPrice: 4500, status: "pending", date: "2024-03-15", message: "Necesito 5 unidades para obra, ¿puedes mejorar el precio?" },
    { id: 2, productId: 3, productName: "Guantes anticorte nivel 5", buyer: "Ferretería El Centro", buyerType: "Detallista", quantity: 50, offeredPrice: 800, originalPrice: 850, status: "pending", date: "2024-03-14", message: "Compra recurrente para mi ferretería" },
    { id: 3, productId: 5, productName: "Esmeril angular 7\"", buyer: "Industrias López", buyerType: "Mayorista", quantity: 3, offeredPrice: 3100, originalPrice: 3200, status: "pending", date: "2024-03-13", message: "Urgente, necesito para mañana" }
  ]);

  const [orderHistory, setOrderHistory] = useState([
    { id: 101, productName: "Taladro percutor", buyer: "Ferre Norte", quantity: 2, totalAmount: 9000, status: "completed", date: "2024-03-10" },
    { id: 102, productName: "Guantes anticorte", buyer: "Construcciones Pérez", quantity: 20, totalAmount: 17000, status: "completed", date: "2024-03-05" },
    { id: 103, productName: "Casco seguridad", buyer: "Ferretería El Centro", quantity: 10, totalAmount: 12500, status: "completed", date: "2024-03-01" }
  ]);

  const [productQuestions, setProductQuestions] = useState([
    {
      id: 1,
      productId: 1,
      productName: "Taladro percutor profesional",
      customerName: "Carlos Méndez",
      customerType: "Cliente B2C",
      question: "¿Incluye maletín y brocas o solo viene el taladro?",
      date: "2024-03-15",
      status: "pending",
      source: "Página de producto",
    },
    {
      id: 2,
      productId: 3,
      productName: "Guantes anticorte nivel 5",
      customerName: "María Fernanda",
      customerType: "Cliente frecuente",
      question: "¿Tienen talla M disponible para retirar hoy?",
      date: "2024-03-14",
      status: "pending",
      source: "Página de producto",
    },
    {
      id: 3,
      productId: 5,
      productName: "Esmeril angular 7\"",
      customerName: "Taller Los Andes",
      customerType: "B2C empresa pequeña",
      question: "¿Sirve para disco de corte de metal?",
      date: "2024-03-13",
      status: "answered",
      answer: "Sí, funciona con disco de corte compatible de 7 pulgadas para metal.",
      source: "Página de producto",
    },
  ]);

  const [commissionsData, setCommissionsData] = useState({
    totalSalesAmount: 45280,
    commissionRate: 5,
    totalCommission: 2264,
    pendingCommission: 1500,
    paidCommission: 764,
    lastPaymentDate: "2024-02-29",
    nextPaymentDate: "2024-03-31",
    paymentStatus: "pending"
  });

  const cashbackUsedByBuyer = [
    { buyer: "Construcciones Pérez", usedInMyStore: 200 },
    { buyer: "Ferretería El Centro", usedInMyStore: 100 },
    { buyer: "Industrias López", usedInMyStore: 300 }
  ];

  const cashbackUsedInMyStore = cashbackUsedByBuyer.reduce((sum, b) => sum + b.usedInMyStore, 0);
  const calculateNetCommission = () => commissionsData.pendingCommission - cashbackUsedInMyStore;

  const salesData = {
    daily: 450,
    weekly: 3150,
    monthly: 14200,
    averageTicket: 28.50,
    transactions: 498,
    pendingOrders: 4,
    completedOrders: 494
  };

  const productProfitability = [
    { name: "Taladro percutor", unitsSold: 89, revenue: 8011, cost: 5340, margin: 2671, marginPercent: 33.3 },
    { name: "Juego de llaves", unitsSold: 234, revenue: 5826, cost: 3500, margin: 2326, marginPercent: 39.9 },
    { name: "Guantes anticorte", unitsSold: 445, revenue: 4445, cost: 3111, margin: 1334, marginPercent: 30.0 },
    { name: "Casco seguridad", unitsSold: 178, revenue: 2581, cost: 1806, margin: 775, marginPercent: 30.0 },
    { name: "Esmeril angular", unitsSold: 67, revenue: 4321, cost: 3024, margin: 1297, marginPercent: 30.0 }
  ];

  const totalRevenue = productProfitability.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = productProfitability.reduce((sum, p) => sum + p.cost, 0);
  const totalMargin = totalRevenue - totalCost;
  const averageMarginPercent = (totalMargin / totalRevenue) * 100;

  const cashFlow = {
    monthlyIncome: 14200,
    monthlyExpenses: 9800,
    netCashFlow: 4400,
    pendingDebt: 16050,
    monthlyDebtPayment: 1350,
    debtCapacity: (14200 - 9800) / 1350,
    liquidityRatio: 3.26
  };

  const businessAlerts = [
    { type: "warning", title: "Producto sin rotación", message: "Cinta métrica tiene 80 días en inventario sin moverse. Considera promoción." },
    { type: "info", title: "Sobreendeudamiento", message: `Tu deuda representa ${((cashFlow.pendingDebt / cashFlow.monthlyIncome) * 100).toFixed(0)}% de tus ingresos mensuales.` }
  ];

  const topProducts = [
    { id: 1, name: "Taladro percutor profesional", unitsSold: 89, revenue: 8011, margin: 33.3, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=200&q=80" },
    { id: 2, name: "Guantes anticorte nivel 5", unitsSold: 445, revenue: 4445, margin: 30.0, image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=200&q=80" },
    { id: 3, name: "Juego de llaves combinadas", unitsSold: 234, revenue: 5826, margin: 39.9, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80" },
    { id: 4, name: "Casco seguridad premium", unitsSold: 178, revenue: 2581, margin: 30.0, image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=200&q=80" }
  ];

  const b2cSalesSections = [
    { id: "summary", title: "1. Resumen de ventas", description: "Ventas diarias, mensuales, ticket promedio y transacciones.", icon: BarChart3 },
    { id: "profit", title: "2. Rentabilidad", description: "Margen por producto, margen total y productos más rentables.", icon: Percent },
    { id: "rotation", title: "3. Rotación de inventario", description: "Más vendidos, productos estancados y días de inventario.", icon: RotateCcw },
    { id: "purchaseSales", title: "4. Compras ↔ Ventas", description: "Comprado vs vendido, conversión de inventario y rentabilidad real.", icon: RefreshCw },
    { id: "cashflow", title: "5. Flujo de caja real", description: "Dinero generado, deuda pendiente y simulación de liquidez.", icon: Wallet },
    { id: "businessAlerts", title: "6. Alertas de negocio", description: "Sin rotación, márgenes negativos y sobreendeudamiento.", icon: Brain },
  ];

  const inventoryRotationData = productProfitability.map((product, index) => ({
    ...product,
    id: index + 1,
    stock: [24, 18, 90, 42, 65][index] || 10,
    daysInventory: [11, 7, 14, 19, 80][index] || 20,
    stagnant: product.name.includes("Cinta"),
    financedPurchaseCost: product.cost,
    soldFromFinancedBatch: Math.round(product.unitsSold * ([0.8, 0.82, 0.76, 0.74, 0.45][index] || 0.7)),
    inventoryToSaleDays: [8, 5, 6, 10, 42][index] || 12,
    image: topProducts.find((item) => product.name.includes(item.name.split(" ")[0]))?.image || topProducts[index % topProducts.length]?.image,
  }));

  const mostProfitableProducts = [...inventoryRotationData].sort((a, b) => b.margin - a.margin).slice(0, 4);
  const stagnantProducts = inventoryRotationData.filter((product) => product.stagnant || product.daysInventory > 45);
  const negativeMarginProducts = inventoryRotationData.filter((product) => product.margin < 0);
  const purchasesVsSalesRows = inventoryRotationData.map((product) => ({
    ...product,
    conversionPercent: product.financedPurchaseCost > 0 ? (product.revenue / product.financedPurchaseCost) * 100 : 0,
    realProfitability: product.revenue - product.financedPurchaseCost,
  }));
  const futurePaymentCapacity = cashFlow.netCashFlow / Math.max(cashFlow.monthlyDebtPayment, 1);
  const estimatedMonthsToPayDebt = cashFlow.pendingDebt / Math.max(cashFlow.netCashFlow, 1);

  const tabs = [
    { id: "dashboard", label: "Dashboard Ventas", icon: LayoutDashboard },
    { id: "profitability", label: "Rentabilidad", icon: DollarSign },
    { id: "inventory", label: "Rotación", icon: RotateCcw },
    { id: "orders", label: "Pedidos", icon: ShoppingBag, badge: receivedOrders.filter(o => o.status === "pending").length },
    { id: "commissions", label: "Comisiones TH", icon: DollarSign },
    { id: "alerts", label: "Alertas", icon: Bell }
  ];

  const handleOrderAction = (orderId, action) => {
    if (action === "accept") {
      const order = receivedOrders.find(o => o.id === orderId);
      if (order) {
        const completedOrder = { id: Date.now(), productName: order.productName, buyer: order.buyer, quantity: order.quantity, totalAmount: order.offeredPrice * order.quantity, status: "completed", date: new Date().toISOString().split('T')[0] };
        setOrderHistory([completedOrder, ...orderHistory]);
        const saleAmount = order.offeredPrice * order.quantity;
        const commissionEarned = saleAmount * (commissionsData.commissionRate / 100);
        setCommissionsData(prev => ({ ...prev, totalSalesAmount: prev.totalSalesAmount + saleAmount, totalCommission: prev.totalCommission + commissionEarned, pendingCommission: prev.pendingCommission + commissionEarned }));
      }
    }
    setReceivedOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: action === "accept" ? "accepted" : "rejected" } : order));
    alert(action === "accept" ? "✅ Pedido aceptado" : "❌ Pedido rechazado");
  };

  const handleQuestionReplyChange = (questionId, value) => {
    setQuestionReplies((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleQuestionAnswered = (questionId) => {
    const answer = questionReplies[questionId]?.trim();

    if (!answer) {
      alert("Escribe una respuesta antes de marcarla como respondida.");
      return;
    }

    setProductQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, status: "answered", answer }
          : question
      )
    );

    setQuestionReplies((prev) => ({
      ...prev,
      [questionId]: "",
    }));

    alert("✅ Pregunta respondida");
  };

  const markQuestionAsRead = (questionId) => {
    setProductQuestions((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, status: "read" }
          : question
      )
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
                <span>Cambiar portal</span>
              </button>
              <div className="h-8 w-px bg-white/20" />
              <div><p className="text-xs text-white/70">Portal de</p><p className="text-sm font-semibold text-white">Ventas B2C</p></div>
            </div>
            <div><p className="text-sm text-white">{userData.name}</p></div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="relative mb-6 overflow-hidden rounded-2xl" style={{ backgroundColor: PALETTE.spaceCadet }}>
          <div className="relative z-10 p-5 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}>
                <Store className="h-8 w-8" style={{ color: PALETTE.maastrichtBlue }} />
              </div>
              <div><h1 className="text-xl font-bold">{userData.name}</h1><p className="text-sm opacity-90">Dashboard de Ventas • B2C</p></div>
            </div>
          </div>
        </div>

        <div className="mb-5 flex gap-1 border-b overflow-x-auto" style={{ borderColor: PALETTE.pastelGray }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "border-b-2" : "opacity-60 hover:opacity-100"}`} style={{ borderColor: activeTab === tab.id ? PALETTE.sizzlingSunrise : "transparent", color: PALETTE.maastrichtBlue }}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.badge > 0 && (<span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">{tab.badge}</span>)}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-5">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-black" style={{ color: PALETTE.maastrichtBlue }}>
                  Canal de ventas B2C
                </h2>
                <p className="text-sm text-gray-500">
                  Convierte la ferretería en un negocio gestionado: ventas, margen, rotación, compras y flujo real.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {b2cSalesSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSalesSection(section.id)}
                      className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        borderColor: activeSalesSection === section.id ? PALETTE.sizzlingSunrise : PALETTE.pastelGray,
                        backgroundColor: activeSalesSection === section.id ? "#FFFBEB" : PALETTE.white,
                      }}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div className="rounded-xl p-2" style={{ backgroundColor: `${PALETTE.sizzlingSunrise}22`, color: PALETTE.maastrichtBlue }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>{section.title}</p>
                      </div>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeSalesSection === "summary" && (
              <div className="space-y-5">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Ventas diarias" value={`$${salesData.daily.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} />
                  <KPICard title="Ventas mensuales" value={`$${salesData.monthly.toLocaleString()}`} icon={<Calendar className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />} color={PALETTE.crystalBlue} />
                  <KPICard title="Ticket promedio" value={`$${salesData.averageTicket}`} icon={<Receipt className="h-4 w-4" style={{ color: "#10B981" }} />} color="#10B981" />
                  <KPICard title="Transacciones" value={salesData.transactions} icon={<ShoppingBag className="h-4 w-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-xl p-4 shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm flex items-center gap-2"><Crown className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Productos más vendidos</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">Top 4</span>
                    </div>
                    <div className="space-y-3">
                      {topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold" style={{ backgroundColor: index === 0 ? PALETTE.sizzlingSunrise : "#E5E7EB", color: PALETTE.maastrichtBlue }}>{index + 1}</div>
                            <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div><p className="font-medium text-sm">{product.name}</p><p className="text-xs text-gray-500">{product.unitsSold} unidades</p></div>
                          </div>
                          <div className="text-right"><p className="font-bold text-sm">${product.revenue.toLocaleString()}</p><p className="text-xs text-green-600">Margen: {product.margin}%</p></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 shadow-sm bg-white">
                    <h3 className="font-bold text-sm flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Evolución simple de ventas</h3>
                    <div className="flex h-40 items-end gap-2">
                      {[420, 380, 510, 470, 620, 590, 450].map((value, index) => (
                        <div key={index} className="flex flex-1 flex-col items-center gap-2">
                          <div className="w-full rounded-t-xl" style={{ height: `${Math.max((value / 620) * 120, 14)}px`, backgroundColor: PALETTE.sizzlingSunrise }} />
                          <span className="text-xs text-gray-500">{["L", "M", "M", "J", "V", "S", "D"][index]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSalesSection === "profit" && (
              <div className="space-y-5">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Margen total" value={`$${totalMargin.toLocaleString()}`} icon={<Target className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} />
                  <KPICard title="Margen promedio" value={`${averageMarginPercent.toFixed(1)}%`} icon={<Percent className="h-4 w-4" style={{ color: "#10B981" }} />} color="#10B981" />
                  <KPICard title="Ingresos totales" value={`$${totalRevenue.toLocaleString()}`} icon={<TrendingUp className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />} color={PALETTE.crystalBlue} />
                  <KPICard title="Costo de ventas" value={`$${totalCost.toLocaleString()}`} icon={<TrendingDown className="h-4 w-4" style={{ color: "#EF4444" }} />} color="#EF4444" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-xl p-4 shadow-sm bg-white">
                    <h3 className="font-bold text-sm mb-4">Margen por producto</h3>
                    <div className="space-y-4">
                      {productProfitability.map((product) => (
                        <div key={product.name}>
                          <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{product.name}</span><span className={product.marginPercent < 0 ? "font-bold text-red-600" : "font-bold text-green-700"}>{product.marginPercent.toFixed(1)}%</span></div>
                          <ProgressBar value={Math.max(product.marginPercent, 0)} max={50} color={product.marginPercent < 0 ? "#EF4444" : PALETTE.sizzlingSunrise} showPercentage={false} />
                          <p className="mt-1 text-xs text-gray-500">Margen: ${product.margin.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 shadow-sm bg-white">
                    <h3 className="font-bold text-sm mb-4">Productos más rentables</h3>
                    <div className="space-y-3">
                      {mostProfitableProducts.map((product) => (
                        <div key={product.name} className="flex items-center justify-between rounded-xl border p-3">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                            <div><p className="font-bold text-sm">{product.name}</p><p className="text-xs text-gray-500">{product.marginPercent.toFixed(1)}% de margen</p></div>
                          </div>
                          <p className="font-black text-green-700">${product.margin.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSalesSection === "rotation" && (
              <div className="space-y-5">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Producto más vendido" value={topProducts[0]?.name || "N/A"} subtitle={`${topProducts[0]?.unitsSold || 0} unidades`} icon={<Package className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} />
                  <KPICard title="Productos estancados" value={stagnantProducts.length} subtitle="Sin rotación saludable" icon={<PackageOpen className="h-4 w-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" />
                  <KPICard title="Días inventario promedio" value={`${(inventoryRotationData.reduce((sum, p) => sum + p.daysInventory, 0) / inventoryRotationData.length).toFixed(0)} días`} icon={<ClockIcon className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />} color={PALETTE.crystalBlue} />
                  <KPICard title="Unidades vendidas" value={inventoryRotationData.reduce((sum, p) => sum + p.unitsSold, 0).toLocaleString()} icon={<ShoppingBag className="h-4 w-4" style={{ color: "#10B981" }} />} color="#10B981" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold text-sm mb-4">Productos más vendidos</h3><div className="space-y-3">{topProducts.map((product) => (<div key={product.id} className="flex items-center justify-between rounded-xl border p-3"><div className="flex items-center gap-3"><img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" /><div><p className="font-bold text-sm">{product.name}</p><p className="text-xs text-gray-500">Rotación saludable</p></div></div><p className="font-black">{product.unitsSold} unidades</p></div>))}</div></div>
                  <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold text-sm mb-4">Productos estancados</h3><div className="space-y-3">{stagnantProducts.map((product) => (<div key={product.name} className="flex items-center justify-between rounded-xl border p-3"><div className="flex items-center gap-3"><img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" /><div><p className="font-bold text-sm">{product.name}</p><p className="text-xs text-gray-500">{product.stock} unidades en stock</p></div></div><p className="font-black text-yellow-600">{product.daysInventory} días</p></div>))}</div></div>
                </div>
              </div>
            )}

            {activeSalesSection === "purchaseSales" && (
              <div className="space-y-5">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Compras financiadas" value={`$${inventoryRotationData.reduce((sum, p) => sum + p.financedPurchaseCost, 0).toLocaleString()}`} icon={<WalletIcon className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />} color={PALETTE.crystalBlue} />
                  <KPICard title="Ventas generadas" value={`$${totalRevenue.toLocaleString()}`} icon={<TrendingUp className="h-4 w-4" style={{ color: "#10B981" }} />} color="#10B981" />
                  <KPICard title="Conversión inventario → venta" value={`${(purchasesVsSalesRows.reduce((sum, p) => sum + p.soldFromFinancedBatch, 0) / inventoryRotationData.reduce((sum, p) => sum + p.unitsSold, 0) * 100).toFixed(1)}%`} icon={<RefreshCw className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} />
                  <KPICard title="Rentabilidad real" value={`$${purchasesVsSalesRows.reduce((sum, p) => sum + p.realProfitability, 0).toLocaleString()}`} icon={<Zap className="h-4 w-4" style={{ color: "#8B5CF6" }} />} color="#8B5CF6" />
                </div>

                <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold text-sm mb-4 flex items-center gap-2"><RefreshCw className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Qué productos compró vs qué vendió</h3><div className="space-y-4">{purchasesVsSalesRows.map((product) => (<div key={product.name} className="rounded-xl border p-4"><div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div><p className="font-bold">{product.name}</p><p className="text-xs text-gray-500">Tiempo inventario → venta: {product.inventoryToSaleDays} días</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.realProfitability >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{product.realProfitability >= 0 ? "Compra saludable" : "Compra a revisar"}</span></div><div className="grid gap-3 text-sm md:grid-cols-4"><div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">Comprado</p><p className="font-black">${product.financedPurchaseCost.toLocaleString()}</p></div><div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">Vendido</p><p className="font-black">${product.revenue.toLocaleString()}</p></div><div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">Rentabilidad real</p><p className={`font-black ${product.realProfitability < 0 ? "text-red-600" : "text-green-700"}`}>${product.realProfitability.toLocaleString()}</p></div><div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">Conversión</p><p className="font-black">{product.conversionPercent.toFixed(1)}%</p></div></div></div>))}</div><div className="mt-4 rounded-xl bg-yellow-50 p-4"><p className="font-bold text-yellow-800">Insight TH.O</p><p className="mt-1 text-sm text-yellow-700">¿Estoy comprando bien o solo acumulando deuda? Revisa productos con baja conversión y margen negativo antes de financiar nuevos pedidos.</p></div></div>
              </div>
            )}

            {activeSalesSection === "cashflow" && (
              <div className="space-y-5">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Dinero generado" value={`$${cashFlow.monthlyIncome.toLocaleString()}`} icon={<DollarSign className="h-4 w-4" style={{ color: "#10B981" }} />} color="#10B981" />
                  <KPICard title="Deuda pendiente" value={`$${cashFlow.pendingDebt.toLocaleString()}`} icon={<Wallet className="h-4 w-4" style={{ color: "#EF4444" }} />} color="#EF4444" />
                  <KPICard title="Capacidad futura" value={`${futurePaymentCapacity.toFixed(1)}x`} subtitle="Cobertura de pago mensual" icon={<Gauge className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} />
                  <KPICard title="Liquidez" value={`${cashFlow.liquidityRatio.toFixed(2)}x`} icon={<CheckCircle className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />} color={PALETTE.crystalBlue} />
                </div>
                <SimulationCard title="Simulador de liquidez" message="¿Cuánto dinero tendrías disponible si pagaras todas tus deudas hoy?" buttonText="Simular capacidad de pago" onSimulate={() => setShowSimulation(!showSimulation)} />
                {showSimulation && (<div className="rounded-xl p-4 shadow-sm bg-white"><h4 className="font-semibold text-sm mb-3">Resultado de simulación</h4><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><div className="p-3 rounded-lg bg-gray-50"><p className="text-xs text-gray-500">Ingresos mensuales</p><p className="font-bold">${cashFlow.monthlyIncome.toLocaleString()}</p></div><div className="p-3 rounded-lg bg-red-50"><p className="text-xs text-red-600">Deuda total</p><p className="font-bold text-red-600">${cashFlow.pendingDebt.toLocaleString()}</p></div><div className="p-3 rounded-lg bg-green-50"><p className="text-xs text-green-600">Capacidad mensual</p><p className="font-bold text-green-600">${cashFlow.netCashFlow.toLocaleString()}</p></div><div className="p-3 rounded-lg bg-yellow-50"><p className="text-xs text-yellow-700">Meses para pagar</p><p className="font-bold text-yellow-700">{estimatedMonthsToPayDebt.toFixed(1)} meses</p></div></div></div>)}
              </div>
            )}

            {activeSalesSection === "businessAlerts" && (
              <div className="space-y-5">
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                  <KPICard title="Sin rotación" value={stagnantProducts.length} icon={<PackageOpen className="h-4 w-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" />
                  <KPICard title="Márgenes negativos" value={negativeMarginProducts.length} icon={<TrendingDown className="h-4 w-4" style={{ color: "#EF4444" }} />} color="#EF4444" />
                  <KPICard title="Deuda / ingresos" value={`${((cashFlow.pendingDebt / cashFlow.monthlyIncome) * 100).toFixed(0)}%`} icon={<AlertTriangle className="h-4 w-4" style={{ color: "#F59E0B" }} />} color="#F59E0B" />
                  <KPICard title="Score de salud" value="78/100" icon={<Gauge className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />} color={PALETTE.sizzlingSunrise} />
                </div>
                <div className="space-y-4">{businessAlerts.map((alert, idx) => (<AlertCard key={idx} type={alert.type} title={alert.title} message={alert.message} action={false} />))}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === "profitability" && <ProfitabilityTab PALETTE={PALETTE} />}
        {activeTab === "inventory" && <InventoryTurnoverTab PALETTE={PALETTE} />}

        {activeTab === "orders" && (
          <div className="space-y-5">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Preguntas pendientes</p>
                <p className="text-2xl font-black" style={{ color: PALETTE.maastrichtBlue }}>
                  {productQuestions.filter((question) => question.status === "pending").length}
                </p>
                <p className="text-xs text-gray-400">Desde producto individual</p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Pedidos pendientes</p>
                <p className="text-2xl font-black text-yellow-600">
                  {receivedOrders.filter((order) => order.status === "pending").length}
                </p>
                <p className="text-xs text-gray-400">Solicitudes por gestionar</p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Ventas procesadas</p>
                <p className="text-2xl font-black text-green-600">{orderHistory.length}</p>
                <p className="text-xs text-gray-400">Historial completado</p>
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Monto histórico</p>
                <p className="text-2xl font-black" style={{ color: PALETTE.crystalBlue }}>
                  ${orderHistory.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">Pedidos completados</p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "questions",
                    label: "Preguntas de productos",
                    icon: MessageSquare,
                    badge: productQuestions.filter((question) => question.status === "pending").length,
                  },
                  {
                    id: "orders",
                    label: "Pedidos recibidos",
                    icon: Inbox,
                    badge: receivedOrders.filter((order) => order.status === "pending").length,
                  },
                  {
                    id: "history",
                    label: "Historial",
                    icon: History,
                    badge: orderHistory.length,
                  },
                ].map((section) => {
                  const Icon = section.icon;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveOrdersSection(section.id)}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all"
                      style={{
                        backgroundColor:
                          activeOrdersSection === section.id
                            ? PALETTE.sizzlingSunrise
                            : PALETTE.page,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                      {section.badge > 0 && (
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs">
                          {section.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeOrdersSection === "questions" && (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold">
                      <MessageSquare className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
                      Preguntas desde productos
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Gestiona preguntas hechas desde la página individual de cada producto.
                    </p>
                  </div>

                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                    {productQuestions.filter((question) => question.status === "pending").length} sin responder
                  </span>
                </div>

                <div className="space-y-4">
                  {productQuestions.map((question) => (
                    <div key={question.id} className="rounded-xl border p-4 transition-all hover:shadow-md">
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <p className="font-bold" style={{ color: PALETTE.maastrichtBlue }}>
                              {question.productName}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                question.status === "answered"
                                  ? "bg-green-100 text-green-700"
                                  : question.status === "read"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {question.status === "answered"
                                ? "Respondida"
                                : question.status === "read"
                                ? "Leída"
                                : "Pendiente"}
                            </span>
                          </div>

                          <p className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            {question.customerName} • {question.customerType}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Origen: {question.source} • {formatDate(question.date)}
                          </p>
                        </div>

                        {question.status === "pending" && (
                          <button
                            onClick={() => markQuestionAsRead(question.id)}
                            className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            <Eye className="h-3 w-3" />
                            Marcar leída
                          </button>
                        )}
                      </div>

                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-500">Pregunta del cliente</p>
                        <p className="mt-1 text-sm" style={{ color: PALETTE.maastrichtBlue }}>
                          {question.question}
                        </p>
                      </div>

                      {question.answer && (
                        <div className="mt-3 rounded-xl bg-green-50 p-3">
                          <p className="text-xs font-semibold text-green-700">Respuesta enviada</p>
                          <p className="mt-1 text-sm text-green-800">{question.answer}</p>
                        </div>
                      )}

                      {question.status !== "answered" && (
                        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                          <textarea
                            value={questionReplies[question.id] || ""}
                            onChange={(event) =>
                              handleQuestionReplyChange(question.id, event.target.value)
                            }
                            placeholder="Escribe una respuesta para el cliente..."
                            className="min-h-[76px] rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-300"
                            style={{ borderColor: PALETTE.pastelGray }}
                          />
                          <button
                            onClick={() => handleQuestionAnswered(question.id)}
                            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition hover:opacity-90"
                            style={{
                              backgroundColor: PALETTE.sizzlingSunrise,
                              color: PALETTE.maastrichtBlue,
                            }}
                          >
                            <Send className="h-4 w-4" />
                            Responder
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeOrdersSection === "orders" && (
              <div className="rounded-xl p-4 shadow-sm bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Inbox className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
                    Pedidos recibidos para gestionar venta
                    <span className="text-xs font-normal text-gray-400">
                      ({receivedOrders.filter(o => o.status === "pending").length} pendientes)
                    </span>
                  </h3>
                </div>

                {receivedOrders.filter(o => o.status === "pending").length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No hay solicitudes de compra pendientes</p>
                    <p className="text-xs mt-1">Cuando llegue un pedido, aparecerá aquí para aceptar o rechazar.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {receivedOrders.filter(o => o.status === "pending").map(order => (
                      <div key={order.id} className="p-4 rounded-xl border hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-bold text-base">{order.productName}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pendiente</span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {order.buyer} • {order.buyerType}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">📅 {formatDate(order.date)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Cantidad solicitada</p>
                            <p className="font-bold text-lg">{order.quantity} unidades</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-gray-50 text-center">
                            <p className="text-xs text-gray-500">Precio unitario</p>
                            <p className="font-semibold">${order.offeredPrice.toLocaleString()}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-green-50 text-center">
                            <p className="text-xs text-green-600">Total del pedido</p>
                            <p className="font-bold text-green-600">${(order.offeredPrice * order.quantity).toLocaleString()}</p>
                          </div>
                        </div>



                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleOrderAction(order.id, "accept")} className="flex-1 text-sm py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors">
                            ✅ Aceptar pedido
                          </button>
                          <button onClick={() => handleOrderAction(order.id, "reject")} className="flex-1 text-sm py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                            ❌ Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeOrdersSection === "history" && (
              <div className="rounded-xl p-4 shadow-sm bg-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <History className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
                  Historial de pedidos procesados
                  <span className="text-xs font-normal text-gray-400">({orderHistory.length} pedidos)</span>
                </h3>

                {orderHistory.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">No hay pedidos en el historial</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderHistory.map(order => (
                      <div key={order.id} className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-sm">{order.productName}</p>
                          <p className="text-xs text-gray-500">{order.buyer} • {order.quantity} unidades</p>
                          <p className="text-xs text-gray-400">{formatDate(order.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-600">${order.totalAmount.toLocaleString()}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Completado</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "commissions" && (
          <div className="space-y-5">
            <div className="rounded-xl p-5 shadow-sm bg-white"><div className="flex items-center gap-3 mb-5"><div className="p-2 rounded-full" style={{ backgroundColor: `${PALETTE.sizzlingSunrise}20` }}><DollarSign className="h-6 w-6" style={{ color: PALETTE.sizzlingSunrise }} /></div><div><h2 className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>Resumen de comisiones TH</h2><p className="text-xs text-gray-500">Comisiones que debes pagar a TH por las ventas en tu tienda</p></div></div>
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6"><div className="p-3 rounded-xl bg-gray-50 text-center"><p className="text-xs text-gray-500">Total ventas</p><p className="text-2xl font-bold text-green-600">${commissionsData.totalSalesAmount.toLocaleString()}</p></div><div className="p-3 rounded-xl bg-yellow-50 text-center"><p className="text-xs text-yellow-600">Tasa comisión</p><p className="text-2xl font-bold text-yellow-600">{commissionsData.commissionRate}%</p></div><div className="p-3 rounded-xl bg-blue-50 text-center"><p className="text-xs text-blue-600">Comisión total</p><p className="text-2xl font-bold text-blue-600">${commissionsData.totalCommission.toLocaleString()}</p></div><div className="p-3 rounded-xl bg-purple-50 text-center"><p className="text-xs text-purple-600">Saldo pendiente con TH</p><p className="text-2xl font-bold text-purple-600">${commissionsData.pendingCommission.toLocaleString()}</p></div></div>
              <ProgressBar value={commissionsData.paidCommission} max={commissionsData.totalCommission} color={PALETTE.sizzlingSunrise} label="Comisión pagada a TH vs total" />
            </div>
            <div className="rounded-xl p-5 shadow-sm bg-white border-l-4 border-green-400"><div className="flex items-start gap-3"><div className="p-2 rounded-full bg-green-100"><RefreshCw className="h-5 w-5 text-green-600" /></div><div className="flex-1"><h3 className="font-bold text-base flex items-center gap-2">Cashback utilizado por compradores<span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Descuento de deuda</span></h3><p className="text-xs text-gray-600 mt-1">Cuando un comprador utiliza su cashback acumulado para pagar en <strong>tu tienda</strong>, ese saldo se descuenta de la comisión que <strong>le debes pagar a TH</strong>.</p>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mt-4"><div className="p-3 rounded-lg bg-green-50"><p className="text-xs text-green-600">Cashback usado en tu tienda</p><p className="text-xl font-bold text-green-600">- ${cashbackUsedInMyStore.toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">Reduce tu deuda con TH</p></div><div className="p-3 rounded-lg bg-red-50"><p className="text-xs text-red-600">Deuda original con TH</p><p className="text-xl font-bold text-red-600">${commissionsData.pendingCommission.toLocaleString()}</p></div><div className="p-3 rounded-lg bg-yellow-50"><p className="text-xs text-yellow-600">💰 Monto neto a pagar a TH</p><p className="text-2xl font-bold text-yellow-600">${calculateNetCommission().toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">Después de aplicar cashback usado en tu tienda</p></div></div></div></div></div>
            <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold mb-3 flex items-center gap-2"><Users className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Cashback utilizado en esta tienda</h3>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr style={{ borderBottom: `1px solid ${PALETTE.pastelGray}` }}><th className="text-left py-2 font-medium">Comprador</th><th className="text-right py-2 font-medium">Cashback usado en tu tienda</th></tr></thead><tbody>{cashbackUsedByBuyer.map((buyer, idx) => (<tr key={idx} style={{ borderBottom: `1px solid ${PALETTE.pastelGray}` }}><td className="py-2">{buyer.buyer}</td><td className="text-right text-green-600 font-semibold">- ${buyer.usedInMyStore}</td></tr>))}</tbody></table></div>
              {cashbackUsedByBuyer.length === 0 && (<p className="text-center text-gray-500 py-4 text-sm">No hay registros de cashback utilizado en tu tienda</p>)}
              <div className="mt-3 p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 flex items-center gap-1"><Brain className="h-3 w-3" />El cashback que los compradores han utilizado en tu tienda ({cashbackUsedInMyStore}) se descuenta automáticamente de la comisión que le debes pagar a TH. Este cashback fue ganado por los compradores en otras tiendas del marketplace.</p></div>
            </div>
            <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Pagos pendientes con TH</h3>
              <div className="grid gap-3 sm:grid-cols-2"><div className="p-3 rounded-lg bg-gray-50"><p className="text-xs text-gray-500">Último pago realizado a TH</p><p className="font-semibold">{formatDate(commissionsData.lastPaymentDate)}</p><p className="text-xs text-green-600">${commissionsData.paidCommission.toLocaleString()}</p></div><div className="p-3 rounded-lg bg-yellow-50"><p className="text-xs text-yellow-600">Próximo pago a TH</p><p className="font-semibold">{formatDate(commissionsData.nextPaymentDate)}</p><p className="text-xs text-yellow-700">Monto: ${calculateNetCommission().toLocaleString()}</p></div></div>
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: commissionsData.paymentStatus === "pending" ? "#FEF3C7" : "#D1FAE5" }}><div className="flex justify-between items-center"><span className="text-sm font-medium">{commissionsData.paymentStatus === "pending" ? "⏳ Pago pendiente con TH" : "✅ Pago completado"}</span><button className="text-xs px-3 py-1 rounded-lg bg-yellow-400 font-semibold" onClick={() => alert("Iniciando proceso de pago de comisiones a TH")}>Pagar comisiones ahora</button></div>
                <p className="text-xs text-gray-500 mt-2">{commissionsData.paymentStatus === "pending" ? `Las comisiones se pagan mensualmente a TH. El monto incluye el ajuste por cashback utilizado por compradores en tu tienda.` : "Tu pago de comisiones a TH ha sido procesado exitosamente."}</p>
                <div className="mt-2 p-2 bg-blue-50 rounded-lg"><p className="text-xs text-blue-700 flex items-center gap-1"><Info className="h-3 w-3" />Las comisiones se calculan automáticamente sobre cada venta realizada en tu tienda. Debes pagarlas a TH mensualmente según el ciclo establecido.</p></div></div>
            </div>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-4">
            {businessAlerts.map((alert, idx) => (<AlertCard key={idx} type={alert.type} title={alert.title} message={alert.message} action={false} />))}
            <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold mb-3 flex items-center gap-2"><Trophy className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Tu Score de Cumplimiento</h3><div className="text-center mb-3"><div className="text-4xl font-bold text-yellow-500">78</div><p className="text-xs text-gray-500">/100</p><ProgressBar value={78} max={100} color="#FEDC00" showPercentage={false} /></div><div className="grid grid-cols-2 gap-2 text-center text-xs"><div className="p-2 rounded-lg bg-green-50"><p className="text-green-600">Pagos a tiempo</p><p className="font-bold">85%</p></div><div className="p-2 rounded-lg bg-red-50"><p className="text-red-600">Retrasos</p><p className="font-bold">2</p></div></div><p className="text-xs text-center mt-3 text-gray-500">{78 >= 80 ? "✅ Excelente! Mantén tu buen comportamiento" : 78 >= 60 ? "⚠️ Estás en riesgo. Mejora tus pagos para evitar bloqueos" : "🔴 Crítico. Contacta a soporte para regularizar tu situación"}</p></div>
          </div>
        )}
      </main>
    </div>
  );
}