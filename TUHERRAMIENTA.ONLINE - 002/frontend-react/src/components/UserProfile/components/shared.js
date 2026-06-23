/* eslint-disable no-unused-vars */
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

export const KPICard = ({ title, value, subtitle, icon, color = "#FFD200", trend, trendValue, onClick }) => {
  const [showFormula, setShowFormula] = useState(false);
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="mb-3 grid grid-cols-[1fr_auto_auto] items-center gap-2">
        <p className="min-w-0 whitespace-normal break-words text-xs font-black uppercase tracking-[0.12em]" style={{ color: "#6E98AF" }}>{title}</p>
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); setShowFormula((value) => !value); }}
          className="shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] transition hover:bg-slate-100"
          style={{ borderColor: `${color}55`, color }}
        >
          {showFormula ? "▾" : "▸"} Fórmula
        </button>
        <div className="shrink-0 rounded-xl p-2" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: "#091A2D" }}>{value}</p>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>{subtitle}</p>}
      {trend && (
        <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {trend === 'up' ? '↑' : '↓'} {trendValue}%
        </div>
      )}
      {showFormula && (
        <div className="mt-3 rounded-2xl border p-3 text-xs font-semibold leading-relaxed shadow-inner" style={{ backgroundColor: "#0B1F35", borderColor: "#1B3149", color: "#FFFFFF" }}>
          <p className="font-black uppercase tracking-[0.12em]" style={{ color: "#FFD200" }}>Fórmula</p>
          <p className="mt-1 text-white/90">{subtitle || title}</p>
          <p className="mt-3 font-black uppercase tracking-[0.12em]" style={{ color: "#FFD200" }}>Finalidad</p>
          <p className="mt-1 text-white/90">Permite interpretar el indicador y entender para qué sirve dentro del dashboard.</p>
        </div>
      )}
    </div>
  );
};

export const ProgressBar = ({ value, max, color, label, showPercentage = true }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs mb-1"><span>{label}</span>{showPercentage && <span>{Math.round(percentage)}%</span>}</div>}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
};

export const AlertCard = ({ type, title, message, action, onAction, actionText }) => {
  const colors = {
    warning: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    danger: { bg: "#FEE2E2", border: "#EF4444", text: "#991B1B" },
    info: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF" },
    success: { bg: "#D1FAE5", border: "#10B981", text: "#065F46" }
  };
  const color = colors[type] || colors.info;
  return (
    <div className="p-3 rounded-lg border-l-4" style={{ backgroundColor: color.bg, borderLeftColor: color.border }}>
      <p className="font-semibold text-xs" style={{ color: color.text }}>{title}</p>
      <p className="text-xs mt-0.5" style={{ color: color.text }}>{message}</p>
      {action && (
        <button onClick={onAction} className="text-xs font-semibold mt-2 underline" style={{ color: color.text }}>
          {actionText || "Ver detalles →"}
        </button>
      )}
    </div>
  );
};

export const SimulationCard = ({ title, message, buttonText, onSimulate }) => (
  <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: "#FEDC00", backgroundColor: "#FFFBEB" }}>
    <div className="flex items-center gap-2 mb-2">
      <Brain className="h-4 w-4" style={{ color: "#FEDC00" }} />
      <p className="font-semibold text-sm">{title}</p>
    </div>
    <p className="text-xs text-gray-600 mb-3">{message}</p>
    <button onClick={onSimulate} className="text-xs px-3 py-1.5 rounded-lg bg-yellow-400 font-semibold w-full">
      {buttonText}
    </button>
  </div>
);

// ==========================================================
