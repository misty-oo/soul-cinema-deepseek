import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const systemPrompt = `
你是一位兼具电影研究、叙事心理学、人格观察与文学表达能力的「电影人格解码师」。
你的任务是根据用户最喜欢的电影及三个生活选择，生成一份中文深度人格报告。
重要原则：
1. 这是基于偏好线索的探索性解读，不是心理诊断、临床评估或确定的人格测验。不要把推测写成事实。
2. 不要使用星座、占星、塔罗或命理内容。
3. 不要只复述用户答案。要寻找电影主题、人物处境、叙事母题与生活选择之间的呼应、矛盾和反差。
4. 语言细腻、具体、有洞察力，避免空泛夸奖、模板化鸡汤和绝对化判断。
5. 三种灵魂象征必须根据本次输入动态选择，可以是动物、植物、器物、自然景观、建筑或抽象意象，不要固定使用某几个象征。
6. 对没有提供的信息，不要自行编造。
7. 报告要有清晰标题和分段，内容充分，建议约1800至2600汉字。
请严格按以下结构输出：
一、核心人格画像
二、三部电影的精神线索（若用户少于三部，分析已提供的电影，不虚构缺失电影）
三、内在价值观与精神世界
四、MBTI类型推测（给出1至2个候选及依据，并明确仅为推测；信息不足时说明）
五、人格魅力与吸引力
六、情感模式与亲密关系
七、潜在弱点与阴影人格
八、灵魂的三种形状：外在、内在、潜在。每种包括象征物、诗意名称、匹配依据和心理洞察。
九、你可能不知道的自己：结合电影偏好与问题答案的呼应或反差
十、综合人格画像与成长建议
十一、灵魂收藏卡：三个象征各一句短标签，并写一句专属诗句。`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "服务器尚未配置 DEEPSEEK_API_KEY。请在 Vercel 环境变量中检查名称和部署环境，然后重新部署。" }, { status: 500 });
    }

    const body = await request.json();
    const movies = Array.isArray(body.movies) ? body.movies.map((x: unknown) => String(x ?? "").trim()).filter(Boolean).slice(0, 3) : [];
    const answers = Array.isArray(body.answers) ? body.answers.map((x: unknown) => String(x ?? "").trim()).slice(0, 3) : [];
    if (!movies.length) return NextResponse.json({ error: "请至少填写一部电影。" }, { status: 400 });

    const userPrompt = `
用户资料：
称呼：${String(body.nickname || "未提供").slice(0, 40)}
性别：${String(body.gender || "未提供").slice(0, 30)}
年龄：${String(body.age || "未提供").slice(0, 10)}
喜欢的电影：${movies.join("、")}
隐藏问题回答：
1. 自由下午：${answers[0] || "未回答"}
2. 发现一扇小门：${answers[1] || "未回答"}
3. 想独处的地方：${answers[2] || "未回答"}

请基于以上真实输入生成完整报告。电影名称只是偏好线索；如对某部电影不确定，不要杜撰剧情细节，可以从片名或已知主题谨慎分析。`;

    const upstream = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 7000,
        stream: false
      }),
      signal: AbortSignal.timeout(55000)
    });

    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message = payload?.error?.message || payload?.message || `DeepSeek API 请求失败（HTTP ${upstream.status}）`;
      const safeMessage = upstream.status === 401
        ? "DeepSeek API Key 无效或未正确配置。请检查 Vercel 的 DEEPSEEK_API_KEY。"
        : upstream.status === 402
        ? "DeepSeek 账户余额不足，请前往开放平台检查余额。"
        : upstream.status === 429
        ? "DeepSeek API 请求过于频繁或额度受限，请稍后重试并检查账户额度。"
        : String(message).slice(0, 500);
      return NextResponse.json({ error: safeMessage }, { status: upstream.status === 429 ? 429 : 502 });
    }

    const report = payload?.choices?.[0]?.message?.content;
    if (typeof report !== "string" || !report.trim()) {
      return NextResponse.json({ error: "AI 已响应，但没有返回报告正文。请稍后重试。" }, { status: 502 });
    }
    return NextResponse.json({ report: report.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({
      error: message.includes("timeout") ? "生成时间较长，连接超时了。请稍后重试。" : "报告生成暂时失败，请稍后重试。"
    }, { status: 500 });
  }
}
