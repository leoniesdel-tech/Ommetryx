// Gemeinsame Admin-GraphQL-Hilfen für den Händler-Bereich.

export interface AdminGraphql {
  graphql: (abfrage: string, optionen?: { variables?: Record<string, unknown> }) => Promise<Response>;
}

interface GraphqlAntwort<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function frage<T>(admin: AdminGraphql, abfrage: string, variables?: Record<string, unknown>): Promise<T> {
  const antwort = await admin.graphql(abfrage, variables ? { variables } : undefined);
  const json = (await antwort.json()) as GraphqlAntwort<T>;
  if (!json.data) throw new Error("Shopify-Abfrage fehlgeschlagen");
  return json.data;
}

/**
 * App-Metafeld setzen (Owner: diese App-Installation). Der App-Block liest es mit
 * app.metafields.ommetryx.<key>. Shopify löscht diese Metafelder bei der Deinstallation selbst.
 */
export async function setzeAppMetafeld(admin: AdminGraphql, key: string, type: "boolean" | "json", value: string) {
  const { currentAppInstallation } = await frage<{ currentAppInstallation: { id: string } }>(admin, `#graphql
    query AppInstallation { currentAppInstallation { id } }`);
  const daten = await frage<{ metafieldsSet: { userErrors: { message: string }[] } }>(
    admin,
    `#graphql
      mutation AppMetafeld($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) { userErrors { message } }
      }`,
    { metafields: [{ ownerId: currentAppInstallation.id, namespace: "ommetryx", key, type, value }] },
  );
  if (daten.metafieldsSet.userErrors.length > 0) throw new Error("App-Metafeld konnte nicht gesetzt werden");
}
