# 📊 Plan de Importación Masiva de Productos - TUHERRAMIENTA.ONLINE

## 🎯 Objetivo

Crear un flujo semi-automático de carga masiva de productos que:
- Permita mayoristas y detallistas subir múltiples productos sin inserción manual uno a uno
- Automatice la normalización y clasificación sin contaminar el catálogo
- Requiera validación humana para excepciones
- Vincule automáticamente los productos a la compañía correcta

---

## 📋 Formato Excel de Entrada

El Excel debe tener las siguientes columnas:

| Columna | Campo | Obligatorio | Descripción |
|---------|-------|-------------|-------------|
| A | Nombre del producto | Sí | Nombre del producto (ej: "Brocha profesional 2 pulgadas") |
| B | Marca del producto | No | Marca (ej: "GenTools") |
| C | Precio en decimales | Sí | Precio de venta (ej: 15.99) |
| D | Cantidad disponible | Sí | Stock inicial (ej: 50) |
| E | Stock mínimo | No | Mínimo para alertas (default: 0) |
| F | Atributos | No | Especificaciones del producto |
| G | Descripción | No | Descripción larga del producto |

**Notas importantes:**
- Primera fila = encabezados
- Datos desde fila 2 en adelante
- No incluir columna para `source_code` (se genera automáticamente)
- No incluir columna para categoría/subcategoría/línea (se auto-detectan)

---

## 🗄️ Base de Datos: JSON Staging

### Tabla única para staging:

```sql
CREATE TABLE Import_Batch (
    id_import_batch INT AUTO_INCREMENT PRIMARY KEY,
    id_company_fk INT NOT NULL,
    batch_name VARCHAR(100) NOT NULL,
    
    -- JSON con todas las filas del Excel procesadas
    import_data JSON NOT NULL,
    
    status ENUM('uploading', 'validating', 'pending_review', 'approved', 'processing', 'completed', 'failed') 
           DEFAULT 'uploading',
    
    total_rows INT DEFAULT 0,
    validated_rows INT DEFAULT 0,
    approved_rows INT DEFAULT 0,
    
    file_name VARCHAR(255),
    created_by_id_company INT,
    validation_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_company_fk) REFERENCES Company(id_company)
);
```

### Estructura del JSON (import_data):

```json
{
  "rows": [
    {
      "row_number": 1,
      "source_code": "BATCH_001_ROW_001",
      
      "raw_data": {
        "product_name": "Brocha profesional 2\"",
        "brand": "GenTools",
        "price": "15.99",
        "stock_quantity": "50",
        "min_stock": "5",
        "attributes": "medida: 2 pulgadas|color: rojo|material: nylon",
        "description": "Brocha profesional de cerdas naturales"
      },
      
      "normalized": {
        "product_name": "Brocha profesional",
        "brand": "GenTools",
        "price": 15.99,
        "stock_quantity": 50,
        "min_stock": 5,
        "attributes": {
          "medida": "2 pulgadas",
          "color": "rojo",
          "material": "nylon"
        },
        "description": "Brocha profesional de cerdas naturales"
      },
      
      "classification": {
        "line_raw": "Brochas",
        "line_suggested": "Brochas",
        "line_id": 12,
        "confidence": 0.98,
        "match_method": "fuzzy_match",
        "alternatives": []
      },
      
      "validation": {
        "status": "approved",
        "warnings": [],
        "errors": [],
        "duplicate_detected": false,
        "approved_by_admin": false,
        "approved_at": null
      },
      
      "result": {
        "final_product_id": null,
        "sku_generated": null,
        "created_at": null
      }
    }
  ]
}
```

---

## 🔄 Flujo de Procesamiento (B → A → C)

### Fase B: Carga Excel → JSON

**Paso 1: Upload del archivo**
- Mayorista o Admin sube archivo Excel
- Backend recibe el archivo
- Se extrae la compañía: 
  - Si es Mayorista loguead@: `id_company_fk = auth.id_company`
  - Si es Admin: Admin selecciona compañía

**Paso 2: Parseo del Excel**
- Leer filas desde fila 2
- Validar que tenga al menos columnas A-D (obligatorias)
- Crear objeto por fila con `raw_data`
- Generar `source_code` = `BATCH_{timestamp}_{row_number}`
- Guardar todo en `Import_Batch.import_data`
- Status = `validating`

**Validaciones básicas:**
- Precio es decimal válido
- Stock es número entero positivo
- Nombre no está vacío

---

### Fase A: Normalización + Clasificación

**Paso 1: Normalizar strings**
```javascript
// Aplicar a: product_name, brand, attributes, description
function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')     // Elimina acentos
    .replace(/[^a-z0-9\s]/g, '')        // Solo alfanuméricos
    .trim()
    .replace(/\s+/g, ' ');
}
```

**Paso 2: Separar atributos**
- Buscar delimitador `|` en campo de atributos
- Cada atributo: formato `key: value`
- Convertir a objeto JSON
- Validar que claves sean texto alfanumérico

**Paso 3: Fuzzy matching de línea**
- Normalizar entrada vs todas las líneas de BD
- Calcular Levenshtein distance
- Si similaridad ≥ 90%: auto-match, status = `approved`
- Si similaridad < 90%: pending_review, guardar top 3 alternativas

**Paso 4: Detectar duplicados**
- Dentro del mismo lote: mismo nombre normalizado + marca
- En la BD existente: buscar Product con mismo nombre + marca + id_company
- Si encuentra: marcar en `duplicate_detected = true`, agregar advertencia

**Paso 5: Actualizar JSON**
- Guardar `normalized`, `classification`, `validation` en Import_Batch.import_data
- Status = `pending_review` (si hay pending_review) o `approved` (si todo es auto-matched)
- Contar filas validadas

---

### Fase C: Revisión Humana + Aprobación

**Panel de revisión (Admin):**
- Mostrar solo filas con `status = pending_review` o `warnings`
- Para cada fila:
  - Mostrar datos normalizados
  - Si hay duplicados: mostrar productos similares
  - Si line_suggestion tiene baja confianza: mostrar alternativas (top 3)
  - Permitir: cambiar línea, cambiar nombre, marcar como skip, aprobar
- Botón "Aprobar lote" (todos los cambios se guardan en JSON)

**Cuando Admin aprueba:**
- Validar que todas las filas tengan decisión final
- Status = `approved`
- Update `approved_rows`, `validated_rows`
- Registrar quién aprobó y cuándo

---

### Fase D: Inserción Final

**Cuando status = `approved`:**
- Backend itera rows del JSON
- Para cada fila aprobada:
  1. Buscar/crear `Category` (inferred de Line)
  2. Buscar/crear `Subcategory` (inferred de Line)
  3. Buscar o usar `Line` existente (ya matched)
  4. Crear `Product` con:
     - `sku` = generar único (si no viene en source_code)
     - `name` = normalized.product_name
     - `brand` = normalized.brand
     - `description` = normalized.description
     - `price` = normalized.price
     - `attributes` = normalized.attributes (JSON)
     - `id_company_fk` = Import_Batch.id_company_fk
     - `id_line_fk` = matched line ID
  5. Crear `Stock`:
     - `quantity` = normalized.stock_quantity
     - `min_stock` = normalized.min_stock
  6. Crear `Product_Image` (si hay URLs)
  7. Actualizar JSON con `final_product_id`, `created_at`
- Status = `completed`

---

## 🎯 Control de Acceso

### Carga por Mayorista/Detallista:
```
POST /api/import/upload
- body: file (Excel)
- auth: required (mayorista loguead@)
- id_company_fk = req.user.id_company (automático)
```

### Carga por Admin:
```
POST /api/admin/import/upload
- body: file (Excel), id_company_fk (selector)
- auth: required (admin loguead@)
- id_company_fk = req.body.id_company_fk (seleccionado)
```

### Revisión:
```
GET  /api/admin/import/batch/:id
POST /api/admin/import/batch/:id/review
- auth: required (admin)
- Mostrar filas con pending_review
```

---

## 📐 Algoritmo de Fuzzy Matching (Levenshtein)

```javascript
// Normalización
function normalizeForMatch(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')          // Solo alfanuméricos, sin espacios
    .trim();
}

// Distancia Levenshtein
function levenshteinDistance(a, b) {
  const track = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(0));
  
  for (let i = 0; i <= a.length; i++) track[0][i] = i;
  for (let j = 0; j <= b.length; j++) track[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[b.length][a.length];
}

// Match finder
function findBestLineMatch(inputLine, allLinesFromDB) {
  const normalized_input = normalizeForMatch(inputLine);
  
  const matches = allLinesFromDB
    .filter(line => line.is_active)
    .map(line => {
      const normalized_db = normalizeForMatch(line.name);
      const distance = levenshteinDistance(normalized_input, normalized_db);
      const maxLen = Math.max(normalized_input.length, normalized_db.length);
      const similarity = ((maxLen - distance) / maxLen) * 100;
      
      return {
        id: line.id_line,
        name: line.name,
        similarity: Math.round(similarity),
        distance
      };
    })
    .sort((a, b) => b.similarity - a.similarity);
  
  const bestMatch = matches[0];
  
  if (bestMatch.similarity >= 90) {
    return {
      id: bestMatch.id,
      name: bestMatch.name,
      similarity: bestMatch.similarity,
      status: 'auto_matched',
      confidence: 'high'
    };
  } else {
    return {
      alternatives: matches.slice(0, 3),
      status: 'pending_review',
      confidence: 'low',
      message: `Best match: "${bestMatch.name}" (${bestMatch.similarity}%)`
    };
  }
}

// Ejemplos:
// findBestLineMatch("Brochas", allLines) 
//   → { id: 12, name: "Brochas", similarity: 100, status: 'auto_matched' }

// findBestLineMatch("brocha profesional", allLines)
//   → { id: 12, name: "Brochas", similarity: 97, status: 'auto_matched' }

// findBestLineMatch("brochas xxl especiales", allLines)
//   → { alternatives: [...], status: 'pending_review', message: '...' }
```

---

## 🚀 Implementación Sugerida

### Sprint 1: Estructura Base
- [ ] Crear tabla `Import_Batch` en BD
- [ ] Endpoint POST para upload de Excel
- [ ] Parser básico (XLSX a JSON)
- [ ] Guardar raw_data

### Sprint 2: Normalización
- [ ] Implementar normalización de strings
- [ ] Separador de atributos (delimitador `|`)
- [ ] Detección de duplicados
- [ ] Fuzzy matching de líneas

### Sprint 3: Validación
- [ ] Panel de revisión (Admin)
- [ ] Aprobación manual de pending_review
- [ ] Actualización de JSON con decisiones

### Sprint 4: Inserción
- [ ] Backend para crear productos desde JSON aprobado
- [ ] Vincular a Stock, Product_Image
- [ ] Auditoría de cambios

---

## ⚠️ Riesgos Mitigados

| Riesgo | Mitigación |
|--------|-----------|
| Contaminación del catálogo | JSON staging + revisión humana antes de insertar |
| Duplicados | Detección automática + validación admin |
| Líneas con encoding inválido (?) | Script de normalización SQL + fuzzy matching |
| Atributos mal formatos | Validación de estructura + separador delimitado |
| Productos sin stock | Validación en upload que stock ≥ 0 |
| Compañía incorrecta | Auto-captura si es mayorista, selector si es admin |

---

## 📝 Notas Técnicas

- **JSON vs Tablas**: JSON permite flexibilidad y auditoría completa del proceso
- **Fuzzy Matching**: Levenshtein distance es simple y efectivo para matching de líneas
- **Normalización**: NFD + eliminación de diacríticos = soluciona el problema de "?"
- **Staged inserts**: Permite rollback total si hay error masivo
- **Auditabilidad**: Cada decisión queda registrada en JSON con timestamp

