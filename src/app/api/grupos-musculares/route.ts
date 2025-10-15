import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener todos los grupos musculares
export async function GET() {
  try {
    const grupos = await prisma.grupoMuscular.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(grupos);
  } catch (error: unknown) {
    console.error("Error al obtener grupos musculares:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo grupo muscular
export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const grupo = await prisma.grupoMuscular.create({
      data: { nombre },
    });

    return NextResponse.json(grupo, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un grupo muscular con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error al crear grupo muscular:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
