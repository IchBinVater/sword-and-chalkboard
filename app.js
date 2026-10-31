// Homeschool Hub v2 - Enhanced Synthwave FF Style RPG Learning App
// Features: More heroes, subject templates, daily quests, party system, export/import

const HEROES = [
  { id: 'knight', name: 'Neon Knight', img: 'assets/knight.jpg', class: 'Knight' },
  { id: 'mage', name: 'Aether Mage', img: 'assets/mage.jpg', class: 'Mage' },
  { id: 'rogue', name: 'Shadow Rogue', img: 'assets/rogue.jpg', class: 'Rogue' },
  { id: 'paladin', name: 'Holy Paladin', img: 'assets/paladin.jpg', class: 'Paladin' },
  { id: 'archer', name: 'Grid Archer', img: 'assets/archer.jpg', class: 'Archer' },
  { id: 'bard', name: 'Melody Bard', img: 'assets/bard.jpg', class: 'Bard' },
  { id: 'summoner', name: 'Crystal Summoner', img: 'assets/summoner.jpg', class: 'Summoner' }
];

const SUBJECT_TEMPLATES = {
  Math: [
    { title: 'Number Sense Warm-up', xp: 30 },
    { title: 'Fractions & Decimals Quest', xp: 60 },
    { title: 'Geometry Challenge', xp: 50 }
  ],
  'Language Arts': [
    { title: 'Reading Comprehension', xp: 40 },
    { title: 'Creative Writing', xp: 70 },
    { title: 'Grammar & Spelling', xp: 35 }
  ],
  Science: [
    { title: 'Observation & Hypothesis', xp: 45 },
    { title: 'Experiment Day', xp: 80 },
    { title: 'Nature Study', xp: 40 }
  ],
  History: [
    { title: 'Timeline Exploration', xp: 40 },
    { title: 'Primary Source Analysis', xp: 55 },
    { title: 'Historical Biography', xp: 50 }
  ],
  'Art / Music': [
    { title: 'Creative Project', xp: 60 },
    { title: 'Skill Practice', xp: 40 }
  ]
};

const DAILY_QUESTS = [
  { title: 'Complete 1 Lesson', desc: 'Finish any lesson today', xp: 25, type: 'complete' },
  { title: 'Add a New Lesson', desc: 'Plan something new', xp: 15, type: 'add' },
  { title: 'Review Previous Work', desc: 'Look back at a completed lesson', xp: 20, type: 'review' },
  { title: 'Study for 30 Minutes', desc: 'Focused learning time', xp: 40, type: 'time' }
];

let profiles = JSON.parse(localStorage.getItem('hsProfiles')) || [];
let currentProfileId = localStorage.getItem('hsCurrentProfile') || null;

function saveData() {
  localStorage.setItem('hsProfiles', JSON.stringify(profiles));
  if (currentProfileId) localStorage.setItem('hsCurrentProfile', currentProfileId);
}

function getCurrentProfile() {
  return profiles.find(p => p.id === currentProfileId);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function init() {
  if (profiles.length === 0) {
    showScreen('create-screen');
  } else if (currentProfileId && getCurrentProfile()) {
    loadDashboard();
    showScreen('dashboard-screen');
  } else {
    showScreen('select-profile-screen');
    renderProfiles();
  }
  updateHeader();
  populateSubjectTemplates();
  renderDailyQuests();
}

function updateHeader() {
  const profile = getCurrentProfile();
  const headerExtra = document.getElementById('header-extra');
  if (profile) {
    const partySize = profile.party ? profile.party.length : 1;
    headerExtra.innerHTML = `<span>Hero: ${profile.name} | Lv. ${profile.level} | Party: ${partySize}</span> 
      <button class="btn" onclick="switchProfile()">Switch</button>
      <button class="btn" onclick="exportData()">Export</button>`;
  } else {
    headerExtra.innerHTML = '';
  }
}

// Create Profile
let selectedHero = null;

function selectHero(id) {
  selectedHero = id;
  document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`[data-hero="${id}"]`);
  if (card) card.classList.add('selected');
}

function createProfile() {
  const name = document.getElementById('hero-name').value.trim();
  if (!name || !selectedHero) {
    alert('Please enter a name and choose a hero!');
    return;
  }
  const newProfile = {
    id: Date.now().toString(),
    name: name,
    heroId: selectedHero,
    level: 1,
    xp: 0,
    xpToNext: 100,
    lessons: [],
    totalCompleted: 0,
    party: [], // additional students
    dailyCompleted: {},
    created: new Date().toISOString()
  };
  profiles.push(newProfile);
  currentProfileId = newProfile.id;
  saveData();
  loadDashboard();
  showScreen('dashboard-screen');
}

// Profiles
function renderProfiles() {
  const list = document.getElementById('profile-list');
  list.innerHTML = profiles.map(p => {
    const hero = HEROES.find(h => h.id === p.heroId);
    return `<div class="profile-tab ${p.id === currentProfileId ? 'active' : ''}" onclick="selectProfile('${p.id}')">
      ${p.name} (${hero ? hero.class : 'Hero'} Lv.${p.level})
    </div>`;
  }).join('');
}

function selectProfile(id) {
  currentProfileId = id;
  saveData();
  loadDashboard();
  showScreen('dashboard-screen');
}

function switchProfile() {
  showScreen('select-profile-screen');
  renderProfiles();
}

// Dashboard
function loadDashboard() {
  const profile = getCurrentProfile();
  if (!profile) return;
  const hero = HEROES.find(h => h.id === profile.heroId);
  
  document.getElementById('hero-img').src = hero.img;
  document.getElementById('hero-name-display').textContent = profile.name;
  document.getElementById('hero-class').textContent = hero.class;
  document.getElementById('level-display').textContent = profile.level;
  document.getElementById('xp-text').textContent = `${profile.xp} / ${profile.xpToNext} XP`;
  document.getElementById('xp-fill').style.width = `${(profile.xp / profile.xpToNext) * 100}%`;
  document.getElementById('completed-count').textContent = profile.totalCompleted;
  
  renderLessons();
  renderParty();
  renderDailyQuests();
  updateHeader();
}

function renderLessons() {
  const profile = getCurrentProfile();
  const list = document.getElementById('lesson-list');
  if (!profile.lessons.length) {
    list.innerHTML = '<p style="text-align:center; opacity:0.7;">No lessons yet. Add one or use a template to begin your quest!</p>';
    return;
  }
  list.innerHTML = profile.lessons.map((lesson, idx) => `
    <div class="lesson-item ${lesson.completed ? 'completed' : ''}">
      <div>
        <strong>${lesson.title}</strong> <span style="color:var(--neon-purple);">[${lesson.subject}]</span><br>
        <small>${lesson.description || ''}</small><br>
        <span style="color:var(--neon-cyan);">+${lesson.xp} XP</span>
        ${lesson.assignedTo ? `<span style="color:var(--neon-yellow);"> → ${lesson.assignedTo}</span>` : ''}
      </div>
      <div>
        ${lesson.completed 
          ? '<span style="color:var(--neon-cyan);">COMPLETED</span>' 
          : `<button class="btn btn-primary" onclick="completeLesson(${idx})">Complete</button>`}
        <button class="btn" style="margin-left:5px; font-size:0.8rem;" onclick="deleteLesson(${idx})">Del</button>
      </div>
    </div>
  `).join('');
}

function addLesson() {
  const title = document.getElementById('lesson-title').value.trim();
  const subject = document.getElementById('lesson-subject').value.trim() || 'General';
  const desc = document.getElementById('lesson-desc').value.trim();
  const xp = parseInt(document.getElementById('lesson-xp').value) || 50;
  const assigned = document.getElementById('lesson-assign').value || '';
  
  if (!title) {
    alert('Lesson title is required!');
    return;
  }
  
  const profile = getCurrentProfile();
  profile.lessons.push({
    title, subject, description: desc, xp, completed: false, assignedTo: assigned
  });
  saveData();
  renderLessons();
  
  document.getElementById('lesson-title').value = '';
  document.getElementById('lesson-subject').value = '';
  document.getElementById('lesson-desc').value = '';
  document.getElementById('lesson-xp').value = '50';
}

function completeLesson(idx) {
  const profile = getCurrentProfile();
  const lesson = profile.lessons[idx];
  if (lesson.completed) return;
  
  lesson.completed = true;
  profile.totalCompleted++;
  profile.xp += lesson.xp;
  
  // Check daily quests
  checkDailyProgress('complete');
  
  let leveled = false;
  while (profile.xp >= profile.xpToNext) {
    profile.xp -= profile.xpToNext;
    profile.level++;
    profile.xpToNext = Math.round(profile.level * 100 * 1.15); // slightly steeper
    leveled = true;
  }
  
  saveData();
  loadDashboard();
  
  if (leveled) {
    showLevelUp(profile.level);
  } else {
    showToast(`+${lesson.xp} XP!`);
  }
}

function deleteLesson(idx) {
  if (!confirm('Delete this lesson?')) return;
  const profile = getCurrentProfile();
  profile.lessons.splice(idx, 1);
  saveData();
  renderLessons();
}

// Subject Templates
function populateSubjectTemplates() {
  const select = document.getElementById('template-subject');
  select.innerHTML = '<option value="">-- Load Template --</option>' + 
    Object.keys(SUBJECT_TEMPLATES).map(s => `<option value="${s}">${s}</option>`).join('');
}

function loadTemplate() {
  const subject = document.getElementById('template-subject').value;
  if (!subject) return;
  const profile = getCurrentProfile();
  const templates = SUBJECT_TEMPLATES[subject];
  templates.forEach(t => {
    profile.lessons.push({
      title: t.title,
      subject: subject,
      description: 'From subject template',
      xp: t.xp,
      completed: false
    });
  });
  saveData();
  renderLessons();
  showToast(`Loaded ${templates.length} ${subject} lessons!`);
  document.getElementById('template-subject').value = '';
}

// Daily Quests
function renderDailyQuests() {
  const profile = getCurrentProfile();
  if (!profile) return;
  const today = new Date().toDateString();
  if (!profile.dailyCompleted) profile.dailyCompleted = {};
  if (!profile.dailyCompleted[today]) profile.dailyCompleted[today] = {};
  
  const container = document.getElementById('daily-quests');
  container.innerHTML = DAILY_QUESTS.map((q, idx) => {
    const done = profile.dailyCompleted[today][q.type];
    return `<div class="lesson-item ${done ? 'completed' : ''}" style="border-left-color: var(--neon-yellow);">
      <div>
        <strong>Daily: ${q.title}</strong><br>
        <small>${q.desc}</small><br>
        <span style="color:var(--neon-yellow);">+${q.xp} XP</span>
      </div>
      <div>
        ${done ? '<span style="color:var(--neon-cyan);">DONE</span>' : 
          `<button class="btn" onclick="completeDaily(${idx})">Claim</button>`}
      </div>
    </div>`;
  }).join('');
}

function completeDaily(idx) {
  const profile = getCurrentProfile();
  const today = new Date().toDateString();
  const q = DAILY_QUESTS[idx];
  if (profile.dailyCompleted[today][q.type]) return;
  
  profile.dailyCompleted[today][q.type] = true;
  profile.xp += q.xp;
  
  let leveled = false;
  while (profile.xp >= profile.xpToNext) {
    profile.xp -= profile.xpToNext;
    profile.level++;
    profile.xpToNext = Math.round(profile.level * 100 * 1.15);
    leveled = true;
  }
  
  saveData();
  loadDashboard();
  if (leveled) showLevelUp(profile.level);
  else showToast(`Daily quest complete! +${q.xp} XP`);
}

function checkDailyProgress(type) {
  // Auto-progress for some daily types can be added here if desired
}

// Party System
function renderParty() {
  const profile = getCurrentProfile();
  const container = document.getElementById('party-list');
  if (!profile.party || profile.party.length === 0) {
    container.innerHTML = '<p style="opacity:0.7; font-size:0.9rem;">No additional party members yet.</p>';
    return;
  }
  container.innerHTML = profile.party.map((member, idx) => `
    <div class="lesson-item" style="border-left-color: var(--neon-cyan);">
      <div>
        <strong>${member.name}</strong> (${HEROES.find(h => h.id === member.heroId)?.class || 'Hero'})
      </div>
      <button class="btn" style="font-size:0.8rem;" onclick="removePartyMember(${idx})">Remove</button>
    </div>
  `).join('');
  
  // Update assign dropdown
  const assignSelect = document.getElementById('lesson-assign');
  assignSelect.innerHTML = '<option value="">Main Hero</option>' + 
    profile.party.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
}

function addPartyMember() {
  const name = document.getElementById('party-name').value.trim();
  const heroId = document.getElementById('party-hero').value;
  if (!name || !heroId) {
    alert('Enter a name and choose a hero for the party member.');
    return;
  }
  const profile = getCurrentProfile();
  if (!profile.party) profile.party = [];
  profile.party.push({ name, heroId });
  saveData();
  renderParty();
  document.getElementById('party-name').value = '';
  showToast(`${name} joined the party!`);
}

function removePartyMember(idx) {
  const profile = getCurrentProfile();
  profile.party.splice(idx, 1);
  saveData();
  renderParty();
}

// Export / Import
function exportData() {
  const data = {
    profiles,
    currentProfileId,
    exported: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `homeschool-hub-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Progress exported!');
}

function importData() {
  const input = document.getElementById('import-file');
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.profiles) {
        if (confirm('This will replace your current data. Continue?')) {
          profiles = data.profiles;
          currentProfileId = data.currentProfileId || (profiles[0]?.id || null);
          saveData();
          location.reload();
        }
      } else {
        alert('Invalid backup file.');
      }
    } catch (err) {
      alert('Error reading file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// UI Helpers
function showLevelUp(level) {
  document.getElementById('level-up-text').textContent = `LEVEL ${level}!`;
  document.getElementById('level-up-modal').classList.add('active');
}

function closeLevelUp() {
  document.getElementById('level-up-modal').classList.remove('active');
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: var(--bg-card); border: 2px solid var(--neon-cyan);
    padding: 12px 24px; border-radius: 8px; z-index: 2000;
    box-shadow: 0 0 20px var(--neon-cyan); font-family: 'Orbitron', sans-serif;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Init
document.addEventListener('DOMContentLoaded', init);
