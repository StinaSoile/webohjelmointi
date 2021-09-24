"use strict";
//@ts-check 
// Joukkueen sarja on viite data.sarjat-taulukossa lueteltuihin sarjoihin
// Joukkueen leimaamat rastit ovat viitteitä data.rastit-taulukossa lueteltuihin rasteihin
// voit vapaasti luoda data-rakenteen pohjalta omia aputietorakenteita

// Kirjoita tästä eteenpäin oma ohjelmakoodisi

// Seuraavilla voit tutkia selaimen konsolissa käytössäsi olevaa tietorakennetta. 


/* Tehtävä 1:
yleiskäyttöinen funktio, joka tulostaa log-komennolla
joukkueiden nimet ja sarjat joukkueen nimen mukaan aakkosjärjestyksessä
    -kunkin joukkueen nimi omalle rivilleen
    -sarjan nimi joukkueen nimen jälkeen
    -älä tulosta mtn ylimääräistä
    -isot ja pienet kirjaimet ei merkityksellisiä järjestämisessä
    -nimien ylimääräisiä välilyöntejä ei huomioida eikä tulosteta
*/

function tulostaJoukkueet(data) {
    let dataKopio  =  JSON.parse(JSON.stringify(data));

    const tiedot = [];
    for(let joukkue of dataKopio.joukkueet) {
        tiedot.push(joukkue.nimi.trim() + " " + joukkue.sarja.nimi);
    }
    const jarj = tiedot.sort((a, b) => {
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
        log(rivi);
    }
}

/* lisää data-tietorakenteeseen funktiolle tuodun joukkueen haluttuun sarjaan.
Sarjan oltava data.sarjat-taulukosta löytyvä objekti.
Jos jokin parametreista puuttuu, funktio ei tee mitään. */
function lisaaJoukkue(data, joukkue, sarja) {
    if (!joukkue || !sarja || !data) {
        return;
    }
    for (let s of data.sarjat) {
        if (Object.is(s, sarja)) {
            joukkue.sarja = sarja;
            data.joukkueet.push(joukkue);
            return;
        }
    }
}

function muutaSarjanNimi(data, vanhanimi, uusinimi) {
    for (let s of data.sarjat) {
        if (s.nimi === vanhanimi) {
            s.nimi = uusinimi;
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
        rastitLista.push(data.rastit[i].koodi);
    }
    rastitLista.sort(
        (a, b) => a.toLowerCase() > b.toLowerCase()
    );
    let str = "";
    for (let i=0; i<rastitLista.length; i++) {
        if(isFinite(rastitLista[i][0])) {
            str = str + rastitLista[i] + ";";
        }
    }
    log(str);
}


console.log(data);

const joukkue = {
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
log();
tulostaRastit(data);



