(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* Hlavička: linka pod ní, až když se stránka odroluje */
  const top = $('[data-top]');
  if (top) {
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => top.classList.toggle('is-scrolled', !entry.isIntersecting)).observe(sentinel);
  }

  /* Ukázka verdiktu: důvod a místo ve zprávě se zvýrazní spolu, jako po klepnutí v aplikaci */
  const specimen = $('[data-specimen]');
  if (specimen) {
    const parts = $$('[data-k]', specimen);
    const heat = (key) => parts.forEach((el) => el.classList.toggle('is-hot', el.dataset.k === key));
    parts.forEach((el) => {
      el.addEventListener('pointerenter', () => heat(el.dataset.k));
      el.addEventListener('pointerleave', () => heat(null));
    });
  }

  /* Jak to funguje: na telefonu je obrazovka toho kroku, který právě protíná střed okna */
  const device = $('[data-flow-device]');
  if (device) {
    const screens = $$('img', device);
    const steps = $$('[data-flow-step]');
    const show = (i) => screens.forEach((img, k) => img.classList.toggle('is-active', k === i));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) show(steps.indexOf(entry.target)); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    steps.forEach((step) => io.observe(step));
  }

  /* Dokumenty: v obsahu je zvýrazněná kapitola, kterou právě čtete */
  const tocLinks = $$('.toc a[href^="#"]');
  const chapters = tocLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (chapters.length) {
    let current = null;
    const mark = (id) => tocLinks.forEach((a) => {
      if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    const update = () => {
      const line = window.innerHeight * 0.3;
      let found = chapters[0];
      chapters.forEach((h) => { if (h.getBoundingClientRect().top <= line) found = h; });
      if (found !== current) { current = found; mark(found.id); }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* Pozvánka do rodiny otevřená bez aplikace: kód z adresy /rodina/pozvanka/<kód>, aby šel zadat ručně */
  const codeBox = $('[data-invite-code]');
  if (codeBox) {
    const parts = location.pathname.split('/').filter(Boolean);
    const raw = parts[0] === 'rodina' && parts[1] === 'pozvanka' ? decodeURIComponent(parts[2] || '') : '';
    const valid = /^[A-Za-z0-9_-]{8,32}$/.test(raw);
    const code = raw.toUpperCase();
    $('[data-invite-valid]').hidden = !valid;
    $('[data-invite-invalid]').hidden = valid;
    if (valid) {
      $('[data-code]', codeBox).textContent = code;
      const copy = $('[data-copy]', codeBox);
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code);
          copy.textContent = 'Zkopírováno';
        } catch {
          copy.textContent = 'Označte a zkopírujte';
        }
      });
    }
  }
})();
