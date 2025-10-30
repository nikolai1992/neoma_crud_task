import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { writeFile } from 'fs/promises'

type ProductWhereInput = NonNullable<
  Parameters<typeof prisma.product.findMany>[0]
>['where']

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 5)
  const minPrice = Number(searchParams.get('minPrice') || 0)
  const maxPriceParam = searchParams.get('maxPrice')
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined
  const brand = searchParams.get('brand') || ''
  const search = searchParams.get('search') || '' // ✅ додано параметр пошуку

  const skip = (page - 1) * limit
  const where: ProductWhereInput = {}

  // ✅ Фільтр за ціною
  if (minPrice || minPrice === 0 || maxPrice !== undefined) {
    where.price = {}
    if (minPrice || minPrice === 0) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  // ✅ Фільтр за брендом
  if (brand.trim() !== '') {
    where.brand = {
      contains: brand,
    }
  }

  // ✅ Пошук по назві (name LIKE %search%)
  if (search.trim() !== '') {
    where.name = {
      contains: search,
    }
  }

  try {
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'desc' },
    })

    const totalCount = await prisma.product.count({ where })

    return NextResponse.json({
      data: products,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      filters: { minPrice, maxPrice, brand, search },
    })
  } catch (err) {
    console.error('❌ Помилка отримання продуктів:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const price = formData.get('price') as string
    const brand = formData.get('brand') as string
    const file = formData.get('image') as File | null

    if (!name || !price) {
      return NextResponse.json({ error: 'Заповніть усі поля' }, { status: 400 })
    }
    // Перевірка довжини name
    if (name.length > 191) {
      return NextResponse.json({ error: 'Назва продукту не може перевищувати 191 символ' }, { status: 400 });
    }

    let imageUrl = ''

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), 'public/uploads')
      await fs.mkdir(uploadDir, { recursive: true })

      const fileName = `${Date.now()}_${file.name}`
      const filePath = path.join(uploadDir, fileName)

      await writeFile(filePath, buffer)
      imageUrl = `/uploads/${fileName}`
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        price: Number(price),
        image: imageUrl,
      },
    })

    return NextResponse.json(product)
  } catch (err) {
    console.error('❌ Помилка створення продукту:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
