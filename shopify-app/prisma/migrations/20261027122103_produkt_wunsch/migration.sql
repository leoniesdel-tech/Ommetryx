-- CreateTable
CREATE TABLE "produkt_wunsch" (
    "id" SERIAL NOT NULL,
    "shop_id" INTEGER NOT NULL,
    "shopify_produkt_id" TEXT NOT NULL,
    "wunsch" TEXT NOT NULL,
    "geaendert_am" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produkt_wunsch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "produkt_wunsch_shop_id_shopify_produkt_id_key" ON "produkt_wunsch"("shop_id", "shopify_produkt_id");

-- AddForeignKey
ALTER TABLE "produkt_wunsch" ADD CONSTRAINT "produkt_wunsch_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
