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
// Number of hidden mines
let hidden_mines = 0;
// Single domain scan
let single_domain = 0;

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
  let sum = 0;
  for (let q = 0; q <= p; ++q) {
    sum += qv[q];
  }
  //console.log("Hidden mines", sum, hidden_mines);
  if (p === qa.length - 1 && single_domain) {
    if (sum !== hidden_mines) return 0;
  }
  else {
    if (sum > hidden_mines) return 0;
  }
  return 1;
}

function sas_scan() {
  //console.log(JSON.stringify(qa));
  let cycle = 0;
  let finished = 0;
  for (;;) {
    let need_skip = 1;
    let good = check_rules();
    if (good) {
      if (p === qa.length - 1) {
        //console.log("Good:", qv, p);
        for (let q = 0; q < qa.length; ++q) {
          ++qpos[qv[q]][q];
        }
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
      map_sas[x][y] = single_domain + 1;
      my_open(x, y);
      ++res;
    }
    // Set mine if empty is not possible
    else if (!qpos[0][q] && qpos[1][q]) {
      let x = qa[q].x;
      let y = qa[q].y;
      map_sas[x][y] = single_domain + 1;
      map[x][y] = 9;
      ++res;
    }
  }
  return res;
}

function get_hidden_mines() {
  let visible_mines = 0;
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      if (map[x][y] === 9) ++visible_mines;
    }
  }
  hidden_mines = mines - visible_mines;
}

function sas_solve(sd = 0) {
  single_domain = sd;
  // Clear
  did = 1;
  dia = [];
  for (let x=-1; x<=cols; ++x) {
    dia[x] = [];
  }
  ra = [];
  qa = [];
  get_hidden_mines();
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
      if (!single_domain) {
        ++did;
        ra = [];
        qa = [];
      }
      add_rule(did, x, y);
      if (!single_domain) {
        // Skip scan if nothing detected
        if (!qa.length) continue;
        get_links();
        init_scan();
        console.log("SAS scan started for domain:", did, single_domain);
        if (sas_scan()) {
          return 1;
        }
      }
      //console.log(ra, qa);
    }
  }
  if (single_domain) {
    // Skip scan if nothing detected
    if (!qa.length) return 0;
    get_links();
    init_scan();
    console.log("SAS scan started for domain:", did, single_domain);
    if (sas_scan()) {
      return 1;
    }
  }
  return 0;
}

