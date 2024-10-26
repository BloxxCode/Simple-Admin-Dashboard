import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; 
import { DateTime } from "luxon";

export async function GET(req: Request) {
    try {
        const client = await connectToDatabase();
        const db = client.db("inventario_restaurante");
        const collection = db.collection("cierres-de-caja");
        const { searchParams } = new URL(req.url);
        const startDateParam = searchParams.get('startDay');
        const endDateParam = searchParams.get('endDay');
    
        // Convertir las fechas proporcionadas en Luxon DateTime o usar la fecha actual en Lima
        const ahoraEnLima = DateTime.now().setZone('America/Lima');
    
        console.log("Ahora en Lima:", ahoraEnLima)

        let inicioDelDia, finDelDia;
    
        if (startDateParam && endDateParam) {
          // Si se proporcionan fechas, las usamos
            inicioDelDia = DateTime.fromISO(startDateParam, { zone: 'America/Lima' }).startOf('day').toISO();
            finDelDia = DateTime.fromISO(endDateParam, { zone: 'America/Lima' }).endOf('day').toISO();
        } else {
          // Si no se proporcionan, usamos el día actual
            inicioDelDia = ahoraEnLima.startOf('day').toISO(); // YYYY-MM-DDT00:00:00-05:00
            finDelDia = ahoraEnLima.endOf('day').toISO();     // YYYY-MM-DDT23:59:59-05:00
        }
    
        console.log("Inicio del dia: ", inicioDelDia)
        console.log("Fin del dia: ", finDelDia)
    
        if (!inicioDelDia || !finDelDia) {
            throw new Error('Error al convertir las fechas a ISO');
        }


        // Consultar los registros en la base de datos
        const cierres = await collection.find({
            fechaRegistro: {
                $gte: inicioDelDia,
                $lte: finDelDia,
            },
        }).toArray();

        console.log(cierres)

        // Calcular los totales
        const total = cierres.reduce((acc, cierre) => acc + cierre.total, 0);
        const count = cierres.length;
        const totalEfectivo = cierres.reduce((acc, cierre) => acc + (cierre.efectivo || 0), 0);
        const totalVisa = cierres.reduce((acc, cierre) => acc + (cierre.visa || 0), 0);
        const totalYape = cierres.reduce((acc, cierre) => acc + (cierre.yape || 0), 0);

        return NextResponse.json({ total, count, totalEfectivo, totalVisa, totalYape });
    } catch (error) {
        console.error('Error al obtener los cierres de caja:', error);
        return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
    }
}