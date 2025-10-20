"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Calendar, Plus, Trash2, Dumbbell } from "lucide-react";
import { DateUtils } from "@/lib/dateUtils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface Ejercicio {
  id_ejercicio: number;
  nombre: string;
  descripcion?: string | null;
  grupoMuscular?: {
    id_grupo_muscular: number;
    nombre: string;
  };
}

export default function GestionarRutinasPage() {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [rutinasFiltradas, setRutinasFiltradas] = useState<Rutina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generoFiltro, setGeneroFiltro] = useState<string>("");
  const [reassignRutinaId, setReassignRutinaId] = useState<number | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [duplicateDate, setDuplicateDate] = useState<Date | undefined>(
    undefined
  );
  const [showAddExercisesModal, setShowAddExercisesModal] = useState(false);
  const [addToRutinaId, setAddToRutinaId] = useState<number | null>(null);
  const [isAddingExercises, setIsAddingExercises] = useState(false);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEjercicios, setSelectedEjercicios] = useState<Set<number>>(
    new Set()
  );
  const [selectedValues, setSelectedValues] = useState<
    Record<number, { series: string; repeticiones: string; orden: string }>
  >({});
  const router = useRouter();

  const fetchRutinas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rutinas");
      if (response.ok) {
        const data = await response.json();
        setRutinas(data);
      }
    } catch (error) {
      console.error("Error al cargar rutinas:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchRutinas();
  }, []);

  useEffect(() => {
    let filtradas = rutinas;

    if (generoFiltro) {
      filtradas = rutinas.filter((rutina) => rutina.genero === generoFiltro);
    }

    filtradas.sort((a, b) => {
      const dateA = DateUtils.parseDate(a.fecha);
      const dateB = DateUtils.parseDate(b.fecha);
      return dateB.valueOf() - dateA.valueOf();
    });

    setRutinasFiltradas(filtradas);
  }, [rutinas, generoFiltro]);

  const formatDate = (dateString: string) => {
    return DateUtils.formatForDisplay(dateString);
  };

  const handleDeleteRutina = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta rutina?")) {
      return;
    }

    try {
      const response = await fetch(`/api/rutinas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRutinas();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Error al eliminar la rutina");
    }
  };

  const handleDuplicateRutina = async (id: number) => {
    if (!duplicateDate) {
      alert("Selecciona una fecha para duplicar la rutina");
      return;
    }
    try {
      const response = await fetch(`/api/rutinas/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: DateUtils.formatForInput(duplicateDate),
        }),
      });
      if (response.ok) {
        setReassignRutinaId(null);
        setShowReassignModal(false);
        setDuplicateDate(undefined);
        fetchRutinas();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Error al duplicar la rutina");
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
        fetchRutinas();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Error al eliminar el ejercicio");
    }
  };

  const openAddExercisesModal = async (rutinaId: number) => {
    setAddToRutinaId(rutinaId);
    setShowAddExercisesModal(true);
    setSearchTerm("");
    setSelectedEjercicios(new Set());
    setSelectedValues({});
    try {
      const response = await fetch("/api/ejercicios");
      if (response.ok) {
        const data = await response.json();
        setEjercicios(data);
      }
    } catch (error) {
      console.error("Error al cargar ejercicios:", error);
    }
  };

  const toggleSelectEjercicio = (id: number) => {
    const currentlySelected = selectedEjercicios.has(id);
    setSelectedEjercicios((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedValues((prev) => {
      const copy = { ...prev };
      if (currentlySelected) {
        delete copy[id];
      } else if (!copy[id]) {
        copy[id] = { series: "", repeticiones: "", orden: "" };
      }
      return copy;
    });
  };

  const handleAddSelectedExercises = async () => {
    if (!addToRutinaId || selectedEjercicios.size === 0) return;
    setIsAddingExercises(true);
    try {
      const ids = Array.from(selectedEjercicios);
      await Promise.all(
        ids.map((ejercicioId) =>
          fetch("/api/rutina-ejercicios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rutinaId: addToRutinaId,
              ejercicioId,
              series: (() => {
                const raw = selectedValues[ejercicioId]?.series?.trim() ?? "";
                if (raw === "") return null;
                const val = parseInt(raw, 10);
                return Number.isNaN(val) ? null : val;
              })(),
              repeticiones: (() => {
                const raw =
                  selectedValues[ejercicioId]?.repeticiones?.trim() ?? "";
                if (raw === "") return null;
                const val = parseInt(raw, 10);
                return Number.isNaN(val) ? null : val;
              })(),
              orden: (() => {
                const raw = selectedValues[ejercicioId]?.orden?.trim() ?? "";
                if (raw === "") return null;
                const val = parseInt(raw, 10);
                return Number.isNaN(val) ? null : val;
              })(),
            }),
          }).then(async (res) => {
            if (!res.ok && res.status !== 409) {
              const err = await res.json().catch(() => ({ error: "Error" }));
              console.error("Error agregando ejercicio:", err.error);
            }
          })
        )
      );
      setShowAddExercisesModal(false);
      setAddToRutinaId(null);
      setSelectedEjercicios(new Set());
      setSelectedValues({});
      fetchRutinas();
    } catch (error) {
      console.error("Error al agregar ejercicios:", error);
    } finally {
      setIsAddingExercises(false);
    }
  };

  const handleSelectedValueChange = (
    ejercicioId: number,
    field: "series" | "repeticiones" | "orden",
    value: string
  ) => {
    setSelectedValues((prev) => ({
      ...prev,
      [ejercicioId]: {
        ...(prev[ejercicioId] || { series: "", repeticiones: "", orden: "" }),
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando rutinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-center">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Filtrar por género:
              </label>
              <select
                value={generoFiltro}
                onChange={(e) => setGeneroFiltro(e.target.value)}
                className="flex h-10 w-full sm:w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Todos</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>
            <div className="sm:flex-1">
              <p className="text-sm text-muted-foreground">
                Mostrando {rutinasFiltradas.length} de {rutinas.length} rutinas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {rutinasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 px-4">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No hay rutinas disponibles
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {generoFiltro
                  ? `No se encontraron rutinas para ${generoFiltro}`
                  : "Crea algunas rutinas para comenzar"}
              </p>
              {!generoFiltro && (
                <Button
                  onClick={() => router.push("/dashboard/rutinas")}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Rutina
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rutinas Programadas
            </CardTitle>
            <CardDescription>
              Haz clic en una rutina para ver los ejercicios detallados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {rutinasFiltradas.map((rutina) => (
                <AccordionItem
                  key={rutina.id_rutina}
                  value={rutina.id_rutina.toString()}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="text-left">
                          <div className="font-medium text-base">
                            {formatDate(rutina.fecha)}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <Badge
                              className={
                                rutina.genero === "hombre"
                                  ? "bg-blue-950 text-white"
                                  : "bg-pink-950 text-white"
                              }
                            >
                              {rutina.genero === "hombre" ? "Hombre" : "Mujer"}
                            </Badge>

                            <span className="text-sm text-muted-foreground">
                              {rutina.ejercicios.length} ejercicio
                              {rutina.ejercicios.length !== 1 ? "s" : ""}
                            </span>

                            {rutina.descripcion && (
                              <span className="text-sm text-muted-foreground max-w-xs truncate">
                                • {rutina.descripcion}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4 border-t">
                      {/* Se quita el botón de reasignar de aquí para moverlo abajo, junto a eliminar */}
                      {rutina.ejercicios.length === 0 ? (
                        <div className="text-center py-6 px-4">
                          <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground text-sm mb-4">
                            Esta rutina no tiene ejercicios asignados
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openAddExercisesModal(rutina.id_rutina)
                            }
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Primer Ejercicio
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openAddExercisesModal(rutina.id_rutina)
                              }
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Ejercicio
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {rutina.ejercicios
                              .sort(
                                (a, b) => (a.orden || 999) - (b.orden || 999)
                              )
                              .map((rutinaEjercicio) => (
                                <div
                                  key={rutinaEjercicio.id}
                                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                      <span className="text-xs font-semibold text-primary">
                                        {rutinaEjercicio.orden || "?"}
                                      </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5 className="font-medium text-foreground text-sm break-words">
                                        {rutinaEjercicio.ejercicio.nombre}
                                      </h5>
                                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground mt-1">
                                        <span className="text-primary/80">
                                          {
                                            rutinaEjercicio.ejercicio
                                              .grupoMuscular.nombre
                                          }
                                        </span>
                                        {rutinaEjercicio.series && (
                                          <span>
                                            {rutinaEjercicio.series} series
                                          </span>
                                        )}
                                        {rutinaEjercicio.repeticiones && (
                                          <span>
                                            {rutinaEjercicio.repeticiones} reps
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        handleDeleteEjercicio(
                                          rutinaEjercicio.id
                                        )
                                      }
                                      className="flex-shrink-0"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between pt-4 border-t mt-4 gap-2">
                        <Button
                          size="default"
                          variant="outline"
                          className="flex items-center px-4 py-2 text-xs h-8"
                          onClick={() => {
                            setReassignRutinaId(rutina.id_rutina);
                            setShowReassignModal(true);
                          }}
                        >
                          Reasignar a otro día
                        </Button>
                        <Button
                          variant="destructive"
                          size="default"
                          className="flex items-center px-4 py-2 text-xs h-8"
                          onClick={() => handleDeleteRutina(rutina.id_rutina)}
                        >
                          Eliminar Rutina
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo borroso con click fuera */}
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/40 transition-opacity"
            onClick={() => {
              setShowReassignModal(false);
              setReassignRutinaId(null);
              setDuplicateDate(undefined);
            }}
          />

          {/* Contenedor del modal */}
          <div className="relative z-50 w-full max-w-md bg-background rounded-2xl shadow-xl border p-6 animate-in fade-in-0 zoom-in-95">
            {/* Header del modal */}
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Reasignar rutina</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Seleccioná la nueva fecha a la que querés mover esta rutina. Se
              duplicará el contenido del día original.
            </p>

            {/* DatePicker */}
            <div className="mb-6">
              <DatePicker
                date={duplicateDate}
                onDateChange={setDuplicateDate}
                placeholder="Elegí la nueva fecha"
                className="w-full"
              />
              {duplicateDate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Fecha seleccionada:{" "}
                  <span className="font-medium text-foreground">
                    {DateUtils.formatForDisplay(
                      DateUtils.formatForInput(duplicateDate)
                    )}
                  </span>
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignRutinaId(null);
                  setDuplicateDate(undefined);
                }}
              >
                Cancelar
              </Button>

              <Button
                onClick={() =>
                  reassignRutinaId && handleDuplicateRutina(reassignRutinaId)
                }
                disabled={!duplicateDate}
                className="transition-transform hover:scale-[1.02]"
              >
                Reasignar
              </Button>
            </div>
          </div>
        </div>
      )}
      {showAddExercisesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/40 transition-opacity"
            onClick={() => {
              setShowAddExercisesModal(false);
              setAddToRutinaId(null);
              setSelectedEjercicios(new Set());
              setSelectedValues({});
            }}
          />
          <div className="relative z-50 w-full max-w-2xl max-h-[90vh] bg-background rounded-2xl shadow-xl border flex flex-col animate-in fade-in-0 zoom-in-95">
            <div className="p-6 pb-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Agregar ejercicios</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Seleccioná uno o más ejercicios para agregarlos a la rutina.
              </p>
              <div className="mb-4">
                <Input
                  placeholder="Buscar por nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 px-6">
              <ScrollArea className="h-[350px] sm:h-[300px] border rounded-lg">
                <ul className="divide-y">
                  {ejercicios
                    .filter((e) =>
                      e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .filter((e) => {
                      const asignados =
                        rutinas.find((r) => r.id_rutina === addToRutinaId)
                          ?.ejercicios || [];
                      const asignadosIds = new Set(
                        asignados.map((x) => x.ejercicio.id_ejercicio)
                      );
                      return !asignadosIds.has(e.id_ejercicio);
                    })
                    .map((e) => (
                      <li
                        key={e.id_ejercicio}
                        className="flex flex-col gap-2 p-3 hover:bg-muted/50"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            className="h-4 w-4 mt-1"
                            checked={selectedEjercicios.has(e.id_ejercicio)}
                            onChange={() =>
                              toggleSelectEjercicio(e.id_ejercicio)
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm break-words">
                              {e.nombre}
                            </div>
                            {e.grupoMuscular?.nombre && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {e.grupoMuscular.nombre}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedEjercicios.has(e.id_ejercicio) && (
                          <div className="ml-7 flex flex-col sm:flex-row gap-2 items-center sm:items-start">
                            <Input
                              type="number"
                              min={1}
                              inputMode="numeric"
                              placeholder="Series"
                              value={
                                selectedValues[e.id_ejercicio]?.series ?? ""
                              }
                              onChange={(ev) =>
                                handleSelectedValueChange(
                                  e.id_ejercicio,
                                  "series",
                                  ev.target.value
                                )
                              }
                              className="h-8 w-20 sm:w-24 text-xs text-center"
                            />
                            <Input
                              type="number"
                              min={1}
                              inputMode="numeric"
                              placeholder="Reps"
                              value={
                                selectedValues[e.id_ejercicio]?.repeticiones ??
                                ""
                              }
                              onChange={(ev) =>
                                handleSelectedValueChange(
                                  e.id_ejercicio,
                                  "repeticiones",
                                  ev.target.value
                                )
                              }
                              className="h-8 w-20 sm:w-24 text-xs text-center"
                            />
                            <Input
                              type="number"
                              min={1}
                              inputMode="numeric"
                              placeholder="Orden"
                              value={
                                selectedValues[e.id_ejercicio]?.orden ?? ""
                              }
                              onChange={(ev) =>
                                handleSelectedValueChange(
                                  e.id_ejercicio,
                                  "orden",
                                  ev.target.value
                                )
                              }
                              className="h-8 w-20 sm:w-20 text-xs text-center"
                            />
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </ScrollArea>
            </div>
            <div className="p-6 pt-4 flex-shrink-0 border-t">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddExercisesModal(false);
                    setAddToRutinaId(null);
                    setSelectedEjercicios(new Set());
                    setSelectedValues({});
                  }}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddSelectedExercises}
                  disabled={isAddingExercises || selectedEjercicios.size === 0}
                  className="w-full sm:w-auto transition-transform hover:scale-[1.02]"
                >
                  {isAddingExercises ? "Agregando..." : "Agregar seleccionados"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
