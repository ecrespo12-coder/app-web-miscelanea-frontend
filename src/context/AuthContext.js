import React, { createContext, useContext, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(authService.getUsuario());
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const login = async (correo, contrasena) => {
    setCargando(true);
    setError(null);
    try {
      const data = await authService.login(correo, contrasena);
      setUsuario(data.usuario);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
      setError(msg);
      throw new Error(msg);
    } finally {
      setCargando(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
  };

  const tieneRol = (...roles) => roles.includes(usuario?.rol);

  return (
    <AuthContext.Provider value={{ usuario, cargando, error, login, logout, tieneRol }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
