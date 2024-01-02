## btcpayserver-nextjs

## Usage

Install [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/).

Use [clovyr.app](https://clovyr.app/)'s free plan (7-day free trial) for [testing BTCPayServer](https://clovyr.app/apps/btcpayserver).

After testing, you can use Lunanode or [Voltage Cloud's hosted BTCPayServer](https://www.youtube.com/playlist?list=PLuMtKGSqizH2sxmKdy52gdbqSVKkyLX-t) Plan for $8/month or buy a VPS from Kyun Host ($16/month) to self-host it yourself using [btcpayserver-docker](https://github.com/btcpayserver/btcpayserver-docker).

Use [Sparrow Wallet](https://bitcoiner.guide/sparrow/) to test Bitcoin Payments using [testnet](https://www.youtube.com/watch?v=7JJkLW4SHKQ) with [bitcoin testnet faucet](https://coinfaucet.eu/en/btc-testnet/).

### .env.development

```bash
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# BTCPayServer Testnet Keys
# Go to `Account > Manage Account > API Keys under Account Settings > Generate API Key > Give Permissions btcpay.store.canviewinvoices & btcpay.store.cancreateinvoice`
BTCPAY_API_KEY=xxxx
# Root URL in Web Browser suffixed with `/api/v1`
BTCPAY_URL=<https-base-url-of-hosted-btcpayserver>/api/v1
# Create Store (or select already existing Store) & go to `Settings` to find `Store ID` under `Store Settings > General`
BTCPAY_STORE_ID=xxxx
# Under `Settings > Store Settings > Webhooks` => Payload URL = http://localhost:3000/api/btcpayserver/webhook (replace http://localhost:3000 with ngrok url as localhost (specifically, http) won't work with webhooks) & Events > Send Me Everything
BTCPAY_WEBHOOK_SECRET=xxxx

NEXT_PUBLIC_EBOOK_PRICE=57

NEXT_TELEMETRY_DISABLED=1
```

Run `pnpm dev` (or `pnpm turbo`) in one terminal and `pnpm ngrok:listen` in another terminal. `ngrok` is needed for webhooks as webhooks don't work on http, they need https.

> Make sure to set up [ngrok](https://ngrok.com) with [static domain](https://ngrok.com/blog-post/free-static-domains-ngrok-users).
