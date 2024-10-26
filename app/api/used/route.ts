import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Función para manejar el método GET
export async function POST(req: Request) {
  try {

    const { productoId, cantidadUsada } = await req.json()

    const client = await connectToDatabase();
    const db = client.db("inventario_restaurante");

    // Consulta a la base de datos
    const producto = await db.collection('productos').findOne({ _id: new ObjectId(productoId) })

    if (!producto) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }

    // Actualizar el stock del producto correspondiente en la colección "productos"
    const nuevaCantidad = producto.stock - cantidadUsada
    await db.collection('productos').updateOne(
      { _id: new ObjectId(productoId) },
      { $set: { stock: nuevaCantidad } }
    )

    // Enviar las transacciones como respuesta
    return NextResponse.json({ success: true, message: "Stock actualizado" })
  } catch (error) {
    console.error('Error en GET:', error);
    return NextResponse.json({ error: 'Error al obtener las transacciones' }, { status: 500 });
  }
}