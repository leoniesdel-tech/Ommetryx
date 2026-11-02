/*
  Warnings:

  - Made the column `material_zusammensetzung` on table `mess_artikel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "mess_artikel" ALTER COLUMN "material_dehnung_prozent" DROP NOT NULL,
ALTER COLUMN "material_zusammensetzung" SET NOT NULL;
