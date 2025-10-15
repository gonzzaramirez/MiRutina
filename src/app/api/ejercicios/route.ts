import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los ejercicios
export async function GET() {
  try {
    const ejercicios = await prisma.ejercicio.findMany({
      include: {
        grupoMuscular: true,
      },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(ejercicios);
  } catch (error: unknown) {
    console.error("Error al obtener ejercicios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo ejercicio
export async function POST(request: NextRequest) {
  try {
    const { nombre, descripcion, grupoMuscularId } = await request.json();

    if (!nombre || !grupoMuscularId) {
      return NextResponse.json(
        { error: "El nombre y grupo muscular son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar que el grupo muscular existe
    const grupoMuscular = await prisma.grupoMuscular.findUnique({
      where: { id_grupo_muscular: parseInt(grupoMuscularId) },
    });

    if (!grupoMuscular) {
      return NextResponse.json(
        { error: "Grupo muscular no encontrado" },
        { status: 404 }
      );
    }

    const ejercicio = await prisma.ejercicio.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        grupoMuscularId: parseInt(grupoMuscularId),
      },
      include: {
        grupoMuscular: true,
      },
    });

    return NextResponse.json(ejercicio, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear ejercicio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
