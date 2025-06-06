// Thêm meta viewport nếu chưa có
if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.head.prepend(meta);
}

// Global touch detection
window.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    if (e.target.classList.contains('game-control')) {
        e.preventDefault();
    }
}, { passive: false });