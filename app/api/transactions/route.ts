import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Función para manejar la solicitud POST para guardar una transacción
export async function POST(req: Request) {
  try {
    const { transaction, productoId } = await req.json() // Asegúrate de extraer correctamente el objeto

    // Conectar a la base de datos
    const client = await connectToDatabase()
    const db = client.db("inventario_restaurante")

    const producto = await db.collection('productos').findOne({ _id: new ObjectId(productoId) })
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Validar que los campos necesarios estén presentes
    if (!transaction.nombre || !transaction.precio || !transaction.cantidad || !transaction.proveedor || !transaction.fechaRegistro) {
      return NextResponse.json({ success: false, message: 'Campos incompletos' }, { status: 400 })
    }

    // Inserta la transacción en la colección
    const result = await db.collection('transacciones').insertOne(transaction)

    // Actualizar el stock del producto correspondiente en la colección "productos"
    const nuevaCantidad = producto.stock + transaction.cantidad
    await db.collection('productos').updateOne(
      { _id: new ObjectId(productoId) },
      { $set: { stock: nuevaCantidad } }
    )

    return NextResponse.json({ success: true, insertedId: result.insertedId })
  } catch (error) {
    console.error('Error al guardar la transacción:', error)
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 })
  }
}