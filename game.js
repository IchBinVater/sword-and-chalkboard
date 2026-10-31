// Side-scrolling Auto-Battler Roguelite
// Inspired by retro Final Fantasy

let gameCanvas, gameCtx;
let gameRunning = false;
let gameLoopId;
let player, enemies, projectiles, particles;
let wave = 1;
let score = 0;
let upgrades = [];
let currentHeroSprite;

const ENEMY_TYPES = [
  { img: 'assets/sprites/slime.png', hp: 30, speed: 0.8, damage: 8, score: 10 },
  { img: 'assets/sprites/skeleton.png', hp: 50, speed: 0.6, damage: 12, score: 15 },
  { img: 'assets/sprites/bat.png', hp: 20, speed: 1.4, damage: 6, score: 12 }
];

const UPGRADE_POOL = [
  { id: 'dmg', name: '+Damage', desc: 'Increase attack damage by 25%', apply: (p) => p.damage *= 1.25 },
  { id: 'speed', name: '+Attack Speed', desc: 'Attack 20% faster', apply: (p) => p.attackCooldown *= 0.8 },
  { id: 'hp', name: '+Max HP', desc: 'Increase max HP by 30 and heal', apply: (p) => { p.maxHp += 30; p.hp += 30; } },
  { id: 'range', name: '+Range', desc: 'Increase attack range', apply: (p) => p.range += 40 },
  { id: 'heal', name: 'Heal', desc: 'Restore 40% HP', apply: (p) => p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.4) },
  { id: 'crit', name: 'Crit Chance', desc: '+15% critical hit chance', apply: (p) => p.critChance = (p.critChance || 0) + 0.15 },
  { id: 'move', name: '+Move Speed', desc: 'Move faster between attacks', apply: (p) => p.moveSpeed += 0.5 }
];

function openGame() {
  const profile = getCurrentProfile();
  if (!profile) {
    alert('Create a hero first!');
    return;
  }
  const hero = HEROES.find(h => h.id === profile.heroId);
  currentHeroSprite = new Image();
  currentHeroSprite.src = hero.sprite;

  document.getElementById('game-modal').classList.add('active');
  document.getElementById('game-hero-name').textContent = profile.name + ' the ' + hero.class;
  startGame();
}

function closeGame() {
  gameRunning = false;
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  document.getElementById('game-modal').classList.remove('active');
  document.getElementById('upgrade-screen').style.display = 'none';
  document.getElementById('game-over-screen').style.display = 'none';
}

function startGame() {
  gameCanvas = document.getElementById('game-canvas');
  gameCtx = gameCanvas.getContext('2d');
  resizeGame();

  player = {
    x: 80,
    y: gameCanvas.height / 2 - 40,
    w: 64,
    h: 80,
    hp: 100,
    maxHp: 100,
    damage: 15,
    attackCooldown: 800,
    lastAttack: 0,
    range: 180,
    moveSpeed: 1.2,
    critChance: 0.05,
    sprite: currentHeroSprite
  };

  enemies = [];
  projectiles = [];
  particles = [];
  wave = 1;
  score = 0;
  upgrades = [];
  gameRunning = true;

  spawnWave();
  document.getElementById('upgrade-screen').style.display = 'none';
  document.getElementById('game-over-screen').style.display = 'none';
  document.getElementById('wave-display').textContent = wave;
  document.getElementById('score-display').textContent = score;

  if (gameLoopId) cancelAnimationFrame(gameLoopId);
  gameLoop();
}

function resizeGame() {
  const container = document.getElementById('game-container');
  gameCanvas.width = container.clientWidth;
  gameCanvas.height = container.clientHeight || 400;
}

function spawnWave() {
  const count = 3 + wave * 2;
  for (let i = 0; i < count; i++) {
    const type = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    const img = new Image();
    img.src = type.img;
    enemies.push({
      x: gameCanvas.width + 50 + i * 60,
      y: 80 + Math.random() * (gameCanvas.height - 160),
      w: 48,
      h: 48,
      hp: type.hp * (1 + wave * 0.15),
      maxHp: type.hp * (1 + wave * 0.15),
      speed: type.speed,
      damage: type.damage,
      score: type.score,
      sprite: img,
      type: type
    });
  }
}

function gameLoop(timestamp = 0) {
  if (!gameRunning) return;

  // Update
  updatePlayer(timestamp);
  updateEnemies();
  updateProjectiles();
  updateParticles();

  // Check wave clear
  if (enemies.length === 0 && projectiles.length === 0) {
    wave++;
    score += 50;
    showUpgradeScreen();
    return;
  }

  // Check game over
  if (player.hp <= 0) {
    gameOver();
    return;
  }

  // Draw
  draw();

  gameLoopId = requestAnimationFrame(gameLoop);
}

function updatePlayer(timestamp) {
  // Auto-attack nearest enemy in range
  let nearest = null;
  let minDist = player.range;
  enemies.forEach(e => {
    const dist = Math.abs(e.x - player.x);
    if (dist < minDist) {
      minDist = dist;
      nearest = e;
    }
  });

  if (nearest && timestamp - player.lastAttack > player.attackCooldown) {
    player.lastAttack = timestamp;
    const isCrit = Math.random() < player.critChance;
    const dmg = isCrit ? player.damage * 2 : player.damage;
    projectiles.push({
      x: player.x + 40,
      y: player.y + 30,
      vx: 6,
      damage: dmg,
      crit: isCrit
    });
    // Small recoil or visual
  }

  // Gentle bobbing or idle movement
  player.y += Math.sin(timestamp / 400) * 0.3;
}

function updateEnemies() {
  enemies.forEach((e, i) => {
    e.x -= e.speed;
    if (e.x < player.x + 50) {
      // Contact damage
      player.hp -= e.damage * 0.02;
      if (player.hp < 0) player.hp = 0;
    }
    if (e.hp <= 0) {
      score += e.score;
      createParticles(e.x, e.y, '#ff00ff');
      enemies.splice(i, 1);
    }
  });
  // Remove off-screen
  enemies = enemies.filter(e => e.x > -100);
}

function updateProjectiles() {
  projectiles.forEach((p, i) => {
    p.x += p.vx;
    enemies.forEach(e => {
      if (p.x > e.x && p.x < e.x + e.w && Math.abs(p.y - e.y) < 40) {
        e.hp -= p.damage;
        createParticles(p.x, p.y, p.crit ? '#ffff00' : '#00ffff');
        projectiles.splice(i, 1);
      }
    });
    if (p.x > gameCanvas.width + 50) projectiles.splice(i, 1);
  });
}

function updateParticles() {
  particles.forEach((p, i) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  });
}

function createParticles(x, y, color) {
  for (let i = 0; i < 6; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 20 + Math.random() * 15,
      color
    });
  }
}

function draw() {
  gameCtx.fillStyle = '#0a0014';
  gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Grid lines for synthwave feel
  gameCtx.strokeStyle = 'rgba(255,0,255,0.15)';
  gameCtx.lineWidth = 1;
  for (let x = 0; x < gameCanvas.width; x += 40) {
    gameCtx.beginPath();
    gameCtx.moveTo(x, 0);
    gameCtx.lineTo(x, gameCanvas.height);
    gameCtx.stroke();
  }
  for (let y = 0; y < gameCanvas.height; y += 40) {
    gameCtx.beginPath();
    gameCtx.moveTo(0, y);
    gameCtx.lineTo(gameCanvas.width, y);
    gameCtx.stroke();
  }

  // Player
  if (player.sprite && player.sprite.complete) {
    gameCtx.drawImage(player.sprite, player.x, player.y, player.w, player.h);
  } else {
    gameCtx.fillStyle = '#00ffff';
    gameCtx.fillRect(player.x, player.y, player.w, player.h);
  }

  // HP bar for player
  gameCtx.fillStyle = '#333';
  gameCtx.fillRect(player.x, player.y - 10, player.w, 6);
  gameCtx.fillStyle = '#00ff00';
  gameCtx.fillRect(player.x, player.y - 10, player.w * (player.hp / player.maxHp), 6);

  // Enemies
  enemies.forEach(e => {
    if (e.sprite && e.sprite.complete) {
      gameCtx.drawImage(e.sprite, e.x, e.y, e.w, e.h);
    } else {
      gameCtx.fillStyle = '#ff00ff';
      gameCtx.fillRect(e.x, e.y, e.w, e.h);
    }
    // HP bar
    gameCtx.fillStyle = '#333';
    gameCtx.fillRect(e.x, e.y - 8, e.w, 4);
    gameCtx.fillStyle = '#ff0000';
    gameCtx.fillRect(e.x, e.y - 8, e.w * (e.hp / e.maxHp), 4);
  });

  // Projectiles
  gameCtx.fillStyle = '#ffff00';
  projectiles.forEach(p => {
    gameCtx.fillRect(p.x, p.y, 8, 4);
  });

  // Particles
  particles.forEach(p => {
    gameCtx.fillStyle = p.color;
    gameCtx.globalAlpha = p.life / 30;
    gameCtx.fillRect(p.x, p.y, 3, 3);
    gameCtx.globalAlpha = 1;
  });

  // UI
  document.getElementById('wave-display').textContent = wave;
  document.getElementById('score-display').textContent = score;
  document.getElementById('hp-display').textContent = Math.ceil(player.hp) + '/' + player.maxHp;
}

function showUpgradeScreen() {
  gameRunning = false;
  const screen = document.getElementById('upgrade-screen');
  screen.style.display = 'flex';

  // Pick 3 random upgrades
  const choices = [];
  const pool = [...UPGRADE_POOL];
  for (let i = 0; i < 3 && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    choices.push(pool.splice(idx, 1)[0]);
  }

  const container = document.getElementById('upgrade-choices');
  container.innerHTML = choices.map((u, i) => `
    <div class="upgrade-card" onclick="chooseUpgrade(${i})">
      <h3>${u.name}</h3>
      <p>${u.desc}</p>
    </div>
  `).join('');

  window.currentUpgradeChoices = choices;
}

function chooseUpgrade(idx) {
  const choice = window.currentUpgradeChoices[idx];
  if (choice) {
    choice.apply(player);
    upgrades.push(choice.name);
  }
  document.getElementById('upgrade-screen').style.display = 'none';
  spawnWave();
  gameRunning = true;
  gameLoop();
}

function gameOver() {
  gameRunning = false;
  document.getElementById('game-over-screen').style.display = 'flex';
  document.getElementById('final-score').textContent = score;
  document.getElementById('final-wave').textContent = wave;
}

// Resize handler
window.addEventListener('resize', () => {
  if (gameRunning) resizeGame();
});
