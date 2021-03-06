"use strict"; // pidä tämä ensimmäisenä rivinä
//@ts-check

// luodaan lomake jolla luodaan tai muokataan joukkuetta
function luoLomake() {
  const jNimi = document.getElementById("nimi");
  jNimi.addEventListener("input", inputHandlerNimi);
  jNimi.addEventListener("input", inputHandler);
  addLeimat();
  addSarjat();

  const jasenet = document.getElementById("jasenet");
  removeJasenet();

  if (muokattavaJoukkue === "undefined") {
    jNimi.value = "";
    addInput(jasenet);
    addInput(jasenet);
  }
  if (muokattavaJoukkue !== "undefined") {
    jNimi.value = muokattavaJoukkue.nimi.trim();
    for (const jasen of muokattavaJoukkue.jasenet) {
      addInput(jasenet, jasen);
    }
    addInput(jasenet);
  }
  // const button = document.querySelector("button");
  // button.disabled = true;
  const form = document.getElementById("form");
  form.addEventListener("submit", submitHandler);
}

// luodaan lomake jolla tehdään uusi leimaustapa
function luoLeimauslomake() {
  const lNimi = document.getElementById("lNimi");
  lNimi.addEventListener("input", inputHandlerUusiLeima);
  const form2 = document.getElementById("form2");
  form2.addEventListener("submit", submitHandlerUusiLeima);
}

// inputhandler lomakkeessa jolla luodaan uusi leimaustapa
//Inputissa täytyy olla vähintään kaksi merkkiä ja nimi ei voi olla sama kuin olemassaoleva
function inputHandlerUusiLeima(e) {
  e.target.setCustomValidity("");
  if (e.target.value.trim().length < 2) {
    e.target.setCustomValidity("Nimessä täytyy olla vähintään kaksi merkkiä");
  }
  for (const leima of data.leimaustapa) {
    if (leima.trim().toLowerCase() === e.target.value.trim().toLowerCase()) {
      e.target.setCustomValidity("Tämän niminen leimaustapa on jo olemassa");
    }
  }
}

// submithandler lomakkeelle jolla luodaan uusi leimaustapa
function submitHandlerUusiLeima(e) {
  e.preventDefault();
  let lNimi = document.getElementById("lNimi");
  data.leimaustapa.push(lNimi.value.trim());
  lNimi.value = "";
  luoLomake();
}

// listätään datasta haetut leimat lomakkeeseen checkboksiin alla olevassa muodossa
// <label>
//   En kerro
//   <input type="checkbox" name="leima" value="-" checked="checked" />
// </label>;
function addLeimat() {
  let leimat = document.getElementById("leimat");
  if (leimat.firstChild) {
    let labels = leimat.querySelectorAll("label");
    for (let label of labels) {
      label.remove();
    }
  }

  // luodaan jokaista leimaustapaa vastaavat checboksit
  let list = [];
  for (const leima of data.leimaustapa) {
    const l = document.createElement("label");
    const inp = document.createElement("input");
    l.textContent = leima;
    inp.setAttribute("type", "checkbox");
    inp.setAttribute("name", "leima");
    inp.setAttribute("value", data.leimaustapa.indexOf(leima));
    l.appendChild(inp);
    list.push(l);
  }
  for (let i = 0; i < list.length; i++) {
    leimat.appendChild(list[i]);
  }
  // jos kyse on uuden joukkueen luomisesta, pidetään huolta että ainakin yksi leimaustapa olisi valittuna
  if (muokattavaJoukkue === "undefined") {
    leimat
      .querySelector("input")
      .setCustomValidity("Joukkueella täytyy olla ainakin yksi leimaustapa");
  }
  leimat.addEventListener("input", inputHandlerLeimat);
  // jos kyse on vanhan joukkueen muokkaamisesta, merkataan valituiksi ne leimaustavat jotka joukkueella on
  if (muokattavaJoukkue !== "undefined") {
    const l = leimat.querySelectorAll("input");
    for (const leima of l) {
      if (muokattavaJoukkue.leimaustapa.includes(parseInt(leima.value))) {
        leima.setAttribute("checked", "checked");
      }
    }
  }
}

// luodaan sarja-radiobuttonit
function addSarjat() {
  let radio = document.getElementById("radio");
  if (radio.firstChild) {
    let labels = radio.querySelectorAll("label");
    for (let label of labels) {
      label.remove();
    }
  }
  let list = [];
  for (const sarja of data.sarjat) {
    const l = document.createElement("label");
    const inp = document.createElement("input");
    l.textContent = sarja.nimi;
    inp.setAttribute("type", "radio");
    inp.setAttribute("name", "sarja");
    inp.setAttribute("value", sarja.id);
    // radio.appendChild(l);
    l.appendChild(inp);
    list.push(l);
  }
  list.sort((a, b) => (a.textContent > b.textContent ? 1 : -1));
  for (let i = 0; i < list.length; i++) {
    radio.appendChild(list[i]);
  }
  const inp = radio.querySelector("input");
  inp.setAttribute("checked", "checked");
  // jos muokataan valmista joukkuetta, merkataan radiobuttoneista valituksi se sarja joka joukkueella on
  if (muokattavaJoukkue !== "undefined") {
    const r = radio.querySelectorAll("input");
    for (const radio of r) {
      if (muokattavaJoukkue.sarja === parseInt(radio.value)) {
        radio.setAttribute("checked", "checked");
      }
    }
  }
}

// poistetaan kaikki jäsen-labelit. Käytetään kun luodaan lomake ja putsataan vanha pois
function removeJasenet() {
  let next = document
    .getElementById("jasenet")
    .querySelector("legend").nextElementSibling;
  if (next) {
    next.remove();
    removeJasenet();
  }
}

// luo uuden inputin, käytetään kun luodaan joukkueen jäsenten nimille kenttiä
// input seuraavaa muotoa
//  <label for="jasenx">Jäsen x: </label>
//         <input type="text" name="nimi" id="jasenx" required="required" />
function addInput(parent, input) {
  inputId++;
  const l = document.createElement("label");
  l.setAttribute("for", "jasen" + inputId);
  l.textContent = "Jäsen";
  const inp = document.createElement("input");
  inp.setAttribute("type", "text");
  inp.setAttribute("name", "nimi");
  inp.setAttribute("id", "jasen" + inputId);
  inp.value = "";
  if (input) {
    inp.value = input;
  }
  inp.addEventListener("input", inputHandler);
  parent.appendChild(l);
  parent.appendChild(inp);
  let labels = parent.querySelectorAll("label");
  nimeaKentat(labels);
}

// antaa joukkuelomakkeen inputeille nimet jäsen 1, jäsen 2 jne.
function nimeaKentat(labels) {
  // halutaan kenttiin numerointi
  //   const jasenet = document.getElementById("jasenet");
  //   labels = jasenet.querySelectorAll("label");

  for (let i = 0; i < labels.length; i++) {
    let label = labels[i];
    label.textContent = "Jäsen " + (i + 1);
  }
}

// inputhandleri leimaustavan valinnalle. Tarkistaa että leimaustapoja on vähintään yksi
function inputHandlerLeimat(e) {
  const leimat = document.getElementById("leimat").querySelectorAll("input");
  let valitut = [];
  for (const leima of leimat) {
    leima.setCustomValidity("");
    if (leima.checked) {
      valitut.push(leima);
    }
  }
  if (valitut.length === 0) {
    e.target.setCustomValidity(
      "Joukkueella täytyy olla ainakin yksi leimaustapa"
    );
  }
}

// inputhandleri joukkueen nimelle
function inputHandlerNimi(e) {
  let nimi = e.target;
  nimi.setCustomValidity("");
  let nimet = [];

  // onko jo olemassa samannimisiä joukkueita
  if (muokattavaJoukkue === "undefined") {
    for (const joukkue of data.joukkueet) {
      nimet.push(joukkue.nimi.trim().toLowerCase());
    }
    if (nimet.includes(nimi.value.trim().toLowerCase())) {
      nimi.setCustomValidity("Tämän niminen joukkue on jo olemassa");
    }
  }

  // jos kyse on joukkueen muokkaamisesta, pitää huomioida että joukkueen nimi saa olla sama kuin itsellään
  if (muokattavaJoukkue !== "undefined") {
    for (const joukkue of data.joukkueet) {
      if (joukkue.id !== muokattavaJoukkue.id) {
        nimet.push(joukkue.nimi.trim().toLowerCase());
      }
    }
    if (nimet.includes(nimi.value.trim().toLowerCase())) {
      nimi.setCustomValidity("Tämän niminen joukkue on jo olemassa");
    }
  }

  // onko joukkueen nimessä vähintään kaksi merkkiä
  if (nimi.value.trim().length < 2) {
    nimi.setCustomValidity(
      "Joukkueen nimessä on oltava vähintään kaksi merkkiä"
    );
  }
}

// input handler jäsenien nimille sekä tyhjien inputtien kontrollointi
// tsekataan onko jäseniä alle kaksi tai samannimisiä jäseniä
// Lisätään uusi tyhjä input aina kun edellisissä on tekstiä, poistetaan ylimääräiset tyhjät inputit.
function inputHandler() {
  const jasenet = document.getElementById("jasenet");

  let labels = jasenet.querySelectorAll("label");
  let inputs = jasenet.querySelectorAll("input");

  for (let i = 0; i < inputs.length; i++) {
    inputs[i].setCustomValidity("");
  }
  const emptyInputs = [];
  const tekstit = [];

  // validointi:
  // onko samannimisiä henkilöitä
  for (let i = 0; i < inputs.length; i++) {
    for (let j = 0; j < inputs.length; j++) {
      if (
        inputs[i].value.trim().toLowerCase() ===
          inputs[j].value.trim().toLowerCase() &&
        inputs[i] !== inputs[j]
      ) {
        inputs[j].setCustomValidity(
          "Joukkueessa ei saa olla samannimisiä jäseniä"
        );
      }
    }
  }

  // onko jäseniä alle 2
  if (inputs.length < 3) {
    if (inputs[0].value.trim() === "") {
      inputs[0].setCustomValidity(
        "Joukkueella on oltava vähintään kaksi jäsentä"
      );
    }
    if (inputs[1].value.trim() === "") {
      inputs[1].setCustomValidity(
        "Joukkueella on oltava vähintään kaksi jäsentä"
      );
    }
  }

  // tyhjien inputtien lisäys ja poisto:
  // lisätään empty inputtiin kaikki tyhjät
  for (const input of inputs) {
    if (input.value.trim() === "") {
      emptyInputs.push(input);
    }
  }

  // jos emptyssä on enemmän kuin 1 inputti ja yhteensä inputteja on 2 tai enemmän
  // niin poistetaan emptyistä kaikki paitsi yksi
  if (emptyInputs.length > 1 && inputs.length > 2) {
    for (let i = 1; i < emptyInputs.length; i++) {
      let id = emptyInputs[i].id;
      for (let j = 1; j < labels.length; j++) {
        if (labels[j].getAttribute("for") === id) {
          labels[j].remove();
        }
        emptyInputs[i].remove();
        inputHandler();
      }
    }
  }
  // jos emptyjä ei ole, lisätään yksi.
  if (emptyInputs.length === 0) {
    addInput(jasenet);
  }
  inputs = jasenet.querySelectorAll("input");
  labels = jasenet.querySelectorAll("label");
  nimeaKentat(labels);
  // const jNimi = form.querySelector("input");
  // if (inputs.length > 2 && jNimi.value.trim().length > 0) {
  //   button.disabled = false;
  // } else {
  //   button.disabled = true;
  // }
}

// uutta joukkuetta lisättäessä tämä on eventlisteneri kun painaa tallenna
function luoUusiJoukkue() {
  const nimi = document.getElementById("nimi");
  const radiot = document.getElementById("radio").querySelectorAll("input");
  const jasenInputs = document
    .getElementById("jasenet")
    .querySelectorAll("input");

  // jäsenet listaan
  const jasenet = [];
  for (const input of jasenInputs) {
    if (input.value.trim().length > 0) {
      jasenet.push(input.value.trim());
    }
  }

  // tallennetaan radiobuttoneista valittu inputin arvo sarjaId:hen
  let sarjaId;
  for (const input of radiot) {
    if (input.checked) {
      sarjaId = parseInt(input.value);
    }
  }

  // lisätään valitut leimaustavat leimaustavat-taulukkoon
  const leimat = document.getElementById("leimat").querySelectorAll("input");
  let leimaustavat = [];
  for (const leima of leimat) {
    if (leima.checked) {
      leimaustavat.push(parseInt(leima.value));
    }
  }

  // lasketaan maksimi joukkueiden iideistä ja lisätään yksi.
  // Tarvitaan kun luodaan uusi joukkue ja tälle id.
  const iideet = [];
  for (const joukkue of data.joukkueet) {
    iideet.push(joukkue.id);
  }
  let maxId = Math.max(...iideet);
  let newId = maxId + 1;

  const newJoukkue = {
    nimi: nimi.value.trim(),
    jasenet: jasenet,
    rastit: [],
    leimaustapa: leimaustavat,
    sarja: sarjaId,
    id: newId,
  };

  data.joukkueet.push(newJoukkue);
}

// vanhaa joukkuetta muokattaessa tämä on submitlistener kun tallennetaan
function muokkaaJoukkuetta() {
  if (muokattavaJoukkue === "undefined") {
    return;
  }
  const nimi = document.getElementById("nimi");
  const radiot = document.getElementById("radio").querySelectorAll("input");
  const jasenInputs = document
    .getElementById("jasenet")
    .querySelectorAll("input");

  // lisätään jäsenet lomakkeesta jäsenet-listaan
  const jasenet = [];
  for (const input of jasenInputs) {
    if (input.value.trim().length > 0) {
      jasenet.push(input.value.trim());
    }
  }

  // lisätään valittu sarja sarjaId:hen
  let sarjaId;
  for (const input of radiot) {
    if (input.checked) {
      sarjaId = input.value;
    }
  }

  // lisätään valitut leimat leimaustavat-listaan
  const leimat = document.getElementById("leimat").querySelectorAll("input");
  let leimaustavat = [];
  for (const leima of leimat) {
    if (leima.checked) {
      leimaustavat.push(parseInt(leima.value));
    }
  }

  // laitetaan lomakkeen tiedot muokattavaJoukkue -objektille
  muokattavaJoukkue.nimi = nimi.value.trim();
  muokattavaJoukkue.jasenet = jasenet;
  muokattavaJoukkue.leimaustapa = leimaustavat;
  muokattavaJoukkue.sarja = sarjaId;

  // muutetaan vanhan joukkueen tilalle dataan muokattavaJoukkue. Alla pois kommentoituna toinen toteutustapa.
  data.joukkueet = data.joukkueet.map((j) =>
    j.id === muokattavaJoukkue.id ? muokattavaJoukkue : j
  );
  // for (let i = 0; i < data.joukkueet.length; i++) {
  //   if (data.joukkueet[i].id === muokattavaJoukkue.id) {
  //     data.joukkueet[i] = muokattavaJoukkue;
  //   }
  // }

  muokattavaJoukkue = "undefined";
}

// etsitään datasta sarja id:n mukaan. Käytetään kun tulostetaan joukkueet
function etsiSarja(sarjaId) {
  let sarja;
  for (const s of data.sarjat) {
    if (parseInt(s.id) === parseInt(sarjaId)) {
      sarja = s;
    }
  }
  return sarja;
}

// tulostetaan joukkueet aakkosjärjestyksessä.
function luoJoukkueLista() {
  // jos on olemassa vanha lista, tuhotaan se ja luodaan uusi tyhjä
  const div = document.getElementById("joukkueet");
  let lista = document.getElementById("joukkuelista");
  if (lista !== "undefined") {
    lista.remove();
  }
  lista = document.createElement("ul");
  lista.setAttribute("id", "joukkuelista");
  div.appendChild(lista);

  // lisätään joukkueet listaan, sortataan se
  // ja lisätään joukkueet jäsenineen yksitellen tulostaJoukkue-funktion avulla
  let joukkuelista = [];
  for (const joukkue of data.joukkueet) {
    joukkuelista.push(joukkue);
  }
  joukkuelista.sort((a, b) => {
    if (a.nimi.trim().toLowerCase() < b.nimi.trim().toLowerCase()) {
      return -1;
    }
    if (a.nimi.trim().toLowerCase() > b.nimi.trim().toLowerCase()) {
      return 1;
    }
    return 0;
  });

  for (let i = 0; i < joukkuelista.length; i++) {
    tulostaJoukkue(joukkuelista[i]);
  }
}

// lisätään yksi annettu joukkue listaan, alla olevassa muodossa
/* <ul id="joukkuelista">
  <li>
    Joukkue A <strong>8h</strong>
    <ul>
      <li>Jäsen A</li>
      <li>Jäsen B</li>
      <li>Jäsen c</li>
    </ul>
  </li>
</ul>; */
function tulostaJoukkue(joukkue) {
  const lista = document.getElementById("joukkuelista");

  const li = document.createElement("li");
  const a = document.createElement("a");
  a.textContent = joukkue.nimi.trim();
  a.href = "#form";
  a.addEventListener("click", function () {
    muokattavaJoukkue = JSON.parse(JSON.stringify(joukkue));
    luoLomake();
  });

  let sarja = etsiSarja(joukkue.sarja);
  const strong = document.createElement("strong");
  strong.textContent = " " + sarja.nimi.trim();

  let ul = document.createElement("ul");
  let jasenet = [];
  for (const nimi of joukkue.jasenet) {
    jasenet.push(nimi.trim());
  }
  jasenet.sort((a, b) => a.trim().toLowerCase() > b.trim().toLowerCase());

  for (let i = 0; i < jasenet.length; i++) {
    const li2 = document.createElement("li");
    li2.textContent = jasenet[i];
    ul.appendChild(li2);
  }

  li.appendChild(a);
  li.appendChild(strong);
  li.appendChild(ul);
  lista.appendChild(li);
}

// joukkueen luomis/muokkaamislomakkeen submithandleri
function submitHandler(e) {
  e.preventDefault();
  if (muokattavaJoukkue === "undefined") {
    luoUusiJoukkue();
  }
  if (muokattavaJoukkue !== "undefined") {
    muokkaaJoukkuetta();
  }
  luoLomake();
  luoJoukkueLista();
}

// "main"

let inputId = 0;
let muokattavaJoukkue = "undefined";
luoLomake();
luoJoukkueLista();
luoLeimauslomake();

console.log(data);
