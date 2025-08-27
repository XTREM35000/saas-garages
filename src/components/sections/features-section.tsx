import { FeatureCard } from "@/components/ui/feature-card";
import { Building2, Users, Car, FileText, BarChart3, Shield } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Building2 className="w-6 h-6 text-primary" />,
      title: "Multi-tenants",
      description: "Gérez plusieurs garages indépendants avec une seule plateforme centralisée."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: "Gestion d'équipe",
      description: "Organisez votre personnel avec des rôles et permissions personnalisés."
    },
    {
      icon: <Car className="w-6 h-6 text-primary" />,
      title: "Suivi véhicules",
      description: "Historique complet des interventions et maintenance pour chaque véhicule."
    },
    {
      icon: <FileText className="w-6 h-6 text-primary" />,
      title: "Facturation",
      description: "Générez devis et factures automatiquement avec suivi des paiements."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: "Analytics",
      description: "Tableaux de bord en temps réel pour optimiser votre activité."
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Sécurisé",
      description: "Protection des données avec chiffrement et sauvegardes automatiques."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Une suite complète d'outils pour gérer efficacement votre garage automobile
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}