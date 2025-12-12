// frontend/app/page.js

"use client";
import { useEffect, useState } from "react";
// Grid normal import edildi
import { Container, Card, CardMedia, CardContent, Typography, Button, AppBar, Toolbar, Box, Grid } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import Notification from "./components/Notification"; // 👈 YENİ IMPORT

export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false); 
  // 👇 YENİ STATE: Bildirimleri yönetmek için
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' }); 

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    axios.get("http://127.0.0.1:8000/cars/")
      .then((res) => setCars(res.data))
      .catch((err) => console.error(err));

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token) {
      setIsLoggedIn(true);
      if (role === "admin") {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    // 👇 ESKİ ALERT YERİNE: Snackbar ile bildirim göster
    setNotification({ open: true, message: "Çıkış başarılı!", severity: "success" });
    
    // Router yenilenmeden önce kullanıcının mesajı görmesi için kısa bir gecikme
    setTimeout(() => {
      router.refresh(); 
    }, 500); 
  };
  
  // Bildirimi kapatma fonksiyonu
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };


  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#1E2022' }}>
        <Toolbar sx={{ minHeight: '64px' }}>
          
          {/* 👇 LOGO ALANI */}
          <Box 
            onClick={() => router.push('/')}
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <Box sx={{ height: '55px', display: 'flex', alignItems: 'center' }}>
                <img 
                  src="/logo.png" 
                  alt="Rent A Car Logo"
                  style={{ height: '100%', objectFit: 'contain' }}
                />
            </Box>
          </Box>
          {/* 👆 LOGO ALANI SONU */}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {isClient && (
              isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Button variant="contained" color="warning" onClick={() => router.push("/admin")}>
                      Admin Paneli
                    </Button>
                  )}
                  <Button variant="contained" color="secondary" onClick={() => router.push("/reservations")} sx={{ color: '#ffffff' }}>
                    Rezervasyonlarım
                  </Button>
                  <Button 
                    variant="contained" color="error" onClick={handleLogout} 
                    sx={{ 
                      color: 'white', fontWeight: 'bold', transition: 'all 0.3s ease', 
                      '&:hover': { backgroundColor: '#d32f2f', transform: 'scale(1.1)', boxShadow: '0 0 15px rgba(255, 0, 0, 0.5)' }
                    }}
                  >
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => router.push("/register")}
                    sx={{ color: '#ffffff', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)', padding: '6px 20px', borderRadius: '50px', transition: '0.3s', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#ffffff' }}}
                  >
                    Kayıt Ol
                  </Button>
                  <Button 
                    variant="contained" onClick={() => router.push("/login")}
                    sx={{ backgroundColor: 'white', color: '#1E2022', fontWeight: 'bold', padding: '8px 20px', borderRadius: '50px', transition: '0.3s', '&:hover': { backgroundColor: '#f0f0f0', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(255,255,255,0.3)' }}}
                  >
                    Giriş Yap
                  </Button>
                </>
              )
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* ARAÇ LİSTESİ */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Tüm Araçlar
        </Typography>
        
        <Grid container spacing={4}>
          {cars.map((car) => (
            <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                sx={{ height: '100%', cursor: 'pointer', transition: "0.3s", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}}
                onClick={() => router.push(`/cars/${car.id}`)}
              >
                <CardMedia
                  component="img"
                  height="220"
                  image={car.image_url ? car.image_url : "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=500&q=60"} 
                  alt={car.brand}
                />
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {car.brand} {car.model}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {car.year} Model • {car.gear_type || "Otomatik"}
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {car.price_per_day} TL <Typography component="span" variant="body2" color="text.secondary">/ Gün</Typography>
                    </Typography>
                    <Button variant="outlined" size="small" color="secondary">
                      İncele
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* 👇 YENİ: NOTIFICATION BİLEŞENİ (Pop-up) */}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        handleClose={handleCloseNotification}
      />
    </>
  );
}