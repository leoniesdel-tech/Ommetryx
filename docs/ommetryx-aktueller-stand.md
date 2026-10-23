# Ommetryx – Aktueller Stand aus den Chats (22.10.2026)

Diese Datei fasst zusammen, was in den Chats besprochen und entschieden wurde. Sie ist neuer als `claude-code-uebergabe.md` (15.10.2026). Bei Widersprüchen gilt diese Datei.

---

## 1. Zeitplan Gründungssemester

- 21 Wochen. Aktuell Woche 7 (bis 25.10.2026).
- **Woche 8 (26.10.–1.11.2026):** Pitch am Freitag. Pitch-Deck und Sprechtext sind fertig (Marktrecherche, Business Model, Klick-Prototyp).
- **Woche 9 beginnt am 2.11.2026, Woche 21 endet am 31.01.2027.**
- Roadmap in 5 Etappen:
  1. Fundament (Woche 9–10, 2.11.–15.11.): Partner-Konto, Entwicklungs-Shop, Template, Datenbank. Meilenstein: Shop und Backend laufen.
  2. Kern der App (Woche 11–13, 16.11.–6.12.): Erfassungsmaske, Empfehlungslogik mit Tests, Widget. Meilenstein: erster Artikel korrekt empfohlen.
  3. MVP komplett (Woche 14–15, 7.12.–20.12.): Login, „Mein Ommetryx“, Händler-Admin. Meilenstein: MVP fertig.
  4. Pilot und Prüfung (Woche 16–18, 21.12.–10.1.): Webhooks, Abrechnung, Sicherheits-Review, Pilot-Händler, App-Store-Einreichung bis 10.1.2027.
  5. Pilotbetrieb (Woche 19–21, 11.1.–31.1.): Auswertung, Abschlusspräsentation.
- Weihnachten (Woche 16–17): nur Texte, Listing, Fehlerbehebung.
- Shopify-Review dauert 2026 laut Entwicklerberichten 3–7 Wochen. Deshalb Einreichung spätestens Woche 18, Pilot parallel ohne Listing.

## 2. Verworfen bzw. überholt

- **Der HTML-Widget-Prototyp ist verworfen.** Nicht als Vorlage verwenden.
- Alte Namen (F!ts, Anprobo, ClothesFriends usw.). Der Name ist **Ommetryx**, Markenprüfung erledigt.
- Digitaler Kleiderschrank, Virtual Try-On, Konsumenten-App: alles später (Phase 2), nicht Teil des MVP.
- Schnittstellen-Doku v2 ist bei der Empfehlungslogik durch **v3** ersetzt.
- Einzelwerte für die Ziel-Mehrweite (4/8/14/22) sind ersetzt durch **Bereiche** aus v3.

## 3. Entscheidungen zum Produkt (neu seit 15.10.)

- **Gewicht:** Der Gewichts-Schritt im Mess-Ablauf ist gelöscht (in Figma auf beiden Seiten entfernt, Verknüpfungen angepasst). Gewicht wird nur in der Schnellschätzung ohne Maßband abgefragt, nur im Arbeitsspeicher verrechnet, **nie gespeichert, nie geloggt**. Begründung: Die Empfehlungslogik nutzt Gewicht nicht, Brust/Taille/Hüfte sind aussagekräftiger, und Gewicht ist das sensibelste Feld.
- **Mess-Ablauf hat 5 Schritte:** Körpergröße, Brust, Hüfte, Taille (empfohlen, ab Röcken/Hosen Pflicht), Figur (optional).
- In „Mein Ommetryx“ (W04) gibt es keine Gewichtszeile mehr. Datenschutz-Text E19 und Schätz-Screen E40 sagen: „wird nicht gespeichert“.
- **Passform als Eigenschaft des Artikels:** Jeder Artikel bekommt einen Schnitt (körpernah/regulär/locker/oversized). Die Wahl der Kundin verschiebt die Empfehlung höchstens um einen Größensprung. Schnitt wird möglichst automatisch aus Kleidungsmaß minus Körpermaß der Shop-Größentabelle bestimmt, sonst manuell beim Vermessen, Händler kann korrigieren.
- **Lernen gestaffelt:** gleitende Anpassung ab der ersten Rückmeldung (Gewicht n/(n+25)), Hinweis „fällt klein/groß aus“ ab 20 Rückmeldungen mit ≥75 % in eine Richtung, volle Korrektur ab 50. Wenig Daten: Gruppe Marke × Kategorie.
- Alle Zahlen der Logik stehen in `ommetryx-konfiguration-v3.xlsx` und `schnittstellen-dokumentation-v3.md`. Die Lage der Bereiche ist belegt, die genauen Grenzen sind Startwerte und werden mit echten Rückmeldungen kalibriert.

## 4. Vermessungsprogramm

- Das Programm des Mitgründers (Foto, Bankkarte als Maßstab) **trainiert noch** in Schleifen. Ziel: höchstens **±1 cm Umfang** Abweichung gegenüber der Handmessung (±0,5 cm Flachmaß), in 95–99 % der Messungen.
- **Es wird zum Start NICHT eingebunden.** Kleidungsmaße werden von Hand in die interne Erfassungsmaske eingetragen (Flachmaß × 2), im Format aus v3. Später liefert das Programm denselben Datensatz.
- Die Handmessungen dienen später als Prüfdaten für das Programm.
- Neue Felder je Artikel: `schnitt`, `schnitt_quelle`, `material_dehnung_prozent`, `tailliert`, `bund_typ`, `aermel_typ`, `messhoehe_brust_cm` (Standard 2,5 cm unter dem Armloch).

## 5. Technik (aus der Recherche vom 21.10., entschieden)

| Thema | Entscheidung |
|---|---|
| Shopify-App | Offizielles React-Router-Template (TypeScript), `shopify app init`. Remix-Anleitungen sind veraltet. Shopify hat React Router auf 7.18.2 gepinnt, nicht blind aktualisieren. |
| Händler-UI | App Bridge + Polaris Web Components im Shopify-Admin |
| Datenbank | PostgreSQL über Prisma (nicht SQLite), Render Frankfurt |
| Vermessung (später) | Python-Programm als eigener FastAPI-Dienst, nur intern |
| Empfehlungslogik | TypeScript-Modul ohne Shopify-Abhängigkeit, Werte aus Konfigurationstabellen, Tests mit Vitest |
| Widget | Theme App Extension (App-Block über der Größenauswahl), Lader < 10 KB, eigentliches Widget im Shadow DOM lädt erst beim Klick. Shop darf höchstens 10 Lighthouse-Punkte verlieren. |
| Datenaustausch Widget | App Proxy, HMAC-Signatur immer prüfen. `logged_in_customer_id` ist kein Login-Nachweis. |
| Login Kundin | E-Mail + 6-stelliger Code, selbst gebaut; Hash, 10 Min. gültig, einmalig, Sperre nach Fehlversuchen, Rate-Limit, immer gleiche Antwort |
| E-Mail | Brevo (EU) |
| Shopify-Kundenkonten | nicht verknüpfen; Protected Customer Data höchstens Stufe 1, keine Namen/E-Mails von Shopify |
| Abrechnung | Managed Pricing: kostenloser Plan + bezahlter Plan mit Testphase |
| Hosting-Kosten Start | ca. 50–90 €/Monat |
| Gründung | Erst wenn EXIST nicht klappt; vor Livebetrieb mit echten Daten aber UG/GmbH (Haftung) |

Datenbank-Idee: Schema `identity` (E-Mail verschlüsselt + Hash zur Suche, Einwilligungen, last_active_at), Schema `body` (pseudonym_id, Maße verschlüsselt), Zuordnung in eigener Tabelle nur für den Login-Dienst lesbar, zwei Postgres-Rollen.

## 6. Datenschutz (aus der Recherche vom 21.10.)

- Körpermaße vorsorglich als Gesundheitsdaten (Art. 9 DSGVO) → **ausdrückliche Einwilligung** bleibt.
- **Drei getrennte Einwilligungen:** (1) Profil und Maße speichern/für Empfehlungen nutzen, (2) Umfrage-Mail „Hat es gepasst?“ (gilt rechtlich als Werbung, BGH VI ZR 225/17 → eigene Einwilligung, Double-Opt-In), (3) Rückmeldungen nutzen, um Empfehlungen für alle zu verbessern. Jeweils mit Zeitstempel, Textversion, Shop. Widerruf mit einem Klick. Altersabfrage 16+.
- **Rollenmodell mit drei Ebenen:** (1) Ommetryx allein verantwortlich für Profil und Empfehlung, (2) gemeinsam mit dem Händler verantwortlich nur für das Erheben im Widget (Art. 26), (3) Ommetryx als Auftragsverarbeiter für den Retouren-Report. Bestelldaten des Händlers NICHT für eigene Zwecke nutzen (sonst Art. 28 Abs. 10).
- **Kontrollgruppe (10 %)** serverseitig zuordnen (z. B. Hash der Session/Checkout-ID), nicht per localStorage-Kennung (TDDDG § 25). Nur Bestell-ID + Flag „mit/ohne Ommetryx“ + Retourenstatus.
- localStorage nur für Login nach aktiver Anmeldung und für die laufende Maßeingabe.
- Keine Maße und kein Gewicht in Logs, Fehler-Monitoring (PII-Filter) oder Analytics.
- Händler-Statistiken nur aggregiert mit Mindestgruppengröße (z. B. ≥ 20).
- Datenschutz-Folgenabschätzung sehr wahrscheinlich Pflicht → Datenschutzbeauftragter nach § 38 BDSG.
- Datenpanne: Behörde (BayLDA) in 72 Std., Shopify in 24 Std.
- Pflicht-Webhooks `customers/data_request`, `customers/redact`, `shop/redact`, Löschung binnen 30 Tagen. Offen (Anwalt): Löscht `customers/redact` das shopübergreifende Profil oder nur die Shop-Verknüpfung?
- Render ist eine US-Firma (Hauptverarbeitung laut DPA in den USA, Übermittlung über Data Privacy Framework). Region kann nachträglich nicht gewechselt werden → Plan B dokumentieren.
- Noch nicht anwaltlich geprüft.

## 7. Figma

- Datei „Design2“ (fileKey `4u0OvbUTYrundT6U0MYQcq`), Seiten „Design v1 · Endkunde/Händler/Intern“.
- E07 (Gewicht) gelöscht, E08 Figur ist jetzt Schritt 5, Fortschrittsbalken und „x von 5“ angepasst, E17 zeigt „Schritt 2 von 5“.
- Offen: interne Erfassungsmaske I02 um die neuen Artikel-Felder ergänzen; zwei leere Frames auf der Händler-Seite löschen.

## 8. Team und Arbeitsweise

- Leonie: Design, Texte, Recht, Organisation. Kommt aus dem Design (Multimediale Kommunikation und Dokumentation, TH Aschaffenburg), keine Programmiererfahrung, lernt durch Machen. Möchte einfache Erklärungen vor der Umsetzung, Deutsch, locker, mit Du.
- Mitgründer: Technik, hat das Vermessungsprogramm gebaut.
- Händler werden in der App mit „Sie“ angesprochen.

## 9. Offene Entscheidungen

- Kragen-Grenzwert für Hemden (bis dahin nur mit Hinweis empfehlen).
- Shapewear bleibt ausgeschlossen.
- Faktor 0,5 in der Größen-Umrechnung kalibrieren.
- Interne Prüfvorschrift für die Dehnungsmessung (feste Zugkraft).
- Anwaltsfragen: siehe Dokument „Ommetryx Datenschutz verständlich erklärt“.
