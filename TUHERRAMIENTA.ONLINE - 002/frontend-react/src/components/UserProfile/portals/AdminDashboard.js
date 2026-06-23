import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Database,
  DollarSign,
  Download,
  FileCheck2,
  Home,
  LineChart,
  LogOut,
  MapPin,
  PackageSearch,
  Search,
  ShieldAlert,
  Store,
  Target,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";
import SharedKpiCard from "../../dashboard/KpiCard";

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
  warning: "#B7791F",
  softWarning: "rgba(254,220,0,0.18)",
};

const brandLogo = "/logo_full.png";
const today = new Date("2026-06-08T12:00:00");
const validB2BStates = ["Despachado", "Cobrado", "Vencido"];

const AdminFilterContext = createContext({ filters: {}, setFilters: () => {} });

const textMatches = (search, values) => {
  const query = String(search || "").trim().toLowerCase();
  if (!query) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(query));
};

const listAllows = (selected, value) => !Array.isArray(selected) || selected.length === 0 || selected.includes(value);
const dateAllows = (dateValue, start, end) => {
  if (!dateValue) return true;
  const value = String(dateValue).slice(0, 10);
  const from = start || "0000-01-01";
  const to = end || start || "9999-12-31";
  return value >= from && value <= to;
};

const selectedNamesToIds = (items, selectedNames) => {
  if (!Array.isArray(selectedNames) || selectedNames.length === 0) return null;
  return new Set(items.filter((item) => selectedNames.includes(item.name)).map((item) => item.id));
};


const adminLocationData = [
  { state: "Carabobo", cities: [{ name: "Valencia", urbanizations: ["El Viñedo", "Prebo", "La Trigaleña"] }, { name: "San Diego", urbanizations: ["Los Jarales", "Monteserino"] }] },
  { state: "Distrito Capital", cities: [{ name: "Caracas", urbanizations: ["Catia", "Chacao", "Baruta"] }] },
  { state: "Lara", cities: [{ name: "Barquisimeto", urbanizations: ["Nueva Segovia"] }, { name: "Quibor", urbanizations: ["Centro"] }] },
  { state: "Zulia", cities: [{ name: "Maracaibo", urbanizations: ["La Limpia", "Cecilio Acosta"] }] },
  { state: "Aragua", cities: [{ name: "Maracay", urbanizations: ["Las Delicias"] }] },
  { state: "Anzoátegui", cities: [{ name: "Barcelona", urbanizations: ["Nueva Barcelona"] }] },
];

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateRange = (start, end) => {
  const pretty = (value) => {
    if (!value) return "";
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  };
  return `${pretty(start)} - ${pretty(end || start)}`;
};

const wholesalers = [
  { id: "w1", name: "Distribuidora Atlas", state: "Distrito Capital", city: "Caracas", sales: 82900, prevSales: 71400, orders: 164, stores: 31, onTime: 92, rejected: 4, cancelled: 3, lastInventory: "2026-06-05" },
  { id: "w2", name: "Industrial Norte", state: "Carabobo", city: "Valencia", sales: 61420, prevSales: 49500, orders: 126, stores: 24, onTime: 86, rejected: 6, cancelled: 4, lastInventory: "2026-05-30" },
  { id: "w3", name: "Pinturas Mayor Pro", state: "Zulia", city: "Maracaibo", sales: 44870, prevSales: 41100, orders: 96, stores: 18, onTime: 90, rejected: 2, cancelled: 2, lastInventory: "2026-05-18" },
  { id: "w4", name: "Suministros Centro", state: "Lara", city: "Barquisimeto", sales: 38200, prevSales: 36500, orders: 88, stores: 14, onTime: 75, rejected: 9, cancelled: 7, lastInventory: "2026-04-25" },
  { id: "w5", name: "FerreMax Mayorista", state: "Aragua", city: "Maracay", sales: 33740, prevSales: 28200, orders: 79, stores: 16, onTime: 81, rejected: 5, cancelled: 6, lastInventory: "2026-06-01" },
  { id: "w6", name: "Herramientas Oriente", state: "Anzoátegui", city: "Barcelona", sales: 28600, prevSales: 31200, orders: 62, stores: 11, onTime: 70, rejected: 8, cancelled: 5, lastInventory: "2026-05-02" },
];

const hardwareStores = [
  { id: "h1", name: "FerreNova Retail", state: "Distrito Capital", city: "Caracas", wholesalerId: "w1", b2b: 36400, b2c: 18420, customers: 420, recurrent: 176, blocked: false, blockEvents: 0, reinsertions: 0 },
  { id: "h2", name: "Ferretería Los Andes", state: "Carabobo", city: "Valencia", wholesalerId: "w2", b2b: 31500, b2c: 15230, customers: 315, recurrent: 98, blocked: false, blockEvents: 1, reinsertions: 1 },
  { id: "h3", name: "Constructor Express", state: "Zulia", city: "Maracaibo", wholesalerId: "w3", b2b: 28700, b2c: 12610, customers: 260, recurrent: 73, blocked: true, blockEvents: 3, reinsertions: 1 },
  { id: "h4", name: "Suministros Centro", state: "Lara", city: "Barquisimeto", wholesalerId: "w4", b2b: 22100, b2c: 10390, customers: 214, recurrent: 61, blocked: false, blockEvents: 2, reinsertions: 2 },
  { id: "h5", name: "Ferretería El Constructor", state: "Aragua", city: "Maracay", wholesalerId: "w5", b2b: 20500, b2c: 9640, customers: 186, recurrent: 44, blocked: false, blockEvents: 0, reinsertions: 0 },
  { id: "h6", name: "FerreHogar Oriente", state: "Anzoátegui", city: "Barcelona", wholesalerId: "w6", b2b: 18400, b2c: 8390, customers: 146, recurrent: 38, blocked: true, blockEvents: 2, reinsertions: 0 },
];

const invoices = [
  { id: "FAC-00154", order: "PED-01245", storeId: "h3", wholesalerId: "w3", dispatch: "2026-04-20", total: 4200, paid: 1600, covered: 0, status: "Vencida", assigned: "Laura Pérez", collections: "Contactado", recovered: 0, cessionStart: "2026-05-28", cessionStatus: "En Revisión" },
  { id: "FAC-00158", order: "PED-01287", storeId: "h2", wholesalerId: "w2", dispatch: "2026-05-04", total: 3600, paid: 1200, covered: 0, status: "Próxima a vencer", assigned: "Luis Rojas", collections: "Promesa de Pago", recovered: 0 },
  { id: "FAC-00163", order: "PED-01308", storeId: "h1", wholesalerId: "w1", dispatch: "2026-05-22", total: 5200, paid: 0, covered: 0, status: "Al día", assigned: "María Gómez", collections: "Pendiente" },
  { id: "FAC-00167", order: "PED-01340", storeId: "h4", wholesalerId: "w4", dispatch: "2026-04-02", total: 3100, paid: 0, covered: 3100, status: "Cedida a TH.O", assigned: "Laura Pérez", collections: "Cubierta por TH.O", recovered: 950, cessionStart: "2026-05-10", cessionStatus: "Completado" },
  { id: "FAC-00172", order: "PED-01375", storeId: "h6", wholesalerId: "w6", dispatch: "2026-03-18", total: 2750, paid: 500, covered: 2250, status: "Cedida a TH.O", assigned: "Carlos Díaz", collections: "Recuperación Parcial", recovered: 700, cessionStart: "2026-04-22", cessionStatus: "Completado" },
  { id: "FAC-00181", order: "PED-01420", storeId: "h5", wholesalerId: "w5", dispatch: "2026-05-10", total: 1980, paid: 1980, covered: 0, status: "Pagada", assigned: "María Gómez", collections: "Recuperada", recovered: 0 },
];

const products = [
  { id: "p1", thoId: "THO-DISCO-45", name: "Disco corte 4.5\"", category: "Consumibles", brand: "Makita", wholesalerId: "w1", inventory: 480, minStock: 80, sales12m: 146820, units12m: 128760, previousUnits: 103400, costs: [0.48, 0.52, 0.46, 0.51], active: true, updated: "2026-06-05", monthly: [9800, 10120, 10450, 10240, 10620, 10910, 11200, 11130, 10990, 11340, 11670, 12290] },
  { id: "p2", thoId: "THO-GUANTE-N5", name: "Guantes anticorte nivel 5", category: "Seguridad industrial", brand: "3M", wholesalerId: "w2", inventory: 92, minStock: 120, sales12m: 118640, units12m: 74250, previousUnits: 49200, costs: [0.72, 0.69, 0.74], active: true, updated: "2026-06-02", monthly: [4300, 4620, 4980, 5300, 5740, 6120, 6510, 6730, 6920, 7060, 7240, 8730] },
  { id: "p3", thoId: "THO-BROCA-TITANIO-13", name: "Brocas titanio set x13", category: "Herramientas", brand: "Bosch", wholesalerId: "w3", inventory: 0, minStock: 20, sales12m: 93680, units12m: 18920, previousUnits: 15880, costs: [4.9, 5.1, 5.35], active: true, updated: "2026-04-28", monthly: [1390, 1420, 1500, 1530, 1575, 1600, 1610, 1580, 1640, 1660, 1695, 1720] },
  { id: "p4", thoId: "THO-CINTA-METRICA-5M", name: "Cinta métrica 5 m", category: "Medición", brand: "Stanley", wholesalerId: "w4", inventory: 710, minStock: 75, sales12m: 44260, units12m: 22130, previousUnits: 18600, costs: [], active: true, updated: "2026-05-16", monthly: [1510, 1600, 1660, 1720, 1775, 1820, 1870, 1910, 1940, 1980, 2095, 2250] },
  { id: "p5", thoId: "THO-TALADRO-12", name: "Taladro percutor 1/2", category: "Herramientas eléctricas", brand: "Bosch", wholesalerId: "w5", inventory: 31, minStock: 40, sales12m: 161280, units12m: 5376, previousUnits: 4960, costs: [17.8, 18.1, 17.6], active: true, updated: "2026-05-30", monthly: [420, 430, 440, 445, 450, 452, 448, 455, 456, 459, 460, 461] },
  { id: "p6", thoId: "THO-CABLE-12", name: "Cable THHN calibre 12", category: "Electricidad", brand: "Phelps Dodge", wholesalerId: "w6", inventory: 980, minStock: 150, sales12m: 139760, units12m: 69880, previousUnits: 60200, costs: [1.08, 1.12, 1.10], active: true, updated: "2026-05-04", monthly: [5220, 5380, 5500, 5660, 5740, 5810, 5900, 5960, 6020, 6140, 6280, 6270] },
];

const b2cSales = [
  { id: "B2C-301", storeId: "h1", customer: "Ana Rivas", date: "2026-06-02", amount: 180, cashbackUsed: 8 },
  { id: "B2C-302", storeId: "h2", customer: "Carlos Mendoza", date: "2026-06-03", amount: 245, cashbackUsed: 12 },
  { id: "B2C-303", storeId: "h3", customer: "María Torres", date: "2026-06-04", amount: 320, cashbackUsed: 0 },
  { id: "B2C-304", storeId: "h1", customer: "Ana Rivas", date: "2026-06-07", amount: 95, cashbackUsed: 4 },
  { id: "B2C-305", storeId: "h4", customer: "José León", date: "2026-06-07", amount: 410, cashbackUsed: 20 },
  { id: "B2C-306", storeId: "h5", customer: "Laura Díaz", date: "2026-06-08", amount: 155, cashbackUsed: 0 },
];

const operations = [
  { id: "PED-01450", date: "2026-06-08", wholesalerId: "w1", storeId: "h1", status: "Despachado", amount: 1280, created: "2026-06-06", dispatch: "2026-06-08", responsible: "Operaciones TH.O" },
  { id: "PED-01451", date: "2026-06-08", wholesalerId: "w2", storeId: "h2", status: "Por Despachar", amount: 920, created: "2026-06-05", responsible: "Industrial Norte" },
  { id: "PED-01452", date: "2026-06-07", wholesalerId: "w3", storeId: "h3", status: "Rechazado", amount: 650, created: "2026-06-06", responsible: "Pinturas Mayor Pro" },
  { id: "PED-01453", date: "2026-06-07", wholesalerId: "w4", storeId: "h4", status: "Cancelado", amount: 740, created: "2026-06-03", responsible: "Suministros Centro" },
  { id: "PED-01454", date: "2026-06-06", wholesalerId: "w5", storeId: "h5", status: "Despachado", amount: 1100, created: "2026-06-05", dispatch: "2026-06-06", responsible: "FerreMax Mayorista" },
];

const auditEvents = [
  { date: "2026-06-08", time: "10:30", user: "Admin TH.O", profile: "Administrador", action: "Cobertura Ejecutada", module: "Cobranza", record: "FAC-00167", result: "Exitoso", amount: 3100, ip: "190.12.20.15" },
  { date: "2026-06-08", time: "09:10", user: "Laura Pérez", profile: "Cobranza", action: "Promesa de Pago", module: "Riesgo", record: "FAC-00158", result: "Exitoso", amount: 2400, ip: "190.12.20.44" },
  { date: "2026-06-07", time: "17:42", user: "Sistema", profile: "Automático", action: "Usuario Bloqueado", module: "Gobierno", record: "Constructor Express", result: "Exitoso", amount: 0, ip: "system" },
  { date: "2026-06-07", time: "15:20", user: "Admin TH.O", profile: "Administrador", action: "Cambio de Catálogo", module: "Inventario", record: "THO-GUANTE-N5", result: "Exitoso", amount: 0, ip: "190.12.20.15" },
];

const applications = [
  { date: "2026-06-01", type: "Mayorista", legal: "Herramientas Global CA", commercial: "Herramientas Global", rif: "J-41234567-8", state: "Carabobo", city: "Valencia", responsible: "Admin TH.O", status: "Pendiente" },
  { date: "2026-06-03", type: "Ferretería", legal: "Ferretería Plaza CA", commercial: "Ferretería Plaza", rif: "J-40321345-1", state: "Distrito Capital", city: "Caracas", responsible: "María Gómez", status: "En Revisión" },
  { date: "2026-06-05", type: "Mayorista", legal: "Pinturas Andinas CA", commercial: "Pinturas Andinas", rif: "J-40988991-7", state: "Mérida", city: "Mérida", responsible: "Luis Rojas", status: "Información Solicitada" },
];


const paymentNotifications = [
  { id: "PAG-COM-001", date: "2026-06-08", payerType: "Mayorista", payer: "Distribuidora Atlas", rif: "J-30111222-0", invoice: "COM-B2B-001", amount: 1243.5, method: "Transferencia", reference: "0102-558899", status: "Pendiente", concept: "Comisión B2B" },
  { id: "PAG-COM-002", date: "2026-06-07", payerType: "Ferretería", payer: "FerreNova Retail", rif: "J-40111222-0", invoice: "COM-B2C-014", amount: 921.0, method: "Pago móvil", reference: "PM-778812", status: "Pendiente", concept: "Comisión B2C" },
  { id: "PAG-FAC-003", date: "2026-06-06", payerType: "Ferretería", payer: "Ferretería Los Andes", rif: "J-40222333-1", invoice: "FAC-00158", amount: 2400, method: "Transferencia", reference: "0134-990011", status: "Validado", concept: "Pago factura B2B" },
];

const money = (value) => {
  const numeric = Number(value || 0);
  const hasDecimals = Math.abs(numeric % 1) > 0.000001;
  return `USD ${numeric.toLocaleString("es-VE", { minimumFractionDigits: hasDecimals ? 2 : 0, maximumFractionDigits: hasDecimals ? 2 : 0 })}`;
};
const money2 = (value) => `USD ${Number(value || 0).toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (value, digits = 0) => Number(value || 0).toLocaleString("es-VE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const pct = (value) => `${num(value, 2)}%`;
const paymentHistoryRows = [
  ["08/06/2026", "Distribuidora Atlas", "J-30111222-0", "COM-B2B-001", money2(1243.5), "Comisión B2B", "Registrado"],
  ["07/06/2026", "FerreNova Retail", "J-40111222-0", "COM-B2C-014", money2(921), "Comisión B2C", "Registrado"],
  ["06/06/2026", "Ferretería Los Andes", "J-40222333-1", "FAC-00158", money2(2400), "Pago factura", "Validado"],
];

const displayMoneyNumber = (value) => {
  const parsed = parseExcelMoney(value);
  const numeric = Number(parsed.value);
  if (!Number.isFinite(numeric)) return String(value ?? "").replace(/^USD\s*/i, "").replace(/^US\$\s*/i, "");
  const hasDecimals = Math.abs(numeric % 1) > 0.000001;
  return numeric.toLocaleString("es-VE", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  });
};
const wrapHeaderLabel = (label) => String(label || "")
  .replace(/Comisión TH\.O captación estimada USD/gi, "Comisión TH.O\nCaptación estimada USD")
  .replace(/Comisión TH\.O plataforma USD/gi, "Comisión TH.O\nPlataforma USD")
  .replace(/Comisión vendedor estimada USD/gi, "Comisión vendedor\nEstimada USD")
  .replace(/Total comisiones estimadas USD/gi, "Total comisiones\nEstimadas USD")
  .replace(/Flujo neto esperado USD/gi, "Flujo neto\nEsperado USD")
  .replace(/Capital cubierto histórico USD/gi, "Capital cubierto\nHistórico USD")
  .replace(/Capital recuperado histórico USD/gi, "Capital recuperado\nHistórico USD")
  .replace(/Capital cubierto vigente USD/gi, "Capital cubierto\nVigente USD")
  .replace(/Ingreso por reinserción USD/gi, "Ingreso por\nReinserción USD")
  .replace(/Utilidad ajustada USD/gi, "Utilidad\nAjustada USD")
  .replace(/Utilidad bruta TH\.O USD/gi, "Utilidad bruta\nTH.O USD")
  .replace(/Ventas totales B2C USD/gi, "Ventas totales\nB2C USD")
  .replace(/Compras totales B2B USD/gi, "Compras totales\nB2B USD");
const avg = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const safePct = (part, total) => total ? (part / total) * 100 : 0;
const daysBetween = (a, b = today) => Math.ceil((new Date(b) - new Date(a)) / 86400000);
const addDays = (date, days) => new Date(new Date(date).getTime() + days * 86400000);
const dateShort = (date) => new Date(date).toLocaleDateString("es-VE");
const stateLabel = (id) => hardwareStores.find((s) => s.id === id)?.state || wholesalers.find((w) => w.id === id)?.state || "N/A";
const storeName = (id) => hardwareStores.find((s) => s.id === id)?.name || "Sin ferretería";
const wholesalerName = (id) => wholesalers.find((w) => w.id === id)?.name || "Sin mayorista";
const escapeCell = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");

const excelMoneyTerms = [
  "venta total", "monto", "saldo", "ticket", "cartera", "comision", "comisión", "capital",
  "utilidad", "ingreso", "cashback", "cobrado", "cubierto", "recuperado", "flujo",
  "reinserción", "reinsercion", "precio", "costo", "base cerrada", "valor"
];

const isExcelMoneyColumn = (label, value) => {
  const normalizedLabel = String(label || "").toLowerCase();
  const normalizedValue = String(value ?? "").trim().toLowerCase();
  if (normalizedLabel.includes("%")) return false;
  if (normalizedValue.startsWith("usd ") || normalizedValue.startsWith("us$")) return true;
  if (normalizedLabel.includes("usd")) return true;
  return excelMoneyTerms.some((term) => normalizedLabel.includes(term));
};

const excelHeaderLabel = (label, sampleValue) => {
  const text = String(label || "");
  if (!isExcelMoneyColumn(text, sampleValue) || /usd/i.test(text)) return text;
  return `${text} USD`;
};

const parseExcelMoney = (value) => {
  if (value === null || value === undefined || value === "") return { type: "String", value: "" };
  if (typeof value === "number") return { type: "Number", value };
  const raw = String(value).trim();
  if (raw === "-" || raw === "N/A") return { type: "String", value: raw };
  const cleaned = raw
    .replace(/^USD\s*/i, "")
    .replace(/^US\$\s*/i, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");
  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric)) return { type: "String", value: raw.replace(/^USD\s*/i, "").replace(/^US\$\s*/i, "") };
  return { type: "Number", value: numeric };
};

function downloadExcel(filename, sheets) {
  const worksheetXml = sheets.map((sheet) => {
    const sampleRow = sheet.rows?.[0] || [];
    const header = sheet.columns.map((cell, index) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeCell(wrapHeaderLabel(excelHeaderLabel(cell, sampleRow[index])))}</Data></Cell>`).join("");
    const body = sheet.rows.map((row) => `<Row>${row.map((cell, index) => {
      const column = sheet.columns[index];
      if (isExcelMoneyColumn(column, cell)) {
        const parsed = parseExcelMoney(cell);
        return `<Cell><Data ss:Type="${parsed.type}">${escapeCell(parsed.value)}</Data></Cell>`;
      }
      return `<Cell><Data ss:Type="String">${escapeCell(cell)}</Data></Cell>`;
    }).join("")}</Row>`).join("");
    return `<Worksheet ss:Name="${escapeCell(sheet.name).slice(0, 28)}"><Table><Row ss:Height="38">${header}</Row>${body}</Table></Worksheet>`;
  }).join("");
  const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Styles><Style ss:ID="Header"><Interior ss:Color="#091A2D" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF" ss:Bold="1"/><Alignment ss:WrapText="1" ss:Vertical="Center"/></Style></Styles>${worksheetXml}</Workbook>`;
  const blob = new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function useAdminMetrics(filters = {}) {
  return useMemo(() => {
    const values = filters.values || {};
    const selectedWholesalerIds = selectedNamesToIds(wholesalers, values["Mayorista"]);
    const selectedStoreIds = selectedNamesToIds(hardwareStores, values["Ferretería"]);
    const filteredWholesalers = wholesalers.filter((item) => (
      listAllows(filters.states, item.state)
      && listAllows(filters.cities, item.city)
      && (!selectedWholesalerIds || selectedWholesalerIds.has(item.id))
      && textMatches(filters.searchTerm, [item.name, item.state, item.city])
    ));
    const allowedWholesalerIds = new Set(filteredWholesalers.map((item) => item.id));
    const filteredHardwareStores = hardwareStores.filter((store) => (
      listAllows(filters.states, store.state)
      && listAllows(filters.cities, store.city)
      && allowedWholesalerIds.has(store.wholesalerId)
      && (!selectedStoreIds || selectedStoreIds.has(store.id))
      && textMatches(filters.searchTerm, [store.name, store.state, store.city, wholesalerName(store.wholesalerId)])
    ));
    const allowedStoreIds = new Set(filteredHardwareStores.map((store) => store.id));
    const filteredInvoices = invoices.filter((invoice) => (
      allowedWholesalerIds.has(invoice.wholesalerId)
      && allowedStoreIds.has(invoice.storeId)
      && dateAllows(invoice.dispatch, filters.periodStart, filters.periodEnd)
      && textMatches(filters.searchTerm, [invoice.id, invoice.order, storeName(invoice.storeId), wholesalerName(invoice.wholesalerId), invoice.status, invoice.assigned, invoice.collections])
    ));
    const filteredB2cSales = b2cSales.filter((sale) => (
      allowedStoreIds.has(sale.storeId)
      && dateAllows(sale.date, filters.periodStart, filters.periodEnd)
      && textMatches(filters.searchTerm, [sale.id, sale.customer, storeName(sale.storeId)])
    ));
    const operationFilter = values["B2B/B2C"] || values["Tipo de Operación"] || [];
    const includeB2B = !operationFilter.length || operationFilter.includes("B2B") || operationFilter.includes("Ambas");
    const includeB2C = !operationFilter.length || operationFilter.includes("B2C") || operationFilter.includes("Ambas");
    const b2bSales = includeB2B ? filteredWholesalers.reduce((sum, item) => sum + item.sales, 0) : 0;
    const b2cTotal = includeB2C ? (filteredB2cSales.reduce((sum, item) => sum + item.amount, 0) + filteredHardwareStores.reduce((sum, store) => sum + store.b2c, 0)) : 0;
    const ordersCount = includeB2B ? filteredWholesalers.reduce((sum, item) => sum + item.orders, 0) : 0;
    const b2cCount = includeB2C ? filteredB2cSales.length + Math.round(filteredHardwareStores.reduce((sum, store) => sum + store.customers, 0) / 2) : 0;
    const totalSales = b2bSales + b2cTotal;
    const rawInvoiceRows = filteredInvoices.map((invoice) => {
      const dueDate = addDays(invoice.dispatch, 30);
      const daysToDue = Math.ceil((dueDate - today) / 86400000);
      const balance = Math.max(0, invoice.total - invoice.paid - invoice.covered);
      const calculatedStatus = balance === 0 && invoice.covered > 0 ? "Cubierta por TH.O" : balance === 0 ? "Pagada" : daysToDue < 0 ? "Vencida" : daysToDue <= 10 ? "Próxima a vencer" : "Al día";
      const age = daysToDue >= 0 ? "Por vencer" : daysToDue >= -30 ? `Mora ${Math.abs(daysToDue)} días` : daysToDue >= -60 ? `Mora ${Math.abs(daysToDue)} días` : daysToDue >= -90 ? `Mora ${Math.abs(daysToDue)} días` : `Mora +90 días`;
      return { ...invoice, dueDate, daysToDue, balance, calculatedStatus, age };
    });
    const financialFilter = values["Estado Financiero"] || [];
    const invoiceStatusFilter = values["Estado Factura"] || [];
    const commissionFilter = values["Estado Comisión"] || [];
    const collectionFilter = values["Estado Cobranza"] || [];
    const responsibleFilter = values["Responsable"] || [];
    const invoiceRows = rawInvoiceRows.filter((invoice) => (
      listAllows(financialFilter, invoice.calculatedStatus)
      && listAllows(invoiceStatusFilter, invoice.calculatedStatus)
      && listAllows(commissionFilter, invoiceCommissionStatus(invoice))
      && listAllows(collectionFilter, invoice.collections)
      && listAllows(responsibleFilter, invoice.assigned)
    ));
    const carteraActiva = invoiceRows.filter((i) => !["Pagada", "Cubierta por TH.O"].includes(i.calculatedStatus)).reduce((sum, i) => sum + i.balance, 0);
    const carteraCorriente = invoiceRows.filter((i) => i.daysToDue > 10 && i.balance > 0).reduce((sum, i) => sum + i.balance, 0);
    const carteraProxima = invoiceRows.filter((i) => i.daysToDue >= 0 && i.daysToDue <= 10 && i.balance > 0).reduce((sum, i) => sum + i.balance, 0);
    const carteraVencida = invoiceRows.filter((i) => i.daysToDue < 0 && i.balance > 0).reduce((sum, i) => sum + i.balance, 0);
    const coveredHistoric = invoiceRows.reduce((sum, i) => sum + i.covered, 0);
    const recoveredHistoric = invoiceRows.reduce((sum, i) => sum + (i.recovered || 0), 0);
    const coveredCurrent = coveredHistoric - recoveredHistoric;
    const reinsertionIncome = invoiceRows.filter((i) => i.daysToDue < 0).reduce((sum, i) => sum + i.balance * 0.1, 0);
    const b2bCommission = b2bSales * 0.015;
    const b2cGross = b2cTotal * 0.05;
    const b2cCashback = b2cTotal * 0.025;
    const grossIncome = b2bCommission + b2cGross + reinsertionIncome;
    const adjustedUtility = grossIncome - coveredCurrent;
    return {
      b2bSales,
      b2cTotal,
      totalSales,
      ordersCount,
      b2cCount,
      totalOperations: ordersCount + b2cCount,
      invoiceRows,
      carteraActiva,
      carteraCorriente,
      carteraProxima,
      carteraVencida,
      coveredHistoric,
      recoveredHistoric,
      coveredCurrent,
      reinsertionIncome,
      b2bCommission,
      b2cGross,
      b2cCashback,
      grossIncome,
      adjustedUtility,
      activeStores: filteredHardwareStores.length,
      activeWholesalers: filteredWholesalers.length,
      blockedStores: filteredHardwareStores.filter((s) => s.blocked).length,
      wholesalers: filteredWholesalers,
      hardwareStores: filteredHardwareStores,
      invoices: invoiceRows,
      b2cSales: filteredB2cSales,
    };
  }, [filters]);
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: PALETTE.crystalBlue }}>{eyebrow}</p>}
        <h2 className="text-3xl font-black lg:text-4xl" style={{ color: PALETTE.maastrichtBlue }}>{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm" style={{ color: PALETTE.spaceCadet }}>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ title, value, detail, icon: Icon = BarChart3, tone = "default", formula, purpose }) {
  const toneMap = {
    default: "default",
    success: "success",
    warning: "warning",
    danger: "danger",
  };

  return (
    <SharedKpiCard
      title={title}
      value={value}
      detail={detail}
      icon={<Icon className="h-4 w-4" />}
      tone={toneMap[tone] || "default"}
      formula={formula || detail || title}
      purpose={purpose || "Explica el origen del dato y permite evaluar este indicador según los filtros activos."}
    />
  );
}


function DataTable({ columns, rows, maxHeight = "560px", onAction }) {
  const isActionColumn = (column) => ["acciones", "accion", "acción"].includes(String(column || "").trim().toLowerCase());

  return (
    <div className="overflow-auto rounded-2xl border" style={{ borderColor: PALETTE.softBorder, maxHeight }}>
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="sticky top-0 z-10" style={{ backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}>
          <tr>{columns.map((column, index) => <th key={`${column}-${index}`} className="whitespace-normal px-3 py-3 text-xs font-black uppercase leading-tight">{wrapHeaderLabel(excelHeaderLabel(column, rows?.[0]?.[index])).split("\n").map((part, idx) => <React.Fragment key={idx}>{idx > 0 && <br />}{part}</React.Fragment>)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row[0]}-${index}`} className="border-b last:border-b-0 hover:bg-slate-50" style={{ borderColor: PALETTE.softBorder }}>
              {row.map((cell, cellIndex) => (
                <td key={`${cellIndex}-${cell}`} className="whitespace-nowrap px-3 py-3 font-semibold">
                  {isActionColumn(columns[cellIndex]) ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onAction?.({ row, rowIndex: index, action: cell, columns });
                      }}
                      className="rounded-full border px-3 py-1 text-xs font-black transition hover:shadow-sm"
                      style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}
                    >
                      Ver acciones
                    </button>
                  ) : isExcelMoneyColumn(columns[cellIndex], cell) ? displayMoneyNumber(cell) : displayTableCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


const displayTableCell = (cell) => {
  if (typeof cell === "string" && cell.trim().endsWith("%")) return cell.replace(/%+$/g, "");
  return cell;
};

const getWholesalerRif = (id) => ({ w1: "J-30111222-0", w2: "J-30222333-1", w3: "J-30333444-2", w4: "J-30444555-3", w5: "J-30555666-4", w6: "J-30666777-5" }[id] || "J-00000000-0");
const getStoreRif = (id) => ({ h1: "J-40111222-0", h2: "J-40222333-1", h3: "J-40333444-2", h4: "J-40444555-3", h5: "J-40555666-4", h6: "J-40666777-5" }[id] || "J-00000000-0");
const productSku = (id) => `SKU-${String(id || "000").toUpperCase()}`;
const invoiceCommissionStatus = (invoice) => invoice.status === "Pagada" ? "Pagada" : invoice.status === "Cedida a TH.O" ? "En revisión" : "Pendiente";
const invoiceBillingStatus = (invoice) => invoice.status === "Pagada" ? "Pagada" : invoice.status === "Cedida a TH.O" ? "Cubierta por TH.O" : invoice.status;

function StatusBadge({ children, tone = "default" }) {
  const colors = {
    default: [PALETTE.softCard, PALETTE.spaceCadet],
    success: [PALETTE.softSuccess, PALETTE.success],
    warning: [PALETTE.softWarning, PALETTE.warning],
    danger: [PALETTE.softDanger, PALETTE.danger],
  };
  const [bg, color] = colors[tone] || colors.default;
  return <span className="rounded-full px-3 py-1 text-xs font-black" style={{ backgroundColor: bg, color }}>{children}</span>;
}

function FilterPanel({ fields }) {
  const { setFilters: publishFilters } = useContext(AdminFilterContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [periodStart, setPeriodStart] = useState("2026-06-01");
  const [periodEnd, setPeriodEnd] = useState("2026-06-08");
  const [calendarMonth, setCalendarMonth] = useState(new Date("2026-06-01T12:00:00"));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedState, setSelectedState] = useState([]);
  const [selectedCity, setSelectedCity] = useState([]);
  const [selectedUrbanization, setSelectedUrbanization] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [filtersVisible, setFiltersVisible] = useState(true);

  const selectedStates = selectedState.length ? selectedState : adminLocationData.map((item) => item.state);
  const availableCities = adminLocationData
    .filter((item) => selectedStates.includes(item.state))
    .flatMap((item) => item.cities.map((city) => ({ ...city, state: item.state })));
  const selectedCities = selectedCity.length ? selectedCity : availableCities.map((city) => city.name);
  const availableUrbanizations = availableCities
    .filter((city) => selectedCities.includes(city.name))
    .flatMap((city) => city.urbanizations);

  const hasField = (term) => fields.some((field) => field.toLowerCase().includes(term.toLowerCase()));
  const setGenericFilter = (key, value) => setFilterValues((prev) => ({ ...prev, [key]: value }));

  const optionList = (field) => {
    if (field === "Categoría") return [...new Set(products.map((item) => item.category))];
    if (field === "Mayorista") return wholesalers.map((item) => item.name);
    if (field === "Ferretería") return hardwareStores.map((item) => item.name);
    if (field === "Estado Financiero") return ["Corriente", "Próxima a vencer", "Vencida", "Cedida a TH.O", "Recuperada"];
    if (field === "Estado Pedido") return ["Recibido", "Por Despachar", "Despachado", "Cobrado", "Vencido", "Rechazado", "Cancelado"];
    if (field === "Estado Cobranza") return ["Pendiente", "Contactado", "Promesa de Pago", "Negociación", "Sin Respuesta", "En Cesión", "Recuperada"];
    if (field === "Estado Comisión") return ["Pendiente", "Pagada", "En revisión", "Rechazada"];
    if (field === "Estado Factura") return ["Por cobrar", "Pagada", "Con alerta", "Cubierta por TH.O", "Vencida", "Al día"];
    if (field === "Estado Solicitud") return ["Pendiente", "En Revisión", "Información Solicitada", "Aprobada", "Rechazada"];
    if (field === "Estado Cesión") return ["Pendiente", "En Revisión", "Firmado", "Completado"];
    if (field === "Estado Recuperación") return ["Pendiente de Recuperación", "Recuperación Parcial", "Recuperada"];
    if (field === "Tipo Usuario") return ["Mayorista", "Ferretería", "Cliente"];
    if (field === "Tipo Evento") return ["Pedido", "Pago", "Bloqueo", "Auditoría", "Inventario"];
    if (field === "B2B/B2C") return ["B2B", "B2C", "Ambas"];
    if (field === "Tipo de Operación") return ["B2B", "B2C", "Ambas"];
    if (field === "Marca") return [...new Set(products.map((item) => item.brand))];
    if (field === "Inventario") return ["Disponible", "Bajo Inventario", "Agotado"];
    if (field === "Responsable") return ["María Gómez", "Carlos Díaz", "Equipo TH.O", "Auditoría"];
    if (field === "Cliente") return [...new Set(b2cSales.map((item) => item.customer))];
    return [];
  };

  const MultiSelectFilter = ({ label, options = [], value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const values = Array.isArray(value) ? value : [];
    const summary = values.length === 0 ? label : values.length === 1 ? values[0] : `${values.length} seleccionados`;
    const toggle = (option) => {
      if (option === "__all__") return onChange([]);
      onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]);
    };
    return (
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-sm font-semibold"
          style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
        >
          <span className="truncate">{summary}</span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full z-[120] mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-white p-2 shadow-xl" style={{ borderColor: PALETTE.pastelGray }}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
              <input type="checkbox" checked={values.length === 0} onChange={() => toggle("__all__")} />
              Todos
            </label>
            {options.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50">
                <input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option)} />
                <span className="truncate">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))];
  };

  const isDateInRange = (value) => {
    const start = periodStart;
    const end = periodEnd || periodStart;
    return value >= start && value <= end;
  };

  const handleCalendarDayClick = (date) => {
    const next = toInputDate(date);
    if (!periodStart || (periodStart && periodEnd)) {
      setPeriodStart(next);
      setPeriodEnd("");
      return;
    }
    if (next < periodStart) {
      setPeriodEnd(periodStart);
      setPeriodStart(next);
    } else {
      setPeriodEnd(next);
    }
  };

  const resetToToday = () => {
    const value = toInputDate(today);
    setPeriodStart(value);
    setPeriodEnd(value);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const PeriodFilter = () => (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsCalendarOpen((open) => !open)}
        className="flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-left text-sm font-semibold"
        style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
      >
        <span>{formatDateRange(periodStart, periodEnd)}</span>
        <Calendar className="h-4 w-4 text-gray-500" />
      </button>
      {isCalendarOpen && (
        <div className="absolute left-0 top-12 z-[130] w-[360px] rounded-xl border bg-white p-4 shadow-2xl" style={{ borderColor: PALETTE.pastelGray }}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-gray-100" style={{ color: PALETTE.maastrichtBlue }}>‹</button>
            <p className="text-sm font-black capitalize" style={{ color: PALETTE.maastrichtBlue }}>{calendarMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</p>
            <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-gray-100" style={{ color: PALETTE.maastrichtBlue }}>›</button>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-gray-500">
            {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {getCalendarDays().map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="h-9" />;
              const value = toInputDate(date);
              const selected = value === periodStart || value === periodEnd;
              const inRange = isDateInRange(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCalendarDayClick(date)}
                  className="h-9 rounded-lg text-xs font-black transition-all"
                  style={{
                    backgroundColor: selected ? PALETTE.sizzlingSunrise : inRange ? "#FFF7C2" : PALETTE.white,
                    color: PALETTE.maastrichtBlue,
                    border: selected ? `1px solid ${PALETTE.sizzlingSunrise}` : `1px solid ${PALETTE.pastelGray}`,
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Primer clic: fecha inicial. Segundo clic: fecha final. Para un solo día, selecciona solo una fecha.
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={resetToToday} className="rounded-xl border px-4 py-2 text-sm font-black transition hover:bg-gray-50" style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}>Refrescar fecha</button>
            <button type="button" onClick={() => setIsCalendarOpen(false)} className="rounded-xl px-4 py-2 text-sm font-black transition hover:opacity-90" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Confirmar fecha</button>
          </div>
        </div>
      )}
    </div>
  );

  const specificFields = [];
  if (hasField("Categoría")) specificFields.push("Categoría");
  if (hasField("Mayorista")) specificFields.push("Mayorista");
  if (hasField("Ferretería")) specificFields.push("Ferretería");
  if (hasField("Cliente")) specificFields.push("Cliente");
  if (hasField("Responsable")) specificFields.push("Responsable");
  if (hasField("Tipo Usuario")) specificFields.push("Tipo Usuario");
  if (hasField("Tipo Evento")) specificFields.push("Tipo Evento");
  if (hasField("Estado Financiero")) specificFields.push("Estado Financiero");
  if (hasField("Estado Pedido")) specificFields.push("Estado Pedido");
  if (hasField("Estado Cobranza")) specificFields.push("Estado Cobranza");
  if (hasField("Estado Comisión")) specificFields.push("Estado Comisión");
  if (hasField("Estado Factura")) specificFields.push("Estado Factura");
  if (hasField("Estado Solicitud")) specificFields.push("Estado Solicitud");
  if (hasField("Estado Cesión")) specificFields.push("Estado Cesión");
  if (hasField("Estado Recuperación")) specificFields.push("Estado Recuperación");
  if (hasField("Tipo de Operación")) specificFields.push("Tipo de Operación");
  if (hasField("B2B/B2C")) specificFields.push("B2B/B2C");
  if (hasField("Marca")) specificFields.push("Marca");
  if (hasField("Inventario")) specificFields.push("Inventario");

  const filterLabelMap = {
    "Categoría": "Todas las categorías",
    "Mayorista": "Todos los mayoristas",
    "Ferretería": "Todas las ferreterías",
    "Cliente": "Todos los clientes",
    "Responsable": "Todos los responsables",
    "Tipo Usuario": "Todos los tipos de usuario",
    "Tipo Evento": "Todos los tipos de evento",
    "Estado Financiero": "Todos los estados financieros",
    "Estado Pedido": "Todos los estados de pedido",
    "Estado Cobranza": "Todos los estados de cobranza",
    "Estado Comisión": "Todos los estados de comisión",
    "Estado Factura": "Todos los estados de factura",
    "Estado Solicitud": "Todos los estados de solicitud",
    "Estado Cesión": "Todos los estados de cesión",
    "Estado Recuperación": "Todos los estados de recuperación",
    "Tipo de Operación": "Todos los tipos de operación",
    "B2B/B2C": "Todas las operaciones",
    "Marca": "Todas las marcas",
    "Inventario": "Todos los estados de inventario",
  };

  useEffect(() => {
    publishFilters({
      searchTerm,
      periodStart,
      periodEnd: periodEnd || periodStart,
      states: selectedState,
      cities: selectedCity,
      urbanizations: selectedUrbanization,
      values: filterValues,
    });
  }, [searchTerm, periodStart, periodEnd, selectedState, selectedCity, selectedUrbanization, filterValues, publishFilters]);

  return (
    <Card className="rounded-[2rem] border-0 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
      <CardContent className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm font-black" style={{ color: PALETTE.maastrichtBlue }}>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs" style={{ backgroundColor: PALETTE.softWarning, color: PALETTE.warning }}>⌁</span>
            Filtros del módulo
          </div>
          <button
            type="button"
            onClick={() => setFiltersVisible((value) => !value)}
            className="rounded-full border px-4 py-2 text-xs font-black transition hover:bg-gray-50"
            style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
          >
            {filtersVisible ? "Ocultar filtros" : "Mostrar filtros"}
          </button>
        </div>
        {filtersVisible && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar producto, cliente, factura o pedido..."
              className="h-10 w-full rounded-xl border bg-white pl-9 pr-3 text-sm font-semibold outline-none"
              style={{ borderColor: PALETTE.pastelGray, color: PALETTE.maastrichtBlue }}
            />
          </div>
          <PeriodFilter />
          {hasField("Estado") && <MultiSelectFilter label="Todos los estados" value={selectedState} onChange={(value) => { setSelectedState(value); setSelectedCity([]); setSelectedUrbanization([]); }} options={adminLocationData.map((item) => item.state)} />}
          {hasField("Ciudad") && <MultiSelectFilter label="Todas las ciudades" value={selectedCity} onChange={(value) => { setSelectedCity(value); setSelectedUrbanization([]); }} options={[...new Set(availableCities.map((city) => city.name))]} />}
          {(hasField("Estado") || hasField("Ciudad")) && <MultiSelectFilter label="Todas las urbanizaciones" value={selectedUrbanization} onChange={setSelectedUrbanization} options={[...new Set(availableUrbanizations)]} />}
          {specificFields.map((field) => <MultiSelectFilter key={field} label={filterLabelMap[field] || `Todos ${field.toLowerCase()}`} value={filterValues[field] || []} onChange={(value) => setGenericFilter(field, value)} options={optionList(field)} />)}
        </div>}
      </CardContent>
    </Card>
  );
}

function ChartPlaceholder({ title, type, series }) {
  return (
    <Card className="rounded-[2rem] border-0 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: PALETTE.crystalBlue }}>{type}</p>
            <h3 className="text-lg font-black">{title}</h3>
          </div>
          <LineChart className="h-5 w-5" style={{ color: PALETTE.sizzlingSunrise }} />
        </div>
        <div className="flex h-40 items-end gap-3 rounded-2xl p-4" style={{ backgroundColor: PALETTE.softCard }}>
          {[38, 62, 48, 78, 56, 88, 72, 92].map((height, index) => <div key={index} className="flex-1 rounded-t-xl" style={{ height: `${height}%`, backgroundColor: index % 2 ? PALETTE.crystalBlue : PALETTE.sizzlingSunrise }} />)}
        </div>
        <p className="mt-3 text-xs font-semibold" style={{ color: PALETTE.spaceCadet }}>{series}</p>
      </CardContent>
    </Card>
  );
}

const moduleDefinitions = [
  { id: "home", label: "Visión General", icon: Home },
  { id: "risk", label: "Riesgo y morosidad", icon: ShieldAlert },
  { id: "wholesalers", label: "Mayoristas", icon: Building2 },
  { id: "hardware", label: "Ferreterías", icon: Store },
  { id: "customers", label: "Clientes finales", icon: Users },
  { id: "collections", label: "Cobranza y recuperación", icon: WalletCards },
  { id: "invoice_status", label: "Estado de facturas", icon: Database },
  { id: "payment_management", label: "Gestión de pagos y cobranzas", icon: WalletCards },
  { id: "operations", label: "Operaciones", icon: ClipboardCheck },
  { id: "finance", label: "Finanzas TH.O", icon: DollarSign },
  { id: "governance", label: "Control y auditoría", icon: FileCheck2 },
  { id: "inventory", label: "Inventario y catálogo", icon: PackageSearch },
  { id: "commerce", label: "Inteligencia Comercial", icon: Target },
];

export default function AdminDashboard({ onBack, onLogout }) {
  const [activeSection, setActiveSection] = useState("home");
  const [adminFilters, setAdminFilters] = useState({});
  const metrics = useAdminMetrics(adminFilters);

  const radarRows = useMemo(() => {
    const candidates = products.map((item) => {
      const salesPerDay = item.units12m / 365;
      const priceAverage = item.sales12m / item.units12m;
      const costsReported = item.costs.length;
      const costAverage = costsReported ? avg(item.costs) : priceAverage * 0.6;
      const sourceCost = costsReported ? "REAL" : "ESTIMADO";
      const margin = safePct(priceAverage - costAverage, priceAverage);
      const growth = item.previousUnits ? safePct(item.units12m - item.previousUnits, item.previousUnits) : null;
      const monthlyAverage = item.units12m / 12;
      const stability = Math.max(0, 100 - avg(item.monthly.map((month) => Math.abs(month - monthlyAverage) / monthlyAverage * 100)));
      return { ...item, salesPerDay, priceAverage, costAverage, sourceCost, costsReported, margin, growth, stability, ferreterias: 40 + item.id.charCodeAt(1) * 7 % 150, mayoristas: 5 + item.id.charCodeAt(1) % 20 };
    }).filter((item) => item.units12m >= 30 && item.ferreterias >= 3 && item.sales12m >= 100);
    const totalSales = candidates.reduce((sum, item) => sum + item.sales12m, 0);
    const max = (key) => Math.max(...candidates.map((item) => item[key] || 0), 1);
    const maxSalesDay = max("salesPerDay");
    const maxFerreterias = max("ferreterias");
    const maxMayoristas = max("mayoristas");
    const maxMargin = max("margin");
    const maxCosts = max("costsReported");
    return candidates.map((item) => {
      const growthScore = item.growth === null ? 100 : item.growth <= 0 ? 0 : item.growth >= 30 ? 100 : (item.growth / 30) * 100;
      const indexTHO = (item.salesPerDay / maxSalesDay * 100 * 0.2) + (item.ferreterias / maxFerreterias * 100 * 0.15) + (item.mayoristas / maxMayoristas * 100 * 0.05) + (growthScore * 0.1) + (item.stability * 0.15) + (item.margin / maxMargin * 100 * 0.2) + ((item.sourceCost === "REAL" ? 100 : 50) * 0.05) + (item.costsReported / maxCosts * 100 * 0.1);
      return { ...item, marketShare: safePct(item.sales12m, totalSales), indexTHO };
    }).sort((a, b) => b.indexTHO - a.indexTHO);
  }, []);

  const exportCurrent = () => {
    const rows = getCurrentExportRows(activeSection, metrics, radarRows);
    downloadExcel(`THO_${activeSection}`, [{ name: activeSection, columns: rows.columns, rows: rows.rows }]);
  };

  const renderHome = () => (
    <div className="space-y-6">
      <FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Ferretería", "Tipo de Operación", "B2B/B2C"]} />
      <SectionHeader eyebrow="Módulo 1" title="Visión General - Home Ejecutivo" description="Entrada ejecutiva del administrador general: ventas totales, usuarios, riesgo, rentabilidad, actividad, rankings, gráficos y alertas críticas." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Ventas Totales" value={money(metrics.totalSales)} detail="Ventas Totales B2B + Ventas Totales B2C" icon={BarChart3} tone="success" />
        <KpiCard title="Ventas Totales B2B" value={money(metrics.b2bSales)} detail="Pedidos despachados/cobrados/vencidos" icon={Building2} />
        <KpiCard title="Ventas Totales B2C" value={money(metrics.b2cTotal)} detail="Ventas B2C confirmadas" icon={Store} />
        <KpiCard title="Total Operaciones" value={num(metrics.totalOperations)} detail="Pedidos B2B + ventas B2C" icon={ClipboardCheck} />
        <KpiCard title="Ticket Promedio General" value={money2(metrics.totalSales / metrics.totalOperations)} detail="ventas totales / operaciones" icon={DollarSign} />
        <KpiCard title="Mayoristas Activos" value={num(metrics.activeWholesalers)} detail="Con actividad en el período" icon={Building2} />
        <KpiCard title="Ferreterías Activas" value={num(metrics.activeStores)} detail="Compras o ventas registradas" icon={Store} />
        <KpiCard title="Usuarios Bloqueados" value={num(metrics.blockedStores + 12)} detail="Actuales del ecosistema" icon={ShieldAlert} tone="warning" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Cartera Activa" value={money(metrics.carteraActiva)} detail="Saldo pendiente B2B" icon={ShieldAlert} tone="warning" />
        <KpiCard title="Cartera Vencida" value={money(metrics.carteraVencida)} detail={`${pct(safePct(metrics.carteraVencida, metrics.carteraActiva))} mora global`} icon={AlertTriangle} tone="danger" />
        <KpiCard title="Comisión B2B" value={money(metrics.b2bCommission)} detail="Ventas B2B x 1,5" icon={DollarSign} />
        <KpiCard title="Comisiones B2C" value={money(metrics.b2cGross)} detail="Ventas B2C x 5" icon={DollarSign} />
        <KpiCard title="Ingresos por fee de reingreso" value={money(metrics.reinsertionIncome)} detail="Saldo vencido x 10" icon={DollarSign} />
        <KpiCard title="Utilidad Ajustada" value={money(metrics.adjustedUtility)} detail="Ingreso bruto - capital vigente" icon={WalletCards} tone="success" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <ChartPlaceholder title="Evolución de Ventas Totales" type="Líneas" series="Ventas Totales · Ventas Totales B2B · Ventas Totales B2C" />
        <ChartPlaceholder title="Estado de la Cartera" type="Donut" series="Corriente · Próxima · Vencida" />
        <ChartPlaceholder title="Rentabilidad TH.O" type="Barras" series="Comisión B2B · Utilidad B2C · Reinserción" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminBlock title="Actividad reciente" columns={["Fecha", "Hora", "Tipo de evento", "Usuario", "Monto"]} rows={auditEvents.map((e) => [e.date, e.time, e.action, e.user, e.amount ? money(e.amount) : "-"])} />
        <AdminBlock title="Alertas críticas" columns={["Prioridad", "Tipo", "Descripción", "Módulo"]} rows={[["Alta", "Financiera", "Facturas vencidas con mora creciente", "Riesgo"], ["Alta", "Operativa", "Cesión cerca del límite de 5 días", "Cobranza"], ["Media", "Comercial", "Caída B2B en oriente", "Operaciones"]]} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminBlock title="Ranking de Mayoristas" columns={["Mayorista", "Ventas B2B", "Crecimiento", "Comisión B2B"]} rows={metrics.wholesalers.slice().sort((a, b) => b.sales - a.sales).slice(0, 10).map((w) => [w.name, money(w.sales), pct(safePct(w.sales - w.prevSales, w.prevSales)), money(w.sales * 0.015)])} />
        <AdminBlock title="Ranking de Ferreterías" columns={["Ferretería", "Ventas B2C", "Compras B2B", "Utilidad TH.O", "Cashback", "Recompra"]} rows={metrics.hardwareStores.slice().sort((a, b) => b.b2c - a.b2c).slice(0, 10).map((s) => [s.name, money(s.b2c), money(s.b2b), money(s.b2c * 0.05), money(s.b2c * 0.025), pct(safePct(s.recurrent, s.customers))])} />
      </div>
    </div>
  );

  const renderRisk = () => {
    const rowsProx = metrics.invoiceRows.filter((i) => i.daysToDue >= 0 && i.daysToDue <= 10 && i.balance > 0);
    const rowsVencidas = metrics.invoiceRows.filter((i) => i.daysToDue < 0 && i.balance > 0);
    return <div className="space-y-6">
      <FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Ferretería", "Estado Financiero"]} />
      <SectionHeader eyebrow="Módulo 2" title="Riesgo y Morosidad" description="Control financiero de cartera, facturas próximas, vencidas, cesiones, reinserciones y score de riesgo." />
      <KpiGrid items={[
        ["Cartera Activa", money(metrics.carteraActiva), "Saldo pendiente total", ShieldAlert, "warning"], ["Cartera Corriente", money(metrics.carteraCorriente), "> 10 días para vencer", ShieldAlert], ["Cartera Próxima", money(metrics.carteraProxima), "0 a 10 días", AlertTriangle, "warning"], ["Cartera Vencida", money(metrics.carteraVencida), "Saldo vencido", AlertTriangle, "danger"], ["% Mora Global", pct(safePct(metrics.carteraVencida, metrics.carteraActiva)), "Vencida / Activa", BarChart3], ["Ferreterías en Riesgo", num(new Set(rowsProx.concat(rowsVencidas).map((i) => i.storeId)).size), "Próximas o vencidas", Store], ["Bloqueadas Actuales", num(metrics.blockedStores), "Estado actual bloqueado", ShieldAlert, "danger"], ["Bloqueadas Históricas", num(hardwareStores.reduce((s, h) => s + h.blockEvents, 0)), "Eventos históricos", ShieldAlert]
      ]} />
      <KpiGrid items={[["Capital Cubierto Histórico", money(metrics.coveredHistoric), "Facturas cedidas pagadas", WalletCards], ["Capital Recuperado Histórico", money(metrics.recoveredHistoric), "Pagos recuperados", DollarSign, "success"], ["Capital Cubierto Vigente", money(metrics.coveredCurrent), "Exposición viva", AlertTriangle, "warning"], ["Tasa de Recuperación", pct(safePct(metrics.recoveredHistoric, metrics.coveredHistoric)), "Recuperado / Cubierto", BarChart3], ["Ingreso por Reinserción", money(metrics.reinsertionIncome), "Saldo vencido x 10%", DollarSign]]} />
      <AdminBlock title="Facturas próximas a vencer" columns={["ID Factura", "Ferretería", "Mayorista", "Despacho", "Vencimiento", "Días Restantes", "Monto Total", "Monto Pagado", "Saldo"]} rows={rowsProx.map((i) => [i.id, storeName(i.storeId), wholesalerName(i.wholesalerId), dateShort(i.dispatch), dateShort(i.dueDate), i.daysToDue, money(i.total), money(i.paid), money(i.balance)])} />
      <AdminBlock title="Facturas vencidas por pagar" columns={["ID Factura", "Ferretería", "Mayorista", "Vencimiento", "Días Atraso", "Saldo", "Cobertura", "Reinserción Potencial"]} rows={rowsVencidas.map((i) => [i.id, storeName(i.storeId), wholesalerName(i.wholesalerId), dateShort(i.dueDate), Math.abs(i.daysToDue), money(i.balance), i.covered ? "Cedida a TH.O" : "Pendiente", money(i.balance * 0.1)])} />
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminBlock title="Riesgo por Mayorista" columns={["Mayorista", "Cartera Activa", "Cartera Vencida", "% Mora", "Ferreterías Morosas"]} rows={metrics.wholesalers.map((w) => riskByWholesaler(w.id, metrics.invoiceRows))} />
        <AdminBlock title="Riesgo por Ferretería" columns={["Ferretería", "Cartera Activa", "Cartera Vencida", "% Mora", "Bloqueos", "Reinserciones", "Score"]} rows={metrics.hardwareStores.map((s) => riskByStore(s, metrics.invoiceRows))} />
      </div>
    </div>;
  };

  const renderWholesalers = () => <GenericWholesalers metrics={metrics} />;
  const renderHardware = () => <GenericHardware metrics={metrics} />;
  const renderCustomers = () => <GenericCustomers metrics={metrics} />;
  const renderCollections = () => <GenericCollections metrics={metrics} />;
  const renderOperations = () => <GenericOperations />;
  const renderInvoiceStatus = () => <InvoiceStatusModule metrics={metrics} />;
  const renderPaymentManagement = () => <PaymentManagementModule metrics={metrics} />;
  const renderFinance = () => <GenericFinance metrics={metrics} />;
  const renderGovernance = () => <GenericGovernance />;
  const renderInventory = () => <GenericInventory />;
  const renderCommerce = () => <CommerceModule radarRows={radarRows} />;

  const renderActiveSection = () => {
    switch (activeSection) {
      case "risk": return renderRisk();
      case "wholesalers": return renderWholesalers();
      case "hardware": return renderHardware();
      case "customers": return renderCustomers();
      case "collections": return renderCollections();
      case "operations": return renderOperations();
      case "invoice_status": return renderInvoiceStatus();
      case "payment_management": return renderPaymentManagement();
      case "finance": return renderFinance();
      case "governance": return renderGovernance();
      case "inventory": return renderInventory();
      case "commerce": return renderCommerce();
      default: return renderHome();
    }
  };

  const activeMeta = moduleDefinitions.find((section) => section.id === activeSection) || moduleDefinitions[0];

  return (
    <AdminFilterContext.Provider value={{ filters: adminFilters, setFilters: setAdminFilters }}>
    <div className="min-h-screen" style={{ backgroundColor: PALETTE.page, color: PALETTE.maastrichtBlue }}>
      <header className="sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-3 text-white lg:px-8" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
          <div className="mx-auto flex w-full max-w-none items-center gap-3">
            <button type="button" onClick={onBack} className="inline-flex w-auto max-w-[260px] flex-none items-center rounded-2xl px-2 py-1 text-left transition-colors hover:bg-white/10" style={{ backgroundColor: PALETTE.white, width: "fit-content", flex: "0 0 auto" }}>
              <img src={brandLogo} alt="Logo" className="h-14 w-auto max-w-[230px] object-contain" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            </button>
            <div className="flex-1" />
            <Button onClick={exportCurrent} className="hidden rounded-full font-black md:flex" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}><Download className="mr-2 h-4 w-4" />Excel</Button>
            <Button onClick={onLogout || onBack} variant="outline" className="hidden rounded-full text-sm text-white md:flex" style={{ borderColor: PALETTE.crystalBlue }}><LogOut className="mr-2 h-4 w-4" />Salir</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-none px-4 py-6 lg:px-8">
        <section className="min-w-0 space-y-6">
          <div className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-sm" style={{ backgroundColor: PALETTE.maastrichtBlue }}>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-yellow-400/20 to-transparent" />
            <div className="relative z-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold" style={{ color: PALETTE.sizzlingSunrise }}>Dashboard Administrador TH.O</p>
                <h1 className="mt-2 text-3xl font-black lg:text-4xl">{activeMeta.label}</h1>
                <p className="mt-3 max-w-3xl text-sm text-white/75">Ecosistema completo: ventas totales, riesgo, mayoristas, ferreterías, clientes, cobranza, operaciones, finanzas, auditoría, inventario e inteligencia comercial.</p>
              </div>
              <Button onClick={exportCurrent} className="rounded-full px-6 font-bold" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}><FileCheck2 className="mr-2 h-4 w-4" />Generar reporte</Button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto rounded-[1.5rem] border bg-white px-3 py-2 shadow-sm" style={{ borderColor: PALETTE.softBorder }}>
            {moduleDefinitions.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-black transition-all ${isActive ? "shadow-sm" : "opacity-70 hover:opacity-100"}`}
                  style={{ backgroundColor: isActive ? PALETTE.maastrichtBlue : "transparent", color: isActive ? PALETTE.white : PALETTE.maastrichtBlue }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          {renderActiveSection()}
        </section>
      </main>
    </div>
    </AdminFilterContext.Provider>
  );
}

function KpiGrid({ items }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">{items.map(([title, value, detail, Icon, tone]) => <KpiCard key={title} title={title} value={value} detail={detail} icon={Icon} tone={tone} />)}</div>;
}

function AdminBlock({ title, columns, rows, maxHeight = "520px", objective }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [hiddenRows, setHiddenRows] = useState([]);
  const [actionLog, setActionLog] = useState([]);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);

  const actionColumnIndex = columns.findIndex((column) => ["acciones", "accion", "acción"].includes(String(column || "").trim().toLowerCase()));
  const rowKey = (row) => JSON.stringify(row);
  const visibleRows = rows.filter((row) => !hiddenRows.includes(rowKey(row)));
  const selectedActionLabel = selectedAction && actionColumnIndex >= 0 ? selectedAction.row[actionColumnIndex] : "Acciones";
  const closeActionPanel = () => {
    setSelectedAction(null);
    setRejectMode(false);
    setRejectReason("");
    setDetailOpen(false);
  };
  const completeAction = (status, extra = "") => {
    if (!selectedAction) return;
    const key = rowKey(selectedAction.row);
    setActionLog((prev) => [{ key, status, detail: extra, date: new Date().toLocaleString("es-VE") }, ...prev]);
    setHiddenRows((prev) => prev.includes(key) ? prev : [...prev, key]);
    closeActionPanel();
  };
  const exportBlock = () => {
    const safeName = title.replace(/[^a-z0-9áéíóúñ]+/gi, "_").replace(/^_+|_+$/g, "");
    downloadExcel(`THO_${safeName}`, [{ name: safeName.slice(0, 31) || "Listado", columns, rows: visibleRows }]);
  };

  return (
    <Card className="rounded-[2rem] border-0 shadow-sm" style={{ backgroundColor: PALETTE.white }}>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <SectionHeader title={title} />
            <p className="text-xs font-semibold" style={{ color: PALETTE.crystalBlue }}>{objective || "Objetivo: mostrar información filtrada y exportable para toma de decisiones."}</p><p className="mt-1 text-xs font-semibold" style={{ color: PALETTE.crystalBlue }}>{visibleRows.length} registros activos{actionLog.length ? ` · ${actionLog.length} acciones procesadas` : ""}</p>
          </div>
          <Button type="button" onClick={exportBlock} className="rounded-full px-4 py-2 text-xs font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>
            <Download className="mr-2 h-4 w-4" />Excel
          </Button>
        </div>
        <DataTable columns={columns} rows={visibleRows} maxHeight={maxHeight} onAction={setSelectedAction} />
        {actionLog.length > 0 && (
          <div className="mt-3 rounded-2xl p-3 text-xs font-semibold" style={{ backgroundColor: PALETTE.softSuccess, color: PALETTE.maastrichtBlue }}>
            Última acción: {actionLog[0].status}{actionLog[0].detail ? ` · ${actionLog[0].detail}` : ""} · {actionLog[0].date}
          </div>
        )}
        {selectedAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeActionPanel}>
            <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: PALETTE.crystalBlue }}>{title}</p>
                  <h3 className="text-2xl font-black" style={{ color: PALETTE.maastrichtBlue }}>Panel de acciones</h3>
                  <p className="mt-1 text-sm font-semibold" style={{ color: PALETTE.spaceCadet }}>{selectedActionLabel}</p>
                </div>
                <button type="button" onClick={closeActionPanel} className="rounded-full px-3 py-1 text-sm font-black" style={{ backgroundColor: PALETTE.softCard, color: PALETTE.maastrichtBlue }}>Cerrar</button>
              </div>
              <div className="max-h-[45vh] overflow-auto rounded-2xl border p-3" style={{ borderColor: PALETTE.softBorder }}>
                {columns.filter((column) => !["acciones", "accion", "acción"].includes(String(column || "").trim().toLowerCase())).map((column, index) => (
                  <div key={`${column}-${index}`} className="grid gap-2 border-b py-2 text-sm last:border-b-0 sm:grid-cols-[180px_1fr]" style={{ borderColor: PALETTE.softBorder }}>
                    <span className="font-black uppercase text-slate-500">{column}</span>
                    <span className="font-semibold" style={{ color: PALETTE.maastrichtBlue }}>{displayTableCell(selectedAction.row[index])}</span>
                  </div>
                ))}
              </div>
              {detailOpen && (
                <div className="mt-4 rounded-2xl border p-4 text-sm" style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.softCard }}>
                  <p className="font-black" style={{ color: PALETTE.maastrichtBlue }}>Detalle de la operación</p>
                  <p className="mt-1 font-semibold" style={{ color: PALETTE.spaceCadet }}>La acción se aplicará sobre este registro y se retirará de la tabla activa para no afectar el Excel ni el scroll. En una conexión real, aquí también se actualizaría el backend.</p>
                  {String(selectedActionLabel).toLowerCase().includes("document") && <div className="mt-3 grid gap-2 text-xs font-semibold sm:grid-cols-2"><span>📎 RIF cargado</span><span>📎 Registro mercantil cargado</span><span>📎 Cédula representante legal cargada</span><span>📎 Carta bancaria cargada</span></div>}
                </div>
              )}
              {rejectMode && (
                <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.softDanger }}>
                  <label className="text-sm font-black" style={{ color: PALETTE.maastrichtBlue }}>Razón del rechazo</label>
                  <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} placeholder="Escribe la razón del rechazo..." className="mt-2 min-h-[90px] w-full rounded-2xl border p-3 text-sm" style={{ borderColor: PALETTE.pastelGray }} />
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                {String(selectedActionLabel).toLowerCase().includes("validar") && <button type="button" onClick={() => completeAction("Validado")} className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: PALETTE.success }}>Validar</button>}
                {String(selectedActionLabel).toLowerCase().includes("aprobar") && <button type="button" onClick={() => completeAction("Aprobado")} className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: PALETTE.spaceCadet }}>Aprobar</button>}
                {String(selectedActionLabel).toLowerCase().includes("dar de alta") && <button type="button" onClick={() => completeAction("Alta en sistema")} className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: PALETTE.success }}>Dar de alta</button>}
                {String(selectedActionLabel).toLowerCase().includes("rechazar") && !rejectMode && <button type="button" onClick={() => setRejectMode(true)} className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: PALETTE.danger }}>Rechazar</button>}
                {String(selectedActionLabel).toLowerCase().includes("rechazar") && rejectMode && <button type="button" onClick={() => completeAction("Rechazado", rejectReason.trim() ? `Razón: ${rejectReason.trim()}` : "Sin razón indicada")} className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: PALETTE.danger }}>Confirmar rechazo</button>}
                {String(selectedActionLabel).toLowerCase().includes("registrar") && <button type="button" onClick={() => completeAction("Pago registrado")} className="rounded-full px-4 py-2 text-sm font-black" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Registrar pago</button>}
                <button type="button" onClick={() => setDetailOpen((value) => !value)} className="rounded-full border px-4 py-2 text-sm font-black" style={{ borderColor: PALETTE.softBorder, color: PALETTE.maastrichtBlue }}>Ver detalle</button>
              </div>
              <p className="mt-4 rounded-2xl p-3 text-xs font-semibold" style={{ backgroundColor: PALETTE.softCard, color: PALETTE.spaceCadet }}>
                Al validar, aprobar, rechazar o registrar un pago, el registro sale de la tabla activa. Así no se rompe el scroll, la selección ni la exportación a Excel.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function riskByWholesaler(id, invoiceRows) {
  const rows = invoiceRows.filter((i) => i.wholesalerId === id);
  const active = rows.filter((i) => !["Pagada", "Cubierta por TH.O"].includes(i.calculatedStatus)).reduce((s, i) => s + i.balance, 0);
  const late = rows.filter((i) => i.daysToDue < 0 && i.balance > 0).reduce((s, i) => s + i.balance, 0);
  return [wholesalerName(id), money(active), money(late), pct(safePct(late, active)), new Set(rows.filter((i) => i.daysToDue < 0).map((i) => i.storeId)).size];
}
function riskByStore(store, invoiceRows) {
  const rows = invoiceRows.filter((i) => i.storeId === store.id);
  const active = rows.filter((i) => !["Pagada", "Cubierta por TH.O"].includes(i.calculatedStatus)).reduce((s, i) => s + i.balance, 0);
  const lateRows = rows.filter((i) => i.daysToDue < 0 && i.balance > 0);
  const late = lateRows.reduce((s, i) => s + i.balance, 0);
  const maxLate = lateRows.length ? Math.max(...lateRows.map((i) => Math.abs(i.daysToDue))) : 0;
  const score = (safePct(late, active) > 30 ? 50 : safePct(late, active) > 10 ? 35 : safePct(late, active) > 0 ? 20 : 0) + (maxLate > 60 ? 35 : maxLate > 30 ? 25 : maxLate > 0 ? 15 : 0) + (store.blockEvents >= 2 ? 20 : store.blockEvents === 1 ? 10 : 0);
  return [store.name, money(active), money(late), pct(safePct(late, active)), store.blockEvents, store.reinsertions, `${score} pts`];
}

function GenericWholesalers({ metrics }) {
  const total = metrics.b2bSales;
  const top5 = metrics.wholesalers.slice().sort((a, b) => b.sales - a.sales).slice(0, 5).reduce((s, w) => s + w.sales, 0);
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Categoría"]} /><SectionHeader eyebrow="Módulo 3" title="Mayoristas" description="Desempeño comercial, riesgo asociado, dependencia del ecosistema, eficiencia operativa, ingresos para TH.O y score general." /><KpiGrid items={[["Mayoristas Activos", num(metrics.wholesalers.length), "Con ventas despachadas", Building2], ["Ventas B2B", money(total), "Pedidos válidos", BarChart3], ["Pedidos Totales", num(metrics.wholesalers.reduce((s, w) => s + w.orders, 0)), "B2B despachados", ClipboardCheck], ["Ticket Promedio", money2(total / metrics.wholesalers.reduce((s, w) => s + w.orders, 0)), "Ventas / pedidos", DollarSign], ["Ferreterías Compradoras", num(new Set(metrics.hardwareStores.map((s) => s.id)).size), "Activas en período", Store], ["Comisión B2B", money(total * 0.015), "1,5%", DollarSign, "success"], ["Concentración Top 5", pct(safePct(top5, total)), "Top 5 / total", AlertTriangle, safePct(top5, total) > 60 ? "danger" : "warning"]]} /><AdminBlock title="Ranking de Mayoristas" columns={["RIF", "Mayorista", "Estado", "Ciudad", "Ventas", "Pedidos", "Ticket", "Ferreterías", "Crecimiento", "Participación", "Comisión", "Utilidad TH.O", "Mora", "Score"]} rows={metrics.wholesalers.map((w) => [getWholesalerRif(w.id), w.name, w.state, w.city, money(w.sales), w.orders, money(w.sales / w.orders), w.stores, pct(safePct(w.sales - w.prevSales, w.prevSales)), pct(safePct(w.sales, total)), money(w.sales * 0.015), money(w.sales * 0.015 - 250), "3,2%", `${Math.min(100, Math.round(safePct(w.sales, 90000) * 30 + safePct(w.sales - w.prevSales, w.prevSales) * 0.5 + w.onTime * 0.3))}`])} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Eficiencia Operativa" columns={["Mayorista", "Tiempo Despacho", "% A Tiempo", "Rechazados", "% Rechazo", "Cancelados", "% Cancelación"]} rows={metrics.wholesalers.map((w) => [w.name, `${num(48 / w.onTime * 3, 1)} días`, pct(w.onTime), w.rejected, pct(safePct(w.rejected, w.orders)), w.cancelled, pct(safePct(w.cancelled, w.orders))])} /><ChartPlaceholder title="Evolución del Mayorista" type="Líneas" series="Ventas · Pedidos · Comisión · Cartera Vencida · Capital Cubierto" /></div></div>;
}
function GenericHardware({ metrics }) {
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Ferretería", "Mayorista", "Categoría"]} /><SectionHeader eyebrow="Módulo 4" title="Ferreterías" description="Desempeño comercial B2B/B2C, riesgo financiero, fidelización, rentabilidad para TH.O, reinserciones y score general." /><KpiGrid items={[["Ferreterías Activas", num(metrics.hardwareStores.length), "Actividad en período", Store], ["Compras B2B", money(metrics.hardwareStores.reduce((s, h) => s + h.b2b, 0)), "Pedidos B2B", Building2], ["Ventas B2C", money(metrics.hardwareStores.reduce((s, h) => s + h.b2c, 0)), "Ventas confirmadas", Store], ["Ticket Compra", money2(metrics.hardwareStores.reduce((s, h) => s + h.b2b, 0) / metrics.ordersCount), "B2B / pedidos", DollarSign], ["Ticket Venta", money2(metrics.hardwareStores.reduce((s, h) => s + h.b2c, 0) / metrics.b2cCount), "B2C / ventas", DollarSign], ["Clientes Atendidos", num(metrics.hardwareStores.reduce((s, h) => s + h.customers, 0)), "Clientes activos", Users]]} /><AdminBlock title="Ranking General de Ferreterías" columns={["RIF", "Ferretería", "Estado", "Ciudad", "Mayorista", "Compras B2B", "Ventas B2C", "Clientes", "Utilidad TH.O", "Score"]} rows={metrics.hardwareStores.map((h) => [getStoreRif(h.id), h.name, h.state, h.city, wholesalerName(h.wholesalerId), money(h.b2b), money(h.b2c), h.customers, money(h.b2c * 0.05), Math.min(100, Math.round(safePct(h.b2c, 20000) * 30 + safePct(h.recurrent, h.customers) * 30))])} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Fidelización" columns={["Ferretería", "Clientes Activos", "Recurrentes", "% Recompra", "Ticket", "LTV Promedio"]} rows={metrics.hardwareStores.map((h) => [h.name, h.customers, h.recurrent, pct(safePct(h.recurrent, h.customers)), money(h.b2c / Math.max(1, h.customers)), money(h.b2c / Math.max(1, h.recurrent))])} /><AdminBlock title="Base de datos de ferreterías inscritas" columns={["RIF", "Ferretería", "Estado", "Ciudad", "Mayorista", "Clientes", "Estado cuenta"]} rows={metrics.hardwareStores.map((h) => [getStoreRif(h.id), h.name, h.state, h.city, wholesalerName(h.wholesalerId), h.customers, h.blocked ? "Bloqueada" : "Activa"])} /></div></div>;
}
function GenericCustomers({ metrics }) {
  const customers = ["Ana Rivas", "Carlos Mendoza", "María Torres", "José León", "Laura Díaz"].map((name, i) => ({ name, buys: i + 2, amount: 400 + i * 180, cashback: 10 + i * 5, used: i * 3 }));
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Ferretería", "Cliente", "Categoría"]} /><SectionHeader eyebrow="Módulo 5" title="Clientes finales y fidelización" description="Adquisición, recompra, cashback, segmentación, geografía, LTV y score de fidelización." /><KpiGrid items={[["Clientes Activos", "1.541", "Con compras", Users], ["Clientes Nuevos", "242", "Registrados", Users], ["Clientes Recurrentes", "618", "2+ compras", Users, "success"], ["% Recompra", "40,10%", "Recurrentes / activos", BarChart3], ["Ventas B2C", money(metrics.b2cTotal), "Confirmadas", Store], ["Ticket Promedio", money2(metrics.b2cTotal / metrics.b2cCount), "B2C", DollarSign], ["Cashback Generado", money(metrics.b2cCashback), "2,5%", WalletCards], ["Cashback Utilizado", money(b2cSales.reduce((s, b) => s + b.cashbackUsed, 0)), "Redimido", WalletCards]]} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Fidelización" columns={["Cliente", "Compras", "Frecuencia", "Última Compra", "Días", "% Recompra"]} rows={customers.map((c) => [c.name, c.buys, `${num(c.buys / 6, 2)} compras/mes`, "08/06/2026", 0, c.buys > 1 ? "100%" : "0%"])} /><AdminBlock title="Cashback" columns={["Cliente", "Generado", "Utilizado", "Saldo", "% Utilización"]} rows={customers.map((c) => [c.name, money(c.cashback), money(c.used), money(c.cashback - c.used), pct(safePct(c.used, c.cashback))])} /></div><AdminBlock title="Top Clientes del Ecosistema" columns={["Cliente", "Compras", "Monto Gastado", "Ticket", "Cashback Generado", "Cashback Usado"]} rows={customers.map((c) => [c.name, c.buys, money(c.amount), money(c.amount / c.buys), money(c.cashback), money(c.used)])} /></div>;
}
function GenericCollections({ metrics }) {
  const vencidas = metrics.invoiceRows.filter((i) => i.daysToDue < 0 && i.balance > 0);
  const cedidas = metrics.invoiceRows.filter((i) => i.covered > 0);
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Ferretería", "Responsable", "Estado Cobranza", "Estado Cesión", "Estado Recuperación"]} /><SectionHeader eyebrow="Módulo 6" title="Cobranza/Recuperación/Pagos" description="Operación completa: factura vencida, bloqueo, cesión, cobertura, recuperación y reinserción." /><KpiGrid items={[["Facturas Vencidas", num(vencidas.length), "Requieren gestión", AlertTriangle, "danger"], ["Monto Vencido", money(metrics.carteraVencida), "Saldo vencido", DollarSign, "danger"], ["Facturas en Cesión", num(invoices.filter((i) => i.cessionStart && i.cessionStatus !== "Completado").length), "Proceso abierto", ClipboardCheck, "warning"], ["Capital Cubierto", money(metrics.coveredHistoric), "Histórico", WalletCards], ["Capital Recuperado", money(metrics.recoveredHistoric), "Histórico", WalletCards, "success"], ["Capital Vigente", money(metrics.coveredCurrent), "Cubierto - recuperado", ShieldAlert, "warning"], ["Ingreso Reinserción", money(metrics.reinsertionIncome), "Cobrable", DollarSign], ["Bloqueadas", num(metrics.blockedStores), "Actuales", Store, "danger"]]} /><AdminBlock title="Facturas vencidas por pagar" columns={["Factura", "Ferretería", "Mayorista", "Vencimiento", "Días", "Total", "Pagado", "Saldo", "Reinserción", "Responsable", "Gestión"]} rows={vencidas.map((i) => [i.id, storeName(i.storeId), wholesalerName(i.wholesalerId), dateShort(i.dueDate), Math.abs(i.daysToDue), money(i.total), money(i.paid), money(i.balance), money(i.balance * 0.1), i.assigned, i.collections])} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Facturas cubiertas por TH.O" columns={["Factura", "Ferretería", "Mayorista", "Capital Cubierto", "Recuperado", "Pendiente", "Estado"]} rows={cedidas.map((i) => [i.id, storeName(i.storeId), wholesalerName(i.wholesalerId), money(i.covered), money(i.recovered), money(i.covered - i.recovered), i.collections])} /><AdminBlock title="Gestión de cobranza" columns={["Factura", "Ferretería", "Responsable", "Última Gestión", "Próxima Acción", "Estado", "Comentarios"]} rows={metrics.invoiceRows.map((i) => [i.id, storeName(i.storeId), i.assigned, "08/06/2026", "09/06/2026", i.collections, "Seguimiento registrado"])} /></div><KpiCard title="Score Cobranza" value={pct(safePct(metrics.recoveredHistoric, metrics.coveredHistoric))} detail="Capital recuperado / capital cubierto" icon={BarChart3} tone="success" /></div>;
}
function GenericOperations() {
  const generated = operations.length;
  const dispatched = operations.filter((o) => o.status === "Despachado").length;
  const rejected = operations.filter((o) => o.status === "Rechazado").length;
  const cancelled = operations.filter((o) => o.status === "Cancelado").length;
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Ferretería", "Estado Pedido"]} /><SectionHeader eyebrow="Módulo 7" title="Operaciones del Ecosistema" description="Control diario de pedidos, despachos, rechazos, cancelaciones y cuellos de botella." /><KpiGrid items={[["Pedidos Generados", generated, "Período", ClipboardCheck], ["Despachados", dispatched, "Estado despachado", ClipboardCheck, "success"], ["Pendientes", operations.filter((o) => o.status === "Por Despachar").length, "Por despachar", AlertTriangle, "warning"], ["Rechazados", rejected, "Estado rechazado", AlertTriangle, "danger"], ["Cancelados", cancelled, "Estado cancelado", AlertTriangle], ["% Cumplimiento", pct(safePct(dispatched, generated)), "Despachados / generados", BarChart3], ["Tiempo Promedio", "1,8 días", "Creación a despacho", ClipboardCheck]]} /><AdminBlock title="Estado general de pedidos" columns={["Pedido", "Fecha", "Mayorista", "Ferretería", "Estado", "Monto", "Tiempo", "Responsable"]} rows={operations.map((o) => [o.id, dateShort(o.date), wholesalerName(o.wholesalerId), storeName(o.storeId), o.status, money(o.amount), `${daysBetween(o.created)} días`, o.responsible])} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Desempeño de Mayoristas" columns={["Mayorista", "Recibidos", "Despachados", "Tiempo", "% Cumplimiento", "% Rechazo", "% Cancelación"]} rows={wholesalers.map((w) => [w.name, w.orders, Math.round(w.orders * w.onTime / 100), "1,9 días", pct(w.onTime), pct(safePct(w.rejected, w.orders)), pct(safePct(w.cancelled, w.orders))])} /><AdminBlock title="Cuellos de botella" columns={["Pedido", "Mayorista", "Ferretería", "Estado", "Días sin movimiento", "Motivo", "Responsable"]} rows={operations.filter((o) => o.status !== "Despachado").map((o) => [o.id, wholesalerName(o.wholesalerId), storeName(o.storeId), o.status, daysBetween(o.created), "Pendiente de acción", o.responsible])} /></div></div>;
}
function GenericFinance({ metrics }) {
  const rows = [["Comisión B2B", metrics.b2bCommission], ["Utilidad Bruta B2C", metrics.b2cGross], ["Ingreso por Reinserción", metrics.reinsertionIncome], ["Ingreso Bruto Total", metrics.grossIncome], ["Capital Cubierto Vigente", metrics.coveredCurrent], ["Utilidad Ajustada", metrics.adjustedUtility]];
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Ferretería", "Categoría"]} /><SectionHeader eyebrow="Módulo 8" title="Finanzas y Rentabilidad TH.O" description="Rentabilidad real: Ventas Totales, comisión B2B, utilidad B2C, reinserciones, capital cubierto y utilidad ajustada." /><KpiGrid items={[["Ventas Totales", money(metrics.totalSales), "B2B + B2C", BarChart3], ["Comisión B2B", money(metrics.b2bCommission), "1,5%", DollarSign], ["Utilidad B2C", money(metrics.b2cGross), "5%", DollarSign, "success"], ["Reinserción", money(metrics.reinsertionIncome), "10% mora", DollarSign], ["Ingreso Bruto", money(metrics.grossIncome), "Comisiones + reinserción", WalletCards], ["Capital Cubierto", money(metrics.coveredHistoric), "Histórico", ShieldAlert], ["Capital Recuperado", money(metrics.recoveredHistoric), "Histórico", WalletCards, "success"], ["Capital Vigente", money(metrics.coveredCurrent), "Exposición", AlertTriangle, "warning"], ["Utilidad Ajustada", money(metrics.adjustedUtility), "Ingreso - capital", DollarSign, "success"]]} /><AdminBlock title="Estado de Resultados TH.O" columns={["Concepto", "Monto", "Participación %"]} rows={rows.map(([name, amount]) => [name, money(amount), pct(safePct(amount, metrics.grossIncome))])} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Rentabilidad por Mayorista" columns={["Mayorista", "Ventas Totales B2B", "Comisión B2B", "Participación"]} rows={wholesalers.map((w) => [w.name, money(w.sales), money(w.sales * 0.015), pct(safePct(w.sales * 0.015, metrics.b2bCommission))])} /><AdminBlock title="Rentabilidad por Ferretería" columns={["Ferretería", "Ventas B2C", "Cashback", "Utilidad", "Reinserción", "Utilidad Ajustada"]} rows={hardwareStores.map((h) => [h.name, money(h.b2c), money(h.b2c * 0.025), money(h.b2c * 0.05), money(h.reinsertions * 180), money(h.b2c * 0.05 + h.reinsertions * 180 - h.blockEvents * 100)])} /></div><ChartPlaceholder title="Evolución financiera" type="Líneas" series="Ventas Totales · Comisión B2B · Utilidad B2C · Reinserción · Utilidad Ajustada" /></div>;
}
function GenericGovernance() {
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Tipo Usuario", "Estado", "Ciudad", "Usuario", "Responsable", "Tipo Evento", "Estado Solicitud"]} /><SectionHeader eyebrow="Módulo 9" title="Control, Auditoría y Gobierno" description="Solicitudes, expedientes, bloqueos, desbloqueos, bitácora, acciones críticas y actividad sospechosa." /><KpiGrid items={[["Solicitudes Pendientes", applications.filter((a) => a.status === "Pendiente").length, "Ingreso", FileCheck2, "warning"], ["En Revisión", applications.filter((a) => a.status === "En Revisión").length, "Documentos", FileCheck2], ["Usuarios Bloqueados", hardwareStores.filter((h) => h.blocked).length, "Actuales", ShieldAlert, "danger"], ["Bloqueos Manuales", 5, "Eventos", ShieldAlert], ["Desbloqueos Manuales", 3, "Eventos", ShieldAlert, "success"], ["Eventos Auditados", auditEvents.length, "Bitácora", Database], ["Alertas Auditoría", 2, "Activas", AlertTriangle, "warning"]]} /><AdminBlock title="Solicitudes pendientes de aprobación" objective="Objetivo: revisar documentación jurídica, validar documentos y dar de alta definitiva al usuario." columns={["Fecha", "Tipo", "Razón Social", "Nombre Comercial", "RIF", "Estado", "Ciudad", "Responsable", "Solicitud", "Documentación", "Acciones"]} rows={applications.map((a) => [a.date, a.type, a.legal, a.commercial, a.rif, a.state, a.city, a.responsible, a.status, "RIF · Registro mercantil · Cédula RL · Carta bancaria · Acta constitutiva", "Ver documentos / Validar / Aprobar / Dar de alta / Rechazar"])} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Auditoría Financiera" columns={["Fecha", "Usuario", "Evento", "Factura", "Monto", "Comentario"]} rows={auditEvents.filter((e) => ["Cobertura Ejecutada", "Promesa de Pago"].includes(e.action)).map((e) => [e.date, e.user, e.action, e.record, money(e.amount), "Registro auditado"])} /><AdminBlock title="Auditoría Comercial" columns={["Fecha", "Usuario", "Evento", "Registro", "Comentario"]} rows={auditEvents.map((e) => [e.date, e.user, e.action, e.record, "Sin incidencias"])} /></div><AdminBlock title="Bitácora General" columns={["Fecha", "Hora", "Usuario", "Perfil", "Acción", "Módulo", "Registro", "IP", "Resultado"]} rows={auditEvents.map((e) => [e.date, e.time, e.user, e.profile, e.action, e.module, e.record, e.ip, e.result])} /></div>;
}
function GenericInventory() {
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Categoría", "Marca", "Inventario"]} /><SectionHeader eyebrow="Módulo 10" title="Inventario, Catálogo Publicado y Disponibilidad" description="Productos publicados, activos, agotados, bajo inventario, cobertura del catálogo, mayoristas y categorías." /><KpiGrid items={[["Productos Publicados", products.length, "Marketplace", PackageSearch], ["Productos Activos", products.filter((p) => p.active && p.inventory > 0).length, "Inventario > 0", PackageSearch, "success"], ["Agotados", products.filter((p) => p.inventory === 0).length, "Inventario cero", AlertTriangle, "danger"], ["Bajo Inventario", products.filter((p) => p.inventory <= p.minStock).length, "<= stock mínimo", AlertTriangle, "warning"], ["Categorías Activas", new Set(products.map((p) => p.category)).size, "Con productos", PackageSearch], ["Mayoristas con Catálogo", new Set(products.filter((p) => p.inventory > 0).map((p) => p.wholesalerId)).size, "Disponibles", Building2], ["Inventario Total", num(products.reduce((s, p) => s + p.inventory, 0)), "Unidades", PackageSearch], ["Cobertura Catálogo", pct(safePct(new Set(products.map((p) => p.category)).size, 14)), "Categorías activas / definidas", BarChart3]]} /><AdminBlock title="Inventario por Mayorista" columns={["Mayorista", "Publicados", "Disponibles", "Agotados", "Inventario Total", "Última Actualización", "Días sin Actualización"]} rows={wholesalers.map((w) => { const ps = products.filter((p) => p.wholesalerId === w.id); return [w.name, ps.length, ps.filter((p) => p.inventory > 0).length, ps.filter((p) => p.inventory === 0).length, num(ps.reduce((s, p) => s + p.inventory, 0)), dateShort(w.lastInventory), daysBetween(w.lastInventory)]; })} /><div className="grid gap-6 xl:grid-cols-2"><AdminBlock title="Productos agotados" columns={["SKU", "Producto", "Categoría", "Mayorista", "Estado", "Último Inventario", "Última Actualización", "Días Agotado"]} rows={products.filter((p) => p.inventory === 0).map((p) => [productSku(p.id), p.name, p.category, wholesalerName(p.wholesalerId), wholesalers.find((w) => w.id === p.wholesalerId)?.state || "N/A", p.inventory, dateShort(p.updated), daysBetween(p.updated)])} /><AdminBlock title="Productos con bajo inventario" columns={["SKU", "Producto", "Categoría", "Mayorista", "Estado", "Inventario", "Stock Mínimo", "Diferencia"]} rows={products.filter((p) => p.inventory <= p.minStock).map((p) => [productSku(p.id), p.name, p.category, wholesalerName(p.wholesalerId), wholesalers.find((w) => w.id === p.wholesalerId)?.state || "N/A", p.inventory, p.minStock, p.inventory - p.minStock])} /></div><AdminBlock title="Cobertura del Marketplace" columns={["Categoría", "Productos Disponibles", "Mayoristas", "Inventario", "Nivel"]} rows={[...new Set(products.map((p) => p.category))].map((category) => { const ps = products.filter((p) => p.category === category && p.inventory > 0); return [category, ps.length, new Set(ps.map((p) => p.wholesalerId)).size, num(ps.reduce((s, p) => s + p.inventory, 0)), ps.length > 20 ? "Alta" : ps.length >= 10 ? "Media" : ps.length >= 5 ? "Baja" : "Crítica"]; })} /></div>;
}
function CommerceModule({ radarRows }) {
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Categoría", "Marca"]} /><SectionHeader eyebrow="Módulo 11" title="Inteligencia Comercial" description="Radar Estratégico TH.O: últimos 12 meses móviles, agrupado por ID_PRODUCTO_THO, ordenado por Índice TH.O descendente." /><Card className="rounded-[2rem] border-0 shadow-sm" style={{ backgroundColor: PALETTE.white }}><CardContent className="p-6"><DataTable maxHeight="760px" columns={["Producto", "Ventas USD", "Ventas/Día", "Participación", "Ferreterías", "Mayoristas", "Crecimiento", "Estabilidad", "Precio Promedio", "Costo Promedio", "Fuente", "Costos", "Margen", "Índice TH.O"]} rows={radarRows.map((r) => [r.name, money2(r.sales12m), num(r.salesPerDay, 2), pct(r.marketShare), r.ferreterias, r.mayoristas, r.growth === null ? "NUEVO" : pct(r.growth), Math.round(r.stability), money2(r.priceAverage), money2(r.costAverage), r.sourceCost, r.costsReported, pct(r.margin), num(r.indexTHO, 2)])} /></CardContent></Card></div>;
}


function InvoiceStatusModule({ metrics }) {
  const totalB2B = Math.max(1, metrics.wholesalers.reduce((s, w) => s + w.sales, 0));
  const totalB2C = Math.max(1, metrics.hardwareStores.reduce((s, h) => s + h.b2c, 0));
  const b2bRows = metrics.wholesalers.map((w) => [
    getWholesalerRif(w.id), w.name, w.state, money(w.sales), w.orders, money2(w.sales / Math.max(1, w.orders)), w.stores,
    pct(safePct(w.sales - w.prevSales, w.prevSales)), pct(safePct(w.sales, totalB2B)), "3,2%", money(w.sales * 0.015), "Pendiente", "Por cobrar"
  ]);
  const b2cRows = metrics.hardwareStores.map((h) => [
    getStoreRif(h.id), h.name, h.state, money(h.b2c), Math.round(h.customers / 2), Math.round(h.customers / 2), money2(h.b2c / Math.max(1, Math.round(h.customers / 2))),
    pct(safePct(h.b2c - h.b2c * 0.85, h.b2c * 0.85)), pct(safePct(h.b2c, totalB2C)), h.blocked ? "12,5%" : "0,0%", money(h.b2c * 0.075), h.blocked ? "En revisión" : "Pendiente", h.blocked ? "Con alerta" : "Por cobrar"
  ]);
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Ferretería", "Estado Comisión", "Estado Factura"]} /><SectionHeader eyebrow="Nuevo módulo" title="Estado de Facturas" description="Controla todas las facturas B2B emitidas por mayoristas a ferreterías y ventas B2C de ferreterías a personas por las que TH.O cobra comisión." /><AdminBlock title="Facturas y comisiones B2B" objective="Objetivo: mostrar las ventas B2B que generan comisión TH.O y su estado de factura/comisión." columns={["RIF", "Mayorista", "Estado", "Ventas USD", "Pedidos", "Ticket promedio USD", "Ferreterías", "Crecimiento", "Participación", "Mora", "Comisión total USD TH.O", "Estado comisión", "Estado factura"]} rows={b2bRows} /><AdminBlock title="Facturas y comisiones B2C" objective="Objetivo: mostrar las ventas de ferreterías a personas naturales que generan comisión B2C para TH.O." columns={["RIF", "Ferretería", "Estado", "Ventas USD", "Pedidos", "Nro ventas", "Ticket promedio USD", "Crecimiento", "Participación", "Mora", "Comisión total USD TH.O", "Estado comisión", "Estado factura"]} rows={b2cRows} /></div>;
}

function PaymentManagementModule({ metrics }) {
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("cobranza");
  const openPrint = () => window.print();
  const tabs = [
    { id: "cobranza", title: "Cobranza y recuperación", description: "Gestión de facturas vencidas, cesiones, comentarios y seguimiento." },
    { id: "notificaciones", title: "Notificaciones de pagos recibidos", description: "Pagos de comisiones de mayoristas y ferreterías pendientes por validar." },
    { id: "pagos", title: "Pago de facturas", description: "Registro de pagos de ferreterías a mayoristas y actualización de estado factura." },
  ];
  const renderTabContent = () => {
    if (activeTab === "cobranza") {
      const vencidas = metrics.invoiceRows.filter((i) => i.daysToDue < 0 && i.balance > 0);
      const cedidas = metrics.invoiceRows.filter((i) => i.covered > 0);
      return <div className="space-y-6">
        <KpiGrid items={[["Facturas vencidas", num(vencidas.length), "Requieren gestión", AlertTriangle, "danger"], ["Monto vencido", money(metrics.carteraVencida), "Saldo vencido", DollarSign, "danger"], ["Capital cubierto", money(metrics.coveredHistoric), "Histórico", ShieldAlert, "warning"], ["Capital recuperado", money(metrics.recoveredHistoric), "Histórico", WalletCards, "success"]]} />
        <AdminBlock title="Cobranza y recuperación" objective="Objetivo: gestionar facturas vencidas, cesiones, comentarios, promesas de pago y recuperación." columns={["Factura", "Ferretería", "RIF", "Mayorista", "Vencimiento", "Días vencidos", "Saldo", "Responsable", "Estado cobranza", "Acción"]} rows={vencidas.map((i) => [i.id, storeName(i.storeId), getStoreRif(i.storeId), wholesalerName(i.wholesalerId), dateShort(i.dueDate), Math.abs(i.daysToDue), money(i.balance), i.assigned, i.collections, "Gestionar / Comentar"])} />
        <AdminBlock title="Facturas cubiertas por TH.O" objective="Objetivo: controlar capital cubierto por TH.O, recuperación pendiente y estado de gestión." columns={["Factura", "Ferretería", "Mayorista", "Capital cubierto", "Recuperado", "Pendiente", "Estado"]} rows={cedidas.map((i) => [i.id, storeName(i.storeId), wholesalerName(i.wholesalerId), money(i.covered), money(i.recovered), money(i.covered - i.recovered), i.collections])} />
        <Card className="rounded-[2rem] border-0 shadow-sm" style={{ backgroundColor: PALETTE.white }}><CardContent className="p-6"><h3 className="text-2xl font-black">Comentarios de gestión</h3><p className="mb-3 text-sm">Campo para registrar seguimiento, promesa de pago o razón de rechazo.</p><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe comentario de cobranza o rechazo..." className="min-h-[110px] w-full rounded-2xl border p-4 text-sm" style={{ borderColor: PALETTE.pastelGray }} /><div className="mt-3 flex flex-wrap gap-3"><Button className="rounded-full" style={{ backgroundColor: PALETTE.sizzlingSunrise, color: PALETTE.maastrichtBlue }}>Guardar comentario</Button><Button onClick={openPrint} className="rounded-full" style={{ backgroundColor: PALETTE.maastrichtBlue, color: PALETTE.white }}>Imprimir histórico</Button></div></CardContent></Card>
      </div>;
    }
    if (activeTab === "notificaciones") {
      return <div className="space-y-6">
        <KpiGrid items={[["Notificaciones", num(paymentNotifications.length), "Pendientes por revisar", ClipboardCheck, "warning"], ["Monto reportado", money(paymentNotifications.reduce((s, p) => s + p.amount, 0)), "Pagos notificados", DollarSign], ["Comisiones", num(paymentNotifications.filter((p) => String(p.concept).toLowerCase().includes("comisión")).length), "Mayoristas y ferreterías", WalletCards], ["Validación", "Manual", "Validar / Rechazar", FileCheck2]]} />
        <AdminBlock title="Notificaciones de pagos recibidos" objective="Objetivo: validar o rechazar pagos reportados por mayoristas y ferreterías para actualizar comisiones/facturas." columns={["Fecha", "Tipo", "Pagador", "RIF", "Factura", "Concepto", "Monto", "Método", "Referencia", "Acciones"]} rows={paymentNotifications.map((p) => [p.date, p.payerType, p.payer, p.rif, p.invoice, p.concept, money2(p.amount), p.method, p.reference, "Validar / Rechazar"])} />
      </div>;
    }
    return <div className="space-y-6">
      <KpiGrid items={[["Facturas por pagar", num(metrics.invoiceRows.filter((i) => i.balance > 0).length), "Con saldo pendiente", ClipboardCheck, "warning"], ["Saldo por pagar", money(metrics.invoiceRows.filter((i) => i.balance > 0).reduce((s, i) => s + i.balance, 0)), "Saldo abierto", DollarSign], ["Pagadas", num(metrics.invoiceRows.filter((i) => i.calculatedStatus === "Pagada").length), "Fuera de riesgo", FileCheck2, "success"], ["Histórico", num(paymentHistoryRows.length), "Pagos registrados", WalletCards]]} />
      <AdminBlock title="Pago de facturas" objective="Objetivo: registrar pagos de facturas B2B; al validarse desaparecen de facturas vencidas por pagar y riesgo." columns={["Factura", "Pedido", "Ferretería", "RIF", "Mayorista", "Saldo", "Estado factura", "Acción"]} rows={metrics.invoiceRows.filter((i) => i.balance > 0).map((i) => [i.id, i.order, storeName(i.storeId), getStoreRif(i.storeId), wholesalerName(i.wholesalerId), money(i.balance), i.calculatedStatus, "Registrar pago"])} />
      <AdminBlock title="Histórico de pagos imprimible" objective="Objetivo: permitir a mayoristas imprimir histórico de pagos y registrar pagos de comisiones." columns={["Fecha", "Pagador", "RIF", "Factura", "Monto", "Concepto", "Estado"]} rows={paymentHistoryRows} />
    </div>;
  };
  return <div className="space-y-6"><FilterPanel fields={["Fecha Inicial", "Fecha Final", "Estado", "Ciudad", "Mayorista", "Ferretería", "Responsable", "Estado Cobranza", "Estado Comisión", "Estado Factura"]} /><SectionHeader eyebrow="Nuevo módulo" title="Gestión de Pagos y Cobranzas" description="Centraliza cobranza/recuperación, notificaciones de pagos recibidos y pago de facturas. Los pagos validados actualizan Estado de Facturas y retiran facturas pagadas de riesgo." />
    <Card className="rounded-[2rem] border-0 shadow-sm" style={{ backgroundColor: PALETTE.white }}><CardContent className="p-2">
      <div className="grid gap-2 md:grid-cols-3">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className="rounded-[1.5rem] p-4 text-left transition hover:shadow-sm" style={{ backgroundColor: active ? PALETTE.maastrichtBlue : PALETTE.softCard, color: active ? PALETTE.white : PALETTE.maastrichtBlue, border: `1px solid ${active ? PALETTE.maastrichtBlue : PALETTE.softBorder}` }}>
            <span className="block text-base font-black">{tab.title}</span>
            <span className="mt-1 block text-xs font-semibold" style={{ color: active ? PALETTE.pastelGray : PALETTE.crystalBlue }}>{tab.description}</span>
          </button>;
        })}
      </div>
    </CardContent></Card>
    {renderTabContent()}
  </div>;
}

function getCurrentExportRows(section, metrics, radarRows) {
  if (section === "commerce") return { columns: ["Producto", "Ventas USD", "Ventas/Día", "Participación", "Ferreterías", "Mayoristas", "Crecimiento", "Estabilidad", "Precio", "Costo", "Fuente", "Costos", "Margen", "Índice"], rows: radarRows.map((r) => [r.name, r.sales12m, num(r.salesPerDay, 2), pct(r.marketShare), r.ferreterias, r.mayoristas, r.growth === null ? "NUEVO" : pct(r.growth), Math.round(r.stability), num(r.priceAverage, 2), num(r.costAverage, 2), r.sourceCost, r.costsReported, pct(r.margin), num(r.indexTHO, 2)]) };
  if (section === "risk" || section === "collections") return { columns: ["Factura", "Pedido", "Ferretería", "Mayorista", "Vencimiento", "Días", "Saldo", "Estado"], rows: metrics.invoiceRows.map((i) => [i.id, i.order, storeName(i.storeId), wholesalerName(i.wholesalerId), dateShort(i.dueDate), i.daysToDue, i.balance, i.calculatedStatus]) };
  if (section === "inventory") return { columns: ["SKU", "Producto", "Categoría", "Marca", "Mayorista", "Inventario", "Stock mínimo", "Estado"], rows: products.map((p) => [productSku(p.id), p.name, p.category, p.brand, wholesalerName(p.wholesalerId), p.inventory, p.minStock, p.inventory === 0 ? "Agotado" : p.inventory <= p.minStock ? "Bajo Inventario" : "Disponible"]) };
  if (section === "invoice_status") return { columns: ["RIF", "Nombre", "Estado", "Ventas USD", "Comisión TH.O", "Estado comisión", "Estado factura"], rows: metrics.wholesalers.map((w) => [getWholesalerRif(w.id), w.name, w.state, w.sales, w.sales * 0.015, "Pendiente", "Por cobrar"]).concat(metrics.hardwareStores.map((h) => [getStoreRif(h.id), h.name, h.state, h.b2c, h.b2c * 0.075, h.blocked ? "En revisión" : "Pendiente", h.blocked ? "Con alerta" : "Por cobrar"])) };
  if (section === "payment_management") return { columns: ["Fecha", "Pagador", "RIF", "Factura", "Monto", "Concepto", "Estado"], rows: paymentHistoryRows };
  if (section === "governance") return { columns: ["Fecha", "Tipo", "Razón Social", "RIF", "Estado", "Ciudad", "Documentación", "Acción"], rows: applications.map((a) => [a.date, a.type, a.legal, a.rif, a.status, a.city, "Expediente jurídico completo", "Validar / Aprobar / Alta / Rechazar"]) };
  return { columns: ["Módulo", "Métrica", "Valor"], rows: [[section, "Ventas Totales", metrics.totalSales], [section, "Ventas Totales B2B", metrics.b2bSales], [section, "Ventas Totales B2C", metrics.b2cTotal], [section, "Comisiones B2C", metrics.b2cGross], [section, "Ingresos por fee de reingreso", metrics.reinsertionIncome], [section, "Cartera Activa", metrics.carteraActiva]] };
}
