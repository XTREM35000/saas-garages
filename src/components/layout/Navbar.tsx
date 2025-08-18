import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  Car,
  Wrench,
  Calendar,
  Package,
  CreditCard,
  BarChart,
  UserCheck,
  Settings,
  LogOut,
  Palette,
  ChevronDown,
} from 'lucide-react';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'vehicles', label: 'Véhicules', icon: Car },
  { id: 'repairs', label: 'Réparations', icon: Wrench },
  { id: 'appointments', label: 'RDV', icon: Calendar },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'invoices', label: 'Factures', icon: CreditCard },
  { id: 'reports', label: 'Rapports', icon: BarChart },
  { id: 'team', label: 'Équipe', icon: UserCheck },
];

export const Navbar: React.FC = () => {
  const { theme, setTheme, currentUser } = useApp();
  const [activeItem, setActiveItem] = useState('dashboard');

  const handleThemeChange = () => {
    setTheme(theme === 'icloud' ? 'whatsapp' : 'icloud');
  };

  return (
    <nav className="bg-gradient-glass backdrop-blur-lg border-b border-border/50 shadow-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center animate-pulse-glow">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GaragePro
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center space-x-2 transition-all ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'hover:bg-primary/10 hover:text-primary'
                  }`}
                  onClick={() => setActiveItem(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThemeChange}
              className="p-2 hover:bg-primary/10"
            >
              <Palette className="h-4 w-4" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-primary/10">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{currentUser?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-muted-foreground">{currentUser?.role || 'Admin'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-card">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};