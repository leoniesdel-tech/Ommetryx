-- CreateTable
CREATE TABLE "mess_artikel" (
    "id" SERIAL NOT NULL,
    "herkunft" TEXT NOT NULL,
    "online_shop" TEXT NOT NULL,
    "marke" TEXT,
    "produktname" TEXT NOT NULL,
    "link" TEXT,
    "notiz" TEXT,
    "kategorie" TEXT NOT NULL,
    "schnitt" TEXT NOT NULL,
    "material_dehnung_prozent" DOUBLE PRECISION NOT NULL,
    "material_zusammensetzung" TEXT,
    "tailliert" BOOLEAN NOT NULL DEFAULT false,
    "bund_typ" TEXT,
    "aermel_typ" TEXT,
    "messhoehe_brust_cm" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendert_am" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mess_artikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mess_groesse" (
    "id" SERIAL NOT NULL,
    "artikel_id" INTEGER NOT NULL,
    "groesse" TEXT NOT NULL,
    "reihenfolge" INTEGER NOT NULL,
    "brust" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "huefte" DOUBLE PRECISION,
    "oberschenkel" DOUBLE PRECISION,
    "oberarm" DOUBLE PRECISION,
    "schulter" DOUBLE PRECISION,
    "armlaenge" DOUBLE PRECISION,
    "gesamtlaenge" DOUBLE PRECISION,
    "gemessen_von_id" INTEGER,
    "gemessen_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mess_groesse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mess_artikel_kategorie_idx" ON "mess_artikel"("kategorie");

-- CreateIndex
CREATE INDEX "mess_artikel_online_shop_idx" ON "mess_artikel"("online_shop");

-- CreateIndex
CREATE INDEX "mess_groesse_groesse_idx" ON "mess_groesse"("groesse");

-- CreateIndex
CREATE UNIQUE INDEX "mess_groesse_artikel_id_groesse_key" ON "mess_groesse"("artikel_id", "groesse");

-- AddForeignKey
ALTER TABLE "mess_groesse" ADD CONSTRAINT "mess_groesse_artikel_id_fkey" FOREIGN KEY ("artikel_id") REFERENCES "mess_artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mess_groesse" ADD CONSTRAINT "mess_groesse_gemessen_von_id_fkey" FOREIGN KEY ("gemessen_von_id") REFERENCES "team_mitglied"("id") ON DELETE SET NULL ON UPDATE CASCADE;
