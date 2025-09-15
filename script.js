// Coin Collect v2 - Mode-based max levels: Easy=5, Medium=10, Hard=15
let timer = 0;
let points = 0;
let timerInterval = null;
let spawnInterval = null;
let gameStarted = false;
let currentLevel = 1;
let timeLimit = 15;
let targetPoints = 30;
let mode = 'Easy';
let maxLevel = 5;

// UI refs
const timerDisplay = document.getElementById('timer');
const pointsDisplay = document.getElementById('points');
const levelLabel = document.getElementById('levelLabel');
const puzzleContainer = document.getElementById('puzzleContainer');
const messageEl = document.getElementById('message');

const startDiv = document.getElementById('startDiv');
const levelSelect = document.getElementById('levelSelect');
const gameUI = document.getElementById('gameUI');

const startBtn = document.getElementById('startBtn');
const startAgainBtn = document.getElementById('startAgainBtn');
const stopBtn = document.getElementById('stopBtn');
const backBtn = document.getElementById('backBtn');
const backToStart = document.getElementById('backToStart');
const levelButtons = document.querySelectorAll('#levelSelect button[data-mode]');

// helper update UI
function updateInfo(){
  timerDisplay.textContent = timer;
  pointsDisplay.textContent = points;
  levelLabel.textContent = currentLevel;
}

// configure selected mode
function setMode(selected){
  mode = selected;
  if(mode === 'Easy'){ maxLevel=5; timeLimit=15; targetPoints=30; }
  else if(mode === 'Medium'){ maxLevel=10; timeLimit=30; targetPoints=60; }
  else { maxLevel=15; timeLimit=40; targetPoints=80; }
  currentLevel = 1;
  updateInfo();
}

// spawn many coins quickly (burst)
function startSpawning(){
  clearInterval(spawnInterval);
  const baseRate = Math.max(120, 300 - currentLevel * 20);
  spawnInterval = setInterval(()=> spawnBurst(), baseRate);
  spawnBurst();
}

function spawnBurst(){
  if(!gameStarted) return;
  const rect = puzzleContainer.getBoundingClientRect();
  const burstCount = 8 + currentLevel * 3;
  for(let i=0;i<burstCount;i++){
    const t = document.createElement('div');
    t.className = 'target';
    t.textContent = 'XAN';
    const size = Math.max(36, Math.min(72, Math.floor(Math.random()*36)+36));
    t.style.width = t.style.height = size + 'px';
    const maxX = Math.max(0, rect.width - size);
    const maxY = Math.max(0, rect.height - size);
    t.style.left = Math.random()*maxX + 'px';
    t.style.top = Math.random()*maxY + 'px';
    const tapped = (e)=>{ e && e.preventDefault && e.preventDefault(); if(!gameStarted) return; points++; updateInfo(); t.remove(); checkWin(); };
    t.addEventListener('click', tapped);
    t.addEventListener('touchstart', tapped, {passive:false});
    const life = Math.max(700, 2000 - currentLevel*120 - Math.random()*700);
    setTimeout(()=> t.remove(), life);
    puzzleContainer.appendChild(t);
  }
}

// clear coins
function clearTargets(){ puzzleContainer.innerHTML = ''; }

// timers
function startTimers(){
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if(!gameStarted) return;
    if(timer < timeLimit){ timer++; updateInfo(); if(timer >= timeLimit) onTimeUp(); }
  },1000);
}
function stopTimers(){ clearInterval(timerInterval); clearInterval(spawnInterval); timerInterval=null; spawnInterval=null; }

// start round
function startGameRound(lv){
  currentLevel = lv;
  messageEl.textContent = '';
  document.body.classList.remove('win-bg','bg-easy','bg-medium','bg-hard');
  if(mode==='Easy') document.body.classList.add('bg-easy');
  else if(mode==='Medium') document.body.classList.add('bg-medium');
  else document.body.classList.add('bg-hard');
  points = 0; timer = 0; updateInfo(); clearTargets(); gameStarted=true; startTimers(); startSpawning();
}

// win logic: increase difficulty and level up until maxLevel
function checkWin(){ if(points >= targetPoints) onWin(); }
function onWin(){
  stopTimers(); gameStarted=false; messageEl.textContent='🏆 You Win! Level Up...'; document.body.classList.add('win-bg');
  // increase time & target by mode rules
  if(mode==='Easy'){ timeLimit +=5; targetPoints +=5; }
  else if(mode==='Medium'){ timeLimit +=5; targetPoints +=10; }
  else { timeLimit +=10; targetPoints +=20; }
  // level up
  currentLevel++;
  if(currentLevel > maxLevel){
    messageEl.textContent = `🎉 You completed ${mode} mode!`;
    return;
  }
  clearTargets();
  setTimeout(()=>{ startGameRound(currentLevel); }, 900);
}

// time up
function onTimeUp(){ stopTimers(); gameStarted=false; messageEl.textContent='💀 Game Over! Time Up.'; clearTargets(); }

// navigation
function goBackToStart(){ stopTimers(); gameStarted=false; clearTargets(); messageEl.textContent=''; levelSelect.style.display='none'; gameUI.style.display='none'; startDiv.style.display='flex'; }
function goBackToModes(){ stopTimers(); gameStarted=false; clearTargets(); messageEl.textContent=''; gameUI.style.display='none'; levelSelect.style.display='flex'; startDiv.style.display='none'; }

// UI bindings
startBtn.addEventListener('click', ()=>{ startDiv.style.display='none'; levelSelect.style.display='flex'; });
backToStart.addEventListener('click', ()=>{ levelSelect.style.display='none'; startDiv.style.display='flex'; });
levelButtons.forEach(b=> b.addEventListener('click', (e)=>{ const m = e.currentTarget.dataset.mode; setMode(m); levelSelect.style.display='none'; gameUI.style.display='block'; startGameRound(1); }));
stopBtn.addEventListener('click', ()=>{ if(gameStarted) { gameStarted=false; stopTimers(); messageEl.textContent='⏸ Game Paused'; } });
startAgainBtn.addEventListener('click', ()=>{ if(!gameStarted && timer < timeLimit){ gameStarted=true; messageEl.textContent=''; startTimers(); startSpawning(); } });
backBtn.addEventListener('click', ()=> goBackToModes());

// keyboard & touch
document.addEventListener('keydown',(e)=>{ if(e.code==='Space'){ e.preventDefault(); if(gameStarted){ gameStarted=false; stopTimers(); messageEl.textContent='⏸ Game Paused'; } else if(timer < timeLimit){ gameStarted=true; messageEl.textContent=''; startTimers(); startSpawning(); } } else if(e.code==='Escape'){ goBackToModes(); } });
puzzleContainer.addEventListener('click',(e)=>{ if(e.target === puzzleContainer){ if(gameStarted){ gameStarted=false; stopTimers(); messageEl.textContent='⏸ Game Paused'; } else if(timer < timeLimit){ gameStarted=true; messageEl.textContent=''; startTimers(); startSpawning(); } } });
puzzleContainer.addEventListener('touchstart',(e)=>{ if(e.target === puzzleContainer){ if(gameStarted){ gameStarted=false; stopTimers(); messageEl.textContent='⏸ Game Paused'; } else if(timer < timeLimit){ gameStarted=true; messageEl.textContent=''; startTimers(); startSpawning(); } } }, {passive:false});

updateInfo();
