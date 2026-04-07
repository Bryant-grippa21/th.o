import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Menu,
  Star,
  Heart,
  Store,
  DollarSign,
  X,
  ChevronDown,
  Package,
  User,
  Minus,
  Plus,
  Trash2,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

const PALETTE = {
  spaceCadet: "#1B3149",
  pastelGray: "#D6D0C4",
  crystalBlue: "#6E98AF",
  sizzlingSunrise: "#FEDC00",
  maastrichtBlue: "#091A2D",
  page: "#F3F1EC",
  white: "#FFFFFF",
  softBorder: "rgba(9,26,45,0.10)",
  softCard: "#FAF9F6",
  success: "#0F766E",
  danger: "#B42318",
};

const brandLogo = "/logo_crop.jpeg";
const CASHBACK_RATE = 0.025;

const formatUSD = (value) => new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(value);
const productCashback = (price, quantity = 1) => price * quantity * CASHBACK_RATE;

export default function Marketplace({ 
  onBack, 
  sessionType, 
  userData, 
  cart, 
  cartSummary, 
  addToCart, 
  onProfileClick,
  isCartOpen,
  setIsCartOpen,
  updateCartQuantity,
  removeFromCart,
  canBuyProduct,
  initialSearchQuery = "" // Recibir el query inicial desde la página principal
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevante");
  
  const [location, setLocation] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");

  // Todos los productos (base de datos)
  const allProducts = [
    // Productos DETALLISTAS (visibles para Naturales e Invitados)
    { id: 1, name: "Taladro percutor 1/2 profesional", price: 89.99, originalPrice: 129.99, discount: 31, rating: 4.7, reviews: 128, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80", category: "Herramientas eléctricas", seller: "FerreMax", brand: "Bosch", location: "Caracas", stock: 14, sellerRole: "DETALLISTA" },
    { id: 2, name: "Esmeril angular 4 1/2", price: 64.50, originalPrice: 89.90, discount: 28, rating: 4.5, reviews: 89, image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=400&q=80", category: "Herramientas eléctricas", seller: "FerreMax", brand: "Makita", location: "Caracas", stock: 8, sellerRole: "DETALLISTA" },
    { id: 5, name: "Guantes anticorte nivel 5", price: 9.99, originalPrice: 15.99, discount: 38, rating: 4.6, reviews: 312, image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=400&q=80", category: "Seguridad industrial", seller: "FerreNova", brand: "3M", location: "Maracaibo", stock: 45, sellerRole: "DETALLISTA" },
    { id: 6, name: "Casco de seguridad con ajuste rápido", price: 14.50, originalPrice: 22.90, discount: 37, rating: 4.4, reviews: 178, image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=80", category: "Seguridad industrial", seller: "FerreNova", brand: "3M", location: "Maracaibo", stock: 19, sellerRole: "DETALLISTA" },
    { id: 7, name: "Rodillo profesional antigoteo", price: 7.80, originalPrice: 12.90, discount: 40, rating: 4.2, reviews: 95, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=400&q=80", category: "Pintura y acabados", seller: "Pinturas del Centro", brand: "Sherwin", location: "Caracas", stock: 27, sellerRole: "DETALLISTA" },
    
    // Productos MAYORISTAS (visibles para Detallistas y el propio Mayorista)
    { id: 3, name: "Juego de llaves combinadas 12 piezas", price: 24.90, originalPrice: 39.90, discount: 38, rating: 4.8, reviews: 234, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80", category: "Ferretería general", seller: "Distribuidora Atlas", brand: "Stanley", location: "Valencia", stock: 22, sellerRole: "MAYORISTA" },
    { id: 4, name: "Kit destornilladores magnéticos", price: 17.25, originalPrice: 29.99, discount: 42, rating: 4.3, reviews: 156, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=400&q=80", category: "Ferretería general", seller: "Distribuidora Atlas", brand: "Stanley", location: "Valencia", stock: 31, sellerRole: "MAYORISTA" },
    { id: 8, name: "Sellador acrílico 1 galón", price: 18.75, originalPrice: 29.99, discount: 37, rating: 4.1, reviews: 67, image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=400&q=80", category: "Pintura y acabados", seller: "Pinturas Mayor Pro", brand: "Sherwin", location: "Barquisimeto", stock: 16, sellerRole: "MAYORISTA" },
  ];

  const categories = [
    { id: 1, name: "Herramientas eléctricas", count: 45 },
    { id: 2, name: "Ferretería general", count: 78 },
    { id: 3, name: "Seguridad industrial", count: 32 },
    { id: 4, name: "Pintura y acabados", count: 28 },
    { id: 5, name: "Herramientas manuales", count: 56 },
    { id: 6, name: "Jardinería", count: 24 },
    { id: 7, name: "Iluminación", count: 38 },
    { id: 8, name: "Fontanería", count: 42 },
  ];

  const locations = ["Caracas", "Valencia", "Maracaibo", "Barquisimeto", "Todas"];

  // ==========================================================
  // LÓGICA DE FILTRADO POR TIPO DE USUARIO
  // ==========================================================
  const getVisibleProducts = () => {
    switch (sessionType) {
      case "juridico_mayorista":
        // Mayorista: SOLO ve sus propios productos
        const sellerName = userData?.sellerName || userData?.name;
        if (sellerName) {
          return allProducts.filter(p => p.seller === sellerName);
        }
        return [];
      
      case "natural":
      case "guest":
        // Naturales e Invitados: solo ven productos de DETALLISTAS
        return allProducts.filter(p => p.sellerRole === "DETALLISTA");
      
      case "juridico_detallista":
        // Detallistas: solo ven productos de MAYORISTAS
        return allProducts.filter(p => p.sellerRole === "MAYORISTA");
      
      default:
        return allProducts;
    }
  };

  const visibleProducts = getVisibleProducts();

  // Filtrar productos según búsqueda, categoría, precio, etc.
  const filteredProducts = visibleProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
    const matchesPrice = (!priceRange.min || p.price >= parseFloat(priceRange.min)) && (!priceRange.max || p.price <= parseFloat(priceRange.max));
    const matchesLocation = location === "" || location === "Todas" || p.location === location;
    const matchesBrand = brandSearch === "" || p.brand.toLowerCase().includes(brandSearch.toLowerCase());
    const matchesStore = storeSearch === "" || p.seller.toLowerCase().includes(storeSearch.toLowerCase());
    return matchesSearch && matchesCategory && matchesPrice && matchesLocation && matchesBrand && matchesStore;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "precio-asc": return a.price - b.price;
      case "precio-desc": return b.price - a.price;
      case "rating": return b.rating - a.rating;
      case "descuento": return (b.discount || 0) - (a.discount || 0);
      default: return 0;
    }
  });

  const totalProducts = filteredProducts.length;
  const averagePrice = totalProducts > 0 ? filteredProducts.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;

  // Determinar si el usuario puede agregar al carrito
  const canAddToCart = (product) => {
    // Invitados pueden agregar al carrito pero no comprar
    if (sessionType === "guest") return true;
    // Mayoristas no pueden agregar al carrito
    if (sessionType === "juridico_mayorista") return false;
    // Naturales y Detallistas pueden agregar según reglas de negocio
    return canBuyProduct ? canBuyProduct(product) : true;
  };

  const CartItemComponent = ({ item, onDecrease, onIncrease, onRemove }) => {
    const lineTotal = item.price * item.quantity;
    const cashback = productCashback(item.price, item.quantity);
    return (
      <div className="rounded-[1.5rem] border p-3" style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}>
        <div className="flex gap-3">
          <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold" style={{ color: PALETTE.maastrichtBlue }}>{item.name}</p>
            <p className="mt-1 text-xs" style={{ color: PALETTE.crystalBlue }}>Cantidad: {item.quantity} · Stock: {item.stock}</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-full border px-2 py-1" style={{ borderColor: PALETTE.softBorder }}>
                <button onClick={onDecrease} disabled={item.quantity <= 1} className="rounded-full p-1 disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
                <button onClick={onIncrease} disabled={item.quantity >= item.stock} className="rounded-full p-1 disabled:opacity-40"><Plus className="h-4 w-4" /></button>
              </div>
              <button onClick={onRemove} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium" style={{ backgroundColor: "rgba(180,35,24,0.08)", color: "#B42318" }}><Trash2 className="h-4 w-4" /> Eliminar</button>
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-2 rounded-2xl p-3 text-sm" style={{ backgroundColor: PALETTE.page }}>
          <div className="flex items-center justify-between"><span>Precio unitario</span><span className="font-semibold">{formatUSD(item.price)}</span></div>
          <div className="flex items-center justify-between"><span>Subtotal producto</span><span className="font-semibold">{formatUSD(lineTotal)}</span></div>
          {sessionType === "natural" && <div className="flex items-center justify-between"><span>Cashback de este producto</span><span className="font-semibold" style={{ color: PALETTE.success }}>{formatUSD(cashback)}</span></div>}
        </div>
      </div>
    );
  };

  // Obtener el texto del botón según el tipo de usuario
  const getButtonText = (product) => {
    if (sessionType === "juridico_mayorista") return "Solo vista";
    if (sessionType === "guest") return "Agregar al carrito";
    if (canAddToCart(product)) return "Agregar al carrito";
    return "Sin acceso";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3 text-white lg:px-8" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
          <div className="mx-auto flex w-full items-center gap-3">
            {/* Logo clickeable */}
            <button 
              onClick={onBack} 
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all hover:scale-105"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl" style={{ backgroundColor: PALETTE.white }}>
                <img
                  src={brandLogo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.querySelector('.store-icon')?.classList.remove('hidden');
                  }}
                />
                <Store className="store-icon hidden h-7 w-7" style={{ color: PALETTE.spaceCadet }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>tuherramientaonline</p>
                <p className="text-lg font-bold tracking-tight">market</p>
              </div>
            </button>

            {/* Barra de búsqueda */}
            <div className="flex flex-1 items-center overflow-hidden rounded-[1.4rem] w-full" style={{ backgroundColor: PALETTE.white }}>
              <div className="hidden px-3 py-3 text-sm sm:block" style={{ backgroundColor: PALETTE.pastelGray, color: PALETTE.spaceCadet }}>Todo</div>
              <Input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Buscar productos, líneas o categorías" 
                className="border-0 text-slate-900 shadow-none focus-visible:ring-0 w-full" 
              />
              <Button className="h-11 rounded-none rounded-r-[1.4rem] px-5" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}><Search className="h-5 w-5" /></Button>
            </div>

            {/* Información de usuario */}
            <div className="hidden items-center gap-4 md:flex">
              <button onClick={onProfileClick} className="rounded-2xl px-3 py-2 transition-colors hover:bg-white/10" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}><User className="h-4 w-4" style={{ color: PALETTE.maastrichtBlue }} /></div>
                  <div className="text-left"><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Mi cuenta</p><p className="text-sm font-semibold">{userData?.name?.split(" ")[0] || "Usuario"}</p></div>
                </div>
              </button>

              <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Tasa del día</p>
                <p className="text-sm font-semibold">Bs. S 466,51</p>
              </div>

              {sessionType === "natural" && (
                <div className="rounded-2xl px-3 py-2 transition-all hover:scale-105 cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(254,220,0,0.3)" }} onClick={() => alert(`Cashback acumulado: ${formatUSD(cartSummary?.cashback || 0)}`)}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}><Star className="h-4 w-4" style={{ color: PALETTE.maastrichtBlue }} /></div>
                    <div className="text-left"><p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Cashback disponible</p><p className="text-sm font-bold" style={{ color: PALETTE.sizzlingSunrise }}>{formatUSD(cartSummary?.cashback || 0)}</p></div>
                  </div>
                </div>
              )}

              <div className="relative">
                <button onClick={() => setIsCartOpen(!isCartOpen)} className="relative flex items-center gap-2 rounded-2xl px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <ShoppingCart className="h-6 w-6" /><span className="text-sm font-semibold">Carrito</span>
                  {cartSummary?.items > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-bold" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>{cartSummary.items}</span>}
                </button>

                {isCartOpen && (
                  <div className="absolute right-0 top-14 z-50 w-[380px] overflow-hidden rounded-[1.8rem] border shadow-2xl" style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}>
                    <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: PALETTE.softBorder }}>
                      <div><p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Resumen rápido</p><h3 className="text-lg font-bold">Mi carrito</h3></div>
                      <button onClick={() => setIsCartOpen(false)} className="rounded-full p-1"><X className="h-5 w-5" /></button>
                    </div>
                    <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-4">
                      {cart?.length === 0 ? <div className="rounded-2xl p-4 text-sm" style={{ backgroundColor: PALETTE.page }}>Tu carrito está vacío.</div> : cart?.map(item => (
                        <CartItemComponent key={item.id} item={item} onDecrease={() => updateCartQuantity(item.id, item.quantity - 1)} onIncrease={() => updateCartQuantity(item.id, item.quantity + 1)} onRemove={() => removeFromCart(item.id)} />
                      ))}
                    </div>
                    <div className="border-t px-4 py-4" style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.page }}>
                      <div className="flex items-center justify-between text-sm"><span>Total a pagar</span><span className="font-bold">{formatUSD(cartSummary?.subtotal || 0)}</span></div>
                      <div className="mt-2 flex items-center justify-between text-sm"><span>Total en Bs</span><span className="font-bold">Bs. S {((cartSummary?.subtotal || 0) * 466.51).toFixed(2)}</span></div>
                      {sessionType === "natural" && <div className="mt-2 flex items-center justify-between text-sm"><span>Cashback total</span><span className="font-bold" style={{ color: PALETTE.success }}>{formatUSD(cartSummary?.cashback || 0)}</span></div>}
                      <Button className="mt-4 w-full rounded-full font-semibold" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Ir al carrito</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menú inferior */}
        <div className="px-4 py-2 text-white lg:px-8" style={{ backgroundColor: PALETTE.spaceCadet }}>
          <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto text-sm">
            <button className="flex items-center gap-2 font-medium"><Menu className="h-4 w-4" /> Todo</button>
            <button>Más vendidos</button>
            <button>Seguridad industrial</button>
            <button>Herramientas</button>
            <button>Pintura</button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar de filtros - Solo visible para no mayoristas */}
          {sessionType !== "juridico_mayorista" && (
            <aside className={`${showMobileFilters ? 'fixed inset-0 z-50 bg-black/50' : 'hidden'} md:block md:relative md:bg-transparent md:w-64 flex-shrink-0`}>
              <div className={`bg-white rounded-2xl p-4 ${showMobileFilters ? 'absolute top-0 left-0 w-80 h-full overflow-y-auto' : ''}`} style={{ backgroundColor: PALETTE.white }}>
                {showMobileFilters && (
                  <div className="flex justify-between items-center mb-4 pb-2 border-b">
                    <h3 className="font-bold text-lg">Filtros</h3>
                    <button onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5" /></button>
                  </div>
                )}
                
                {/* Categorías */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />
                    Categorías
                  </h4>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setSelectedCategory("Todas")} 
                      className={`w-full text-left px-2 py-1 rounded-lg text-sm transition-colors ${selectedCategory === "Todas" ? "font-semibold" : "hover:bg-gray-50"}`} 
                      style={{ color: selectedCategory === "Todas" ? PALETTE.sizzlingSunrise : PALETTE.spaceCadet }}
                    >
                      Todas ({visibleProducts.length})
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => setSelectedCategory(cat.name)} 
                        className={`w-full text-left px-2 py-1 rounded-lg text-sm transition-colors ${selectedCategory === cat.name ? "font-semibold" : "hover:bg-gray-50"}`} 
                        style={{ color: selectedCategory === cat.name ? PALETTE.sizzlingSunrise : PALETTE.spaceCadet }}
                      >
                        {cat.name} ({cat.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ubicación */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />
                    Ubicación
                  </h4>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: PALETTE.pastelGray }}
                  >
                    <option value="">Todas las ubicaciones</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Buscar marca */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />
                    Buscar marca
                  </h4>
                  <Input
                    type="text"
                    placeholder="Ej: Bosch, Stanley, 3M..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Buscar tienda */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />
                    Buscar tienda
                  </h4>
                  <Input
                    type="text"
                    placeholder="Ej: FerreMax, Distribuidora Atlas..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Rango de precio */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" style={{ color: PALETTE.crystalBlue }} />
                    Precio
                  </h4>
                  <div className="space-y-2">
                    <Input 
                      type="number" 
                      placeholder="Mínimo" 
                      value={priceRange.min} 
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} 
                      className="text-sm py-1 h-8 w-full"
                    />
                    <Input 
                      type="number" 
                      placeholder="Máximo" 
                      value={priceRange.max} 
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} 
                      className="text-sm py-1 h-8 w-full"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap mt-2">
                    <button onClick={() => setPriceRange({ min: "", max: "2" })} className="px-2 py-0.5 rounded-full text-xs border hover:bg-gray-50">Hasta US$ 2</button>
                    <button onClick={() => setPriceRange({ min: "2", max: "12" })} className="px-2 py-0.5 rounded-full text-xs border hover:bg-gray-50">US$ 2 a US$ 12</button>
                    <button onClick={() => setPriceRange({ min: "12", max: "" })} className="px-2 py-0.5 rounded-full text-xs border hover:bg-gray-50">Más de US$ 12</button>
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Mensaje para mayoristas */}
          {sessionType === "juridico_mayorista" && (
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-4" style={{ backgroundColor: PALETTE.white }}>
                <div className="p-3 rounded-lg" style={{ backgroundColor: PALETTE.softCard }}>
                  <p className="text-sm font-semibold" style={{ color: PALETTE.maastrichtBlue }}>Modo Mayorista</p>
                  <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>Solo puedes ver tus propios productos. Los filtros están deshabilitados.</p>
                  <p className="text-xs mt-2 font-semibold" style={{ color: PALETTE.success }}>Tus productos: {visibleProducts.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Área de productos */}
          <main className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>
                  {totalProducts} resultados
                  {averagePrice > 0 && ` · Precio promedio: ${formatUSD(averagePrice)}`}
                  {sessionType === "juridico_mayorista" && " · Modo: Solo vista de tus productos"}
                  {sessionType === "natural" && " · Modo: Compra minorista"}
                  {sessionType === "juridico_detallista" && " · Modo: Compra mayorista"}
                  {sessionType === "guest" && " · Modo: Solo vista - Regístrate para comprar"}
                </p>
              </div>
              {sessionType !== "juridico_mayorista" && (
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="pl-3 pr-8 py-1 rounded-full text-sm border bg-white">
                    <option value="relevante">Más relevantes</option>
                    <option value="precio-asc">Precio: menor a mayor</option>
                    <option value="precio-desc">Precio: mayor a menor</option>
                    <option value="rating">Mejor calificados</option>
                    <option value="descuento">Mayor descuento</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
              )}
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4" style={{ color: PALETTE.crystalBlue }} />
                <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
                <p className="text-gray-500">
                  {sessionType === "juridico_mayorista" 
                    ? "No tienes productos registrados en tu tienda." 
                    : sessionType === "natural" || sessionType === "guest"
                      ? "No hay productos de vendedores DETALLISTAS disponibles en este momento."
                      : sessionType === "juridico_detallista"
                        ? "No hay productos de vendedores MAYORISTAS disponibles en este momento."
                        : "Prueba con otros filtros"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProducts.map(product => {
                  const allowed = canAddToCart(product);
                  const buttonText = getButtonText(product);
                  const productWithStock = { ...product, stock: product.stock || 10 };
                  return (
                    <motion.div key={product.id} whileHover={{ y: -4 }} className="group cursor-pointer">
                      <Card className="h-full overflow-hidden rounded-2xl border hover:shadow-lg" style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}>
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                          {product.discount > 0 && <span className="absolute top-2 left-2 rounded-full px-2 py-1 text-xs font-bold text-white" style={{ backgroundColor: PALETTE.danger }}>-{product.discount}%</span>}
                          <button className="absolute top-2 right-2 rounded-full p-2 bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Heart className="h-4 w-4" style={{ color: PALETTE.spaceCadet }} /></button>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          <p className="text-xs text-gray-500">{product.category}</p>
                          <h3 className="font-semibold line-clamp-2 text-sm" style={{ color: PALETTE.maastrichtBlue }}>{product.name}</h3>
                          <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-current" style={{ color: PALETTE.sizzlingSunrise }} /><span className="text-xs font-medium">{product.rating}</span><span className="text-xs text-gray-400">({product.reviews})</span></div>
                          <div className="flex items-baseline gap-2"><span className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>{formatUSD(product.price)}</span>{product.originalPrice && <span className="text-xs line-through text-gray-400">{formatUSD(product.originalPrice)}</span>}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>🏷️ {product.brand}</span>
                            <span>📍 {product.location}</span>
                          </div>
                          <p className="text-xs text-gray-500">Vendido por: {product.seller}</p>
                          <Button 
                            className="w-full rounded-full text-sm py-2" 
                            style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }} 
                            onClick={() => allowed && addToCart(productWithStock)} 
                            disabled={!allowed}
                          >
                            {buttonText}
                          </Button>
                          {sessionType === "guest" && (
                            <p className="text-xs text-center mt-1" style={{ color: PALETTE.crystalBlue }}>
                              💡 Regístrate para comprar
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}