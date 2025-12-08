"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Button, Paper, Grid, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState(null);
  
  // Modal (Pop-up) kontrolü için state'ler
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Arabayı Çek
  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/cars/${id}`)
      .then((res) => setCar(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  // Butona basınca çalışacak fonksiyon
  const handleRentClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Araç kiralamak için önce giriş yapmalısınız!");
      router.push("/login");
    } else {
      // Token varsa Modalı Aç
      setOpen(true);
    }
  };

  // Tarihleri seçip "Onayla"ya basınca çalışacak
  const handleConfirmReservation = async () => {
    const token = localStorage.getItem("token");

    try {
      // Backend'e gidecek veri
      const payload = {
        car_id: car.id,
        start_date: startDate,
        end_date: endDate
      };

      // İsteği gönder (Header'da Token ile beraber)
      await axios.post("http://127.0.0.1:8000/reservations/", payload, {
        headers: {
          Authorization: `Bearer ${token}` // 🔑 Anahtar kelime bu!
        }
      });

      alert("🎉 Rezervasyonunuz başarıyla oluşturuldu!");
      setOpen(false); // Modalı kapat
      router.push("/"); // Ana sayfaya dön (veya rezervasyonlarım sayfasına)

    } catch (error) {
      console.error(error);
      // Backend'den gelen hata mesajını göster (örn: "Tarihler dolu")
      alert("Hata: " + (error.response?.data?.detail || "Bir sorun oluştu."));
    }
  };

  if (!car) return <Typography sx={{p:5}}>Yükleniyor...</Typography>;

  return (
    <Container sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <img 
              src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80" 
              alt="Araba" 
              style={{ width: '100%', borderRadius: '10px' }} 
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom>{car.brand} {car.model}</Typography>
            <Chip label={car.is_available ? "Müsait" : "Kirada"} color={car.is_available ? "success" : "error"} sx={{ mb: 2 }} />
            <Typography variant="h5" color="text.secondary">Fiyat: {car.price_per_day} TL / Gün</Typography>
            <Typography sx={{ mt: 2 }}>{car.year} Model - Global Rent A Car Güvencesiyle.</Typography>
            
            <Box sx={{ mt: 4 }}>
               <Button 
                 variant="contained" 
                 size="large" 
                 fullWidth 
                 onClick={handleRentClick}
                 disabled={!car.is_available}
               >
                 {car.is_available ? "Tarih Seç ve Kirala" : "Bu Araç Dolu"}
               </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 👇 AÇILIR PENCERE (MODAL) KISMI */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Rezervasyon Tarihleri</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Lütfen aracı kiralamak istediğiniz tarihleri seçiniz.
          </Typography>
          
          <TextField
            label="Başlangıç Tarihi"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          
          <TextField
            label="Bitiş Tarihi"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">İptal</Button>
          <Button onClick={handleConfirmReservation} variant="contained" color="primary">
            Onayla ve Kirala
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}