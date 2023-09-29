# FastifyTest - Gestione Dati JSON con Autenticazione JWT

Questo progetto si occupa di salvare diversi tipi di dati in un file JSON. Utilizza l'autenticazione JWT per garantire la sicurezza.

## Documentazione

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/7237517/2s9YJaXii7)

## Requisiti

-   Node.js
-   Yarn

## Installazione

1. Clona il repository:
2. Entra nella directory del progetto:
3. Installa le dipendenze:

    ```bash
    git clone git@github.com:arro000/FastifyTest.git
    cd FastifyTest
    yarn
    ```

## Configurazione

1. Copia il file `.env.example` in un nuovo file chiamato `.env`:

    ```bash
    cp .env.example .env
    ```

2. Modifica il file `.env` con le tue variabili d'ambiente.

## Utilizzo

### Avvio in Produzione

Per avviare l'applicazione:

    yarn start

### Avvio in Sviluppo

Per avviare l'applicazione con demone di refresh al cambio di un file

    yarn dev

Per avviare la suite di test

    yarn test
