import TelegramAnalytics from '@telegram-apps/analytics';

TelegramAnalytics.init({
  token: 'eyJhcHBfbmFtZSI6InN0a19nYW1lcyIsImFwcF91cmwiOiJodHRwczovL3QubWUvZ2FtZXNfc3RrX2JvdCIsImFwcF9kb21haW4iOiJodHRwczovL3N0ay1nYW1lcy5uZXRsaWZ5LmFwcC8ifQ==!XNslm9OzZRn8dyUfHiKszMdE909M4xutouzRb9aTvnc=',
  appName: 'stk_games',
});

TelegramAnalytics.trackEvent('page_view', { path: window.location.pathname });

const slider = document.getElementById('viewSlider');
const toggle = document.getElementById('mode-toggle-checkbox');
const pageTitle = document.getElementById('page-title');

function updateView(isMulti) {
    if (isMulti) {
        slider.style.transform = 'translateX(-50%)';
        toggle.checked = true;
    } else {
        slider.style.transform = 'translateX(0%)';
        toggle.checked = false;
    }
}

if (toggle) {
    toggle.addEventListener('change', () => {
        updateView(toggle.checked);
        TelegramAnalytics.trackEvent('view_mode_changed', { mode: toggle.checked ? 'multi' : 'single' });
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
        TelegramAnalytics.trackEvent('game_clicked', {
            game_name: card.dataset.game
        });

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