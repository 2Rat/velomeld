# 🚲 2Rat Radmelder

**App zur Erfassung von Radverkehrsinfrastruktur und Mängelmeldung**

## Projektstruktur

```
radmelder/
├── index.html          # Haupt-HTML (Single Page App)
├── manifest.json       # PWA-Manifest
├── sw.js               # Service Worker (Offline)
├── css/
│   └── app.css         # Stylesheet (2Rat Branding + Ampelfarben)
├── js/
│   ├── app.js          # Haupt-App (Init, Events, Rendering)
│   ├── db.js           # IndexedDB via Dexie.js (Meldungen, Fotos)
│   ├── map.js          # Leaflet-Karte + GPS-Tracking
│   ├── camera.js       # Foto-Aufnahme + Resize
│   ├── categories.js   # Kategorien-System (Ampel: Rot/Gelb/Grün)
│   ├── export.js       # GeoJSON, CSV, QGIS-Style Export
│   └── router.js       # Screen-Navigation (Hash-basiert)
├── icons/              # App-Icons (192px, 512px)
└── img/                # Bilder und Assets
```

## Technologie-Stack

| Komponente        | Technologie                  |
|-------------------|------------------------------|
| Framework         | Vanilla JavaScript (ES Modules) |
| Karte             | Leaflet 1.9 + OpenStreetMap  |
| Lokale Datenbank  | IndexedDB via Dexie.js 3     |
| Offline           | Service Worker (Cache-First) |
| Kamera            | HTML5 MediaDevices API       |
| GPS               | Geolocation API              |
| Styling           | Custom CSS (kein Framework)  |
| Font              | DM Sans (Google Fonts)       |

## Features (MVP – Phase 1)

- ✅ PWA (installierbar, offline-fähig)
- ✅ GPS-Positionierung mit Genauigkeitsanzeige
- ✅ Leaflet-Karte mit OpenStreetMap
- ✅ Kategorien-System (Ampel: Probleme/Wünsche/Positiv)
- ✅ Foto-Aufnahme (bis zu 3 pro Meldung)
- ✅ Freitext-Kommentar
- ✅ Lokale Speicherung in IndexedDB
- ✅ GeoJSON-Export (QGIS-kompatibel)
- ✅ CSV-Export (Excel-kompatibel)
- ✅ QGIS-Stildatei mit Ampelfarben

## Entwicklung

### Lokaler Webserver starten

Die App muss über HTTPS oder localhost laufen (wegen Service Worker + GPS):

```bash
# Option 1: Python
python3 -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: VS Code
# Extension "Live Server" installieren → index.html → "Open with Live Server"
```

Dann öffnen: http://localhost:8080

### Auf Smartphone testen

1. Laptop und Handy im gleichen WLAN
2. IP-Adresse des Laptops finden (`ipconfig` / `ifconfig`)
3. Am Handy öffnen: `http://192.168.x.x:8080`
4. Für GPS: Chrome DevTools → Sensors → Location simulieren

### Icons generieren

Für die Veröffentlichung werden App-Icons in 192px und 512px benötigt.
Das Logo als PNG in `icons/icon-192.png` und `icons/icon-512.png` ablegen.

## Deployment

### Als PWA (GitHub Pages)

```bash
# Repository erstellen und Code pushen
git init
git add .
git commit -m "MVP v1.0"
git remote add origin https://github.com/009aj/radmelder.git
git push -u origin main

# In GitHub: Settings → Pages → Source: main → Save
# Erreichbar unter: https://009aj.github.io/radmelder/
```

### Als Android-App (PWABuilder)

1. https://pwabuilder.com öffnen
2. URL der PWA eingeben
3. Android-APK generieren lassen
4. Im Google Play Store hochladen (25€ Entwicklergebühr)

## Nächste Phasen

- **Phase 2:** Server-Sync (Supabase), Dashboard, Play Store
- **Phase 3:** Planer-Modus (erweiterte Attribute, Linien)
- **Phase 4:** Beteiligungsmodus (Geofencing, White-Label)

---

*2Rat Planungsbüro für Radverkehr · 2026*
