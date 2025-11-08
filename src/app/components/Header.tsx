"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    }
    getUser();
  }, []);

  if (loading) return null;

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white">
          🎮 SoloQ Challenge
        </Link>

        <nav className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-green-400 text-sm">
                ✅ Connecté : {user.email}
              </span>
              <Link href="/challenges" className="text-blue-400 hover:underline">
                Mes Challenges
              </Link>
                <button
                onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/"; // Force refresh
                }}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 text-sm"
                >
                Déconnexion
                </button>

            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-blue-400 hover:underline">
                Connexion
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
