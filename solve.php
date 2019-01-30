<?php

?>

<link rel="shortcut icon" href="img/mine.ico">
<canvas id='board_canvas' width=1200 height=800></canvas>
<br>
<div id='status'></div>
<script language='JavaScript' type='text/javascript' src='js/solve.js'></script>
<script language='JavaScript' type='text/javascript' src='js/sas.js'></script>
<script>
let cols = 90;
let rows = 60;
let mines = Math.round(cols * rows / 4);
generate(rows, cols, mines);
initMap(rows, cols);
console.log(smap);
console.log(map);
open_zero();
solveMine(map, mines);
</script>

<script language='JavaScript' type='text/javascript' src='js/jquery.min.js'></script>
<link href='css/crosshair.css' rel=stylesheet>
<div id="crosshair-h" class="hair"></div>
<div id="crosshair-v" class="hair"></div>
<span id="mousepos"></span>
<script>
  $(document).ready(function() {
    // Setup our variables
    let canvas = document.getElementById("board_canvas");
    let cH = $('#crosshair-h'),
      cV = $('#crosshair-v');

    $(this).on('mousemove touchmove', function (e) {
      let x = e.pageX - 1;
      let y = e.pageY - 1;
      cH.css('top', e.pageY - $(window).scrollTop());
      cV.css('left', e.pageX - $(window).scrollLeft());

      $('#mousepos').css({
        top: (e.pageY) + 'px',
        left: e.pageX + 'px'
      }, 800);
      let x1 = Math.floor((x - 8) / canvas.width * cols);
      let y1 = Math.floor((y - 8) / canvas.height * rows);
      $('#mousepos').text(x1 + ":" + y1);
      //$('#mousepos').text("X: " + x + "px, Y: " + y + "px");
      e.stopPropagation();
    });

  });
</script>
