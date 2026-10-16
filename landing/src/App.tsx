import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { WorkspaceShowcase } from '@/components/WorkspaceShowcase';
import { HowItWorks } from '@/components/HowItWorks';
import { Benefits } from '@/components/Benefits';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';
import { Footer } from '@/components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <main>
        <Hero />
        <Features />
        <WorkspaceShowcase />
        <HowItWorks />
        <Benefits />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
