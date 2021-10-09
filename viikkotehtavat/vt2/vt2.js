"use strict";
//@ts-check 
// data-muuttuja on lähes sama kuin viikkotehtävässä 1.
//


// Kopio joukkueesta jotta voin käyttää sortia
function luoJoukkueet() { 
    let joukkueet = JSON.parse(JSON.stringify(data.joukkueet));
    joukkueet = joukkueet.map((j) => {
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
    //lisätään kaikki joukkueet oikeassa järjestyksessä listaan, myös sarja ja pisteet
    let lista = document.querySelector('#tupa > table');
    const th = document.createElement('th');
    th.textContent = "Pisteet";
    // tyhjennetään listasta jo mahdollisesti tulostetut joukkueet
    while (lista.children[2]) {      // jätetään kaksi ensimmäistä child elementiä jotka olivat valmiina alunperin
        lista.removeChild(lista.lastChild);
    }
    lista.querySelector('tr').appendChild(th);
    for (const i of joukkueet) {
        let tr = getTr(sarjat[i.sarja].nimi, i);
        lista.appendChild(tr);
    }
    return joukkueet;
}


// tekee yhden rivin joukkuelistaan, muotoa:
// <tr> <td>sarja</td> <td> <a href="#joukkue">joukkueenNimi</a> <br />Etunimi1 Sukunimi1, Etunimi2 Sukunimi2,...</td> <td>138</td> </tr>
function getTr(sarja, joukkue) {
    const tr = document.createElement('tr');
    const s = document.createElement('td');
    s.textContent = sarja;
    
    const j = document.createElement('td');
    const a = document.createElement('a');
    a.href = '../pohja.xhtml';
    a.textContent = joukkue.nimi;
    const br = document.createElement('br');
    const jasenet = joukkue.jasenet.join(', ');
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


// <fieldset>
//     <legend>Uusi joukkue</legend>
//     <p><label>Nimi <input type="text" value="" /></label></p>
//     <p><button name="joukkue">Lisää joukkue</button></p>
//     <p><button name="muokkaa">Tallenna muutokset</button></p>
// </fieldset>
function lisaaJoukkuelomake() {
    const lomake = document.getElementById('joukkuelomake');
    const nimiInput = lomake.querySelector('input');

    const field = document.createElement('fieldset');
    field.setAttribute('id', 'jasenField');
    const otsikko = document.createElement('legend');
    otsikko.textContent = "Jäsenet";
    field.appendChild(otsikko);
    nimiInput.parentNode.parentNode.after(field);

    for (let i = 1; i < 3; i++) {
        const p = document.createElement('p');
        const l = document.createElement('label');
        l.textContent = "Jäsen " + i;
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = '';
        l.appendChild(inp);
        p.appendChild(l);
        field.appendChild(p);
    }
    let inputs = field.getElementsByTagName('input');
    inputs[0].addEventListener("input", inputHandler);
    inputs[1].addEventListener("input", inputHandler);
    const buttonit = lomake.querySelectorAll('button');
    buttonit[0].disabled = true;
    buttonit[0].hidden = false;
    buttonit[1].hidden = true;
    lomake.addEventListener('submit', addJoukkue);

    // if (muokattavaJoukkue === 'undefined') {
    //     console.log('muokkausButton');
    // }
}


function addJoukkue(e) {
    e.preventDefault();
    const lomake = document.getElementById('joukkuelomake');
    const inputs = lomake.querySelectorAll('input');
    const jasenet = [];
    for (let i = 1; i < inputs.length; i++) {
        if (inputs[i].value.trim().length > 0) {
            jasenet.push(inputs[i].value.trim());
        }       
    }
    const iideet= [];
    for (const joukkue of joukkueet) {
        iideet.push(joukkue.id);
    }
    let maxId = Math.max(...iideet);
    let newId = maxId + 1;
    //lisätään joukkue sekä omaan listaan, jossa on käytössä pisteet, että dataan ilman pisteitä
    const newJoukkue = {
        nimi: inputs[0].value.trim(),
        jasenet: jasenet,
        rastit: [],
        leimaustapa: [0],
        sarja: 123456,
        id: newId,
    };
    const newJoukkue2 = {
        nimi: inputs[0].value.trim(),
        jasenet: jasenet,
        rastit: [],
        pisteet: 0,
        leimaustapa: [0],
        sarja: 123456,
        id: newId,
    };

    data.joukkueet.push(newJoukkue);
    joukkueet.push(newJoukkue2);
    jarjestaJoukkueet();
    lomake.reset();
}

// Lisätään uusi tyhjä input aina kun edellisissä on tekstiä, poistetaan ylimääräiset tyhjät inputit.
// Tässä on kopioitu ja muokattu kurssin sivuilta löytyvää mallia:
// https://appro.mit.jyu.fi/tiea2120/luennot/forms/ ensimmäinen esimerkki, Dynaaminen lomake
function inputHandler(e) {
    const field = document.getElementById('jasenField');
    let inputs = field.getElementsByTagName('input');
    if (inputs[0].value.trim() != '') {
        let viimeinen_tyhja = -1; // viimeisen tyhjän kentän paikka listassa
        for(let i=inputs.length-1 ; i>0; i--) { // inputit näkyy ulommasta funktiosta
            let input = inputs[i];

            // jos on jo löydetty tyhjä kenttä ja löydetään uusi niin poistetaan viimeinen tyhjä kenttä
            // kenttä on aina label-elementin sisällä eli oikeasti poistetaan label ja samalla sen sisältö
            if ( viimeinen_tyhja > -1 && input.value.trim() == "") { // ei kelpuuteta pelkkiä välilyöntejä
                let poistettava = inputs[viimeinen_tyhja].parentNode.parentNode; // parentNode on label, joka sisältää inputin
                field.removeChild( poistettava );
                viimeinen_tyhja = i;
            }
            // ei ole vielä löydetty yhtään tyhjää joten otetaan ensimmäinen tyhjä talteen
            if ( viimeinen_tyhja == -1 && input.value.trim() == "") {
                    viimeinen_tyhja = i;
            }
        }

        // ei ollut tyhjiä kenttiä joten lisätään yksi
        if ( viimeinen_tyhja == -1) {
            let p = document.createElement('p');
            let label = document.createElement("label");
            label.textContent = "Jäsen";
            let input = document.createElement("input");
            input.setAttribute("type", "text");
            input.addEventListener("input", inputHandler);
            field.appendChild(p).appendChild(label).appendChild(input);
        }
        // jos halutaan kenttiin numerointi
        for(let i=0; i<inputs.length; i++) { // inputit näkyy ulommasta funktiosta
                let label = inputs[i].parentNode;
                label.firstChild.nodeValue = "Jäsen " + (i+1); // päivitetään labelin ekan lapsen eli tekstin sisältö
        }
    }
    const buttonit = document.getElementById('joukkuelomake').querySelectorAll('button');
    const jNimi = document.getElementById('joukkuelomake').querySelector('input');

    if (inputs.length>2 && jNimi.value.trim().length > 0) { 
    buttonit[0].disabled = false;
    }
    
}


/* Tehdään rastin lisäämislomake annettua muotoa:
<form action="foobar.ei.toimi.example" method="post">
   <fieldset><legend>Rastin tiedot</legend>
        <label><span>Lat</span> <input type="text" value="" /></label>
        <label><span>Lon</span> <input type="text" value="" /></label>
        <label><span>Koodi</span> <input type="text" value="" /></label>
        <button id="rasti">Lisää rasti</button>
   </fieldset>
</form> */
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


function addRasti(e) {
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
    const r = {
        id: newId,
        koodi,
        lat,
        lon,
    };
    rastit[newId] = r;
    data.rastit.push(r);
    form.reset();
    tulostaRastit();
}


//lisätään annettuun fieldiin kenttä jossa on annettu labelin teksti.
// Tällä on siis tehty Lat, Lon ja Koodi - kentät rastin lisäyslomakkeessa
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


    // Tulostetaan konsoliin rastit koodien mukaan aakkosjärjestyksessä muodossa
    //     Rasti          Lat          Lon
    // 31             62.120120    25.123456
    // 32             62.123456    25.123456
    // 3A             62.987654    25.012345
    // ...
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

}

// let muokattavaJoukkue = 'undefined';
let rastit = luoRastit();
let joukkueet = luoJoukkueet();
let sarjat = luoSarjat();
jarjestaJoukkueet();

lisaaRastilomake();
let form = document.querySelector('form');


// tehdään rastilomakkeen toiminnot 
form.addEventListener('submit', addRasti);
lisaaJoukkuelomake();

console.log(data);
