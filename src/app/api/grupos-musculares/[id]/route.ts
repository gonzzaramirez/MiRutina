import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface PrismaError {
  code?: string;
  message?: string;
}

// GET - Obtener un grupo muscular por ID
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

    const grupo = await prisma.grupoMuscular.findUnique({
      where: { id_grupo_muscular: id },
      include: {
        ejercicios: true,
      },
    });

    if (!grupo) {
      return NextResponse.json(
        { error: "Grupo muscular no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(grupo);
  } catch (error: unknown) {
    console.error("Error al obtener grupo muscular:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un grupo muscular
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

    const { nombre } = await request.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const grupo = await prisma.grupoMuscular.update({
      where: { id_grupo_muscular: id },
      data: { nombre },
    });

    return NextResponse.json(grupo);
  } catch (error: unknown) {
    if ((error as PrismaError)?.code === "P2025") {
      return NextResponse.json(
        { error: "Grupo muscular no encontrado" },
        { status: 404 }
      );
    }
    if ((error as PrismaError)?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un grupo muscular con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error al actualizar grupo muscular:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un grupo muscular
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

    await prisma.grupoMuscular.delete({
      where: { id_grupo_muscular: id },
    });

    return NextResponse.json({
      message: "Grupo muscular eliminado correctamente",
    });
  } catch (error: unknown) {
    if ((error as PrismaError)?.code === "P2025") {
      return NextResponse.json(
        { error: "Grupo muscular no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error al eliminar grupo muscular:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
