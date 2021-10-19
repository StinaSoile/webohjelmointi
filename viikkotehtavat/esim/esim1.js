let testi = document.getElementById("lomake").testi;

testi.addEventListener("input", function (e) {
  let testi = e.target;

  // nollataan virheilmoitus
  testi.setCustomValidity("");

  if (testi.value != "testi") {
    testi.setCustomValidity('Tähän kenttään täytyy syöttää sana "testi"');
  }

  // tämä kannattaa kutsua vasta myöhemmin eli koko lomakkeen submit-tapahtumassa
  // tai tämän kentän blur-tapahtumassa
  // testi.reportValidity();
});

testi.addEventListener("input", function (e) {
  e.target.reportValidity();
});

let tavallinen = document.getElementById("lomake").tavallinen;

// tavallisen painikkeen click-tapahtuma. Täällä ei tehdä tarkistuksia
// ellei itse niin komenneta
tavallinen.addEventListener("click", function (e) {
  console.log("click tapahtui");
  //täällä voisi kutsua
  //document.getElementById('lomake').reportValidity();
});

// submit-tapahtumassa tarkistetaan kentät automaattisesti, jos lomakkeen
// novalidate-attribuuttia ei ole asetettu
document.getElementById("lomake").addEventListener("submit", function (e) {
  console.log("Lomakkeen submit-tapahtuma");
  e.preventDefault(); // estetään lomakkeen lähettäminen
});
