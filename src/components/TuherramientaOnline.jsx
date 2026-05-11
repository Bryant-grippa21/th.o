import React, { useMemo, useState, useEffect } from "react";
import AuthPage from "./login";
import UserProfile from "./UserProfile";
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
const brandLogo = "/logo_crop.jpeg";

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

function ProductCard({ product, onAdd, canBuyProduct, sessionType }) {
  const allowed = canBuyProduct(product);

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
            className="absolute right-3 top-3 rounded-full p-2 shadow"
            style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
            aria-label="Agregar a favoritos"
          >
            <Heart className="h-4 w-4" style={{ color: PALETTE.spaceCadet }} />
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

function CompactProductCard({ product, onAdd, canBuyProduct, sessionType, onViewProduct }) {
  const allowed = canBuyProduct(product);

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
              
              {/* Precio compacto */}
              <div className="text-right flex-shrink-0">
                <span
                  className="text-sm font-bold"
                  style={{ color: PALETTE.maastrichtBlue }}
                >
                  {formatUSD(product.price)}
                </span>
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
            <div className="mt-2 flex gap-2">
              <Button
                className="flex-1 rounded-lg text-xs py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:scale-[1.02]"
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
                className="flex-1 rounded-lg text-xs py-1.5 font-semibold transition-all hover:scale-[1.02]"
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
  const [sessionType, setSessionType] = useState("juridico_mayorista"); // natural, juridico_detallista, juridico_mayorista, invitado
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showFullStore, setShowFullStore] = useState(false);
  const [showCartPage, setShowCartPage] = useState(false); // 👈 NUEVO ESTADO
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

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

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
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
      />
    );
  }

  // SEGUNDA CONDICIÓN: Auth (login/register)
  if (page === "auth") {
    return <AuthPage onBack={() => setPage("home")} />;
  }

  // TERCERA CONDICIÓN: Profile
  if (page === "profile") {
    return (
      <UserProfile
        userData={userData}
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
      />
    );
  }

  // CUARTA CONDICIÓN: Tienda completa (Marketplace)
  if (showFullStore) {
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
          <div className="mx-auto flex w-full items-center gap-3">
            <div
              className="flex items-center gap-3 rounded-2xl px-2 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl"
                style={{ backgroundColor: PALETTE.white }}
              >
                <img
                  src={brandLogo}
                  alt="Logo de Tuherramientaonline"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.querySelector('.store-icon')?.classList.remove('hidden');
                  }}
                />
                <Store className="store-icon hidden h-7 w-7" style={{ color: PALETTE.spaceCadet }} />
              </div>

              <div>
                <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                  tuherramientaonline
                </p>
                <p className="text-lg font-bold tracking-tight">market</p>
              </div>
            </div>

            <div className="relative flex-1">
              <div className="flex items-center overflow-hidden rounded-[1.4rem] w-full" style={{ backgroundColor: PALETTE.white }}>
                <div
                  className="hidden px-3 py-3 text-sm sm:block flex-shrink-0"
                  style={{ backgroundColor: PALETTE.pastelGray, color: PALETTE.spaceCadet }}
                >
                  Todo
                </div>

                <Input
                  value={query}
                  onChange={handleSearchChange}
                  onFocus={() => query.trim() && setShowSuggestions(searchSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Buscar productos, líneas o categorías..."
                  className="border-0 text-slate-900 shadow-none focus-visible:ring-0 w-full"
                />

                <Button
                  className="h-11 rounded-none rounded-r-[1.4rem] px-5 flex-shrink-0"
                  style={{
                    backgroundColor: PALETTE.sizzlingSunrise,
                    color: PALETTE.maastrichtBlue,
                  }}
                  aria-label="Buscar"
                  onClick={() => {
                    if (query.trim()) {
                      setShowFullStore(true);
                    }
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

            <div className="hidden items-center gap-4 md:flex">
              {sessionType !== "guest" ? (
                <>
                  <button
                    onClick={() => setPage("profile")}
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
                        <p className="text-sm font-semibold">{userData.name.split(" ")[0]}</p>
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
                        alert(`Cashback acumulado: ${formatUSD(cartSummary.cashback)}\n\nEste cashback puede ser utilizado en tu próxima compra.\n\nTasa de cashback: ${CASHBACK_RATE * 100}% por producto.`);
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
                            {formatUSD(cartSummary.cashback)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowFullStore(true)}
                    className="rounded-2xl px-3 py-2 transition-all hover:scale-105 hover:bg-white/10"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                      <div className="text-left">
                        <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                          Tienda
                        </p>
                        <p className="text-sm font-semibold">Completa</p>
                      </div>
                    </div>
                  </button>

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
                      className="relative flex items-center gap-2 rounded-2xl px-3 py-2"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
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
                    className="rounded-2xl px-3 py-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
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
                      className="rounded-full text-sm text-white"
                      style={{ borderColor: PALETTE.crystalBlue }}
                    >
                      Registrarse
                    </Button>
                  </div>

                  <div
                    className="rounded-2xl px-3 py-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                      Tasa del día
                    </p>
                    <p className="text-sm font-semibold">{formatVES(1)}</p>
                  </div>

                  <button
                    onClick={() => setShowFullStore(true)}
                    className="rounded-2xl px-3 py-2 transition-all hover:scale-105 hover:bg-white/10"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
                      <div className="text-left">
                        <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>
                          Tienda
                        </p>
                        <p className="text-sm font-semibold">Completa</p>
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
                      className="relative flex items-center gap-2 rounded-2xl px-3 py-2"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
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
          <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto text-sm">
            <button className="flex items-center gap-2 font-medium" aria-label="Menú">
              <Menu className="h-4 w-4" /> Todo
            </button>
            <button>Más vendidos</button>
            <button>Seguridad industrial</button>
            <button>Herramientas</button>
            <button>Pintura</button>
          </div>
        </div>
      </header>

      <main className="w-full px-0 py-0">
        <section className="w-full px-0 py-0 lg:px-0">
          <div
            className="relative w-full overflow-hidden"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=2000&q=80')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "550px",
            }}
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            />
            
            <div className="relative z-10 container mx-auto min-h-[550px] flex items-center px-4 lg:px-8">
              <div className="max-w-xl space-y-5">
                <Badge
                  className="rounded-full px-4 py-1 text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  Vista principal tipo Amazon
                </Badge>

                <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black leading-tight text-white">
                  Tu ferretería
                  <br />
                  con identidad propia
                </h1>

                <p className="max-w-lg text-sm text-white/90">
                  Rebranding con tu logo, tu paleta y un carrito más útil: cashback
                  detallado por producto, edición de cantidades y eliminación directa.
                </p>

                <Button
                  className="rounded-full px-6 lg:px-8 py-2 lg:py-3 text-base lg:text-lg font-semibold"
                  style={{
                    backgroundColor: PALETTE.sizzlingSunrise,
                    color: PALETTE.maastrichtBlue,
                  }}
                >
                  Explorar ofertas
                </Button>

                <p className="text-sm text-white/70">
                  Aplican términos y condiciones.
                </p>
              </div>
            </div>

            <button className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/40 bg-white/10 p-3 text-white backdrop-blur md:block" aria-label="Anterior">
              <ChevronRight className="h-7 w-7 rotate-180" />
            </button>

            <button className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/40 bg-white/10 p-3 text-white backdrop-blur md:block" aria-label="Siguiente">
              <ChevronRight className="h-7 w-7" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F3F1EC] to-transparent pointer-events-none" />
          </div>

          <div 
            className="relative z-20 grid gap-8 md:gap-6 lg:gap-8 md:grid-cols-2 xl:grid-cols-4 px-4 lg:px-8" 
            style={{ marginTop: "-60px", marginBottom: "40px" }}
          >
            <Card
              className="rounded-[2rem] border-0 shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 duration-300"
              style={{ backgroundColor: PALETTE.white }}
            >
              <CardContent className="space-y-4 p-6">
                <h3 className="text-2xl font-bold leading-tight" style={{ color: PALETTE.maastrichtBlue }}>
                  Herramientas top
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80" alt="Taladros" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Taladros</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80" alt="Destornilladores" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Destornilladores</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80" alt="Llaves" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Llaves</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1581147036324-c1c0a5b3c6a4?auto=format&fit=crop&w=600&q=80" alt="Accesorios" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Accesorios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="rounded-[2rem] border-0 shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 duration-300"
              style={{ backgroundColor: PALETTE.white }}
            >
              <CardContent className="space-y-4 p-6">
                <h3 className="text-2xl font-bold leading-tight" style={{ color: PALETTE.maastrichtBlue }}>
                  Todo para pintura
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80" alt="Rodillos" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Rodillos</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80" alt="Selladores" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Selladores</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=600&q=80" alt="Brochas" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Brochas</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=600&q=80" alt="Acabados" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Acabados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="rounded-[2rem] border-0 shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 duration-300"
              style={{ backgroundColor: PALETTE.white }}
            >
              <CardContent className="space-y-4 p-6">
                <h3 className="text-2xl font-bold leading-tight" style={{ color: PALETTE.maastrichtBlue }}>
                  Seguridad industrial
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80" alt="Guantes" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Guantes</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80" alt="Cascos" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Cascos</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80" alt="Lentes" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Lentes</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80" alt="Protección" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Protección</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="rounded-[2rem] border-0 shadow-lg hover:shadow-xl transition-transform hover:-translate-y-1 duration-300"
              style={{ backgroundColor: PALETTE.white }}
            >
              <CardContent className="space-y-4 p-6">
                <h3 className="text-2xl font-bold leading-tight" style={{ color: PALETTE.maastrichtBlue }}>
                  Herramientas pesadas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=600&q=80" alt="Taladros industriales" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Taladros industriales</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1595665593673-bf1ad72905c0?auto=format&fit=crop&w=600&q=80" alt="Esmeriles" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Esmeriles</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80" alt="Sierras" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Sierras</p>
                  </div>
                  <div>
                    <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" alt="Equipos industriales" className="mb-2 aspect-square w-full rounded-xl object-cover" />
                    <p className="text-sm" style={{ color: PALETTE.spaceCadet }}>Equipos industriales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="h-8"></div>

        <section className="grid gap-8 px-4 pb-16 lg:grid-cols-[280px_1fr_340px] lg:gap-8 lg:px-8">
          <aside
            className="space-y-6 rounded-[2rem] p-6 shadow-sm h-fit sticky top-24"
            style={{ backgroundColor: PALETTE.white }}
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
            <div className="rounded-2xl p-5 mt-8" style={{ backgroundColor: PALETTE.softCard }}>
              <p className="text-sm font-semibold mb-3" style={{ color: PALETTE.crystalBlue }}>📋 Condiciones de uso</p>
              <ul className="space-y-2 text-sm" style={{ color: PALETTE.spaceCadet }}>
                <li className="flex items-start gap-2">• Debes estar registrado para poder comprar</li>
                <li className="flex items-start gap-2">• El cashback se calcula por cada producto del carrito</li>
                <li className="flex items-start gap-2">• Puedes aumentar, disminuir o eliminar productos antes del pago</li>
                <li className="flex items-start gap-2">• Los precios pueden variar según disponibilidad</li>
                <li className="flex items-start gap-2">• Las compras están sujetas a validación del sistema</li>
              </ul>
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
                onClick={() => setShowFullStore(true)}
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
                style={{ backgroundColor: PALETTE.white }}
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
                  className="space-y-3 overflow-y-auto pr-1"
                  style={{ 
                    maxHeight: "670px",
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
            className="rounded-[2rem] p-6 shadow-sm flex flex-col h-fit sticky top-24"
            style={{ backgroundColor: PALETTE.white }}
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