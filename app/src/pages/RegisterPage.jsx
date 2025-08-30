// src/pages/RegisterPage.jsx

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { ButtonSpinner } from "../components/Spinner";
import { LogoWithText } from "../components/Logo";
import { extractError } from "../utils/errorHandler";
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    contraseña: "",
    confirmar: "",
    rol: "estudiante",
    codigoClase: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.contraseña !== form.confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form };
      delete payload.confirmar;
      if (!payload.codigoClase.trim()) {
        delete payload.codigoClase;
      }
      await register(payload);
    } catch (err) {
      setError(extractError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <LogoWithText size="lg" />
          <p className="mt-2 text-neutral-600">
            Únete a nuestra plataforma educativa
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white py-8 px-6 shadow-soft rounded-2xl sm:px-10 mx-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Selector de Rol */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                ¿Qué tipo de cuenta quieres crear?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, rol: "estudiante" }))
                  }
                  className={`
                    flex flex-col items-center p-4 rounded-xl border-2 transition-all
                    ${
                      form.rol === "estudiante"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                    }
                  `}
                >
                  <UserIcon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Estudiante</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rol: "tutor" }))}
                  className={`
                    flex flex-col items-center p-4 rounded-xl border-2 transition-all
                    ${
                      form.rol === "tutor"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                    }
                  `}
                >
                  <AcademicCapIcon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Tutor</span>
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Nombre de usuario
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 border border-neutral-300 rounded-xl
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  transition-colors duration-200
                  placeholder-neutral-400
                "
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 border border-neutral-300 rounded-xl
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  transition-colors duration-200
                  placeholder-neutral-400
                "
              />
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="contraseña"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="contraseña"
                  name="contraseña"
                  type={showPassword ? "text" : "password"}
                  value={form.contraseña}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-colors duration-200
                    placeholder-neutral-400
                  "
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label
                htmlFor="confirmar"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmar"
                  name="confirmar"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmar}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-3 pr-12 border border-neutral-300 rounded-xl
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-colors duration-200
                    placeholder-neutral-400
                  "
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Código de clase (solo para estudiantes) */}
            {form.rol === "estudiante" && (
              <div>
                <label
                  htmlFor="codigoClase"
                  className="block text-sm font-medium text-neutral-700 mb-2"
                >
                  Código de clase{" "}
                  <span className="text-neutral-500">(opcional)</span>
                </label>
                <input
                  id="codigoClase"
                  name="codigoClase"
                  type="text"
                  value={form.codigoClase}
                  onChange={handleChange}
                  className="
                    w-full px-4 py-3 border border-neutral-300 rounded-xl
                    focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                    transition-colors duration-200
                    placeholder-neutral-400
                  "
                  placeholder="Código proporcionado por tu tutor"
                />
              </div>
            )}

            {/* Error Message */}
            {error && <ErrorMessage error={error} />}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full flex justify-center items-center py-3 px-4
                bg-primary-500 hover:bg-primary-600 
                disabled:bg-primary-300 disabled:cursor-not-allowed
                text-white font-medium rounded-xl
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              "
            >
              {loading && <ButtonSpinner />}
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
