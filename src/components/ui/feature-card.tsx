import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group bg-gradient-card border-border/50 hover:shadow-elegant transition-all duration-300",
      "hover:scale-105 hover:border-primary/20",
      className
    )}>
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-xl bg-accent group-hover:bg-primary/10 transition-colors duration-300">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}