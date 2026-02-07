# 2Rat Radwegemelder – Supabase Setup-Anleitung

## Schritt 1: Supabase-Konto erstellen

1. Gehe auf **https://supabase.com** und erstelle ein kostenloses Konto
2. Klicke auf **"New Project"**
3. Wähle folgende Einstellungen:
   - **Name:** `radwegemelder`
   - **Database Password:** Ein sicheres Passwort (aufschreiben!)
   - **Region:** `EU Central (Frankfurt)` ← wichtig für DSGVO!
4. Warte bis das Projekt erstellt ist (~2 Minuten)

## Schritt 2: Datenbank einrichten

1. Im Supabase-Dashboard links auf **"SQL Editor"** klicken
2. Auf **"New Query"** klicken
3. Den kompletten Inhalt der Datei **`supabase-setup.sql`** einfügen
4. Auf **"Run"** klicken (grüner Button)
5. Es sollte "Success" erscheinen

## Schritt 3: API-Schlüssel holen

1. Im Dashboard links auf **"Settings"** (Zahnrad) klicken
2. Dann auf **"API"**
3. Dort findest du zwei Werte:
   - **Project URL** – z.B. `https://abc123xyz.supabase.co`
   - **anon public Key** – ein langer String, beginnt mit `eyJ...`

## Schritt 4: App konfigurieren

1. Öffne die Datei **`index.html`**
2. Suche nach diesen zwei Zeilen (ca. Zeile 1890):

```javascript
const SUPABASE_URL = 'DEINE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'DEIN_SUPABASE_ANON_KEY';
```

3. Ersetze die Platzhalter durch deine echten Werte:

```javascript
const SUPABASE_URL = 'https://abc123xyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...dein-langer-key...';
```

4. Speichern und auf GitHub hochladen

## Schritt 5: Testen

1. App öffnen: https://2rat.github.io/velomeld/
2. Oben links sollte neben "GPS" jetzt "Online" stehen (grüner Punkt)
3. Eine Test-Meldung erstellen
4. Im Supabase-Dashboard auf "Table Editor" → "reports" klicken
5. Die Meldung sollte dort erscheinen!

## Wichtig: Was passiert wenn kein Internet da ist?

Die App funktioniert weiterhin offline – Meldungen werden lokal gespeichert.
Sobald wieder Internet da ist, werden sie automatisch synchronisiert.
Der Sync-Status oben links zeigt an, ob alles synchron ist.

## Kosten

Der kostenlose Supabase-Tier beinhaltet:
- 500 MB Datenbankspiecher
- 1 GB Foto-Speicher
- 50.000 API-Aufrufe/Monat

Das reicht für mehrere tausend Meldungen. Upgrade auf Pro (25$/Monat) erst nötig bei sehr vielen Nutzern.
