import { getJsonData } from '../../js/utils/helpers.js';

class HiraganaTable {
    constructor() {
        this.initialize();
    }

    async initialize() {
        // Load data từ JSON
        this.hiraganaData = await getJsonData('hiragana');
        
        // Render bảng
        this.renderTables();
        
        // Thêm event listeners
        this.addEventListeners();
    }

    renderTables() {
        this.renderSection('basicHiragana', this.hiraganaData.basic);
        this.renderSection('dakutenHiragana', [
            ...this.hiraganaData.dakuten,
            ...this.hiraganaData.handakuten
        ]);
    }

    renderSection(containerId, characters) {
        const container = document.getElementById(containerId);
        container.innerHTML = characters.map(char => `
            <div class="char-card">
                <div class="char-main">${char.char}</div>
                <div class="char-romaji">${char.romaji}</div>
            </div>
        `).join('');
    }

    addEventListeners() {
        // Toggle Romaji
        document.querySelector('.toggle-romaji').addEventListener('click', () => {
            document.querySelectorAll('.char-romaji').forEach(el => {
                el.classList.toggle('hidden');
            });
        });
    }
}

// Khởi tạo khi feature được load
new HiraganaTable();
