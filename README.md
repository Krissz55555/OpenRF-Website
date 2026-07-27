OpenRF Platform Website v1.4 — Database Edition
================================================

This package upgrades the approved v1.2 Community Hub with a real shared backend.
The public website remains static and fast, while Cloudflare Pages Functions handle
API requests and Cloudflare D1 stores the community data permanently.

NEW IN v1.4
-----------
- Shared Cloudflare D1 database
- Cloudflare Pages Functions API
- Persistent discussions, questions, ideas and stories
- Persistent replies/comments
- Persistent idea votes with one vote per browser/network identity
- Full thread view and reply composer
- Author/display-name field
- Basic server-side validation
- Honeypot spam field
- Basic D1-backed rate limiting
- Automatic local test fallback when the API is unavailable
- Initial database migration with the existing Community Hub sample content

DATA THAT NOW SURVIVES WEBSITE UPDATES
-------------------------------------
Posts, replies and votes are stored in D1, not inside the HTML/JavaScript files.
Uploading a newer website version therefore does not delete the community content.
Only deleting/replacing the D1 database or manually removing rows will erase it.

IMPORTANT DEPLOYMENT CHANGE
---------------------------
A dashboard drag-and-drop upload cannot deploy Pages Functions.
Deploy this version with Wrangler or through a Git-connected Cloudflare Pages project.
The exact Hungarian setup instructions are in DEPLOYMENT-HU.md.

MAIN FILES
----------
index.html                         Main OpenRF website
community.html                     Community Hub
community.js                       D1 API client and local fallback
functions/api/community/           Pages Functions API
migrations/0001_initial.sql        D1 schema and initial content
wrangler.jsonc                     Cloudflare Pages + D1 configuration
package.json                       Local development and deployment commands
DEPLOYMENT-HU.md                   Complete Hungarian installation guide

CURRENT SCOPE
-------------
This version intentionally does not include user accounts or an admin dashboard.
Visitors publish under a display name. Basic spam protection and rate limiting are
included, but a larger public community should later add Cloudflare Turnstile,
authentication and moderation tools.

VERSION
-------
Website: v1.4 Database Edition
Firmware presented: OpenRF Platform v1.1.0 Stable


V1.4 GITHUB EDITION
- Hivatalos GitHub repository link a navigációban, főoldalon és láblécben.
- GitHub OAuth bejelentkezés biztonságos, HttpOnly munkamenet-sütivel.
- Olvasás mindenki számára nyitott.
- Bejegyzés, válasz és ötletszavazás csak bejelentkezett GitHub-felhasználóknak.
- A felhasználói adatok és munkamenetek Cloudflare D1-ben tárolódnak.
- Részletes beállítás: DEPLOYMENT-HU.md
