'use client'

import { useState, useRef } from 'react'

import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'

export type ExportColumn = {
  header: string
  accessor: (row: Record<string, unknown>) => string | number | null | undefined
  width?: number // ancho en caracteres para Excel
}

type ExportButtonProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  columns: ExportColumn[]
  fileName: string
  title?: string // título para la cabecera del PDF
  disabled?: boolean
}

const ExportButton = ({ data, columns, fileName, title, disabled }: ExportButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [exporting, setExporting] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const buildRows = () =>
    data.map(row =>
      columns.map(col => {
        const val = col.accessor(row)

        return val === null || val === undefined ? '' : val
      })
    )

  const handleExcel = async () => {
    setExporting(true)
    handleClose()

    try {
      const XLSX = await import('xlsx')
      const { saveAs } = await import('file-saver')

      const headers = columns.map(c => c.header)
      const rows = buildRows()

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

      // Ancho de columnas
      ws['!cols'] = columns.map(col => ({ wch: col.width || Math.max(col.header.length, 14) }))

      const wb = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(wb, ws, title || 'Datos')

      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

      saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${fileName}.xlsx`)
    } catch (err) {
      console.error('Error exportando Excel:', err)
    } finally {
      setExporting(false)
    }
  }

  const handlePdf = async () => {
    setExporting(true)
    handleClose()

    try {
      const { default: jsPDF } = await import('jspdf')

      await import('jspdf-autotable')

      const doc = new jsPDF({ orientation: columns.length > 5 ? 'landscape' : 'portrait' })

      // Título
      doc.setFontSize(14)
      doc.text(title || fileName, 14, 18)

      // Fecha de generación
      doc.setFontSize(9)
      doc.setTextColor(120)
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 25)

      const headers = columns.map(c => c.header)
      const rows = buildRows()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [26, 26, 26], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 }
      })

      doc.save(`${fileName}.pdf`)
    } catch (err) {
      console.error('Error exportando PDF:', err)
    } finally {
      setExporting(false)
    }
  }

  const hasData = data.length > 0

  return (
    <>
      <Button
        ref={buttonRef}
        variant='outlined'
        color='secondary'
        startIcon={exporting ? <CircularProgress size={16} /> : <i className='ri-download-2-line' />}
        onClick={handleOpen}
        disabled={disabled || exporting || !hasData}
        size='small'
      >
        Exportar{data.length > 0 ? ` (${data.length})` : ''}
      </Button>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleExcel}>
          <ListItemIcon>
            <i className='ri-file-excel-2-line text-success' />
          </ListItemIcon>
          <ListItemText>Excel (.xlsx)</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePdf}>
          <ListItemIcon>
            <i className='ri-file-pdf-2-line text-error' />
          </ListItemIcon>
          <ListItemText>PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default ExportButton
