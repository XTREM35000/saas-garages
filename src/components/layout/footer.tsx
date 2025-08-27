import { AnimatedLogo } from "@/components/ui/animated-logo";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <AnimatedLogo size="sm" />
              <div>
                <h3 className="font-bold text-foreground">GarageFlow</h3>
                <p className="text-xs text-muted-foreground">Garage Management</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Solution complète pour la gestion de garages automobiles multi-tenants.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Produit</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tarifs</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Démo</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Intégrations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Entreprise</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Carrières</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Partenaires</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 GarageFlow. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}