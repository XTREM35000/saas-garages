import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AnimatedLogo({ size = "md", className }: AnimatedLogoProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16", 
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Animated bubble/drop logo */}
      <div className={cn(
        "relative rounded-full bg-gradient-primary animate-float",
        "shadow-lg animate-pulse-glow",
        sizeClasses[size]
      )}>
        {/* Inner bubble effect */}
        <div className="absolute inset-2 rounded-full bg-white/20 animate-bubble-bounce" />
        
        {/* Garage icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-1/2 h-1/2 text-white" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M19 15V7a1 1 0 0 0-.5-.87L12 2 5.5 6.13A1 1 0 0 0 5 7v8m14 0v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2m14 0H5m7-12v5m-4 7h8m-8 0v3m8-3v3"/>
          </svg>
        </div>

        {/* Floating particles */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-light rounded-full animate-ping opacity-75" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary-light rounded-full animate-pulse" />
      </div>
    </div>
  );
}