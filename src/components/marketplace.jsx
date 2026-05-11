import React, { useMemo, useState } from "react";
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
  MapPin,
} from "lucide-react";

import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import ProductDetail from "./ProductDetail";
import CartDrawerItem from "./cart/CartDrawerItem";

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

const formatUSD = (value) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

const productCashback = (price, quantity = 1) =>
  Number(price || 0) * Number(quantity || 1) * CASHBACK_RATE;

export default function Marketplace({
  onBack,
  sessionType,
  userData,
  cart = [],
  cartSummary,
  addToCart,
  onProfileClick,
  isCartOpen,
  setIsCartOpen,
  updateCartQuantity,
  removeFromCart,
  canBuyProduct,
  initialSearchQuery = "",
  onGoToCart,
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevante");
  const [location, setLocation] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const allProducts = [
    {
      id: 1,
      name: "Taladro percutor 1/2 profesional",
      price: 89.99,
      originalPrice: 129.99,
      discount: 31,
      rating: 4.7,
      reviews: 128,
      image:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
      category: "Herramientas eléctricas",
      seller: "FerreMax",
      brand: "Bosch",
      location: "Caracas",
      stock: 14,
      sellerRole: "DETALLISTA",
      description:
        "Taladro percutor profesional para trabajos de concreto, metal y madera. Ideal para uso doméstico avanzado y trabajo continuo.",
    },
    {
      id: 2,
      name: "Esmeril angular 4 1/2",
      price: 64.5,
      originalPrice: 89.9,
      discount: 28,
      rating: 4.5,
      reviews: 89,
      image:
        "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
      category: "Herramientas eléctricas",
      seller: "FerreMax",
      brand: "Makita",
      location: "Caracas",
      stock: 8,
      sellerRole: "DETALLISTA",
      description:
        "Esmeril angular compacto para corte, desbaste y trabajos de mantenimiento general.",
    },
    {
      id: 5,
      name: "Guantes anticorte nivel 5",
      price: 9.99,
      originalPrice: 15.99,
      discount: 38,
      rating: 4.6,
      reviews: 312,
      image:
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80",
      category: "Seguridad industrial",
      seller: "FerreNova",
      brand: "3M",
      location: "Maracaibo",
      stock: 45,
      sellerRole: "DETALLISTA",
      description:
        "Guantes de protección anticorte para manipulación de materiales, vidrio y metal.",
    },
    {
      id: 6,
      name: "Casco de seguridad con ajuste rápido",
      price: 14.5,
      originalPrice: 22.9,
      discount: 37,
      rating: 4.4,
      reviews: 178,
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
      category: "Seguridad industrial",
      seller: "FerreNova",
      brand: "3M",
      location: "Maracaibo",
      stock: 19,
      sellerRole: "DETALLISTA",
      description:
        "Casco ligero y resistente para protección en obra, almacén o industria.",
    },
    {
      id: 7,
      name: "Rodillo profesional antigoteo",
      price: 7.8,
      originalPrice: 12.9,
      discount: 40,
      rating: 4.2,
      reviews: 95,
      image:
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80",
      category: "Pintura y acabados",
      seller: "Pinturas del Centro",
      brand: "Sherwin",
      location: "Caracas",
      stock: 27,
      sellerRole: "DETALLISTA",
      description:
        "Rodillo profesional para acabados limpios y cobertura uniforme.",
    },
    {
      id: 3,
      name: "Juego de llaves combinadas 12 piezas",
      price: 24.9,
      originalPrice: 39.9,
      discount: 38,
      rating: 4.8,
      reviews: 234,
      image:
        "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80",
      category: "Ferretería general",
      seller: "Distribuidora Atlas",
      brand: "Stanley",
      location: "Valencia",
      stock: 22,
      sellerRole: "MAYORISTA",
      description:
        "Set de llaves combinadas de acero reforzado con estuche organizador.",
    },
    {
      id: 4,
      name: "Kit destornilladores magnéticos",
      price: 17.25,
      originalPrice: 29.99,
      discount: 42,
      rating: 4.3,
      reviews: 156,
      image:
        "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80",
      category: "Ferretería general",
      seller: "Distribuidora Atlas",
      brand: "Stanley",
      location: "Valencia",
      stock: 31,
      sellerRole: "MAYORISTA",
      description:
        "Kit de destornilladores magnéticos para trabajo doméstico e industrial.",
    },
    {
      id: 8,
      name: "Sellador acrílico 1 galón",
      price: 18.75,
      originalPrice: 29.99,
      discount: 37,
      rating: 4.1,
      reviews: 67,
      image:
        "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80",
      category: "Pintura y acabados",
      seller: "Pinturas Mayor Pro",
      brand: "Sherwin",
      location: "Barquisimeto",
      stock: 16,
      sellerRole: "MAYORISTA",
      description:
        "Sellador acrílico para superficies interiores y exteriores.",
    },
  ];

  const categories = [
    "Todas",
    "Herramientas eléctricas",
    "Ferretería general",
    "Seguridad industrial",
    "Pintura y acabados",
  ];

  const locations = ["Todas", "Caracas", "Valencia", "Maracaibo", "Barquisimeto"];

  const visibleProducts = useMemo(() => {
    if (sessionType === "juridico_mayorista") {
      const sellerName = userData?.sellerName || userData?.name;
      return sellerName
        ? allProducts.filter((product) => product.seller === sellerName)
        : [];
    }

    if (sessionType === "natural" || sessionType === "guest") {
      return allProducts.filter((product) => product.sellerRole === "DETALLISTA");
    }

    if (sessionType === "juridico_detallista") {
      return allProducts.filter((product) => product.sellerRole === "MAYORISTA");
    }

    return allProducts;
  }, [sessionType, userData]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return visibleProducts.filter((product) => {
      const text = `${product.name} ${product.category} ${product.brand} ${product.seller}`.toLowerCase();

      const matchesSearch = !query || text.includes(query);
      const matchesCategory =
        selectedCategory === "Todas" || product.category === selectedCategory;
      const matchesPrice =
        (!priceRange.min || product.price >= Number(priceRange.min)) &&
        (!priceRange.max || product.price <= Number(priceRange.max));
      const matchesLocation =
        !location || location === "Todas" || product.location === location;
      const matchesBrand =
        !brandSearch ||
        product.brand.toLowerCase().includes(brandSearch.toLowerCase());
      const matchesStore =
        !storeSearch ||
        product.seller.toLowerCase().includes(storeSearch.toLowerCase());

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesLocation &&
        matchesBrand &&
        matchesStore
      );
    });
  }, [
    visibleProducts,
    searchQuery,
    selectedCategory,
    priceRange,
    location,
    brandSearch,
    storeSearch,
  ]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "precio-asc") return a.price - b.price;
      if (sortBy === "precio-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "descuento") return (b.discount || 0) - (a.discount || 0);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  const computedCartSummary = useMemo(() => {
    const subtotal = cart.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    return {
      items: cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0),
      subtotal,
      cashback: cart.reduce(
        (acc, item) => acc + productCashback(item.price, item.quantity),
        0
      ),
    };
  }, [cart]);

  const summary = cartSummary || computedCartSummary;

  const canAddToCart = (product) => {
    if (sessionType === "guest") return true;
    if (sessionType === "juridico_mayorista") return false;
    return canBuyProduct ? canBuyProduct(product) : true;
  };

  const handleAddToCart = (product) => {
    if (!canAddToCart(product)) return;
    addToCart?.({ ...product, quantity: 1 });
  };

  const handleGoToCart = () => {
    if (cart.length === 0) return;

    if (onGoToCart) {
      onGoToCart();
      return;
    }

    setIsCartOpen?.(false);
  };

  if (selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        addToCart={handleAddToCart}
        relatedProducts={sortedProducts.filter(
          (product) => product.id !== selectedProduct.id
        )}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      <header className="sticky top-0 z-50 shadow-sm">
        <div
          className="px-4 py-3 text-white lg:px-8"
          style={{ backgroundColor: PALETTE.maastrichtBlue }}
        >
          <div className="mx-auto flex w-full items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all hover:scale-105"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
                style={{ backgroundColor: PALETTE.white }}
              >
                <img
                  src={brandLogo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <Store className="hidden h-7 w-7" />
              </div>

              <div>
                <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                  tuherramientaonline
                </p>
                <p className="text-lg font-bold tracking-tight">market</p>
              </div>
            </button>

            <div
              className="flex flex-1 items-center overflow-hidden rounded-[1.4rem] w-full"
              style={{ backgroundColor: PALETTE.white }}
            >
              <div
                className="hidden px-3 py-3 text-sm sm:block"
                style={{
                  backgroundColor: PALETTE.pastelGray,
                  color: PALETTE.spaceCadet,
                }}
              >
                Todo
              </div>

              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, líneas o categorías"
                className="w-full border-0 text-slate-900 shadow-none focus-visible:ring-0"
              />

              <Button
                className="h-11 rounded-none rounded-r-[1.4rem] px-5"
                style={{
                  backgroundColor: PALETTE.sizzlingSunrise,
                  color: PALETTE.maastrichtBlue,
                }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <button
                onClick={onProfileClick}
                className="rounded-2xl px-3 py-2 transition-colors hover:bg-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: PALETTE.sizzlingSunrise }}
                  >
                    <User
                      className="h-4 w-4"
                      style={{ color: PALETTE.maastrichtBlue }}
                    />
                  </div>

                  <div className="text-left">
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                      Mi cuenta
                    </p>
                    <p className="text-sm font-semibold">
                      {userData?.name?.split(" ")[0] || "Usuario"}
                    </p>
                  </div>
                </div>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsCartOpen?.(!isCartOpen)}
                  className="relative flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm font-semibold">Carrito</span>

                  {summary.items > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-bold"
                      style={{
                        backgroundColor: PALETTE.sizzlingSunrise,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      {summary.items}
                    </span>
                  )}
                </button>

                {isCartOpen && (
                  <div
                    className="absolute right-0 top-14 z-50 w-[380px] overflow-hidden rounded-[1.8rem] border shadow-2xl"
                    style={{
                      borderColor: PALETTE.softBorder,
                      backgroundColor: PALETTE.white,
                      color: PALETTE.maastrichtBlue,
                    }}
                  >
                    <div
                      className="flex items-center justify-between border-b px-4 py-3"
                      style={{ borderColor: PALETTE.softBorder }}
                    >
                      <div>
                        <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>
                          Resumen rápido
                        </p>
                        <h3 className="text-lg font-bold">Mi carrito</h3>
                      </div>

                      <button
                        onClick={() => setIsCartOpen?.(false)}
                        className="rounded-full p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-4">
                      {cart.length === 0 ? (
                        <div
                          className="rounded-2xl p-4 text-sm"
                          style={{
                            backgroundColor: PALETTE.page,
                            color: PALETTE.maastrichtBlue,
                          }}
                        >
                          Tu carrito está vacío.
                        </div>
                      ) : (
                        cart.map((item) => (
                          <CartDrawerItem
                            key={item.id}
                            item={item}
                            updateCartQuantity={updateCartQuantity}
                            removeFromCart={removeFromCart}
                          />
                        ))
                      )}
                    </div>

                    <div
                      className="border-t px-4 py-4"
                      style={{
                        borderColor: PALETTE.softBorder,
                        backgroundColor: PALETTE.page,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span>Total a pagar</span>
                        <span className="font-bold">
                          {formatUSD(summary.subtotal)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span>Total en Bs</span>
                        <span className="font-bold">
                          Bs. S {(summary.subtotal * 466.51).toFixed(2)}
                        </span>
                      </div>

                      {sessionType === "natural" && (
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span>Cashback total</span>
                          <span
                            className="font-bold"
                            style={{ color: PALETTE.success }}
                          >
                            {formatUSD(summary.cashback)}
                          </span>
                        </div>
                      )}

                      <Button
                        className="mt-4 w-full rounded-full font-semibold disabled:opacity-50"
                        style={{
                          backgroundColor: PALETTE.sizzlingSunrise,
                          color: PALETTE.maastrichtBlue,
                        }}
                        onClick={handleGoToCart}
                        disabled={cart.length === 0}
                      >
                        Ir al carrito
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="px-4 py-2 text-white lg:px-8"
          style={{ backgroundColor: PALETTE.spaceCadet }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto text-sm">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 font-medium"
            >
              <Menu className="h-4 w-4" />
              Todo
            </button>
            <button>Más vendidos</button>
            <button>Seguridad industrial</button>
            <button>Herramientas</button>
            <button>Pintura</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="flex gap-6">
          <aside
            className={`${
              showMobileFilters ? "fixed inset-0 z-50 bg-black/50" : "hidden"
            } md:block md:relative md:bg-transparent md:w-64 flex-shrink-0`}
          >
            <div
              className={`rounded-2xl bg-white p-4 ${
                showMobileFilters
                  ? "absolute left-0 top-0 h-full w-80 overflow-y-auto"
                  : ""
              }`}
            >
              {showMobileFilters && (
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-bold">Filtros</h3>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              <div className="mb-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Package
                    className="h-4 w-4"
                    style={{ color: PALETTE.crystalBlue }}
                  />
                  Categorías
                </h4>

                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="w-full rounded-lg px-2 py-1 text-left text-sm transition hover:bg-gray-50"
                      style={{
                        color:
                          selectedCategory === category
                            ? PALETTE.sizzlingSunrise
                            : PALETTE.spaceCadet,
                        fontWeight: selectedCategory === category ? 700 : 400,
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <MapPin
                    className="h-4 w-4"
                    style={{ color: PALETTE.crystalBlue }}
                  />
                  Ubicación
                </h4>

                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.pastelGray }}
                >
                  {locations.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Star
                    className="h-4 w-4"
                    style={{ color: PALETTE.crystalBlue }}
                  />
                  Marca
                </h4>

                <Input
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Bosch, Stanley, 3M..."
                  className="text-sm"
                />
              </div>

              <div className="mb-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Store
                    className="h-4 w-4"
                    style={{ color: PALETTE.crystalBlue }}
                  />
                  Tienda
                </h4>

                <Input
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  placeholder="FerreMax..."
                  className="text-sm"
                />
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <DollarSign
                    className="h-4 w-4"
                    style={{ color: PALETTE.crystalBlue }}
                  />
                  Precio
                </h4>

                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                  />

                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>
                  {sortedProducts.length} resultados
                </p>

                <h1
                  className="text-2xl font-bold"
                  style={{ color: PALETTE.maastrichtBlue }}
                >
                  Marketplace
                </h1>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border bg-white py-2 pl-4 pr-9 text-sm"
                >
                  <option value="relevante">Más relevantes</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="rating">Mejor calificados</option>
                  <option value="descuento">Mayor descuento</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="rounded-3xl bg-white py-16 text-center">
                <Package
                  className="mx-auto mb-4 h-16 w-16"
                  style={{ color: PALETTE.crystalBlue }}
                />

                <h3 className="mb-2 text-xl font-semibold">
                  No se encontraron productos
                </h3>

                <p className="text-gray-500">
                  Prueba con otros filtros o cambia la búsqueda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product) => {
                  const allowed = canAddToCart(product);

                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <Card
                        className="h-full overflow-hidden rounded-2xl border hover:shadow-lg"
                        style={{
                          borderColor: PALETTE.softBorder,
                          backgroundColor: PALETTE.white,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="relative block aspect-square w-full overflow-hidden bg-gray-100 text-left"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />

                          {product.discount > 0 && (
                            <span
                              className="absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-white"
                              style={{ backgroundColor: PALETTE.danger }}
                            >
                              -{product.discount}%
                            </span>
                          )}

                          <span className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm">
                            <Heart
                              className="h-4 w-4"
                              style={{ color: PALETTE.spaceCadet }}
                            />
                          </span>
                        </button>

                        <CardContent className="space-y-2 p-3">
                          <p className="text-xs text-gray-500">
                            {product.category}
                          </p>

                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="line-clamp-2 text-left text-sm font-semibold hover:underline"
                            style={{ color: PALETTE.maastrichtBlue }}
                          >
                            {product.name}
                          </button>

                          <div className="flex items-center gap-1">
                            <Star
                              className="h-3 w-3 fill-current"
                              style={{ color: PALETTE.sizzlingSunrise }}
                            />
                            <span className="text-xs font-medium">
                              {product.rating}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({product.reviews})
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span
                              className="text-xl font-bold"
                              style={{ color: PALETTE.maastrichtBlue }}
                            >
                              {formatUSD(product.price)}
                            </span>

                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatUSD(product.originalPrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>🏷️ {product.brand}</span>
                            <span>📍 {product.location}</span>
                          </div>

                          <p className="text-xs text-gray-500">
                            Vendido por: {product.seller}
                          </p>

                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button
                              className="rounded-full text-sm font-semibold"
                              style={{
                                backgroundColor: PALETTE.sizzlingSunrise,
                                color: PALETTE.maastrichtBlue,
                              }}
                              onClick={() => handleAddToCart(product)}
                              disabled={!allowed}
                            >
                              {allowed ? "Agregar" : "Sin acceso"}
                            </Button>

                            <Button
                              variant="outline"
                              className="rounded-full text-sm font-semibold"
                              style={{
                                borderColor: PALETTE.crystalBlue,
                                color: PALETTE.spaceCadet,
                              }}
                              onClick={() => setSelectedProduct(product)}
                            >
                              Ver
                            </Button>
                          </div>
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