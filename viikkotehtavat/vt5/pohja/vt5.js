"use strict";
// seuraavat estävät jshintin narinat jqueryn ja leafletin objekteista
/* jshint jquery: true */
/* globals L */

window.onload = function () {
  console.log(data);
  let mymap = luoKartta();
  luoJoukkueLista();
  lisaaJoukkueidenMatkat();
  luoRastiLista();
  luoDragDrop(mymap, layerGroup);
  let bounds = piirraRastit(mymap);
  $(window).resize(function () {
    mymap.fitBounds(bounds);
  });
}; //onload -funktion loppu, huomaa

let layerGroup = []; // tallennetaan tänne polylinet kartalta nini että ne voi hakea id:n perusteella
let onLi = false; //muuttuja, joka asetetaan trueksi,
// kun raahataan jotain toisen li-elementin päälle.

let currentMarker;
let currentCircle;

function piirraRastit(mymap) {
  let lonArr = [];
  let latArr = [];
  for (let i = 0; i < data.rastit.length; i++) {
    let rasti = data.rastit[i];
    let lat = rasti.lat;
    let lon = rasti.lon;

    let circle = L.circle([lat, lon], {
      color: "red",
      fillOpacity: 0.0,
      radius: 150,
    })
      .bindTooltip(rasti.koodi, {
        permanent: true,
        direction: "center",
      })
      .openTooltip()
      // .bindLabel('some text', { noHide: true })
      .addTo(mymap);

    circle.addEventListener("click", function (e) {
      let newKoord = circle.getLatLng();
      let marker = L.marker([newKoord.lat, newKoord.lng], {
        draggable: "true",
        // opacity: 0.0,
      }).addTo(mymap);

      // markkerin poisto
      if (currentMarker) {
        currentMarker.remove(mymap);
        currentCircle.setStyle({ fillOpacity: 0 });
      }
      currentCircle = circle;
      currentMarker = marker;
      circle.setStyle({ fillOpacity: 1 }); // color red

      // marker.setStyle({ opacity: 1 });
      // marker.draggable = true;

      let koord = marker.on("dragend", function (e) {
        koord = siirraYmpyraa(e.target, circle);
        rasti.lat = koord.lat.toString();
        rasti.lon = koord.lng.toString();
        lisaaJoukkueidenMatkat();
        let joukkueet = document.querySelectorAll("#keskilista .joukkue");
        for (const joukkue of joukkueet) {
          poistaJoukkueenReittiKartalta(joukkue.id, mymap);
          piirraJoukkueenMatka(joukkue.id, mymap, layerGroup);
        }

        // tässä kerätään kaikki joukkueet jotka on Kartalla, ja piirretään niiden matkat uudelleen.
        circle.setStyle({ fillOpacity: 0 });
        marker.remove(mymap);
      });
      // draggable
      // ulkoasun muutos, markeri
      // muualta marker pois ja ulkoasu normaaliksi
    });
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

  return bounds;
}

function siirraYmpyraa(marker, circle) {
  let koord = marker.getLatLng();
  circle.setLatLng(koord);
  return koord;
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

// luo jokaisen joukkueen perään sen kulkeman matkan (km) li-elementtiin
function lisaaJoukkueidenMatkat() {
  for (const joukkue of data.joukkueet) {
    let dist = haeMatka(joukkue);
    kirjoitaMatka(joukkue, dist);
  }
}

// laskee yhden joukkueen kulkeman matkan ja palauttaa sen kilometreinä
function haeMatka(joukkue) {
  let arr = haeRastit(joukkue);
  let dist = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    let lat1 = arr[i].lat;
    let lon1 = arr[i].lon;
    let lat2 = arr[i + 1].lat;
    let lon2 = arr[i + 1].lon;
    dist = dist + getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
  }
  return dist;
}

function kirjoitaMatka(joukkue, dist) {
  let el = document.getElementById("id" + joukkue.id);
  el.textContent = `${joukkue.nimi.trim()}, (${dist.toFixed(1)} km)`;

  // etsi joukkueen id:tä vastaava li
  // poista jos on aiempi matka
  // lisää sihen dist + " km"
}

/**
 * //KOPIOITU VT1:stä
 * hakee annetun joukkueen merkitsevät rastit.
 * TODO: viimeinen lahto ja eka maali, vt1/vt2
 * @param {Object} joukkue
 * @returns Array, johon on tallennettu koodit niistä joukkueen rasteista, jotka huomioidaan
 */
function haeRastit(joukkue) {
  let arr = [];
  let kayty = {};
  let alku = false;
  let lahto;
  let maali;
  for (const d of data.rastit) {
    if (d.koodi === "LAHTO") {
      lahto = d;
    }
    if (d.koodi === "MAALI") {
      maali = d;
    }
  }
  for (const r of joukkue.rastit) {
    //käydään läpi kaikki joukkueen rastit

    if (typeof r === "object") {
      //varmistetaan, että rasti on objekti eikä jotain outoa
      if (r.rasti === lahto.id) {
        arr = [lahto];
        alku = true;
      } else if (r.rasti === maali.id && alku) {
        arr.push(maali);
        return arr;
      } else {
        for (const d of data.rastit) {
          if (r.rasti === d.id && kayty[r.rasti] === undefined && alku) {
            //etsitään, onko tietokannassa rastia joka vastaa joukkueen merkitsemää
            kayty[r.rasti] = true;
            arr.push(d); //jos rasti vastaa tietokannan rastia, lisätään sen koodi listaan
          }
        }
      }
    }
  }
  return arr;
}

// funktio laskeen kahden pisteen etäisyyden, kopioitu allaolevalta sivulta 20.11.2021:
// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  let R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2 - lat1); // deg2rad below
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c; // Distance in km
  return d;
}

// tätä käytetään funktiossa getDistanceFromLatLonInKm, kopioitu samalta visulta kuin se
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// piirtää joukkueen kulkeman matkan, id on li-attríbuutin id, muotoa "id" + joukkueobjektin id
// mymap on map, layerGroup on array johon tallennetaan kartalla olevat polylinet, niin että ne voi poistaa helposti
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

const prosentitX = {};
const prosentitY = {};

function luoDragDrop(mymap) {
  let drop = document.getElementById("keskilista");
  let joukkuedrop = document.getElementById("joukkueet");
  let rastidrop = document.getElementById("rastit");
  let jLista = document.getElementById("joukkuelista");
  let rLista = document.getElementById("rastilista");

  window.onresize = function (e) {
    const lis = drop.getElementsByTagName("li");
    const dropLeft = drop.getBoundingClientRect().left;
    const dropTop = drop.getBoundingClientRect().top;
    for (const l of lis) {
      const dropWidth = drop.getBoundingClientRect().right - dropLeft;
      const dropHeight = drop.getBoundingClientRect().bottom - dropTop;
      l.style.left = dropWidth * prosentitX[l.id] + "px";
      l.style.top = dropHeight * prosentitY[l.id] + "px";
      eiYliOikeanLaidan(l, drop);
      eiYliAlaLaidan(l, drop);
    }
  };

  luoDrag(drop);
  luoDrag(joukkuedrop);
  luoDrag(rastidrop);

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
      el.style.position = "absolute";
      el.style.top =
        // -el.offsetHeight / 2
        -drop.getBoundingClientRect().top + e.clientY + "px";

      el.style.left =
        // -el.offsetWidth / 2
        -drop.getBoundingClientRect().left + e.clientX + "px";

      const dropLeft = drop.getBoundingClientRect().left;
      const dropTop = drop.getBoundingClientRect().top;

      const dropWidth = drop.getBoundingClientRect().right - dropLeft;
      const dropHeight = drop.getBoundingClientRect().bottom - dropTop;
      const suhtX = el.getBoundingClientRect().left - dropLeft;
      const suhtY = el.getBoundingClientRect().top - dropTop;
      prosentitX[el.id] = suhtX / dropWidth;
      prosentitY[el.id] = suhtY / dropHeight;

      eiYliOikeanLaidan(el, drop);
      eiYliAlaLaidan(el, drop);
    }
  };

  let jLi = document.querySelectorAll("#joukkuelista li");
  for (const li of jLi) {
    li.addEventListener("drop", function (e) {
      e.preventDefault();
      onLi = true;
      let id = e.dataTransfer.getData("joukkuedata");
      if (id.length !== 0) {
        const el = document.getElementById(id);
        if (el) {
          li.before(el);
        }
      }
    });
  }

  let rLi = document.querySelectorAll("#rastilista li");
  for (const li of rLi) {
    li.addEventListener("drop", function (e) {
      e.preventDefault();
      onLi = true;
      let id = e.dataTransfer.getData("rastidata");
      if (id.length !== 0) {
        const el = document.getElementById(id);
        if (el) {
          li.before(el);
        }
      }
    });
  }

  joukkuedrop.addEventListener("drop", function (e) {
    e.preventDefault();
    let id = e.dataTransfer.getData("joukkuedata");
    if (id.length !== 0) {
      const el = document.getElementById(id);

      el.style.position = null;
      el.style.top = null;
      el.style.left = null;

      // alla koodi joka poistaa joukkueen matkan polylinen kartalta. Tee omaksi funktioksi
      poistaJoukkueenReittiKartalta(id, mymap);
      if (onLi) {
        return;
      }
      jLista.appendChild(el);
    }
  });

  rastidrop.addEventListener("drop", function (e) {
    e.preventDefault();
    let data = e.dataTransfer.getData("rastidata");
    if (data.length !== 0) {
      const el = document.getElementById(data);

      el.style.position = null;
      el.style.top = null;
      el.style.left = null;
      if (onLi) {
        return;
      }
      rLista.appendChild(el);
    }
  });
}

function eiYliOikeanLaidan(what, where) {
  if (
    what.getBoundingClientRect().right > where.getBoundingClientRect().right
  ) {
    const w =
      what.getBoundingClientRect().right - what.getBoundingClientRect().left;
    const a =
      where.getBoundingClientRect().right - where.getBoundingClientRect().left;
    what.style.left = a - w + "px";
  }
}

function eiYliAlaLaidan(what, where) {
  if (
    what.getBoundingClientRect().bottom > where.getBoundingClientRect().bottom
  ) {
    const h =
      what.getBoundingClientRect().bottom - what.getBoundingClientRect().top;
    const a =
      where.getBoundingClientRect().bottom - where.getBoundingClientRect().top;
    what.style.top = a - h + "px";
  }
}

function poistaJoukkueenReittiKartalta(id, mymap) {
  for (let i = 0; i < layerGroup.length; i++) {
    if (layerGroup[i].id === id) {
      layerGroup[i].remove(mymap);
      layerGroup.splice(i, 1);
    }
  }
}

function luoDrag(element) {
  element.addEventListener("dragover", function (e) {
    e.preventDefault();
    onLi = false;
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
  li.setAttribute("class", "joukkue");
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
