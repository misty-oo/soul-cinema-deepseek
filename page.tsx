"use client";

import { useState } from "react";

const questions = [
  {
    title: "如果突然获得一个完全自由的下午，没有工作、没有任务，也不需要考虑任何人的安排，你最可能做什么？",
    options: [
      "去一个没去过的地方，随便走走",
      "待在家里，看电影、读书或做自己喜欢的事",
      "约上朋友，找点有趣的事情一起做",
      "完成一件一直想做却没时间做的事情",
      "什么也不安排，走到哪算哪",
      "享受独处，发呆、听音乐、放空自己"
    ]
  },
  {
    title: "假设你搬进了一间新房子，某天晚上突然发现房间里有一扇之前从未注意到的小门，你会怎么做？",
    options: [
      "马上打开，想看看里面有什么",
      "先观察门的结构，判断它通向哪里",
      "有点好奇，但会先考虑是否安全",
      "暂时不管，等有时间再研究",
      "想象门后可能有什么，甚至编出一个故事",
      "找其他人一起看看"
    ]
  },
  {
    title: "如果可以选择一个地方，让自己在那里度过一段不被打扰的时间，你会选择哪里？",
    options: [
      "海边，听海浪，看日落",
      "森林，远离人群，感受自然",
      "繁华城市，在陌生街道里漫无目的地走",
      "有壁炉和书架的房间，温暖而安静",
      "山顶，可以看到很远的风景",
      "一座陌生的古老城市，充满未知和故事"
    ]
  }
];

type FormState = {
  movies: string[];
  answers: string[];
  nickname: string;
  gender: string;
  age: string;
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    movies: ["", "", ""], answers: ["", "", ""], nickname: "", gender: "", age: ""
  });
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateMovie(index: number, value: string) {
    setForm(old => ({ ...old, movies: old.movies.map((v, i) => i === index ? value : v) }));
  }
  function updateAnswer(index: number, value: string) {
    setForm(old => ({ ...old, answers: old.answers.map((v, i) => i === index ? value : v) }));
  }

  async function generate() {
    setError("");
    setReport("");
    if (!form.movies.some(m => m.trim())) {
      setError("至少填写一部你喜欢的电影，给我们一扇进入你内心的门。");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "报告生成失败，请稍后重试。");
      setReport(data.report);
      window.setTimeout(() => document.getElementById("report")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络连接异常，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SOUL-CINEMA-灵魂报告.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <div className="ambient ambientOne" /><div className="ambient ambientTwo" />
      <header className="topbar">
        <a className="brand" href="#"><span className="brandMark">SC</span><span>SOUL <b>CINEMA</b></span></a>
        <span className="topNote">A CINEMATIC PERSONALITY EXPERIENCE</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> THE INNER SCREENING ROOM <span /></div>
        <h1>每一部电影，<br/><em>都藏着一个你。</em></h1>
        <p className="heroText">你选择的故事，映照着你未曾说出口的部分。<br/>让电影成为线索，走进灵魂深处。</p>
        <div className="heroRule"><span>01</span><i /> <span>DISCOVER YOURSELF THROUGH CINEMA</span></div>
      </section>

      <section className="formShell">
        <div className="sectionHead">
          <div><span className="kicker">CHAPTER 01 / YOUR FILMS</span><h2>你的私人片单</h2></div>
          <span className="step">01 — 03</span>
        </div>
        <p className="sectionDesc">写下三部你真正喜欢、记忆深刻，或在某个时刻触动过你的电影。</p>
        <div className="movieGrid">
          {form.movies.map((movie, i) => (
            <label className="movieInput" key={i}>
              <span className="movieNumber">0{i + 1}</span>
              <input value={movie} onChange={e => updateMovie(i, e.target.value)} placeholder={i === 0 ? "输入电影名称（至少填写一部）" : "另一部电影（选填）"} />
              <span className="filmGlyph">✳</span>
            </label>
          ))}
        </div>
      </section>

      <section className="formShell">
        <div className="sectionHead">
          <div><span className="kicker">CHAPTER 02 / THE HIDDEN QUESTIONS</span><h2>三道隐藏问题</h2></div>
          <span className="step">02 — 03</span>
        </div>
        <p className="sectionDesc">没有标准答案。凭第一直觉选择，或留白也可以。</p>
        <div className="questionList">
          {questions.map((q, i) => (
            <fieldset className="question" key={i}>
              <legend><span>0{i + 1}</span>{q.title}</legend>
              <div className="options">
                {q.options.map(option => (
                  <label className={"option " + (form.answers[i] === option ? "selected" : "")} key={option}>
                    <input type="radio" name={"q" + i} checked={form.answers[i] === option} onChange={() => updateAnswer(i, option)} />
                    <span className="radioMark" />{option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="formShell profileShell">
        <div className="sectionHead">
          <div><span className="kicker">CHAPTER 03 / A LITTLE ABOUT YOU</span><h2>关于你</h2></div>
          <span className="step">03 — 03</span>
        </div>
        <p className="sectionDesc">以下信息完全选填，只用于让报告更贴近你的表达。</p>
        <div className="profileGrid">
          <label>你希望如何称呼你？<input value={form.nickname} onChange={e => setForm({...form, nickname:e.target.value})} placeholder="称呼（选填）" /></label>
          <label>性别<select value={form.gender} onChange={e => setForm({...form, gender:e.target.value})}><option value="">不填写</option><option>女性</option><option>男性</option><option>其他 / 不愿透露</option></select></label>
          <label>年龄<input value={form.age} onChange={e => setForm({...form, age:e.target.value})} placeholder="年龄（选填）" inputMode="numeric" /></label>
        </div>
      </section>

      <section className="submitArea">
        <div className="submitOrnament">✧</div>
        <p>THE SCREEN IS YOURS</p>
        <h2>准备好，认识另一个自己了吗？</h2>
        <button className="generateButton" onClick={generate} disabled={loading}>
          {loading ? <><span className="spinner" /> 正在解码你的灵魂…</> : <>生成我的灵魂报告 <span>↗</span></>}
        </button>
        <span className="privacyNote">你的答案只用于生成本次报告。至少填写一部电影即可开始。</span>
        {error && <div className="errorBox">{error}</div>}
      </section>

      {report && <section className="reportShell" id="report">
        <div className="reportTop"><span className="kicker">YOUR PERSONAL SOUL CINEMA</span><span className="reportStamp">CONFIDENTIAL · PERSONAL EDITION</span></div>
        <h2>你的灵魂，正在显影。</h2>
        <div className="reportContent">{report.split("\n").map((line, i) => line.trim() ? <p key={i}>{line}</p> : <div className="reportGap" key={i}/>)}</div>
        <button className="downloadButton" onClick={downloadReport}>下载完整报告 <span>↓</span></button>
      </section>}

      <footer><span>SOUL CINEMA</span><span>看见故事，也看见自己。</span><span>© 2026</span></footer>
    </main>
  );
}
