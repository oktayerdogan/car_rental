// frontend/app/page.js

"use client";
import { useEffect, useState } from "react";
import { Container, Card, CardMedia, CardContent, Typography, Button, Box, Grid, Chip } from "@mui/material";
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
    <Box sx={{
      position: 'relative',
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.25,
        zIndex: 0
      }
    }}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        {/* ARAÇ LİSTESİ */}
        <Container maxWidth="lg" sx={{ py: 5 }}>

          {/* FİLTRE TABLARI */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 4,
            gap: 2
          }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#333' }}>
              Araç Filosu
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<DirectionsCarIcon sx={{ fontSize: 18 }} />}
                label={`Tüm Araçlar (${totalCars})`}
                onClick={() => handleTabChange(null, 0)}
                sx={{
                  px: 1,
                  py: 2.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  bgcolor: activeTab === 0 ? '#3d4f5f' : 'white',
                  color: activeTab === 0 ? 'white' : '#666',
                  border: activeTab === 0 ? 'none' : '1px solid #ddd',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: activeTab === 0 ? '#4a5f6f' : '#f9f9f9'
                  },
                  '& .MuiChip-icon': {
                    color: activeTab === 0 ? 'white' : '#666'
                  }
                }}
              />
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                label={`Müsait (${availableCars})`}
                onClick={() => handleTabChange(null, 1)}
                sx={{
                  px: 1,
                  py: 2.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  bgcolor: activeTab === 1 ? '#2e7d6a' : 'white',
                  color: activeTab === 1 ? 'white' : '#666',
                  border: activeTab === 1 ? 'none' : '1px solid #ddd',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: activeTab === 1 ? '#3d9a84' : '#f9f9f9'
                  },
                  '& .MuiChip-icon': {
                    color: activeTab === 1 ? 'white' : '#666'
                  }
                }}
              />
              <Chip
                icon={<BlockIcon sx={{ fontSize: 18 }} />}
                label={`Kirada (${rentedCars})`}
                onClick={() => handleTabChange(null, 2)}
                sx={{
                  px: 1,
                  py: 2.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  bgcolor: activeTab === 2 ? '#c62828' : 'white',
                  color: activeTab === 2 ? 'white' : '#666',
                  border: activeTab === 2 ? 'none' : '1px solid #ddd',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: activeTab === 2 ? '#d32f2f' : '#f9f9f9'
                  },
                  '& .MuiChip-icon': {
                    color: activeTab === 2 ? 'white' : '#666'
                  }
                }}
              />
            </Box>
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
            <Grid container spacing={3}>
              {filteredCars.map((car) => (
                <Grid key={car.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: "all 0.2s ease",
                      position: 'relative',
                      borderRadius: 3,
                      bgcolor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
                      }
                    }}
                    onClick={() => router.push(`/cars/${car.id}`)}
                  >
                    {/* DURUM ETİKETİ */}
                    <Chip
                      icon={car.is_available ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <BlockIcon sx={{ fontSize: 14 }} />}
                      label={car.is_available ? "Müsait" : "Kirada"}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1,
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        bgcolor: car.is_available ? '#e8f5e9' : '#ffebee',
                        color: car.is_available ? '#2e7d32' : '#c62828',
                        border: 'none',
                        '& .MuiChip-icon': {
                          color: car.is_available ? '#2e7d32' : '#c62828'
                        }
                      }}
                    />

                    <CardMedia
                      component="img"
                      height="180"
                      image={car.image_url ? car.image_url : "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=500&q=60"}
                      alt={car.brand}
                      sx={{
                        objectFit: 'cover',
                        bgcolor: '#fafafa'
                      }}
                    />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: '#333' }}>
                        {car.brand} {car.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {car.year} Model • {car.gear_type || "Otomatik"}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                          {car.price_per_day} TL <Typography component="span" variant="body2" color="text.secondary">/ Gün</Typography>
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: '#ddd',
                            color: '#666',
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 2,
                            fontSize: '0.8rem',
                            '&:hover': {
                              borderColor: '#999',
                              bgcolor: '#f5f5f5'
                            }
                          }}
                        >
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
      </Box>
    </Box>
  );
}