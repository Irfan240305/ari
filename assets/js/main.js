/* ARI Softech Solutions — shared site behaviour */
(function(){
    "use strict";

    document.documentElement.classList.add("js");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---------- Mobile navigation ---------- */
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");

    function setMenu(open){
        if(!toggle || !nav) return;
        nav.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if(toggle && nav){
        toggle.addEventListener("click", function(){
            setMenu(toggle.getAttribute("aria-expanded") !== "true");
        });

        nav.addEventListener("click", function(e){
            if(e.target.closest("a")) setMenu(false);
        });

        document.addEventListener("keydown", function(e){
            if(e.key === "Escape" && nav.classList.contains("is-open")){
                setMenu(false);
                toggle.focus();
            }
        });

        document.addEventListener("click", function(e){
            if(nav.classList.contains("is-open") && !header.contains(e.target)){
                setMenu(false);
            }
        });

        window.matchMedia("(min-width: 992px)").addEventListener("change", function(mq){
            if(mq.matches) setMenu(false);
        });
    }

    /* ---------- Header shadow + back to top ---------- */
    var backTop = document.querySelector(".back-top");
    var ticking = false;

    function onScroll(){
        var y = window.scrollY;
        if(header) header.classList.toggle("is-scrolled", y > 10);
        if(backTop) backTop.classList.toggle("is-visible", y > 600);
        ticking = false;
    }

    window.addEventListener("scroll", function(){
        if(!ticking){
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive:true });

    onScroll();

    if(backTop){
        backTop.addEventListener("click", function(){
            window.scrollTo({ top:0, behavior: reduceMotion.matches ? "auto" : "smooth" });
        });
    }

    /* ---------- Reveal on scroll ---------- */
    var revealItems = document.querySelectorAll(".reveal");

    if("IntersectionObserver" in window && !reduceMotion.matches){
        var revealObserver = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
                if(entry.isIntersecting){
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold:0.12, rootMargin:"0px 0px -40px 0px" });

        revealItems.forEach(function(el){ revealObserver.observe(el); });
    }else{
        revealItems.forEach(function(el){ el.classList.add("is-visible"); });
    }

    /* ---------- Footer year ---------- */
    document.querySelectorAll("[data-year]").forEach(function(el){
        el.textContent = new Date().getFullYear();
    });

    /* ---------- Home hero slider ---------- */
    var slider = document.querySelector("[data-slider]");
    if(!slider) return;

    var slides = slider.querySelectorAll(".hero-slide");
    var dots = slider.querySelectorAll(".hero-dot");
    var prevBtn = slider.querySelector("[data-slider-prev]");
    var nextBtn = slider.querySelector("[data-slider-next]");
    var pauseBtn = slider.querySelector("[data-slider-pause]");
    var current = 0;
    var timer = null;
    var userPaused = false;
    var hoverPaused = false;
    var DELAY = 7000;

    function show(index){
        index = (index + slides.length) % slides.length;

        slides.forEach(function(slide, i){
            var active = i === index;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", String(!active));
            slide.querySelectorAll("a, button").forEach(function(el){
                if(active) el.removeAttribute("tabindex");
                else el.setAttribute("tabindex", "-1");
            });
        });

        dots.forEach(function(dot, i){
            if(i === index) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
        });

        current = index;
    }

    function stop(){
        clearInterval(timer);
        timer = null;
    }

    function start(){
        stop();
        if(userPaused || hoverPaused || reduceMotion.matches || document.hidden) return;
        timer = setInterval(function(){ show(current + 1); }, DELAY);
    }

    function go(index){
        show(index);
        start();
    }

    if(prevBtn) prevBtn.addEventListener("click", function(){ go(current - 1); });
    if(nextBtn) nextBtn.addEventListener("click", function(){ go(current + 1); });

    dots.forEach(function(dot, i){
        dot.addEventListener("click", function(){ go(i); });
    });

    function syncPauseButton(){
        if(!pauseBtn) return;
        pauseBtn.setAttribute("aria-pressed", String(userPaused));
        pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
        pauseBtn.querySelector("[data-icon-pause]").hidden = userPaused;
        pauseBtn.querySelector("[data-icon-play]").hidden = !userPaused;
    }

    if(pauseBtn){
        if(reduceMotion.matches) userPaused = true;
        syncPauseButton();
        pauseBtn.addEventListener("click", function(){
            userPaused = !userPaused;
            syncPauseButton();
            start();
        });
    }

    /* Pause while the visitor is reading or interacting */
    slider.addEventListener("mouseenter", function(){ hoverPaused = true; stop(); });
    slider.addEventListener("mouseleave", function(){ hoverPaused = false; start(); });
    slider.addEventListener("focusin", function(){ hoverPaused = true; stop(); });
    slider.addEventListener("focusout", function(e){
        if(!slider.contains(e.relatedTarget)){ hoverPaused = false; start(); }
    });

    document.addEventListener("visibilitychange", start);

    slider.addEventListener("keydown", function(e){
        if(e.key === "ArrowLeft"){ go(current - 1); }
        if(e.key === "ArrowRight"){ go(current + 1); }
    });

    /* Swipe on touch devices */
    var touchX = null;
    slider.addEventListener("touchstart", function(e){
        touchX = e.changedTouches[0].clientX;
    }, { passive:true });
    slider.addEventListener("touchend", function(e){
        if(touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        if(Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
        touchX = null;
    }, { passive:true });

    show(0);
    start();
})();
