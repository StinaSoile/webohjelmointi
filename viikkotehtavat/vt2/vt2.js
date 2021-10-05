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


function tulostaRastit() {

    let arrRastit = Object.keys(rastit).map((x) => rastit[x]);
    arrRastit.sort(
        (a, b) => {
            if(a.koodi < b.koodi) {
                return -1;
            }
            if(a.koodi > b.koodi) {
                return 1;
            }
            return 0;
        }
    );

    let all = "    Rasti          Lat          Lon\n";
    for (const rasti of arrRastit) {
        all += rasti.koodi.padEnd(15) + rasti.lat.padEnd(13) + rasti.lon.padEnd(13) + "\n";
    }
    console.log(all);
    // Rastit koodien mukaan aakkosjärjestyksessä muodossa
    //     Rasti          Lat          Lon
    // 31             62.120120    25.123456
    // 32             62.123456    25.123456
    // 3A             62.987654    25.012345
    // ...
}

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
    const inputs = form.querySelectorAll('input');
    let lat = inputs[0].value;
    let lon = inputs[1].value;
    let koodi = inputs[2].value;

    if (koodi.length === 0 || isNaN(lat) || isNaN(lon)) {
        return;
    }

    let maxId = Math.max(...Object.keys(rastit));
    let newId = maxId+1;
    lat = lat.toString();
    lon = lon.toString();

    rastit[newId] = {
        id: newId,
        koodi,
        lat,
        lon,
    };
    form.reset();

    tulostaRastit();
});

console.log(data);
