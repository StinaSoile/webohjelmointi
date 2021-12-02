"use strict";
/* globals ReactDOM: false */
/* globals React: false */
/* globals data: false */

// datarakenteen kopioiminen
// joukkueen leimausten rasti on viite rastitaulukon rasteihin
function kopioi_kilpailu(data) {
  let kilpailu = {};
  kilpailu.nimi = data.nimi;
  kilpailu.loppuaika = data.loppuaika;
  kilpailu.alkuaika = data.alkuaika;
  kilpailu.kesto = data.kesto;
  kilpailu.leimaustavat = Array.from(data.leimaustavat);
  let uudet_rastit = new Map(); // tehdään uusille rasteille jemma, josta niiden viitteet on helppo kopioida
  function kopioi_rastit(j) {
    let uusir = {};
    uusir.id = j.id;
    uusir.koodi = j.koodi;
    uusir.lat = j.lat;
    uusir.lon = j.lon;
    uudet_rastit.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
    return uusir;
  }
  kilpailu.rastit = Array.from(data.rastit, kopioi_rastit);
  function kopioi_sarjat(j) {
    let uusir = {};
    uusir.id = j.id;
    uusir.nimi = j.nimi;
    uusir.kesto = j.kesto;
    uusir.loppuaika = j.loppuaika;
    uusir.alkuaika = j.alkuaika;
    return uusir;
  }
  kilpailu.sarjat = Array.from(data.sarjat, kopioi_sarjat);
  function kopioi_joukkue(j) {
    let uusij = {};
    uusij.nimi = j.nimi;
    uusij.id = j.id;
    uusij.sarja = j.sarja;

    uusij["jasenet"] = Array.from(j["jasenet"]);
    function kopioi_leimaukset(j) {
      let uusir = {};
      uusir.aika = j.aika;
      uusir.rasti = uudet_rastit.get(j.rasti); // haetaan vanhaa rastia vastaavan uuden rastin viite
      return uusir;
    }
    uusij["rastit"] = Array.from(j["rastit"], kopioi_leimaukset);
    uusij["leimaustapa"] = Array.from(j["leimaustapa"]);
    return uusij;
  }

  kilpailu.joukkueet = Array.from(data.joukkueet, kopioi_joukkue);

  return kilpailu;
}

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    // Käytetään hieman muunneltua dataa viikkotehtävistä 1 ja 3
    // Alustetaan tämän komponentin tilaksi data.
    // Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
    // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi
    // kopioimista varten on annettu valmis mallifunktio
    // Objekteja ja taulukoita ei voida kopioida pelkällä sijoitusoperaattorilla
    // kts. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from

    // edit on arvo joka kertoo, onko klikattu jtk joukkuetta eli muokataanko joukkuetta. Jos null, luodaan uutta joukkuetta
    // mapIndex on arvo joka kertoo mitä rastilistan koordinaateista klikattiin, ts mihin kartta piirtyy. Jos null, ei piirretä karttaa
    this.state = { kilpailu: data, edit: null, mapIndex: null };
    console.log(this.state);

    return;
  }

  // maxId on sitä varten että uudelle luodulle joukkueelle saadaan uusi id
  // käytetään handleJoukkueenLisays-funktiossa
  getMaxId = (arr) => {
    let maxId = 0;
    for (const j of arr) {
      if (j.id > maxId) {
        maxId = j.id;
      }
    }
    return maxId;
  };

  // muokataan joukkuetta tai luodaan uusi
  handleJoukkueenLisays = (uusi) => {
    const id = this.getMaxId(this.state.kilpailu.joukkueet) + 1;
    const newJoukkue = {
      nimi: uusi.nimi,
      jasenet: uusi.jasenet,
      rastit: [],
      leimaustapa: uusi.leimat,
      sarja: uusi.sarja.id,
      id: id,
    };

    // jos on valittu joukkue, katsotaan statesta millä joukkueella sama id ja muokataan sitä
    if (this.state.edit) {
      this.setState({
        kilpailu: {
          ...this.state.kilpailu,
          joukkueet: this.state.kilpailu.joukkueet.map((joukkue) => {
            if (joukkue.id === this.state.edit.id) {
              return {
                ...newJoukkue,
                id: this.state.edit.id,
                rastit: this.state.edit.rastit,
              };
            }
            return joukkue;
          }),
        },
        // muokkauksen jälkeen asetetaan edit: null, eli mikään joukkue ei ole valittu
        edit: null,
      });
    } else {
      // jos mitään joukkuetta ei ole valittu, luodaan kokonaan uusi joukkue
      this.setState({
        kilpailu: {
          ...this.state.kilpailu,
          joukkueet: [...this.state.kilpailu.joukkueet, newJoukkue],
        },
      });
    }
  };

  // asetetaan editin arvoksi jokin joukkue. Kutsutaan kun klikataan joukkuetta
  setEdit = (joukkue) => {
    this.setState({ edit: joukkue });
  };

  // kun muokataan rastilistan rastia, kutsutaan tätä.
  muutaRasti = (vanhaR, uusiKoodi) => {
    this.setState({
      kilpailu: {
        ...this.state.kilpailu,
        rastit: this.state.kilpailu.rastit.map((r) => {
          if (r.id === vanhaR.id) {
            const uusiR = {
              ...r,
              koodi: uusiKoodi,
            };
            return uusiR;
          }
          return r;
        }),
      },
    });
  };

  // jos klikataan sivulla mistä vaan niin mapIndeksi menee nulliksi
  // tämän tarkoitus on että
  // kun rastin koordinaatteja klikkaamalla on luotu kartta,
  // mistä tahansa muualta klikkaamalla kartta katoaa
  // karttaa klikatessa ei katoa, koska siellä on stopPropagation.
  klikattuAppia = () => {
    this.setState({ mapIndex: null });
  };

  // kun klikataan rastin koordinaatteja, kutsutaan tätä ListaaRastit-classissa
  // mapIndex on klikatun rastin indeksi, ja sen perusteella kartta luodaan oikeaan paikkaan
  handleMapIndex = (i) => {
    this.setState({ mapIndex: i });
  };

  // kutsutaan mapboksissa kun asetetaan rastille uudet koordinaatit markeria siirtämällä
  koordHandler = (lat, lon, rasti) => {
    this.setState({
      kilpailu: {
        ...this.state.kilpailu,
        rastit: this.state.kilpailu.rastit.map((r) =>
          r.id === rasti.id
            ? {
                ...r,
                lon: lon.toFixed(6).toString(),
                lat: lat.toFixed(6).toString(),
              }
            : r
        ),
      },
    });
  };

  render() {
    // jshint ei ymmärrä jsx-syntaksia
    /* jshint ignore:start */
    return (
      <div className="grid" onMouseDown={this.klikattuAppia}>
        <LisaaJoukkue
          leimaustavat={this.state.kilpailu.leimaustavat}
          sarjat={this.state.kilpailu.sarjat}
          handleJoukkueenLisays={this.handleJoukkueenLisays}
          edit={this.state.edit}
        />
        <ListaaJoukkueet
          joukkueet={this.state.kilpailu.joukkueet}
          sarjat={this.state.kilpailu.sarjat}
          leimat={this.state.kilpailu.leimaustavat}
          setEdit={this.setEdit}
          kilpailu={this.state.kilpailu}
        />
        <ListaaRastit
          koordHandler={this.koordHandler}
          mapIndex={this.state.mapIndex}
          handleMapIndex={this.handleMapIndex}
          muutaRasti={this.muutaRasti}
          rastit={this.state.kilpailu.rastit}
        />
      </div>
    );
    /* jshint ignore:end */
  }
}

// lomake
class LisaaJoukkue extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      nimi: "",
      jasenet: ["", ""],

      leimat: Array(this.props.leimaustavat.length).fill(false),
      sarja: 0,
    };
    this.nimiHandler = this.nimiHandler.bind(this);
    this.jasenHandler = this.jasenHandler.bind(this);
    this.leimaHandler = this.leimaHandler.bind(this);
    this.sarjaHandler = this.sarjaHandler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.tyhjennaLomake = this.tyhjennaLomake.bind(this);
  }

  // kun joukkuetta klikataan, edit asetetaan klikatuksi joukkueeksi.
  // tämän jälkeen kutsutaan tätä ftiota.
  // componentDidUpdate kutsutaan heti kun havaitaan updeittaus:
  // https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidUpdate(prevProps) {
    if (this.props.edit && this.props.edit !== prevProps.edit) {
      // jos joukkuetta on klikattu (paitsi jos samaa uudestaan)
      const { edit } = { ...this.props }; // kopioidaan klikatun joukkueen tiedot
      const jasenet = edit.jasenet;

      const valittuNimi = edit.nimi;

      let valittuSarja = -1;
      for (let i = 0; i < this.props.sarjat.length; i++) {
        if (this.props.sarjat[i].id === edit.sarja) {
          valittuSarja = i;
        }
      }

      let valitutLeimat = this.state.leimat.map((_, i) => {
        if (edit.leimaustapa.includes(i)) {
          return true;
        }
        return false;
      });

      // asetetaan tämän stateen klikatun joukkueen tiedot
      this.setState({
        ...this.state,
        nimi: valittuNimi,
        jasenet: [...jasenet, ""],
        leimat: valitutLeimat,
        sarja: valittuSarja,
      });
    }
  }

  // kutsutaan handlesubmitissa tässä classissa.
  // tyhjennetään lomake sen jälkeen kun ollaan onnistuneesti tehty submit
  tyhjennaLomake() {
    this.setState({
      ...this.state,
      nimi: "",
      jasenet: ["", ""],
      leimat: Array(this.props.leimaustavat.length).fill(false),
      sarja: 0,
    });
  }

  // joukkueen nimen käsittelijä lomakkeessa
  nimiHandler(e) {
    e.target.setCustomValidity("");
    this.setState({ nimi: e.target.value });
    if (e.target.value.trim() === "") {
      e.target.setCustomValidity("Joukkueella täytyy olla nimi");
    }
  }

  // joukkueen jäsenten käsittelijä lomakkeessa
  jasenHandler(e, i) {
    e.target.setCustomValidity("");
    let jasenet = this.state.jasenet.slice();
    jasenet[i] = e.target.value;

    let tyhjienIndeksit = [];
    for (let i = 0; i < jasenet.length; i++) {
      if (jasenet[i].trim() === "") {
        tyhjienIndeksit.push(i);
      }
    }
    // tässä rajataan jäsenkentät vain viiteen.
    // Jos jasenet.length < 5 ottaa pois, jäsenkenttien määrällä ei ole ylärajaa.
    // olen kuitenkin vielä validoinnissa rajannut ettei voisi lisätä yli 5 hlöä vaikka tuon ottaisi pois.
    if (tyhjienIndeksit.length === 0 && jasenet.length < 5) {
      jasenet.push("");
    } else if (tyhjienIndeksit.length > 1 && jasenet.length > 2) {
      jasenet.splice(tyhjienIndeksit[0], 1);
    }

    this.setState({ jasenet });
  }

  // lomakkeen leimausten käsittelijä
  leimaHandler(e, i) {
    e.target.setCustomValidity("");

    let leimat = this.state.leimat.slice();
    leimat[i] = !leimat[i];
    this.setState({ leimat });
    for (const leima of leimat) {
      if (leima === true) {
        e.target.setCustomValidity("");
      }
    }
  }

  // lomakkeen sarjan käsittelijä
  sarjaHandler(e, i) {
    e.target.setCustomValidity("");

    this.setState({ sarja: i });
  }

  // submit-käsittelijä
  handleSubmit(e) {
    e.preventDefault();
    // luodaan array jossa on listaus valituista leimoista.
    let arr = [];
    for (let i = 0; i < this.state.leimat.length; i++) {
      if (this.state.leimat[i]) {
        arr.push(i);
      }
    }
    // luodaan objekti jossa on uuden joukkueen tiedot.
    // Tästä luodaan uusi joukkue jos validoinnit menee läpi.
    const uusiJoukkue = {
      nimi: this.state.nimi.trim(),
      jasenet: this.state.jasenet.filter((x) => x.trim() !== ""),
      leimat: arr,
      sarja: this.props.sarjat[this.state.sarja],
    };

    // tehdään validoinnit leimoille ja jäsenille.
    // joukkueen nimelle tehdään jo nimiHandlerissa,
    // mutta näille on helpompi toteuttaa vasta tässä

    //jos leimaustapoja ei ole valittuna, valitetaan
    if (uusiJoukkue.leimat.length === 0) {
      e.target.elements.leima[0].setCustomValidity(
        "Joukkueella on oltava vähintään yksi leimaustapa."
      );
      e.target.elements.leima[0].reportValidity();
    }
    // tsekataan onko jäseniä 2-5 kpl
    else if (uusiJoukkue.jasenet.length < 2 || uusiJoukkue.jasenet.length > 5) {
      for (const jasen of e.target.elements.jasen) {
        if (jasen.value.trim() === "") {
          jasen.setCustomValidity("Joukkueella täytyy olla 2-5 jäsentä.");
          jasen.reportValidity();
          return;
        }
      }
    } else {
      this.props.handleJoukkueenLisays(uusiJoukkue);
      this.tyhjennaLomake();
    }
  }

  render() {
    /* jshint ignore:start */
    return (
      <div className="formDiv">
        <h2>Lisää joukkue</h2>
        <form className="form" id="form" onSubmit={this.handleSubmit}>
          <JoukkueenTiedot
            nimi={this.state.nimi}
            leimaustavat={this.props.leimaustavat}
            sarjat={this.props.sarjat}
            leimat={this.state.leimat}
            sarja={this.state.sarja}
            nimiHandler={this.nimiHandler}
            leimaHandler={this.leimaHandler}
            sarjaHandler={this.sarjaHandler}
          />
          <Jasenet
            jasenet={this.state.jasenet}
            jasenHandler={this.jasenHandler}
          />
          <button type="submit">Tallenna</button>
        </form>
      </div>
    );
    /* jshint ignore:end */
  }
}

// lomakkeen Joukkueen tiedot -fieldset
class JoukkueenTiedot extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    // luodaan lomakkeeseen vaihtoehdot leimoille datan pohjalta
    const leimat = this.props.leimaustavat.map((x, i) => (
      <label key={i + "leima"}>
        {x}
        <input
          type="checkbox"
          name="leima"
          checked={this.props.leimat[i] === true}
          onChange={(e) => this.props.leimaHandler(e, i)}
        />
      </label>
    ));

    // luodaan lomakkeeseen sarjat datan pohjalta
    const sarjat = this.props.sarjat.map((x, i) => (
      <label key={i + "sarja"}>
        {x.nimi}
        <input
          type="radio"
          name="sarja"
          checked={i === this.props.sarja}
          onChange={(e) => this.props.sarjaHandler(e, i)}
        />
      </label>
    ));
    /* jshint ignore:start */
    return (
      <fieldset id="joukkue">
        <legend>Joukkueen tiedot</legend>
        <label htmlFor="nimi">Nimi:</label>
        <input
          type="text"
          name="nimi"
          id="nimi"
          value={this.props.nimi}
          required="required"
          onChange={(e) => this.props.nimiHandler(e)}
        />
        <label>Leimaustapa</label>
        <div className="leimat" id="leimat">
          {leimat}
        </div>

        <label>Sarja</label>
        <div className="sarjat" id="sarjat">
          {sarjat}
        </div>
      </fieldset>
    );
    /* jshint ignore:end */
  }
}

// lomakkeen Jäsenet -fieldset
class Jasenet extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    /* jshint ignore:start */

    // luodaan jäsenet LisaaJoukkue-classin staten pohjalta. Siellä oletuksena kaksi tyhjää jäsentä,
    // joten syntyy kaksi tyhjää inputtia.
    const jasenet = this.props.jasenet.map((j, i) => {
      return (
        <div className="jasen" key={i}>
          <label htmlFor={"jasen" + i}>Jäsen {i + 1}</label>
          <input
            type="text"
            id={"jasen" + i}
            value={j}
            name="jasen"
            onChange={(e) => this.props.jasenHandler(e, i)}
          />
        </div>
      );
    });
    return (
      <fieldset id="jasenet">
        <legend>Jäsenet</legend>
        {jasenet}
      </fieldset>
    );
    /* jshint ignore:end */
  }
}

// lista kaikista kilpailun joukkueista
class ListaaJoukkueet extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  // etsitään annetun joukkueen sarja kilpailun datasta
  // kutsutaan Joukkue-classissa kun luodaan yksittäistä joukkuetta listaan
  etsiSarja = (joukkue) => {
    for (const sarja of this.props.sarjat) {
      if (sarja.id === joukkue.sarja) {
        return sarja.nimi;
      }
    }
  };

  // etsitään annetun joukkueen leimat kilpailun datasta
  // kutsutaan Joukkue-classissa kun luodaan yksittäistä joukkuetta listaan
  etsiLeimat = (joukkue) => {
    let leimat = "";
    for (const i of joukkue.leimaustapa) {
      leimat = leimat + ", " + this.props.leimat[i];
    }
    return leimat.substring(2);
  };

  render() {
    // ensin koipiodaan joukkueet datasta
    const joukkueet = this.props.joukkueet.slice();
    // ja sitten laitetaan aakkosjärjestykseen
    const jarjestaJoukkueet = joukkueet.sort((a, b) => {
      if (a.nimi.trim().toLowerCase() < b.nimi.trim().toLowerCase()) {
        return -1;
      }
      if (a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()) {
        return 1;
      }
      return 0;
    });
    // Aakkosjärjestyksessä olevista joukkueista tehdään <li>-elementtejä Joukkue-classissa
    const joukkuelista = jarjestaJoukkueet.map((j) => {
      return (
        <Joukkue
          j={j}
          key={j.id}
          etsiLeimat={this.etsiLeimat}
          etsiSarja={this.etsiSarja}
          setEdit={this.props.setEdit}
          kilpailu={this.props.kilpailu}
        />
      );
    });

    /* jshint ignore:start */
    return (
      <div className="joukkuelista">
        <h2>Joukkueet</h2>
        <ul>{joukkuelista}</ul>
      </div>
    );
    /* jshint ignore:end */
  }
}

// yksittäinen joukkue listassa
class Joukkue extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    // kerätään joukkueen tiedot propseista.
    // etsiSarja ja etsiLeimat on ListaaJoukkueet-classin funktioita,
    // laskePisteet ja haeMatka löytyy koodin lopusta,
    // ovat normaaleja aiemmista viikkotehtävistä kopioituja funktioita
    const j = this.props.j;
    const sarja = this.props.etsiSarja(j);
    const leimat = this.props.etsiLeimat(j);
    const pisteet = laskePisteet(j, this.props.kilpailu);
    const kilsat = haeMatka(j, this.props.kilpailu).toFixed(1);
    return (
      <li>
        <a
          href="#form"
          onClick={() => {
            this.props.setEdit(j);
          }}
        >
          {j.nimi}
        </a>{" "}
        ({pisteet} p, {kilsat} km)
        <br />
        {sarja} ({leimat})<Jasenlistaus joukkue={j} />
      </li>
    );
  }
}

// jäsenet yhdessä listan joukkueessa
class Jasenlistaus extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  // etsitään ja tehdään listaelementtejä yksittäisen joukkueen jäsenistä.
  // Käytetään joukkue-classissa kun luodaan joukkuelistaan yksittäistä joukkuetta.
  joukkueenJasenet = () => {
    let lista = [];
    lista = this.props.joukkue.jasenet;

    return lista.map((j) => {
      return <li key={(this.props.joukkue.id, j)}>{j}</li>;
    });
  };
  render() {
    return <ul>{this.joukkueenJasenet()}</ul>;
  }
}

// lista kaikista kilpailun rasteista
class ListaaRastit extends React.PureComponent {
  constructor(props) {
    super(props);
    // inputIndex kertoo mitä rastin oodia on klikattu.
    // käytetään kun tehdään koodista muokattava: inputIndex määrittelee, mikä rasti on muokattavassa tilassa
    this.state = {
      inputIndex: null,
    };
  }

  // kun yhtä rastin koodia klikataan, inputIndex saa arvokseen kys. rastin indeksin listassa
  rastiClick = (i) => {
    this.setState({ inputIndex: i });
  };

  // kun klikataan jostain muualta kuin valitusta rastista, validoidaan muokattu rastin koodi.
  // jos koodi alkaa numerolla, inputIndex muuttuu nulliksi eli mikään rasti ei ole muokkaustilassa.
  // lisäksi rastin muokattu koodi tallentuu
  // jos rastin koodi ei ala numerolla, rasti pysyy muokkaustilassa ja valitetaan
  rastiBlur = (e, r) => {
    e.preventDefault();
    const el = e.target;
    el.setCustomValidity("");
    const value = el.value.trim();
    if (value !== "" && isFinite(value[0])) {
      this.props.muutaRasti(r, value);
      this.setState({ inputIndex: null });
    } else {
      el.setCustomValidity("Pitää alkaa numerolla");
      el.reportValidity();
      console.log("validity");
    }
  };

  render() {
    // rastit aakkos-/suuruusjärjestykseen, samalla slice tekee siis kopiot datan rasteista
    const rastit = this.props.rastit.slice().sort((a, b) => {
      if (a.koodi.trim().toLowerCase() < b.koodi.trim().toLowerCase()) {
        return -1;
      }
      if (a.koodi.trim().toLowerCase() > b.koodi.trim().toLowerCase()) {
        return 1;
      }
      return 0;
    });

    // tehdään rasteista listan elementtejä
    const rastilista = rastit.map((r, i) => {
      return (
        <li key={r.id} className="rasti">
          {i !== this.state.inputIndex && (
            // klikatessa rastiClick muuttaa staten inputIndeksin arvoa
            <a onClick={(e) => this.rastiClick(i)}>{r.koodi}</a>
          )}
          {i === this.state.inputIndex && (
            // jos inputIndeksissä on tämän rastin id, rastin koodi muutetaan input-kentäksi,
            // jolla on rastiBlur -eventlisteneri, ei onClickiä
            <input
              onBlur={(e) => this.rastiBlur(e, r)}
              type="text"
              defaultValue={r.koodi}
              autoFocus
            />
            // alla on br ja span. Kokeilin diviä mutta sen kanssa voi klikata koko riviltä,
            // jossa koordinaatit on, ja halusin kartan näkyviin vain täsmälleen koordinaateista klikatessa.
            // siksi tässä br ja span, niillä koordinaatti-elementit ei ollut koko rivin pituinen
          )}
          <br />
          <span
            className="koord"
            onMouseDown={(e) => {
              e.stopPropagation();
              this.props.handleMapIndex(i);
            }}
          >
            {r.lat}, {r.lon}{" "}
            {i === this.props.mapIndex && (
              // mapbox on kartta, joka piirtyy klikatun koordinaatin viereen.
              <Mapbox
                rasti={r}
                lat={r.lat}
                lon={r.lon}
                koordHandler={this.props.koordHandler}
              />
            )}
          </span>
        </li>
      );
    });

    return (
      <div className="kaikkiRastit">
        <h2>Rastit</h2>
        <ul>{rastilista}</ul>
      </div>
    );
  }
}

// rastilistassa esiintyvä kartta (kun klikataan rastin koordinaatteja)
class Mapbox extends React.PureComponent {
  // componentDidMount kutsutaan kun komponentti kiinnitetään DOM-puuhun
  componentDidMount() {
    this.map();
  }

  // kutsutaan componentDidMountissa yllä
  // piirtää kartan ja sinne siirreltävän rastin
  map() {
    //luodaan maastokartan pohja
    let mymap = new L.map("map", {
      crs: L.TileLayer.MML.get3067Proj(),
    }).setView([this.props.lat, this.props.lon], 9);
    L.tileLayer
      .mml_wmts({
        layer: "maastokartta",
        key: "c9d83f93-222a-4009-bd29-475127d32e9c",
      })
      .addTo(mymap);

    // ympyrä rastin sijainnin kohdalle, sijainti propseissa
    let marker = L.marker([this.props.lat, this.props.lon], {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.5,
      radius: 100,
      draggable: "true",
    }).addTo(mymap);

    // kun markeria on raahattu, kutsutaan app-classin koordHandleria, joka asettaa rastille uudet koordinaatit
    marker.on("dragend", (e) => {
      const { lng, lat } = e.target._latlng;
      this.props.koordHandler(lat, lng, this.props.rasti);
    });
  }

  render() {
    return (
      <div
        id="map"
        onClick={(e) => {
          e.stopPropagation();
        }}
      ></div>
    );
  }
}

ReactDOM.render(
  /* jshint ignore:start */
  <App />,
  /* jshint ignore:end */
  document.getElementById("root")
);

// kopioitu aiemmasta VT:stä. Alunperin kopioitu allaolevalta sivulta 20.11.2021:
// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
// laskee kahden pisteen koordinaattien perusteella niiden välisen etäisyyden kilometreinä
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
// yllä käytettävä apufunktio
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// kopioitu aiemmasta VT:stä.
// palauttaa arrayn, jossa yhden joukkueen kaikki rastit (objektina)
function haeRastit(joukkue, data) {
  let arr = [];
  let kayty = {};
  let alku = false;
  let lahto;
  let maali;
  for (const d of data.rastit) {
    if (d.koodi === "LAHTO") {
      lahto = d;
    }
    if (d.koodi === "MAALI") {
      maali = d;
    }
  }
  for (const r of joukkue.rastit) {
    //käydään läpi kaikki joukkueen rastit

    if (typeof r === "object") {
      //varmistetaan, että rasti on objekti eikä jotain outoa
      if (r.rasti.id === lahto.id) {
        arr = [lahto];
        alku = true;
      } else if (r.rasti.id === maali.id && alku) {
        arr.push(maali);
        return arr;
      } else {
        for (const d of data.rastit) {
          if (r.rasti.id === d.id && kayty[r.rasti.id] === undefined && alku) {
            //etsitään, onko tietokannassa rastia joka vastaa joukkueen merkitsemää
            kayty[r.rasti.id] = true;
            arr.push(d); //jos rasti vastaa tietokannan rastia, lisätään sen koodi listaan
          }
        }
      }
    }
  }
  return arr;
}

// kopioitu aiemmasta VT:stä.
function haeMatka(joukkue, data) {
  // laskee yhden joukkueen kulkeman matkan ja palauttaa sen kilometreinä
  let arr = haeRastit(joukkue, data);
  let dist = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    let lat1 = arr[i].lat;
    let lon1 = arr[i].lon;
    let lat2 = arr[i + 1].lat;
    let lon2 = arr[i + 1].lon;
    dist = dist + getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2);
  }
  return dist;
}

/**
 * KOPIOITU VT1:stä
 * Kutsuu haeRastit-funktiota, ja laskee sen palauttaman setin jokaisen jäsenen
 * ensimmäisen numeron yhteen. Jos ensimmäinen merkki ei ole numero, ei tee mitään tälle rastille.
 * @param {Object} joukkue
 * @returns summa-kokonaisluku
 */
function laskePisteet(joukkue, data) {
  let arr = haeRastit(joukkue, data);
  let summa = 0;
  for (const r of arr) {
    if (isFinite(r.koodi[0])) {
      summa = summa + parseInt(r.koodi[0]);
    }
  }
  return summa;
}
