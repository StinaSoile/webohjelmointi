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
  console.log(data);
  luoRastiLista();

  function luoRastiLista() {
    const div = document.getElementById("rastit");
    let lista = document.getElementById("rastilista");
    if (lista !== "undefined") {
      lista.remove();
    }
    lista = document.createElement("ul");
    lista.setAttribute("id", "rastilista");
    div.appendChild(lista);

    // lisätään joukkueet listaan, sortataan se
    // ja lisätään joukkueet jäsenineen yksitellen tulostaJoukkue-funktion avulla
    let rastilista = [];
    for (const rasti of data.rastit) {
      rastilista.push(rasti);
    }
    rastilista.sort((a, b) => {
      if (a.koodi.trim().toLowerCase() < b.koodi.trim().toLowerCase()) {
        return 1;
      }
      if (a.koodi.trim().toLowerCase() > b.koodi.trim().toLowerCase()) {
        return -1;
      }
      return 0;
    });

    for (let i = 0; i < rastilista.length; i++) {
      tulostaRasti(rastilista[i], i + 1, rastilista.length);
    }
  }

  // lisätään yksi annettu rasti listaan */
  function tulostaRasti(rasti, i, length) {
    const lista = document.getElementById("rastilista");

    const li = document.createElement("li");
    // const a = document.createElement("a");
    li.textContent = rasti.koodi.trim();

    // li.appendChild(a);
    lista.appendChild(li);
    let color = rainbow(length, i);
    console.log(color);
    $("ul#rastilista li:nth-child(" + i + ")").css("background-color", color);
  }

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
      tulostaJoukkue(joukkuelista[i], i + 1, joukkuelista.length);
    }
  }

  // lisätään yksi annettu joukkue listaan, alla olevassa muodossa
  /* <ul id="joukkuelista">
  <li>
    Joukkue A
  </li>
</ul>; */
  function tulostaJoukkue(joukkue, i, length) {
    const lista = document.getElementById("joukkuelista");

    const li = document.createElement("li");
    li.textContent = joukkue.nimi.trim();

    lista.appendChild(li);
    let color = rainbow(length, i);
    console.log(color);
    $("ul#joukkuelista li:nth-child(" + i + ")").css("background-color", color);
  }

  function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch (i % 6) {
      case 0:
        r = 1;
        g = f;
        b = 0;
        break;
      case 1:
        r = q;
        g = 1;
        b = 0;
        break;
      case 2:
        r = 0;
        g = 1;
        b = f;
        break;
      case 3:
        r = 0;
        g = q;
        b = 1;
        break;
      case 4:
        r = f;
        g = 0;
        b = 1;
        break;
      case 5:
        r = 1;
        g = 0;
        b = q;
        break;
    }
    let c =
      "#" +
      ("00" + (~~(r * 255)).toString(16)).slice(-2) +
      ("00" + (~~(g * 255)).toString(16)).slice(-2) +
      ("00" + (~~(b * 255)).toString(16)).slice(-2);
    return c;
  }
};
