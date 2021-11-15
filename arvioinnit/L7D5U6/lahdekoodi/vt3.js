"use strict";  // pidä tämä ensimmäisenä rivinä 
//@ts-check 

console.log(data);
let muokattavaJoukkue;
let sarjatObjekti = {};
let rastitObjekti = {};
for (let i = 0; i < data.sarjat.length; i++) {
    sarjatObjekti[data.sarjat[i].id] = data.sarjat[i].nimi;
}
for (let i = 0; i < data.rastit.length; i++) {
    rastitObjekti[data.rastit[i].id] = data.rastit[i].koodi;
}

window.addEventListener("load", function(){
    // document.getElementsByClassName("checker")[0].setAttribute("class", "piilota");
    document.getElementById("joukkuelomake").reset();
    lisaaRadioButtonit();
    lisaaCheckboxit();
    document.forms[0].checkboxValinta.onkoAinakinYksiTaytetty = false;
    // kasitteleLomakkeenTiedot(document.getElementById("joukkuelomake"), document.getElementsByTagName("button").namedItem("joukkue"));
    hallitseJasentenMaara(document.getElementById("jasentenFieldset"));
    // let inputit = document.getElementById("jasentenFieldset").getElementsByTagName("input");
    // for (const input of inputit) {
    //     input.addEventListener("input", kasitteleJasentenMaara);
    // }
    document.getElementsByTagName("button").namedItem("joukkue").addEventListener("click", kasitteleClick);
    document.getElementsByTagName("button").namedItem("leimaustapaButton").addEventListener("click", kasitteleLisaaLeimaustapaClick);
    listaaJoukkueet(data.joukkueet.slice());
    // document.getElementById("joukkuelomake").addEventListener("submit", kasitteleSubmit);
});


/**
 * Lisää sarjan valitsemiseen tarvittavat radio buttonit. Järjestää
 * sarjat nimen mukaan ja lisää radiobuttonit siten järjestyksessä.
 */
function lisaaRadioButtonit() {
    let sarjat = data.sarjat.slice();
    sarjat.sort(sarjat_compare);
    let valinnatDiv = document.getElementById("radioButtonit");
    for (const sarja of sarjat) {
        let valintaLabel = document.createElement("label");
        let sarjanNimi = document.createElement("span");
        sarjanNimi.textContent = sarja.nimi;
        valintaLabel.appendChild(sarjanNimi);
        let radioButton = document.createElement("input");
        radioButton.setAttribute("type", "radio");
        radioButton.setAttribute("name", "radiobutton");
        radioButton.setAttribute("value", sarja.id);
        if (valinnatDiv.childElementCount == 0) {
             radioButton.setAttribute("checked", true);
        }
        valintaLabel.appendChild(radioButton);
        valinnatDiv.appendChild(valintaLabel); 
    }

}

/**
 * Järjestää leimaustavat aakkosjärjestykseen, ja sitten lisää ne joukkuelomakkeeseen checkboxeina.
 */
function lisaaCheckboxit() {
    let leimaustavat = data.leimaustapa.slice();
    leimaustavat.sort((a,b)=>{
        a = a.toUpperCase();
        b = b.toUpperCase();
        if (a > b) {return 1;}
        if (a < b) {return -1;}
        return 0;
    });
    let valinnatDiv = document.getElementById("checkboxit");
    for (const leimaustapa of leimaustavat) {
        let valintaLabel = document.createElement("label");
        let leimaustavanNimi = document.createElement("span");
        leimaustavanNimi.textContent = leimaustapa;
        valintaLabel.appendChild(leimaustavanNimi);
        let checkBoxButton = document.createElement("input");
        checkBoxButton.setAttribute("type", "checkbox");
        checkBoxButton.setAttribute("name", "checkboxValinta");
        checkBoxButton.setAttribute("value", data.leimaustapa.indexOf(leimaustapa));
        valintaLabel.appendChild(checkBoxButton);
        valinnatDiv.appendChild(valintaLabel); 
    }

}

/**
 * Pitää yllä oikean määrän inputteja jäsenten lisäys lomakkeessaa.
 * @param {*} fieldset sen lomakkeen fieldset, jonka inputteja halutaan käsitellä
 */
 function hallitseJasentenMaara(fieldset) {  
    let inputit = fieldset.getElementsByTagName("input");
    // fieldset.parentNode.addEventListener("input", kasitteleLomakkeenTiedot(document.getElementById("joukkuelomake")));
    fieldset.addEventListener("input", function(event){
    //Seuraava funktio, koska jshint valitti loopin sisällä käytetystä funktiosta
    let paivitaSpanit = function(poistetunIndeksi) {
        for (let index = poistetunIndeksi-1; index < inputit.length; index++) {
            const span = inputit[index].previousSibling;
            span.textContent = "Jasen " + (index + 1);
        }
    };
        for (let i = inputit.length -1; i >= 0 ; i--) {
            if (i>1 && inputit[i-1].value == "") {
                let poistettavaLabel = event.target.parentNode;
                poistettavaLabel.remove();
                paivitaSpanit(i);
            }
            if (inputit[inputit.length - 1].value == "") {
                continue;
            }
            if(inputit[inputit.length - 1].value != ""){
                let label = document.createElement("label");
                let teksti1 = document.createTextNode("Jasen " + (i + 2));
                let span = label.appendChild(document.createElement("span"));
                span.appendChild(teksti1);
                
                
                label.append(span, document.createElement("input"));
                fieldset.appendChild(label);
            }
        }

    });
}

/**
 * Täytetään kenttien tiedot, kun ollaan klikattu jotakin joukkuetta.
 * @param {*} joukkue sen joukkueen tiedot, jotka lisätään kenttiin
 */
 function taytaKentat(joukkue){
    // Nimen kenttä
    document.getElementsByName("nimi")[0].value = joukkue.nimi.trim();
    // Checkboxit, ne jotka checked
    for (const leimaustapa of joukkue.leimaustapa) {
        for (const checkbox of document.getElementsByName("checkboxValinta")) {
            if (leimaustapa == checkbox.value) {
                checkbox.checked = true;
            }
        }
    }
    // Radiobuttonit, mikä on checked
    for (const radioButton of document.getElementsByName("radiobutton")) {
        if (joukkue.sarja == radioButton.value) {
            radioButton.checked = true;
            break;
        }
    }
    taytaJasentenKentat(joukkue);
}

function taytaJasentenKentat(joukkue) {
    let inputit = document.getElementById("jasentenFieldset").getElementsByTagName("input");
    let taytettavatKentat = joukkue.jasenet.length;
    // let muokkausPainike = document.getElementsByName("muokkaa")[0];
    // muokkausPainike.removeAttribute("class", "piilota");
    // let lisaysPainike = document.getElementsByName("joukkue")[0];
    // lisaysPainike.setAttribute("class", "piilota");
    if (inputit.length > taytettavatKentat) {
        for (let i = inputit.length - 1 ; i >= taytettavatKentat; i--) {
            let  input = inputit[i];
            input.parentNode.remove();
        }
    }
    for (let i = 0; i < taytettavatKentat; i++) {
        let input = inputit[i];
        input.value = joukkue.jasenet[i];
        input.dispatchEvent(new Event('input', { bubbles: true })); // https://stackoverflow.com/questions/35659430/how-do-i-programmatically-trigger-an-input-event-without-jquery
    }
}

/**
 * Tallentaa joukkueen tietoiohin tehdyt muutokset
 * @param {Object} lomake 
 * @param {Array} inputit 
 */
 function tallennaMuokkaukset(lomake) {


    muokattavaJoukkue.sarja = parseInt(lomake.radiobutton.value);
    muokattavaJoukkue.leimaustapa = [];
    for (const checkBox of lomake.checkboxValinta) {
        if (checkBox.checked) {
            muokattavaJoukkue.leimaustapa.push(parseInt(checkBox.value));
        }
    }
    muokattavaJoukkue.nimi = lomake.nimi.value;
    let jasenInputit = document.getElementById("jasentenFieldset").getElementsByTagName("input");
    muokattavaJoukkue.jasenet = [];
    for (const input of jasenInputit) {
        if (input.value != "") {
            muokattavaJoukkue.jasenet.push(input.value);
        }
    }
    // data.joukkueet.push(uusiJoukkue);
    // paivitaTaulukko(); // Korvataan lisaaTaulukolla
    listaaJoukkueet(data.joukkueet.slice());

        
}

function kasitteleClick(e) {
    let lomake = document.forms[0];

    if (muokattavaJoukkue != undefined) {
       if(muokattavaJoukkue.onkoMuokattava){
        e.preventDefault();
        // if (muokattavaJoukkue.onkoNimeaMuokattu) {
        //     tarkistaNimiInput();
        // }
        validoi(lomake);
        if (lomake.checkValidity()) {
            tallennaMuokkaukset(lomake);    
            lomake.reset();
            alustaJasentenKentat();
            muokattavaJoukkue.onkoMuokattava = false; 
            listaaJoukkueet(data.joukkueet);
        }
        
        lomake.reportValidity();
    }

    
    }else{
        validoi(lomake);
        let onkoValidi = lomake.checkValidity();
        if (onkoValidi) {
            e.preventDefault();
            tallennaTiedot(lomake);
            console.log("Lomake on validi");
            lomake.reset();
            alustaJasentenKentat();
            listaaJoukkueet(data.joukkueet);

        }else{
            lomake.reportValidity();
             }
    }

}

function validoi(lomake) {
    let inputit = document.getElementById("jasentenFieldset").getElementsByTagName("input");
    let taytettyjenMaara = 0;
    for (const input of inputit) {
        if (input.value!= "") {
            taytettyjenMaara++;
            continue;
        }
        if (taytettyjenMaara >= 2) {
            for (const input of inputit) {
                input.setCustomValidity("");
            }
            break;
        }
        input.setCustomValidity("Joukkueella on oltava vähintään kaksi jäsentä.");
        
    }
    
    for (const checkBox of lomake.checkboxValinta) {
        if (checkBox.checked) {
            lomake.checkboxValinta[0].setCustomValidity("");
            break;
        }
        lomake.checkboxValinta[0].setCustomValidity("Valitse ainakin 1 leimaustapa.");
    }

    // if (onkoCheckBoxValidi(lomake)) {
        
    // }



    tarkistaNimiInput();


    lomake.reportValidity();
}


function tarkistaNimiInput() {
    let nimiInput = document.getElementsByName("nimi")[0];
    // nimiInput.value = nimiInput.value.trim(); --> Tämä ei toiminut, sijoituksen jälkeen kaikki validityt menivät falseiksi
    nimiInput.setCustomValidity("");
    if (nimiInput.validity.valueMissing ) {
        nimiInput.setCustomValidity("Anna joukkueen nimi, vähintään 2 merkkiä.");
    }else if(nimiInput.validity.patternMismatch){
        nimiInput.setCustomValidity("Nimen oltava vähintään 2 merkkiä pitkä. Ei saa sisältää ylimääräisiä välilyöntejä");
    }else if (onkoJoukkueenNimiKaytossa(nimiInput.value)) {
        nimiInput.setCustomValidity("Anna toinen nimi, tämä nimi on jo käytössä.");
    }
}

// function onkoCheckBoxValidi(lomake) {
    //     if (lomake.checkboxValinta.onkoAinakinYksiTaytetty == false) {
        //         lomake.checkboxValinta[0].setCustomValidity("Valitse vähintään yksi leimaustapa.");
//     }

//     for (const checkBox of lomake.checkboxValinta) {
//         if (checkBox.checked) {
//             if(lomake.checkboxValinta.onkoAinakinYksiTaytetty == false){
//                 lomake.checkboxValinta.onkoAinakinYksiTaytetty = true;
//             }
//             uusiJoukkue.leimaustapa.push(parseInt(checkBox.value));
//         }
//     }
// }

/**
 * Tallentaa lomakkeeseen täytetyt tiedot uutena joukkueena. Tämä funktio ei tarkista enää mitään.
 * @param {*} lomake lomake, jolta tiedot luetaan
 */
function tallennaTiedot(lomake) {
    let avaimet = Object.keys(data.joukkueet[0]);
    let uusiJoukkue = {};

    for (const avain of avaimet) {
        uusiJoukkue[avain] = "";
    }

    uusiJoukkue.id = luoUniikkiId();
    uusiJoukkue.nimi = lomake.nimi.value;
    uusiJoukkue.sarja = parseInt(lomake.radiobutton.value);
    uusiJoukkue.jasenet = [];
    uusiJoukkue.leimaustapa = [];
    for (const checkBox of lomake.checkboxValinta) {
        if (checkBox.checked) {
            uusiJoukkue.leimaustapa.push(parseInt(checkBox.value));
        }
    }
    

    uusiJoukkue.rastit = [];

    let jasenInputit = document.getElementById("jasentenFieldset").getElementsByTagName("input");
    for (const input of jasenInputit) {
        if (input.value != "") {
            uusiJoukkue.jasenet.push(input.value);
        }
    }
    data.joukkueet.push(uusiJoukkue);
}

function luoUniikkiId() {
    let joukkueet = data.joukkueet.slice();
    joukkueet.sort(joukkueId_compare);
    return joukkueet[joukkueet.length-1].id + 1;
}

/**
 * Tarkistaa, onko uuden joukkueen nimi uniikki, eli onko se jo käytössä.
 * Käy läpi kaikkien joukkueiden nimet.
 * @param {*} uusiNimi 
 * @returns true, jos nimi on löytyy tietokannasta ja false jos ei. 
 */
function onkoJoukkueenNimiKaytossa(uusiNimi) {
    let joukkueet = data.joukkueet;
    for (const joukkue of joukkueet) {
        if (joukkue.nimi.trim().toUpperCase() == uusiNimi.trim().toUpperCase()) {
            return true;
        }
    }
    return false;

}

/**
 * Tarkistaa, onko uuden leimaustavan nimi jo olemassa vai ei.
 * @param {String} uusiNimi uuden leimaustavan nimi
 * @returns true jos nimi löytyy tietokannasta ja false jos ei
 */
function onkoLeimaustavanNimiKaytossa(uusiNimi) {
    let leimaustavat = data.leimaustapa;
    for (const leimaustapa of leimaustavat) {
        if (leimaustapa.trim().toUpperCase() == uusiNimi.trim().toUpperCase()) {
            return true;
        }
    }
    return false;
}


function alustaJasentenKentat() {

    let jasenetFieldset = document.getElementById("jasentenFieldset");
    let labelit = jasenetFieldset.getElementsByTagName("label");
    for (let i = labelit.length ; i > 2; i--) {
        jasenetFieldset.removeChild(jasenetFieldset.lastChild);
    }
}


function listaaJoukkueet(joukkueet) {
    document.getElementById("joukkuelista").replaceChildren(); // Tyhjentää divin sisällön, eli poistaa edellisen listan
    let lista = document.createElement("ul");
    joukkueet.sort(joukkueetNimiSarja_compare);
    function linkkiListener(joukkue){
        taytaKentat(joukkue);
        muokattavaJoukkue = joukkue;
        muokattavaJoukkue.onkoMuokattava = true;
        let nimiInput = document.getElementsByName("nimi")[0];
        nimiInput.addEventListener("input", tarkistaNimiInput);
    }
    for (const joukkue of joukkueet) {
        let joukkueLI = document.createElement("li");
        let sarjaStrong = document.createElement("strong");
        sarjaStrong.textContent = sarjatObjekti[joukkue.sarja];
        
        let joukkueenLinkki = document.createElement("a");
        joukkueenLinkki.joukkue = joukkue;
        joukkueenLinkki.setAttribute("href", "#joukkuelomake");
        joukkueenLinkki.appendChild(document.createTextNode(joukkue.nimi+ " "));
        joukkueenLinkki.addEventListener("click", linkkiListener.bind(this, joukkue));
        
        joukkueLI.appendChild(joukkueenLinkki);
        joukkueLI.appendChild(sarjaStrong);
        let sisempiUL = document.createElement("ul");
        let jasenet = joukkue.jasenet.slice();
        // Järjestää jäsenet -taulukon akkosjärjestykseen
        jasenet.sort((a,b) => {
            if (a > b) {return 1;}
            if (a < b) {return -1;}
            return 0;
        });
        for (const jasen of jasenet) {
            let li = document.createElement("li");
            li.textContent = jasen;
            sisempiUL.appendChild(li);
        }
        joukkueLI.appendChild(sisempiUL);
        lista.appendChild(joukkueLI);
    }
    document.getElementById("joukkuelista").appendChild(lista);
}


function joukkueId_compare(a,b) {
    if (a.id > b.id) {return 1;}
    if (a.id < b.id) {return -1;}
    return 0;
}

function joukkueetNimiSarja_compare(a,b) {
    if (sarjatObjekti[a.sarja] > sarjatObjekti[b.sarja]) {return 1;}
    if (sarjatObjekti[a.sarja] < sarjatObjekti[b.sarja]) {return -1;}

    if (a.nimi > b.nimi) {return 1;}
    if (a.nimi < b.nimi) {return -1;}
    return 0;
}


function sarjat_compare(a,b){
    let sarjanNimi1 = a.nimi;
    let sarjanNimi2 = b.nimi;
    
    if( sarjanNimi1 < sarjanNimi2) {return -1;}
    if( sarjanNimi1 > sarjanNimi2) {return 1;}
    return 0;    
}


/**
 * Paivittää lomakkeen leimaustapavalikoiman
 */
function paivitaLeimaustavat() {
    let valinnatDiv = document.getElementById("checkboxit");
    valinnatDiv.replaceChildren();
    lisaaCheckboxit();
}


/**
 * Tallentaa uuden leimaustavan tietokantaan.
 * @param {String} leimaustavanNimi uuden leimaustavan nimi 
 */
function tallennaLeimaustapa(leimaustavanNimi) {
    data.leimaustapa.push(leimaustavanNimi);    
}

function kasitteleLisaaLeimaustapaClick(event) {
    let lomake = event.target.parentNode.parentNode;
    let input = document.getElementById("leimaustavanNimi");
    if (!input.validity.tooShort) {
        input.setCustomValidity("");
        event.preventDefault();
        if (onkoLeimaustavanNimiKaytossa(input.value)) {
            input.setCustomValidity("Tämä leimaustapa on jo olemassa");
        }else{
            tallennaLeimaustapa(input.value);
            paivitaLeimaustavat();
        }
    }else{input.setCustomValidity("Leimaustavan oltava vähintään 2 merkkiä pitkä.");}
    
    lomake.reportValidity();
}