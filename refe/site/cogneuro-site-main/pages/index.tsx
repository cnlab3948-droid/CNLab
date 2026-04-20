import { useState } from "react";
import Layout from "../components/Layout";
import LanguageToggle from "../components/LanguageToggle";
import about from "../content/about.json";

export default function Home() {
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const title = lang === "ko" ? about.titleKo : about.titleEn;
  const body = lang === "ko" ? about.bodyKo : about.bodyEn;

  return (
    <Layout>
      <div className="pagehead">
        <h1>{title}</h1>
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>

      <article className="prose">
        <p>{body}</p>
      </article>

      <div className="note">
        <div className="muted">
        </div>
      </div>
    </Layout>
  );
}
