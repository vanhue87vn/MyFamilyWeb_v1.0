const features = {
    hiraganaTable: {
        name: 'Hiragana Table',
        path: 'features/hiraganaTable'
    },
    practiceDrill: {
        name: 'Practice Drill For Hiragana',
        path: 'features/practiceDrill'
    }
};

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', async () => {
    // Load menu chính
    const menuContainer = document.getElementById('mainMenu');
    for (const [key, feature] of Object.entries(features)) {
        const button = document.createElement('button');
        button.textContent = feature.name;
        button.dataset.feature = key;
        menuContainer.appendChild(button);
    }

    // Xử lý chuyển trang
    menuContainer.addEventListener('click', async (e) => {
        if (e.target.tagName === 'BUTTON') {
            const featureKey = e.target.dataset.feature;
            await loadFeature(features[featureKey]);
        }
    });

    // Load feature mặc định
    await loadFeature(features.hiraganaTable);
});

async function loadFeature(feature) {
    const container = document.getElementById('featureContainer');
    
    // Load HTML
    const response = await fetch(`${feature.path}/index.html`);
    const html = await response.text();
    container.innerHTML = html;

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${feature.path}/style.css`;
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = `${feature.path}/script.js`;
    script.type = 'module';
    document.body.appendChild(script);
}
