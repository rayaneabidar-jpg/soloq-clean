import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Hero */}
        <section className="py-12 text-center">
          <h1 className="text-5xl font-bold mb-4">🎮 SoloQ Challenge</h1>
          <p className="text-xl text-gray-300 mb-6">
            Créez des mini-tournois League of Legends entre amis
          </p>
          <p className="text-gray-400 mb-8">
            Suivi automatique des rangs, LP gagnés, et classement en temps réel
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/challenges"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold"
            >
              Voir mes Challenges
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 font-semibold"
            >
              Se Connecter
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">📊 Classement Auto</h3>
            <p className="text-gray-400">
              Suivi automatique des rangs et LP en temps réel
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">👥 Gestion Équipes</h3>
            <p className="text-gray-400">
              Créez et gérez vos challenges facilement
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">🎯 Rapports</h3>
            <p className="text-gray-400">
              Consultez les statistiques détaillées
            </p>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-12 bg-red-950 border border-red-800 rounded-lg p-6 mt-12">
          <p className="text-red-200">
            <strong>⚠️ Disclaimer :</strong> Projet indépendant non affilié à Riot Games.
            <Link href="/about" className="underline ml-2 text-red-100">
              En savoir plus
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
