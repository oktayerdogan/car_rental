"use client";
import { useState, useEffect } from "react";
import {
    Fab, Badge, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, IconButton, Stack, Divider,
    List, ListItem, ListItemText, Paper, Chip, Alert
} from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function ChatButton() {
    const [open, setOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [myMessages, setMyMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [viewMode, setViewMode] = useState("send"); // "send" veya "history"

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        // Admin değilse ve giriş yapmışsa göster
        if (token && role !== "admin") {
            setIsLoggedIn(true);
        }
    }, []);

    const fetchMyMessages = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await axios.get(`${API_URL}/messages/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyMessages(res.data);
        } catch (err) {
            console.error("Mesajlar yüklenemedi:", err);
        }
    };

    const handleOpen = () => {
        setOpen(true);
        fetchMyMessages();
    };

    const handleClose = () => {
        setOpen(false);
        setSubject("");
        setContent("");
        setSuccess("");
        setError("");
    };

    const handleSendMessage = async () => {
        setError("");
        setSuccess("");

        if (!subject.trim() || !content.trim()) {
            setError("Lütfen konu ve mesaj alanlarını doldurun.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Mesaj göndermek için giriş yapmalısınız.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/messages/`, {
                subject: subject.trim(),
                content: content.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess("Mesajınız başarıyla gönderildi! ✅");
            setSubject("");
            setContent("");
            fetchMyMessages();
        } catch (err) {
            setError(err.response?.data?.detail || "Mesaj gönderilemedi.");
        } finally {
            setLoading(false);
        }
    };

    // Admin veya giriş yapmamış kullanıcılar için gösterme
    if (!isLoggedIn) return null;

    return (
        <>
            {/* FLOATING CHAT BUTTON */}
            <Fab
                color="primary"
                onClick={handleOpen}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    width: 64,
                    height: 64,
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 6px 25px rgba(102, 126, 234, 0.7)',
                    }
                }}
            >
                <ChatIcon sx={{ fontSize: 28 }} />
            </Fab>

            {/* CHAT DIALOG */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, minHeight: '500px' }
                }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatIcon />
                        <Typography variant="h6" fontWeight="bold">Satıcıya Mesaj</Typography>
                    </Box>
                    <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {/* TAB BUTONLARI */}
                    <Box sx={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        <Button
                            fullWidth
                            onClick={() => setViewMode("send")}
                            sx={{
                                py: 1.5,
                                borderRadius: 0,
                                bgcolor: viewMode === "send" ? '#f5f5f5' : 'white',
                                fontWeight: viewMode === "send" ? 'bold' : 'normal'
                            }}
                            startIcon={<SendIcon />}
                        >
                            Mesaj Gönder
                        </Button>
                        <Button
                            fullWidth
                            onClick={() => setViewMode("history")}
                            sx={{
                                py: 1.5,
                                borderRadius: 0,
                                bgcolor: viewMode === "history" ? '#f5f5f5' : 'white',
                                fontWeight: viewMode === "history" ? 'bold' : 'normal'
                            }}
                            startIcon={<QuestionAnswerIcon />}
                        >
                            Mesajlarım ({myMessages.length})
                        </Button>
                    </Box>

                    {viewMode === "send" ? (
                        /* MESAJ GÖNDERME FORMU */
                        <Box sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Konu"
                                    fullWidth
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Mesajınızın konusu..."
                                />
                                <TextField
                                    label="Mesajınız"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Mesajınızı buraya yazın..."
                                />

                                {error && <Alert severity="error">{error}</Alert>}
                                {success && <Alert severity="success">{success}</Alert>}

                                <Button
                                    variant="contained"
                                    onClick={handleSendMessage}
                                    disabled={loading}
                                    startIcon={<SendIcon />}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        py: 1.5,
                                        fontWeight: 'bold',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                                        }
                                    }}
                                >
                                    {loading ? "Gönderiliyor..." : "Mesaj Gönder"}
                                </Button>
                            </Stack>
                        </Box>
                    ) : (
                        /* MESAJ GEÇMİŞİ */
                        <Box sx={{ p: 2, maxHeight: '400px', overflowY: 'auto' }}>
                            {myMessages.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                    Henüz mesajınız bulunmuyor.
                                </Typography>
                            ) : (
                                <Stack spacing={2}>
                                    {myMessages.map((msg) => (
                                        <Paper key={msg.id} elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {msg.subject}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    icon={msg.reply ? <CheckCircleIcon /> : <AccessTimeIcon />}
                                                    label={msg.reply ? "Yanıtlandı" : "Bekliyor"}
                                                    color={msg.reply ? "success" : "warning"}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                {msg.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(msg.created_at).toLocaleString('tr-TR')}
                                            </Typography>

                                            {msg.reply && (
                                                <Box sx={{
                                                    mt: 2,
                                                    p: 2,
                                                    bgcolor: '#e8f5e9',
                                                    borderRadius: 2,
                                                    borderLeft: '4px solid #4caf50'
                                                }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                                                        Satıcı Yanıtı:
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {msg.reply}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(msg.replied_at).toLocaleString('tr-TR')}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
