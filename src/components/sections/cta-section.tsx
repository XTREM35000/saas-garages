import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export function CTASection() {
  const benefits = [
    "Configuration en moins de 5 minutes",
    "Support technique inclus",
    "Données sécurisées et sauvegardées",
    "Aucun engagement, résiliable à tout moment"
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container">
        <Card className="max-w-4xl mx-auto bg-white shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Prêt à transformer votre garage ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez les centaines de garages qui utilisent déjà GarageFlow 
              pour optimiser leur activité et satisfaire leurs clients.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 text-left">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-lg shadow-elegant transition-all duration-300 px-8 py-4 text-lg"
              >
                Commencer gratuitement
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 text-lg border-primary text-primary hover:bg-primary/5"
              >
                Planifier une démo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Essai gratuit de 14 jours • Aucune carte bancaire requise
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}