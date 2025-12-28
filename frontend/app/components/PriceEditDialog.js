"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function PriceEditDialog({ open, car, onClose, onSuccess }) {
    const [newPrice, setNewPrice] = useState("");

    // car değiştiğinde fiyatı güncelle
    useEffect(() => {
        if (car && open) {
            setNewPrice(car.price_per_day?.toString() || "");
        }
    }, [car, open]);

    const handleClose = () => {
        setNewPrice("");
        onClose();
    };

    const handleUpdatePrice = async () => {
        if (!car || !newPrice) return;

        const token = localStorage.getItem("token");
        try {
            await axios.put(`${API_URL}/cars/${car.id}`,
                { price_per_day: parseFloat(newPrice) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`✅ ${car.brand} ${car.model} fiyatı ${newPrice} TL olarak güncellendi!`);
            setNewPrice("");
            onSuccess();
        } catch (error) {
            alert("Fiyat güncellenemedi: " + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ bgcolor: '#1E2022', color: 'white' }}>
                {car ? `${car.brand} ${car.model} - Fiyat Güncelle` : 'Fiyat Güncelle'}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Yeni Fiyat (TL/Gün)"
                    type="number"
                    fullWidth
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    sx={{ mt: 2 }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit">İptal</Button>
                <Button onClick={handleUpdatePrice} variant="contained" color="success">
                    Güncelle
                </Button>
            </DialogActions>
        </Dialog>
    );
}
