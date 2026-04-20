import fs from "fs";
import path from "path";

type NewsItem = {
  title: string;
  date: string;
  content: string;
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "content/news.json");

  let news: NewsItem[] = [];
  if (fs.existsSync(filePath)) {
    news = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  // 최신순 정렬(문자열 날짜가 YYYY-MM-DD 같은 형식이면 잘 정렬됨)
  news.sort((a, b) => (a.date < b.date ? 1 : -1));

  return { props: { news } };
}

export default function NewsPage({ news }: { news: NewsItem[] }) {
  return (
    <div>
      <h1>News</h1>
      {news.length === 0 ? (
        <p>No news yet.</p>
      ) : (
        <div style={{ marginTop: 24 }}>
          {news.map((item, idx) => (
            <article key={idx} style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 6 }}>{item.title}</h3>
              <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 10 }}>
                {item.date}
              </div>
              <p style={{ whiteSpace: "pre-line" }}>{item.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
