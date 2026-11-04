# 🕹️ OMPRAKASH SAHOO — Retro Game Portfolio

A retro-game themed personal portfolio website with pixel aesthetics, Press Start 2P font, and a secure admin panel for **Omprakash Sahoo** (Computer Science student at Bharati Vidyapeeth, passionate about C++ and Web Development).

---

## 📁 Project Structure

```
collegefest/
├── index.html        # Main portfolio page
├── style.css         # Retro pixel styles
├── script.js         # Animations & interactions
├── vercel.json       # Vercel config (security headers, caching, rewrites)
├── admin/
│   └── index.html    # Password-protected admin dashboard
├── .gitignore
└── README.md
```

---

## ✏️ How to Edit Content

All editable sections in `index.html` are marked with `<!-- EDIT -->` comments. Open the file in any text editor and search for `<!-- EDIT -->` to find every section you can safely update — including your name, bio, project cards, skills, and contact links.

---

## 🚀 Deploying to Vercel

### Option 1 — GitHub Integration (Recommended)

1. Push this project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel auto-detects the static site — no build command needed.
5. Click **Deploy**. Your site is live instantly.
6. Every `git push` to `main` automatically triggers a new deployment.

### Option 2 — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🔐 Admin Page

| Item | Detail |
|------|--------|
| **URL** | `/admin` |
| **Default Password** | `Admin@P1` |
| **Auth Method** | Client-side SHA-256 (Web Crypto API) |
| **Session** | `sessionStorage` — logs out on tab close |
| **Lockout** | 3 wrong attempts → 30-second cooldown |

### Changing the Admin Password

The admin page hashes the **correct** password at runtime using the Web Crypto API and compares it against the user's input hash — no plaintext password is ever stored.

To change the password:
1. Open `admin/index.html`.
2. Find the line:
   ```js
   const CORRECT = await sha256("Admin@P1");
   ```
3. Replace `"Admin@P1"` with your new password string.
4. Save and redeploy.

> ⚠️ This is a **client-side** password check suitable for a static portfolio site. It is **not** a substitute for server-side authentication in production applications with sensitive data.

---

## 🛡️ Security Features

- **X-Frame-Options: DENY** — Prevents clickjacking
- **X-Content-Type-Options: nosniff** — Blocks MIME-type sniffing
- **X-XSS-Protection: 1; mode=block** — Legacy XSS filter for older browsers
- **Referrer-Policy: strict-origin-when-cross-origin** — Limits referrer leakage
- **Permissions-Policy** — Disables camera, microphone, and geolocation
- **Content-Security-Policy** — Restricts resource origins; allows Google Fonts & inline styles
- **Cache-Control** — HTML: no-cache; CSS/JS: immutable long-term cache
- **Admin lockout** — 30-second form disable after 3 failed login attempts
- **sessionStorage auth** — Admin session cleared automatically on tab close

---

## 🎮 Tech Stack

- Pure HTML5, CSS3, Vanilla JavaScript
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) — Google Fonts
- Deployed via [Vercel](https://vercel.com)
