"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Plus, FileDown, MoreHorizontal, Pencil, Trash2, ChevronDown } from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Product {
  _id: string
  nombre: string
  categoria: string
  medida: "Kilogramos" | "Litros" | "Unidades"
  estado: "En Stock" | "Bajo Stock" | "Sin Stock"
  stock: number
  puntoReabastecimiento: number
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filterStatus, setFilterStatus] = useState("Todo")
  const [sortBy, setSortBy] = useState("nombre")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddProductDialog, setShowAddProductDialog] = useState(false)
  const [showEditProductDialog, setShowEditProductDialog] = useState(false)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Omit<Product, '_id' | 'estado'>>({
    nombre: "",
    categoria: "",
    medida: "Kilogramos",
    stock: 0,
    puntoReabastecimiento: 10,
  })
  const [productExists, setProductExists] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const router = useRouter()

  useEffect(() => {
    // Fetch products from API
    // This is a placeholder. Replace with actual API call.
    const fetchProducts = async () => {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    let result = products

    // Apply status filter
    if (filterStatus !== "Todo") {
      result = result.filter(product => product.estado === filterStatus)
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(product => 
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoria.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortBy as keyof Product] < b[sortBy as keyof Product]) return -1
      if (a[sortBy as keyof Product] > b[sortBy as keyof Product]) return 1
      return 0
    })

    setFilteredProducts(result)
    setCurrentPage(1)
  }, [products, filterStatus, searchQuery, sortBy])

  const handleAddProduct = () => {
    if (products.some(p => p.nombre === newProduct.nombre)) {
      setProductExists(true)
      return
    }

    const product: Product = {
      _id: Date.now().toString(), // This is a temporary ID. The actual ID will be assigned by MongoDB.
      ...newProduct,
      estado: newProduct.stock === 0 ? "Sin Stock" : 
              newProduct.stock <= newProduct.puntoReabastecimiento ? "Bajo Stock" : "En Stock",
    }

    setProducts([...products, product])
    setShowAddProductDialog(false)
    setNewProduct({
      nombre: "",
      categoria: "",
      medida: "Kilogramos",
      stock: 0,
      puntoReabastecimiento: 10,
    })
    setProductExists(false)
  }

  const handleEditProduct = () => {
    if (!currentProduct) return

    const updatedProducts = products.map(p => 
      p._id === currentProduct._id ? { 
        ...currentProduct, 
        estado: currentProduct.stock === 0 ? "Sin Stock" : 
                currentProduct.stock <= currentProduct.puntoReabastecimiento ? "Bajo Stock" : "En Stock"
      } : p
    )

    setProducts(updatedProducts)
    setShowEditProductDialog(false)
    setCurrentProduct(null)
  }

  const handleDeleteProduct = () => {
    if (!currentProduct) return

    const updatedProducts = products.filter(p => p._id !== currentProduct._id)
    setProducts(updatedProducts)
    setShowDeleteProductDialog(false)
    setCurrentProduct(null)
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

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
            <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nombre" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      value={newProduct.nombre}
                      onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                      className={`col-span-3 ${productExists ? 'border-red-500' : ''}`}
                    />
                    {productExists && <p className="col-span-3 col-start-2 text-red-500 text-sm">Producto ya existe</p>}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="categoria" className="text-right">
                      Categoría
                    </Label>
                    <Input
                      id="categoria"
                      value={newProduct.categoria}
                      onChange={(e) => setNewProduct({...newProduct, categoria: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="medida" className="text-right">
                      Tipo de Medida
                    </Label>
                    <Select
                      value={newProduct.medida}
                      onValueChange={(value) => setNewProduct({...newProduct, medida: value as "Kilogramos" | "Litros" | "Unidades"})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Seleccionar medida" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kilogramos">Kilogramos</SelectItem>
                        <SelectItem value="Litros">Litros</SelectItem>
                        <SelectItem value="Unidades">Unidades</SelectItem>
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
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
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
                      value={newProduct.puntoReabastecimiento}
                      onChange={(e) => setNewProduct({...newProduct, puntoReabastecimiento: Number(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>Cancelar</Button>
                  <Button onClick={handleAddProduct} disabled={!newProduct.nombre || !newProduct.categoria || !newProduct.medida}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Tabs defaultValue="Todo" onValueChange={(value) => setFilterStatus(value)}>
          <TabsList>
            <TabsTrigger value="Todo">Todo</TabsTrigger>
            <TabsTrigger value="En Stock">En Stock</TabsTrigger>
            <TabsTrigger value="Bajo Stock">Bajo Stock</TabsTrigger>
            <TabsTrigger value="Sin Stock">Sin Stock</TabsTrigger>
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
              <DropdownMenuItem onClick={() => setSortBy("nombre")}>Nombre</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("categoria")}>Categoría</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("stock")}>Stock</DropdownMenuItem>
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
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Medida</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Punto de Reabastecimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.nombre}</TableCell>
                  <TableCell>{product.categoria}</TableCell>
                  <TableCell>{product.medida}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.estado}</TableCell>
                  <TableCell>{product.puntoReabastecimiento}</TableCell>
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
          </Table>
        </div>
        <div  className="flex justify-center mt-4">
          {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }, (_, i) => (
            <Button
              key={i}
              onClick={() => paginate(i + 1)}
              variant={currentPage === i + 1 ? "default" : "outline"}
              className="mx-1"
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={showEditProductDialog} onOpenChange={setShowEditProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          {currentProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="edit-nombre"
                  value={currentProduct.nombre}
                  onChange={(e) => setCurrentProduct({...currentProduct, nombre: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-categoria" className="text-right">
                  Categoría
                </Label>
                <Input
                  id="edit-categoria"
                  value={currentProduct.categoria}
                  onChange={(e) => setCurrentProduct({...currentProduct, categoria: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-medida" className="text-right">
                  Tipo de Medida
                </Label>
                <Select
                  value={currentProduct.medida}
                  onValueChange={(value) => setCurrentProduct({...currentProduct, medida: value as "Kilogramos" | "Litros" | "Unidades"})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar medida" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kilogramos">Kilogramos</SelectItem>
                    <SelectItem value="Litros">Litros</SelectItem>
                    <SelectItem value="Unidades">Unidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={currentProduct.stock}
                  onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-puntoReabastecimiento" className="text-right">
                  Punto de Reabastecimiento
                </Label>
                <Input
                  id="edit-puntoReabastecimiento"
                  type="number"
                  value={currentProduct.puntoReabastecimiento}
                  onChange={(e) => setCurrentProduct({...currentProduct, puntoReabastecimiento: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProductDialog(false)}>Cancelar</Button>
            <Button onClick={handleEditProduct}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={showDeleteProductDialog} onOpenChange={setShowDeleteProductDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que quieres eliminar el producto "{currentProduct?.nombre}"? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteProductDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}