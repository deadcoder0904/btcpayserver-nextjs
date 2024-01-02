import crypto from 'crypto'
import { error } from 'next/dist/build/output/log'
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
  } catch (err) {
    error(err as string)
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    })
  }

  try {
    const event = JSON.parse(body)
    const BTCPAY_INVOICE_ID = event.invoiceId

    const response = await fetch(
      `${BTCPAY_URL}/stores/${BTCPAY_STORE_ID}/invoices/${BTCPAY_INVOICE_ID}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${BTCPAY_API_KEY}`,
        },
      }
    )

    const { metadata } = await response.json()

    switch (event.type) {
      case 'InvoicePaymentSettled':
        console.log({ metadata })

        const { buyerEmail } = metadata
        const cryptoCurrency = event.paymentMethod
        const cryptoPayment = event.payment.value
        const cryptoFees = event.payment.fee

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
    return new Response('Webhook handler failed. View logs.', {
      status: 400,
    })
  }

  console.info(`[BTCPayServer] Successfully ran Webhook!`)

  return NextResponse.json({ success: true })
}
