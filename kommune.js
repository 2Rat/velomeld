// kommune.js – 2Rat Radwegemelder
// Kommune-Geofencing per URL-Parameter
// Nutzung: https://2rat.github.io/velomeld/?kommune=Wadgassen
// Keine Aenderungen an index.html noetig (ausser dieses Script einbinden)

(function () {
  var params = new URLSearchParams(window.location.search);
  var paramKommune = params.get('kommune');
  if (!paramKommune) return;

  // GPS-Auto-Zentrierung blockieren:
  // map.setView mit Zoom 16 wird einmalig beim GPS-First-Fix aufgerufen.
  // Wir ueberschreiben es temporaer, damit die Kommune-Ansicht bleibt.
  var waitForMap = setInterval(function () {
    if (typeof map === 'undefined') return;
    clearInterval(waitForMap);

    var origSetView = map.setView.bind(map);
    var blocked = true;
    map.setView = function (center, zoom, options) {
      if (blocked && zoom === 16) return map;
      return origSetView(center, zoom, options);
    };
    // Nach 8 Sekunden Blockade aufheben (GPS-First-Fix ist dann durch)
    setTimeout(function () { blocked = false; }, 8000);

    // Geofence laden
    loadGeofence(paramKommune);
  }, 100);

  // Banner einfuegen
  var banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2000;' +
    'background:linear-gradient(135deg,#1A5FA8,#0E3F73);color:#fff;' +
    'text-align:center;padding:10px 16px;font-family:DM Sans,sans-serif;' +
    'font-size:14px;font-weight:600;box-shadow:0 2px 12px rgba(0,0,0,.2)';
  banner.innerHTML = '\uD83D\uDCCD Radwegemelder <strong>' + paramKommune + '</strong>';
  document.body.prepend(banner);

  // Platz fuer Banner schaffen
  setTimeout(function () {
    document.querySelectorAll('[data-screen]').forEach(function (s) {
      s.style.paddingTop = '38px';
    });
  }, 100);

  // Titel anpassen
  document.title = 'Radwegemelder ' + paramKommune;

  // Karten-Link unten anpassen
  setTimeout(function () {
    var karteLink = document.querySelector('a[href="./karte.html"]');
    if (karteLink) {
      karteLink.href = './karte.html?kommune=' + encodeURIComponent(paramKommune);
      karteLink.textContent = '\uD83D\uDDFA\uFE0F Ergebniskarte ' + paramKommune + ' ansehen';
    }
  }, 200);

  function loadGeofence(name) {
    fetch(
      'https://nominatim.openstreetmap.org/search?q=' +
        encodeURIComponent(name + ', Deutschland') +
        '&format=json&polygon_geojson=1&limit=1',
      { headers: { 'User-Agent': '2Rat-Radwegemelder/1.0' } }
    )
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.length) return;
        var r = data[0];
        var displayName = r.display_name.split(',')[0];
        banner.innerHTML = '\uD83D\uDCCD Radwegemelder <strong>' + displayName + '</strong>';

        if (r.geojson && (r.geojson.type === 'Polygon' || r.geojson.type === 'MultiPolygon')) {
          var poly = L.geoJSON(r.geojson, {
            style: { color: '#1A5FA8', weight: 2, fillColor: '#1A5FA8', fillOpacity: 0.05, dashArray: '6,4' }
          }).addTo(map);
          map.fitBounds(poly.getBounds(), { padding: [40, 40] });
        } else if (r.boundingbox) {
          var b = L.latLngBounds(
            [+r.boundingbox[0], +r.boundingbox[2]],
            [+r.boundingbox[1], +r.boundingbox[3]]
          );
          map.fitBounds(b, { padding: [40, 40] });
        }
      })
      .catch(function (e) { console.error('[Kommune] Fehler:', e); });
  }
})();
