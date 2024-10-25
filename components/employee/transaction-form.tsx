import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Producto, Transaccion } from "@/types"
import { searchProducts, saveTransaction } from "@/lib/api"
import { DateTime } from "luxon"

interface TransactionFormProps {
  onTransactionAdded: () => void
  setTotalExpense: (total: number) => void; // Agrega la prop para manejar el total de gastos
}

export function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [busqueda, setBusqueda] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [precio, setPrecio] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [costoTotal, setCostoTotal] = useState(0)
  const [proveedor, setProveedor] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [error, setError] = useState<string | null>(null) // Estado para mensajes de error
  const [showDialog, setShowDialog] = useState(false)

  const handleBusqueda = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setBusqueda(query)
    if (query.length > 1) {
      try {
        const results = await searchProducts(query)
        setProductos(results)
      } catch (error) {
        console.error('Error searching products:', error)
        setProductos([])
      }
    } else {
      setProductos([])
    }
  }

  const obtenerFechaLima = () => {
    const fecha = DateTime.now().setZone('America/Lima').toISO();
    return fecha
  };

  const handleSeleccionProducto = (producto: Producto) => {
    setProductoSeleccionado(producto)
    setBusqueda('')
    setProductos([])
  }

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrecio(value)
      updateCostoTotal(value, cantidad)
    }
  }

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCantidad(value)
      updateCostoTotal(precio, value)
    }
  }

  const updateCostoTotal = (precio: string, cantidad: string) => {
    const precioNum = parseFloat(precio)
    const cantidadNum = parseFloat(cantidad)
    if (!isNaN(precioNum) && !isNaN(cantidadNum)) {
      setCostoTotal(precioNum * cantidadNum)
      setError(null) // Resetea el error si los cálculos son válidos
    } else {
      setCostoTotal(0)
    }
  }

  const verifyInputs = () => {
    const camposFaltantes = [];

    if (!productoSeleccionado) {
      camposFaltantes.push('Producto');
    }
    if (!precio) {
      camposFaltantes.push('Precio');
    }
    if (!cantidad) {
      camposFaltantes.push('Cantidad');
    }
    if (!proveedor) {
      camposFaltantes.push('Proveedor');
    }
  
    if (camposFaltantes.length > 0) {
      alert(`Debes completar los siguientes campos: ${camposFaltantes.join(', ')}`);
      return false; // Indica que faltan campos
    }

    return true; // Todos los campos están completos
  };

  const handleGuardarTransaccion = async () => {
    if (!productoSeleccionado || !precio || !cantidad || !proveedor) {
      alert("¡Debes completar todos los campos!")
      return;
    };
  
    const transaccion: Partial<Transaccion> = {
      nombre: productoSeleccionado.nombre,
      categoria: productoSeleccionado.categoria,
      medida: productoSeleccionado.medida,
      precio: parseFloat(precio),
      costoTotal: parseFloat(costoTotal.toFixed(2)),
      cantidad: parseFloat(cantidad),
      proveedor: proveedor,
      fechaRegistro: obtenerFechaLima(),
    };
  
    try {
      const success = await saveTransaction(transaccion, productoSeleccionado._id);
      if (success) {
        setProductoSeleccionado(null);
        setPrecio('');
        setCantidad('');
        setCostoTotal(0);
        setProveedor('');
        onTransactionAdded(); // Llama a la función para recargar datos de transacciones
        setShowDialog(false);
  
        alert('Transacción guardada con éxito');
      } else {
        alert('Error al guardar la transacción');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Error al guardar la transacción');
    }
  };

  const handleClickGuardar = () => {
    if (verifyInputs()) {
      setShowDialog(true); // Solo abre el diálogo si los campos están completos
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Transacción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && <div className="text-red-500">{error}</div>} {/* Mostrar mensajes de error */}
          <div>
            <Label htmlFor="busqueda">Buscar Producto</Label>
            <Input
              id="busqueda"
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
                <Label>Tipo de Medida</Label>
                <Input value={productoSeleccionado.medida} readOnly />
              </div>
              <div>
                <Label htmlFor="proveedor">Proveedor</Label>
                <Select value={proveedor} onValueChange={setProveedor}>
                  <SelectTrigger id="proveedor">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mercado">Mercado</SelectItem>
                    <SelectItem value="Makro">Makro</SelectItem>
                    <SelectItem value="Almacen">Almacen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  value={precio}
                  onChange={handlePrecioChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  inputMode='decimal'
                  pattern="[0-9]*"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Costo Total</Label>
                <Input value={costoTotal.toFixed(2)} readOnly />
              </div>
              <Button className="w-full" onClick={handleClickGuardar}>Guardar Transacción</Button>
              <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogTrigger asChild>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Transacción</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que deseas guardar esta transacción?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGuardarTransaccion}>Guardar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}