// Tabs (one page at a time, kept in the URL), the project filter, and the project detail panels.
(() => {
  // ---------- tabs ----------
  const pages = [...document.querySelectorAll('.page')];
  const tabs = [...document.querySelectorAll('.tab')];
  const show = () => {
    const id = location.hash.slice(1);
    const page = pages.find((p) => p.id === id) || pages[0];
    pages.forEach((p) => p.classList.toggle('is-on', p === page));
    tabs.forEach((t) => (t.dataset.page === page.id ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current')));
    document.querySelector('.pages').scrollTop = 0;
  };
  addEventListener('hashchange', show);
  show();

  // ---------- filter ----------
  const cards = [...document.querySelectorAll('.card')];
  const box = document.getElementById('filters');
  const techs = [...new Set(cards.flatMap((c) => c.dataset.tech.split(',')))].sort((a, b) => a.localeCompare(b));
  box.insertAdjacentHTML('beforeend', techs.map((t) =>
    `<label><input type="checkbox" value="${t}"><span>${t}</span></label>`).join(''));
  const checks = [...box.querySelectorAll('input')];
  const crumb = document.getElementById('crumb-text');
  const empty = document.getElementById('empty');

  const apply = () => {
    const on = checks.filter((c) => c.checked).map((c) => c.value);
    let shown = 0;
    cards.forEach((card) => {
      const t = card.dataset.tech.split(',');
      const hit = !on.length || on.some((x) => t.includes(x));
      card.hidden = !hit;
      if (hit) shown++;
    });
    crumb.textContent = on.length ? on.join('; ') : 'all';
    empty.hidden = shown > 0;
  };
  checks.forEach((c) => c.addEventListener('change', apply));
  document.getElementById('crumb-clear').addEventListener('click', () => { checks.forEach((c) => (c.checked = false)); apply(); });

  const head = document.querySelector('.side-head');
  const setOpen = (open) => { head.setAttribute('aria-expanded', String(open)); box.hidden = !open; };
  head.addEventListener('click', () => setOpen(head.getAttribute('aria-expanded') !== 'true'));
  if (matchMedia('(max-width: 760px)').matches) setOpen(false);  // phones: projects first, filters on tap

  // ---------- about-me: file tree ----------
  const files = [...document.querySelectorAll('.file[data-file]')];
  files.forEach((f) => f.addEventListener('click', () => {
    files.forEach((x) => x.setAttribute('aria-pressed', String(x === f)));
    document.querySelectorAll('[data-file-body]').forEach((b) => (b.hidden = b.dataset.fileBody !== f.dataset.file));
    document.getElementById('file-name').textContent = f.dataset.file;
    document.querySelectorAll('[data-aside]').forEach((b) => (b.hidden = b.dataset.aside !== f.dataset.file));
    document.querySelectorAll('.video video').forEach((v) => v.pause());
  }));

  // skills jump to the projects page, filtered to that skill
  document.querySelectorAll('[data-skill]').forEach((b) => b.addEventListener('click', () => {
    checks.forEach((c) => (c.checked = c.value === b.dataset.skill));
    apply();
    location.hash = 'projects';
  }));

  // travel videos: show a clip only once its file exists, otherwise keep the "coming soon" box
  document.querySelectorAll('.video[data-video]').forEach((fig) => {
    const v = document.createElement('video');
    Object.assign(v, { controls: true, muted: true, playsInline: true, preload: 'metadata' });
    v.addEventListener('loadedmetadata', () => fig.querySelector('.video-empty')?.replaceWith(v), { once: true });
    v.poster = fig.dataset.poster;
    v.src = fig.dataset.video;
  });

  // ---------- code snippets: light syntax colouring ----------
  const KW = /^(if|return|const|let|new|private|static|final|try|catch|class|public|function|export|import|for|while)$/;
  document.querySelectorAll('.snip code').forEach((el) => {
    const src = el.textContent;
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokens = src.match(/\/\/[^\n]*|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b\d+\b|\b[A-Za-z_]\w*\b|\s+|./g) || [];
    el.innerHTML = tokens.map((t) => {
      if (t.startsWith('//')) return `<span class="t-com">${esc(t)}</span>`;
      if (t[0] === '"' || t[0] === '`') return `<span class="t-str">${esc(t)}</span>`;
      if (/^\d+$/.test(t)) return `<span class="t-num">${t}</span>`;
      if (KW.test(t)) return `<span class="t-kw">${t}</span>`;
      if (/^[A-Z]\w*$/.test(t)) return `<span class="t-type">${t}</span>`;
      return esc(t);
    }).join('');
  });

  // ---------- contact form: live code preview, then open the visitor's email app ----------
  const form = document.getElementById('cform');
  if (form) {
    const f = { name: form.elements.name, email: form.elements.email, message: form.elements.message };
    const out = document.getElementById('code-preview');
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '\\"');
    const date = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
    const str = (v) => `<span class="c-str">"${esc(v)}"</span>`;
    const draw = () => {
      const msg = f.message.value.replace(/\s+/g, ' ').trim();
      out.innerHTML = [
        `<span class="c-kw">const</span> <span class="c-var">button</span> = <span class="c-var">document</span>.<span class="c-fn">querySelector</span>(<span class="c-str">'#sendBtn'</span>);`,
        '',
        `<span class="c-kw">const</span> <span class="c-var">message</span> = {`,
        ` <span class="c-var">name</span>: ${str(f.name.value)},`,
        ` <span class="c-var">email</span>: ${str(f.email.value)},`,
        ` <span class="c-var">message</span>: ${str(msg)},`,
        ` <span class="c-var">date</span>: ${str(date)}`,
        '}',
        '',
        `<span class="c-var">button</span>.<span class="c-fn">addEventListener</span>(<span class="c-str">'click'</span>, () =&gt; {`,
        ` <span class="c-var">form</span>.<span class="c-fn">send</span>(<span class="c-var">message</span>);`,
        '})',
      ].map((l) => `<li>${l || ' '}</li>`).join('');
    };
    Object.values(f).forEach((el) => el.addEventListener('input', draw));
    draw();

    const err = document.getElementById('form-error');
    const sent = document.getElementById('sent');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const missing = Object.entries(f).filter(([, el]) => !el.value.trim()).map(([k]) => k);
      if (missing.length) { err.textContent = `// please fill in: ${missing.join(', ')}`; err.hidden = false; f[missing[0]].focus(); return; }
      if (!f.email.checkValidity()) { err.textContent = '// that email doesn’t look right'; err.hidden = false; f.email.focus(); return; }
      err.hidden = true;
      const subject = `Hello from ${f.name.value.trim()}`;
      const body = `${f.message.value.trim()}\n\n${f.name.value.trim()}\n${f.email.value.trim()}`;
      location.href = `mailto:okoryem@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      form.hidden = true; sent.hidden = false;
    });
    document.getElementById('send-new').addEventListener('click', () => {
      form.reset(); draw(); sent.hidden = true; form.hidden = false; f.name.focus();
    });
  }

  // ---------- detail panels ----------
  document.querySelectorAll('[data-open]').forEach((b) =>
    b.addEventListener('click', () => document.getElementById(b.dataset.open).showModal()));
  document.querySelectorAll('.detail').forEach((d) => {
    d.querySelector('[data-close]').addEventListener('click', () => d.close());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });  // click outside closes
  });
})();
