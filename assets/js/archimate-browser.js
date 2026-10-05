// ArchiMate browser renderer — portable, reads KB/RELS from <script type="application/json">.
// Ported from the tr4d3rz reference device page. No globals pollution beyond showModal/closeModal
// (used by inline onclick) and ArchiMateBrowser.init.
(function (global) {
  'use strict';

  // ─── ArchiMate type icons (inline SVG pictograms, ArchiMate 3.2 notation) ───
  const ARCH_ICONS = {
    // ── Motivation ──
    Motivation_Goal:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2L18 10L10 18L2 10Z"/></svg>',
    Motivation_Principle:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2L18 10L10 18L2 10Z"/><line x1="2" y1="10" x2="18" y2="10" stroke-width="1.5"/></svg>',
    Motivation_Driver:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6 Q5 2 10 2 Q15 2 17 6 Q19 10 17 14 Q15 18 10 18 Q5 18 3 14 Q1 10 3 6Z"/></svg>',
    Motivation_Assessment:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 2L18 10L10 18L2 10Z"/><circle cx="10" cy="10" r="3"/></svg>',
    Motivation_Constraint:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 2L18 10L10 18L2 10Z"/><line x1="10" y1="6" x2="10" y2="10" stroke-width="2"/><circle cx="10" cy="13" r="1" fill="currentColor"/></svg>',
    Motivation_Outcome:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2L18 10L10 18L2 10Z"/><circle cx="10" cy="10" r="2.5" fill="currentColor"/></svg>',
    Motivation_Requirement:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="16" height="12" rx="1"/><path d="M6 10 L9 13 L14 7"/></svg>',
    // ── Business ──
    Business_Process:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="5" width="13" height="10" rx="3"/><path d="M14 10L19 10M17 7L19 10L17 13" stroke-linecap="round"/></svg>',
    Business_Service:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="18" height="10" rx="1"/><line x1="1" y1="17" x2="19" y2="17" stroke-width="2.5"/></svg>',
    Business_Function:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="18" height="12" rx="1"/><path d="M6 10 Q10 6 14 10" fill="none"/></svg>',
    Business_Object:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2L13 2L17 6L17 18L3 18Z"/><path d="M13 2L13 6L17 6"/></svg>',
    Business_Representation:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2L13 2L17 6L17 18L3 18Z"/><path d="M13 2L13 6L17 6"/><line x1="6" y1="10" x2="14" y2="10"/><line x1="6" y1="13" x2="14" y2="13"/></svg>',
    Business_Role:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="18" height="12" rx="1"/><circle cx="10" cy="10" r="3.5"/></svg>',
    Business_Actor:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="6" r="3.5"/><path d="M3 18 Q3 12 10 12 Q17 12 17 18"/></svg>',
    // ── Application ──
    Application_Component:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="1" width="14" height="18" rx="1"/><rect x="1" y="5" width="7" height="3" rx="1"/><rect x="1" y="11" width="7" height="3" rx="1"/></svg>',
    Application_Service:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="18" height="10" rx="1"/><line x1="1" y1="17" x2="19" y2="17" stroke-width="2.5"/></svg>',
    Application_Function:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="1" width="14" height="18" rx="1"/><rect x="1" y="5" width="7" height="3" rx="1"/><path d="M7 13 Q10 10 13 13" fill="none"/></svg>',
    Application_DataObject:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2L13 2L17 6L17 18L3 18Z"/><path d="M13 2L13 6L17 6"/><line x1="6" y1="10" x2="14" y2="10"/><line x1="6" y1="13" x2="14" y2="13"/></svg>',
    // ── Technology ──
    Technology_Device:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="18" height="11" rx="1"/><rect x="6" y="16" width="8" height="2"/><rect x="4" y="7" width="12" height="5"/></svg>',
    Technology_SystemSoftware:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2"  width="16" height="4" rx="1"/><rect x="2" y="8"  width="16" height="4" rx="1"/><rect x="2" y="14" width="16" height="4" rx="1"/></svg>',
    Technology_Service:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="18" height="10" rx="1"/><line x1="1" y1="17" x2="19" y2="17" stroke-width="2.5"/></svg>',
    Technology_Node:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="16" height="12" rx="1"/><path d="M2 6L6 2L20 2L18 6"/><line x1="18" y1="6" x2="20" y2="2"/></svg>',
    Technology_Artifact:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2L13 2L17 6L17 18L3 18Z"/><path d="M13 2L13 6L17 6"/><line x1="6" y1="10" x2="14" y2="10"/><line x1="6" y1="13" x2="14" y2="13"/></svg>',
    Technology_CommunicationNetwork:
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="8"/><path d="M2 10 Q5 6 10 10 Q15 14 18 10"/><path d="M2 10 Q5 14 10 10 Q15 6 18 10"/><line x1="10" y1="2" x2="10" y2="18"/></svg>',
  };

  // ─── Type ordering for grouping same-type elements side-by-side ───
  const TYPE_ORDER = {
    'Motivation_Driver': 0, 'Motivation_Assessment': 1, 'Motivation_Goal': 2,
    'Motivation_Outcome': 3, 'Motivation_Principle': 4, 'Motivation_Requirement': 5, 'Motivation_Constraint': 6,
    'Business_Actor': 10, 'Business_Role': 11, 'Business_Collaboration': 12, 'Business_Interface': 13,
    'Business_Process': 20, 'Business_Function': 21, 'Business_Interaction': 22,
    'Business_Event': 23, 'Business_Service': 24,
    'Business_Object': 30, 'Business_Representation': 31, 'Business_Product': 32,
    'Application_Component': 40, 'Application_Collaboration': 41, 'Application_Interface': 42,
    'Application_Function': 50, 'Application_Interaction': 51, 'Application_Process': 52,
    'Application_Event': 53, 'Application_Service': 54,
    'Application_DataObject': 60,
    'Technology_Node': 70, 'Technology_Device': 71, 'Technology_SystemSoftware': 72,
    'Technology_CommunicationNetwork': 73, 'Technology_Path': 74,
    'Technology_Function': 80, 'Technology_Process': 81, 'Technology_Interaction': 82,
    'Technology_Event': 83, 'Technology_Service': 84,
    'Technology_Artifact': 90, 'Technology_Object': 91,
  };

  // ─── Relation styles: stroke / dash / head marker ───
  const REL_STYLES = {
    Realization:    { stroke: '#3b82f6', dash: '6,3',  head: 'open'      },
    Composition:    { stroke: '#374151', dash: '',      head: 'diamond'   },
    Aggregation:    { stroke: '#374151', dash: '',      head: 'diamond-o' },
    Assignment:     { stroke: '#374151', dash: '',      head: 'filled', tail: 'circle' },
    Serving:        { stroke: '#7c3aed', dash: '',      head: 'open'      },
    Flow:           { stroke: '#f59e0b', dash: '',      head: 'filled'    },
    Association:    { stroke: '#6b7280', dash: '',      head: 'open'      },
    Influence:      { stroke: '#9ca3af', dash: '4,3',   head: 'open'      },
    Access:         { stroke: '#10b981', dash: '4,2',   head: 'open'      },
    Triggering:     { stroke: '#ef4444', dash: '',      head: 'filled'    },
    Specialization: { stroke: '#64748b', dash: '',      head: 'triangle'  },
  };

  function ns(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

  function buildDefs(svg) {
    const defs = ns('defs');

    function mkMarker(id, pathD, fillColor, strokeColor) {
      const m = ns('marker');
      m.setAttribute('id', id);
      m.setAttribute('markerWidth', '10'); m.setAttribute('markerHeight', '10');
      m.setAttribute('refX', '9');  m.setAttribute('refY', '4');
      m.setAttribute('orient', 'auto'); m.setAttribute('markerUnits', 'strokeWidth');
      const el = ns('path');
      el.setAttribute('d', pathD);
      el.setAttribute('fill', fillColor); el.setAttribute('stroke', strokeColor); el.setAttribute('stroke-width', '1');
      m.appendChild(el); defs.appendChild(m);
    }
    function mkCircle(id, color) {
      const m = ns('marker');
      m.setAttribute('id', id);
      m.setAttribute('markerWidth', '6'); m.setAttribute('markerHeight', '6');
      m.setAttribute('refX', '3'); m.setAttribute('refY', '3');
      m.setAttribute('orient', 'auto'); m.setAttribute('markerUnits', 'strokeWidth');
      const c = ns('circle');
      c.setAttribute('cx', '3'); c.setAttribute('cy', '3'); c.setAttribute('r', '2.5');
      c.setAttribute('fill', color);
      m.appendChild(c); defs.appendChild(m);
    }

    Object.entries(REL_STYLES).forEach(([type, st]) => {
      const t = type.toLowerCase();
      const s = st.stroke;
      switch (st.head) {
        case 'open':         mkMarker('arr-' + t, 'M1,1 L8,4 L1,7', 'none', s); break;
        case 'filled':       mkMarker('arr-' + t, 'M0,0 L9,4 L0,8Z', s, s); break;
        case 'diamond':      mkMarker('arr-' + t, 'M0,4 L5,0 L10,4 L5,8Z', s, s); break;
        case 'diamond-o':    mkMarker('arr-' + t, 'M0,4 L5,0 L10,4 L5,8Z', 'white', s); break;
        case 'triangle':     mkMarker('arr-' + t, 'M0,0 L9,4 L0,8Z', 'white', s); break;
      }
      if (st.tail === 'circle') mkCircle('tail-' + t, s);
    });

    svg.appendChild(defs);
  }

  function readJSON(container, id) {
    const el = container.querySelector('#' + id);
    if (!el) return null;
    try {
      // The JSON is HTML-escaped (&amp; &lt; &gt;) to protect against Liquid; unescape before parse.
      const raw = el.textContent.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function injectIcons(root, KB) {
    root.querySelectorAll('.arch-box').forEach(function (box) {
      const id = box.id;
      if (!id || !KB[id]) return;
      const d = KB[id];
      box.setAttribute('data-layer', d.layer);
      box.setAttribute('data-type', d.type);
      const svg = ARCH_ICONS[d.type];
      if (svg) {
        const wrap = document.createElement('div');
        wrap.className = 'type-icon';
        wrap.innerHTML = svg;
        box.appendChild(wrap);
      }
    });
  }

  function groupCellsByType(root) {
    root.querySelectorAll('.grid-cell').forEach(function (cell) {
      const boxes = Array.from(cell.querySelectorAll(':scope > .arch-box'));
      if (boxes.length < 2) return;
      const groups = new Map();
      boxes.forEach(function (box) {
        const type = box.getAttribute('data-type') || '__unknown';
        if (!groups.has(type)) groups.set(type, []);
        groups.get(type).push(box);
      });
      const sortedTypes = Array.from(groups.keys()).sort(function (a, b) {
        return (TYPE_ORDER[a] != null ? TYPE_ORDER[a] : 999) - (TYPE_ORDER[b] != null ? TYPE_ORDER[b] : 999);
      });
      boxes.forEach(function (b) { cell.removeChild(b); });
      sortedTypes.forEach(function (type) {
        const row = document.createElement('div');
        row.className = 'type-row';
        groups.get(type).forEach(function (b) { row.appendChild(b); });
        cell.appendChild(row);
      });
    });
  }

  function drawRelations(root, RELS) {
    const wrapper = root.querySelector('#diagram-wrapper');
    const svg = root.querySelector('#rel-svg');
    if (!wrapper || !svg) return;

    svg.setAttribute('width', wrapper.scrollWidth);
    svg.setAttribute('height', wrapper.scrollHeight);

    Array.from(svg.children).forEach(function (c) { if (c.tagName !== 'defs') svg.removeChild(c); });
    if (!svg.querySelector('defs')) buildDefs(svg);

    const wRect = wrapper.getBoundingClientRect();
    const scrollL = wrapper.scrollLeft, scrollT = wrapper.scrollTop;

    RELS.forEach(function (rel) {
      const fEl = document.getElementById(rel.from);
      const tEl = document.getElementById(rel.to);
      if (!fEl || !tEl) return;

      const fR = fEl.getBoundingClientRect();
      const tR = tEl.getBoundingClientRect();

      const x1 = fR.left - wRect.left + scrollL + fR.width / 2;
      const y1 = fR.top - wRect.top + scrollT + fR.height / 2;
      const x2 = tR.left - wRect.left + scrollL + tR.width / 2;
      const y2 = tR.top - wRect.top + scrollT + tR.height / 2;

      const st = REL_STYLES[rel.type] || REL_STYLES.Association;
      const t = rel.type.toLowerCase();

      const dx = x2 - x1, dy = y2 - y1;
      const cx1 = x1 + dx * 0.5, cy1 = y1;
      const cx2 = x1 + dx * 0.5, cy2 = y2;

      const g = ns('g');
      g.setAttribute('class', 'rel-grp from-' + rel.from + ' to-' + rel.to);
      g.setAttribute('opacity', '0.28');

      const tailMark = st.tail ? 'url(#tail-' + t + ')' : '';
      const path = ns('path');
      path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + cx1 + ',' + cy1 + ' ' + cx2 + ',' + cy2 + ' ' + x2 + ',' + y2);
      path.setAttribute('stroke', st.stroke);
      path.setAttribute('stroke-width', '1.5');
      if (st.dash) path.setAttribute('stroke-dasharray', st.dash);
      path.setAttribute('fill', 'none');
      path.setAttribute('marker-end', 'url(#arr-' + t + ')');
      if (tailMark) path.setAttribute('marker-start', tailMark);
      g.appendChild(path);

      if (rel.label) {
        const mx = x1 + dx * 0.5, my = y1 + dy * 0.5;
        const lbl = ns('text');
        lbl.setAttribute('x', mx); lbl.setAttribute('y', my - 4);
        lbl.setAttribute('text-anchor', 'middle');
        lbl.setAttribute('font-size', '8'); lbl.setAttribute('font-family', 'Courier New');
        lbl.setAttribute('fill', st.stroke); lbl.setAttribute('opacity', '0.9');
        lbl.textContent = rel.label;
        g.appendChild(lbl);
      }

      svg.appendChild(g);
    });
  }

  function attachHover(root) {
    const boxes = root.querySelectorAll('.arch-box');
    boxes.forEach(function (box) {
      box.addEventListener('mouseenter', function () {
        const id = box.id; if (!id) return;
        root.querySelectorAll('.arch-box').forEach(function (b) { b.classList.add('dimmed'); });
        root.querySelectorAll('.rel-grp').forEach(function (g) { g.setAttribute('opacity', '0.06'); });

        const connected = new Set([id]);
        root.querySelectorAll('.from-' + id + ',.to-' + id).forEach(function (g) {
          g.setAttribute('opacity', '1');
          const cls = g.getAttribute('class') || '';
          const fm = cls.match(/from-(\S+)/); if (fm) connected.add(fm[1]);
          const tm = cls.match(/to-(\S+)/);   if (tm) connected.add(tm[1]);
        });
        connected.forEach(function (cid) {
          const el = document.getElementById(cid);
          if (el) { el.classList.remove('dimmed'); el.classList.add('highlight'); }
        });
      });

      box.addEventListener('mouseleave', function () {
        root.querySelectorAll('.arch-box').forEach(function (b) { b.classList.remove('dimmed', 'highlight'); });
        root.querySelectorAll('.rel-grp').forEach(function (g) { g.setAttribute('opacity', '0.28'); });
      });
    });
  }

  function showModal(id) {
    const root = currentRoot;
    if (!root) return;
    const KB = currentKB;
    const d = KB[id]; if (!d) return;
    root.querySelector('#m-title').textContent = d.title;
    root.querySelector('#m-type').textContent = d.type;
    root.querySelector('#m-type-desc').textContent = d.type_desc;
    root.querySelector('#m-role').textContent = d.role;
    root.querySelector('#m-tech').textContent = d.tech;
    root.querySelector('#m-relations').textContent = d.relations;
    const lb = root.querySelector('#m-layer-badge');
    lb.textContent = d.layer + ' Layer'; lb.className = 'badge badge-' + d.layer;
    root.querySelector('#m-aspect').textContent = d.aspect;
    root.querySelector('#m-tech-block').style.display = d.tech ? 'block' : 'none';
    root.querySelector('#m-rel-block').style.display = d.relations ? 'block' : 'none';
    const editBlock = root.querySelector('#m-edit-block');
    if (editBlock) {
      editBlock.style.display = d.edit_url ? 'block' : 'none';
      const link = root.querySelector('#m-edit');
      if (link && d.edit_url) link.href = d.edit_url;
      const source = root.querySelector('#m-source');
      if (source) source.textContent = d.source || '';
    }
    root.querySelector('#overlay').style.display = 'block';
    root.querySelector('#modal').style.display = 'block';
  }

  function closeModal() {
    const root = currentRoot;
    if (!root) return;
    const ov = root.querySelector('#overlay');
    const md = root.querySelector('#modal');
    if (ov) ov.style.display = 'none';
    if (md) md.style.display = 'none';
  }

  // State for the current initialized browser instance (used by global showModal/closeModal).
  let currentRoot = null;
  let currentKB = null;

  function init(containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;
    const KB = readJSON(root, 'archimate-kb');
    const RELS = readJSON(root, 'archimate-rels');
    if (!KB || !RELS) return;

    currentRoot = root;
    currentKB = KB;

    injectIcons(root, KB);
    groupCellsByType(root);
    drawRelations(root, RELS);
    attachHover(root);

    const wrapper = root.querySelector('#diagram-wrapper');
    // Redraw on resize/scroll/load. Guard against missing wrapper.
    window.addEventListener('load', function () { drawRelations(root, RELS); });
    window.addEventListener('resize', function () { drawRelations(root, RELS); });
    if (wrapper) wrapper.addEventListener('scroll', function () { drawRelations(root, RELS); });

    // Escape to close modal.
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  // Expose the globals the inline onclick handlers expect, plus an init entry point.
  global.showModal = showModal;
  global.closeModal = closeModal;
  global.ArchiMateBrowser = { init: init };

  // Auto-init on DOMContentLoaded if the default container is present.
  document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.archimate-browser')) {
      init('archimate-browser-root');
    }
  });
})(typeof window !== 'undefined' ? window : this);
