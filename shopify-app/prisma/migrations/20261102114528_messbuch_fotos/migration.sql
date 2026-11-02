-- CreateTable
CREATE TABLE "mess_foto" (
    "id" SERIAL NOT NULL,
    "groesse_id" INTEGER NOT NULL,
    "datei" TEXT NOT NULL,
    "typ" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "breite" INTEGER NOT NULL,
    "hoehe" INTEGER NOT NULL,
    "kamera" TEXT,
    "hochgeladen_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mess_foto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mess_foto_groesse_id_key" ON "mess_foto"("groesse_id");

-- AddForeignKey
ALTER TABLE "mess_foto" ADD CONSTRAINT "mess_foto_groesse_id_fkey" FOREIGN KEY ("groesse_id") REFERENCES "mess_groesse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
