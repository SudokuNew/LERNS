/* Service worker registration (PWA) */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => { });
}

/* App logic */
(function () {
    const LOG_KEY = 'lerns_logs';

    function readLogs() {
        try {
            return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function writeLogs(logs) {
        localStorage.setItem(LOG_KEY, JSON.stringify(logs));
        renderStats();
    }

    function renderStats() {
        const logs = readLogs();
        const total = logs.reduce((s, l) => s + (l.minutes || 0), 0);
        const el = document.getElementById('total-time');
        if (el) el.textContent = `合計学習時間: ${total} 分`;
    }

    function openModal(modal) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        modal.querySelector('input,select,button')?.focus();
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.addEventListener('DOMContentLoaded', function () {

        // ===== 基本UI =====
        renderStats();

        const btnLog = document.getElementById('btn-log-time');
        const btnSchedule = document.getElementById('btn-view-schedule');
        const logModal = document.getElementById('log-time-modal');

        if (btnLog) {
            btnLog.addEventListener('click', () => openModal(logModal));
        }

        if (btnSchedule) {
            btnSchedule.addEventListener('click', () => {
                const viewer = document.getElementById('pdfViewer');
                if (!viewer) return;

                const isHidden = window.getComputedStyle(viewer).display === 'none';
                if (isHidden) {
                    viewer.style.display = 'block';
                    btnSchedule.textContent = '計画表を閉じる';
                    btnSchedule.setAttribute('aria-expanded', 'true');
                } else {
                    viewer.style.display = 'none';
                    btnSchedule.textContent = '計画表を見る';
                    btnSchedule.setAttribute('aria-expanded', 'false');
                }
            });
        }

        document.querySelectorAll('[data-action="close-modal"]').forEach(b => {
            b.addEventListener('click', e => closeModal(e.target.closest('.modal')));
        });

        const saveBtn = document.getElementById('save-time');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const subject = document.getElementById('subject-select')?.value;
                const minutes = parseInt(document.getElementById('study-minutes')?.value, 10) || 0;
                const logs = readLogs();
                logs.push({ subject, minutes, at: new Date().toISOString() });
                writeLogs(logs);
                alert('保存しました');
                closeModal(logModal);
            });
        }

        // ===== 動画機能 =====
        const btnPrev = document.getElementById('btn-video-prev');
        const btnNext = document.getElementById('btn-video-next');
        const btnToggle = document.getElementById('btn-toggle-video');
        const select = document.getElementById('videoSelect');
        const frame = document.getElementById('videoFrame');
        const playerWrapper = document.getElementById('videoPlayer');

        function setVideoByIndex(idx) {
            if (!select || !frame) return;
            const options = Array.from(select.options);
            if (idx < 0) idx = 0;
            if (idx >= options.length) idx = options.length - 1;
            select.selectedIndex = idx;
            frame.src = `https://www.youtube.com/embed/${options[idx].value}?rel=0&autoplay=1`;
        }

        if (btnPrev && select) {
            btnPrev.addEventListener('click', () => setVideoByIndex(select.selectedIndex - 1));
        }

        if (btnNext && select) {
            btnNext.addEventListener('click', () => setVideoByIndex(select.selectedIndex + 1));
        }

        if (select && frame) {
            select.addEventListener('change', () => {
                frame.src = `https://www.youtube.com/embed/${select.value}?rel=0&autoplay=1`;
            });
        }

        if (btnToggle && playerWrapper && frame && select) {
            btnToggle.addEventListener('click', () => {
                const isHidden = window.getComputedStyle(playerWrapper).display === 'none';
                if (isHidden) {
                    playerWrapper.style.display = 'block';
                    btnToggle.textContent = '閉じる';
                } else {
                    playerWrapper.style.display = 'none';
                    btnToggle.textContent = '再生';
                    frame.src = '';
                }
            });
        }

        // ===== Intro動画 =====
        (function () {
            const overlay = document.getElementById('intro-overlay');
            const video = document.getElementById('intro-video');
            if (!overlay || !video) return;

            const close = () => {
                video.pause();
                overlay.style.display = 'none';
            };

            document.getElementById('skip-btn')?.addEventListener('click', close);
            video.addEventListener('ended', close);

            video.play().catch(() => { });
        })();

        // ===== スタートボタン =====
        const startBtn = document.getElementById("start");
        if (startBtn && typeof startTimer === 'function') {
            startBtn.addEventListener("click", startTimer);
        }

    });

})();
