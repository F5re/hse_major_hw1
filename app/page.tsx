import { EmailAnalyzer } from "@/components/EmailAnalyzer";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">К основному содержанию</a>
      <header className="topbar">
        <div className="shell topbarInner"><span className="brand" translate="no">генИИ</span><span className="team">KIB-22 · НИУ ВШЭ</span></div>
      </header>
      <main id="main" className="shell main">
        <section className="intro" aria-labelledby="page-title">
          <p className="audience">Инструмент для бухгалтеров и офис-менеджеров</p>
          <h1 id="page-title">Проверка подозрительного письма</h1>
          <p>Вставьте текст письма. Сервис покажет признаки мошенничества и подскажет, что стоит перепроверить.</p>
        </section>
        <EmailAnalyzer />
      </main>
      <footer className="footer"><div className="shell footerInner"><p><strong>Только текст.</strong> Сервис не проверяет адрес отправителя, вложения и подлинность ссылок.</p><p>Учебный проект команды KIB-22 по безопасности предпринимательской деятельности.</p></div></footer>
    </>
  );
}
