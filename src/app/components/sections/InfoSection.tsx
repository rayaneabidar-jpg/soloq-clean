import Image from "next/image";

export function InfoSection() {
    return (
        <section className="flex flex-col items-center gap-8 w-full px-8 mt-20 mb-32 max-w-4xl mx-auto text-center">
            <div className="flex flex-col gap-8">
                <p className="text-white/80 text-lg leading-relaxed font-light">
                    Ranking Challenge s’inspire directement de l’esprit et de l’adrénaline du
                    SoloQ Challenge créé par Trayton, qui a réussi à transformer le tryhard de la
                    soloQ en un rendez-vous compétitif suivi par toute la scène francophone. L’idée
                    est de reprendre ce côté événementiel et ultra lisible autour d’un classement
                    vivant, puis de l’adapter à un format pensé pour durer et pour être accessible
                    à encore plus de joueurs.
                </p>

                <p className="text-white/80 text-lg leading-relaxed font-light">
                    Ranking Challenge n’a pas vocation à remplacer le SoloQ Challenge, mais à lui
                    rendre hommage en proposant une expérience complémentaire, construite sur les
                    mêmes bases de compétition, de progression et de storytelling autour des
                    performances des joueurs. Si tu connais déjà le SoloQ Challenge de Trayton, tu
                    retrouveras ici cette même envie de sublimer le grind, avec un site dédié à
                    suivre les classements et les parcours tout au long de l’année.
                </p>
            </div>
        </section>
    );
}
