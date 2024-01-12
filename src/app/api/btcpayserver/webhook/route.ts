import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import {
  BTCPAY_API_KEY,
  BTCPAY_STORE_ID,
  BTCPAY_URL,
  BTCPAY_WEBHOOK_SECRET,
} from '@/app/lib/env/server'

export const POST = async (req: NextRequest, res: NextResponse) => {
  const body = await req.text()
  const sigHeaderName = 'BTCPAY-SIG'
  const btcpaysig = req.headers.get(sigHeaderName)

  console.info('[BTCPayServer] Processing webhook')

  try {
    const sigHashAlg = 'sha256'
    const sig = Buffer.from(btcpaysig || '', 'utf8')
    const hmac = crypto.createHmac(sigHashAlg, BTCPAY_WEBHOOK_SECRET as string)
    const digest = Buffer.from(
      sigHashAlg + '=' + hmac.update(body).digest('hex'),
      'utf8'
    )
    const checksum = Buffer.from(sig as unknown as string, 'utf8')

    if (
      checksum.length !== digest.length ||
      !crypto.timingSafeEqual(digest, checksum)
    ) {
      const error = `[BTCPayServer] Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`
      console.error(error)
      return NextResponse.json({ error }, { status: 400 })
    }

    console.info(`[BTCPayServer] Listening to Webhook Event!`)
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  try {
    const event = JSON.parse(body)

    const BTCPAY_INVOICE_ID = event.invoiceId

    const response = await fetch(
      `${BTCPAY_URL}/stores/${BTCPAY_STORE_ID}/invoices/${BTCPAY_INVOICE_ID}/payment-methods`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${BTCPAY_API_KEY}`,
        },
      }
    )

    const result = await response.json()

    console.warn(`[BTCPayServer] 🧨 ${event.type} 🧨`)

    switch (event.type) {
      case 'InvoiceSettled':
        const { buyerEmail } = event.metadata
        const cryptoCurrency = result[0].cryptoCode

        type Crypto = { totalPaid: number; networkFee: number }

        const cryptoPayment = result.reduce(
          (acc: number, crypto: Crypto) => acc + Number(crypto.totalPaid),
          0
        )
        const cryptoFees = result.reduce(
          (acc: number, crypto: Crypto) => acc + Number(crypto.networkFee),
          0
        )

        try {
          // create user here with info from `metadata`
          console.info(
            `[BTCPayServer] 💰 Successfully charged ${buyerEmail} with ${cryptoPayment} ${cryptoCurrency} & ${cryptoFees} fees`
          )
        } catch (error) {
          console.error(
            error,
            `[BTCPayServer] Error handling webhook event 'InvoicePaymentSettled'!`
          )
        }
        break
      default:
        // Unexpected event type
        console.warn(`[BTCPayServer] Unhandled event type ${event.type} 🤷‍♀️`)
        break
    }
  } catch (err) {
    console.error({ err }, `[BTCPayServer] Webhook Error`)
    return NextResponse.json(
      { error: 'Webhook handler failed. View logs.' },
      { status: 400 }
    )
  }

  console.info(`[BTCPayServer] Successfully ran Webhook!`)

  return NextResponse.json({ success: true })
}
