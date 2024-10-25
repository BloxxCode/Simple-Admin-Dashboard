import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getRecentTransactions } from "@/lib/api"; // Asegúrate de tener esta función en tu API

export function RecentSales() {
  const [recentSales, setRecentSales] = useState([]);

  // Función para obtener las transacciones del "Mercado"
  const fetchRecentSales = async () => {
    try {
      const transactions = await getRecentTransactions({ provider: "Mercado", limit: 5 });
      setRecentSales(transactions);
    } catch (error) {
      console.error("Error fetching recent sales:", error);
    }
  };

  useEffect(() => {
    // Llamar la función cuando el componente se monta
    fetchRecentSales();

    // Crear un intervalo que llame la función cada 30 segundos
    const intervalId = setInterval(fetchRecentSales, 60000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-8">
      {recentSales.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatars/0${index + 1}.png`} alt="Avatar" />
            <AvatarFallback>{sale.nombre.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.nombre}</p>
            <p className="text-sm text-muted-foreground">Cantidad: {sale.cantidad} ~ Precio: {sale.precio}</p>
          </div>
          <div className="ml-auto font-medium">$ {sale.costoTotal}</div>
        </div>
      ))}
    </div>
  );
}