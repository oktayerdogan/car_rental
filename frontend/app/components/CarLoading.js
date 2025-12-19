// frontend/app/components/CarLoading.js
"use client";
import { Box, Typography, Paper, keyframes } from "@mui/material";

// Araba hareket animasyonu
const carDrive = keyframes`
  0% {
    left: -60px;
  }
  100% {
    left: calc(100% + 60px);
  }
`;

// Tekerlek dönme animasyonu
const wheelSpin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Yol çizgisi animasyonu
const roadMove = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

export default function CarLoading({ message = "Yükleniyor...", subMessage = "" }) {
    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(8px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
        >
            {/* Kart */}
            <Paper
                elevation={10}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    background: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "320px",
                    maxWidth: "90%",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
                }}
            >
                {/* Yol container */}
                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        height: "50px",
                        background: "#424242",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.3)",
                    }}
                >
                    {/* Yol çizgileri */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            width: "200%",
                            height: "4px",
                            display: "flex",
                            gap: "30px",
                            transform: "translateY(-50%)",
                            animation: `${roadMove} 1s linear infinite`,
                        }}
                    >
                        {[...Array(20)].map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: "40px",
                                    height: "4px",
                                    background: "#FFD54F",
                                    borderRadius: "2px",
                                    flexShrink: 0,
                                }}
                            />
                        ))}
                    </Box>

                    {/* Araba */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: "8px",
                            left: "-60px",
                            animation: `${carDrive} 2.5s ease-in-out infinite`,
                        }}
                    >
                        {/* Araba gövdesi */}
                        <Box
                            sx={{
                                position: "relative",
                                width: "50px",
                                height: "18px",
                                background: "linear-gradient(180deg, #E53935 0%, #C62828 100%)",
                                borderRadius: "5px 5px 3px 3px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                "&::before": {
                                    content: '""',
                                    position: "absolute",
                                    width: "28px",
                                    height: "11px",
                                    background: "linear-gradient(180deg, #E53935 0%, #C62828 100%)",
                                    borderRadius: "8px 8px 0 0",
                                    top: "-9px",
                                    left: "10px",
                                },
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    width: "20px",
                                    height: "7px",
                                    background: "#64B5F6",
                                    borderRadius: "4px 4px 0 0",
                                    top: "-7px",
                                    left: "14px",
                                    opacity: 0.9,
                                },
                            }}
                        />

                        {/* Ön tekerlek */}
                        <Box
                            sx={{
                                position: "absolute",
                                width: "12px",
                                height: "12px",
                                background: "#212121",
                                borderRadius: "50%",
                                bottom: "-6px",
                                left: "6px",
                                border: "2px solid #757575",
                                animation: `${wheelSpin} 0.3s linear infinite`,
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    width: "4px",
                                    height: "4px",
                                    background: "#BDBDBD",
                                    borderRadius: "50%",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                },
                            }}
                        />

                        {/* Arka tekerlek */}
                        <Box
                            sx={{
                                position: "absolute",
                                width: "12px",
                                height: "12px",
                                background: "#212121",
                                borderRadius: "50%",
                                bottom: "-6px",
                                right: "6px",
                                border: "2px solid #757575",
                                animation: `${wheelSpin} 0.3s linear infinite`,
                                "&::after": {
                                    content: '""',
                                    position: "absolute",
                                    width: "4px",
                                    height: "4px",
                                    background: "#BDBDBD",
                                    borderRadius: "50%",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                },
                            }}
                        />
                    </Box>
                </Box>

                {/* Yükleniyor yazısı */}
                <Typography
                    variant="h6"
                    sx={{
                        mt: 3,
                        fontWeight: "bold",
                        color: "#1E2022",
                    }}
                >
                    {message}
                </Typography>

                {subMessage && (
                    <Typography
                        variant="body2"
                        sx={{
                            mt: 0.5,
                            color: "#666",
                        }}
                    >
                        {subMessage}
                    </Typography>
                )}

                {/* Nokta animasyonu */}
                <Box
                    sx={{
                        display: "flex",
                        gap: "6px",
                        mt: 2,
                    }}
                >
                    {[0, 1, 2].map((i) => (
                        <Box
                            key={i}
                            sx={{
                                width: "8px",
                                height: "8px",
                                background: "#1E2022",
                                borderRadius: "50%",
                                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                                "@keyframes bounce": {
                                    "0%, 80%, 100%": {
                                        transform: "scale(0.6)",
                                        opacity: 0.5,
                                    },
                                    "40%": {
                                        transform: "scale(1)",
                                        opacity: 1,
                                    },
                                },
                            }}
                        />
                    ))}
                </Box>
            </Paper>
        </Box>
    );
}
