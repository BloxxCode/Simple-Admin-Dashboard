"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionForm } from "@/components/employee/transaction-form"
import { UsageForm } from "@/components/employee/usage-form"
import { TransactionsTable } from "@/components/employee/transactions-table"
import { fetchTransaccionesDelDia } from "@/lib/api"
import { Transaccion } from "@/types"
import { MainNav } from "@/components/employee/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

export default function EmployeePage() {
  const [transactionsToday, setTransactionsToday] = useState<Transaccion[]>([])

  useEffect(() => {
    const loadData = async () => {
      const transactions = await fetchTransaccionesDelDia() // Llama solo a fetchTransaccionesDelDia
      setTransactionsToday(transactions) // Actualiza el estado con las transacciones
    };
    loadData();
  }, []);

  const handleTransactionAdded = async () => {
    const transactions = await fetchTransaccionesDelDia() // Llama solo a fetchTransaccionesDelDia
    setTransactionsToday(transactions)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            <span className="font-bold">Sam Admin System</span>
          </div>
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Total de Mercado Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              Costo total de transacciones: ${transactionsToday.reduce((acc, trans) => acc + (trans.costoTotal || 0), 0).toFixed(2)}
            </p> 
          </CardContent>
        </Card>
        <Tabs defaultValue="transaccion" className="mb-6">
          <TabsList>
            <TabsTrigger value="transaccion">Transacción</TabsTrigger>
            <TabsTrigger value="usados">Usados</TabsTrigger>
          </TabsList>
          <TabsContent value="transaccion">
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
          </TabsContent>
          <TabsContent value="usados">
            <UsageForm onUsageAdded={handleTransactionAdded} />
          </TabsContent>
        </Tabs>
        <TransactionsTable transactions={transactionsToday} />
      </div>
    </div>
  )
}