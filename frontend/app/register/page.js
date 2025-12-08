// frontend/app/register/page.js
"use client";
import { useState } from "react";
import { TextField, Button, Box, Typography, Container, Paper, Link } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Basit Doğrulama
    if (password !== confirmPassword) {
      alert("Şifreler birbiriyle uyuşmuyor!");
      return;
    }
    if (password.length < 4) {
      alert("Şifre en az 4 karakter olmalı.");
      return;
    }

    try {
      // 2. Backend'e İstek At (Kullanıcı Oluştur)
      await axios.post("http://127.0.0.1:8000/users/", {
        email: email,
        password: password,
        // role: "customer" // Backend varsayılan olarak customer atıyorsa gerek yok
      });

      alert("🎉 Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");
      router.push("/login"); // Giriş sayfasına yönlendir

    } catch (error) {
      console.error(error);
      alert("Kayıt başarısız: " + (error.response?.data?.detail || "Bir hata oluştu."));
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#1E2022' }}>
          Aramıza Katıl 🚀
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Hemen hesap oluştur, araçları kiralamaya başla.
        </Typography>

        <Box component="form" onSubmit={handleRegister} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Adresi"
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Şifre Tekrar"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', bgcolor: '#1E2022', '&:hover': { bgcolor: 'black' } }}
          >
            Kayıt Ol
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link href="/login" variant="body2" underline="hover">
                Zaten hesabın var mı? Giriş Yap
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

// Grid importunu unutmamak için (Material UI componentlerinden eklemen gerekebilir)
import { Grid } from "@mui/material";