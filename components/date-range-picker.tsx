"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { addDays, format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { fromZonedTime, toZonedTime } from 'date-fns-tz'; // Importar funciones adecuadas
const limaTimeZone = 'America/Lima';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DateRangePickerProps = React.HTMLAttributes<HTMLDivElement> & {
  onDateRangeChange?: (dateRange: DateRange | undefined) => void;
  onPeriodChange?: (period: string) => void;
};

export function DateRangePicker({
  className,
  onDateRangeChange,
  onPeriodChange,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [selectedPeriod, setSelectedPeriod] = React.useState("today");

  const handleDateRangeChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onDateRangeChange) {
      onDateRangeChange(newDate);
    }
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
  
    let newDateRange: DateRange | undefined;
  
    if (value === "today") {
      newDateRange = {
        from: startOfToday(),
        to: endOfToday(),
      };
    } else if (value === "this-week") {
      newDateRange = {
        from: startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes
        to: endOfWeek(new Date(), { weekStartsOn: 1 }), // Domingo
      };
    } else if (value === "this-month") {
      newDateRange = {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      };
    }
  
    // Aquí verificamos si newDateRange está definido antes de usarlo
    if (newDateRange) {
      // Ajustar la fecha final al último segundo del día
      newDateRange.to.setHours(23, 59, 59, 999);
  
      // Convertir a UTC
      const utcFrom = fromZonedTime(newDateRange.from, limaTimeZone).toISOString();
      const utcTo = fromZonedTime(newDateRange.to, limaTimeZone).toISOString();
  
      console.log(utcFrom, utcTo);
  
      // Llamar a la función onDateRangeChange con el nuevo rango en UTC
      if (onDateRangeChange) {
        onDateRangeChange({
          from: new Date(utcFrom),
          to: new Date(utcTo),
        });
      }
  
      // Actualizar el estado del rango de fechas
      setDate(newDateRange);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Seleccionar período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="this-week">Esta semana</SelectItem>
          <SelectItem value="this-month">Este mes</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>
      {selectedPeriod === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Selecciona una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}