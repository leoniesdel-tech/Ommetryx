# Ommetryx – Projekt-Übergabe für Claude Code

> Diese Datei ist dein Arbeitsgedächtnis für das Projekt. Lies sie vollständig, bevor du etwas baust.
> Lege sie als `CLAUDE.md` in den Wurzelordner des Repos. Stand: 15.10.2026 (Woche 8 von 21).
>
> **Hinweis 22.10.2026:** Teile dieser Datei sind überholt (u. a. HTML-Prototyp verworfen, Gewicht, Logik v2, Vermessungsprogramm noch nicht eingebunden). Es gilt vorrangig `ommetryx-aktueller-stand.md`.

---

## 1. Wer, was, warum

- **Team:** Leonie Seidel (Studentin, Multimediale Kommunikation und Dokumentation, TH Aschaffenburg) und ihr Mitgründer, der ein Programm zum Vermessen von Kleidung per Foto gebaut hat. Das Projekt läuft im **Gründungssemester** der TH (21 Wochen, mit Abgaben).
- **Produkt:** **Ommetryx** ist eine Shopify-App für deutsche Mode-Händler im Mittelstand (ca. 0,5–5 Mio. € Umsatz). Sie empfiehlt Endkundinnen die richtige Größe, damit es weniger Größen-Retouren gibt. Tagline: „Better fit. Fewer returns.“
- **Kern-Argument: Genauigkeit.** Ommetryx vermisst jedes Kleidungsstück in jeder Größe selbst. Dazu wird es flach fotografiert, mit einer Bankkarte als Maßstab (ISO/IEC 7810 ID-1, 85,60 × 53,98 mm). Diese **echten Kleidungsmaße** werden mit den **echten Körpermaßen** der Kundin verglichen. Andere Anbieter schätzen oder arbeiten mit Marken-Größentabellen.
- **Reihenfolge:**
  - **Phase 1:** präzise Größenempfehlung als Shopify-App, für kleine Händler zum Start kostenlos testbar.
  - **Später:** Virtual Try-On.
  - **Danach:** Shopware.
  - **Phase 2:** eine Konsumenten-Plattform.
  - **Bewusst ausgeschlossen:** Vinted und andere geschlossene Plattformen.
- **Wettbewerb:** Sizekick (DSGVO-Größenberatung, München), Virtusize, Fit Analytics, True Fit, Easysize. Zalando entwickelt alles selbst.

## 2. So arbeitest du mit Leonie

- Sprich **Deutsch, locker, du**. Leonie kommt nicht aus der Technik. Erkläre jeden Schritt zuerst in einfachen Worten (was und warum) und setze ihn danach um. Fachbegriffe immer kurz erklären.
- Sie will **direkt nutzbare, strukturierte Ergebnisse**, keine langen Berichte über deinen Arbeitsweg. Kurze Zusammenfassung am Ende reicht.
- Sie arbeitet an mehreren Baustellen parallel: Strategie, Technik, Design und Uni-Abgaben.
- Texte in der App und in Dokumenten: einfache Sprache, korrekte Rechtschreibung, keine Werbe-Floskeln. **Sie oder du** stellt der Händler ein. Standard in den Entwürfen ist **Sie**.
- **Nie überschreiben, was schon abgestimmt ist.** Design-Seiten sind Kopien, die Wireframe-Seiten bleiben unverändert. Frag vor allem, was sich nicht rückgängig machen lässt.

## 3. Feste Entscheidungen (nicht neu diskutieren)

**Produkt und Ablauf**

1. Der Ablauf im Widget **beginnt mit Messen**, denn das ist das Genauigkeits-Argument. „Schätzen“ ist nur eine Hinweis-Karte: „Kein Maßband zur Hand?“ führt zur Schätzung (Größe, Gewicht, BH-Größe, Figur). Ein geschätztes Ergebnis zeigt „Sicherheit mittel“ und bietet an: „2 Maße nachmessen“.
2. Die **Passform-Frage** (körpernah, regulär, locker, oversized) kommt **bei jedem Artikel neu**. Die letzte Wahl wird nicht automatisch übernommen, denn jedes Teil soll anders sitzen. Vorbelegt ist „regulär“.
3. **Mess-Schritte:** Körpergröße, Brust, Hüfte, Taille (empfohlen, ab Röcken und Hosen Pflicht). Jeder Schritt hat einen Video-Platzhalter, einen Warum-Satz und einen **Tipp, der zugeklappt ist und sich per Klick öffnet**. **Kein Maßband-Lineal oder Wisch-Regler** zur Eingabe, nur ein Zahlenfeld.
4. **Plausibilitätsprüfung:** Bei unrealistischen Werten oder starker Abweichung vom erwarteten Wert (mehr als ca. 6 cm) fragt das Widget nach. Die Kundin wird nie überstimmt.
5. **Ergebnis:**
   - Empfohlene Größe groß im Apricot-Kreis, mit Sicherheit und „Warum M?“.
   - Passform-Umschalter, der sofort neu rechnet.
   - „Passform je Zone ansehen“ zeigt Silhouette und Skalen.
   - Umschalter **M ↔ „So säße L“**. Beide Ansichten sind **gleich aufgebaut**.
   - Hilfe zwischen zwei Größen.
6. **Profil speichern:** E-Mail und 6-stelliger Code, kein Passwort. Nach 3 Fehlversuchen 10 Minuten Sperre. Wiederkehrende Kundinnen: „Willkommen zurück“, kurzer Ladebildschirm, nur noch die Passform-Frage.
7. **Ladebildschirm:** Das Logo baut sich auf (Clip-Reveal) und zeigt 3 Stufen Text. Mit Profil gibt es eine Kurzversion. Abbrechen ist möglich. `prefers-reduced-motion` wird beachtet. **Kein Ton, keine Werbe-Effekte.**
8. **Händler-Anpassung nur am Einstiegs-Button** auf der Produktseite. Das Größen-Fenster bleibt immer im Ommetryx-Design.
   - **Modi:** „Wie die Buttons meines Themes“ (Standard), „Ommetryx Standard“ oder „Eigene Gestaltung“ (gefüllt, umrandet oder Link; Farbe; Ecken 0, 8, 12 oder Pille; Maßband-Symbol optional).
   - **Leitplanken:** Kontrast der Schrift mindestens 4,5:1 (Schwarz oder Weiß wird automatisch gewählt), Rahmen mindestens 3:1, Höhe mindestens 44 px, Fokusring nie abschaltbar.
   - **Platz:** als App-Block direkt über der Größenauswahl.
   - Das **Logo** steht im Shop-Button.
9. **Keine eigene App zum Start.** Das Widget läuft im Shop, das Profil auf der Webseite „Mein Ommetryx“: Maße ändern, Shops trennen, Daten herunterladen, löschen.
10. **Der Händler sieht keine Körper- und Kleidungsmaße.** Er sieht nur Nutzung, Umfrage-Ergebnisse und Retouren mit und ohne Ommetryx (über eine Kontrollgruppe, z. B. 10 %).
11. Die **Kleidung vermisst zum Start das Team selbst** als Dienstleistung: Muster-Versand oder ein Termin vor Ort.

**Datenschutz (bindend)**

- **Einwilligung vor der Maßeingabe** (Art. 9 Abs. 2 lit. a DSGVO), Widerruf mit einem Klick. Ohne Einwilligung bleibt die normale Größentabelle des Shops nutzbar.
- Kein Geschlechtsfeld. Ob Damen, Herren oder Unisex, ergibt sich aus dem Produkt.
- **Keine Maß-Historie**: Neue Werte überschreiben die alten.
- **Identität** (E-Mail) und **Maße** liegen in getrennten Tabellen mit getrennten Rechten.
- Inaktive Profile werden nach 24 Monaten gelöscht, mit Erinnerung vorher.
- Die Umfrage-Mail braucht eine **eigene Zustimmung**. AVV mit dem Händler. Hosting in der EU.
- Die Pflicht-Webhooks von Shopify zum Datenschutz müssen umgesetzt sein: `customers/data_request`, `customers/redact`, `shop/redact`.

## 4. Design-System „Warm Minimal“ (Design v1)

Flach, nur eine Schatten-Ebene (Bottom Sheet), kein Glas-Effekt, kein Neumorphism. Hausschrift **Sora**: Regular 400 und SemiBold 600 in der UI, Bold 700 nur in der Wortmarke. Sora selbst hosten (WOFF2, `font-display: swap`, Fallback `system-ui`).

| Token | Wert | Einsatz |
|---|---|---|
| Linen | `#F6F4EF` | Hintergrund (ca. 80 % mit Weiß) |
| Graphit (text/primär) | `#1E2326` | Text |
| text/sekundär | `#4F575C` | Nebentext |
| Ink (aktion/primär) | `#0C3A4A` | Primärbutton, weiße Schrift |
| Petrol tief | `#15788C` | Links, Auswahl, Fokus |
| Petrol mittel | `#238397` | nur Flächen, Fortschritt, Icons, **kein kleiner Text** |
| Petrol Glanz | `#50A2B6` | nur im Logo |
| Apricot | `#DC5E2E` | **nur** Größen-Ergebnis (ab 24 px) und Signalpunkte, höchstens 1 Element pro Screen |
| Apricot hell | `#F5916A` | Akzent auf dunklem Grund |
| Terracotta | `#B8492A` | Akzent als Text |
| linie/stark | `#7D868A` | Feldrahmen, Bedienelemente |
| linie/standard | `#D9D4CB` | dekorative Trenner |
| status/fehler | `#B3261E` | Fehler |

- **Schriftgrößen:** 12, 14, 16, 20, 24, 40 px (16 = Fließtext, Felder, Buttons; 40 = Ergebnis). Zeilenhöhe 150 % für Text, 125 % für Überschriften.
- **Größen der Elemente:** Eingabefeld 48 px hoch mit 16 px Schrift (sonst zoomt iOS hinein). Primärbutton 48 px, Sekundärbutton 44 px, Chips mindestens 44 px.
- **Rahmen und Fokus:** Rahmen 1 px, bei Fokus, Auswahl und Fehler 2 px. Fokusring 2 px Petrol tief mit 2 px Abstand.
- **Radien:** 8, 12 (Felder und Buttons), 16 (Karten und Sheet), voll rund (Chips).
- **Abstände:** 4, 8, 12, 16, 20, 24, 32, 40 px. Innenabstand des Sheets 20 px.
- **Schatten:** Sheet `0 -4 24` in Ink mit 12 %. Abdunklung dahinter: Ink 40 %.
- **Animation:** Kleine Effekte 150–200 ms, Sheet herein 300 ms, heraus 200–250 ms.
- **Technik:** Widget im **Shadow DOM**, Größen in px, kein automatischer Dark Mode im Widget.
- **Handy:** Bottom Sheet von unten. **Desktop:** seitliches Panel.
- **Logo:** Maßband-„OX“-Bildmarke in Petrol mit Apricot-Spitze. Klein (≤ 96 px) ohne Maßband-Striche. Wortmarke Sora Bold, Laufweite −1,5 %.
- **Barrierefreiheit:** WCAG 2.2 AA, siehe Projekt-Dokument `claude/barrierefreiheit-checkliste.md`.

## 5. Daten und Empfehlungslogik

**Kundenprofil (einmal gespeichert):**

| Feld | Status |
|---|---|
| Körpergröße, Brust, Hüfte | Pflicht |
| Taille | empfohlen, ab Röcken und Hosen Pflicht |
| Figur: Schultern, Bauch, Po, Oberschenkel | freiwillig, je 3 Stufen plus „weiß nicht“ |
| Innenbein, Armlänge, Bundhöhe, Unterbrust, Hals usw. | nur bei Bedarf, wenn ein Artikel sie braucht |

**Pro Artikel:** Passform, optional ein Style-Ziel.

**Kleidungsdaten** (pro Artikel und Größe, aus der Vermessung):
- `garment_measurements` in cm: brust, taille, huefte, schulter, armlaenge, gesamtlaenge, je nach Kategorie.
- Pro Artikel: `material_dehnbarkeit` (keine, leicht, stark) und `material_zusammensetzung`.
- Fehlercodes der Vermessung: `referenzobjekt_nicht_erkannt`, `kleidungsstueck_unvollstaendig`, `foto_unscharf`, `unrealistisches_ergebnis`.

**Logik (regelbasiert, kein ML). Alle Zahlen gehören in eine Konfigurations-Tabelle, nicht fest in den Code:**

1. `Mehrweite = Kleidungsmaß − Körpermaß_effektiv`, je Messpunkt.
2. Ziel-Mehrweite je Passform. Brust bei Webware, Startwerte als Bereiche: körpernah 0–7,5, regulär 7,5–12,5, locker 12,5–20, oversized über 20 cm. Dehnbarer Stoff senkt das Ziel: leicht −2, stark −4 cm, dann ist Mehrweite bis −4 cm erlaubt.
3. Strafe: **zu eng zählt doppelt so viel wie zu weit**. Score = Σ Gewicht × Strafe. Der niedrigste Score gewinnt.
   - Gewichte Oberteile: Brust 1,0 · Schulter 0,8 · Taille 0,5.
   - Gewichte Hosen: Taille 1,0 · Hüfte 1,0 · Oberschenkel 0,6.
4. **Harte Grenzen:** Passt eine Größe an Schulter (Webware) oder Hals (Kragen) nicht, wird sie nicht empfohlen. Längen werden separat geprüft.
5. Figur-Angaben korrigieren höchstens ±2 cm oder das Gewicht eines Messpunkts. Sie wirken nie direkt auf die Größe.
6. **Konfidenz** startet bei 100:
   - −15, wenn ein Maß geschätzt ist.
   - −10 bis −25, wenn zwei Größen nah beieinander liegen. Dann `alternative_size` füllen.
   - −10 bei Widerspruch. Dann gelten die Messwerte, und die Figur-Korrektur wird halbiert.
   - Unter 60: `status: "unsicher"`. Keine feste Empfehlung, stattdessen die Ansicht je Zone.
7. **Lernen:** persönlicher Offset je Zone, `Offset_neu = Offset_alt + 0,3 × Korrektur` (begrenzt auf ±4 cm). Zusätzlich ein Zähler je Artikel, ob er klein oder groß ausfällt. Ab 50 Rückmeldungen passen sich die Regeln automatisch um bis zu ±1 cm an. Größere Änderungen gibt das Team frei.
8. **Ausgabe:** `recommended_size`, `confidence` (0–100), `alternative_size`, `status`.

**Widersprüche in den Dokumenten, die du Leonie zur Klärung vorlegen sollst:**
- **Gewicht:** `schnittstellen-dokumentation-v2` sagt „nicht speichern“ (Risiko Art. 9). `kundenprofil-eingabefelder` sagt „freiwillig“. Der Prototyp nutzt es nur für die Schätzung und speichert es nicht. Vorschlag: nur zum Schätzen verwenden, nie speichern.
- **Ziel-Mehrweite:** Die Schnittstellen-Doku nennt Einzelwerte (4, 8, 14, 22), die Kundenprofil-Doku nennt Bereiche. Der Prototyp nutzt Bereiche. Vorschlag: Bereiche als Konfiguration.
- **Ab wann automatisch gelernt wird:** 20 Rückmeldungen je Artikel (Schnittstellen-Doku) oder 50 Rückmeldungen (App-Struktur). Muss vereinheitlicht werden.

## 6. Was schon gebaut ist

### Figma

**Datei „Design2“** (aktueller Arbeitsstand, alle neuen Änderungen kommen hierher): `fileKey 4u0OvbUTYrundT6U0MYQcq`
Link: https://www.figma.com/design/4u0OvbUTYrundT6U0MYQcq/Design2

| Seite | Inhalt |
|---|---|
| Komponenten (0:1) | Navigation, Eingabefeld, KPI-Karte, Video-Platzhalter, Shop-Header (Wireframe-Stil) |
| Endkunde (2:2) / Händler (2:3) / Intern (2:4) | **Wireframes, nicht verändern** |
| Design v1 (27:37) | Stil-Muster D01–D05; Logo-Komponenten `50:52` (farbig) und `56:483` (einfarbig) |
| **Design v1 · Endkunde (32:13)** | E01–E43, W01–W04 im Design, plus E09b, E36b und der Spezifikations-Frame |
| Design v1 · Händler (31:13) | H01–H09, **H10 Einstellungen · Button-Design** |
| Design v1 · Intern (31:1650) | I01–I04 |

**Variablen-Sammlungen:**
- Wireframe (14)
- Marke (7)
- Design v1 (26 Tokens)
- Prototyp (4 Booleans „Tipp offen · E03…E06“, gesteuert mit SET_VARIABLE-Reaktionen)

**Wichtige Screens auf „Design v1 · Endkunde“:**
- **E02 (32:57):** Einstieg mit Beispiel-Ergebnis. Primärbutton „Genau messen · ca. [X] Min.“ führt zu E03, die Karte „Kein Maßband?“ zu E40.
- **E03–E06:** einheitlicher Aufbau. Kurz-Tipp öffnet den Tipp-Text, dazu die Kein-Maßband-Karte und ein X zum Schließen. Das Maßband-Lineal auf E04 ist entfernt.
- **E08 (32:259):** 390×844, scrollt. Kopf, Fortschritt und Fußleiste stehen fest (`numberOfFixedChildren = 3`).
- **E09 (33:14):** kompaktes Ergebnis. „Passform je Zone ansehen“ führt zu **E09b (2021:478)** mit Silhouette, Skalen und Tab „So säße L“. Der Tab führt zu **E10 (33:95)**: „So säße L · Insgesamt lockerer, an den Schultern 1,5 cm breiter · Empfohlen bleibt M“. Dessen Tab „M“ führt zurück zu E09b.
- **E34:** „Willkommen zurück · Ihre Maße sind gespeichert“ mit der Passform-Frage.
- **E36:** Ladebildschirm. **E36b:** Kurzversion. Der Frame **„Spezifikation · Ladebildschirm und Bewegung“ (2004:301)** hält Timings und Ablauf fest.
- **E39:** Produktseite mit Ring um die übernommene Größe M.

**Aufräumen:** Auf „Design v1 · Händler“ liegen zwei leere Frames „Frame“ (`40:160`, `40:282`), die gelöscht werden können.

**Original-Datei** (älterer Stand, gleiche Komponenten-IDs): `5X47LtBpc9VVmAaBxKUQq2`.

**Tipps für die Figma Plugin API (`use_figma`):**
- Ein Script ist atomar: Bei einem Fehler wird nichts übernommen. Größere Änderungen besser in kleine Scripts aufteilen.
- `setReactionsAsync` statt `setReactions`.
- Feste Kopf- und Fußleisten über `numberOfFixedChildren` und Scrollen über `overflowDirection = 'VERTICAL'`. `scrollBehavior` gibt es nicht.
- Bei `setBoundVariableForPaint` immer eine korrekte Grundfarbe mitgeben, sonst werden Flächen schwarz.
- Bei `findAll` zuerst nach `type` filtern.
- Frames klonen, damit die Reaktionen erhalten bleiben.
- SVGs über `createNodeFromSvg` einfügen.

### Funktionierender Widget-Prototyp (HTML)

- Veröffentlicht als Artifact **„Ommetryx Widget-Prototyp“**: https://claude.ai/artifact/GZYWF241M4Dio4mypWL1Ge. Die Quelldatei `ommetryx-prototyp.html` liegt diesem Paket bei.
- **Was er kann:** Beispiel-Shop mit 3 Artikeln (Leinenhemd ohne Dehnung, Kapuzenpullover leicht dehnbar, Ripp-Top stark dehnbar), echte Berechnung mit Beispiel-Kleidungsmaßen, der komplette Ablauf aus Abschnitt 3, ein Profil im `localStorage` (Schlüssel `ox-profil`) und „Prototyp zurücksetzen“.
- **Wichtige Funktionen im Code** (gute Vorlage für den echten Code):
  - `bewerte()`: Score je Größe.
  - `berechne()`: Größe, Konfidenz und Nachbargröße.
  - `koerperAusSchaetzung()`: Maße aus Größe, Gewicht, BH-Größe und Figur.
  - `plausi()`: Plausibilitätsprüfung.
  - `silhouette()`: Zonen-Grafik.
- Die Werte im Prototyp sind **Startwerte zum Testen**, keine kalibrierten Werte.

### Weitere Unterlagen

- **Artifact „Ommetryx App-Struktur“** (Design-Canvas, `SKNbnBNYCKcW4YiCxjS6QV`) mit den Seiten Überblick, Endkunde, Händler, Intern und MVP. Gibt es auch als PDF.
- **Projekt-Dokumente** im claude.ai-Projekt „Gründungssemester“:
  - `claude/ommetryx-markenfarben-final.md` (Farben, Logo, UI-Tokens, Button-Entscheidung)
  - `claude/schnittstellen-dokumentation-v2.md` (Schnittstelle zwischen Vermessung und Empfehlung, Logik, Datenschutz)
  - `claude/kundenprofil-eingabefelder.md` (Felder mit Quellen)
  - `claude/barrierefreiheit-checkliste.md`
  - `Probleme Online Shopping.docx`
  - `Shopify_vs_Shopware.docx`
  - Studien-PDFs: „Apparel E Commerce“, „Trying before Buying“

**Bildschirme im MVP:**
- **Endkunde:** Produktseite, Maße eingeben, Ergebnis, Speichern und Anmelden, Passform, Profil und „Mein Ommetryx“, Umfrage „Hat es gepasst?“, Sonderfälle (ausverkauft, nicht vermessen, keine Einwilligung, Tippfehler).
- **Händler (im Shopify-Admin):** Onboarding, Startseite mit Kennzahlen, Produkte, Muster-Versand, Einstellungen mit Button-Design, Abo, Datenschutz und Verträge, Hilfe.
- **Intern:** Händler-Übersicht, Erfassung der Kleidungsmaße, Auswertung, Regeln.

**Später:**
- Schnelle Schätzung erst nach dem Nutzertest umsetzen.
- Zusatzmaße erst, wenn eine Kategorie sie braucht.
- CSV-Export der Kennzahlen ab dem Paket „Wachstum“.

## 7. Aufgaben

**Woche 8: „Weiterentwicklung des Prototyps bzw. erste Schritte reale App“**

1. **Nutzertest mit dem HTML-Prototyp vorbereiten.** Testleitfaden aktualisieren: Aufgaben, Beobachtungspunkte, Fragen danach. Kleine Änderungen aus dem Test direkt in `ommetryx-prototyp.html` einarbeiten und den Prototyp neu veröffentlichen.
2. **Technische Roadmap für den Mitgründer** schreiben, verständlich und in Etappen:
   1. Shopify-Partner-Konto anlegen und einen Entwicklungs-Shop mit Beispielprodukten aufsetzen.
   2. App mit der Shopify CLI anlegen (aktuelles App-Template). Admin-Oberfläche mit Polaris bzw. den App-Bridge-Komponenten.
   3. **Theme App Extension** (App-Block über der Größenauswahl) für den Button. Das Widget als Script im Shadow DOM, Datenaustausch mit dem eigenen Backend über einen **App Proxy**.
   4. Datenmodell: Shop, Produkt bzw. Variante zu Größe, Kleidungsmaße, Konfiguration (Mehrweite, Gewichte), Kundin (Identität getrennt von Maßen), Empfehlung, Feedback, Einwilligungen.
   5. **Empfehlungslogik als eigenes Modul mit Tests**: Logik aus dem Prototyp übernehmen, Werte als Konfiguration, Testfälle mit den Beispielartikeln.
   6. Das Vermessungs-Programm des Mitgründers anbinden (Ausgabe im Format aus Abschnitt 5) und die internen Erfassungs-Screens (I02).
   7. Datenschutz-Webhooks, Billing API (Abos über Shopify), Hosting in der EU, Ladezeit messen.
   8. Erste echte Kleidungsstücke vermessen und gegen die Empfehlung prüfen.
3. **Die drei Widersprüche aus Abschnitt 5 mit Leonie klären.** Danach die Projekt-Dokumente aktualisieren.
4. **Figma aufräumen:** die zwei leeren Frames löschen. Eventuell Screens nachziehen, die im Prototyp neu entstanden sind (Plausibilitätswarnung im Design, „Sicherer machen“ beim geschätzten Ergebnis).

**Später:**
- Pitch-Training (findet vor Ort statt).
- Juristische Prüfung von Einwilligung, AVV und der Frage „Auftragsverarbeiter oder Verantwortlicher“.
- Illustrationen für die Figur-Auswahl und echte Mess-Videos.
- Mehrweite-Werte mit echten Retouren kalibrieren.
- Markenrecht: Prüfung bei DPMA und EUIPO sowie Domain-Check für „Ommetryx“.

## 8. Erster Schritt in dieser Sitzung

Fasse Leonie in 3–4 Sätzen zusammen, wo das Projekt steht. Frag dann, womit sie anfangen will: **Nutzertest (Aufgabe 1)** oder **Roadmap für den Mitgründer (Aufgabe 2)**. Wenn sie Figma-Arbeit möchte, prüfe zuerst, ob das Figma-MCP verbunden ist, und arbeite nur auf den Seiten „Design v1 · …“ der Datei Design2.
