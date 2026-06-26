import GridBackground from "@/components/GridBackground";
import Hero from "@/components/Hero";
import Playground from "@/components/Playground";
import ModelDetails from "@/components/ModelDetails";

const Index = () => {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <GridBackground />
      <Hero />
      <Playground />
      <ModelDetails />
      <footer className="border-t border-border px-6 py-8 text-center">
        <p className="font-mono text-xs text-muted-foreground">
          Built with purpose. Verilog-Coder-3B © {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
};

export default Index;
