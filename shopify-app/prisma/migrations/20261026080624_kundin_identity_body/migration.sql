-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "body";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateTable
CREATE TABLE "identity"."kundin" (
    "id" TEXT NOT NULL,
    "email_verschluesselt" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "letzte_aktivitaet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "erinnert_am" TIMESTAMP(3),

    CONSTRAINT "kundin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."zuordnung" (
    "kundin_id" TEXT NOT NULL,
    "pseudonym_id" TEXT NOT NULL,

    CONSTRAINT "zuordnung_pkey" PRIMARY KEY ("kundin_id")
);

-- CreateTable
CREATE TABLE "identity"."login_code" (
    "id" SERIAL NOT NULL,
    "email_hash" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "gueltig_bis" TIMESTAMP(3) NOT NULL,
    "verbraucht" BOOLEAN NOT NULL DEFAULT false,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."login_schutz" (
    "email_hash" TEXT NOT NULL,
    "fehlversuche" INTEGER NOT NULL DEFAULT 0,
    "gesperrt_bis" TIMESTAMP(3),
    "anforderungen" INTEGER NOT NULL DEFAULT 0,
    "anforderungen_seit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_schutz_pkey" PRIMARY KEY ("email_hash")
);

-- CreateTable
CREATE TABLE "identity"."kundin_sitzung" (
    "id" SERIAL NOT NULL,
    "token_hash" TEXT NOT NULL,
    "kundin_id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "gueltig_bis" TIMESTAMP(3) NOT NULL,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kundin_sitzung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."einwilligung" (
    "id" SERIAL NOT NULL,
    "kundin_id" TEXT,
    "zweck" TEXT NOT NULL,
    "textversion" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "mindestens_16" BOOLEAN NOT NULL,
    "erteilt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "widerrufen_am" TIMESTAMP(3),

    CONSTRAINT "einwilligung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."shop_verknuepfung" (
    "kundin_id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "erste_nutzung" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "letzte_nutzung" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shop_verknuepfung_pkey" PRIMARY KEY ("kundin_id","shop")
);

-- CreateTable
CREATE TABLE "identity"."entwicklungs_mail" (
    "id" SERIAL NOT NULL,
    "an" TEXT NOT NULL,
    "betreff" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entwicklungs_mail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body"."koerperprofil" (
    "pseudonym_id" TEXT NOT NULL,
    "daten" TEXT NOT NULL,
    "aktualisiert_am" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "koerperprofil_pkey" PRIMARY KEY ("pseudonym_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kundin_email_hash_key" ON "identity"."kundin"("email_hash");

-- CreateIndex
CREATE UNIQUE INDEX "zuordnung_pseudonym_id_key" ON "identity"."zuordnung"("pseudonym_id");

-- CreateIndex
CREATE INDEX "login_code_email_hash_idx" ON "identity"."login_code"("email_hash");

-- CreateIndex
CREATE UNIQUE INDEX "kundin_sitzung_token_hash_key" ON "identity"."kundin_sitzung"("token_hash");

-- CreateIndex
CREATE INDEX "einwilligung_kundin_id_idx" ON "identity"."einwilligung"("kundin_id");

-- AddForeignKey
ALTER TABLE "identity"."zuordnung" ADD CONSTRAINT "zuordnung_kundin_id_fkey" FOREIGN KEY ("kundin_id") REFERENCES "identity"."kundin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."kundin_sitzung" ADD CONSTRAINT "kundin_sitzung_kundin_id_fkey" FOREIGN KEY ("kundin_id") REFERENCES "identity"."kundin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."einwilligung" ADD CONSTRAINT "einwilligung_kundin_id_fkey" FOREIGN KEY ("kundin_id") REFERENCES "identity"."kundin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."shop_verknuepfung" ADD CONSTRAINT "shop_verknuepfung_kundin_id_fkey" FOREIGN KEY ("kundin_id") REFERENCES "identity"."kundin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
