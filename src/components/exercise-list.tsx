"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, RefreshCw, Calculator } from "lucide-react";
import { DateUtils } from "@/lib/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

/* ------------------ WeightCalcModal (autocontenido, estado propio) ------------------ */
function WeightCalcModal({
  isOpen,
  onOpenChange,
  trigger,
}: {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  trigger: React.ReactNode;
}) {
  const [oneRepMax, setOneRepMax] = useState<string>("");
  const [percent, setPercent] = useState<number>(70);
  const [rounding, setRounding] = useState<"0.5" | "1" | "none">("none");
  const quickButtons = useMemo(() => [50, 60, 70, 80, 90], []);

  const result = useMemo(() => {
    const max = parseFloat(oneRepMax);
    if (Number.isNaN(max) || max <= 0) return null;
    let value = (max * percent) / 100;
    if (rounding === "0.5") value = Math.round(value * 2) / 2;
    else if (rounding === "1") value = Math.round(value);
    return value;
  }, [oneRepMax, percent, rounding]);

  const handleQuick = useCallback((p: number) => setPercent(p), []);
  const handleSlider = useCallback(
    (v: number[]) => setPercent(v?.[0] ?? 0),
    []
  );
  const handleOpenChange = onOpenChange; // passthrough

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md rounded-2xl"
        aria-label="Modal calcular peso"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcular Peso
          </DialogTitle>
          <DialogDescription>
            Ingresa tu 1RM y elige el porcentaje para estimar el peso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="one-rm">Peso máximo (1RM)</Label>
            <Input
              id="one-rm"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 100"
              value={oneRepMax}
              onChange={(e) => setOneRepMax(e.target.value)}
              aria-describedby="one-rm-help"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="percent-slider">Porcentaje</Label>
              <span className="text-sm font-medium" aria-live="polite">
                {percent}%
              </span>
            </div>
            <Slider
              id="percent-slider"
              min={0}
              max={100}
              step={1}
              value={[percent]}
              onValueChange={handleSlider}
              aria-label="Selecciona porcentaje"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickButtons.map((p) => (
                <Button
                  key={p}
                  variant={percent === p ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleQuick(p)}
                  aria-label={`Usar ${p}%`}
                >
                  {p}%
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Redondeo</Label>
            <RadioGroup
              value={rounding}
              onValueChange={(v) => setRounding((v as any) ?? "none")}
              className="grid grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="round-05" value="0.5" />
                <Label htmlFor="round-05">0.5</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="round-1" value="1" />
                <Label htmlFor="round-1">1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="round-none" value="none" />
                <Label htmlFor="round-none">Sin redondeo</Label>
              </div>
            </RadioGroup>
          </div>

          <div
            className="rounded-2xl border bg-primary/5 p-5 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="text-sm text-muted-foreground">Resultado</div>
            <div className="mt-1 text-4xl font-bold tracking-tight text-primary">
              {result === null ? "-- kg" : `${result} kg`}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------ ExerciseCard (memoizado) ------------------ */
const ExerciseCard = React.memo(function ExerciseCard({
  e,
}: {
  e: RutinaEjercicio;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow border border-border rounded-xl">
      <CardContent className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {e.orden ?? "—"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground mb-1">
            {e.ejercicio.nombre}
          </h3>
          {e.ejercicio.descripcion && (
            <p className="text-sm text-muted-foreground mb-2">
              {e.ejercicio.descripcion}
            </p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="text-primary/90">
              {e.ejercicio.grupoMuscular.nombre}
            </span>
            {e.series && <span>{e.series} series</span>}
            {e.repeticiones && <span>{e.repeticiones} reps</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/* ------------------ ExerciseList (componente principal) ------------------ */
export function ExerciseList({ gender }: ExerciseListProps) {
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCalcOpen, setIsCalcOpen] = useState(false);

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

  const sortedExercises = useMemo(() => {
    if (!rutina?.ejercicios) return [];
    return [...rutina.ejercicios].sort(
      (a, b) => (a.orden ?? 999) - (b.orden ?? 999)
    );
  }, [rutina?.ejercicios]);

  const exerciseCards = useMemo(
    () => sortedExercises.map((r) => <ExerciseCard key={r.id} e={r} />),
    [sortedExercises]
  );

  const formatDate = useCallback(
    (dateString: string) => DateUtils.formatForDisplay(dateString),
    []
  );

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
          <div className="mt-3 flex justify-end">
            <WeightCalcModal
              isOpen={isCalcOpen}
              onOpenChange={setIsCalcOpen}
              trigger={
                <Button variant="outline" onClick={() => setIsCalcOpen(true)}>
                  <Calculator className="h-4 w-4" />
                  <p className="text-sm font-medium ml-2">Calcular Peso</p>
                </Button>
              }
            />
          </div>
        </CardHeader>
      </Card>

      {/* Ejercicios */}
      <div className="space-y-4">
        {sortedExercises.length === 0 && (
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

        {exerciseCards}
      </div>
    </div>
  );
}
