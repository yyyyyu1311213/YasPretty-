/**
 * 已归档：这是旧独立页与旧 /memory 接口的破坏性测试，不属于当前测试套件。
 * 阶段 1 网关不再提供 /memory，也不会运行此文件；保留它仅用于历史追溯。
 *
 * 小鱼 · 永久记忆 端到端测试（jsdom + 真实本地服务 + 真实智谱 API）
 * 覆盖：记忆落盘 → 二次会话个性化开场 → 不重复询问已知信息 → 记忆面板渲染 → AI 抽取
 *
 * 运行方式（需先启动本地服务）：
 *   1. 双击「启动小鱼.bat」，或 node server/fishtalk-server.cjs
 *   2. 指定装了 jsdom 的 node_modules 路径后运行：
 *      NODE_PATH="C:/Users/崔馨瑜/.workbuddy/binaries/node/workspace/node_modules" node server/test-memory.cjs
 *
 * 注意：测试会先清空 server/memory/store.json，别在真实记忆上跑。
 */
const path = require("path");
const { JSDOM } = require("jsdom");

const BASE = "http://127.0.0.1:8787/";
const FILE = path.resolve(__dirname, "..", "beauty-assistant.html");
const sleep = ms => new Promise(r => setTimeout(r, ms));

const EMPTY = { version: 1, updatedAt: 0, profile: {}, notes: [], summary: [], recs: [], turns: [] };
const results = [];
function check(name, ok, extra) {
  results.push({ name, ok, extra });
  console.log((ok ? "  ✅ " : "  ❌ ") + name + (extra ? "  →  " + extra : ""));
}

async function api(url, opts) {
  const r = await fetch(BASE + url, opts);
  return r.json();
}
async function readMemory() { return (await api("memory")).store; }
async function resetMemory() {
  await api("memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(EMPTY) });
}

async function loadPage() {
  const dom = await JSDOM.fromFile(FILE, {
    runScripts: "dangerously",
    url: BASE,
    pretendToBeVisual: true,
    beforeParse(window) {
      window.fetch = (input, init) => {
        const u = typeof input === "string" ? new URL(input, BASE).toString() : input;
        return fetch(u, init);
      };
      window.confirm = () => true;
    }
  });
  await sleep(600);   // 等 initMemory 完成
  return dom;
}

function lastBotText(doc) {
  const bubbles = doc.querySelectorAll(".msg.bot .bubble");
  return bubbles.length ? bubbles[bubbles.length - 1].textContent.trim() : "";
}

async function start(doc) {
  doc.getElementById("startBtn").click();
  await sleep(500);
  return lastBotText(doc);
}

async function send(doc, text) {
  const input = doc.getElementById("input");
  input.value = text;
  const btn = doc.getElementById("sendBtn");
  btn.click();
  const t0 = Date.now();
  while (btn.disabled && Date.now() - t0 < 70000) await sleep(300);
  await sleep(900);   // 等记忆防抖落盘
  return lastBotText(doc);
}

(async () => {
  console.log("\n========== 小鱼 · 永久记忆 端到端测试 ==========\n");

  /* ---------- 0. 清空记忆，模拟全新用户 ---------- */
  await resetMemory();
  const afterReset = await readMemory();
  check("记忆已重置为空", Object.keys(afterReset.profile).length === 0 && afterReset.notes.length === 0);

  /* ---------- 1. 第一次会话 ---------- */
  console.log("\n【第一次会话 · 全新用户】");
  let dom = await loadPage();
  let doc = dom.window.document;
  const hello1 = await start(doc);
  check("开场白是首次见面的版本", !hello1.includes("又见面"), hello1.slice(0, 40).replace(/\n/g, " "));

  const reply1 = await send(doc, "我是干皮，想要奶油肌，通勤用的粉底液，预算 500 左右");
  const mem1 = await readMemory();
  check("对话后肤质已写入记忆", mem1.profile.skin && mem1.profile.skin.v === "干皮", JSON.stringify(mem1.profile.skin));
  check("妆效偏好已写入记忆", !!(mem1.profile.finish && mem1.profile.finish.v), mem1.profile.finish && mem1.profile.finish.v);
  check("使用场景已写入记忆", !!(mem1.profile.scene && mem1.profile.scene.v), mem1.profile.scene && mem1.profile.scene.v);
  check("预算已写入记忆", !!(mem1.profile.budget && mem1.profile.budget.v), mem1.profile.budget && mem1.profile.budget.v);
  check("推荐记录已写入记忆", mem1.recs.length > 0, mem1.recs.map(r => r.productId).join(", "));
  check("对话轮次已写入记忆（跨会话上下文）", mem1.turns.length >= 2, mem1.turns.length + " 条");
  check("记忆文件确实落盘", mem1.updatedAt > 0, "updatedAt=" + mem1.updatedAt);
  console.log("  回复摘录：" + reply1.slice(0, 80).replace(/\n/g, " ") + "…");

  /* ---------- 2. 第二次会话（模拟关掉浏览器再打开） ---------- */
  console.log("\n【第二次会话 · 模拟重新打开页面】");
  dom.window.close();
  dom = await loadPage();
  doc = dom.window.document;

  const statusText = doc.getElementById("connStatus").textContent;
  const welcomeTip = doc.getElementById("welcomeMemTip");
  const memBtnText = doc.getElementById("memBtnWelcome").textContent;
  check("启动屏显示记忆提示", welcomeTip.style.display !== "none" && /干皮/.test(welcomeTip.textContent), welcomeTip.textContent.trim());
  check("启动屏记忆按钮带数量", /[（(]\d+[)）]/.test(memBtnText), memBtnText);

  const hello2 = await start(doc);
  check("开场白变成「又见面」的个性化版本", hello2.includes("又见面"), hello2.slice(0, 60).replace(/\n/g, " "));
  check("开场白里带上已知肤质", /干皮/.test(hello2), "");
  check("状态栏显示已记住的条数", /已记住\s*\d+\s*条/.test(statusText) || /已记住/.test(doc.getElementById("connStatus").textContent), doc.getElementById("connStatus").textContent);

  const reply2 = await send(doc, "直接推荐吧");
  check("第二轮不再重复询问肤质", !/你是什么\s*\*{0,2}肤质|什么肤质呢|你是什么肤质/.test(reply2), "");
  check("回复中体现了已知条件", /干皮/.test(reply2), "");

  /* ---------- 3. 记忆面板 ---------- */
  console.log("\n【记忆面板】");
  doc.getElementById("memBtn").click();
  await sleep(300);
  const panel = doc.getElementById("memPanel");
  const body = doc.getElementById("memBody").textContent;
  check("面板可打开", panel.classList.contains("show"));
  check("面板显示存储模式提示", /永久保存到本机文件/.test(doc.getElementById("memStoreTip").textContent), "");
  check("面板列出用户画像", /用户画像/.test(body) && /肤质/.test(body), "");
  check("面板列出已推荐款式", /已推荐过的款式/.test(body), "");

  /* ---------- 4. AI 后台抽取（自由信息，如送礼目的） ---------- */
  console.log("\n【AI 后台记忆抽取】");
  const replyAi = await send(doc, "其实这支粉底是准备买来送妈妈的，希望包装精致一点，她也是干皮");
  await sleep(6000);   // 等后台抽取调用返回
  const memAi = await readMemory();
  const aiNotes = memAi.notes.map(n => n.text + "[" + n.src + "]");
  const gotGift = memAi.notes.some(n => /妈妈|送/.test(n.text)) ||
                  /妈妈|送/.test(JSON.stringify(memAi.profile));
  check("AI 抽取到自由信息（送礼目的）", gotGift, aiNotes.join(" / ") || "无备注");
  check("抽取结果已落盘到文件", memAi.updatedAt > mem1.updatedAt, "");
  console.log("  回复摘录：" + replyAi.slice(0, 70).replace(/\n/g, " ") + "…");

  /* ---------- 5. 删除单条备注（先注入一条备注，再通过面板删除） ---------- */
  const seeded = await readMemory();
  seeded.notes.push({ id: "seed-note-1", text: "买来送妈妈，希望包装精致一点", at: Date.now(), src: "测试注入" });
  await api("memory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(seeded) });
  dom.window.close();
  dom = await loadPage();
  doc = dom.window.document;
  doc.getElementById("startBtn").click();
  await sleep(400);
  doc.getElementById("memBtn").click();
  await sleep(300);
  const beforeNotes = (await readMemory()).notes.length;
  const xBtn = doc.querySelector("#memPanel .mem-item .x");
  check("面板能列出注入的备注", !!xBtn, "");
  if (xBtn) {
    xBtn.click();
    await sleep(900);
    const afterNotes = (await readMemory()).notes.length;
    check("可以删除单条备注并同步落盘", afterNotes === beforeNotes - 1, `${beforeNotes} → ${afterNotes}`);
  } else {
    check("可以删除单条备注并同步落盘", false, "找不到删除按钮");
  }
  doc.getElementById("memClose").click();
  await sleep(200);

  /* ---------- 6. 重新开始：记忆应保留 ---------- */
  console.log("\n【重新开始】");
  doc.getElementById("restartBtn").click();
  await sleep(700);
  const hello3 = lastBotText(doc);
  const memAfterReset = await readMemory();
  check("重置会话后记忆仍在", Object.keys(memAfterReset.profile).length > 0, `${Object.keys(memAfterReset.profile).length} 项画像`);
  check("重置会话后开场白仍是「又见面」", hello3.includes("又见面"), "");

  /* ---------- 汇总 ---------- */
  const pass = results.filter(r => r.ok).length;
  console.log("\n========== 结果：" + pass + "/" + results.length + " 通过 ==========");
  if (pass !== results.length) {
    console.log("失败项：");
    results.filter(r => !r.ok).forEach(r => console.log("  - " + r.name + (r.extra ? " (" + r.extra + ")" : "")));
    process.exitCode = 1;
  }
  dom.window.close();
})().catch(e => {
  console.error("测试异常：", e);
  process.exitCode = 1;
});
