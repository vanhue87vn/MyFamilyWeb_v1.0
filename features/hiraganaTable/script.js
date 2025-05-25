import { getJsonData } from '../../js/utils/helpers.js';

export class HiraganaTable {
    constructor() {
        this.container = document.querySelector('.hiragana-table-container');
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderTable();
        this.addEventListeners();
    }

    async loadData() {
        this.hiraganaData = await getJsonData('hiragana');
    }

    renderTable() {
        this.renderSection('basicHiragana', this.hiraganaData.basic);
        this.renderSection('dakutenHiragana', [
            ...this.hiraganaData.dakuten,
            ...this.hiraganaData.handakuten
        ]);
    }

    renderSection(containerId, data) {
        const container = document.getElementById(containerId);
        container.innerHTML = data.map(char => `
            <div class="char-card">
                <div class="char-main">${char.char}</div>
                <div class="char-romaji">${char.romaji}</div>
            </div>
        `).join('');
    }

    addEventListeners() {
        // Toggle Romaji
        document.querySelector('.toggle-romaji').addEventListener('click', () => {
            this.container.classList.toggle('romaji-hidden');
        });
    }
}
