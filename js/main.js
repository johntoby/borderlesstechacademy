/* =================================================================
   Borderless Tech Academy — shared interactions
   ================================================================= */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('.nav__links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Highlight current page in nav ---------- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(function (link) {
    var href = (link.getAttribute('href') || '').split('#')[0];
    if (href === path) {
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Departures board (signature element) ---------- */
  var board = document.querySelector('[data-board]');
  if (board && !prefersReducedMotion) {
    var statuses = [
      { text: 'BOARDING', cls: 'board__status--boarding' },
      { text: 'ON TIME', cls: 'board__status--ontime' },
      { text: 'FINAL CALL', cls: 'board__status--final' }
    ];
    var rows = board.querySelectorAll('.board__row');
    setInterval(function () {
      var row = rows[Math.floor(Math.random() * rows.length)];
      var cell = row.querySelector('.board__cell--status');
      if (!cell) return;
      var label = cell.querySelector('.board__status');
      if (!label) return;
      var currentIndex = statuses.findIndex(function (s) {
        return label.textContent.trim() === s.text;
      });
      var next = statuses[(currentIndex + 1 + Math.floor(Math.random() * 2)) % statuses.length];
      cell.classList.add('is-flipping');
      setTimeout(function () {
        label.textContent = next.text;
        label.className = 'board__status ' + next.cls;
        cell.classList.remove('is-flipping');
      }, 220);
    }, 3200);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var btn = item.querySelector('.faq__q');
    var answer = item.querySelector('.faq__a');
    if (!btn || !answer) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var isOpen = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', isOpen ? 'false' : 'true');
      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  /* ---------- Copy to clipboard ---------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var original = btn.textContent;
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('is-copied');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        done();
      }
    });
  });

  /* ---------- Formspree forms (enrollment, newsletter, downloads) ---------- */
  document.querySelectorAll('form[data-formspree]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var original = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (!response.ok) throw new Error('Submission failed');
        if (status) {
          status.textContent = form.dataset.success || "Got it — we'll be in touch soon.";
          status.className = 'form-status is-visible form-status--success';
        }
        if (typeof fbq === 'function') fbq('track', 'Lead');
        form.reset();
        var dlModal = form.closest('[data-modal="download"]');
        if (dlModal && dlModal.dataset.downloadUrl) {
          window.open(dlModal.dataset.downloadUrl, '_blank');
          setTimeout(function () {
            dlModal.classList.remove('is-open');
            dlModal.setAttribute('aria-hidden', 'true');
          }, 1600);
        }
      }).catch(function () {
        if (status) {
          status.textContent = 'Something went wrong. Please try again, or email info@borderlesstechacademy.com.';
          status.className = 'form-status is-visible form-status--error';
        }
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = original; }
      });
    });
  });

  /* ---------- Curriculum download modal ---------- */
  var modal = document.querySelector('[data-modal="download"]');
  if (modal) {
    var nameField = modal.querySelector('[data-modal-name]');
    var typeField = modal.querySelector('input[name="curriculum"]');
    var closeModal = function () {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    };
    document.querySelectorAll('[data-download]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var program = btn.getAttribute('data-download');
        if (nameField) nameField.textContent = program;
        if (typeField) typeField.value = program;
        modal.dataset.downloadUrl = btn.getAttribute('data-download-url') || '';
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        var firstField = modal.querySelector('input[name="name"]');
        if (firstField) firstField.focus();
      });
    });
    modal.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }
})();
