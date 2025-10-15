"use client";

import { memo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showBack: boolean;
  onBack: () => void;
}

export const Header = memo(function Header({ showBack, onBack }: HeaderProps) {
  return (
    <header className="border-b border-border/50 bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3 max-w-3xl">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Volver"
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg md:text-xl font-semibold text-foreground">
          Optimo Sport Gym
        </h1>
      </div>
    </header>
  );
});
