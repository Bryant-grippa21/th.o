import React, { useState } from "react";
import { authApi } from "./ui/apiClient";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function AuthPage({ onBack, onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [userType, setUserType] = useState("natural");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [naturalData, setNaturalData] = useState({
    name: "",
    email: "",
    password: "",
    DOB: "",
    cell_phone: "",
    mail_address: "",
  });

  const [juridicaData, setJuridicaData] = useState({
    name: "",
    rif: "",
    email: "",
    password: "",
    cell_phone: "",
    mail_address: "",
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

  const normalizeEmail = (email) => email.trim().toLowerCase();

  const persistSession = (payload, fallbackUserType) => {
    const token = payload?.token || payload?.accessToken;
    const user = payload?.user || payload?.data?.user || payload;

    if (token) localStorage.setItem("authToken", token);
    if (user) localStorage.setItem("userData", JSON.stringify(user));

    onAuthSuccess?.({
      token,
      user: {
        ...user,
        userType: user?.userType || fallbackUserType,
      },
    });
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

    try {
      validateRequired(loginData, ["email", "password"]);
      setIsSubmitting(true);
      const payload = await authApi.login({
        email: normalizeEmail(loginData.email),
        password: loginData.password,
      });
      persistSession(payload, "natural");
    } catch (error) {
      setFormError(error.message || "No se pudo iniciar sesión. Revisa tus datos.");
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
        validateRequired(naturalData, ["name", "email", "password", "DOB", "cell_phone", "mail_address"]);
        const payload = await authApi.registerNatural({
          ...naturalData,
          email: normalizeEmail(naturalData.email),
          userType: "natural",
        });
        persistSession(payload, "natural");
      } else {
        validateRequired(juridicaData, ["name", "rif", "email", "password", "cell_phone", "mail_address"]);
        const payload = await authApi.registerJuridica({
          ...juridicaData,
          email: normalizeEmail(juridicaData.email),
          userType: "juridico_pendiente",
        });
        persistSession(payload, "juridico_pendiente");
      }
    } catch (error) {
      setFormError(error.message || "No se pudo crear la cuenta. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <p className="text-sm text-slate-500">
            {mode === "login"
              ? "Accede con tu correo y contraseña"
              : "Selecciona el tipo de usuario y completa los requisitos"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === "login"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600"
            }`}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={() => setMode("register")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              mode === "register"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600"
            }`}
          >
            Registrarse
          </button>
        </div>

        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}

        {mode === "login" && (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <Input
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <Input
                name="password"
                type="password"
                placeholder="********"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Conectando..." : "Iniciar sesión"}
            </Button>
          </form>
        )}

        {mode === "register" && (
          <form className="space-y-5" onSubmit={handleRegisterSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Tipo de usuario
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="natural">Persona natural</option>
                <option value="juridica">Persona jurídica</option>
              </select>
            </div>

            {userType === "natural" && (
              <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Registro de persona natural
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Nombre
                  </label>
                  <Input
                    name="name"
                    placeholder="Nombre completo"
                    value={naturalData.name}
                    onChange={handleNaturalChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Correo electrónico
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={naturalData.email}
                    onChange={handleNaturalChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Contraseña
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="********"
                    value={naturalData.password}
                    onChange={handleNaturalChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Fecha de nacimiento
                  </label>
                  <Input
                    name="DOB"
                    type="date"
                    value={naturalData.DOB}
                    onChange={handleNaturalChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Teléfono
                  </label>
                  <Input
                    name="cell_phone"
                    placeholder="0412-0000000"
                    value={naturalData.cell_phone}
                    onChange={handleNaturalChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Dirección
                  </label>
                  <Input
                    name="mail_address"
                    placeholder="Dirección de habitación"
                    value={naturalData.mail_address}
                    onChange={handleNaturalChange}
                    required
                  />
                </div>
              </div>
            )}

            {userType === "juridica" && (
              <div className="space-y-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Registro de persona jurídica
                </h3>

                <div className="rounded-xl bg-white/70 p-3 text-sm text-slate-600">
                  El tipo de cuenta será asignado por un administrador luego de
                  validar la información de la empresa.
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Nombre o razón social
                  </label>
                  <Input
                    name="name"
                    placeholder="Nombre de la empresa"
                    value={juridicaData.name}
                    onChange={handleJuridicaChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    RIF
                  </label>
                  <Input
                    name="rif"
                    placeholder="J-12345678-9"
                    value={juridicaData.rif}
                    onChange={handleJuridicaChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Correo electrónico
                  </label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="empresa@ejemplo.com"
                    value={juridicaData.email}
                    onChange={handleJuridicaChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Contraseña
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="********"
                    value={juridicaData.password}
                    onChange={handleJuridicaChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Teléfono
                  </label>
                  <Input
                    name="cell_phone"
                    placeholder="0212-0000000"
                    value={juridicaData.cell_phone}
                    onChange={handleJuridicaChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Dirección fiscal
                  </label>
                  <Input
                    name="mail_address"
                    placeholder="Dirección fiscal"
                    value={juridicaData.mail_address}
                    onChange={handleJuridicaChange}
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
        )}

        <Button
          variant="ghost"
          className="w-full text-sm"
          onClick={onBack}
        >
          ← Volver al inicio
        </Button>
      </div>
    </div>
  );
}