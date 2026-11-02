-- CreateTable
CREATE TABLE "kleidungs_archiv" (
    "id" SERIAL NOT NULL,
    "artikelart" TEXT NOT NULL,
    "schnitt" TEXT NOT NULL,
    "material_dehnung_prozent" DOUBLE PRECISION NOT NULL,
    "material_zusammensetzung" TEXT,
    "tailliert" BOOLEAN NOT NULL,
    "bund_typ" TEXT,
    "aermel_typ" TEXT,
    "messhoehe_brust_cm" DOUBLE PRECISION NOT NULL,
    "groessen" JSONB NOT NULL,
    "archiviert_im_monat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kleidungs_archiv_pkey" PRIMARY KEY ("id")
);
