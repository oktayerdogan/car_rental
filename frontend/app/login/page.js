// frontend/app/login/page.js
"use client";
import { useState } from "react";
import { TextField, Button, Box, Typography, Container, Paper, Link } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";
import Notification from "../components/Notification";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  const router = useRouter();

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setNotification({ open: false, message: '', severity: '' });

    try {
      const payload = new URLSearchParams({
        username: email,
        password: password
      }).toString();

      const response = await axios.post("http://127.0.0.1:8000/auth/login", payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("user_id", response.data.user_id);

      setNotification({ open: true, message: "Giriş başarılı! Yönlendiriliyorsunuz...", severity: "success" });

      setTimeout(() => {
        router.push(response.data.role === "admin" ? "/admin" : "/");
      }, 500);

    } catch (error) {
      console.error("Login Hatası:", error);
      const errorMessage = error.response?.data?.detail || "Kullanıcı adı veya şifre hatalı.";
      setNotification({ open: true, message: errorMessage, severity: "error" });
    }
  };

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3 }}>
          <Typography component="h1" variant="h5" sx={{ fontWeight: 'bold' }}>Giriş Yap</Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }}>
            <TextField margin="normal" required fullWidth label="Email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5, bgcolor: '#1E2022', '&:hover': { bgcolor: 'black' } }}>
              Giriş Yap
            </Button>

            <Link href="/register" variant="body2" sx={{ display: 'block', textAlign: 'right' }}>
              Hesabın yok mu? Kayıt Ol
            </Link>
          </Box>
        </Paper>

        <Notification
          open={notification.open}
          message={notification.message}
          severity={notification.severity}
          handleClose={handleCloseNotification}
        />
      </Container>
    </>
  );
}