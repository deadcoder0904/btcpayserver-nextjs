import crypto from 'crypto'
import { error } from 'next/dist/build/output/log'
import { NextRequest, NextResponse } from 'next/server'

import { BTCPAY_WEBHOOK_SECRET } from '@/app/lib/env/server'

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
    console.log({ event })
    // Handle the event
    switch (event.type) {
      case 'InvoicePaymentSettled':
        // add ebook price to database
        const email = ''
        try {
          // create user here
          console.info({ email }, `[BTCPayServer] 💰 Successfully charged`)
        } catch (error) {
          console.error(
            error,
            `[BTCPayServer] Error handling webhook event 'InvoicePaymentSettled'!`
          )
        }
        break
      case 'InvoicePaymentFailed':
        // don't do anything but return an error to customer
        console.log({ event })
        break
      default:
        // Unexpected event type
        console.warn(event.type, `🤷‍♀️ Unhandled event type`)
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
