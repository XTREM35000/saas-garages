# 🎯 Guide d'Utilisation - Modal Draggable WhatsApp

## 🚀 **Installation et Utilisation**

### **1. Import du Composant**
```typescript
import { WhatsAppModal } from '@/components/ui/whatsapp-modal';
```

### **2. Utilisation Basique**
```typescript
const [isOpen, setIsOpen] = useState(false);

<WhatsAppModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Mon Modal"
  description="Description du modal"
>
  <div>Contenu du modal</div>
</WhatsAppModal>
```

### **3. Avec Indicateur Super Admin**
```typescript
<WhatsAppModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Création Super Admin"
  description="Configuration initiale du système"
  showSuperAdminIndicator={true}
  size="xl"
>
  <SuperAdminForm />
</WhatsAppModal>
```

## 📱 **Responsive Automatique**

### **Valeurs par Défaut (selon l'écran)**
- **Desktop (1080+)** : `{ top: -280, bottom: 270 }`
- **Laptop/Tablet (768+)** : `{ top: -200, bottom: 200 }`
- **Mobile (<768)** : `{ top: -150, bottom: 150 }`

### **Hook Personnalisé (si besoin)**
```typescript
import { useResponsiveDragConstraints } from '@/hooks/useResponsiveDragConstraints';

const MyComponent = () => {
  // Hook avancé avec hauteur de modal personnalisée
  const constraints = useResponsiveDragConstraints(800);

  // Hook simple avec breakpoints prédéfinis
  const simpleConstraints = useBreakpointDragConstraints();

  return <WhatsAppModal dragConstraints={constraints} />;
};
```

## 🎨 **Personnalisation**

### **Tailles Disponibles**
```typescript
size="sm"    // max-w-sm
size="md"    // max-w-md
size="lg"    // max-w-2xl (défaut)
size="xl"    // max-w-4xl
size="full"  // max-w-6xl
```

### **Classes CSS Personnalisées**
```typescript
<WhatsAppModal
  className="custom-modal-class"
  // Vos styles personnalisés
>
```

## 🔧 **Fonctionnalités**

### **✅ Drag Vertical**
- Glisser vers le haut : voir le footer
- Glisser vers le bas : voir le header
- Limites automatiques selon l'écran
- Reset automatique après drag

### **✅ Gestion Clavier**
- `Escape` : ferme le modal
- `Tab` : navigation dans le contenu

### **✅ Animations**
- Entrée : scale + fade + slide
- Sortie : scale + fade + slide
- Transitions fluides avec Framer Motion

### **✅ Responsive**
- Détection automatique de la taille d'écran
- Mise à jour en temps réel lors du resize
- Support orientation portrait/paysage

## 🐛 **Dépannage**

### **Modal Coupé/Invisible**
1. Vérifier qu'il n'y a pas de `padding-top` excessif dans le parent
2. Supprimer les imports CSS conflictuels
3. Utiliser `items-center` dans le conteneur

### **Drag Ne Fonctionne Pas**
1. Vérifier que `drag="y"` est présent
2. Contrôler les `dragConstraints`
3. Vérifier que `touch-pan-y` est dans les classes

### **Header Non Visible**
1. Utiliser `items-center` au lieu de `items-end`
2. Vérifier que `y: 0` dans l'animation initiale
3. Contrôler les limites de drag

## 📚 **Exemples Complets**

### **Modal de Formulaire**
```typescript
const FormModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <WhatsAppModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Formulaire"
      description="Remplissez les informations"
      size="lg"
    >
      <form className="space-y-4">
        <input type="text" placeholder="Nom" />
        <input type="email" placeholder="Email" />
        <button type="submit">Envoyer</button>
      </form>
    </WhatsAppModal>
  );
};
```

### **Modal avec Contenu Long**
```typescript
const LongContentModal = () => {
  return (
    <WhatsAppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contenu Long"
      size="xl"
    >
      <div className="space-y-6">
        {/* Beaucoup de contenu */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded">
            Section {i + 1}
          </div>
        ))}
      </div>
    </WhatsAppModal>
  );
};
```

## 🎉 **Avantages**

1. **Responsive automatique** - s'adapte à tous les écrans
2. **Drag intuitif** - navigation naturelle du contenu
3. **Performance optimisée** - Framer Motion + hooks React
4. **Thème WhatsApp** - design cohérent et moderne
5. **Accessibilité** - clavier + lecteurs d'écran
6. **Maintenance facile** - composant unifié et réutilisable

---

**Le modal draggable est maintenant parfaitement optimisé pour tous les écrans !** 🚀
