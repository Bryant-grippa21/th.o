/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useEffect } from "react";
import AuthPage from "./login";
import UserProfile from "./UserProfile";
import AdminDashboard from "./UserProfile/portals/AdminDashboard";
import Marketplace from "./marketplace";
import CartPage from "./carrito";
import ProductDetail from "./ProductDetail";
import {
  Search,
  ShoppingCart,
  Menu,
  Star,
  Heart,
  Package,
  ChevronRight,
  Store,
  EyeOff,
  X,
  Minus,
  Plus,
  Trash2,
  User,
  Truck,
  ShieldCheck,
  Award,
  CreditCard,
  Headphones,
  BadgeDollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Badge } from "./ui/Badge";

// ==========================================================
// CONFIGURACION GENERAL DE MARCA
// ==========================================================

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
  softSuccess: "#DFF6F1",
  danger: "#B42318",
  softDanger: "rgba(180,35,24,0.08)",
};

// Ruta de logo
const brandLogo = "/logo_full.png";

const exchangeRate = 466.51;
const CASHBACK_RATE = 0.025;

// ==========================================================
// DATOS DE CATEGORIAS
// ==========================================================

const categories = [
  {
    id: 1,
    name: "Herramientas eléctricas",
    description: "Taladros, esmeriles, sierras y más",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Taladros", "Esmeriles", "Sierras"],
  },
  {
    id: 2,
    name: "Ferretería general",
    description: "Tornillos, llaves, tuercas y accesorios",
    image:
      "https://images.unsplash.com/photo-1581147036324-c1c0a5b3c6a4?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Llaves", "Destornilladores", "Tornillería"],
  },
  {
    id: 3,
    name: "Seguridad industrial",
    description: "Protección personal para cada jornada",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Guantes", "Cascos", "Lentes"],
  },
  {
    id: 4,
    name: "Pintura y acabados",
    description: "Rodillos, brochas y selladores",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
    subcategories: ["Brochas", "Rodillos", "Selladores"],
  },
];


// ==========================================================
// BLOQUES DE CATEGORIAS DESTACADAS - PAGINA PRINCIPAL
// Para cambiar estas tarjetas grandes:
// 1. Edita title para el titulo del bloque.
// 2. Edita targetCategory si quieres que abra una categoria distinta.
// 3. Cambia items[].image por tus imagenes propias.
// 4. Cambia items[].label por el texto visible debajo de cada imagen.
// ==========================================================
const featuredCategoryBlocks = [
  {
    id: "top-tools",
    title: "Herramientas top",
    targetCategory: "Herramientas eléctricas",
    items: [
      { label: "Taladros", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80" },
      { label: "Destornilladores", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=700&q=80" },
      { label: "Llaves", image: "https://images.unsplash.com/photo-1581147036324-c1c0a5b3c6a4?auto=format&fit=crop&w=700&q=80" },
      { label: "Accesorios", image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=700&q=80" },
    ],
  },
  {
    id: "paint-tools",
    title: "Todo para pintura",
    targetCategory: "Pintura y acabados",
    items: [
      { label: "Rodillos", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=700&q=80" },
      { label: "Selladores", image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=700&q=80" },
      { label: "Brochas", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80" },
      { label: "Acabados", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=700&q=80" },
    ],
  },
  {
    id: "safety-tools",
    title: "Seguridad industrial",
    targetCategory: "Seguridad industrial",
    items: [
      { label: "Guantes", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=700&q=80" },
      { label: "Cascos", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=700&q=80" },
      { label: "Lentes", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=700&q=80" },
      { label: "Protección", image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=700&q=80" },
    ],
  },
  {
    id: "heavy-tools",
    title: "Herramientas pesadas",
    targetCategory: "Herramientas eléctricas",
    items: [
      { label: "Taladros industriales", image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=700&q=80" },
      { label: "Esmeriles", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80" },
      { label: "Sierras", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=700&q=80" },
      { label: "Equipos industriales", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=700&q=80" },
    ],
  },
];



// ==========================================================
// CARRUSEL DE IMAGENES - PAGINA PRINCIPAL
// Para cambiar las imagenes del carrusel:
// 1. Reemplaza imageDesktop por una imagen horizontal grande (1920x800 recomendado).
// 2. Reemplaza imageMobile por una imagen vertical o recortada para telefono (768x1024 recomendado).
// 3. Ajusta eyebrow, title, description y ctaText segun la promocion.
// ==========================================================
const heroSlides = [
  {
    id: 1,
    eyebrow: "Vista principal tipo Amazon",
    title: "Tu ferretería\ncon identidad propia",
    description: "Rebranding con tu logo, tu paleta y un carrito más útil: cashback detallado por producto, edición de cantidades y eliminación directa.",
    ctaText: "Explorar ofertas",
    category: "Todas",
    imageDesktop: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=2200&q=85",
    imageMobile: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    eyebrow: "Herramientas eléctricas",
    title: "Potencia lista\npara cada obra",
    description: "Taladros, esmeriles y sierras para acelerar tus proyectos con productos seleccionados.",
    ctaText: "Ver herramientas",
    category: "Herramientas eléctricas",
    imageDesktop: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=2200&q=85",
    imageMobile: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    eyebrow: "Seguridad industrial",
    title: "Protección real\npara tu jornada",
    description: "Cascos, guantes, lentes y equipamiento para trabajar con confianza de principio a fin.",
    ctaText: "Comprar seguridad",
    category: "Seguridad industrial",
    imageDesktop: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=2200&q=85",
    imageMobile: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    eyebrow: "Pintura y acabados",
    title: "Dale acabado\nprofesional",
    description: "Brochas, rodillos, selladores y accesorios para transformar cada superficie.",
    ctaText: "Ver pintura",
    category: "Pintura y acabados",
    imageDesktop: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=2200&q=85",
    imageMobile: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    eyebrow: "Ferretería general",
    title: "Todo lo pequeño\nque sostiene lo grande",
    description: "Tornillos, llaves, tuercas y accesorios esenciales para completar cualquier reparación.",
    ctaText: "Explorar ferretería",
    category: "Ferretería general",
    imageDesktop: "https://images.unsplash.com/photo-1581147036324-c1c0a5b3c6a4?auto=format&fit=crop&w=2200&q=85",
    imageMobile: "https://images.unsplash.com/photo-1581147036324-c1c0a5b3c6a4?auto=format&fit=crop&w=900&q=85",
  },
];

const homeFeatures = [
  { title: "Compra 100% segura", description: "Protegemos tus datos", icon: ShieldCheck },
  { title: "Productos originales", description: "Garantía oficial", icon: Award },
  { title: "Precios competitivos", description: "Ofertas pensadas para ahorrar", icon: BadgeDollarSign },
  { title: "Atención al cliente", description: "Lun a Vie 9 a 18hs", icon: Headphones },
];

// ==========================================================
// DATOS DE PRODUCTOS
// ==========================================================

const products = [
  {
    id: 1,
    name: "Taladro percutor 1/2 profesional",
    description: "Potencia robusta para trabajos de concreto y metal.",
    category: "Herramientas eléctricas",
    line: "Taladros",
    price: 89.99,
    stock: 14,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    sellerName: "FerreMax Detalle",
    sellerRole: "DETALLISTA",
  },
  {
    id: 2,
    name: "Esmeril angular 4 1/2",
    description: "Compacto, veloz y listo para corte y desbaste.",
    category: "Herramientas eléctricas",
    line: "Esmeriles",
    price: 64.5,
    stock: 8,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
    sellerName: "FerreMax Detalle",
    sellerRole: "DETALLISTA",
  },
  {
    id: 3,
    name: "Juego de llaves combinadas 12 piezas",
    description: "Acero reforzado con estuche organizador.",
    category: "Ferretería general",
    line: "Llaves",
    price: 24.9,
    stock: 22,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
    sellerName: "Distribuidora Atlas",
    sellerRole: "MAYORISTA",
  },
  {
    id: 4,
    name: "Kit destornilladores magnéticos",
    description: "Puntas resistentes para uso doméstico e industrial.",
    category: "Ferretería general",
    line: "Destornilladores",
    price: 17.25,
    stock: 31,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=80",
    sellerName: "Distribuidora Atlas",
    sellerRole: "MAYORISTA",
  },
  {
    id: 5,
    name: "Guantes anticorte nivel 5",
    description: "Seguridad y agarre para trabajo continuo.",
    category: "Seguridad industrial",
    line: "Guantes",
    price: 9.99,
    stock: 45,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1200&q=80",
    sellerName: "FerreNova Retail",
    sellerRole: "DETALLISTA",
  },
  {
    id: 6,
    name: "Casco de seguridad con ajuste rápido",
    description: "Ligero, cómodo y certificado para obra.",
    category: "Seguridad industrial",
    line: "Cascos",
    price: 14.5,
    stock: 19,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    sellerName: "FerreNova Retail",
    sellerRole: "DETALLISTA",
  },
  {
    id: 7,
    name: "Rodillo profesional antigoteo",
    description: "Cobertura uniforme para acabados limpios.",
    category: "Pintura y acabados",
    line: "Rodillos",
    price: 7.8,
    stock: 27,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80",
    sellerName: "Pinturas del Centro",
    sellerRole: "DETALLISTA",
  },
  {
    id: 8,
    name: "Sellador acrílico 1 galón",
    description: "Protección duradera para superficies interiores y exteriores.",
    category: "Pintura y acabados",
    line: "Selladores",
    price: 18.75,
    stock: 16,
    rating: 4.1,
    image:
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=80",
    sellerName: "Pinturas Mayor Pro",
    sellerRole: "MAYORISTA",
  },
];

// ==========================================================
// FUNCIONES AUXILIARES DE FORMATO
// ==========================================================

const formatUSD = (value) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatVES = (value) => {
  if (!exchangeRate || typeof value !== 'number' || isNaN(value)) {
    return "Bs. 0,00";
  }
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    maximumFractionDigits: 2,
  }).format(value * exchangeRate);
};

const productCashback = (price, quantity = 1) => price * quantity * CASHBACK_RATE;

// ==========================================================
// COMPONENTE: STARS
// ==========================================================

function Stars({ value }) {
  return (
    <div className="flex items-center gap-1" style={{ color: PALETTE.sizzlingSunrise }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(value) ? "fill-current" : ""}`}
        />
      ))}
      <span className="ml-1 text-sm" style={{ color: PALETTE.crystalBlue }}>
        {value}
      </span>
    </div>
  );
}

// ==========================================================
// COMPONENTE: CONTROL DE CANTIDAD
// ==========================================================

function QuantityEditor({
  value,
  onDecrease,
  onIncrease,
  disabledDecrease,
  disabledIncrease,
}) {
  return (
    <div
      className="inline-flex items-center rounded-full border px-2 py-1"
      style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}
    >
      <button
        onClick={onDecrease}
        disabled={disabledDecrease}
        className="rounded-full p-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold">
        {value}
      </span>
      <button
        onClick={onIncrease}
        disabled={disabledIncrease}
        className="rounded-full p-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ==========================================================
// COMPONENTE: PRODUCTCARD ORIGINAL (para marketplace)
// ==========================================================

function ProductCard({ product, onAdd, canBuyProduct, sessionType, isFavorite, onToggleFavorite }) {
  const allowed = canBuyProduct(product);
  const favorite = isFavorite?.(product.id);

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className="h-full overflow-hidden rounded-[2rem] border shadow-sm"
        style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}
      >
        <div
          className="relative aspect-square overflow-hidden"
          style={{ backgroundColor: PALETTE.pastelGray }}
        >
          <img
            src={product.image}
            alt={`Imagen de ${product.name}`}
            className="h-full w-full object-cover"
          />

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite?.(product);
            }}
            className="absolute right-3 top-3 rounded-full p-2 shadow transition hover:scale-105"
            style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
            aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={`h-4 w-4 ${favorite ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: favorite ? undefined : PALETTE.spaceCadet }}
            />
          </button>
        </div>

        <CardContent className="space-y-3 p-4">
          <div className="space-y-1">
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: PALETTE.crystalBlue }}
            >
              {product.line}
            </p>

            <h3
              className="line-clamp-2 min-h-[3.5rem] text-base font-semibold"
              style={{ color: PALETTE.maastrichtBlue }}
            >
              {product.name}
            </h3>

            <p className="line-clamp-2 text-sm" style={{ color: PALETTE.spaceCadet }}>
              {product.description}
            </p>
          </div>

          <Stars value={product.rating} />

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge
              variant="outline"
              className="rounded-full"
              style={{ borderColor: PALETTE.crystalBlue, color: PALETTE.spaceCadet }}
            >
              Vendedor: {product.sellerRole}
            </Badge>

            <Badge
              variant="outline"
              className="rounded-full"
              style={{ borderColor: PALETTE.pastelGray, color: PALETTE.spaceCadet }}
            >
              {product.sellerName}
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <span
                className="text-2xl font-bold"
                style={{ color: PALETTE.maastrichtBlue }}
              >
                {formatUSD(product.price)}
              </span>

              <span className="text-sm" style={{ color: PALETTE.crystalBlue }}>
                {formatVES(product.price)}
              </span>
            </div>

            {sessionType === "natural" && (
              <p className="text-xs font-medium" style={{ color: PALETTE.success }}>
                Cashback por unidad: {formatUSD(productCashback(product.price))}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: PALETTE.sizzlingSunrise,
                color: PALETTE.maastrichtBlue,
              }}
              onClick={() => onAdd(product)}
              disabled={!allowed}
            >
              {allowed ? "Agregar al carrito" : "Sin acceso"}
            </Button>

            <Button
              variant="outline"
              className="flex-1 rounded-full"
              style={{ borderColor: PALETTE.spaceCadet, color: PALETTE.spaceCadet }}
            >
              Ver
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ==========================================================
// COMPONENTE: PRODUCTCARD COMPACTO (para página principal)
// ==========================================================

function CompactProductCard({ product, onAdd, canBuyProduct, sessionType, onViewProduct, isFavorite, onToggleFavorite }) {
  const allowed = canBuyProduct(product);
  const favorite = isFavorite?.(product.id);

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card
        className="overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all"
        style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}
      >
        <div className="flex gap-3 p-3">
          {/* Imagen pequeña */}
          <div
            className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
            style={{ backgroundColor: PALETTE.pastelGray }}
            onClick={() => onViewProduct && onViewProduct(product)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Contenido compacto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium uppercase truncate"
                  style={{ color: PALETTE.crystalBlue }}
                >
                  {product.line}
                </p>
                <h4
                  className="text-sm font-semibold truncate cursor-pointer hover:text-opacity-70"
                  style={{ color: PALETTE.maastrichtBlue }}
                  onClick={() => onViewProduct && onViewProduct(product)}
                >
                  {product.name}
                </h4>
              </div>
              
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite?.(product);
                  }}
                  className="rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition hover:scale-105"
                  aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                  title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                  <Heart
                    className={`h-4 w-4 ${favorite ? "fill-red-500 text-red-500" : ""}`}
                    style={{ color: favorite ? undefined : PALETTE.spaceCadet }}
                  />
                </button>

                {/* Precio compacto */}
                <div className="text-right">
                  <span
                    className="text-sm font-bold"
                    style={{ color: PALETTE.maastrichtBlue }}
                  >
                    {formatUSD(product.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Rating compacto */}
            <div className="flex items-center gap-1 mt-1">
              <div className="flex items-center gap-0.5" style={{ color: PALETTE.sizzlingSunrise }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.rating) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                {product.rating}
              </span>
            </div>

            {/* Botones de acción en fila - MISMO TAMAÑO */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                className="rounded-lg px-2 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: allowed ? PALETTE.sizzlingSunrise : PALETTE.pastelGray,
                  color: allowed ? PALETTE.maastrichtBlue : PALETTE.spaceCadet,
                }}
                onClick={() => onAdd(product)}
                disabled={!allowed}
              >
                {allowed ? "➕ Agregar" : "🔒 Sin acceso"}
              </Button>
              
              <Button
                className="rounded-lg px-2 py-2 text-xs font-semibold transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "transparent",
                  border: `1px solid ${PALETTE.crystalBlue}`,
                  color: PALETTE.spaceCadet,
                }}
                onClick={() => onViewProduct && onViewProduct(product)}
              >
                Ver
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// ==========================================================
// COMPONENTE: ITEM DEL CARRITO
// ==========================================================

function CartItem({ item, onDecrease, onIncrease, onRemove, sessionType }) {
  const lineTotal = item.price * item.quantity;
  const cashback = productCashback(item.price, item.quantity);

  return (
    <div
      className="rounded-[1.5rem] border p-3"
      style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}
    >
      <div className="flex gap-3">
        <img
          src={item.image}
          alt={`Imagen de ${item.name}`}
          className="h-16 w-16 rounded-xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 text-sm font-semibold"
            style={{ color: PALETTE.maastrichtBlue }}
          >
            {item.name}
          </p>

          <p className="mt-1 text-xs" style={{ color: PALETTE.crystalBlue }}>
            Cantidad actual: {item.quantity} · Stock: {item.stock}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <QuantityEditor
              value={item.quantity}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
              disabledDecrease={item.quantity <= 1}
              disabledIncrease={item.quantity >= item.stock}
            />

            <button
              onClick={onRemove}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: PALETTE.softDanger, color: PALETTE.danger }}
              aria-label="Eliminar producto"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div
        className="mt-3 grid gap-2 rounded-2xl p-3 text-sm"
        style={{ backgroundColor: PALETTE.page }}
      >
        <div className="flex items-center justify-between">
          <span style={{ color: PALETTE.spaceCadet }}>Precio unitario</span>
          <span className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>
            {formatUSD(item.price)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span style={{ color: PALETTE.spaceCadet }}>Subtotal producto</span>
          <span className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>
            {formatUSD(lineTotal)}
          </span>
        </div>

        {sessionType === "natural" && (
          <div className="flex items-center justify-between">
            <span style={{ color: PALETTE.spaceCadet }}>Cashback de este producto</span>
            <span className="font-semibold" style={{ color: PALETTE.success }}>
              {formatUSD(cashback)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================================
// COMPONENTE PRINCIPAL
// ==========================================================

export default function TuherramientaOnlineAmazonUI() {
  const [page, setPage] = useState("home");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sessionType, setSessionType] = useState("juridico_detallista"); // natural, juridico_detallista, juridico_mayorista, guest
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showFullStore, setShowFullStore] = useState(false);
  const [showCartPage, setShowCartPage] = useState(false); // 👈 NUEVO ESTADO
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [paymentValidationMessage, setPaymentValidationMessage] = useState(null);
  const [cashbackBalance, setCashbackBalance] = useState(() => Number(localStorage.getItem("userCashbackBalance") || 0));
  const [favorites, setFavorites] = useState([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const activeHeroSlide = heroSlides[currentHeroSlide];

  useEffect(() => {
    try {
      const savedMessage = localStorage.getItem("latestPaymentValidationMessage");
      if (savedMessage) {
        setPaymentValidationMessage(JSON.parse(savedMessage));
      }
    } catch (error) {
      console.error("No se pudo leer el mensaje de validación de pago:", error);
    }
  }, []);

  const goToHeroSlide = (direction) => {
    setCurrentHeroSlide((current) =>
      direction === "next"
        ? (current + 1) % heroSlides.length
        : (current - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const handleHeroCta = (category) => {
    setSelectedCategory(category || "Todas");
    setShowFullStore(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const [userData, setUserData] = useState({
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "0412-1234567",
    address: "Av. Principal, Caracas, Venezuela",
    memberSince: "Enero 2024",
    userType: "Usuario Natural",
    sellerName: null
  });

  useEffect(() => {
    const getUserData = () => {
      switch (sessionType) {
        case "natural":
          return {
            name: "Carlos Rodríguez",
            email: "carlos.rodriguez@email.com",
            phone: "0412-5551234",
            address: "Av. Libertador, Caracas, Venezuela",
            memberSince: "Marzo 2024",
            userType: "Usuario Natural",
            sellerName: null
          };
        case "juridico_detallista":
          return {
            name: "Ferretería El Constructor C.A.",
            email: "ventas@elconstructor.com",
            phone: "0212-5556789",
            address: "Zona Industrial, Valencia, Venezuela",
            memberSince: "Enero 2023",
            userType: "Jurídico Detallista",
            sellerName: "Ferretería El Constructor"
          };
        case "juridico_mayorista":
          return {
            name: "Distribuidora Industrial Mayor",
            email: "compras@distribuidoramayor.com",
            phone: "0414-5559012",
            address: "Av. Principal, Maracaibo, Venezuela",
            memberSince: "Agosto 2022",
            userType: "Jurídico Mayorista",
            sellerName: "Distribuidora Atlas"
          };
        default:
          return {
            name: "Invitado",
            email: "",
            phone: "",
            address: "",
            memberSince: "",
            userType: "Invitado",
            sellerName: null
          };
      }
    };

    const data = getUserData();
    if (data) {
      setUserData(data);
    }
  }, [sessionType]);

  // ==========================================================
  // INICIO: CAMBIAR USUARIO DEMO
  // ==========================================================

  const demoUserOptions = [
    { label: "Natural", value: "natural" },
    { label: "Detallista", value: "juridico_detallista" },
    { label: "Mayorista", value: "juridico_mayorista" },
    { label: "Administrador", value: "admin" },
  ];

  const currentDemoUserValue = page === "admin-dashboard" ? "admin" : sessionType;

  const handleDemoUserChange = (value) => {
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
    setShowFullStore(false);
    setShowCartPage(false);
    setSelectedProductDetail(null);

    if (value === "admin") {
      const adminUser = {
        name: "Administrador TH.O",
        email: "admin@tuherramientaonline.com",
        phone: "",
        address: "",
        memberSince: "Administrador",
        userType: "Administrador",
        sellerName: null,
        role: "admin",
      };

      localStorage.setItem("authToken", "demo-admin-token");
      localStorage.setItem("userData", JSON.stringify(adminUser));

      setUserData(adminUser);
      setPage("admin-dashboard");
      return;
    }

    localStorage.setItem("authToken", `demo-${value}-token`);
    setSessionType(value);
    setPage(value === "juridico_mayorista" || value === "juridico_detallista" ? "profile" : "home");
  };

  // ==========================================================
  // FIN: CAMBIAR USUARIO DEMO
  // ==========================================================

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);


  useEffect(() => {
    const syncCashbackBalance = () => {
      setCashbackBalance(Number(localStorage.getItem("userCashbackBalance") || 0));
    };
    window.addEventListener("storage", syncCashbackBalance);
    window.addEventListener("cashback-balance-updated", syncCashbackBalance);
    return () => {
      window.removeEventListener("storage", syncCashbackBalance);
      window.removeEventListener("cashback-balance-updated", syncCashbackBalance);
    };
  }, []);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('userFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if ((sessionType === "juridico_mayorista" || sessionType === "juridico_detallista") && page === "home") {
      setShowFullStore(false);
      setShowCartPage(false);
      setSelectedProductDetail(null);
      setPage("profile");
    }
  }, [sessionType, page]);

  const isFavorite = (productId) => favorites.some((item) => String(item.id) === String(productId));

  const toggleFavorite = (product) => {
    if (!product?.id) return;
    setFavorites((current) => {
      if (current.some((item) => String(item.id) === String(product.id))) {
        return current.filter((item) => String(item.id) !== String(product.id));
      }
      return [{ ...product, savedAt: new Date().toISOString() }, ...current];
    });
  };

  // 👈 FUNCIÓN PARA VOLVER DEL CARRITO
  const handleBackFromCart = () => {
    setShowCartPage(false);
  };

  const getSearchSuggestions = (searchText) => {
    if (!searchText.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = searchText.toLowerCase();
    
    const suggestions = products
      .filter(product => {
        return product.name.toLowerCase().includes(searchLower) ||
               product.description.toLowerCase().includes(searchLower) ||
               product.category.toLowerCase().includes(searchLower) ||
               product.line.toLowerCase().includes(searchLower);
      })
      .slice(0, 5)
      .map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        line: product.line,
        price: product.price,
        image: product.image,
        sellerRole: product.sellerRole
      }));
    
    setSearchSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      getSearchSuggestions(value);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const handleSuggestionClick = (product) => {
    setQuery(product.name);
    setShowSuggestions(false);
    setShowFullStore(true);
  };

  const accessProfile = useMemo(() => {
    switch (sessionType) {
      case "natural":
        return {
          label: "Usuario natural",
          canViewSellerRoles: ["DETALLISTA"],
          canBuySellerRoles: ["DETALLISTA"],
          canUseCart: true,
          canCheckout: true,
        };

      case "juridico_detallista":
        return {
          label: "Jurídico detallista",
          canViewSellerRoles: ["MAYORISTA"],
          canBuySellerRoles: ["MAYORISTA"],
          canUseCart: true,
          canCheckout: true,
        };

      case "juridico_mayorista":
        return {
          label: "Jurídico mayorista",
          canViewSellerRoles: ["MAYORISTA"],
          canBuySellerRoles: [],
          canUseCart: false,
          canCheckout: false,
        };

      default:
        return {
          label: "Invitado",
          canViewSellerRoles: ["DETALLISTA"],
          canBuySellerRoles: [],
          canUseCart: true,
          canCheckout: false,
        };
    }
  }, [sessionType]);

  const filteredProducts = useMemo(() => {
    if (sessionType === "juridico_mayorista") {
      const sellerName = userData?.sellerName || userData?.name;
      if (sellerName) {
        return products.filter((product) => {
          const bySeller = product.sellerName === sellerName;
          const byCategory =
            selectedCategory === "Todas" || product.category === selectedCategory;
          const text = `${product.name} ${product.description} ${product.line} ${product.category} ${product.sellerRole}`.toLowerCase();
          const byQuery = text.includes(query.toLowerCase());
          return bySeller && byCategory && byQuery;
        });
      }
      return [];
    }
    
    return products.filter((product) => {
      const byRole = accessProfile.canViewSellerRoles.includes(product.sellerRole);
      const byCategory =
        selectedCategory === "Todas" || product.category === selectedCategory;
      const text = `${product.name} ${product.description} ${product.line} ${product.category} ${product.sellerRole}`.toLowerCase();
      const byQuery = text.includes(query.toLowerCase());
      return byRole && byCategory && byQuery;
    });
  }, [query, selectedCategory, accessProfile, sessionType, userData]);

  const cartSummary = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cashback = cart.reduce(
      (acc, item) => acc + productCashback(item.price, item.quantity),
      0
    );

    return {
      items: cart.reduce((acc, item) => acc + item.quantity, 0),
      subtotal,
      subtotalBs: subtotal * exchangeRate,
      cashback,
    };
  }, [cart]);

  const canBuyProduct = (product) => {
    if (sessionType === "guest") return false;
    if (sessionType === "juridico_mayorista") return false;
    if (sessionType === "natural") {
      return product.sellerRole === "DETALLISTA";
    }
    if (sessionType === "juridico_detallista") {
      return product.sellerRole === "MAYORISTA";
    }
    return false;
  };

  // 👈 FUNCIÓN MODIFICADA: Ahora va a la página del carrito
  const handleCheckout = () => {
    if (sessionType === "guest") {
      alert("⚠️ Debes iniciar sesión o registrarte para proceder con el pago.\n\nPor favor, inicia sesión para completar tu compra.");
      setPage("auth");
    } else if (sessionType === "juridico_mayorista") {
      alert("⚠️ Los mayoristas no pueden realizar compras en el marketplace. Esta plataforma es solo para ventas.");
    } else {
      // 👇 Esto es lo importante - Abre la página del carrito
      setShowCartPage(true);
      setIsCartOpen(false);
    }
  };

  const addToCart = (product) => {
    if (sessionType === "juridico_mayorista") {
      alert("⚠️ Los mayoristas no pueden agregar productos al carrito. Esta plataforma es solo para ventas.");
      return;
    }
    
    if (!canBuyProduct(product)) {
      alert(`⚠️ No tienes permisos para comprar este producto. Los ${sessionType === "natural" ? "naturales solo pueden comprar de vendedores DETALLISTAS" : "detallistas solo pueden comprar de vendedores MAYORISTAS"}.`);
      return;
    }

    setIsCartOpen(true);

    const quantityToAdd = Math.max(1, Number(product.quantity || 1));

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(
                  Number(item.quantity || 1) + quantityToAdd,
                  Number(item.stock || product.stock || 99)
                ),
              }
            : item
        );
      }

      return [...prev, { ...product, quantity: Math.min(quantityToAdd, Number(product.stock || 99)) }];
    });
  };

  const updateCartQuantity = (productId, nextQuantity) => {
    if (typeof nextQuantity !== 'number' || isNaN(nextQuantity) || nextQuantity < 1) {
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;
        const newQuantity = Math.max(1, Math.min(nextQuantity, item.stock));
        return {
          ...item,
          quantity: newQuantity,
        };
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleViewProduct = (product) => {
    setSelectedProductDetail(product);
    setIsCartOpen(false);
  };

  // ==========================================================
  // CONDICIONES DE RENDERIZADO (EL ORDEN ES IMPORTANTE)
  // ==========================================================

  // 👈 PRIMERA CONDICIÓN: Página del carrito
  if (showCartPage) {
    return (
      <CartPage
        cart={cart}
        cartSummary={cartSummary}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        onBack={handleBackFromCart}
        onContinueShopping={handleBackFromCart}
        sessionType={sessionType}
        userData={userData}
        addToCart={addToCart}
        onViewProduct={(product) => {
          setShowCartPage(false);
          setSelectedProductDetail(product);
          setIsCartOpen(false);
        }}
        onPaymentVerificationSent={(order) => {
          setCart([]);
          localStorage.setItem("cart", JSON.stringify([]));
          try {
            const savedHistory = JSON.parse(localStorage.getItem("userPurchaseHistory") || "[]");
            const purchaseRecord = {
              id: order?.id || `ORD-${Date.now()}`,
              orderNumber: order?.id || `ORD-${Date.now()}`,
              date: new Date().toLocaleDateString("es-ES"),
              total: Number(order?.total || cartSummary.subtotal || 0),
              status: "processing",
              paymentMethod: "Pago reportado",
              paymentStatus: "En validación",
              storeName: order?.storeName || "Varias tiendas",
              items: Array.isArray(order?.items) ? order.items : [],
              createdAt: new Date().toISOString(),
            };
            localStorage.setItem("userPurchaseHistory", JSON.stringify([purchaseRecord, ...savedHistory]));
          } catch (error) {
            console.error("No se pudo guardar la compra en el historial:", error);
          }
          setShowCartPage(false);
          setIsCartOpen(false);
          setSelectedProductDetail(null);
          setPage("home");
          setPaymentValidationMessage({
            id: order?.id || Date.now(),
            message: "Tu pedido está en validación de pago. En un tiempo de 3 minutos ya puedes ir a retirar el pedido.",
            createdAt: new Date().toISOString(),
          });
        }}
      />
    );
  }

  // SEGUNDA CONDICIÓN: Auth (login/register)
  if (page === "auth") {
    return (
      <AuthPage
        onBack={() => setPage("home")}
        onAuthSuccess={(session) => {
          const role = String(
            session?.user?.role ||
            session?.user?.userType ||
            session?.redirectTo ||
            ""
          ).toLowerCase();

          if (
            session?.redirectTo === "admin-dashboard" ||
            role.includes("admin") ||
            role.includes("administrador")
          ) {
            setUserData({
              name: session?.user?.name || "Administrador",
              email: session?.user?.email || "",
              phone: session?.user?.phone || "",
              address: session?.user?.address || "",
              memberSince: "Administrador",
              userType: "Administrador",
              sellerName: null,
            });
            setPage("admin-dashboard");
            return;
          }

          if (
            session?.redirectTo === "mayorista-dashboard" ||
            role.includes("mayorista") ||
            role.includes("juridico_mayorista")
          ) {
            setSessionType("juridico_mayorista");
            setUserData((prev) => ({
              ...prev,
              ...session?.user,
              userType: "Jurídico Mayorista",
            }));
            setPage("profile");
            return;
          }

          const isDetailer = role.includes("detallista") || role.includes("juridico_detallista");

          if (isDetailer) {
            setSessionType("juridico_detallista");
          } else {
            setSessionType("natural");
          }

          setUserData((prev) => ({
            ...prev,
            ...session?.user,
            userType: isDetailer ? "Jurídico Detallista" : (session?.user?.userType || prev.userType),
          }));
          setPage(isDetailer ? "profile" : "home");
        }}
      />
    );
  }

  // TERCERA CONDICIÓN: Dashboard administrador
  if (page === "admin-dashboard") {
    return (
      <AdminDashboard
        onBack={() => setPage("home")}
        onLogout={() => {
          setSessionType("guest");
          setPage("auth");
          setCart([]);
        }}
      />
    );
  }

  // TERCERA CONDICIÓN: Profile
  if (page === "profile") {
    return (
      <UserProfile
        userData={userData}
        favorites={favorites}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        addToCart={addToCart}
        cartCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
        onOpenCart={() => { setShowCartPage(true); setIsCartOpen(false); }}
        onViewProduct={(product) => { setSelectedProductDetail(product); setIsCartOpen(false); }}
        onBack={() => setPage("home")}
        onLogout={() => {
          setSessionType("guest");
          setPage("home");
          setCart([]);
        }}
      />
    );
  }


  // CUARTA CONDICIÓN: Detalle individual de producto
  if (selectedProductDetail) {
    return (
      <ProductDetail
        product={selectedProductDetail}
        onBack={() => setSelectedProductDetail(null)}
        addToCart={addToCart}
        relatedProducts={products.filter(
          (product) => product.id !== selectedProductDetail.id
        )}
        userData={userData}
        cart={cart}
        cartSummary={cartSummary}
        sessionType={sessionType}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        onProfileClick={() => setPage("profile")}
        onGoToCart={() => {
          setShowCartPage(true);
          setIsCartOpen(false);
        }}
        onSearch={(text) => {
          setQuery(text);
          setSelectedProductDetail(null);
          setShowFullStore(true);
        }}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onSelectProduct={(product) => {
          setSelectedProductDetail(product);
        }}
      />
    );
  }

  // CUARTA CONDICIÓN: Tienda completa (Marketplace)
  if (showFullStore && sessionType !== "juridico_mayorista") {
    return (
      <Marketplace 
        onBack={() => {
          setShowFullStore(false);
          setQuery("");
        }}
        sessionType={sessionType}
        userData={userData}
        cart={cart}
        cartSummary={cartSummary}
        addToCart={addToCart}
        onProfileClick={() => setPage("profile")}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        canBuyProduct={canBuyProduct}
        initialSearchQuery={query}
        onGoToCart={() => {
          setShowCartPage(true);
          setIsCartOpen(false);
        }}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
      />
    );
  }

  // ==========================================================
  // QUINTA: PÁGINA PRINCIPAL (HOME)
  // ==========================================================

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: PALETTE.page, color: PALETTE.maastrichtBlue }}
    >
      <header className="sticky top-0 z-50 shadow-sm">
        <div
          className="px-4 py-3 text-white lg:px-8"
          style={{ backgroundColor: PALETTE.maastrichtBlue }}
        >
          <div className="mx-auto grid w-full grid-cols-[auto_auto] items-center gap-3 lg:grid-cols-[auto_minmax(360px,760px)_auto]">
            <div
              className="inline-flex w-auto max-w-[260px] flex-none items-center gap-3 rounded-2xl px-1 py-1"
              style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
            >
              <div
                className="flex h-14 w-auto max-w-[248px] shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-16"
                style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
              >
                <img
                  src={brandLogo}
                  alt="Logo de Tuherramientaonline"
                  className="h-full w-auto max-w-[230px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.querySelector('.store-icon')?.classList.remove('hidden');
                  }}
                />
                <Store className="store-icon hidden h-7 w-7" style={{ color: PALETTE.spaceCadet }} />
              </div>
            </div>

            <div className="relative order-3 col-span-2 mx-auto w-full lg:order-none lg:col-span-1">
              <div className="flex items-center overflow-hidden rounded-[1.4rem] w-full" style={{ backgroundColor: "white" }}>
                <div
                  className="hidden px-3 py-3 text-sm sm:block flex-shrink-0"
                  style={{ backgroundColor: PALETTE.pastelGray, color: PALETTE.spaceCadet }}
                >
                  Todo
                </div>

                <Input
                  value={query}
                  onChange={handleSearchChange}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      const cleanQuery = query.trim();
                      setQuery(cleanQuery);
                      setShowSuggestions(false);
                      setShowFullStore(true);
                    }
                  }}
                  onFocus={() => query.trim() && setShowSuggestions(searchSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Buscar productos..."
                  className="border-0 text-slate-900 shadow-none focus-visible:ring-0 w-full"
                />

                <Button
                  className="h-11 rounded-none rounded-r-[1.4rem] px-3 sm:px-5 flex-shrink-0"
                  style={{
                    backgroundColor: PALETTE.sizzlingSunrise,
                    color: PALETTE.maastrichtBlue,
                  }}
                  aria-label="Buscar"
                  onClick={() => {
                    setQuery((value) => value.trim());
                    setShowSuggestions(false);
                    setShowFullStore(true);
                  }}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border z-50 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                    >
                      <img 
                        src={suggestion.image} 
                        alt={suggestion.name} 
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: PALETTE.maastrichtBlue }}>
                          {suggestion.name}
                        </p>
                        <div className="flex gap-2 text-xs mt-1">
                          <span className="text-gray-500">{suggestion.line}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{suggestion.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: PALETTE.maastrichtBlue }}>
                          {formatUSD(suggestion.price)}
                        </p>
                        <Button 
                          className="mt-1 rounded-full text-xs px-2 py-1"
                          style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                        >
                          Ver producto
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="justify-self-end rounded-2xl border p-3 md:hidden"
              style={{ borderColor: "rgba(255,255,255,0.45)", color: PALETTE.white }}
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {isMobileMenuOpen && (
              <div
                className="col-span-2 space-y-3 rounded-[1.4rem] border p-3 shadow-xl md:hidden"
                style={{ borderColor: "rgba(255,255,255,0.22)", backgroundColor: PALETTE.spaceCadet }}
              >
                {sessionType !== "guest" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { setPage("profile"); setIsMobileMenuOpen(false); }}
                      className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold"
                      style={{ backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
                    >
                      <span>{sessionType === "juridico_mayorista" ? "Ir a mi dashboard" : "Mi cuenta"}</span>
                      <User className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                    </button>
                    <div
                      className="rounded-2xl px-4 py-3 text-sm"
                      style={{ backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
                    >
                      <p style={{ color: PALETTE.crystalBlue }}>Tasa del día</p>
                      <p className="font-bold">{formatVES(1)}</p>
                    </div>
                    {sessionType !== "juridico_mayorista" && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setShowFullStore(true); setIsMobileMenuOpen(false); }}
                          className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold"
                          style={{ backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
                        >
                          <span>Tienda completa</span>
                          <Store className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowCartPage(true); setIsMobileMenuOpen(false); }}
                          disabled={cart.length === 0}
                          className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left font-semibold disabled:opacity-50"
                          style={{ backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}
                        >
                          <span>Carrito ({cartSummary.items})</span>
                          <ShoppingCart className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="grid gap-2">
                    <Button
                      onClick={() => { setPage("auth"); setIsMobileMenuOpen(false); }}
                      className="rounded-full font-semibold"
                      style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                    >
                      Iniciar sesión / Registrarse
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setShowFullStore(true); setIsMobileMenuOpen(false); }}
                      className="rounded-full border px-4 py-3 font-semibold"
                      style={{ borderColor: PALETTE.crystalBlue, color: PALETTE.white }}
                    >
                      Ver tienda
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="ml-auto hidden items-center gap-4 md:flex">
              {sessionType !== "guest" ? (
                <>
                  <button
                    onClick={() => setPage("profile")}
                    className="rounded-2xl px-4 py-2 transition-all hover:bg-white/10 hover:scale-105 border"
                    style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
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
                        <p className="text-sm font-semibold">{userData.name.split(" ")[0]}</p>
                      </div>
                    </div>
                  </button>

                  <div
                    className="rounded-2xl px-4 py-2 border transition-all hover:scale-105"
                    style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
                  >
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                      Tasa del día
                    </p>
                    <p className="text-sm font-semibold">{formatVES(1)}</p>
                  </div>

                  {sessionType === "natural" && (
                    <div
                      className="rounded-2xl px-3 py-2 transition-all hover:scale-105 cursor-pointer"
                      style={{ 
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(254,220,0,0.3)"
                      }}
                      onClick={() => {
                        alert(`Cashback acumulado: ${formatUSD(cashbackBalance)}\n\nEste cashback puede ser utilizado en tu próxima compra.\n\nTasa de cashback: ${CASHBACK_RATE * 100}% por producto.`);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ backgroundColor: PALETTE.sizzlingSunrise }}
                        >
                          <Star className="h-4 w-4" style={{ color: PALETTE.maastrichtBlue }} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                            Cashback disponible
                          </p>
                          <p className="text-sm font-bold" style={{ color: PALETTE.sizzlingSunrise }}>
                            {formatUSD(cashbackBalance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => { if (sessionType === "juridico_mayorista") { setPage("profile"); } else { setShowFullStore(true); } }}
                    className="rounded-2xl px-4 py-2 transition-all hover:scale-105 hover:bg-white/10 border"
                    style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                      <div className="text-left">
                        <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                          {sessionType === "juridico_mayorista" ? "Panel" : "Tienda"}
                        </p>
                        <p className="text-sm font-semibold">{sessionType === "juridico_mayorista" ? "Dashboard" : "Completa"}</p>
                      </div>
                    </div>
                  </button>


                  {/* ==========================================================
                      INICIO: SELECT CAMBIAR USUARIO DEMO
                  ========================================================== */}
                  <div
                    className="relative flex items-center gap-2 rounded-2xl px-3 py-2 border transition-all hover:scale-105"
                    style={{
                      borderColor: "rgba(254,220,0,0.65)",
                      backgroundColor: PALETTE.maastrichtBlue,
                      color: PALETTE.white,
                      boxShadow: "0 0 0 1px rgba(254,220,0,0.14) inset",
                    }}
                    title="Cambiar usuario demo para revisar todos los perfiles"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: PALETTE.sizzlingSunrise }}
                    >
                      <User className="h-4 w-4" style={{ color: PALETTE.maastrichtBlue }} />
                    </div>

                    <div className="text-left leading-tight">
                      <p className="text-[11px]" style={{ color: PALETTE.crystalBlue }}>
                        Cambiar usuario
                      </p>

                      <select
                        value={currentDemoUserValue}
                        onChange={(event) => handleDemoUserChange(event.target.value)}
                        className="w-28 bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
                        style={{ colorScheme: "dark" }}
                        aria-label="Cambiar usuario demo"
                      >
                        {demoUserOptions.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-slate-900 text-white"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {/* ==========================================================
                      FIN: SELECT CAMBIAR USUARIO DEMO
                  ========================================================== */}

                  {/* 👈 BOTÓN DEL CARRITO MODIFICADO */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (cart.length > 0) {
                          setShowCartPage(true);
                          setIsCartOpen(false);
                        } else {
                          setIsCartOpen(!isCartOpen);
                        }
                      }}
                      className="relative flex items-center gap-2 rounded-2xl px-4 py-2 border transition-all hover:scale-105"
                      style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
                      aria-label="Abrir carrito"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-sm font-semibold">Carrito</span>

                      {cartSummary.items > 0 && (
                        <span
                          className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-bold"
                          style={{
                            backgroundColor: PALETTE.sizzlingSunrise,
                            color: PALETTE.maastrichtBlue,
                          }}
                        >
                          {cartSummary.items}
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
                            onClick={() => setIsCartOpen(false)}
                            className="rounded-full p-1"
                            style={{ color: PALETTE.spaceCadet }}
                            aria-label="Cerrar carrito"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-4">
                          {cart.length === 0 ? (
                            <div
                              className="rounded-2xl p-4 text-sm"
                              style={{ backgroundColor: PALETTE.page, color: PALETTE.spaceCadet }}
                            >
                              Tu carrito está vacío.
                            </div>
                          ) : (
                            cart.map((item) => (
                              <CartItem
                                key={item.id}
                                item={item}
                                onDecrease={() =>
                                  updateCartQuantity(item.id, item.quantity - 1)
                                }
                                onIncrease={() =>
                                  updateCartQuantity(item.id, item.quantity + 1)
                                }
                                onRemove={() => removeFromCart(item.id)}
                                sessionType={sessionType}
                              />
                            ))
                          )}
                        </div>

                        <div
                          className="border-t px-4 py-4"
                          style={{
                            borderColor: PALETTE.softBorder,
                            backgroundColor: PALETTE.page,
                          }}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: PALETTE.spaceCadet }}>Total a pagar</span>
                            <span className="font-bold">{formatUSD(cartSummary.subtotal)}</span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span style={{ color: PALETTE.spaceCadet }}>Total en Bs</span>
                            <span className="font-bold">
                              {formatVES(cartSummary.subtotal)}
                            </span>
                          </div>

                          {sessionType === "natural" && (
                            <div className="mt-2 flex items-center justify-between text-sm">
                              <span style={{ color: PALETTE.spaceCadet }}>Cashback total</span>
                              <span
                                className="font-bold"
                                style={{ color: PALETTE.success }}
                              >
                                {formatUSD(cartSummary.cashback)}
                              </span>
                            </div>
                          )}

                          {/* 👈 BOTÓN "IR AL CARRITO" MODIFICADO */}
                          <Button
                            className="mt-4 w-full rounded-full font-semibold disabled:opacity-50"
                            style={{
                              backgroundColor: PALETTE.sizzlingSunrise,
                              color: PALETTE.maastrichtBlue,
                            }}
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || sessionType === "juridico_mayorista"}
                          >
                            Ir al carrito
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="rounded-2xl px-4 py-2 border transition-all hover:scale-105"
                    style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
                  >
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                      Sesión
                    </p>
                    <p className="text-sm font-semibold">{accessProfile.label}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage("auth")}
                      className="rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: PALETTE.sizzlingSunrise,
                        color: PALETTE.maastrichtBlue,
                      }}
                    >
                      Iniciar sesión
                    </Button>

                    <Button
                      onClick={() => setPage("auth")}
                      variant="outline"
                      className="rounded-full text-sm text-white hover:bg-transparent hover:text-white"
                      style={{ borderColor: PALETTE.crystalBlue, backgroundColor: "transparent" }}
                    >
                      Registrarse
                    </Button>
                  </div>

                  <div
                    className="rounded-2xl px-4 py-2 border transition-all hover:scale-105"
                    style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
                  >
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                      Tasa del día
                    </p>
                    <p className="text-sm font-semibold">{formatVES(1)}</p>
                  </div>

                  <button
                    onClick={() => { if (sessionType === "juridico_mayorista") { setPage("profile"); } else { setShowFullStore(true); } }}
                    className="rounded-2xl px-4 py-2 transition-all hover:scale-105 hover:bg-white/10 border"
                    style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                      <div className="text-left">
                        <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                          {sessionType === "juridico_mayorista" ? "Panel" : "Tienda"}
                        </p>
                        <p className="text-sm font-semibold">{sessionType === "juridico_mayorista" ? "Dashboard" : "Completa"}</p>
                      </div>
                    </div>
                  </button>

                  {/* 👈 BOTÓN DEL CARRITO PARA INVITADOS MODIFICADO */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (cart.length > 0) {
                          setShowCartPage(true);
                          setIsCartOpen(false);
                        } else {
                          setIsCartOpen(!isCartOpen);
                        }
                      }}
                      className="relative flex items-center gap-2 rounded-2xl px-4 py-2 border transition-all hover:scale-105"
                      style={{ borderColor: "rgba(255,255,255,0.45)", backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white, boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset" }}
                      aria-label="Abrir carrito"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-sm font-semibold">Carrito</span>

                      {cartSummary.items > 0 && (
                        <span
                          className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-bold"
                          style={{
                            backgroundColor: PALETTE.sizzlingSunrise,
                            color: PALETTE.maastrichtBlue,
                          }}
                        >
                          {cartSummary.items}
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
                            onClick={() => setIsCartOpen(false)}
                            className="rounded-full p-1"
                            style={{ color: PALETTE.spaceCadet }}
                            aria-label="Cerrar carrito"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="max-h-[360px] space-y-3 overflow-y-auto px-4 py-4">
                          {cart.length === 0 ? (
                            <div
                              className="rounded-2xl p-4 text-sm"
                              style={{ backgroundColor: PALETTE.page, color: PALETTE.spaceCadet }}
                            >
                              Tu carrito está vacío.
                            </div>
                          ) : (
                            cart.map((item) => (
                              <CartItem
                                key={item.id}
                                item={item}
                                onDecrease={() =>
                                  updateCartQuantity(item.id, item.quantity - 1)
                                }
                                onIncrease={() =>
                                  updateCartQuantity(item.id, item.quantity + 1)
                                }
                                onRemove={() => removeFromCart(item.id)}
                                sessionType={sessionType}
                              />
                            ))
                          )}
                        </div>

                        <div
                          className="border-t px-4 py-4"
                          style={{
                            borderColor: PALETTE.softBorder,
                            backgroundColor: PALETTE.page,
                          }}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: PALETTE.spaceCadet }}>Total a pagar</span>
                            <span className="font-bold">{formatUSD(cartSummary.subtotal)}</span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span style={{ color: PALETTE.spaceCadet }}>Total en Bs</span>
                            <span className="font-bold">
                              {formatVES(cartSummary.subtotal)}
                            </span>
                          </div>

                          {/* 👈 BOTÓN "IR AL CARRITO" PARA INVITADOS */}
                          <Button
                            className="mt-4 w-full rounded-full font-semibold disabled:opacity-50"
                            style={{
                              backgroundColor: PALETTE.sizzlingSunrise,
                              color: PALETTE.maastrichtBlue,
                            }}
                            onClick={handleCheckout}
                            disabled={cart.length === 0}
                          >
                            Ir al carrito
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className="px-4 py-2 text-white lg:px-8"
          style={{ backgroundColor: PALETTE.spaceCadet }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center text-center text-sm font-semibold tracking-wide">
            🚀 TH.O | Impulsando el comercio ferretero inteligente en Venezuela
          </div>
        </div>
      </header>

      <main className="w-full px-0 py-0">
        {paymentValidationMessage && (
          <div className="mx-auto max-w-7xl px-4 pt-4 lg:px-8">
            <div className="flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: "#DFF6F1", borderColor: PALETTE.success }}>
              <div>
                <p className="font-bold" style={{ color: PALETTE.success }}>Pedido en validación de pago</p>
                <p className="mt-1 text-sm" style={{ color: PALETTE.maastrichtBlue }}>{paymentValidationMessage.message}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaymentValidationMessage(null);
                  localStorage.removeItem("latestPaymentValidationMessage");
                }}
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ backgroundColor: PALETTE.white, color: PALETTE.maastrichtBlue }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
        <section className="w-full px-0 py-0 lg:px-0">
          <div className="relative w-full overflow-hidden bg-black">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ${index === currentHeroSlide ? "opacity-100" : "opacity-0"}`}
                aria-hidden={index !== currentHeroSlide}
              >
                <picture>
                  <source media="(max-width: 767px)" srcSet={slide.imageMobile} />
                  <img
                    src={slide.imageDesktop}
                    alt={slide.title.replace(/\n/g, " ")}
                    className="h-full min-h-[520px] w-full object-cover md:min-h-[460px] lg:min-h-[500px]"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
              </div>
            ))}

            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/35" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F3F1EC] to-transparent pointer-events-none" />

            <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-14 sm:px-6 md:min-h-[460px] lg:min-h-[500px] lg:px-8">
              <motion.div
                key={activeHeroSlide.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="max-w-[640px] space-y-4 sm:space-y-5"
              >
                <Badge
                  className="rounded-full px-4 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.24)" }}
                >
                  {activeHeroSlide.eyebrow}
                </Badge>

                <h1 className="whitespace-pre-line text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  {activeHeroSlide.title}
                </h1>

                <p className="max-w-lg text-sm font-medium leading-relaxed text-white sm:text-base">
                  {activeHeroSlide.description}
                </p>

                <Button
                  onClick={() => handleHeroCta(activeHeroSlide.category)}
                  className="rounded-xl px-6 py-3 text-sm font-black shadow-lg transition-transform hover:scale-[1.03] sm:px-8 sm:text-base"
                  style={{
                    backgroundColor: PALETTE.sizzlingSunrise,
                    color: PALETTE.maastrichtBlue,
                  }}
                >
                  {activeHeroSlide.ctaText}
                </Button>
              </motion.div>
            </div>

            <button
              onClick={() => goToHeroSlide("prev")}
              className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/40 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/50 md:block"
              aria-label="Imagen anterior"
              type="button"
            >
              <ChevronRight className="h-7 w-7 rotate-180" />
            </button>

            <button
              onClick={() => goToHeroSlide("next")}
              className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/40 bg-black/30 p-3 text-white backdrop-blur transition hover:bg-black/50 md:block"
              aria-label="Imagen siguiente"
              type="button"
            >
              <ChevronRight className="h-7 w-7" />
            </button>

            <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center gap-3 md:bottom-12">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentHeroSlide(index)}
                  className={`h-3 rounded-full transition-all ${index === currentHeroSlide ? "w-8" : "w-3 bg-white"}`}
                  style={{ backgroundColor: index === currentHeroSlide ? PALETTE.sizzlingSunrise : "rgba(255,255,255,0.85)" }}
                  aria-label={`Ir a imagen ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="relative z-20 mx-auto -mt-8 grid max-w-7xl gap-3 px-4 sm:px-6 md:-mt-9 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
            {homeFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`flex items-center gap-4 bg-white p-4 shadow-lg ${index === 0 ? "rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none" : ""} ${index === homeFeatures.length - 1 ? "rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none" : ""} ${index > 0 ? "lg:border-l" : ""}`}
                  style={{ borderColor: PALETTE.softBorder }}
                >
                  <Icon className="h-8 w-8 shrink-0" style={{ color: PALETTE.sizzlingSunrise }} />
                  <div>
                    <h3 className="text-sm font-black" style={{ color: PALETTE.maastrichtBlue }}>{feature.title}</h3>
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black sm:text-3xl" style={{ color: PALETTE.maastrichtBlue }}>Categorías destacadas</h2>
              <button
                onClick={() => { if (sessionType === "juridico_mayorista") { setPage("profile"); } else { setShowFullStore(true); } }}
                className="hidden items-center gap-2 text-sm font-bold sm:flex"
                style={{ color: PALETTE.maastrichtBlue }}
                type="button"
              >
                Ver todas las categorías <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featuredCategoryBlocks.map((block) => (
                <article
                  key={block.id}
                  className="rounded-xl bg-white p-5 shadow-md ring-1 transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ borderColor: PALETTE.softBorder, boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)" }}
                >
                  <button
                    onClick={() => {
                      setSelectedCategory(block.targetCategory);
                      setShowFullStore(true);
                    }}
                    className="mb-4 flex w-full items-center justify-between gap-3 text-left"
                    type="button"
                    aria-label={`Ver ${block.title}`}
                  >
                    <h3 className="text-xl font-black sm:text-2xl" style={{ color: PALETTE.maastrichtBlue }}>{block.title}</h3>
                    <ChevronRight className="h-5 w-5 shrink-0" style={{ color: PALETTE.maastrichtBlue }} />
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    {block.items.map((item) => (
                      <button
                        key={`${block.id}-${item.label}`}
                        onClick={() => {
                          setSelectedCategory(block.targetCategory);
                          setQuery(item.label);
                          setShowFullStore(true);
                        }}
                        className="group text-left"
                        type="button"
                      >
                        <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={item.image}
                            alt={item.label}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=700&q=80";
                            }}
                          />
                        </div>
                        <span className="mt-2 block text-sm font-medium" style={{ color: PALETTE.spaceCadet }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="h-8"></div>

        <section className="grid gap-6 px-4 pb-16 md:grid-cols-2 lg:grid-cols-[280px_1fr_340px] lg:gap-8 lg:px-8">
          <aside
            className="space-y-5 rounded-[1.5rem] p-4 shadow-sm h-fit lg:sticky lg:top-24 lg:rounded-[2rem] lg:p-6"
            style={{ backgroundColor: PALETTE.white || "#FFFFFF" }}
          >
            <div>
              <h3 className="text-lg font-bold" style={{ color: PALETTE.maastrichtBlue }}>Explorar</h3>
              <p className="text-sm mt-1" style={{ color: PALETTE.crystalBlue }}>Filtros tipo marketplace</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCategory("Todas")}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: selectedCategory === "Todas" ? PALETTE.maastrichtBlue : PALETTE.softCard,
                  color: selectedCategory === "Todas" ? PALETTE.white : PALETTE.spaceCadet,
                }}
              >
                <span className="font-medium">Todas las categorías</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: selectedCategory === category.name ? PALETTE.spaceCadet : PALETTE.softCard,
                    color: selectedCategory === category.name ? PALETTE.white : PALETTE.spaceCadet,
                  }}
                >
                  <span className="font-medium">{category.name}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </aside>

          <section className="flex flex-col h-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              <div>
                <h2 className="text-xl font-black" style={{ color: PALETTE.maastrichtBlue }}>
                  Resultados
                </h2>
                <p className="text-xs mt-0.5" style={{ color: PALETTE.crystalBlue }}>
                  {selectedCategory === "Todas" ? "Catálogo visible" : selectedCategory} · {" "}
                  {filteredProducts.length} productos disponibles
                </p>
              </div>
              
              <motion.button
                onClick={() => { if (sessionType === "juridico_mayorista") { setPage("profile"); } else { setShowFullStore(true); } }}
                className="rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1 transition-all"
                whileHover={{ scale: 1.05, x: 3 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: "transparent",
                  border: `1.5px solid ${PALETTE.sizzlingSunrise}`,
                  color: PALETTE.spaceCadet,
                }}
              >
                Ver tienda completa
                <ChevronRight className="h-3 w-3" />
              </motion.button>
            </div>

            {filteredProducts.length === 0 ? (
              <Card
                className="rounded-xl border-0 shadow-sm"
                style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
              >
                <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                  <EyeOff className="h-8 w-8" style={{ color: PALETTE.crystalBlue }} />
                  <h3 className="text-base font-bold" style={{ color: PALETTE.maastrichtBlue }}>
                    No hay productos visibles
                  </h3>
                  <p className="max-w-md text-xs" style={{ color: PALETTE.spaceCadet }}>
                    {sessionType === "guest"
                      ? "Regístrate o inicia sesión para ver el catálogo."
                      : sessionType === "juridico_mayorista"
                        ? "No tienes productos registrados en tu tienda."
                        : "No hay coincidencias con los filtros actuales."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div 
                  className="space-y-3 pr-0 lg:overflow-y-auto lg:pr-1"
                  style={{ 
                    maxHeight: "none",
                    scrollbarWidth: "thin",
                  }}
                >
                  {filteredProducts.map((product) => (
                    <CompactProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToCart}
                      canBuyProduct={canBuyProduct}
                      sessionType={sessionType}
                      onViewProduct={handleViewProduct}
                      isFavorite={isFavorite}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
                
                {filteredProducts.length > 5 && (
                  <div className="mt-3 text-center text-xs flex-shrink-0 py-2" style={{ color: PALETTE.crystalBlue }}>
                    📜 {filteredProducts.length} productos totales - desplázate para ver más
                  </div>
                )}
              </>
            )}
          </section>

          <aside
            className="rounded-[1.5rem] p-4 shadow-sm flex flex-col h-fit md:col-span-2 lg:col-span-1 lg:sticky lg:top-24 lg:rounded-[2rem] lg:p-6"
            style={{ backgroundColor: PALETTE.white || "#FFFFFF" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: PALETTE.crystalBlue }}>Resumen de compra</p>
                <h3 className="text-xl font-bold mt-1" style={{ color: PALETTE.maastrichtBlue }}>Carrito</h3>
              </div>
              <Package className="h-5 w-5" style={{ color: PALETTE.crystalBlue }} />
            </div>

            {!accessProfile.canUseCart && (
              <div className="rounded-2xl p-4 text-sm mb-4" style={{ backgroundColor: PALETTE.softCard, color: PALETTE.spaceCadet }}>
                ⚠️ Este perfil no puede usar carrito. El flujo correcto aquí es autenticación o panel de proveedor.
              </div>
            )}

            <div className="space-y-4 overflow-y-auto mb-4" style={{ maxHeight: "450px" }}>
              {cart.length === 0 ? (
                <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: PALETTE.softCard, color: PALETTE.spaceCadet }}>
                  🛒 Tu carrito está vacío
                  <p className="text-xs mt-2">Añade productos para simular compra</p>
                </div>
              ) : (
                cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onDecrease={() => updateCartQuantity(item.id, item.quantity - 1)}
                    onIncrease={() => updateCartQuantity(item.id, item.quantity + 1)}
                    onRemove={() => removeFromCart(item.id)}
                    sessionType={sessionType}
                  />
                ))
              )}
            </div>

            <div className="rounded-[1.7rem] p-5 text-white mt-2" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: PALETTE.pastelGray }}>Subtotal</span>
                <span className="font-semibold">{formatUSD(cartSummary.subtotal)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span style={{ color: PALETTE.pastelGray }}>Subtotal Bs</span>
                <span className="font-semibold">{formatVES(cartSummary.subtotal)}</span>
              </div>
              {sessionType === "natural" && (
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-sm">
                  <span style={{ color: PALETTE.pastelGray }}>✨ Cashback total</span>
                  <span className="font-bold" style={{ color: PALETTE.sizzlingSunrise }}>
                    {formatUSD(cartSummary.cashback)}
                  </span>
                </div>
              )}
              <Button
                className="mt-5 w-full rounded-full font-semibold py-3 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                onClick={handleCheckout}
                disabled={cart.length === 0 || sessionType === "juridico_mayorista"}
              >
                Proceder al pago →
              </Button>
            </div>
            
          </aside>
        </section>
      </main>
    </div>
  );
}