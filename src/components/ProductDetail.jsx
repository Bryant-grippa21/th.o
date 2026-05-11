import React, { useMemo, useState } from "react";
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
  MessageCircle,
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

const brandLogo = "/logo_crop.jpeg";
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
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [question, setQuestion] = useState("");
  const [searchText, setSearchText] = useState("");

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

  const handleQuestionSubmit = (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    alert("Pregunta enviada al vendedor.");
    setQuestion("");
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
          <div className="mx-auto flex w-full items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all hover:scale-105"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              type="button"
            >
              <div
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
                style={{ backgroundColor: PALETTE.white }}
              >
                <img
                  src={brandLogo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <Store className="hidden h-7 w-7" style={{ color: PALETTE.spaceCadet }} />
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
                className="h-11 rounded-none rounded-r-[1.4rem] px-5"
                style={{
                  backgroundColor: PALETTE.sizzlingSunrise,
                  color: PALETTE.maastrichtBlue,
                }}
                onClick={handleSearch}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="hidden items-center gap-4 md:flex">
              <button
                type="button"
                onClick={onProfileClick}
                className="rounded-2xl px-3 py-2 transition-colors hover:bg-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
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
                className="rounded-2xl px-3 py-2"
                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
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
                  className="relative flex items-center gap-2 rounded-2xl px-3 py-2"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
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

      <div className="mx-auto max-w-7xl px-4 py-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm font-medium"
          style={{ color: PALETTE.crystalBlue }}
        >
          ← Volver
        </button>

        <section
          className="grid gap-6 rounded-3xl border bg-white p-4 lg:grid-cols-[120px_1fr_360px]"
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

          <div className="flex min-h-[480px] items-center justify-center rounded-2xl bg-white">
            <img
              src={images[selectedImage]}
              alt={safeProduct.name}
              className="max-h-[520px] w-full object-contain"
            />
          </div>

          <aside
            className="rounded-3xl border p-5"
            style={{ borderColor: PALETTE.softBorder }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">Nuevo | Stock disponible</p>
              <Heart className="h-6 w-6" style={{ color: PALETTE.crystalBlue }} />
            </div>

            <h1 className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
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
              <p className="text-4xl font-semibold" style={{ color: PALETTE.maastrichtBlue }}>
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

            <p className="mt-6 font-bold" style={{ color: PALETTE.maastrichtBlue }}>
              Stock: {safeProduct.stock} unidades
            </p>

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
            >
              Comprar ahora
            </Button>

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
          <h2 className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
            Descripción
          </h2>

          <div
            className={`mt-4 max-w-4xl text-lg leading-8 text-gray-600 ${
              showFullDescription ? "" : "max-h-48 overflow-hidden"
            }`}
          >
            <p>{safeProduct.description}</p>
            <p className="mt-4">
              Producto revisado por el vendedor. Puedes consultar disponibilidad, garantía,
              métodos de pago y condiciones especiales usando la sección de preguntas.
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
          className="mt-6 rounded-3xl border bg-white p-6"
          style={{ borderColor: PALETTE.softBorder }}
        >
          <h2 className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
            Preguntas y respuestas
          </h2>

          <form onSubmit={handleQuestionSubmit} className="mt-5 flex gap-3">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Escribe tu pregunta..."
              className="flex-1 rounded-xl border px-4 py-3 outline-none"
              style={{ borderColor: PALETTE.softBorder }}
            />

            <Button
              type="submit"
              className="rounded-xl px-8 font-bold"
              style={{
                backgroundColor: PALETTE.maastrichtBlue,
                color: PALETTE.white,
              }}
            >
              Preguntar
            </Button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="flex items-center gap-2 font-semibold">
              <MessageCircle className="h-4 w-4" />
              Pregunta destacada
            </p>
            <p className="mt-2 text-sm text-gray-600">¿Tiene garantía este producto?</p>
            <p className="mt-1 text-sm font-medium" style={{ color: PALETTE.success }}>
              Sí, cuenta con garantía directa del vendedor.
            </p>
          </div>
        </section>

        <section
          className="mt-6 grid gap-6 rounded-3xl border bg-white p-6 lg:grid-cols-[280px_1fr]"
          style={{ borderColor: PALETTE.softBorder }}
        >
          <div>
            <h2 className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
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
                <p className="text-sm text-yellow-700">Responde preguntas frecuentes</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
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
                <div className="aspect-square bg-slate-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3
                    className="line-clamp-2 min-h-[2.5rem] text-sm font-medium"
                    style={{ color: PALETTE.maastrichtBlue }}
                  >
                    {item.name}
                  </h3>

                  <p className="mt-3 text-xl font-semibold">{formatUSD(item.price)}</p>

                  <Button
                    type="button"
                    className="mt-3 w-full rounded-xl text-sm"
                    style={{
                      backgroundColor: PALETTE.sizzlingSunrise,
                      color: PALETTE.maastrichtBlue,
                    }}
                    onClick={() => addToCart?.({ ...item, quantity: 1, stock: item.stock || 10 })}
                  >
                    Agregar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
