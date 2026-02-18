'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

const Dashboard = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant='h4' sx={{ mb: 2 }}>
              Noah - Church Management
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Bienvenido al sistema de gestion de iglesia. Los modulos estaran disponibles proximamente.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Dashboard
