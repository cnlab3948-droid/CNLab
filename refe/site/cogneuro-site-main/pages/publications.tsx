import { useMemo, useState } from "react";
import Layout from "../components/Layout";
import LanguageToggle from "../components/LanguageToggle";
import pubs from "../content/publications.json";

export default function PublicationsPage() {
  const [lang, setLang] = useState<"ko" | "en">("ko");

  const journal = useMemo(() => {
    const items = [...pubs.journal];
    items.sort((a: any, b: any) => (b.year || 0) - (a.year || 0));
    return items;
  }, []);

  const conference = useMemo(() => {
    const items = [...pubs.conference];
    items.sort((a: any, b: any) => (b.year || 0) - (a.year || 0));
    return items;
  }, []);

  const oral = conference.filter((c: any) => c.type === "Oral");
  const poster = conference.filter((c: any) => c.type === "Poster");

  return (
    <Layout>
      <div className="pagehead">
        <h1>Publications</h1>
        <LanguageToggle lang={lang} setLang={setLang} />
      </div>

      <section className="section">
        <h2>{lang === "ko" ? "학술지 논문" : "Journal Articles"}</h2>
        {journal.length === 0 ? (
          <p className="muted">{lang === "ko" ? "추가된 항목이 없습니다." : "No items yet."}</p>
        ) : (
          <ol className="list">
            {journal.map((j: any, idx: number) => (
              <li key={`${j.year}-${idx}`}>
                {lang === "ko" && j.citationKo ? j.citationKo : j.citationEn}
                {j.link ? (
                  <>
                    {" "}— <a href={j.link} target="_blank" rel="noreferrer">Link</a>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="section">
        <h2>{lang === "ko" ? "학회 발표" : "Conference Presentations"}</h2>

        <h3>Oral</h3>
        {oral.length === 0 ? (
          <p className="muted">{lang === "ko" ? "추가된 항목이 없습니다." : "No items yet."}</p>
        ) : (
          <ul className="list">
            {oral.map((c: any, idx: number) => (
              <li key={`oral-${c.year}-${idx}`}>
                <strong>{lang === "ko" && c.titleKo ? c.titleKo : c.titleEn}</strong>{" "}
                ({c.year}). {c.authorsEn}. {c.venueEn}.
                {c.locationEn ? ` ${c.locationEn}.` : ""}
                {c.link ? (
                  <>
                    {" "}— <a href={c.link} target="_blank" rel="noreferrer">Link</a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <h3>Poster</h3>
        {poster.length === 0 ? (
          <p className="muted">{lang === "ko" ? "추가된 항목이 없습니다." : "No items yet."}</p>
        ) : (
          <ul className="list">
            {poster.map((c: any, idx: number) => (
              <li key={`poster-${c.year}-${idx}`}>
                <strong>{lang === "ko" && c.titleKo ? c.titleKo : c.titleEn}</strong>{" "}
                ({c.year}). {c.authorsEn}. {c.venueEn}.
                {c.locationEn ? ` ${c.locationEn}.` : ""}
                {c.link ? (
                  <>
                    {" "}— <a href={c.link} target="_blank" rel="noreferrer">Link</a>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}
