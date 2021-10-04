'use strict';
//@ts-check
// Joukkueen sarja on viite data.sarjat-taulukossa lueteltuihin sarjoihin
// Joukkueen leimaamat rastit ovat viitteitä data.rastit-taulukossa lueteltuihin rasteihin
// voit vapaasti luoda data-rakenteen pohjalta omia aputietorakenteita

// Kirjoita tästä eteenpäin oma ohjelmakoodisi

// Seuraavilla voit tutkia selaimen konsolissa käytössäsi olevaa tietorakennetta.

// ============ taso 1 ==========
function lisaaJoukkue(data, joukkue, sarja) {
    // kayttaa parametri data
    if (!joukkue || !sarja) {
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
    // kayttaa parametri data
    for (const s of data.sarjat) {
        if (s.nimi === vanhanimi) {
            s.nimi = uusinimi;
            return;
        }
    }
}
function tulostaJoukkueet(data) {
    let joukkueetArr = data.joukkueet.sort(
        (a, b) => a.nimi.toLowerCase() > b.nimi.toLowerCase()
    );

    joukkueetArr = joukkueetArr.map((j) => j.nimi + ' ' + j.sarja.nimi);

    const joukkueetStr = joukkueetArr.join('\n');
    log(joukkueetStr);
}
function tulostaRastit(data) {
    let rastitArr = data.rastit.filter((r) => {
        return isFinite(r.koodi[0]);
    });

    rastitArr = rastitArr.map((j) => j.koodi).sort((a, b) => a > b);

    const rastitStr = rastitArr.join(';');
    log(rastitStr);
}

// ============ taso 3 ==========
function poistaJoukkueetNimella(data, poistettavanNimi) {
    const joukkueetArr = data.joukkueet.filter(
        (j) => j.nimi !== poistettavanNimi
    );
    data.joukkueet = joukkueetArr;
}

function haeJoukkueNimella(joukkueet, nimi) {
    for (const j of joukkueet) {
        if (j.nimi.trim() === nimi) {
            return j;
        }
    }
}

function haeRastiKoodilla(arr, koodi) {
    for (const r of arr) {
        // console.log(r);
        if (r.koodi === koodi) {
            return r;
        }
    }
}

/**
 * Vaihtaa pyydetyn rastileimauksen sijalle uuden rastin
 * @param {Object} joukkue
 * @param {number} rastinIdx - rastin paikka joukkue.rastit-taulukossa
 * @param {Object} uusirasti
 * @param {string} Aika - Rastileimauksen aika. Jos tätä ei anneta, käytetään samaa aikaa kuin vanhassa korvattavassa leimauksessa
 */
function vaihdaRasti(joukkue, rastinIdx, uusirasti, aika) {
    try {
        const vanhaRasti = joukkue.rastit[rastinIdx];
        if (!vanhaRasti) {
            return;
        }
        let rastiOlemassa = false;

        // data globaali
        for (const r of data.rastit) {
            if (Object.is(r, uusirasti)) {
                rastiOlemassa = true;
            }
        }

        if (!rastiOlemassa) {
            return;
        }

        vanhaRasti.rasti = uusirasti;
        if (aika) {
            vanhaRasti.aika = aika;
        }
    } catch (error) {
        console.log('virhe vaihdaRasti:', error);
    }
}

// veikkaan etta Lahtosella on bugi koodissa

// 52
// 84
// 39
// 39
// 36
// 37
// 26
// 31
// 34
// 42
// 24
// 17
// 34
// 13
// 15
// 12
// 12
// 0
// 0
// 0
// 0

// 51
// 82
// 38
// 38
// 35
// 36
// 25
// 30
// 33
// 40
// 23
// 16
// 32
// 12
// 12
// 11
// 10
// 0
// 0
// 0
// 0

function getRastit(rastit) {
    let arr = [];
    let started = false;
    for (const r of rastit) {
        if (typeof r.rasti === 'object') {
            // if (r.rasti.koodi === 'LÄHTÖ') {
            if (r.rasti.koodi === 'LAHTO') {
                arr = [];
                arr.push(r.rasti);
                started = true;
            } else if (r.rasti.koodi === 'MAALI' && started) {
                return arr;
            } else {
                arr.push(r.rasti);
            }
        }
    }
    return arr;
}

function getUniqueRastit(rastit) {
    let arr = [];
    let kayty = {};
    for (const r of rastit) {
        if (kayty[r.koodi] === undefined) {
            kayty[r.koodi] = true;
            arr.push(r);
        }
    }
    return arr;
}

function laskePisteet(data) {
    for (const j of data.joukkueet) {
        const rastit = getRastit(j.rastit);
        const unique = getUniqueRastit(rastit);

        let points = 0;

        for (const r of unique) {
            const x = Number(r.koodi[0]);
            points += !isNaN(x) ? x : 0;
        }
        j.totalPoints = points;
    }
}

function tulostaPisteet(data) {
    const arr = data.joukkueet
        .sort((a, b) => a.nimi.toLowerCase() > b.nimi.toLowerCase())
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((j) => `${j.nimi} (${j.totalPoints} p)`);

    const str = arr.join('\n');
    log(str);
}

// ========== taso5 ==========

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function laskeDistance(data) {
    let len = '';
    for (const j of data.joukkueet) {
        // if (j.nimi.trim() === 'Retkellä v 13') {
        //     console.log('retkella');
        //     let i = 0;
        //     for (const r of j.rastit) {
        //         console.log(i++, r.rasti.koodi, r.rasti.lat, r.rasti.lon);
        //     }
        // }

        let rastit = getRastit(j.rastit);
        len += rastit.length + '\n';

        let dist = 0;

        let preRasti;
        for (const r of rastit) {
            if (!r.lon || !r.lat) {
                continue;
            }
            if (preRasti) {
                dist += getDistanceFromLatLonInKm(
                    preRasti.lat,
                    preRasti.lon,
                    r.lat,
                    r.lon
                );
            }
            preRasti = r;
        }
        // j.distance = dist;
        j.distance = Math.round(dist);
    }

    // debukkausta
    console.log(len);
}

function getRastitWithTime(rastit) {
    let arr = [];
    let started = false;
    for (const r of rastit) {
        if (typeof r.rasti === 'object') {
            if (r.rasti.koodi === 'LAHTO') {
                arr = [];
                arr.push(r);
                started = true;
            } else if (r.rasti.koodi === 'MAALI' && started) {
                arr.push(r);
                return arr;
            } else {
                arr.push(r);
            }
        }
    }
    return arr;
}

function pad(n) {
    if (n < 10) {
        return '0' + n;
    }
    return n;
}

function laskeAika(data) {
    for (const j of data.joukkueet) {
        const rastit = getRastitWithTime(j.rastit);

        if (rastit.length === 0) {
            j.aika = '00:00:00';
            continue;
        }
        const rFirst = rastit[0].aika;
        const rLast = rastit[rastit.length - 1].aika;

        let diff = new Date(rLast).getTime() - new Date(rFirst).getTime();

        const ms = diff % 1000;
        diff = (diff - ms) / 1000;
        const secs = diff % 60;
        diff = (diff - secs) / 60;
        const mins = diff % 60;
        const hrs = (diff - mins) / 60;
        j.aika = pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
    }
}

function tulosta(data) {
    let all = '';
    for (const j of data.joukkueet) {
        //prettier-ignore
        all += `${j.nimi.trim()}, ${j.totalPoints} p, ${j.distance} km, ${j.aika}\n`;
    }
    log(all);
}

// ================ fun kutsut ==============

console.log(data);
// console.dir(data);

const joukkue = {
    nimi: 'Mallijoukkue',
    jasenet: ['Lammi Tohtonen', 'Matti Meikäläinen'],
    leimaustapa: [0, 2],
    rastit: [],
    sarja: undefined,
    id: 99999,
};

lisaaJoukkue(data, joukkue, data.sarjat[2]);
muutaSarjanNimi(data, '8h', '10h');
tulostaJoukkueet(data);
log(); // tyhjarivi
tulostaRastit(data);
log(`
----------
Taso 3
----------
`);

poistaJoukkueetNimella(data, 'Vara 1');
poistaJoukkueetNimella(data, 'Vara 2');
poistaJoukkueetNimella(data, 'Vapaat');

const j = haeJoukkueNimella(data.joukkueet, 'Dynamic Duo');
const r = haeRastiKoodilla(data.rastit, '32');

vaihdaRasti(j, 73, r, undefined);
laskePisteet(data);
tulostaPisteet(data);

log(`
----------
Taso 5
----------
`);

laskeDistance(data);
laskeAika(data);
tulosta(data);

// console.log(data);

// 2017-03-18 12:00:00
// 2017-03-18 13:51:13
