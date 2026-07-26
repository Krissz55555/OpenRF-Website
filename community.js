(() => {
  const API = '/api/community';
  const STORAGE_KEY = 'openrf-community-v1.3-fallback';
  const COMMENT_KEY = 'openrf-community-comments-v1.3-fallback';
  const VOTE_KEY = 'openrf-community-votes-v1.3';
  const CLIENT_KEY = 'openrf-community-client-id';

  const defaults = {
    discussions: [
      {id:'d1',type:'discussions',titleEn:'Best antenna setup for 433 MHz?',titleHu:'Milyen antenna a legjobb 433 MHz-re?',bodyEn:'Share your tested antenna types, cable lengths and real-world range results.',bodyHu:'Oszd meg a kipróbált antennatípusokat, kábelhosszokat és a valós hatótávolságot.',category:'RF / CC1101',author:'OpenRF Community',date:'2026-07-25T10:00:00.000Z',comments:0,votes:0},
      {id:'d2',type:'discussions',titleEn:'Home Assistant automation examples',titleHu:'Home Assistant automatizálási példák',bodyEn:'A place to share automations built around OpenRF RX slots and RAW replay.',bodyHu:'Ide kerülhetnek az OpenRF RX slotokra és RAW visszajátszásra épülő automatizmusok.',category:'Home Assistant',author:'OpenRF Community',date:'2026-07-25T10:10:00.000Z',comments:1,votes:0}
    ],
    questions: [
      {id:'q1',type:'questions',titleEn:'Why is the WebUI missing after flashing firmware.bin?',titleHu:'Miért hiányzik a WebUI a firmware.bin feltöltése után?',bodyEn:'The LittleFS image must also be flashed. The installation guide now highlights both required files.',bodyHu:'A LittleFS képfájlt is fel kell tölteni. A telepítési útmutató már külön kiemeli mindkét szükséges fájlt.',category:'Installation',author:'OpenRF Team',date:'2026-07-25T10:20:00.000Z',comments:1,votes:0,solved:true},
      {id:'q2',type:'questions',titleEn:'How should RAW matching tolerance be adjusted?',titleHu:'Hogyan érdemes beállítani a RAW jelillesztés toleranciáját?',bodyEn:'Describe your remote, frequency, sample count and the analyzer output so the community can help.',bodyHu:'Írd le a távirányítót, a frekvenciát, a mintaszámot és az Analyzer eredményét, hogy a közösség segíthessen.',category:'Firmware',author:'OpenRF Community',date:'2026-07-25T10:30:00.000Z',comments:0,votes:0,solved:false}
    ],
    ideas: [
      {id:'i1',type:'ideas',titleEn:'ESP32 dual-radio support',titleHu:'ESP32 két rádiós támogatás',bodyEn:'Use separate CC1101 modules for 433 MHz and 868 MHz in one OpenRF device.',bodyHu:'Külön CC1101 modul használata 433 MHz-hez és 868 MHz-hez egyetlen OpenRF eszközben.',category:'Hardware',author:'Community proposal',date:'2026-07-25T10:40:00.000Z',comments:0,votes:0,status:'planned'},
      {id:'i2',type:'ideas',titleEn:'Native 868 MHz profile',titleHu:'Natív 868 MHz-es profil',bodyEn:'Add frequency presets, documentation and hardware recommendations for 868 MHz projects.',bodyHu:'Frekvenciaprofilok, dokumentáció és hardverajánlások hozzáadása a 868 MHz-es projektekhez.',category:'RF / CC1101',author:'Community proposal',date:'2026-07-25T10:50:00.000Z',comments:0,votes:0,status:'review'},
      {id:'i3',type:'ideas',titleEn:'Export Analyzer captures',titleHu:'Analyzer mérések exportálása',bodyEn:'Export captured RF samples as JSON or CSV for deeper offline analysis and issue reports.',bodyHu:'A rögzített RF minták exportálása JSON vagy CSV formátumban részletesebb elemzéshez és hibajelentésekhez.',category:'Firmware',author:'Community proposal',date:'2026-07-25T11:00:00.000Z',comments:0,votes:0,status:'progress'},
      {id:'i4',type:'ideas',titleEn:'Hungarian and English documentation parity',titleHu:'A magyar és angol dokumentáció teljes egyezése',bodyEn:'Keep every stable documentation page available and updated in both languages.',bodyHu:'Minden stabil dokumentációs oldal legyen elérhető és naprakész mindkét nyelven.',category:'Website',author:'OpenRF Team',date:'2026-07-25T11:10:00.000Z',comments:0,votes:0,status:'released'}
    ],
    stories: [
      {id:'s1',type:'stories',titleEn:'From Pool Light to OpenRF Platform',titleHu:'A medencelámpától az OpenRF Platformig',bodyEn:'OpenRF began with a proprietary 433 MHz RGB pool-light remote. Solving that one practical problem led to RAW learning, replay, MQTT, Home Assistant Discovery, OTA and finally a reusable open platform.',bodyHu:'Az OpenRF egy saját 433 MHz-es RGB medencelámpa-távirányítóval kezdődött. Ennek az egy gyakorlati problémának a megoldásából született meg a RAW tanítás, a visszajátszás, az MQTT, a Home Assistant Discovery, az OTA, végül pedig egy újrahasználható nyílt platform.',category:'General',author:'Krisztián · OpenRF',date:'2026-07-25T11:20:00.000Z',comments:1,votes:0,featured:true},
      {id:'s2',type:'stories',titleEn:'Why the first stable version uses ESP8266',titleHu:'Miért ESP8266-ra készült az első stabil verzió?',bodyEn:'The first stable release gives new purpose to reliable ESP8266 boards that many makers already have in a drawer.',bodyHu:'Az első stabil kiadás új feladatot ad azoknak a megbízható ESP8266 paneleknek, amelyek sok makernél már ott lapulnak a fiókban.',category:'Hardware',author:'OpenRF Team',date:'2026-07-25T11:30:00.000Z',comments:0,votes:0}
    ]
  };

  const fallbackComments = {
    q1:[{id:'c_q1_1',postId:'q1',author:'OpenRF Team',body:'Both firmware.bin and littlefs.bin are required. Flashing only the firmware starts the device, but the web assets are stored in LittleFS.',date:'2026-07-25T12:00:00.000Z'}],
    d2:[{id:'c_d2_1',postId:'d2',author:'OpenRF Team',body:'Feel free to share YAML automations that use the RX slots. Remove any private MQTT credentials before posting.',date:'2026-07-25T12:10:00.000Z'}],
    s1:[{id:'c_s1_1',postId:'s1',author:'OpenRF Team',body:'This pool-light controller became the first real OpenRF showcase project.',date:'2026-07-25T12:20:00.000Z'}]
  };

  const state = { data: structuredClone(defaults), backendOnline: false, active: 'discussions', query: '', selectedPost: null, showHidden: false };
  const language = () => localStorage.getItem('openrf-language') || 'en';
  const t = (item, base) => item[base + (language()==='hu'?'Hu':'En')] || item[base+'En'] || '';
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const clientId = (() => {
    let value = localStorage.getItem(CLIENT_KEY);
    if (!value) { value = crypto.randomUUID(); localStorage.setItem(CLIENT_KEY, value); }
    return value;
  })();
  const apiFetch = (path, options = {}) => fetch(`${API}${path}`, {
    ...options,
    headers: {'content-type':'application/json','x-openrf-client':clientId,...(options.headers || {})}
  });

  const statusText = status => ({
    review:{en:'Under review',hu:'Vizsgálat alatt'},planned:{en:'Planned',hu:'Tervezett'},progress:{en:'In progress',hu:'Folyamatban'},released:{en:'Released',hu:'Kiadva'}
  }[status]?.[language()] || status);
  const formatDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0,10);
    return new Intl.DateTimeFormat(language()==='hu'?'hu-HU':'en-GB',{year:'numeric',month:'short',day:'numeric'}).format(date);
  };

  function setBackendStatus(online) {
    state.backendOnline = online;
    const el = document.getElementById('backendStatus');
    el.classList.toggle('online', online);
    el.classList.toggle('offline', !online);
    el.textContent = online ? (language()==='hu'?'● D1 adatbázis online':'● D1 database online') : (language()==='hu'?'● Helyi tesztmód':'● Local test mode');
  }

  function fallbackData() {
    const local = readJson(STORAGE_KEY, {discussions:[],questions:[],ideas:[],stories:[]});
    return Object.fromEntries(Object.keys(defaults).map(key => [key, [...(local[key] || []), ...defaults[key]]]));
  }

  async function loadPosts() {
    try {
      const response = await apiFetch(state.showHidden ? '/posts?include_hidden=1' : '/posts');
      if (!response.ok) throw new Error('API unavailable');
      const payload = await response.json();
      const grouped = {discussions:[],questions:[],ideas:[],stories:[]};
      payload.posts.forEach(post => grouped[post.type]?.push(post));
      state.data = grouped;
      setBackendStatus(true);
    } catch (error) {
      console.warn('OpenRF Community API fallback:', error);
      state.data = fallbackData();
      setBackendStatus(false);
    }
    render();
  }

  function card(item, type) {
    const localVotes = readJson(VOTE_KEY, {});
    const isVoted = !!localVotes[item.id];
    const badges = [
      item.solved ? `<span class="post-badge solved">✓ ${language()==='hu'?'Megoldva':'Solved'}</span>` : '',
      item.status ? `<span class="status-badge ${escapeHtml(item.status)}">${escapeHtml(statusText(item.status))}</span>` : '',
      item.pinned ? `<span class="post-badge pinned">📌 ${language()==='hu'?'Kitűzve':'Pinned'}</span>` : '',
      item.locked ? `<span class="post-badge locked">🔒 ${language()==='hu'?'Lezárva':'Locked'}</span>` : '',
      item.hidden ? `<span class="post-badge hidden">🙈 ${language()==='hu'?'Rejtett':'Hidden'}</span>` : '',
      item.featured ? `<span class="post-badge featured">★ ${language()==='hu'?'Kiemelt':'Featured'}</span>` : ''
    ].join('');
    const vote = type === 'ideas' ? `<button class="vote-button ${isVoted?'voted':''}" data-vote="${escapeHtml(item.id)}" type="button" aria-label="Vote"><span>▲</span><b>${Number(item.votes || 0)}</b><small>${language()==='hu'?'szavazat':'votes'}</small></button>` : '';
    return `<article class="community-post" data-open="${escapeHtml(item.id)}" data-type="${escapeHtml(type)}" tabindex="0">
      ${vote}
      <div class="post-content">
        <div class="post-badges">${badges}</div>
        <h3>${escapeHtml(t(item,'title'))}</h3>
        <p>${escapeHtml(t(item,'body'))}</p>
        <div class="post-meta"><span>${escapeHtml(item.category)} · ${escapeHtml(item.author)} · ${escapeHtml(formatDate(item.date))}</span><span>💬 ${Number(item.comments || 0)}</span></div>
      </div>
    </article>`;
  }

  function render() {
    Object.keys(state.data).forEach(type => {
      const filtered = state.data[type].filter(item => !state.query || `${t(item,'title')} ${t(item,'body')} ${item.category}`.toLowerCase().includes(state.query));
      const listId = {discussions:'discussionList',questions:'questionList',ideas:'ideaList',stories:'storyList'}[type];
      const countId = {discussions:'discussionCount',questions:'questionCount',ideas:'ideaCount',stories:'storyCount'}[type];
      const list = document.getElementById(listId);
      document.getElementById(countId).textContent = filtered.length;
      list.innerHTML = filtered.length ? filtered.map(item => card(item,type)).join('') : `<div class="empty-state">${language()==='hu'?'Nincs a keresésnek megfelelő bejegyzés.':'No posts match your search.'}</div>`;
    });

    document.querySelectorAll('[data-vote]').forEach(button => button.addEventListener('click', async event => {
      event.stopPropagation();
      await toggleVote(button.dataset.vote, button);
    }));
    document.querySelectorAll('[data-open]').forEach(cardEl => {
      cardEl.addEventListener('click', () => openThread(cardEl.dataset.open, cardEl.dataset.type));
      cardEl.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') openThread(cardEl.dataset.open, cardEl.dataset.type); });
    });
  }

  async function toggleVote(id, button) {
    if (state.backendOnline && !window.OpenRFAuth?.requireLogin()) return;
    button.disabled = true;
    const localVotes = readJson(VOTE_KEY, {});
    try {
      if (state.backendOnline) {
        const response = await apiFetch(`/posts/${encodeURIComponent(id)}/vote`, {method:'POST',body:'{}'});
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Vote failed');
        localVotes[id] = payload.voted;
        if (!payload.voted) delete localVotes[id];
        const item = state.data.ideas.find(entry => entry.id === id);
        if (item) item.votes = payload.votes;
      } else {
        localVotes[id] = !localVotes[id];
        if (!localVotes[id]) delete localVotes[id];
        const item = state.data.ideas.find(entry => entry.id === id);
        if (item) item.votes = Math.max(0, Number(item.votes || 0) + (localVotes[id] ? 1 : -1));
      }
      writeJson(VOTE_KEY, localVotes);
      render();
    } catch (error) {
      alert(language()==='hu'?'A szavazat mentése nem sikerült.':'The vote could not be saved.');
    } finally {
      button.disabled = false;
    }
  }

  function setTab(tab) {
    state.active = tab;
    document.querySelectorAll('.hub-tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
    document.querySelectorAll('.hub-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === tab));
    document.getElementById('postType').value = tab;
    syncCustomSelect(document.getElementById('postType'));
  }

  const composer = document.getElementById('composerModal');
  const threadModal = document.getElementById('threadModal');
  const threadModeration = document.getElementById('threadModeration');
  const pinTopicButton = document.getElementById('pinTopicButton');
  const lockTopicButton = document.getElementById('lockTopicButton');
  const featureTopicButton = document.getElementById('featureTopicButton');
  const hideTopicButton = document.getElementById('hideTopicButton');
  const deleteTopicButton = document.getElementById('deleteTopicButton');
  const toggleHiddenTopicsButton = document.getElementById('toggleHiddenTopicsButton');
  const lockedTopicNotice = document.getElementById('lockedTopicNotice');
  const commentForm = document.getElementById('commentForm');
  const openComposer = () => {
    if (state.backendOnline && !window.OpenRFAuth?.requireLogin()) return;
    composer.hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('postType').value = state.active;
    syncCustomSelect(document.getElementById('postType'));
    document.getElementById('postAuthor').value = window.OpenRFAuth?.state.user?.display_name || window.OpenRFAuth?.state.user?.login || '';
    document.getElementById('postTitle').focus();
  };
  const closeComposer = () => { composer.hidden = true; document.body.classList.remove('modal-open'); };
  const closeThread = () => {
      threadModal.hidden = true;
      state.selectedPost = null;

      if (threadModeration) threadModeration.hidden = true;
      if (lockedTopicNotice) lockedTopicNotice.hidden = true;

      document.body.classList.remove('modal-open');
  };

  function buttonLabel(button, en, hu) {
    if (!button) return;
    button.textContent = language() === 'hu' ? hu : en;
  }

  function syncModerationButtons(item) {
    buttonLabel(pinTopicButton, item.pinned ? '📌 Unpin topic' : '📌 Pin topic', item.pinned ? '📌 Kitűzés megszüntetése' : '📌 Téma kitűzése');
    buttonLabel(lockTopicButton, item.locked ? '🔓 Unlock topic' : '🔒 Lock topic', item.locked ? '🔓 Téma feloldása' : '🔒 Téma lezárása');
    buttonLabel(featureTopicButton, item.featured ? '☆ Remove feature' : '⭐ Feature topic', item.featured ? '☆ Kiemelés megszüntetése' : '⭐ Téma kiemelése');
    buttonLabel(hideTopicButton, item.hidden ? '♻ Restore topic' : '🙈 Hide topic', item.hidden ? '♻ Téma visszaállítása' : '🙈 Téma elrejtése');
    buttonLabel(deleteTopicButton, '🗑 Delete topic', '🗑 Téma törlése');
  }

  function syncLockedState(item) {
    if (!commentForm || !lockedTopicNotice) return;
    commentForm.hidden = !!item.locked;
    lockedTopicNotice.hidden = !item.locked;
    lockedTopicNotice.textContent = language() === 'hu'
      ? '🔒 Ez a téma le van zárva. Új válasz nem küldhető.'
      : '🔒 This topic is locked. New replies cannot be posted.';
  }

  async function moderateSelected(action) {
    if (!state.selectedPost) return;
    const buttons = [pinTopicButton, lockTopicButton, featureTopicButton, hideTopicButton, deleteTopicButton];
    buttons.forEach(button => { if (button) button.disabled = true; });
    try {
      const response = await apiFetch(`/posts/${encodeURIComponent(state.selectedPost.id)}/moderate`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Moderation failed');
      state.selectedPost = result.post;
      if (action === 'hide' || action === 'restore') {
        closeThread();
        await loadPosts();
        return;
      }
      const list = state.data[result.post.type];
      const index = list.findIndex(entry => entry.id === result.post.id);
      if (index >= 0) list[index] = result.post;
      syncModerationButtons(result.post);
      syncLockedState(result.post);
      render();
    } catch (error) {
      alert(error.message || (language() === 'hu' ? 'A moderációs művelet nem sikerült.' : 'The moderation action failed.'));
    } finally {
      buttons.forEach(button => { if (button) button.disabled = false; });
    }
  }

  async function openThread(id, type) {
    const item = state.data[type].find(entry => entry.id === id);
    if (!item) return;
    state.selectedPost = item;

    const isAdmin = !!(window.OpenRFAuth?.state.user && Number(window.OpenRFAuth.state.user.is_admin || 0) === 1);
    if (threadModeration) threadModeration.hidden = !isAdmin;
    syncModerationButtons(item);
    syncLockedState(item);

    document.getElementById('threadContent').innerHTML = `
      <span class="section-kicker">${escapeHtml(item.category)}</span>
      <h2 id="threadTitle">${escapeHtml(t(item,'title'))}</h2>
      <p class="thread-body">${escapeHtml(t(item,'body'))}</p>
      <div class="post-meta"><span>${escapeHtml(item.author)} · ${escapeHtml(formatDate(item.date))}</span></div>`;
    document.getElementById('commentAuthor').value = window.OpenRFAuth?.state.user?.display_name || window.OpenRFAuth?.state.user?.login || '';
    threadModal.hidden = false;
    document.body.classList.add('modal-open');
    await loadComments(id);
  }

  async function loadComments(postId) {
    const list = document.getElementById('commentList');
    list.innerHTML = `<div class="empty-state">${language()==='hu'?'Válaszok betöltése…':'Loading replies…'}</div>`;
    let comments;
    if (state.backendOnline) {
      try {
        const response = await apiFetch(`/posts/${encodeURIComponent(postId)}/comments`);
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Comments unavailable');
        comments = payload.comments;
      } catch {
        comments = [];
      }
    } else {
      const local = readJson(COMMENT_KEY, {});
      comments = [...(fallbackComments[postId] || []), ...(local[postId] || [])];
    }
    list.innerHTML = comments.length ? comments.map(comment => `<article class="comment-card"><div><strong>${escapeHtml(comment.author)}</strong><time>${escapeHtml(formatDate(comment.date))}</time></div><p>${escapeHtml(comment.body)}</p></article>`).join('') : `<div class="empty-state">${language()==='hu'?'Még nincs válasz. Legyél te az első!':'No replies yet. Be the first!'}</div>`;
  }

  document.querySelectorAll('.hub-tab').forEach(button => button.addEventListener('click', () => setTab(button.dataset.tab)));
  document.querySelector('.story-jump').addEventListener('click', () => { setTab('stories'); document.querySelector('.community-workspace').scrollIntoView({behavior:'smooth'}); });
  document.getElementById('hubSearch').addEventListener('input', event => { state.query = event.target.value.trim().toLowerCase(); render(); });
  document.getElementById('openComposer').addEventListener('click', openComposer);
  document.getElementById('closeComposer').addEventListener('click', closeComposer);
  document.getElementById('cancelComposer').addEventListener('click', closeComposer);
  document.getElementById('closeThread').addEventListener('click', closeThread);
  composer.addEventListener('click', event => { if (event.target === composer) closeComposer(); });
  threadModal.addEventListener('click', event => { if (event.target === threadModal) closeThread(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { if (!composer.hidden) closeComposer(); if (!threadModal.hidden) closeThread(); } });

  document.getElementById('communityForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (state.backendOnline && !window.OpenRFAuth?.requireLogin()) return;
    const submit = event.submitter;
    submit.disabled = true;
    const payload = {
      type: document.getElementById('postType').value,
      author: document.getElementById('postAuthor').value.trim(),
      title: document.getElementById('postTitle').value.trim(),
      category: document.getElementById('postCategory').value,
      body: document.getElementById('postBody').value.trim(),
      language: language(),
      website: document.getElementById('postWebsite').value
    };
    localStorage.setItem('openrf-community-author', payload.author);
    try {
      if (state.backendOnline) {
        const response = await apiFetch('/posts', {method:'POST',body:JSON.stringify(payload)});
        const result = await response.json();
        if (response.status === 401) { window.OpenRFAuth?.requireLogin(); throw new Error(result.error || 'Sign in required'); }
        if (!response.ok) throw new Error(result.error || 'Publish failed');
        state.data[payload.type].unshift(result.post);
      } else {
        const local = readJson(STORAGE_KEY, {discussions:[],questions:[],ideas:[],stories:[]});
        const item = {id:`local_${Date.now()}`,type:payload.type,titleEn:payload.title,titleHu:payload.title,bodyEn:payload.body,bodyHu:payload.body,category:payload.category,author:payload.author,date:new Date().toISOString(),comments:0,votes:0,...(payload.type==='ideas'?{status:'review'}:{}),...(payload.type==='questions'?{solved:false}:{})};
        local[payload.type].unshift(item);
        writeJson(STORAGE_KEY, local);
        state.data[payload.type].unshift(item);
      }
      event.target.reset();
      syncCustomSelect(document.getElementById('postType'));
      syncCustomSelect(document.getElementById('postCategory'));
      closeComposer();
      setTab(payload.type);
      render();
    } catch (error) {
      alert(error.message || (language()==='hu'?'A bejegyzés mentése nem sikerült.':'The post could not be saved.'));
    } finally {
      submit.disabled = false;
    }
  });

  document.getElementById('commentForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (state.backendOnline && !window.OpenRFAuth?.requireLogin()) return;
    if (!state.selectedPost) return;
    const submit = event.submitter;
    submit.disabled = true;
    const payload = {
      author: document.getElementById('commentAuthor').value.trim(),
      body: document.getElementById('commentBody').value.trim(),
      website: document.getElementById('commentWebsite').value
    };
    localStorage.setItem('openrf-community-author', payload.author);
    try {
      if (state.backendOnline) {
        const response = await apiFetch(`/posts/${encodeURIComponent(state.selectedPost.id)}/comments`, {method:'POST',body:JSON.stringify(payload)});
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Reply failed');
      } else {
        const local = readJson(COMMENT_KEY, {});
        local[state.selectedPost.id] = local[state.selectedPost.id] || [];
        local[state.selectedPost.id].push({id:`local_comment_${Date.now()}`,postId:state.selectedPost.id,author:payload.author,body:payload.body,date:new Date().toISOString()});
        writeJson(COMMENT_KEY, local);
      }
      state.selectedPost.comments = Number(state.selectedPost.comments || 0) + 1;
      event.target.reset();
      document.getElementById('commentAuthor').value = payload.author;
      await loadComments(state.selectedPost.id);
      render();
    } catch (error) {
      alert(error.message || (language()==='hu'?'A válasz mentése nem sikerült.':'The reply could not be saved.'));
    } finally {
      submit.disabled = false;
    }
  });

  pinTopicButton?.addEventListener('click', () => moderateSelected(state.selectedPost?.pinned ? 'unpin' : 'pin'));
  lockTopicButton?.addEventListener('click', () => moderateSelected(state.selectedPost?.locked ? 'unlock' : 'lock'));
  featureTopicButton?.addEventListener('click', () => moderateSelected(state.selectedPost?.featured ? 'unfeature' : 'feature'));
  hideTopicButton?.addEventListener('click', () => {
    if (!state.selectedPost) return;
    const action = state.selectedPost.hidden ? 'restore' : 'hide';
    const message = state.selectedPost.hidden
      ? (language() === 'hu' ? 'Visszaállítod ezt a témát?' : 'Restore this topic?')
      : (language() === 'hu' ? 'Biztosan elrejted ezt a témát?' : 'Hide this topic?');
    if (window.confirm(message)) moderateSelected(action);
  });

  deleteTopicButton?.addEventListener('click', async () => {
    if (!state.selectedPost) return;
    const title = t(state.selectedPost, 'title');
    const first = window.confirm(language() === 'hu'
      ? `Végleg törlöd ezt a témát?

${title}`
      : `Permanently delete this topic?

${title}`);
    if (!first) return;
    const typed = window.prompt(language() === 'hu' ? 'A végleges törléshez írd be: TÖRLÉS' : 'Type DELETE to permanently remove it:');
    const valid = language() === 'hu' ? typed === 'TÖRLÉS' : typed === 'DELETE';
    if (!valid) return;
    deleteTopicButton.disabled = true;
    try {
      const response = await apiFetch(`/posts/${encodeURIComponent(state.selectedPost.id)}`, { method: 'DELETE', body: '{}' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Delete failed');
      closeThread();
      await loadPosts();
    } catch (error) {
      alert(error.message || (language() === 'hu' ? 'A téma törlése nem sikerült.' : 'The topic could not be deleted.'));
      deleteTopicButton.disabled = false;
    }
  });

  toggleHiddenTopicsButton?.addEventListener('click', async () => {
    state.showHidden = !state.showHidden;
    buttonLabel(toggleHiddenTopicsButton,
      state.showHidden ? '← Show public topics' : '🙈 Show hidden topics',
      state.showHidden ? '← Nyilvános témák megjelenítése' : '🙈 Rejtett témák megjelenítése');
    closeThread();
    await loadPosts();
  });

  // v1.4.3: browser-independent custom dropdowns.
  // Native <select> popup styling is controlled by the operating system in Chrome,
  // so we keep the real select for form data and render an accessible custom listbox.
  const customSelects = new Map();

  function optionLabel(option) {
    return option.dataset[language() === 'hu' ? 'hu' : 'en'] || option.textContent;
  }

  function syncCustomSelect(select) {
    const ui = customSelects.get(select.id);
    if (!ui) return;
    const selected = select.options[select.selectedIndex];
    ui.buttonText.textContent = selected ? optionLabel(selected) : '';
    ui.items.forEach((item, index) => {
      const active = index === select.selectedIndex;
      item.classList.toggle('selected', active);
      item.setAttribute('aria-selected', String(active));
      item.textContent = optionLabel(select.options[index]);
    });
  }

  function closeAllCustomSelects(except = null) {
    customSelects.forEach(ui => {
      if (ui.wrapper !== except) {
        ui.wrapper.classList.remove('open');
        ui.button.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initCustomSelect(select) {
    select.classList.add('native-select-hidden');

    const wrapper = document.createElement('div');
    wrapper.className = 'openrf-select';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'openrf-select-button';
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    const buttonText = document.createElement('span');
    const arrow = document.createElement('span');
    arrow.className = 'openrf-select-arrow';
    arrow.textContent = '⌄';
    button.append(buttonText, arrow);

    const list = document.createElement('div');
    list.className = 'openrf-select-list';
    list.setAttribute('role', 'listbox');
    const items = [...select.options].map((option, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'openrf-select-option';
      item.setAttribute('role', 'option');
      item.addEventListener('click', () => {
        select.selectedIndex = index;
        select.dispatchEvent(new Event('change', {bubbles:true}));
        syncCustomSelect(select);
        closeAllCustomSelects();
        button.focus();
      });
      list.appendChild(item);
      return item;
    });

    button.addEventListener('click', () => {
      const opening = !wrapper.classList.contains('open');
      closeAllCustomSelects(wrapper);
      wrapper.classList.toggle('open', opening);
      button.setAttribute('aria-expanded', String(opening));
      if (opening) items[select.selectedIndex]?.focus();
    });

    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        select.selectedIndex = (select.selectedIndex + delta + select.options.length) % select.options.length;
        select.dispatchEvent(new Event('change', {bubbles:true}));
        syncCustomSelect(select);
      }
    });

    items.forEach((item, index) => item.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeAllCustomSelects(); button.focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        items[(index + delta + items.length) % items.length].focus();
      }
      if (event.key === 'Home') { event.preventDefault(); items[0].focus(); }
      if (event.key === 'End') { event.preventDefault(); items[items.length - 1].focus(); }
    }));

    wrapper.append(button, list);
    select.insertAdjacentElement('afterend', wrapper);
    customSelects.set(select.id, {wrapper, button, buttonText, items});
    select.addEventListener('change', () => syncCustomSelect(select));
    syncCustomSelect(select);
  }

  document.querySelectorAll('.composer-modal select').forEach(initCustomSelect);
  document.addEventListener('click', event => {
    if (!event.target.closest('.openrf-select')) closeAllCustomSelects();
  });

  const observer = new MutationObserver(() => {
    const search = document.getElementById('hubSearch');
    search.placeholder = search.dataset[language()==='hu'?'placeholderHu':'placeholderEn'];
    setBackendStatus(state.backendOnline);
    customSelects.forEach((_, id) => syncCustomSelect(document.getElementById(id)));
    buttonLabel(toggleHiddenTopicsButton, state.showHidden ? '← Show public topics' : '🙈 Show hidden topics', state.showHidden ? '← Nyilvános témák megjelenítése' : '🙈 Rejtett témák megjelenítése');
    render();
    if (state.selectedPost && !threadModal.hidden) openThread(state.selectedPost.id, state.selectedPost.type);
  });
  observer.observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  document.getElementById('hubSearch').placeholder = document.getElementById('hubSearch').dataset[language()==='hu'?'placeholderHu':'placeholderEn'];
  loadPosts();
})();
