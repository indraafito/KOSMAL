import { Hero } from "@/components/kosmal/Hero";
import { Stats } from "@/components/kosmal/Stats";
import { Recommendations } from "@/components/kosmal/Recommendations";
import { Comparison } from "@/components/kosmal/Comparison";
import { Features } from "@/components/kosmal/Features";
import { Areas } from "@/components/kosmal/Areas";
import { CtaBanner } from "@/components/kosmal/CtaBanner";

export function Home() {
  return (
    <div>
      <Hero />
      <Stats />
      <Recommendations />
      <Comparison />
      <Features />
      <Areas />
      <CtaBanner />
    </div>
  );
}
