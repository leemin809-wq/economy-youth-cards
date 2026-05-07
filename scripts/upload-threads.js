const https = require('https');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('pipeline_data.json', 'utf8'));
const ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN;
const USER_ID = process.env.THREADS_USER_ID;
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'https://leemin809-wq.github.io/economy-youth-cards';

function apiCall(path, method, params) {
  return new Promise((resolve, reject) => {
    const queryStr = new URLSearchParams({
      ...params,
      access_token: ACCESS_TOKEN
    }).toString();

    const fullPath = method === 'GET'
      ? `/v1.0${path}?${queryStr}`
      : `/v1.0${path}`;

    const options = {
      hostname: 'graph.threads.net',
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

async function postToThreads() {
  console.log('스레드 업로드 시작...');

  const cardData = data.cardData || {};

  const thread1Text = [
    `📊 ${data.youtubeTitle || '경제청년 데일리'}`,
    '',
    `${cardData.card1?.main_copy || ''}`,
    `${cardData.card1?.sub_copy || ''}`,
    '',
    '🔽 자세한 내용은 아래 스레드에서!'
  ].join('\n');

  const container1 = await apiCall(`/${USER_ID}/threads`, 'POST', {
    media_type: 'IMAGE',
    image_url: `${IMAGE_BASE_URL}/card_1.png`,
    text: thread1Text
  });
  await sleep(2000);

  const thread2Text = [
    `📈 핵심 데이터`,
    '',
    `${cardData.card2?.stat_num || ''} ${cardData.card2?.stat_label || ''}`,
    '',
    (cardData.card2?.data_points || []).map(dp => `• ${dp.label}: ${dp.value}`).join('\n')
  ].join('\n');

  const container2 = await apiCall(`/${USER_ID}/threads`, 'POST', {
    media_type: 'IMAGE',
    image_url: `${IMAGE_BASE_URL}/card_2.png`,
    text: thread2Text
  });
  await sleep(2000);

  const thread3Text = [
    `💡 오늘의 핵심 요약`,
    '',
    ...(cardData.card5?.summary_list || []).map(s => `✅ ${s}`),
    '',
    (data.hashtags?.threads || ['#경제청년', '#경제', '#재테크']).join(' ')
  ].join('\n');

  const container3 = await apiCall(`/${USER_ID}/threads`, 'POST', {
    media_type: 'IMAGE',
    image_url: `${IMAGE_BASE_URL}/card_5.png`,
    text: thread3Text
  });
  await sleep(2000);

  const carouselContainer = await apiCall(`/${USER_ID}/threads`, 'POST', {
    media_type: 'CAROUSEL',
    children: [container1.id, container2.id, container3.id].filter(Boolean).join(',')
  });
  await sleep(3000);

  const publish = await apiCall(`/${USER_ID}/threads_publish`, 'POST', {
    creation_id: carouselContainer.id
  });

  if (publish.id) {
    console.log(`스레드 발행 완료: ${publish.id}`);
    return publish.id;
  } else {
    throw new Error(`스레드 발행 실패: ${JSON.stringify(publish)}`);
  }
}

async function main() {
  try {
    await postToThreads();
    console.log('스레드 완료!');
  } catch (error) {
    console.error('스레드 업로드 실패:', error.message);
    process.exit(1);
  }
}

main();
