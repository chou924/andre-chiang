/* ============================================================
   Huiru — 個人網站互動腳本
   純原生 JS，無任何外部依賴。
   模組：theme / nav / scrollspy / reveal / counter / typing
         / filter / form / clipboard / misc
   ============================================================ */
(function () {
  'use strict';

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. 主題切換（深色 / 淺色）
     --------------------------------------------------------- */
  var Theme = {
    key: 'site-theme',
    get: function () {
      try { return localStorage.getItem(this.key); } catch (e) { return null; }
    },
    set: function (value) {
      document.documentElement.setAttribute('data-theme', value);
      try { localStorage.setItem(this.key, value); } catch (e) { /* 隱私模式 */ }
    },
    init: function () {
      var saved = this.get();
      var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      this.set(saved || (prefersLight ? 'light' : 'dark'));

      var btn = $('#themeToggle');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        Theme.set(next);
        btn.setAttribute('aria-label', next === 'dark' ? '切換為淺色主題' : '切換為深色主題');
      });
    }
  };

  /* ---------------------------------------------------------
     2. 導覽列：捲動陰影、進度條、手機選單
     --------------------------------------------------------- */
  var Nav = {
    init: function () {
      var nav = $('#nav');
      var burger = $('#navBurger');
      var links = $('#navLinks');
      var progress = $('#navProgress');
      var toTop = $('#toTop');

      var onScroll = function () {
        var y = window.scrollY;
        if (nav) nav.classList.toggle('is-stuck', y > 12);

        if (progress) {
          var max = document.documentElement.scrollHeight - window.innerHeight;
          progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
        }
        if (toTop) toTop.classList.toggle('is-visible', y > 480);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      if (burger && links) {
        var close = function () {
          links.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          if (nav) nav.classList.remove('is-open');
        };

        burger.addEventListener('click', function () {
          var open = links.classList.toggle('is-open');
          burger.setAttribute('aria-expanded', String(open));
          if (nav) nav.classList.toggle('is-open', open);
        });

        links.addEventListener('click', function (e) {
          if (e.target.closest('a')) close();
        });

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') close();
        });

        document.addEventListener('click', function (e) {
          if (!links.contains(e.target) && !burger.contains(e.target)) close();
        });
      }

      if (toTop) {
        toTop.addEventListener('click', function () {
          window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
      }
    }
  };

  /* ---------------------------------------------------------
     3. Scrollspy：highlight 目前所在 section
     --------------------------------------------------------- */
  var ScrollSpy = {
    init: function () {
      var links = $$('.nav__link');
      if (!links.length || !('IntersectionObserver' in window)) return;

      var map = {};
      var sections = [];
      links.forEach(function (link) {
        var id = link.getAttribute('href').replace('#', '');
        var section = document.getElementById(id);
        if (section) { map[id] = link; sections.push(section); }
      });
      if (!sections.length) return;

      var visible = {};
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
        });

        var bestId = null;
        var bestRatio = 0;
        Object.keys(visible).forEach(function (id) {
          if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
        });

        links.forEach(function (l) { l.classList.remove('is-active'); });
        if (bestId && map[bestId]) map[bestId].classList.add('is-active');
      }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

      sections.forEach(function (s) { spy.observe(s); });
    }
  };

  /* ---------------------------------------------------------
     4. 進場動畫（IntersectionObserver）
     --------------------------------------------------------- */
  var Reveal = {
    init: function () {
      var items = $$('.reveal');
      if (!items.length) return;

      if (reduceMotion || !('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('is-visible'); });
        return;
      }

      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

      items.forEach(function (el) { io.observe(el); });
    }
  };

  /* ---------------------------------------------------------
     5. 數字動畫
     --------------------------------------------------------- */
  var Counter = {
    init: function () {
      var nums = $$('.stat__num');
      if (!nums.length) return;

      var run = function (el) {
        var target = parseFloat(el.dataset.count || '0');
        var suffix = el.dataset.suffix || '';
        if (reduceMotion) { el.textContent = target + suffix.trim(); return; }

        var duration = 1400;
        var start = null;

        var step = function (ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }

      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.5 });

      nums.forEach(function (el) { io.observe(el); });
    }
  };

  /* ---------------------------------------------------------
     6. 打字機效果
     --------------------------------------------------------- */
  var Typing = {
    init: function () {
      var el = $('#typed');
      if (!el) return;

      var words = (el.dataset.words || '前端工程師,UI 實作,產品設計').split(',');
      // 讓內容也能從 HTML 覆寫：<span id="typed" data-words="A,B"></span>
      var w = 0, c = 0, deleting = false;

      var tick = function () {
        var word = words[w];
        c += deleting ? -1 : 1;
        el.textContent = word.slice(0, c);

        var delay = deleting ? 45 : 95;
        if (!deleting && c === word.length) { delay = 1500; deleting = true; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 320; }
        setTimeout(tick, delay);
      };

      if (reduceMotion) {
        el.textContent = words[0];
        return;
      }
      setTimeout(tick, 400);
    }
  };

  /* ---------------------------------------------------------
     7. 作品分類篩選
     --------------------------------------------------------- */
  var Filter = {
    init: function () {
      var chips = $$('.chip[data-filter]');
      var projects = $$('#projectGrid .project');
      if (!chips.length || !projects.length) return;

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var key = chip.dataset.filter;
          chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });
          projects.forEach(function (p) {
            var show = key === 'all' || p.dataset.category === key;
            p.classList.toggle('is-hidden', !show);
          });
        });
      });
    }
  };

  /* ---------------------------------------------------------
     8. 聯絡表單：驗證 + 寄信
     純前端站台沒有後端，驗證通過後用 mailto 打開寄信程式。
     若要改用表單服務（例如 Formspree）：
       <form action="https://formspree.io/f/xxxxxxx" method="POST">
     然後把下面的 buildMailto 流程換成 fetch 送出即可。
     --------------------------------------------------------- */
  var Form = {
    init: function () {
      var form = $('#contactForm');
      if (!form) return;

      var status = $('#formStatus');
      var email = 'YOUR_EMAIL@example.com';

      var setError = function (input, message) {
        var wrap = input.closest('.field');
        var box = form.querySelector('[data-error-for="' + input.name + '"]');
        if (wrap) wrap.classList.toggle('has-error', !!message);
        if (box) box.textContent = message || '';
        return !message;
      };

      var validators = {
        name: function (v) {
          if (!v.trim()) return '請輸入你的名字';
          if (v.trim().length < 2) return '名字好像太短了';
          return '';
        },
        email: function (v) {
          if (!v.trim()) return '請輸入 Email';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Email 格式不正確';
          return '';
        },
        message: function (v) {
          if (!v.trim()) return '請寫點想說的內容';
          if (v.trim().length < 10) return '再多寫一點（至少 10 個字）';
          return '';
        }
      };

      var fields = ['name', 'email', 'message'].map(function (n) { return form.elements[n]; }).filter(Boolean);

      // 邊打字邊清掉錯誤訊息
      fields.forEach(function (input) {
        input.addEventListener('input', function () {
          var wrap = input.closest('.field');
          if (wrap && wrap.classList.contains('has-error')) setError(input, '');
        });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var ok = true;
        fields.forEach(function (input) {
          var validate = validators[input.name];
          if (validate) ok = setError(input, validate(input.value)) && ok;
        });

        if (!ok) {
          status.textContent = '請修正上面的欄位';
          status.className = 'form__status is-err';
          return;
        }

        var name = form.elements.name.value.trim();
        var mail = form.elements.email.value.trim();
        var body = form.elements.message.value.trim();

        status.className = 'form__status';
        status.textContent = '正在開啟你的寄信程式…';

        var subject = encodeURIComponent('[網站諮詢] ' + name);
        var content = encodeURIComponent(
          name + ' 留下的訊息：\n\n' + body + '\n\n—\n回覆信箱：' + mail
        );

        window.location.href = 'mailto:' + email + '?subject=' + subject + '&body=' + content;

        setTimeout(function () {
          status.textContent = '沒跳出的話，請直接寄到 ' + email;
          status.className = 'form__status is-ok';
        }, 900);
      });
    }
  };

  /* ---------------------------------------------------------
     9. 複製 Email
     --------------------------------------------------------- */
  var Clipboard = {
    init: function () {
      $$('[data-copy]').forEach(function (btn) {
        var original = btn.getAttribute('aria-label');
        btn.addEventListener('click', function () {
          var text = btn.dataset.copy;
          var done = function () {
            btn.classList.add('is-copied');
            btn.setAttribute('aria-label', '已複製');
            setTimeout(function () {
              btn.classList.remove('is-copied');
              btn.setAttribute('aria-label', original);
            }, 1600);
          };

          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done);
          } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); done(); } catch (err) { /* 忽略 */ }
            document.body.removeChild(ta);
          }
        });
      });
    }
  };

  /* ---------------------------------------------------------
     10. 其他
     --------------------------------------------------------- */
  var Misc = {
    init: function () {
      var year = $('#year');
      if (year) year.textContent = new Date().getFullYear();

      // 履歷 PDF 還沒放進來時，自動隱藏下載按鈕（避免 404）
      var resume = $('[data-resume]');
      if (!resume) return;
      var hide = function () {
        var wrap = resume.closest('a');
        if (wrap) wrap.remove();
      };
      fetch(resume.getAttribute('href'), { method: 'HEAD' })
        .then(function (res) { if (!res.ok) hide(); })
        .catch(hide);
    }
  };

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function boot() {
    Theme.init();
    Nav.init();
    ScrollSpy.init();
    Reveal.init();
    Counter.init();
    Typing.init();
    Filter.init();
    Form.init();
    Clipboard.init();
    Misc.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
