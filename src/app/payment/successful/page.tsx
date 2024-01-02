import Link from 'next/link'

const Successful = () => {
  return (
    <div className="m-3">
      <p className="mt-4 mb-2 text-2xl font-bold text-amber-500">
        Congrats, you&apos;ve successfully bought the product!
      </p>
      <Link href="/" className="text-md leading-7 text-bold text-white">
        <span aria-hidden="true">&larr;</span> Back to HomePage
      </Link>
    </div>
  )
}

export default Successful
