import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre: "asc" },
      select: { id_usuario: true, nombre: true },
    });
    return NextResponse.json(usuarios);
  } catch (error: unknown) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const { nombre, password } = await request.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: "El nombre y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: { nombre, password: passwordHash },
      select: { id_usuario: true, nombre: true },
    });

    return NextResponse.json(usuario, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese nombre" },
        { status: 409 }
      );
    }
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
