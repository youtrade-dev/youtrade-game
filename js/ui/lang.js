// language switcher (ru/en/etc) + translation dict
// Original: index.html script_12.js

var KEY = 'yt_lang';
  var DICT = {
    en: {
      "Начальный баланс": "Initial balance",
      "Текущая фаза": "Current phase",
      "Следующая": "Next",
      "Баланс": "Balance",
      "всего": "total",
      "Цели торговли": "Trading goals",
      "Целевой профит": "Profit target",
      "В работе": "In progress",
      "Пройдено": "Passed",
      "Торговые дни": "Trading days",
      "Макс. дневной убыток": "Max daily loss",
      "Максимальный убыток": "Maximum loss",
      "до обновления": "until reset",
      "Дневной лимит убытка": "Daily loss limit",
      "Осталось:": "Remaining:",
      "Макс. дневной убыток:": "Max daily loss:",
      "Нач. баланс за сегодня:": "Today's start balance:",
      "Пороговый лимит:": "Threshold:",
      "Производительность": "Performance",
      "Количество сделок": "Number of trades",
      "Процент выигрышных": "Win rate",
      "Средняя прибыль": "Average profit",
      "Средний убыток": "Average loss",
      "Дн. P&L": "Daily P&L",
      "Открытые позиции": "Open positions",
      "Нет открытых позиций": "No open positions",
      "Перейди в Торговля чтобы открыть сделку": "Go to Trade to open a position",
      "Сбросить счёт": "Reset account",
      "Прибыль": "Profit",
      "Средства": "Equity",
      "Свободно": "Free",
      "Маржа": "Margin",
      "Показывать": "Show",
      "Свободные средства": "Free funds",
      "Спецификация": "Specification",
      "Символ": "Symbol",
      "Цена": "Price",
      "Все": "All",
      "★ Избранное": "★ Favorites",
      "+ группа": "+ group",
      "Форекс": "Forex",
      "Металлы": "Metals",
      "Индексы": "Indices",
      "Крипто": "Crypto",
      "Лоты": "Lots",
      "Продать": "Sell",
      "Купить": "Buy",
      "Рынок открыт": "Market open",
      "Плечо": "Leverage",
      "Комиссия": "Commission",
      "Открытые": "Open",
      "Закрытые": "Closed",
      "Все сделки": "All trades",
      "История сделок": "Trade history",
      "Сделок ещё нет": "No trades yet",
      "Тарифы": "Plans",
      "Пройди испытание — получи реальный проп-счёт до $200,000": "Pass the challenge — get a real prop account up to $200,000",
      "80% прибыли": "80% profit",
      "Без ограничений по времени": "No time limit",
      "Мгновенный доступ": "Instant access",
      "Тип программы": "Program type",
      "1 этап": "1 step",
      "2 этапа": "2 steps",
      "Инстант": "Instant",
      "Размер счёта": "Account size",
      "Выбранный план": "Selected plan",
      "единоразовый платёж": "one-time payment",
      "Условия торговли": "Trading conditions",
      "Параметр": "Parameter",
      "Фаза 1": "Phase 1",
      "Финанс.": "Funded",
      "Цель прибыли": "Profit target",
      "Макс. дн. убыток": "Max daily loss",
      "Макс. убыток": "Max loss",
      "Мин. торг. дней": "Min trading days",
      "Торговый период": "Trading period",
      "Выплата прибыли": "Profit payout",
      "🚀 Купить счёт прямо сейчас": "🚀 Buy account now",
      "Мгновенный доступ · 24/7 поддержка · Выплата 80% прибыли": "Instant access · 24/7 support · 80% profit payout",
      "Счёт": "Account",
      "Торговля": "Trade",
      "История": "History",
      "Топ": "Top",
      "СЧЁТ ЗАБЛОКИРОВАН": "ACCOUNT BLOCKED",
      "Счёт заблокирован": "Account blocked",
      "Превышен дневной лимит убытка": "Daily loss limit exceeded",
      "Превышен максимальный лимит убытка": "Maximum loss limit exceeded",
      "Условия челленджа нарушены": "Challenge rules violated",
      "Условия челленджа нарушены. Сбросьте счёт для новой попытки.": "Challenge rules violated. Reset the account to try again."
    },
    uk: {
      "Начальный баланс": "Початковий баланс",
      "Текущая фаза": "Поточна фаза",
      "Следующая": "Наступна",
      "Баланс": "Баланс",
      "всего": "загалом",
      "Цели торговли": "Цілі торгівлі",
      "Целевой профит": "Цільовий профіт",
      "В работе": "У роботі",
      "Пройдено": "Пройдено",
      "Торговые дни": "Торгові дні",
      "Макс. дневной убыток": "Макс. денний збиток",
      "Максимальный убыток": "Максимальний збиток",
      "до обновления": "до оновлення",
      "Дневной лимит убытка": "Денний ліміт збитку",
      "Осталось:": "Залишилось:",
      "Макс. дневной убыток:": "Макс. денний збиток:",
      "Нач. баланс за сегодня:": "Початк. баланс на сьогодні:",
      "Пороговый лимит:": "Пороговий ліміт:",
      "Производительность": "Продуктивність",
      "Количество сделок": "Кількість угод",
      "Процент выигрышных": "Відсоток виграшних",
      "Средняя прибыль": "Середній прибуток",
      "Средний убыток": "Середній збиток",
      "Дн. P&L": "Ден. P&L",
      "Открытые позиции": "Відкриті позиції",
      "Нет открытых позиций": "Немає відкритих позицій",
      "Перейди в Торговля чтобы открыть сделку": "Перейди в Торгівля, щоб відкрити угоду",
      "Сбросить счёт": "Скинути рахунок",
      "Прибыль": "Прибуток",
      "Средства": "Кошти",
      "Свободно": "Вільно",
      "Маржа": "Маржа",
      "Показывать": "Показувати",
      "Свободные средства": "Вільні кошти",
      "Спецификация": "Специфікація",
      "Символ": "Символ",
      "Цена": "Ціна",
      "Все": "Всі",
      "★ Избранное": "★ Обране",
      "+ группа": "+ група",
      "Форекс": "Форекс",
      "Металлы": "Метали",
      "Индексы": "Індекси",
      "Крипто": "Крипто",
      "Лоты": "Лоти",
      "Продать": "Продати",
      "Купить": "Купити",
      "Рынок открыт": "Ринок відкритий",
      "Плечо": "Плече",
      "Комиссия": "Комісія",
      "Открытые": "Відкриті",
      "Закрытые": "Закриті",
      "Все сделки": "Всі угоди",
      "История сделок": "Історія угод",
      "Сделок ещё нет": "Угод ще немає",
      "Тарифы": "Тарифи",
      "Пройди испытание — получи реальный проп-счёт до $200,000": "Пройди випробування — отримай реальний проп-рахунок до $200,000",
      "80% прибыли": "80% прибутку",
      "Без ограничений по времени": "Без обмежень за часом",
      "Мгновенный доступ": "Миттєвий доступ",
      "Тип программы": "Тип програми",
      "1 этап": "1 етап",
      "2 этапа": "2 етапи",
      "Инстант": "Інстант",
      "Размер счёта": "Розмір рахунку",
      "Выбранный план": "Обраний план",
      "единоразовый платёж": "разовий платіж",
      "Условия торговли": "Умови торгівлі",
      "Параметр": "Параметр",
      "Фаза 1": "Фаза 1",
      "Финанс.": "Фінанс.",
      "Цель прибыли": "Ціль прибутку",
      "Макс. дн. убыток": "Макс. ден. збиток",
      "Макс. убыток": "Макс. збиток",
      "Мин. торг. дней": "Мін. торг. днів",
      "Торговый период": "Торговий період",
      "Выплата прибыли": "Виплата прибутку",
      "🚀 Купить счёт прямо сейчас": "🚀 Купити рахунок зараз",
      "Мгновенный доступ · 24/7 поддержка · Выплата 80% прибыли": "Миттєвий доступ · 24/7 підтримка · Виплата 80% прибутку",
      "Счёт": "Рахунок",
      "Торговля": "Торгівля",
      "История": "Історія",
      "Топ": "Топ",
      "СЧЁТ ЗАБЛОКИРОВАН": "РАХУНОК ЗАБЛОКОВАНО",
      "Счёт заблокирован": "Рахунок заблоковано",
      "Превышен дневной лимит убытка": "Перевищено денний ліміт збитку",
      "Превышен максимальный лимит убытка": "Перевищено максимальний ліміт збитку",
      "Условия челленджа нарушены": "Умови челенджу порушено",
      "Условия челленджа нарушены. Сбросьте счёт для новой попытки.": "Умови челенджу порушено. Скиньте рахунок для нової спроби."
    }
  };
  function translatePatterns(str, lang) {
    if (lang === 'ru') return str;
    if (lang === 'en') {
      str = str.replace(/(\d+)\s*сделок/g, '$1 trades');
      str = str.replace(/(\d+)\s*сделки/g, '$1 trades');
      str = str.replace(/(\d+)\s*сделка/g, '$1 trade');
      str = str.replace(/(\d+)\s*дней/g, '$1 days');
      str = str.replace(/(\d+)\s*дня/g, '$1 days');
      str = str.replace(/(\d+)\s*день/g, '$1 day');
    } else if (lang === 'uk') {
      str = str.replace(/(\d+)\s*сделок/g, '$1 угод');
      str = str.replace(/(\d+)\s*сделки/g, '$1 угоди');
      str = str.replace(/(\d+)\s*сделка/g, '$1 угода');
      str = str.replace(/(\d+)\s*дней/g, '$1 днів');
      str = str.replace(/(\d+)\s*дня/g, '$1 дні');
      str = str.replace(/(\d+)\s*день/g, '$1 день');
    }
    return str;
  }
  function getLang() {
    try { return localStorage.getItem(KEY) || 'ru'; } catch(e) { return 'ru'; }
  }
  function restoreOriginals() {
    document.querySelectorAll('[data-i18n-orig]').forEach(function(el){
      var orig = el.getAttribute('data-i18n-orig');
      if (orig != null) {
        var nodes = el.childNodes;
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i].nodeType === 3 && nodes[i].nodeValue.trim()) {
            nodes[i].nodeValue = nodes[i].nodeValue.replace(nodes[i].nodeValue.trim(), orig);
            break;
          }
        }
      }
    });
  }
  function setLang(l) {
    try { localStorage.setItem(KEY, l); } catch(e){}
    restoreOriginals();
    if (l !== 'ru') {
      setTimeout(applyAll, 30);
    }
    updateSwitcher();
  }
  function applyAll() {
    var lang = getLang();
    if (lang === 'ru') return;
    var d = DICT[lang] || {};
    var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n) {
        var t = n.nodeValue;
        if (!t || !t.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.tagName === 'SCRIPT' || p.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (p.id === 'langSwitcher' || (p.closest && p.closest('#langMenu'))) return NodeFilter.FILTER_REJECT;
        if (p.id === 'themeToggleBtn') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var n;
    while (n = tw.nextNode()) nodes.push(n);
    nodes.forEach(function(node) {
      var orig = node.nodeValue;
      var trimmed = orig.trim();
      if (!trimmed) return;
      var p = node.parentElement;
      if (p && !p.hasAttribute('data-i18n-orig')) {
        p.setAttribute('data-i18n-orig', trimmed);
      }
      if (d[trimmed]) {
        node.nodeValue = orig.replace(trimmed, d[trimmed]);
        return;
      }
      var translated = translatePatterns(orig, lang);
      if (translated !== orig) {
        node.nodeValue = translated;
      }
    });
  }
  function updateSwitcher(){
    var sw = document.getElementById('langSwitcher');
    if (!sw) return;
    sw.textContent = getLang().toUpperCase() + ' ▾';
    var menu = document.getElementById('langMenu');
    if (menu) {
      Array.from(menu.querySelectorAll('button')).forEach(function(b){
        b.classList.toggle('active', b.dataset.lang === getLang());
      });
    }
  }
  function toggleMenu(e){
    e && e.stopPropagation();
    var menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('open');
  }
  function init() {
    if (document.getElementById('langSwitcher')) return;
    var sw = document.createElement('div');
    sw.id = 'langSwitcher';
    sw.textContent = getLang().toUpperCase() + ' ▾';
    sw.addEventListener('click', toggleMenu);
    document.body.appendChild(sw);
    var menu = document.createElement('div');
    menu.id = 'langMenu';
    [['ru','Русский'],['en','English'],['uk','Українська']].forEach(function(pair){
      var b = document.createElement('button');
      b.dataset.lang = pair[0];
      b.textContent = pair[1];
      b.addEventListener('click', function(e){
        e.stopPropagation();
        setLang(pair[0]);
        menu.classList.remove('open');
      });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    document.addEventListener('click', function(e){
      if (!menu.contains(e.target) && e.target !== sw) menu.classList.remove('open');
    });
    updateSwitcher();
    applyAll();
    var pending = false;
    var observer = new MutationObserver(function(){
      if (pending) return;
      pending = true;
      setTimeout(function(){
        pending = false;
        if (getLang() !== 'ru') applyAll();
      }, 200);
    });
    observer.observe(document.body, {childList: true, subtree: true, characterData: true});
  }
  /* boot moved to setup() */
export function setup() {
  if (typeof init === 'function') init();
}
