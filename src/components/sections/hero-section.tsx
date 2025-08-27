import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="relative py-20 bg-gradient-hero min-h-[80vh] flex items-center">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-8">
            <AnimatedLogo size="xl" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Gérez vos garages avec
            <span className="block text-white/90">simplicité et efficacité</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/80 max-w-2xl mx-auto leading-relaxed">
            Une solution multi-tenants complète pour la gestion de vos ateliers automobiles, 
            de vos clients et de vos interventions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
            >
              Démarrer maintenant
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Voir la démo
            </Button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-white/80 text-sm">Garages connectés</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-white/80 text-sm">Support disponible</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">99.9%</div>
                <div className="text-white/80 text-sm">Uptime garantie</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}