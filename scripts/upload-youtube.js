const fs = require('fs');
const path = require('path');
const https = require('https');

const data = JSON.parse(fs.readFileSync('pipeline_data.json', 'utf8'));

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    });
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(body);
        if (parsed.access_token) resolve(parsed.access_token);
        else reject(new Error(`토큰 발급 실패: ${body}`));
      });
    });
    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

async function uploadVideo(accessToken) {
  const videoPath = path.join(__dirname, '../output/final_shorts.mp4');
  const videoStats = fs.statSync(videoPath);
  const title = data.youtubeTitle || `경제청년 | ${data.today}`;
  const description = [
    `📊 ${title}`,
    '',
    '경제청년과 함께 매일 5분, 경제 읽는 습관 만들기!',
    '✅ 구독하면 매일 아침 핫한 경제 이슈가 자동으로!',
    '',
    (data.hashtags?.youtube || ['#경제', '#경제청년', '#유튜브쇼츠', '#경제공부']).join(' ')
  ].join('\n');

  const metadata = {
    snippet: {
      title,
      description,
      tags: ['경제청년', '경제', '주식', '부동산', '금리', '재테크', '유튜브쇼츠'],
      categoryId: '25',
      defaultLanguage: 'ko'
    },
    status: {
      privacyStatus: 'public',
      selfDeclaredMadeForKids: false
    }
  };

  const initResponse = await new Promise((resolve, reject) => {
    const metaStr = JSON.stringify(metadata);
    const options = {
      hostname: 'www.googleapis.com',
      path: '/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': videoStats.size
      }
    };
    const req = https.request(options, (res) => {
      resolve({ location: res.headers.location, status: res.statusCode });
    });
    req.on('error', reject);
    req.write(metaStr);
    req.end();
  });

  if (!initResponse.location) throw new Error('업로드 세션 초기화 실패');

  console.log(`유튜브 업로드 시작: ${title}`);
  const uploadUrl = new URL(initResponse.location);
  const videoData = fs.readFileSync(videoPath);

  const uploadResponse = await new Promise((resolve, reject) => {
    const options = {
      hostname: uploadUrl.hostname,
      path: uploadUrl.pathname + uploadUrl.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoStats.size
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(videoData);
    req.end();
  });

  const result = JSON.parse(uploadResponse.body);
  if (result.id) {
    const youtubeUrl = `https://www.youtube.com/shorts/${result.id}`;
    console.log(`유튜브 업로드 완료! URL: ${youtubeUrl}`);
    fs.writeFileSync('output/youtube_url.txt', youtubeUrl);
    return youtubeUrl;
  } else {
    throw new Error(`업로드 오류: ${uploadResponse.body}`);
  }
}

async function main() {
  try {
    const accessToken = await getAccessToken();
    await uploadVideo(accessToken);
  } catch (error) {
    console.error('유튜브 업로드 실패:', error.message);
    process.exit(1);
  }
}

main();
