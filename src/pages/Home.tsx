import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Layout from "../components/Layout";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../i18n/LanguageContext";
import { getRecord, LetrisRecord } from "../utils/letrisRecordState";

const ACCENT = "#e74c3c";
const CARD_BG = "#eb6f62";

export default function Home() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [record, setRecord] = useState<LetrisRecord | null>(null);

  useEffect(() => {
    setRecord(getRecord(currentLanguage));
  }, [currentLanguage]);

  useEffect(() => {
    const refresh = () => setRecord(getRecord(currentLanguage));
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [currentLanguage]);

  const nowHour = new Date().getHours();
  const greeting = nowHour < 12 ? t.greetingMorning : nowHour < 20 ? t.greetingAfternoon : t.greetingEvening;

  return (
    <Layout showFooter>
      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h2" sx={{
          color: "#fff", fontWeight: 700, letterSpacing: "1px",
          fontFamily: "Lobster, cursive", textAlign: "center", width: "100%",
        }}>
          {t.appName}
        </Typography>

        <Typography variant="h6" sx={{
          color: "rgba(255,255,255,0.64)", fontStyle: "italic",
          letterSpacing: "2px", textAlign: "center", fontSize: { xs: 18, md: 22 },
        }}>
          {t.tagline}
        </Typography>

        <Typography sx={{ color: "#ffe6e6", fontSize: 18, fontWeight: 600 }}>{greeting}</Typography>
        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>{t.readyToPlay}</Typography>

        {/* Récord */}
        <Box sx={{ width: "100%", borderRadius: "24px", backgroundColor: CARD_BG, p: 2, boxShadow: "0 12px 24px rgba(0,0,0,0.18)" }}>
          <Box sx={{
            width: "100%", borderRadius: "16px", backgroundColor: "#f3f3f3",
            p: 3, mb: 2, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 1, minHeight: 120,
          }}>
            <Typography sx={{ fontSize: 13, color: "#888", fontWeight: 700, textTransform: "uppercase" }}>
              {t.recordTitle}
            </Typography>
            {record ? (
              <>
                <Typography sx={{ fontSize: 42, fontWeight: 900, color: ACCENT, fontFamily: "monospace" }}>
                  {record.score}
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#999", textAlign: "center" }}>
                  {t.recordBody(record.score, record.wordsFound)}
                </Typography>
              </>
            ) : (
              <Typography sx={{ fontSize: 14, color: "#999", textAlign: "center" }}>{t.recordEmptyBody}</Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={() => navigate("/game")}
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: "28px !important" }} />}
              sx={{
                backgroundColor: "#fff", color: ACCENT, fontWeight: 800,
                borderRadius: 999, px: 3, py: 1.4, fontSize: 18,
                boxShadow: "0 0 0 4px rgba(255,255,255,0.35), 0 10px 24px rgba(0,0,0,0.4)",
                "&:hover": { backgroundColor: "#fff" },
              }}
            >
              {t.playButton}
            </Button>
          </Box>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>{t.whatIsTitle}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{t.whatIsBody}</Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>{t.howToPlayTitle}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{t.howToPlayBody}</Typography>
        </Box>
      </Box>

      <LanguageSelector />
    </Layout>
  );
}
