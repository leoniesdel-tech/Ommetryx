-- CreateTable
CREATE TABLE "nutzung_tag" (
    "shop_id" INTEGER NOT NULL,
    "tag" DATE NOT NULL,
    "art" TEXT NOT NULL,
    "anzahl" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "nutzung_tag_pkey" PRIMARY KEY ("shop_id","tag","art")
);

-- AddForeignKey
ALTER TABLE "nutzung_tag" ADD CONSTRAINT "nutzung_tag_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
