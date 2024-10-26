import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DateTime } from 'luxon';

export async function GET(req: Request) {
  try {
    const client = await connectToDatabase();
    const db = client.db("inventario_restaurante");
    const collection = db.collection("transacciones");

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDay');
    const endDateParam = searchParams.get('endDay');
    const lookProveedor = searchParams.get('proveedor');

    // Convertir las fechas proporcionadas en Luxon DateTime o usar la fecha actual en Lima
    const ahoraEnLima = DateTime.now().setZone('America/Lima');

    console.log("Ahora en Lima:", ahoraEnLima)

    let inicioDelDia, finDelDia;
    let xproveedor;

    if (startDateParam && endDateParam) {
      // Si se proporcionan fechas, las usamos
      inicioDelDia = DateTime.fromISO(startDateParam, { zone: 'America/Lima' }).startOf('day').toUTC().toISO();
      finDelDia = DateTime.fromISO(endDateParam, { zone: 'America/Lima' }).endOf('day').toUTC().toISO();
    } else {
      // Si no se proporcionan, usamos el día actual
      inicioDelDia = ahoraEnLima.startOf('day').toUTC().toISO(); // YYYY-MM-DDT00:00:00-05:00
      finDelDia = ahoraEnLima.endOf('day').toUTC().toISO();     // YYYY-MM-DDT23:59:59-05:00
    }

    console.log("Inicio del dia: ", inicioDelDia)
    console.log("Fin del dia: ", finDelDia)

    if (!inicioDelDia || !finDelDia) {
      throw new Error('Error al convertir las fechas a ISO');
    }

    // Consulta a la base de datos con el rango de fechas
    if (lookProveedor != "Total") {
      xproveedor = lookProveedor;
      const transacciones = await collection.find({
        proveedor: xproveedor,
        fechaRegistro: {
          $gte: inicioDelDia,
          $lte: finDelDia
        }
      }).toArray();
      return NextResponse.json(transacciones);
    } else {
      const transacciones = await collection.find({
        fechaRegistro: {
          $gte: inicioDelDia,
          $lte: finDelDia
        }
      }).toArray();
      return NextResponse.json(transacciones);
    }
  } catch (error) {
    console.error('Error en GET:', error);
    return NextResponse.json({ error: 'Error al obtener las transacciones' }, { status: 500 });
  }
}