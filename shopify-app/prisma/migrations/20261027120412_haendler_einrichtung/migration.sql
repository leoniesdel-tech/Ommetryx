-- AlterTable
ALTER TABLE "shop" ADD COLUMN     "avv_bestaetigt_am" TIMESTAMP(3),
ADD COLUMN     "avv_version" TEXT,
ADD COLUMN     "einrichtung_ausgeblendet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position_geprueft_am" TIMESTAMP(3);
