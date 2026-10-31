# Synthwave Homeschool Hub v2

A retro Final Fantasy-inspired, synthwave dark-mode web app for homeschooling.

## New in this update
- **Retro pixel sprites** for all 7 heroes (used in the game and as visual references)
- **Side-scrolling Auto-Battler Roguelite** accessible via the "INSERT COIN" button on the dashboard
  - Auto-attacks enemies that approach from the right
  - Waves of increasing difficulty
  - After each wave, choose 1 of 3 random upgrades (damage, speed, HP, range, crit, etc.)
  - Game over when HP reaches 0; score based on enemies defeated and waves cleared
  - Uses your selected hero's sprite

## Features
- Create multiple hero profiles
- Scalable lesson planner with XP rewards
- Progress tracking and leveling system with level-up celebrations
- Daily quests, party system, subject templates, export/import
- All data stored locally in your browser (localStorage)
- Fully offline once loaded

## How to Use Immediately (Local)
1. Download the entire `homeschool-hub` folder.
2. Open `index.html` in any modern browser.
3. Create a hero and start planning!

---

## Step-by-Step: Host on GitHub Pages (Free & Permanent)

### Step 1: Create a GitHub Account
1. Go to [https://github.com](https://github.com)
2. Click **Sign up** and create a free account.
3. Verify your email address.

### Step 2: Create a New Repository
1. Once logged in, click the **+** icon (top right) → **New repository**.
2. Repository name: `homeschool-hub` (or any name you like).
3. Set it to **Public**.
4. Do **not** check “Add a README file” (we’ll upload our own files).
5. Click **Create repository**.

### Step 3: Upload the Site Files
1. On the new empty repository page, click **uploading an existing file** (or the “Add file” button → “Upload files”).
2. Unzip the `homeschool-hub` folder you downloaded.
3. Drag **all** the contents of the unzipped folder into the upload area:
   - `index.html`
   - `style.css`
   - `app.js`
   - `README.md`
   - The entire `assets` folder (with all the hero images)
4. Scroll down and click **Commit changes**.

### Step 4: Enable GitHub Pages
1. In your repository, click the **Settings** tab.
2. In the left sidebar, click **Pages**.
3. Under “Build and deployment”:
   - Source: select **Deploy from a branch**
   - Branch: select `main` and `/ (root)`
4. Click **Save**.

### Step 5: Wait and Visit Your Site
1. Wait 1–2 minutes.
2. Refresh the Pages settings page — GitHub will show your live URL at the top (something like `https://yourusername.github.io/homeschool-hub/`).
3. Click the link. Your Synthwave Homeschool Hub is now online!

### Updating the Site Later
1. Make changes locally (or download a new zip from me).
2. Go to your repository on GitHub.
3. Click **Add file** → **Upload files**.
4. Upload the updated files (they will replace the old ones).
5. Commit the changes. The site updates automatically within a minute or two.

---

## Alternative: Netlify Drop (Even Faster)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. Unzip the folder and drag the whole `homeschool-hub` folder onto the page.
3. Instant public URL — no account required for the basic version.

## Notes
- Progress is saved per browser. Use the Export/Import buttons to move data between devices.
- Each family member can use their own browser profile or device.
- You can edit the code freely — it's plain HTML/CSS/JS.

Enjoy the quest for knowledge!
