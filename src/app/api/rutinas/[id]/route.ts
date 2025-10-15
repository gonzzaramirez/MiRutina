import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener una rutina por ID
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

    const rutina = await prisma.rutina.findUnique({
      where: { id_rutina: id },
      include: {
        ejercicios: {
          include: {
            ejercicio: true,
          },
          orderBy: { orden: "asc" },
        },
      },
    });

    if (!rutina) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(rutina);
  } catch (error: unknown) {
    console.error("Error al obtener rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una rutina
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

    const rutina = await prisma.rutina.update({
      where: { id_rutina: id },
      data: {
        fecha: new Date(fecha),
        genero: genero as "hombre" | "mujer",
        descripcion: descripcion || null,
      },
      include: {
        ejercicios: {
          include: {
            ejercicio: true,
          },
          orderBy: { orden: "asc" },
        },
      },
    });

    return NextResponse.json(rutina);
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }
    console.error("Error al actualizar rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una rutina
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

    await prisma.rutina.delete({
      where: { id_rutina: id },
    });

    return NextResponse.json({ message: "Rutina eliminada correctamente" });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }
    console.error("Error al eliminar rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
