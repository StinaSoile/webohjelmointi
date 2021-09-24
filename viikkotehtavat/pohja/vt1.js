"use strict";
//@ts-check 
// Joukkueen sarja on viite data.sarjat-taulukossa lueteltuihin sarjoihin
// Joukkueen leimaamat rastit ovat viitteitä data.rastit-taulukossa lueteltuihin rasteihin
// voit vapaasti luoda data-rakenteen pohjalta omia aputietorakenteita

// Kirjoita tästä eteenpäin oma ohjelmakoodisi

// Seuraavilla voit tutkia selaimen konsolissa käytössäsi olevaa tietorakennetta. 

//----------------------------------TASO 1-------------------------------

/* yleiskäyttöinen funktio, joka tulostaa log-komennolla
joukkueiden nimet ja sarjat joukkueen nimen mukaan aakkosjärjestyksessä
    -kunkin joukkueen nimi omalle rivilleen
    -sarjan nimi joukkueen nimen jälkeen
    -älä tulosta mtn ylimääräistä
    -isot ja pienet kirjaimet ei merkityksellisiä järjestämisessä
    -nimien ylimääräisiä välilyöntejä ei huomioida eikä tulosteta
*/
function tulostaJoukkueet(data) {

    const tiedot = [];
    for(let joukkue of data.joukkueet) {
        tiedot.push(joukkue.nimi.trim() + " " + joukkue.sarja.nimi); //tallennetaan joukkueiden nimet ja sarjat uuteen taulukkoon
    }
    const jarj = tiedot.sort((a, b) => {    //uusi taulukko nimien mukaan aakkosjärjestykseen
        if (a.toLowerCase() < b.toLowerCase()) {
            return -1;
        }
        if (a.toLowerCase() > b.toLowerCase()) {
            return 1;
        }
        return 0;
    }
); 
    for(let rivi of jarj) {
        log(rivi); //tulostetaan taulukon sisältö rivi kerrallaan
    }
}

/* lisää data-tietorakenteeseen funktiolle tuodun joukkueen haluttuun sarjaan.
Sarjan oltava data.sarjat-taulukosta löytyvä objekti.
Jos jokin parametreista puuttuu, funktio ei tee mitään. */
function lisaaJoukkue(data, joukkue, sarja) {
    if (!joukkue || !sarja || !data) { //jos jokin parametri puuttuu, funktio ei tee mitään
        return;
    }
    for (let s of data.sarjat) {    //käydään sarjat läpi yksitellen,
        if (Object.is(s, sarja)) {  //katsotaan, onko parametrina tullut sarja käsiteltävä sarja
            joukkue.sarja = sarja;  //jos on, laitetaan kys sarja joukkueen sarjaksi
            data.joukkueet.push(joukkue);   //ja lisätään joukkue dataan
            return;
        }
    }
}

function muutaSarjanNimi(data, vanhanimi, uusinimi) {
    for (let s of data.sarjat) {    //käydään läpi sarjat.
        if (s.nimi === vanhanimi) { //jos sarjoista löytyy sama nimi kuin parametrina tuotu,
            s.nimi = uusinimi;      //nimetään se uudelleen
            return;
        }
    }
}

/*Tulostaa kaikkien kok.luvulla alkavien rastien koodit aakkosjärjestyksessä. 
samalle riville
puolipisteellä erotettuna */
function tulostaRastit(data) {
    let rastitLista = [];
    for(let i = 0 ; i<data.rastit.length; i++) {
        rastitLista.push(data.rastit[i].koodi);     //lisätään uuteen listaan kaikki rastien nimet, jottai muutella alkuperäistä
    }
    rastitLista.sort(
        (a, b) => {    //uusi taulukko nimien mukaan aakkosjärjestykseen
            if (a.toLowerCase() < b.toLowerCase()) {
                return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
                return 1;
            }
            return 0;
        } //lista aakkosjärjestykseen
    );
    let str = "";
    for (let i=0; i<rastitLista.length; i++) {
        if(isFinite(rastitLista[i][0])) {   //jos nimen eka kirjain on numero (kokonaisluku on sama asia kun kyse on vain yhdestä merkistä)
            str = str + rastitLista[i] + ";";   //niin lisätään nimi merkkijonon str perään puolipisteen kera
        }
    }
    log(str);   //tulostetaan merkkijono str
}

console.dir(data); 
console.log(data); //alkuperäisessä tiedostossa ollut datan tulostus konsolille

const joukkue = {   //joukkueen luonti
    nimi: 'Mallijoukkue',
    jasenet: ['Lammi Tohtonen', 'Matti Meikäläinen'],
    leimaustapa: [0, 2],
    rastit: [],
    sarja: undefined,
    id: 99999,
};

//----------------------------------TASO 3-------------------------------

/*poistaa datasta joukkueen annetun nimen perusteella*/
function poistaJoukkue(data, nimi) { //haluttu data ja joukkueen nimi, string
    for(let i = 0; i<data.joukkueet.length; i++) { //käydään läpi kaikki joukkueet
        if (data.joukkueet[i].nimi === nimi) {  //jos löytyy joukkue jolla etsitty nimi,
            data.joukkueet.splice(i, 1);    //poistetaan joukkue. Ei returnia, koska ajattelin että jos olisi useampia samannimisiä, tämä poistaisi kaikki.
        }
    }
}

//---------------------------------FUNKTIOKUTSUT---------------------------

lisaaJoukkue(data, joukkue, data.sarjat[2]);

muutaSarjanNimi(data, "8h", "10h");

tulostaJoukkueet(data);
log();  //rivinvaihto joukkueiden ja rastien tulostuksen välissä
tulostaRastit(data);

poistaJoukkue(data, "Vara 1");