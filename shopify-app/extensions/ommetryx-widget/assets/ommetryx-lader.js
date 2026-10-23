/* Ommetryx Lader – lädt das Widget erst beim Klick (Ziel: unter 10 KB, keine Arbeit beim Seitenaufbau). */
(function () {
  var laedt = null;

  function ladeWidget(adresse) {
    if (window.OmmetryxWidget) return Promise.resolve(window.OmmetryxWidget);
    if (!laedt) {
      laedt = new Promise(function (fertig, fehler) {
        var skript = document.createElement("script");
        skript.src = adresse;
        skript.async = true;
        skript.onload = function () {
          fertig(window.OmmetryxWidget);
        };
        skript.onerror = function () {
          laedt = null;
          fehler(new Error("Widget nicht geladen"));
        };
        document.head.appendChild(skript);
      });
    }
    return laedt;
  }

  document.addEventListener("click", function (ereignis) {
    var ziel = ereignis.target;
    var knopf = ziel && ziel.closest ? ziel.closest("[data-ox-einstieg] button") : null;
    if (!knopf) return;
    var einstieg = knopf.closest("[data-ox-einstieg]");
    knopf.setAttribute("aria-busy", "true");
    ladeWidget(einstieg.getAttribute("data-widget"))
      .then(function (widget) {
        widget.oeffnen({
          produkt: einstieg.getAttribute("data-produkt"),
          proxy: einstieg.getAttribute("data-proxy"),
          ausloeser: knopf,
        });
      })
      .catch(function () {
        knopf.textContent = "Größenberatung gerade nicht verfügbar";
      })
      .then(function () {
        knopf.removeAttribute("aria-busy");
      });
  });
})();
