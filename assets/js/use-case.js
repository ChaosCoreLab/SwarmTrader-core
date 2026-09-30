// Use-case page interactivity: layer tabs, hover tooltips, click-to-cell.
// Viewer-controlled (no auto-advance). Respects prefers-reduced-motion.
(function () {
  'use strict';
  var view = document.getElementById('archimate-view');
  var tabsEl = document.getElementById('layer-tabs');
  if (!view || !tabsEl) return;

  var svg = view.querySelector('svg');
  if (!svg) return;

  // Build layer tabs from the layer columns present in the SVG.
  var layers = [];
  svg.querySelectorAll('.layer-col').forEach(function (col) {
    var l = col.getAttribute('data-layer');
    if (l && layers.indexOf(l) === -1) layers.push(l);
  });

  var labels = {
    business: 'Business',
    application: 'Application',
    technology: 'Technology',
    physical: 'Physical',
    motivation: 'Motivation',
  };

  function setActive(layer) {
    if (layer === 'all') {
      svg.classList.remove('is-filtered');
    } else {
      svg.classList.add('is-filtered');
      svg.querySelectorAll('.layer-col').forEach(function (col) {
        col.classList.toggle('is-active', col.getAttribute('data-layer') === layer);
      });
    }
    tabsEl.querySelectorAll('.layer-tab').forEach(function (t) {
      t.classList.toggle('is-active', t.getAttribute('data-layer') === layer);
    });
  }

  layers.forEach(function (l) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'layer-tab';
    b.setAttribute('data-layer', l);
    b.textContent = labels[l] || l;
    b.addEventListener('click', function () { setActive(l); });
    tabsEl.appendChild(b);
  });
  var all = document.createElement('button');
  all.type = 'button';
  all.className = 'layer-tab is-active';
  all.setAttribute('data-layer', 'all');
  all.textContent = 'All layers';
  all.addEventListener('click', function () { setActive('all'); });
  tabsEl.insertBefore(all, tabsEl.firstChild);

  // Click an element → scroll to its cell detail (if present).
  svg.addEventListener('click', function (e) {
    var g = e.target.closest('.ell');
    if (!g) return;
    var cell = g.getAttribute('data-cell');
    if (!cell) return;
    var target = document.getElementById('cell-' + cell) || document.querySelector('[data-cell-anchor="' + cell + '"]');
    if (target && target.scrollIntoView) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add('is-highlight');
      setTimeout(function () { target.classList.remove('is-highlight'); }, 1500);
    }
  });
})();
