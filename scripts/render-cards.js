const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const cardData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../card_data.json'), 'utf8')
);

const outputDir = path.join(__dirname, '../output/cards');
fs.mkdirSync(outputDir, { recursive: true });

function generateCardHTML(cardNum, data) {
  const today = data.today || new Date().toISOString().split('T')[0];
  const cards = {
    1: `<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@300;400;700;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width:1080px; height:1920px; overflow:hidden; background:#0a0a0a;
          font-family:'Noto Sans KR',sans-serif; display:flex; flex-direction:column;
          justify-content:space-between; padding:80px 72px; }
        .ch-name { font-size:26px; font-weight:300; color:#666; letter-spacing:6px; }
        .divider { width:80px; height:2px; background:#333; margin:36px 0; }
        .big-num { font-family:'Black Han Sans',sans-serif; font-size:240px; color:#fff; line-height:0.9; letter-spacing:-8px; }
        .main-copy { font-size:58px; font-weight:700; color:#fff; line-height:1.3; margin-top:20px; }
        .sub-copy { font-size:34px; font-weight:300; color:#888; line-height:1.6; margin-top:28px; }
        .date-tag { font-size:22px; color:#555; letter-spacing:4px; }
      </style></head><body>
      <div>
        <div class="ch-name">경제청년 · DAILY BRIEF</div>
        <div class="divider"></div>
        <div class="ch-name">${today}</div>
      </div>
      <div>
        <div class="big-num">${data.card1?.big_number || ''}</div>
        <div class="main-copy">${data.card1?.main_copy || ''}</div>
        <div class="sub-copy">${data.card1?.sub_copy || ''}</div>
      </div>
      <div class="date-tag">NO.001 · #경제청년</div>
    </body></html>`,

    2: `<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@300;400;700;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width:1080px; height:1920px; overflow:hidden; background:#f5f3ef;
          font-family:'Noto Sans KR',sans-serif; display:flex; flex-direction:column;
          justify-content:space-between; padding:80px 72px; }
        .tag { display:inline-block; background:#0a0a0a; color:#fff; font-size:22px; letter-spacing:4px; padding:12px 28px; border-radius:4px; }
        .stat-num { font-family:'Black Han Sans',sans-serif; font-size:200px; color:#0a0a0a; line-height:1; letter-spacing:-6px; margin-top:40px; }
        .stat-label { font-size:36px; color:#555; margin-top:16px; line-height:1.5; }
        .bar-wrap { margin:48px 0; }
        .bar-label { display:flex; justify-content:space-between; font-size:28px; color:#888; margin-bottom:16px; }
        .bar-bg { width:100%; height:20px; background:#ddd; border-radius:4px; overflow:hidden; margin-bottom:28px; }
        .bar-fill { height:100%; border-radius:4px; }
        .foot { font-size:24px; color:#999; border-top:1px solid #ddd; padding-top:32px; }
      </style></head><body>
      <div class="tag">DATA · 수치로 보기</div>
      <div>
        <div class="stat-num">${data.card2?.stat_num || ''}</div>
        <div class="stat-label">${data.card2?.stat_label || ''}</div>
        <div class="bar-wrap">
          ${(data.card2?.data_points || []).map((dp,i) => `
            <div class="bar-label"><span>${dp.label}</span><span>${dp.value}</span></div>
            <div class="bar-bg"><div class="bar-fill" style="width:${dp.pct||50}%;background:${i===0?'#0a0a0a':'#bbb'}"></div></div>
          `).join('')}
        </div>
      </div>
      <div class="foot">출처: ${data.card2?.source || '국토교통부 / 통계청'}</div>
    </body></html>`,

    3: `<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@300;400;700;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width:1080px; height:1920px; overflow:hidden; background:#0a0a0a;
          font-family:'Noto Sans KR',sans-serif; display:flex; flex-direction:column;
          justify-content:space-between; padding:80px 72px; }
        .section-tag { font-size:22px; color:#666; letter-spacing:6px; }
        .main-q { font-size:72px; font-weight:900; color:#fff; line-height:1.2; margin-top:24px; }
        .reason-item { display:flex; gap:32px; padding:36px 0; border-bottom:1px solid #222; align-items:flex-start; }
        .reason-num { font-family:'Black Han Sans',sans-serif; font-size:72px; color:#444; min-width:60px; line-height:1; }
        .reason-title { font-size:42px; font-weight:700; color:#fff; margin-bottom:12px; }
        .reason-desc { font-size:32px; color:#777; line-height:1.5; }
        .ch-footer { font-size:22px; color:#444; letter-spacing:4px; }
      </style></head><body>
      <div>
        <div class="section-tag">WHY · 왜 이렇게 됐을까</div>
        <div class="main-q">${data.card3?.question || ''}</div>
      </div>
      <div>
        ${(data.card3?.reasons || []).map((r,i) => `
          <div class="reason-item">
            <span class="reason-num">0${i+1}</span>
            <div>
              <div class="reason-title">${r.title}</div>
              <div class="reason-desc">${r.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="ch-footer">경제청년 · ECONOMY YOUTH</div>
    </body></html>`,

    4: `<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@300;400;700;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width:1080px; height:1920px; overflow:hidden; background:#f5f3ef;
          font-family:'Noto Sans KR',sans-serif; display:flex; flex-direction:column;
          justify-content:space-between; padding:80px 72px; }
        .tag { display:inline-block; background:#0a0a0a; color:#fff; font-size:22px; letter-spacing:4px; padding:12px 28px; border-radius:4px; }
        .main-title { font-size:68px; font-weight:900; color:#0a0a0a; line-height:1.2; margin-top:28px; }
        .strategy-box { padding:40px; border-radius:16px; margin-bottom:24px; }
        .box-black { background:#0a0a0a; }
        .box-white { background:#fff; border:1px solid #ddd; }
        .box-type { font-size:20px; letter-spacing:4px; font-weight:700; margin-bottom:16px; }
        .box-title { font-size:40px; font-weight:700; line-height:1.3; }
        .box-desc { font-size:28px; margin-top:12px; line-height:1.5; }
        .footnote { font-size:22px; color:#999; border-top:1px solid #ddd; padding-top:28px; }
      </style></head><body>
      <div class="tag">STRATEGY · 이렇게 대응하자</div>
      <div class="main-title">${data.card4?.title || ''}</div>
      <div>
        ${(data.card4?.strategies || []).map((s,i) => `
          <div class="strategy-box ${i%2===0?'box-black':'box-white'}">
            <div class="box-type" style="color:${i%2===0?'#666':'#555'}">${s.target}</div>
            <div class="box-title" style="color:${i%2===0?'#fff':'#0a0a0a'}">${s.title}</div>
            <div class="box-desc" style="color:${i%2===0?'#888':'#777'}">${s.desc}</div>
          </div>
        `).join('')}
      </div>
      <div class="footnote">※ 투자 결정 전 개인 재무상황 반드시 검토 필요</div>
    </body></html>`,

    5: `<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@300;400;700;900&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { width:1080px; height:1920px; overflow:hidden; background:#0a0a0a;
          font-family:'Noto Sans KR',sans-serif; display:flex; flex-direction:column;
          justify-content:space-between; padding:80px 72px; }
        .top-label { font-size:22px; color:#555; letter-spacing:6px; }
        .big-word { font-family:'Black Han Sans',sans-serif; font-size:180px; color:#fff; line-height:0.95; letter-spacing:-6px; }
        .big-word-gray { font-family:'Black Han Sans',sans-serif; font-size:180px; color:#333; line-height:0.95; letter-spacing:-6px; }
        .summary-item { display:flex; align-items:center; gap:28px; padding:28px 0; border-bottom:1px solid #1e1e1e; }
        .s-dot { width:14px; height:14px; border-radius:50%; background:#fff; flex-shrink:0; }
        .s-text { font-size:36px; color:#bbb; line-height:1.5; }
        .cta-box { background:#fff; border-radius:16px; padding:40px 48px; display:flex; justify-content:space-between; align-items:center; }
        .cta-text { font-size:40px; font-weight:700; color:#0a0a0a; }
        .cta-sub { font-size:26px; color:#666; margin-top:6px; }
        .cta-arrow { font-size:60px; color:#0a0a0a; font-weight:700; }
      </style></head><body>
      <div class="top-label">RECAP · 오늘의 요약</div>
      <div>
        <div class="big-word">${data.card5?.big_word || ''}</div>
        <div class="big-word-gray">시대.</div>
      </div>
      <div>
        ${(data.card5?.summary_list || []).map(item => `
          <div class="summary-item">
            <div class="s-dot"></div>
            <div class="s-text">${item}</div>
          </div>
        `).join('')}
      </div>
      <div class="cta-box">
        <div>
          <div class="cta-text">경제청년 구독하기</div>
          <div class="cta-sub">매일 5분, 경제 읽는 습관</div>
        </div>
        <div class="cta-arrow">↗</div>
      </div>
    </body></html>`
  };
  return cards[cardNum];
}

async function renderCards() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: 'new'
  });

  console.log('카드뉴스 PNG 렌더링 시작...');

  for (let i = 1; i <= 5; i++) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });
    const html = generateCardHTML(i, cardData);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    const outputPath = path.join(outputDir, `card_${i}.png`);
    await page.screenshot({ path: outputPath, type: 'png', clip: { x:0, y:0, width:1080, height:1920 } });
    console.log(`카드 ${i} 완료: ${outputPath}`);
    await page.close();
  }

  await browser.close();
  console.log('전체 카드뉴스 PNG 생성 완료!');
}

renderCards().catch(console.error);
