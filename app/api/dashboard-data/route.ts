import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tab = searchParams.get('tab')
  const dateRange = searchParams.get('dateRange')

  try {
    const client = await connectToDatabase()
    const db = client.db("inventario_restaurante")

    // Here you would query your database based on the tab and dateRange
    // This is a placeholder for the actual database query
    const data = {
      totalTransactions: 45231.89,
      transactionCount: 2350,
      sales: 12234,
      activeNow: 573,
      overviewData: [
        { name: "Jan", total: 1234 },
        { name: "Feb", total: 2345 },
        // ... add more months
      ],
      recentSales: [
        { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "$1,999.00" },
        { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "$39.00" },
        // ... add more sales
      ]
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}