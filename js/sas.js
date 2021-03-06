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
// Total questions left
let total_q = 0;
// Total sas results
let total_sas = 0;
// If sas scan is in progress
let sas_in_progress = 0;
// Current sas cycle
let sas_cycle = 0;
// Sas progress
let sas_progress = 0;

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

function add_q(did, x, y) {
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
  console.log("add_q", x, y);
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
  // Find exact number of mines of number of scanned questions equals all questions
  if (p === qa.length - 1 && qa.length === total_q) {
    if (sum !== hidden_mines) return 0;
  }
  else {
    if (sum > hidden_mines) return 0;
  }
  return 1;
}

function sas_scan() {
  for (;;) {
    let need_skip = 1;
    let good = check_rules();
    if (good) {
      if (p === qa.length - 1) {
        //console.log("Good:", JSON.stringify(qv), p, JSON.stringify(ra), JSON.stringify(qa));
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
          sas_in_progress = 0;
          break;
        }
        // Move left one element
        --p
      }
      qv[p] = 1;
    }
    if (!sas_in_progress) break;
    ++sas_cycle;
    if (sas_cycle > 10000000000) {
      console.log("Aborting");
      ++sas_aborts;
      break;
    }
    if (single_domain && sas_cycle % 10000 === 0) {
      let time = new Date();
      let progress = Math.floor(time / 200);
      if (progress > sas_progress) {
        sas_progress = progress;
        let canvas = document.getElementById("sas_progress");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let q = 0; q < qa.length; ++q) {
          if (q > p) {
            ctx.fillStyle = "#bbbbbb";
          }
          else if (qv[q]) {
            ctx.fillStyle = "#00ff00";
          }
          else {
            ctx.fillStyle = "#0000ff";
          }
          ctx.fillRect(0, q, 4, 1);
        }
        //console.log("Restarting sas cycle");
        return 0;
      }
    }
  }
  if (!sas_in_progress) {
    return sas_open();
  }
  else {
    sas_in_progress = 0;
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

function get_stats() {
  let visible_mines = 0;
  total_q = 0;
  total_sas = 0;
  for (let x=0; x<cols; ++x) {
    for (let y=0; y<rows; ++y) {
      if (map[x][y] === 9) ++visible_mines;
      if (map[x][y] === 10) ++total_q;
      if (map_sas[x][y]) ++total_sas;
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
  get_stats();
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
        //console.log(JSON.stringify(qa));
        sas_cycle = 0;
        sas_in_progress = 1;
        if (sas_scan()) return 1;
      }
      //console.log(ra, qa);
    }
  }
  if (single_domain) {
    // Add all questions
    if (single_domain === 2) {
      for (let x = 0; x < cols; ++x) {
        for (let y = 0; y < rows; ++y) {
          // Process only questions
          if (map[x][y] !== 10) continue;
          // Skip already in domain
          if (dia[x][y] > 0) continue;
          add_q(did, x, y);
        }
      }
    }
    // Skip scan if nothing detected
    if (!qa.length) return 0;
    // Skip scan if not all questions are being scanned
    //if (qa.length !== total_q) return 0;
    get_links();
    init_scan();
    console.log("SAS full scan started for domain:", did, single_domain);
    //console.log(JSON.stringify(qa));
    sas_cycle = 0;
    sas_in_progress = 1;
  }
  return 0;
}
