// src/pages/LoginPage.jsx

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import { ButtonSpinner } from "../components/Spinner";
import { LogoWithText } from "../components/Logo";
import { extractError } from "../utils/errorHandler";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: "", contraseña: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
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
          <p className="mt-2 text-neutral-600">Inicia sesión en tu cuenta</p>
        </div>

        {/* Formulario */}
        <div className="bg-white py-8 px-6 shadow-soft rounded-2xl sm:px-10 mx-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email/Usuario */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Email o nombre de usuario
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                className="
                  w-full px-4 py-3 border border-neutral-300 rounded-xl
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  transition-colors duration-200
                  placeholder-neutral-400
                "
              />
            </div>

            {/* Campo Contraseña */}
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
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Link a registro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
