<link rel="shortcut icon" href="img/mine.ico">
<canvas id='board_canvas' width=1600 height=900></canvas>
<br>
<div id='status'></div>
<script language='JavaScript' type='text/javascript' src='js/jquery.min.js'></script>
<script language='JavaScript' type='text/javascript' src='js/solve.js'></script>
<script language='JavaScript' type='text/javascript' src='js/sas.js'></script>
<script>
let cols = 140;
let rows = 80;
let mines = Math.round(cols * rows / 5);
generate(rows, cols, mines);

<?php
// $fname = "maps/map2.txt";
if ($fname != "") {
  $fa = file($fname);
  $cols = count($fa);
  echo "smap = [];\n";
  echo "cols = $cols;\n";
  for ($x = 0; $x < $cols; ++$x) {
    $st = $fa[$x];
    $st = str_replace("\n", "", $st);
    $st = str_replace("x", "'x'", $st);
    $st = str_replace("?", "'?'", $st);
    $st = str_replace(" ", ", ", $st);
    echo "smap[$x] = [$st];\n";
  }
  echo "rows = smap[0].length;\n";
  echo "countMines();\n";
}
    // TODO: If only one mine is left and only one square, open this square
?>

initMap();
open_zero();
initMapSas();
console.log(smap);
console.log(map);
solveMine(map, mines);
</script>

<link href='css/crosshair.css' rel=stylesheet>
<!-- <div id="crosshair-h" class="hair"></div>
<div id="crosshair-v" class="hair"></div>
<span id="mousepos"></span> -->
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
