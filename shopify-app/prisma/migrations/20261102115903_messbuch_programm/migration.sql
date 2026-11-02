-- CreateTable
CREATE TABLE "mess_programm_messung" (
    "id" SERIAL NOT NULL,
    "groesse_id" INTEGER NOT NULL,
    "brust" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "huefte" DOUBLE PRECISION,
    "oberschenkel" DOUBLE PRECISION,
    "oberarm" DOUBLE PRECISION,
    "schulter" DOUBLE PRECISION,
    "armlaenge" DOUBLE PRECISION,
    "gesamtlaenge" DOUBLE PRECISION,
    "programm_version" TEXT,
    "importiert_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mess_programm_messung_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mess_programm_messung_groesse_id_key" ON "mess_programm_messung"("groesse_id");

-- AddForeignKey
ALTER TABLE "mess_programm_messung" ADD CONSTRAINT "mess_programm_messung_groesse_id_fkey" FOREIGN KEY ("groesse_id") REFERENCES "mess_groesse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
