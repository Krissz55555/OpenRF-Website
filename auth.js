(() => {
  const state = {user:null, loaded:false};
  const language = () => localStorage.getItem('openrf-language') || 'en';
  const el = id => document.getElementById(id);

  function render() {
    const login = el('githubLogin');
    const menu = el('userMenu');
    const hint = el('authHint');
    if (!login || !menu) return;
    login.hidden = !!state.user;
    menu.hidden = !state.user;
    if (state.user) {
      el('userAvatar').src = state.user.avatar_url || 'assets/openrf-platform-mark.png';
      el('userName').textContent = state.user.display_name || state.user.login;
      if (hint) hint.textContent = language()==='hu' ? `Belépve: ${state.user.display_name || state.user.login}` : `Signed in as ${state.user.display_name || state.user.login}`;
      ['postAuthor','commentAuthor'].forEach(id => { if (el(id)) el(id).value = state.user.display_name || state.user.login; });
    } else if (hint) {
      hint.textContent = language()==='hu' ? 'Íráshoz, válaszhoz és szavazáshoz jelentkezz be' : 'Sign in to post, reply or vote';
    }
  }

  async function load() {
    try {
      const response = await fetch('/api/auth/me', {headers:{accept:'application/json'}});
      const data = await response.json();
      state.user = data.authenticated ? data.user : null;
    } catch { state.user = null; }
    state.loaded = true;
    render();
    window.dispatchEvent(new CustomEvent('openrf-auth-ready',{detail:state}));
    return state.user;
  }

  function requireLogin() {
    if (state.user) return true;
    const hu = language()==='hu';
    if (confirm(hu ? 'Ehhez GitHub-bejelentkezés szükséges. Megnyitjuk a bejelentkezést?' : 'GitHub sign-in is required. Open the sign-in page?')) {
      location.href='/api/auth/github/start';
    }
    return false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    el('logoutButton')?.addEventListener('click', async () => {
      await fetch('/api/auth/logout',{method:'POST'});
      state.user=null; render(); location.reload();
    });
    load();
  });

  window.OpenRFAuth = {state,load,render,requireLogin};
})();
