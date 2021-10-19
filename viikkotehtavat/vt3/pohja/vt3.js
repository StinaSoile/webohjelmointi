"use strict"; // pidä tämä ensimmäisenä rivinä
//@ts-check
let inputId = 0;
function luoLomake() {
  const jNimi = document.getElementById("nimi");
  jNimi.value = "";
  jNimi.addEventListener("input", inputHandler1);
  addSarjat();

  const jasenet = document.getElementById("jasenet");
  removeJasenet();
  addInput(jasenet);
  addInput(jasenet);
  // const button = document.querySelector("button");
  // button.disabled = true;
  const form = document.getElementById("form");
  form.addEventListener("submit", submitHandler);
}

function addSarjat() {
  const sarjat = data.sarjat;
  let radio = document.getElementById("radio");
  if (radio.firstChild) {
    let labels = radio.querySelectorAll("label");
    for (let label of labels) {
      label.remove();
    }
  }
  for (const sarja of sarjat) {
    const l = document.createElement("label");
    const inp = document.createElement("input");
    l.textContent = sarja.nimi;
    inp.setAttribute("type", "radio");
    inp.setAttribute("name", "sarja");
    inp.setAttribute("value", sarja);
    radio.appendChild(l);
    l.appendChild(inp);
  }
  const inp = radio.querySelector("input");
  inp.setAttribute("checked", "checked");
}

function removeJasenet() {
  let next = document
    .getElementById("jasenet")
    .querySelector("legend").nextElementSibling;
  if (next) {
    next.remove();
    removeJasenet();
  }
  return;
}

// luo uuden inputin, käytetään kun luodaan joukkueen jäsenten nimille kenttiä

//  <label for="jasenx">Jäsen x: </label>
//         <input type="text" name="nimi" id="jasenx" required="required" />
function addInput(parent) {
  inputId++;
  const l = document.createElement("label");
  l.setAttribute("for", "jasen" + inputId);
  l.textContent = "Jäsen";
  const inp = document.createElement("input");
  inp.setAttribute("type", "text");
  inp.setAttribute("name", "nimi");
  inp.setAttribute("id", "jasen" + inputId);
  inp.value = "";
  inp.addEventListener("input", inputHandler2);
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

function inputHandler1(e) {
  let nimi = e.target;
  nimi.setCustomValidity("");
  let nimet = [];
  for (const joukkue of data.joukkueet) {
    nimet.push(joukkue.nimi.trim().toLowerCase());
  }
  if (nimet.includes(nimi.value.trim().toLowerCase())) {
    nimi.setCustomValidity("Tämän niminen joukkue on jo olemassa");
  }

  inputHandler();
}

function inputHandler2(e) {
  let nimi = e.target;
  nimi.setCustomValidity("");
  const inputs = document.getElementById("jasenet").querySelectorAll("input");
  const tekstit = [];
  for (const input of inputs) {
    let inp = input.value.trim().toLowerCase();
    if (inp !== "") {
      tekstit.push(inp);
    }
  }

  if (checkDuplicates(tekstit)) {
    nimi.setCustomValidity(
      "Joukkueessa ei saa olla useampaa samannimistä henkilöä"
    );
  }

  inputHandler();
}

function checkDuplicates(array) {
  return new Set(array).size !== array.length;
}

// Lisätään uusi tyhjä input aina kun edellisissä on tekstiä, poistetaan ylimääräiset tyhjät inputit.
function inputHandler() {
  const form = document.getElementById("form");
  const jasenet = document.getElementById("jasenet");

  let labels = jasenet.querySelectorAll("label");
  let inputs = jasenet.querySelectorAll("input");
  // const button = form.querySelector("button");
  const emptyInputs = [];

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

function submitHandler(e) {
  e.preventDefault();
  console.log("submit happened");

  const jNimi = document.getElementById("nimi");
  jNimi.reportValidity();

  const inputit = document.getElementById("jasenet").querySelectorAll("input");
  if (inputit.length < 3) {
    inputit[0].setCustomValidity(
      "Joukkueella on oltava vähintään kaksi jäsentä"
    );
  }
  for (const input of inputit) {
    input.reportValidity();
  }

  luoLomake();
}

luoLomake();

console.log(data);
