import { connectToDatabase } from '@/lib/mongodb'
import { NextResponse } from 'next/server'

import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

async function getClient() {
  if (!client) {
    client = await connectToDatabase()
  }
  return client
}

export async function GET() {
  console.log('Iniciando GET request')
  try {
    const client = await getClient()
    const db = client.db("inventario_restaurante")
    const collection = db.collection("productos")
    console.log('Obteniendo productos de la base de datos')
    const products = await collection.find({}).toArray()
    console.log(`Se encontraron ${products.length} productos`)
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error en GET /api/products:', error)
    return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  console.log('Iniciando POST request')
  try {
    const client = await getClient()
    const db = client.db("inventario_restaurante")
    const collection = db.collection("productos")
    const newProduct = await request.json()
    console.log('Insertando nuevo producto:', newProduct)
    const result = await collection.insertOne(newProduct)
    console.log('Producto insertado con éxito')
    return NextResponse.json({ ...newProduct, _id: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/products:', error)
    return NextResponse.json({ error: 'Error al agregar el producto' }, { status: 500 })
  }
}