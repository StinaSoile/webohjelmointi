"use strict";
// seuraavat estävät jshintin narinat jqueryn ja leafletin objekteista
/* jshint jquery: true */
/* globals L */

// kirjoita tänne oma ohjelmakoodisi
window.onload = function () {
  let div = $("#map");
  div.css("width", Math.round(window.innerWidth) + "px");
  div.css("height", Math.round(window.innerHeight) + "px");

  let mymap = new L.map("map", {
    crs: L.TileLayer.MML.get3067Proj(),
  }).setView([62.2333, 25.7333], 11);
  L.tileLayer
    .mml_wmts({
      layer: "maastokartta",
      key: "c9d83f93-222a-4009-bd29-475127d32e9c",
    })
    .addTo(mymap);
  let circle = L.circle([62.2325, 25.7355], {
    color: "black",
    fillColor: "#f03",
    fillOpacity: 0.5,
    radius: 100,
  }).addTo(mymap);
  circle.bindPopup("Jiihaa!");

  let koords = [
    [62.2325, 25.7355],
    [62.2333, 25.7333],
    [62.23, 25.73],
    [62.232, 25.7222],
  ];
  let polyline = L.polyline(koords, { color: "blue" }).addTo(mymap);
  let marker = L.marker([62.2333, 25.7333], { draggable: "true" }).addTo(mymap);
  marker.bindPopup("Paikka : " + marker.getLatLng() + "").openPopup();
  marker.addEventListener("dragend", function (e) {
    console.log(e.target.getLatLng());
    e.target._popup.setContent("Paikka : " + e.target.getLatLng() + "");
    polyline.addLatLng(e.target.getLatLng());
  });
  //   mymap.locate({ setView: true, maxZoom: 16 });
};

// c9d83f93-222a-4009-bd29-475127d32e9c
