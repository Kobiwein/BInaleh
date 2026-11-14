(function () {
  "use strict";

  var root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove("motion");
    root.classList.add("motion-settled");
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", function () {
    root.classList.add("motion");

    var priceExact = null;
    var heroTargets = [
      ".hero h1 .hl",
      ".hero h1 .accent",
      ".hero .lead",
      ".visual .frame",
      ".cta .btn",
      ".trust li",
      ".hero .note",
      ".visual .float"
    ];

    function settleHero() {
      root.classList.add("motion-settled");
      gsap.set(heroTargets.join(","), { clearProps: "all" });
    }

    var tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: settleHero });
    tl.fromTo(".hero h1 .hl", { y: 18 }, { y: 0, duration: 0.74 }, 0.06)
      .fromTo(".hero h1 .accent", { y: 18 }, { y: 0, duration: 0.74 }, 0.16)
      .fromTo(".hero .lead", { y: 14 }, { y: 0, duration: 0.68 }, 0.22)
      .fromTo(".visual .frame", { y: 20 }, { y: 0, duration: 0.86 }, 0.1)
      .fromTo(".cta .btn", { y: 12 }, { y: 0, duration: 0.5, stagger: 0.08 }, 0.36)
      .fromTo(".trust li", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.46, stagger: 0.06 }, 0.48)
      .fromTo(".hero .note", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.44 }, 0.6)
      .fromTo(".visual .float", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.4)
      .to(".cta .btn:not(.ghost)", { "--glow": 1, duration: 0.28, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.02);

    function show(batch, stagger) {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.64,
        stagger: stagger || 0,
        ease: "power2.out",
        overwrite: true,
        onComplete: function () {
          gsap.set(batch, { clearProps: "opacity,transform" });
        }
      });
    }

    function bind(selector, stagger) {
      var els = gsap.utils.toArray(selector);
      if (!els.length) return;
      gsap.set(els, { opacity: 0, y: 16 });
      ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        interval: 0.1,
        batchMax: 8,
        onEnter: function (batch) {
          for (var i = 0; i < batch.length; i++) {
            if (batch[i] === priceEl) countPrice();
          }
          show(batch, stagger);
        }
      });
    }

    var priceEl = document.querySelector(".price");
    var amt = document.querySelector(".amt-num");

    function countPrice() {
      if (!amt || amt.dataset.counting === "1" || priceExact) return;
      var exact = amt.textContent;
      var match = exact.replace(/\s/g, "").match(/^(₪)(\d+)$/);
      if (!match) return;
      var target = parseInt(match[2], 10);
      if (!target) return;
      priceExact = exact;
      amt.dataset.counting = "1";
      var start = Math.max(0, target - 50);
      var obj = { n: start };
      amt.textContent = "₪" + start;
      gsap.to(obj, {
        n: target,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: function () {
          amt.textContent = "₪" + Math.round(obj.n);
        },
        onComplete: function () {
          amt.textContent = priceExact;
          delete amt.dataset.counting;
        }
      });
    }

    bind("#who h2, #who .sub", 0.08);
    bind(".who-item", 0.08);
    bind("#learn h2, #learn .sub", 0.08);
    bind(".learn li", 0.06);
    bind("#how h2, #how .sub", 0.08);
    bind(".step", 0.1);
    bind("#price h2, #price .sub", 0.08);
    bind(".price", 0);
    bind(".offer", 0);
    bind("#faq h2, #faq .sub", 0.08);
    bind("#faq details", 0.05);
    bind("#signup h2, #signup .sub", 0.08);
    bind("#signup form", 0);
    bind(".banner", 0);
    bind("footer", 0);

    var line = document.querySelector(".steps-line");
    var desk = window.matchMedia("(min-width: 961px)");
    function armLine() {
      if (!line || !desk.matches || line.dataset.armed === "1") return;
      line.dataset.armed = "1";
      gsap.fromTo(line, { scaleX: 0, transformOrigin: "right center" }, {
        scaleX: 1,
        duration: 1.05,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".steps",
          start: "top 82%",
          once: true
        },
        onComplete: function () {
          line.classList.add("is-drawn");
          gsap.set(line, { clearProps: "transform" });
        }
      });
    }
    armLine();
    desk.addEventListener("change", armLine);

    function onFocus(e) {
      var sec = e.target.closest("section, footer, .banner");
      if (!sec) return;
      if (sec.classList.contains("hero")) {
        tl.kill();
        root.classList.add("motion-settled");
      }
      var nodes = sec.querySelectorAll("h2, .sub, .who-item, .learn li, .step, .price, .offer, details, form, .trust li, .note, .float, .cta .btn, .frame");
      var targets = [sec].concat(gsap.utils.toArray(nodes));
      gsap.killTweensOf(targets);
      gsap.set(targets, { clearProps: "opacity,transform,--glow" });
    }
    document.addEventListener("focusin", onFocus);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });

    return function () {
      document.removeEventListener("focusin", onFocus);
      desk.removeEventListener("change", armLine);
      root.classList.remove("motion");
      root.classList.add("motion-settled");
      if (line) delete line.dataset.armed;
      if (amt && priceExact) {
        amt.textContent = priceExact;
        delete amt.dataset.counting;
      }
    };
  });
})();
