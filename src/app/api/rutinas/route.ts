import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DateUtils } from "@/lib/dateUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fecha = searchParams.get("fecha");
    const genero = searchParams.get("genero");

    const whereClause: Record<string, unknown> = {};

    if (fecha) {
      if (!DateUtils.isValidDate(fecha)) {
        return NextResponse.json(
          { error: "Formato de fecha inválido" },
          { status: 400 }
        );
      }

      const dateRange = DateUtils.createDateRange(fecha);
      whereClause.fecha = {
        gte: new Date(dateRange.start),
        lte: new Date(dateRange.end),
      };
    }

    if (genero) {
      whereClause.genero = genero;
    }

    const rutinas = await prisma.rutina.findMany({
      where: whereClause,
      include: {
        ejercicios: {
          include: {
            ejercicio: {
              include: {
                grupoMuscular: true,
              },
            },
          },
          orderBy: { orden: "asc" },
        },
      },
      orderBy: { fecha: "desc" },
    });
    return NextResponse.json(rutinas);
  } catch (error: unknown) {
    console.error("Error al obtener rutinas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fecha, genero, descripcion } = await request.json();

    if (!fecha || !genero) {
      return NextResponse.json(
        { error: "La fecha y el género son obligatorios" },
        { status: 400 }
      );
    }

    if (!["hombre", "mujer"].includes(genero)) {
      return NextResponse.json(
        { error: "El género debe ser 'hombre' o 'mujer'" },
        { status: 400 }
      );
    }

    if (!DateUtils.isValidDate(fecha)) {
      return NextResponse.json(
        { error: "Formato de fecha inválido" },
        { status: 400 }
      );
    }

    const rutina = await prisma.rutina.create({
      data: {
        fecha: new Date(DateUtils.toISOString(fecha)),
        genero: genero as "hombre" | "mujer",
        descripcion: descripcion || null,
      },
      include: {
        ejercicios: {
          include: {
            ejercicio: {
              include: {
                grupoMuscular: true,
              },
            },
          },
          orderBy: { orden: "asc" },
        },
      },
    });

    return NextResponse.json(rutina, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
