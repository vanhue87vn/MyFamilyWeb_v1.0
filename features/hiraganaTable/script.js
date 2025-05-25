// features/hiraganaTable/script.js

import { getJsonData } from '../../js/utils/helpers.js';

/**
 * Lớp chính quản lý bảng Hiragana
 * Cấu trúc chính:
 * 1. Constructor -> Khởi tạo
 * 2. initialize() -> Entry point chính
 * 3. renderTables() -> Xử lý hiển thị
 * 4. renderSection() -> Tạo HTML cho từng section
 * 5. addEventListeners() -> Xử lý tương tác người dùng
 */
class HiraganaTable {
    constructor() {
        // Phần khởi tạo ban đầu
        this.initialize();
    }

    /**
     * Entry point chính của feature
     * Flow: Load data -> Render -> Thêm event listeners
     */
    async initialize() {
        try {
            // [PHẦN LOAD DATA] - Có thể thêm loading indicator ở đây
            this.hiraganaData = await getJsonData('hiragana');
            console.log('Hiragana Data:', this.hiraganaData);
            
            if (!this.hiraganaData) {
                console.error('Không tải được dữ liệu');
                return;
            }
            
            // [PHẦN RENDER] - Xử lý hiển thị chính
            this.renderTables();
            
            // [PHẦN INTERACTION] - Thêm các xử lý tương tác
            this.addEventListeners();
        } catch (error) {
            console.error('Lỗi khởi tạo:', error);
        }
    }

    /**
     * Điều phối việc render các section
     * Có thể thêm các section mới ở đây
     */
    renderTables() {
        // [SECTION CƠ BẢN] - Render bảng chính
        this.renderSection('basicHiragana', this.hiraganaData.basic);
        
        // [SECTION ÂM ĐỤC] - Kết hợp dakuten + handakuten
        this.renderSection('dakutenHiragana', [
            ...this.hiraganaData.dakuten,
            ...this.hiraganaData.handakuten
        ]);
        
        // Có thể thêm section mới ở đây
        // this.renderSection('yoonHiragana', this.hiraganaData.yoon);
    }

    /**
     * Tạo HTML cho từng nhóm chữ cái
     * @param {string} containerId - ID của DOM container
     * @param {Array} characters - Danh sách ký tự cần render
     */
    renderSection(containerId, characters) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Không tìm thấy container: ${containerId}`);
            return;
        }
        
        // [TEMPLATE] - Tạo thẻ card cho từng ký tự
        container.innerHTML = characters.map(char => `
            <div class="char-card">
                <div class="char-main">${char.char}</div>
                <div class="char-romaji">${char.romaji}</div>
            </div>
        `).join('');
    }

    /**
     * Thêm các xử lý sự kiện
     * Có thể thêm event listeners mới ở đây
     */
    addEventListeners() {
        // [TOGGLE ROMAJI] - Xử lý ẩn/hiện romaji
        const toggleBtn = document.querySelector('.toggle-romaji');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.querySelectorAll('.char-romaji').forEach(el => {
                    el.classList.toggle('hidden');
                });
            });
        }
        
        // Có thể thêm event listeners khác ở đây
    }
}

// [INITIALIZATION] - Khởi tạo feature khi load
new HiraganaTable();
