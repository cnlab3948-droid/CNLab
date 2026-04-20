import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import LanguageToggle from "../components/LanguageToggle";
import people from "../content/people.json";

export default function PeoplePage() {
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const sortedMembers = useMemo(() => {
    const members = [...people.members];
    members.sort((a: any, b: any) => {
      if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder; // 대학원생(1) → 학부생(2)
      return (a.nameKo || "").localeCompare(b.nameKo || "", "ko"); // 이름순
    });
    return members;
  }, []);

  const grads = sortedMembers.filter((m: any) => m.groupOrder === 1);
  const undergrads = sortedMembers.filter((m: any) => m.groupOrder === 2);

  return (
    <Layout>
      <div className="pagehead">
        <h1>People</h1>
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>

      <section className="section">
        <h2>{lang === "ko" ? "대학원생" : "Graduate Students"}</h2>
        <div className="grid">
          {grads.map((m: any) => (
            <div className="card" key={`${m.roleKo}-${m.nameKo}`}>
              <div className="cardTitle">{lang === "ko" ? m.nameKo : (m.nameEn || m.nameKo)}</div>
              <div className="muted">{lang === "ko" ? m.roleKo : m.roleEn}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{lang === "ko" ? "학부생" : "Undergraduate Students"}</h2>
        <div className="grid">
          {undergrads.map((m: any) => (
            <div className="card" key={`${m.roleKo}-${m.nameKo}`}>
              <div className="cardTitle">{lang === "ko" ? m.nameKo : (m.nameEn || m.nameKo)}</div>
              <div className="muted">{lang === "ko" ? m.roleKo : m.roleEn}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>PI</h2>
        <div className="card">
          <div className="cardTitle">{lang === "ko" ? people.pi.nameKo : (people.pi.nameEn || people.pi.nameKo)}</div>
          <div className="muted">{lang === "ko" ? (people.pi.titleKo || "PI") : (people.pi.titleEn || "PI")}</div>
        </div>
      </section>
    </Layout>
  );
}
