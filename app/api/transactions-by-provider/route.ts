import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Asegúrate de tener esta función de conexión

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const limit = searchParams.get('limit');

  if (!provider || !limit) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  try {
    const cliente = await connectToDatabase();
    const transactions = await cliente.db("inventario_restaurante")
      .collection('transacciones') // Asegúrate de usar el nombre correcto de tu colección
      .find({ proveedor: provider }) // Filtra por proveedor
      .sort({ fechaRegistro: -1 }) // Ordenar por fecha (descendente)
      .limit(Number(limit)) // Limitar el número de resultados
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Error al obtener las transacciones' }, { status: 500 });
  }
}