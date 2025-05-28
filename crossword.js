// --- YOUR LATEST 16x20 GRID ---
// Make sure each row has 16 cells (dots or letters), separated by spaces!
const gridText = [
  ". . . . . . . . . . A N U P A M",
  ". . C . . . . . . . M . . . . .",
  ". . H . B A A D S H A H . . . .",
  ". J U H I . . . . . N . . . . .",
  ". . N . L O N D O N . . . . . .",
  ". . N . L . . . . . . . . . . .",
  ". . I . U . . . . M A N O J . .",
  ". . . . B . . . . . . . N . . .",
  ". S . . A . G . . P R I E T Y .",
  "K A V E R I A M M A . . T . . .",
  ". A . . B . N . . H . . W . . .",
  ". T . . E . G . . E . . O . . .",
  ". H . . R . A . . L . . K T V .",
  ". I . . . . . . . I . . A . . .",
  ". Y . . G . . . . . . . F . . .",
  "S A G A R I K A . . . . O . . .",
  ". . . . E . . K . . . . U . . .",
  ". . . . E . . I . . A M R I T A",
  ". . . . C . . R . . . . . . . .",
  ". . . H E Y R A M . . . . . . ."
];

// Parse grid as 16x20
const grid = gridText.map(row => row.trim().split(/\s+/));
const ROWS = 20;
const COLS = 16;

const cluesList = [
  // Across
  ["ANUPAM", "Actor who plays his father when he's Raj, and again when he's Kishanlal (6)"],
  ["CHUNNI", "\"Apne hisse ki zindagi toh hum jee chuke______ Babu,\" (6)"],
  ["BAADSHAH", "Film where he throws walnut on mirror to prove he's not in love (8)"],
  ["JUHI", "When he doesn't end up with Anna, this actress makes a cameo at the end (4)"],
  ["LONDON", "Maya, aka Pooja’s fiancé, lives here (6)"],
  ["MANOJ", "Zaara's fiancé; the actor (5)"],
  ["PRIETY", "When he's Amar they almost get married, as Dev they're getting divorced; the actress (6)"],
  ["KAVERIAMMA", "Mohan has come to India after many years for her (6,4)"],
  ["KTV", "As Ajay Bakshi, he works for this channel (3)"],
  ["SAGARIKA", "Actress who plays Preeti Sabarwal, and actually married a cricketer IRL (7)"],
  ["HEYRAM", "His Tamil debut (6)"],
  // Down
  ["AMAN", "As this character he says 'Yeh woh Geeta nahi hai jiske do gande gande bache hai?' (4)"],
  ["PAHELI", "Sunil Shetty is his absent brother in this film (6)"],
  ["BILLUBARBER", "Remake of a Malayalam film, loosely based on Krishna and Sudama (5,6)"],
  ["ONETWOKAFOUR", "Osaka Moraiya movie (3,3,2,4)"],
  ["AMRITA", "General Bakshi sends him to Darjeeling to protect her; the actress (6)"],
  ["SAATHIYA", "He plays Tabu's husband in this film (8)"],
  ["GANGA", "His 'Mehbooba', who shares her name with a river (5)"],
  ["GREECE", "He follows Priya to this country because he didn't want to say 'Kaash' (6)"],
  ["AKIRA", "Taani partner actress plays this character in Ladakh (5)"]
];

// --- AUTO-DETECT WORDS IN GRID ---
function isWhite(r, c) { return grid[r] && grid[r][c] && grid[r][c] !== "."; }
function findWordsAndNumbering() {
  let num = 1;
  const numbering = Array.from({length: ROWS}, () => Array(COLS).fill(0));
  const across = [], down = [];
  const used = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!isWhite(r, c)) continue;
      let isStartAcross = (c === 0 || !isWhite(r, c-1)) && (c+1 < COLS && isWhite(r, c+1));
      let isStartDown   = (r === 0 || !isWhite(r-1, c)) && (r+1 < ROWS && isWhite(r+1, c));
      if (isStartAcross || isStartDown) numbering[r][c] = num++;
      // Across
      if (isStartAcross) {
        let len = 1;
        while (c+len < COLS && isWhite(r, c+len)) len++;
        let answer = grid[r].slice(c, c+len).join('');
        let idx = cluesList.findIndex(([ans]) => ans === answer);
        if (idx !== -1 && !used["A"+r+","+c]) {
          across.push({num: numbering[r][c], row: r, col: c, answer, clue: cluesList[idx][1], dir: 'across'});
          used["A"+r+","+c] = true;
        }
      }
      // Down
      if (isStartDown) {
        let len = 1;
        let answer = '';
        while (r+len < ROWS && isWhite(r+len, c)) len++;
        for (let i = 0; i < len; i++) answer += grid[r+i][c];
        let idx = cluesList.findIndex(([ans]) => ans === answer);
        if (idx !== -1 && !used["D"+r+","+c]) {
          down.push({num: numbering[r][c], row: r, col: c, answer, clue: cluesList[idx][1], dir: 'down'});
          used["D"+r+","+c] = true;
        }
      }
    }
  }
  return {across, down, numbering};
}
const {across, down, numbering} = findWordsAndNumbering();

// --- RENDER GRID ---
const crossword = document.getElementById('crossword');
const cellRefs = [];
for (let r = 0; r < ROWS; r++) {
  cellRefs[r] = [];
  for (let c = 0; c < COLS; c++) {
    const ch = grid[r][c];
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell' + (ch === '.' ? ' block' : '');
    cellDiv.style.position = 'relative';

    let input = null;
    if (ch !== ".") {
      input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'cell-input';
      input.disabled = false;
      input.dataset.row = r;
      input.dataset.col = c;
      cellDiv.appendChild(input);

      // Attach events to the input
      input.addEventListener('focus', onCellFocus);
      input.addEventListener('keydown', onCellKeyDown);
      input.addEventListener('input', onCellInput);
      input.addEventListener('click', onCellClick);
    }

    // Add clue number if this cell starts a word
    const num = numbering[r][c];
    if (num) {
      const span = document.createElement('span');
      span.className = 'cell-number';
      span.textContent = num;
      cellDiv.appendChild(span);
    }

    crossword.appendChild(cellDiv);
    cellRefs[r][c] = input; // store the input, not the cellDiv!
  }
}

// --- UX STATE ---
let selected = null;
let lastCell = null;

// --- CLUE RENDERING AND INTERACTION ---
function renderClues() {
  const acrossDiv = document.getElementById('acrossClues');
  const downDiv = document.getElementById('downClues');
  acrossDiv.innerHTML = '';
  downDiv.innerHTML = '';
  across.forEach((w, i) => {
    const div = document.createElement('div');
    div.className = 'clue';
    div.innerHTML = `<b>${w.num}.</b> ${w.clue}`;
    div.onclick = () => selectWord(w, 0, 'across');
    acrossDiv.appendChild(div);
  });
  down.forEach((w, i) => {
    const div = document.createElement('div');
    div.className = 'clue';
    div.innerHTML = `<b>${w.num}.</b> ${w.clue}`;
    div.onclick = () => selectWord(w, 0, 'down');
    downDiv.appendChild(div);
  });
}
renderClues();

function clearHighlights() {
  document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('highlight', 'current'));
  document.querySelectorAll('.clue').forEach(clue => clue.classList.remove('active'));
}
function highlightWord(word, idx, dir) {
  clearHighlights();
  for (let i = 0; i < word.answer.length; i++) {
    let rr = word.row + (dir === 'down' ? i : 0);
    let cc = word.col + (dir === 'across' ? i : 0);
    const cellDiv = cellRefs[rr][cc]?.parentNode;
    if (cellDiv) cellDiv.classList.add('highlight');
  }
  let rr = word.row + (dir === 'down' ? idx : 0);
  let cc = word.col + (dir === 'across' ? idx : 0);
  const cellDiv = cellRefs[rr][cc]?.parentNode;
  if (cellDiv) cellDiv.classList.add('current');
  // Highlight clue
  let clues = dir === 'across' ? document.querySelectorAll('#acrossClues .clue') : document.querySelectorAll('#downClues .clue');
  let clueIdx = (dir === 'across' ? across : down).findIndex(w => w === word);
  if (clues[clueIdx]) clues[clueIdx].classList.add('active');
}

function selectWord(word, idx, dir) {
  selected = {word, idx, dir};
  highlightWord(word, idx, dir);
  let rr = word.row + (dir === 'down' ? idx : 0);
  let cc = word.col + (dir === 'across' ? idx : 0);
  cellRefs[rr][cc].focus();
  lastCell = cellRefs[rr][cc];
}

function onCellFocus(e) {
  const input = e.target;
  const r = +input.dataset.row, c = +input.dataset.col;
  let wordAcross = across.find(w => w.row === r && c >= w.col && c < w.col + w.answer.length);
  let wordDown = down.find(w => w.col === c && r >= w.row && r < w.row + w.answer.length);
  let dir = selected && selected.dir === 'down' && wordDown ? 'down' : 'across';
  let idx = dir === 'across' && wordAcross ? c - wordAcross.col : (wordDown ? r - wordDown.row : 0);
  let word = dir === 'across' ? wordAcross : wordDown;
  if (!word) word = wordAcross || wordDown;
  if (!word) return;
  selectWord(word, idx, word === wordAcross ? 'across' : 'down');
  lastCell = input;
}
function onCellClick(e) {
  const input = e.target;
  const r = +input.dataset.row, c = +input.dataset.col;
  let wordAcross = across.find(w => w.row === r && c >= w.col && c < w.col + w.answer.length);
  let wordDown = down.find(w => w.col === c && r >= w.row && r < w.row + w.answer.length);
  if (selected && lastCell === input && wordAcross && wordDown) {
    let dir = selected.dir === 'across' ? 'down' : 'across';
    let word = dir === 'across' ? wordAcross : wordDown;
    let idx = dir === 'across' ? c - word.col : r - word.row;
    selectWord(word, idx, dir);
  }
  lastCell = input;
}
function onCellInput(e) {
  const input = e.target;
  let val = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0,1);
  input.value = val;
  if (!selected) return;
  let {word, idx, dir} = selected;
  let nextIdx = idx + 1;
  if (nextIdx < word.answer.length) {
    let rr = word.row + (dir === 'down' ? nextIdx : 0);
    let cc = word.col + (dir === 'across' ? nextIdx : 0);
    let nextInput = cellRefs[rr][cc];
    if (nextInput) {
      nextInput.focus();
      selectWord(word, nextIdx, dir);
    }
  }
}
function onCellKeyDown(e) {
  if (!selected) return;
  let {word, idx, dir} = selected;
  if (e.key === "Backspace") {
    if (cellRefs[word.row + (dir === 'down' ? idx : 0)][word.col + (dir === 'across' ? idx : 0)].value === "") {
      if (idx > 0) {
        let prevIdx = idx - 1;
        let rr = word.row + (dir === 'down' ? prevIdx : 0);
        let cc = word.col + (dir === 'across' ? prevIdx : 0);
        cellRefs[rr][cc].focus();
        selectWord(word, prevIdx, dir);
      }
    }
  } else if (e.key === "ArrowRight" || (e.key === "Tab" && dir === 'across')) {
    e.preventDefault();
    if (dir === 'across' && idx < word.answer.length - 1) {
      let rr = word.row;
      let cc = word.col + idx + 1;
      cellRefs[rr][cc].focus();
      selectWord(word, idx + 1, dir);
    }
  } else if (e.key === "ArrowLeft") {
    if (dir === 'across' && idx > 0) {
      let rr = word.row;
      let cc = word.col + idx - 1;
      cellRefs[rr][cc].focus();
      selectWord(word, idx - 1, dir);
    }
  } else if (e.key === "ArrowDown" || (e.key === "Tab" && dir === 'down')) {
    e.preventDefault();
    if (dir === 'down' && idx < word.answer.length - 1) {
      let rr = word.row + idx + 1;
      let cc = word.col;
      cellRefs[rr][cc].focus();
      selectWord(word, idx + 1, dir);
    }
  } else if (e.key === "ArrowUp") {
    if (dir === 'down' && idx > 0) {
      let rr = word.row + idx - 1;
      let cc = word.col;
      cellRefs[rr][cc].focus();
      selectWord(word, idx - 1, dir);
    }
  }
}

// --- CONTROLS ---
function clearGrid() {
  document.querySelectorAll('.cell-input').forEach(input => { if (!input.disabled) input.value = ''; });
  document.getElementById('status').textContent = '';
}
function checkAnswers() {
  let correct = 0, total = 0;
  [...across, ...down].forEach(w => {
    let user = '';
    for (let i = 0; i < w.answer.length; i++) {
      let rr = w.row + (w.dir === 'down' ? i : 0);
      let cc = w.col + (w.dir === 'across' ? i : 0);
      user += cellRefs[rr][cc].value || ' ';
    }
    total++;
    if (user.trim().toUpperCase() === w.answer.toUpperCase()) correct++;
  });
  const status = document.getElementById('status');
  if (correct === total) {
    status.innerHTML = '🎉 All correct! Crossword solved! 🎉';
  } else {
    status.textContent = `${correct} / ${total} words correct.`;
  }
}
function revealAnswers() {
  [...across, ...down].forEach(w => {
    for (let i = 0; i < w.answer.length; i++) {
      let rr = w.row + (w.dir === 'down' ? i : 0);
      let cc = w.col + (w.dir === 'across' ? i : 0);
      cellRefs[rr][cc].value = w.answer[i];
    }
  });
  document.getElementById('status').innerHTML = '📖 All answers revealed!';
}
