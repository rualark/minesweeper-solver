<?php

?>

<link rel="shortcut icon" href="img/mine.ico">
<canvas id='board_canvas' width=1600 height=800></canvas>
<script language='JavaScript' type='text/javascript' src='js/solve.js'></script>
<script>
let cols = 120;
let rows = 60;
let mines = Math.round(cols * rows / 6);
generate(rows, cols, mines);
initMap(rows, cols);
console.log(smap);
console.log(map);
open_zero();
solveMine(map, mines);
</script>
