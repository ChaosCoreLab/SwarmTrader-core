# SwarmTrader-core — stato della board

Questa è una **regola dell'istanza SwarmTrader-core**, valida per entrambe le postazioni. La board [SwarmTrader](https://github.com/orgs/ChaosCoreLab/projects/1) è privata: per leggerla e aggiornarla serve l'autenticazione GitHub. Non è una modifica al protocollo generale di `software-house-ai`.

## Quando aggiornare la card

Per ogni lavoro tracciato su una issue di SwarmTrader-core, prima di cominciare verificare che la issue sia nella board. Se manca o la board non è accessibile, segnalarlo all'operatore: **non** dichiarare allineato uno stato non verificato. Una bozza della board senza numero non sostituisce una issue quando il lavoro richiede una issue.

| Evento | Stato nella board | Azione di coordinamento |
|--------|-------------------|-------------------------|
| Lavoro effettivo avviato | **In progress** | Registrare nella issue branch e obiettivo del lavoro, se utili a chi opera da un'altra postazione. |
| PR aperta e pronta per la revisione | **In review** | Collegare la PR alla issue; la preview ArchiMate segue `archimate-pr-preview.md`. Una draft PR non ancora pronta resta **In progress**. |
| Lavoro accettato, PR unita se prevista e verifiche richieste completate | **Done** | Chiudere la issue e riportare evidenze/esito. Una PR unita con verifiche umane ancora pendenti non è **Done**: mantenere **In review** e annotare cosa manca. |
| Lavoro annullato su decisione dell'operatore | **Cancelled** | Spiegare la decisione nella issue, senza perdere la traccia del lavoro. |

Se il lavoro è bloccato o DEFERRED, non simulare un completamento: lasciare **In progress** (oppure **In review** se la PR è in attesa di una verifica) e commentare il blocco, il responsabile e la condizione di ripresa. La board non dispone di una colonna “Blocked”. Un'epica resta **In progress** finché i suoi obiettivi e le sotto-issue non sono conclusi: lo stato di una singola sotto-issue non chiude l'epica.

**Responsabilità:** chi conduce il lavoro controlla e aggiorna la card quando avviene ciascuna transizione, e la ricontrolla prima di consegnare o riprendere il lavoro. Non serve modificarla a ogni commit o a ogni step del ciclo. L'esito del ciclo e le evidenze restano nel record del ciclo: lo stato della board li rende visibili, non li sostituisce.
