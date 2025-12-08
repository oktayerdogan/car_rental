"use client";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "./theme"; // Oluşturduğumuz tema
import Footer from "./components/Footer"; // Oluşturduğumuz Footer
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline /> {/* Tarayıcı varsayılanlarını sıfırlar ve arka plan rengini verir */}
          
          {/* Sayfa yapısını dikey esnek kutu yapıyoruz ki Footer hep altta kalsın */}
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            
            {/* Sayfa İçeriği */}
            <Box component="main" sx={{ flexGrow: 1 }}>
              {children}
            </Box>

            {/* Footer Bileşeni */}
            <Footer />
            
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}