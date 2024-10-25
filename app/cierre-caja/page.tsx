'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { formatInTimeZone } from 'date-fns-tz';

export default function CierreDeCaja() {
  const limaTimeZone = 'America/Lima';

  // Función para obtener la fecha y hora actual en Lima (UTC-5)
  const getCurrentDateTimeInLima = () => {
    const now = new Date();
    return formatInTimeZone(now, limaTimeZone, 'yyyy-MM-dd HH:mm:ss');
  };

  // Función para obtener solo la fecha en Lima en formato ISO 8601
  const getCurrentDateInLima = () => {
    const now = new Date();
    return formatInTimeZone(now, limaTimeZone, 'yyyy-MM-dd');
  };

  const [fechaRegistro, setFechaRegistro] = useState<string>(getCurrentDateTimeInLima());
  const [fecha, setFecha] = useState<string>(getCurrentDateInLima());
  const [efectivo, setEfectivo] = useState<string>('');
  const [visa, setVisa] = useState<string>('');
  const [yape, setYape] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const [errors, setErrors] = useState<{ efectivo?: string; visa?: string; yape?: string }>({});

  // Actualizar la fecha y hora completa cada segundo para mantener el registro actualizado
  useEffect(() => {
    const interval = setInterval(() => {
      setFechaRegistro(getCurrentDateTimeInLima());
    }, 1000);

    return () => clearInterval(interval); // Limpiar el intervalo cuando el componente se desmonta
  }, []);

  const handleClickGuardar = () => {
    const newErrors: { efectivo?: string; visa?: string; yape?: string } = {};

    if (isNaN(Number(efectivo))) {
      newErrors.efectivo = 'Ingrese un valor numérico';
    }
    if (isNaN(Number(visa))) {
      newErrors.visa = 'Ingrese un valor numérico';
    }
    if (isNaN(Number(yape))) {
      newErrors.yape = 'Ingrese un valor numérico';
    }

    if (Object.keys(newErrors).length === 0) {
      setShowDialog(true);
    } else {
      setErrors(newErrors);
    }
  };

  const handleGuardar = async () => {
    setShowDialog(false);

    const utcDate = new Date(fecha).toISOString()
    const fechaRegistroUtc = new Date(fechaRegistro).toISOString();

    const data = {
      fecha: utcDate, // Enviar la fecha en formato ISO 8601
      fechaRegistro: fechaRegistroUtc, // Mantiene la hora exacta
      efectivo: Number(efectivo) || 0,
      visa: Number(visa) || 0,
      yape: Number(yape) || 0,
    };

    try {
      const response = await fetch('/api/cierre-de-caja', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Registro guardado con éxito');
      } else {
        const result = await response.json();
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error al intentar guardar el registro');
    }
  };

  const getResumen = () => {
    return (
      <>
        <p><strong>Fecha del Cierre (ISO 8601):</strong> {fecha}</p>
        <p><strong>Fecha y Hora del Registro:</strong> {fechaRegistro}</p>
        <p><strong>Efectivo:</strong> S/ {efectivo || '0'}</p>
        <p><strong>Visa:</strong> S/ {visa || '0'}</p>
        <p><strong>Yape:</strong> S/ {yape || '0'}</p>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierre de Caja</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col">
            <Label className="mb-4">Fecha y Hora del Cierre de Caja</Label>
            <p>{fechaRegistro}</p> {/* Mostrar la fecha y hora completa con segundos */}
          </div>
          <div className="mb-4">
            <Label htmlFor="efectivo">Efectivo (S/)</Label>
            <Input
              id="efectivo"
              type="number"
              value={efectivo}
              onChange={(e) => {
                setEfectivo(e.target.value);
                setErrors({ ...errors, efectivo: undefined });
              }}
              placeholder="0.00"
              className={errors.efectivo ? 'border-red-500' : ''}
            />
            {errors.efectivo && <p className="text-red-500">{errors.efectivo}</p>}
          </div>
          <div className="mb-4">
            <Label htmlFor="visa">Visa (S/)</Label>
            <Input
              id="visa"
              type="number"
              value={visa}
              onChange={(e) => {
                setVisa(e.target.value);
                setErrors({ ...errors, visa: undefined });
              }}
              placeholder="0.00"
              className={errors.visa ? 'border-red-500' : ''}
            />
            {errors.visa && <p className="text-red-500">{errors.visa}</p>}
          </div>
          <div className="mb-4">
            <Label htmlFor="yape">Yape (S/)</Label>
            <Input
              id="yape"
              type="number"
              value={yape}
              onChange={(e) => {
                setYape(e.target.value);
                setErrors({ ...errors, yape: undefined });
              }}
              placeholder="0.00"
              className={errors.yape ? 'border-red-500' : ''}
            />
            {errors.yape && <p className="text-red-500">{errors.yape}</p>}
          </div>
          <Button className="w-full" onClick={handleClickGuardar}>Guardar Registro</Button>
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Cierre de Caja</AlertDialogTitle>
                <AlertDialogDescription>
                  {getResumen()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleGuardar}>Guardar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}