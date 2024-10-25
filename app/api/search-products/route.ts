import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  console.log(query)

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const client = await connectToDatabase()
    const db = client.db("inventario_restaurante")
    const collection = db.collection("productos")

    const products = await collection.find({
      $or: [
        { nombre: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to search products:', error)
    return NextResponse.json({ error: 'Failed to search products' }, { status: 500 })
  }
}