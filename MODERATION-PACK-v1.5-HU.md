# OpenRF Community Moderation Pack v1.5

Új funkciók:
- rejtett témák admin nézete és visszaállítása
- kitűzés / kitűzés megszüntetése
- lezárás / feloldás
- kiemelés / kiemelés megszüntetése
- végleges törlés kétlépcsős megerősítéssel

## Kötelező D1 migráció

A deploy előtt vagy után egyszer futtasd:

```bash
npx wrangler d1 migrations apply openrf-community --remote
```

Ha a D1 adatbázisod neve eltér, a `wrangler.jsonc` fájlban szereplő `database_name` értéket használd.

Ez a `0003_moderation.sql` migrációt alkalmazza, amely hozzáadja az `is_pinned` és `is_locked` mezőket.
