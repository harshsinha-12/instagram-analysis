import { MarketingNavbar } from "@/components/MarketingNavbar";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { FeatureCards } from "@/components/FeatureCards";
import { AnalyzerForm } from "@/components/AnalyzerForm";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <FeatureCards />
        <AnalyzerForm />
      </main>
      
      <footer className="border-t border-line py-12 text-center text-sm text-muted">
        <p>© {new Date().getFullYear()} Creative Intelligence Agent. All rights reserved.</p>
      </footer>
    </div>
  );
}
