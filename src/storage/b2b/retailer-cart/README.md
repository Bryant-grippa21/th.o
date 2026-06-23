# Carrito temporal B2B del detallista

Este directorio guarda un JSON por detallista con el carrito temporal de cotizacion B2B.

## Archivo esperado

- `<id_detallista>.json`

## Estructura base

```json
{
  "id_retailer": 12,
  "status": "ACTIVE",
  "locked_at": null,
  "submitted_at": null,
  "groups": [
    {
      "company_id": 8,
      "company_name": "Empresa A",
      "company_email": "ventas@empresa-a.com",
      "company_phone": "+58 412 0000000",
      "company_image_url": "/uploads/profiles/companies/empresa-a.png",
      "payment_mode": "ONE_TIME",
      "note": "Comentario para el mayorista",
      "items": [
        {
          "id_product": 100,
          "quantity": 4,
          "product_name": "Taladro",
          "sku": "TAL-100",
          "unit_price_usd": 25,
          "company_id": 8,
          "company_name": "Empresa A",
          "company_email": "ventas@empresa-a.com",
          "company_phone": "+58 412 0000000",
          "company_image_url": "/uploads/profiles/companies/empresa-a.png",
          "main_image_url": "/uploads/products/taladro.jpg",
          "created_at": "2026-06-22T00:00:00.000Z",
          "updated_at": "2026-06-22T00:00:00.000Z"
        }
      ],
      "created_at": "2026-06-22T00:00:00.000Z",
      "updated_at": "2026-06-22T00:00:00.000Z"
    }
  ],
  "updated_at": "2026-06-22T00:00:00.000Z"
}
```

## Regla

El archivo es persistencia operativa temporal. No es la fuente final de la cotizacion, pero conserva el carrito mientras el detallista prepara la solicitud por empresa.