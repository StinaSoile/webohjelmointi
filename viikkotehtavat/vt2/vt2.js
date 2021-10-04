"use strict";
//@ts-check 
// data-muuttuja on lähes sama kuin viikkotehtävässä 1.
//


// Kopio joukkueesta jotta voin käyttää sortia
function luoJoukkueet() { 
    let joukkueet = JSON.parse(JSON.stringify(data.joukkueet));
    return joukkueet;
}

// objekti, jossa viitteet sarjoitin, key on sarjan id
function luoSarjat() {
    let sarjat = {};
    for (const sarja of data.sarjat) {
       if(sarja.id) {
        sarjat[sarja.id] = sarja;           
       }
    }
    return sarjat;
}

// objekti, jossa viitteet rasteihin, key on rastin id
function luoRastit() {
    let rastit = {};
    for (const rasti of data.rastit) {
       if(rasti.id) {
        rastit[rasti.id] = rasti;           
       }
    }
    return rastit;
}

// sorttaa joukkueet aakkosjärjestykseen ja sitten järjestykseen sarjan mukaan
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

// tekee yhden rivin listaan, muotoa <tr><td>sNimi</td><td>jNimi</th></tr>

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

function lisaaKentta(f, txt) {
    let p = document.createElement('p');
    let label = document.createElement('label');
    let input = document.createElement('input');
    input.type = 'text';
    input.value = '';
    label.textContent = txt;
    p.appendChild(label);
    p.appendChild(input);
    p.className = 'kentta';
    f.appendChild(p);
    return f;
}

/* <legend>Uusi joukkue</legend>
<p><label>Nimi <input type="text" value="" /></label></p>
<p><button name="joukkue">Lisää joukkue</button></p>
<p><button name="muokkaa">Tallenna muutokset</button></p>
</fieldset> */

let joukkueet = luoJoukkueet();
let sarjat = luoSarjat();
let rastit = luoRastit();
jarjestaJoukkueet();

//lisätään kaikki joukkueet oikeassa järjestyksessä listaan
let lista = document.querySelector('#tupa > table');
for (const i of joukkueet) {
    let tr = getTr(sarjat[i.sarja].nimi, i.nimi);
    lista.appendChild(tr);
}

//Nämä ovat rastin lisäämislomakkeen luomista
let rastiForm = document.querySelector('form');
let field = document.createElement('fieldset');
field.id = 'rastiField';
rastiForm.appendChild(field);
let otsikko = document.createElement('legend');
otsikko.textContent = "Rastin tiedot";
field.appendChild(otsikko);
lisaaKentta(field, 'Lat');
lisaaKentta(field, 'Lon');
lisaaKentta(field, 'Koodi');
let button = document.createElement('button');
button.textContent = "Lisää rasti";
field.appendChild(button);




console.log(data);
