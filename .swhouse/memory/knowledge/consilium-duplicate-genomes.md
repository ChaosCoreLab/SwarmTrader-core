---
discovered: 2026-11-14
cycle: 012
topic: Consilium in its current version does not stop or recognise duplicate genomes
---

Facts read at cycle 012 on Consilium `experiment/lb77`, commit `2ec7237`, read-only (Step 3 open question, closed by the Critic as F-code-4 at Step 5, re-checked by the Scientist at Step 9, section 4):

| Fact | Where |
|---|---|
| `ga/ga_v2.js` saves every child with `Genoma.create`; no duplicate check in the GA | `ga_v2.js` 330-336 (`SaveIndividual`) |
| The Sequelize model of the genome table declares no `unique` on the `genoma` column | `db/orm.js` 49-52 (model up to 80) |
| The table is created from that model with `sequelize.sync({ force: false })`, which adds no constraint to an existing table (the variant at 578-588 is commented out) | `db/orm.js` 591 |
| `SaveGenoma` handles a `SequelizeUniqueConstraintError` on the JSON text of the genome, i.e. **exact text equality** only; it is used only by two scripts in `tests/manual/` | `db/orm.js` 454-504 (branch 474-499) |
| Real schemas read read-only (`mode=ro`): **no `UNIQUE`** on `genoma` in the default database (path at `db/orm.js` 20) nor in the seven files of `db/backups/`; **only** the old `db/database.sqlite` (16 KB, schema without the `version` and `partition` columns) has `genoma VARCHAR(255) NOT NULL UNIQUE` | Step 5 F-code-4; Step 9 section 4 |

Consequence: in current runs Consilium **stores exact copies too**, and the unique-constraint branch of `SaveGenoma` never fires. Even where it existed it compared JSON text, so two genomes with the same behaviour but different numbers (common scale of weights and thresholds, a zero weight with any `c`, swapped fast/slow distances) were never recognised. Recognising duplicates for the linear-score genome is therefore new work for E2/E3, specified (as options, not decided) in `docs/architecture/genome-encoding.md`, chapter 7 and section 5.3 ("Consilium non riconosce i duplicati"). How to serialise the numbers for an exact hash: [[float-serialisation-node-python]].

Not verified `[ipotesi]` (Step 5): with `DATABASE_URL` (PostgreSQL) `DataTypes.STRING` is `VARCHAR(255)` and a longer JSON genome would be rejected; SQLite does not enforce the length.

Source: `.swhouse/cycles/archive/cycle-012.md` (Step 3 facts on `ga_v2.js` and `orm.js`; Step 5 "Fatti verificati sul codice", F-code-4; Step 9 section 4). Related: [[consilium-trader-order-timing]] (other execution facts of the same code base).
