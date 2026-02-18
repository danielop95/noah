'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'
import type { ReportStats } from '@/app/server/reportActions'

type ReportStatsCardsProps = {
  stats: ReportStats
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const ReportStatsCards = ({ stats }: ReportStatsCardsProps) => {
  const cards = [
    {
      title: 'Total Reportes',
      value: stats.totalReports.toString(),
      icon: 'ri-file-list-3-line',
      color: 'primary' as const
    },
    {
      title: 'Total Asistentes',
      value: stats.totalAttendees.toLocaleString('es-CO'),
      icon: 'ri-group-line',
      color: 'success' as const
    },
    {
      title: 'Promedio Asistencia',
      value: stats.averageAttendees.toString(),
      icon: 'ri-bar-chart-line',
      color: 'info' as const
    },
    {
      title: 'Total Visitas',
      value: stats.totalVisitors.toLocaleString('es-CO'),
      icon: 'ri-user-add-line',
      color: 'warning' as const
    },
    {
      title: 'Total Ofrenda',
      value: formatCurrency(stats.totalOffering),
      icon: 'ri-hand-heart-line',
      color: 'secondary' as const
    }
  ]

  return (
    <Grid container spacing={6}>
      {cards.map((card, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card>
            <CardContent className='flex items-center justify-between gap-2'>
              <div className='flex flex-col items-start gap-1'>
                <Typography variant='h5'>{card.value}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {card.title}
                </Typography>
              </div>
              <CustomAvatar variant='rounded' skin='light' color={card.color} size={42}>
                <i className={card.icon} />
              </CustomAvatar>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default ReportStatsCards
