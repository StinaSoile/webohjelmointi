"use strict";
//@ts-check 
// data-muuttuja on lähes sama kuin viikkotehtävässä 1.
//

// - saa käyttää css-tiedostoja, mutta XHTML5-tiedoston sisältöä saa muuttaa
// vain ohjelmallisesti

console.log(data);

const table = document.getElementsByTagName('table')[0];
const headers = table.getElementsByTagName('tr')[0];
const pisteet = document.createElement('th');
pisteet.appendChild(document.createTextNode('Pisteet'));
headers.appendChild(pisteet);

console.log({ table, headers });


function updateJoukkueet() {
  const { joukkueet, sarjat } = data;
  const children = table.getElementsByTagName('tr');
  for(let i = children.length-1; i > 2; i--) {
    children[i].remove();
  }

  joukkueet
    .map(joukkue => {
      const pisteet = laskePisteet(joukkue.rastit);
      const sarja = sarjat
        .find(s => s.id === joukkue.sarja).nimi;
      
      return { ...joukkue, sarja, pisteet };
    })
    .sort((a,b) => {
      const aNimi = a.nimi.toLowerCase().trim();
      const bNimi = b.nimi.toLowerCase().trim();

      if (a.sarja < b.sarja) { return -1; }
      if (a.sarja > b.sarja) { return 1; }
      if (a.pisteet < b.pisteet) { return 1; }
      if (a.pisteet > b.pisteet) { return -1; }
      if (aNimi < bNimi) { return -1; }
      if (aNimi > bNimi) { return 1; }
      return 0;
    })
    .forEach(joukkue => {
      const { nimi, sarja, jasenet, pisteet } = joukkue;
      appendTeam(sarja, nimi, pisteet, jasenet);
    });
}

updateJoukkueet();

function laskePisteet(rastit) {
  return rastit
    .map(merkinta => merkinta.rasti) // rasti
    .map(id => data.rastit.find(r => r.id == id))
    .filter(rasti => typeof rasti === 'object') // vain objektit kelpaa
    .map(rasti => rasti.koodi) // haetaan koodit
    .filter((item, pos, arr) => !pos || item != arr[pos - 1]) // filters duplicates, from stack overflow
    .map(koodi => parseInt(koodi[0])) // might be NaN
    .filter(val => !isNaN(val)) // filter NaN out, integers now
    .reduce((sum, val) => sum + val, 0); // sum
}


function appendRow(...texts) {
  const table = document.getElementsByTagName('table')[0];
  if (!table) { return; }

  const row = table.insertRow(-1);

  texts.forEach(text => {
    const td = row.insertCell(0);
    const textDOM = document.createTextNode(text);
    td.appendChild(textDOM);
  });
}

function appendTeam(sarja, nimi, pisteet, jasenet) {
  const table = document.getElementsByTagName('table')[0];
  if (!table) { return; }

  const row = table.insertRow(-1);
  const td = row.insertCell(0);
  const sarjaText = document.createTextNode(sarja);
  td.append(sarjaText);

  const link = document.createElement('a');
  link.setAttribute('href', '#joukkuelomake');
  link.appendChild(document.createTextNode(nimi));
  link.addEventListener('click', e => {
    e.preventDefault();
    setEditingMode('edit', nimi);
  });

  const td2 = row.insertCell(1);
  td2.appendChild(link);
  td2.appendChild(document.createElement('br'));
  td2.appendChild(document.createTextNode(jasenet.join(', ')));

  const td3 = row.insertCell(2);
  const pisteetText = document.createTextNode(`${pisteet} p`);
  td3.appendChild(pisteetText);
}

function createRastiForm() {
  const form = document.getElementsByTagName('form')[0];
  const fieldset = document.createElement('fieldset');
  const legend = document.createElement('legend');
  const text = document.createTextNode('Rastin tiedot');

  legend.appendChild(text);
  fieldset.appendChild(legend);

  const fields = [
    { name: 'Lat', type: 'number' },
    { name: 'Lon', type: 'number' },
    { name: 'Koodi', type: 'text' }
  ];

  fields.forEach(field => {
    const { name, type } = field;

    const label = document.createElement('label');
    const span = document.createElement('span');
    const input = document.createElement('input');
    input.setAttribute('type', type);
    input.setAttribute('value', '');

    if (type == 'number') {
      input.setAttribute('step', '0.000001');
    }

    const text = document.createTextNode(name);
    span.appendChild(text);
    label.appendChild(span);
    label.appendChild(input);

    fieldset.appendChild(label);
  });


  const button = document.createElement('button');
  const buttonText = document.createTextNode('Lisää rasti');
  button.appendChild(buttonText);
  button.appendChild(buttonText);
  button.setAttribute('id', 'rasti');
  fieldset.appendChild(button);

  form.appendChild(fieldset);

  return form;
}

const form = createRastiForm();

form.addEventListener('submit', event => {
  event.preventDefault();

  const values = [];
  const inputs = form.getElementsByTagName('input');
  for (const input of inputs) {
    values.push(input.value);
  }
  const [lat, lon, koodi] = values;
  const rasti = { lat, lon, koodi };


  const clearInputs = () => {
    for (const i of inputs) { i.value = ''; }
  };

  const success = addRasti(rasti);
  if (success) {
    clearInputs();
    printRastit();
  }
});

function addRasti(rasti) {
  const { lat, lon, koodi } = rasti;
  if (!lat || !lon || !koodi) { return false; }
  if (isNaN(parseFloat(lat))) { return false; }
  if (isNaN(parseFloat(lon))) { return false; }


  const ids = data.rastit.map(rasti => rasti.id);
  const maxId = Math.max(...ids);
  const newId = maxId + 1;

  data.rastit.push({ ...rasti, id: newId });

  return true;
}

function printRastit() {
  const len = 20;

  const { rastit } = data;
  const headers = { lat: 'Lat', lon: 'Lon', koodi: 'Rasti' };

  const sortedRastit = rastit
    .sort((a,b) => {
      if (a.koodi < b.koodi) { return -1; }
      if (a.koodi > b.koodi) { return 1; }
      return 0;
    });
  
  const rows = [headers, ...sortedRastit]
    .map(({ lat, lon, koodi }) => ([ 
      koodi.padEnd(len),
      lat.padEnd(len),
      lon.padEnd(len),
     ]))
    .map(row => row.join(''))
    .join('\n');
  
    console.log(rows);
}



// - sorttaa joukkueet
// -- 1. sarjan mukaan 2. nimen mukaan
// e.preventDefault()
// id-attr must be unique,
// not start with numbers and no whitespace
// document.createElement()
// document.append???

// Tämä on ok ja jopa suositeltavaa:
// let input = document.createElement("input");
// input.omajuttu = "tallennan tänne jotain omaa tietoa"; 
// input.oma = omaobjekti;


// https://stackoverflow.com/questions/574944/how-to-load-up-css-files-using-javascript
const cssId = 'myCss';  // you could encode the css path itself to generate id..
if (!document.getElementById(cssId))
{
    const head  = document.getElementsByTagName('head')[0];
    const link  = document.createElement('link');
    link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = '/styles.css';
    link.media = 'all';
    head.appendChild(link);
}

const joukkueForm = document
  .getElementById("joukkuelomake");
const joukkueFieldset = joukkueForm
  .getElementsByTagName('fieldset')[0];

  
const jasenFieldset = document.createElement('fieldset');
const jasenLegend = document.createElement('legend');
jasenFieldset.setAttribute('id', 'jasenlista');

joukkueFieldset
  .insertBefore(jasenFieldset, joukkueFieldset.childNodes[5])
  .appendChild(jasenLegend)
  .appendChild(document.createTextNode('Jäsenet'));

const jasenInputs = jasenFieldset
  .getElementsByTagName('input');


window.addEventListener('load', () => {
  
  setEditingMode('new');


  createField(1);
  createField(2);
  validate();

  joukkueForm.addEventListener('submit', event => {
    event.preventDefault();

    // joukkueForm.editingMode = 'new';

    const values = [];
    const inputs = joukkueForm.getElementsByTagName('input');
    for (const input of inputs) {
      values.push(input.value);
    }

    const [nimi, ...jasenetRaw] = values;
    const jasenet = jasenetRaw.map(j => j.trim()).filter(j => j !== '');
    const ids = data.joukkueet.map(j => j.id);
    const maxId = Math.max(...ids);
    const newId = maxId + 1;
    const sarja = data.sarjat.find(s => s.nimi === '8h').id;

    if (jasenet.length < 2) { return; }
    if (!nimi) { return; }

    console.log('submit', { values });

    if (joukkueForm.editingMode === 'new') {
      const joukkue = {
        nimi,
        sarja,
        jasenet: jasenet,
        leimaustapa: data.leimaustavat.find(l => l === 'GPS'),
        rastit: [],
        id: newId
      };

      data.joukkueet.push(joukkue);
    }
    else if (joukkueForm.editingMode === 'edit') {
      const joukkue = data.joukkueet.find(j => j.nimi === nimi);
      joukkue.nimi = nimi;
      joukkue.jasenet = jasenet;
    }

    joukkueForm.editingMode = 'new';
    updateJoukkueet();

    for(const input of inputs) {
      input.value = '';
    }
  });

});


function isValid() {
  const values = [];
  const inputs = joukkueForm.getElementsByTagName('input');
  for (const input of inputs) {
    values.push(input.value);
  }

  const [nimi, ...jasenetRaw] = values;
  const jasenet = jasenetRaw.map(j => j.trim()).filter(j => j !== '');

  if (jasenet.length < 2) { return false; }
  if (!nimi) { return false; }
  return true;
}

function validate() {
  const joukkueFormButtons = document
    .getElementById('joukkuelomake')
    .getElementsByTagName('button');
  
  const disabled = !isValid();
  const button = joukkueFormButtons[0];

  console.log({ disabled });
  if (disabled) {
    button.setAttribute('disabled', disabled);
  }
  else {
    button.removeAttribute('disabled');
  }
}

function createField(pos) {
  const label = document.createElement("label");
  label.textContent = `Jäsen ${pos}`;
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.addEventListener("input", () => {
    validate();
    addNew();
  });
  label.appendChild(input);

  jasenFieldset.appendChild(label);
  return input;
}

function addNew() {
  let emptyAlreadyFound = false; 

  for (const input of jasenInputs) {
    const empty = input.value.trim() == '';
    if (empty && emptyAlreadyFound && jasenInputs.length > 2) {
      input.parentNode.remove();
    }

    if (empty) { emptyAlreadyFound = true; }
  }

  if (!emptyAlreadyFound) {
    const pos = jasenInputs.length + 1;
    createField(pos);
  }
}

function setEditingMode(mode, joukkueNimi) {
  const joukkueForm = document
    .getElementById("joukkuelomake");

  const buttons = joukkueForm.getElementsByTagName('button');
  for(const button of buttons) {
    button.style.display = 'none';
  }

  if (mode == 'new') {
    joukkueForm.editingMode = 'new';
    buttons[0].style.display = 'block';
  }
  else if (mode == 'edit') {
    joukkueForm.editingMode = 'edit';
    buttons[1].style.display = 'block';

    const joukkue = data.joukkueet.find(j => j.nimi === joukkueNimi);
    console.log({ joukkue });

    const nimiField = joukkueForm.getElementsByTagName('input')[0];
    nimiField.value = joukkue.nimi;

    const { jasenet } = joukkue;
    const jasenFields = jasenFieldset.getElementsByTagName('input');
    console.log({ jasenFields });
    for(let i = 0; i < jasenet.length; i++) {
      if (i < jasenFields.length) {
        jasenFields[i].value = jasenet[i];
      }
      else {
        const field = createField(i+1);
        field.value = jasenet[i];
      }
    }

  }
}