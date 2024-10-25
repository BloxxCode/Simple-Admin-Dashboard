import { Transaccion } from "@/types"

  // Función para obtener las transacciones del proveedor "Mercado" del día
export const fetchTransaccionesDelDia = async () => {
    const response = await fetch('/api/total-today') // Llamamos al endpoint que creamos
    const data = await response.json()
    return data
  }

export async function searchProducts(query: string) {
  const response = await fetch(`/api/search-products?q=${query}`)
  if (!response.ok) {
    throw new Error('Failed to search products')
  }
  return await response.json()
}

export async function saveTransaction(transaction: Partial<Transaccion>, productoId: string): Promise<boolean> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction, productoId }), // Enviar objeto con transaction y productoId
  })
  return response.ok
}

export async function saveUsage(productoId: string, cantidadUsada: number): Promise<boolean> {
  const response = await fetch('/api/used', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productoId, cantidadUsada }),
  })
  return response.ok
}

export const fetchTransaccionesPorFecha = async (startDate?: string, endDate?: string, proveedor?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (proveedor) params.append('proveedor', proveedor);

  const response = await fetch(`/api/transactions-today?${params}`);
  const data = await response.json();
  console.log(data)
  return data;
};

export const getRecentTransactions = async ({ provider, limit }: { provider: string; limit: number }) => {
  try {
    const response = await fetch(`/api/transactions-by-provider?provider=${provider}&limit=${limit}`, { // Asegúrate de que esta ruta sea correcta
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener las transacciones recientes');
    }

    const transactions = await response.json();
    return transactions; // Devuelve los datos de las transacciones obtenidas
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return []; // Retorna un array vacío en caso de error
  }
};