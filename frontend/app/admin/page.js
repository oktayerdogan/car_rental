"use client";
import { useEffect, useState } from "react";
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [cars, setCars] = useState([]);
  const router = useRouter();
  
  // Yeni araç ekleme formu için state'ler
  const [newCar, setNewCar] = useState({
    brand: "",
    model: "",
    year: "",
    price_per_day: ""
  });

  // Sayfa açılınca çalışacaklar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // 1. Güvenlik Kontrolü: Admin değilse içeri sokma!
    if (!token || role !== "admin") {
      alert("Bu sayfaya erişim yetkiniz yok!");
      router.push("/");
      return;
    }

    // 2. Arabaları Çek
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/cars/");
      setCars(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🚗 ARAÇ EKLEME FONKSİYONU
  const handleAddCar = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post("http://127.0.0.1:8000/cars/", newCar, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Araç başarıyla eklendi!");
      setNewCar({ brand: "", model: "", year: "", price_per_day: "" }); // Formu temizle
      fetchCars(); // Listeyi yenile
    } catch (error) {
      alert("Hata oluştu: " + error.response?.data?.detail);
    }
  };

  // 🗑️ ARAÇ SİLME FONKSİYONU
  const handleDeleteCar = async (id) => {
    if (!confirm("Bu aracı silmek istediğinize emin misiniz?")) return;
    
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:8000/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Araç silindi.");
      fetchCars(); // Listeyi yenile
    } catch (error) {
      alert("Silinirken hata oluştu.");
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        Admin Yönetim Paneli
      </Typography>

      {/* --- BÖLÜM 1: YENİ ARAÇ EKLEME FORMU --- */}
      <Paper elevation={3} sx={{ p: 3, mb: 5, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom>Yeni Araç Ekle</Typography>
        <form onSubmit={handleAddCar}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <TextField label="Marka" fullWidth required 
                value={newCar.brand} onChange={(e) => setNewCar({...newCar, brand: e.target.value})} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Model" fullWidth required 
                value={newCar.model} onChange={(e) => setNewCar({...newCar, model: e.target.value})} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Yıl" type="number" fullWidth required 
                value={newCar.year} onChange={(e) => setNewCar({...newCar, year: e.target.value})} />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField label="Günlük Fiyat (TL)" type="number" fullWidth required 
                value={newCar.price_per_day} onChange={(e) => setNewCar({...newCar, price_per_day: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="success" fullWidth size="large">
                + Aracı Sisteme Kaydet
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* --- BÖLÜM 2: MEVCUT ARAÇ LİSTESİ --- */}
      <Typography variant="h5" gutterBottom>Mevcut Araçlar</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#212121" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>ID</TableCell>
              <TableCell sx={{ color: "white" }}>Marka & Model</TableCell>
              <TableCell sx={{ color: "white" }}>Yıl</TableCell>
              <TableCell sx={{ color: "white" }}>Fiyat</TableCell>
              <TableCell sx={{ color: "white" }}>Durum</TableCell>
              <TableCell sx={{ color: "white" }}>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>{car.id}</TableCell>
                <TableCell>{car.brand} {car.model}</TableCell>
                <TableCell>{car.year}</TableCell>
                <TableCell>{car.price_per_day} TL</TableCell>
                <TableCell>{car.is_available ? "Müsait" : "Kirada"}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteCar(car.id)}>
                    Sil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}