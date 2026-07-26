# OpenRF Platform Website v1.4 – telepítés Cloudflare Pagesre

A v1.4 a következőket használja:

- Cloudflare Pages – weboldal
- Pages Functions – API és GitHub OAuth
- Cloudflare D1 – közösségi tartalom, felhasználók és munkamenetek
- GitHub OAuth App – bejelentkezés

## 1. Függőségek és Cloudflare-belépés

```bash
npm install
npx wrangler login
```

## 2. D1 adatbázis létrehozása

Ha még nincs adatbázis:

```bash
npx wrangler d1 create openrf-community
```

A kapott `database_id` értéket írd be a `wrangler.jsonc` fájlba.

Ha a v1.3 adatbázisát használod, ugyanazt a `database_id` értéket tartsd meg. Így a meglévő bejegyzések és hozzászólások megmaradnak.

## 3. Adatbázis-migrációk futtatása

```bash
npx wrangler d1 migrations apply openrf-community --remote
```

Ez a meglévő v1.3 táblák mellé létrehozza a felhasználó- és munkamenet-táblákat is.

## 4. GitHub OAuth App létrehozása

GitHubon nyisd meg:

`Settings → Developer settings → OAuth Apps → New OAuth App`

Javasolt értékek:

- Application name: `OpenRF Platform Community`
- Homepage URL: `https://openrfplatform.com`
- Authorization callback URL: `https://openrfplatform.com/api/auth/github/callback`

A GitHub létrehoz egy `Client ID` értéket. Ezután generálj egy `Client Secret` értéket is.

## 5. OAuth változók beállítása Cloudflare-ben

A Cloudflare Pages projektben add hozzá:

- `GITHUB_CLIENT_ID` – normál környezeti változó
- `GITHUB_CLIENT_SECRET` – titkosított secret
- `RATE_LIMIT_SALT` – hosszú, véletlenszerű secret

A production és preview környezetben külön is ellenőrizd ezeket. Preview domain használatakor a GitHub OAuth App egyetlen callback URL-korlátja miatt érdemes külön teszt OAuth Appot létrehozni.

## 6. Telepítés

```bash
npm run deploy
```

A Pages Functions miatt ne egyszerű dashboardos ZIP drag-and-drop telepítést használj.

## 7. Ellenőrzés

1. Nyisd meg a `/community.html` oldalt.
2. A tartalom olvasható belépés nélkül.
3. Kattints a `Sign in with GitHub / Belépés GitHubbal` gombra.
4. Belépés után a GitHub-neved és profilképed jelenik meg.
5. Új téma, válasz és szavazat csak bejelentkezve küldhető.
6. Frissítés és új telepítés után a D1-ben tárolt adatok megmaradnak.

## Adatbiztonság

A GitHub Client Secret soha ne kerüljön HTML-, JavaScript-, GitHub- vagy ZIP-fájlba. Kizárólag Cloudflare secretként tárold.
