// Ablage der Messbuch-Fotos: vorerst ein Ordner auf dem Rechner, nicht im Repo.
// Für den Server braucht es später einen dauerhaften Speicher, dann ändert sich nur diese Datei.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const NAME = /^[0-9a-f-]{36}\.(jpg|png)$/;

const ordner = () => process.env.OX_FOTO_ORDNER ?? path.resolve("daten/messfotos");

function pfad(name: string) {
  if (!NAME.test(name)) throw new Error("Ungültiger Dateiname");
  return path.join(ordner(), name);
}

/** Speichert die Datei unter einem Zufallsnamen und gibt ihn zurück. */
export async function legeFotoAb(daten: Buffer, endung: string): Promise<string> {
  const name = `${randomUUID()}.${endung}`;
  const ziel = pfad(name);
  await mkdir(ordner(), { recursive: true });
  await writeFile(`${ziel}.teil`, daten);
  await rename(`${ziel}.teil`, ziel);
  return name;
}

export function leseFoto(name: string): Promise<Buffer> {
  return readFile(pfad(name));
}

export async function loescheFotos(namen: string[]) {
  await Promise.all(namen.map((name) => rm(pfad(name), { force: true })));
}
