"use client";
import { useEffect, useState } from "react";
// Importlar (Box, Stack ve ikonlar)
import { Container, Typography, Button, Paper, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, IconButton, Stack, Rating, Alert, Avatar } from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import ChatButton from "../../components/ChatButton";

export default function CarDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [car, setCar] = useState(null);
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 👇 YORUM SİSTEMİ STATE'LERİ
    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/cars/${id}`)
            .then((res) => setCar(res.data))
            .catch((err) => console.error(err));

        // Yorumları getir
        fetchReviews();

        // Kullanıcı giriş yapmış mı kontrol et
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, [id]);

    const fetchReviews = () => {
        axios.get(`http://127.0.0.1:8000/reviews/car/${id}`)
            .then((res) => setReviews(res.data))
            .catch((err) => console.error("Yorumlar yüklenemedi:", err));
    };

    // 👇 YORUM GÖNDERME FONKSİYONU
    const handleSubmitReview = async () => {
        setReviewError("");
        setReviewSuccess("");

        if (newRating === 0) {
            setReviewError("Lütfen bir yıldız puanı seçin.");
            return;
        }
        if (!newComment.trim()) {
            setReviewError("Lütfen bir yorum yazın.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setReviewError("Yorum yapmak için giriş yapmalısınız.");
            return;
        }

        try {
            await axios.post("http://127.0.0.1:8000/reviews/", {
                car_id: parseInt(id),
                rating: newRating,
                comment: newComment.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReviewSuccess("Yorumunuz başarıyla eklendi! ✅");
            setNewRating(0);
            setNewComment("");
            fetchReviews(); // Yorumları yenile
        } catch (error) {
            const errorMessage = error.response?.data?.detail || "Yorum eklenirken bir hata oluştu.";
            setReviewError(errorMessage);
        }
    };

    // Slider Fonksiyonları
    const handleNextImage = () => {
        if (car.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
        }
    };

    const handlePrevImage = () => {
        if (car.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
        }
    };

    const defaultImage = "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80";

    const activeImage = car?.images && car.images.length > 0
        ? car.images[currentImageIndex].url
        : (car?.image_url || defaultImage);

    const handleRentClick = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Araç kiralamak için önce giriş yapmalısınız!");
            router.push("/login");
        } else {
            setOpen(true);
        }
    };

    const handleConfirmReservation = async () => {
        // 1. Tarih Kontrolleri
        if (!startDate || !endDate) {
            alert("Lütfen başlangıç ve bitiş tarihlerini seçin.");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            alert("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
            return;
        }

        // 2. Gün Sayısını ve Toplam Fiyatı Hesapla
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Fiyatı günlük fiyatla çarpıyoruz
        const totalPrice = (car.price_per_day * diffDays).toFixed(2);

        // 3. Ödeme Sayfasına Yönlendir
        router.push(`/checkout?car_id=${car.id}&start_date=${startDate}&end_date=${endDate}&total_price=${totalPrice}`);

        setOpen(false);
    };

    // Ortalama puan hesapla
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (!car) return <><Navbar /><Typography sx={{ p: 5, textAlign: 'center' }}>Araç bilgileri yükleniyor...</Typography></>;

    return (
        <>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 6 }}>

                {/* ANA KART (FLEX CONTAINER) */}
                <Paper elevation={5} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' }, // Küçük ekranda alt alta, büyükte yan yana
                            minHeight: { md: '550px' }
                        }}
                    >

                        {/* SOL TARAF: RESİM SLIDERI (60% Genişlik) */}
                        <Box
                            sx={{
                                position: 'relative',
                                width: { xs: '100%', md: '60%' },
                                height: { xs: '350px', md: 'auto' },
                                bgcolor: '#000',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <img
                                src={activeImage}
                                alt={`${car.brand} ${car.model}`}
                                style={{
                                    width: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    display: 'block'
                                }}
                            />

                            {/* Slider Butonları */}
                            {car.images && car.images.length > 1 && (
                                <>
                                    <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}>
                                        <ArrowBackIosIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={handleNextImage} sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'white' } }}>
                                        <ArrowForwardIosIcon fontSize="small" />
                                    </IconButton>
                                </>
                            )}

                            {/* Durum Etiketi */}
                            <Box sx={{ position: 'absolute', top: 15, left: 15 }}>
                                <Chip
                                    label={car.is_available ? "Müsait" : "Kirada"}
                                    color={car.is_available ? "success" : "error"}
                                    sx={{ fontWeight: 'bold', boxShadow: 2 }}
                                />
                            </Box>
                        </Box>

                        {/* SAĞ TARAF: BİLGİLER (40% Genişlik) */}
                        <Stack
                            spacing={3}
                            sx={{
                                p: 4,
                                backgroundColor: '#F0F5F9',
                                width: { xs: '100%', md: '40%' },
                                justifyContent: 'center'
                            }}
                        >

                            {/* BAŞLIK */}
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E2022', lineHeight: 1.2 }}>
                                    {car.brand}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 400, color: '#52616B' }}>
                                    {car.model}
                                </Typography>
                            </Box>

                            {/* ORTALAMA PUAN */}
                            {reviews.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Rating value={parseFloat(averageRating)} precision={0.1} readOnly size="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        {averageRating} ({reviews.length} değerlendirme)
                                    </Typography>
                                </Box>
                            )}

                            {/* FİYAT */}
                            <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                                <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {car.price_per_day} TL
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                                    / Günlük
                                </Typography>
                            </Box>

                            <Divider />

                            {/* ÖZELLİK KUTUCUKLARI (2'li düzen) */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>

                                {/* YIL */}
                                <Box sx={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'white', borderRadius: 2 }}>
                                    <CalendarTodayIcon color="secondary" fontSize="small" />
                                    <Stack>
                                        <Typography variant="caption" color="text.secondary">Yıl</Typography>
                                        <Typography variant="body2" fontWeight="bold">{car.year}</Typography>
                                    </Stack>
                                </Box>

                                {/* VİTES TİPİ */}
                                <Box sx={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'white', borderRadius: 2 }}>
                                    <SettingsSuggestIcon color="secondary" fontSize="small" />
                                    <Stack>
                                        <Typography variant="caption" color="text.secondary">Vites</Typography>
                                        <Typography variant="body2" fontWeight="bold">{car.gear_type || 'Belirtilmemiş'}</Typography>
                                    </Stack>
                                </Box>

                                {/* YAKIT TİPİ */}
                                <Box sx={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'white', borderRadius: 2 }}>
                                    <LocalGasStationIcon color="secondary" fontSize="small" />
                                    <Stack>
                                        <Typography variant="caption" color="text.secondary">Yakıt</Typography>
                                        <Typography variant="body2" fontWeight="bold">{car.fuel_type || 'Belirtilmemiş'}</Typography>
                                    </Stack>
                                </Box>

                                {/* GÜVENCE */}
                                <Box sx={{ flex: '1 1 45%', display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'white', borderRadius: 2 }}>
                                    <VerifiedUserIcon color="success" fontSize="small" />
                                    <Stack>
                                        <Typography variant="caption" color="text.secondary">Güvence</Typography>
                                        <Typography variant="body2" fontWeight="bold">Kaskolu</Typography>
                                    </Stack>
                                </Box>
                            </Box>

                            {/* KİRALA BUTONU */}
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleRentClick}
                                disabled={!car.is_available}
                                sx={{
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    bgcolor: '#1E2022',
                                    '&:hover': { bgcolor: '#000000' }
                                }}
                            >
                                {car.is_available ? "Tarih Seç ve Kirala" : "Araç Dolu"}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>

                {/* 👇 YORUM BÖLÜMÜ */}
                <Paper elevation={3} sx={{ mt: 4, p: 4, borderRadius: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarIcon color="warning" /> Kullanıcı Yorumları
                    </Typography>

                    {/* YORUM EKLEME FORMU */}
                    {isLoggedIn ? (
                        <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: '#F8F9FA', borderRadius: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Bu araç hakkında yorum yapın
                            </Typography>

                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2">Puanınız:</Typography>
                                <Rating
                                    value={newRating}
                                    onChange={(e, newValue) => setNewRating(newValue)}
                                    size="large"
                                />
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Deneyiminizi paylaşın..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                sx={{ mb: 2, bgcolor: 'white' }}
                            />

                            {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
                            {reviewSuccess && <Alert severity="success" sx={{ mb: 2 }}>{reviewSuccess}</Alert>}

                            <Button
                                variant="contained"
                                onClick={handleSubmitReview}
                                sx={{
                                    bgcolor: '#1E2022',
                                    '&:hover': { bgcolor: 'black' },
                                    fontWeight: 'bold'
                                }}
                            >
                                Yorum Gönder
                            </Button>
                        </Paper>
                    ) : (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Yorum yapmak için <Button size="small" onClick={() => router.push('/login')}>giriş yapın</Button>
                        </Alert>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    {/* YORUM LİSTESİ */}
                    {reviews.length === 0 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Bu araç için henüz yorum yapılmamış. İlk yorumu siz yapın! 🚗
                        </Typography>
                    ) : (
                        <Stack spacing={3}>
                            {reviews.map((review) => (
                                <Paper key={review.id} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: '#1E2022' }}>
                                            <PersonIcon />
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                    {review.user?.first_name && review.user?.last_name
                                                        ? `${review.user.first_name} ${review.user.last_name}`
                                                        : review.user?.email?.split('@')[0] || 'Anonim Kullanıcı'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(review.created_at).toLocaleDateString('tr-TR')}
                                                </Typography>
                                            </Box>
                                            <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {review.comment}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Paper>

                {/* MODAL */}
                <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
                    <DialogTitle sx={{ fontWeight: 'bold' }}>🗓️ Tarih Seçimi</DialogTitle>
                    <DialogContent>
                        <Typography gutterBottom sx={{ mb: 3 }}>
                            Lütfen kiralama tarihlerinizi giriniz.
                        </Typography>
                        <TextField
                            label="Başlangıç"
                            type="date"
                            fullWidth
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                min: (() => {
                                    const today = new Date();
                                    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                })()
                            }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <TextField
                            label="Bitiş"
                            type="date"
                            fullWidth
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{
                                min: startDate || (() => {
                                    const today = new Date();
                                    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                })()
                            }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setOpen(false)} color="inherit">Vazgeç</Button>
                        <Button onClick={handleConfirmReservation} variant="contained" color="primary">
                            Ödeme Ekranına Git 💳
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <ChatButton />
        </>
    );
}