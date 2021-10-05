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

//lisätään annettuun fieldiin kenttä jossa on annettu labelin teksti.
// Tällä on siis tehty Lat, Lon ja Koodi - kentät
function lisaaKentta(f, txt) {
    let label = document.createElement('label');
    let span = document.createElement('span');
    let input = document.createElement('input');
    input.type = 'text';
    input.value = '';
    span.textContent = txt;
    label.appendChild(span);
    label.appendChild(input);
    f.appendChild(label);
    return f;
}

function lisaaRastilomake() {
    let rastiForm = document.querySelector('form');
    let field = document.createElement('fieldset');
    rastiForm.appendChild(field);
    let otsikko = document.createElement('legend');
    otsikko.textContent = "Rastin tiedot";
    field.appendChild(otsikko);
    lisaaKentta(field, 'Lat');
    lisaaKentta(field, 'Lon');
    lisaaKentta(field, 'Koodi');
    let button = document.createElement('button');
    button.textContent = "Lisää rasti";
    button.setAttribute('id', 'rasti');
    field.appendChild(button);
}
/* <form action="foobar.ei.toimi.example" method="post">
   <fieldset><legend>Rastin tiedot</legend>
        <label><span>Lat</span> <input type="text" value="" /></label>
        <label><span>Lon</span> <input type="text" value="" /></label>
        <label><span>Koodi</span> <input type="text" value="" /></label>
        <button id="rasti">Lisää rasti</button>
   </fieldset>
</form> */

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

lisaaRastilomake();
let form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    console.log('jea');
});

// const joukkue = {   //joukkueen luonti
//     nimi: 'Mallijoukkue',
//     jasenet: ['Lammi Tohtonen', 'Matti Meikäläinen'],
//     leimaustapa: [0, 2],
//     rastit: [],
//     sarja: undefined,
//     id: 99999,
// };

// lisaaJoukkue(data, joukkue, data.sarjat[2]);

// function lisaaJoukkue(data, joukkue, sarja) {
//     if (!joukkue || !sarja || !data) { 
//         return;
//     }
//     for (let s of data.sarjat) {    
//         if (Object.is(s, sarja)) {  
//             joukkue.sarja = sarja;  
//             data.joukkueet.push(joukkue);  
//             return;
//         }
//     }
// }

console.log(data);
