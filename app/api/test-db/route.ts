import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await connectToDatabase()
    await client.db().command({ ping: 1 })
    
    return NextResponse.json({ status: 'success', message: 'Conexión a la base de datos exitosa' })
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error)
    return NextResponse.json({ status: 'error', message: 'Error al conectar a la base de datos' }, { status: 500 })
  }
}