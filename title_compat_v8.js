
(function () {
  "use strict";

  function titleOrigin(card) {
    var orig = card.original_title || card.original_name;

    var params = {
      id: card.id,
      url: "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/https://api.themoviedb.org/3/movie/",
      urlEnd: "&api_key=4ef0d7355d9ffb5151e987764708ce96"
    };

    if (card.first_air_date) {
      params.url = "https://worker-patient-dream-26d7.bdvburik.workers.dev:8443/https://api.themoviedb.org/3/tv/";
    }

    var getOptions = {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    };

    function getEnTitle(callback) {
      fetch(params.url + params.id + "?language=en-US" + params.urlEnd, getOptions)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          callback(data.title || data.name || "");
        })
        .catch(function () {
          callback("");
        });
    }

    function getRuTitle(callback) {
      fetch(params.url + params.id + "?language=ru-RU" + params.urlEnd, getOptions)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          callback(data.title || data.name || "");
        })
        .catch(function () {
          callback("");
        });
    }

    getEnTitle(function (enTitle) {
      getRuTitle(function (ruTitle) {
        _showEnTitle(card, enTitle, ruTitle);
      });
    });

    function _showEnTitle(card, en, ru) {
      if (!en) return;

      var render = Lampa.Activity.active().activity.render();
      if (!render) return;

      var orig = card.original_title || card.original_name || "";
      var lang = Lampa.Storage.get("language");

      var parts = [];
      if (en) parts.push("En: " + en);
      if (lang !== "ru" && ru) parts.push("Ru: " + ru);
      if (orig && orig !== en && orig !== ru) parts.push("Orig: " + orig);

      var text = parts.join(" / ");
      var finalHTML = "<div id='titleen' style='font-size: 1.3em; margin-top: 0.3em;'>" + text + "</div>";

      // удаляем старую вставку, если она осталась
      $("#titleen").remove();

      var container = $(".original_title", render).find("> div").eq(0);
      if (container.length) {
        container.after(finalHTML);
      }
    }
  }

  function startPlugin() {
    window.title_plugin = true;

    function injectIfReady(e) {
      if (e.type === "complite") {
        var render = e.object.activity.render();
        $(".original_title", render).remove();
        $(".full-start-new__title", render).after(
          '<div class="original_title" style="margin-top:-0.8em; text-align: right;"><div></div></div>'
        );
        setTimeout(function () {
          titleOrigin(e.data.movie);
        }, 300); // ждём чуть-чуть, чтобы DOM полностью построился

        $(".full-start-new__rate-line").css("margin-bottom", "0.8em");
        $(".full-start-new__details").css("margin-bottom", "0.8em");
        $(".full-start-new__tagline").css("margin-bottom", "0.4em");
      }
    }

    Lampa.Listener.follow("full", injectIfReady);
  }

  if (!window.title_plugin) startPlugin();
})();
