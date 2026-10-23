// Prüfen der URL-Teile im internen Bereich.

export function pruefeShop(shop: string | undefined): string {
  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    throw new Response("Shop nicht gefunden", { status: 404 });
  }
  return shop;
}

export function produktGid(id: string | undefined): string {
  if (!id || !/^\d+$/.test(id)) throw new Response("Produkt nicht gefunden", { status: 404 });
  return `gid://shopify/Product/${id}`;
}

export function produktNummer(gid: string): string {
  return gid.split("/").pop() ?? "";
}
