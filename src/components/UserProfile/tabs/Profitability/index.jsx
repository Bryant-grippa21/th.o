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

export default function ProfitabilityTab ({ PALETTE }) {
  const [timeRange, setTimeRange] = useState("week");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Estados para fechas personalizadas
  const [customStartDate, setCustomStartDate] = useState("2024-03-01");
  const [customEndDate, setCustomEndDate] = useState("2024-03-07");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const productsData = [
    {
      id: 1,
      name: "Taladro percutor",
      unitsSold: 89,
      revenue: 8011,
      cost: 5340,
      margin: 2671,
      marginPercent: 33.3,
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas eléctricas",
      salesByLocation: [
        { location: "Centro", units: 35, revenue: 3150, bestDate: "2024-03-05", bestUnits: 12 },
        { location: "Norte", units: 28, revenue: 2520, bestDate: "2024-03-03", bestUnits: 8 },
        { location: "Sur", units: 26, revenue: 2341, bestDate: "2024-03-07", bestUnits: 7 }
      ],
      salesByDate: [
        { date: "2024-03-01", units: 12, revenue: 1080 },
        { date: "2024-03-02", units: 8, revenue: 720 },
        { date: "2024-03-03", units: 15, revenue: 1350 },
        { date: "2024-03-04", units: 10, revenue: 900 },
        { date: "2024-03-05", units: 18, revenue: 1620 },
        { date: "2024-03-06", units: 14, revenue: 1260 },
        { date: "2024-03-07", units: 12, revenue: 1081 },
        { date: "2024-03-08", units: 9, revenue: 810 },
        { date: "2024-03-09", units: 11, revenue: 990 },
        { date: "2024-03-10", units: 13, revenue: 1170 },
        { date: "2024-03-11", units: 7, revenue: 630 },
        { date: "2024-03-12", units: 10, revenue: 900 },
        { date: "2024-03-13", units: 8, revenue: 720 },
        { date: "2024-03-14", units: 12, revenue: 1080 }
      ],
      salesByWeek: [
        { week: "Semana 1 (01-07 Mar)", units: 89, revenue: 8011, startDate: "2024-03-01", endDate: "2024-03-07" },
        { week: "Semana 2 (08-14 Mar)", units: 70, revenue: 6300, startDate: "2024-03-08", endDate: "2024-03-14" }
      ],
      salesByMonth: [
        { month: "Enero", units: 120, revenue: 10800, startDate: "2024-01-01", endDate: "2024-01-31" },
        { month: "Febrero", units: 95, revenue: 8550, startDate: "2024-02-01", endDate: "2024-02-29" },
        { month: "Marzo", units: 159, revenue: 14311, startDate: "2024-03-01", endDate: "2024-03-31" }
      ],
      bestSellingPeriod: "Semana del 03/03 al 09/03",
      bestSellingUnits: 18,
      bestSellingDate: "2024-03-05",
      bestSellingLocation: "Centro"
    },
    {
      id: 2,
      name: "Juego de llaves",
      unitsSold: 234,
      revenue: 5826,
      cost: 3500,
      margin: 2326,
      marginPercent: 39.9,
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas manuales",
      salesByLocation: [
        { location: "Norte", units: 85, revenue: 2116.5, bestDate: "2024-03-05", bestUnits: 18 },
        { location: "Centro", units: 70, revenue: 1743, bestDate: "2024-03-03", bestUnits: 15 },
        { location: "Sur", units: 45, revenue: 1120.5, bestDate: "2024-03-07", bestUnits: 10 },
        { location: "Este", units: 34, revenue: 846, bestDate: "2024-03-06", bestUnits: 8 }
      ],
      salesByDate: [
        { date: "2024-03-01", units: 30, revenue: 747 },
        { date: "2024-03-02", units: 25, revenue: 622.5 },
        { date: "2024-03-03", units: 35, revenue: 871.5 },
        { date: "2024-03-04", units: 28, revenue: 697.2 },
        { date: "2024-03-05", units: 42, revenue: 1045.8 },
        { date: "2024-03-06", units: 38, revenue: 946.2 },
        { date: "2024-03-07", units: 36, revenue: 895.8 },
        { date: "2024-03-08", units: 29, revenue: 722.1 },
        { date: "2024-03-09", units: 31, revenue: 771.9 },
        { date: "2024-03-10", units: 27, revenue: 672.3 },
        { date: "2024-03-11", units: 33, revenue: 821.7 },
        { date: "2024-03-12", units: 30, revenue: 747 },
        { date: "2024-03-13", units: 28, revenue: 697.2 },
        { date: "2024-03-14", units: 35, revenue: 871.5 }
      ],
      salesByWeek: [
        { week: "Semana 1 (01-07 Mar)", units: 234, revenue: 5826, startDate: "2024-03-01", endDate: "2024-03-07" },
        { week: "Semana 2 (08-14 Mar)", units: 213, revenue: 5303.7, startDate: "2024-03-08", endDate: "2024-03-14" }
      ],
      salesByMonth: [
        { month: "Enero", units: 280, revenue: 6972, startDate: "2024-01-01", endDate: "2024-01-31" },
        { month: "Febrero", units: 260, revenue: 6474, startDate: "2024-02-01", endDate: "2024-02-29" },
        { month: "Marzo", units: 447, revenue: 11129.7, startDate: "2024-03-01", endDate: "2024-03-31" }
      ],
      bestSellingPeriod: "Semana del 03/03 al 09/03",
      bestSellingUnits: 42,
      bestSellingDate: "2024-03-05",
      bestSellingLocation: "Norte"
    },
    {
      id: 3,
      name: "Guantes anticorte",
      unitsSold: 445,
      revenue: 4445,
      cost: 3111,
      margin: 1334,
      marginPercent: 30.0,
      image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=300&q=80",
      category: "Equipo de protección",
      salesByLocation: [
        { location: "Sur", units: 180, revenue: 1800, bestDate: "2024-03-05", bestUnits: 35 },
        { location: "Norte", units: 120, revenue: 1200, bestDate: "2024-03-03", bestUnits: 25 },
        { location: "Centro", units: 95, revenue: 950, bestDate: "2024-03-07", bestUnits: 20 },
        { location: "Este", units: 50, revenue: 495, bestDate: "2024-03-06", bestUnits: 15 }
      ],
      salesByDate: [
        { date: "2024-03-01", units: 55, revenue: 550 },
        { date: "2024-03-02", units: 60, revenue: 600 },
        { date: "2024-03-03", units: 70, revenue: 700 },
        { date: "2024-03-04", units: 65, revenue: 650 },
        { date: "2024-03-05", units: 80, revenue: 800 },
        { date: "2024-03-06", units: 75, revenue: 750 },
        { date: "2024-03-07", units: 40, revenue: 395 },
        { date: "2024-03-08", units: 50, revenue: 500 },
        { date: "2024-03-09", units: 55, revenue: 550 },
        { date: "2024-03-10", units: 45, revenue: 450 },
        { date: "2024-03-11", units: 48, revenue: 480 },
        { date: "2024-03-12", units: 52, revenue: 520 },
        { date: "2024-03-13", units: 46, revenue: 460 },
        { date: "2024-03-14", units: 54, revenue: 540 }
      ],
      salesByWeek: [
        { week: "Semana 1 (01-07 Mar)", units: 445, revenue: 4445, startDate: "2024-03-01", endDate: "2024-03-07" },
        { week: "Semana 2 (08-14 Mar)", units: 350, revenue: 3500, startDate: "2024-03-08", endDate: "2024-03-14" }
      ],
      salesByMonth: [
        { month: "Enero", units: 520, revenue: 5200, startDate: "2024-01-01", endDate: "2024-01-31" },
        { month: "Febrero", units: 500, revenue: 5000, startDate: "2024-02-01", endDate: "2024-02-29" },
        { month: "Marzo", units: 795, revenue: 7945, startDate: "2024-03-01", endDate: "2024-03-31" }
      ],
      bestSellingPeriod: "Semana del 03/03 al 09/03",
      bestSellingUnits: 80,
      bestSellingDate: "2024-03-05",
      bestSellingLocation: "Sur"
    },
    {
      id: 4,
      name: "Casco seguridad",
      unitsSold: 178,
      revenue: 2581,
      cost: 1806,
      margin: 775,
      marginPercent: 30.0,
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80",
      category: "Equipo de protección",
      salesByLocation: [
        { location: "Este", units: 70, revenue: 1015, bestDate: "2024-03-07", bestUnits: 18 },
        { location: "Centro", units: 55, revenue: 797.5, bestDate: "2024-03-05", bestUnits: 12 },
        { location: "Norte", units: 35, revenue: 507.5, bestDate: "2024-03-03", bestUnits: 10 },
        { location: "Sur", units: 18, revenue: 261, bestDate: "2024-03-06", bestUnits: 8 }
      ],
      salesByDate: [
        { date: "2024-03-01", units: 20, revenue: 290 },
        { date: "2024-03-02", units: 18, revenue: 261 },
        { date: "2024-03-03", units: 25, revenue: 362.5 },
        { date: "2024-03-04", units: 22, revenue: 319 },
        { date: "2024-03-05", units: 30, revenue: 435 },
        { date: "2024-03-06", units: 28, revenue: 406 },
        { date: "2024-03-07", units: 35, revenue: 507.5 },
        { date: "2024-03-08", units: 20, revenue: 290 },
        { date: "2024-03-09", units: 22, revenue: 319 },
        { date: "2024-03-10", units: 18, revenue: 261 },
        { date: "2024-03-11", units: 24, revenue: 348 },
        { date: "2024-03-12", units: 20, revenue: 290 },
        { date: "2024-03-13", units: 19, revenue: 275.5 },
        { date: "2024-03-14", units: 23, revenue: 333.5 }
      ],
      salesByWeek: [
        { week: "Semana 1 (01-07 Mar)", units: 178, revenue: 2581, startDate: "2024-03-01", endDate: "2024-03-07" },
        { week: "Semana 2 (08-14 Mar)", units: 146, revenue: 2117, startDate: "2024-03-08", endDate: "2024-03-14" }
      ],
      salesByMonth: [
        { month: "Enero", units: 210, revenue: 3045, startDate: "2024-01-01", endDate: "2024-01-31" },
        { month: "Febrero", units: 195, revenue: 2827.5, startDate: "2024-02-01", endDate: "2024-02-29" },
        { month: "Marzo", units: 324, revenue: 4698, startDate: "2024-03-01", endDate: "2024-03-31" }
      ],
      bestSellingPeriod: "Semana del 03/03 al 09/03",
      bestSellingUnits: 35,
      bestSellingDate: "2024-03-07",
      bestSellingLocation: "Este"
    },
    {
      id: 5,
      name: "Esmeril angular",
      unitsSold: 67,
      revenue: 4321,
      cost: 3024,
      margin: 1297,
      marginPercent: 30.0,
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas eléctricas",
      salesByLocation: [
        { location: "Oeste", units: 30, revenue: 1935, bestDate: "2024-03-05", bestUnits: 8 },
        { location: "Centro", units: 20, revenue: 1290, bestDate: "2024-03-07", bestUnits: 6 },
        { location: "Norte", units: 17, revenue: 1096, bestDate: "2024-03-03", bestUnits: 5 }
      ],
      salesByDate: [
        { date: "2024-03-01", units: 8, revenue: 516 },
        { date: "2024-03-02", units: 6, revenue: 387 },
        { date: "2024-03-03", units: 10, revenue: 645 },
        { date: "2024-03-04", units: 9, revenue: 580.5 },
        { date: "2024-03-05", units: 12, revenue: 774 },
        { date: "2024-03-06", units: 11, revenue: 709.5 },
        { date: "2024-03-07", units: 11, revenue: 709 },
        { date: "2024-03-08", units: 7, revenue: 451.5 },
        { date: "2024-03-09", units: 9, revenue: 580.5 },
        { date: "2024-03-10", units: 6, revenue: 387 },
        { date: "2024-03-11", units: 8, revenue: 516 },
        { date: "2024-03-12", units: 7, revenue: 451.5 },
        { date: "2024-03-13", units: 9, revenue: 580.5 },
        { date: "2024-03-14", units: 8, revenue: 516 }
      ],
      salesByWeek: [
        { week: "Semana 1 (01-07 Mar)", units: 67, revenue: 4321, startDate: "2024-03-01", endDate: "2024-03-07" },
        { week: "Semana 2 (08-14 Mar)", units: 54, revenue: 3483, startDate: "2024-03-08", endDate: "2024-03-14" }
      ],
      salesByMonth: [
        { month: "Enero", units: 85, revenue: 5482.5, startDate: "2024-01-01", endDate: "2024-01-31" },
        { month: "Febrero", units: 78, revenue: 5031, startDate: "2024-02-01", endDate: "2024-02-29" },
        { month: "Marzo", units: 121, revenue: 7804.5, startDate: "2024-03-01", endDate: "2024-03-31" }
      ],
      bestSellingPeriod: "Semana del 03/03 al 09/03",
      bestSellingUnits: 12,
      bestSellingDate: "2024-03-05",
      bestSellingLocation: "Oeste"
    }
  ];

  const allLocations = ["all", ...new Set(productsData.flatMap(p => p.salesByLocation.map(l => l.location)))];
  const categories = ["all", ...new Set(productsData.map(p => p.category))];
  const products = ["all", ...productsData.map(p => p.name)];

  const timeRanges = [
    { value: "day", label: "Día", icon: CalendarIcon },
    { value: "week", label: "Semana", icon: Calendar },
    { value: "month", label: "Mes", icon: Calendar },
    { value: "custom", label: "Personalizado", icon: Calendar }
  ];

  // Obtener top ubicaciones para el ranking
  const getTopLocations = () => {
    const locationSales = {};
    const filteredProducts = getFilteredProducts();

    filteredProducts.forEach(product => {
      product.salesByLocation.forEach(loc => {
        if (!locationSales[loc.location]) {
          locationSales[loc.location] = { units: 0, revenue: 0 };
        }
        locationSales[loc.location].units += loc.units;
        locationSales[loc.location].revenue += loc.revenue;
      });
    });

    return Object.entries(locationSales)
      .map(([location, data]) => ({ location, ...data }))
      .filter(loc => loc.units > 0)
      .sort((a, b) => b.revenue - a.revenue);
  };

  const updateActiveFiltersCount = () => {
    let count = 0;
    if (selectedProduct !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedLocation !== "all") count++;
    if (timeRange === "custom") count++;
    setActiveFiltersCount(count);
  };

  const clearAllFilters = () => {
    setSelectedProduct("all");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setTimeRange("week");
    setCustomStartDate("2024-03-01");
    setCustomEndDate("2024-03-07");
    setActiveFiltersCount(0);
  };

  const getFilteredProducts = () => {
    let filtered = [...productsData];
    if (selectedProduct !== "all") {
      filtered = filtered.filter(p => p.name === selectedProduct);
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    return filtered;
  };

  const getSalesDataByTimeRange = (product) => {
    if (timeRange === "custom") {
      const filteredSales = product.salesByDate.filter(sale =>
        sale.date >= customStartDate && sale.date <= customEndDate
      );
      return filteredSales;
    }

    switch (timeRange) {
      case "day": return product.salesByDate;
      case "week": return product.salesByWeek;
      case "month": return product.salesByMonth;
      default: return product.salesByDate;
    }
  };

  const getFilteredProductTotals = (product) => {
    if (timeRange === "custom") {
      const filteredSales = product.salesByDate.filter(sale =>
        sale.date >= customStartDate && sale.date <= customEndDate
      );
      const totalUnits = filteredSales.reduce((sum, s) => sum + s.units, 0);
      const totalRevenue = filteredSales.reduce((sum, s) => sum + s.revenue, 0);
      const costPerUnit = product.cost / product.unitsSold;
      const totalCost = totalUnits * costPerUnit;
      const totalMargin = totalRevenue - totalCost;
      const marginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

      return {
        unitsSold: totalUnits,
        revenue: totalRevenue,
        cost: totalCost,
        margin: totalMargin,
        marginPercent: marginPercent
      };
    }

    return {
      unitsSold: product.unitsSold,
      revenue: product.revenue,
      cost: product.cost,
      margin: product.margin,
      marginPercent: product.marginPercent
    };
  };

  const getFilteredProductsWithDates = () => {
    let filtered = [...productsData];
    if (selectedProduct !== "all") {
      filtered = filtered.filter(p => p.name === selectedProduct);
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (selectedLocation !== "all") {
      filtered = filtered.filter(p =>
        p.salesByLocation.some(loc => loc.location === selectedLocation && loc.units > 0)
      );
    }

    if (timeRange === "custom") {
      filtered = filtered.filter(product => {
        const hasSalesInRange = product.salesByDate.some(sale =>
          sale.date >= customStartDate && sale.date <= customEndDate
        );
        return hasSalesInRange;
      });
    }

    return filtered;
  };

  useEffect(() => {
    updateActiveFiltersCount();
  }, [selectedProduct, selectedCategory, selectedLocation, timeRange]);

  const filteredProducts = getFilteredProducts();
  const filteredProductsWithDates = getFilteredProductsWithDates();
  const topLocations = getTopLocations();

  const getFilteredTotals = () => {
    let totalRevenue = 0;
    let totalCost = 0;

    filteredProductsWithDates.forEach(product => {
      const totals = getFilteredProductTotals(product);
      totalRevenue += totals.revenue;
      totalCost += totals.cost;
    });

    const totalMargin = totalRevenue - totalCost;
    const avgMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

    return { totalRevenue, totalCost, totalMargin, avgMarginPercent };
  };

  const { totalRevenue: filteredTotalRevenue, totalCost: filteredTotalCost,
    totalMargin: filteredTotalMargin, avgMarginPercent: filteredAvgMarginPercent } = getFilteredTotals();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getBestLocationForProduct = (product) => {
    const locations = product.salesByLocation.filter(l => l.units > 0);
    if (locations.length === 0) return null;
    return locations.reduce((best, current) => current.revenue > best.revenue ? current : best, locations[0]);
  };

  const getBestPeriodInfo = (product) => {
    if (timeRange === "custom") {
      const filteredSales = product.salesByDate.filter(sale =>
        sale.date >= customStartDate && sale.date <= customEndDate
      );
      if (filteredSales.length === 0) return null;
      const bestSale = filteredSales.reduce((best, current) =>
        current.units > best.units ? current : best, filteredSales[0]);
      return {
        date: bestSale.date,
        units: bestSale.units,
        revenue: bestSale.revenue,
        period: `${formatDate(customStartDate)} al ${formatDate(customEndDate)}`
      };
    }

    if (timeRange === "week") {
      const bestWeek = product.salesByWeek.reduce((best, current) =>
        current.units > best.units ? current : best, product.salesByWeek[0]);
      return {
        date: bestWeek.week,
        units: bestWeek.units,
        revenue: bestWeek.revenue,
        period: bestWeek.week
      };
    }

    if (timeRange === "month") {
      const bestMonth = product.salesByMonth.reduce((best, current) =>
        current.units > best.units ? current : best, product.salesByMonth[0]);
      return {
        date: bestMonth.month,
        units: bestMonth.units,
        revenue: bestMonth.revenue,
        period: bestMonth.month
      };
    }

    return {
      date: product.bestSellingDate,
      units: product.bestSellingUnits,
      revenue: product.salesByDate.find(s => s.units === product.bestSellingUnits)?.revenue || 0,
      period: product.bestSellingPeriod
    };
  };

  return (
    <div className="space-y-5">
      {/* Panel de filtros */}
      <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
            Filtros de análisis
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
            {/* Período de tiempo */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">📅 Período de tiempo</label>
              <div className="flex gap-2 flex-wrap">
                {timeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setTimeRange(range.value);
                      if (range.value === "custom") {
                        setShowDatePicker(true);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range.value
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <range.icon className="h-4 w-4" />
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de fechas personalizadas */}
            {timeRange === "custom" && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Selecciona un rango de fechas</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Fecha inicio</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "#D6D0C4" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Fecha fin</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{ borderColor: "#D6D0C4" }}
                    />
                  </div>
                </div>
                {customStartDate > customEndDate && (
                  <p className="text-xs text-red-500 mt-2">⚠️ La fecha fin no puede ser menor a la fecha inicio</p>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  📊 Mostrando ventas desde {formatDate(customStartDate)} hasta {formatDate(customEndDate)}
                </div>
              </div>
            )}

            {/* Filtros de producto, categoría y ubicación */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">🔧 Producto</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                >
                  <option value="all">Todos los productos</option>
                  {products.filter(p => p !== "all").map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📂 Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                >
                  <option value="all">Todas las categorías</option>
                  {categories.filter(c => c !== "all").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📍 Ubicación / Región</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                >
                  <option value="all">Todas las ubicaciones</option>
                  {allLocations.filter(l => l !== "all").map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 transition-all border border-red-200"
                  >
                    <X className="h-3 w-3" />
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {/* Resumen de filtros activos */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: "#D6D0C4" }}>
                <span className="text-xs text-gray-500">Filtros aplicados:</span>
                {timeRange === "custom" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                    📅 {formatDate(customStartDate)} → {formatDate(customEndDate)}
                    <button onClick={() => setTimeRange("week")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {selectedProduct !== "all" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
                    Producto: {selectedProduct}
                    <button onClick={() => setSelectedProduct("all")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                    Categoría: {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {selectedLocation !== "all" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    📍 Ubicación: {selectedLocation}
                    <button onClick={() => setSelectedLocation("all")} className="hover:text-red-500">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPIs de resumen filtrados */}
      {filteredProductsWithDates.length > 0 && filteredTotalRevenue > 0 && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl p-3 text-center bg-white shadow-sm">
            <p className="text-2xl font-bold text-green-600">${Math.round(filteredTotalRevenue).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Ingresos totales</p>
            {timeRange === "custom" && (
              <p className="text-xs text-gray-400 mt-1">en el período seleccionado</p>
            )}
          </div>
          <div className="rounded-xl p-3 text-center bg-white shadow-sm">
            <p className="text-2xl font-bold text-red-600">${Math.round(filteredTotalCost).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Costo total</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-white shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">${Math.round(filteredTotalMargin).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Ganancia total</p>
          </div>
          <div className="rounded-xl p-3 text-center bg-white shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{filteredAvgMarginPercent.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Margen promedio</p>
          </div>
        </div>
      )}

      {/* Top ubicaciones de venta - RANKING */}
      {topLocations.length > 0 && (
        <div className="rounded-xl p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
              📊 Top Lugares de Venta
              <span className="text-xs font-normal text-gray-400">
                (Ranking por ingresos)
              </span>
            </h3>
            {selectedLocation !== "all" && (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                Mostrando análisis para: {selectedLocation}
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topLocations.slice(0, 3).map((loc, idx) => (
              <button
                key={loc.location}
                onClick={() => setSelectedLocation(loc.location)}
                className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${selectedLocation === loc.location
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-100 hover:border-yellow-200"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold" style={{
                      backgroundColor: idx === 0 ? "#FEDC00" : idx === 1 ? "#E5E7EB" : "#F3F4F6",
                      color: "#091A2D"
                    }}>
                      {idx + 1}
                    </div>
                    <p className="font-bold text-sm">{loc.location}</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">#{idx + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
                  <div className="p-1 rounded bg-gray-50">
                    <p className="text-gray-500">Unidades</p>
                    <p className="font-bold">{loc.units.toLocaleString()}</p>
                  </div>
                  <div className="p-1 rounded bg-gray-50">
                    <p className="text-gray-500">Ingresos</p>
                    <p className="font-bold text-green-600">${loc.revenue.toLocaleString()}</p>
                  </div>
                </div>
                <ProgressBar value={loc.revenue} max={topLocations[0]?.revenue || 1} color={PALETTE.sizzlingSunrise} showPercentage={false} />
              </button>
            ))}
          </div>
          {topLocations.length > 3 && (
            <div className="mt-3 pt-2 border-t text-center">
              <p className="text-xs text-gray-400">
                +{topLocations.length - 3} ubicaciones más con ventas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lista de productos con análisis detallado */}
      <div className="rounded-xl p-4 shadow-sm bg-white">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
          Rentabilidad por producto
          <span className="text-xs font-normal text-gray-400 ml-2">
            ({filteredProductsWithDates.length} productos)
          </span>
          {selectedLocation !== "all" && (
            <span className="text-xs font-normal text-green-600 ml-2">
              • Mostrando datos para {selectedLocation}
            </span>
          )}
          {timeRange === "custom" && (
            <span className="text-xs font-normal text-purple-600 ml-2">
              • {formatDate(customStartDate)} al {formatDate(customEndDate)}
            </span>
          )}
        </h3>

        {filteredProductsWithDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No hay productos que coincidan con los filtros seleccionados</p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="mt-3 text-sm text-yellow-600 underline">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProductsWithDates.map(product => {
              const productTotals = getFilteredProductTotals(product);
              const salesData = getSalesDataByTimeRange(product);
              const maxSales = salesData.length > 0 ? Math.max(...salesData.map(s => s.units)) : 0;
              const bestLocation = getBestLocationForProduct(product);
              const bestPeriod = getBestPeriodInfo(product);

              // Si no hay ventas en el período personalizado, omitir este producto
              if (timeRange === "custom" && productTotals.unitsSold === 0) {
                return null;
              }

              return (
                <div key={product.id} className="p-4 rounded-xl border hover:shadow-md transition-all">
                  {/* Cabecera con imagen y nombre */}
                  <div className="flex items-start gap-4 mb-4">
                    <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="font-bold text-base">{product.name}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.category}</span>
                            {bestLocation && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 flex items-center gap-1">
                                <MapPinIcon className="h-2 w-2" />
                                Mejor ubicación: {bestLocation.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-bold px-3 py-1 rounded-full" style={{
                          backgroundColor: productTotals.marginPercent > 35 ? "#D1FAE5" : productTotals.marginPercent > 28 ? "#FEF3C7" : "#FEE2E2",
                          color: productTotals.marginPercent > 35 ? "#065F46" : productTotals.marginPercent > 28 ? "#92400E" : "#991B1B"
                        }}>
                          Margen: {productTotals.marginPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Métricas principales con datos filtrados */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-500">Unidades vendidas</p>
                      <p className="font-bold text-lg">{productTotals.unitsSold.toLocaleString()}</p>
                      {timeRange === "custom" && (
                        <p className="text-xs text-gray-400">en el período</p>
                      )}
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-50">
                      <p className="text-xs text-green-600">Ingresos</p>
                      <p className="font-bold text-green-600">${Math.round(productTotals.revenue).toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-red-50">
                      <p className="text-xs text-red-600">Costo</p>
                      <p className="font-bold text-red-600">${Math.round(productTotals.cost).toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-yellow-50">
                      <p className="text-xs text-yellow-600">Ganancia</p>
                      <p className="font-bold text-yellow-600">${Math.round(productTotals.margin).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Barra de progreso de margen */}
                  <ProgressBar value={productTotals.margin} max={productTotals.revenue} color={PALETTE.sizzlingSunrise} showPercentage={false} />

                  {/* Análisis de ventas por ubicación */}
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: "#D6D0C4" }}>
                    <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" style={{ color: PALETTE.sizzlingSunrise }} />
                      📍 Análisis de ventas por ubicación
                    </p>

                    <div className="grid gap-2">
                      {product.salesByLocation.filter(loc => loc.units > 0).map(loc => (
                        <div
                          key={loc.location}
                          className={`p-2 rounded-lg flex flex-wrap justify-between items-center ${selectedLocation === loc.location ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-3 w-3 text-gray-500" />
                            <span className="font-medium text-sm">{loc.location}</span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <span className="text-gray-600">{loc.units.toLocaleString()} unidades</span>
                            <span className="text-green-600 font-medium">${loc.revenue.toLocaleString()}</span>
                          </div>
                          {loc.bestDate && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>Mejor día: {formatDate(loc.bestDate)} ({loc.bestUnits} unid.)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mejor período de ventas */}
                    {bestPeriod && (
                      <div className="mt-3 bg-yellow-50 rounded-lg p-3">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              🏆 Mejor período de ventas: {timeRange === "custom" ? bestPeriod.period : formatDate(product.bestSellingDate)}
                            </p>
                            <p className="text-xs text-yellow-600">
                              {bestPeriod.period} • {bestPeriod.units.toLocaleString()} unidades vendidas
                              {product.bestSellingLocation && ` en ${product.bestSellingLocation}`}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">
                            ⚡ +{Math.round((bestPeriod.units / (productTotals.unitsSold / Math.max(1, salesData.length))) * 100 - 100)}% vs promedio
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Gráfico de ventas por período */}
                    {salesData.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Ventas por {timeRange === "custom" ? "día" : timeRange === "week" ? "semana" : timeRange === "month" ? "mes" : "día"}
                        </p>
                        <div className="flex items-end gap-1 h-16">
                          {salesData.map((sale, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full rounded-t transition-all"
                                style={{
                                  backgroundColor: (sale.units || 0) === maxSales ? PALETTE.sizzlingSunrise : "#E5E7EB",
                                  height: `${((sale.units || 0) / maxSales) * 50}px`,
                                  minHeight: '4px'
                                }}
                              />
                              <span className="text-xs text-gray-400">
                                {timeRange === "day" && sale.date ? formatDate(sale.date).slice(0, 5) :
                                  timeRange === "week" && sale.week ? sale.week.slice(-1) :
                                    timeRange === "month" && sale.month ? sale.month.slice(0, 3) :
                                      timeRange === "custom" && sale.date ? formatDate(sale.date).slice(0, 5) :
                                        idx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        )}
      </div>

      {/* Insight de filtros */}
      {activeFiltersCount > 0 && filteredProductsWithDates.length > 0 && filteredTotalRevenue > 0 && (
        <div className="rounded-xl p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-yellow-800">Resumen de filtros aplicados</p>
              <p className="text-xs text-yellow-700 mt-1">
                {selectedLocation !== "all"
                  ? `📍 En ${selectedLocation}, se vendieron ${filteredProductsWithDates.reduce((sum, p) => {
                    const locData = p.salesByLocation.find(l => l.location === selectedLocation);
                    return sum + (locData?.units || 0);
                  }, 0).toLocaleString()} unidades generando $${filteredProductsWithDates.reduce((sum, p) => {
                    const locData = p.salesByLocation.find(l => l.location === selectedLocation);
                    return sum + (locData?.revenue || 0);
                  }, 0).toLocaleString()} en ingresos.`
                  : `Mostrando información para ${filteredProductsWithDates.length} producto(s) con un margen total de ${filteredAvgMarginPercent.toFixed(1)}% 
                    y una ganancia acumulada de $${Math.round(filteredTotalMargin).toLocaleString()}.`
                }
                {topLocations[0] && ` La ubicación con mejores ventas es ${topLocations[0].location} con $${topLocations[0].revenue.toLocaleString()}.`}
                {timeRange === "custom" && ` Este análisis corresponde al período del ${formatDate(customStartDate)} al ${formatDate(customEndDate)}.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// COMPONENTE DE ROTACIÓN DE INVENTARIO
