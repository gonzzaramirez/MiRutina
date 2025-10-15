"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

import { Plus, Check, Search, X } from "lucide-react";

import ListaEjercicios from "./components/lista-ejercicios";

const ejercicioSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  grupoMuscularId: z.string().min(1, "Debes seleccionar un grupo muscular"),
});

type EjercicioForm = z.infer<typeof ejercicioSchema>;

interface GrupoMuscular {
  id_grupo_muscular: number;
  nombre: string;
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

export default function EjerciciosPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [grupos, setGrupos] = useState<GrupoMuscular[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [ejerciciosFiltrados, setEjerciciosFiltrados] = useState<Ejercicio[]>(
    [],
  );
  const [isLoadingGrupos, setIsLoadingGrupos] = useState(true);
  const [isLoadingEjercicios, setIsLoadingEjercicios] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEjercicio, setEditingEjercicio] = useState<Ejercicio | null>(
    null,
  );
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  const form = useForm<EjercicioForm>({
    resolver: zodResolver(ejercicioSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      grupoMuscularId: "",
    },
  });

  useEffect(() => {
    const fetchGrupos = async () => {
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
    };
    fetchGrupos();
  }, []);

  const fetchEjercicios = useCallback(async () => {
    setIsLoadingEjercicios(true);
    try {
      const response = await fetch("/api/ejercicios");
      if (response.ok) {
        const data = await response.json();
        setEjercicios(data);
        setEjerciciosFiltrados(data);
      }
    } catch (error) {
      console.error("Error al cargar ejercicios:", error);
    } finally {
      setIsLoadingEjercicios(false);
    }
  }, []);

  useEffect(() => {
    fetchEjercicios();
  }, [fetchEjercicios]);

  useEffect(() => {
    const filtrados = ejercicios.filter(
      (ejercicio) =>
        ejercicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ejercicio.grupoMuscular?.nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        ejercicio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setEjerciciosFiltrados(filtrados);
  }, [searchTerm, ejercicios]);

  const onSubmit = async (data: EjercicioForm) => {
    setIsLoading(true);
    setSuccess(false);
    try {
      const url =
        isEditing && editingEjercicio
          ? `/api/ejercicios/${editingEjercicio.id_ejercicio}`
          : "/api/ejercicios";

      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing
        ? {
            nombre: data.nombre,
            descripcion: data.descripcion,
            grupoMuscularId: data.grupoMuscularId,
          }
        : data;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        form.reset();
        setIsEditing(false);
        setEditingEjercicio(null);
        fetchEjercicios();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert(`Error al ${isEditing ? "actualizar" : "crear"} el ejercicio`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ejercicio: Ejercicio) => {
    setEditingEjercicio(ejercicio);
    setIsEditing(true);
    form.reset({
      nombre: ejercicio.nombre,
      descripcion: ejercicio.descripcion || "",
      grupoMuscularId:
        ejercicio.grupoMuscular?.id_grupo_muscular.toString() || "",
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingEjercicio(null);
    form.reset();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este ejercicio?"))
      return;

    try {
      const response = await fetch(`/api/ejercicios/${id}`, {
        method: "DELETE",
      });
      if (response.ok) fetchEjercicios();
      else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch {
      alert("Error al eliminar el ejercicio");
    }
  };

  return (
    <div ref={formRef} className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEditing ? "Editar Ejercicio" : "Nuevo Ejercicio"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Modifica los datos del ejercicio seleccionado"
              : "Completa los datos del ejercicio que deseas agregar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Ejercicio *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Press de banca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descripción del ejercicio (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grupoMuscularId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo Muscular *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={isLoadingGrupos}
                      >
                        <option value="">
                          {isLoadingGrupos
                            ? "Cargando..."
                            : "Selecciona un grupo muscular"}
                        </option>
                        {grupos.map((grupo) => (
                          <option
                            key={grupo.id_grupo_muscular}
                            value={grupo.id_grupo_muscular}
                          >
                            {grupo.nombre}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {success && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-md">
                  <Check className="h-4 w-4" />
                  <span>
                    ¡Ejercicio {isEditing ? "actualizado" : "creado"}{" "}
                    exitosamente!
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading
                    ? isEditing
                      ? "Actualizando..."
                      : "Creando..."
                    : isEditing
                      ? "Actualizar Ejercicio"
                      : "Crear Ejercicio"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <h4 className="text-2xl font-bold">Lista de Ejercicios</h4>
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar ejercicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Mostrando {ejerciciosFiltrados.length} de {ejercicios.length}{" "}
            ejercicios
          </p>
        </CardContent>
      </Card>

      <ListaEjercicios
        isLoadingEjercicios={isLoadingEjercicios}
        ejerciciosFiltrados={ejerciciosFiltrados}
        searchTerm={searchTerm}
        editingEjercicio={editingEjercicio}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
}
