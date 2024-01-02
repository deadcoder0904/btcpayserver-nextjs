import { isBrowser } from '@/app/lib/isBrowser'

if (isBrowser()) {
  throw new Error(
    'DO NOT USE @/app/lib/env/server.ts IN THE BROWSER AS YOU WILL EXPOSE FULL CONTROL OVER YOUR BTCPAYSERVER ACCOUNT!'
  )
}

export const BTCPAY_URL = process.env.BTCPAY_URL as string
export const BTCPAY_STORE_ID = process.env.BTCPAY_STORE_ID as string
export const BTCPAY_WEBHOOK_SECRET = process.env.BTCPAY_WEBHOOK_SECRET as string
export const BTCPAY_API_KEY = process.env.BTCPAY_API_KEY as string
