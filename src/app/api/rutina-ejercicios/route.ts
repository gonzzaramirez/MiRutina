import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los ejercicios de rutina
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rutinaId = searchParams.get("rutinaId");

    if (rutinaId) {
      const id = parseInt(rutinaId);
      if (isNaN(id)) {
        return NextResponse.json(
          { error: "ID de rutina inválido" },
          { status: 400 }
        );
      }

      const rutinaEjercicios = await prisma.rutinaEjercicio.findMany({
        where: { rutinaId: id },
        include: {
          ejercicio: true,
          rutina: true,
        },
        orderBy: { orden: "asc" },
      });

      return NextResponse.json(rutinaEjercicios);
    }

    // Si no se especifica rutinaId, obtener todos
    const rutinaEjercicios = await prisma.rutinaEjercicio.findMany({
      include: {
        ejercicio: true,
        rutina: true,
      },
      orderBy: { orden: "asc" },
    });

    return NextResponse.json(rutinaEjercicios);
  } catch (error: unknown) {
    console.error("Error al obtener ejercicios de rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo ejercicio de rutina
export async function POST(request: NextRequest) {
  try {
    const { rutinaId, ejercicioId, series, repeticiones, orden } =
      await request.json();

    if (!rutinaId || !ejercicioId) {
      return NextResponse.json(
        { error: "El ID de rutina y ejercicio son obligatorios" },
        { status: 400 }
      );
    }

    // Verificar que la rutina y el ejercicio existen
    const rutina = await prisma.rutina.findUnique({
      where: { id_rutina: rutinaId },
    });

    if (!rutina) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    const ejercicio = await prisma.ejercicio.findUnique({
      where: { id_ejercicio: ejercicioId },
    });

    if (!ejercicio) {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }

    // Evitar duplicados: una rutina no puede tener el mismo ejercicio dos veces
    const exists = await prisma.rutinaEjercicio.findFirst({
      where: { rutinaId, ejercicioId },
      select: { id: true },
    });
    if (exists) {
      return NextResponse.json(
        { error: "La rutina ya contiene este ejercicio" },
        { status: 409 }
      );
    }

    const rutinaEjercicio = await prisma.rutinaEjercicio.create({
      data: {
        rutinaId,
        ejercicioId,
        series: series || null,
        repeticiones: repeticiones || null,
        orden: orden || null,
      },
      include: {
        ejercicio: true,
        rutina: true,
      },
    });

    return NextResponse.json(rutinaEjercicio, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { error: "La rutina ya contiene este ejercicio" },
        { status: 409 }
      );
    }
    console.error("Error al crear ejercicio de rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
