// frontend/app/page.js

"use client";
import { useEffect, useState } from "react";
import { Container, Card, CardMedia, CardContent, Typography, Button, Box, Grid, Chip, Tabs, Tab } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import Notification from "./components/Notification";
import Navbar from "./components/Navbar";
import ChatButton from "./components/ChatButton";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';

export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0: Tüm, 1: Müsait, 2: Kirada
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });

  const router = useRouter();

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/cars/")
      .then((res) => {
        setCars(res.data);
        setFilteredCars(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Tab değiştiğinde araçları filtrele
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);

    if (newValue === 0) {
      // Tüm Araçlar
      setFilteredCars(cars);
    } else if (newValue === 1) {
      // Müsait Araçlar
      setFilteredCars(cars.filter(car => car.is_available === true));
    } else if (newValue === 2) {
      // Kirada Olan Araçlar
      setFilteredCars(cars.filter(car => car.is_available === false));
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Sayıları hesapla
  const totalCars = cars.length;
  const availableCars = cars.filter(car => car.is_available === true).length;
  const rentedCars = cars.filter(car => car.is_available === false).length;

  return (
    <>
      <Navbar />

      {/* ARAÇ LİSTESİ */}
      <Container sx={{ py: 6 }}>

        {/* FİLTRE TABLARI */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 4,
          gap: 2
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Araç Filosu
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: '48px',
                borderRadius: '25px',
                mx: 0.5,
                transition: 'all 0.3s ease',
              },
              '& .Mui-selected': {
                color: '#fff !important',
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              }
            }}
          >
            <Tab
              icon={<DirectionsCarIcon />}
              iconPosition="start"
              label={`Tüm Araçlar (${totalCars})`}
              sx={{
                bgcolor: activeTab === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
                background: activeTab === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
                color: activeTab === 0 ? 'white' : '#666',
                '&:hover': { bgcolor: activeTab === 0 ? '' : '#e0e0e0' }
              }}
            />
            <Tab
              icon={<CheckCircleIcon />}
              iconPosition="start"
              label={`Müsait (${availableCars})`}
              sx={{
                bgcolor: activeTab === 1 ? '' : '#f5f5f5',
                background: activeTab === 1 ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : '#f5f5f5',
                color: activeTab === 1 ? 'white' : '#666',
                '&:hover': { bgcolor: activeTab === 1 ? '' : '#e0e0e0' }
              }}
            />
            <Tab
              icon={<BlockIcon />}
              iconPosition="start"
              label={`Kirada (${rentedCars})`}
              sx={{
                bgcolor: activeTab === 2 ? '' : '#f5f5f5',
                background: activeTab === 2 ? 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' : '#f5f5f5',
                color: activeTab === 2 ? 'white' : '#666',
                '&:hover': { bgcolor: activeTab === 2 ? '' : '#e0e0e0' }
              }}
            />
          </Tabs>
        </Box>

        {/* ARAÇ KARTLARI */}
        {filteredCars.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DirectionsCarIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Bu kategoride araç bulunamadı
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {filteredCars.map((car) => (
              <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: "0.3s",
                    position: 'relative',
                    "&:hover": { transform: "translateY(-5px)", boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }
                  }}
                  onClick={() => router.push(`/cars/${car.id}`)}
                >
                  {/* DURUM ETİKETİ */}
                  <Chip
                    icon={car.is_available ? <CheckCircleIcon /> : <BlockIcon />}
                    label={car.is_available ? "Müsait" : "Kirada"}
                    color={car.is_available ? "success" : "error"}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1,
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  />

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
        )}
      </Container>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        handleClose={handleCloseNotification}
      />

      <ChatButton />
    </>
  );
}