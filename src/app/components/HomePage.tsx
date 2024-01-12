'use client'

import { EBOOK_PRICE } from '@/app/lib/constants'

export const HomePage = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    if (email.trim() === '') {
      alert('Please provide an email')
      return
    }

    const response = await fetch(`/api/btcpayserver/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const result = await response.json()

    if (result.success) {
      window.location.assign(result.url)
    }
  }

  return (
    <div className="m-2">
      <h1 className="block text-2xl font-bold leading-9 text-amber-500 mb-2">
        BTCPayServer + Next.js Demo
      </h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-lg font-medium leading-6 text-white"
          >
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="border border-white text-md py-2 px-2 w-64"
              required
            />
          </div>
        </div>

        <button type="submit" className="border border-white p-2 w-64">
          Buy for ${EBOOK_PRICE}
        </button>
      </form>
    </div>
  )
}
