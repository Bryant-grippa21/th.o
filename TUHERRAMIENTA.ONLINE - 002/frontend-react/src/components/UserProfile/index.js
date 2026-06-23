import React, { useMemo, useState } from "react";

import NaturalUserDashboard from "./portals/NaturalUserDashboard";
import PortalSelector from "./portals/PortalSelector";
import PurchasesPortal from "./portals/PurchasesPortal";
import SalesPortal from "./portals/SalesPortal";
import WholesalerDashboard from "./portals/WholesalerDashboard";

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function UserProfile({
  userData = {},
  favorites = [],
  isFavorite,
  onToggleFavorite,
  addToCart,
  cartCount = 0,
  onOpenCart,
  onViewProduct,
  onBack,
  onLogout,
}) {
  const [activePortal, setActivePortal] = useState(null);

  const userRole = useMemo(() => normalizeText(userData.userType), [userData.userType]);

  const commonProps = {
    userData,
    onBack,
    onLogout,
  };

  if (userRole.includes("mayorista")) {
    return <WholesalerDashboard {...commonProps} />;
  }

  if (userRole.includes("detallista") || userData.sellerName) {
    if (activePortal === "sales") {
      return <SalesPortal userData={userData} onBack={() => setActivePortal(null)} onLogout={onLogout} />;
    }

    if (activePortal === "purchases") {
      return <PurchasesPortal userData={userData} onBack={() => setActivePortal(null)} onLogout={onLogout} addToCartFromStore={addToCart} cartCount={cartCount} onOpenCart={onOpenCart} onViewProduct={onViewProduct} />;
    }

    return (
      <PortalSelector
        userData={userData}
        onBack={onBack}
        onLogout={onLogout}
        onSelectPortal={setActivePortal}
      />
    );
  }

  return (
    <NaturalUserDashboard
      userData={userData}
      onBack={onBack}
      onLogout={onLogout}
      favorites={favorites}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      addToCartFromStore={addToCart}
    />
  );
}
