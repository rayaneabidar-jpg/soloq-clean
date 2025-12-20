const DDRAGON_VERSION = "14.24.1";

const leaderboardData = [
    { position: 1, player: { displayName: "Canna", team: "Karmine Corp", profileIconId: 6632 }, initialRank: "Challenger 1000 LP", wins: 15, losses: 5, lpGained: 250, currentRank: "Challenger 1250 LP" },
    { position: 2, player: { displayName: "Caliste", team: "Karmine Corp", profileIconId: 588 }, initialRank: "Challenger 900 LP", wins: 12, losses: 4, lpGained: 180, currentRank: "Challenger 1080 LP" },
    { position: 3, player: { displayName: "BrokenBlade", team: "G2 Esports", profileIconId: 6335 }, initialRank: "Challenger 1100 LP", wins: 10, losses: 8, lpGained: 50, currentRank: "Challenger 1150 LP" },
    { position: 4, player: { displayName: "Supa", team: "Movistar KOI", profileIconId: 4402 }, initialRank: "Challenger 850 LP", wins: 14, losses: 16, lpGained: -15, currentRank: "Challenger 835 LP" },
    { position: 5, player: { displayName: "Caps", team: "G2 Esports", profileIconId: 512 }, initialRank: "Challenger 1400 LP", wins: 8, losses: 8, lpGained: 0, currentRank: "Challenger 1400 LP" },
];

export function LeaderboardPreview() {
    return (
        <section className="w-full mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            <div className="w-full flex justify-start pl-4 mb-4">
                <p className="text-white/30 text-lg">Exemple de LeaderBoard :</p>
            </div>

            <div className="flex flex-col w-full rounded-lg overflow-hidden shadow-2xl bg-[#1a1a1a] border border-white/5">
                {/* Header */}
                <div className="grid grid-cols-[50px_1fr_1fr] md:grid-cols-[60px_2fr_1.5fr_1fr_1fr_1fr_1.5fr] items-center gap-4 px-4 md:px-6 py-3 bg-gradient-to-b from-[var(--color-green-start)] to-[var(--color-green-end)] border-b border-white/5">
                    <div className="text-sm text-center font-normal text-white/90">#</div>
                    <div className="text-sm font-normal text-white/90">Joueur</div>
                    <div className="text-sm font-normal text-white/90">Rank</div>
                    <div className="hidden md:block text-sm text-center font-normal text-white/90">Victoires</div>
                    <div className="hidden md:block text-sm text-center font-normal text-white/90">Défaites</div>
                    <div className="hidden md:block text-sm text-center font-normal text-white/90">Lp gagnés</div>
                    <div className="hidden md:block text-sm font-normal text-white/90 text-right">Rank initial</div>
                </div>

                {/* Rows with Fade Mask */}
                <div
                    className="flex flex-col bg-[#111111]"
                    style={{ maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)" }}
                >
                    {leaderboardData.map((entry, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-[50px_1fr_1fr] md:grid-cols-[60px_2fr_1.5fr_1fr_1fr_1fr_1.5fr] items-center gap-4 px-4 md:px-6 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default"
                        >
                            <div className="flex items-center justify-center">
                                <span className="text-[#00D1FF] text-xs font-medium">
                                    {entry.position}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Profile Icon */}
                                <div className="w-8 h-8 md:w-10 md:h-10 border border-white/10 rounded-full bg-[#2a2a2a] overflow-hidden shrink-0">
                                    <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${entry.player.profileIconId}.png`}
                                        alt={entry.player.displayName}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <div className="text-white text-sm font-medium truncate">
                                        {entry.player.displayName}
                                    </div>
                                    <div className="text-white/40 text-[10px] truncate">
                                        {entry.player.team}
                                    </div>
                                </div>
                            </div>

                            <div className="text-white/70 text-sm font-normal truncate">
                                {entry.currentRank}
                            </div>
                            <div className="hidden md:block text-white/70 text-sm font-normal text-center">
                                {entry.wins}
                            </div>
                            <div className="hidden md:block text-white/70 text-sm font-normal text-center">
                                {entry.losses}
                            </div>
                            <div className={`hidden md:block text-sm font-medium text-center ${entry.lpGained > 0 ? 'text-green-400' : entry.lpGained < 0 ? 'text-red-400' : 'text-white/70'}`}>
                                {entry.lpGained > 0 ? `+${entry.lpGained}` : entry.lpGained}
                            </div>
                            <div className="hidden md:block text-white/70 text-sm font-normal text-right truncate">
                                {entry.initialRank}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
