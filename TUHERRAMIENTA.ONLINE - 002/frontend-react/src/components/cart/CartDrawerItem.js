import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

const PALETTE = {
  maastrichtBlue: "#091A2D",
  crystalBlue: "#6E98AF",
  softBorder: "rgba(9,26,45,0.10)",
  page: "#F3F1EC",
  white: "#FFFFFF",
  danger: "#B42318",
  softDanger: "rgba(180,35,24,0.08)",
};

const formatUSD = (value) =>
  new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export default function CartDrawerItem({
  item,
  updateCartQuantity,
  removeFromCart,
}) {
  const quantity = Math.max(1, Number(item?.quantity || 1));
  const stock = Math.max(1, Number(item?.stock || 1));
  const price = Number(item?.price || 0);
  const lineTotal = price * quantity;

  const handleDecrease = () => {
    if (quantity > 1) updateCartQuantity(item.id, quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < stock) updateCartQuantity(item.id, quantity + 1);
  };

  return (
    <div
      className="rounded-[1.5rem] border p-3"
      style={{ borderColor: PALETTE.softBorder, backgroundColor: PALETTE.white }}
    >
      <div className="flex gap-3">
        <img
          src={item?.image}
          alt={item?.name || "Producto"}
          className="h-16 w-16 rounded-xl object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/120x120?text=Producto";
          }}
        />

        <div className="min-w-0 flex-1">
          <p
            className="line-clamp-2 text-sm font-semibold"
            style={{ color: PALETTE.maastrichtBlue }}
          >
            {item?.name || "Producto sin nombre"}
          </p>

          <p className="mt-1 text-xs" style={{ color: PALETTE.crystalBlue }}>
            Cantidad actual: {quantity} · Stock: {stock}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div
              className="inline-flex items-center rounded-full border px-2 py-1"
              style={{ borderColor: PALETTE.softBorder }}
            >
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="rounded-full p-1 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Disminuir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="min-w-[2rem] text-center text-sm font-semibold">
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={quantity >= stock}
                className="rounded-full p-1 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium"
              style={{
                backgroundColor: PALETTE.softDanger,
                color: PALETTE.danger,
              }}
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
          <span>Precio unitario</span>
          <span className="font-semibold">{formatUSD(price)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Subtotal producto</span>
          <span className="font-semibold">{formatUSD(lineTotal)}</span>
        </div>
      </div>
    </div>
  );
}
