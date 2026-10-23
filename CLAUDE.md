# Ommetryx – Arbeitsgedächtnis für Claude Code

> Stand: 23.10.2026 (Woche 7 von 21). Lies diese Datei zu Beginn jeder Sitzung. Details stehen in `docs/`, diese Datei sagt, was gilt.
> **Dies ist das Code-Repo** (`C:\Projekte\ommetryx`). Die übrigen Unterlagen (Businessplan, Pitch, Recherchen, Original-Dokumente) liegen in `C:\Users\Leonie\Desktop\Gründungssemester`. Die Kopien in `docs/` sind der Arbeitsstand. Ändert sich ein Dokument, beide Orte aktuell halten.

---

## 1. Projektziel

**Ommetryx** ist eine Shopify-App für deutsche Mode-Händler im Mittelstand (ca. 0,5–5 Mio. € Umsatz). Sie empfiehlt Endkundinnen die richtige Größe, damit es weniger Größen-Retouren gibt. Tagline: „Better fit. Fewer returns.“

- **Kern-Argument Genauigkeit:** Wir vermessen jedes Kleidungsstück in jeder Größe selbst und vergleichen diese echten Kleidungsmaße mit den echten Körpermaßen der Kundin. Andere schätzen oder nutzen Marken-Größentabellen.
- **Logik:** regelbasiert über Mehrweite-Bereiche, **kein Machine Learning**.
- **Phase 1 (jetzt):** Größenempfehlung als Shopify-App. Später: Virtual Try-On, Shopware, Konsumenten-Plattform (Phase 2). Ausgeschlossen: Vinted und andere geschlossene Plattformen.
- **Wettbewerb:** Sizekick, Virtusize, Fit Analytics, True Fit, Easysize. Zalando baut selbst.

## 2. Team und Arbeitsweise

- **Leonie:** Design, Texte, Recht, Organisation. Kommt aus dem Design, **keine Programmiererfahrung**, lernt durch Machen. **Mitgründer:** Technik, hat das Vermessungsprogramm gebaut.
- Sprich **Deutsch, locker, mit Du**. Erst in einfachen Worten erklären (was und warum), dann umsetzen. Fachbegriffe kurz erklären.
- Direkt nutzbare, strukturierte Ergebnisse. Kurze Zusammenfassung am Ende, keine langen Berichte über den Arbeitsweg.
- Rhythmus pro Etappe: **Plan zeigen → OK abwarten → umsetzen → Tests laufen lassen → erklären, wie Leonie es selbst ausprobiert → Git-Commit → auf OK warten.**
- **Nicht raten.** Wenn unklar ist, ob etwas gilt: als Frage aufschreiben.
- Feste Entscheidungen nicht eigenmächtig ändern. Wenn etwas falsch wirkt: mit Begründung sagen.
- Nichts überschreiben, was abgestimmt ist. Vor allem fragen, was sich nicht rückgängig machen lässt.
- Texte: einfache Sprache, korrekte Rechtschreibung, keine Werbe-Floskeln. Händler werden in der App mit **Sie** angesprochen. Ob das Widget Kundinnen mit Sie oder Du anspricht, stellt der Händler ein (Standard: Sie).
- Bei Shopify-APIs **immer die aktuelle Shopify-Doku prüfen** (Skills `shopify-plugin:*` / shopify.dev), nicht aus dem Gedächtnis. Viele Anleitungen im Netz nutzen noch das veraltete Remix-Template.

## 3. Quellen und Vorrang

Bei Widersprüchen gilt die neueste Quelle:

1. `docs/ommetryx-aktueller-stand.md` (22.10.) – **gilt vorrangig**
2. `docs/Ommetryx-Datenschutz-verstaendlich-erklaert.docx` (22.10.) – Datenschutz-Pflichten und Anwaltsfragen
3. `docs/schnittstellen-dokumentation-v3.md` und `docs/ommetryx-konfiguration-v3.xlsx` (20.10.) – Empfehlungslogik und alle Zahlen
4. `docs/barrierefreiheit-checkliste.md` (08.10.)
5. `docs/kundenprofil-eingabefelder.md` (07.10.) – Felder; Abschnitt „Matching-Logik“ ist durch v3 überholt
6. `docs/claude-code-uebergabe.md` (15.10.) – Produkt, Design-System, Figma; teilweise überholt

## 4. Zeitplan

- 21 Wochen, Woche 21 endet am 31.01.2027. Woche 8 (26.10.–1.11.): Pitch am Freitag.
- **Etappe 1 Fundament** (Woche 9–10, 2.11.–15.11.): Partner-Konto, Entwicklungs-Shop, Template, Datenbank. Meilenstein: Shop und Backend laufen.
- **Etappe 2 Kern** (Woche 11–13, bis 6.12.): Erfassungsmaske, Empfehlungslogik mit Tests, Widget. Meilenstein: erster Artikel korrekt empfohlen.
- **Etappe 3 MVP** (Woche 14–15, bis 20.12.): Login, „Mein Ommetryx“, Händler-Admin.
- **Etappe 4 Pilot und Prüfung** (Woche 16–18, bis 10.1.2027): Webhooks, Abrechnung, Sicherheits-Review, Pilot-Händler, **App-Store-Einreichung bis 10.1.2027** (Review dauert 3–7 Wochen).
- **Etappe 5 Pilotbetrieb** (Woche 19–21): Auswertung, Abschlusspräsentation.
- Weihnachten (Woche 16–17): nur Texte, Listing, Fehlerbehebung.

## 5. Verworfen bzw. überholt – nicht verwenden

- **HTML-Widget-Prototyp** (`ommetryx-prototyp.html`) – nicht als Vorlage nutzen.
- **Gewichts-Schritt** im Mess-Ablauf (E07 in Figma gelöscht).
- **Schnittstellen-Doku v2** und die Ziel-Mehrweite-Einzelwerte 4/8/14/22 sowie die alten Bereiche 0–7,5/7,5–12,5/…
- Alte Namen (F!ts, Anprobo, ClothesFriends, Weartrue …). Der Name ist **Ommetryx**, Markenprüfung erledigt.
- Digitaler Kleiderschrank, Virtual Try-On, Konsumenten-App: später, nicht im MVP.
- Ordner `vto-app/` (im Gründungssemester-Ordner) ist ein altes Projekt, nicht Teil von Ommetryx.
- **Vermessungsprogramm wird zum Start NICHT eingebunden** (es trainiert noch, Ziel ±1 cm Umfang; Maßstab A4-Blatt). Kleidungsmaße kommen per **Hand-Eingabe** in die interne Erfassungsmaske (Flachmaß × 2), im Datenformat aus v3, damit das Programm später denselben Datensatz liefern kann. Später: Python-Dienst (FastAPI), nur intern.

## 6. Produkt – feste Entscheidungen

**Widget-Ablauf (Endkundin)**
- Einstieg über Button als **App-Block direkt über der Größenauswahl**. Händler passen nur diesen Button an (Modi: „Wie die Buttons meines Themes“ = Standard, „Ommetryx Standard“, „Eigene Gestaltung“). Leitplanken: Schriftkontrast ≥ 4,5:1 (Schwarz/Weiß automatisch), Rahmen ≥ 3:1, Höhe ≥ 44 px, Fokusring nie abschaltbar. Das Größen-Fenster bleibt immer im Ommetryx-Design.
- **Einwilligung vor jeder Maßeingabe.** Ohne Einwilligung bleibt die normale Größentabelle des Shops nutzbar.
- Ablauf **beginnt mit Messen**. „Kein Maßband zur Hand?“ ist nur eine Hinweis-Karte. Sie führt **im MVP zur Größentabelle des Shops**, später zur Schnellschätzung (siehe Abschnitt 14). Geschätztes Ergebnis später: „Sicherheit mittel“ + „2 Maße nachmessen“.
- **Mess-Ablauf, 5 Schritte:** Körpergröße, Brust, Hüfte, Taille (empfohlen, ab Röcken/Hosen Pflicht), Figur (optional: Schultern, Bauch, Po, Oberschenkel, je 3 Stufen + „weiß nicht“).
- Jeder Mess-Schritt: Video-Platzhalter, Warum-Satz, **zugeklappter Tipp** (öffnet per Klick), **nur Zahlenfeld** (kein Maßband-Lineal, kein Wisch-Regler).
- **Plausibilitätsprüfung:** bei unrealistischen Werten oder > ca. 6 cm Abweichung vom erwarteten Wert nachfragen. Die Kundin wird nie überstimmt.
- **Passform-Frage bei jedem Artikel neu** (körpernah, regulär, locker, oversized), vorbelegt „regulär“, letzte Wahl wird nicht übernommen.
- **Ergebnis:** Größe groß im Apricot-Kreis mit Sicherheit und „Warum M?“; Passform-Umschalter rechnet sofort neu; „Passform je Zone ansehen“ (Silhouette, Skalen); Umschalter M ↔ „So säße L“ (gleicher Aufbau); Hilfe zwischen zwei Größen; Hinweis, wenn die Begrenzung durch den Schnitt gegriffen hat.
- **Ladebildschirm:** Logo baut sich auf (Clip-Reveal), 3 Stufen Text, Kurzversion mit Profil, abbrechbar, `prefers-reduced-motion`, kein Ton.
- Nur Zusatzmaße fragen, wenn ein Artikel sie braucht (Innenbein, Armlänge, Oberschenkel, Schulterbreite eines gut sitzenden Teils, Oberarm, Hals …), dann im Profil speichern.
- **Kein Geschlechtsfeld.** Damen/Herren/Unisex ergibt sich aus dem Produkt.

**Profil und Login**
- Profil speichern mit **E-Mail + 6-stelligem Code**, kein Passwort. Code gehasht, 10 Min. gültig, einmalig, Sperre nach 3 Fehlversuchen für 10 Min., Rate-Limit, immer gleiche Antwort (verrät nicht, ob eine E-Mail existiert). Selbst gebaut, Versand über **Brevo (EU)**.
- Wiederkehrende Kundin: „Willkommen zurück“, kurzer Ladebildschirm, nur noch die Passform-Frage.
- **Keine eigene App.** „Mein Ommetryx“ ist eine Webseite: Maße ändern, Shops trennen, Daten herunterladen, löschen.
- Shopify-Kundenkonten werden **nicht verknüpft**.

**Händler (im Shopify-Admin)**
- Sieht **keine Körper- und keine Kleidungsmaße**. Nur Nutzung, Umfrage-Ergebnisse und Retouren mit/ohne Ommetryx (Kontrollgruppe 10 %), nur aggregiert mit Mindestgruppengröße (z. B. ≥ 20).
- Bildschirme: Onboarding, Startseite mit Kennzahlen, Produkte, Muster-Versand, Einstellungen mit Button-Design, Abo, Datenschutz und Verträge, Hilfe.
- Die Kleidung vermisst zum Start **das Team selbst** (Muster-Versand oder Termin vor Ort).

**Intern (nur Team)**
- Händler-Übersicht, **Erfassung der Kleidungsmaße (I02, Hand-Eingabe)**, Auswertung, Regeln.

## 7. Empfehlungslogik (v3, Kurzfassung)

Volle Regeln: `docs/schnittstellen-dokumentation-v3.md`. Alle Zahlen: `docs/ommetryx-konfiguration-v3.xlsx`. **Jede Zahl kommt aus Konfigurationstabellen in der Datenbank, nie fest in den Code.** Werte sind Startwerte, werden mit echten Rückmeldungen kalibriert.

- `Mehrweite = Kleidungsumfang (Flachmaß × 2) − Körperumfang`, je Messpunkt.
- **Schnitt des Artikels** (körpernah/regulär/locker/oversized) ist Pflichtfeld. Die Wahl der Kundin verschiebt höchstens **einen Größensprung G** vom Schnitt.
- Reihenfolge je Messpunkt: Tabellenzeile (Kategorie × Messpunkt) → Mitte M des gewählten Bereichs → auf `[M_Schnitt − G, M_Schnitt + G]` begrenzen → auf Kundin umrechnen `Wert × (0,5 + 0,5 × K/K_ref)` (nur Brust/Hüfte-Bereiche) → Dehnungskorrektur (Differenz zur Referenzklasse, nur körpernah/regulär) → Figur-Korrektur max. ±2 cm → Strafe.
- **Strafe:** straffreie Zone ±G/2 um die Mitte; zu eng × 2, zu weit × 1; unter Mindest zusätzlich 4 × Differenz; über Oversized-Obergrenze zusätzlich 2 × Differenz. `Score = Σ Gewicht × Strafe`, **niedrigster Score gewinnt**.
- **Ausschluss:** > 3 cm unter Mindest (Klasse 0); Schulter > 2,5 cm schmaler als Referenzteil (Webware, eingesetzter Ärmel); Kragen zu eng (Grenzwert offen → Hemden mit Kragen nur mit Hinweis); Gummizugbund gedehnt < Hüfte.
- **Konfidenz** ab 100: −15 Maß geschätzt, −10 bis −25 knapp (Score-Differenz < 10 %, dann `alternative_size`), −10 Widerspruch Figur, −10 Schnitt-Begrenzung, −20 unter Mindest. Unter 60 → `status: "unsicher"`, Ansicht je Zone statt fester Empfehlung.
- **Ausgabe:** `recommended_size`, `confidence`, `alternative_size`, `status`, `begrenzt_durch_schnitt`.
- **Lernen:** persönlicher Offset je Zone (`+0,3 × Korrektur`, max. ±4 cm); je Artikel gleitend `n/(n+25)`, Hinweis „fällt klein/groß aus“ ab n ≥ 20 und ≥ 75 %, volle Korrektur ab 50; wenig Daten → Gruppe Marke × Kategorie. Änderungen > 1 cm an Grundwerten gibt das Team frei.
- **Pflicht-Testfall:** Bluse Webware, Dehnungsklasse 1, Kundin Brust 96 cm, regulär, G = 4, Größen 38/40/42/44 = 100/104/108/112 cm → **Größe 40** (Strafen 6,43 / 0 / 0,78 / 4,78).
- **Artikel-Felder:** `kategorie_id`, `schnitt`, `schnitt_quelle` (automatisch/manuell/haendler), `material_dehnung_prozent` (Klasse wird berechnet), `material_zusammensetzung`, `tailliert`, `bund_typ` (fest/stretch/gummizug), `aermel_typ` (eingesetzt/ueberschnitten/ohne), `messhoehe_brust_cm` (Standard 2,5), `garment_measurements` je Größe in cm.
- Shapewear im MVP nicht unterstützt.

## 8. Tech-Stack (entschieden 21.10.)

| Teil | Entscheidung |
|---|---|
| Shopify-App | Offizielles **React-Router-Template, TypeScript**, `shopify app init`. React Router ist von Shopify gepinnt (7.18.2) – **nicht blind aktualisieren**. |
| Händler-UI | App Bridge + **Polaris Web Components** im Shopify-Admin |
| Datenbank | **PostgreSQL über Prisma** (nicht SQLite), Hosting **Render Frankfurt** |
| Empfehlungslogik | eigenes **TypeScript-Modul ohne Shopify-Abhängigkeit**, Werte aus Konfigurationstabellen, Tests mit **Vitest** |
| Widget | **Theme App Extension** (App-Block), Lader < 10 KB, eigentliches Widget lädt erst beim Klick, im **Shadow DOM**, Größen in px, kein Dark Mode. Shop darf höchstens 10 Lighthouse-Punkte verlieren. |
| Widget ↔ Backend | **App Proxy, HMAC-Signatur immer prüfen.** `logged_in_customer_id` ist kein Login-Nachweis. |
| E-Mail | Brevo (EU) |
| Abrechnung | **Managed Pricing**: kostenloser Plan + bezahlter Plan mit Testphase |
| Vermessung (später) | Python, FastAPI, eigener interner Dienst |
| Kosten Start | ca. 50–90 €/Monat |

**Datenbank-Idee:** Schema `identity` (E-Mail verschlüsselt + Hash zum Suchen, Einwilligungen, `last_active_at`) und Schema `body` (`pseudonym_id`, Maße verschlüsselt). Zuordnung in eigener Tabelle, nur für den Login-Dienst lesbar. Zwei Postgres-Rollen.

## 9. Datenschutz – bindend

- Körpermaße gelten vorsorglich als **Gesundheitsdaten (Art. 9 DSGVO)** → **ausdrückliche Einwilligung vor der Maßeingabe**, Widerruf mit einem Klick.
- **Drei getrennte Einwilligungen**, keine vorangekreuzten Kästchen, jeweils mit Zeitstempel, Textversion, Shop:
  1. Profil und Maße speichern und für Empfehlungen nutzen
  2. Umfrage-Mail „Hat es gepasst?“ (gilt als Werbung → eigene Einwilligung mit **Double-Opt-In**)
  3. Rückmeldungen nutzen, um Empfehlungen für alle zu verbessern
- **Altersabfrage „mindestens 16“.**
- **Gewicht nie speichern, nie loggen.** Nur in der Schnellschätzung im Arbeitsspeicher verrechnen.
- **Keine Körpermaße und kein Gewicht in Logs, Fehlermeldungen, Fehler-Monitoring (PII-Filter) oder Analytics.**
- **Keine Maß-Historie:** neue Werte überschreiben alte.
- **Identität (E-Mail) und Maße getrennt**, getrennte Rechte, verschlüsselt. Zugriff auf Maße nur 1–2 Personen mit Zwei-Faktor-Anmeldung.
- Kein Geschlechtsfeld.
- Inaktive Profile nach **24 Monaten löschen**, vorher erinnern. Widerruf löscht sofort. Backups laufen nach festgelegter Zeit aus.
- **localStorage nur** für den Login nach aktiver Anmeldung und für die laufende Maßeingabe. Keine Kennung für Statistik.
- **Kontrollgruppe (10 %) serverseitig** zuordnen (z. B. Hash der Session-/Checkout-ID). Gespeichert wird nur Bestell-ID + Flag mit/ohne Ommetryx + Retourenstatus.
- **Bestelldaten des Händlers nicht für eigene Zwecke** (z. B. Lernen) nutzen (Art. 28 Abs. 10).
- Shopify **Protected Customer Data höchstens Stufe 1**, keine Namen/E-Mails von Shopify. Die E-Mail holen wir selbst bei der Kundin.
- Händler-Statistiken nur aggregiert mit Mindestgruppe (≥ 20).
- **Pflicht-Webhooks** `customers/data_request`, `customers/redact`, `shop/redact`, Löschung binnen 30 Tagen.
- Hosting in der EU. AVV mit Händler, Render, Brevo, Monitoring-Anbieter. Render ist US-Firma → Plan B dokumentieren.
- Datenpanne: BayLDA in 72 Std., Shopify in 24 Std.
- Noch **nicht anwaltlich geprüft**.

**Regeln beim Entwickeln**
- Nie echte Kundendaten, nie echte Zugangsdaten. Nur erfundene Testdaten.
- Secrets nur in `.env`, `.env` steht in `.gitignore`.

## 10. Design-System „Warm Minimal“

Flach, eine Schatten-Ebene (Sheet), kein Glas, kein Neumorphism. Schrift **Sora** selbst gehostet (WOFF2, `font-display: swap`, Fallback `system-ui`): 400 und 600 in der UI, 700 nur in der Wortmarke.

| Token | Wert | Einsatz |
|---|---|---|
| Linen | `#F6F4EF` | Hintergrund |
| Graphit | `#1E2326` | Text |
| text/sekundär | `#4F575C` | Nebentext |
| Ink | `#0C3A4A` | Primärbutton, weiße Schrift |
| Petrol tief | `#15788C` | Links, Auswahl, Fokus |
| Petrol mittel | `#238397` | nur Flächen/Icons, **kein kleiner Text** |
| Petrol Glanz | `#50A2B6` | nur Logo |
| Apricot | `#DC5E2E` | **nur** Größen-Ergebnis (ab 24 px) und Signalpunkte, max. 1 pro Screen |
| Apricot hell | `#F5916A` | Akzent auf dunklem Grund |
| Terracotta | `#B8492A` | Akzent als Text |
| linie/stark | `#7D868A` | Feldrahmen |
| linie/standard | `#D9D4CB` | Trenner |
| status/fehler | `#B3261E` | Fehler |

- Schrift 12/14/16/20/24/40 px. Eingabefeld 48 px hoch, 16 px Schrift. Primärbutton 48 px, Sekundär 44 px, Chips ≥ 44 px.
- Rahmen 1 px, bei Fokus/Auswahl/Fehler 2 px. Fokusring 2 px Petrol tief, 2 px Abstand.
- Radien 8 / 12 (Felder, Buttons) / 16 (Karten, Sheet) / rund (Chips). Abstände 4–40 px, Sheet-Innenabstand 20 px.
- Handy: Bottom Sheet. Desktop: seitliches Panel. Animation 150–200 ms, Sheet 300 ms rein, 200–250 ms raus.

## 11. Barrierefreiheit

Ziel: **WCAG 2.2 AA** (entschieden 23.10.; die Checkliste nennt noch 2.1). Checkliste: `docs/barrierefreiheit-checkliste.md`. Kein Overlay-„Barrierefreiheits-Button“. Kurz: Fokus im Sheet halten, Esc schließt, Fokus zurück zum Button; `role="dialog"`, `aria-modal`; Ergebnis als Live-Region; Radiogruppen für Passform und Figur; echte Feldbeschriftungen mit Einheit; `inputmode="decimal"`; Fehler per `aria-describedby`; 200 % Zoom ohne seitliches Scrollen; `lang` gesetzt; Wort „Mehrweite“ nie gegenüber Kundinnen.

## 12. Figma

Datei **„Design2“**, fileKey `4u0OvbUTYrundT6U0MYQcq`. Nur auf den Seiten „Design v1 · Endkunde / Händler / Intern“ arbeiten. Wireframe-Seiten (Endkunde 2:2, Händler 2:3, Intern 2:4) **nie verändern**. Vor `use_figma` immer den Skill `figma:figma-use` laden.
- Offen: I02 um die neuen Artikel-Felder ergänzen; zwei leere Frames „Frame“ (`40:160`, `40:282`) auf „Design v1 · Händler“ löschen.

## 13. Befehle

Noch keine – wird ergänzt, sobald das App-Grundgerüst steht (Start, Tests, Datenbank-Migration).

## 14. Entscheidungen aus dem Brainstorming (23.10.)

**Organisation**
- Code liegt in **`C:\Projekte\ommetryx`** (eigener Ordner ohne Umlaut, eigene Kopie dieser CLAUDE.md). Unterlagen bleiben im Gründungssemester-Ordner.
- **Privates GitHub-Repo.** Leonie legt das GitHub-Konto an (Claude führt durch).
- **Leonie** legt Shopify-Partner-Konto und Entwicklungs-Shop an (Claude führt durch).
- Domain für „Mein Ommetryx“ gibt es noch nicht. Bis Etappe 7 reicht die Render-Adresse, die Domain sollte bis Mitte Dezember da sein.
- Bauen in dieser Reihenfolge: Werkzeuge → **Empfehlungsmodul mit Vitest** → Template im Dev-Shop → Postgres/Prisma → Erfassung → Widget-Minimum (Meilenstein: Empfehlung für von Hand eingetragenen Artikel) → Einwilligung/Login/Mein Ommetryx → Ergebnis komplett → Händler-UI → Webhooks, Pricing, Lernen, Review.

**Produkt**
- **Schnellschätzung kommt nicht ins MVP.** Die Karte „Kein Maßband zur Hand?“ führt im MVP zur Größentabelle des Shops. Später wird die Schätzung komplett im Browser gerechnet (Gewicht verlässt den Browser nie), die Formel muss neu festgelegt werden.
- **Altersgruppe kommt ins MVP**, optional, im Profil gespeichert (zusätzlich zur Abfrage „mindestens 16“). Ohne „unter 16“.
- **Style-Ziel kommt nicht ins MVP.**
- **Sie/Du im Widget** stellt der Händler ein, Standard Sie (bestätigt).
- **Barrierefreiheit: WCAG 2.2 AA.**
- **Maßstab des Vermessungsprogramms: A4-Blatt** (laut Leonie). Die Dokumente sagen noch „Bankkarte“ und müssen angepasst werden.

**Logik (Startwerte, Mitgründer prüft)**
- **Größensprung G je Messpunkt** aus den eigenen Messungen des Artikels (nicht nur vom Primärmaß).
- Fehlendes optionales Maß wird **nicht geschätzt, sondern nicht gewertet**. Die −15 gelten nur für den späteren Schätz-Weg.
- Wo die Tabelle „nicht werten“ sagt (z. B. oversized bei taillierter Taille, Stretch-Bund): **Gewicht 0, nur Mindestprüfung**.
- Leggings-Bereiche in % werden **nicht zusätzlich umgerechnet**.

**Technik (vorgeschlagen, von Leonie nicht ausdrücklich bestätigt – vorerst so umsetzen)**
- Interne Erfassung unter `/intern`, eigener Team-Login mit Zwei-Faktor-Code.
- Login gilt pro Shop-Domain: In einem neuen Shop meldet sich die Kundin einmal per Code an.
- Zahlenfelder mit `inputmode="decimal"`, Komma erlaubt (z. B. 92,5).

## 15. Offene Fragen

Bis zur Klärung nicht raten.

**Mitgründer fragen**
1. **Abzug „knapp“ (−10 bis −25):** Wie wird abgestuft, und was gilt, wenn die beste Größe 0 Strafpunkte hat? Vorschlag: Differenz = (zweitbester − bester) ÷ max(zweitbester, 1), bei 0 % −25, bei 10 % −10, linear. **Bis zur Antwort offen lassen.** Nötig in Etappe 2.
2. **Excel-Beispiel:** „3 % Elastan“ wird mit Dehnungsklasse 1 gerechnet. 3 % gemessene Dehnung wäre aber Klasse 0. Im Test vorerst einen Dehnungswert sicher in Klasse 1 verwenden (z. B. 15 %), Excel-Datei nicht ändern.
3. **Figur-Korrektur:** v3 verweist auf v2, v2 liegt nicht vor. Optionen: v2-Abschnitt besorgen, neue Tabelle entwerfen oder Figur zunächst ohne Wirkung. Nötig vor dem Widget-Ergebnis.
4. **Neue Felder:** `hat_kragen` und `hals` (Hemden) sowie `taille_gedehnt` (Gummizugbund) für die Ausschluss-Regeln. Nötig in Etappe 5.

**Leonie (hat Zeit)**
5. **Automatischer Schnitt:** In Shopify gibt es keine einheitliche Größentabelle. Vorschlag: Das Team trägt die Körpermaß-Tabelle einmal pro Marke ein, sonst wird der Schnitt manuell gesetzt. Nötig in Etappe 5.

**Anwaltsgespräch (vor dem Pilot)** – noch nicht von Leonie bestätigt, ob sie auf die Liste sollen:
6. **Umfrage-Mail ohne Bestelldaten:** Auslöser ist unser eigenes Ereignis „Größe übernommen“ (nur mit Einwilligung 2), die Mail fragt „Haben Sie das Teil gekauft und passt es?“
7. **Kontrollgruppe:** Hash der Warenkorb-Kennung auf dem Server, Markierung „mit Ommetryx“ am Warenkorb. Die Technik muss vorher in der Shopify-Doku geprüft werden. Bestell- und Retourendaten brauchen Zugriffsrechte (Stufe 1).
8. **`customers/redact`:** Da wir keine Shopify-Kunden verknüpfen, nur die Einträge zu den genannten Bestellungen löschen, nicht das Profil.
