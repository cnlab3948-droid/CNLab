import { useState } from "react";
import Layout from "../components/Layout";
import LanguageToggle from "../components/LanguageToggle";
import research from "../content/research.json";

export default function ResearchPage() {
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const keywords = lang === "ko" ? research.keywordsKo : research.keywordsEn;

  return (
    <Layout>
      <div className="pagehead">
        <h1>Research</h1>
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>

      <section className="section">
        <h2>{lang === "ko" ? "연구 키워드" : "Keywords"}</h2>
        <div className="tags">
          {keywords.map((k: string) => (
            <span className="tag" key={k}>{k}</span>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{lang === "ko" ? "진행 중 프로젝트" : "Ongoing Projects"}</h2>
        {research.projects.length === 0 ? (
          <p className="muted">{lang === "ko" ? "현재 진행 중 프로젝트는 곧 업데이트될 예정입니다." : "Ongoing projects will be updated soon."}</p>
        ) : (
          <div className="grid">
            {research.projects.map((p: any) => (
              <div className="card" key={p.titleEn}>
                <div className="cardTitle">{lang === "ko" ? p.titleKo : p.titleEn}</div>
                <div className="small">{lang === "ko" ? p.summaryKo : p.summaryEn}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
