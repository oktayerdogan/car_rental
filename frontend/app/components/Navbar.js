"use client";
import { useEffect, useState } from "react";
import { AppBar, Toolbar, Box, Button, Stack, Badge, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Paper, Chip, IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import HomeIcon from '@mui/icons-material/Home';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import MailIcon from '@mui/icons-material/Mail';
import ReplyIcon from '@mui/icons-material/Reply';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // Admin mesaj state'leri
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [replyDialog, setReplyDialog] = useState({ open: false, message: null });
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        setIsClient(true);
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token) {
            setIsLoggedIn(true);
            if (role === "admin") {
                setIsAdmin(true);
                fetchMessages(token);
            }
        }
    }, []);

    // Mesajları getir (admin için)
    const fetchMessages = async (token) => {
        try {
            const res = await axios.get(`${API_URL}/messages/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);

            const unreadRes = await axios.get(`${API_URL}/messages/unread-count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(unreadRes.data.unread_count);
        } catch (err) {
            console.error("Mesaj çekme hatası:", err);
        }
    };

    // Mesaja yanıt ver
    const handleReply = async () => {
        if (!replyText.trim() || !replyDialog.message) return;

        const token = localStorage.getItem("token");
        try {
            await axios.put(`${API_URL}/messages/${replyDialog.message.id}/reply`, {
                reply: replyText.trim()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setReplyDialog({ open: false, message: null });
            setReplyText("");
            fetchMessages(token);
        } catch (err) {
            console.error("Yanıt hatası:", err);
        }
    };

    // Mesajı sil
    const handleDeleteMessage = async (messageId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${API_URL}/messages/${messageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMessages(token);
        } catch (err) {
            console.error("Mesaj silme hatası:", err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setIsAdmin(false);
        router.push("/");
    };

    return (
        <>
            <AppBar position="static" sx={{ bgcolor: '#1E2022' }}>
                <Toolbar sx={{ minHeight: '64px' }}>

                    {/* LOGO */}
                    <Box
                        onClick={() => router.push('/')}
                        sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    >
                        <Box sx={{ height: '55px', display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/logo.png"
                                alt="Rent A Car Logo"
                                style={{ height: '100%', objectFit: 'contain' }}
                            />
                        </Box>
                    </Box>

                    {/* BUTONLAR */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        {isClient && (
                            isLoggedIn ? (
                                <>
                                    {/* Ana Sayfa butonu */}
                                    <Button
                                        variant="contained"
                                        startIcon={<HomeIcon />}
                                        onClick={() => router.push('/')}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            borderRadius: '25px',
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                                            }
                                        }}
                                    >
                                        Ana Sayfa
                                    </Button>

                                    {/* Admin için butonlar */}
                                    {isAdmin && (
                                        <>
                                            {/* Kullanıcı Mesajları butonu */}
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    setMessagesOpen(true);
                                                    fetchMessages(localStorage.getItem("token"));
                                                }}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                    fontWeight: 'bold',
                                                    borderRadius: '25px',
                                                    px: 3,
                                                    py: 1,
                                                    textTransform: 'none',
                                                    boxShadow: '0 4px 15px rgba(56, 239, 125, 0.4)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px rgba(56, 239, 125, 0.6)'
                                                    }
                                                }}
                                            >
                                                <Badge badgeContent={unreadCount} color="error" sx={{ mr: 1 }}>
                                                    <MailIcon />
                                                </Badge>
                                                Mesajlar
                                            </Button>

                                            {/* Admin Paneli butonu */}
                                            <Button
                                                variant="contained"
                                                startIcon={<AdminPanelSettingsIcon />}
                                                onClick={() => router.push("/admin")}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                                    fontWeight: 'bold',
                                                    borderRadius: '25px',
                                                    px: 3,
                                                    py: 1,
                                                    textTransform: 'none',
                                                    boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 20px rgba(245, 87, 108, 0.6)'
                                                    }
                                                }}
                                            >
                                                Admin Paneli
                                            </Button>
                                        </>
                                    )}

                                    {/* Rezervasyonlarım butonu - sadece normal kullanıcılar için */}
                                    {!isAdmin && (
                                        <Button
                                            variant="contained"
                                            startIcon={<EventNoteIcon />}
                                            onClick={() => router.push("/reservations")}
                                            sx={{
                                                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                borderRadius: '25px',
                                                px: 3,
                                                py: 1,
                                                textTransform: 'none',
                                                boxShadow: '0 4px 15px rgba(56, 239, 125, 0.4)',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(56, 239, 125, 0.6)'
                                                }
                                            }}
                                        >
                                            Rezervasyonlarım
                                        </Button>
                                    )}

                                    {/* Çıkış Yap butonu */}
                                    <Button
                                        variant="contained"
                                        startIcon={<LogoutIcon />}
                                        onClick={handleLogout}
                                        sx={{
                                            background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            borderRadius: '25px',
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px rgba(235, 51, 73, 0.4)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #f45c43 0%, #eb3349 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(235, 51, 73, 0.6)'
                                            }
                                        }}
                                    >
                                        Çıkış Yap
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {/* Ana Sayfa butonu */}
                                    <Button
                                        variant="contained"
                                        startIcon={<HomeIcon />}
                                        onClick={() => router.push('/')}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            borderRadius: '25px',
                                            px: 3,
                                            py: 1,
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
                                            }
                                        }}
                                    >
                                        Ana Sayfa
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={() => router.push("/register")}
                                        sx={{
                                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            padding: '8px 24px',
                                            borderRadius: '25px',
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px rgba(56, 239, 125, 0.4)',
                                            transition: '0.3s',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #38ef7d 0%, #11998e 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(56, 239, 125, 0.6)'
                                            }
                                        }}
                                    >
                                        Kayıt Ol
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => router.push("/login")}
                                        sx={{
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            padding: '8px 24px',
                                            borderRadius: '25px',
                                            textTransform: 'none',
                                            boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
                                            transition: '0.3s',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 6px 20px rgba(245, 87, 108, 0.6)'
                                            }
                                        }}
                                    >
                                        Giriş Yap
                                    </Button>
                                </>
                            )
                        )}
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* MESAJLAR DIALOG (Admin için) */}
            <Dialog
                open={messagesOpen}
                onClose={() => setMessagesOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, minHeight: '500px' } }}
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MailIcon />
                        <Typography variant="h6" fontWeight="bold">Kullanıcı Mesajları</Typography>
                        {unreadCount > 0 && (
                            <Chip label={`${unreadCount} yeni`} size="small" sx={{ bgcolor: 'white', color: '#11998e', fontWeight: 'bold' }} />
                        )}
                    </Box>
                    <IconButton onClick={() => setMessagesOpen(false)} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 2, maxHeight: '500px', overflowY: 'auto' }}>
                    {messages.length === 0 ? (
                        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                            Henüz mesaj bulunmuyor.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {messages.map((msg) => (
                                <Paper
                                    key={msg.id}
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: msg.is_read ? 'white' : '#fff8e1',
                                        borderLeft: msg.reply ? '4px solid #4caf50' : '4px solid #ff9800'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {msg.user?.first_name} {msg.user?.last_name} ({msg.user?.email})
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5 }}>
                                                {msg.subject}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                {msg.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                {new Date(msg.created_at).toLocaleString('tr-TR')}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            size="small"
                                            icon={msg.reply ? <CheckCircleIcon /> : <AccessTimeIcon />}
                                            label={msg.reply ? "Yanıtlandı" : "Bekliyor"}
                                            color={msg.reply ? "success" : "warning"}
                                        />
                                    </Box>

                                    {msg.reply && (
                                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                                                Yanıtınız:
                                            </Typography>
                                            <Typography variant="body2">{msg.reply}</Typography>
                                        </Box>
                                    )}

                                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                        {!msg.reply && (
                                            <Button
                                                size="small"
                                                variant="contained"
                                                startIcon={<ReplyIcon />}
                                                onClick={() => {
                                                    setReplyDialog({ open: true, message: msg });
                                                    setMessagesOpen(false);
                                                }}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    textTransform: 'none'
                                                }}
                                            >
                                                Yanıtla
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteMessage(msg.id)}
                                        >
                                            Sil
                                        </Button>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>

            {/* YANITLA DIALOG */}
            <Dialog
                open={replyDialog.open}
                onClose={() => {
                    setReplyDialog({ open: false, message: null });
                    setMessagesOpen(true);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReplyIcon />
                        Mesaja Yanıt Ver
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {replyDialog.message && (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Gönderen: {replyDialog.message.user?.first_name} {replyDialog.message.user?.last_name}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                                {replyDialog.message.subject}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {replyDialog.message.content}
                            </Typography>
                        </Box>
                    )}
                    <TextField
                        label="Yanıtınız"
                        fullWidth
                        multiline
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Kullanıcıya yanıtınızı yazın..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => {
                        setReplyDialog({ open: false, message: null });
                        setMessagesOpen(true);
                    }}>
                        İptal
                    </Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            await handleReply();
                            setMessagesOpen(true);
                        }}
                        disabled={!replyText.trim()}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        Yanıt Gönder
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
