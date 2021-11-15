"use strict";
// seuraavat estävät jshintin narinat jqueryn ja leafletin objekteista
/* jshint jquery: true */
/* globals L */

window.onload = function () {
  let mapdiv = $("#map");
  mapdiv.css("width", Math.round(window.innerWidth) + "px");
  mapdiv.css("height", Math.round(window.innerHeight / 2) + "px");

  let mymap = new L.map("map", {
    crs: L.TileLayer.MML.get3067Proj(),
  }).setView([62.2333, 25.7333], 11);
  L.tileLayer
    .mml_wmts({
      layer: "maastokartta",
      key: "c9d83f93-222a-4009-bd29-475127d32e9c",
    })
    .addTo(mymap);
  luoJoukkueLista();

  // tulostetaan joukkueet aakkosjärjestyksessä.
  function luoJoukkueLista() {
    // jos on olemassa vanha lista, tuhotaan se ja luodaan uusi tyhjä
    const div = document.getElementById("joukkueet");
    let lista = document.getElementById("joukkuelista");
    if (lista !== "undefined") {
      lista.remove();
    }
    lista = document.createElement("ul");
    lista.setAttribute("id", "joukkuelista");
    div.appendChild(lista);

    // lisätään joukkueet listaan, sortataan se
    // ja lisätään joukkueet jäsenineen yksitellen tulostaJoukkue-funktion avulla
    let joukkuelista = [];
    for (const joukkue of data.joukkueet) {
      joukkuelista.push(joukkue);
      console.log(joukkue);
    }
    joukkuelista.sort((a, b) => {
      if (a.nimi.trim().toLowerCase() < b.nimi.trim().toLowerCase()) {
        return -1;
      }
      if (a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()) {
        return 1;
      }
      return 0;
    });

    for (let i = 0; i < joukkuelista.length; i++) {
      tulostaJoukkue(joukkuelista[i]);
    }
  }

  // lisätään yksi annettu joukkue listaan, alla olevassa muodossa
  /* <ul id="joukkuelista">
  <li>
    Joukkue A
  </li>
</ul>; */
  function tulostaJoukkue(joukkue) {
    const lista = document.getElementById("joukkuelista");

    const li = document.createElement("li");
    // const a = document.createElement("a");
    li.textContent = joukkue.nimi.trim();

    // li.appendChild(a);
    lista.appendChild(li);
  }
};
