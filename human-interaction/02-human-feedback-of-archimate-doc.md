# Introduzione
Questo documento descrive gli aspetti che non sono conformi alle aspettative.
La software-house-ai deve capire le osservazioni, mediante anche dialogo (usando anche un approccio critico rispetto alle osservazioni dell'umano), e immedesimarsi nella visione e nei criteri dell'operatore; proporre una strategia di risoluzione basata sulla comprensione del punto di vista dell'operatore umano, applicandola a tutto il prodotto, e far tesoro di quanto è stato segnalato per individuare dove sono i punti di incomprensione e poi proporre un ciclo evolutivo per migliorarsi sulla base di questa esperienza; la proposta deve essere validata umanamente.

## Documentazione Archimate
Di seguito le osservazioni emerse nella validazione della pagina https://chaoscorelab.github.io/SwarmTrader-core/docs/architecture/use-case-eni-replay/

### Contenuti
Considerare i successivi capitoli come riferimenti alle singole celle Archimate, definite dalle coordinate <aspect, layer>.

#### <Motivation, Motivation Layer>
- "Immutable approved snapshot": mi sembra fuori luogo, è qualcosa da tenere in "Motivation"? Non è per niente rilevante.
- Non dovrebbe esserci una casella "Trader genoma snapshot"?

#### <Passive Structure, Business Layer>
- "Acceptance criteria": i criteri di accettazione con contenuto tecnico non andrebbero in questa cella.
- "Acquire approved snapshot": la freccia non dovrebbe essere verso "Historical OHLCV snapshot"?

#### <Active Structure, Business Layer>
- è sbagliato che siano citati i ruoli della software-house-ai "Product owner" e "Librarian", non c'entrano con il caso d'uso.

#### <Passive Structure, Application Layer>
- "StockData" dovrebbe avere la freccia verso "Historical OHLCV Snapshot"
- "trace frames" deve avere la freccia verso "replay findings"
- "broker operations" deve avere la freccia verso "replay findings"
- "validation result" deve avere la freccia verso "replay findings"

#### <Behaviour, Application Layer>
- "Adapt genome" non sembra per niente adatto qui.
- "Feed bars" dovrebbe avere un'ulteriore freccia verso "StockData" e/o "Historical OHLCV snapshot" (forse)
- "Validate snapshot" è necessario qui?

#### <ActiveStructure, Application Layer>
- "DataTrainer" non dovrebbe avere frecce verso gli elementi Passive Structure che riguardano i dati OHLCV?
- "FixedGenomaGa" non serve, non aggiunge niente alla documentazione, dato che il genoma è già esplicitato che è mock.

### Visualizzazione
Vorrei che la matrice Archimate occupasse di più la larghezza della pagina. Forse è meglio ridimensionare il pannello di navigazione a sinistra.

### Modalità di interazione
La documentazione Archimate dovrebbe essere facilmente editabile dall'umano. Chiedo di pensare ad un approccio che permetta all'umano di integrare e correggere velocemente i contenuti della documentazione.
