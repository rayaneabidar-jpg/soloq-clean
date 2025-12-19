"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image"; // Added import
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/Button";
import { User } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const isHome = pathname === "/";
  // Check if active on user challenges pages
  const isUserChallenges = pathname?.startsWith("/challenges") && pathname !== "/challenges/new" && !pathname.match(/\/challenges\/[a-z0-9-]+$/);
  // Explicitly: List page is /challenges. My Challenges might be filtered there.
  // User requirement: "Mes challenges" button.
  // In my app, /challenges IS the list. 
  // Logic: "isUserChallenges = pathname.startsWith('/mes-challenges') || pathname === '/challenges/mes'" -> User example.
  // In my existing routing, I have "/challenges" which is the list. 
  // Let's assume "/challenges" is what they mean by "Mes Challenges" (or "Listes des challenges").
  // But wait, the user instructions say: 
  // "CONNECTÉ : - Home : logo + 'Mes challenges' ... - Autres pages : ... + 'Mes challenges'"
  // So "Mes Challenges" link always points to "/challenges"? 
  // Previous code had: `{pathname !== "/challenges" && <Link href="/challenges">Mes Challenges</Link>}`
  // New requirement says: Shows "Mes challenges" everywhere (except maybe if already there? User snippet didn't exclude it, just highlighted it).
  // "className={`btn-secondary ${isUserChallenges ? 'bg-primary/20 ...' : ''}`}"
  // I'll stick to pointing to `/challenges` and highlighting it if we are there.

  const isChallengesList = pathname === "/challenges";

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
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

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
        {/* Logo + Title (Title hidden on Home) */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/icons/logo.svg" alt="Ranking Challenge" width={32} height={32} className="w-8 h-8" />
          {!isHome && (
            <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
              Ranking Challenge
            </span>
          )}
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* "Créer" button: ONLY if NOT Home */}
              {!isHome && (
                <Link href="/challenges/new" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white font-normal hover:bg-white/5 transition-all">
                    Créer un challenge
                  </Button>
                </Link>
              )}
              {/* Mobile shorthand for Create? User said "Mobile création (version safe)". 
                   The user prompt for Header said: "Home : ... (PAS 'Créer un challenge' ...). Autres pages: ... 'Créer un challenge'".
                   Does not explicitly ask for mobile optimization here in Step 1, but previously I did.
                   "Header : Logique intelligente (SANS duplication)".
                   I will keep "Créer" hidden on mobile if space is tight, OR just text "Créer". 
                   Let's stick to the User Snippet strictly if possible. 
                   User Snippet: `<Link href="/challenges/new" className="btn-primary">Créer un challenge</Link>`
                   I will add a mobile icon button for Create if !isHome.
               */}
              {!isHome && (
                <Link href="/challenges/new" className="sm:hidden">
                  <Button variant="ghost" size="icon" className="text-white">
                    <span className="text-xl">+</span>
                  </Button>
                </Link>
              )}

              {/* "Mes challenges" button: Always visible (except maybe if space issues, but user wants it). 
                  Highlight if active. */}
              <Link href="/challenges">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all font-normal ${isChallengesList ? 'bg-white/10 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="hidden sm:inline">Mes Challenges</span>
                  <span className="sm:hidden">Challenges</span>
                </Button>
              </Link>

              {/* Account / User Menu */}
              <div className="relative group py-2">
                <button className="w-9 h-9 bg-[var(--color-green-start)] rounded-md flex items-center justify-center text-white hover:opacity-90 transition-all shadow-lg shadow-emerald-900/20 ring-2 ring-white/5">
                  <User size={16} />
                </button>
                <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                    <div className="px-4 py-3 text-xs text-gray-500 border-b border-white/5 bg-white/[0.02]">
                      Connecté en tant que <br />
                      <span className="text-white font-medium truncate block mt-0.5">{user.email}</span>
                    </div>

                    {/* Menu Items */}
                    <Link href="/challenges/new" className="block px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors sm:hidden">
                      Créer un challenge
                    </Link>

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
            // Disconnected: Always show Connection
            <Link href="/auth/login">
              <Button size="sm" className="bg-[var(--color-green-start)] hover:bg-[var(--color-green-end)] text-white px-6 rounded-lg font-medium shadow-lg shadow-emerald-900/20">
                Connexion
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
