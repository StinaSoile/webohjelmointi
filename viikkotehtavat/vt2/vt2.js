"use strict";
//@ts-check 
// data-muuttuja on lähes sama kuin viikkotehtävässä 1.
//


// Kopio joukkueesta jotta voin käyttää sortia
function luoJoukkueet() { 
    // let joukkueet = JSON.parse(JSON.stringify(data.joukkueet));
    let joukkueet = data.joukkueet.map((j) => {
        j.pisteet = laskePisteet(j);
        return j;
    });
    // console.log(joukkueet);
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


/**
 * //KOPIOITU VT1:stä
 * hakee annetun joukkueen merkitsevät rastit set-objektiin.
 * @param {Object} joukkue 
 * @returns Set-objekti, johon on tallennettu koodit niistä joukkueen rasteista, jotka huomioidaan
 */
 function haeRastit(joukkue) {
    let arr = [];
    let kayty = {};
    let alku = false;
    for(const r of joukkue.rastit) {    //käydään läpi kaikki joukkueen rastit
        let raksi = rastit[r.rasti];    
            if (typeof raksi === 'object') {  //varmistetaan, että rasti on objekti eikä jotain outoa
                if(raksi.koodi === "LAHTO") {     //jos rasti on lähtö,
                    arr = [];                       //nollataan aiemmin mahdollisesti kertyneet rastit
                    alku = true;                    //merkitään alku todeksi
                } else if (raksi.koodi === 'MAALI' && alku) { //jos rasti on maali ja alku on totta, eli aiemmin on ollut lähtö,
                    return arr;                                 //palautetaan arr, johon on kertynyt tähänastiset rastit
                } else {
                    for (const d of data.rastit) {
                        if (Object.is(d, raksi) && kayty[raksi.koodi] === undefined && alku === true) {  //etsitään, onko tietokannassa rastia joka vastaa joukkueen merkitsemää
                            kayty[raksi.koodi] = true;
                            arr.push(raksi.koodi);    //jos rasti vastaa tietokannan rastia, lisätään sen koodi listaan
                        }
                    }
                }

            }
    }
    return arr;
}

/**
 * KOPIOITU VT1:stä
 * Kutsuu haeRastit-funktiota, ja laskee sen palauttaman setin jokaisen jäsenen
 * ensimmäisen numeron yhteen. Jos ensimmäinen merkki ei ole numero, ei tee mitään tälle rastille.
 * @param {Object} joukkue 
 * @returns summa-kokonaisluku
 */
function laskePisteet(joukkue) {
    let arr = haeRastit(joukkue);
    let summa = 0;
    for (const r of arr) {
        if (isFinite(r[0])) {
            summa = summa + parseInt(r[0]);
        }
    }
    return summa;
}

// sorttaa joukkueet aakkosjärjestykseen (taso 1), pistejärjestykseen (taso 3) ja sitten järjestykseen sarjan mukaan
function jarjestaJoukkueet() {
    joukkueet.sort((a, b) => a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()); // TASON 1 JUTTU
    // for (let i = 0; i < joukkueet.length; i++) { // testausta varten
    //     console.log(laskePisteet(joukkueet[i]));
        
    // }

    joukkueet.sort(     // TASON 3 JUTTU
        (a, b) => {
            if(a.pisteet > b.pisteet) {
                return -1;
            }
            if(a.pisteet < b.pisteet) {
                return 1;
            }
            return 0;
        }
    );

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


//KOPIO VT1:STÄ, MALLIKSI  
// function tulostaPisteet (data){
//     let arr  = [];
//     for ( const joukkue of data.joukkueet) {
//         arr.push({nimi: joukkue.nimi, pisteet: laskePisteet(joukkue)});
//     }
//     arr.sort(
//         (a, b) => {    //taulukko nimien mukaan aakkosjärjestykseen
//             if (a.nimi.trim().toLowerCase() < b.nimi.trim().toLowerCase()) {
//                 return -1;
//             }
//             if (a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()) {
//                 return 1;
//             }
//             return 0;
//         } 
//     );
//     arr.sort((a, b) => b.pisteet-a.pisteet);     //taulukko pisteiden mukaan järjestykseen
//     for (let joukkue of arr) {
//         log(joukkue.nimi + " (" + joukkue.pisteet + " p)");
//     }
// }

// tekee yhden rivin listaan, muotoa <tr><td>sNimi</td><td>jNimi</td></tr>
function getTr(sarja, joukkue) {
    const tr = document.createElement('tr');
    const s = document.createElement('td');
    s.textContent = sarja;
    
    const j = document.createElement('td');
    const a = document.createElement('a');
    a.href = '../pohja.xhtml';
    a.textContent = joukkue.nimi;
    const br = document.createElement('br');
    const jasenet = joukkue.jasenet.join(', ')
    const txt = document.createTextNode(jasenet);
    j.appendChild(a);
    j.appendChild(br);
    j.appendChild(txt);
    
    const p = document.createElement('td');
    p.textContent = joukkue.pisteet;
    tr.appendChild(s);
    tr.appendChild(j);
    tr.appendChild(p);
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

let rastit = luoRastit();
let joukkueet = luoJoukkueet();
let sarjat = luoSarjat();
jarjestaJoukkueet();

//lisätään kaikki joukkueet oikeassa järjestyksessä listaan, myös sarja ja pisteet
let lista = document.querySelector('#tupa > table');
const th = document.createElement('th');
th.textContent = "Pisteet";
lista.querySelector('tr').appendChild(th);
for (const i of joukkueet) {
    let tr = getTr(sarjat[i.sarja].nimi, i);
    lista.appendChild(tr);
}

lisaaRastilomake();
let form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input');
    let lat = inputs[0].value.trim();
    let lon = inputs[1].value.trim();
    let koodi = inputs[2].value.trim();

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
