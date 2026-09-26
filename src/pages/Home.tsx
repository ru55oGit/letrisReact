import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Layout from "../components/Layout";
import AdsenseScript from "../components/AdsenseScript";
import LanguageSelector from "../components/LanguageSelector";
import HowToPlayDemo from "../components/HowToPlayDemo";
import { useLanguage } from "../i18n/LanguageContext";
import { getRecord, LetrisRecord } from "../utils/letrisRecordState";
import { getDaysSinceLastPlayed } from "../utils/lastPlayedState";
import { markFromHub, cameFromHubBefore } from "../utils/hubOriginState";

const ACCENT = "#e74c3c";
const CARD_BG = "#eb6f62";

const HUB_URL = "https://www.boludeando.com/";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromHubParam = searchParams.get("from") === "boludeando";
  const [showHubHeader] = useState(() => fromHubParam || cameFromHubBefore());
  useEffect(() => {
    if (fromHubParam) markFromHub();
  }, [fromHubParam]);
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

  const daysSincePlayed = getDaysSinceLastPlayed();
  const nowHour = new Date().getHours();
  const timeGreeting = nowHour < 12 ? t.greetingMorning : nowHour < 20 ? t.greetingAfternoon : t.greetingEvening;
  const greeting =
    daysSincePlayed != null && daysSincePlayed > 1
      ? `${timeGreeting}, ${t.daysWithoutPlayingMessage(daysSincePlayed)}.`
      : timeGreeting;

  return (
    <Layout showFooter>
      <AdsenseScript />
      {showHubHeader && (
        <Box component="header" sx={{
          display: "flex", alignItems: "center",
          height: 80, px: 2, mt: -2,
          borderBottom: `2px solid ${ACCENT}`,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          width: "100%", position: "relative", zIndex: 10,
        }}>
          <Box component="a" href={HUB_URL} aria-label="Volver" sx={{ display: "flex", alignItems: "center" }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <path d="M26 6L14 19L26 32" stroke={ACCENT} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Box>
        </Box>
      )}
      <Box sx={{ width: "100%", px: { xs: 1.5, md: 2 }, pb: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
        </Box>

        <Typography sx={{ color: "#ffe6e6", fontSize: 18, fontWeight: 600 }}>{greeting}</Typography>
        <Typography sx={{ color: "#fff", fontSize: 24, fontWeight: 700, lineHeight: 1.4 }}>{t.readyToPlay}</Typography>

        {/* Card de juego: demo animada + botón Jugar */}
        <Box sx={{ width: "100%", borderRadius: "24px", backgroundColor: CARD_BG, p: 2, boxShadow: "0 12px 24px rgba(0,0,0,0.18)" }}>
          <Box sx={{
            width: "100%", borderRadius: "16px", backgroundColor: "#f3f3f3",
            p: 1.25, mb: 2,
          }}>
            <HowToPlayDemo />
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

        {/* Récord — box separado, como "Mejor Racha" en Enganchalo */}
        <Box sx={{ borderRadius: "16px", backgroundColor: "#fff", p: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#222", mb: 0.5 }}>
            {t.recordTitle}
          </Typography>
          {record ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography sx={{ fontSize: 42, fontWeight: 900, color: ACCENT, fontFamily: "monospace" }}>
                {record.score}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#888" }}>
                {t.recordScoreCaption(record.score)}
              </Typography>
              {record.wordsFound > 0 && (
                <Typography sx={{ fontSize: 13, color: "#888" }}>
                  {t.recordWordsCaption(record.wordsFound)}
                </Typography>
              )}
              {record.longestWord && (
                <Typography sx={{ fontSize: 13, color: "#888" }}>
                  {t.recordLongestWordCaption(record.longestWord)}
                </Typography>
              )}
              {record.words.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                  {record.words.map((word, i) => (
                    <Box key={i} sx={{
                      px: 1.5, py: 0.5, borderRadius: "6px",
                      backgroundColor: `${ACCENT}18`, border: `1px solid ${ACCENT}55`,
                    }}>
                      <Typography sx={{ color: ACCENT, fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
                        {word}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Typography sx={{ fontSize: 13, color: "#888" }}>{t.recordEmptyBody}</Typography>
          )}
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>{t.whatIsTitle}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{t.whatIsBody}</Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1 }}>{t.howToPlayTitle}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>{t.howToPlayBody}</Typography>
        </Box>

        <Box component="section" sx={{ backgroundColor: "rgba(0,0,0,0.18)", borderRadius: "24px", px: 2, py: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff", mb: 1.5 }}>{t.faqTitle}</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            {t.faq.map((item, i) => (
              <Box key={i}>
                <Typography sx={{ color: "#fff", fontWeight: 700, mb: 0.25 }}>{item.q}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontSize: 15 }}>
                  {item.a}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <LanguageSelector />
    </Layout>
  );
}
