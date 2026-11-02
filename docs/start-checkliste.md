# Start-Checkliste: von lokal auf den echten Server

Stand: 2.11.2026. **Noch ist nichts davon passiert.** Reihenfolge einhalten. Jeder Schritt mit „Team“ braucht eure Konten und euer OK, Claude führt durch.

## A. Vor dem ersten Server: Klärung

- [ ] Anwalt: Rolle von Ommetryx (im Auftrag oder selbst verantwortlich), AVV-Volltext, Datenschutzerklärung, Einwilligungstexte
- [ ] Shopify-Support: Regel 5.1.5 geklärt
- [ ] Vollständiger AVV-Text in der App (Händler bestätigt „gelesen“, sieht bisher nur die Kurzfassung)
- [ ] Impressum, TOMs, AGB, Kontakt-E-Mail, Kostenregel Muster-Versand
- [ ] Preise validiert, Pläne im Partner Dashboard (USD), Abo-Seite gebaut (Etappe 10d)
- [ ] Du-Texte gegengelesen

## B. Konten und Verträge (Team)

- [ ] Render-Konto, AVV mit Render, Plan B dokumentieren (US-Firma)
- [ ] Brevo-Konto, AVV mit Brevo, Absender-Domain bestätigen
- [ ] Domain für „Mein Ommetryx“ (bis Mitte Dezember)
- [ ] Monitoring-Dienst wählen, AVV, PII-Filter einbauen (noch nicht im Code)
- [ ] Backups der Datenbank: Tarif und Aufbewahrung festlegen und dokumentieren

## C. Server anlegen (Team, Claude führt durch)

- [ ] In Render aus `render.yaml` anlegen. **Vorher Tarife und Kosten prüfen.**
- [ ] Postgres-Version prüfen (`render.yaml`: 17, lokal läuft 18) und ob der Render-Datenbankbenutzer Rollen anlegen darf (`db-rollen.mjs` braucht das)
- [ ] Vier Schlüssel erzeugen und in Render eintragen, je einzeln, nie in Chat oder Code:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

- [ ] Drei Datenbank-Adressen eintragen (`ommetryx_app`, `ommetryx_identity`, `ommetryx_body`), je eigenes Passwort: mindestens 16 Zeichen, nur Buchstaben, Ziffern, `_`, `-`. Host, Port und Datenbank aus Render, jeweils mit `?schema=app`, `identity` oder `body`
- [ ] Brevo-Schlüssel, Absender, Shopify-Werte eintragen
- [ ] Ersten Deploy von Hand auslösen. **Der Docker-Bau wurde lokal noch nie getestet** (Docker fehlt hier), beim ersten Bau genau hinsehen.
- [ ] Prüfen: `https://<adresse>/gesund` zeigt `ok`
- [ ] **Einmalig** Startwerte laden: `node prisma/startwerte.ts` in der Render-Shell. Nicht wiederholen, ersetzt die Konfiguration.
- [ ] Team-Zugänge: `npm run team:einladen`, Zwei-Faktor einrichten

## D. Shopify anbinden (Team)

- [ ] Eigene App-Konfiguration für den Server, `application_url` und `redirect_urls` setzen (stehen noch auf `example.com`)
- [ ] Shopify CLI: Aktualisierung auf 5.x vorher prüfen
- [ ] `shopify app deploy`: Erst dann kennt Shopify die Pflicht-Webhooks. Mit Theme-Erweiterung geht diese Version an alle Installationen.
- [ ] Pflicht-Webhooks mit dem Test-Shop prüfen
- [ ] Cron-Job `ommetryx-pflege` einmal von Hand starten, Ausgabe prüfen

## E. Erster Durchlauf im Test-Shop (noch ohne echte Kundinnen)

- [ ] AVV bestätigen (erst jetzt, mit Leonies OK)
- [ ] Button-Gestaltung speichern, im Shop ansehen: bisher nie mit echten Werten gelaufen
- [ ] Größe übernehmen im echten Shop testen
- [ ] Code-Mail kommt über Brevo an
- [ ] Lighthouse: höchstens 10 Punkte Verlust
- [ ] Screenreader-Test des Widgets
- [ ] `npm audit` neu prüfen

## F. Danach

- [ ] Pilot-Händler
- [ ] App-Store-Selbstprüfung wiederholen, Einreichung bis 10.1.2027
- [ ] Offene Fragen an den Mitgründer: Abzug „knapp“, Figur-Korrektur, Kragen und Gummizug, Plausibilitätswerte

## Wenn etwas schiefgeht

- Render: vorherigen Deploy wiederherstellen (kein Auto-Deploy, also nur bewusste Stände).
- Neue Migration prüfen, bevor sie auf den Server geht: Sie läuft bei jedem Deploy automatisch.
- Datenpanne: BayLDA in 72 Stunden, Shopify in 24 Stunden.
