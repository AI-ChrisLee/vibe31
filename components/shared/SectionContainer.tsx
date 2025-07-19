import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "muted" | "dark" | "primary";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  padding?: "sm" | "md" | "lg" | "xl";
  id?: string;
}

const backgroundClasses = {
  default: "",
  muted: "bg-muted/30",
  dark: "bg-black text-white",
  primary: "bg-primary text-primary-foreground"
};

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full"
};

const paddingClasses = {
  sm: "py-12",
  md: "py-16",
  lg: "py-20",
  xl: "py-24"
};

export function SectionContainer({
  children,
  className = "",
  background = "default",
  maxWidth = "6xl",
  padding = "lg",
  id
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        paddingClasses[padding],
        backgroundClasses[background],
        className
      )}
    >
      <div className={cn("container mx-auto px-4", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </section>
  );
}