import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ nombre: '', email: '', contraseña: '', rol: 'estudiante', codigoClase: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {...form };
      if (!payload.codigoClase.trim()) {
        delete payload.codigoClase; // Elimina si está vacío
      }
      await register(payload);
    } catch (err) {
      setError(extractError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block mb-1">Contraseña</label>
          <input
            type="password"
            name="contraseña"
            value={form.contraseña}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block mb-1">Rol</label>
          <select
            name="rol"
            value={form.rol}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
          >
            <option value="estudiante">Estudiante</option>
            <option value="tutor">Tutor</option>
          </select>
        </div>
        {form.rol === 'estudiante' && (
          <div>
            <label className="block mb-1">Código de clase (opcional)</label>
            <input
              type="text"
              name="codigoClase"
              value={form.codigoClase}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
            />
          </div>
        )}
        <ErrorMessage error={error} />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Registrar'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-blue-500 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
