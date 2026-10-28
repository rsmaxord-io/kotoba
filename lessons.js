/* ============================================================
   Kotoba — the 100-level lesson reader
   Renders the course from lessons-data/unitNN.js
   ============================================================ */
(function () {
  'use strict';

  var UNITS = [
    { n: 1, title: 'Sounds and first words', jp: '音と はじめての ことば', jlpt: 'Pre-N5', range: '1–10', colour: '#7f9bb5' },
    { n: 2, title: 'The N5 core', jp: 'N5の きほん', jlpt: 'N5', range: '11–20', colour: '#7fa77a' },
    { n: 3, title: 'Daily life, N5', jp: 'まいにちの せいかつ', jlpt: 'N5', range: '21–30', colour: '#c9a650' },
    { n: 4, title: 'The bridge to N4', jp: 'N4への はし', jlpt: 'N5 → N4', range: '31–40', colour: '#c08a5e' },
    { n: 5, title: 'Practical N4', jp: 'つかえる N4', jlpt: 'N4', range: '41–50', colour: '#c4624d' },
    { n: 6, title: 'N3 and your own voice', jp: 'N3と じぶんの ことば', jlpt: 'N3', range: '51–60', colour: '#8d76ad' },
    { n: 7, title: 'Nuance and opinion', jp: 'ニュアンスと いけん', jlpt: 'N3', range: '61–70', colour: '#5f9e9a' },
    { n: 8, title: 'N2: the working language', jp: 'N2の にほんご', jlpt: 'N2', range: '71–80', colour: '#b87087' },
    { n: 9, title: 'N2: range and speed', jp: 'N2の ひろがり', jlpt: 'N2', range: '81–90', colour: '#8f7d5a' },
    { n: 10, title: 'N1: the long conversation', jp: 'N1の ながい かいわ', jlpt: 'N1', range: '91–100', colour: '#3f5f8a' }
  ];

  var lessons = window.KOTOBA_LESSONS || [];
  if (!lessons.length) return;

  lessons.sort(function (a, b) { return a.n - b.n; });

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reader = $('#lesson-reader');
  var ladder = $('#level-ladder');
  var pager = $('#lesson-pager');
  var titleEl = $('#lesson-current-title');
  var subEl = $('#lesson-current-sub');
  var progressText = $('#lesson-progress-text');
  var progressBar = $('#lesson-progress-bar');
  var search = $('#lesson-search');
  var filters = $$('[data-level-filter]');

  var STORAGE = 'kotoba-course-v1';
  var completed = readCompleted();
  var activeFilter = 'all';
  var current = 1;
  var query = '';

  function readCompleted() {
    try {
      var raw = window.localStorage.getItem(STORAGE);
      var value = raw ? JSON.parse(raw) : [];
      return Array.isArray(value) ? value.map(Number) : [];
    } catch (e) { return []; }
  }

  function saveCompleted() {
    try { window.localStorage.setItem(STORAGE, JSON.stringify(completed)); } catch (e) { /* no-op */ }
  }

  function isDone(n) { return completed.indexOf(n) !== -1; }

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function unitFor(n) {
    for (var i = 0; i < UNITS.length; i += 1) {
      if (n <= i * 10 + 10) return UNITS[i];
    }
    return UNITS[UNITS.length - 1];
  }

  function levelClass(lesson) {
    var j = (lesson.jlpt || '').toLowerCase();
    if (j.indexOf('pre') === 0) return 'pre';
    if (j.indexOf('n5') === 0) return 'n5';
    if (j.indexOf('n4') === 0) return 'n4';
    if (j.indexOf('n3') === 0) return 'n3';
    if (j.indexOf('n2') === 0) return 'n2';
    if (j.indexOf('n1') === 0) return 'n1';
    return 'n5';
  }

  function matches(lesson) {
    if (activeFilter === 'output' && !(lesson.write || lesson.speak)) return false;
    if (activeFilter !== 'all' && activeFilter !== 'output' && levelClass(lesson) !== activeFilter) return false;
    if (!query) return true;
    var guide = guideFor(lesson.n);
    var guideHay = '';
    if (guide) {
      guideHay = [
        guide.ref,
        (guide.vocab || []).map(function (v) { return v.join(' '); }).join(' '),
        (guide.kanji || []).map(function (k) { return k.join(' '); }).join(' '),
        (guide.dialogue || []).map(function (d) { return d.join(' '); }).join(' '),
        guide.reading ? [guide.reading.jp, guide.reading.ks, guide.reading.en].join(' ') : '',
        (guide.check || []).join(' ')
      ].join(' ');
    }
    var hay = [
      lesson.n, lesson.title, lesson.can, lesson.pattern, lesson.explain,
      lesson.drill, lesson.curious, lesson.write, lesson.speak,
      (lesson.words || []).join(' '),
      (lesson.ex || []).map(function (x) { return [x.jp, x.ks, x.en, x.kanji].join(' '); }).join(' '),
      guideHay
    ].join(' ').toLowerCase();
    return hay.indexOf(query) !== -1;
  }

  /* ---------------- ladder ---------------- */

  function renderLadder() {
    var html = '';
    UNITS.forEach(function (unit) {
      var items = lessons.filter(function (lesson) {
        return lesson.n > (unit.n - 1) * 10 && lesson.n <= unit.n * 10;
      });
      var shown = items.filter(matches);
      if (!shown.length) return;
      html += '<div class="level-unit" data-unit="' + unit.n + '">';
      html += '<div class="level-unit__label"><span>' + esc(unit.jlpt) + '</span><b>Unit ' + unit.n + '</b><em>' + esc(unit.range) + '</em></div>';
      html += '<div class="level-unit__buttons">';
      items.forEach(function (lesson) {
        var ok = matches(lesson);
        html += '<button class="level-btn' + (lesson.n === current ? ' is-active' : '') + (isDone(lesson.n) ? ' is-done' : '') + (ok ? '' : ' is-filtered') +
          '" type="button" data-level="' + lesson.n + '" aria-label="Level ' + lesson.n + ': ' + esc(lesson.title) + '"' +
          (lesson.n === current ? ' aria-current="true"' : '') + '>' +
          '<span class="level-btn__n">' + lesson.n + '</span>' +
          '<span class="level-btn__t">' + esc(lesson.title) + '</span></button>';
      });
      html += '</div></div>';
    });
    ladder.innerHTML = html;
  }

  /* ---------------- reader ---------------- */

  function speakButton(text, voice, label) {
    return '<button class="speak" type="button" data-speak="' + esc(text) + '" data-voice="' + esc(voice) + '" aria-label="' + esc(label) + '">' +
      '<svg class="speak__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>' +
      '<span class="speak__bars" aria-hidden="true"><i></i><i></i><i></i></span></button>';
  }

  function tinySpeak(text, voice, label) {
    return '<button class="speak speak--tiny" type="button" data-speak="' + esc(text) + '" data-voice="' + esc(voice) + '" aria-label="' + esc(label) + '">' +
      '<svg class="speak__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
      '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg></button>';
  }

  /* ---------------- study-guide layer ----------------
     guideNN.js adds vocabulary, kanji, a dialogue, a short
     reading and a checklist to each level. Everything here is
     optional: a level without guide data still renders. */

  function guideFor(n) {
    var map = window.KOTOBA_GUIDE || {};
    return map[n] || null;
  }

  function guideBar(guide) {
    var parts = [];
    if (guide.ref) parts.push('<span class="lesson-guidebar__ref">' + esc(guide.ref) + '</span>');
    if (guide.time) parts.push('<span>' + esc(guide.time) + '</span>');
    if (guide.vocab) parts.push('<span>' + guide.vocab.length + ' new words</span>');
    if (guide.kanji && guide.kanji.length) parts.push('<span>' + guide.kanji.length + ' kanji</span>');
    return parts.length ? '<div class="lesson-guidebar">' + parts.join('<i aria-hidden="true">·</i>') + '</div>' : '';
  }

  function vocabBlock(vocab) {
    if (!vocab || !vocab.length) return '';
    var items = vocab.map(function (item) {
      var kana = item[0] || '';
      var kanji = item[1] || '';
      var en = item[2] || '';
      var pos = item[3] || '';
      var head = kanji && kanji !== '—' ? kanji : kana;
      return '<li class="vocab-item">' +
        '<span class="vocab-item__head" lang="ja">' + esc(head) + '</span>' +
        '<span class="vocab-item__kana" lang="ja">' + esc(kana) + '</span>' +
        '<span class="vocab-item__en">' + esc(en) + (pos ? ' <em>' + esc(pos) + '</em>' : '') + '</span>' +
        tinySpeak(kana, 'std-f', 'Hear ' + kana) +
        '</li>';
    }).join('');
    return '<section class="lesson-vocab"><h3>New words</h3><ul class="vocab-grid">' + items + '</ul></section>';
  }

  function kanjiBlock(kanji) {
    if (!kanji || !kanji.length) return '';
    var items = kanji.map(function (item) {
      var char = item[0] || '';
      var read = item[1] || '';
      var en = item[2] || '';
      var word = item[3] || '';
      return '<li class="kanji-chip">' +
        '<span class="kanji-chip__char" lang="ja">' + esc(char) + '</span>' +
        '<span class="kanji-chip__body"><span class="kanji-chip__read" lang="ja">' + esc(read) + '</span>' +
        '<span class="kanji-chip__en">' + esc(en) + '</span>' +
        (word ? '<span class="kanji-chip__word" lang="ja">' + esc(word) + '</span>' : '') + '</span>' +
        (word ? tinySpeak(word, 'std-f', 'Hear ' + word) : '') +
        '</li>';
    }).join('');
    return '<section class="lesson-kanji"><h3>Kanji for this level</h3><ul class="kanji-strip">' + items + '</ul></section>';
  }

  function dialogueBlock(dialogue) {
    if (!dialogue || !dialogue.length) return '';
    var items = dialogue.map(function (line) {
      var who = line[0] || '';
      var jp = line[1] || '';
      var ks = line[2] || '';
      var en = line[3] || '';
      var showKs = ks && ks !== jp;
      var stdVoice = who === 'B' ? 'std-m' : 'std-f';
      var ksVoice = who === 'B' ? 'kansai-m' : 'kansai-f';
      return '<li class="dlg-line">' +
        '<span class="dlg-line__who" aria-hidden="true">' + esc(who) + '</span>' +
        '<div class="dlg-line__body">' +
          '<p class="dlg-line__jp" lang="ja">' + esc(jp) + '</p>' +
          (showKs ? '<p class="dlg-line__ks" lang="ja"><span>Kansai</span>' + esc(ks) + '</p>' : '') +
          '<p class="dlg-line__en">' + esc(en) + '</p>' +
        '</div>' +
        '<div class="dlg-line__audio">' + tinySpeak(jp, stdVoice, 'Hear the standard line') +
          (showKs ? tinySpeak(ks, ksVoice, 'Hear the Osaka line') : '') + '</div>' +
        '</li>';
    }).join('');
    return '<section class="lesson-dialogue"><h3>Dialogue</h3><p class="lesson-dialogue__hint">Read the standard line, then the Osaka line. Change the scene, keep the shape.</p><ol class="dlg-list">' + items + '</ol></section>';
  }

  function readingBlock(reading) {
    if (!reading || !reading.jp) return '';
    var ks = reading.ks && reading.ks !== reading.jp ? reading.ks : '';
    return '<section class="lesson-reading"><h3>Read it</h3>' +
      '<div class="lesson-reading__box"><p class="lesson-reading__jp" lang="ja">' + esc(reading.jp) + '</p>' +
      (ks ? '<p class="lesson-reading__ks" lang="ja"><span>Kansai</span>' + esc(ks) + '</p>' : '') +
      '<p class="lesson-reading__en">' + esc(reading.en) + '</p></div>' +
      '<div class="lesson-reading__audio">' + tinySpeak(reading.jp, 'std-f', 'Hear the reading') +
      (ks ? tinySpeak(ks, 'kansai-m', 'Hear the Osaka reading') : '') + '</div></section>';
  }

  function checkBlock(check) {
    if (!check || !check.length) return '';
    var items = check.map(function (item) {
      return '<li><span aria-hidden="true">✓</span>' + esc(item) + '</li>';
    }).join('');
    return '<section class="lesson-check"><h3>Before you move on</h3><ul>' + items + '</ul></section>';
  }

  function renderReader() {
    var lesson = lessons.filter(function (item) { return item.n === current; })[0];
    if (!lesson) return;
    var unit = unitFor(lesson.n);
    var jlpt = lesson.jlpt || unit.jlpt;
    var guide = guideFor(lesson.n);

    if (titleEl) titleEl.textContent = 'Level ' + lesson.n + ' · ' + lesson.title;
    if (subEl) subEl.textContent = 'Unit ' + unit.n + ' · ' + unit.title + ' · ' + jlpt;

    var rows = (lesson.ex || []).map(function (ex) {
      var display = ex.kanji || ex.jp;
      var ks = ex.ks && ex.ks !== ex.jp ? ex.ks : '';
      return '<div class="lesson-line">' +
        '<div class="lesson-line__std"><span class="lesson-line__tag">Standard</span>' +
        '<p lang="ja">' + esc(display) + '</p>' +
        (ks ? '<p class="lesson-line__kana" lang="ja">' + esc(ex.jp) + '</p>' : '') +
        '<p class="lesson-line__en">' + esc(ex.en) + '</p></div>' +
        speakButton(ex.jp, 'std-f', 'Hear the standard line') +
        (ks ? '<div class="lesson-line__ks"><span class="lesson-line__tag lesson-line__tag--ks">Kansai</span>' +
          '<p lang="ja">' + esc(ks) + '</p></div>' + speakButton(ks, 'kansai-m', 'Hear the Osaka line') : '') +
        '</div>';
    }).join('');

    var words = (lesson.words || []).map(function (word) {
      var kanji = word[0] || '';
      var kana = word[1] || '';
      var en = word[2] || '';
      return '<li class="lesson-word"><span class="lesson-word__kanji" lang="ja">' + esc(kanji || kana) + '</span>' +
        '<span class="lesson-word__kana" lang="ja">' + esc(kana) + '</span>' +
        '<span class="lesson-word__en">' + esc(en) + '</span>' +
        speakButton(kana, 'std-f', 'Hear ' + kana) + '</li>';
    }).join('');

    var output = '';
    if (lesson.write || lesson.speak) {
      output = '<div class="lesson-output">' +
        (lesson.write ? '<article class="lesson-output__card"><span class="practice-card__tag">Write</span><h4>' + esc(lesson.write) + '</h4>' +
          (lesson.writeModel ? '<details><summary>Model answer</summary><p lang="ja">' + esc(lesson.writeModel) + '</p></details>' : '') + '</article>' : '') +
        (lesson.speak ? '<article class="lesson-output__card"><span class="practice-card__tag">Speak</span><h4>' + esc(lesson.speak) + '</h4>' +
          (lesson.speakModel ? '<details><summary>Model answer</summary><p lang="ja">' + esc(lesson.speakModel) + '</p></details>' : '') + '</article>' : '') +
        '</div>';
    }

    reader.innerHTML =
      '<article class="lesson-sheet" id="level-' + lesson.n + '">' +
        '<header class="lesson-sheet__head">' +
          '<div class="lesson-sheet__badges"><span class="badge badge--level">Level ' + lesson.n + '</span>' +
          '<span class="badge badge--jlpt">' + esc(jlpt) + '</span>' +
          '<span class="badge badge--unit">Unit ' + unit.n + ' · ' + esc(unit.title) + '</span></div>' +
          '<h2>' + esc(lesson.title) + '</h2>' +
          '<p class="lesson-sheet__can"><b>By the end:</b> ' + esc(lesson.can) + '</p>' +
        '</header>' +
        (guide ? guideBar(guide) : '') +
        '<div class="lesson-pattern"><span>The pattern</span><p lang="ja">' + esc(lesson.pattern) + '</p></div>' +
        (guide ? vocabBlock(guide.vocab) : '') +
        (guide ? kanjiBlock(guide.kanji) : '') +
        '<p class="lesson-explain">' + esc(lesson.explain) + '</p>' +
        (guide ? dialogueBlock(guide.dialogue) : '') +
        '<section class="lesson-examples"><h3>Say it</h3>' + rows + '</section>' +
        (guide ? readingBlock(guide.reading) : '') +
        '<section class="lesson-words"><h3>Words to keep</h3><ul>' + words + '</ul></section>' +
        '<section class="lesson-drill"><h3>Try it</h3><p>' + esc(lesson.drill) + '</p>' +
          '<details><summary>Show a model answer</summary><p lang="ja">' + esc(lesson.answer) + '</p></details></section>' +
        output +
        '<aside class="lesson-curious"><span>Stay curious</span><p>' + esc(lesson.curious) + '</p></aside>' +
        (guide ? checkBlock(guide.check) : '') +
        '<footer class="lesson-sheet__foot">' +
          '<button class="complete-btn' + (isDone(lesson.n) ? ' is-done' : '') + '" type="button" data-complete="' + lesson.n + '" aria-pressed="' + (isDone(lesson.n) ? 'true' : 'false') + '">' +
            (isDone(lesson.n) ? '✓ Completed' : 'Mark this level complete') + '</button>' +
          '<span class="lesson-sheet__id">Level ' + lesson.n + ' of 100</span>' +
        '</footer>' +
      '</article>';

    renderPager(lesson);
    renderLadder();
    updateProgress();
  }

  function renderPager(lesson) {
    var prev = lessons.filter(function (item) { return item.n === lesson.n - 1; })[0];
    var next = lessons.filter(function (item) { return item.n === lesson.n + 1; })[0];
    pager.innerHTML =
      (prev ? '<button class="lesson-pager__btn" type="button" data-level="' + prev.n + '"><span>← Previous</span><b>' + prev.n + ' · ' + esc(prev.title) + '</b></button>' : '<span></span>') +
      (next ? '<button class="lesson-pager__btn lesson-pager__btn--next" type="button" data-level="' + next.n + '"><span>Next →</span><b>' + next.n + ' · ' + esc(next.title) + '</b></button>' : '<span></span>');
  }

  function updateProgress() {
    var count = completed.length;
    if (progressText) progressText.textContent = count + ' / 100';
    if (progressBar) progressBar.style.width = count + '%';
  }

  function selectLevel(n, options) {
    options = options || {};
    if (!lessons.some(function (item) { return item.n === n; })) return;
    current = n;
    if (options.scroll) {
      var target = $('#start');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (history.replaceState) history.replaceState(null, '', '#level-' + n);
    renderReader();
  }

  /* ---------------- events ---------------- */

  document.addEventListener('click', function (event) {
    var levelBtn = event.target.closest('[data-level]');
    if (levelBtn) {
      selectLevel(Number(levelBtn.getAttribute('data-level')), { scroll: false });
      return;
    }
    var completeBtn = event.target.closest('[data-complete]');
    if (completeBtn) {
      var n = Number(completeBtn.getAttribute('data-complete'));
      var index = completed.indexOf(n);
      if (index === -1) completed.push(n); else completed.splice(index, 1);
      saveCompleted();
      renderReader();
    }
  });

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      filters.forEach(function (item) {
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
      activeFilter = button.getAttribute('data-level-filter');
      renderLadder();
    });
  });

  if (search) {
    search.addEventListener('input', function () {
      query = search.value.trim().toLowerCase();
      renderLadder();
    });
  }

  /* ---------------- unit cards ---------------- */

  var unitGrid = $('#unit-grid');
  if (unitGrid) {
    unitGrid.innerHTML = UNITS.map(function (unit) {
      var items = lessons.filter(function (lesson) { return lesson.n > (unit.n - 1) * 10 && lesson.n <= unit.n * 10; });
      var first = items[0];
      var out = items.filter(function (lesson) { return lesson.write || lesson.speak; }).length;
      return '<a class="unit-card" href="#level-' + (first ? first.n : 1) + '" data-jump="' + (first ? first.n : 1) + '" style="--unit-colour:' + unit.colour + '">' +
        '<span class="unit-card__num">' + String(unit.n).padStart(2, '0') + '</span>' +
        '<span class="unit-card__jlpt">' + esc(unit.jlpt) + ' · ' + esc(unit.range) + '</span>' +
        '<h3>' + esc(unit.title) + '</h3>' +
        '<p lang="ja">' + esc(unit.jp) + '</p>' +
        '<span class="unit-card__meta">' + items.length + ' levels' + (out ? ' · ' + out + ' with output' : '') + '</span>' +
        '</a>';
    }).join('');
  }

  document.addEventListener('click', function (event) {
    var jump = event.target.closest('[data-jump]');
    if (!jump) return;
    event.preventDefault();
    selectLevel(Number(jump.getAttribute('data-jump')), { scroll: true });
  });

  /* ---------------- boot ---------------- */

  var hash = /#level-(\d+)/.exec(window.location.hash);
  if (hash) current = Math.max(1, Math.min(100, Number(hash[1])));
  renderReader();
  renderLadder();
  updateProgress();
})();
