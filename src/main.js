/** @see ../docs/architecture/simulator-overview.md#components */
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource/ibm-plex-mono';
import {
  CandlestickSeries,
  createChart,
  createSeriesMarkers,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';
import { SimulationController } from './engine/simulationController.js';
import './style.css';

const app = document.querySelector('#app');
const money = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const integer = new Intl.NumberFormat('it-IT');
const STATE_COLORS = {
  NW: '#8b5cf6', N: '#4f46e5', NE: '#2563eb', W: '#0f766e', C: '#65736f',
  E: '#ca8a04', SW: '#e56b45', S: '#c2413a', SE: '#be185d',
};

let snapshot = null;
let controller = null;
let chart = null;
let candleSeries = null;
let iirPrice1Series = null;
let iirPrice2Series = null;
let volumeSeries = null;
let markers = null;
let timer = null;
let isPlaying = false;
let showStates = false;
let showIir = true;
let renderedTraceCount = 0;
let renderedStateMode = showStates;
let markerCache = [];

app.innerHTML = `
  <header class="topbar">
    <a class="wordmark" href="#top" aria-label="SwarmTrader, inizio">
      <span class="wordmark__glyph">S</span>
      <span class="wordmark__name">SWARMTRADER<span>CORE / LAB</span></span>
    </a>
    <div class="topbar__right">
      <span class="run-state" id="run-state" data-state="loading"><span></span><b>Caricamento dati</b></span>
      <span class="topbar__build">POC 01 <i></i> MOTORE CONSILIUM</span>
    </div>
  </header>

  <main id="top" class="workspace">
    <section class="instrument-head" aria-labelledby="instrument-title">
      <div class="instrument-head__identity">
        <div class="ticker-mark" aria-hidden="true">ENI</div>
        <div>
          <p class="eyebrow">MILANO / EURONEXT</p>
          <h1 id="instrument-title">Storico ENI</h1>
          <p class="instrument-subtitle">Simulazione deterministica su genoma fisso</p>
        </div>
      </div>
      <div class="coverage" aria-live="polite">
        <div><span>INTERVALLO</span><strong id="coverage-range">2016.09.29 — 2026.09.28</strong></div>
        <div><span>BARRE</span><strong id="bar-count">—</strong></div>
        <div><span>ULTIMA QUOTAZIONE</span><strong id="last-date">—</strong></div>
      </div>
    </section>

    <section class="control-strip" aria-label="Controlli simulazione">
      <div class="transport">
        <button class="button button--primary" id="play-button" type="button" disabled>Avvia replay</button>
        <button class="button button--quiet" id="step-button" type="button" disabled>Avanza barra</button>
        <button class="button button--quiet" id="reset-button" type="button" disabled>Reset</button>
        <label class="speed-control" for="speed-select"><span>PASSO</span>
          <select id="speed-select" aria-label="Intervallo replay">
            <option value="500">0,5 s</option>
            <option value="180" selected>0,18 s</option>
            <option value="60">0,06 s</option>
          </select>
        </label>
      </div>
      <div class="overlay-controls">
        <label class="toggle-control"><input id="iir-toggle" type="checkbox" checked><span class="toggle-control__switch"></span><span>IIR</span></label>
        <label class="toggle-control"><input id="state-toggle" type="checkbox"><span class="toggle-control__switch"></span><span>Stati</span></label>
      </div>
    </section>

    <div id="error-banner" class="error-banner" role="alert" hidden></div>

    <section class="analysis-grid">
      <div class="chart-panel" aria-label="Grafico storico ENI">
        <div class="chart-panel__head">
          <div class="chart-legend" aria-label="Legenda grafico">
            <span class="legend-price"><i></i> ENI / OHLC</span>
            <span class="legend-volume"><i></i> VOLUME</span>
            <span class="legend-iir legend-iir--one"><i></i> IIR 1</span>
            <span class="legend-iir legend-iir--two"><i></i> IIR 2</span>
          </div>
          <div class="chart-readout" id="chart-readout" aria-live="polite">Barra selezionata <b>—</b></div>
        </div>
        <div id="price-chart" class="price-chart" aria-label="Candele OHLC, volume e IIR"></div>
        <div class="chart-foot">
          <span id="chart-progress">REPLAY NON AVVIATO</span>
          <span>Fonte: Borsa Italiana <i></i> Daily OHLCV</span>
        </div>
      </div>

      <aside class="inspector" aria-label="Ispettore simulazione">
        <section class="inspector-section inspector-section--state">
          <div class="section-label"><span>STATO ATTIVO</span><span id="frame-index">— / —</span></div>
          <div class="state-display"><span id="state-chip" class="state-chip">—</span><span id="trader-state">In attesa</span></div>
          <div class="state-detail"><span>Barra</span><strong id="active-date">—</strong></div>
          <div class="state-detail"><span>Posizione</span><strong id="holding-state">—</strong></div>
        </section>
        <section class="inspector-section">
          <div class="section-label"><span>FILTRI IIR</span><span>EMESSI DAL MOTORE</span></div>
          <div class="metric-row"><span><i class="metric-dot metric-dot--blue"></i>Prezzo / IIR 1</span><strong id="iir-price-1">—</strong></div>
          <div class="metric-row"><span><i class="metric-dot metric-dot--violet"></i>Prezzo / IIR 2</span><strong id="iir-price-2">—</strong></div>
          <div class="metric-row"><span><i class="metric-dot metric-dot--volume"></i>Volume / IIR 1</span><strong id="iir-volume-1">—</strong></div>
          <div class="metric-row"><span><i class="metric-dot metric-dot--volume-alt"></i>Volume / IIR 2</span><strong id="iir-volume-2">—</strong></div>
        </section>
        <section class="inspector-section inspector-section--value">
          <div class="section-label"><span>PORTAFOGLIO VIRTUALE</span><span>EUR</span></div>
          <div class="portfolio-total" id="total-value">—</div>
          <div class="metric-row"><span>Liquidità</span><strong id="cash-value">—</strong></div>
          <div class="metric-row"><span>Posizione aperta</span><strong id="position-value">—</strong></div>
        </section>
      </aside>
    </section>

    <section class="ledger-panel" aria-labelledby="ledger-title">
      <div class="ledger-head">
        <div><p class="eyebrow">BROKER / EVENT LOG</p><h2 id="ledger-title">Operazioni</h2></div>
        <span class="ledger-count" id="trade-count">0 EVENTI</span>
      </div>
      <div class="ledger-table-wrap">
        <table>
          <thead><tr><th>DATA</th><th>AZIONE</th><th>STATO</th><th>PREZZO</th><th>QUANTITÀ</th><th>MOTIVO</th></tr></thead>
          <tbody id="trade-rows"><tr class="empty-row"><td colspan="6">Avvia il replay per esporre gli eventi del trader.</td></tr></tbody>
        </table>
      </div>
    </section>

    <footer class="page-foot">
      <span>SIMULAZIONE STORICA · NON È TRADING REALE</span>
      <span id="snapshot-meta">Snapshot non caricato</span>
      <span>SWARMTRADER / 001</span>
    </footer>
  </main>
`;

const ui = {
  runState: document.querySelector('#run-state'),
  runLabel: document.querySelector('#run-state b'),
  play: document.querySelector('#play-button'),
  step: document.querySelector('#step-button'),
  reset: document.querySelector('#reset-button'),
  speed: document.querySelector('#speed-select'),
  iirToggle: document.querySelector('#iir-toggle'),
  stateToggle: document.querySelector('#state-toggle'),
  error: document.querySelector('#error-banner'),
  barCount: document.querySelector('#bar-count'),
  lastDate: document.querySelector('#last-date'),
  range: document.querySelector('#coverage-range'),
  chart: document.querySelector('#price-chart'),
  chartReadout: document.querySelector('#chart-readout'),
  chartProgress: document.querySelector('#chart-progress'),
  frameIndex: document.querySelector('#frame-index'),
  stateChip: document.querySelector('#state-chip'),
  traderState: document.querySelector('#trader-state'),
  activeDate: document.querySelector('#active-date'),
  holding: document.querySelector('#holding-state'),
  iir: [1, 2].map((n) => document.querySelector(`#iir-price-${n}`)),
  iirVolume: [1, 2].map((n) => document.querySelector(`#iir-volume-${n}`)),
  total: document.querySelector('#total-value'),
  cash: document.querySelector('#cash-value'),
  position: document.querySelector('#position-value'),
  tradeCount: document.querySelector('#trade-count'),
  tradeRows: document.querySelector('#trade-rows'),
  snapshotMeta: document.querySelector('#snapshot-meta'),
};

function setRunState(state, label) {
  ui.runState.dataset.state = state;
  ui.runLabel.textContent = label;
}

function showError(message) {
  stopPlayback();
  ui.error.classList.remove('error-banner--warning');
  ui.error.setAttribute('role', 'alert');
  ui.error.textContent = message;
  ui.error.hidden = false;
  setRunState('error', 'Errore');
}

function showWarning(message) {
  ui.error.classList.add('error-banner--warning');
  ui.error.setAttribute('role', 'status');
  ui.error.textContent = message;
  ui.error.hidden = false;
}

function clearError() {
  ui.error.hidden = true;
  ui.error.textContent = '';
  ui.error.classList.remove('error-banner--warning');
  ui.error.setAttribute('role', 'alert');
}

function formatPrice(value) {
  return money.format(value);
}

function formatVolume(value) {
  return integer.format(value);
}

function formatDate(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${date}T00:00:00.000Z`));
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function loadSnapshot() {
  const response = await fetch('/data/eni-ohlcv.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Snapshot ENI non disponibile (HTTP ${response.status}). Esegui npm run data:update.`);
  const loaded = await response.json();
  if (!Array.isArray(loaded.bars) || loaded.bars.length === 0) throw new Error('Lo snapshot ENI non contiene barre OHLCV.');
  if (loaded.cutoffDate !== '2026-09-28') throw new Error('Cutoff snapshot non valido: è richiesto il 28/09/2026.');
  const actualHash = await sha256(JSON.stringify(loaded.bars));
  if (actualHash !== loaded.dataSha256) throw new Error('Hash snapshot non valido: i dati potrebbero essere incompleti o modificati.');
  return loaded;
}

function initializeChart() {
  const initialWidth = Math.max(ui.chart.clientWidth, 320);
  const initialHeight = Math.max(ui.chart.clientHeight, 280);
  chart = createChart(ui.chart, {
    autoSize: false,
    width: initialWidth,
    height: initialHeight,
    layout: {
      background: { color: '#fbfcfa' },
      textColor: '#687570',
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 11,
      attributionLogo: true,
    },
    grid: {
      vertLines: { color: '#e9eeeb' },
      horzLines: { color: '#e9eeeb' },
    },
    rightPriceScale: { borderColor: '#dce4df', scaleMargins: { top: 0.08, bottom: 0.2 } },
    timeScale: { borderColor: '#dce4df', timeVisible: false, rightOffset: 4 },
    crosshair: { mode: 0 },
    localization: { locale: 'it-IT' },
  });

  candleSeries = chart.addSeries(CandlestickSeries, {
    upColor: '#16836c',
    downColor: '#df654b',
    borderUpColor: '#16836c',
    borderDownColor: '#df654b',
    wickUpColor: '#16836c',
    wickDownColor: '#df654b',
    priceLineVisible: false,
  });
  iirPrice1Series = chart.addSeries(LineSeries, { color: '#2e80b8', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
  iirPrice2Series = chart.addSeries(LineSeries, { color: '#9070cf', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
  volumeSeries = chart.addSeries(HistogramSeries, {
    color: '#b9d8ce',
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
    lastValueVisible: false,
    priceLineVisible: false,
  });
  chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 }, borderVisible: false });
  markers = createSeriesMarkers(candleSeries, []);

  candleSeries.setData(snapshot.bars.map((bar) => ({
    time: bar.time,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  })));
  volumeSeries.setData(snapshot.bars.map((bar) => ({
    time: bar.time,
    value: bar.volume,
    color: bar.close >= bar.open ? '#c3ded4' : '#f1c5b8',
  })));
  iirPrice1Series.setData([]);
  iirPrice2Series.setData([]);
  chart.timeScale().fitContent();

  const observer = new ResizeObserver((entries) => {
    const { width, height } = entries[0].contentRect;
    if (width > 0 && height > 0) chart.applyOptions({ width, height });
  });
  observer.observe(ui.chart);

  chart.subscribeCrosshairMove((param) => {
    if (!param.time) return;
    const bar = param.seriesData.get(candleSeries);
    if (!bar) return;
    const time = typeof param.time === 'string' ? param.time : `${param.time.year}-${String(param.time.month).padStart(2, '0')}-${String(param.time.day).padStart(2, '0')}`;
    ui.chartReadout.innerHTML = `${formatDate(time)} <b>${formatPrice(bar.close)}</b>`;
  });
}

function markersForTrace(trace, includeStates) {
  return trace.flatMap((point, pointIndex) => {
    const events = point.operations.map((operation) => ({
      time: operation.time,
      position: operation.side === 'buy' ? 'belowBar' : 'aboveBar',
      color: operation.side === 'buy' ? '#16836c' : '#df654b',
      shape: operation.side === 'buy' ? 'arrowUp' : 'arrowDown',
      text: operation.side === 'buy' ? 'BUY' : operation.reason === 'signal' ? 'SELL' : operation.reason === 'take profit' ? 'TP' : 'SL',
      size: 1,
    }));
    if (includeStates && pointIndex > 0 && point.state !== trace[pointIndex - 1].state) {
      events.push({
        time: point.time,
        position: 'inBar',
        color: STATE_COLORS[point.state] ?? '#65736f',
        shape: 'circle',
        text: point.state,
        size: 1,
      });
    }
    return events;
  });
}

function syncTraceToChart() {
  const trace = controller.trace;
  if (showStates !== renderedStateMode) {
    markerCache = markersForTrace(trace, showStates);
    markers.setMarkers(markerCache);
    renderedStateMode = showStates;
  } else {
    let addedMarkers = false;
    for (let index = renderedTraceCount; index < trace.length; index++) {
      const frame = trace[index];
      iirPrice1Series.update({ time: frame.time, value: frame.iirPrice1 });
      iirPrice2Series.update({ time: frame.time, value: frame.iirPrice2 });
      const additions = markersForTrace(trace.slice(index, index + 1), false);
      if (showStates && index > 0 && frame.state !== trace[index - 1].state) {
        additions.push({
          time: frame.time,
          position: 'inBar',
          color: STATE_COLORS[frame.state] ?? '#65736f',
          shape: 'circle',
          text: frame.state,
          size: 1,
        });
      }
      if (additions.length) {
        markerCache.push(...additions);
        addedMarkers = true;
      }
    }
    if (addedMarkers) markers.setMarkers(markerCache);
    renderedStateMode = showStates;
  }
  renderedTraceCount = trace.length;
}

function updateSnapshotInfo() {
  ui.barCount.textContent = integer.format(snapshot.barCount);
  ui.lastDate.textContent = formatDate(snapshot.lastBarDate);
  ui.range.textContent = `${formatDate(snapshot.firstBarDate)} — ${formatDate(snapshot.cutoffDate)}`;
  ui.snapshotMeta.textContent = `SHA-256 ${snapshot.dataSha256.slice(0, 12)} · aggiornato ${formatDate(snapshot.retrievedAt.slice(0, 10))}`;
}

function renderLedger() {
  const events = controller.trace.flatMap((frame) => frame.operations.map((operation) => ({ ...operation, state: frame.state })));
  ui.tradeCount.textContent = `${integer.format(events.length)} ${events.length === 1 ? 'EVENTO' : 'EVENTI'}`;
  if (events.length === 0) {
    ui.tradeRows.innerHTML = '<tr class="empty-row"><td colspan="6">Nessuna operazione generata fino alla barra corrente.</td></tr>';
    return;
  }

  ui.tradeRows.innerHTML = [...events].reverse().map((event) => `
    <tr>
      <td class="mono">${formatDate(event.time)}</td>
      <td><span class="trade-side trade-side--${event.side}">${event.side === 'buy' ? 'BUY' : 'SELL'}</span></td>
      <td><span class="table-state" style="--state-color:${STATE_COLORS[event.state] ?? '#65736f'}">${event.state}</span></td>
      <td class="mono">${formatPrice(event.price)}</td>
      <td class="mono">${formatVolume(event.quantity)}</td>
      <td>${event.reason === 'signal' ? 'Segnale genoma' : event.reason}</td>
    </tr>
  `).join('');
}

function renderFrame() {
  if (!controller || !controller.currentFrame) return;
  const frame = controller.currentFrame;
  const index = controller.trace.length;
  const dataBar = snapshot.bars[index - 1];
  syncTraceToChart();
  iirPrice1Series.applyOptions({ visible: showIir });
  iirPrice2Series.applyOptions({ visible: showIir });

  ui.frameIndex.textContent = `${integer.format(index)} / ${integer.format(snapshot.bars.length)}`;
  ui.stateChip.textContent = frame.state;
  ui.stateChip.style.setProperty('--state-color', STATE_COLORS[frame.state] ?? '#65736f');
  ui.traderState.textContent = controller.complete ? 'Replay completo' : 'Replay in corso';
  ui.activeDate.textContent = formatDate(frame.time);
  ui.holding.textContent = frame.positionOpen ? 'Aperta' : 'Nessuna';
  ui.iir[0].textContent = formatPrice(frame.iirPrice1);
  ui.iir[1].textContent = formatPrice(frame.iirPrice2);
  ui.iirVolume[0].textContent = formatVolume(frame.iirVolume1);
  ui.iirVolume[1].textContent = formatVolume(frame.iirVolume2);
  ui.total.textContent = formatPrice(frame.totalValue);
  ui.cash.textContent = formatPrice(frame.capital);
  ui.position.textContent = formatPrice(frame.portfolioValue);
  ui.chartProgress.textContent = `${controller.complete ? 'REPLAY COMPLETO' : 'REPLAY'} · ${formatDate(frame.time)} · ${integer.format(index)} BARRE ELABORATE`;
  ui.chartReadout.innerHTML = `${formatDate(dataBar.time)} <b>${formatPrice(dataBar.close)}</b>`;
  ui.play.textContent = controller.complete ? 'Replay completo' : isPlaying ? 'Pausa' : index > 1 ? 'Riprendi replay' : 'Avvia replay';
  ui.step.disabled = controller.complete || isPlaying;
  ui.play.disabled = controller.complete;
  renderLedger();
  if (!isPlaying) setRunState(controller.complete ? 'complete' : 'ready', controller.complete ? 'Completato' : 'Simulazione pronta');
}

async function startController() {
  clearError();
  controller = new SimulationController(snapshot);
  await controller.start();
  renderedTraceCount = 0;
  markerCache = [];
  renderedStateMode = showStates;
  iirPrice1Series.setData([]);
  iirPrice2Series.setData([]);
  markers.setMarkers([]);
  renderFrame();
}

async function advanceOne() {
  if (!controller) {
    try {
      await startController();
    } catch (error) {
      showError(error.message);
      return;
    }
  }

  try {
    await controller.step();
    renderFrame();
    if (controller.complete) {
      stopPlayback();
      setRunState('complete', 'Completato');
      if (controller.validation?.warnings.length) {
        showWarning(controller.validation.warnings.join(' '));
      }
    }
  } catch (error) {
    showError(error.message);
  }
}

function stopPlayback() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
  isPlaying = false;
}

function schedulePlayback() {
  timer = setTimeout(async () => {
    await advanceOne();
    if (isPlaying && controller && !controller.complete) schedulePlayback();
  }, Number(ui.speed.value));
}

function togglePlayback() {
  if (isPlaying) {
    stopPlayback();
    renderFrame();
    setRunState('ready', 'In pausa');
    return;
  }

  clearError();
  isPlaying = true;
  ui.step.disabled = true;
  setRunState('running', 'Replay in corso');
  schedulePlayback();
}

ui.play.addEventListener('click', async () => {
  if (isPlaying) {
    togglePlayback();
    return;
  }
  if (!controller) {
    try {
      await startController();
    } catch (error) {
      showError(error.message);
      return;
    }
  }
  if (!controller.complete) togglePlayback();
});

ui.step.addEventListener('click', advanceOne);
ui.reset.addEventListener('click', async () => {
  stopPlayback();
  try {
    await startController();
    ui.play.textContent = 'Avvia replay';
    setRunState('ready', 'Simulazione pronta');
  } catch (error) {
    showError(error.message);
  }
});
ui.iirToggle.addEventListener('change', () => {
  showIir = ui.iirToggle.checked;
  iirPrice1Series?.applyOptions({ visible: showIir });
  iirPrice2Series?.applyOptions({ visible: showIir });
});
ui.stateToggle.addEventListener('change', () => {
  showStates = ui.stateToggle.checked;
  if (controller) renderFrame();
});

try {
  snapshot = await loadSnapshot();
  initializeChart();
  updateSnapshotInfo();
  ui.play.disabled = false;
  ui.step.disabled = false;
  ui.reset.disabled = false;
  setRunState('ready', 'Dati pronti');
} catch (error) {
  showError(error.message);
}