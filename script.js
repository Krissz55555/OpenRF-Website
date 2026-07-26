(()=>{
  const toggle=document.getElementById('langToggle');
  const translatable=document.querySelectorAll('[data-en][data-hu]');
  const spans=toggle.querySelectorAll('span');
  const menuToggle=document.getElementById('menuToggle');
  const nav=document.getElementById('mainNav');
  let lang=localStorage.getItem('openrf-language')||'en';
  function applyLanguage(){
    document.documentElement.lang=lang;
    translatable.forEach(el=>{el.textContent=el.dataset[lang]});
    spans[0].classList.toggle('active',lang==='en');
    spans[1].classList.toggle('active',lang==='hu');
    localStorage.setItem('openrf-language',lang);
  }
  toggle.addEventListener('click',()=>{lang=lang==='en'?'hu':'en';applyLanguage()});
  menuToggle.addEventListener('click',()=>nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>nav.classList.remove('open')));
  document.getElementById('year').textContent=new Date().getFullYear();
  applyLanguage();
})();
