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

export default function PortalSelector({ onSelectPortal, onBack, onLogout, userData }) {
  const PALETTE = {
    spaceCadet: "#1B3149",
    pastelGray: "#D6D0C4",
    crystalBlue: "#6E98AF",
    sizzlingSunrise: "#FEDC00",
    maastrichtBlue: "#091A2D",
    page: "#F3F1EC",
    white: "#FFFFFF",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page }}>
      <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
        <div className="px-4 py-3 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a la tienda</span>
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 rounded-full px-3 py-2 text-white hover:bg-white/10">
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="relative mb-6 overflow-hidden rounded-3xl" style={{ backgroundColor: PALETTE.spaceCadet }}>
          <div className="relative z-10 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise }}>
                <User className="h-10 w-10" style={{ color: PALETTE.maastrichtBlue }} />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-sm opacity-90">{userData.userType}</p>
                <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                  <Calendar className="h-3 w-3" />
                  <span>Miembro desde {userData.memberSince}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10"><Package className="h-full w-full" /></div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: PALETTE.maastrichtBlue }}>
          ¿Qué deseas hacer?
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => onSelectPortal("sales")} className="rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: PALETTE.white }}>
            <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.sizzlingSunrise }}><TrendingUp className="h-6 w-6" style={{ color: PALETTE.maastrichtBlue }} /></div><h2 className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>Portal de Ventas</h2></div>
            <p className="text-sm mb-4" style={{ color: PALETTE.crystalBlue }}>Gestiona tus ventas B2C, revisa tu rentabilidad, analiza la rotación de inventario y recibe pedidos de clientes.</p>
            <div className="flex flex-wrap gap-2"><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Dashboard de Ventas B2C</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Rentabilidad</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Rotación de inventario</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Pedidos</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Comisiones TH</span></div>
          </button>

          <button onClick={() => onSelectPortal("purchases")} className="rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: PALETTE.white }}>
            <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-xl" style={{ backgroundColor: PALETTE.sizzlingSunrise }}><CreditCard className="h-6 w-6" style={{ color: PALETTE.maastrichtBlue }} /></div><h2 className="text-xl font-bold" style={{ color: PALETTE.maastrichtBlue }}>Portal de Compras</h2></div>
            <p className="text-sm mb-4" style={{ color: PALETTE.crystalBlue }}>Gestiona tu crédito, revisa tu salud financiera, simula pagos, consulta tus facturas y visualiza tu historial de compras.</p>
            <div className="flex flex-wrap gap-2"><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Dashboard de Crédito</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Gestión de Facturas</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Historial de Compras</span><span className="text-xs px-2 py-1 rounded-full bg-gray-100">Alertas</span></div>
          </button>
        </div>
      </main>
    </div>
  );
}

// ==========================================================
// PORTAL DE VENTAS (DETALLISTA) - B2C
