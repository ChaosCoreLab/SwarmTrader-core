# SwarmTrader-core — anteprima ArchiMate prima di una PR

Questa è una **regola dell'istanza SwarmTrader-core**, valida per entrambe le postazioni. Non è una modifica al protocollo generale di `software-house-ai`: altri progetti potrebbero non usare ArchiMate. Si applica a **ogni PR verso `ChaosCoreLab/SwarmTrader-core`**, anche quando la PR modifica soltanto ricerca, documentazione o processo.

## Prima di aprire la PR

1. Su un branch con le modifiche già committate, aggiornare il riferimento a `origin/main` (`git fetch origin main`) e lavorare con una working tree pulita.
2. Eseguire `node scripts/archimate-pr-preview.mjs --base origin/main`. Il comando deve passare: verifica modello e output derivati senza modificarli, confronta gli elementi e le relazioni con la base Git e crea `index.html` e `manifest.json` sotto `.cache/archimate-pr-preview/<head>-<base>/`.
3. Aprire localmente `index.html` e verificare che il diagramma rappresenti la modifica proposta. Se il modello è invariato, motivare **nessun impatto ArchiMate**: non aggiungere elementi di processo, classi interne o funzionalità non implementate soltanto per cambiare il diagramma.
4. Fare push del branch, attendere che **ArchiMate branch preview** finisca verde e sia disponibile l'artefatto per lo SHA del commit. Solo allora aprire la PR, indicando il link al run/artefatto e la motivazione dell'impatto o del non impatto. Dopo ogni nuova push la preview deve essere rigenerata sul nuovo SHA.

Se la PR introduce o modifica una capacità del prodotto significativa per gli stakeholder, aggiornare i file sorgente `archimate/<use-case>/*layer.md` e gli output derivati **nella stessa PR**. Il diagramma esprime il prodotto, non l'organizzazione che lo sviluppa (`software-house-ai/protocols/archimate-modeling.md`, regole 1–3). Le PR di sola ricerca non anticipano un'implementazione futura nel modello.

## Revisione e limiti

- Il workflow sulle PR ricontrolla modello e SHA e produce una nuova preview per il commit corrente. Un artefatto di un commit precedente non vale per il nuovo SHA; output generati obsoleti fanno fallire il controllo. Lo status può bloccare il *merge* quando è richiesto dalle regole del branch. GitHub non può impedire la *creazione* della PR, perciò il passaggio prima dell'apertura resta una responsabilità dell'autore.
- Differenze strutturali e rendering **non** dimostrano la correttezza semantica. Quando cambia il modello, seguire la revisione del contenuto dello Step 9 e il walkthrough Owner NRC-H02 prima di dichiarare il lavoro ACCEPTED. Chi revisiona valuta anche l'eventuale dichiarazione di non impatto.
- La preview è un artefatto scaricabile della run (HTML interattivo e asset locali), non un nuovo deploy Pages. La pubblicazione resta nel workflow di `main`.
