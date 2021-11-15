"use strict";  // pidä tämä ensimmäisenä rivinä 
//@ts-check 

console.log(data);

window.addEventListener("load", function(){
    lisaaRadioButtonit();
    // kasitteleLomakkeenTiedot(document.getElementById("joukkuelomake"), document.getElementsByTagName("button").namedItem("joukkue"));
    hallitseJasentenMaara(document.getElementById("jasentenFieldset"));
    // let inputit = document.getElementById("jasentenFieldset").getElementsByTagName("input");
    // for (const input of inputit) {
    //     input.addEventListener("input", kasitteleJasentenMaara);
    // }
    document.getElementById("joukkuelomake").addEventListener("submit", kasitteleSubmit);
});


/**
 * Lisää sarjan valitsemiseen tarvittavat radio buttonit. Järjestää
 * sarjat nimen mukaan ja lisää radiobuttonit siten järjestyksessä.
 */
function lisaaRadioButtonit() {
    let sarjat = data.sarjat.slice();
    sarjat.sort(sarjat_compare);
    let valinnatDiv = document.getElementById("radioButtonit");
    for (const sarja of sarjat) {
        let valintaLabel = document.createElement("label");
        let sarjanNimi = document.createElement("span");
        sarjanNimi.textContent = sarja.nimi;
        valintaLabel.appendChild(sarjanNimi);
        let radioButton = document.createElement("input");
        radioButton.setAttribute("type", "radio");
        radioButton.setAttribute("name", "radiobutton");
        if (valinnatDiv.childElementCount == 0) {
             radioButton.setAttribute("checked", true);
        }
        valintaLabel.appendChild(radioButton);
        valinnatDiv.appendChild(valintaLabel); 
    }

    function sarjat_compare(a,b){
        let sarjanNimi1 = a.nimi;
        let sarjanNimi2 = b.nimi;
        
        if( sarjanNimi1 < sarjanNimi2) {return -1;}
        if( sarjanNimi1 > sarjanNimi2) {return 1;}
        return 0;    
    }
}

/**
 * Pitää yllä oikean määrän inputteja jäsenten lisäys lomakkeessaa.
 * @param {*} fieldset sen lomakkeen fieldset, jonka inputteja halutaan käsitellä
 */
 function hallitseJasentenMaara(fieldset) {  
    let inputit = fieldset.getElementsByTagName("input");
    // fieldset.parentNode.addEventListener("input", kasitteleLomakkeenTiedot(document.getElementById("joukkuelomake")));
    fieldset.addEventListener("input", function(event){
    //Seuraava funktio, koska jshint valitti loopin sisällä käytetystä funktiosta
    let paivitaSpanit = function(poistetunIndeksi) {
        for (let index = poistetunIndeksi-1; index < inputit.length; index++) {
            const span = inputit[index].previousSibling;
            span.textContent = "Jasen " + (index + 1);
        }
        for (let i = 0; i < 2; i++) {
            const input = inputit[i];
            input.setAttribute("required", "required");
        }
    };
        for (let i = inputit.length -1; i >= 0 ; i--) {
            if (i>1 && inputit[i-1].value == "") {
                let poistettavaLabel = event.target.parentNode;
                poistettavaLabel.remove();
                paivitaSpanit(i);
            }
            if (inputit[inputit.length - 1].value == "") {
                continue;
            }
            if(inputit[inputit.length - 1].value != ""){
                let label = document.createElement("label");
                let teksti1 = document.createTextNode("Jasen " + (i + 2));
                let span = label.appendChild(document.createElement("span"));
                span.appendChild(teksti1);
                label.append(span, document.createElement("input"));
                fieldset.appendChild(label);
            }
        }

    });
}

function kasitteleSubmit(event) {
    event.preventDefault();
    validoi(event.target);
    event.target.reset();
}

function validoi(lomake) {
    let inputit = document.getElementById("joukkuelomake").getElementsByTagName("input");
    // for (const input of lomake.getElementsByTagName("input")) {
    //     if (input.type == "") {
            
    //     }
    // }
    let taytettyjenMaara = 0;
    for (const input of inputit) {
        if (input.value.trim != "") {
            taytettyjenMaara++;
            continue;
        }
        // input.setCustomValidity("")
        if (taytettyjenMaara < 2) {
            input.setCustomValidity("Joukkueella on oltava vähintään kaksi jäsentä");
        }
        
    }
    lomake.reportValidity();
}