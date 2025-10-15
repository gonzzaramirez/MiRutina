"use client";

import { useState, useEffect, useCallback } from "react";
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

const grupoMuscularSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
});

type GrupoMuscularForm = z.infer<typeof grupoMuscularSchema>;

interface GrupoMuscular {
  id_grupo_muscular: number;
  nombre: string;
}

export default function GruposMuscularesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(true);

  const form = useForm<GrupoMuscularForm>({
    resolver: zodResolver(grupoMuscularSchema),
    defaultValues: {
      nombre: "",
    },
  });

  const fetchGrupos = useCallback(async () => {
    setIsLoadingGrupos(true);
    try {
      const response = await fetch("/api/grupos-musculares");
      if (response.ok) {
        const data = await response.json();
        setGrupos(data);
      }
    } catch (error) {
      console.error("Error al cargar grupos musculares:", error);
    } finally {
      setIsLoadingGrupos(false);
    }
  }, []);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  const onSubmit = async (data: GrupoMuscularForm) => {
    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/grupos-musculares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        form.reset();
        fetchGrupos();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Error al crear el grupo muscular");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm("¿Estás seguro de que quieres eliminar este grupo muscular?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/grupos-musculares/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchGrupos();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Error al eliminar el grupo muscular");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nuevo Grupo Muscular
            </CardTitle>
            <CardDescription>
              Agrega un nuevo grupo muscular al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Grupo Muscular *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Pecho" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {success && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                    <Check className="h-4 w-4" />
                    <span>¡Grupo muscular creado exitosamente!</span>
                  </div>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creando..." : "Crear Grupo Muscular"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grupos Musculares Existentes</CardTitle>
            <CardDescription>
              Lista de todos los grupos musculares en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGrupos ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cargando grupos...
                </p>
              </div>
            ) : grupos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No hay grupos musculares registrados
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {grupos.map((grupo) => (
                  <div
                    key={grupo.id_grupo_muscular}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">
                        {grupo.nombre}
                      </h4>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(grupo.id_grupo_muscular)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
