# Ommetryx – Checkliste Barrierefreiheit (Widget und Händler-App)

Stand: 08.10.2026 · Ziel: WCAG 2.1 Stufe AA (Grundlage der EN 301 549, auf die das BFSG verweist)

**Warum:** Seit 28.06.2025 müssen B2C-Onlineshops in Deutschland barrierefrei sein (BFSG). Ausgenommen sind nur Kleinstunternehmen (unter 10 Beschäftigte und höchstens 2 Mio. € Umsatz oder Bilanzsumme). Unser Widget ist Teil des Shops, deshalb werden mittelgroße Händler ein barrierefreies Widget verlangen.

**Grundsatz:** Kein „Barrierefreiheits-Button“ bzw. Overlay als Lösung. Das Widget muss im Normalzustand für alle nutzbar sein. Ein Kontrast-Modus ist höchstens ein Extra.

---

## 1. Farben und Kontrast

- [ ] Normaler Text mindestens **4,5:1** gegen den Hintergrund
- [ ] Große Schrift (ab 18,66 px fett bzw. 24 px normal) mindestens **3:1**
- [ ] Rahmen von Eingabefeldern, Buttons, Chips, Schaltern und Fokus-Ring mindestens **3:1**
- [ ] Information nie nur über Farbe (z. B. gewählte Größe: zusätzlich Rahmen oder Häkchen; Fehler: zusätzlich Text)
- [ ] **Markenfarben:**
  - Petrol mittel `#238397` auf Linen nur 4,0:1, also **nicht** für kleinen Text verwenden
  - Für Links und kleine Texte stattdessen Petrol tief `#15788C` (4,7:1) oder Ink `#0C3A4A`
  - Apricot `#DC5E2E` (3,4:1) nur für große Schrift, Flächen und Symbole
- [ ] **Theme-Farben des Händlers:** Das Widget prüft den Kontrast der übernommenen Farben und nutzt eigene, sichere Farben, wenn der Kontrast nicht reicht

## 2. Tastatur und Fokus

- [ ] Alles ist ohne Maus bedienbar (Tab, Shift+Tab, Enter, Leertaste, Pfeiltasten in Auswahlgruppen)
- [ ] Sichtbarer Fokus-Ring auf jedem bedienbaren Element
- [ ] Beim Öffnen von Bottom Sheet bzw. Seitenleiste springt der Fokus hinein. Er bleibt darin, solange es offen ist.
- [ ] Schließen mit **Esc**. Danach springt der Fokus zurück auf den Button „Meine Größe finden“.
- [ ] Logische Reihenfolge: Frage, Video, Eingabe, Kurz-Tipp, Weiter, Überspringen

## 3. Screenreader und Struktur

- [ ] Der Widget-Button hat einen klaren Namen, z. B. „Meine Größe finden, öffnet Größenberater“
- [ ] Dialoge mit `role="dialog"`, `aria-modal` und einer Überschrift als Namen
- [ ] Fortschritt „Schritt 2 von 5“ ist für Screenreader lesbar
- [ ] Das Ergebnis wird beim Erscheinen vorgelesen (Live-Region), z. B. „Empfohlene Größe M, Passform regulär“
- [ ] Passform-Umschalter und Figur-Chips als Auswahlgruppe (Radiogruppe), gewählter Zustand wird angesagt
- [ ] Die Zonen-Skala im Ergebnis („8 cm Spielraum“) ist auch als Text vorhanden, nicht nur als Punkt auf der Skala
- [ ] Icons ohne Text haben eine Beschriftung (Zurück, Schließen, Info)
- [ ] Dekorative Grafiken sind für Screenreader ausgeblendet

## 4. Eingabefelder und Fehler

- [ ] Jedes Feld hat eine **echte Beschriftung**, nicht nur Platzhaltertext („z. B. 92“ allein reicht nicht)
- [ ] Einheit (cm, kg) gehört zur Beschriftung bzw. wird vorgelesen
- [ ] Zahlentastatur auf dem Handy (`inputmode="numeric"`)
- [ ] Fehler- und Plausibilitätshinweise als Text, direkt am Feld, mit dem Feld verknüpft (`aria-describedby`)
- [ ] Vorschlag „Meinten Sie 92 cm?“ lässt sich per Tastatur übernehmen
- [ ] Pflicht- und optionale Felder sind auch im Text gekennzeichnet („optional“, „empfohlen“)
- [ ] Einwilligung: Checkbox mit Text verknüpft, Link zum Datenschutz per Tastatur erreichbar

## 5. Videos und Medien

- [ ] Alle Messvideos haben **Untertitel**
- [ ] Zu jedem Video gibt es eine **Textfassung** (der „Kurz-Tipp“ ausführlich genug)
- [ ] Videos starten nicht automatisch mit Ton. Pause und Stopp sind möglich.
- [ ] Keine blinkenden Inhalte (höchstens 3 Blitze pro Sekunde)

## 6. Größe, Zoom und Bewegung

- [ ] Tippflächen mindestens **44 × 44 px** (in den Wireframes bereits so)
- [ ] Bei 200 % Schriftgröße bzw. Browser-Zoom bleibt alles lesbar und bedienbar, ohne seitliches Scrollen
- [ ] Funktioniert im Hoch- und Querformat
- [ ] Animationen respektieren „Bewegung reduzieren“ (`prefers-reduced-motion`)
- [ ] Keine Zeitlimits (z. B. Magic Link nicht nach wenigen Minuten ungültig ohne Hinweis)

## 7. Sprache und Verständlichkeit

- [ ] Sprache des Widgets ist gesetzt (`lang="de"` bzw. Shop-Sprache)
- [ ] Kurze, klare Sätze. Fachbegriffe vermeiden oder erklären (z. B. „Mehrweite“ nie gegenüber Kundinnen)
- [ ] Gleiche Dinge heißen überall gleich (z. B. immer „Maße speichern“)

## 8. Händler-App im Shopify-Admin

- [ ] Shopify-Polaris-Komponenten nutzen. Sie bringen viel Barrierefreiheit schon mit.
- [ ] Tabellen mit echten Tabellenköpfen
- [ ] Diagramme (Nutzung pro Woche, „Hat es gepasst?“-Balken) zusätzlich als Zahlen bzw. Text

## 9. Prüfen und nachweisen

- [ ] Automatischer Test (z. B. axe DevTools oder Lighthouse „Accessibility“) bei jedem größeren Release
- [ ] Manueller Test nur mit Tastatur, kompletter Ablauf
- [ ] Manueller Test mit Screenreader: VoiceOver auf iPhone und Mac, NVDA unter Windows
- [ ] Test bei 200 % Zoom und mit Systemeinstellung „Größerer Text“
- [ ] Idealerweise ein Test mit 1–2 Personen, die selbst einen Screenreader nutzen
- [ ] Ergebnis dokumentieren, damit Händler den Textbaustein „Barrierefreiheit“ (unter Datenschutz & Verträge) guten Gewissens übernehmen können. Stand und Prüfgrundlage dort eintragen.

---

*Hinweis: Keine Rechtsberatung. Detailanforderungen stehen in der BFSG-Verordnung und in der Handreichung der Marktüberwachungsstelle. Kleinstunternehmen können sich kostenlos bei der Bundesfachstelle Barrierefreiheit beraten lassen.*
