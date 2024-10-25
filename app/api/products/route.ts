import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// Función para manejar el método GET
export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db("inventario_restaurante");
    const collection = db.collection("productos");

    // Consulta a la base de datos
    const productos = await collection.find({}).toArray();

    // Enviar las transacciones como respuesta
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error en GET:', error.message);
    return NextResponse.json({ error: 'Error al obtener las transacciones', detalles: error.message }, { status: 500 });
  }
}