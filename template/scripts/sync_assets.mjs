#!/usr/bin/env node
/**
 * sync_assets.mjs - Tự động tìm kiếm, tải về và audit bản quyền tài nguyên (Pexels, Unsplash, Pixabay)
 * tích hợp qua @thanh01.pmt/multimedia-kit cho anything2explainer.
 *
 * Cách dùng:
 *   node scripts/sync_assets.mjs --tokens '[{"shotId":"S01","query":"data center servers","mediaType":"photo"}]' --slug demo
 *   node scripts/sync_assets.mjs --file script/assets.json --slug demo
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Tự động nạp .env nếu chưa có
function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
  ];
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [k, ...v] = trimmed.split('=');
        if (k && v.length > 0 && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}
loadEnv();

// 2. Nạp module multimedia-kit
const MULTIMEDIA_KIT_PATH = '/Users/tonypham/MEGA/WebApp/WIP/learnwell-platform/packages/multimedia-kit/dist/index.cjs';
let multimediaKit;
try {
  multimediaKit = await import(MULTIMEDIA_KIT_PATH);
} catch (err) {
  console.error('[sync_assets] Không thể nạp @thanh01.pmt/multimedia-kit:', err.message);
  process.exit(1);
}

const { searchEducationalMedia, generateAttributionMarkdown } = multimediaKit;

// 3. Phân tích tham số dòng lệnh
function parseArgs() {
  const args = process.argv.slice(2);
  let slug = 'demo';
  let tokens = [];
  let file = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[i + 1];
      i++;
    } else if (args[i] === '--tokens' && args[i + 1]) {
      try {
        tokens = JSON.parse(args[i + 1]);
      } catch (e) {
        console.error('Lỗi cú pháp JSON cho --tokens:', e.message);
      }
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      file = args[i + 1];
      i++;
    }
  }

  if (file && fs.existsSync(file)) {
    try {
      tokens = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      console.error('Lỗi đọc file JSON:', e.message);
    }
  }

  return { slug, tokens };
}

// 4. Thực thi đồng bộ
async function run() {
  const { slug, tokens } = parseArgs();

  if (!tokens || tokens.length === 0) {
    console.log('[sync_assets] Không có asset token nào được truyền vào.');
    console.log('Ví dụ cú pháp:');
    console.log('  node scripts/sync_assets.mjs --tokens \'[{"shotId":"S01","query":"quantum computer","mediaType":"photo"}]\' --slug demo');
    return;
  }

  const mediaDir = path.resolve(process.cwd(), `public/assets/${slug}/media`);
  fs.mkdirSync(mediaDir, { recursive: true });

  const manifestPath = path.join(mediaDir, 'manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (_) {}
  }

  const collectedAssets = [];

  for (const item of tokens) {
    const { shotId, query, mediaType = 'photo' } = item;
    if (!shotId || !query) continue;

    console.log(`\n🔍 [multimedia-kit] Tìm kiếm ${mediaType} cho ${shotId}: "${query}"...`);
    try {
      const results = await searchEducationalMedia({
        query,
        mediaType,
        licenseFilter: 'commercial_safe',
        maxResults: 2,
      });

      if (!results || results.length === 0) {
        console.warn(`⚠️  Không tìm thấy kết quả phù hợp cho: "${query}"`);
        continue;
      }

      const asset = results[0];
      collectedAssets.push(asset);

      const isVideo = mediaType === 'video';
      const ext = isVideo ? 'mp4' : 'jpg';
      const fileName = `${shotId}.${ext}`;
      const filePath = path.join(mediaDir, fileName);

      const downloadTarget = asset.downloadUrl || asset.displayUrl;
      console.log(`⬇️  Tải tài nguyên từ ${asset.provider} (${asset.title}) -> ${fileName}`);

      const res = await fetch(downloadTarget);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      manifest[shotId] = {
        localPath: `assets/${slug}/media/${fileName}`,
        title: asset.title,
        provider: asset.provider,
        author: asset.author?.name || 'Unknown',
        authorUrl: asset.author?.url || '',
        license: asset.license.type,
        commercialSafe: asset.license.commercialSafe,
        sourceUrl: asset.sourceUrl,
      };

      console.log(`✅ Đã lưu: ${filePath}`);
    } catch (err) {
      console.error(`❌ Lỗi tải asset cho ${shotId} ("${query}"):`, err.message);
    }
  }

  // Ghi manifest.json
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  // Ghi ATTRIBUTION.md nếu có asset
  if (collectedAssets.length > 0) {
    const attributionMd = generateAttributionMarkdown(collectedAssets);
    const attrPath = path.join(mediaDir, 'ATTRIBUTION.md');
    fs.writeFileSync(attrPath, attributionMd);
    console.log(`\n📄 Đã tạo báo cáo bản quyền: ${attrPath}`);
  }

  console.log(`\n🎉 Hoàn thành! Đã nạp thành công assets vào: public/assets/${slug}/media/`);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
