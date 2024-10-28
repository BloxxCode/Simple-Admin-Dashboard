import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from "@/lib/mongodb";
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null

async function getClient() {
  if (!client) {
    client = await connectToDatabase()
  }
  return client
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  console.log('Iniciando PUT request para el producto con ID:', params.id)
  const client = await getClient()
  const db = client.db("inventario_restaurante")
  const collection = db.collection("productos")

  try {
    const { id } = params
    const updatedProduct = await request.json()
    console.log('Actualizando producto:', updatedProduct)
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedProduct }
    )
    if (result.matchedCount === 0) {
      console.log('Producto no encontrado')
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    console.log('Producto actualizado con éxito')
    return NextResponse.json({ ...updatedProduct, _id: id })
  } catch (error) {
    console.error('Error al actualizar el producto:', error)
    return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log('Iniciando DELETE request para el producto con ID:', params.id)
  const client = await getClient()
  const db = client.db("inventario_restaurante")
  const collection = db.collection("productos")

  try {
    const { id } = params
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount === 0) {
      console.log('Producto no encontrado')
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    console.log('Producto eliminado correctamente')
    return NextResponse.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar el producto:', error)
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 })
  }
}