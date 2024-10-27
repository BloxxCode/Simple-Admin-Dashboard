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
    fechaRegistro: string
  }

  export interface Cierre {
    _id: string; // O el tipo que uses
    fecha: Date;
    fechaRegistro: string;
    efectivo: number;
    visa: number;
    yape: number;
    total: number;
  };