import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import { extractError } from '../utils/errorHandler';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: '', contraseña: '' });
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
      await login(form);
    } catch (err) {
      setError(extractError(err));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block mb-1">Email o usuario</label>
          <input
            type="text"
            name="identifier"
            value={form.identifier}
            onChange={handleChange}
            //required
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
            //required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <ErrorMessage error={error} />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="text-blue-500 hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
