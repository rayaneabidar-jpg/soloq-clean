import { Hero } from "./components/sections/Hero";
import { LeaderboardPreview } from "./components/sections/LeaderboardPreview";
import { Features } from "./components/sections/Features";
import { InfoSection } from "./components/sections/InfoSection";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <Hero />
      <LeaderboardPreview />
      <InfoSection />
      <Features />
    </div>
  );
}
