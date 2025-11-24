import { createContext, useContext, useState, type ReactNode } from "react";
import { type User } from "../services/auth/auth.types"; // Tu interfaz de usuario

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user_data");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData: User, token: string) => {
    localStorage.setItem("jwt_token", token);
    localStorage.setItem("user_data", JSON.stringify(userData));
    setUser(userData);
  };

  // 3. Función Logout: Limpia ambos
  const logout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Booleano derivado
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
