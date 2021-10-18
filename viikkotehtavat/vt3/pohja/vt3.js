"use strict"; // pidä tämä ensimmäisenä rivinä
//@ts-check
let inputId = 0;
function luoLomake() {
  const jasenet = document.getElementById("jasenet");
  addInput(jasenet);
  addInput(jasenet);
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

// Lisätään uusi tyhjä input aina kun edellisissä on tekstiä, poistetaan ylimääräiset tyhjät inputit.
// Tässä on kopioitu ja muokattu kurssin sivuilta löytyvää mallia:
// https://appro.mit.jyu.fi/tiea2120/luennot/forms/ ensimmäinen esimerkki, Dynaaminen lomake
function inputHandler(e) {
  console.log("toimiiko");
  const form = document.getElementById("form");
  const jasenet = document.getElementById("jasenet");
  let inputs = jasenet.querySelectorAll("input");
  const button = form.querySelector("button");
  const emptyInputs = [];

  // lisätään empty inputtiin kaikki tyhjät
  for (const input of inputs) {
    if (input.value.trim() === "") {
      emptyInputs.push(input);
    }
  }
  // jos emptyssä on enemmän kuin 1 inputti ja yhteensä inputteja on 2 tai enemmän
  // niin poistetaan emptyistä kaikki paitsi yksi
  //   if (emptyInputs.length > 1 && inputs.length > 2) {
  //     for (let i = 1; i < emptyInputs.length; i++) {
  //       emptyInputs[i].parentNode.parentNode.remove();
  //     }
  //   }
  // jos emptyjä ei ole, lisätään yksi.
  if (emptyInputs.length === 0) {
    addInput(jasenet);
  }
  inputs = jasenet.querySelectorAll("input");
  let labels = jasenet.querySelectorAll("label");
  nimeaKentat(labels);
  const jNimi = form.querySelector("input");
  if (inputs.length > 2 && jNimi.value.trim().length > 0) {
    button.disabled = false;
  } else {
    button.disabled = true;
  }
}

luoLomake();

console.log(data);
