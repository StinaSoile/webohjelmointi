// kirjoita tähän tiedostoon javascript-ohjelmakoodisi
"use strict";
// lisää seuraava rivi, jos haluat visual studio coden ajavan TypeScriptin tyyppitarkistuksen
// ohjelmakoodillesi. Koodisi ei tarvitse olla TypeScriptiä.
// Mahdolliset ongelmat näet Visual Studio Coden problems-ikkunassa View|Problems (Ctrl+Shift+M)
// Saatat saada myös jotain turhia virheilmoituksia
//@ts-check

// katso selaimen konsolista, että tulostuuko seuraava testi-teksti
console.log("Hello world!");

let kissa = "Mirri";
let koira = "Musti";
console.log(kissa);
console.log(koira);
kissa = "Katti";
let elukat = ['Kissu', 'Koira', 'Hiiri', 'Koira'];
const elaimet = new Set(elukat);
console.log(elukat[0]);
console.log(elukat.length);
elukat.push('Kettu');
elukat.unshift('Rotta');
elukat.splice(2, 1);
elukat.pop();
elukat.shift();
elukat.splice(2, 0, 'Koira');
console.log(elukat);
console.log(elaimet);

let maarat = new Map();
maarat.set("Kissa", 2);
maarat.set("Koira", "1");
maarat.set("Hiiri", 0);
console.log(maarat);
console.dir(elukat);

for(let i=0; i<elukat.length; i++) {
    console.log(elukat[i]);
}

for (let value of elukat) {
    console.log(value);
}
for (let value in elukat) {
    console.log(elukat[value]);
}

console.log("-------------");

for (let value of maarat) {
    console.log(value);
}
console.log("-------------");
for(let [key, value] of maarat) {
    console.log(key + "=" + value);
}
console.log("-------------");
for (let key of maarat.keys()) {
    console.log(key + "=" + maarat.get(key));
}
let summa = 0;
for (let i=0; i<elukat.length; i++) {
    let elukka = elukat[i];
    let maara = maarat.get(elukka);
    console.log(elukka + ":" + maara);
    if (parseInt(maara)) {
        summa = summa + parseInt(maara);
    }
}
console.log(summa);
summa = 0;
console.log("--------------");
for (let elukka of elaimet) {
    let maara = maarat.get(elukka);
    console.log(elukka + ":" + maara);
    if (parseInt(maara)) {
        summa = summa + parseInt(maara);
    }
}
console.log(summa);

let elukka = new Object();
elukka.laji = 'Kissa';
elukka.nimi = 'Mirri';
elukka.paino = 4;
console.log ( elukka['laji']);
let elukka2 = {
    tyyppi:'Koira', nimi:'Musti', paino: 10
};
console.log(elukka2);

let otukset = elukat;
otukset[0] = 'Rotta';
console.log(elukat);
console.log(otukset);
let elaintarha = {
    "tyypit": [
      "Kissa",
      "Koira",
      "Hiiri"
    ],
    "elaimet": [
      {
        "tyyppi": "Kissa",
        "nimi": "Mirri",
        "paino": 5
      },
      {
        "tyyppi": "Koira",
        "nimi": "Musti",
        "paino": 10
      },
      {
        "tyyppi": "Koira",
        "nimi": "Murre",
        "paino": 10
      }
    ]
  };
  console.log("----------------");
  console.log(elaintarha);
  function tyypit (e) {
      let tyypit = e.tyypit;
      for(let tyyppi of tyypit) {
          console.log(tyyppi);
      }
  }
  tyypit(elaintarha);