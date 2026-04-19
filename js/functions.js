document.addEventListener('DOMContentLoaded', () => {

    // ===== 学習ログ =====
    const LOG_KEY = 'lerns_logs';

    function readLogs() {
        try {
            return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        } catch {
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

    renderStats();

    // ===== 記録 =====
    const saveBtn = document.getElementById('save-time');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const subject = document.getElementById('subject-select')?.value;
            const minutes = parseInt(document.getElementById('study-minutes')?.value, 10) || 0;

            const logs = readLogs();
            logs.push({ subject, minutes, at: new Date().toISOString() });
            writeLogs(logs);

            alert('保存しました');
        });
    }

    // ===== PDF表示 =====
    const btnSchedule = document.getElementById('btn-view-schedule');
    if (btnSchedule) {
        btnSchedule.addEventListener('click', () => {
            const viewer = document.getElementById('pdfViewer');
            if (!viewer) return;

            const isHidden = viewer.style.display === 'none';
            viewer.style.display = isHidden ? 'block' : 'none';
        });
    }

    // ===== 動画 =====
    const select = document.getElementById('videoSelect');
    const frame = document.getElementById('videoFrame');

    if (select && frame) {
        select.addEventListener('change', () => {
            frame.src = `https://www.youtube.com/embed/${select.value}`;
        });
    }
