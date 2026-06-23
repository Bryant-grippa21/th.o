import React, { useState } from "react";
import { authApi } from "./ui/apiClient";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
const heroToolsImage = "/login-tools-image.png";

const PALETTE = {
  spaceCadet: "#1B3149",
  pastelGray: "#D6D0C4",
  crystalBlue: "#6E98AF",
  sizzlingSunrise: "#FEDC00",
  maastrichtBlue: "#091A2D",
  page: "#F3F1EC",
  white: "#FFFFFF",
};

const brandLogo = "/logo_full.png";
const exchangeRate = 466.51;

const formatVES = (value) => {
  if (!exchangeRate || typeof value !== "number" || isNaN(value)) {
    return "Bs. 0,00";
  }

  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    maximumFractionDigits: 2,
  }).format(value * exchangeRate);
};


/*
  IMPORTANTE:
  Para que el panel derecho use exactamente la misma imagen del mockup,
  guarda la imagen en tu carpeta public con este nombre:

  /public/images/login-tools-hero.png

  Luego este componente la cargará desde:
  /images/login-tools-hero.png
*/


const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" fill="currentColor" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" fill="currentColor" />
  </svg>
);

const StoreIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 10h16l-1.2-5.2A1 1 0 0 0 17.8 4H6.2a1 1 0 0 0-1 .8L4 10Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M5 10v9h14v-9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 19v-5h6v5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4 10c0 1.2.9 2 2 2s2-.8 2-2c0 1.2.9 2 2 2s2-.8 2-2c0 1.2.9 2 2 2s2-.8 2-2c0 1.2.9 2 2 2s2-.8 2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MailIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8 10V8a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);


const ShieldIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 5 6v5c0 4.5 2.9 8.6 7 10 4.1-1.4 7-5.5 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MedalIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="13" r="5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9 2h6l-1.5 6h-3L9 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="m10 18-1 4 3-2 3 2-1-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TagIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 12V5h7l9 9-7 7-9-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
  </svg>
);

const HeadsetIcon = ({ className = "h-6 w-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 13a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M4 13v4a2 2 0 0 0 2 2h1v-8H6a2 2 0 0 0-2 2ZM20 13v4a2 2 0 0 1-2 2h-1v-8h1a2 2 0 0 1 2 2Z" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export default function AuthPage({ onBack, onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [userType, setUserType] = useState("natural");
  const [loginType, setLoginType] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [query, setQuery] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [naturalData, setNaturalData] = useState({
    name: "",
    email: "",
    password: "",
    cell_phone: "",
    mail_address: "",
  });

  const [juridicaData, setJuridicaData] = useState({
    email: "",
    password: "",
    businessType: "detallista",
  });

  const [juridicaDocuments, setJuridicaDocuments] = useState({
    mercantileRegistry: null,
    companyRif: null,
    legalRepresentativesIds: null,
    economicActivitiesLicense: null,
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNaturalChange = (e) => {
    const { name, value } = e.target;
    setNaturalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJuridicaChange = (e) => {
    const { name, value } = e.target;
    setJuridicaData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJuridicaDocumentChange = (e) => {
    const { name, files } = e.target;
    setJuridicaDocuments((prev) => ({
      ...prev,
      [name]: files?.[0] || null,
    }));
  };

  const normalizeEmail = (email) => email.trim().toLowerCase();

  const getPostLoginDestination = (user, fallbackUserType) => {
    const rawRole = String(
      user?.role ||
      user?.userType ||
      user?.type ||
      fallbackUserType ||
      ""
    ).toLowerCase();

    if (rawRole.includes("admin") || rawRole.includes("administrador")) {
      return "admin-dashboard";
    }

    if (
      rawRole.includes("mayorista") ||
      rawRole.includes("wholesale") ||
      rawRole.includes("juridico_mayorista")
    ) {
      return "mayorista-dashboard";
    }

    return "marketplace";
  };

  const persistSession = (payload, fallbackUserType) => {
    const token = payload?.token || payload?.accessToken;
    const user = payload?.user || payload?.data?.user || payload;
    const normalizedUser = {
      ...user,
      userType: user?.userType || fallbackUserType,
    };
    const destination = getPostLoginDestination(normalizedUser, fallbackUserType);

    if (token) localStorage.setItem("authToken", token);
    if (user) localStorage.setItem("userData", JSON.stringify(normalizedUser));
    localStorage.setItem("postLoginDestination", destination);

    onAuthSuccess?.({
      token,
      user: normalizedUser,
      redirectTo: destination,
    });

    window.dispatchEvent(
      new CustomEvent("auth:success", {
        detail: {
          token,
          user: normalizedUser,
          redirectTo: destination,
        },
      })
    );
  };

  const validateRequired = (data, fields) => {
    const missing = fields.filter((field) => !String(data[field] || "").trim());
    if (missing.length) {
      throw new Error("Completa todos los campos obligatorios antes de continuar.");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const demoEmail = loginData.email.trim().toLowerCase();
    const demoPassword = loginData.password;

    if (
      loginType === "business" &&
      demoEmail === "admin@tuherramientaonline.com" &&
      demoPassword === "Admin123*"
    ) {
      const demoSession = {
        token: "admin-demo-token",
        user: {
          name: "Administrador",
          email: demoEmail,
          role: "admin",
          userType: "admin",
        },
        redirectTo: "admin-dashboard",
      };

      localStorage.setItem("authToken", demoSession.token);
      localStorage.setItem("userData", JSON.stringify(demoSession.user));
      localStorage.setItem("postLoginDestination", "admin-dashboard");

      onAuthSuccess?.(demoSession);
      return;
    }

    if (
      loginType === "business" &&
      demoEmail === "mayorista@tuherramientaonline.com" &&
      demoPassword === "Mayorista123*"
    ) {
      const demoSession = {
        token: "mayorista-demo-token",
        user: {
          name: "Mayorista Demo",
          email: demoEmail,
          role: "mayorista",
          userType: "juridico_mayorista",
        },
        redirectTo: "mayorista-dashboard",
      };

      localStorage.setItem("authToken", demoSession.token);
      localStorage.setItem("userData", JSON.stringify(demoSession.user));
      localStorage.setItem("postLoginDestination", "mayorista-dashboard");

      onAuthSuccess?.(demoSession);
      return;
    }

    try {
      validateRequired(loginData, ["email", "password"]);
      setIsSubmitting(true);
      const payload = await authApi.login({
        email: normalizeEmail(loginData.email),
        password: loginData.password,
        userType: loginType === "business" ? "juridico_detallista" : "natural",
      });
      persistSession(payload, loginType === "business" ? "juridico_detallista" : "natural");
    } catch (error) {
      setFormError(error.message || "No se pudo iniciar sesión. Revisa tus datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loginType !== "user") return;

    setFormError("");

    try {
      setIsSubmitting(true);

      if (authApi.loginWithGoogle) {
        const payload = await authApi.loginWithGoogle({ userType: "natural" });
        persistSession(payload, "natural");
        return;
      }

      window.location.href = "/auth/google";
    } catch (error) {
      setFormError(error.message || "No se pudo iniciar sesión con Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setFormError("");

    try {
      setIsSubmitting(true);

      if (authApi.registerWithGoogle) {
        const payload = await authApi.registerWithGoogle({ userType: "natural" });
        persistSession(payload, "natural");
        return;
      }

      window.location.href = "/auth/google";
    } catch (error) {
      setFormError(error.message || "No se pudo registrar con Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    try {
      setIsSubmitting(true);

      if (userType === "natural") {
        validateRequired(naturalData, ["name", "email", "password", "cell_phone", "mail_address"]);
        const payload = await authApi.registerNatural({
          ...naturalData,
          email: normalizeEmail(naturalData.email),
          userType: "natural",
        });
        persistSession(payload, "natural");
      } else {
        validateRequired(juridicaData, ["email", "password"]);

        const requiredDocuments = [
          "mercantileRegistry",
          "companyRif",
          "legalRepresentativesIds",
          "economicActivitiesLicense",
        ];

        const missingDocuments = requiredDocuments.filter(
          (documentKey) => !juridicaDocuments[documentKey]
        );

        if (missingDocuments.length) {
          throw new Error("Debes anexar todos los documentos solicitados para registrar la empresa.");
        }

        const formData = new FormData();
        formData.append("email", normalizeEmail(juridicaData.email));
        formData.append("password", juridicaData.password);
        formData.append("businessType", juridicaData.businessType);
        formData.append("userType", "juridico_pendiente");
        formData.append("mercantileRegistry", juridicaDocuments.mercantileRegistry);
        formData.append("companyRif", juridicaDocuments.companyRif);
        formData.append("legalRepresentativesIds", juridicaDocuments.legalRepresentativesIds);
        formData.append("economicActivitiesLicense", juridicaDocuments.economicActivitiesLicense);

        if (authApi.registerJuridica) {
          const payload = await authApi.registerJuridica(formData);
          persistSession(payload, "juridico_pendiente");
        } else {
          setFormError(
            "Solicitud recibida. Un administrador debe verificar los datos y documentos antes de habilitar el inicio de sesión."
          );
        }
      }
    } catch (error) {
      setFormError(error.message || "No se pudo crear la cuenta. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modeButtonClass = (active) =>
    `flex h-12 items-center justify-center gap-3 rounded-xl px-5 text-sm font-black transition ${
      active
        ? "bg-white text-slate-950 shadow-sm"
        : "text-slate-500 hover:text-slate-900"
    }`;

  const choiceButtonClass = (active, color = "yellow") =>
    `flex min-h-[76px] items-center justify-center gap-4 rounded-2xl border px-5 text-center text-sm font-black transition ${
      active
        ? color === "yellow"
          ? "border-yellow-400 bg-white shadow-sm ring-1 ring-yellow-300"
          : "border-[#061a2d] bg-white shadow-sm ring-1 ring-[#061a2d]"
        : "border-slate-200 bg-white hover:border-slate-300"
    }`;

  const inputClass = "h-12 rounded-xl border-slate-300 bg-white pl-12 shadow-sm focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100";

  return (
    <div className="min-h-screen bg-[#f5f1e9] text-slate-950">
      <header className="sticky top-0 z-50 shadow-sm">
        <div
          className="px-4 py-3 text-white lg:px-8"
          style={{ backgroundColor: PALETTE.maastrichtBlue }}
        >
          <div className="mx-auto flex w-full flex-wrap items-center gap-3 lg:flex-nowrap">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex w-auto max-w-[260px] flex-none items-center gap-3 rounded-2xl px-1 py-1 text-left transition-colors hover:bg-white/10"
              style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
            >
              <div
                className="flex h-14 w-auto max-w-[248px] shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-16"
                style={{ backgroundColor: PALETTE.white || "#FFFFFF", width: "fit-content", flex: "0 0 auto" }}
              >
                <img
                  src={brandLogo}
                  alt="Logo de Tuherramientaonline"
                  className="h-full w-auto max-w-[230px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement?.querySelector(".store-icon")?.classList.remove("hidden");
                  }}
                />
                <StoreIcon
                  className="store-icon hidden h-7 w-7"
                  style={{ color: PALETTE.spaceCadet }}
                />
              </div>
            </button>

            <div className="hidden flex-1 md:block" />

            <div className="hidden items-center gap-4 md:flex">
              <div
                className="rounded-2xl px-3 py-2 shadow-sm"
                style={{
                  backgroundColor: PALETTE.maastrichtBlue,
                  border: `1px solid ${PALETTE.crystalBlue}`,
                  color: PALETTE.white,
                }}
              >
                <p className="text-xs" style={{ color: PALETTE.white }}>
                  Sesión
                </p>
                <p className="text-sm font-semibold" style={{ color: PALETTE.white }}>Invitado</p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setMode("login")}
                  className="rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor:
                      mode === "login" ? PALETTE.sizzlingSunrise : "rgba(255,255,255,0.04)",
                    color: mode === "login" ? PALETTE.maastrichtBlue : PALETTE.white,
                    borderColor: mode === "login" ? PALETTE.sizzlingSunrise : PALETTE.crystalBlue,
                  }}
                >
                  Iniciar sesión
                </Button>

                <Button
                  type="button"
                  onClick={() => setMode("register")}
                  variant="outline"
                  className="rounded-full text-sm text-white hover:bg-transparent hover:text-white"
                  style={{
                    backgroundColor:
                      mode === "register" ? PALETTE.sizzlingSunrise : "transparent",
                    borderColor: PALETTE.crystalBlue,
                    color: mode === "register" ? PALETTE.maastrichtBlue : PALETTE.white,
                  }}
                >
                  Registrarse
                </Button>
              </div>

              <div
                className="rounded-2xl px-3 py-2 shadow-sm"
                style={{
                  backgroundColor: PALETTE.maastrichtBlue,
                  border: `1px solid ${PALETTE.crystalBlue}`,
                  color: PALETTE.white,
                }}
              >
                <p className="text-xs" style={{ color: PALETTE.white }}>
                  Tasa del día
                </p>
                <p className="text-sm font-semibold" style={{ color: PALETTE.white }}>{formatVES(1)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden px-3 py-6 sm:px-4 sm:py-10 lg:py-14">
        <div className="pointer-events-none absolute left-[18%] top-24 h-80 w-80 rounded-full bg-yellow-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[10%] top-28 h-96 w-96 rounded-full bg-white/70 blur-3xl" />

        <section className="relative mx-auto grid max-w-[1120px] overflow-hidden rounded-[1.25rem] bg-white shadow-2xl shadow-slate-900/10 sm:rounded-[1.7rem] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 bg-white px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="mb-7">
              <div className="mb-5 h-1.5 w-16 rounded-full bg-yellow-400" />
              <h1 className="text-[28px] font-black leading-none tracking-tight text-slate-950 sm:text-[38px]">
                {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </h1>
              <p className="mt-4 text-sm text-slate-500">
                {mode === "login"
                  ? "Elige cómo deseas iniciar sesión"
                  : "Selecciona el tipo de usuario y completa los requisitos"}
              </p>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-slate-100 p-1 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`${modeButtonClass(mode === "login")} ${
                  mode === "login" ? "border-b-2 border-yellow-400" : ""
                }`}
              >
                <UserIcon className={mode === "login" ? "h-5 w-5 text-yellow-400" : "h-5 w-5"} />
                Iniciar sesión
              </button>

              <button
                type="button"
                onClick={() => setMode("register")}
                className={modeButtonClass(mode === "register")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 5h8l4 4v10H6V5Z" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M14 5v5h5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9 14h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Registrarse
              </button>
            </div>

            {formError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            {mode === "login" && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setLoginType("user")}
                    className={choiceButtonClass(loginType === "user", "yellow")}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-yellow-100 text-yellow-500">
                      <UserIcon className="h-6 w-6" />
                    </span>
                    <span>Iniciar como usuario</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginType("business")}
                    className={choiceButtonClass(loginType === "business", "navy")}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-[#061a2d]">
                      <StoreIcon className="h-6 w-6" />
                    </span>
                    <span>Iniciar como comercio</span>
                  </button>
                </div>

                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-black text-slate-900">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <MailIcon className="h-5 w-5" />
                      </span>
                      <Input
                        name="email"
                        type="email"
                        placeholder={
                          loginType === "business"
                            ? "comercio@ejemplo.com"
                            : "correo@ejemplo.com"
                        }
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-black text-slate-900">
                      Contraseña
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <LockIcon className="h-5 w-5" />
                      </span>
                      <Input
                        name="password"
                        type="password"
                        placeholder="********"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl bg-yellow-400 font-black text-slate-950 shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Conectando..."
                      : loginType === "business"
                        ? "Iniciar sesión como comercio →"
                        : "Iniciar sesión como usuario →"}
                  </Button>
                </form>

                {loginType === "user" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-slate-200" />
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-400">
                        o
                      </span>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSubmitting}
                      onClick={handleGoogleLogin}
                      className="h-12 w-full rounded-xl border-slate-300 bg-white font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Iniciar sesión con Google
                    </Button>
                  </div>
                )}
              </div>
            )}

            {mode === "register" && (
              <form className="mt-6 space-y-5" onSubmit={handleRegisterSubmit}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black text-slate-900">
                    Tipo de usuario
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                  >
                    <option value="natural">Persona natural</option>
                    <option value="juridica">Persona jurídica</option>
                  </select>
                </div>

                {userType === "natural" && (
                  <div className="space-y-4 rounded-3xl border border-yellow-200 bg-yellow-50/40 p-5">
                    <h3 className="text-lg font-black text-slate-950">
                      Registro de persona natural
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-800">Nombre</label>
                        <Input
                          name="name"
                          placeholder="Nombre completo"
                          value={naturalData.name}
                          onChange={handleNaturalChange}
                          required
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-800">Teléfono</label>
                        <Input
                          name="cell_phone"
                          placeholder="0412-0000000"
                          value={naturalData.cell_phone}
                          onChange={handleNaturalChange}
                          required
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-800">Correo electrónico</label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={naturalData.email}
                        onChange={handleNaturalChange}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-800">Contraseña</label>
                      <Input
                        name="password"
                        type="password"
                        placeholder="********"
                        value={naturalData.password}
                        onChange={handleNaturalChange}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-800">Dirección</label>
                      <Input
                        name="mail_address"
                        placeholder="Dirección de habitación"
                        value={naturalData.mail_address}
                        onChange={handleNaturalChange}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-yellow-200" />
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-xs font-bold text-slate-400">
                          o
                        </span>
                        <div className="h-px flex-1 bg-yellow-200" />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={handleGoogleRegister}
                        className="h-12 w-full rounded-xl border-slate-300 bg-white font-bold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Registrarse con Google
                      </Button>
                    </div>
                  </div>
                )}

                {userType === "juridica" && (
                  <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-black text-slate-950">
                      Registro de empresa
                    </h3>

                    <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 shadow-sm">
                      Anexa las fotos de los documentos solicitados. La cuenta quedará
                      pendiente hasta que el administrador verifique los datos y las imágenes.
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-800">
                        Correo electrónico
                      </label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="empresa@ejemplo.com"
                        value={juridicaData.email}
                        onChange={handleJuridicaChange}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-800">
                        Contraseña
                      </label>
                      <Input
                        name="password"
                        type="password"
                        placeholder="********"
                        value={juridicaData.password}
                        onChange={handleJuridicaChange}
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-800">
                        Tipo de empresa
                      </label>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() =>
                            setJuridicaData((prev) => ({
                              ...prev,
                              businessType: "detallista",
                            }))
                          }
                          className={`rounded-2xl border px-4 py-4 text-sm font-bold transition-all ${
                            juridicaData.businessType === "detallista"
                              ? "border-yellow-400 bg-yellow-50 text-slate-950"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          Comercio
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setJuridicaData((prev) => ({
                              ...prev,
                              businessType: "mayorista",
                            }))
                          }
                          className={`rounded-2xl border px-4 py-4 text-sm font-bold transition-all ${
                            juridicaData.businessType === "mayorista"
                              ? "border-yellow-400 bg-yellow-50 text-slate-950"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          Mayorista
                        </button>
                      </div>

                      <p className="text-xs text-slate-500">
                        Todos los perfiles de empresa quedan pendientes. El administrador verificará los documentos y decidirá quién puede operar como mayorista.
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {[
                        {
                          name: "mercantileRegistry",
                          label:
                            "Registro Mercantil y última acta de asamblea donde conste la junta directiva vigente",
                        },
                        {
                          name: "companyRif",
                          label: "RIF de la empresa vigente",
                        },
                        {
                          name: "legalRepresentativesIds",
                          label:
                            "Cédula de identidad y RIF del o de los representantes legales vigentes",
                        },
                        {
                          name: "economicActivitiesLicense",
                          label: "Licencia de actividades económicas vigente",
                        },
                      ].map((document) => (
                        <div
                          key={document.name}
                          className="rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <label className="text-sm font-bold text-slate-800">
                            {document.label}
                          </label>
                          <input
                            name={document.name}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleJuridicaDocumentChange}
                            required
                            className="mt-3 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-yellow-400 file:px-4 file:py-3 file:text-sm file:font-bold file:text-slate-950 hover:file:bg-yellow-300"
                          />
                          {juridicaDocuments[document.name] && (
                            <p className="mt-2 text-xs font-semibold text-emerald-700">
                              Archivo anexado: {juridicaDocuments[document.name].name}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-yellow-400 font-black text-slate-950 shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Enviando solicitud..."
                    : userType === "juridica"
                      ? "Enviar solicitud para verificación →"
                      : "Crear cuenta →"}
                </Button>
              </form>
            )}

            <Button
              variant="outline"
              className="mt-6 h-12 w-full rounded-xl border-slate-300 bg-white font-black text-slate-800 hover:bg-slate-50"
              onClick={onBack}
            >
              ← Volver al inicio
            </Button>
          </div>

          <aside className="relative hidden min-h-[640px] overflow-hidden bg-[#071827] lg:block">
            {/* Imagen del panel derecho del login.
               Para cambiarla luego, reemplaza el archivo:
               public/login-tools-image.png */}
            <img
              src={heroToolsImage}
              alt="Tu Herramienta Online"
              className="absolute inset-0 h-full w-full object-cover object-center"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </aside>
        </section>

        <section className="relative mx-auto mt-8 grid max-w-[1120px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [<ShieldIcon />, "Seguridad garantizada", "Protegemos tu información y tus compras"],
            [<MedalIcon />, "Productos de calidad", "Herramientas y marcas con garantía"],
            [<TagIcon />, "Precios competitivos", "Las mejores ofertas del mercado"],
            [<HeadsetIcon />, "Soporte especializado", "Estamos para ayudarte en cada paso"],
          ].map(([icon, title, description]) => (
            <div key={title} className="flex min-h-[96px] items-start gap-4 rounded-2xl bg-white/90 p-4 shadow-sm">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-yellow-100 text-slate-950">
                {icon}
              </span>
              <div>
                <h3 className="font-black leading-tight text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
