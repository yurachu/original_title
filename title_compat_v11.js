(function () {
  "use strict";

  function startPlugin() {
    async function showTitles(card) {
      const orig = card.original_title || card.original_name;
      let en = "";

      try {
        const type = card.first_air_date ? "tv" : "movie";
        const data = await new Promise((res, rej) => {
          Lampa.Api.sources.tmdb.get(
            `${type}/${card.id}?append_to_response=translations`,
            {},
            res,
            rej
          );
        });

        const tr = data.translations?.translations || [];

        function findLang(list, codes) {
          const t = list.find(
            (t) => codes.includes(t.iso_3166_1) || codes.includes(t.iso_639_1)
          );
          return t?.data?.title || t?.data?.name;
        }

        en = findLang(tr, ["US", "en"]);
      } catch (e) {}

      const render = Lampa.Activity.active().activity.render();
      if (!render) return;

      $(".original_title", render).remove();

      function flagUS() {
        return `<img src="https://flagcdn.com/us.svg" style="width:1.15em;">`;
      }

      const lines = [];

      if (en) {
        lines.push(
          `<div style="font-size:1.25em;">${en} ${flagUS()}</div>`
        );
      }

      if (orig && orig !== en) {
        lines.push(
          `<div style="font-size:1.25em;opacity:0.8;">${orig}</div>`
        );
      }

      $(".full-start-new__title", render).after(
        `<div class="original_title" style="margin-bottom:7px;text-align:right;">
          <div>${lines.join("")}</div>
        </div>`
      );
    }

    if (!window.title_plugin) {
      window.title_plugin = true;
      Lampa.Listener.follow("full", (e) => {
        if (e.type !== "complite" || !e.data.movie) return;
        showTitles(e.data.movie);
      });
    }
  }

  if (window.appready) startPlugin();
  else {
    Lampa.Listener.follow("app", (e) => {
      if (e.type === "ready") startPlugin();
    });
  }
})();
