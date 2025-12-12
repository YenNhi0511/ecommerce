import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Dữ liệu ảnh THẬT từ TGDD và CDN hãng (đã lọc link chính xác)
const productsToDownload = [
  // --- ĐIỆN THOẠI ---
  { name: 'iphone-15-pro-max', url: 'https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg' },
  { name: 'samsung-galaxy-s24-ultra', url: 'https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg' },
  { name: 'iphone-14-pro', url: 'https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-tim-thumb-600x600.jpg' },
  { name: 'samsung-galaxy-z-fold5', url: 'https://cdn.tgdd.vn/Products/Images/42/303556/samsung-galaxy-z-fold5-kem-600x600.jpg' },
  { name: 'xiaomi-14-ultra', url: 'https://cdn.tgdd.vn/Products/Images/42/307301/xiaomi-14-ultra-trang-thumb-600x600.jpg' },
  { name: 'oppo-find-n3-flip', url: 'https://cdn.tgdd.vn/Products/Images/42/309834/oppo-find-n3-flip-hong-thumb-600x600.jpg' },
  { name: 'iphone-13', url: 'https://cdn.tgdd.vn/Products/Images/42/250258/iphone-13-starlight-1-600x600.jpg' },
  { name: 'samsung-galaxy-s23-fe', url: 'https://cdn.tgdd.vn/Products/Images/42/316771/samsung-galaxy-s23-fe-xanh-thumbnew-600x600.jpg' },
  { name: 'xiaomi-redmi-note-13-pro', url: 'https://cdn.tgdd.vn/Products/Images/42/309816/xiaomi-redmi-note-13-pro-den-thumb-600x600.jpg' },
  { name: 'oppo-reno11-f', url: 'https://cdn.tgdd.vn/Products/Images/42/320220/oppo-reno11-f-xanh-thumbnew-600x600.jpg' },
  { name: 'vivo-v30', url: 'https://cdn.tgdd.vn/Products/Images/42/320695/vivo-v30-xanh-thumbnew-600x600.jpg' },
  { name: 'realme-12-pro-plus', url: 'https://cdn.tgdd.vn/Products/Images/42/320156/realme-12-pro-plus-xanh-thumbnew-600x600.jpg' },

  // --- LAPTOP ---
  { name: 'macbook-pro-14-m3', url: 'https://cdn.tgdd.vn/Products/Images/44/318228/macbook-pro-14-inch-m3-pro-2023-gray-thumb-600x600.jpg' },
  { name: 'dell-xps-13-plus', url: 'https://cdn.tgdd.vn/Products/Images/44/304193/dell-xps-13-plus-9320-i7-10033486-thumb-600x600.jpg' },
  { name: 'asus-rog-strix-g16', url: 'https://cdn.tgdd.vn/Products/Images/44/302825/asus-rog-strix-g16-g614ju-i7-n3777w-thumb-600x600.jpg' },
  { name: 'msi-titan-gt77', url: 'https://cdn.tgdd.vn/Products/Images/44/302165/msi-titan-gt77-hx-13vi-i9-063vn-thumb-600x600.jpg' },
  { name: 'lenovo-thinkpad-x1', url: 'https://cdn.tgdd.vn/Products/Images/44/309485/lenovo-thinkpad-x1-carbon-gen-10-i7-21cb00a8vn-thumb-600x600.jpg' },
  { name: 'hp-envy-13', url: 'https://cdn.tgdd.vn/Products/Images/44/282760/hp-envy-x360-13-bf0090tu-i7-76b13pa-thumb-600x600.jpg' },

  // --- TABLET ---
  { name: 'ipad-pro-m2', url: 'https://cdn.tgdd.vn/Products/Images/522/296726/ipad-pro-m2-11-wifi-xam-thumb-600x600.jpg' },
  { name: 'ipad-air-5', url: 'https://cdn.tgdd.vn/Products/Images/522/325515/ipad-air-5-wifi-64gb-2022-xanh-duong-thumb-600x600.jpg' },
  { name: 'samsung-tab-s9-ultra', url: 'https://cdn.tgdd.vn/Products/Images/522/307164/samsung-galaxy-tab-s9-ultra-thumb-600x600.jpg' },
  { name: 'samsung-tab-s9-fe', url: 'https://cdn.tgdd.vn/Products/Images/522/315993/samsung-galaxy-tab-s9-fe-wifi-xam-thumb-600x600.jpg' },
  { name: 'xiaomi-pad-6', url: 'https://cdn.tgdd.vn/Products/Images/522/306730/xiaomi-pad-6-xam-thumb-600x600.jpg' },

  // --- PHỤ KIỆN ---
  { name: 'airpods-pro-2', url: 'https://cdn.tgdd.vn/Products/Images/54/316040/bluetooth-airpods-pro-2-magsafe-usb-c-apple-mtjv3-thumb-600x600.jpg' },
  { name: 'sony-wh-1000xm5', url: 'https://cdn.tgdd.vn/Products/Images/54/281315/tai-nghe-chup-tai-sony-wh-1000xm5-den-thumb-600x600.jpg' },
  { name: 'anker-737', url: 'https://cdn.tgdd.vn/Products/Images/57/304899/sac-du-phong-24000mah-140w-anker-737-a1289-den-thumb-600x600.jpg' },
  { name: 'logitech-mx-master-3s', url: 'https://cdn.tgdd.vn/Products/Images/86/285324/chuot-khong-day-logitech-mx-master-3s-den-thumb-600x600.jpg' },
  { name: 'apple-magic-mouse', url: 'https://cdn.tgdd.vn/Products/Images/86/258957/chuot-bluetooth-apple-mk2e3-trang-thumb-600x600.jpg' },
  { name: 'logitech-mx-keys', url: 'https://cdn.tgdd.vn/Products/Images/4547/315024/ban-phim-bluetooth-logitech-mx-keys-s-thumb-600x600.jpg' },
  { name: 'keychron-k8-pro', url: 'https://cdn.tgdd.vn/Products/Images/4547/313936/ban-phim-co-co-day-bluetooth-keychron-k8-pro-thumb-600x600.jpg' },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saveDir = path.join(__dirname, 'public', 'images', 'products');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

const downloadImage = async (url, filename) => {
  const filePath = path.join(saveDir, filename);
  try {
    // Kỹ thuật quan trọng: Fake Headers để server tưởng là người dùng thật
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.thegioididong.com/', // Bắt buộc phải có cái này để tải từ TGDD
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Đã tải: ${filename}`);
  } catch (error) {
    console.error(`❌ Lỗi tải ${filename}:`, error.message);
  }
};

const run = async () => {
  console.log('🚀 Bắt đầu tải ảnh sản phẩm THẬT...');
  for (const product of productsToDownload) {
    await downloadImage(product.url, `${product.name}.jpg`);
  }
  console.log('🎉 Xong! Kiểm tra thư mục public/images/products');
};

run();