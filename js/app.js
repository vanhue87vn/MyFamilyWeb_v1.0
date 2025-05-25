// Feature Configuration Object
// ----------------------------
// Định nghĩa tất cả tính năng và đường dẫn tương ứng
const features = {
    hiraganaTable: {
        name: 'Hiragana Table',
        path: 'features/hiraganaTable'
    },
    practiceDrillHiragana: {
        name: 'Practice Drill For Hiragana',
        path: 'features/practiceDrillHiragana'
    }
};

// Core Application Initialization
// -------------------------------
// Khởi chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', async () => {
    
    // Menu System Setup
    // -----------------
    // Tạo dynamic navigation menu từ features config
    const menuContainer = document.getElementById('mainMenu');
    
    // Tạo menu items
    for (const [key, feature] of Object.entries(features)) {
        const link = document.createElement('a');
        link.href = 'javascript:void(0)';
        link.textContent = feature.name;
        link.dataset.feature = key;
        menuContainer.appendChild(link);
    }

    // Feature Navigation Handler
    // --------------------------
    // Xử lý click chuyển đổi giữa các tính năng
    menuContainer.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A') {
            const featureKey = e.target.dataset.feature;
            await loadFeature(features[featureKey]);
        }
    });

    // Initial Load
    // ------------
    // Load tính năng mặc định khi khởi động
    await loadFeature(features.hiraganaTable);
});

// Feature Loader System
// ---------------------
// Hệ thống dynamic loading cho các tính năng
async function loadFeature(feature) {
    const container = document.getElementById('featureContainer');
    
    // 1. Load HTML Template
    const response = await fetch(`${feature.path}/index.html`);
    const html = await response.text();
    container.innerHTML = html;

    // 2. Inject Feature-specific CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${feature.path}/style.css`;
    document.head.appendChild(link);

    // 3. Load Feature Logic
    const script = document.createElement('script');
    script.src = `${feature.path}/script.js`;
    script.type = 'module'; // Giả định dùng ES modules
    document.body.appendChild(script);
}
