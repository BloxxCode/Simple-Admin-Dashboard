import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Transaccion } from "@/types"

interface TransactionsTableProps {
  transactions: Transaccion[]
}

export function TransactionsTable({ transactions = [] }: TransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Ensure transactions is an array
  const safeTransactions = Array.isArray(transactions) ? transactions : []

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = safeTransactions.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(safeTransactions.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Medida</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Costo Total</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Fecha de Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentTransactions.map((transaction, index) => (
            <TableRow key={transaction._id || index}>
              <TableCell>{transaction.nombre || 'N/A'}</TableCell>
              <TableCell>{transaction.categoria || 'N/A'}</TableCell>
              <TableCell>{transaction.medida || 'N/A'}</TableCell>
              <TableCell>${transaction.precio ? transaction.precio.toFixed(2) : 'N/A'}</TableCell>
              <TableCell>{transaction.cantidad || 'N/A'}</TableCell>
              <TableCell>${transaction.costoTotal ? transaction.costoTotal.toFixed(2) : 'N/A'}</TableCell>
              <TableCell>{transaction.proveedor || 'N/A'}</TableCell>
              <TableCell>{transaction.fechaRegistro ? new Date(transaction.fechaRegistro).toLocaleString() : 'Fecha no disponible'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              variant={currentPage === pageNumber ? "default" : "outline"}
              className="mx-1"
            >
              {pageNumber}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}