-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('hombre', 'mujer');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "grupos_musculares" (
    "id_grupo_muscular" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "grupos_musculares_pkey" PRIMARY KEY ("id_grupo_muscular")
);

-- CreateTable
CREATE TABLE "ejercicios" (
    "id_ejercicio" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "grupoMuscularId" INTEGER NOT NULL,

    CONSTRAINT "ejercicios_pkey" PRIMARY KEY ("id_ejercicio")
);

-- CreateTable
CREATE TABLE "rutinas" (
    "id_rutina" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "genero" "Genero" NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "rutinas_pkey" PRIMARY KEY ("id_rutina")
);

-- CreateTable
CREATE TABLE "rutina_ejercicios" (
    "id" SERIAL NOT NULL,
    "rutinaId" INTEGER NOT NULL,
    "ejercicioId" INTEGER NOT NULL,
    "series" INTEGER,
    "repeticiones" INTEGER,
    "orden" INTEGER,

    CONSTRAINT "rutina_ejercicios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_nombre_key" ON "usuarios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_musculares_nombre_key" ON "grupos_musculares"("nombre");

-- AddForeignKey
ALTER TABLE "ejercicios" ADD CONSTRAINT "ejercicios_grupoMuscularId_fkey" FOREIGN KEY ("grupoMuscularId") REFERENCES "grupos_musculares"("id_grupo_muscular") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutina_ejercicios" ADD CONSTRAINT "rutina_ejercicios_rutinaId_fkey" FOREIGN KEY ("rutinaId") REFERENCES "rutinas"("id_rutina") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutina_ejercicios" ADD CONSTRAINT "rutina_ejercicios_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "ejercicios"("id_ejercicio") ON DELETE CASCADE ON UPDATE CASCADE;
