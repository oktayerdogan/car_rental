"use client";
import { useEffect, useState } from "react";
import { Container, Grid, Card, CardMedia, CardContent, Typography, Button, AppBar, Toolbar, Box } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // 👑 YENİ: Admin mi?
  const [isClient, setIsClient] = useState(false); 

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    axios.get("http://127.0.0.1:8000/cars/")
      .then((res) => setCars(res.data))
      .catch((err) => console.error(err));

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // 👑 Rolü oku

    if (token) {
      setIsLoggedIn(true);
      if (role === "admin") { // Eğer rol admin ise
        setIsAdmin(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Token, role, id hepsini siler
    setIsLoggedIn(false);
    setIsAdmin(false);
    alert("Çıkış yapıldı.");
    router.refresh(); 
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Rent A Car</Typography>

          <Box>
            {isClient && (
              isLoggedIn ? (
                <>
                  {/* 👑 SADECE ADMIN GÖRSÜN */}
                  {isAdmin && (
                    <Button color="secondary" variant="contained" onClick={() => router.push("/admin")} sx={{ mr: 2 }}>
                      Admin Paneli
                    </Button>
                  )}

                  <Button color="inherit" onClick={() => router.push("/reservations")}>
                    Rezervasyonlarım
                  </Button>
                  <Button color="error" onClick={handleLogout} sx={{ ml: 2, bgcolor: 'white' }}>
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <Button color="inherit" onClick={() => router.push("/login")}>
                  Giriş Yap
                </Button>
              )
            )}
          </Box>

        </Toolbar>
      </AppBar>

      {/* ... (Aşağıdaki Araç Listesi kodları aynı, değişmedi) ... */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Tüm Araçlar</Typography>
        <Grid container spacing={4}>
          {cars.map((car) => (
            <Grid item key={car.id} xs={12} sm={6} md={4}>
              <Card 
                sx={{ height: '100%', cursor: 'pointer', transition: "0.3s", "&:hover": { transform: "scale(1.02)" } }}
                onClick={() => router.push(`/cars/${car.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image="https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=500&q=60" 
                  alt={car.brand}
                />
                <CardContent>
                  <Typography variant="h5">{car.brand} {car.model}</Typography>
                  <Typography color="text.secondary">{car.year} Model</Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">{car.price_per_day} TL / Gün</Typography>
                    <Button variant="outlined" size="small">İncele</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}