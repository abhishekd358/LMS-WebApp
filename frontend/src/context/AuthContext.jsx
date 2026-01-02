import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState();

  const loginHandler = async(email, password) => {
    // In a real app, this would make an API call
    const {data} = await axiosInstance.post('/auth/login', {email, password})
    console.log(data.message)
    const userData = { email, password };
    setUser(userData);
  };

  const registerHandler = async (email, password, name) => {
    console.log('from registerHandlre', email, password, name)
    // In a real app, this would make an API call
   const {data} = await axiosInstance.post('/auth/register', {email:email, password:password, name:name})
    console.log(data.message)
    const userData = { email, name, password};
    setUser(userData);
  };

  const logout = async() => {
    const {data} = await axiosInstance.delete('/auth/logout')
    setUser(null)
    alert(data.message)

  };

  return (
    <AuthContext.Provider value={{ user, loginHandler, registerHandler, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
