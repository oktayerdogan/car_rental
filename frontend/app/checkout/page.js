// frontend/app/checkout/page.js
"use client";
import { useEffect, useState } from "react";
import {
    Container, Typography, Button, Paper, TextField,
    Box, Divider, Alert, CircularProgress,
    Grid, Stack
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from "axios";
import Notification from "../components/Notification";
import Navbar from "../components/Navbar";

const API_URL = "http://127.0.0.1:8000";

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(false);

    // 👇 GÜNCELLENMİŞ STATE'LER
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    const [notification, setNotification] = useState({ open: false, message: '', severity: '' });

    // URL'den gelen rezervasyon verileri
    const carId = searchParams.get('car_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const totalPrice = searchParams.get('total_price');

    // 💡 YENİ FONKSİYON 1: Kart Numarası Formatlama
    const formatCardNumber = (value) => {
        const cleanValue = value.replace(/\D/g, '');
        const formattedValue = cleanValue.match(/.{1,4}/g)?.join(' ') || '';
        return formattedValue.substring(0, 19); // 16 rakam + 3 boşluk
    };

    // 💡 YENİ FONKSİYON 2: Son Kullanma Tarihi Formatlama (AA/YY)
    const formatExpiryDate = (value) => {
        const cleanValue = value.replace(/\D/g, '');

        if (cleanValue.length >= 2) {
            // İlk 2 haneden sonra "/" ekle
            return `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`;
        }
        return cleanValue.substring(0, 2);
    };


    useEffect(() => {
        // Eksik veri kontrolü
        if (!carId || !startDate || !endDate || !totalPrice) {
            setNotification({ open: true, message: "Rezervasyon verisi eksik. Lütfen tekrar deneyin.", severity: 'error' });
            setTimeout(() => router.push('/'), 2000);
            return;
        }

        // Giriş Kontrolü
        if (!localStorage.getItem('token')) {
            router.push('/login');
            return;
        }

        // Araba detaylarını çek
        axios.get(`${API_URL}/cars/${carId}`)
            .then(res => setCar(res.data))
            .catch(() => {
                setNotification({ open: true, message: "Araç bilgileri yüklenemedi.", severity: 'error' });
                setTimeout(() => router.push('/'), 2000);
            });

    }, [carId, startDate, endDate, totalPrice, router]);


    // Ödeme ve Rezervasyon Onayı (Iyzico Entegrasyonu)
    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ open: false, message: '', severity: '' });

        // Basit kart doğrulama
        if (cardNumber.replace(/\s/g, '').length < 16 || !cardHolder || expiry.length < 5 || cvv.length < 3) {
            setLoading(false);
            setNotification({ open: true, message: "Lütfen kart bilgilerinizi eksiksiz doldurunuz.", severity: 'warning' });
            return;
        }

        const token = localStorage.getItem('token');

        if (!token) {
            setNotification({ open: true, message: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.", severity: 'error' });
            setTimeout(() => router.push('/login'), 1500);
            return;
        }

        // Son kullanma tarihini ay ve yıl olarak ayır (AA/YY formatından)
        const [expireMonth, expireYear] = expiry.split('/');
        const fullYear = expireYear ? `20${expireYear}` : '2030';

        try {
            // Iyzico Ödeme ile Rezervasyon İsteği
            const response = await axios.post(`${API_URL}/reservations/`, {
                car_id: parseInt(carId),
                start_date: startDate,
                end_date: endDate,
                payment_card: {
                    card_holder_name: cardHolder,
                    card_number: cardNumber.replace(/\s/g, ''),
                    expire_month: expireMonth,
                    expire_year: fullYear,
                    cvc: cvv
                }
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Başarı Bildirimi ve Yönlendirme
            const message = response.data?.message || "Ödeme başarılı! Rezervasyonunuz onaylandı. 🎉";
            setNotification({ open: true, message: message, severity: 'success' });
            setTimeout(() => {
                router.push('/reservations');
            }, 1500);

        } catch (error) {
            setLoading(false);
            const detail = error.response?.data?.detail || "Ödeme veya rezervasyon işlemi başarısız oldu.";

            if (error.response?.status === 401) {
                setNotification({ open: true, message: "Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.", severity: 'error' });
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setNotification({ open: true, message: `Hata: ${detail}`, severity: 'error' });
            }
        }
    };

    if (!car || !carId) return <>
        <Navbar />
        <Container sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
            <Typography>Yükleniyor...</Typography>
        </Container>
    </>;

    // Kiralama gün sayısını hesapla
    const rentalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

    return (
        <>
            <Navbar />
            <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
                <Notification {...notification} handleClose={() => setNotification({ ...notification, open: false })} />

                {/* Başlık */}
                <Box sx={{
                    background: 'linear-gradient(135deg, #1E2022 0%, #52616B 100%)',
                    borderRadius: 3,
                    p: 3,
                    mb: 4,
                    color: 'white'
                }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
                        💳 Güvenli Ödeme
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
                        Rezervasyonunuzu tamamlamak için kart bilgilerinizi girin
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* SOL: ÖDEME FORMU */}
                    <Grid item xs={12} md={7}>
                        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <CreditCardIcon sx={{ fontSize: 32, color: '#1E2022', mr: 1 }} />
                                <Typography variant="h5" fontWeight="bold">
                                    Kart Bilgileri
                                </Typography>
                            </Box>

                            <form onSubmit={handlePayment}>
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Kart Üzerindeki İsim Soyisim"
                                        fullWidth
                                        required
                                        value={cardHolder}
                                        onChange={(e) => setCardHolder(e.target.value)}
                                        placeholder="JOHN DOE"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                    <TextField
                                        label="Kart Numarası"
                                        fullWidth
                                        required
                                        inputMode="numeric"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        inputProps={{ maxLength: 19 }}
                                        placeholder="5528 7900 0000 0008"
                                        InputProps={{ startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                            label="Son Kullanma (AA/YY)"
                                            required
                                            value={expiry}
                                            onChange={(e) => setExpiry(formatExpiryDate(e.target.value))}
                                            inputProps={{ maxLength: 5 }}
                                            placeholder="12/30"
                                            fullWidth
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                        <TextField
                                            label="CVV"
                                            required
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                            inputProps={{ maxLength: 3 }}
                                            placeholder="123"
                                            fullWidth
                                            InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Box>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        fullWidth
                                        sx={{
                                            py: 2,
                                            mt: 2,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #1E2022 0%, #52616B 100%)',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #000 0%, #1E2022 100%)'
                                            }
                                        }}
                                        startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CheckCircleIcon />}
                                    >
                                        {loading ? "Ödeme İşleniyor..." : `${totalPrice} TL Öde`}
                                    </Button>
                                </Stack>
                            </form>

                            {/* Güvenlik Bilgisi */}
                            <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <LockIcon sx={{ color: '#4CAF50' }} />
                                <Typography variant="body2" color="text.secondary">
                                    256-bit SSL şifreleme ile güvenli ödeme. Kart bilgileriniz korunmaktadır.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* SAĞ: SİPARİŞ ÖZETİ */}
                    <Grid item xs={12} md={5}>
                        <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            {/* Araç Resmi */}
                            <Box sx={{
                                height: 180,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}>
                                {car.image_url ? (
                                    <img
                                        src={car.image_url}
                                        alt={`${car.brand} ${car.model}`}
                                        style={{
                                            maxHeight: '160px',
                                            maxWidth: '90%',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                                        }}
                                    />
                                ) : (
                                    <Typography variant="h1" sx={{ opacity: 0.5 }}>🚗</Typography>
                                )}
                            </Box>

                            {/* Detaylar */}
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {car.brand} {car.model}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {car.year} • {car.gear_type} • {car.fuel_type}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                {/* Tarih Bilgileri */}
                                <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Alış Tarihi</Typography>
                                        <Typography fontWeight="600">{startDate}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">İade Tarihi</Typography>
                                        <Typography fontWeight="600">{endDate}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Kiralama Süresi</Typography>
                                        <Typography fontWeight="600">{rentalDays} Gün</Typography>
                                    </Box>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                {/* Fiyat Detayları */}
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Günlük Ücret</Typography>
                                        <Typography>{car.price_per_day} TL</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Süre</Typography>
                                        <Typography>x {rentalDays} gün</Typography>
                                    </Box>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                {/* Toplam */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    bgcolor: '#1E2022',
                                    color: 'white',
                                    p: 2,
                                    borderRadius: 2,
                                    mx: -1
                                }}>
                                    <Typography variant="h6" fontWeight="bold">TOPLAM</Typography>
                                    <Typography variant="h5" fontWeight="bold">{totalPrice} TL</Typography>
                                </Box>

                                {/* Iyzico Logo */}
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <img src="/iyzico_logo.png" alt="Iyzico Güvenli Ödeme" style={{ height: '35px', opacity: 0.8 }} />
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                        iyzico güvencesiyle ödeme
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}