"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [web3User, setWeb3User] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser.wallet || !parsedUser.pda) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      setWeb3User(parsedUser);
    } catch (error) {
      localStorage.removeItem("user");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando sesión Web3...</p>
      </div>
    );
  }

  if (!web3User) return null;

  return <>{children}</>;
}

