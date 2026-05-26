$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);

    var getTocTarget = function (link) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return null;

      try {
        return document.getElementById(decodeURIComponent(href.slice(1)));
      } catch (e) {
        return document.getElementById(href.slice(1));
      }
    };

    var getStaticTocTarget = function (target) {
      if (!target) return null;

      var cvEntry = target.closest(".atmo-cv-entry");
      if (cvEntry) return cvEntry;

      var cvSection = target.closest(".cv-section");
      if (cvSection) return cvSection;

      return target;
    };

    var getTocOffset = function () {
      var navbar = document.querySelector("nav.navbar.fixed-top");
      var navbarOffset = (navbar ? navbar.offsetHeight : 0) + 32;
      return Math.max(navbarOffset, window.innerHeight * 0.65);
    };

    var markTocProgress = function () {
      var items = Array.prototype.slice.call(document.querySelectorAll("#toc-sidebar a"));
      var targets = items.map(function (item) {
        return getStaticTocTarget(getTocTarget(item));
      });
      var threshold = getTocOffset();
      var activeIndex = 0;

      targets.forEach(function (target, i) {
        if (target && target.getBoundingClientRect().top <= threshold) {
          activeIndex = i;
        }
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        activeIndex = targets.reduce(function (lastIndex, target, i) {
          return target ? i : lastIndex;
        }, activeIndex);
      }

      items.forEach(function (item, i) {
        var state = "upcoming";
        if (i < activeIndex) {
          state = "passed";
        } else if (i === activeIndex) {
          state = "active";
        }
        item.setAttribute("data-toc-state", state);
        item.classList.toggle("active", state === "active");
        $(item).closest("li").toggleClass("active", state === "active");
      });
    };

    var tocTicking = false;
    var requestTocProgress = function () {
      if (tocTicking) return;
      window.requestAnimationFrame(function () {
        markTocProgress();
        tocTicking = false;
      });
      tocTicking = true;
    };

    window.addEventListener("scroll", requestTocProgress, { passive: true });
    window.addEventListener("resize", requestTocProgress);

    // Initial pass after the TOC builds (small delay so Toc.init() has rendered)
    setTimeout(markTocProgress, 150);
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
