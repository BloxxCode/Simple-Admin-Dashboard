export interface Producto {
    _id: string
    nombre: string
    categoria: string
    medida: string
    stock: number
    puntoReabastecimiento: number
    estado: string
  }
  
  export interface Transaccion {
    _id: string
    nombre: string
    categoria: string
    medida: string
    precio: number
    cantidad: number
    costoTotal: number
    proveedor: string
    fechaRegistro: Date
  }