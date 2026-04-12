document.addEventListener('DOMContentLoaded', () => {

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

    // ===== スタート =====
    const startBtn = document.getElementById('start');
    if (startBtn && typeof startTimer === 'function') {
        startBtn.addEventListener('click', startTimer);
    }

});

// ===== ポモドーロタイマー（修正版）=====
document.addEventListener("DOMContentLoaded", () => {

    let timerInterval = null;
    let remaining = 25 * 60;
    let isRunning = false;

    const display = document.getElementById("timerTime");
    const startBtn = document.getElementById("timerStart");
    const pauseBtn = document.getElementById("timerPause");
    const resetBtn = document.getElementById("timerReset");

    // 通知許可
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // 表示更新
    function updateDisplay() {
        const m = String(Math.floor(remaining / 60)).padStart(2, "0");
        const s = String(remaining % 60).padStart(2, "0");
        if (display) display.textContent = `${m}:${s}`;
    }

    // 開始
    function startTimer() {
        if (isRunning) return;

        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;

        timerInterval = setInterval(() => {
            remaining--;
            updateDisplay();

            if (remaining <= 0) {
                clearInterval(timerInterval);
                isRunning = false;

                startBtn.disabled = false;
                pauseBtn.disabled = true;

                if ("Notification" in window && Notification.permission === "granted") {
                    new Notification("ポモドーロ終了！", {
                        body: "休憩しましょう！"
                    });
                } else {
                    alert("ポモドーロ終了！");
                }
            }
        }, 1000);
    }

    // 一時停止
    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;

        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    // リセット
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;

        remaining = 25 * 60;
        updateDisplay();

        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }

    // ボタン接続
    startBtn?.addEventListener("click", startTimer);
    pauseBtn?.addEventListener("click", pauseTimer);
    resetBtn?.addEventListener("click", resetTimer);

    updateDisplay();
});
