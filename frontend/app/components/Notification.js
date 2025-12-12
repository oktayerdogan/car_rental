// frontend/app/components/Notification.js
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

// Bu bileşen, başarı veya hata mesajlarını ekranda pop-up olarak gösterir.
export default function Notification({ open, message, severity, handleClose }) {
  // severity: 'success', 'error', 'warning', 'info' olabilir

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={4000} // 4 saniye sonra otomatik kapanır
      onClose={handleClose} 
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Ekranın üst ortasında göster
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        sx={{ width: '100%', boxShadow: 3 }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}