document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById('viewSlider');
    const toggle = document.getElementById('mode-toggle-checkbox');

    function updateView(isMulti) {
        if (!slider || !toggle) return;
        if (isMulti) {
            slider.style.transform = 'translateX(-50%)';
            toggle.checked = true;
        } else {
            slider.style.transform = 'translateX(0%)';
            toggle.checked = false;
        }
    }

    if (toggle) {
        updateView(toggle.checked);
        toggle.addEventListener('change', () => {
            updateView(toggle.checked);
            if (window.telegramAnalytics) {
                window.telegramAnalytics.trackEvent('view_mode_changed', { mode: toggle.checked ? 'multi' : 'single' });
            }
        });
    }

    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        const threshold = 60;
        if (touchStartX - touchEndX > threshold) updateView(true);
        if (touchEndX - touchStartX > threshold) updateView(false);
    }, { passive: true });

    document.querySelectorAll(".game-card").forEach(card => {
        card.addEventListener("click", () => {
            if (window.telegramAnalytics) {
                window.telegramAnalytics.trackEvent('game_clicked', {
                    game_name: card.dataset.game
                });
            }
            localStorage.setItem("lastGame", JSON.stringify({
                name: card.dataset.game,
                href: card.getAttribute("href")
            }));
        });
    });

    const lastGame = JSON.parse(localStorage.getItem("lastGame"));
    if (lastGame) {
        const section = document.getElementById("continueSection");
        const link = document.getElementById("continueLink");
        const title = document.getElementById("continueTitle");
        
        if (title && link && section) {
            title.textContent = lastGame.name;
            link.href = lastGame.href;
            section.classList.remove("hidden");
        }
    }
});