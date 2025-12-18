import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/Card";

const featureCards = [
    {
        icon: "/rank-1.svg",
        title: "Classement Auto",
        description: "Suivi automatique de votre rang et de vos points LP à chaque partie, affichage en temps réel des évolutions sur le leaderboard.",
    },
    {
        icon: "/hr-management-1.svg",
        title: "Gestion Challenges",
        description: "Créez, gérez et personnalisez vos challenges en quelques clics, invitez vos amis et lancez la compétition quand vous le souhaitez.",
    },
    {
        icon: "/chart-histogram-1.svg",
        title: "Statistiques",
        description: "Consultez des statistiques détaillées sur vos performances, comparez vos résultats avec vos amis et suivez votre progression au fil du temps.",
    },
];

export function Features() {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-32 max-w-7xl px-0">
            {featureCards.map((card, index) => (
                <div
                    key={index}
                    className="flex flex-col items-start p-8 rounded-2xl border border-white/5 bg-[#1a1a1a] hover:bg-[#202020] hover:border-white/10 transition-all duration-300 group min-h-[280px] justify-between"
                >
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-green-start)]/10 flex items-center justify-center mb-6 group-hover:bg-[var(--color-green-start)]/20 transition-colors border border-white/5">
                        <Image
                            src={card.icon}
                            alt={card.title}
                            width={24}
                            height={24}
                            className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </div>

                    <div>
                        <h3 className="text-white font-bold text-xl mb-3 tracking-tight">
                            {card.title}
                        </h3>

                        <p className="text-white/50 text-base leading-relaxed font-normal">
                            {card.description}
                        </p>
                    </div>
                </div>
            ))}
        </section>
    );
}
