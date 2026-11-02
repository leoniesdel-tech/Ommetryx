-- CreateTable
CREATE TABLE "muster_sendung" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "art" TEXT NOT NULL,
    "anzahl_artikel" INTEGER NOT NULL,
    "nachricht" TEXT,
    "status" TEXT NOT NULL DEFAULT 'angemeldet',
    "sendungsnummer" TEXT,
    "erstellt_am" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geaendert_am" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "muster_sendung_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "muster_sendung_shop_id_erstellt_am_idx" ON "muster_sendung"("shop_id", "erstellt_am");

-- AddForeignKey
ALTER TABLE "muster_sendung" ADD CONSTRAINT "muster_sendung_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
