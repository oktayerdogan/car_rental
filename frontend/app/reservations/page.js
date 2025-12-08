"use client";
import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Backend'den rezervasyonları çek
    axios.get("http://127.0.0.1:8000/reservations/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => setReservations(res.data))
    .catch((err) => console.error(err));
  }, []);

  // İptal Butonu Fonksiyonu
  const handleDelete = async (id) => {
    if(!confirm("Rezervasyonu iptal etmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:8000/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Rezervasyon iptal edildi.");
      setReservations(reservations.filter((res) => res.id !== id));
    } catch (error) {
      alert("İptal edilirken hata oluştu.");
    }
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Rezervasyonlarım
      </Typography>
      
      {reservations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Henüz bir rezervasyonunuz yok.</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.push('/')}>
            Araçlara Göz At
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#1E2022" }}>
              <TableRow>
                {/* 🗑️ Rezervasyon ID sütunu buradan silindi */}
                <TableCell sx={{ color: "white" }}>Kiralanan Araç</TableCell>
                <TableCell sx={{ color: "white" }}>Başlangıç Tarihi</TableCell>
                <TableCell sx={{ color: "white" }}>Bitiş Tarihi</TableCell>
                <TableCell sx={{ color: "white" }}>Durum</TableCell>
                <TableCell sx={{ color: "white" }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((row) => (
                <TableRow key={row.id} hover>
                  {/* 🗑️ {row.id} verisi buradan silindi */}
                  
                  {/* 👇 TIKLANABİLİR ARAÇ BUTONU */}
                  <TableCell>
                    <Chip 
                      label={`Araç #${row.car_id} - İncele ↗`} 
                      color="info" 
                      variant="filled" 
                      onClick={() => router.push(`/cars/${row.car_id}`)} // Tıklayınca arabaya git
                      sx={{ 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        '&:hover': { opacity: 0.9, transform: 'scale(1.05)' }, // Hafif büyüme efekti
                        transition: '0.2s'
                      }} 
                    />
                  </TableCell>

                  <TableCell>{row.start_date}</TableCell>
                  <TableCell>{row.end_date}</TableCell>
                  <TableCell>
                    <Chip label="Aktif" color="success" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Button 
                      color="error" 
                      variant="outlined" 
                      size="small" 
                      onClick={() => handleDelete(row.id)}
                    >
                      İptal Et
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}