export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
          <p className="text-gray-400">
            Dernière mise à jour : octobre 2025
          </p>
        </div>

        {/* Contenu */}
        <article className="space-y-6 text-gray-300">
          {/* Section 1 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              1. Introduction
            </h2>
            <p>
              SoloQ Challenge (« nous », « notre ») est engagé à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, et protégeons vos données personnelles.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              2. Données que nous collectons
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">Données d'authentification</h3>
                <p className="text-sm">
                  Email, mot de passe (hashé), ID utilisateur – pour créer et gérer votre compte via Supabase
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">Données League of Legends</h3>
                <p className="text-sm">
                  Noms d'invocateurs, PUUID, rang, LP, victoires, défaites, matchs – récupérés via l'API Riot Games (données publiques)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">Métadonnées de challenge</h3>
                <p className="text-sm">
                  Challenges créés, joueurs ajoutés, historique des snapshots – stockés dans notre base de données
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-300 mb-2">Logs techniques</h3>
                <p className="text-sm">
                  Adresse IP, navigateur, erreurs – pour debug et amélioration de la plateforme
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              3. Utilisation des données
            </h2>
            <ul className="space-y-2 text-sm">
              <li>✓ Fournir et maintenir la plateforme</li>
              <li>✓ Afficher les classements et statistiques dans les challenges</li>
              <li>✓ Améliorer et optimiser le service</li>
              <li>✓ Vous envoyer des notifications (si applicable)</li>
              <li>✓ Respecter les obligations légales et réglementaires</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              4. Partage de données
            </h2>
            <p className="text-sm">
              Nous ne vendons, n'échangeons, et ne partageons <strong>jamais</strong> vos données personnelles avec des tiers, sauf :
            </p>
            <ul className="space-y-2 text-sm mt-3">
              <li>📌 <strong>Riot Games API</strong> – Données publiques uniquement (pas d'email, pas de mot de passe)</li>
              <li>📌 <strong>Supabase</strong> – Nos prestataires d'hébergement et d'authentification</li>
              <li>📌 <strong>Obligation légale</strong> – Si exigé par la loi</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              5. Durée de conservation des données
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <strong>Compte actif</strong> – Les données sont conservées tant que votre compte existe
              </li>
              <li>
                <strong>Données de challenge</strong> – Conservées 1 an après la fin du challenge, puis supprimées
              </li>
              <li>
                <strong>Données Riot Games</strong> – Snapshots conservés 6 mois pour historique, puis supprimés
              </li>
              <li>
                <strong>Logs techniques</strong> – Conservés 30 jours, puis supprimés automatiquement
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              6. Vos droits RGPD
            </h2>
            <p className="text-sm mb-3">
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous avez le droit de :
            </p>
            <ul className="space-y-2 text-sm">
              <li>✓ <strong>Accès</strong> – Demander une copie de vos données</li>
              <li>✓ <strong>Rectification</strong> – Corriger vos données inexactes</li>
              <li>✓ <strong>Suppression</strong> – Demander la suppression de vos données (« droit à l'oubli »)</li>
              <li>✓ <strong>Portabilité</strong> – Exporter vos données dans un format lisible</li>
              <li>✓ <strong>Opposition</strong> – Vous opposer à certains traitements</li>
            </ul>
            <p className="text-sm mt-3">
              Pour exercer ces droits, contactez-nous à : <strong>privacy@example.com</strong>
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              7. Sécurité des données
            </h2>
            <p className="text-sm">
              Nous utilisons le chiffrement SSL/TLS pour protéger les données en transit. Les mots de passe sont hashés et salés. Les données sensibles sont stockées chez Supabase, qui respecte les normes de sécurité internationales.
            </p>
            <p className="text-sm mt-3 text-yellow-400">
              ⚠️ Aucun système n'est 100% sécurisé. Nous vous recommandons d'utiliser un mot de passe fort et unique.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              8. Modifications de cette politique
            </h2>
            <p className="text-sm">
              Nous pouvons mettre à jour cette politique de confidentialité à tout moment. Les modifications importantes seront affichées sur notre plateforme avec un avis préalable.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-3 text-blue-400">
              9. Contact
            </h2>
            <p className="text-sm">
              Questions sur cette politique ? Contactez-nous :
            </p>
            <p className="text-sm mt-3">
              Email : <a href="mailto:privacy@example.com" className="text-blue-400 hover:underline">
                privacy@example.com
              </a>
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
