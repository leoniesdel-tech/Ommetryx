# Kundenprofil & Eingabefelder – Ommetryx

Stand: 07.10.2026. Grundlage: Recherche vom 25.09.2026 (Körperform, Geschlechtsfrage) und Recherche vom 07.10.2026 zu entscheidenden Maßen je Kategorie (Normen EN 13402 / ISO 8559-2, Vorhersagbarkeit von Maßen, Selbstmess-Genauigkeit).

> **Hinweis 22.10.2026:** Gewicht wird nur in der Schnellschätzung ohne Maßband verwendet und nie gespeichert (siehe `ommetryx-aktueller-stand.md`). Mehrweite-Werte: siehe Schnittstellen-Doku v3.

## Grundprinzip

- **Wenige Pflichtmaße, gut gemessen.** Aus Körpergröße, Brust, Taille, Hüfte (+ Gewicht, bei Hosen Innenbeinlänge) lassen sich ca. 30 weitere Schnittmaße auf ~1,3 cm genau schätzen (Meyer et al. 2023, 9.000 vermessene Erwachsene).
- **Mehr Felder ≠ bessere Empfehlung.** Brust/Taille/Hüfte trafen die richtige Größe in 89,7 % der Fälle, ein Modell mit 35 Maßen nur in 69 % (Brubacher et al. 2025).
- **Messqualität ist der größte Hebel.** Ohne Anleitung liegen Laien im Schnitt 4,1 cm daneben, die Hüfte wird ~4,5 cm zu klein gemessen (Yoon & Radwin 1994). Mit Video-Anleitung fast Profi-Genauigkeit bei Taille/Hüfte (Barrios et al. 2016).
- **Zusatzmaße nur bei Bedarf** („Progressive Profiling“): erst fragen, wenn ein Artikel sie braucht, dann im Profil speichern.

## Pflicht (einmalig im Profil)

| Feld | Begründung |
|---|---|
| Körpergröße | Sekundärmaß in fast allen Kategorien; wichtigste Basis für Längen-Schätzung |
| Brustumfang | Primärmaß aller Damen-Oberteile, Kleider, Jacken, Mäntel (EN 13402-2) |
| Hüftumfang | Sekundärmaß bei Kleidern, Röcken, Hosen; fehleranfälligstes Maß → beste Anleitung |
| Taillenumfang | **im MVP „empfohlen“, Pflicht ab Röcken/Hosen** (dort Primärmaß) |

## Optional (immer angeboten, aufklappbarer Bereich „Ihre Figur“)

| Feld | Begründung |
|---|---|
| Gewicht | Wichtige Eingabe für Schätzung fehlender Maße; sensibel → nie Pflicht (steht bei den Hauptfeldern) |
| Schultern im Vergleich zur Hüfte (3 Stufen + weiß nicht) | Schulter ist am schlechtesten vorhersagbar, aber allein kaum messbar → Selektor statt Maßband |
| Bauch (3 Stufen + weiß nicht) | Lage der Fülle wird von Umfängen nicht erfasst |
| Po (3 Stufen + weiß nicht) | Stärkster Formindikator bei Hosen (Levi's Curve ID) |
| Oberschenkel im Vergleich zur Hüfte (3 Stufen + weiß nicht) | Oberschenkel schlecht vorhersagbar |
| Altersgruppe | Taille-Hüft-Verhältnis ändert sich mit dem Alter (Hohenstein) |

## Nur bei Bedarf (kontextabhängige Nachfrage, danach gespeichert)

| Feld | Wann fragen |
|---|---|
| Innenbeinlänge (am besten an gut sitzender Hose gemessen) | Hosen, Jumpsuits |
| Bevorzugte Bundhöhe (tief/mittel/hoch) | Hosen, Röcke – ersetzt Leibhöhe/Rise als Maß |
| Oberschenkelumfang | enge Hosen, Jeans, Leggings |
| Schulterbreite eines gut sitzenden eigenen Teils (flach, Naht zu Naht) | Webblusen, Blazer, Mäntel |
| Armlänge | Langarm aus Webware, Hemden, Jacken; Überspringen möglich → Schätzung aus Körpergröße |
| Oberarmumfang | enge Webware-Ärmel |
| Unterbrustumfang | BH, Bademode, Empire-Schnitte |
| Halsumfang | Hemden mit Kragen |

## Nicht abfragen

- Rückenlänge, Leibhöhe/Rise, Wadenumfang: gut aus Kernmaßen schätzbar (Fehler ~1–1,5 cm) und schwer selbst zu messen.
- **Geschlecht als Identitätsfeld:** rechtlich riskant (OLG Frankfurt 2022 / BGH 2024, AGG; EuGH C-394/23, Datenminimierung). Größentabelle (Damen/Herren/Unisex) ergibt sich aus dem Produkt. Hinweis: Vorhersagemodelle werden ohne Geschlecht ungenauer → Produkt-Größentabelle als Kontext nutzen; die Taille früh abfragen.
- **Referenzteil fremder Marken (Marke + Größe):** Größen schwanken selbst innerhalb einer Marke – genau das Problem, das Ommetryx durch eigene Vermessung löst.

## Pro Kleidungsstück

| Feld | Pflicht/Optional |
|---|---|
| Passformpräferenz (körpernah/regulär/locker/oversized) | Pflicht, vorbelegt „regulär“ – empfohlene Größe richtet sich danach |
| Style-Ziel (z. B. „Taille betonen“) | Optional |

## Messqualität (UI-Regeln)

- Kurzes Video/Animation pro Maß in der Messanleitung; Hüfte mit Hinweis „wird am häufigsten zu klein gemessen“.
- Hinweis „Zu zweit messen ist genauer“, „normal ausatmen“, „jedes Maß zweimal“.
- Plausibilitätsprüfung: Eingabe mit aus anderen Maßen erwartetem Wert vergleichen, bei > ca. 6 cm Abweichung nachfragen (noch nicht im Wireframe).
- Infopunkt an jedem Hauptfeld, Info öffnet sich im jeweiligen Abschnitt; Figur-Selektoren mit kurzem Hinweis, neutral formuliert, immer „weiß nicht“.

## Matching-Logik (für Schnittstellen-Doku)

- Mehrweite je Passform-Stufe **und** Dehnungsklasse des Artikels (keine/leicht/mittel/stark) hinterlegen; proportional zum Körpermaß rechnen.
- Schulter (Webware) und Hals (Kragen) als harte Ausschlusskriterien, Brust/Taille/Hüfte als gewichteter Score, Längen als eigene Prüfung.
- Richtwerte Mehrweite Brust (Praxiswerte, keine Studien): Webware körpernah 0–7,5 / regulär 7,5–12,5 / locker 12,5–20 / oversized > 20 cm; Jersey körpernah −10 bis 0 / regulär +5 bis +10 cm.
- Retourengründe strukturiert pro Passpunkt erfassen („Schultern zu eng“, „Hüfte zu eng“, „Bein zu lang“) – öffentliche Daten dazu fehlen.

## Offene Punkte

1. DSGVO Art. 9: Körpermaße/Gewicht als Gesundheitsdaten? Vor Launch juristisch prüfen.
2. Illustrationen für Figur-Selektoren und Messvideos fehlen.
3. A/B-Test der Profilstrecke (Abbruchrate vs. Genauigkeit).
4. Karlsruhe-Fall (AGG) Aktenzeichen verifizieren.
5. Gewichtung Passformpräferenz + Figurdaten in der Empfehlungslogik spezifizieren (Mitgründer).
6. Mehrweite-Werte mit eigenen Retourendaten kalibrieren.
7. Idee: Passform-Feedback nach dem Kauf zu Ommetryx-vermessenen Teilen, um Messfehler zu erkennen.

## Quellen (Auswahl)

- Meyer et al. (2023), Fashion and Textiles – Vorhersage von Schnittmaßen aus Kernmaßen (IFTH-Daten)
- Brubacher et al. (2025), Scientific Reports – 3D-Scan-Studie zur Größenvorhersage
- Yoon & Radwin (1994), Human Factors – Genauigkeit der Selbstmessung
- Barrios et al. (2016), BMC Medical Research Methodology; Lennie et al. (2011), Public Health Nutrition – Video-Anleitung
- EN 13402-1/-2/-3, EN ISO 8559-2:2025; ASTM D5585
- Patel et al. (2025), Journal of Innovation & Knowledge – Größenberater und Retouren
- Simmons et al. (2004) FFIT; Chrimes et al. (2023), JFMM; Levi's Curve ID (Patente)
- Hohenstein SizeGERMANY (2009)
- OLG Frankfurt 9 U 92/20; BGH X ZR 71/22; EuGH C-394/23
