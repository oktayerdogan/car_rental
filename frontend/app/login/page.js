// frontend/app/login/page.js
"use client";
import { useState } from "react";
import { TextField, Button, Box, Typography, Container, Paper } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/users/login", formData);
      
      // Token'ı kaydet
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);       // Rolü kaydet (admin/user)
      localStorage.setItem("user_id", response.data.user_id); // ID'yi kayde
      alert("Giriş Başarılı!");
      
      router.push("/");
    } catch (error) {
      alert("Giriş Başarısız! Email veya şifre hatalı.");
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Giriş Yap</Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth label="Email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField margin="normal" required fullWidth label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Giriş Yap</Button>
        </Box>
      </Paper>
    </Container>
  );
}