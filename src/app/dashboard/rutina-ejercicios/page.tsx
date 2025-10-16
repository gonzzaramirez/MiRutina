"use client";

import { useState, useEffect, Suspense } from "react";
import { DateUtils } from "@/lib/dateUtils";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Check, Trash2 } from "lucide-react";

const rutinaEjercicioSchema = z.object({
  rutinaId: z.string().min(1, "Debes seleccionar una rutina"),
  ejercicioId: z.string().min(1, "Debes seleccionar un ejercicio"),
  series: z.string().optional(),
  repeticiones: z.string().optional(),
  orden: z.string().optional(),
});

type RutinaEjercicioForm = z.infer<typeof rutinaEjercicioSchema>;

interface RutinaEjercicio {
  id: number;
  rutinaId: number;
  ejercicioId: number;
  series?: number;
  repeticiones?: number;
  orden?: number;
  ejercicio: Ejercicio;
  rutina: Rutina;
}

interface Rutina {
  id_rutina: number;
  fecha: string;
  genero: string;
  descripcion?: string;
  ejercicios?: RutinaEjercicio[];
}

interface Ejercicio {
  id_ejercicio: number;
  nombre: string;
  descripcion?: string;
  grupoMuscular?: {
    id_grupo_muscular: number;
    nombre: string;
  };
}

function RutinaEjerciciosContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [ejerciciosAsignados, setEjerciciosAsignados] = useState<number[]>([]);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<Rutina | null>(
    null
  );
  const [ejerciciosRutina, setEjerciciosRutina] = useState<RutinaEjercicio[]>(
    []
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const rutinaIdFromUrl = searchParams.get("rutinaId");
  const isRutinaPreselected = !!rutinaIdFromUrl;

  const form = useForm<RutinaEjercicioForm>({
    resolver: zodResolver(rutinaEjercicioSchema),
    defaultValues: {
      rutinaId: rutinaIdFromUrl || "",
      ejercicioId: "",
      series: "",
      repeticiones: "",
      orden: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rutinasResponse, ejerciciosResponse] = await Promise.all([
          fetch("/api/rutinas"),
          fetch("/api/ejercicios"),
        ]);

        if (rutinasResponse.ok && ejerciciosResponse.ok) {
          const [rutinasData, ejerciciosData] = await Promise.all([
            rutinasResponse.json(),
            ejerciciosResponse.json(),
          ]);
          setRutinas(rutinasData);
          setEjercicios(ejerciciosData);

          if (rutinaIdFromUrl) {
            const rutinaPreseleccionada = rutinasData.find(
              (r: Rutina) => r.id_rutina.toString() === rutinaIdFromUrl
            );
            if (rutinaPreseleccionada) {
              setRutinaSeleccionada(rutinaPreseleccionada);
              setEjerciciosRutina(rutinaPreseleccionada.ejercicios || []);
              setEjerciciosAsignados(
                (rutinaPreseleccionada.ejercicios || []).map(
                  (re: RutinaEjercicio) => re.ejercicioId
                )
              );
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, [rutinaIdFromUrl]);

  useEffect(() => {
    const rutinaId = form.getValues("rutinaId");
    if (rutinaId) {
      const rutina = rutinas.find((r) => r.id_rutina.toString() === rutinaId);
      setRutinaSeleccionada(rutina || null);
      if (rutina) {
        setEjerciciosRutina(rutina.ejercicios || []);
        setEjerciciosAsignados(
          (rutina.ejercicios || []).map((re: RutinaEjercicio) => re.ejercicioId)
        );
      }
    }
  }, [form, rutinas]);

  const onSubmit = async (data: RutinaEjercicioForm) => {
    setIsLoading(true);
    setSuccess(false);

    try {
      const payload = {
        rutinaId: parseInt(data.rutinaId, 10),
        ejercicioId: parseInt(data.ejercicioId, 10),
        series: data.series ? parseInt(data.series, 10) : null,
        repeticiones: data.repeticiones
          ? parseInt(data.repeticiones, 10)
          : null,
        orden: data.orden ? parseInt(data.orden, 10) : null,
      };

      const response = await fetch("/api/rutina-ejercicios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        form.reset();
        const rutinasResponse = await fetch("/api/rutinas");
        if (rutinasResponse.ok) {
          const rutinasData = await rutinasResponse.json();
          setRutinas(rutinasData);
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const error = await response.json();
        if (response.status === 409) {
          alert("Esta rutina ya contiene ese ejercicio");
        } else {
          alert(`Error: ${error.error}`);
        }
      }
    } catch {
      alert("Error al asignar ejercicio a la rutina");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEjercicio = async (id: number) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este ejercicio de la rutina?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/rutina-ejercicios/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const rutinasResponse = await fetch("/api/rutinas");
        if (rutinasResponse.ok) {
          const rutinasData = await rutinasResponse.json();
          setRutinas(rutinasData);
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Error al eliminar el ejercicio");
    }
  };

  const formatDate = (dateString: string) =>
    DateUtils.formatForDisplay(dateString);

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Plus className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">
              {isRutinaPreselected
                ? "Agregar Ejercicio a Rutina"
                : "Nuevo Ejercicio en Rutina"}
            </span>
          </CardTitle>
          <CardDescription className="text-sm">
            {isRutinaPreselected
              ? "Selecciona un ejercicio para agregar a esta rutina"
              : "Selecciona una rutina y un ejercicio para asignar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <FormField
                control={form.control}
                name="rutinaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Rutina *
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isRutinaPreselected}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
                      >
                        <option value="">Selecciona una rutina</option>
                        {rutinas.map((rutina) => (
                          <option
                            key={rutina.id_rutina}
                            value={rutina.id_rutina}
                          >
                            {formatDate(rutina.fecha)} - {rutina.genero}
                            {rutina.descripcion && ` (${rutina.descripcion})`}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ejercicioId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Ejercicio *
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation"
                      >
                        <option value="">Selecciona un ejercicio</option>
                        {ejercicios
                          .filter(
                            (e) => !ejerciciosAsignados.includes(e.id_ejercicio)
                          )
                          .map((ejercicio) => (
                            <option
                              key={ejercicio.id_ejercicio}
                              value={ejercicio.id_ejercicio}
                            >
                              {ejercicio.nombre}
                              {ejercicio.grupoMuscular?.nombre &&
                                ` (${ejercicio.grupoMuscular.nombre})`}
                            </option>
                          ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Series
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Número de series"
                          className="h-12 text-base touch-manipulation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repeticiones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Repeticiones
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Número de repeticiones"
                          className="h-12 text-base touch-manipulation"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="orden"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Orden en la Rutina
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Orden de ejecución (opcional)"
                        className="h-12 text-base touch-manipulation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {success && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 sm:p-4 rounded-md text-sm sm:text-base">
                  <Check className="h-4 w-4 flex-shrink-0" />
                  <span>¡Ejercicio asignado exitosamente a la rutina!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-12 text-base font-medium touch-manipulation"
                >
                  {isLoading ? "Asignando..." : "Asignar Ejercicio"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="h-12 text-base touch-manipulation"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {rutinaSeleccionada && ejerciciosRutina.length > 0 && (
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Plus className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Ejercicios en esta Rutina</span>
            </CardTitle>
            <CardDescription className="text-sm">
              {formatDate(rutinaSeleccionada.fecha)} -{" "}
              {rutinaSeleccionada.genero}
              {rutinaSeleccionada.descripcion &&
                ` • ${rutinaSeleccionada.descripcion}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {ejerciciosRutina
                .sort((a, b) => (a.orden || 999) - (b.orden || 999))
                .map((rutinaEjercicio) => (
                  <div
                    key={rutinaEjercicio.id}
                    className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-muted/50 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-semibold text-primary">
                          {rutinaEjercicio.orden || "?"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-medium text-foreground text-sm sm:text-base truncate">
                          {rutinaEjercicio.ejercicio.nombre}
                        </h5>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="text-primary/80 font-medium">
                            {rutinaEjercicio.ejercicio.grupoMuscular?.nombre ||
                              "Sin grupo"}
                          </span>
                          {rutinaEjercicio.series && (
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {rutinaEjercicio.series} series
                            </span>
                          )}
                          {rutinaEjercicio.repeticiones && (
                            <span className="bg-muted px-2 py-1 rounded text-xs">
                              {rutinaEjercicio.repeticiones} reps
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEjercicio(rutinaEjercicio.id)}
                      className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 touch-manipulation"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Eliminar</span>
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RutinaEjerciciosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Cargando...
        </div>
      }
    >
      <RutinaEjerciciosContent />
    </Suspense>
  );
}
