// Source map (9 is a mine)
let smap = [];
// Current guessing map state (9 is a mine, 10 is a question mark)
let map = [];
// Number of tries to open a mine
let test_errors = 0;
let start_time = new Date();

function generate(rows, cols, mines) {
  smap = [];
  // Clear map
  for (let x=-1; x<=cols; ++x) {
    smap[x] = [];
  }
  // Generate mines
  for (let i=0; i<mines; ++i) {
    for (let t=0; t<100000; ++t) {
      let x = Math.floor(Math.random() * cols);
      let y = Math.floor(Math.random() * rows);
      if (smap[x][y] === 'x') continue;
      smap[x][y] = 'x';
      break;
    }
  }
  // Generate numbers
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      if (smap[x][y] === 'x') continue;
      smap[x][y] = adjacent_count(smap, x, y, 'x');
    }
  }
}

function adjacent_count(map, x, y, val) {
  let s = 0;
  if (map[x][y - 1] === val) ++s;
  if (map[x][y + 1] === val) ++s;
  if (map[x - 1][y] === val) ++s;
  if (map[x - 1][y - 1] === val) ++s;
  if (map[x - 1][y + 1] === val) ++s;
  if (map[x + 1][y] === val) ++s;
  if (map[x + 1][y - 1] === val) ++s;
  if (map[x + 1][y + 1] === val) ++s;
  return s;
}

function adjacent_set(map, x, y, val, val2) {
  let s = 0;
  if (map[x][y - 1] === val) map[x][y - 1] = val2;
  if (map[x][y + 1] === val) map[x][y + 1] = val2;
  if (map[x - 1][y] === val) map[x - 1][y] = val2;
  if (map[x - 1][y - 1] === val) map[x - 1][y - 1] = val2;
  if (map[x - 1][y + 1] === val) map[x - 1][y + 1] = val2;
  if (map[x + 1][y] === val) map[x + 1][y] = val2;
  if (map[x + 1][y - 1] === val) map[x + 1][y - 1] = val2;
  if (map[x + 1][y + 1] === val) map[x + 1][y + 1] = val2;
  return s;
}

function adjacent_open(map, x, y, val) {
  let s = 0;
  if (map[x][y - 1] === val) my_open(x, y - 1);
  if (map[x][y + 1] === val) my_open(x, y + 1);
  if (map[x - 1][y] === val) my_open(x - 1, y);
  if (map[x - 1][y - 1] === val) my_open(x - 1, y - 1);
  if (map[x - 1][y + 1] === val) my_open(x - 1, y + 1);
  if (map[x + 1][y] === val) my_open(x + 1, y);
  if (map[x + 1][y - 1] === val) my_open(x + 1, y - 1);
  if (map[x + 1][y + 1] === val) my_open(x + 1, y + 1);
  return s;
}

function my_open(x, y) {
  if (x < 0 || x >= cols) return 0;
  if (y < 0 || y >= rows) return 0;
  let res = open(y, x);
  if (res === 'x') map[x][y] = 9;
  if (res === '?') map[x][y] = 10;
  else map[x][y] = res;
  simple_solve_square(x, y);
}

function initMap() {
  map = [];
  // Clear map
  for (let x=-1; x<=cols; ++x) {
    map[x] = [];
  }
  for (let x=0; x<cols; ++x) {
    for (let y = 0; y < rows; ++y) {
      map[x][y] = 10;
    }
  }
}

function countMines() {
  mines = 0;
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      if (smap[x][y] === 'x')
        ++mines;
    }
  }
}

function initMapSas() {
  map_sas = [];
  // Clear map
  for (let x=-1; x<=cols; ++x) {
    map_sas[x] = [];
  }
  for (let x=0; x<cols; ++x) {
    for (let y = 0; y < rows; ++y) {
      map_sas[x][y] = 0;
    }
  }
}

function open_zero() {
  let opened = 0;
  let x_start = cols - 1;
  if (cols > 30) x_start = Math.round(cols/2 - 1);
  let y_start = cols - 1;
  if (rows > 30) y_start = Math.round(rows/2 - 1);
  for (let x = x_start; x >= 0; --x) {
    for (let y = y_start; y >= 0; --y) {
      //console.log("open_zero", x, y);
      if (smap[x][y] !== 0) continue;
      map[x][y] = 0;
      ++opened;
      if (opened > rows*cols*0.001) return;
    }
  }
  for (let t=0; t<100000; ++t) {
    let x = Math.floor(Math.random() * cols);
    let y = Math.floor(Math.random() * rows);
    console.log("open_zero", x, y);
    if (smap[x][y] !== 0) continue;
    map[x][y] = 0;
    break;
  }
}

function open(row, column) {
  if (smap[column][row] === 'x') {
    ++test_errors;
  }
  return smap[column][row];
}

function simple_solve_square(x, y) {
  if (map[x][y] !== 9 && map[x][y] !== 10) {
    let qc = adjacent_count(map, x, y, 10);
    // Skip if no adjacent questions
    if (qc === 0) return 0;
    let mc = adjacent_count(map, x, y, 9);
    if (qc + mc === map[x][y]) {
      adjacent_set(map, x, y, 10, 9);
      return 1;
    }
    if (mc === map[x][y]) {
      adjacent_open(map, x, y, 10);
      return 1;
    }
  }
  return 0;
}

function simple_solve() {
  let res = 0;
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      res += simple_solve_square(x, y);
    }
  }
  return res;
}

function update_status(st) {
  let el = $('#status');
  let time = new Date();
  el.html(st + ' in ' + Math.floor((time - start_time)/100) / 10 + ' s');
}

function solve_timer() {
  update_status("Solving: simple algorithm");
  let res = simple_solve();
  if (res) {
    show_progress();
    show_board();
    window.setTimeout(solve_timer, 3);
  }
  else {
    update_status("Solving: step-append scan");
    let res2 = sas_solve();
    if (res2) {
      show_progress();
      show_board();
      window.setTimeout(solve_timer, 3);
    }
    else {
      res2 = sas_solve(2);
      if (res2) {
        show_progress();
        show_board();
        window.setTimeout(solve_timer, 3);
      }
      else {
        show_progress();
        show_board();
        update_status("Finished");
        console.log("Errors:", test_errors, sas_aborts);
      }
    }
  }
}

function solveMine(map, n){
  window.setTimeout(solve_timer, 100);
}

function show_progress() {
  get_stats();
  let canvas = document.getElementById("progress_canvas");
  let ctx = canvas.getContext("2d");
  let total = rows * cols;
  // Total sas
  let done = total_sas;
  // Total simple
  let done2 = total - total_q - total_sas;
  console.log(total, total_q, total_sas, done, done2);
  let coef = canvas.height / total;
  ctx.fillStyle = "#bbbbbb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let rhei = coef * done;
  let rhei2 = coef * done2;
  ctx.fillStyle = "#bb0000";
  ctx.fillRect(0, canvas.height - rhei2, canvas.width, rhei2);
  if (done) {
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(0, canvas.height - rhei2 - rhei, canvas.width, rhei);
  }
}

function show_board() {
  let canvas = document.getElementById("board_canvas");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x=0; x<=cols; ++x) {
    let x1 = Math.round(canvas.width * x / cols);
    ctx.beginPath();
    ctx.moveTo(x1, 0);
    ctx.lineTo(x1, canvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#aaaaaa';
    ctx.stroke();
  }
  for (let y=0; y<=rows; ++y) {
    let y1 = Math.round(canvas.height * y / rows);
    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(canvas.width, y1);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#aaaaaa';
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = 'middle';
  let px = Math.round(canvas.height / rows);
  let px2 = Math.round(canvas.width / cols);
  if (px2 < px) px = px2;
  px = px * 0.9;
  ctx.font = px + "px Arial";
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      let x1 = Math.round(canvas.width * x / cols);
      let x2 = Math.round(canvas.width * (x + 1) / cols);
      let y1 = Math.round(canvas.height * y / rows);
      let y2 = Math.round(canvas.height * (y + 1) / rows);
      if (x2 - x1 > 6) {
        --x2;
        ++x1;
        --y2;
        ++y1;
      }
      if (map[x][y] === 9) {
        ctx.fillStyle = "#990000";
        if (map_sas[x][y] === 1) ctx.fillStyle = "#0000ff";
        else if (map_sas[x][y] === 2) ctx.fillStyle = "#00bb00";
        else if (map_sas[x][y] === 3) ctx.fillStyle = "#bb00bb";
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      }
      else if (map[x][y] === 10) {
        if (smap[x][y] === 'x') {
          ctx.fillStyle = "#cc9999";
        }
        else {
          ctx.fillStyle = "#bbbbbb";
        }
        ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      }
      else if (map[x][y] !== 0) {
        if (map_sas[x][y] === 1) {
          ctx.fillStyle = "#ccccff";
          ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
        else if (map_sas[x][y] === 2) {
          ctx.fillStyle = "#aaffaa";
          ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
        else if (map_sas[x][y] === 3) {
          ctx.fillStyle = "#ffccff";
          ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
        }
        if (x2 - x1 > 6) {
          ctx.fillStyle = "#000000";
          ctx.fillText(map[x][y], (x1 + x2) / 2, (y1 + y2) / 2 + (y2 - y1) * 0.1);
        }
      }
    }
  }
  //canvas.title = 'Board';
}
