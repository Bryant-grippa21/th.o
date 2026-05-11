import React, { useState, useEffect } from "react";
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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

export default function InventoryTurnoverTab({ PALETTE }) {
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRestockStatus, setSelectedRestockStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [expandedProducts, setExpandedProducts] = useState({});

  const inventoryData = [
    {
      id: 1,
      name: "Taladro percutor",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas eléctricas",
      currentStock: 14,
      monthlySales: 89,
      turnoverRate: 6.36,
      daysInStock: 4.7,
      status: "excelente",
      entryDate: "2024-02-15",
      salesStartDate: "2024-02-16",
      salesEndDate: "2024-03-07",
      daysToSell: 21,
      restockHistory: [
        { date: "2024-02-15", quantity: 50, type: "initial" },
        { date: "2024-02-28", quantity: 30, type: "restock" }
      ],
      needsRestock: false,
      lastRestockDate: "2024-02-28",
      suggestedRestockDate: "2024-03-15",
      suggestedRestockQuantity: 40
    },
    {
      id: 2,
      name: "Juego de llaves",
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas manuales",
      currentStock: 22,
      monthlySales: 234,
      turnoverRate: 10.64,
      daysInStock: 2.8,
      status: "excelente",
      entryDate: "2024-02-10",
      salesStartDate: "2024-02-11",
      salesEndDate: "2024-03-07",
      daysToSell: 25,
      restockHistory: [
        { date: "2024-02-10", quantity: 100, type: "initial" },
        { date: "2024-02-20", quantity: 80, type: "restock" },
        { date: "2024-03-01", quantity: 60, type: "restock" }
      ],
      needsRestock: false,
      lastRestockDate: "2024-03-01",
      suggestedRestockDate: "2024-03-10",
      suggestedRestockQuantity: 80
    },
    {
      id: 3,
      name: "Guantes anticorte",
      image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=300&q=80",
      category: "Equipo de protección",
      currentStock: 45,
      monthlySales: 445,
      turnoverRate: 9.89,
      daysInStock: 3.0,
      status: "excelente",
      entryDate: "2024-02-05",
      salesStartDate: "2024-02-06",
      salesEndDate: "2024-03-07",
      daysToSell: 30,
      restockHistory: [
        { date: "2024-02-05", quantity: 200, type: "initial" },
        { date: "2024-02-18", quantity: 150, type: "restock" },
        { date: "2024-03-03", quantity: 120, type: "restock" }
      ],
      needsRestock: false,
      lastRestockDate: "2024-03-03",
      suggestedRestockDate: "2024-03-12",
      suggestedRestockQuantity: 150
    },
    {
      id: 4,
      name: "Casco seguridad",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80",
      category: "Equipo de protección",
      currentStock: 19,
      monthlySales: 178,
      turnoverRate: 9.37,
      daysInStock: 3.2,
      status: "excelente",
      entryDate: "2024-02-12",
      salesStartDate: "2024-02-13",
      salesEndDate: "2024-03-07",
      daysToSell: 23,
      restockHistory: [
        { date: "2024-02-12", quantity: 80, type: "initial" },
        { date: "2024-02-25", quantity: 60, type: "restock" }
      ],
      needsRestock: true,
      lastRestockDate: "2024-02-25",
      suggestedRestockDate: "2024-03-10",
      suggestedRestockQuantity: 50
    },
    {
      id: 5,
      name: "Esmeril angular",
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas eléctricas",
      currentStock: 8,
      monthlySales: 67,
      turnoverRate: 8.38,
      daysInStock: 3.6,
      status: "bueno",
      entryDate: "2024-02-08",
      salesStartDate: "2024-02-09",
      salesEndDate: "2024-03-07",
      daysToSell: 27,
      restockHistory: [
        { date: "2024-02-08", quantity: 40, type: "initial" },
        { date: "2024-02-22", quantity: 25, type: "restock" }
      ],
      needsRestock: true,
      lastRestockDate: "2024-02-22",
      suggestedRestockDate: "2024-03-08",
      suggestedRestockQuantity: 20
    },
    {
      id: 6,
      name: "Cinta métrica",
      image: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?auto=format&fit=crop&w=300&q=80",
      category: "Herramientas manuales",
      currentStock: 120,
      monthlySales: 45,
      turnoverRate: 0.38,
      daysInStock: 80,
      status: "critico",
      entryDate: "2023-12-15",
      salesStartDate: "2023-12-16",
      salesEndDate: "2024-03-07",
      daysToSell: 82,
      restockHistory: [
        { date: "2023-12-15", quantity: 150, type: "initial" }
      ],
      needsRestock: false,
      lastRestockDate: "2023-12-15",
      suggestedRestockDate: "No aplica",
      suggestedRestockQuantity: 0,
      alertMessage: "Producto de baja rotación - 80 días en inventario"
    }
  ];

//--------------------------------------
//ROTACION DE PRODUCTOS
//--------------------------------------

  const categories = ["all", ...new Set(inventoryData.map(p => p.category))];
  const products = ["all", ...inventoryData.map(p => p.name)];
  const restockStatuses = [
    { value: "all", label: "Todos" },
    { value: "needsRestock", label: "Necesitan reabastecimiento" },
    { value: "stocked", label: "Stock suficiente" },
    { value: "highTurnover", label: "Alta rotación" },
    { value: "lowTurnover", label: "Baja rotación" }
  ];

  const updateActiveFiltersCount = () => {
    let count = 0;
    if (selectedProduct !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedRestockStatus !== "all") count++;
    if (startDate) count++;
    if (endDate) count++;
    setActiveFiltersCount(count);
  };

  const clearAllFilters = () => {
    setSelectedProduct("all");
    setSelectedCategory("all");
    setSelectedRestockStatus("all");
    setStartDate("");
    setEndDate("");
    setActiveFiltersCount(0);
  };

  const getFilteredProducts = () => {
    let filtered = [...inventoryData];

    if (selectedProduct !== "all") {
      filtered = filtered.filter(p => p.name === selectedProduct);
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedRestockStatus !== "all") {
      if (selectedRestockStatus === "needsRestock") {
        filtered = filtered.filter(p => p.needsRestock === true);
      } else if (selectedRestockStatus === "stocked") {
        filtered = filtered.filter(p => p.needsRestock === false && p.status !== "critico");
      } else if (selectedRestockStatus === "highTurnover") {
        filtered = filtered.filter(p => p.turnoverRate >= 8 || p.status === "excelente");
      } else if (selectedRestockStatus === "lowTurnover") {
        filtered = filtered.filter(p => p.status === "critico" || p.turnoverRate < 1);
      }
    }

    if (startDate) {
      filtered = filtered.filter(p => p.entryDate >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(p => p.entryDate <= endDate);
    }

    return filtered;
  };

  useEffect(() => {
    updateActiveFiltersCount();
  }, [selectedProduct, selectedCategory, selectedRestockStatus, startDate, endDate]);

  const filteredProducts = getFilteredProducts();

  const averageTurnover = filteredProducts.length
    ? filteredProducts.reduce((sum, p) => sum + p.turnoverRate, 0) / filteredProducts.length
    : 0;
  const averageDaysInStock = filteredProducts.length
    ? filteredProducts.reduce((sum, p) => sum + p.daysInStock, 0) / filteredProducts.length
    : 0;
  const criticalStockCount = filteredProducts.filter(p => p.status === "critico").length;
  const needsRestockCount = filteredProducts.filter(p => p.needsRestock === true).length;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excelente": return { bg: "#D1FAE5", text: "#065F46", label: "✅ Excelente" };
      case "bueno": return { bg: "#FEF3C7", text: "#92400E", label: "⚠️ Bueno" };
      case "critico": return { bg: "#FEE2E2", text: "#991B1B", label: "🔴 Crítico" };
      default: return { bg: "#F3F4F6", text: "#6B7280", label: "❓ Desconocido" };
    }
  };

  const toggleProductDetails = (productId) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const highTurnoverCount = filteredProducts.filter(p => p.turnoverRate >= 8 || p.status === "excelente").length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
            Filtros de inventario
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                <label className="text-xs font-medium text-gray-600 mb-2 block">🔄 Estado reabastecimiento</label>
                <select
                  value={selectedRestockStatus}
                  onChange={(e) => setSelectedRestockStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                >
                  {restockStatuses.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📅 Ingreso desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ borderColor: "#D6D0C4" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">📅 Ingreso hasta</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
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
                {selectedRestockStatus !== "all" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                    {restockStatuses.find(s => s.value === selectedRestockStatus)?.label}
                    <button onClick={() => setSelectedRestockStatus("all")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {startDate && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    📅 Desde: {formatDate(startDate)}
                    <button onClick={() => setStartDate("")} className="hover:text-red-500">×</button>
                  </span>
                )}
                {endDate && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                    📅 Hasta: {formatDate(endDate)}
                    <button onClick={() => setEndDate("")} className="hover:text-red-500">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl p-3 text-center bg-white shadow-sm">
          <p className="text-2xl font-bold text-green-600">{averageTurnover.toFixed(1)}x</p>
          <p className="text-xs text-gray-500">Rotación promedio</p>
        </div>
        <div className="rounded-xl p-3 text-center bg-white shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{averageDaysInStock.toFixed(0)} días</p>
          <p className="text-xs text-gray-500">Días promedio en stock</p>
        </div>
        <div className="rounded-xl p-3 text-center bg-white shadow-sm">
          <p className="text-2xl font-bold text-yellow-600">{criticalStockCount}</p>
          <p className="text-xs text-gray-500">Productos con stock crítico</p>
        </div>
        <div className="rounded-xl p-3 text-center bg-white shadow-sm">
          <p className="text-2xl font-bold text-red-600">{needsRestockCount}</p>
          <p className="text-xs text-gray-500">Necesitan reabastecimiento</p>
        </div>
      </div>

      <div className="rounded-xl p-4 shadow-sm bg-white">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <PackageIcon className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />
          Rotación de inventario
          <span className="text-xs font-normal text-gray-400 ml-2">
            ({filteredProducts.length} productos)
          </span>
        </h3>

        {filteredProducts.length === 0 ? (
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
            {filteredProducts.map(product => {
              const statusColors = getStatusColor(product.status);

              return (
                <div key={product.id} className="p-4 rounded-xl border hover:shadow-md transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <img src={product.image} alt={product.name} className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="font-bold text-base">{product.name}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{product.category}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: statusColors.bg, color: statusColors.text }}>
                              {statusColors.label}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">Stock actual: {product.currentStock} unidades</p>
                          {product.needsRestock && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">⚠️ Requiere reabastecimiento</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-500">Stock actual</p>
                      <p className="font-bold text-lg">{product.currentStock}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-50">
                      <p className="text-xs text-blue-600">Ventas/mes</p>
                      <p className="font-bold text-blue-600">{product.monthlySales}</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-green-50">
                      <p className="text-xs text-green-600">Rotación</p>
                      <p className="font-bold text-green-600">{product.turnoverRate}x</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-yellow-50">
                      <p className="text-xs text-yellow-600">Días en stock</p>
                      <p className="font-bold text-yellow-600">{product.daysInStock}</p>
                    </div>
                  </div>

                  <ProgressBar value={product.turnoverRate} max={10} color={PALETTE.sizzlingSunrise} label="Rotación (vs óptimo 10x)" />

                  <button
                    type="button"
                    onClick={() => toggleProductDetails(product.id)}
                    className="mt-4 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: "#D6D0C4", color: PALETTE.maastrichtBlue }}
                  >
                    <span className="flex items-center gap-2">
                      {expandedProducts[product.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      {expandedProducts[product.id] ? "Ocultar etiquetas e historial" : "Ver etiquetas e historial"}
                    </span>
                    <span className="text-xs text-gray-500">
                      Inventario · Reabastecimiento · Alertas
                    </span>
                  </button>

                  {expandedProducts[product.id] && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border p-3" style={{ borderColor: "#D6D0C4" }}>
                        <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-700">
                          <PackageIcon className="h-3 w-3" style={{ color: PALETTE.sizzlingSunrise }} />
                          Etiquetas operativas
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className="rounded-full px-2 py-1 text-xs font-semibold"
                            style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                          >
                            {statusColors.label}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              product.turnoverRate >= 8
                                ? "bg-green-100 text-green-700"
                                : product.turnoverRate < 1
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {product.turnoverRate >= 8
                              ? "🚀 Alta rotación"
                              : product.turnoverRate < 1
                              ? "🐢 Baja rotación"
                              : "⚖️ Rotación media"}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              product.needsRestock
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {product.needsRestock ? "⚠️ Reabastecer" : "✅ Stock suficiente"}
                          </span>

                          {product.alertMessage && (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                              Alerta activa
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t" style={{ borderColor: "#D6D0C4" }}>
                        <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" style={{ color: PALETTE.sizzlingSunrise }} />
                          📅 Historial de inventario
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="p-2 rounded-lg bg-gray-50">
                            <p className="text-xs text-gray-500">Fecha de ingreso</p>
                            <p className="font-medium text-sm">{formatDate(product.entryDate)}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-gray-50">
                            <p className="text-xs text-gray-500">Tiempo en venderse</p>
                            <p className="font-medium text-sm">{product.daysToSell} días</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg" style={{ backgroundColor: product.needsRestock ? "#FEF3C7" : "#D1FAE5" }}>
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <RefreshCw className="h-3 w-3" />
                          🔄 Historial de reabastecimiento
                        </p>
                        <div className="space-y-1">
                          {product.restockHistory.map((restock, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span>{restock.type === "initial" ? "📦 Ingreso inicial:" : "🚚 Reabastecimiento:"}</span>
                              <span>{formatDate(restock.date)}</span>
                              <span className="font-medium">{restock.quantity} unidades</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold">Último reabastecimiento:</span>
                            <span>{formatDate(product.lastRestockDate)}</span>
                          </div>
                          {product.needsRestock ? (
                            <div className="mt-2 p-2 rounded bg-red-100">
                              <p className="text-xs text-red-700 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                ⚠️ ¡Requiere reabastecimiento! Stock actual: {product.currentStock} unidades
                              </p>
                              <p className="text-xs text-red-600 mt-1">
                                Cantidad sugerida: {product.suggestedRestockQuantity} unidades para {formatDate(product.suggestedRestockDate)}
                              </p>
                            </div>
                          ) : (
                            <div className="mt-2 p-2 rounded bg-green-100">
                              <p className="text-xs text-green-700 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                ✅ Stock suficiente. Próximo reabastecimiento sugerido: {formatDate(product.suggestedRestockDate)}
                              </p>
                            </div>
                          )}
                          {product.alertMessage && (
                            <div className="mt-2 p-2 rounded bg-yellow-100">
                              <p className="text-xs text-yellow-700 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {product.alertMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {needsRestockCount > 0 && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-red-800">Productos pendientes de reabastecimiento</p>
              <p className="text-xs text-red-700 mt-1">
                Hay <strong>{needsRestockCount}</strong> producto(s) que requieren reabastecimiento urgente.
                Revisa la lista arriba para ver las cantidades sugeridas.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeFiltersCount > 0 && filteredProducts.length > 0 && (
        <div className="rounded-xl p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-blue-800">Resumen de filtros aplicados</p>
              <p className="text-xs text-blue-700 mt-1">
                Mostrando {filteredProducts.length} producto(s). Rotación promedio: {averageTurnover.toFixed(1)}x,
                Días en stock: {averageDaysInStock.toFixed(0)} días.
                {needsRestockCount > 0 ? ` ${needsRestockCount} producto(s) necesitan reabastecimiento.` : " Todos los productos tienen stock suficiente."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};