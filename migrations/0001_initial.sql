PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('discussions','questions','ideas','stories')),
  title_en TEXT NOT NULL,
  title_hu TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_hu TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  author TEXT NOT NULL,
  created_at TEXT NOT NULL,
  solved INTEGER NOT NULL DEFAULT 0 CHECK (solved IN (0,1)),
  status TEXT CHECK (status IS NULL OR status IN ('review','planned','progress','released')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0,1)),
  source_language TEXT NOT NULL DEFAULT 'en' CHECK (source_language IN ('en','hu')),
  is_hidden INTEGER NOT NULL DEFAULT 0 CHECK (is_hidden IN (0,1))
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_hidden INTEGER NOT NULL DEFAULT 0 CHECK (is_hidden IN (0,1)),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS votes (
  post_id TEXT NOT NULL,
  voter_key TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (post_id, voter_key),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rate_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_key TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_type_created ON posts(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_votes_post ON votes(post_id);
CREATE INDEX IF NOT EXISTS idx_rate_events_lookup ON rate_events(client_key, action, created_at);

INSERT OR IGNORE INTO posts
(id,type,title_en,title_hu,body_en,body_hu,category,author,created_at,solved,status,featured,source_language,is_hidden)
VALUES
('d1','discussions','Best antenna setup for 433 MHz?','Milyen antenna a legjobb 433 MHz-re?','Share your tested antenna types, cable lengths and real-world range results.','Oszd meg a kipróbált antennatípusokat, kábelhosszokat és a valós hatótávolságot.','RF / CC1101','OpenRF Community','2026-07-25T10:00:00.000Z',0,NULL,0,'en',0),
('d2','discussions','Home Assistant automation examples','Home Assistant automatizálási példák','A place to share automations built around OpenRF RX slots and RAW replay.','Ide kerülhetnek az OpenRF RX slotokra és RAW visszajátszásra épülő automatizmusok.','Home Assistant','OpenRF Community','2026-07-25T10:10:00.000Z',0,NULL,0,'en',0),
('q1','questions','Why is the WebUI missing after flashing firmware.bin?','Miért hiányzik a WebUI a firmware.bin feltöltése után?','The LittleFS image must also be flashed. The installation guide now highlights both required files.','A LittleFS képfájlt is fel kell tölteni. A telepítési útmutató már külön kiemeli mindkét szükséges fájlt.','Installation','OpenRF Team','2026-07-25T10:20:00.000Z',1,NULL,0,'en',0),
('q2','questions','How should RAW matching tolerance be adjusted?','Hogyan érdemes beállítani a RAW jelillesztés toleranciáját?','Describe your remote, frequency, sample count and the analyzer output so the community can help.','Írd le a távirányítót, a frekvenciát, a mintaszámot és az Analyzer eredményét, hogy a közösség segíthessen.','Firmware','OpenRF Community','2026-07-25T10:30:00.000Z',0,NULL,0,'en',0),
('i1','ideas','ESP32 dual-radio support','ESP32 két rádiós támogatás','Use separate CC1101 modules for 433 MHz and 868 MHz in one OpenRF device.','Külön CC1101 modul használata 433 MHz-hez és 868 MHz-hez egyetlen OpenRF eszközben.','Hardware','Community proposal','2026-07-25T10:40:00.000Z',0,'planned',0,'en',0),
('i2','ideas','Native 868 MHz profile','Natív 868 MHz-es profil','Add frequency presets, documentation and hardware recommendations for 868 MHz projects.','Frekvenciaprofilok, dokumentáció és hardverajánlások hozzáadása a 868 MHz-es projektekhez.','RF / CC1101','Community proposal','2026-07-25T10:50:00.000Z',0,'review',0,'en',0),
('i3','ideas','Export Analyzer captures','Analyzer mérések exportálása','Export captured RF samples as JSON or CSV for deeper offline analysis and issue reports.','A rögzített RF minták exportálása JSON vagy CSV formátumban részletesebb elemzéshez és hibajelentésekhez.','Firmware','Community proposal','2026-07-25T11:00:00.000Z',0,'progress',0,'en',0),
('i4','ideas','Hungarian and English documentation parity','A magyar és angol dokumentáció teljes egyezése','Keep every stable documentation page available and updated in both languages.','Minden stabil dokumentációs oldal legyen elérhető és naprakész mindkét nyelven.','Website','OpenRF Team','2026-07-25T11:10:00.000Z',0,'released',0,'en',0),
('s1','stories','From Pool Light to OpenRF Platform','A medencelámpától az OpenRF Platformig','OpenRF began with a proprietary 433 MHz RGB pool-light remote. Solving that one practical problem led to RAW learning, replay, MQTT, Home Assistant Discovery, OTA and finally a reusable open platform.','Az OpenRF egy saját 433 MHz-es RGB medencelámpa-távirányítóval kezdődött. Ennek az egy gyakorlati problémának a megoldásából született meg a RAW tanítás, a visszajátszás, az MQTT, a Home Assistant Discovery, az OTA, végül pedig egy újrahasználható nyílt platform.','General','Krisztián · OpenRF','2026-07-25T11:20:00.000Z',0,NULL,1,'hu',0),
('s2','stories','Why the first stable version uses ESP8266','Miért ESP8266-ra készült az első stabil verzió?','The first stable release gives new purpose to reliable ESP8266 boards that many makers already have in a drawer.','Az első stabil kiadás új feladatot ad azoknak a megbízható ESP8266 paneleknek, amelyek sok makernél már ott lapulnak a fiókban.','Hardware','OpenRF Team','2026-07-25T11:30:00.000Z',0,NULL,0,'en',0);

INSERT OR IGNORE INTO comments (id,post_id,author,body,created_at,is_hidden) VALUES
('c_q1_1','q1','OpenRF Team','Both firmware.bin and littlefs.bin are required. Flashing only the firmware starts the device, but the web assets are stored in LittleFS.','2026-07-25T12:00:00.000Z',0),
('c_d2_1','d2','OpenRF Team','Feel free to share YAML automations that use the RX slots. Remove any private MQTT credentials before posting.','2026-07-25T12:10:00.000Z',0),
('c_s1_1','s1','OpenRF Team','This pool-light controller became the first real OpenRF showcase project.','2026-07-25T12:20:00.000Z',0);
