/* eslint-disable no-unused-vars */
// carrito.js
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
    mobilePayment: {
      bank: "Banco Provincial",
      phone: "0412-1234567",
      rif: "J-12345678-9",
      holder: "Distribuidora Atlas C.A.",
    },
  },
  "FerreMax": {
    bank: "Banco de Venezuela",
    accountType: "Corriente",
    accountNumber: "0102-0456-78-9876543210",
    beneficiary: "FerreMax S.A.",
    rif: "J-87654321-0",
    phone: "0414-7654321",
    email: "ventas@ferremax.com",
    mobilePayment: {
      bank: "Banco de Venezuela",
      phone: "0414-7654321",
      rif: "J-87654321-0",
      holder: "FerreMax S.A.",
    },
  },
  "ToolMaster": {
    bank: "Banesco",
    accountType: "Corriente",
    accountNumber: "0134-0789-01-4567891230",
    beneficiary: "ToolMaster C.A.",
    rif: "J-11223344-5",
    phone: "0424-1122334",
    email: "pagos@toolmaster.com",
    mobilePayment: {
      bank: "Banesco",
      phone: "0424-1122334",
      rif: "J-11223344-5",
      holder: "ToolMaster C.A.",
    },
  },
  "PowerTools Pro": {
    bank: "Mercantil",
    accountType: "Corriente",
    accountNumber: "0105-0567-89-3216549870",
    beneficiary: "PowerTools Pro",
    rif: "J-99887766-3",
    phone: "0416-9988776",
    email: "ventas@powertoolspro.com",
    mobilePayment: {
      bank: "Mercantil",
      phone: "0416-9988776",
      rif: "J-99887766-3",
      holder: "PowerTools Pro",
    },
  },
  "SafetyFirst": {
    bank: "Banco Nacional de Crédito",
    accountType: "Corriente",
    accountNumber: "0191-0123-45-7894561230",
    beneficiary: "SafetyFirst C.A.",
    rif: "J-55443322-1",
    phone: "0412-5544332",
    email: "pagos@safetyfirst.com",
    mobilePayment: {
      bank: "Banco Nacional de Crédito",
      phone: "0412-5544332",
      rif: "J-55443322-1",
      holder: "SafetyFirst C.A.",
    },
  },
};

// Las tiendas pueden subir sus datos de pago desde su perfil.
// En producción esto vendría del backend; aquí se lee localStorage como simulación.
const getStorePaymentInfo = (storeName) => {
  try {
    const storeProfiles = JSON.parse(localStorage.getItem("storePaymentProfiles") || "{}");
    if (storeProfiles[storeName]) return storeProfiles[storeName];
  } catch (error) {
    console.error("No se pudieron leer los datos de pago del perfil de tienda:", error);
  }

  return storePaymentData[storeName] || storePaymentData["Distribuidora Atlas"];
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
  onViewProduct,
  checkoutError = "",
  onPaymentVerificationSent,
}) {
  const [savedForLater, setSavedForLater] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotificationSent, setPaymentNotificationSent] = useState(false);
  const [selectedStorePayment, setSelectedStorePayment] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [creditedCashback, setCreditedCashback] = useState(0);

  // Agrupar productos por tienda/vendedor
  const productsByStore = useMemo(() => {
    const grouped = {};
    cart.forEach(item => {
      const storeName = item.seller || item.sellerName || "Vendedor no identificado";
      if (!grouped[storeName]) {
        grouped[storeName] = {
          products: [],
          total: 0,
          paymentInfo: getStorePaymentInfo(storeName),
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

  const createPendingVerificationOrder = (storeName = "Varias tiendas") => {
    const order = {
      id: `ORD-${Date.now()}`,
      storeName,
      status: "pending_seller_verification",
      statusLabel: "En espera de verificación del vendedor",
      total,
      cashbackToCredit: sessionType === "natural" ? cashbackTotal : 0,
      createdAt: new Date().toISOString(),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        seller: item.seller || item.sellerName || storeName,
      })),
    };

    setPendingOrder(order);

    try {
      const savedOrders = JSON.parse(localStorage.getItem("pendingSellerVerificationOrders") || "[]");
      localStorage.setItem("pendingSellerVerificationOrders", JSON.stringify([order, ...savedOrders]));
    } catch (error) {
      console.error("No se pudo guardar la orden pendiente:", error);
    }

    return order;
  };

  const handleSellerPaymentConfirmation = () => {
    if (!pendingOrder) return;

    const cashbackAmount = Number(pendingOrder.cashbackToCredit || 0);
    const confirmedOrder = {
      ...pendingOrder,
      status: "payment_confirmed",
      statusLabel: "Pago confirmado por el vendedor",
      cashbackStatus: cashbackAmount > 0 ? "credited" : "not_applicable",
      confirmedAt: new Date().toISOString(),
    };

    setPendingOrder(confirmedOrder);
    setCreditedCashback(cashbackAmount);

    try {
      const currentBalance = Number(localStorage.getItem("userCashbackBalance") || 0);
      localStorage.setItem("userCashbackBalance", String(currentBalance + cashbackAmount));
      window.dispatchEvent(new Event("cashback-balance-updated"));
      const savedOrders = JSON.parse(localStorage.getItem("pendingSellerVerificationOrders") || "[]");
      localStorage.setItem(
        "pendingSellerVerificationOrders",
        JSON.stringify(savedOrders.map((order) => (order.id === confirmedOrder.id ? confirmedOrder : order)))
      );
    } catch (error) {
      console.error("No se pudo acreditar el cashback:", error);
    }
  };

  const handleSendPaymentVerification = () => {
    if (!paymentReference.trim() || !selectedStorePayment) {
      alert("Escribe el número de operación o referencia del pago.");
      return;
    }

    const order = pendingOrder || createPendingVerificationOrder(selectedStorePayment.storeName);
    const orderWithReference = {
      ...order,
      storeName: selectedStorePayment.storeName,
      paymentReference: paymentReference.trim(),
      paymentInfo: selectedStorePayment.paymentInfo,
      status: "payment_reference_sent",
      statusLabel: "Pedido en validación de pago",
      pickupMessage: "Tu pedido está en validación de pago. En un tiempo de 3 minutos ya puedes ir a retirar el pedido.",
      notifiedAt: new Date().toISOString(),
    };

    setPendingOrder(orderWithReference);
    setPaymentNotificationSent(true);

    try {
      const savedOrders = JSON.parse(localStorage.getItem("pendingSellerVerificationOrders") || "[]");
      const nextOrders = savedOrders.some((savedOrder) => savedOrder.id === orderWithReference.id)
        ? savedOrders.map((savedOrder) => (savedOrder.id === orderWithReference.id ? orderWithReference : savedOrder))
        : [orderWithReference, ...savedOrders];
      localStorage.setItem("pendingSellerVerificationOrders", JSON.stringify(nextOrders));

      const sellerNotifications = JSON.parse(localStorage.getItem("sellerPaymentNotifications") || "[]");
      localStorage.setItem(
        "sellerPaymentNotifications",
        JSON.stringify([
          {
            id: `NOT-${Date.now()}`,
            type: "payment_verification_request",
            storeName: selectedStorePayment.storeName,
            orderId: orderWithReference.id,
            paymentReference: paymentReference.trim(),
            total: selectedStorePayment.total,
            message: `El comprador reportó el pago de la orden ${orderWithReference.id}. Verifica la referencia ${paymentReference.trim()}.`,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...sellerNotifications,
        ])
      );

      localStorage.setItem(
        "latestPaymentValidationMessage",
        JSON.stringify({
          id: orderWithReference.id,
          message: "Tu pedido está en validación de pago. En un tiempo de 3 minutos ya puedes ir a retirar el pedido.",
          createdAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("No se pudo notificar a la tienda:", error);
    }

    setShowPaymentModal(false);
    setSelectedStorePayment(null);
    setPaymentReference("");
    if (typeof onPaymentVerificationSent === "function") {
      onPaymentVerificationSent(orderWithReference);
    } else if (typeof onContinueShopping === "function") {
      onContinueShopping();
    }
  };

  const handleFinanceInvoice = () => {
    if (sessionType !== "juridico_detallista") return;

    const request = {
      id: `FIN-${Date.now()}`,
      type: "invoice_financing_cart",
      amount: Number(total || 0),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        seller: item.seller || item.sellerName || "Vendedor no identificado",
      })),
      status: "Pendiente",
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = JSON.parse(localStorage.getItem("invoiceFinancingRequests") || "[]");
      localStorage.setItem("invoiceFinancingRequests", JSON.stringify([request, ...saved]));
    } catch (error) {
      console.error("No se pudo guardar la solicitud de financiamiento:", error);
    }

    alert("✅ Solicitud de financiamiento de factura registrada. El administrador revisará la solicitud antes de aprobarla.");
  };

  // Manejar el clic en "Proceder al pago"
  const handleProceedToPayment = () => {
    const storeNames = Object.keys(productsByStore);
    createPendingVerificationOrder(storeNames.length === 1 ? storeNames[0] : "Varias tiendas");

    if (storeNames.length === 1) {
      setSelectedStorePayment({
        storeName: storeNames[0],
        ...productsByStore[storeNames[0]],
      });
      setPaymentReference("");
      setPaymentNotificationSent(false);
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
    setPaymentReference("");
    setPaymentNotificationSent(false);
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
    setPaymentReference("");
    setPaymentNotificationSent(false);
    setCreditedCashback(0);
  };

  const discount = promoApplied ? (cartSummary?.subtotal || 0) * 0.1 : 0;
  const total = (cartSummary?.subtotal || 0) - discount;
  const cashbackTotal = sessionType === "natural" ? cartSummary?.cashback || 0 : 0;

  const CartItem = ({ item }) => {
    const stock = Number(item.stock) || 1;
    const cashback = productCashback(item.price, item.quantity);
    const storeName = item.seller || item.sellerName || "Vendedor verificado";

    return (
      <div className="flex flex-col gap-4 border-b py-4 sm:flex-row sm:py-6" style={{ borderColor: PALETTE.softBorder }}>
        <div className="w-full flex-shrink-0 sm:w-32">
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
            <div className="text-left sm:text-right">
              <p className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>
                {formatUSD(item.price)}
              </p>
              {item.originalPrice && (
                <p className="text-xs line-through text-gray-400">{formatUSD(item.originalPrice)}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
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
    <div className="flex flex-col items-stretch gap-3 border-b py-3 sm:flex-row sm:items-center sm:gap-4" style={{ borderColor: PALETTE.softBorder }}>
      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
      <div className="flex-1">
        <p className="font-medium text-sm">{item.name}</p>
        <p className="text-sm font-bold">{formatUSD(item.price)}</p>
      </div>
      <button onClick={() => handleMoveToCart(item)} className="rounded-full px-4 py-2 text-sm font-medium" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>
        Mover al carrito
      </button>
    </div>
  );

  const RelatedProductCard = ({ product }) => (
    <div className="w-1/2 flex-shrink-0 p-1.5 sm:w-1/3 sm:p-2 md:w-1/4 lg:w-1/6">
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
        <div className="mt-2 grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => addToCart?.({ ...product, quantity: 1, stock: product.stock || 10 })}
            className="w-full rounded-full py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
          >
            Agregar al carrito
          </button>
          <button
            type="button"
            onClick={() => onViewProduct?.(product)}
            className="w-full rounded-full border py-1.5 text-xs font-semibold transition-all hover:scale-105"
            style={{ borderColor: PALETTE.crystalBlue, color: PALETTE.maastrichtBlue }}
          >
            Ver producto
          </button>
        </div>
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
  const renderPaymentModal = () => {
    const storeNames = Object.keys(productsByStore);
    const isSingleStore = storeNames.length === 1;

    if (!isSingleStore && !selectedStorePayment) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-3 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white sm:mx-4" style={{ backgroundColor: PALETTE.white }}>
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

    const bankInfoRows = [
      ["Banco", paymentData.paymentInfo.bank],
      ["Tipo de cuenta", paymentData.paymentInfo.accountType],
      ["Número de cuenta", paymentData.paymentInfo.accountNumber],
      ["Beneficiario", paymentData.paymentInfo.beneficiary],
      ["RIF", paymentData.paymentInfo.rif],
    ].filter(([, value]) => Boolean(value));

    const mobilePayment = paymentData.paymentInfo.mobilePayment;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
        <div className="mx-3 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white sm:mx-4" style={{ backgroundColor: PALETTE.white }}>
          <div className="flex justify-between items-center p-4 border-b" style={{ borderColor: PALETTE.softBorder }}>
            <div>
              <h2 className="text-xl font-bold">Pagar a {paymentData.storeName}</h2>
              <p className="text-xs text-gray-500">Monto total: {formatUSD(paymentData.total)}</p>
            </div>
            <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-5 space-y-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
              <p className="text-xs text-gray-500 mb-1">Información de la tienda</p>
              <p className="text-sm font-semibold">{paymentData.storeName}</p>
              <p className="text-xs text-gray-600">Estos datos se toman del perfil de pago que sube cada tienda.</p>
            </div>

            {mobilePayment && (
              <div className="p-3 rounded-xl" style={{ backgroundColor: "#DFF6F1" }}>
                <p className="text-xs font-bold mb-2" style={{ color: PALETTE.success }}>Pago móvil</p>
                <div className="space-y-2">
                  {[
                    ["Banco", mobilePayment.bank],
                    ["Teléfono", mobilePayment.phone],
                    ["Documento/RIF", mobilePayment.rif],
                    ["Titular", mobilePayment.holder],
                  ].filter(([, value]) => Boolean(value)).map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center gap-3 text-sm">
                      <span className="text-gray-600">{label}:</span>
                      <div className="flex items-center gap-2 text-right">
                        <span className="font-medium">{value}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(value, `mobile-${label}`)}
                          className="p-1 hover:bg-white/60 rounded"
                          title={`Copiar ${label}`}
                        >
                          {copiedField === `mobile-${label}` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
              <p className="text-xs font-bold mb-2" style={{ color: PALETTE.maastrichtBlue }}>Transferencia bancaria</p>
              <div className="space-y-2">
                {bankInfoRows.map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center gap-3 text-sm">
                    <span className="text-gray-600">{label}:</span>
                    <div className="flex items-center gap-2 text-right">
                      <span className={label === "Número de cuenta" || label === "RIF" ? "font-mono font-medium" : "font-medium"}>{value}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(value, label)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title={`Copiar ${label}`}
                      >
                        {copiedField === label ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.page }}>
              <p className="text-xs text-gray-500">Detalle de productos</p>
              {paymentData.products.map((product, idx) => (
                <div key={idx} className="flex justify-between text-sm mt-1 gap-3">
                  <span>{product.name} x{product.quantity}</span>
                  <span>{formatUSD(product.price * product.quantity)}</span>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatUSD(paymentData.total)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border" style={{ borderColor: PALETTE.softBorder }}>
              <label className="block text-xs font-bold mb-2" style={{ color: PALETTE.maastrichtBlue }}>
                Número de operación o referencia del pago
              </label>
              <input
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Ej: 000123456789"
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: PALETTE.softBorder }}
              />
              <p className="mt-2 text-xs text-gray-500">
                Luego de reportar la referencia, la orden queda en espera hasta que la tienda confirme el pago.
              </p>
            </div>

            <Button
              onClick={handleSendPaymentVerification}
              className="w-full rounded-full py-3 font-semibold"
              style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
            >
              Verificar pago
            </Button>

            {paymentNotificationSent && (
              <div className="rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder, backgroundColor: "#FEF3C7" }}>
                <p className="text-sm font-bold" style={{ color: PALETTE.maastrichtBlue }}>
                  Notificación enviada a la tienda
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  La tienda debe revisar la referencia {paymentReference}. El cashback se acreditará únicamente cuando el vendedor confirme el pago.
                </p>
              </div>
            )}

            {pendingOrder && (
              <div className="rounded-xl border p-3" style={{ borderColor: PALETTE.softBorder, backgroundColor: pendingOrder.status === "payment_confirmed" ? "#DFF6F1" : "#FEF3C7" }}>
                <p className="text-sm font-bold" style={{ color: pendingOrder.status === "payment_confirmed" ? PALETTE.success : PALETTE.maastrichtBlue }}>
                  {pendingOrder.statusLabel}
                </p>
                <p className="mt-1 text-xs text-gray-600">Orden {pendingOrder.id}. El cashback no se acredita hasta que el vendedor confirme el pago.</p>
                {pendingOrder.status !== "payment_confirmed" ? (
                  <button
                    type="button"
                    onClick={handleSellerPaymentConfirmation}
                    className="mt-3 w-full rounded-full px-4 py-2 text-xs font-bold"
                    style={{ backgroundColor: PALETTE.success, color: PALETTE.white }}
                  >
                    Simular confirmación del vendedor
                  </button>
                ) : (
                  <p className="mt-2 text-xs font-semibold" style={{ color: PALETTE.success }}>
                    Cashback acreditado: {formatUSD(creditedCashback)}
                  </p>
                )}
              </div>
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
      {showPaymentModal && renderPaymentModal()}

      {/* Header */}
      <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 text-white/80 text-xs">
                <Truck className="h-4 w-4" />
                <span>Envíos a todo el país</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-8">
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
            <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
              {/* Columna izquierda */}
              <div className="lg:col-span-2 space-y-4">
                {sessionType === "natural" && cashbackTotal > 0 && (
                  <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: "#DFF6F1", border: `1px solid ${PALETTE.success}` }}>
                    <Award className="h-5 w-5" style={{ color: PALETTE.success }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: PALETTE.success }}>
                        ¡Ganas {formatUSD(cashbackTotal)} en cashback con esta compra!
                      </p>
                      <p className="text-xs opacity-75">El cashback queda reservado y se acreditará cuando el vendedor confirme el pago.</p>
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
                      <div className="flex flex-col gap-2 sm:flex-row">
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

                    {sessionType === "juridico_detallista" && (
                      <button
                        onClick={handleFinanceInvoice}
                        className="w-full mt-3 rounded-full border py-3 font-bold text-base transition-all hover:scale-[1.02]"
                        style={{ borderColor: PALETTE.sizzlingSunrise, backgroundColor: PALETTE.white, color: PALETTE.maastrichtBlue }}
                      >
                        Financiar factura
                      </button>
                    )}

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
                <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
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
          <div className="mt-2 flex flex-wrap justify-center gap-3 sm:gap-4">
            <span>Política de privacidad</span>
            <span>Términos y condiciones</span>
          </div>
        </div>
      </footer>
    </div>
  );
}