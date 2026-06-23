/* eslint-disable no-unused-vars */
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

import { KPICard, ProgressBar, AlertCard, SimulationCard } from "../components/shared";

export default function NaturalUserDashboard({ userData, onBack, onLogout, favorites: externalFavorites, isFavorite: externalIsFavorite, onToggleFavorite, addToCartFromStore }) {
  const [activeTab, setActiveTab] = useState("history");
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const [localFavorites, setLocalFavorites] = useState([]);
  const [favoritesSearchTerm, setFavoritesSearchTerm] = useState("");
  const [favoritesCategoryFilter, setFavoritesCategoryFilter] = useState("all");
  const [showFavoritesFilters, setShowFavoritesFilters] = useState(false);

  const PALETTE = {
    spaceCadet: "#1B3149",
    pastelGray: "#D6D0C4",
    crystalBlue: "#6E98AF",
    sizzlingSunrise: "#FEDC00",
    maastrichtBlue: "#091A2D",
    page: "#F3F1EC",
    white: "#FFFFFF",
  };

  const [availableProducts, setAvailableProducts] = useState([
    { id: 1, name: "Taladro percutor profesional", price: 4500, originalPrice: 5200, discount: 13, category: "Herramientas eléctricas", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80", seller: "Ferretería El Constructor", sellerType: "Detallista", rating: 4.8, reviews: 234, stock: 15, description: "Taladro percutor de alta potencia ideal para trabajos profesionales.", features: ["Potencia 800W", "Velocidad variable", "Mandril de 13mm", "Incluye maletín"] },
    { id: 2, name: "Juego de llaves combinadas", price: 1850, originalPrice: 2200, discount: 16, category: "Herramientas manuales", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80", seller: "Distribuidora Industrial", sellerType: "Mayorista", rating: 4.6, reviews: 189, stock: 45, description: "Juego completo de llaves combinadas en acero cromo-vanadio.", features: ["8-19mm", "Acabado cromado", "Estuche organizador", "Resistencia superior"] },
    { id: 3, name: "Guantes anticorte nivel 5", price: 450, originalPrice: 550, discount: 18, category: "Equipo de protección", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=300&q=80", seller: "Protege+", sellerType: "Detallista", rating: 4.9, reviews: 456, stock: 120, description: "Guantes de protección anticorte nivel 5, ideales para trabajos con vidrio y metal.", features: ["Nivel 5 de protección", "Agarre antideslizante", "Resistentes a abrasión", "Lavables"] },
    { id: 4, name: "Casco seguridad premium", price: 580, originalPrice: 750, discount: 23, category: "Equipo de protección", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80", seller: "Seguridad Total", sellerType: "Mayorista", rating: 4.7, reviews: 312, stock: 78, description: "Casco de seguridad industrial con ajuste fácil y ventilación integrada.", features: ["Ajuste de talla", "Ventilación 4 puntos", "Resistente a impactos", "Color blanco"] },
    { id: 5, name: "Esmeril angular 7\"", price: 3200, originalPrice: 3800, discount: 16, category: "Herramientas eléctricas", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=300&q=80", seller: "Ferretería El Constructor", sellerType: "Detallista", rating: 4.5, reviews: 178, stock: 8, description: "Esmeril angular profesional, ideal para corte y desbaste de metal.", features: ["Potencia 2200W", "Disco 7 pulgadas", "Arranque suave", "Protección ajustable"] },
    { id: 6, name: "Cinta métrica láser", price: 1200, originalPrice: 1500, discount: 20, category: "Herramientas de medición", image: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?auto=format&fit=crop&w=300&q=80", seller: "Distribuidora Industrial", sellerType: "Mayorista", rating: 4.8, reviews: 95, stock: 25, description: "Cinta métrica láser con pantalla LCD, precisión milimétrica.", features: ["Alcance 40m", "Precisión ±2mm", "Pantalla LCD", "Memoria de medidas"] }
  ]);

  const [purchaseHistory, setPurchaseHistory] = useState([
    { id: 1, orderNumber: "ORD-2024-001", date: "15/03/2024", total: 12500, status: "delivered", paymentMethod: "Transferencia bancaria", paymentStatus: "Pagado", shippingAddress: "Av. Principal #123, Centro, Ciudad", trackingNumber: "TRK-123456789", estimatedDelivery: "20/03/2024", items: [{ productId: 1, name: "Taladro percutor profesional", quantity: 2, unitPrice: 4500, total: 9000 }], timeline: [{ date: "15/03/2024", status: "Pedido confirmado", completed: true }, { date: "16/03/2024", status: "En preparación", completed: true }, { date: "17/03/2024", status: "Enviado", completed: true }, { date: "20/03/2024", status: "Entregado", completed: true }] },
    { id: 2, orderNumber: "ORD-2024-002", date: "28/02/2024", total: 5400, status: "delivered", paymentMethod: "Tarjeta de crédito", paymentStatus: "Pagado", shippingAddress: "Calle Comercio #45, Norte, Ciudad", trackingNumber: "TRK-987654321", estimatedDelivery: "05/03/2024", items: [{ productId: 3, name: "Guantes anticorte nivel 5", quantity: 3, unitPrice: 450, total: 1350 }], timeline: [{ date: "28/02/2024", status: "Pedido confirmado", completed: true }, { date: "29/02/2024", status: "En preparación", completed: true }, { date: "01/03/2024", status: "Enviado", completed: true }, { date: "05/03/2024", status: "Entregado", completed: true }] }
  ]);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  useEffect(() => {
    try {
      const savedPurchases = JSON.parse(localStorage.getItem("userPurchaseHistory") || "[]");
      if (!Array.isArray(savedPurchases) || savedPurchases.length === 0) return;

      const formattedPurchases = savedPurchases.map((order, index) => ({
        id: `local-${order.id || index}`,
        orderNumber: order.orderNumber || order.id || `ORD-${Date.now()}-${index}`,
        date: order.date || new Date(order.createdAt || Date.now()).toLocaleDateString("es-ES"),
        total: Number(order.total || 0),
        status: order.status || "processing",
        paymentMethod: order.paymentMethod || "Pago reportado",
        paymentStatus: order.paymentStatus || "En validación",
        shippingAddress: order.shippingAddress || userData.address || "Retiro en tienda",
        trackingNumber: order.trackingNumber || null,
        estimatedDelivery: order.estimatedDelivery || "En validación",
        items: Array.isArray(order.items)
          ? order.items.map((item) => ({
              productId: item.id || item.productId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice || item.price,
              total: item.total || Number(item.price || item.unitPrice || 0) * Number(item.quantity || 1),
            }))
          : [],
        timeline: [
          { date: order.date || new Date(order.createdAt || Date.now()).toLocaleDateString("es-ES"), status: "Pago reportado", completed: true },
          { date: "Pendiente", status: "Validación del vendedor", completed: false },
        ],
      }));

      setPurchaseHistory((prev) => {
        const existing = new Set(prev.map((item) => item.orderNumber));
        const fresh = formattedPurchases.filter((item) => !existing.has(item.orderNumber));
        return [...fresh, ...prev];
      });
    } catch (error) {
      console.error("No se pudo cargar el historial de compras local:", error);
    }
  }, [userData.address]);

  useEffect(() => {
    if (externalFavorites) return;
    const savedFavorites = localStorage.getItem("userFavorites");
    if (savedFavorites) setLocalFavorites(JSON.parse(savedFavorites));
  }, [externalFavorites]);

  const favorites = externalFavorites || localFavorites;
  const setFavorites = (updater) => {
    if (externalFavorites) return;
    setLocalFavorites(updater);
  };

  useEffect(() => {
    if (externalFavorites) return;
    localStorage.setItem("userFavorites", JSON.stringify(localFavorites));
  }, [externalFavorites, localFavorites]);

  useEffect(() => {
    setCartQuantity(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart]);

  const categories = ["all", ...new Set(availableProducts.map(p => p.category))];
  const priceRanges = [{ value: "all", label: "Todos los precios" }, { value: "under1000", label: "Menos de $1,000" }, { value: "1000to3000", label: "$1,000 - $3,000" }, { value: "3000to5000", label: "$3,000 - $5,000" }, { value: "over5000", label: "Más de $5,000" }];
  const sortOptions = [{ value: "relevance", label: "Relevancia" }, { value: "priceAsc", label: "Menor precio" }, { value: "priceDesc", label: "Mayor precio" }, { value: "rating", label: "Mejor calificación" }, { value: "discount", label: "Mayor descuento" }];
  const orderStatuses = [{ value: "all", label: "Todos" }, { value: "pending", label: "Pendiente" }, { value: "processing", label: "En proceso" }, { value: "shipped", label: "Enviado" }, { value: "delivered", label: "Entregado" }, { value: "cancelled", label: "Cancelado" }];
  const statusConfig = { pending: { label: "Pendiente", icon: "⏳", color: "bg-yellow-100 text-yellow-700" }, processing: { label: "En proceso", icon: "🔄", color: "bg-blue-100 text-blue-700" }, shipped: { label: "Enviado", icon: "🚚", color: "bg-purple-100 text-purple-700" }, delivered: { label: "Entregado", icon: "📦", color: "bg-green-100 text-green-700" }, cancelled: { label: "Cancelado", icon: "❌", color: "bg-red-100 text-red-700" } };


  const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  const formatCurrency = (value) => toNumber(value).toLocaleString('es-DO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const getProductPrice = (product) => toNumber(product?.price ?? product?.currentPrice ?? product?.unitPrice);
  const getProductOriginalPrice = (product) => {
    const price = getProductPrice(product);
    return toNumber(product?.originalPrice ?? product?.oldPrice ?? product?.regularPrice, price);
  };
  const getProductDiscount = (product) => {
    if (product?.discount !== undefined) return toNumber(product.discount);
    const price = getProductPrice(product);
    const originalPrice = getProductOriginalPrice(product);
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const normalizeProduct = (product = {}) => ({
    ...product,
    name: product.name || 'Producto sin nombre',
    price: getProductPrice(product),
    originalPrice: getProductOriginalPrice(product),
    discount: getProductDiscount(product),
    seller: product.seller || product.sellerName || product.store || 'TuherramientaOnline',
    sellerType: product.sellerType || product.sellerRole || 'Vendedor',
    rating: toNumber(product.rating, 0),
    reviews: toNumber(product.reviews, 0),
    stock: toNumber(product.stock, 0),
    category: product.category || 'Sin categoría',
    image: product.image || 'https://images.unsplash.com/photo-1581147036324-c1c0a5b3c6a4?auto=format&fit=crop&w=600&q=80',
    description: product.description || 'Producto disponible en tienda.',
    features: Array.isArray(product.features) ? product.features : []
  });

  const getFilteredProducts = () => {
    let filtered = [...availableProducts];
    if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.seller.toLowerCase().includes(searchTerm.toLowerCase()));
    if (categoryFilter !== "all") filtered = filtered.filter(p => p.category === categoryFilter);
    if (priceRange !== "all") filtered = filtered.filter(p => { if (priceRange === "under1000") return p.price < 1000; if (priceRange === "1000to3000") return p.price >= 1000 && p.price <= 3000; if (priceRange === "3000to5000") return p.price >= 3000 && p.price <= 5000; if (priceRange === "over5000") return p.price > 5000; return true; });
    if (sortBy === "priceAsc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "priceDesc") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "discount") filtered.sort((a, b) => b.discount - a.discount);
    return filtered;
  };

  const getFilteredHistory = () => {
    let filtered = [...purchaseHistory];
    if (historySearchTerm) filtered = filtered.filter(o => o.orderNumber.toLowerCase().includes(historySearchTerm.toLowerCase()));
    if (historyStatusFilter !== "all") filtered = filtered.filter(o => o.status === historyStatusFilter);
    if (historyStartDate) filtered = filtered.filter(o => { const [day, month, year] = o.date.split('/'); return new Date(`${year}-${month}-${day}`) >= new Date(historyStartDate); });
    if (historyEndDate) filtered = filtered.filter(o => { const [day, month, year] = o.date.split('/'); return new Date(`${year}-${month}-${day}`) <= new Date(historyEndDate); });
    return filtered;
  };

  const getFilteredFavorites = () => {
    let filtered = [...favorites].map(normalizeProduct);
    if (favoritesSearchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(favoritesSearchTerm.toLowerCase()) || p.seller.toLowerCase().includes(favoritesSearchTerm.toLowerCase()));
    if (favoritesCategoryFilter !== "all") filtered = filtered.filter(p => p.category === favoritesCategoryFilter);
    return filtered;
  };

  const addToFavorites = (product) => {
    if (onToggleFavorite) {
      if (!externalIsFavorite?.(product.id)) onToggleFavorite(normalizeProduct(product));
      return;
    }
    if (!favorites.some(f => String(f.id) === String(product.id))) setFavorites([normalizeProduct(product), ...favorites]);
  };
  const removeFromFavorites = (productId) => {
    if (onToggleFavorite) {
      const product = favorites.find(p => String(p.id) === String(productId));
      if (product) onToggleFavorite(product);
      return;
    }
    setFavorites(favorites.filter(p => String(p.id) !== String(productId)));
  };
  const isFavorite = (productId) => externalIsFavorite ? externalIsFavorite(productId) : favorites.some(f => String(f.id) === String(productId));

  const addToCart = (product, quantity = 1) => {
    const safeProduct = normalizeProduct(product);
    if (addToCartFromStore) {
      addToCartFromStore(safeProduct, quantity);
      return;
    }
    const existingItem = cart.find(item => item.id === safeProduct.id);
    if (existingItem) setCart(cart.map(item => item.id === safeProduct.id ? { ...item, quantity: item.quantity + quantity } : item));
    else setCart([...cart, { ...safeProduct, quantity }]);
    alert(`🛒 ${quantity}x ${safeProduct.name} agregado al carrito`);
  };

  const removeFromCart = (productId) => setCart(cart.filter(item => item.id !== productId));
  const updateCartQuantity = (productId, newQuantity) => { if (newQuantity <= 0) removeFromCart(productId); else setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)); };
  const getCartTotal = () => cart.reduce((sum, item) => sum + (getProductPrice(item) * toNumber(item.quantity, 1)), 0);

  const checkout = () => {
    if (cart.length === 0) { alert("⚠️ Tu carrito está vacío"); return; }
    const newOrder = { id: purchaseHistory.length + 1, orderNumber: `ORD-2024-${String(purchaseHistory.length + 1).padStart(3, '0')}`, date: new Date().toLocaleDateString('es-ES'), total: getCartTotal(), status: "processing", paymentMethod: "Pendiente", paymentStatus: "Pendiente", shippingAddress: userData.address || "Por definir", trackingNumber: null, estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'), items: cart.map(item => ({ productId: item.id, name: item.name, quantity: item.quantity, unitPrice: getProductPrice(item), total: getProductPrice(item) * toNumber(item.quantity, 1) })), timeline: [{ date: new Date().toLocaleDateString('es-ES'), status: "Pedido confirmado", completed: true }, { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'), status: "En preparación", completed: false }] };
    setPurchaseHistory([newOrder, ...purchaseHistory]);
    alert(`✅ Pedido ${newOrder.orderNumber} creado exitosamente. Total: $${formatCurrency(newOrder.total)}`);
    setCart([]);
    setShowCart(false);
  };

  const handleViewDetail = (order) => { setSelectedOrder(order); setShowOrderDetail(true); };
  const formatDate = (dateString) => { if (!dateString) return "N/A"; const date = new Date(dateString); return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }); };

  const filteredProducts = getFilteredProducts();
  const filteredHistory = getFilteredHistory();
  const filteredFavorites = getFilteredFavorites();

  const tabs = [
    { id: "history", label: "Historial de Compras", icon: History },
    { id: "favorites", label: "Favoritos", icon: Heart, badge: favorites.length }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10"><ArrowLeft className="h-5 w-5" /><span>Volver a la tienda</span></button>
              <div className="h-8 w-px bg-white/20" /><div><p className="text-xs text-white/70">Dashboard</p><p className="text-sm font-semibold text-white">Usuario Natural</p></div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onLogout} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10"><LogOut className="h-5 w-5" /><span>Cerrar sesión</span></button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="relative mb-6 overflow-hidden rounded-3xl" style={{ backgroundColor: PALETTE.spaceCadet }}>
          <div className="relative z-10 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}><User className="h-10 w-10" style={{ color: PALETTE.maastrichtBlue }} /></div>
              <div className="text-center md:text-left"><h1 className="text-2xl font-bold">{userData.name}</h1><p className="text-sm opacity-90">{userData.userType}</p><div className="flex items-center gap-2 mt-1 text-xs opacity-75"><Calendar className="h-3 w-3" /><span>Miembro desde {userData.memberSince}</span></div></div>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10"><Package className="h-full w-full" /></div>
        </div>

        <div className="mb-5 flex gap-1 border-b overflow-x-auto" style={{ borderColor: PALETTE.pastelGray }}>
          {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "border-b-2" : "opacity-60 hover:opacity-100"}`} style={{ borderColor: activeTab === tab.id ? PALETTE.sizzlingSunrise : "transparent", color: PALETTE.maastrichtBlue }}><tab.icon className="h-4 w-4" />{tab.label}{tab.badge > 0 && (<span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">{tab.badge}</span>)}</button>))}
        </div>

        {/* TAB 1: COMPRAS */}
        {activeTab === "purchases" && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm flex items-center gap-2"><Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Filtros de búsqueda</h3><button onClick={() => setShowFilters(!showFilters)} className="text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all" style={{ backgroundColor: showFilters ? PALETTE.sizzlingSunrise : "#F3F4F6", color: showFilters ? "#091A2D" : "#6B7280" }}>{showFilters ? "Ocultar filtros ↑" : "Mostrar filtros ↓"}</button></div>
              {showFilters && (<div className="space-y-4"><div><label className="text-xs font-medium text-gray-600 mb-2 block">🔍 Buscar productos o vendedores</label><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: "#6E98AF" }} /><input type="text" placeholder="Ej: Taladro, guantes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }} /></div></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div><label className="text-xs font-medium text-gray-600 mb-2 block">📂 Categoría</label><select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4" }}><option value="all">Todas las categorías</option>{categories.filter(c => c !== "all").map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div><div><label className="text-xs font-medium text-gray-600 mb-2 block">💰 Rango de precio</label><select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4" }}>{priceRanges.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div><div><label className="text-xs font-medium text-gray-600 mb-2 block">🔄 Ordenar por</label><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4" }}>{sortOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div><div className="flex items-end">{(searchTerm || categoryFilter !== "all" || priceRange !== "all" || sortBy !== "relevance") && (<button onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setPriceRange("all"); setSortBy("relevance"); }} className="w-full text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 transition-all border border-red-200"><X className="h-3 w-3" />Limpiar filtros</button>)}</div></div></div>)}
            </div>
            <div className="flex justify-between items-center"><p className="text-sm text-gray-500">Mostrando <strong>{filteredProducts.length}</strong> de <strong>{availableProducts.length}</strong> productos</p></div>
            <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold mb-4 flex items-center gap-2"><ShoppingBag className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Productos disponibles</h3>
              {filteredProducts.length === 0 ? (<div className="text-center py-8 text-gray-500"><Package className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No hay productos que coincidan con los filtros seleccionados</p></div>) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map(product => (<div key={product.id} className="rounded-xl border hover:shadow-md transition-all overflow-hidden"><img src={product.image} alt={product.name} className="w-full h-40 object-cover" /><div className="p-4"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-base">{product.name}</h4><button onClick={() => isFavorite(product.id) ? removeFromFavorites(product.id) : addToFavorites(product)} className="p-1 rounded-full hover:bg-gray-100"><Heart className={`h-5 w-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} /></button></div><div className="flex items-center gap-2 mb-2"><div className="flex items-center"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-xs ml-1">{product.rating}</span></div><span className="text-xs text-gray-400">({product.reviews} reviews)</span><span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">Stock: {product.stock}</span></div><p className="text-xs text-gray-500 mb-2">{product.seller} • {product.sellerType}</p><div className="flex items-center gap-2 mb-3"><span className="text-xl font-bold text-green-600">${formatCurrency(getProductPrice(product))}</span><span className="text-sm text-gray-400 line-through">${formatCurrency(getProductOriginalPrice(product))}</span><span className="text-xs text-red-500">{getProductDiscount(product) > 0 ? `-${getProductDiscount(product)}%` : ""}</span></div><div className="flex gap-2"><button onClick={() => addToCart(product, 1)} className="flex-1 text-sm py-2 rounded-lg bg-yellow-400 font-semibold hover:bg-yellow-500 transition-colors">Agregar al carrito</button><button onClick={() => { setSelectedProduct(product); setShowProductDetail(true); }} className="text-sm px-3 py-2 rounded-lg bg-gray-100 font-semibold hover:bg-gray-200 transition-colors">Ver detalles</button></div></div></div>))}</div>)}
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIAL DE COMPRAS */}
        {activeTab === "history" && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm flex items-center gap-2"><Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Filtros de historial</h3><button onClick={() => setShowHistoryFilters(!showHistoryFilters)} className="text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all" style={{ backgroundColor: showHistoryFilters ? PALETTE.sizzlingSunrise : "#F3F4F6", color: showHistoryFilters ? "#091A2D" : "#6B7280" }}>{showHistoryFilters ? "Ocultar filtros ↑" : "Mostrar filtros ↓"}</button></div>
              {showHistoryFilters && (<div className="space-y-4"><div><label className="text-xs font-medium text-gray-600 mb-2 block">🔍 Buscar por número de orden</label><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: "#6E98AF" }} /><input type="text" placeholder="Ej: ORD-2024-001..." value={historySearchTerm} onChange={(e) => setHistorySearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }} /></div></div><div className="grid gap-4 sm:grid-cols-3"><div><label className="text-xs font-medium text-gray-600 mb-2 block">📊 Estado del pedido</label><select value={historyStatusFilter} onChange={(e) => setHistoryStatusFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4" }}>{orderStatuses.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div><div><label className="text-xs font-medium text-gray-600 mb-2 block">📅 Fecha desde</label><input type="date" value={historyStartDate} onChange={(e) => setHistoryStartDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4" }} /></div><div><label className="text-xs font-medium text-gray-600 mb-2 block">📅 Fecha hasta</label><input type="date" value={historyEndDate} onChange={(e) => setHistoryEndDate(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4" }} /></div></div>{(historySearchTerm || historyStatusFilter !== "all" || historyStartDate || historyEndDate) && (<div className="flex justify-end"><button onClick={() => { setHistorySearchTerm(""); setHistoryStatusFilter("all"); setHistoryStartDate(""); setHistoryEndDate(""); }} className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 text-red-600 hover:bg-red-50 transition-all"><X className="h-3 w-3" />Limpiar filtros</button></div>)}</div>)}
            </div>
            <div className="flex justify-between items-center"><p className="text-sm text-gray-500">Mostrando <strong>{filteredHistory.length}</strong> de <strong>{purchaseHistory.length}</strong> pedidos</p></div>
            <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold mb-4 flex items-center gap-2"><History className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Historial de compras realizadas</h3>
              {filteredHistory.length === 0 ? (<div className="text-center py-8 text-gray-500"><Package className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No hay pedidos que coincidan con los filtros seleccionados</p></div>) : (<div className="space-y-4">{filteredHistory.map(order => { const status = statusConfig[order.status]; return (<div key={order.id} className="p-4 rounded-xl border hover:shadow-md transition-all"><div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3"><div><div className="flex items-center gap-3 flex-wrap"><p className="font-bold text-lg">{order.orderNumber}</p><span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.icon} {status.label}</span></div><p className="text-xs text-gray-500 mt-1">Fecha: {order.date}</p></div><div className="text-right"><p className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>${formatCurrency(order.total)}</p><p className="text-xs text-gray-500">{order.paymentMethod} • {order.paymentStatus}</p></div></div><div className="border-t border-b py-2 my-2"><p className="text-xs text-gray-500 mb-1">Productos:</p><div className="flex flex-wrap gap-2">{order.items.map((item, idx) => (<span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{item.quantity}x {item.name}</span>))}</div></div><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2"><div className="flex gap-4 text-xs text-gray-500">{order.trackingNumber && (<span className="flex items-center gap-1"><Truck className="h-3 w-3" />Guía: {order.trackingNumber}</span>)}<span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />Entrega estimada: {order.estimatedDelivery}</span></div><button onClick={() => handleViewDetail(order)} className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all" style={{ backgroundColor: "#F3F4F6", color: "#091A2D" }}><Eye className="h-3 w-3" />Ver detalles</button></div></div>); })}</div>)}
            </div>
          </div>
        )}

        {/* TAB 3: FAVORITOS */}
        {activeTab === "favorites" && (
          <div className="space-y-5">
            <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#FFFFFF" }}>
              <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm flex items-center gap-2"><Filter className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Filtros de favoritos</h3><button onClick={() => setShowFavoritesFilters(!showFavoritesFilters)} className="text-xs px-3 py-1 rounded-lg flex items-center gap-1 transition-all" style={{ backgroundColor: showFavoritesFilters ? PALETTE.sizzlingSunrise : "#F3F4F6", color: showFavoritesFilters ? "#091A2D" : "#6B7280" }}>{showFavoritesFilters ? "Ocultar filtros ↑" : "Mostrar filtros ↓"}</button></div>
              {showFavoritesFilters && (<div className="space-y-4"><div><label className="text-xs font-medium text-gray-600 mb-2 block">🔍 Buscar en favoritos</label><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: "#6E98AF" }} /><input type="text" placeholder="Buscar producto..." value={favoritesSearchTerm} onChange={(e) => setFavoritesSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4", backgroundColor: "#FFFFFF" }} /></div></div><div className="flex gap-4"><div className="flex-1"><label className="text-xs font-medium text-gray-600 mb-2 block">📂 Categoría</label><select value={favoritesCategoryFilter} onChange={(e) => setFavoritesCategoryFilter(e.target.value)} className="w-full px-3 py-2 rounded-xl border text-sm" style={{ borderColor: "#D6D0C4" }}><option value="all">Todas las categorías</option>{categories.filter(c => c !== "all").map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>{(favoritesSearchTerm || favoritesCategoryFilter !== "all") && (<div className="flex items-end"><button onClick={() => { setFavoritesSearchTerm(""); setFavoritesCategoryFilter("all"); }} className="text-xs px-3 py-2 rounded-lg flex items-center gap-1 text-red-600 hover:bg-red-50 transition-all border border-red-200"><X className="h-3 w-3" />Limpiar</button></div>)}</div></div>)}
            </div>
            <div className="flex justify-between items-center"><p className="text-sm text-gray-500">{favorites.length} producto(s) en favoritos{filteredFavorites.length !== favorites.length && ` • Mostrando ${filteredFavorites.length}`}</p></div>
            <div className="rounded-xl p-4 shadow-sm bg-white"><h3 className="font-bold mb-4 flex items-center gap-2"><Heart className="h-4 w-4" style={{ color: PALETTE.sizzlingSunrise }} />Mis productos favoritos</h3>
              {favorites.length === 0 ? (<div className="text-center py-8 text-gray-500"><Heart className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No tienes productos en favoritos</p><p className="text-xs mt-1">Agrega productos a favoritos haciendo clic en el corazón ❤️</p></div>) : filteredFavorites.length === 0 ? (<div className="text-center py-8 text-gray-500"><Package className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>No hay productos que coincidan con los filtros seleccionados</p></div>) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredFavorites.map(product => (<div key={product.id} className="rounded-xl border hover:shadow-md transition-all overflow-hidden"><img src={product.image} alt={product.name} className="w-full h-40 object-cover" /><div className="p-4"><div className="flex justify-between items-start mb-2"><h4 className="font-bold text-base">{product.name}</h4><button onClick={() => removeFromFavorites(product.id)} className="p-1 rounded-full hover:bg-gray-100"><Heart className="h-5 w-5 fill-red-500 text-red-500" /></button></div><div className="flex items-center gap-2 mb-2"><div className="flex items-center"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><span className="text-xs ml-1">{product.rating}</span></div><span className="text-xs text-gray-400">({product.reviews} reviews)</span><span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">Stock: {product.stock}</span></div><p className="text-xs text-gray-500 mb-2">{product.seller} • {product.sellerType}</p><div className="flex items-center gap-2 mb-3"><span className="text-xl font-bold text-green-600">${formatCurrency(getProductPrice(product))}</span><span className="text-sm text-gray-400 line-through">${formatCurrency(getProductOriginalPrice(product))}</span><span className="text-xs text-red-500">{getProductDiscount(product) > 0 ? `-${getProductDiscount(product)}%` : ""}</span></div><div className="flex gap-2"><button onClick={() => addToCart(product, 1)} className="flex-1 text-sm py-2 rounded-lg bg-yellow-400 font-semibold hover:bg-yellow-500 transition-colors">Agregar al carrito</button><button onClick={() => { setSelectedProduct(product); setShowProductDetail(true); }} className="text-sm px-3 py-2 rounded-lg bg-gray-100 font-semibold hover:bg-gray-200 transition-colors">Ver detalles</button></div></div></div>))}</div>)}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Carrito */}
      {showCart && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowCart(false)}><div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}><div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><ShoppingBag className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />Mi Carrito ({cartQuantity} productos)</h3><button onClick={() => setShowCart(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button></div><div className="p-4 space-y-4">{cart.length === 0 ? (<div className="text-center py-8 text-gray-500"><ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Tu carrito está vacío</p></div>) : (<><div className="space-y-3">{cart.map(item => (<div key={item.id} className="flex justify-between items-center p-3 rounded-lg border"><div className="flex-1"><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-gray-500">${formatCurrency(getProductPrice(item))} c/u</p></div><div className="flex items-center gap-3"><div className="flex items-center border rounded-lg"><button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100">-</button><span className="w-8 text-center text-sm">{item.quantity}</span><button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100">+</button></div><p className="font-bold text-sm w-20 text-right">${formatCurrency(getProductPrice(item) * toNumber(item.quantity, 1))}</p><button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></div></div>))}</div><div className="border-t pt-4"><div className="flex justify-between items-center mb-4"><span className="font-bold text-lg">Total</span><span className="font-bold text-2xl text-green-600">${formatCurrency(getCartTotal())}</span></div><button onClick={checkout} className="w-full py-3 rounded-lg bg-yellow-400 font-bold text-lg hover:bg-yellow-500 transition-colors">Finalizar compra</button></div></>)}</div></div></div>)}

      {/* Modal de Detalle de Producto */}
      {showProductDetail && selectedProduct && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowProductDetail(false)}><div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}><div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h3 className="font-bold text-lg">{selectedProduct.name}</h3><button onClick={() => setShowProductDetail(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button></div><div className="p-4 space-y-4"><img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-xl" /><div className="flex justify-between items-start"><div><div className="flex items-center gap-2 mb-1"><div className="flex items-center"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="text-sm ml-1">{selectedProduct.rating}</span></div><span className="text-xs text-gray-400">({selectedProduct.reviews} reviews)</span><span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">Stock: {selectedProduct.stock}</span></div><p className="text-sm text-gray-500">{selectedProduct.seller} • {selectedProduct.sellerType}</p></div><button onClick={() => isFavorite(selectedProduct.id) ? removeFromFavorites(selectedProduct.id) : addToFavorites(selectedProduct)} className="p-2 rounded-full hover:bg-gray-100"><Heart className={`h-6 w-6 ${isFavorite(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} /></button></div><div className="flex items-center gap-3"><span className="text-3xl font-bold text-green-600">${formatCurrency(getProductPrice(selectedProduct))}</span><span className="text-lg text-gray-400 line-through">${formatCurrency(getProductOriginalPrice(selectedProduct))}</span><span className="text-sm text-red-500">{getProductDiscount(selectedProduct) > 0 ? `-${getProductDiscount(selectedProduct)}%` : ""}</span></div><div className="border-t pt-3"><p className="font-semibold text-sm mb-2">Descripción</p><p className="text-sm text-gray-600">{selectedProduct.description}</p></div><div className="border-t pt-3"><p className="font-semibold text-sm mb-2">Características</p><ul className="list-disc list-inside space-y-1">{normalizeProduct(selectedProduct).features.map((feature, idx) => (<li key={idx} className="text-sm text-gray-600">{feature}</li>))}</ul></div><div className="flex gap-2 pt-3"><button onClick={() => { addToCart(selectedProduct, 1); setShowProductDetail(false); }} className="flex-1 py-3 rounded-lg bg-yellow-400 font-semibold hover:bg-yellow-500 transition-colors">Agregar al carrito</button><button onClick={() => setShowProductDetail(false)} className="flex-1 py-3 rounded-lg bg-gray-100 font-semibold hover:bg-gray-200 transition-colors">Seguir comprando</button></div></div></div></div>)}

      {/* Modal de Detalle de Pedido */}
      {showOrderDetail && selectedOrder && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowOrderDetail(false)}><div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}><div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center"><h3 className="font-bold text-lg">Detalles del pedido</h3><button onClick={() => setShowOrderDetail(false)} className="p-1 hover:bg-gray-100 rounded-full"><X className="h-5 w-5" /></button></div><div className="p-4 space-y-4"><div className="grid grid-cols-2 gap-3"><div><p className="text-xs text-gray-500">Número de orden</p><p className="font-semibold">{selectedOrder.orderNumber}</p></div><div><p className="text-xs text-gray-500">Fecha</p><p className="font-semibold">{selectedOrder.date}</p></div><div><p className="text-xs text-gray-500">Estado</p><span className={`text-xs px-2 py-0.5 rounded-full inline-block ${statusConfig[selectedOrder.status]?.color}`}>{statusConfig[selectedOrder.status]?.icon} {statusConfig[selectedOrder.status]?.label}</span></div><div><p className="text-xs text-gray-500">Total</p><p className="font-bold text-lg" style={{ color: PALETTE.maastrichtBlue }}>${formatCurrency(selectedOrder.total)}</p></div></div><div><p className="font-semibold text-sm mb-2">Productos</p><div className="space-y-2">{selectedOrder.items.map((item, idx) => (<div key={idx} className="flex justify-between items-center py-2 border-b"><div><p className="text-sm">{item.name}</p><p className="text-xs text-gray-500">Cantidad: {item.quantity} x ${formatCurrency(item.unitPrice)}</p></div><p className="font-semibold">${formatCurrency(item.total)}</p></div>))}</div></div><div><p className="font-semibold text-sm mb-2">Información de envío</p><div className="bg-gray-50 rounded-lg p-3 space-y-2"><p className="text-sm flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-gray-500" /> {selectedOrder.shippingAddress}</p>{selectedOrder.trackingNumber && (<p className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-gray-500" /> Número de seguimiento: {selectedOrder.trackingNumber}</p>)}<p className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /> Entrega estimada: {selectedOrder.estimatedDelivery}</p></div></div><div><p className="font-semibold text-sm mb-2">Seguimiento del pedido</p><div className="relative">{selectedOrder.timeline.map((step, idx) => (<div key={idx} className="flex items-start gap-3 mb-4 last:mb-0"><div className="relative"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}>{step.completed ? <Check className="h-4 w-4 text-white" /> : <ClockIcon className="h-4 w-4 text-white" />}</div>{idx < selectedOrder.timeline.length - 1 && (<div className={`absolute left-4 top-8 w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />)}</div><div className="flex-1"><p className={`font-medium text-sm ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.status}</p><p className="text-xs text-gray-400">{step.date}</p></div></div>))}</div></div></div></div></div>)}
    </div>
  );
}

// ==========================================================
// COMPONENTE PRINCIPAL UserProfile
