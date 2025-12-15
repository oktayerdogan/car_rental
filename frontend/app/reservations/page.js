"use client";
import { useEffect, useState } from "react";
import {
  Container, Typography, Paper, Button, Chip, Box, Grid,
  Stack, Divider, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:8000";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios.get(`${API_URL}/reservations/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setReservations(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [router]);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}/reservations/${deleteDialog.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(reservations.filter((res) => res.id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
    } catch (error) {
      alert("İptal edilirken hata oluştu.");
    }
  };

  // Gün sayısını hesapla
  const calculateDays = (start, end) => {
    return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  };

  // Durum kontrolü (geçmiş mi, aktif mi)
  const getStatus = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    if (end < today) return { label: 'Tamamlandı', color: 'default' };
    return { label: 'Aktif', color: 'success' };
  };

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Rezervasyonlar yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Başlık */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1E2022 0%, #52616B 100%)',
        borderRadius: 3,
        p: 3,
        mb: 4,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <EventAvailableIcon sx={{ fontSize: 40, color: 'white' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'white' }}>
              Rezervasyonlarım
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
              {reservations.length} aktif rezervasyon
            </Typography>
          </Box>
        </Box>
      </Box>

      {reservations.length === 0 ? (
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <DirectionsCarIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Henüz bir rezervasyonunuz yok
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Araçlarımıza göz atarak ilk rezervasyonunuzu yapın!
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/')}
            sx={{
              background: 'linear-gradient(135deg, #1E2022 0%, #52616B 100%)',
              borderRadius: 2,
              px: 4
            }}
          >
            Araçlara Göz At
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reservations.map((reservation) => {
            const status = getStatus(reservation.end_date);
            const days = calculateDays(reservation.start_date, reservation.end_date);
            const car = reservation.car;

            return (
              <Grid item xs={12} md={6} key={reservation.id}>
                <Paper
                  elevation={4}
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8
                    }
                  }}
                >
                  {/* Araç Resmi */}
                  <Box
                    sx={{
                      height: 160,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/cars/${reservation.car_id}`)}
                  >
                    {car?.image_url ? (
                      <img
                        src={car.image_url}
                        alt={`${car.brand} ${car.model}`}
                        style={{
                          maxHeight: '140px',
                          maxWidth: '90%',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                        }}
                      />
                    ) : (
                      <Typography variant="h1" sx={{ opacity: 0.5 }}>🚗</Typography>
                    )}

                    {/* Durum Badge */}
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  {/* Detaylar */}
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {car ? `${car.brand} ${car.model}` : `Araç #${reservation.car_id}`}
                    </Typography>

                    {car && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {car.year} • {car.gear_type} • {car.fuel_type}
                      </Typography>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    {/* Tarih Bilgileri */}
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {reservation.start_date} → {reservation.end_date}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={`${days} Gün`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                        {car && (
                          <Typography variant="body1" fontWeight="bold" color="primary">
                            {(days * car.price_per_day).toFixed(0)} TL
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Aksiyonlar */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => router.push(`/cars/${reservation.car_id}`)}
                        sx={{ borderRadius: 2 }}
                      >
                        Aracı Gör
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteDialog({ open: true, id: reservation.id })}
                        sx={{ borderRadius: 2 }}
                      >
                        İptal Et
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Rezervasyonu İptal Et</DialogTitle>
        <DialogContent>
          <Typography>
            Bu rezervasyonu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null })}
            sx={{ borderRadius: 2 }}
          >
            Vazgeç
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ borderRadius: 2 }}
          >
            İptal Et
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}