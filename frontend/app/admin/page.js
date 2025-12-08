"use client";
import { useEffect, useState } from "react";
// 👇 DİKKAT: Burada 'Grid' yok! Sadece Stack ve Box var. Hata vermesi imkansız.
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Chip, Box, Stack } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function AdminPage() {
  const [cars, setCars] = useState([]);
  const router = useRouter();
  
  // --- FORM STATE ---
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [gear, setGear] = useState("Otomatik");
  const [fuel, setFuel] = useState("Benzin");
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/");
      return;
    }
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/cars/");
      setCars(res.data);
    } catch (err) { console.error(err); }
  };

  const handleFileChange = (e) => {
    console.log("Dosyalar seçildi:", e.target.files);
    setSelectedFiles(e.target.files);
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    console.log("🚀 İşlem başlıyor...");

    const token = localStorage.getItem("token");
    if (!token) {
      alert("HATA: Token yok! Çıkış yapıp tekrar gir.");
      return;
    }

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("model", model);
    formData.append("year", year);
    formData.append("price_per_day", price);
    formData.append("gear_type", gear);
    formData.append("fuel_type", fuel);

    if (selectedFiles && selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }
    }

    try {
      await axios.post("http://127.0.0.1:8000/cars/", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("✅ Araç başarıyla eklendi!");
      setBrand(""); setModel(""); setYear(""); setPrice(""); setSelectedFiles([]);
      fetchCars(); 
    } catch (error) {
      console.error("HATA:", error);
      alert("Hata: " + (error.response?.data?.detail || error.message));
    }
  };

  const handleDeleteCar = async (id) => {
    if(!confirm("Silmek istediğine emin misin?")) return;
    const token = localStorage.getItem("token");
    try {
        await axios.delete(`http://127.0.0.1:8000/cars/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchCars();
    } catch(err) { alert("Silinemedi"); }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1E2022' }}>
        Admin Paneli
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 5, backgroundColor: '#F0F5F9' }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">Yeni Araç Ekle</Typography>
        <form onSubmit={handleAddCar}>
          
          {/* 👇 GRID YERİNE STACK KULLANIYORUZ (Alt alta dizer) */}
          <Stack spacing={3}>
            
            {/* 1. SATIR (Yan Yana) */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField label="Marka" fullWidth required value={brand} onChange={(e)=>setBrand(e.target.value)} sx={{bgcolor:'white'}}/>
              <TextField label="Model" fullWidth required value={model} onChange={(e)=>setModel(e.target.value)} sx={{bgcolor:'white'}}/>
            </Box>

            {/* 2. SATIR */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <TextField label="Yıl" type="number" fullWidth required value={year} onChange={(e)=>setYear(e.target.value)} sx={{bgcolor:'white'}}/>
              <TextField label="Fiyat (TL)" type="number" fullWidth required value={price} onChange={(e)=>setPrice(e.target.value)} sx={{bgcolor:'white'}}/>
            </Box>

            {/* 3. SATIR */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                <TextField select label="Vites" fullWidth value={gear} onChange={(e)=>setGear(e.target.value)} sx={{bgcolor:'white'}}>
                    <MenuItem value="Otomatik">Otomatik</MenuItem>
                    <MenuItem value="Manuel">Manuel</MenuItem>
                </TextField>
                <TextField select label="Yakıt" fullWidth value={fuel} onChange={(e)=>setFuel(e.target.value)} sx={{bgcolor:'white'}}>
                    <MenuItem value="Benzin">Benzin</MenuItem>
                    <MenuItem value="Dizel">Dizel</MenuItem>
                    <MenuItem value="Elektrik">Elektrik</MenuItem>
                </TextField>
            </Box>

            {/* DOSYA YÜKLEME */}
            <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ height: '56px', bgcolor: 'white', borderStyle: 'dashed', color: '#555' }}
            >
                {selectedFiles.length > 0 ? `${selectedFiles.length} Dosya Seçildi` : "📸 Fotoğrafları Seç"}
                <input type="file" multiple hidden onChange={handleFileChange} />
            </Button>

            {/* KAYDET */}
            <Button type="submit" variant="contained" color="success" size="large" fullWidth sx={{ height: '56px', fontWeight: 'bold' }}>
              + Sisteme Kaydet
            </Button>

          </Stack>
        </form>
      </Paper>

      {/* LİSTE */}
      <Typography variant="h5" gutterBottom>Mevcut Araçlar</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#1E2022" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Kapak</TableCell>
              <TableCell sx={{ color: "white" }}>Araç</TableCell>
              <TableCell sx={{ color: "white" }}>Özellikler</TableCell>
              <TableCell sx={{ color: "white" }}>Fiyat</TableCell>
              <TableCell sx={{ color: "white" }}>Durum</TableCell>
              <TableCell sx={{ color: "white" }}>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.map((car) => (
              <TableRow key={car.id}>
                <TableCell>
                    {car.image_url ? (
                        <img src={car.image_url} alt="car" style={{width:'60px', height:'40px', objectFit:'cover', borderRadius:'4px'}}/>
                    ) : "-"}
                </TableCell>
                <TableCell>{car.brand} {car.model}</TableCell>
                <TableCell>
                  <Chip label={car.year} size="small" sx={{mr:0.5}}/>
                  <Chip label={car.gear_type} size="small" sx={{mr:0.5}}/>
                  <Chip label={car.fuel_type} size="small"/>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{car.price_per_day} TL</TableCell>
                <TableCell>
                   {car.is_available ? <Chip label="Müsait" color="success" size="small"/> : <Chip label="Kirada" color="error" size="small"/>}
                </TableCell>
                <TableCell>
                  <Button size="small" color="error" onClick={() => handleDeleteCar(car.id)}>Sil</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}