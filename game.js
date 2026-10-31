// ============================================================
//  SKATE PARKOUR - 1000 Níveis + Loja de16 Skins! 🛹
// ============================================================
//  CONTROLOS:
//    LOJA (ecrã inicial):
//      ← →     escolher skin
//      ENTER   comprar ou equipar
//      ESPAÇO  jogar
//    DURANTE O JOGO:
//      ← →     mover    |  ESPAÇO saltar / sair do rail
//      X kickflip  |  C heelflip  |  Z shove-it
//      F       ecrã inteiro
//      ENTER   voltar à loja
//
//  PROGRESSO:
//    • A cada 500 pontos sobes 1 nível (máx. nível 1000)
//    • O progresso é SALVO quando morres, quando mudas de
//      separador e quando fechas o jogo. Nunca se perde!
// ============================================================

// ---------- 1. O ECRÃ ----------
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ---------- 2. CONSTANTES ----------
const GROUND_Y = 360;              // chão no ecrã (ecrã agora tem 500 de altura)
const GRAVITY = 0.55;
const JUMP_VY = -12.5;
const START_SPEED = 3;             // devagar no início
const MAX_SPEED = 9.5;             // rápido só nos níveis altos
const POINTS_PER_LEVEL = 500;      // 500 pontos = 1 nível
const MAX_LEVEL = 1000;            // ★ os1000 níveis!
const PLAYER_W = 36;
const PLAYER_H = 48;

// ---------- 3. AS16 SKINS (diferença de300 pontos) ----------
// A primeira é grátis! Depois:150, 450, 750, 1050...
const SKINS = [
  { id: "classico", name: "CLÁSSICO", price: 0,
    shirt: "#00b894", helmet: "#e84393", pants: "#2d3436",
    deck: "#6c5ce7", deckLight: "#a29bfe", wheels: "#ffd166" },
  { id: "fogo", name: "FOGO", price: 150,
    shirt: "#e74c3c", helmet: "#e67e22", pants: "#34495e",
    deck: "#c0392b", deckLight: "#e74c3c", wheels: "#ffdd59" },
  { id: "oceano", name: "OCEANO", price: 450,
    shirt: "#0984e3", helmet: "#74b9ff", pants: "#2d3436",
    deck: "#00cec9", deckLight: "#81ecec", wheels: "#dfe6e9" },
  { id: "ninja", name: "NINJA", price: 750,
    shirt: "#2d3436", helmet: "#00b894", pants: "#1e272e",
    deck: "#2d3436", deckLight: "#57606f", wheels: "#00b894" },
  { id: "punk", name: "PUNK", price: 1050,
    shirt: "#e84393", helmet: "#2d3436", pants: "#6c5ce7",
    deck: "#fd79a8", deckLight: "#fab1a0", wheels: "#2d3436" },
  { id: "ouro", name: "OURO", price: 1350,
    shirt: "#f6b93b", helmet: "#ffe066", pants: "#b8860b",
    deck: "#f9ca24", deckLight: "#fdd835", wheels: "#ffffff" },
  { id: "galaxia", name: "GALÁXIA", price: 1650,
    shirt: "#6c5ce7", helmet: "#a29bfe", pants: "#341f97",
    deck: "#341f97", deckLight: "#6c5ce7", wheels: "#fd79a8" },
  { id: "fantasma", name: "FANTASMA", price: 1950,
    shirt: "#dfe6e9", helmet: "#b2bec3", pants: "#636e72",
    deck: "#b2bec3", deckLight: "#dfe6e9", wheels: "#ffffff" },
  { id: "gelo", name: "GELO", price: 2250,
    shirt: "#74b9ff", helmet: "#dfe6e9", pants: "#0984e3",
    deck: "#81ecec", deckLight: "#dfe6e9", wheels: "#ffffff" },
  { id: "lava", name: "LAVA", price: 2550,
    shirt: "#d63031", helmet: "#2d3436", pants: "#1e272e",
    deck: "#e17055", deckLight: "#fab1a0", wheels: "#2d3436" },
  { id: "slime", name: "SLIME", price: 2850,
    shirt: "#00b894", helmet: "#55efc4", pants: "#2d3436",
    deck: "#00cec9", deckLight: "#55efc4", wheels: "#2d3436" },
  { id: "rosa", name: "ROSA", price: 3150,
    shirt: "#fd79a8", helmet: "#ffe0e6", pants: "#e84393",
    deck: "#fd79a8", deckLight: "#ffe0e6", wheels: "#ffffff" },
  { id: "dragao", name: "DRAGÃO", price: 3450,
    shirt: "#6d213a", helmet: "#f6b93b", pants: "#2d3436",
    deck: "#b33939", deckLight: "#e58e26", wheels: "#f6b93b" },
  { id: "space", name: "ESPAÇO", price: 3750,
    shirt: "#0c2461", helmet: "#e84393", pants: "#192a56",
    deck: "#30336b", deckLight: "#4834d4", wheels: "#ffdd59" },
  { id: "arcoiris", name: "ARCO-ÍRIS", price: 4050,
    shirt: "#a29bfe", helmet: "#55efc4", pants: "#fd79a8",
    deck: "#ffe066", deckLight: "#ff9f43", wheels: "#74b9ff" },
  { id: "demonio", name: "DEMÓNIO", price: 4350,
    shirt: "#2d3436", helmet: "#d63031", pants: "#1a1a2e",
    deck: "#b71515", deckLight: "#e74c3c", wheels: "#d63031" }
];

// ---------- 4. GUARDAR O PROGRESSO ----------
// save.totalPoints = pontos totais de sempre (dá os níveis, nunca diminui)
// save.coins      = pontos que podes GASTAR na loja
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem("skateparkour_save"));
    if (s && Array.isArray(s.owned)) {
      // Jogos antigos não tinham totalPoints — criar
      if (typeof s.totalPoints !== "number") s.totalPoints = 0;
      if (typeof s.coins !== "number") s.coins = 0;
      if (typeof s.best !== "number") s.best = 0;
      return s;
    }
  } catch (e) {}
  return { best: 0, coins: 0, totalPoints: 0, owned: ["classico"], skin: "classico" };
}
let save = loadSave();

// Recorde antigo (versão sem loja), se existir
try {
  const old = Number(localStorage.getItem("skateparkour_recorde")) || 0;
  if (old > save.best) save.best = old;
} catch (e) {}

function persist() {
  save.best = best;
  try { localStorage.setItem("skateparkour_save", JSON.stringify(save)); } catch (e) {}
}

// Guardar automaticamente ao FECHAR o jogo / mudar de separador
window.addEventListener("beforeunload", () => persist());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) persist();
});

function currentSkin() {
  return SKINS.find(s => s.id === save.skin) || SKINS[0];
}

// ★ O nível atual: 500 pontos = 1 nível, máximo1000
function currentLevel() {
  return Math.min(MAX_LEVEL, 1 + Math.floor(save.totalPoints / POINTS_PER_LEVEL));
}

// ---------- 5. ESTADO DO JOGO ----------
let state = "start";         // "start" (loja) | "playing" | "over"
let cam = 0;
let speed = START_SPEED;
let score = 0;               // pontos da PARTIDA atual
let combo = 1;
let level = 1;
let levelBanner = 0;
let deathReason = "";
let frame = 0;
let best = save.best;
let sinceSave = 0;           // contador para guardar de vez em quando
let selectedSkin = Math.max(0, SKINS.findIndex(s => s.id === save.skin));

let shopMsg = "";
let shopMsgColor = "#fff";
let shopMsgTimer = 0;

const player = {
  x: 150, y: GROUND_Y - PLAYER_H,
  vy: 0,
  onGround: true,
  grinding: false,
  rail: null,
  trick: null,
  usedTricks: new Set()
};

let platforms = [];
let cones = [];
let boxes = [];
let rails = [];
let particles = [];
let floats = [];
let lastGenX = 0;

// ---------- 6. SOM ----------
let audio = null;
function beep(freq, dur, type = "square", vol = 0.05) {
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudio)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + dur);
  } catch (e) { /* sem som, mas o jogo funciona */ }
}

// ---------- 7. ECRÃ INTEIRO ----------
function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  } catch (e) { /* alguns browsers podem bloquear */ }
}
document.getElementById("fsBtn").addEventListener("click", toggleFullscreen);

// ---------- 8. TECLAS ----------
const keys = {};
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  // F = ecrã inteiro (em qualquer ecrã)
  if (e.key.toLowerCase() === "f" && !e.ctrlKey && !e.metaKey && !e.repeat) {
    toggleFullscreen();
    return;
  }

  // --- LOJA ---
  if (state === "start" && !e.repeat) {
    if (e.key === "ArrowLeft") {
      selectedSkin = (selectedSkin + SKINS.length - 1) % SKINS.length;
      beep(400, 0.05);
    }
    if (e.key === "ArrowRight") {
      selectedSkin = (selectedSkin + 1) % SKINS.length;
      beep(400, 0.05);
    }
    if (e.key === "Enter") buyOrEquip();
  }

  // --- NAVEGAR NA LOJA TAMBÉM COM ↑ ↓ (para as4 linhas) ---
  if (state === "start" && !e.repeat &&
      (e.key === "ArrowUp" || e.key === "ArrowDown")) {
    selectedSkin = (selectedSkin + 4) % SKINS.length;  // pula16 = uma coluna
    beep(400, 0.05);
  }

  // --- JOGAR / VOLTAR ---
  if (e.key === " " && state === "start") startGame();
  if ((e.key === "Enter" || e.key === " ") && state === "over") returnToShop();

  // --- TRUQUES ---
  if (state === "playing") handleTrickKey(e.key.toLowerCase());
});
document.addEventListener("keyup", (e) => { keys[e.key] = false; });

function buyOrEquip() {
  const s = SKINS[selectedSkin];
  if (save.owned.includes(s.id)) {
    save.skin = s.id;
    persist();
    shopSay(`SKIN "${s.name}" EQUIPADA!`, "#74b9ff");
    beep(600, 0.1, "triangle");
  } else if (save.coins >= s.price) {
    save.coins -= s.price;
    save.owned.push(s.id);
    save.skin = s.id;
    persist();
    shopSay(`COMPRASTE "${s.name}"! 🎉`, "#55efc4");
    beep(880, 0.15, "triangle");
    beep(1100, 0.2, "triangle");
  } else {
    shopSay(`FALTAM ${Math.ceil(s.price - save.coins)} PONTOS! JOGA MAIS 🛹`, "#ff6b6b");
    beep(180, 0.25, "sawtooth");
  }
}

function shopSay(text, color) {
  shopMsg = text;
  shopMsgColor = color;
  shopMsgTimer = 150;
}

function handleTrickKey(k) {
  if (player.trick) return;
  if (player.usedTricks.has(k)) return;
  const tricks = {
    x: { name: "KICKFLIP", pts: 50,  type: "flip" },
    c: { name: "HEELFLIP", pts: 50,  type: "flip" },
    z: { name: "SHOVE-IT", pts: 100, type: "shove" }
  };
  const t = tricks[k];
  if (!t) return;
  player.usedTricks.add(k);
  player.trick = { ...t, t: 0, dur: 16 };
  beep(600, 0.08, "triangle");
}

// ---------- 9. GERAR O MUNDO ----------
function generate() {
  while (lastGenX < cam + canvas.width + 400) {
    const pw = 220 + Math.random() * 220;
    platforms.push({ x: lastGenX, w: pw });

    const from = lastGenX + 90;
    const to = lastGenX + pw - 90;
    if (to - from > 110) {
      const r = Math.random();
      const spot = () => from + Math.random() * (to - from);
      if (r < 0.3) {
        cones.push({ x: spot() });
        // Níveis altos: às vezes dois cones juntos
        if (Math.random() < Math.min(0.5, level * 0.01)) cones.push({ x: spot() });
      } else if (r < 0.55) {
        boxes.push({ x: spot() });
      } else if (r < 0.85 && pw > 280) {
        rails.push({ x: from, y: GROUND_Y - 70, w: Math.min(180, to - from) });
      }
    }

    // Buracos maiores nos níveis altos (sempre saltáveis!)
    lastGenX += pw + 60 + Math.random() * 50 + Math.min(level, 120) * 0.7;
  }
}

function cleanup() {
  const limit = cam - 300;
  platforms = platforms.filter(p => p.x + p.w > limit);
  cones = cones.filter(c => c.x > limit);
  boxes = boxes.filter(b => b.x > limit);
  rails = rails.filter(r => r.x + r.w > limit);
}

// ---------- 10. COMEÇAR E ACABAR ----------
function startGame() {
  state = "playing";
  cam = 0;
  speed = START_SPEED;
  score = 0;
  combo = 1;
  level = currentLevel();     // continuas no TEU nível!
  levelBanner = 0;
  platforms = []; cones = []; boxes = []; rails = [];
  particles = []; floats = [];
  lastGenX = 0;
  generate();
  player.x = 150;
  player.y = GROUND_Y - PLAYER_H;
  player.vy = 0;
  player.onGround = true;
  player.grinding = false;
  player.rail = null;
  player.trick = null;
  player.usedTricks = new Set();
  beep(440, 0.1);
}

function gameOver(reason) {
  state = "over";
  deathReason = reason;
  const earned = Math.floor(score);
  if (earned > best) best = earned;
  persist();     // ★ progresso salvo na morte!
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: player.x + PLAYER_W / 2, y: player.y + PLAYER_H,
      vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.8) * 8,
      life: 40, color: Math.random() < 0.5 ? "#ff6b6b" : "#ffd166"
    });
  }
  beep(160, 0.4, "sawtooth", 0.08);
}

function returnToShop() {
  state = "start";
  levelBanner = 0;
  persist();
  selectedSkin = Math.max(0, SKINS.findIndex(s => s.id === save.skin));
  cam = 0;
  platforms = []; cones = []; boxes = []; rails = [];
  particles = []; floats = [];
  lastGenX = 0;
  level = currentLevel();
  generate();
  beep(440, 0.08);
}

function addFloat(text, x, y, color = "#ffd166") {
  floats.push({ text, x, y, life: 50, color });
}

// ---------- 11. ATUALIZAR ----------
function update() {
  frame++;
  if (shopMsgTimer > 0) shopMsgTimer--;

  if (state === "playing") {
    // --- Mover no ecrã ---
    if (keys["ArrowLeft"]) player.x -= 4;
    if (keys["ArrowRight"]) player.x += 4;
    player.x = Math.max(60, Math.min(340, player.x));

    // --- Mundo anda ---
    cam += speed;
    score += speed * 0.05;
    // ★ Pontos somam ao progresso TOTAL em tempo real
    //   (assim, se fechares o jogo a meio, nada se perde!)
    save.totalPoints += speed * 0.05;
    save.coins += speed * 0.05;

    // Guardar de vez em quando (a cada ~5 segundos)
    sinceSave++;
    if (sinceSave >= 300) { sinceSave = 0; persist(); }

    // --- Velocidade pelo nível (com tecto para não ficar impossível) ---
    speed = Math.min(MAX_SPEED, START_SPEED + (level - 1) * 0.05);

    // --- ★ SUBIR DE NÍVEL (500 pontos por nível) ---
    const newLevel = currentLevel();
    if (newLevel > level) {
      level = newLevel;
      levelBanner = 90;
      addFloat(level === MAX_LEVEL ? "NÍVEL MÁXIMO! 🏆" : `NÍVEL ${level}!`,
               player.x + PLAYER_W / 2, player.y - 30, "#74b9ff");
      beep(520 + Math.min(level, 40) * 6, 0.12, "triangle");
      beep(700 + Math.min(level, 40) * 6, 0.18, "triangle");
    }
    if (levelBanner > 0) levelBanner--;

    generate();
    cleanup();

    // --- Grind ---
    if (player.grinding) {
      const rail = player.rail;
      player.y = rail.y - PLAYER_H;
      player.vy = 0;
      score += 0.4;
      save.totalPoints += 0.4;
      save.coins += 0.4;
      if (frame % 3 === 0) {
        particles.push({
          x: player.x + PLAYER_W / 2, y: player.y + PLAYER_H,
          vx: -speed - Math.random() * 3, vy: -Math.random() * 3,
          life: 20, color: Math.random() < 0.5 ? "#ffd166" : "#ff9f43"
        });
      }
      if (keys[" "]) {
        player.grinding = false;
        player.rail = null;
        player.vy = JUMP_VY * 0.9;
        player.onGround = false;
        beep(500, 0.08, "triangle");
      }
      if (cam + player.x + PLAYER_W / 2 > rail.x + rail.w) {
        player.grinding = false;
        player.rail = null;
      }
    }

    // --- Física normal ---
    if (!player.grinding) {
      if (keys[" "] && player.onGround) {
        player.vy = JUMP_VY;
        player.onGround = false;
        player.usedTricks = new Set();
        beep(350, 0.1, "triangle");
      }

      const prevBottom = player.y + PLAYER_H;
      player.vy += GRAVITY;
      player.y += player.vy;

      const wl = cam + player.x + 5;
      const wr = cam + player.x + PLAYER_W - 5;
      const bottom = player.y + PLAYER_H;
      const falling = player.vy >= 0;

      let landed = false;

      if (falling) {
        for (const b of boxes) {
          const top = GROUND_Y - 40;
          if (wl < b.x + 40 && wr > b.x && prevBottom <= top + 8 && bottom >= top) {
            player.y = top - PLAYER_H;
            player.vy = 0;
            landed = true;
            combo = 1;
            cancelTrick();
            break;
          }
        }
        if (!landed) {
          for (const p of platforms) {
            if (wl < p.x + p.w && wr > p.x && prevBottom <= GROUND_Y + 8 && bottom >= GROUND_Y) {
              player.y = GROUND_Y - PLAYER_H;
              player.vy = 0;
              landed = true;
              combo = 1;
              cancelTrick();
              break;
            }
          }
        }
        if (!landed) {
          for (const r of rails) {
            if (wl < r.x + r.w && wr > r.x && prevBottom <= r.y + 10 && bottom >= r.y) {
              player.grinding = true;
              player.rail = r;
              player.y = r.y - PLAYER_H;
              player.vy = 0;
              landed = true;
              beep(220, 0.06, "square", 0.03);
              break;
            }
          }
        }
      }
      player.onGround = landed;

      // Colisões más
      for (const c of cones) {
        const cw = 22, ch = 32, ctop = GROUND_Y - ch;
        if (wl < c.x + cw && wr > c.x && bottom > ctop + 8 && player.y < GROUND_Y) {
          gameOver("BATESTE NUM CONE! 🚧");
          return;
        }
      }
      for (const b of boxes) {
        const top = GROUND_Y - 40;
        if (wl < b.x + 40 && wr > b.x && bottom > top + 10 && player.y < GROUND_Y - 10) {
          gameOver("BATESTE NUM CAIXOTE! 📦");
          return;
        }
      }
      if (player.y > canvas.height + 20) {
        gameOver("CAÍSTE NUM BURACO! 🕳️");
        return;
      }
    }
  }

  // --- Truques no ar ---
  if (state === "playing" && player.trick) {
    player.trick.t++;
    if (player.trick.t >= player.trick.dur) {
      const pts = player.trick.pts * combo;
      score += pts;
      save.totalPoints += pts;   // truques também dão progresso!
      save.coins += pts;
      addFloat(`+${pts} ${player.trick.name}${combo > 1 ? ` x${combo}` : ""}`,
               player.x + PLAYER_W / 2, player.y - 10);
      beep(700 + combo * 100, 0.12, "triangle");
      combo = Math.min(combo + 1, 5);
      player.trick = null;
    }
  }

  // --- Partículas e textos ---
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
  }
  particles = particles.filter(p => p.life > 0);
  for (const f of floats) { f.y -= 1; f.life--; }
  floats = floats.filter(f => f.life > 0);
}

function cancelTrick() {
  if (player.trick) {
    addFloat("TRUQUE INCOMPLETO", player.x + PLAYER_W / 2, player.y - 10, "#ff6b6b");
    player.trick = null;
  }
}

// ---------- 12. DESENHAR ----------
function draw() {
  // Céu
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#4a6fa5");
  sky.addColorStop(1, "#f7b733");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sol
  ctx.fillStyle = "#ffe066";
  ctx.beginPath();
  ctx.arc(650, 70, 40, 0, Math.PI * 2);
  ctx.fill();

  // Nuvens (parallax)
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 5; i++) {
    const cx = ((i * 220 - cam * 0.15) % 1100 + 1100) % 1100 - 100;
    const cy = 50 + (i % 3) * 35;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 40, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 28, cy - 8, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Colinas (parallax 0.3)
  ctx.fillStyle = "#2f4858";
  for (let i = 0; i < 8; i++) {
    const hx = ((i * 180 - cam * 0.3) % 1440 + 1440) % 1440 - 180;
    ctx.beginPath();
    ctx.moveTo(hx, GROUND_Y + 20);
    ctx.arc(hx + 90, GROUND_Y + 20, 90, Math.PI, 0);
    ctx.fill();
  }

  // Prédios (parallax 0.6)
  ctx.fillStyle = "#1b263b";
  for (let i = 0; i < 10; i++) {
    const bx = ((i * 130 - cam * 0.6) % 1300 + 1300) % 1300 - 130;
    const bh = 60 + (i * 37) % 90;
    ctx.fillRect(bx, GROUND_Y + 20 - bh, 70, bh);
  }

  // Plataformas
  for (const p of platforms) {
    const x = p.x - cam;
    if (x > canvas.width || x + p.w < 0) continue;
    ctx.fillStyle = "#8d99ae";
    ctx.fillRect(x, GROUND_Y, p.w, 8);
    ctx.fillStyle = "#4a4e69";
    ctx.fillRect(x, GROUND_Y + 8, p.w, canvas.height - GROUND_Y);
    ctx.strokeStyle = "#3d405b";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, GROUND_Y + 8, p.w - 4, 20);
  }

  // Caixotes
  for (const b of boxes) {
    const x = b.x - cam;
    ctx.fillStyle = "#c98a4b";
    ctx.fillRect(x, GROUND_Y - 40, 40, 40);
    ctx.strokeStyle = "#8a5a2b";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 2, GROUND_Y - 38, 36, 36);
    ctx.beginPath();
    ctx.moveTo(x + 4, GROUND_Y - 36); ctx.lineTo(x + 36, GROUND_Y - 6);
    ctx.moveTo(x + 36, GROUND_Y - 36); ctx.lineTo(x + 4, GROUND_Y - 6);
    ctx.stroke();
  }

  // Cones
  for (const c of cones) {
    const x = c.x - cam;
    ctx.fillStyle = "#ff6b35";
    ctx.beginPath();
    ctx.moveTo(x + 11, GROUND_Y - 32);
    ctx.lineTo(x + 22, GROUND_Y);
    ctx.lineTo(x, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 5, GROUND_Y - 18, 12, 5);
    ctx.fillStyle = "#333";
    ctx.fillRect(x - 3, GROUND_Y - 4, 28, 4);
  }

  // Rails
  for (const r of rails) {
    const x = r.x - cam;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, r.y);
    ctx.lineTo(x + r.w, r.y);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 15, r.y); ctx.lineTo(x + 15, GROUND_Y);
    ctx.moveTo(x + r.w - 15, r.y); ctx.lineTo(x + r.w - 15, GROUND_Y);
    ctx.stroke();
  }

  // Partículas
  for (const p of particles) {
    ctx.globalAlpha = Math.min(1, p.life / 20);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 4, 4);
  }
  ctx.globalAlpha = 1;

  // Skatista
  if (state === "playing") {
    const crouch = player.onGround && !player.grinding ? 0 : 4;
    drawSkater(player.x, player.y, 1, currentSkin(), player.trick, crouch);
  }

  // Textos flutuantes
  ctx.textAlign = "center";
  ctx.font = "bold 16px Arial";
  for (const f of floats) {
    ctx.globalAlpha = Math.min(1, f.life / 25);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  if (state === "playing") drawHUD();

  // Aviso de nível
  if (levelBanner > 0 && state === "playing") {
    ctx.globalAlpha = Math.min(1, levelBanner / 30);
    ctx.textAlign = "center";
    ctx.fillStyle = "#74b9ff";
    ctx.font = "bold 40px Arial";
    ctx.fillText(level === MAX_LEVEL ? "NÍVEL MÁXIMO! 🏆" : `NÍVEL ${level}!`,
                 canvas.width / 2, 200);
    ctx.globalAlpha = 1;
  }

  if (state === "start") drawShop();
  if (state === "over") drawGameOverScreen();
}

// ---------- 13. HUD ----------
function drawHUD() {
  ctx.textAlign = "left";
  ctx.font = "bold 18px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(`PONTOS: ${Math.floor(score)} ⭐`, 15, 28);
  ctx.fillText(`VELOCIDADE: ${Math.round(speed * 12)} km/h`, 15, 52);
  if (combo > 1) {
    ctx.fillStyle = "#ffd166";
    ctx.fillText(`COMBO x${combo}`, 15, 76);
  }
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffe066";
  ctx.fillText(`RECORDE: ${Math.floor(best)}`, canvas.width - 15, 28);
  ctx.fillStyle = "#55efc4";
  ctx.fillText(`COFRE: ${Math.floor(save.coins)} ⭐`, canvas.width - 15, 52);

  // Nível + barra (falta quanto para o próximo nível?)
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 20px Arial";
  ctx.fillText(`NÍVEL ${level} / ${MAX_LEVEL}`, canvas.width / 2, 26);
  const barW = 200, barX = canvas.width / 2 - barW / 2, barY = 34;
  const progress = level >= MAX_LEVEL
    ? 1
    : (save.totalPoints % POINTS_PER_LEVEL) / POINTS_PER_LEVEL;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(barX, barY, barW, 10);
  ctx.fillStyle = "#74b9ff";
  ctx.fillRect(barX, barY, barW * progress, 10);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, 10);
}

// ---------- 14. SKATISTA (usa as cores da skin) ----------
function drawSkater(px, py, scale, skin, trick, crouch) {
  const cx = PLAYER_W / 2;
  const bottom = PLAYER_H;

  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);

  // Prancha
  ctx.save();
  ctx.translate(cx - 2, bottom - 5);
  if (trick) {
    const prog = trick.t / trick.dur;
    if (trick.type === "flip") {
      ctx.scale(1, Math.cos(prog * Math.PI * 2));
    } else {
      ctx.rotate(prog * Math.PI * 2);
    }
  }
  ctx.fillStyle = skin.deck;
  ctx.fillRect(-18, -4, 36, 5);
  ctx.fillStyle = skin.deckLight;
  ctx.fillRect(-18, -4, 36, 2);
  ctx.fillStyle = "#dfe6e9";
  ctx.fillRect(-12, 1, 3, 4);
  ctx.fillRect(9, 1, 3, 4);
  ctx.fillStyle = skin.wheels;
  ctx.beginPath();
  ctx.arc(-10, 6, 3.5, 0, Math.PI * 2);
  ctx.arc(11, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Pernas
  ctx.strokeStyle = skin.pants;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 8, bottom - 22 + crouch);
  ctx.lineTo(cx - 13, bottom - 12);
  ctx.lineTo(cx - 12, bottom - 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 6, bottom - 22 + crouch);
  ctx.lineTo(cx + 10, bottom - 12);
  ctx.lineTo(cx + 11, bottom - 7);
  ctx.stroke();

  // Corpo
  ctx.fillStyle = skin.shirt;
  ctx.beginPath();
  ctx.roundRect(cx - 10, 12 + crouch, 20, 16, 5);
  ctx.fill();

  // Braços
  ctx.strokeStyle = skin.shirt;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 8, 16 + crouch);
  ctx.lineTo(cx - 18, 10 + (trick ? -6 : 0));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 8, 16 + crouch);
  ctx.lineTo(cx + 18, 20);
  ctx.stroke();

  // Cabeça
  ctx.fillStyle = "#f5cba7";
  ctx.beginPath();
  ctx.arc(cx + 2, 5 + crouch, 7, 0, Math.PI * 2);
  ctx.fill();
  // Capacete
  ctx.fillStyle = skin.helmet;
  ctx.beginPath();
  ctx.arc(cx + 2, 3 + crouch, 8, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 6, 2 + crouch, 16, 3);
  // Visor
  ctx.fillStyle = "#2d3436";
  ctx.fillRect(cx + 6, 4 + crouch, 4, 2);

  ctx.restore();
}

// ---------- 15. A LOJA (16 skins em4x4) ----------
function drawShop() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Título + informações
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 30px Arial";
  ctx.fillText("SKATE PARKOUR 🛹", canvas.width / 2, 32);

  ctx.textAlign = "right";
  ctx.fillStyle = "#55efc4";
  ctx.font = "bold 17px Arial";
  ctx.fillText(`PONTOS: ${Math.floor(save.coins)} ⭐`, canvas.width - 12, 26);
  ctx.fillStyle = "#74b9ff";
  ctx.fillText(`NÍVEL ${currentLevel()} / ${MAX_LEVEL}`, canvas.width - 12, 48);

  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "bold 17px Arial";
  ctx.fillText(`SKINS: ${save.owned.length}/${SKINS.length}`, 12, 26);
  ctx.fillText(`RECORDE: ${Math.floor(best)} ⭐`, 12, 48);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd166";
  ctx.font = "bold 18px Arial";
  ctx.fillText("LOJA DE SKINS", canvas.width / 2, 62);

  // Cartões4x4
  for (let i = 0; i < SKINS.length; i++) {
    const s = SKINS[i];
    const col = i % 4, row = Math.floor(i / 4);
    const cw = 190, chh = 88;
    const x = 8 + col * 195, y = 70 + row * 96;

    const owned = save.owned.includes(s.id);
    const equipped = save.skin === s.id;
    const chosen = selectedSkin === i;

    ctx.fillStyle = chosen ? "rgba(255,209,102,0.25)" : "rgba(0,0,0,0.45)";
    ctx.fillRect(x, y, cw, chh);
    ctx.strokeStyle = chosen ? "#ffd166" : (equipped ? "#55efc4" : "#57606f");
    ctx.lineWidth = chosen ? 4 : 2;
    ctx.strokeRect(x, y, cw, chh);

    // Mini skatista
    drawSkater(x + 14, y + 26, 0.7, s, null, 0);

    // Nome e estado
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.fillText(s.name, x + 56, y + 18);
    ctx.font = "12px Arial";
    if (equipped) {
      ctx.fillStyle = "#55efc4";
      ctx.fillText("EQUIPADA ✓", x + 56, y + 38);
    } else if (owned) {
      ctx.fillStyle = "#74b9ff";
      ctx.fillText("PREM ENTER", x + 56, y + 38);
      ctx.fillText("PARA EQUIPAR", x + 56, y + 54);
    } else if (save.coins >= s.price) {
      ctx.fillStyle = "#ffd166";
      ctx.fillText(`PREÇO: ${s.price} ⭐`, x + 56, y + 38);
      ctx.fillStyle = "#55efc4";
      ctx.fillText("ENTER = COMPRAR!", x + 56, y + 54);
    } else {
      ctx.fillStyle = "#ff6b6b";
      ctx.fillText(`PREÇO: ${s.price} ⭐`, x + 56, y + 38);
      ctx.fillStyle = "#aaaaaa";
      ctx.fillText(`FALTAM ${Math.ceil(s.price - save.coins)}`, x + 56, y + 54);
      ctx.fillText("PONTOS", x + 56, y + 70);
    }
  }

  // Instruções
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.font = "14px Arial";
  ctx.fillText("← → ↑ ↓ escolher   |   ENTER comprar/equipar   |   ESPAÇO jogar   |   F ecrã inteiro",
               canvas.width / 2, 470);

  // Mensagem da loja
  if (shopMsgTimer > 0) {
    ctx.globalAlpha = Math.min(1, shopMsgTimer / 30);
    ctx.fillStyle = shopMsgColor;
    ctx.font = "bold 18px Arial";
    ctx.fillText(shopMsg, canvas.width / 2, 492);
    ctx.globalAlpha = 1;
  } else if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = "#74b9ff";
    ctx.font = "bold 18px Arial";
    ctx.fillText("PREME ESPAÇO PARA ANDAR DE SKATE!", canvas.width / 2, 492);
  }
}

// ---------- 16. FIM DE JOGO ----------
function drawGameOverScreen() {
  const earned = Math.floor(score);
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ff6b6b";
  ctx.font = "bold 38px Arial";
  ctx.fillText("FIM DE JOGO", canvas.width / 2, 140);
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(deathReason, canvas.width / 2, 185);
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#ffd166";
  ctx.fillText(`PONTOS: ${earned} ⭐`, canvas.width / 2, 235);
  ctx.font = "18px Arial";
  ctx.fillStyle = "#74b9ff";
  ctx.fillText(`NÍVEL ${currentLevel()} / ${MAX_LEVEL}`, canvas.width / 2, 268);
  ctx.fillStyle = "#55efc4";
  ctx.fillText("PROGRESSO GUARDADO ✓", canvas.width / 2, 296);
  ctx.fillStyle = "#fff";
  ctx.fillText(`Cofre: ${Math.floor(save.coins)} ⭐  |  Recorde: ${Math.floor(best)} ⭐`,
               canvas.width / 2, 324);
  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = "#74b9ff";
    ctx.font = "bold 22px Arial";
    ctx.fillText("PREME ENTER OU ESPAÇO PARA A LOJA", canvas.width / 2, 400);
  }
}

// ---------- 17. O LOOP ----------
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

level = currentLevel();   // começar no nível guardado
generate();
gameLoop();
