const https = require('https');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('pipeline_data.json', 'utf8'));
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'https://leemin809-wq.github.io/economy-youth-cards';

function apiCall(path, method, params) {
  return new Promise((resolve, reject) => {
    const queryStr = new URLSearchParams({
      ...params,
      access_token: ACCESS_TOKEN
    }).toString();

    const fullPath = method === 'GET'
      ? `/v19.0${path}?${queryStr}`
      : `/v19.0${path}`;

    const options = {
      hostname: 'graph.facebook.com',
      path: fullPath,
      method: method || 'GET',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    if (method === 'POST' && params) req.write(queryStr);
    req.end();
  });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function uploadCarousel() {
  console.log('인스타그램 캐러셀 업로드 시작...');

  const caption = [
    `📊 ${data.youtubeTitle || '경제청년 데일리 브리핑'}`,
    '',
    '경제청년과 함께 매일 5분, 경제 읽는 습관!',
    '',
    (data.hashtags?.instagram || [
      '#경제청년', '#경제공부', '#재테크', '#주식', '#부동산',
      '#경제뉴스', '#금융', '#투자', '#경제정보', '#MZ경제'
    ]).join(' ')
  ].join('\n');

  const containerIds = [];
  for (let i = 1; i <= 5; i++) {
    const imageUrl = `${IMAGE_BASE_URL}/card_${i}.png`;
    const container = await apiCall(
      `/${ACCOUNT_ID}/media`,
      'POST',
      { image_url: imageUrl, is_carousel_item: 'true' }
    );
    if (container.id) {
      containerIds.push(container.id);
      console.log(`카드 ${i} 컨테이너: ${container.id}`);
    }
    await sleep(1000);
  }

  const carousel = await apiCall(
    `/${ACCOUNT_ID}/media`,
    'POST',
    {
      media_type: 'CAROUSEL',
      caption: caption,
      children: containerIds.join(',')
    }
  );

  if (!carousel.id) throw new Error(`캐러셀 생성 실패: ${JSON.stringify(carousel)}`);

  await sleep(3000);

  const publish = await apiCall(
    `/${ACCOUNT_ID}/media_publish`,
    'POST',
    { creation_id: carousel.id }
  );

  if (publish.id) {
    console.log(`인스타그램 업로드 완료: ${publish.id}`);
    return publish.id;
  } else {
    throw new Error(`발행 실패: ${JSON.stringify(publish)}`);
  }
}

async function main() {
  try {
    await uploadCarousel();
    console.log('인스타그램 완료!');
  } catch (error) {
    console.error('인스타그램 업로드 실패:', error.message);
    process.exit(1);
  }
}

main();
