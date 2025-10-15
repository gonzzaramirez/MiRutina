"use client";

import { useState } from "react";
import { GenderSelection } from "@/components/gender-selection";
import { ExerciseList } from "@/components/exercise-list";
import { Header } from "@/components/header";

export default function Home() {
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);

  const handleGenderSelect = (gender: "male" | "female") => {
    setSelectedGender(gender);
  };

  const handleBack = () => {
    setSelectedGender(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header showBack={selectedGender !== null} onBack={handleBack} />
      <main className="flex-1">
        {selectedGender === null ? (
          <GenderSelection onSelect={handleGenderSelect} />
        ) : (
          <ExerciseList gender={selectedGender} />
        )}
      </main>
    </div>
  );
}
