interface ModalHeaderProps {
  title: string;
  description?: string;
}

export function ModalTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-white">
      {children}
    </h2>
  );
}

export function ModalDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-white/80">
      {children}
    </p>
  );
}