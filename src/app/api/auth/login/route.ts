import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { nombre, password } = await request.json();

    if (!nombre || !password) {
      return NextResponse.json(
        { error: "El nombre y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { nombre },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET no está definido");
      return NextResponse.json(
        { error: "Configuración inválida" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { sub: usuario.id_usuario, nombre: usuario.nombre },
      secret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { id_usuario: usuario.id_usuario, nombre: usuario.nombre },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // logout: limpiar cookie
  const response = NextResponse.json({ message: "Sesión cerrada" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
