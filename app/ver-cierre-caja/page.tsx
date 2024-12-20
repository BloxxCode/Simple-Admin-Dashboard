'use client';

import { useState, useEffect } from 'react';
import { format, startOfToday, endOfToday } from 'date-fns';
import { CreditCard } from 'lucide-react';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/date-range-picker';
import { DateRange } from "react-day-picker"
import { PaginatedCierreTable } from "@/components/PaginatedCierreCajaTable";
import { Cierre } from "@/types";

import Image from "next/image"
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default function CierreDeCajaPage() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
      from: startOfToday(),
      to: endOfToday(),
    });
    const [totalCierre, setTotalCierre] = useState<number>(0);
    const [totalEfectivo, setTotalEfectivo] = useState<number>(0);
    const [totalVisa, setTotalVisa] = useState<number>(0);
    const [totalYape, setTotalYape] = useState<number>(0);
    const [cierreData, setCierreData] = useState<Cierre[]>([])
  
    const fetchCierreCaja = async (range: DateRange | undefined) => {
      // Convertir las fechas a ISO 8601 en formato UTC
      if (range?.from && range.to){
        const startDay = format(range.from, "yyyy-MM-dd");
        const endDay = format(range.to, "yyyy-MM-dd");

        try {
          const response = await fetch(`/api/ver-cierre-caja?startDay=${startDay}&endDay=${endDay}`);
          const data = await response.json();

          setCierreData(data.cierres)
          console.log("Mis Cierres: ", data.cierres)
          setTotalCierre(data.total);
          setTotalEfectivo(data.totalEfectivo);
          setTotalVisa(data.totalVisa);
          setTotalYape(data.totalYape);
        } catch (error) {
          console.error('Error al obtener el cierre de caja:', error);
        }
      }
    };

    const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
      setDateRange(newDateRange);
      fetchCierreCaja(newDateRange);
    };

    useEffect(() => {
      // Fetch data for the default period
      fetchCierreCaja(dateRange);
    }, [dateRange]);

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
            <h2 className="text-3xl font-bold tracking-tight">Totales Cierre de Caja</h2>
            <div className="flex items-center space-x-2">
              <DateRangePicker onDateRangeChange={handleDateRangeChange} />
              <Button>Descargar Reporte</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cierre</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCierre.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Cierre de Caja</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efectivo</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalEfectivo.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total Efectivo</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visa</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalVisa.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total Tarjetas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Yape</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalYape.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total Billeteras Digitales</p>
              </CardContent>
            </Card>
          </div>
          <PaginatedCierreTable transactions={cierreData}/>
        </div>
      </div>
    );
}