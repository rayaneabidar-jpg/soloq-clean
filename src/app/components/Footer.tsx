import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-8 px-6 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Colonne 1: À propos */}
          <div>
            <h3 className="text-white font-semibold mb-3">À propos</h3>
            <p className="text-gray-400 text-sm mb-3">
              SoloQ Challenge est une plateforme communautaire pour créer des mini-tournois League of Legends entre amis.
            </p>
            <p className="text-gray-500 text-xs">
              Projet indépendant, non affilié à Riot Games.
            </p>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/challenges" className="text-gray-400 hover:text-blue-400">
                  Mes Challenges
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-blue-400">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-blue-400">
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3: Légal */}
          <div>
            <h3 className="text-white font-semibold mb-3">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-blue-400">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-blue-400">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <a href="mailto:contact@example.com" className="text-gray-400 hover:text-blue-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne du bas */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; 2025 SoloQ Challenge. Tous droits réservés.</p>
          <p className="mt-3 md:mt-0">
            Projet communautaire • Non affilié à Riot Games
          </p>
        </div>
      </div>
    </footer>
  );
}
