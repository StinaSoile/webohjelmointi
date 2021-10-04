"use strict";
window.addEventListener("load", function() {
//    alert("Hello world");
    numeroi();
    linkit();
let bt1 = document.getElementById('button1');
bt1.addEventListener('click', varoitus);

});


function numeroi() {
    let h2 = document.getElementsByTagName('h2');
    for (let index = 0; index < h2.length; index++) {
    console.log(h2[index].textContent);
    }
}

function linkit() {
    let ul = document.getElementById('ul');
    let a = ul.getElementsByTagName('a');
    for (let i = 0; i < a.length; i++) {
        const element = a[i];
        console.log(a[i].getAttribute('href'));
    }
}

function varoitus(e) {
    e.preventDefault();
    console.log("Hello world!")
    }