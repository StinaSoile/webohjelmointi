/* jshint jquery: true */
$(document).ready(function () {
  let tekstit = $("input[type='text'][required='required']");
  tekstit.each(function (i) {
    console.log($(this).val());
  });
  tekstit.val("foo");

  $("input[type='text'][required='required']").on("change", function () {
    if ($(this).val()) {
      console.log($(this).val());
    }
  });
  // $("form").append($("form label:first"));
  $("form label:first").appendTo($("form"));
  $("form label:last").clone().appendTo($("form"));
  $("form label:first").detach();
  // $("<input type='submit'>");
  $("<input type='submit' value='submitbutton'>").clone().appendTo($("form"));
  let drag = document.getElementById("drag");
  drag.setAttribute("draggable", "true");
  drag.addEventListener("dragstart", function (e) {
    // raahataan datana elementin id-attribuutin arvo
    e.dataTransfer.setData("text/plain", drag.getAttribute("id"));
  });
  let drop = document.getElementById("drop");
  drop.addEventListener("dragover", function (e) {
    e.preventDefault();
    // Set the dropEffect to move
    e.dataTransfer.dropEffect = "move";
  });
  let left;
  let top;

  drop.addEventListener("drop", function (e) {
    e.preventDefault();
    let position = $(this).position();
    let data = e.dataTransfer.getData("text");
    // lisätään tämän elementin sisään
    e.target.appendChild(document.getElementById(data));
    left = position[1];
    top = position[0];
    e.target.css({ top: top, left: left, position: absolute });
  });
});
