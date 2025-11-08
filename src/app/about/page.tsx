export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">À propos</h1>
          <p className="text-gray-400">
            SoloQ Challenge – Créer des tournois League of Legends entre amis
          </p>
        </div>

        {/* Contenu principal */}
        <article className="space-y-6">
          {/* Section 1 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              Qu'est-ce que SoloQ Challenge ?
            </h2>
            <p className="text-gray-300 leading-relaxed">
              SoloQ Challenge est une plateforme web gratuite conçue pour permettre aux joueurs de League of Legends de créer et gérer des mini-tournois (challenges) entre amis, dans la file SoloQ classée.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              La plateforme intègre l'API officielle de Riot Games pour récupérer en temps réel les statistiques de chaque joueur (rang, LP, victoires, défaites, matchs joués) et les intégrer dans un classement automatique.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              Fonctionnalités principales
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Créer des challenges</strong> – Définissez une période, un mode de classement (frais ou existant)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Ajouter des joueurs</strong> – Invitez vos amis par nom d'invocateur ou Riot ID</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Suivi automatique</strong> – Les statistiques se mettent à jour automatiquement</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Classement en temps réel</strong> – Leaderboard avec rang, LP gagnés, W/L, équipe</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 font-bold">✓</span>
                <span><strong>Règles flexibles</strong> – Choisissez le mode de calcul : LP seul, victoires/défaites, rang frais</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              Disclaimer – Important
            </h2>
            <div className="bg-red-950 border border-red-800 rounded p-4 text-red-200">
              <p className="font-semibold mb-2">
                🔴 Projet indépendant – Non affilié à Riot Games
              </p>
              <p className="text-sm leading-relaxed">
                SoloQ Challenge est un projet communautaire non officiel créé par des fans de League of Legends. Il n'est pas affilié à, commandité par, ou approuvé par Riot Games, Inc. ou ses filiales.
              </p>
              <p className="text-sm leading-relaxed mt-2">
                League of Legends, Riot Games et tous les logos associés sont des marques déposées de Riot Games, Inc.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              Utilisation de l'API Riot Games
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Cette application utilise l'API officielle de Riot Games (API Key de développeur) pour récupérer les données publiques des joueurs, matchs, et rangés. Aucune donnée personnelle n'est stockée sans consentement explicite.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Conformément aux conditions d'utilisation de l'API Riot Games, cette plateforme :
            </p>
            <ul className="space-y-2 text-gray-300 mt-3 text-sm">
              <li>📌 N'utilise que les données publiques (rangé, matchs, statistiques)</li>
              <li>📌 Respecte les limites de requêtes (rate limiting)</li>
              <li>📌 Ne cache, vend, ou revend aucune donnée Riot</li>
              <li>📌 Est transparent sur son fonctionnement</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              Règles d'utilisation
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li>
                ✓ <strong>Autorisé</strong> – Créer des challenges avec vos amis, partager des résultats, utiliser gratuitement
              </li>
              <li>
                ❌ <strong>Interdit</strong> – Accumuler des comptes LoL achetés, utiliser des bots pour jouer, chercher à tricher
              </li>
              <li>
                ❌ <strong>Interdit</strong> – Revendre les données ou accès, utiliser à but commercial sans accord
              </li>
              <li>
                ❌ <strong>Interdit</strong> – Violer les conditions de service de Riot Games ou League of Legends
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              Contact & Support
            </h2>
            <p className="text-gray-300">
              Des questions ? Des problèmes ? N'hésitez pas à nous contacter.
            </p>
            <p className="text-gray-400 mt-3">
              Email : <a href="mailto:support@example.com" className="text-blue-400 hover:underline">
                support@example.com
              </a>
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
