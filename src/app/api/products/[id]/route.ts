import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import fs from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = Number(id)

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('❌ Error fetching product:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// 🗑️ DELETE /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = Number(id)

    await prisma.product.delete({ where: { id: productId } })
    return NextResponse.json({ message: `Продукт ${productId} видалено` })
  } catch (error) {
    console.error('Помилка при видаленні продукту:', error)
    return NextResponse.json({ error: 'Не вдалося видалити продукт' }, { status: 500 })
  }
}

// ✏️ PUT /api/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = Number(id)

    const formData = await req.formData()
    const name = formData.get('name') as string
    const price = Number(formData.get('price'))
    const brand = formData.get('brand') as string
    const file = formData.get('image') as File | null

    if (!name) {
      return NextResponse.json({ error: 'Назва продукту є обов’язковою' }, { status: 400 })
    }

    if (name.length > 191) {
      return NextResponse.json(
        { error: 'Назва продукту не може перевищувати 191 символ' },
        { status: 400 }
      )
    }

    let imageUrl: string | undefined
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

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price,
        brand,
        ...(imageUrl ? { image: imageUrl } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('❌ Помилка оновлення продукту:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
