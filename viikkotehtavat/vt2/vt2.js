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
    const tr = lista.querySelector('tr');
    if (tr.childElementCount < 3) {
        tr.appendChild(th);        
    }
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
    a.href = '#joukkuelomake';
    a.textContent = joukkue.nimi;
    a.addEventListener('click', function () {
        muokattavaJoukkue = JSON.parse(JSON.stringify(joukkue));
        lisaaJoukkuelomake();
    });
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

// luo joukkuelomakkeen, muokattavaJoukkue -muuttujan arvosta riippuen joko 
// tyhjän uusi joukkue -lomakkeen, tai sitten muokattavaJoukkue-muuttujan tiedoilla esitäytetyn muokkauslomakkeen
// <fieldset>
//     <legend>Uusi joukkue</legend>
//     <p><label>Nimi <input type="text" value="" /></label></p>
//     <p><button name="joukkue">Lisää joukkue</button></p>
//     <p><button name="muokkaa">Tallenna muutokset</button></p>
// </fieldset>
function lisaaJoukkuelomake() {
    const lomake = document.getElementById('joukkuelomake');
    const nimiInput = lomake.querySelector('input');
    nimiInput.addEventListener('input', inputHandler);
    nimiInput.value ='';
    // poistetaan mahdollinen nimiInputin jälkeen oleva fieldset:
    let next = nimiInput.parentNode.parentNode.nextElementSibling; 
    if (next.nodeName === 'fieldset') {
        next.remove();
    }
    const field = document.createElement('fieldset');
    field.setAttribute('id', 'jasenField');
    const otsikko = document.createElement('legend');
    otsikko.textContent = "Jäsenet";
    field.appendChild(otsikko);
    nimiInput.parentNode.parentNode.after(field);
    const buttonit = lomake.querySelectorAll('button');
    let ylaotsikko = lomake.querySelector('legend');
    if (muokattavaJoukkue === 'undefined') {
        ylaotsikko.textContent = 'Uusi joukkue';
        addInput(field);
        addInput(field);
        buttonit[0].disabled = true;
        buttonit[0].hidden = false;
        buttonit[1].hidden = true;
        lomake.addEventListener('submit', addJoukkue);
    }
    
    if (muokattavaJoukkue != 'undefined') {
        buttonit[0].hidden = true;
        buttonit[1].hidden = false;
        ylaotsikko.textContent = 'Tallenna muutokset';
        //joukkueen tiedot lomakkeeseen:
        nimiInput.value = muokattavaJoukkue.nimi;
        for (const jasen of muokattavaJoukkue.jasenet) {
            addInput(field, jasen);
        }
        addInput(field);
        lomake.addEventListener('submit', changeJoukkue);
    }
}


// joukkueen tietoja muutettaessa tämä on eventListeneri kun painaa muokkaa joukkuetta
function changeJoukkue(e) {
    e.preventDefault();
    if (muokattavaJoukkue === 'undefined') {
        return;
    }
    let nimi = document.getElementById('joukkuelomake').querySelector('input').value.trim();
    let jas = [];
    const inputs = document.getElementById('jasenField').querySelectorAll('input');
    for (const input of inputs) {
        let inp = input.value.trim();
        if (inp.length > 0) {
           jas.push(inp);                
       }
    }
    if (jas.length < 2 || nimi === '') {
        return;
    }
    muokattavaJoukkue.nimi = nimi;
    muokattavaJoukkue.jasenet = jas;
    // etsii joukkueen id:n avulla muokattavan joukkueen, ja
    //muokkaa joukkuetta itse tehdyssä joukkuelistassa:
    for (let joukkue of joukkueet) {      
        if (parseInt(joukkue.id) === parseInt(muokattavaJoukkue.id)) {
            joukkue.nimi = muokattavaJoukkue.nimi;
            joukkue.jasenet = muokattavaJoukkue.jasenet;
        }
    }
    // muokkaa joukkuetta datassa
    for (let joukkue of data.joukkueet) {
        if (parseInt(joukkue.id) === parseInt(muokattavaJoukkue.id)) {
            joukkue.nimi = muokattavaJoukkue.nimi;
            joukkue.jasenet = muokattavaJoukkue.jasenet;
        }
    }
    muokattavaJoukkue = 'undefined';
    jarjestaJoukkueet();
    lisaaJoukkuelomake(); //resettaa lomakkeen
}


// uutta joukkuetta lisättäessä tämä on eventlisteneri kun painaa Lisää joukkue
function addJoukkue(e) {
    e.preventDefault();
    if (muokattavaJoukkue != 'undefined') {
        return;
    }
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
    //lisätään joukkue omaan listaan jossa on käytössä pisteet, ja dataan ilman pisteitä
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
    lisaaJoukkuelomake(); //tämä myös resettaa lomakkeen, 
    //siksi kutsun tässä kun lomake.reset() ei toiminut kuten piti.
}


// luo uuden inputin, käytetään kun luodaan joukkueen jäsenten nimille kenttiä
function addInput(parent, jasen) {
    const p = document.createElement('p');
    const l = document.createElement('label');
    l.textContent = "Jäsen";
    const inp = document.createElement('input');
    inp.setAttribute("type", "text");
    inp.value = '';
    inp.addEventListener('input', inputHandler);
    l.appendChild(inp);
    p.appendChild(l);
    parent.appendChild(p);
    let inputs = parent.querySelectorAll('input');
    nimeaKentat(inputs);
    if (jasen) {
        inp.value = jasen;
    }
}


// antaa joukkuelomakkeen inputeille nimet jäsen 1, jäsen 2 jne.
function nimeaKentat(inputs) {
      // halutaan kenttiin numerointi
    const field = document.getElementById('jasenField');
    inputs = field.querySelectorAll('input');

    for(let i=0; i<inputs.length; i++) {
        let label = inputs[i].parentNode;
        label.firstChild.nodeValue = "Jäsen " + (i+1);
    }
}

// Lisätään uusi tyhjä input aina kun edellisissä on tekstiä, poistetaan ylimääräiset tyhjät inputit.
// Tässä on kopioitu ja muokattu kurssin sivuilta löytyvää mallia:
// https://appro.mit.jyu.fi/tiea2120/luennot/forms/ ensimmäinen esimerkki, Dynaaminen lomake
function inputHandler(e) {
    const form = document.getElementById('joukkuelomake');
    const field = document.getElementById('jasenField');
    let inputs = field.querySelectorAll('input');
    const buttons = form.querySelectorAll('button');
    const emptyInputs = [];

    // lisätään empty inputtiin kaikki tyhjät
    for (const input of inputs) {
        if (input.value.trim() === '') {
            emptyInputs.push(input);
        }
    }
    // jos emptyssä on enemmän kuin 1 inputti ja yhteensä inputteja on 2 tai enemmän
    // niin poistetaan emptyistä kaikki paitsi yksi
    if (emptyInputs.length > 1 && inputs.length > 2) {
        for (let i = 1; i < emptyInputs.length; i++) {
            emptyInputs[i].parentNode.parentNode.remove();
        }
    }
    // jos emptyjä ei ole, lisätään yksi.
    if (emptyInputs.length === 0) {
        addInput(field);
    }
    inputs = field.querySelectorAll('input');
    nimeaKentat(inputs);
    const jNimi = form.querySelector('input');
    if (inputs.length>2 && jNimi.value.trim().length > 0) { 
        buttons[0].disabled = false;
        buttons[1].disabled = false;
    } else {
        buttons[0].disabled = true;
        buttons[1].disabled = true;
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


// eventlistener kun luodaan uusi rasti
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



// Tässä "main"

let muokattavaJoukkue = 'undefined';
let rastit = luoRastit();
let joukkueet = luoJoukkueet();
let sarjat = luoSarjat();
jarjestaJoukkueet();

lisaaRastilomake();
let form = document.querySelector('form');

form.addEventListener('submit', addRasti);
lisaaJoukkuelomake();

console.log(data);
