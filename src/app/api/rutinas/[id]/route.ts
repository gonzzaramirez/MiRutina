import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DateUtils } from "@/lib/dateUtils";

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
        fecha: new Date(DateUtils.toISOString(fecha)),
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

// POST - Duplicar una rutina a otra fecha
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { fecha: nuevaFecha } = await request.json();
    if (!nuevaFecha) {
      return NextResponse.json(
        { error: "La fecha destino es obligatoria" },
        { status: 400 }
      );
    }

    const origen = await prisma.rutina.findUnique({
      where: { id_rutina: id },
      include: {
        ejercicios: true,
      },
    });
    if (!origen) {
      return NextResponse.json(
        { error: "Rutina no encontrada" },
        { status: 404 }
      );
    }

    // Crear nueva rutina clonando datos básicos
    const nueva = await prisma.rutina.create({
      data: {
        fecha: new Date(DateUtils.toISOString(nuevaFecha)),
        genero: origen.genero,
        descripcion: origen.descripcion,
      },
    });

    // Clonar ejercicios asociados
    if (origen.ejercicios.length > 0) {
      await prisma.rutinaEjercicio.createMany({
        data: origen.ejercicios.map((re) => ({
          rutinaId: nueva.id_rutina,
          ejercicioId: re.ejercicioId,
          series: re.series ?? null,
          repeticiones: re.repeticiones ?? null,
          orden: re.orden ?? null,
        })),
        skipDuplicates: true,
      });
    }

    const nuevaConEjercicios = await prisma.rutina.findUnique({
      where: { id_rutina: nueva.id_rutina },
      include: {
        ejercicios: {
          include: { ejercicio: true },
          orderBy: { orden: "asc" },
        },
      },
    });

    return NextResponse.json(nuevaConEjercicios, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al duplicar rutina:", error);
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
