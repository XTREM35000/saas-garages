import { AnimatedLogo } from "@/components/ui/animated-logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { useAuth } from "@/hooks/useAuth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Home, Users, Car, Wrench, Package } from "lucide-react";

interface HeaderProps {
  onAuthClick?: () => void;
}

export function Header({ onAuthClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <AnimatedLogo size="sm" />
          <div>
            <h1 className="text-xl font-bold text-foreground">GarageFlow</h1>
            <p className="text-xs text-muted-foreground">Multi-Tenant Garage Management</p>
          </div>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Accueil</span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Clients</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      <div className="grid gap-1">
                        <h4 className="font-medium leading-none">Gestion des clients</h4>
                        <p className="text-sm text-muted-foreground">
                          Gérez vos clients et leur historique
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <a
                          href="/clients"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Liste des clients</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Voir tous les clients enregistrés
                          </p>
                        </a>
                        <a
                          href="/clients/nouveau"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Ajouter un client</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Enregistrer un nouveau client
                          </p>
                        </a>
                        <a
                          href="/clients/historique"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Historique</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Consulter l'historique des clients
                          </p>
                        </a>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-2">
                    <Car className="h-4 w-4" />
                    <span>Véhicules</span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4" />
                    <span>Réparations</span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Stock</span>
                  </NavigationMenuTrigger>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <UserMenu />
          </div>
        ) : (
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onAuthClick}>
              Connexion
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:shadow-lg transition-all duration-300" onClick={onAuthClick}>
              Commencer
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}