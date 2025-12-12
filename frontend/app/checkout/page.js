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
import Notification from "../components/Notification"; // Notification bileşenin varsa

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


    // Ödeme Simülasyonu ve Rezervasyon Onayı
    // frontend/app/checkout/page.js (Sadece handlePayment fonksiyonunu değiştir)

    // Ödeme Simülasyonu ve Rezervasyon Onayı
    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification({ open: false, message: '', severity: '' });

        // Basit kart doğrulama simülasyonu
        if (cardNumber.replace(/\s/g, '').length < 16 || !cardHolder || expiry.length < 5 || cvv.length < 3) {
            setLoading(false);
            setNotification({ open: true, message: "Lütfen kart bilgilerinizi eksiksiz doldurunuz.", severity: 'warning' });
            return;
        }

        // 1. Ödeme Başarılı Simülasyonu (2 saniye bekleme)
        await new Promise(resolve => setTimeout(resolve, 2000)); 

        const token = localStorage.getItem('token');
        
        // 🚨 KRİTİK KONTROL: Eğer token yoksa, kullanıcıyı zorla login'e at.
        if (!token) {
            setNotification({ open: true, message: "Oturum süreniz doldu. Lütfen tekrar giriş yapın.", severity: 'error' });
            setTimeout(() => router.push('/login'), 1500);
            return; 
        }

        try {
            // 2. Başarılı Ödeme Sonrası Rezervasyon İsteği
            await axios.post(`${API_URL}/reservations/`, {
                car_id: carId,
                start_date: startDate,
                end_date: endDate
            }, {
                headers: { 
                    Authorization: `Bearer ${token}` 
                }
            });

            // 3. Başarı Bildirimi ve Yönlendirme
            setNotification({ open: true, message: "Ödeme başarılı! Rezervasyonunuz onaylandı. 🎉", severity: 'success' });
            setTimeout(() => {
                router.push('/reservations');
            }, 1000);
            
        } catch (error) {
            // Rezervasyon sırasında hata oluşursa
            setLoading(false);
            const detail = error.response?.data?.detail || "Rezervasyon oluşturulamadı. Tarihler dolu olabilir.";
            
            // Eğer hata 401 ise, kullanıcıya tekrar giriş yapmasını söyle
            if (error.response?.status === 401) {
                setNotification({ open: true, message: "Oturum süreniz doldu veya yetkiniz yok. Lütfen tekrar giriş yapın.", severity: 'error' });
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setNotification({ open: true, message: `Hata: ${detail}`, severity: 'error' });
            }
        }
    };

    if (!car || !carId) return <Container sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Yükleniyor...</Typography>
    </Container>;

    return (
        <Container component="main" maxWidth="md" sx={{ py: 6 }}>
            <Notification {...notification} handleClose={() => setNotification({ ...notification, open: false })} />

            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1E2022' }}>
                Ödeme Sayfası (Iyzico Simülasyonu)
            </Typography>
            <Divider sx={{ mb: 4 }} />
            
            <Grid container spacing={4}>
                {/* SOL: ÖDEME FORMU */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                            Kart Bilgileri
                        </Typography>
                        
                        <form onSubmit={handlePayment}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Kart Üzerindeki İsim Soyisim"
                                    fullWidth
                                    required
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value)}
                                />
                                {/* KART NUMARASI (FORMATLI) */}
                                <TextField
                                    label="Kart Numarası"
                                    fullWidth
                                    required
                                    inputMode="numeric"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    inputProps={{ maxLength: 19 }} // 16 rakam + 3 boşluk
                                    InputProps={{ startAdornment: <CreditCardIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                                />
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {/* SON KULLANMA TARİHİ (FORMATLI) */}
                                    <TextField
                                        label="Son Kullanma Tarihi (AA/YY)"
                                        required
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiryDate(e.target.value))}
                                        inputProps={{ maxLength: 5 }} // AA/YY
                                        fullWidth
                                    />
                                    {/* CVV */}
                                    <TextField
                                        label="CVV"
                                        required
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                        inputProps={{ maxLength: 3 }}
                                        fullWidth
                                        InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                                    />
                                </Box>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    color="primary"
                                    disabled={loading}
                                    fullWidth 
                                    sx={{ py: 1.5, mt: 3, bgcolor: '#1E2022', '&:hover': { bgcolor: 'black' } }}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                                >
                                    {loading ? "Ödeme İşleniyor..." : `Ödemeyi Tamamla (${totalPrice} TL)`}
                                </Button>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Bu bir simülasyon ekranıdır. Gerçek bir kart bilgisi girmenize gerek yoktur.
                                </Alert>
                            </Stack>
                        </form>
                    </Paper>
                </Grid>

                {/* SAĞ: REZERVASYON ÖZETİ */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 3, bgcolor: '#F0F5F9' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                            Rezervasyon Özeti
                        </Typography>
                        <Stack spacing={1} divider={<Divider />}>
                            <Typography variant="body1">
                                🚗 **Araç:** {car.brand} {car.model}
                            </Typography>
                            <Typography variant="body1">
                                🗓️ **Başlangıç:** {startDate}
                            </Typography>
                            <Typography variant="body1">
                                🗓️ **Bitiş:** {endDate}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" color="primary">
                                💰 **Ödenecek Tutar:** {totalPrice} TL
                            </Typography>
                        </Stack>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <img src="/iyzico_logo.png" alt="Iyzico Güvenli Ödeme" style={{ height: '40px' }}/>
                            <Typography variant="caption" display="block" color="text.secondary">
                                Güvenli Ödeme Alt Yapısı
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}