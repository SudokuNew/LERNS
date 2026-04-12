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

    // ===== ポモドーロタイマー（円形）=====
    let timerInterval = null;
    let totalTime = 25 * 60;
    let remaining = totalTime;
    let isRunning = false;

    const display = document.getElementById("timerTime");
    const startBtn = document.getElementById("timerStart");
    const pauseBtn = document.getElementById("timerPause");
    const resetBtn = document.getElementById("timerReset");

    // 🔵 円形リング
    const circle = document.getElementById("progressCircle");
    const radius = 90;
    const circumference = 2 * Math.PI * radius;

    if (circle) {
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = 0;
    }

    // 通知許可
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // 表示更新（時間＋リング）
    function updateDisplay() {
        const m = String(Math.floor(remaining / 60)).padStart(2, "0");
        const s = String(remaining % 60).padStart(2, "0");

        if (display) display.textContent = `${m}:${s}`;

        if (circle) {
            const progress = remaining / totalTime;
            const offset = circumference * (1 - progress);
            circle.style.strokeDashoffset = offset;

            // 色変化（おまけ）
            if (progress < 0.3) circle.style.stroke = "red";
            else if (progress < 0.6) circle.style.stroke = "orange";
            else circle.style.stroke = "#4caf50";
        }
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

        remaining = totalTime;
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
