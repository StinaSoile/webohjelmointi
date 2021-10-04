"use strict";
//@ts-check 
// data-muuttuja on lähes sama kuin viikkotehtävässä 1.
//



function luoJoukkueet() { 
    let joukkueet = JSON.parse(JSON.stringify(data.joukkueet));
    return joukkueet;
}

function luoSarjat() {
    let sarjat = {};
    for (const sarja of data.sarjat) {
       if(sarja.id) {
        sarjat[sarja.id] = sarja;           
       }
    }
    return sarjat;
}

function luoRastit() {
    let rastit = {};
    for (const rasti of data.rastit) {
       if(rasti.id) {
        rastit[rasti.id] = rasti;           
       }
    }
    return rastit;
}

function jarjestaJoukkueet() {
    joukkueet.sort((a, b) => a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase());

    joukkueet.sort(
        (a, b) => {
            let aKesto = sarjat[a.sarja].kesto;
            let bKesto = sarjat[b.sarja].kesto;
            if(aKesto < bKesto) {
                return -1;
            }
            if(aKesto > bKesto) {
                return 1;
            }
            return 0;
        }
    );
    return joukkueet;
}

function getTr(sNimi, jNimi) {
    let tr = document.createElement('tr');
    let a = document.createElement('td');
    a.textContent = sNimi;
    let b = document.createElement('td');
    b.textContent = jNimi;
    tr.appendChild(a);
    tr.appendChild(b);
    return tr;
}
//näkyville sarjan nimin ja joukkuen nimi
// luo formi jtk


let joukkueet = luoJoukkueet();
let sarjat = luoSarjat();
let rastit = luoRastit();
jarjestaJoukkueet();
// for (let i = 0; i < joukkueet.length; i++) {
//     console.log(joukkueet[i]); 
// }

let lista = document.querySelector('#tupa > table');
for (const i of joukkueet) {
    let tr = getTr(sarjat[i.sarja].nimi, i.nimi);
    lista.appendChild(tr);
}

console.log(lista);
console.log(data);
