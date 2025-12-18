// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
// Using inline avatar for now

// Actually I don't have Avatar component in current project. I should use simple div or create one.
// The reference used @/components/ui/avatar. I should probably just implement it inline or create the component.
// For now inline to save steps or use a simple placeholder.
// I will implement a basic replacement for Avatar inline.

const leaderboardData = [
    { position: 1, player: { name: "Caps", team: "G2 Esport" }, initialRank: "Challenger 1403 LP", wins: 0, losses: 0, lpGained: 0, currentRank: "Challenger 1403 LP" },
    { position: 1, player: { name: "Caps", team: "G2 Esport" }, initialRank: "Challenger 1403 LP", wins: 0, losses: 0, lpGained: 0, currentRank: "Challenger 1403 LP" },
    { position: 1, player: { name: "Caps", team: "G2 Esport" }, initialRank: "Challenger 1403 LP", wins: 0, losses: 0, lpGained: 0, currentRank: "Challenger 1403 LP" },
    { position: 1, player: { name: "Caps", team: "G2 Esport" }, initialRank: "Challenger 1403 LP", wins: 0, losses: 0, lpGained: 0, currentRank: "Challenger 1403 LP" },
    { position: 1, player: { name: "Caps", team: "G2 Esport" }, initialRank: "Challenger 1403 LP", wins: 0, losses: 0, lpGained: 0, currentRank: "Challenger 1403 LP" },
];

export function LeaderboardPreview() {
    return (
        <section className="w-full mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <div className="w-full flex justify-start pl-4 mb-4">
                <p className="text-white/30 text-lg">Exemple de LeaderBoard :</p>
            </div>

            <div className="flex flex-col w-full rounded-lg overflow-hidden shadow-2xl bg-[#1a1a1a] border border-white/5">
                {/* Header */}
                <div className="grid grid-cols-[60px_2fr_1.5fr_1fr_1fr_1fr_1.5fr] items-center gap-4 px-6 py-3 bg-gradient-to-b from-[var(--color-green-start)] to-[var(--color-green-end)] border-b border-white/5">
                    <div className="text-sm text-center font-normal text-white/90">#</div>
                    <div className="text-sm font-normal text-white/90">Joueur</div>
                    <div className="text-sm font-normal text-white/90">Rank initial</div>
                    <div className="text-sm text-center font-normal text-white/90">Victoires</div>
                    <div className="text-sm text-center font-normal text-white/90">Défaites</div>
                    <div className="text-sm text-center font-normal text-white/90">Lp gagnés</div>
                    <div className="text-sm font-normal text-white/90">Rank</div>
                </div>

                {/* Rows with Fade Mask */}
                <div
                    className="flex flex-col bg-[#111111]"
                    style={{ maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)" }}
                >
                    {leaderboardData.map((entry, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[60px_2fr_1.5fr_1fr_1fr_1fr_1.5fr] items-center gap-4 px-6 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default"
                        >
                            <div className="flex items-center justify-center">
                                <span className="text-[#00D1FF] text-xs font-medium">
                                    {entry.position}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Avatar Placeholder */}
                                <div className="w-10 h-10 border border-white/10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-white/50 text-xs">
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-white text-sm font-medium">
                                        {entry.player.name}
                                    </div>
                                    <div className="text-white/40 text-[10px]">
                                        {entry.player.team}
                                    </div>
                                </div>
                            </div>

                            <div className="text-white/70 text-sm font-normal">
                                {entry.initialRank}
                            </div>
                            <div className="text-white/70 text-sm font-normal text-center">
                                {entry.wins}
                            </div>
                            <div className="text-white/70 text-sm font-normal text-center">
                                {entry.losses}
                            </div>
                            <div className="text-white/70 text-sm font-normal text-center">
                                {entry.lpGained}
                            </div>
                            <div className="text-white/70 text-sm font-normal">
                                {entry.currentRank}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
