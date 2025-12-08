"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Button, Paper, Grid, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider } from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation'; 
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest'; 
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState(null);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/cars/${id}`)
      .then((res) => setCar(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleRentClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Araç kiralamak için önce giriş yapmalısınız!");
      router.push("/login");
    } else {
      setOpen(true);
    }
  };

  const handleConfirmReservation = async () => {
    const token = localStorage.getItem("token");
    try {
      const payload = {
        car_id: car.id,
        start_date: startDate,
        end_date: endDate
      };
      await axios.post("http://127.0.0.1:8000/reservations/", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("🎉 Rezervasyonunuz başarıyla oluşturuldu!");
      setOpen(false);
      router.push("/reservations"); 
    } catch (error) {
      alert("Hata: " + (error.response?.data?.detail || "Bir sorun oluştu."));
    }
  };

  if (!car) return <Typography sx={{p:5, textAlign: 'center'}}>Araç bilgileri yükleniyor...</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}> {/* maxWidth="md" yaparak tüm kutuyu biraz daralttık */}
      
      {/* ANA KART */}
      <Paper elevation={4} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Grid container>
          
          {/* SOL TARAF: RESİM (Ekranın %50'si) */}
          <Grid item xs={12} md={6} sx={{ position: 'relative', height: { xs: '300px', md: '500px' } }}>
            <img 
              src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80" 
              alt={`${car.brand} ${car.model}`}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', // Resmi kutuya sığdırır, taşanı keser
                display: 'block'
              }} 
            />
             {/* Durum Etiketi */}
            <Box sx={{ position: 'absolute', top: 15, left: 15 }}>
                <Chip 
                    label={car.is_available ? "Müsait" : "Kirada"} 
                    color={car.is_available ? "success" : "error"} 
                    sx={{ fontWeight: 'bold', boxShadow: 2 }} 
                />
            </Box>
          </Grid>
          
          {/* SAĞ TARAF: BİLGİLER (Ekranın %50'si) */}
          <Grid item xs={12} md={6} sx={{ p: 4, backgroundColor: '#F0F5F9', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* BAŞLIK */}
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E2022', lineHeight: 1.2 }}>
              {car.brand}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 400, color: '#52616B', mb: 2 }}>
              {car.model}
            </Typography>
            
            {/* FİYAT */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {car.price_per_day} TL
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ ml: 1, mt: 1 }}>
                    / Günlük
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />
            
            {/* ÖZELLİK KUTUCUKLARI */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon color="secondary" fontSize="small" />
                        <Typography variant="body2" fontWeight="bold">{car.year} Model</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalGasStationIcon color="secondary" fontSize="small" />
                        <Typography variant="body2">Dizel</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SettingsSuggestIcon color="secondary" fontSize="small" />
                        <Typography variant="body2">Otomatik</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedUserIcon color="success" fontSize="small" />
                        <Typography variant="body2">Kaskolu</Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* BUTON */}
            <Button 
                variant="contained" 
                size="large" 
                fullWidth 
                onClick={handleRentClick}
                disabled={!car.is_available}
                sx={{ 
                py: 1.5,
                fontWeight: 'bold',
                bgcolor: '#1E2022',
                '&:hover': { bgcolor: '#000000' }
                }}
            >
                {car.is_available ? "Kiralamayı Başlat" : "Araç Dolu"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* MODAL (Aynı) */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>🗓️ Tarih Seçimi</DialogTitle>
        <DialogContent>
          <Typography gutterBottom sx={{ mb: 3 }}>
            Lütfen kiralama tarihlerinizi giriniz.
          </Typography>
          <TextField label="Başlangıç" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <TextField label="Bitiş" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} sx={{ mt: 2 }}/>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Vazgeç</Button>
          <Button onClick={handleConfirmReservation} variant="contained" color="primary">
            Onayla
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}