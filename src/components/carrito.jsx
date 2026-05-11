// carrito.jsx
import React, { useState, useMemo } from "react";
import {
  ShoppingCart,
  Trash2,
  Heart,
  ArrowLeft,
  Lock,
  Shield,
  RefreshCw,
  Star,
  Package,
  ChevronDown,
  Award,
  Sparkles,
  Truck,
  Tag,
  ChevronLeft,
  X,
  Copy,
  Check,
  Building,
  QrCode,
} from "lucide-react";
import { Button } from "./ui/Button";

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
  amazonOrange: "#FF9900",
};

const formatUSD = (value) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatVES = (value) => {
  const exchangeRate = 466.51;
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    maximumFractionDigits: 2,
  }).format(value * exchangeRate);
};

const CASHBACK_RATE = 0.025;
const productCashback = (price, quantity = 1) => price * quantity * CASHBACK_RATE;

// Catálogo completo de productos para sugerencias
const allProducts = [
  { id: 101, name: "Taladro percutor inalámbrico 18V", price: 149.99, originalPrice: 189.99, rating: 4.8, reviews: 234, image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=200&q=80", seller: "PowerTools Pro", discount: 21, category: "Herramientas eléctricas", keywords: ["taladro", "perforador", "inalámbrico", "herramienta"] },
  { id: 102, name: "Juego de destornilladores 100 piezas", price: 39.99, originalPrice: 54.99, rating: 4.6, reviews: 567, image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=200&q=80", seller: "ToolMaster", discount: 27, category: "Ferretería general", keywords: ["destornillador", "juego", "manual", "herramienta"] },
  { id: 103, name: "Sierra circular 7-1/4 pulgadas", price: 129.99, rating: 4.7, reviews: 189, image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=200&q=80", seller: "PowerTools Pro", category: "Herramientas eléctricas", keywords: ["sierra", "circular", "corte", "herramienta"] },
  { id: 104, name: "Lámpara LED recargable 1000W", price: 34.99, originalPrice: 49.99, rating: 4.5, reviews: 423, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=200&q=80", seller: "Iluminación Total", discount: 30, category: "Iluminación", keywords: ["lámpara", "led", "recargable", "luz"] },
  { id: 105, name: "Cinta métrica láser 50m", price: 45.99, rating: 4.7, reviews: 312, image: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?auto=format&fit=crop&w=200&q=80", seller: "Precision Tools", category: "Medición", keywords: ["cinta", "láser", "medición", "herramienta"] },
  { id: 106, name: "Nivel láser autónivelante", price: 89.99, originalPrice: 129.99, rating: 4.9, reviews: 178, image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=200&q=80", seller: "Precision Tools", discount: 31, category: "Medición", keywords: ["nivel", "láser", "autonivelante", "herramienta"] },
  { id: 107, name: "Set de brocas para concreto 10pz", price: 24.99, rating: 4.4, reviews: 456, image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=200&q=80", seller: "DrillPro", category: "Accesorios", keywords: ["brocas", "concreto", "taladro", "accesorio"] },
  { id: 108, name: "Caja organizadora de herramientas", price: 29.99, originalPrice: 39.99, rating: 4.6, reviews: 234, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=200&q=80", seller: "ToolMaster", discount: 25, category: "Accesorios", keywords: ["caja", "organizador", "herramientas", "almacenamiento"] },
  { id: 109, name: "Guantes de protección nivel 5", price: 12.99, rating: 4.5, reviews: 789, image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=200&q=80", seller: "SafetyFirst", category: "Seguridad industrial", keywords: ["guantes", "protección", "seguridad", "epi"] },
  { id: 110, name: "Casco de seguridad premium", price: 24.99, originalPrice: 34.99, rating: 4.7, reviews: 567, image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=200&q=80", seller: "SafetyFirst", discount: 29, category: "Seguridad industrial", keywords: ["casco", "seguridad", "protección", "epi"] },
  { id: 111, name: "Esmeril angular 4-1/2 pulg", price: 64.99, rating: 4.8, reviews: 345, image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=200&q=80", seller: "PowerTools Pro", category: "Herramientas eléctricas", keywords: ["esmeril", "angular", "desbaste", "herramienta"] },
  { id: 112, name: "Rodillo para pintura profesional", price: 8.99, rating: 4.3, reviews: 234, image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=200&q=80", seller: "PaintMaster", category: "Pintura y acabados", keywords: ["rodillo", "pintura", "acabados"] },
  { id: 113, name: "Llave ajustable 12 pulgadas", price: 19.99, rating: 4.4, reviews: 345, image: "https://images.unsplash.com/photo-1581147036324-c1c0a5b3c6a4?auto=format&fit=crop&w=200&q=80", seller: "ToolMaster", category: "Ferretería general", keywords: ["llave", "ajustable", "manual", "herramienta"] },
  { id: 114, name: "Multímetro digital profesional", price: 49.99, originalPrice: 69.99, rating: 4.7, reviews: 234, image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80", seller: "Precision Tools", discount: 29, category: "Medición", keywords: ["multímetro", "digital", "medición", "herramienta"] },
];

// Datos de pago por tienda (simulados)
const storePaymentData = {
  "Distribuidora Atlas": {
    bank: "Banco Provincial",
    accountType: "Corriente",
    accountNumber: "0108-0123-45-1234567890",
    beneficiary: "Distribuidora Atlas C.A.",
    rif: "J-12345678-9",
    phone: "0412-1234567",
    email: "pagos@distribuidoraatlas.com",
  },
  "FerreMax": {
    bank: "Banco de Venezuela",
    accountType: "Corriente",
    accountNumber: "0102-0456-78-9876543210",
    beneficiary: "FerreMax S.A.",
    rif: "J-87654321-0",
    phone: "0414-7654321",
    email: "ventas@ferremax.com",
  },
  "ToolMaster": {
    bank: "Banesco",
    accountType: "Corriente",
    accountNumber: "0134-0789-01-4567891230",
    beneficiary: "ToolMaster C.A.",
    rif: "J-11223344-5",
    phone: "0424-1122334",
    email: "pagos@toolmaster.com",
  },
  "PowerTools Pro": {
    bank: "Mercantil",
    accountType: "Corriente",
    accountNumber: "0105-0567-89-3216549870",
    beneficiary: "PowerTools Pro",
    rif: "J-99887766-3",
    phone: "0416-9988776",
    email: "ventas@powertoolspro.com",
  },
  "SafetyFirst": {
    bank: "Banco Nacional de Crédito",
    accountType: "Corriente",
    accountNumber: "0191-0123-45-7894561230",
    beneficiary: "SafetyFirst C.A.",
    rif: "J-55443322-1",
    phone: "0412-5544332",
    email: "pagos@safetyfirst.com",
  },
};

// Función para generar QR (simulación)
const generateQRDataURL = (paymentInfo, amount, orderId) => {
  const paymentString = JSON.stringify({
    ...paymentInfo,
    amount: amount.toFixed(2),
    concept: `Pago de orden ${orderId}`,
    timestamp: new Date().toISOString(),
  });
  return paymentString;
};

export default function CartPage({
  cart,
  cartSummary,
  updateCartQuantity,
  removeFromCart,
  onBack,
  onContinueShopping,
  sessionType,
  addToCart,
  checkoutError = "",
}) {
  const [savedForLater, setSavedForLater] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [selectedStorePayment, setSelectedStorePayment] = useState(null);

  // Agrupar productos por tienda/vendedor
  const productsByStore = useMemo(() => {
    const grouped = {};
    cart.forEach(item => {
      const storeName = item.seller || item.sellerName || "Vendedor no identificado";
      if (!grouped[storeName]) {
        grouped[storeName] = {
          products: [],
          total: 0,
          paymentInfo: storePaymentData[storeName] || storePaymentData["Distribuidora Atlas"],
        };
      }
      grouped[storeName].products.push(item);
      grouped[storeName].total += item.price * item.quantity;
    });
    return grouped;
  }, [cart]);

  // Función para obtener la categoría del producto
  const getProductCategory = (product) => {
    if (product.category) return product.category;
    const name = product.name.toLowerCase();
    if (name.includes("taladro") || name.includes("esmeril") || name.includes("sierra")) return "Herramientas eléctricas";
    if (name.includes("llave") || name.includes("destornillador")) return "Ferretería general";
    if (name.includes("guante") || name.includes("casco")) return "Seguridad industrial";
    if (name.includes("rodillo") || name.includes("pintura")) return "Pintura y acabados";
    return "Herramientas";
  };

  // Productos relacionados
  const relatedProducts = useMemo(() => {
    if (cart.length === 0) return [];

    const cartCategories = new Set();
    const cartProductIds = new Set(cart.map(item => item.id));

    cart.forEach(item => {
      const category = getProductCategory(item);
      cartCategories.add(category);
    });

    const related = allProducts.filter(product => {
      if (cartProductIds.has(product.id)) return false;
      if (savedForLater.some(saved => saved.id === product.id)) return false;
      return cartCategories.has(product.category);
    });

    return related.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12);
  }, [cart, savedForLater]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
  
  const getVisibleProducts = () => {
    const start = carouselIndex * itemsPerPage;
    return relatedProducts.slice(start, start + itemsPerPage);
  };

  const nextSlide = () => {
    if (carouselIndex < totalPages - 1) setCarouselIndex(carouselIndex + 1);
  };

  const prevSlide = () => {
    if (carouselIndex > 0) setCarouselIndex(carouselIndex - 1);
  };

  const handleMoveToSaved = (item) => {
    setSavedForLater([...savedForLater, { ...item, savedAt: new Date() }]);
    removeFromCart(item.id);
  };

  const handleMoveToCart = (item) => {
    const { savedAt, ...product } = item;
    addToCart?.(product);
    setSavedForLater((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "BIENVENIDA10") {
      setPromoApplied(true);
      alert("✅ Código aplicado: 10% de descuento");
    } else if (promoCode.toUpperCase() === "FERRETERIA20") {
      setPromoApplied(true);
      alert("✅ Código aplicado: 20% de descuento");
    } else {
      alert("❌ Código inválido");
    }
    setPromoCode("");
  };

  // Manejar el clic en "Proceder al pago"
  const handleProceedToPayment = () => {
    const storeNames = Object.keys(productsByStore);
    if (storeNames.length === 1) {
      setSelectedStorePayment({
        storeName: storeNames[0],
        ...productsByStore[storeNames[0]],
      });
      setQrGenerated(false);
      setShowPaymentModal(true);
    } else {
      setSelectedStorePayment(null);
      setShowPaymentModal(true);
    }
  };

  // Seleccionar una tienda específica para pagar
  const handleSelectStore = (storeName, storeData) => {
    setSelectedStorePayment({
      storeName,
      ...storeData,
    });
    setQrGenerated(false);
  };

  // Generar QR para la tienda seleccionada
  const handleGenerateQR = () => {
    setQrGenerated(true);
  };

  // Copiar al portapapeles
  const copyToClipboard = async (text, field) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("No se pudo copiar al portapapeles:", error);
    }
  };

  // Cerrar modal
  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedStorePayment(null);
    setQrGenerated(false);
  };

  const discount = promoApplied ? (cartSummary?.subtotal || 0) * 0.1 : 0;
  const total = (cartSummary?.subtotal || 0) - discount;
  const cashbackTotal = sessionType === "natural" ? cartSummary?.cashback || 0 : 0;

  const CartItem = ({ item }) => {
    const stock = Number(item.stock) || 1;
    const cashback = productCashback(item.price, item.quantity);
    const storeName = item.seller || item.sellerName || "Vendedor verificado";

    return (
      <div className="flex flex-col sm:flex-row gap-4 py-6 border-b" style={{ borderColor: PALETTE.softBorder }}>
        <div className="sm:w-32 flex-shrink-0">
          <img src={item.image} alt={item.name} className="w-full rounded-xl object-cover" style={{ aspectRatio: "1/1" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-3 w-3" style={{ color: PALETTE.crystalBlue }} />
                <p className="text-xs" style={{ color: PALETTE.crystalBlue }}>{storeName}</p>
              </div>
              <h3 className="font-semibold text-base" style={{ color: PALETTE.maastrichtBlue }}>
                {item.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-current" style={{ color: PALETTE.sizzlingSunrise }} />
                <span className="text-xs font-medium">{item.rating || 4.5}</span>
                <span className="text-xs text-gray-400">({item.reviews || 128} valoraciones)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Stock disponible: {stock} unidades</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
                {formatUSD(item.price)}
              </p>
              {item.originalPrice && (
                <p className="text-xs line-through text-gray-400">{formatUSD(item.originalPrice)}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={item.quantity}
                  onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value))}
                  className="appearance-none rounded-lg border px-8 py-2 text-sm font-medium bg-white cursor-pointer"
                  style={{ borderColor: PALETTE.pastelGray }}
                >
                  {[...Array(Math.min(stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Cantidad: {i + 1}</option>
                  ))}
                  {stock > 10 && item.quantity > 10 && <option value={item.quantity}>Cantidad: {item.quantity}</option>}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
              </div>

              <button
                onClick={() => removeFromCart(item.id)}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>

              <button
                onClick={() => handleMoveToSaved(item)}
                className="text-sm text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-1"
              >
                <Heart className="h-4 w-4" /> Guardar
              </button>
            </div>

            {sessionType === "natural" && (
              <div className="flex items-center gap-1 text-xs" style={{ color: PALETTE.success }}>
                <Award className="h-3 w-3" />
                Cashback: {formatUSD(cashback)}
              </div>
            )}
          </div>

          {item.discount && (
            <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: PALETTE.amazonOrange }}>
              <Tag className="h-3 w-3" />
              Ahorra {item.discount}% en este producto
            </div>
          )}
        </div>
      </div>
    );
  };

  const SavedItem = ({ item }) => (
    <div className="flex items-center gap-4 py-3 border-b" style={{ borderColor: PALETTE.softBorder }}>
      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
      <div className="flex-1">
        <p className="font-medium text-sm">{item.name}</p>
        <p className="text-sm font-bold">{formatUSD(item.price)}</p>
      </div>
      <button onClick={() => handleMoveToCart(item)} className="rounded-full px-4 py-1.5 text-sm font-medium" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>
        Mover al carrito
      </button>
    </div>
  );

  const RelatedProductCard = ({ product }) => (
    <div className="flex-shrink-0 w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] md:w-[calc(25%-0.75rem)] lg:w-[calc(16.666%-0.833rem)] p-2">
      <div className="flex flex-col p-3 rounded-xl hover:shadow-lg transition-all cursor-pointer group border h-full" style={{ backgroundColor: PALETTE.white, borderColor: PALETTE.softBorder }}>
        <div className="relative">
          <img src={product.image} alt={product.name} className="h-32 w-full object-cover rounded-lg mb-2 group-hover:scale-105 transition-transform" />
          {product.discount && (
            <span className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">-{product.discount}%</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 truncate">{product.seller}</p>
        <p className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3 w-3 fill-current" style={{ color: PALETTE.sizzlingSunrise }} />
          <span className="text-xs">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-bold text-sm">{formatUSD(product.price)}</span>
          {product.originalPrice && <span className="text-xs line-through text-gray-400">{formatUSD(product.originalPrice)}</span>}
        </div>
        <button className="w-full mt-2 rounded-full py-1.5 text-xs font-semibold transition-all hover:scale-105" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>
          Agregar al carrito
        </button>
      </div>
    </div>
  );

  const SubtotalLine = ({ label, value, isTotal = false }) => (
    <div className={`flex justify-between py-2 ${isTotal ? "border-t pt-3 mt-2" : ""}`} style={{ borderColor: PALETTE.softBorder }}>
      <span className={isTotal ? "font-bold text-base" : "text-sm"} style={{ color: isTotal ? PALETTE.maastrichtBlue : PALETTE.spaceCadet }}>
        {label}
      </span>
      <span className={isTotal ? "font-bold text-xl" : "text-sm"} style={{ color: PALETTE.maastrichtBlue }}>
        {value}
      </span>
    </div>
  );

  // Modal de pago
  const PaymentModal = () => {
    const storeNames = Object.keys(productsByStore);
    const isSingleStore = storeNames.length === 1;

    if (!isSingleStore && !selectedStorePayment) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden" style={{ backgroundColor: PALETTE.white }}>
            <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: PALETTE.softBorder }}>
              <h2 className="text-xl font-bold">Seleccionar tienda para pagar</h2>
              <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Tus productos son de diferentes tiendas. Selecciona cuál deseas pagar:
              </p>
              <div className="space-y-3">
                {Object.entries(productsByStore).map(([storeName, storeData]) => (
                  <button
                    key={storeName}
                    onClick={() => handleSelectStore(storeName, storeData)}
                    className="w-full p-4 rounded-xl border text-left hover:shadow-md transition-all"
                    style={{ borderColor: PALETTE.softBorder }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{storeName}</p>
                        <p className="text-sm text-gray-500">{storeData.products.length} productos</p>
                      </div>
                      <p className="font-bold text-lg" style={{ color: PALETTE.maastrichtBlue }}>
                        {formatUSD(storeData.total)}
                      </p>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {storeData.products.map(p => p.name).join(", ")}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const paymentData = selectedStorePayment;
    if (!paymentData) return null;

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const qrData = generateQRDataURL(paymentData.paymentInfo, paymentData.total, orderId);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
        <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden" style={{ backgroundColor: PALETTE.white }}>
          <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: PALETTE.softBorder }}>
            <div>
              <h2 className="text-xl font-bold">Pagar a {paymentData.storeName}</h2>
              <p className="text-xs text-gray-500">Monto total: {formatUSD(paymentData.total)}</p>
            </div>
            <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5">
            {!qrGenerated ? (
              <>
                <div className="text-center mb-4">
                  <div className="bg-gray-100 rounded-2xl p-8 inline-block mx-auto">
                    <QrCode className="h-32 w-32" style={{ color: PALETTE.maastrichtBlue }} />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Genera el código QR para realizar el pago</p>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                    <p className="text-xs text-gray-500">Información de la tienda</p>
                    <p className="text-sm font-medium">{paymentData.storeName}</p>
                    <p className="text-xs">RIF: {paymentData.paymentInfo.rif}</p>
                  </div>

                  <div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                    <p className="text-xs text-gray-500">Detalle de productos</p>
                    {paymentData.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between text-sm mt-1">
                        <span>{product.name} x{product.quantity}</span>
                        <span>{formatUSD(product.price * product.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatUSD(paymentData.total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateQR}
                  className="w-full rounded-full py-3 font-semibold"
                  style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                >
                  Generar QR para pagar
                </Button>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="bg-black rounded-2xl p-4 inline-block mx-auto">
                    <div className="bg-white p-3 rounded-xl">
                      <div className="w-48 h-48 bg-gray-800 flex items-center justify-center rounded-lg">
                        <QrCode className="h-32 w-32 text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Escanea el código QR desde tu banco</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
                    <p className="text-xs text-gray-500 mb-2">Datos bancarios</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Banco:</span>
                        <span className="text-sm font-medium">{paymentData.paymentInfo.bank}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tipo de cuenta:</span>
                        <span className="text-sm font-medium">{paymentData.paymentInfo.accountType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Número de cuenta:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{paymentData.paymentInfo.accountNumber}</span>
                          <button
                            onClick={() => copyToClipboard(paymentData.paymentInfo.accountNumber, "account")}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {copiedField === "account" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Beneficiario:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{paymentData.paymentInfo.beneficiary}</span>
                          <button
                            onClick={() => copyToClipboard(paymentData.paymentInfo.beneficiary, "beneficiary")}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {copiedField === "beneficiary" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">RIF:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">{paymentData.paymentInfo.rif}</span>
                          <button
                            onClick={() => copyToClipboard(paymentData.paymentInfo.rif, "rif")}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {copiedField === "rif" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl" style={{ backgroundColor: "#DFF6F1" }}>
                    <p className="text-xs font-medium" style={{ color: PALETTE.success }}>📝 Instrucciones:</p>
                    <ol className="text-xs text-gray-600 mt-1 space-y-1 list-decimal list-inside">
                      <li>Copia el número de cuenta o escanea el QR</li>
                      <li>Realiza la transferencia por el monto exacto: {formatUSD(paymentData.total)}</li>
                      <li>Referencia: {orderId}</li>
                      <li>Adjunta el comprobante en el chat de la tienda</li>
                    </ol>
                  </div>

                  <div className="pt-3 border-t" style={{ borderColor: PALETTE.softBorder }}>
                    <p className="text-xs text-center text-gray-500">
                      Una vez realizado el pago, la tienda confirmará tu orden
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isCartEmpty = cart.length === 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      {/* Modal de pago */}
      {showPaymentModal && <PaymentModal />}

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <button onClick={onBack || onContinueShopping} className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">Seguir comprando</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                <ShoppingCart className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold">Mi Carrito</span>
                {cartSummary?.items > 0 && (
                  <span className="text-xs bg-yellow-400 text-black rounded-full px-2 py-0.5">
                    {cartSummary.items} {cartSummary.items === 1 ? "artículo" : "artículos"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 text-white/80 text-xs">
                <Truck className="h-4 w-4" />
                <span>Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 lg:px-8">
        {isCartEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-white rounded-full p-6 mb-4 shadow-sm">
              <ShoppingCart className="h-16 w-16" style={{ color: PALETTE.crystalBlue }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: PALETTE.maastrichtBlue }}>
              Tu carrito está vacío
            </h2>
            <p className="text-gray-500 mb-6">Agrega productos para comenzar tu compra</p>
            <button onClick={onContinueShopping} className="rounded-full px-8 py-3 font-semibold transition-all hover:scale-105" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>
              Explorar productos
            </button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Columna izquierda */}
              <div className="lg:col-span-2 space-y-4">
                {sessionType === "natural" && cashbackTotal > 0 && (
                  <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "#DFF6F1", border: `1px solid ${PALETTE.success}` }}>
                    <Award className="h-5 w-5" style={{ color: PALETTE.success }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: PALETTE.success }}>
                        ¡Ganas {formatUSD(cashbackTotal)} en cashback con esta compra!
                      </p>
                      <p className="text-xs opacity-75">El cashback se acreditará después de la entrega del pedido</p>
                    </div>
                  </div>
                )}

                <div className="rounded-xl p-4" style={{ backgroundColor: PALETTE.white }}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
                      Carrito de compras
                    </h2>
                    <p className="text-sm text-gray-500">{cartSummary?.items} {cartSummary?.items === 1 ? "artículo" : "artículos"}</p>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ backgroundColor: PALETTE.white }}>
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}

                  <div className="mt-4 pt-4 border-t" style={{ borderColor: PALETTE.softBorder }}>
                    {showPromoInput ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Código de descuento"
                          className="flex-1 rounded-lg border px-4 py-2 text-sm"
                          style={{ borderColor: PALETTE.pastelGray }}
                        />
                        <button onClick={handleApplyPromo} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>
                          Aplicar
                        </button>
                        <button onClick={() => setShowPromoInput(false)} className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setShowPromoInput(true)} className="flex items-center gap-2 text-sm" style={{ color: PALETTE.amazonOrange }}>
                        <Tag className="h-4 w-4" />
                        ¿Tienes un código de descuento?
                      </button>
                    )}
                  </div>
                </div>

                {savedForLater.length > 0 && (
                  <div className="rounded-xl p-4" style={{ backgroundColor: PALETTE.white }}>
                    <h3 className="font-bold mb-3">Guardados para más tarde ({savedForLater.length})</h3>
                    {savedForLater.map((item) => (
                      <SavedItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Columna derecha */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
                    <h3 className="font-bold text-lg mb-4">Resumen del pedido</h3>

                    <SubtotalLine label="Subtotal" value={formatUSD(cartSummary?.subtotal || 0)} />
                    {promoApplied && <SubtotalLine label="Descuento" value={`-${formatUSD(discount)}`} />}
                    
                    {sessionType === "natural" && cashbackTotal > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm" style={{ color: PALETTE.success }}>✨ Cashback a ganar</span>
                        <span className="text-sm font-medium" style={{ color: PALETTE.success }}>{formatUSD(cashbackTotal)}</span>
                      </div>
                    )}
                    
                    <SubtotalLine label="Total" value={formatUSD(total)} isTotal />

                    <div className="mt-4 text-xs text-gray-500 flex items-center gap-2 justify-center">
                      <Lock className="h-3 w-3" />
                      Transacción segura
                    </div>

                    <button
                      onClick={handleProceedToPayment}
                      className="w-full mt-4 rounded-full py-3 font-bold text-base transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: PALETTE.amazonOrange, color: "#000" }}
                    >
                      Proceder al pago
                    </button>

                    <p className="text-xs text-center mt-3 text-gray-500">
                      Los impuestos se calculan al finalizar la compra
                    </p>
                  </div>

                  {/* Garantías */}
                  <div className="rounded-xl p-4 shadow-sm text-xs space-y-2" style={{ backgroundColor: PALETTE.white }}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" style={{ color: PALETTE.success }} />
                      <span>Protección al comprador de tuherramientaonline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" style={{ color: PALETTE.success }} />
                      <span>Seguimiento de tu pedido en tiempo real</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carrusel de productos relacionados */}
            {relatedProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t" style={{ borderColor: PALETTE.softBorder }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: PALETTE.maastrichtBlue }}>
                      <Sparkles className="h-5 w-5" style={{ color: PALETTE.amazonOrange }} />
                      Productos relacionados con tu carrito
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Basado en los productos que agregaste - {relatedProducts.length} productos disponibles
                    </p>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex gap-2">
                      <button
                        onClick={prevSlide}
                        disabled={carouselIndex === 0}
                        className={`p-2 rounded-full transition-all ${carouselIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        style={{ backgroundColor: PALETTE.white }}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextSlide}
                        disabled={carouselIndex === totalPages - 1}
                        className={`p-2 rounded-full transition-all ${carouselIndex === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                        style={{ backgroundColor: PALETTE.white }}
                      >
                        <ChevronLeft className="h-5 w-5 rotate-180" />
                      </button>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-1 mb-4">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${carouselIndex === idx ? 'w-6' : 'w-3'}`}
                        style={{ backgroundColor: carouselIndex === idx ? PALETTE.amazonOrange : PALETTE.pastelGray }}
                      />
                    ))}
                  </div>
                )}

                <div className="overflow-hidden">
                  <div className="flex flex-wrap -mx-2">
                    {getVisibleProducts().map((product) => (
                      <RelatedProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-12 border-t py-8" style={{ backgroundColor: PALETTE.maastrichtBlue, borderColor: PALETTE.spaceCadet }}>
        <div className="max-w-7xl mx-auto px-4 text-center text-white/60 text-xs">
          <p>© 2024 tuherramientaonline.market - Todos los derechos reservados</p>
          <div className="flex justify-center gap-4 mt-2">
            <span>Política de privacidad</span>
            <span>Términos y condiciones</span>
          </div>
        </div>
      </footer>
    </div>
  );
}