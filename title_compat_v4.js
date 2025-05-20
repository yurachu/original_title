
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
          callback(data.title || data.name);
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
          callback(data.title || data.name);
        })
        .catch(function () {
          callback("");
        });
    }

    getEnTitle(function (etEnTitle) {
      getRuTitle(function (etRuTitle) {
        _showEnTitle(etEnTitle, etRuTitle);
      });
    });

    function _showEnTitle(data, ruData) {
      var ru = "";
      if (data) {
        var render = Lampa.Activity.active().activity.render();
        if (Lampa.Storage.get("language") != "ru") {
          ru = "<div style='font-size: 1.3em; height: auto;'>Ru: " + ruData + "</div>";
        }
        $(".original_title", render).find("> div").eq(0).after(
          "<div id='titleen'><div>" +
          "<div style='font-size: 1.3em; height: auto;'>En: " + data + "</div>" +
          ru +
          "<div style='font-size: 1.3em; height: auto; margin-top: 0.5em;'>Orig: " + orig + "</div>" +
          "</div></div>"
        );
      }
    }
  }

  function startPlugin() {
    window.title_plugin = true;
    Lampa.Listener.follow("full", function (e) {
      if (e.type == "complite") {
        var render = e.object.activity.render();
        $(".original_title", render).remove();
        $(".full-start-new__title", render).after(
          '<div class="original_title" style="margin-top:-0.8em; text-align: left;"><div>'
        );
        titleOrigin(e.data.movie);

        if ($(".full-start-new__rate-line").length) {
          $(".full-start-new__rate-line").css("margin-bottom", "0.8em");
        }
        if ($(".full-start-new__details").length) {
          $(".full-start-new__details").css("margin-bottom", "0.8em");
        }
        if ($(".full-start-new__tagline").length && $(".full-start-new__tagline").text().trim() !== "") {
          $(".full-start-new__tagline").css("margin-bottom", "0.4em");
        }
      }
    });
  }

  if (!window.title_plugin) startPlugin();
})();
