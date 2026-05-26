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
    $("body").scrollspy({
      target: navSelector,
    });

    // Mark TOC items as "passed" / "upcoming" relative to current active item
    var markTocProgress = function () {
      var $items = $("#toc-sidebar a");
      var activeIndex = -1;
      $items.each(function (i) {
        var $li = $(this).closest("li");
        if ($li.hasClass("active") || $(this).hasClass("active")) {
          activeIndex = i;
        }
      });
      $items.each(function (i) {
        if (activeIndex < 0) {
          $(this).attr("data-toc-state", "upcoming");
        } else if (i < activeIndex) {
          $(this).attr("data-toc-state", "passed");
        } else if (i === activeIndex) {
          $(this).attr("data-toc-state", "active");
        } else {
          $(this).attr("data-toc-state", "upcoming");
        }
      });
    };
    // Run on scroll-spy activation and initial load
    $("body").on("activate.bs.scrollspy", markTocProgress);
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
