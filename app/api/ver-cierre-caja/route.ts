import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; 
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay, addHours } from 'date-fns';

const limaTimeZone = 'America/Lima';

export async function GET(req: Request) {
    const client = await connectToDatabase();
    const db = client.db("inventario_restaurante");
    const collection = db.collection("cierres-de-caja");
    
    try {
        // Obtener la fecha actual en Lima
        const date = new Date()
        const nowInLima = formatInTimeZone(date, limaTimeZone, 'yyyy-MM-dd HH:mm:ssXXX');

        const { searchParams } = new URL(req.url);
        // Convertir los parámetros a objetos Date en UTC
        const startDateParam = new Date(searchParams.get('startDay')); // Recibido en UTC
        const endDateParam = new Date(searchParams.get('endDay')); // Recibido en UTC

        // Sumar 5 horas (5 meridianos)
        const startDayUTC = new Date(startDateParam.getTime() + 5 * 60 * 60 * 1000);
        const endDayUTC = new Date(endDateParam.getTime() + 5 * 60 * 60 * 1000);

        // Formato final
        console.log("Inicio calculado: ", startDayUTC.toISOString());
        console.log("Fin calculado: ", endDayUTC.toISOString());

        console.log("Hora de lima:", nowInLima)
        // Calcular el inicio y fin del día en Lima
        const startDayLima = startOfDay(nowInLima); // 00:00:00
        const endDayLima = endOfDay(nowInLima); // 23:59:59

        console.log("Inicio lima: ", startDayLima)
        console.log("Fin lima: ", endDayLima)


        // Consultar los registros en la base de datos
        const cierres = await collection.find({
            fechaRegistro: {
                $gte: new Date(startDayUTC),
                $lte: new Date(endDayUTC),
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