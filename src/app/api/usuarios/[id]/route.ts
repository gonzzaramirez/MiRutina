import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET - Obtener un usuario por ID
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

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true, nombre: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error: unknown) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un usuario
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

    const { nombre, password } = await request.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: "El nombre y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const usuario = await prisma.usuario.update({
      where: { id_usuario: id },
      data: { nombre, password: passwordHash },
      select: { id_usuario: true, nombre: true },
    });

    return NextResponse.json(usuario);
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un usuario
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

    await prisma.usuario.delete({
      where: { id_usuario: id },
    });

    return NextResponse.json({ message: "Usuario eliminado correctamente" });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
