"use client";
import { Box, Container, Typography, Link, Grid } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: "auto",
        backgroundColor: "#1E2022",
        color: "#C9D6DF",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>

          {/* 1. Kolon */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom color="white">
              ErdoCar
            </Typography>
            <Box sx={{ my: 2 }}>
              <img
                src="/logo.png"
                alt="ErdoCar Logo"
                style={{
                  height: '50px',
                  objectFit: 'contain',
                  opacity: 0.9
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Güvenli, hızlı ve konforlu araç kiralama deneyimi için doğru adres.
              7/24 destek hattımızla yanınızdayız.
            </Typography>
          </Grid>

          {/* 2. Kolon */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom color="white">
              Hızlı Linkler
            </Typography>
            <Link href="/" color="inherit" display="block" underline="hover">Ana Sayfa</Link>
            <Link href="/login" color="inherit" display="block" underline="hover">Giriş Yap</Link>
          </Grid>

          {/* 3. Kolon */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" gutterBottom color="white">
              İletişim
            </Typography>
            <Typography variant="body2">📍 İstanbul, Türkiye</Typography>
            <Typography variant="body2">📞 +90 555 123 45 67</Typography>
            <Typography variant="body2">📧 info@erdocar.com</Typography>
          </Grid>
        </Grid>

        <Box mt={5} textAlign="center">
          <Typography variant="body2" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} ErdoCar. Tüm hakları saklıdır.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}