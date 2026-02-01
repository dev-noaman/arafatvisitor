# How to Run: Kiosk + Backend + Admin Dashboard


On vps

  # First time - sets up everything including database
  .\deploy.ps1 --init

  # Updates only - keeps database intact
  .\deploy.ps1

  What happens:

  1. Builds frontend (npm run build)
  2. Uploads frontend + backend files via SFTP
  3. On --init: Installs Node.js, PM2, PostgreSQL, creates database, sets up Nginx
  4. On update: Just reinstalls deps, runs migrations, rebuilds & restarts

  After first deploy, add HTTPS:
  # SSH to VPS and run:
  apt install certbot python3-certbot-nginx
  certbot --nginx -d arafatvisitor.cloud

  This will give you free SSL from Let's Encrypt, then the QR camera will work on mobile.


## 1. Backend (API + Admin dashboard)

From repo root:

```powershell
cd backend
npm run start:dev
```

- **API**: http://localhost:3000  
- **Admin dashboard (AdminJS)**: http://localhost:3000/admin. Custom dashboard with KPIs, approval queue, deliveries queue, and charts. Requires **Node 22+** (scripts set `NODE_OPTIONS=--experimental-require-module` for ESM compatibility).

**Admin panel features:**
- **Dashboard**: Total hosts, visits today, deliveries today; pre-register approval queue; received deliveries queue; charts (visits/day, status distribution, deliveries/day).
- **Sidebar**: Dashboard, Hosts, Deliveries, Visitors, Pre Register, Change Password, Reports, Settings. Sidebar is visible by default; use the collapse icon to hide.
- **Dark mode**: Toggle in the dashboard header; preference saved in browser localStorage.
- **Change Password**: Sidebar → **Change Password** (any role).
- **Send QR**: On any visitor/visit record, action **Send QR** to send the QR via WhatsApp or Email (if phone/email is present).
- **Roles**: Admin (full access), Host (own company only), Reception (create deliveries, no approve/pick-up).

**Kiosk quick admin:** On the kiosk login screen use **"Quick admin login"** for one-click sign-in with the seed admin account.

**First-time login (after seed):**  
Email: `admin@arafatvisitor.cloud`  
Password: `admin123`

---

## 2. Kiosk (visitor UI)

In a **second terminal**, from repo root:

```powershell
npm run dev
```

- **Kiosk**: http://localhost:5173  

To use the real backend from the kiosk:

1. Open the kiosk in the browser.
2. Open DevTools (F12) → Console.
3. Set config and log in:
   ```javascript
   sessionStorage.setItem('vms_config', JSON.stringify({
     apiBase: 'http://localhost:3000',
     location: 'BARWA_TOWERS'
   }));
   location.reload();
   ```
4. Log in with `admin@arafatvisitor.cloud` / `admin123`.

---

## Summary

| App           | Command              | Where to open                    |
|---------------|----------------------|----------------------------------|
| Backend + API | `cd backend && npm run start:dev` | http://localhost:3000           |
| Admin dashboard | (same as backend)   | http://localhost:3000/admin      |
| Kiosk         | `npm run dev`        | http://localhost:5173            |

Run backend first, then kiosk. Use two terminals.
