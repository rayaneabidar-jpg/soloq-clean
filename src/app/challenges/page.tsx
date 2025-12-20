"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { ArrowUpDown, Trash2, User, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { getDisplayNameFromRiotId } from "@/lib/utils";

type PlayerSummary = {
  id: string;
  name: string;
  profile_icon_id: number | null;
};

type Challenge = {
  id: string;
  name: string;
  start_at: string;
  end_at: string | null;
  visibility: string;
  mode: string;
  ranking_rule: string;
  owner_id: string;
  created_at: string;
  players: PlayerSummary[];
};

export default function ChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [expandedChallenges, setExpandedChallenges] = useState<Set<string>>(new Set());
  const [ddragonVersion, setDdragonVersion] = useState("14.24.1");

  useEffect(() => {
    fetch("https://ddragon.leagueoflegends.com/api/versions.json")
      .then(r => r.json())
      .then(versions => {
        if (versions && versions.length > 0) {
          setDdragonVersion(versions[0]);
        }
      })
      .catch(e => console.error("Failed to fetch ddragon version", e));
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        setUser(sessionData.session?.user || null);

        const res = await fetch("/api/challenges", {
          cache: "no-store",
        });
        const json = await res.json();
        setChallenges(json.challenges || []);
      } catch (e) {
        console.error("Error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-8 mt-4 pb-6">
        <h1 className="text-4xl font-bold text-white">Listes des challenges :</h1>

        <div className="flex gap-4">
          <Button variant="ghost" size="icon" className="border border-white/10 text-white/50 hover:text-white">
            <ArrowUpDown size={18} />
          </Button>
        </div>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1a1a]/50 rounded-xl border border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/20">
            <Trophy size={32} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun challenge trouvé</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto text-sm">Il n'y a pas encore de challenge actif.</p>
          {user && (
            <Link href="/challenges/new">
              <Button variant="gold" size="lg" className="px-8 text-base">Créer un challenge</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              className="relative group h-full"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Main Card Link - z-10 to be on top of background but below interactive buttons */}
              <Link href={`/challenges/${challenge.id}`} className="absolute inset-0 z-10 rounded-xl" />

              {/* Delete Button - z-20 to be on top of Link */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-5 right-5 z-20 h-8 px-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (!confirm("Voulez-vous vraiment supprimer ce challenge ?")) return;

                  try {
                    const { data: sessionData } = await supabase.auth.getSession();
                    const token = sessionData.session?.access_token;
                    if (!token) {
                      alert("Vous devez être connecté");
                      return;
                    }

                    const res = await fetch(`/api/challenges/${challenge.id}`, {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });

                    if (!res.ok) {
                      const json = await res.json();
                      throw new Error(json.error || "Erreur lors de la suppression");
                    }

                    setChallenges((prev) => prev.filter((c) => c.id !== challenge.id));
                  } catch (err: any) {
                    alert("Erreur: " + err.message);
                  }
                }}
              >
                <Trash2 size={16} />
              </Button>

              {/* Card - Content needs to be z-0 or z-20 depending on interactivity */}
              <Card className={`h-full bg-[#1a1a1a] border border-white/5 group-hover:border-white/20 group-hover:bg-[#202020] transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:shadow-black/50 p-5 flex flex-col justify-between relative z-0 ${expandedChallenges.has(challenge.id) ? 'bg-[#202020] border-white/20' : ''}`}>
                <div className="flex-1">
                  <div className="flex flex-row items-start justify-between mb-4 relative z-0">
                    <h3 className="text-lg font-bold text-white leading-tight pr-8 group-hover:text-[var(--color-green-start)] transition-colors pointer-events-none">
                      {challenge.name}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm text-white/50 mb-6 font-light pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span>Période :</span>
                      <span className="text-white">
                        {new Date(challenge.start_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        {challenge.end_at ? ` - ${new Date(challenge.end_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}` : " - Illimité"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mode :</span>
                      <span className="text-white uppercase font-medium bg-white/5 px-2 py-0.5 rounded text-xs">{challenge.mode}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <div
                    className="flex justify-between items-center pt-4 border-t border-white/5 relative z-20 cursor-pointer group/players"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const newExpanded = new Set(expandedChallenges);
                      if (newExpanded.has(challenge.id)) {
                        newExpanded.delete(challenge.id);
                      } else {
                        newExpanded.add(challenge.id);
                      }
                      setExpandedChallenges(newExpanded);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {challenge.players?.slice(0, 3).map((p, i) => (
                          <div key={p.id} className="w-7 h-7 rounded-full border-2 border-[#1a1a1a] bg-[#2a2a2a] overflow-hidden flex-shrink-0 relative" style={{ zIndex: 3 - i }}>
                            {p.profile_icon_id ? (
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${p.profile_icon_id}.png`}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#333]">
                                <User size={12} className="text-white/30" />
                              </div>
                            )}
                          </div>
                        ))}
                        {(!challenge.players || challenge.players.length === 0) && (
                          <div className="w-7 h-7 rounded-full border-2 border-[#1a1a1a] bg-[#2a2a2a] flex items-center justify-center">
                            <User size={12} className="text-white/20" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/40 group-hover/players:text-[var(--color-green-start)] transition-colors">
                        {challenge.players?.length > 3 ? `+${challenge.players.length - 3} joueurs` :
                          challenge.players?.length > 0 ? `${challenge.players.length} joueur${challenge.players.length > 1 ? 's' : ''}` :
                            "Aucun joueur"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Player List */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedChallenges.has(challenge.id) ? 'max-h-60 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-2 py-2 border-t border-white/5">
                      {challenge.players?.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0">
                            {p.profile_icon_id ? (
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/profileicon/${p.profile_icon_id}.png`}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#333]">
                                <User size={10} className="text-white/30" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-white/80 font-medium truncate">
                            {getDisplayNameFromRiotId(p.name)}
                          </span>
                        </div>
                      ))}
                      {challenge.players?.length > 0 && (
                        <div className="pt-2">
                          <Link href={`/challenges/${challenge.id}`} className="block">
                            <Button variant="ghost" size="sm" className="w-full text-xs text-white/40 hover:text-white hover:bg-white/5 h-8">
                              Voir le classement complet
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Link href={`/challenges/${challenge.id}`} className="relative z-20">
                      <Button variant="ghost" size="sm" className="text-white/50 hover:text-white rounded-full px-4 text-xs border border-white/10 bg-transparent hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                        Ouvrir
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          ))
          }
        </div >
      )}
    </div >
  );
}
