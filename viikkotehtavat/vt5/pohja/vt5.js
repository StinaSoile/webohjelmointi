"use strict";
// seuraavat estävät jshintin narinat jqueryn ja leafletin objekteista
/* jshint jquery: true */
/* globals L */

window.onload = function () {
  console.log(data);
  let layerGroup = []; // tallennetaan tänne polylinet kartalta nini että ne voi hakea id:n perusteella
  let mymap = luoKartta();
  luoJoukkueLista();
  luoRastiLista();
  luoDragDrop(mymap, layerGroup);
  let bounds = piirraRastit(mymap);
  $(window).resize(function () {
    mymap.fitBounds(bounds);
  });
  //nappi johon voi sijoittaa testattavia juttuja:
  document
    .getElementById("button")
    .addEventListener("click", () => zoom(mymap));
}; //onload -funktion loppu, huomaa

function zoom(mymap) {
  console.log(mymap);
}

function piirraRastit(mymap) {
  let lonArr = [];
  let latArr = [];
  for (const rasti of data.rastit) {
    let lat = rasti.lat;
    let lon = rasti.lon;
    let circle = L.circle([lat, lon], {
      color: "red",
      fillOpacity: 0.0,
      radius: 50,
    }).addTo(mymap);
    lonArr.push(lon);
    latArr.push(lat);
  }
  let minlat = Math.min(...latArr);
  let maxlat = Math.max(...latArr);
  let minlon = Math.min(...lonArr);
  let maxlon = Math.max(...lonArr);
  let corner1 = L.latLng(minlat, minlon);
  let corner2 = L.latLng(maxlat, maxlon);
  let bounds = L.latLngBounds(corner1, corner2);
  mymap.fitBounds(bounds);
  // mymap.fitBounds([
  //   [minlat, minlon],
  //   [maxlat, maxlon],
  // ]);
  return bounds;
}

function haeJoukkue(i) {
  let j;
  for (const joukkue of data.joukkueet) {
    if (joukkue.id.toString() === i.substring(2)) {
      j = joukkue;
    }
  }
  return j;
}

/**
 * //KOPIOITU VT1:stä
 * hakee annetun joukkueen merkitsevät rastit.
 * @param {Object} joukkue
 * @returns Array, johon on tallennettu koodit niistä joukkueen rasteista, jotka huomioidaan
 */
function haeRastit(joukkue) {
  let arr = [];
  let kayty = {};
  for (const r of joukkue.rastit) {
    //käydään läpi kaikki joukkueen rastit
    if (typeof r === "object") {
      //varmistetaan, että rasti on objekti eikä jotain outoa

      for (const d of data.rastit) {
        if (r.rasti === d.id && kayty[r.rasti] === undefined) {
          //etsitään, onko tietokannassa rastia joka vastaa joukkueen merkitsemää
          kayty[r.rasti] = true;
          arr.push(d); //jos rasti vastaa tietokannan rastia, lisätään sen koodi listaan
        }
      }
    }
  }
  return arr;
}

function piirraJoukkueenMatka(id, mymap, layerGroup) {
  const joukkue = haeJoukkue(id);
  const rastiArr = haeRastit(joukkue); // tämä on nyt lista rastiobjekteista
  let koord = [];
  for (let i = 0; i < rastiArr.length; i++) {
    koord.push([rastiArr[i].lat, rastiArr[i].lon]);
  }
  let color = document.getElementById(id).style.backgroundColor;
  let line = L.polyline(koord, { color: color }).addTo(mymap);
  line.id = id;
  layerGroup.push(line);
}

const ps = {};

function luoDragDrop(mymap, layerGroup) {
  let drop = document.getElementById("keskilista");
  let joukkuedrop = document.getElementById("joukkueet");
  let rastidrop = document.getElementById("rastit");

  window.onresize = function (e) {
    const lis = drop.getElementsByTagName("li");
    const dropLeft = drop.getBoundingClientRect().left;
    for (const l of lis) {
      const a = drop.getBoundingClientRect().right - dropLeft;
      l.style.left = a * ps[l.id] + "px";
    }
  };

  luoDrag(drop);
  luoDrag(joukkuedrop);
  luoDrag(rastidrop);
  // drop.addEventListener("dragover", function (e) {
  //   e.preventDefault();
  //   // Set the dropEffect to move
  //   e.dataTransfer.dropEffect = "move";
  // });

  // joukkuedrop.addEventListener("dragover", function (e) {
  //   e.preventDefault();
  //   // Set the dropEffect to move
  //   e.dataTransfer.dropEffect = "move";
  // });

  // rastidrop.addEventListener("dragover", function (e) {
  //   e.preventDefault();
  //   // Set the dropEffect to move
  //   e.dataTransfer.dropEffect = "move";
  // });

  drop.ondrop = function (e) {
    e.preventDefault();
    let el;
    let rId = e.dataTransfer.getData("rastidata");
    if (rId.length !== 0) {
      el = document.getElementById(rId);
    }
    let id = e.dataTransfer.getData("joukkuedata");
    if (id.length !== 0) {
      el = document.getElementById(id);
      piirraJoukkueenMatka(id, mymap, layerGroup);
    }
    if (el) {
      drop.append(el);
      ps[el.id] = el.style.position = "absolute";
      el.style.top =
        // -el.offsetHeight / 2
        -drop.getBoundingClientRect().top + e.clientY + "px";

      el.style.left =
        // -el.offsetWidth / 2
        -drop.getBoundingClientRect().left + e.clientX + "px";

      const dropLeft = drop.getBoundingClientRect().left;
      // const dropTop = drop.getBoundingClientRect().top;

      const prevX = el.getBoundingClientRect().left;
      const a = drop.getBoundingClientRect().right - dropLeft;
      const b = prevX - dropLeft;
      const p = b / a;
    }
  };

  joukkuedrop.addEventListener("drop", function (e) {
    let jLista = document.getElementById("joukkuelista");
    e.preventDefault();
    let id = e.dataTransfer.getData("joukkuedata");
    if (id.length !== 0) {
      const el = document.getElementById(id);

      el.style.position = null;
      el.style.top = null;
      el.style.left = null;

      jLista.appendChild(el);
      for (let i = 0; i < layerGroup.length; i++) {
        if (layerGroup[i].id === id) {
          layerGroup[i].remove(mymap);
          layerGroup.splice(i, 1);
        }
      }
    }
  });

  rastidrop.addEventListener("drop", function (e) {
    let rLista = document.getElementById("rastilista");
    e.preventDefault();
    let data = e.dataTransfer.getData("rastidata");
    if (data.length !== 0) {
      const el = document.getElementById(data);

      el.style.position = null;
      el.style.top = null;
      el.style.left = null;
      rLista.appendChild(el);
    }
  });
}

function luoDrag(element) {
  element.addEventListener("dragover", function (e) {
    e.preventDefault();
    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move";
  });
}

function luoKartta() {
  let mapdiv = $("#map");

  mapdiv.css("width", Math.round(window.innerWidth) + "px");
  mapdiv.css("height", Math.round(window.innerHeight / 2) + "px");
  $(window).resize(function () {
    mapdiv.css("width", Math.round(window.innerWidth) + "px");
    mapdiv.css("height", Math.round(window.innerHeight / 2) + "px");
  });

  let mymap = new L.map("map", {
    crs: L.TileLayer.MML.get3067Proj(),
    center: [62.156532, 25.542431],
    zoom: 11,
  });

  L.tileLayer
    .mml_wmts({
      layer: "maastokartta",
      key: "c9d83f93-222a-4009-bd29-475127d32e9c",
    })
    .addTo(mymap);

  return mymap;
}

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

  const div = document.createElement("li");
  // const a = document.createElement("a");
  div.textContent = rasti.koodi.trim();
  // div.appendChild(a);
  div.setAttribute("id", "id" + rasti.id);

  div.setAttribute("draggable", "true");
  div.addEventListener("dragstart", function (e) {
    // raahataan datana elementin id-attribuutin arvo
    e.dataTransfer.setData("rastidata", div.getAttribute("id"));
  });
  lista.appendChild(div);
  let color = rainbow(length, i);
  $("#rastilista li:nth-child(" + i + ")").css("background-color", color);
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
  li.setAttribute("id", "id" + joukkue.id);
  li.setAttribute("draggable", "true");
  li.addEventListener("dragstart", function (e) {
    // raahataan datana elementin id-attribuutin arvo
    e.dataTransfer.setData("joukkuedata", li.getAttribute("id"));
  });
  lista.appendChild(li);
  let color = rainbow(length, i);

  $("#joukkuelista li:nth-child(" + i + ")").css("background-color", color);
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
