(function () {
  "use strict";

  Lampa.Lang.add({
    title_plugin: {
      ru: "Title Plugin",
      en: "Title Plugin",
      be: "Title Plugin",
    },
    reset_to_default: {
      ru: "Сбросить по умолчанию",
      en: "Reset to Default",
      be: "Скінуць па змаўчанні",
    },
    show_en: {
      ru: 'Показывать <img src="https://flagcdn.com/us.svg" style="width:1.15em;"> EN',
      en: 'Show <img src="https://flagcdn.com/us.svg" style="width:1.15em;"> EN',
      be: 'Паказваць <img src="https://flagcdn.com/us.svg" style="width:1.15em;"> EN',
    },
    show_tl: {
      ru: "Показывать Romaji",
      en: "Show Romaji",
      be: "Паказваць Romaji",
    },
    show_be: {
      ru: 'Показывать <img src="https://flagcdn.com/by.svg" style="width:1.15em;"> BE',
      en: 'Show <img src="https://flagcdn.com/by.svg" style="width:1.15em;"> BE',
      be: 'Паказваць <img src="https://flagcdn.com/by.svg" style="width:1.15em;"> BE',
    },
    show_ru: {
      ru: 'Показывать <img src="https://flagcdn.com/ru.svg" style="width:1.15em;"> RU',
      en: 'Show <img src="https://flagcdn.com/ru.svg" style="width:1.15em;"> RU',
      be: 'Паказваць <img src="https://flagcdn.com/ru.svg" style="width:1.15em;"> RU',
    },
  });

  const LANGS = ["en", "tl", "be", "ru"];
  const STORAGE_ORDER_KEY = "title_plugin_order";
  const STORAGE_HIDDEN_KEY = "title_plugin_hidden";

  function startPlugin() {
    const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;
    let titleCache = Lampa.Storage.get("title_cache") || {};

    async function showTitles(card) {
      const orig = card.original_title || card.original_name;
      const alt = card.alternative_titles?.titles || card.alternative_titles?.results || [];

      function countryFlag(code) {
        if (!code) return "";
        return `<img src="https://flagcdn.com/${code.toLowerCase()}.svg" style="width:1.15em;">`;
      }

      let translit = "";
      let ru = "";
      let en = "";
      let be = "";

      const now = Date.now();
      const cache = titleCache[card.id];

      if (cache && now - cache.timestamp < CACHE_TTL) {
        en = cache.en;
        be = cache.be;
        ru = cache.ru;
        translit = cache.tl;
      }

      if (!ru || !en || !be) {
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

          en ||= findLang(tr, ["US", "en"]);
          be ||= findLang(tr, ["BY", "be"]);
          ru ||= findLang(tr, ["RU", "ru"]);

          titleCache[card.id] = {
            ru,
            en,
            be,
            tl: translit,
            timestamp: now,
          };

          Lampa.Storage.set("title_cache", titleCache);
        } catch (e) {}

        en ||= alt.find((t) => t.iso_3166_1 === "US")?.title;
        be ||= alt.find((t) => t.iso_3166_1 === "BY")?.title;
        ru ||= alt.find((t) => t.iso_3166_1 === "RU")?.title;
      }

      const render = Lampa.Activity.active().activity.render();
      if (!render) return;

      $(".original_title", render).remove();

      let showOrder = Lampa.Storage.get(STORAGE_ORDER_KEY, LANGS.slice());
      let hiddenLangs = Lampa.Storage.get(STORAGE_HIDDEN_KEY, []);

      const lines = [
        `<div style="font-size:1.25em;">${orig}</div>`,
      ];

      showOrder.forEach((lang) => {
        if (hiddenLangs.includes(lang)) return;

        const val = lang === "tl" ? translit : { en, be, ru }[lang];

        if (val)
          lines.push(
            `<div style="font-size:1.25em;">${val} ${countryFlag(
              { ru: "RU", en: "US", be: "BY" }[lang]
            )}</div>`
          );
      });

      $(".full-start-new__title", render).after(
        `<div class="original_title" style="margin-bottom:7px;text-align:right;"><div>${lines.join(
          ""
        )}</div></div>`
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
