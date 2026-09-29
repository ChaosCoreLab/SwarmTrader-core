/** @see ../docs/operations/development.md#golden-reference-trace */
// Produces the AC-04 golden trace by running the *unmodified* upstream Consilium
// browser modules at the pinned commit: genome converted by upstream
// Individual.fromJSON (the GA worker path) and data consumed by Life.cycle().
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CONSILIUM_REPO = 'https://gitlab.com/pegoraro.simone.1981/consilium.git';
const CONSILIUM_COMMIT = '30ae93fca6a9a2eab59123a87f0ffdfbe993db45';
const INITIAL_CAPITAL = 10_000;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REF_DIR = path.resolve(process.env.CONSILIUM_REF_DIR ?? path.join(ROOT, '.cache', 'consilium-ref'));
const SNAPSHOT = path.join(ROOT, 'public', 'data', 'eni-ohlcv.json');
const REQUIREMENTS = path.join(ROOT, 'human-interaction', '01-first-poc.md');
const OUTPUT = path.join(ROOT, 'tests', 'golden', 'eni-fixed-genome.golden.json');

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function ensureReference() {
  if (!existsSync(REF_DIR)) {
    console.log(`Cloning Consilium into ${REF_DIR}...`);
    git('clone', '--filter=blob:none', '--no-checkout', CONSILIUM_REPO, REF_DIR);
  }
  const head = git('-C', REF_DIR, 'rev-parse', 'HEAD');
  if (head !== CONSILIUM_COMMIT) git('-C', REF_DIR, 'checkout', '--detach', CONSILIUM_COMMIT);
  if (git('-C', REF_DIR, 'rev-parse', 'HEAD') !== CONSILIUM_COMMIT) {
    throw new Error(`Consilium reference is not at ${CONSILIUM_COMMIT}.`);
  }
  if (git('-C', REF_DIR, 'status', '--porcelain', '--', 'public/src')) {
    throw new Error('Consilium reference has local changes in public/src; the golden must use pristine upstream code.');
  }
}

// The genome is read from the PO requirement itself, not from src/engine/genome.js,
// so the golden also checks that FIXED_GENOME was transcribed correctly.
async function readRequirementGenome() {
  const markdown = await readFile(REQUIREMENTS, 'utf8');
  const match = markdown.match(/```json\s*([\s\S]*?)```/);
  if (!match) throw new Error('No JSON genome block found in the PoC requirements.');
  return JSON.parse(match[1]);
}

const upstream = (file) => import(pathToFileURL(path.join(REF_DIR, 'public', 'src', file)).href);

async function main() {
  ensureReference();
  const [{ Individual }, { Life }, { GA }, { IStockStreamProvider, StockData, StockStream }] = await Promise.all([
    upstream('individual.js'),
    upstream('life.js'),
    upstream('ga.js'),
    upstream('stockStream.js'),
  ]);

  const snapshot = JSON.parse(await readFile(SNAPSHOT, 'utf8'));
  const dataSha256 = createHash('sha256').update(JSON.stringify(snapshot.bars)).digest('hex');
  if (dataSha256 !== snapshot.dataSha256) throw new Error('Snapshot hash mismatch.');

  const genome = await readRequirementGenome();
  const individual = Individual.fromJSON(genome, INITIAL_CAPITAL);
  const frames = [];
  const capture = (stockData) => {
    const algo = individual.algo;
    frames.push([
      new Date(stockData.t).toISOString().slice(0, 10),
      algo.getCurrentName(),
      algo.ema,
      algo.ema2,
      algo.emaV,
      algo.emaV2,
    ]);
  };
  const init = individual.init.bind(individual);
  const feed = individual.feed.bind(individual);
  individual.init = (stockData, name) => { init(stockData, name); capture(stockData); };
  individual.feed = (stockData, name) => { feed(stockData, name); capture(stockData); };

  class SnapshotProvider extends IStockStreamProvider {
    async read(symbol, period) {
      const stream = new StockStream();
      stream.stockName = symbol;
      stream.timeFrame = period;
      stream.stream = snapshot.bars.map((bar) => new StockData(
        Date.parse(`${bar.time}T00:00:00.000Z`), bar.open, bar.low, bar.high, bar.close, bar.volume,
      ));
      return stream;
    }
  }

  let censused = null;
  class SingleGenomeGA extends GA {
    async createNewChild() { return individual; }
    async censusIndividual(child) { censused = child; }
    showResults() {}
  }

  const period = `${snapshot.firstBarDate}_${snapshot.cutoffDate}`;
  const life = new Life(new SingleGenomeGA(), new SnapshotProvider(), [{ name: 'ENI', ticker: snapshot.symbol }], [period]);
  life.onError = (error) => { throw error; };
  life.start();
  while (await life.cycle());
  if (censused !== individual) throw new Error('Upstream Life did not complete the individual lifecycle.');
  if (frames.length !== snapshot.bars.length) {
    throw new Error(`Upstream replay consumed ${frames.length} of ${snapshot.bars.length} bars.`);
  }

  const broker = individual.trader.broker;
  const operations = Object.keys(broker.operationsByTimestamp)
    .sort((a, b) => Number(a) - Number(b))
    .flatMap((ts) => broker.operationsByTimestamp[ts].map((operation) => ({
      time: new Date(Number(ts)).toISOString().slice(0, 10),
      action: operation.action,
      price: operation.price,
      quantity: operation.quantity,
    })));
  const closedPositions = broker.portfolio.closedPositions.map((position) => ({
    entryTime: new Date(position.entryTime).toISOString().slice(0, 10),
    closeTime: new Date(position.closeTime).toISOString().slice(0, 10),
    closePrice: position.closePrice,
    closeReason: position.closeReason,
    quantity: position.quantity,
  }));

  const golden = {
    schemaVersion: 1,
    engine: { repository: CONSILIUM_REPO, commit: CONSILIUM_COMMIT, genomeLoader: 'Individual.fromJSON', driver: 'Life.cycle' },
    snapshot: { symbol: snapshot.symbol, barCount: snapshot.barCount, dataSha256 },
    initialCapital: INITIAL_CAPITAL,
    genome,
    frameFields: ['time', 'state', 'iirPrice1', 'iirPrice2', 'iirVolume1', 'iirVolume2'],
    frames,
    operations,
    closedPositions,
    final: {
      capital: individual.trader.getCapital(),
      portfolioValue: individual.trader.getPortfolioValue(),
      totalValue: individual.trader.getTotalValue(),
      holding: individual.trader.isHolding(),
    },
  };

  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(golden)}\n`);
  console.log(`Golden written: ${frames.length} frames, ${operations.length} broker operations, ${closedPositions.length} closed positions.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
