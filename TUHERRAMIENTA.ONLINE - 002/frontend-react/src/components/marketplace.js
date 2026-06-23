/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingCart,
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
import { productsApi } from "./ui/apiClient";

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

const brandLogo = "/logo_full.png";
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
  isFavorite,
  onToggleFavorite,
}) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevante");
  const [location, setLocation] = useState("");
  const [urbanization, setUrbanization] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [backendProducts, setBackendProducts] = useState([]);
  const cleanSearchQuery = () => setSearchQuery((value) => value.trim());

  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilters]);

  const applyCategory = (category) => {
    setSelectedCategory(category);
    setShowMobileFilters(false);
  };
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todas");
    setPriceRange({ min: "", max: "" });
    setLocation("");
    setUrbanization("");
    setBrandSearch("");
    setStoreSearch("");
    setSortBy("relevante");
  };

  const fallbackProducts = [
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
      urbanization: "Chacao",
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
      urbanization: "Chacao",
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
      urbanization: "La Lago",
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
      urbanization: "La Lago",
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
      urbanization: "Chacao",
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
      urbanization: "El Viñedo",
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
      urbanization: "El Viñedo",
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
      urbanization: "Nueva Segovia",
      stock: 16,
      sellerRole: "MAYORISTA",
      description:
        "Sellador acrílico para superficies interiores y exteriores.",
    },
  ];

  useEffect(() => {
    let isMounted = true;

    productsApi
      .list({ limit: 100 })
      .then((payload) => {
        if (!isMounted) return;
        const mappedProducts = (payload?.products || []).map((product) => ({
          id: product.id_product,
          id_product: product.id_product,
          sku: product.sku,
          name: product.name || product.line_name || "Producto",
          price: Number(product.price || 0),
          originalPrice: Number(product.price || 0),
          discount: 0,
          rating: Number(product.reviews?.average_rating || product.average_rating || 0),
          reviews: Number(product.reviews?.total_reviews || product.total_reviews || 0),
          image: product.image_url || product.main_image_url || "/logo_icon.png",
          category: product.category_name || product.subcategory_name || "Catálogo",
          seller: product.company_name || product.seller || "Tuherramienta.online",
          brand: product.brand || "",
          location: product.location || "",
          stock: Number(product.quantity || 0),
          sellerRole: "DETALLISTA",
          description: product.description || "Producto publicado en el catálogo.",
        }));
        setBackendProducts(mappedProducts);
      })
      .catch((error) => {
        console.warn("No se pudo cargar el catálogo del backend, usando catálogo local:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const allProducts = backendProducts.length ? backendProducts : fallbackProducts;


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

  const urbanizations = useMemo(
    () => ["Todas", ...Array.from(new Set(visibleProducts.map((product) => product.urbanization).filter(Boolean)))],
    [visibleProducts]
  );

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
      const matchesUrbanization =
        !urbanization || urbanization === "Todas" || product.urbanization === urbanization;
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
        matchesUrbanization &&
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
    urbanization,
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
    addToCart?.({ ...product, quantity: Number(product.quantity || 1) });
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
        userData={userData}
        cart={cart}
        cartSummary={summary}
        sessionType={sessionType}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        onGoToCart={onGoToCart}
        onProfileClick={onProfileClick}
        onSearch={(text) => {
          setSelectedProduct(null);
          setSearchQuery(text);
        }}
        onSelectProduct={(product) => {
          setSelectedProduct(product);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
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
          <div className="mx-auto grid w-full items-center gap-3 lg:grid-cols-[auto_minmax(520px,980px)_auto]">
            <button
              onClick={onBack}
              className="inline-flex w-auto max-w-[260px] flex-none items-center gap-3 rounded-2xl px-1 py-1 transition-all hover:scale-105"
              style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
            >
              <div
                className="flex h-14 w-auto max-w-[248px] shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-16"
                style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
              >
                <img
                  src={brandLogo}
                  alt="Logo"
                  className="h-full w-auto max-w-[230px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <Store className="hidden h-7 w-7" />
              </div>
            </button>

            <div
              className="order-3 mx-auto flex w-full min-w-0 items-center overflow-hidden rounded-[1.4rem] md:order-none md:max-w-[980px]"
              style={{ backgroundColor: PALETTE.white || "#FFFFFF" }}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") cleanSearchQuery();
                }}
                placeholder="Buscar productos"
                className="w-full border-0 text-slate-900 shadow-none focus-visible:ring-0"
              />

              <Button
                type="button"
                onClick={cleanSearchQuery}
                className="h-11 rounded-none rounded-r-[1.4rem] px-3 sm:px-5"
                style={{
                  backgroundColor: PALETTE.sizzlingSunrise,
                  color: PALETTE.maastrichtBlue,
                }}
                aria-label="Buscar productos"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-4">
              <button
                onClick={onProfileClick}
                className="rounded-2xl px-2 py-2 transition-colors hover:bg-white/10 sm:px-3 border"
                style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
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

                  <div className="hidden text-left sm:block">
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
                  className="relative flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="hidden text-sm font-semibold sm:inline">Carrito</span>

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
                    className="fixed inset-x-3 top-24 z-50 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[1.4rem] border shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-14 sm:w-[380px] sm:rounded-[1.8rem]"
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
          <div className="mx-auto flex w-full items-center justify-center text-center text-sm font-semibold tracking-wide">
            🚀 TH.O | Impulsando el comercio ferretero inteligente en Venezuela
          </div>
        </div>
      </header>

      <div className="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          <aside
            className={`${
              showMobileFilters ? "fixed inset-0 z-50 bg-black/50" : "hidden"
            } md:block md:relative md:bg-transparent md:w-64 flex-shrink-0`}
          >
            <div
              className={`rounded-2xl bg-white p-4 ${
                showMobileFilters
                  ? "absolute left-0 top-0 h-full w-[min(86vw,22rem)] overflow-y-auto"
                  : ""
              }`}
            >
              {showMobileFilters && (
                <div className="mb-4 flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-bold">Menú de tienda</h3>
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="rounded-full p-2 hover:bg-slate-100"
                    aria-label="Cerrar menú"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {showMobileFilters && (
                <div className="mb-5 rounded-2xl p-3" style={{ backgroundColor: PALETTE.page }}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: PALETTE.crystalBlue }}>
                    Accesos rápidos
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => applyCategory("Todas")} className="rounded-xl bg-white px-3 py-2 text-left text-sm font-semibold">Todo</button>
                    <button type="button" onClick={() => { setSortBy("rating"); setShowMobileFilters(false); }} className="rounded-xl bg-white px-3 py-2 text-left text-sm font-semibold">Más vendidos</button>
                    <button type="button" onClick={() => applyCategory("Herramientas eléctricas")} className="rounded-xl bg-white px-3 py-2 text-left text-sm font-semibold">Herramientas</button>
                    <button type="button" onClick={() => applyCategory("Seguridad industrial")} className="rounded-xl bg-white px-3 py-2 text-left text-sm font-semibold">Seguridad</button>
                  </div>
                  <label className="mt-3 block text-xs font-semibold" style={{ color: PALETTE.spaceCadet }}>Ordenar</label>
                  <div className="relative mt-1">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none rounded-xl border bg-white px-3 py-2 pr-9 text-sm"
                      style={{ borderColor: PALETTE.pastelGray }}
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
                      onClick={() => applyCategory(category)}
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
                  className="w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm"
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
                  <MapPin
                    className="h-4 w-4"
                    style={{ color: PALETTE.crystalBlue }}
                  />
                  Urbanización
                </h4>

                <select
                  value={urbanization}
                  onChange={(e) => setUrbanization(e.target.value)}
                  className="w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm"
                  style={{ borderColor: PALETTE.pastelGray }}
                >
                  {urbanizations.map((item) => (
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
            <div className="mb-5 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
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
                  className="w-full appearance-none rounded-full border bg-white py-2 pl-4 pr-9 text-sm sm:w-auto"
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
              <div className="rounded-3xl bg-white px-4 py-16 text-center shadow-sm">
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

                <Button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-full px-6 font-semibold"
                  style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid justify-start gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,240px))]">
                {sortedProducts.map((product) => {
                  const allowed = canAddToCart(product);

                  return (
                    <motion.div
                      key={product.id}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <Card
                        className="h-full overflow-hidden rounded-xl border hover:shadow-lg sm:rounded-2xl"
                        style={{
                          borderColor: PALETTE.softBorder,
                          backgroundColor: PALETTE.white,
                        }}
                      >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                          <button
                            type="button"
                            onClick={() => setSelectedProduct(product)}
                            className="block h-full w-full text-left"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </button>

                          {product.discount > 0 && (
                            <span
                              className="absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-bold text-white"
                              style={{ backgroundColor: PALETTE.danger }}
                            >
                              -{product.discount}%
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleFavorite?.(product);
                            }}
                            className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm transition hover:scale-105"
                            aria-label={isFavorite?.(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                            title={isFavorite?.(product.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                          >
                            <Heart
                              className={`h-4 w-4 ${isFavorite?.(product.id) ? "fill-red-500 text-red-500" : ""}`}
                              style={{ color: isFavorite?.(product.id) ? undefined : PALETTE.spaceCadet }}
                            />
                          </button>
                        </div>

                        <CardContent className="space-y-1.5 p-2.5">
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
                              className="text-base font-bold"
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
                            <span>📍 {product.location}{product.urbanization ? ` - ${product.urbanization}` : ""}</span>
                          </div>

                          <p className="text-xs text-gray-500">
                            Vendido por: {product.seller}
                          </p>

                          <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                            <Button
                              className="rounded-full px-2 text-xs font-semibold sm:text-sm"
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
                              className="rounded-full px-2 text-xs font-semibold sm:text-sm"
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