import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Asume que tienes una función para conectar con tu MongoDB

// Ruta para manejar solicitudes POST
export async function POST(request: Request) {
  try {
    // 1. Parsear el cuerpo de la solicitud
    const body = await request.json();
    const { fecha, fechaRegistro, efectivo, visa, yape } = body;

    // 2. Validar los datos
    if (!fecha || typeof efectivo !== 'number' || typeof visa !== 'number' || typeof yape !== 'number') {
      return NextResponse.json({ error: 'Datos inválidos o faltantes' }, { status: 400 });
    }

    // 3. Conectar a la base de datos
    const client = await connectToDatabase();
    const db = client.db('inventario_restaurante');
    const collection = db.collection('cierres-de-caja');

    // 4. Guardar los datos en la base de datos
    await collection.insertOne({
      fecha: new Date(fecha),
      fechaRegistro: new Date(fechaRegistro),
      efectivo,
      visa,
      yape,
      total: efectivo + visa + yape,
    });

    // 5. Enviar respuesta exitosa
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 });
  }
}