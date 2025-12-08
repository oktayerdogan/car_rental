// frontend/app/theme.js
"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1E2022", // Kömür Siyahı (Ana renk, Navbar, Footer)
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#52616B", // Demir Grisi (İkincil butonlar)
      contrastText: "#ffffff",
    },
    info: {
      main: "#C9D6DF", // Açık Buz Mavisi (Vurgular)
      contrastText: "#1E2022",
    },
    background: {
      default: "#F0F5F9", // Sayfa Arka Planı (Çok açık gri)
      paper: "#ffffff",   // Kart içleri beyaz
    },
    text: {
      primary: "#1E2022", // Yazılar Kömür Siyahı
      secondary: "#52616B", // Alt yazılar Demir Grisi
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: "#1E2022" },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1E2022", // Navbar Rengi
          boxShadow: "none", // Daha düz, modern görünüm
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6, // Biraz daha keskin köşeler (Endüstriyel hava için)
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(30, 32, 34, 0.08)", // Çok hafif gölge
          border: "1px solid #C9D6DF", // Kartların etrafına ince buz mavisi çerçeve
        },
      },
    },
  },
});

export default theme;