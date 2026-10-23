-- CreateTable
CREATE TABLE "shop" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "installiert_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deinstalliert_am" TIMESTAMP(3),

    CONSTRAINT "shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artikel" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopify_produkt_id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "artikelart" TEXT NOT NULL,
    "schnitt" TEXT NOT NULL,
    "schnitt_quelle" TEXT NOT NULL,
    "material_dehnung_prozent" DOUBLE PRECISION NOT NULL,
    "material_zusammensetzung" TEXT,
    "tailliert" BOOLEAN NOT NULL DEFAULT false,
    "bund_typ" TEXT,
    "aermel_typ" TEXT,
    "messhoehe_brust_cm" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "status" TEXT NOT NULL DEFAULT 'entwurf',
    "aktualisiert_am" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artikel_groesse" (
    "id" SERIAL NOT NULL,
    "artikel_id" INTEGER NOT NULL,
    "groesse" TEXT NOT NULL,
    "shopify_variante_id" TEXT,
    "reihenfolge" INTEGER NOT NULL,
    "brust" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "huefte" DOUBLE PRECISION,
    "oberschenkel" DOUBLE PRECISION,
    "oberarm" DOUBLE PRECISION,
    "schulter" DOUBLE PRECISION,
    "armlaenge" DOUBLE PRECISION,
    "gesamtlaenge" DOUBLE PRECISION,

    CONSTRAINT "artikel_groesse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vermessung" (
    "id" SERIAL NOT NULL,
    "artikel_id" INTEGER NOT NULL,
    "team_mitglied_id" INTEGER,
    "quelle" TEXT NOT NULL,
    "erfasst_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vermessung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_mitglied" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwort_hash" TEXT,
    "totp_geheimnis" TEXT,
    "totp_aktiv" BOOLEAN NOT NULL DEFAULT false,
    "letzter_totp_schritt" INTEGER,
    "fehlversuche" INTEGER NOT NULL DEFAULT 0,
    "gesperrt_bis" TIMESTAMP(3),
    "einrichtung_token_hash" TEXT,
    "einrichtung_gueltig_bis" TIMESTAMP(3),
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "letzte_anmeldung" TIMESTAMP(3),

    CONSTRAINT "team_mitglied_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_sitzung" (
    "id" SERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "mitglied_id" INTEGER NOT NULL,
    "gueltig_bis" TIMESTAMP(3) NOT NULL,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_sitzung_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_domain_key" ON "shop"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "artikel_shop_id_shopify_produkt_id_key" ON "artikel"("shop_id", "shopify_produkt_id");

-- CreateIndex
CREATE UNIQUE INDEX "artikel_groesse_artikel_id_groesse_key" ON "artikel_groesse"("artikel_id", "groesse");

-- CreateIndex
CREATE UNIQUE INDEX "team_mitglied_email_key" ON "team_mitglied"("email");

-- CreateIndex
CREATE UNIQUE INDEX "team_mitglied_einrichtung_token_hash_key" ON "team_mitglied"("einrichtung_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "team_sitzung_token_hash_key" ON "team_sitzung"("token_hash");

-- AddForeignKey
ALTER TABLE "artikel" ADD CONSTRAINT "artikel_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artikel_groesse" ADD CONSTRAINT "artikel_groesse_artikel_id_fkey" FOREIGN KEY ("artikel_id") REFERENCES "artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vermessung" ADD CONSTRAINT "vermessung_artikel_id_fkey" FOREIGN KEY ("artikel_id") REFERENCES "artikel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vermessung" ADD CONSTRAINT "vermessung_team_mitglied_id_fkey" FOREIGN KEY ("team_mitglied_id") REFERENCES "team_mitglied"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_sitzung" ADD CONSTRAINT "team_sitzung_mitglied_id_fkey" FOREIGN KEY ("mitglied_id") REFERENCES "team_mitglied"("id") ON DELETE CASCADE ON UPDATE CASCADE;
