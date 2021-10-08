    // dynaaminen lista koko sivun input-elementeistä
    // voisi käyttää myös omaa taulukkoa tms.
    let inputit = document.getElementsByTagName("input");
    inputit[0].addEventListener("input", addNew);

    function addNew(e) {
        // käydään läpi kaikki input-kentät viimeisestä ensimmäiseen
        // järjestys on oltava tämä, koska kenttiä mahdollisesti poistetaan
        // ja poistaminen sotkee dynaamisen nodeList-objektin indeksoinnin
        // ellei poisteta lopusta 
        let viimeinen_tyhja = -1; // viimeisen tyhjän kentän paikka listassa
        for(let i=inputit.length-1 ; i>-1; i--) { // inputit näkyy ulommasta funktiosta
            let input = inputit[i];
            // jos on jo löydetty tyhjä kenttä ja löydetään uusi niin poistetaan viimeinen tyhjä kenttä
            // kenttä on aina label-elementin sisällä eli oikeasti poistetaan label ja samalla sen sisältö

            if ( viimeinen_tyhja > -1 && input.value.trim() == "") { // ei kelpuuteta pelkkiä välilyöntejä
                let poistettava = inputit[viimeinen_tyhja].parentNode; // parentNode on label, joka sisältää inputin
                document.forms[0].removeChild( poistettava );
                viimeinen_tyhja = i;
            }
            // ei ole vielä löydetty yhtään tyhjää joten otetaan ensimmäinen tyhjä talteen
            if ( viimeinen_tyhja == -1 && input.value.trim() == "") {
                    viimeinen_tyhja = i;
            }
        }
        // ei ollut tyhjiä kenttiä joten lisätään yksi
        if ( viimeinen_tyhja == -1) {
            let label = document.createElement("label");
            label.textContent = "Kenttä";
            let input = document.createElement("input");
            input.setAttribute("type", "text");
            input.addEventListener("input", addNew)
            document.forms[0].appendChild(label).appendChild(input);
        }
        // jos halutaan kenttiin numerointi
        for(let i=0; i<inputit.length; i++) { // inputit näkyy ulommasta funktiosta
                let label = inputit[i].parentNode;
                label.firstChild.nodeValue = "Kenttä " + (i+1); // päivitetään labelin ekan lapsen eli tekstin sisältö
        }
    
    }