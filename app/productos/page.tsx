'use client'

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Plus, FileDown, MoreHorizontal, Pencil, Trash2, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface Product {
  _id: string
  nombre: string
  categoria: string
  medida: "Kilogramos" | "Litros" | "Unidades"
  estado: "En Stock" | "Bajo Stock" | "Sin Stock"
  stock: number
  puntoReabastecimiento: number
}

type ProductDialogProps = {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, '_id' | 'estado'>) => Promise<void>
  initialProduct: Omit<Product, '_id' | 'estado'>
  isNewProduct: boolean
  existingProducts: Product[]
}

const ITEMS_PER_PAGE = 10

const ProductDialog: React.FC<ProductDialogProps> = React.memo(({ isOpen, onClose, onSave, initialProduct, isNewProduct, existingProducts }) => {
  const { toast } = useToast()
  const [product, setProduct] = useState<Omit<Product, '_id' | 'estado'>>(initialProduct)
  const [productExists, setProductExists] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setProduct(initialProduct)
    setProductExists(false)
  }, [initialProduct])

  const handleChange = (field: keyof Omit<Product, '_id' | 'estado'>, value: string | number) => {
    setProduct(prev => ({ ...prev, [field]: value }))
    if (field === 'nombre') {
      setProductExists(existingProducts.some(p => p.nombre.toLowerCase() === value.toString().toLowerCase()))
    }
  }

  const handleSave = async () => {
    if (!productExists) {
      setIsSaving(true)
      try {
        await onSave(product)
        onClose()
      } catch (error) {
        console.error('Error al guardar el producto:', error)
        toast({
          title: "Error",
          description: "No se pudo guardar el producto. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        })
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="product-dialog-description">
        <DialogHeader>
          <DialogTitle>{isNewProduct ? "Agregar Nuevo Producto" : "Editar Producto"}</DialogTitle>
          <DialogDescription id="product-dialog-description">
            {isNewProduct ? "Ingrese los detalles del nuevo producto." : "Modifique los detalles del producto."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className={`text-right ${productExists ? "text-red-500" : ""}`}>
              Nombre
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="nombre"
                value={product.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                className={`${productExists ? "border-red-500" : ""}`}
              />
              {productExists && (
                <p className="text-red-500 text-sm">El producto ya existe. Por favor, use un nombre diferente.</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoria" className="text-right">
              Categoría
            </Label>
            <Input
              id="categoria"
              value={product.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="medida" className="text-right">
              Medida
            </Label>
            <Select
              value={product.medida}
              onValueChange={(value) => handleChange('medida', value as "Kilogramos" | "Litros" | "Unidades")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar medida" />
              </SelectTrigger>
              <SelectContent>
                {["Kilogramos", "Litros", "Unidades"].map((measure) => (
                  <SelectItem key={measure} value={measure}>{measure}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Input
              id="stock"
              type="number"
              value={product.stock}
              onChange={(e) => handleChange('stock', Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="puntoReabastecimiento" className="text-right">
              Punto de Reabastecimiento
            </Label>
            <Input
              id="puntoReabastecimiento"
              type="number"
              value={product.puntoReabastecimiento}
              onChange={(e) => handleChange('puntoReabastecimiento', Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!product.nombre || !product.categoria || !product.medida || productExists || isSaving}>
            {isSaving ? "Guardando..." : (isNewProduct ? "Guardar" : "Guardar Cambios")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

ProductDialog.displayName = 'ProductDialog'

export default function ProductosPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [filterStatus, setFilterStatus] = useState<"Todo" | "En Stock" | "Bajo Stock" | "Sin Stock">("Todo")
  const [sortBy, setSortBy] = useState<keyof Product>("nombre")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Iniciando fetch de productos...')
      const response = await fetch("/api/products")
      console.log('Respuesta recibida:', response.status)
      //const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Error al cargar productos. Intenta nuevamente.")
      const data: Product[] = await response.json()
      setProducts(data)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = useMemo(() => {
    return products.filter(product => 
      (filterStatus === "Todo" || product.estado === filterStatus) &&
      (product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.categoria.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => (a[sortBy] < b[sortBy] ? -1 : 1))
  }, [products, filterStatus, searchQuery, sortBy])

  const handleAddProduct = async (newProduct: Omit<Product, '_id' | 'estado'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        throw new Error('Error al agregar el producto')
      }

      const addedProduct: Product = await response.json()
      setProducts(prevProducts => [...prevProducts, addedProduct])
      setShowAddProductDialog(false)
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      })
    } catch (error) {
      console.error('Error al agregar el producto:', error)
      toast({
        title: "Error",
        description: "No se pudo agregar el producto. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async (updatedProduct: Omit<Product, '_id' | 'estado'>) => {
    if (!currentProduct) return

    try {
      const response = await fetch(`/api/products/${currentProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el producto')
      }

      const editedProduct: Product = await response.json()
      setProducts(prevProducts => prevProducts.map(p => p._id === editedProduct._id ? editedProduct : p))
      setShowEditProductDialog(false)
      setCurrentProduct(null)
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      })
    } catch (error) {
      console.error('Error al actualizar el producto:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async () => {
    if (!currentProduct) return

    try {
      const response = await fetch(`/api/products/${currentProduct._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      setProducts(prevProducts => prevProducts.filter(p => p._id !== currentProduct._id))
      setShowDeleteProductDialog(false)
      setCurrentProduct(null)
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      })
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="Logo" width={32} height={32}/>
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
          <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[300px]"
            />
            <Button onClick={() => setShowAddProductDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </div>
        </div>
        <Tabs defaultValue="Todo" onValueChange={(value) => setFilterStatus(value as "Todo" | "En Stock" | "Bajo Stock" | "Sin Stock")}>
          <TabsList>
            {["Todo", "En Stock", "Bajo Stock", "Sin Stock"].map((status) => (
              <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
            ))}
          
          </TabsList>
        </Tabs>
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Ordenar por
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["nombre", "categoria", "stock"].map((field) => (
                <DropdownMenuItem key={field} onClick={() => setSortBy(field as keyof Product)}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {["Nombre", "Categoría", "Medida", "Stock", "Estado", "Punto de Reabastecimiento", "Acciones"].map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {!isLoading && !error && filteredProducts.length > 0 && (
              <TableBody>
                {currentItems.map((product) => (
                  <TableRow key={product._id}>
                    {(["nombre", "categoria", "medida", "stock", "estado", "puntoReabastecimiento"] as const).map((field) => (
                      <TableCell key={field}>{product[field]}</TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setCurrentProduct(product)
                            setShowEditProductDialog(true)
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setCurrentProduct(product)
                            setShowDeleteProductDialog(true)
                          }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
          {isLoading && <div>Cargando productos...</div>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
        <div className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) }, (_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
              className="mx-1"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>
      
      <ProductDialog
        isOpen={showAddProductDialog}
        onClose={() => setShowAddProductDialog(false)}
        onSave={handleAddProduct}
        initialProduct={{
          nombre: "",
          categoria: "",
          medida: "Kilogramos",
          stock: 0,
          puntoReabastecimiento: 10,
        }}
        isNewProduct={true}
        existingProducts={products}
      />

      <ProductDialog
        isOpen={showEditProductDialog}
        onClose={() => setShowEditProductDialog(false)}
        onSave={handleEditProduct}
        initialProduct={currentProduct ? {
          nombre: currentProduct.nombre,
          categoria: currentProduct.categoria,
          medida: currentProduct.medida,
          stock: currentProduct.stock,
          puntoReabastecimiento: currentProduct.puntoReabastecimiento,
        } : {
          nombre: "",
          categoria: "",
          medida: "Kilogramos",
          stock: 0,
          puntoReabastecimiento: 10,
        }}
        isNewProduct={false}
        existingProducts={products.filter(p => p._id !== currentProduct?._id)}
      />

      <Dialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <DialogContent aria-describedby="delete-dialog-description">
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
          
            <DialogDescription id="delete-dialog-description">
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar este producto?
            </DialogDescription>
          </DialogHeader>
          <p>¿Estás seguro de que quieres eliminar el producto &quot;{currentProduct?.nombre}&quot;?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteProductDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}