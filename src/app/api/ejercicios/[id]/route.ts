import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface PrismaError {
  code?: string;
  message?: string;
}

// GET - Obtener un ejercicio por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const ejercicio = await prisma.ejercicio.findUnique({
      where: { id_ejercicio: id },
    });

    if (!ejercicio) {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(ejercicio);
  } catch (error: unknown) {
    console.error("Error al obtener ejercicio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un ejercicio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { nombre, descripcion, grupoMuscularId } = await request.json();

    if (!nombre || !grupoMuscularId) {
      return NextResponse.json(
        { error: "El nombre y grupo muscular son obligatorios" },
        { status: 400 }
      );
    }

    const ejercicio = await prisma.ejercicio.update({
      where: { id_ejercicio: id },
      data: {
        nombre,
        descripcion: descripcion || null,
        grupoMuscularId: parseInt(grupoMuscularId),
      },
      include: {
        grupoMuscular: true,
      },
    });

    return NextResponse.json(ejercicio);
  } catch (error: unknown) {
    if ((error as PrismaError)?.code === "P2025") {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error al actualizar ejercicio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un ejercicio
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.ejercicio.delete({
      where: { id_ejercicio: id },
    });

    return NextResponse.json({ message: "Ejercicio eliminado correctamente" });
  } catch (error: unknown) {
    if ((error as PrismaError)?.code === "P2025") {
      return NextResponse.json(
        { error: "Ejercicio no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error al eliminar ejercicio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
