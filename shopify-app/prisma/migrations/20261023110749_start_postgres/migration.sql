-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_version" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT false,
    "quelle" TEXT NOT NULL,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "konfig_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_bereich" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "kategorie_id" TEXT NOT NULL,
    "kategorie" TEXT NOT NULL,
    "messpunkt" TEXT NOT NULL,
    "passform" TEXT NOT NULL,
    "unter" DOUBLE PRECISION NOT NULL,
    "ober" DOUBLE PRECISION NOT NULL,
    "einheit" TEXT NOT NULL,
    "referenz_dehnungsklasse" INTEGER NOT NULL,
    "vertrauen" TEXT,
    "quelle" TEXT,

    CONSTRAINT "konfig_bereich_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_mindest" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "kategorie_id" TEXT NOT NULL,
    "messpunkt" TEXT NOT NULL,
    "mindest_cm_klasse0" DOUBLE PRECISION NOT NULL,
    "hinweis" TEXT,
    "quelle" TEXT,
    "vertrauen" TEXT,

    CONSTRAINT "konfig_mindest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_dehnungsklasse" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "klasse" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dehnung_von" DOUBLE PRECISION NOT NULL,
    "dehnung_bis" DOUBLE PRECISION,
    "beispiele" TEXT,

    CONSTRAINT "konfig_dehnungsklasse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_dehnungskorrektur" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "klasse" INTEGER NOT NULL,
    "koerpernah" DOUBLE PRECISION,
    "regulaer" DOUBLE PRECISION,
    "locker" DOUBLE PRECISION,
    "oversized" DOUBLE PRECISION,

    CONSTRAINT "konfig_dehnungskorrektur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_gewicht" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "kategorie" TEXT NOT NULL,
    "brust" DOUBLE PRECISION,
    "taille" DOUBLE PRECISION,
    "huefte" DOUBLE PRECISION,
    "oberschenkel" DOUBLE PRECISION,
    "oberarm" DOUBLE PRECISION,

    CONSTRAINT "konfig_gewicht_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_parameter" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "schluessel" TEXT NOT NULL,
    "wert" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "konfig_parameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "konfig_ergaenzung" (
    "version_id" INTEGER NOT NULL,
    "daten" JSONB NOT NULL,

    CONSTRAINT "konfig_ergaenzung_pkey" PRIMARY KEY ("version_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "konfig_version_name_key" ON "konfig_version"("name");

-- CreateIndex
CREATE UNIQUE INDEX "konfig_bereich_version_id_kategorie_id_messpunkt_passform_key" ON "konfig_bereich"("version_id", "kategorie_id", "messpunkt", "passform");

-- CreateIndex
CREATE UNIQUE INDEX "konfig_mindest_version_id_kategorie_id_messpunkt_key" ON "konfig_mindest"("version_id", "kategorie_id", "messpunkt");

-- CreateIndex
CREATE UNIQUE INDEX "konfig_dehnungsklasse_version_id_klasse_key" ON "konfig_dehnungsklasse"("version_id", "klasse");

-- CreateIndex
CREATE UNIQUE INDEX "konfig_dehnungskorrektur_version_id_klasse_key" ON "konfig_dehnungskorrektur"("version_id", "klasse");

-- CreateIndex
CREATE UNIQUE INDEX "konfig_gewicht_version_id_kategorie_key" ON "konfig_gewicht"("version_id", "kategorie");

-- CreateIndex
CREATE UNIQUE INDEX "konfig_parameter_version_id_schluessel_key" ON "konfig_parameter"("version_id", "schluessel");

-- AddForeignKey
ALTER TABLE "konfig_bereich" ADD CONSTRAINT "konfig_bereich_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "konfig_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konfig_mindest" ADD CONSTRAINT "konfig_mindest_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "konfig_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konfig_dehnungsklasse" ADD CONSTRAINT "konfig_dehnungsklasse_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "konfig_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konfig_dehnungskorrektur" ADD CONSTRAINT "konfig_dehnungskorrektur_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "konfig_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konfig_gewicht" ADD CONSTRAINT "konfig_gewicht_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "konfig_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konfig_parameter" ADD CONSTRAINT "konfig_parameter_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "konfig_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "konfig_ergaenzung" ADD CONSTRAINT "konfig_ergaenzung_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "konfig_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;
