"use client";

import { Dumbbell, Edit, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Ejercicio {
  id_ejercicio: number;
  nombre: string;
  descripcion?: string;
  grupoMuscular?: {
    id_grupo_muscular: number;
    nombre: string;
  };
}

interface ListaEjerciciosProps {
  isLoadingEjercicios: boolean;
  ejerciciosFiltrados: Ejercicio[];
  searchTerm: string;
  editingEjercicio?: Ejercicio | null;
  handleEdit: (ejercicio: Ejercicio) => void;
  handleDelete: (id: number) => void;
}

export default function ListaEjercicios({
  isLoadingEjercicios,
  ejerciciosFiltrados,
  searchTerm,
  editingEjercicio,
  handleEdit,
  handleDelete,
}: ListaEjerciciosProps) {
  if (isLoadingEjercicios)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando ejercicios...</p>
          </div>
        </CardContent>
      </Card>
    );

  if (ejerciciosFiltrados.length === 0)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm
                ? "No se encontraron ejercicios"
                : "No hay ejercicios disponibles"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Agrega algunos ejercicios para comenzar"}
            </p>
          </div>
        </CardContent>
      </Card>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ejerciciosFiltrados.map((ejercicio) => (
        <Card
          key={ejercicio.id_ejercicio}
          className={`hover:shadow-lg transition-shadow ${
            editingEjercicio?.id_ejercicio === ejercicio.id_ejercicio
              ? "ring-2 ring-primary"
              : ""
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-lg">{ejercicio.nombre}</CardTitle>
                  {ejercicio.grupoMuscular && (
                    <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full mt-1">
                      {ejercicio.grupoMuscular.nombre}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(ejercicio)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(ejercicio.id_ejercicio)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm mb-3">
              {ejercicio.descripcion || "Sin descripción"}
            </CardDescription>
            <div className="pt-3 border-t"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
