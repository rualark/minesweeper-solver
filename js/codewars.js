// Current guessing map state (9 is a mine, 10 is a question mark)
let map = [];
// Number of tries to open a mine
let test_errors = 0;
let start_time = new Date();

// SAS
// Domain id for each square
let dia = [];
// Rules array
let ra = [];
// Questions array
let qa = [];
// Current domain id
let did = 0;
// Question variant (0 or 1)
let qv = [];
// If question can be 0 or 1
let qpos = [];
qpos[0] = [];
qpos[1] = [];
// Sas was used to guess
let map_sas = [];
// Position in scan
let p = 0;
// Number of aborts
let sas_aborts = 0;

function add_rule(did, x, y) {
  // Skip out of range
  if (x < 0 || x >= cols) return 0;
  if (y < 0 || y >= rows) return 0;
  // Skip if domain already set
  if (dia[x][y] > 0) return;
  let qc = adjacent_count(map, x, y, 10);
  // Skip if no adjacent questions
  if (qc === 0) return 0;
  let mc = adjacent_count(map, x, y, 9);
  let sum = map[x][y] - mc;
  //if (!sum) return;
  // Create new rule
  let rid = ra.length;
  ra[rid] = {x: x, y: y, qc: qc, sum: sum, mc: mc, qa: new Set(), max_q: 0};
  // Mark square as belonging to domain
  dia[x][y] = did;
  // Add adjacent questions
  if (map[x][y - 1] === 10) add_q(did, x, y - 1, rid);
  if (map[x][y + 1] === 10) add_q(did, x, y + 1, rid);
  if (map[x - 1][y] === 10) add_q(did, x - 1, y, rid);
  if (map[x - 1][y - 1] === 10) add_q(did, x - 1, y - 1, rid);
  if (map[x - 1][y + 1] === 10) add_q(did, x - 1, y + 1, rid);
  if (map[x + 1][y] === 10) add_q(did, x + 1, y, rid);
  if (map[x + 1][y - 1] === 10) add_q(did, x + 1, y - 1, rid);
  if (map[x + 1][y + 1] === 10) add_q(did, x + 1, y + 1, rid);
}

function add_q(did, x, y, rid) {
  // Skip out of range
  if (x < 0 || x >= cols) return 0;
  if (y < 0 || y >= rows) return 0;
  // Skip if domain already set
  if (dia[x][y] > 0) return;
  let qid = qa.length;
  // Create new rule
  qa[qid] = {x: x, y: y, ra: new Set()};
  // Mark square as belonging to domain
  dia[x][y] = did;
  // Add adjacent rules
  if (map[x][y - 1] < 9) add_rule(did, x, y - 1);
  if (map[x][y + 1] < 9) add_rule(did, x, y + 1);
  if (map[x - 1][y] < 9) add_rule(did, x - 1, y);
  if (map[x - 1][y - 1] < 9) add_rule(did, x - 1, y - 1);
  if (map[x - 1][y + 1] < 9) add_rule(did, x - 1, y + 1);
  if (map[x + 1][y] < 9) add_rule(did, x + 1, y);
  if (map[x + 1][y - 1] < 9) add_rule(did, x + 1, y - 1);
  if (map[x + 1][y + 1] < 9) add_rule(did, x + 1, y + 1);
}

function get_links() {
  for (let r=0; r<ra.length; ++r) {
    for (let q=0; q<qa.length; ++q) {
      // Add if adjacent
      if (Math.abs(qa[q].x - ra[r].x) < 2 &&
        Math.abs(qa[q].y - ra[r].y) < 2 ) {
        ra[r].qa.add(q);
        qa[q].ra.add(r);
        // Set maximum qid
        if (q > ra[r].max_q) ra[r].max_q = q;
      }
    }
  }
}

function init_scan() {
  p = 0;
  qv = [];
  qpos[0] = [];
  qpos[1] = [];
  for (let q=0; q<qa.length; ++q) {
    qv[q] = 0;
    qpos[0][q] = 0;
    qpos[1][q] = 0;
  }
}

function check_rules() {
  //console.log("Checking rules:", qa[p].ra);
  for (let rid of qa[p].ra) {
    // Calculate sum of detected mines
    let sum = 0;
    //console.log("Checking rule:", rid, ra[rid]);
    for (let qid of ra[rid].qa) {
      if (qid > p) continue;
      sum += qv[qid];
    }
    //console.log("Compare sum", sum, ra[rid].sum, rid);
    // If this is last question, can check completely
    if (ra[rid].max_q === p) {
      if (sum !== ra[rid].sum) return 0;
    }
    // If this is not last question, can check only too many
    else {
      if (sum > ra[rid].sum) return 0;
    }
  }
  return 1;
}

function sas_scan() {
  //console.log(JSON.stringify(qa));
  let cycle = 0;
  let finished = 0;
  let solutions = [];
  for (;;) {
    let need_skip = 1;
    let good = check_rules();
    if (good) {
      if (p === qa.length - 1) {
        //console.log("Good:", qv, p);
        for (let q = 0; q < qa.length; ++q) {
          ++qpos[qv[q]][q];
        }
        solutions.push(qv);
      }
      else {
        //console.log("Continue:", qv, p);
        // Go to next question
        ++p;
        need_skip = 0;
      }
    }
    else {
      //console.log("Bad:", qv);
    }
    if (need_skip) {
      for (;;) {
        if (!qv[p]) break;
        // If current element is max, make it minimum
        qv[p] = 0;
        // Can we move left?
        if (!p) {
          finished = 1;
          break;
        }
        // Move left one element
        --p
      }
      qv[p] = 1;
    }
    if (finished) break;
    ++cycle;
    if (cycle > 10000000000) {
      console.log("Aborting");
      ++sas_aborts;
      break;
    }
  }
  if (finished) {
    return sas_open();
  }
  else {
    return 0;
  }
}

function sas_open() {
  let res = 0;
  //console.log("Possible:", qpos);
  for (let q = 0; q < qpos[0].length; ++q) {
    // Open new square if mine is not possible
    if (!qpos[1][q] && qpos[0][q]) {
      let x = qa[q].x;
      let y = qa[q].y;
      ++map_sas[x][y];
      my_open(x, y);
      ++res;
    }
    // Set mine if empty is not possible
    else if (!qpos[0][q] && qpos[1][q]) {
      let x = qa[q].x;
      let y = qa[q].y;
      ++map_sas[x][y];
      map[x][y] = 9;
      ++res;
    }
  }
  return res;
}

function sas_solve() {
  // Clear
  did = 0;
  dia = [];
  for (let x=-1; x<=cols; ++x) {
    dia[x] = [];
  }
  // Find domains of questions
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      // Skip questions and mines
      if (map[x][y] > 8) continue;
      // Skip other domains
      if (dia[x][y] > 0) continue;
      // Skip if no adjacent questions
      let qc = adjacent_count(map, x, y, 10);
      if (!qc) continue;
      // Init new domain
      ++did;
      ra = [];
      qa = [];
      add_rule(did, x, y);
      // Skip scan if nothing detected
      if (!qa.length) continue;
      get_links();
      init_scan();
      console.log("SAS scan started for domain:", did, map);
      if (sas_scan()) return 1;
      //console.log(ra, qa);
    }
  }
  return 0;
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
  let res = open(x, y);
  if (res === 'x') map[x][y] = 9;
  if (res === '?') map[x][y] = 10;
  else map[x][y] = parseInt(res);
  simple_solve_square(x, y);
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

function solveMine(imap, n){
  mines = n;
  // Load
  let sa = imap.split("\n");
  cols = sa.length;
  // Add pre-column and post-column
  map[-1] = [];
  map[cols] = [];
  for (let x=0; x<cols; ++x) {
    let sa2 = sa[x].split(" ");
    rows = sa2.length;
    map[x] = [];
    for (let y=0; y<rows; ++y) {
      if (sa2[y] === '?') map[x][y] = 10;
      else if (sa2[y] === 'x') map[x][y] = 9;
      else map[x][y] = parseInt(sa2[y]);
    }
  }
  console.log(map);
  // Init map_sas
  map_sas = [];
  for (let x=-1; x<=cols; ++x) {
    map_sas[x] = [];
  }
  for (let x=0; x<cols; ++x) {
    for (let y = 0; y < rows; ++y) {
      map_sas[x][y] = 0;
    }
  }
  // Solve
  for (;;) {
    let res = simple_solve();
    if (!res) {
      let res2 = sas_solve();
      if (!res2) break;
    }
  }
  console.log("Errors:", test_errors, sas_aborts);
  // Save
  imap = "";
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      if (y) imap += " ";
      if (map[x][y] === 10) return '?';
      else if (map[x][y] === 9) imap += 'x';
      else imap += map[x][y];
    }
    if (x < cols - 1) imap += "\n";
  }
  return imap;
}

