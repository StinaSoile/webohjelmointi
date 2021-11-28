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

    this.state = { kilpailu: data };
    console.log(this.state);
    return;
  }

  handleJoukkueenLisays = (uusi) => {
    // console.log(uusi);
    console.log(
      "Joukkueen nimi: " +
        uusi.nimi +
        "\nJoukkueen jäsenet: " +
        uusi.jasenet +
        "\nJoukkueen leimaustavat: " +
        uusi.leimat +
        "\nJoukkueen sarja: " +
        uusi.sarja.nimi
    );
  };

  render() {
    // jshint ei ymmärrä jsx-syntaksia
    /* jshint ignore:start */
    return (
      <div>
        <LisaaJoukkue
          leimat={this.state.kilpailu.leimaustavat}
          sarjat={this.state.kilpailu.sarjat}
          handleJoukkueenLisays={this.handleJoukkueenLisays}
        />
        <ListaaJoukkueet joukkueet={this.state.kilpailu.joukkueet} />
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

      leimat: Array(this.props.leimat.length).fill(false),
      sarja: 0,
    };
    this.nimiHandler = this.nimiHandler.bind(this);
    this.jasenHandler = this.jasenHandler.bind(this);
    this.leimaHandler = this.leimaHandler.bind(this);
    this.sarjaHandler = this.sarjaHandler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    if (tyhjienIndeksit.length === 0) {
      jasenet.push("");
    } else if (tyhjienIndeksit.length > 1 && jasenet.length > 2) {
      console.log("tyhjien indeksit: " + tyhjienIndeksit);
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
    }
    // console.log("submit: ");
    // console.log(
    //   this.state.nimi +
    //     ", " +
    //     this.state.jasenet +
    //     ", " +
    //     this.state.leimat +
    //     ", " +
    //     this.state.sarja
    // );
  }

  render() {
    /* jshint ignore:start */
    return (
      <form className="form" onSubmit={this.handleSubmit}>
        <Joukkue
          leimat={this.props.leimat}
          sarjat={this.props.sarjat}
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
    );
    /* jshint ignore:end */
  }
}

class Joukkue extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const leimat = this.props.leimat.map((x, i) => (
      <label key={i + "leima"}>
        {x}
        <input
          type="checkbox"
          name="leima"
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
        <div key={i}>
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
      <fieldset>
        <legend>Jäsenet</legend>
        {jasenet}
        {/* <label htmlFor="jasenx">Jasen x:</label>
        <input type="text" name="nimi" id="jasenx" required="required" /> */}
      </fieldset>
    );
    /* jshint ignore:end */
  }
}

class ListaaJoukkueet extends React.PureComponent {
  constructor(props) {
    super(props);
  }

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

    // for (let i = 0; i < joukkuelista.length; i++) {
    //   tulostaJoukkue(joukkuelista[i]);
    // }

    const joukkuelista = jarjestaJoukkueet.map((j) => {
      return <li key={j.id}>{j.nimi}</li>;
    });

    /* jshint ignore:start */
    return (
      <ul>
        {joukkuelista}
        {/* {this.props.joukkueet.map((j) => {
          return <li key={j.id}>{j.nimi}</li>;
        })} */}
      </ul>
    );
    /* jshint ignore:end */
  }
}

ReactDOM.render(
  /* jshint ignore:start */
  <App />,
  /* jshint ignore:end */
  document.getElementById("root")
);
