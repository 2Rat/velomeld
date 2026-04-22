/**
 * ═══════════════════════════════════════════════════════
 *  2Rat Radmelder – White-Label / Kommune-Modus
 *  Version 1.0
 * ═══════════════════════════════════════════════════════
 * 
 *  EINBAU: Füge in index.html VOR </body> ein:
 *  
 *    <script src="whitelabel.js"></script>
 *  
 *  Das ist alles! Keine weiteren Änderungen nötig.
 * 
 * ═══════════════════════════════════════════════════════
 *  URL-PARAMETER:
 * 
 *  ?kommune=Lebach
 *    → Titel: "🚲 RADWEGECHECK LEBACH"
 *    → Untertitel: "Bürgerbeteiligung Stadt Lebach"
 *    → Karte zentriert auf Lebach
 * 
 *  ?kommune=Lebach&titel=Radwegecheck%20Lebach
 *    → Eigener Titel
 * 
 *  ?kommune=Homburg&farbe=%23CC0000
 *    → Titel in Rot (#CC0000)
 * 
 *  ?kommune=Lebach&untertitel=Mitmachen%20erwünscht!
 *    → Eigener Untertitel
 * 
 * ═══════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  // ─── URL-Parameter auslesen ───
  var params = new URLSearchParams(window.location.search);
  var paramKommune = params.get('kommune');
  var paramTitel = params.get('titel');
  var paramFarbe = params.get('farbe');
  var paramUntertitel = params.get('untertitel');

  // Kein Parameter → nichts tun (normale App)
  if (!paramKommune && !paramTitel) {
    console.log('[White-Label] Kein Kommune-Parameter – normale App.');
    return;
  }

  // ─── Werte vorbereiten ───
  var titel = paramTitel || ('Radwegecheck ' + paramKommune);
  var untertitel = paramUntertitel || ('Bürgerbeteiligung ' + (paramKommune ? 'Stadt ' + paramKommune : ''));
  var mainColor = paramFarbe || '#1A5FA8';

  console.log('[White-Label] Aktiv: ' + titel);

  // ─── Warten bis DOM + App fertig ───
  function applyWhenReady() {
    var header = document.getElementById('app-header');
    if (!header) {
      var homeScreen = document.querySelector('[data-screen="home"]');
      if (homeScreen) header = homeScreen.children[0];
    }
    if (!header) {
      setTimeout(applyWhenReady, 100);
      return;
    }
    applyWhiteLabel();
  }

  function applyWhiteLabel() {

    // ═══ 1. HEADER-TITEL ANPASSEN ═══
    var header = document.getElementById('app-header');
    if (!header) {
      var homeScreen = document.querySelector('[data-screen="home"]');
      if (homeScreen && homeScreen.children[0]) {
        header = homeScreen.children[0];
      }
    }
    if (header) {
      // FIX 2026-04-16: Neues Layout - Bike-SVG links, Text gestapelt rechts
      // RADWEGECHECK in Blau, Kommune-Name in Gruen
      var bikeColor = '#1A5FA8';
      var stadtColor = '#2D8C28';
      var bikeSvg = '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="' + bikeColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>';

      var textBlock;
      if (paramKommune && !paramTitel) {
        // Standard-Fall: zweizeilig RADWEGECHECK / KOMMUNE
        textBlock =
          '<div style="font-weight:800; font-size:22px; letter-spacing:2px; text-transform:uppercase; color:' + escHtml(bikeColor) + '; line-height:1.1;">Radwegecheck</div>' +
          '<div style="font-weight:800; font-size:22px; letter-spacing:2px; text-transform:uppercase; color:' + escHtml(stadtColor) + '; line-height:1.1;">' + escHtml(paramKommune) + '</div>';
      } else {
        // Custom-Titel: einzeilig wie bisher
        textBlock =
          '<div style="font-weight:800; font-size:22px; letter-spacing:2px; text-transform:uppercase; color:' + escHtml(mainColor) + '; line-height:1.1;">' + escHtml(titel) + '</div>';
      }

      header.style.cssText = 'display:grid; grid-template-columns:38fr 62fr; align-items:center; padding:16px 20px; background:#fff; border-bottom:none; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex-shrink:0;';
      header.innerHTML =
        '<div style="display:flex; justify-content:center;">' + bikeSvg + '</div>' +
        '<div>' +
          textBlock +
          '<div style="font-size:11px; color:#8A9BA4; font-weight:500; margin-top:4px; letter-spacing:0.3px;">' +
            escHtml(untertitel) +
          '</div>' +
        '</div>';
      console.log('[White-Label] Header → ' + titel);
    }

    // ═══ 2. BROWSER-TAB ═══
    document.title = titel;

    // ═══ 3. THEME-COLOR ═══
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme && paramFarbe) {
      metaTheme.setAttribute('content', paramFarbe);
    }

    // ═══ 4. UNTERTITEL ═══
    var bottomSub = document.querySelector('.home-bottom__subtitle');
    if (bottomSub && paramKommune) {
      bottomSub.textContent = 'Hilf mit, Radfahren in ' + paramKommune + ' besser zu machen!';
    }

    // ═══ 5. KARTEN-LINK ═══
    var kartenLink = document.getElementById('karte-link');
    if (!kartenLink) kartenLink = document.querySelector('a[href="./karte.html"]');
    if (kartenLink && paramKommune) {
      kartenLink.href = './karte.html?kommune=' + encodeURIComponent(paramKommune);
      kartenLink.textContent = '\uD83D\uDDFA\uFE0F Meldungskarte ' + paramKommune + ' ansehen';
    }

    // ═══ 6. FOOTER: TECHNISCHER BETREIBER ═══
    var footerExtra = document.getElementById('whitelabel-footer-extra');
    if (footerExtra) {
      footerExtra.style.display = 'block';
    } else {
      // Fallback: Vor Impressum einfügen
      var links = document.querySelectorAll('.home-bottom a');
      for (var i = 0; i < links.length; i++) {
        if (links[i].textContent.indexOf('Impressum') !== -1) {
          var betreiber = document.createElement('div');
          betreiber.style.cssText = 'text-align:center; margin-top:12px; margin-bottom:8px; font-size:10px; color:#8A9BA4;';
          betreiber.innerHTML = 'Technischer Betreiber: <a href="https://www.2rat.org" style="color:#1A5FA8; text-decoration:none; font-weight:600;">2Rat – Büro für Radverkehrsplanung</a>';
          var parent = links[i].parentNode;
          if (parent && parent.parentNode) {
            parent.parentNode.insertBefore(betreiber, parent);
          }
          break;
        }
      }
    }

    // ═══ 7. BESTÄTIGUNG ═══
    var confirmInfo = document.getElementById('confirm-sync-info');
    if (confirmInfo && paramKommune) {
      confirmInfo.textContent = 'Deine Meldung erscheint auf der Karte für ' + paramKommune + '.';
    }

    // ═══ 8. KARTE ZENTRIEREN ═══
    if (paramKommune) {
      geocodeKommune(paramKommune);
    }

    // ═══ 9. VERSION-TAG ═══
    var spans = document.querySelectorAll('.home-bottom span');
    for (var j = 0; j < spans.length; j++) {
      if (spans[j].textContent.indexOf('v1.') !== -1) {
        spans[j].textContent = spans[j].textContent + ' · WL';
        break;
      }
    }
  }

  // ─── Geocoding ───
  // FIX 2026-04-22: Zweistufige Nominatim-Abfrage mit Admin-Filter
  //   1. Mit Saarland-Suffix (Standardfall: Gemeinden/Kreise)
  //   2. Fallback ohne Saarland-Suffix (fuer Bundeslaender wie "Saarland")
  // Bevorzugt Treffer mit class=boundary/type=administrative, damit keine Uni/POI matcht.
  function _wlQueryNominatim(query) {
    var url = 'https://nominatim.openstreetmap.org/search?q=' +
      encodeURIComponent(query) +
      '&format=json&addressdetails=1&limit=5';
    return fetch(url, { headers: { 'User-Agent': '2Rat-Radwegemelder/1.0' } })
      .then(function(res) { return res.ok ? res.json() : []; })
      .catch(function() { return []; });
  }

  function _wlPickAdmin(arr) {
    if (!arr || !arr.length) return null;
    var a = arr.filter(function(x) { return x.class === 'boundary' && x.type === 'administrative'; })[0];
    return a || arr[0];
  }

  function geocodeKommune(name) {
    _wlQueryNominatim(name + ', Saarland, Deutschland').then(function(data1) {
      console.log('[White-Label] Nominatim Versuch 1 (' + name + ', Saarland, Deutschland): ' +
        data1.length + ' Treffer',
        data1.map(function(x) { return x.class + '/' + x.type + ' ' + x.display_name; }));
      var r = _wlPickAdmin(data1);
      if (r && r.class === 'boundary') {
        console.log('[White-Label] Gewaehlt:', r.class + '/' + r.type, r.display_name);
        trySetMapView(parseFloat(r.lat), parseFloat(r.lon), name);
        return;
      }
      // 2. Versuch fuer Bundeslaender
      _wlQueryNominatim(name + ', Deutschland').then(function(data2) {
        console.log('[White-Label] Nominatim Versuch 2 (' + name + ', Deutschland): ' +
          data2.length + ' Treffer',
          data2.map(function(x) { return x.class + '/' + x.type + ' ' + x.display_name; }));
        var r2 = _wlPickAdmin(data2);
        if (r2) {
          console.log('[White-Label] Gewaehlt:', r2.class + '/' + r2.type, r2.display_name);
          trySetMapView(parseFloat(r2.lat), parseFloat(r2.lon), name);
        } else if (r) {
          // Notnagel: erster Treffer aus Versuch 1, auch wenn kein Boundary
          console.log('[White-Label] Gewaehlt (Fallback):', r.class + '/' + r.type, r.display_name);
          trySetMapView(parseFloat(r.lat), parseFloat(r.lon), name);
        } else {
          console.warn('[White-Label] Kommune nicht gefunden: ' + name);
        }
      });
    });
  }

  function trySetMapView(lat, lon, name) {
    // Globale map-Variable der App
    if (typeof map !== 'undefined' && map && map.setView) {
      map.setView([lat, lon], 14);
      console.log('[White-Label] Karte → ' + name + ' (' + lat.toFixed(4) + ', ' + lon.toFixed(4) + ')');
      return;
    }
    // Map noch nicht bereit – warten
    var attempts = 0;
    var interval = setInterval(function() {
      attempts++;
      if (typeof map !== 'undefined' && map && map.setView) {
        map.setView([lat, lon], 14);
        console.log('[White-Label] Karte → ' + name + ' (Versuch ' + attempts + ')');
        clearInterval(interval);
      } else if (attempts > 30) {
        console.warn('[White-Label] Map nicht gefunden');
        clearInterval(interval);
      }
    }, 500);
  }

  // ─── Helper ───
  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ─── Start ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(applyWhenReady, 400);
    });
  } else {
    setTimeout(applyWhenReady, 400);
  }

})();
