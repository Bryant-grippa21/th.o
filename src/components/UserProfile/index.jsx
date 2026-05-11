import React, { useState } from "react";
import SalesPortal from "./portals/SalesPortal";
import PurchasesPortal from "./portals/PurchasesPortal";
import PortalSelector from "./portals/PortalSelector";
import WholesalerDashboard from "./portals/WholesalerDashboard";
import NaturalUserDashboard from "./portals/NaturalUserDashboard";

export default function UserProfile({ userData, onBack, onLogout }) {
  const [selectedPortal, setSelectedPortal] = useState(null);
  const userType = userData.userType;
  const isJuridicoDetallista = userType === "Jurídico Detallista";
  const isJuridicoMayorista = userType === "Jurídico Mayorista";

  if (isJuridicoDetallista) {
    if (selectedPortal === "sales") return <SalesPortal userData={userData} onBack={() => setSelectedPortal(null)} />;
    if (selectedPortal === "purchases") return <PurchasesPortal userData={userData} onBack={() => setSelectedPortal(null)} />;
    return <PortalSelector onSelectPortal={(portal) => setSelectedPortal(portal)} onBack={onBack} onLogout={onLogout} userData={userData} />;
  }
  if (isJuridicoMayorista) return <WholesalerDashboard userData={userData} onBack={onBack} onLogout={onLogout} />;

  // USUARIO NATURAL - NUEVO DASHBOARD
  return <NaturalUserDashboard userData={userData} onBack={onBack} onLogout={onLogout} />;
}
