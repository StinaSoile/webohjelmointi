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

    this.state = { kilpailu: data, edit: null };
    console.log(this.state);

    return;
  }

  getMaxId = (arr) => {
    let maxId = 0;
    for (const j of arr) {
      if (j.id > maxId) {
        maxId = j.id;
      }
    }
    return maxId;
  };

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

    if (this.state.edit) {
      // jos on valittu joukkue, katsotaan statesta millä joukkueella sama id ja muokataan sitä
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

  setEdit = (joukkue) => {
    this.setState({ edit: joukkue });
  };

  render() {
    // jshint ei ymmärrä jsx-syntaksia
    /* jshint ignore:start */
    return (
      <div className="grid">
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
        <ListaaRastit rastit={this.state.kilpailu.rastit} />
      </div>
    );
    /* jshint ignore:end */
  }
}

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

      this.setState({
        ...this.state,
        nimi: valittuNimi,
        jasenet: [...jasenet, ""],
        leimat: valitutLeimat,
        sarja: valittuSarja,
      });
    }
  }

  tyhjennaLomake() {
    this.setState({
      ...this.state,
      nimi: "",
      jasenet: ["", ""],
      leimat: Array(this.props.leimaustavat.length).fill(false),
      sarja: 0,
    });
  }

  nimiHandler(e) {
    e.target.setCustomValidity("");
    this.setState({ nimi: e.target.value });
    if (e.target.value.trim() === "") {
      e.target.setCustomValidity("Joukkueella täytyy olla nimi");
    }
  }

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

  sarjaHandler(e, i) {
    e.target.setCustomValidity("");

    this.setState({ sarja: i });
  }

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
    //(joukkueen nimelle tehdään jo nimiHandlerissa)

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

class JoukkueenTiedot extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
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

class Jasenet extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    /* jshint ignore:start */

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

class ListaaJoukkueet extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  etsiSarja = (joukkue) => {
    for (const sarja of this.props.sarjat) {
      if (sarja.id === joukkue.sarja) {
        return sarja.nimi;
      }
    }
  };

  etsiLeimat = (joukkue) => {
    let leimat = "";
    for (const i of joukkue.leimaustapa) {
      leimat = leimat + ", " + this.props.leimat[i];
    }
    return leimat.substring(2);
  };

  render() {
    const joukkueet = this.props.joukkueet.slice();
    const jarjestaJoukkueet = joukkueet.sort((a, b) => {
      if (a.nimi.trim().toLowerCase() < b.nimi.trim().toLowerCase()) {
        return -1;
      }
      if (a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()) {
        return 1;
      }
      return 0;
    });

    const joukkuelista = jarjestaJoukkueet.map((j) => {
      const sarja = this.etsiSarja(j);
      const leimat = this.etsiLeimat(j);

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

class Joukkue extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
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

class Jasenlistaus extends React.PureComponent {
  constructor(props) {
    super(props);
  }

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

class ListaaRastit extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const rastit = this.props.rastit.slice().sort((a, b) => {
      if (a.koodi.trim().toLowerCase() < b.koodi.trim().toLowerCase()) {
        return -1;
      }
      if (a.koodi.trim().toLowerCase() > b.koodi.trim().toLowerCase()) {
        return 1;
      }
      return 0;
    });

    const rastilista = rastit.map((r) => {
      return (
        <li key={r.id}>
          <a>{r.koodi}</a>
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
