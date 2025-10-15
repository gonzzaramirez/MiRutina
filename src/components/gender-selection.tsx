"use client";

import { memo } from "react";
import Image from "next/image";

interface GenderSelectionProps {
  onSelect: (gender: "male" | "female") => void;
}

export const GenderSelection = memo(function GenderSelection({
  onSelect,
}: GenderSelectionProps) {
  return (
    <div className="pt-16 flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Selecciona tu perfil
        </h1>
        <p className="text-muted-foreground text-base">
          Elige tu género para ver la rutina del día
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-sm">
        <button
          onClick={() => onSelect("male")}
          className="flex flex-col items-center p-6 rounded-2xl bg-card shadow border border-border focus:outline-none"
        >
          <Image
            src="/hombre.png"
            alt="Hombre"
            width={100}
            height={100}
            priority
            style={{ width: "auto", height: "auto" }}
            className="rounded-full mb-4 object-cover"
          />
          <h3 className="text-xl font-semibold text-foreground">Hombre</h3>
          <p className="text-muted-foreground text-sm">Perfil masculino</p>
        </button>

        <button
          onClick={() => onSelect("female")}
          className="flex flex-col items-center p-6 rounded-2xl bg-card shadow border border-border focus:outline-none"
        >
          <Image
            src="/mujer.png"
            alt="Mujer"
            width={100}
            height={100}
            priority
            style={{ width: "auto", height: "auto" }}
            className="rounded-full mb-4 object-cover"
          />
          <h3 className="text-xl font-semibold text-foreground">Mujer</h3>
          <p className="text-muted-foreground text-sm">Perfil femenino</p>
        </button>
      </div>
    </div>
  );
});
