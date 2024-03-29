import { createId } from '@paralleldrive/cuid2'
import { NextRequest, NextResponse } from 'next/server'
import { email, object, parse, string } from 'valibot'

import { BASE_URL, EBOOK_PRICE } from '@/app/lib/constants'
import {
  BTCPAY_API_KEY,
  BTCPAY_STORE_ID,
  BTCPAY_URL,
} from '@/app/lib/env/server'

export const POST = async (request: NextRequest, response: NextResponse) => {
  const req = await request.json()
  console.info('🏁 POST /api/btcpayserver/checkout/route')

  if (
    typeof BASE_URL === 'undefined' ||
    typeof EBOOK_PRICE === 'undefined' ||
    typeof BTCPAY_API_KEY === 'undefined' ||
    typeof BTCPAY_STORE_ID === 'undefined' ||
    typeof BTCPAY_URL === 'undefined'
  ) {
    throw new Error('Env variables are not defined')
  }

  const btcpayserverSchema = object({
    email: string([email()]),
  })

  const redirectURL = `${BASE_URL}/payment/successful`

  const project_name = 'BTC Ebook'
  const amount = Number(EBOOK_PRICE)
  const currency = 'USD'

  try {
    const { email } = parse(btcpayserverSchema, req)

    const metadata = {
      orderId: createId(),
      project_name,
      buyerEmail: email,
    }

    const response = await fetch(
      `${BTCPAY_URL}/stores/${BTCPAY_STORE_ID}/invoices`,
      {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${BTCPAY_API_KEY}`,
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
          amount,
          email,
          currency,
          metadata,
          checkout: { redirectURL },
        }),
      }
    )

    const session = await response.json()
    console.log(JSON.stringify({ session }, null, 2))
    console.info(`[BTCPayServer] ✅ Successfully created Checkout Page!`)
    return NextResponse.json({ success: true, url: session.checkoutLink })
  } catch (error) {
    console.error(error, `[BTCPayServer] Checkout Error`)
    return NextResponse.json(error, { status: 500 })
  }
}
