# Obiettivo
Implementare e visualizzare una simulazione di un trader virtuale che, a seguito di dati azionari noti, evidenzi quali sono le operazioni di buy / sell nei momenti giusti.
Per l'occasione si vuole impostare una base documentale dell'intero ecosistema.

# Requisiti
## format della simulazione
La simulazione deve essere fatta su HTML con javascript lato browser, senza backend. Ai fini di ispezionare la bontà dell'algoritmo di trading occorre che la pagina sia interattiva.

## ispirazione
Si vuole replicare il comportamento di un trader virtuale del software https://gitlab.com/pegoraro.simone.1981/consilium usando un genoma fisso e dei dati azionari fissi.

## Dati mock
### Genoma
Il genoma del trader da utilizzare nella simulazione è il seguente:
```json
{"iir_price_1":0.7306070743683732,"iir_price_2":0.9901788903839899,"iir_volume_1":0.11764634825165177,"iir_volume_2":0.3960880808397206,"buy_percent":99.61710547935216,"margin_percent_1":0.1,"margin_percent_2":-1.1038551518437734,"margin_volume_percent_1":2.40388026364704,"margin_volume_percent_2":11.620405602990479,"stop_loss_percent":50,"take_profit_percent":5.8,"states":{"NW":{"_SW":[8,4,6,10],"_N":[2,8,7,5,12,3],"_W":[1],"_NE":[8]},"N":{"_S":[8,7,3,1],"_NE":[10,12,4],"_0":[6,11,1,8,12],"_NW":[5,5]},"NE":{"_SE":[8,6,10,8,4,8],"_NW":[2,7,9,11],"_E":[9,11,8],"_N":[6,9,6,1,5,5]},"W":{"_NW":[3,3,11,4],"_0":[9,11,2,8,10,5,8,5],"_SW":[3],"_E":[11,0,12,5,4,0]},"C":{"_N":[1,1],"_E":[0],"_S":[0,1,1,8,0,10],"_W":[11]},"E":{"_NE":[1,8,9,4],"_W":[9,6,12],"_SE":[10],"_0":[4,8,9,3]},"SW":{"_W":[6],"_S":[9,2,0,12],"_SW":[3,9,9,3,2,4],"_SE":[10,4,4,5,12,5,6,7],"action":"buy"},"S":{"_0":[4,4],"_SE":[8,12,0,12,3],"_N":[5,0,8,3,1],"_SW":[3,10,11]},"SE":{"_E":[5,5,4,1],"_SW":[5,8,0,6,1,2],"_NE":[11,1,2],"_S":[5,5]}}}
```

### Dati azionari
prendere i dati reali di ENI - quotata a Piazza Affari nella Borsa Italiana - dal 29/09/2016 al 29/09/2026. I dati devono per forza essere OHLCV, utilizza gli stessi endpoint utilizzati dal progetto Consilium per ricavare i dati di ENI degli ultimi 10 anni da borsaitaliana.it

## Struttura del software
Si devono riusare le classi del progetto Consilium (Trader, Life, GA, Portfolio, ecc...), oltre ad aggiungere altre 2 classi: DataTrainer (che passa allo StockStreamer un sottoinsieme dei dati azionari ENI) e FitnessValidator (che è la classe che dovrà validare le operazioni di buy/sell dell'istanza Trader).

## UI 
Mostrare i dati azionari e sovrappore correttamente le operazioni del trader.
Sovrappore inoltre i grafici IIR.
Dare la possibilità di abilitare una sovrapposizione grafica mostrante gli stati attivi dell'istanza Individual / Trader. 