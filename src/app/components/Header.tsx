"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/Button";
import { User } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // if (loading) return null; // Avoid layout shift, maybe show skeleton or just render header without user info first

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <span className="text-black font-bold text-lg">R</span>
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">Ranking Challenge</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/challenges/new">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white font-normal hover:bg-white/5 transition-all">
                  Créer un challenge
                </Button>
              </Link>

              {/* Show "Mes Challenges" only if NOT on /challenges (list) */}
              {pathname !== "/challenges" && (
                <Link href="/challenges">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white font-normal hover:bg-white/5 transition-all">
                    Mes Challenges
                  </Button>
                </Link>
              )}

              <div className="relative group py-2">
                <button className="w-9 h-9 bg-[var(--color-green-start)] rounded-md flex items-center justify-center text-white hover:opacity-90 transition-all shadow-lg shadow-emerald-900/20 ring-2 ring-white/5">
                  <User size={16} />
                </button>
                <div className="absolute right-0 top-full pt-1 w-56 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="px-4 py-3 text-xs text-gray-500 border-b border-white/5 bg-white/[0.02]">
                      Connecté en tant que <br />
                      <span className="text-white font-medium truncate block mt-0.5">{user.email}</span>
                    </div>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = "/";
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Show Connexion if NOT on Home (Hero has it) AND NOT on Auth pages
            pathname !== "/" && !pathname?.startsWith("/auth") && (
              <Link href="/auth/login" className="ml-2">
                <Button size="sm" className="bg-[var(--color-green-start)] hover:bg-[var(--color-green-end)] text-white px-6 rounded-lg font-medium shadow-lg shadow-emerald-900/20">
                  Connexion
                </Button>
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
