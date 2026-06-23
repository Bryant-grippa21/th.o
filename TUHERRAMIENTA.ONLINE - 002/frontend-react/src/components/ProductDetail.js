import React, { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Store,
  ThumbsUp,
  Search,
  User,
  X,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
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
  success: "#0F766E",
};

const brandLogo = "/logo_full.png";
const exchangeRate = 466.51;

const formatUSD = (value) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

const formatVES = (value) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    maximumFractionDigits: 2,
  }).format(Number(value || 0) * exchangeRate);

const demoRelatedProducts = [
  {
    id: 201,
    name: "Taladro percutor inalámbrico 18V",
    price: 149.99,
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
    stock: 10,
  },
  {
    id: 202,
    name: "Juego de destornilladores 100 piezas",
    price: 39.99,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=500&q=80",
    stock: 10,
  },
  {
    id: 203,
    name: "Sierra circular profesional",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=80",
    stock: 10,
  },
  {
    id: 204,
    name: "Nivel láser autónivelante",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=500&q=80",
    stock: 10,
  },
  {
    id: 205,
    name: "Caja organizadora de herramientas",
    price: 29.99,
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&q=80",
    stock: 10,
  },
];

export default function ProductDetail({
  product,
  onBack,
  addToCart,
  relatedProducts = demoRelatedProducts,
  userData,
  cart = [],
  cartSummary,
  sessionType,
  isCartOpen,
  setIsCartOpen,
  updateCartQuantity,
  removeFromCart,
  onGoToCart,
  onProfileClick,
  onSearch,
  onSelectProduct,
  isFavorite,
  onToggleFavorite,
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setShowFullDescription(false);
  }, [product?.id]);

  const safeProduct = useMemo(() => {
    return (
      product || {
        id: 1,
        name: "Taladro percutor profesional 1/2",
        price: 89.99,
        rating: 4.8,
        reviews: 128,
        stock: 14,
        seller: "FerreMax",
        sellerName: "FerreMax",
        location: "Caracas, Venezuela",
        image:
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
        description:
          "Producto profesional para trabajos de construcción, mantenimiento y ferretería. Cuenta con excelente rendimiento, buena durabilidad y garantía del vendedor.",
      }
    );
  }, [product]);

  const images = useMemo(() => {
    const baseImage = safeProduct.image;
    return [baseImage, safeProduct.image2 || baseImage, safeProduct.image3 || baseImage];
  }, [safeProduct]);

  const safeSummary = useMemo(() => {
    if (cartSummary) return cartSummary;

    const subtotal = cart.reduce(
      (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    return {
      items: cart.reduce((acc, item) => acc + Number(item.quantity || 1), 0),
      subtotal,
    };
  }, [cart, cartSummary]);

  const handleAddToCart = () => {
    addToCart?.({
      ...safeProduct,
      quantity,
      seller: safeProduct.seller || safeProduct.sellerName,
    });
  };

  const handleFinanceInvoice = () => {
    const request = {
      id: `FIN-${Date.now()}`,
      type: "invoice_financing_product",
      productId: safeProduct.id,
      productName: safeProduct.name,
      seller: safeProduct.seller || safeProduct.sellerName,
      quantity,
      amount: Number(safeProduct.price || 0) * Number(quantity || 1),
      requestedBy: userData?.name || "Detallista",
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = JSON.parse(localStorage.getItem("invoiceFinancingRequests") || "[]");
      localStorage.setItem("invoiceFinancingRequests", JSON.stringify([request, ...saved]));
    } catch (error) {
      console.error("No se pudo registrar la solicitud de financiamiento:", error);
    }

    alert("✅ Solicitud de financiamiento de factura registrada. El equipo validará la operación y te notificará el estado.");
  };

  const handleSearch = () => {
    const cleanText = searchText.trim();
    if (!cleanText) return;
    onSearch?.(cleanText);
  };

  const toggleCart = () => {
    setIsCartOpen?.(!isCartOpen);
  };

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
              style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", maxWidth: "260px", flex: "0 0 auto" }}
              type="button"
            >
              <div
                className="flex h-14 w-auto max-w-[248px] shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-16"
                style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
              >
                <img
                  src={brandLogo}
                  alt="Logo"
                  className="h-full w-auto max-w-[230px] object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <Store className="hidden h-7 w-7" style={{ color: PALETTE.spaceCadet }} />
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
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
                placeholder="Buscar productos, líneas o categorías..."
                className="w-full border-0 text-slate-900 shadow-none focus-visible:ring-0"
              />

              <Button
                type="button"
                className="h-11 rounded-none rounded-r-[1.4rem] px-3 sm:px-5"
                style={{
                  backgroundColor: PALETTE.sizzlingSunrise,
                  color: PALETTE.maastrichtBlue,
                }}
                onClick={handleSearch}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="ml-auto hidden items-center gap-4 md:flex">
              <button
                type="button"
                onClick={onProfileClick}
                className="rounded-2xl px-3 py-2 transition-colors hover:bg-white/10 border"
                style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: PALETTE.sizzlingSunrise }}
                  >
                    <User className="h-4 w-4" style={{ color: PALETTE.maastrichtBlue }} />
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

              <div
                className="rounded-2xl px-3 py-2 border"
                style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
              >
                <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                  Tasa del día
                </p>
                <p className="text-sm font-semibold">Bs. S 466,51</p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={toggleCart}
                  className="relative flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm font-semibold">Carrito</span>

                  {safeSummary.items > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-bold"
                      style={{
                        backgroundColor: PALETTE.sizzlingSunrise,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      {safeSummary.items}
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
                        type="button"
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
                        <span className="font-bold">{formatUSD(safeSummary.subtotal)}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span>Total en Bs</span>
                        <span className="font-bold">
                          Bs. S {(Number(safeSummary.subtotal || 0) * exchangeRate).toFixed(2)}
                        </span>
                      </div>

                      <Button
                        type="button"
                        className="mt-4 w-full rounded-full font-semibold disabled:opacity-50"
                        style={{
                          backgroundColor: PALETTE.sizzlingSunrise,
                          color: PALETTE.maastrichtBlue,
                        }}
                        onClick={onGoToCart}
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
      </header>

      <div className="mx-auto w-full max-w-none px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-medium"
          style={{ color: PALETTE.crystalBlue }}
        >
          ← Volver
        </button>

        <section
          className="grid gap-4 rounded-2xl border bg-white p-3 sm:gap-6 sm:rounded-3xl sm:p-4 lg:grid-cols-[120px_minmax(0,1fr)_380px]"
          style={{ borderColor: PALETTE.softBorder }}
        >
          <div className="flex gap-3 overflow-x-auto lg:flex-col">
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedImage(index)}
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border p-1"
                style={{
                  borderColor:
                    selectedImage === index
                      ? PALETTE.sizzlingSunrise
                      : PALETTE.softBorder,
                }}
              >
                <img
                  src={img}
                  alt={`Vista ${index + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex min-h-[260px] items-center justify-center rounded-2xl bg-white sm:min-h-[380px] lg:min-h-[480px]">
            <img
              src={images[selectedImage]}
              alt={safeProduct.name}
              className="max-h-[320px] w-full object-contain sm:max-h-[420px] lg:max-h-[520px]"
            />
          </div>

          <aside
            className="rounded-2xl border p-4 sm:rounded-3xl sm:p-5"
            style={{ borderColor: PALETTE.softBorder }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500">Producto nuevo</p>
              <button
                type="button"
                onClick={() => onToggleFavorite?.(safeProduct)}
                className="rounded-full bg-white p-2 shadow-sm ring-1 ring-black/5 transition hover:scale-105"
                aria-label={isFavorite?.(safeProduct.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                title={isFavorite?.(safeProduct.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
              >
                <Heart
                  className={`h-6 w-6 ${isFavorite?.(safeProduct.id) ? "fill-red-500 text-red-500" : ""}`}
                  style={{ color: isFavorite?.(safeProduct.id) ? undefined : PALETTE.crystalBlue }}
                />
              </button>
            </div>

            <h1 className="text-xl font-bold sm:text-2xl" style={{ color: PALETTE.maastrichtBlue }}>
              {safeProduct.name}
            </h1>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm">{safeProduct.rating || 5}</span>
              <div className="flex" style={{ color: PALETTE.sizzlingSunrise }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-500">({safeProduct.reviews || 0})</span>
            </div>

            <div className="mt-5">
              <p className="text-3xl font-semibold sm:text-4xl" style={{ color: PALETTE.maastrichtBlue }}>
                {formatUSD(safeProduct.price)}
              </p>
              <p className="mt-1 text-lg text-gray-600">{formatVES(safeProduct.price)}</p>
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <p className="font-semibold" style={{ color: PALETTE.success }}>
                Producto disponible
              </p>
              <p className="text-gray-500">
                Ubicación: {safeProduct.location || "Consultar con el vendedor"}
              </p>
            </div>


            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium">Cantidad</span>

              <div
                className="inline-flex items-center rounded-full border px-2 py-1"
                style={{ borderColor: PALETTE.softBorder }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="rounded-full p-1 disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="min-w-[2rem] text-center font-semibold">{quantity}</span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((value) => Math.min(safeProduct.stock || 1, value + 1))
                  }
                  className="rounded-full p-1 disabled:opacity-40"
                  disabled={quantity >= safeProduct.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl py-4 text-base font-bold"
              style={{
                backgroundColor: PALETTE.sizzlingSunrise,
                color: PALETTE.maastrichtBlue,
              }}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
              <span>Agregar al carrito</span>
            </Button>

            <Button
              type="button"
              className="mt-3 w-full rounded-xl py-4 text-base font-bold"
              style={{
                backgroundColor: PALETTE.maastrichtBlue,
                color: PALETTE.white,
              }}
              onClick={() => {
                addToCart?.({ ...safeProduct, quantity });
                onGoToCart?.();
              }}
            >
              Comprar ahora
            </Button>

            {sessionType === "juridico_detallista" && (
              <Button
                type="button"
                className="mt-3 w-full rounded-xl border py-4 text-base font-bold"
                style={{
                  backgroundColor: PALETTE.white,
                  borderColor: PALETTE.sizzlingSunrise,
                  color: PALETTE.maastrichtBlue,
                }}
                onClick={handleFinanceInvoice}
              >
                Financiar factura
              </Button>
            )}

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm">
              <p className="flex items-center gap-2 font-semibold">
                <Store className="h-4 w-4" />
                Vendido por {safeProduct.seller || safeProduct.sellerName}
              </p>
              <p className="mt-1 text-gray-500">Reputación alta del vendedor</p>
            </div>
          </aside>
        </section>

        <section
          className="mt-6 rounded-3xl border bg-white p-6"
          style={{ borderColor: PALETTE.softBorder }}
        >
          <h2 className="text-xl font-bold sm:text-2xl" style={{ color: PALETTE.maastrichtBlue }}>
            Descripción
          </h2>

          <div
            className={`mt-4 max-w-4xl text-lg leading-8 text-gray-600 ${
              showFullDescription ? "" : "max-h-48 overflow-hidden"
            }`}
          >
            <p>{safeProduct.description}</p>
            <p className="mt-4">
              Producto revisado por el vendedor. Consulta disponibilidad, garantía,
              métodos de pago y condiciones especiales directamente con la tienda antes de finalizar la compra.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFullDescription((value) => !value)}
            className="mt-4 flex items-center gap-1 text-sm font-medium"
            style={{ color: PALETTE.crystalBlue }}
          >
            {showFullDescription ? "Ver menos" : "Ver descripción completa"}
            <ChevronDown
              className={`h-4 w-4 transition ${showFullDescription ? "rotate-180" : ""}`}
            />
          </button>
        </section>

        <section
          className="mt-6 grid gap-6 rounded-3xl border bg-white p-6 lg:grid-cols-[280px_1fr]"
          style={{ borderColor: PALETTE.softBorder }}
        >
          <div>
            <h2 className="text-xl font-bold sm:text-2xl" style={{ color: PALETTE.maastrichtBlue }}>
              Opiniones del producto
            </h2>

            <div className="mt-5 flex items-center gap-3">
              <span className="text-6xl font-semibold" style={{ color: "#3483FA" }}>
                5.0
              </span>
              <div>
                <div className="flex" style={{ color: "#3483FA" }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-500">7 calificaciones</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold">Reputación del vendedor</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-green-50 p-4">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                <p className="mt-2 font-bold text-green-700">Vendedor confiable</p>
                <p className="text-sm text-green-700">Alta tasa de entregas exitosas</p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <Store className="h-6 w-6 text-blue-600" />
                <p className="mt-2 font-bold text-blue-700">+5 mil ventas</p>
                <p className="text-sm text-blue-700">Historial comercial sólido</p>
              </div>

              <div className="rounded-2xl bg-yellow-50 p-4">
                <ThumbsUp className="h-6 w-6 text-yellow-600" />
                <p className="mt-2 font-bold text-yellow-700">Buena atención</p>
                <p className="text-sm text-yellow-700">Atención clara antes y después de la compra</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold sm:text-2xl" style={{ color: PALETTE.maastrichtBlue }}>
              Productos relacionados
            </h2>

            <button
              type="button"
              className="rounded-full border p-3"
              style={{ borderColor: PALETTE.softBorder }}
            >
              <ChevronRight className="h-5 w-5" style={{ color: PALETTE.crystalBlue }} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                style={{ borderColor: PALETTE.softBorder }}
              >
                <div className="relative aspect-square bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onSelectProduct?.(item)}
                    className="h-full w-full text-left"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite?.(item);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm transition hover:scale-105"
                    aria-label={isFavorite?.(item.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                    title={isFavorite?.(item.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorite?.(item.id) ? "fill-red-500 text-red-500" : ""}`}
                      style={{ color: isFavorite?.(item.id) ? undefined : PALETTE.spaceCadet }}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3
                    className="line-clamp-2 min-h-[2.5rem] text-sm font-medium"
                    style={{ color: PALETTE.maastrichtBlue }}
                  >
                    {item.name}
                  </h3>

                  <p className="mt-3 text-xl font-semibold">{formatUSD(item.price)}</p>

                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      className="rounded-xl text-sm"
                      style={{
                        backgroundColor: PALETTE.sizzlingSunrise,
                        color: PALETTE.maastrichtBlue,
                      }}
                      onClick={() => addToCart?.({ ...item, quantity: 1, stock: item.stock || 10 })}
                    >
                      Agregar
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl text-sm"
                      style={{
                        borderColor: PALETTE.crystalBlue,
                        color: PALETTE.spaceCadet,
                      }}
                      onClick={() => onSelectProduct?.(item)}
                    >
                      Ver producto
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
