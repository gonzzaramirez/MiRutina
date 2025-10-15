import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Obtener un ejercicio de rutina por ID
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

    const rutinaEjercicio = await prisma.rutinaEjercicio.findUnique({
      where: { id: id },
      include: {
        ejercicio: true,
        rutina: true,
      },
    });

    if (!rutinaEjercicio) {
      return NextResponse.json(
        { error: "Ejercicio de rutina no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(rutinaEjercicio);
  } catch (error: unknown) {
    console.error("Error al obtener ejercicio de rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un ejercicio de rutina
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

    const { series, repeticiones, orden } = await request.json();

    const rutinaEjercicio = await prisma.rutinaEjercicio.update({
      where: { id: id },
      data: {
        series: series !== undefined ? series : null,
        repeticiones: repeticiones !== undefined ? repeticiones : null,
        orden: orden !== undefined ? orden : null,
      },
      include: {
        ejercicio: true,
        rutina: true,
      },
    });

    return NextResponse.json(rutinaEjercicio);
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Ejercicio de rutina no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error al actualizar ejercicio de rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un ejercicio de rutina
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

    await prisma.rutinaEjercicio.delete({
      where: { id: id },
    });

    return NextResponse.json({
      message: "Ejercicio de rutina eliminado correctamente",
    });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Ejercicio de rutina no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error al eliminar ejercicio de rutina:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
