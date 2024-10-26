"use client"

import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
import Image from "next/image"
import { DateRange } from "react-day-picker"
import { format, startOfToday, endOfToday } from "date-fns";

import { PackagePlus, CreditCard, Users } from "lucide-react";
import { TransactionForm } from "@/components/employee/transaction-form";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { MainNav } from "@/components/main-nav"
import { RecentSales } from "@/components/recent-sales"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { PaginatedTransactionTable } from "@/components/PaginatedTransactionTable"
import { Transaccion } from "@/types";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfToday(),
    to: endOfToday()
  })
  const [selectedTab, setSelectedTab] = useState("total")
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [transactionsData, setTransactionsData] = useState<Transaccion[]>([])
  const [totalCost, setTotalCost] = useState<number>(0)
  const [numTransactions, setNumTransactions] = useState<number>(0)
  const [showTransactionForm, setShowTransactionForm] = useState(false)

  // const router = useRouter()

  const fetchTransactions = async (range: DateRange | undefined, proveedor: string) => {
    if (range?.from && range?.to) {
      const startDay = format(range.from, 'yyyy-MM-dd')
      const endDay = format(range.to, 'yyyy-MM-dd')

      try {
        const response = await fetch(`/api/transactions-today?startDay=${startDay}&endDay=${endDay}&proveedor=${proveedor}`)
        const data = await response.json()

        setTransactionsData(data)
        const totalCost = data.reduce((acc: number, transaction: any) => acc + transaction.costoTotal, 0)
        setTotalCost(totalCost)
        setNumTransactions(data.length)
      } catch (error) {
        console.error("Error al obtener las transacciones:", error)
      }
    }
  }

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
    setSelectedPeriod("custom")
    fetchTransactions(newDateRange, selectedTab)
  }

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
    fetchTransactions(dateRange, tab)
  }

  console.log(selectedPeriod)

  useEffect(() => {
    // Fetch initial data when the page loads with "Today" and "Total" tab
    fetchTransactions(dateRange, selectedTab)
  }, [dateRange, selectedTab])

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
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <DateRangePicker onDateRangeChange={handleDateRangeChange} />
            <Button>Descargar Reporte</Button>
          </div>
        </div>
        <Tabs value={selectedTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="Total">Total</TabsTrigger>
            <TabsTrigger value="Mercado">Mercado</TabsTrigger>
            <TabsTrigger value="Makro">Makro</TabsTrigger>
            <TabsTrigger value="Almacen">Almacen</TabsTrigger>
          </TabsList>
          <TabsContent value={selectedTab} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Transacciones
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground"/>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{numTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    # Total de Transacciones
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Costos
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${isNaN(totalCost) ? "N/A" : totalCost.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    + Suma Total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer" onClick={() => setShowTransactionForm(true)}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Crear Nueva
                        </CardTitle>
                        <PackagePlus className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">Transacción</div>
                        <p className="text-xs text-muted-foreground">
                          Agrega una transacción
                        </p>
                      </CardContent>
                    </div>
                  </DialogTrigger>
                  {/* Aquí es donde aparece el popup con el formulario */}
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Transacción</DialogTitle>
                    </DialogHeader>
                    
                    <TransactionForm 
                      onTransactionAdded={() => {
                        setShowTransactionForm(false);
                      }}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTransactionForm(false)}>
                        Cancelar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ver como
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Empleado</div>
                  <p className="text-xs text-muted-foreground">
                    Ir a Empelado Dashboard
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Lista de Transacciones del {selectedTab}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  {/* <Overview selectedTab={selectedTab} /> */}
                  <PaginatedTransactionTable transactions={transactionsData} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Transaciones Recientes Mercado</CardTitle>
                  <CardDescription>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}