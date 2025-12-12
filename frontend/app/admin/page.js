"use client";
import { useEffect, useState } from "react";
// Importlar
import { Container, Typography, TextField, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Chip, Box, Stack, Divider, Alert, AppBar, Toolbar } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete'; 
import HomeIcon from '@mui/icons-material/Home'; // Ana Sayfa ikonu

const API_URL = "http://127.0.0.1:8000";

export default function AdminPage() {
    const [cars, setCars] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loadingReservations, setLoadingReservations] = useState(true);

    const router = useRouter();
    
    // --- ARAÇ FORM STATE ---
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [price, setPrice] = useState("");
    const [gear, setGear] = useState("Otomatik");
    const [fuel, setFuel] = useState("Benzin");
    const [selectedFiles, setSelectedFiles] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        
        if (!token || role !== "admin") {
            router.push("/");
            return;
        }
        
        fetchCars();
        fetchReservations(token); 
    }, [router]);

    // Diğer fonksiyonlar (fetchCars, fetchReservations, handleAddCar, handleDeleteCar, handleDeleteReservation) aynı kalır.
    // Ancak temizlik için Navbar'da çıkış yapma fonksiyonunu ekleyelim:

    const fetchCars = async () => {
        try {
            const res = await axios.get(`${API_URL}/cars/`);
            setCars(res.data);
        } catch (err) { console.error("Araç çekme hatası:", err); }
    };
    
    const fetchReservations = async (token) => {
        setLoadingReservations(true);
        try {
            const res = await axios.get(`${API_URL}/reservations/`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            setReservations(res.data);
        } catch (err) { 
            console.error("Rezervasyon çekme hatası:", err); 
        } finally {
            setLoadingReservations(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files);
    };

    const handleAddCar = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
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
            await axios.post(`${API_URL}/cars/`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            alert("✅ Araç başarıyla eklendi!");
            setBrand(""); setModel(""); setYear(""); setPrice(""); setSelectedFiles([]);
            fetchCars(); 
        } catch (error) {
            alert("Araç ekleme hatası: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleDeleteCar = async (id) => {
        if(!confirm("Bu aracı silmek istediğine emin misin?")) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${API_URL}/cars/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchCars();
        } catch(err) { alert("Silinemedi"); }
    };

    const handleDeleteReservation = async (id) => {
        if(!confirm(`Rezervasyon #${id} silmek istediğine emin misin?`)) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${API_URL}/reservations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Rezervasyon #${id} başarıyla silindi.`);
            fetchReservations(token); 
        } catch(err) { 
            alert("Rezervasyon silinemedi."); 
        }
    };
    
    // 👇 YENİ: Çıkış Yapma Fonksiyonu
    const handleLogout = () => {
        localStorage.clear();
        alert("Admin çıkışı yapıldı.");
        router.push("/");
    };

    if (typeof window !== 'undefined' && (localStorage.getItem("role") !== "admin" || !localStorage.getItem("token"))) {
        return <Typography sx={{p:5, textAlign: 'center'}}>Yetkiniz yok...</Typography>;
    }


    return (
        <>
        {/* 👇 YENİ: NAVBAR (AppBar) */}
        <AppBar position="static" sx={{ bgcolor: '#1E2022' }}>
            <Toolbar>
                
                {/* SOL: SADECE LOGO (Tıklaması Devre Dışı) */}
                <Box 
                    sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', cursor: 'default', gap: 1 }}
                >
                    <img 
                      src="/logo.png" 
                      alt="Rent A Car Logo"
                      style={{ height: '45px', objectFit: 'contain' }}
                    />
                    <Typography variant="h6" color="white" fontWeight="bold" sx={{ ml: 1 }}>
                        ADMİN PANELİ
                    </Typography>
                </Box>
                
                {/* SAĞ: ANA SAYFA VE ÇIKIŞ YAP BUTONLARI */}
                <Stack direction="row" spacing={2} alignItems="center">
                    
                    {/* ANA SAYFAYA DÖN BUTONU */}
                    <Button 
                        color="inherit" 
                        variant="outlined" 
                        startIcon={<HomeIcon />}
                        sx={{ borderRadius: '20px' }}
                        onClick={() => router.push('/')}
                    >
                        Ana Sayfa
                    </Button>
                    
                    {/* ÇIKIŞ YAP BUTONU */}
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleLogout}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Çıkış Yap
                    </Button>
                </Stack>

            </Toolbar>
        </AppBar>
        {/* 👆 NAVBAR SONU */}

        <Container sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1E2022' }}>
                Admin Paneli
            </Typography>

            {/* BÖLÜM 1: ARAÇ EKLEME FORMU */}
            <Paper elevation={3} sx={{ p: 4, mb: 5, backgroundColor: '#F0F5F9' }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>Yeni Araç Ekle</Typography>
                <form onSubmit={handleAddCar}>
                    
                    <Stack spacing={3}>
                        {/* 1. SATIR */}
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

            <Divider sx={{ mb: 5 }}/>

            {/* BÖLÜM 2: REZERVASYON YÖNETİMİ */}
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>Rezervasyon Yönetimi</Typography>
            
            {loadingReservations ? (
                <Typography>Rezervasyonlar yükleniyor...</Typography>
            ) : reservations.length === 0 ? (
                <Alert severity="info">Aktif rezervasyon bulunmamaktadır.</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: "#1E2022" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white" }}>ID</TableCell>
                                <TableCell sx={{ color: "white" }}>Müşteri E-mail</TableCell>
                                <TableCell sx={{ color: "white" }}>Araç</TableCell>
                                <TableCell sx={{ color: "white" }}>Tarihler</TableCell>
                                <TableCell sx={{ color: "white" }}>İşlem</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reservations.map((res) => (
                                <TableRow key={res.id}>
                                    <TableCell>{res.id}</TableCell>
                                    <TableCell>{res.user_email || `User #${res.user_id}`}</TableCell> 
                                    <TableCell>{res.car ? `${res.car.brand} ${res.car.model}` : `Car #${res.car_id}`}</TableCell>
                                    <TableCell>{res.start_date} - {res.end_date}</TableCell>
                                    <TableCell>
                                        <Button 
                                            size="small" 
                                            color="error" 
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteReservation(res.id)}
                                        >
                                            Sil
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Divider sx={{ mt: 5, mb: 3 }}/>

            {/* BÖLÜM 3: MEVCUT ARAÇLAR */}
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>Mevcut Araçlar</Typography>
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
        </>
    );
}