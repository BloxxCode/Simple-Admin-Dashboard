import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Producto } from "@/types"
import { searchProducts, saveUsage } from "@/lib/api"

interface UsageFormProps {
  onUsageAdded: () => void
}

export function UsageForm({ onUsageAdded }: UsageFormProps) {
  const [busqueda, setBusqueda] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [cantidadUsada, setCantidadUsada] = useState('')
  const [stockRestante, setStockRestante] = useState(0)
  const [alertaStock, setAlertaStock] = useState<{ tipo: 'error' | 'warning' | 'info', mensaje: string } | null>(null)
  const [showNegativeStockDialog, setShowNegativeStockDialog] = useState(false)
  const [productos, setProductos] = useState<Producto[]>([])

  const handleBusqueda = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setBusqueda(query)
    if (query.length > 1) {
      const results = await searchProducts(query)
      setProductos(results)
    } else {
      setProductos([])
    }
  }

  const handleSeleccionProducto = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setBusqueda('')
    setProductos([])
    setCantidadUsada('')
    setStockRestante(producto.stock)
    setAlertaStock(null)
  }

  const handleCantidadUsadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCantidadUsada(value)
      if (productoSeleccionado) {
        const cantidadUsadaNum = parseFloat(value)
        const nuevoStock = productoSeleccionado.stock - cantidadUsadaNum
        setStockRestante(nuevoStock)
  
        if (nuevoStock < 0) {
          setShowNegativeStockDialog(true)
        } else if (nuevoStock === 0) {
          setAlertaStock({
            tipo: 'error',
            mensaje: `El producto ${productoSeleccionado.nombre} quedará SIN STOCK al registrar este uso. Contactar al administrador para reabastecer.`
          })
        } else if (nuevoStock <= productoSeleccionado.puntoReabastecimiento) {
          setAlertaStock({
            tipo: 'warning',
            mensaje: `El producto ${productoSeleccionado.nombre} está por agotarse. Procure reabastecer antes de que se agote por completo.`
          })
        } else {
          setAlertaStock(null)
        }
      }
    }
  }

  const handleGuardarUsados = async () => {
    if (!productoSeleccionado || !cantidadUsada) return

    const success = await saveUsage(productoSeleccionado._id, parseFloat(cantidadUsada))
    if (success) {
      setProductoSeleccionado(null)
      setCantidadUsada('')
      setStockRestante(0)
      setAlertaStock(null)
      onUsageAdded()
      alert('Uso registrado con éxito');
    } else {
      alert('Error al registrar el uso del producto')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Uso de Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label  htmlFor="busquedaUsados">Buscar Producto</Label>
            <Input
              id="busquedaUsados"
              value={busqueda}
              onChange={handleBusqueda}
              placeholder="Nombre del producto..."
            />
            {productos.length > 0 && (
              <ul className="mt-2 border rounded-md divide-y">
                {productos.map((producto) => (
                  <li
                    key={producto._id}
                    className="p-2 hover:bg-slate-400 cursor-pointer"
                    onClick={() => handleSeleccionProducto(producto)}
                  >
                    {producto.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {productoSeleccionado && (
            <>
              <div>
                <Label>Producto Seleccionado</Label>
                <Input value={productoSeleccionado.nombre} readOnly />
              </div>
              <div>
                <Label>Stock Actual</Label>
                <Input value={productoSeleccionado.stock.toFixed(2)} readOnly />
              </div>
              <div>
                <Label htmlFor="cantidadUsada">Cantidad Usada</Label>
                <Input
                  id="cantidadUsada"
                  type="number"
                  value={cantidadUsada}
                  onChange={handleCantidadUsadaChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Stock Restante</Label>
                <Input value={stockRestante.toFixed(2)} readOnly />
              </div>
              {alertaStock && (
                <Alert variant={alertaStock.tipo === 'error' ? 'destructive' : 'warning'}>
                  <AlertTitle>{alertaStock.tipo === 'error' ? 'Importante' : 'Advertencia'}</AlertTitle>
                  <AlertDescription>{alertaStock.mensaje}</AlertDescription>
                </Alert>
              )}
              <AlertDialog open={showNegativeStockDialog} onOpenChange={setShowNegativeStockDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Advertencia: Stock Negativo</AlertDialogTitle>
                    <AlertDialogDescription>
                      El cambio que estás haciendo deja el stock en una cifra negativa ({stockRestante.toFixed(2)}).
                      ¿Estás seguro de guardar este cambio?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCantidadUsada('')}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGuardarUsados}>Guardar cambios</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button 
                className="w-full" 
                onClick={handleGuardarUsados}
                disabled={!cantidadUsada || showNegativeStockDialog}
              >
                Guardar Uso
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}