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

//----------------------------------TASO 3-------------------------------

/*poistaa datasta joukkueen annetun nimen perusteella*/
function poistaJoukkue(data, nimi) { //haluttu data ja joukkueen nimi, string
    for(let i = 0; i<data.joukkueet.length; i++) { //käydään läpi kaikki joukkueet
        if (data.joukkueet[i].nimi === nimi) {  //jos löytyy joukkue jolla etsitty nimi,
            data.joukkueet.splice(i, 1);    //poistetaan joukkue. Ei returnia, koska ajattelin että jos olisi useampia samannimisiä, tämä poistaisi kaikki.
        }
    }
}

/**
 * Vaihtaa pyydetyn rastileimauksen sijalle uuden rastin.
 * Tarkistaa, että annettu rasti (objekti) löytyy tietorakenteesta. Jos ei, ei vaihdu.
 * Funktio ei kaadu vaikka joukkueobjekti olisi väärää muotoa tai rastin indeksi väärä.
 * 
 * Vaihdettavan rastin ja joukkueen (Dynamic Duo, rasti 32) etsiminen tietorakenteesta tehdään muualla.
 * @param {Object} joukkue
 * @param {number} rastinIdx - rastin paikka joukkue.rastit-taulukossa
 * @param {Object} uusirasti
 * @param {string} Aika - Rastileimauksen aika. Jos tätä ei anneta, käytetään samaa aikaa kuin vanhassa korvattavassa leimauksessa
 */
 function vaihdaRasti(joukkue, rastinIdx, uusirasti, aika) {
    try {
        const vanhaRasti = joukkue.rastit[rastinIdx];
        if (!vanhaRasti) {  //jos rastin indeksi on väärä, funktio ei kaadu, eikä tee mitään muutakaan.
            return;
        }
        let rastiOlemassa = false;

        // data globaali
        for (const r of data.rastit) {
            if (Object.is(r, uusirasti)) {  //etsitään, onko tietorakenteessa rastia joka on annettu parametrina
                rastiOlemassa = true;
            }
        }

        if (!rastiOlemassa) {   //jos annettua rastia ei löydy tietorakenteesta, mitään ei tapahdu
            return;
        }

        vanhaRasti.rasti = uusirasti;   //vaihdetaan annettu rasti vanhan tilalle
        if (aika) {
            vanhaRasti.aika = aika;     //jos aika on annettu parametrina, vaihdetaan uusi aika tilalle. Jos ei ole annettu, aikaa ei muuteta.
        }
    } catch (error) {
        console.log('virhe vaihdaRasti:', error);
    }
}

function haeRastiKoodilla(arr, koodi) {
    for(const rasti of arr) {
        if (rasti.koodi.trim() === koodi.trim()){
            return rasti;
        }
    }
}

function haeJoukkueNimella(arr, n) {
    for(const joukkue of arr) {
        if (joukkue.nimi.trim() === n.trim()) {
            return joukkue;
        }
    }
}

/**
 * hakee annetun joukkueen merkitsevät rastit set-objektiin.
 * @param {Object} joukkue 
 * @returns Set-objekti, johon on tallennettu koodit niistä joukkueen rasteista, jotka huomioidaan
 */
function haeRastit(joukkue) {
    let arr = [];
    let alku = false;
    for(const r of joukkue.rastit) {    //käydään läpi kaikki joukkueen rastit
        if (typeof r.rasti === 'object') {  //varmistetaan, että rasti on objekti eikä jotain outoa
            if(r.rasti.koodi === "LAHTO") {     //jos rasti on lähtö,
                arr = [];                       //nollataan aiemmin mahdollisesti kertyneet rastit
                alku = true;                    //merkitään alku todeksi
            } else if (r.rasti.koodi === 'MAALI' && alku) { //jos rasti on maali ja alku on totta, eli aiemmin on ollut lähtö,
                return arr;                                 //palautetaan arr, johon on kertynyt tähänastiset rastit
            } else {
                for (const d of data.rastit) {
                    if (Object.is(d, r.rasti)) {  //etsitään, onko tietokannassa rastia joka vastaa joukkueen merkitsemää
                        arr.push(r.rasti.koodi);    //jos rasti vastaa tietokannan rastia, lisätään sen koodi listaan
                    }
                }
            }

        }
    }
    return arr;
}

/**
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


function tulostaPisteet (data){
    let arr  = [];
    for ( const joukkue of data.joukkueet) {
        arr.push({nimi: joukkue.nimi, pisteet: laskePisteet(joukkue)});
    }
    arr.sort(
        (a, b) => {    //taulukko nimien mukaan aakkosjärjestykseen
            if (a.nimi.trim().toLowerCase() < b.nimi.trim().toLowerCase()) {
                return -1;
            }
            if (a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()) {
                return 1;
            }
            return 0;
        } 
    );
    arr.sort((a, b) => a.summa-b.summa);     //taulukko pisteiden mukaan järjestykseen
    for (let joukkue of arr) {
        log(joukkue.nimi + " (" + joukkue.pisteet + ")");
    }
}

//---------------------------------FUNKTIOKUTSUT---------------------------

const joukkue = {   //joukkueen luonti
    nimi: 'Mallijoukkue',
    jasenet: ['Lammi Tohtonen', 'Matti Meikäläinen'],
    leimaustapa: [0, 2],
    rastit: [],
    sarja: undefined,
    id: 99999,
};

lisaaJoukkue(data, joukkue, data.sarjat[2]);

muutaSarjanNimi(data, "8h", "10h");

tulostaJoukkueet(data);
log();  //rivinvaihto joukkueiden ja rastien tulostuksen välissä
tulostaRastit(data);

log(`
----------
Taso 3
----------
`);

poistaJoukkue(data, "Vara 1");
poistaJoukkue(data, "Vara 2");
poistaJoukkue(data, "Vapaat");

const joukkue2 = haeJoukkueNimella(data.joukkueet, 'Dynamic Duo');
const rasti = haeRastiKoodilla(data.rastit, '32');
vaihdaRasti(joukkue2, 73, rasti, undefined);

tulostaPisteet(data);