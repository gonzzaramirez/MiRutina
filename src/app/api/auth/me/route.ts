import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET no está definido");
    return NextResponse.json(
      { error: "Configuración inválida" },
      { status: 500 }
    );
  }

  try {
    const decoded = jwt.verify(token, secret);
    const subValue = typeof decoded === "string" ? undefined : decoded.sub;
    const userId =
      typeof subValue === "string"
        ? parseInt(subValue, 10)
        : typeof subValue === "number"
        ? subValue
        : undefined;

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: { id_usuario: true, nombre: true },
    });

    if (!usuario) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, usuario });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
