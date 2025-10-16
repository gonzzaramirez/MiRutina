"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, RefreshCw } from "lucide-react";
import { DateUtils } from "@/lib/dateUtils";

interface ExerciseListProps {
  gender: "male" | "female";
}

interface RutinaEjercicio {
  id: number;
  series: number | null;
  repeticiones: number | null;
  orden: number | null;
  ejercicio: {
    id_ejercicio: number;
    nombre: string;
    descripcion: string | null;
    grupoMuscular: {
      nombre: string;
    };
  };
}

interface Rutina {
  id_rutina: number;
  fecha: string;
  genero: string;
  descripcion: string | null;
  ejercicios: RutinaEjercicio[];
}

export function ExerciseList({ gender }: ExerciseListProps) {
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRutinaDelDia = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const today = DateUtils.todayForInput();
      const generoApi = gender === "male" ? "hombre" : "mujer";
      const response = await fetch(
        `/api/rutinas?fecha=${today}&genero=${generoApi}`
      );

      if (response.ok) {
        const rutinas = await response.json();
        if (rutinas.length > 0) setRutina(rutinas[0]);
        else setError("No hay rutina disponible para hoy");
      } else {
        setError("Error al cargar la rutina");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [gender]);

  useEffect(() => {
    fetchRutinaDelDia();
  }, [fetchRutinaDelDia]);

  const formatDate = (dateString: string) =>
    DateUtils.formatForDisplay(dateString);

  if (isLoading)
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-3 text-muted-foreground text-lg">
          Cargando rutina del día...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <Dumbbell className="h-12 w-12  mx-auto mb-3" />
            <h3 className="text-lg font-semibold  mb-2">{error}</h3>
            <Button
              onClick={fetchRutinaDelDia}
              variant="outline"
              className="mt-3"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  if (!rutina)
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardContent className="pt-6 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay rutina disponible
            </h3>
            <p className="text-muted-foreground">
              No se encontró una rutina para{" "}
              {gender === "male" ? "hombres" : "mujeres"} hoy.
            </p>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl font-bold">Rutina del Día</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(rutina.fecha)} -{" "}
            {gender === "male" ? "Hombres" : "Mujeres"}
          </p>
          {rutina.descripcion && (
            <p className="text-sm text-muted-foreground mt-1">
              {rutina.descripcion}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Ejercicios */}
      <div className="space-y-4">
        {rutina.ejercicios.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Rutina vacía.
              </h3>
              <p className="text-muted-foreground">
                Esta rutina no tiene ejercicios asignados aún.
              </p>
            </CardContent>
          </Card>
        )}

        {rutina.ejercicios
          .sort((a, b) => (a.orden || 999) - (b.orden || 999))
          .map((rutinaEjercicio, index) => (
            <Card
              key={rutinaEjercicio.id}
              className="hover:shadow-lg transition-shadow border border-border rounded-xl"
            >
              <CardContent className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {rutinaEjercicio.orden || index + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {rutinaEjercicio.ejercicio.nombre}
                  </h3>
                  {rutinaEjercicio.ejercicio.descripcion && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {rutinaEjercicio.ejercicio.descripcion}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="text-primary/90">
                      {rutinaEjercicio.ejercicio.grupoMuscular.nombre}
                    </span>
                    {rutinaEjercicio.series && (
                      <span>{rutinaEjercicio.series} series</span>
                    )}
                    {rutinaEjercicio.repeticiones && (
                      <span>{rutinaEjercicio.repeticiones} reps</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
