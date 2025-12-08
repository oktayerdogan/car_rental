// frontend/app/reservations/page.js
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

    // Backend'deki "/me" endpointine istek atıyoruz
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
      // Başarılı olursa listeden silmek için sayfayı yenile veya state'i güncelle
      alert("Rezervasyon iptal edildi.");
      setReservations(reservations.filter((res) => res.id !== id));
    } catch (error) {
      alert("İptal edilirken hata oluştu.");
    }
  };

  return (
    <Container sx={{ py: 5 }}>
      <Typography variant="h4" gutterBottom>Rezervasyonlarım</Typography>
      
      {reservations.length === 0 ? (
        <Typography>Henüz bir rezervasyonunuz yok.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Rezervasyon ID</TableCell>
                <TableCell>Araç ID</TableCell>
                <TableCell>Başlangıç</TableCell>
                <TableCell>Bitiş</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>
                    <Chip label={`Araç #${row.car_id}`} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>{row.start_date}</TableCell>
                  <TableCell>{row.end_date}</TableCell>
                  <TableCell>
                    <Chip label="Aktif" color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <Button color="error" size="small" onClick={() => handleDelete(row.id)}>
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