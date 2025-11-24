# Guida alla Pubblicazione (Deployment)

Per pubblicare la tua applicazione e renderla accessibile ai tuoi amici, useremo **Vercel**, la piattaforma migliore per Next.js. È gratuita per progetti personali.

## Passo 1: Preparare il Codice su GitHub

Poiché il tuo progetto non è ancora su GitHub, dobbiamo caricarlo.

1.  Vai su [GitHub](https://github.com) e crea un **New Repository** (chiamalo ad esempio `divisor-pecuniae`).
2.  Non inizializzarlo con README, .gitignore o licenza (li hai già).
3.  Copia l'URL del repository (es. `https://github.com/tuo-username/divisor-pecuniae.git`).

Ora, nel tuo terminale (nella cartella del progetto), esegui questi comandi per salvare le modifiche e caricarle:

```bash
# 1. Aggiungi tutti i file
git add .

# 2. Salva le modifiche
git commit -m "Initial release ready for deployment"

# 3. Collega il tuo repository (SOSTITUISCI L'URL CON IL TUO)
git remote add origin https://github.com/TUO-USERNAME/divisor-pecuniae.git

# 4. Carica il codice
git branch -M main
git push -u origin main
```

## Passo 2: Pubblicare su Vercel

1.  Vai su [Vercel](https://vercel.com) e registrati/accedi (puoi usare il tuo account GitHub).
2.  Clicca su **"Add New..."** -> **"Project"**.
3.  Seleziona il repository `divisor-pecuniae` che hai appena creato e clicca **Import**.

## Passo 3: Configurare le Variabili d'Ambiente

Nella schermata di configurazione del progetto su Vercel:

1.  Trova la sezione **Environment Variables**.
2.  Aggiungi le stesse variabili che hai nel file `.env.local`:
    *   **Name**: `NEXT_PUBLIC_SUPABASE_URL`
        *   **Value**: `https://ilcvguwhnbbzvdqbxdyw.supabase.co`
    *   **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   **Value**: *(Incolla la tua chiave anonima lunga che inizia con `eyJ...`)*

3.  Clicca **Deploy**.

## Passo 4: Finito!

Vercel costruirà il tuo sito e in circa un minuto ti darà un link (es. `divisor-pecuniae.vercel.app`).
Invia questo link ai tuoi amici e potranno unirsi ai tuoi gruppi usando i codici invito!
