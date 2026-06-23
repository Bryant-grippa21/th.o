const fs = require('fs');
const path = 'c:/Users/LENOVO/Desktop/TUHERRAMIENTA.ONLINE/TUHERRAMIENTA.ONLINE - 002/public/static/js/main.7b6cc775.js';
const content = fs.readFileSync(path, 'utf8');
const start = content.indexOf('Inform');
if (start < 0) {
  throw new Error('No se encontró el bloque inicial');
}
const tail = content.indexOf('const xe=', start);
if (tail < 0) {
  throw new Error('No se encontró el tramo posterior');
}
const replacement = `Información del cliente"}),(0,w.jsxs)("div",{className:"bg-gray-50 rounded-lg p-3 space-y-2",children:[(0,w.jsxs)("p",{className:"text-sm flex items-center gap-2",children:["Nombre: ",ve.customerName||ve.customer||ve.name||r.name||"No disponible"]}),(0,w.jsxs)("p",{className:"text-sm flex items-center gap-2",children:["Celular: ",ve.customerPhone||ve.phone||ve.contactPhone||r.phone||"No disponible"]}),(0,w.jsxs)("p",{className:"text-sm flex items-center gap-2",children:["Email: ",ve.customerEmail||ve.email||r.email||"No disponible"]}),(0,w.jsxs)("p",{className:"text-sm flex items-center gap-2",children:["Dirección: ",ve.shippingAddress||r.address||"No disponible"]})]}),(0,w.jsxs)("div",{children:[(0,w.jsx)("p",{className:"font-semibold text-sm mb-2",children:"Evidencias de pago"}),(0,w.jsx)("div",{className:"bg-gray-50 rounded-lg p-3 space-y-2",children:ve.evidenceFiles&&ve.evidenceFiles.length?ve.evidenceFiles.map((file,t)=>(0,w.jsx)("div",{className:"text-sm",children:file},t)):(0,w.jsx)("p",{className:"text-sm text-gray-500",children:"Sin evidencias cargadas"})})]})]})]})]})]})]})}`;
const updated = content.slice(0, start) + replacement + content.slice(tail);
fs.writeFileSync(path, updated, 'utf8');
console.log('bundle updated');
