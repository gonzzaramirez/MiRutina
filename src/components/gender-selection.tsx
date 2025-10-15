"use client";

import { memo } from "react";
import { Card } from "@/components/ui/card";
import { User, Users } from "lucide-react";

interface GenderSelectionProps {
  onSelect: (gender: "male" | "female") => void;
}

export const GenderSelection = memo(function GenderSelection({
  onSelect,
}: GenderSelectionProps) {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3 text-balance">
          Selecciona tu perfil
        </h2>
        <p className="text-muted-foreground">
          Elige tu categoría para comenzar
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
        <Card
          className="p-6 cursor-pointer hover:border-primary/50 transition-colors group bg-card"
          onClick={() => onSelect("male")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelect("male");
            }
          }}
          aria-label="Seleccionar perfil masculino"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Hombre</h3>
          </div>
        </Card>

        <Card
          className="p-6 cursor-pointer hover:border-primary/50 transition-colors group bg-card"
          onClick={() => onSelect("female")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelect("female");
            }
          }}
          aria-label="Seleccionar perfil femenino"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Mujer</h3>
          </div>
        </Card>
      </div>
    </div>
  );
});
