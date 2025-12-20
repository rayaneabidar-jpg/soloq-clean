import { Hero } from "./components/sections/Hero";
import { LeaderboardPreview } from "./components/sections/LeaderboardPreview";
import { Features } from "./components/sections/Features";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <Hero />
      <LeaderboardPreview />
      <Features />
    </div>
  );
}
