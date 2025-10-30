'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Product {
  id: number
  name: string
  description?: string
  price?: number
  brand?: string
  image?: string
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Error fetching product')
        setProduct(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError(String(err))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!product) return <p>Product not found</p>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-gray-500 mb-4">{product.brand}</p>
      {product.image && (
        <Image
          src={product.image}
          alt={product.name}
          width={400}
          height={400}
          className="mb-4 rounded"
        />
      )}
      <p className="mb-2">Price: ${product.price ?? 'N/A'}</p>
      <p className="text-gray-700">{product.description}</p>
      <button onClick={() => router.push(`/`)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l mt-3 hover:cursor-pointer">Повернутися до списку</button>
    </div>
  )
}
