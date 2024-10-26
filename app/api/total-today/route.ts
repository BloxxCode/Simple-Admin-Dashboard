import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DateTime } from 'luxon';

// Función para manejar el método GET
export async function GET() {
  try {
    const client = await connectToDatabase();
    const db = client.db("inventario_restaurante");
    const collection = db.collection("transacciones");

    // Obtener la fecha actual en Lima
    const ahoraEnLima = DateTime.now().setZone('America/Lima');

    // Verificar que la fecha es válida
    if (!ahoraEnLima.isValid) {
      throw new Error('Fecha inválida generada por Luxon');
    }

    // Obtener el inicio y fin del día en Lima
    const inicioDelDia = ahoraEnLima.startOf('day').toISO(); // YYYY-MM-DDT00:00:00-05:00
    const finDelDia = ahoraEnLima.endOf('day').toISO();     // YYYY-MM-DDT23:59:59-05:00

    // Verificar que las fechas en ISO son válidas
    if (!inicioDelDia || !finDelDia) {
      throw new Error('Error al convertir las fechas a ISO');
    }

    // Consulta a la base de datos
    const transacciones = await collection.find({
      proveedor: "Mercado",
      fechaRegistro: {
        $gte: inicioDelDia,
        $lte: finDelDia
      }
    }).toArray();

    // Enviar las transacciones como respuesta
    return NextResponse.json(transacciones);
  } catch (error) {
    console.error('Error en GET:', error);
    return NextResponse.json({ error: 'Error al obtener las transacciones' }, { status: 500 });
  }
}