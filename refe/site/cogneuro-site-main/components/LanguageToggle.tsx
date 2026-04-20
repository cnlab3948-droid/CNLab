type Props = {
  lang: "ko" | "en";
  setLang: (v: "ko" | "en") => void;
};

export default function LanguageToggle({ lang, setLang }: Props) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button className={lang === "ko" ? "btn active" : "btn"} onClick={() => setLang("ko")}>
        KR
      </button>
      <button className={lang === "en" ? "btn active" : "btn"} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );
}
