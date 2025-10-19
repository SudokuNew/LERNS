/* Service worker registration (PWA) */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {/* ignore */ });
}

/* App logic: logs, UI, modals */
(function () {
    const LOG_KEY = 'lerns_logs';
    function readLogs() { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch (e) { return []; } }
    function writeLogs(logs) { localStorage.setItem(LOG_KEY, JSON.stringify(logs)); renderStats(); }
    function renderStats() {
        const logs = readLogs();
        const total = logs.reduce((s, l) => s + (l.minutes || 0), 0);
        const el = document.getElementById('total-time');
        if (el) el.textContent = `合計学習時間: ${total} 分`;
    }

    function openModal(modal) { modal.setAttribute('aria-hidden', 'false'); modal.querySelector('input,select,button')?.focus(); document.body.style.overflow = 'hidden'; }
    function closeModal(modal) { modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

    document.addEventListener('DOMContentLoaded', function () {
        renderStats();

        const btnLog = document.getElementById('btn-log-time');
        const btnSchedule = document.getElementById('btn-view-schedule');
        const logModal = document.getElementById('log-time-modal');
        const scheduleModal = document.getElementById('schedule-modal');

        btnLog.addEventListener('click', () => openModal(logModal));
        btnSchedule.addEventListener('click', () => {
            const viewer = document.getElementById('pdfViewer');
            const isHidden = window.getComputedStyle(viewer).display === 'none';
            if (isHidden) {
                viewer.style.display = 'block';
                btnSchedule.textContent = '計画表を閉じる';
                btnSchedule.setAttribute('aria-expanded', 'true');
                viewer.querySelector('iframe')?.focus();
            } else {
                viewer.style.display = 'none';
                btnSchedule.textContent = '計画表を見る';
                btnSchedule.setAttribute('aria-expanded', 'false');
                btnSchedule.focus();
            }
        });


        document.querySelectorAll('[data-action="close-modal"]').forEach(b => {
            b.addEventListener('click', e => closeModal(e.target.closest('.modal')));
        });

        document.getElementById('save-time').addEventListener('click', () => {
            const subject = document.getElementById('subject-select').value;
            const minutes = parseInt(document.getElementById('study-minutes').value, 10) || 0;
            const logs = readLogs();
            logs.push({ subject, minutes, at: new Date().toISOString() });
            writeLogs(logs);
            alert('保存しました');
            closeModal(logModal);
        });

        document.addEventListener('DOMContentLoaded', function () {
            // 既存処理...
            const btnSchedule = document.getElementById('btn-view-schedule');

            // PDF表示の開閉（トグル）
            btnSchedule.addEventListener('click', () => {
                const viewer = document.getElementById('pdfViewer');
                const isHidden = window.getComputedStyle(viewer).display === 'none';
                if (isHidden) {
                    viewer.style.display = 'block';
                    btnSchedule.textContent = '計画表を閉じる';
                    btnSchedule.setAttribute('aria-expanded', 'true');
                    viewer.querySelector('iframe')?.focus();
                } else {
                    viewer.style.display = 'none';
                    btnSchedule.textContent = '計画表を見る';
                    btnSchedule.setAttribute('aria-expanded', 'false');
                    btnSchedule.focus();
                }
            });

            // 既存の btnSchedule に対するモーダルを開く処理があれば削除または無効化してください
            // 例: btnSchedule.addEventListener('click', () => { renderSchedule(); openModal(scheduleModal); });
        });

        // 要素参照
        const btnPrev = document.getElementById('btn-video-prev');
        const btnNext = document.getElementById('btn-video-next');
        const btnToggle = document.getElementById('btn-toggle-video');
        const select = document.getElementById('videoSelect');
        const frame = document.getElementById('videoFrame');
        const playerWrapper = document.getElementById('videoPlayer');

        // 選択リストのインデックス管理
        function setVideoByIndex(idx) {
            const options = Array.from(select.options);
            if (idx < 0) idx = 0;
            if (idx >= options.length) idx = options.length - 1;
            select.selectedIndex = idx;
            const id = options[idx].value;
            frame.src = `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
        }

        // 前・次ボタン
        btnPrev.addEventListener('click', () => {
            const idx = select.selectedIndex - 1;
            setVideoByIndex(idx);
        });

        btnNext.addEventListener('click', () => {
            const idx = select.selectedIndex + 1;
            setVideoByIndex(idx);
        });

        // select で選んだら即切替（自動再生）
        select.addEventListener('change', () => {
            const id = select.value;
            frame.src = `https://www.youtube.com/embed/${id}?rel=0&autoplay=1`;
        });

        // 再生ボタン（下部）
        btnToggle.addEventListener('click', () => {
            const isHidden = window.getComputedStyle(playerWrapper).display === 'none';
            if (isHidden) {
                playerWrapper.style.display = 'block';
                btnToggle.textContent = '閉じる';
                btnToggle.setAttribute('aria-expanded', 'true');
                // フォーカスを iframe に移す（任意）
                frame.focus();
            } else {
                playerWrapper.style.display = 'none';
                btnToggle.textContent = '再生';
                btnToggle.setAttribute('aria-expanded', 'false');
                // 再生停止のため iframe をリセット（任意）
                frame.src = '';
                // 初期srcに戻しておく（次回表示時に select の選択を反映）
                setTimeout(() => {
                    const id = select.value;
                    frame.src = `https://www.youtube.com/embed/${id}?rel=0`;
                }, 0);
            }
        });

        function renderSchedule() {
            const container = document.getElementById('schedule-content');
            const logs = readLogs();
            if (logs.length === 0) {
                container.innerHTML = '<p>記録がありません</p>';
                return;
            }
            const list = logs.map(l => {
                const t = new Date(l.at);
                return `<div style="padding:8px;border-bottom:1px solid #eee"><strong>${l.subject}</strong> — ${l.minutes} 分<div style="font-size:12px;color:#666">${t.toLocaleString()}</div></div>`;
            }).join('');
            container.innerHTML = list;
        }
    });
})();

/* Intro video overlay logic: try autoplay muted, allow skip/unmute, show only once */
(function () {
    const INTRO_KEY = 'lerns_intro_shown';
    try { if (localStorage.getItem(INTRO_KEY)) { document.getElementById('intro-overlay')?.remove(); } } catch (e) { }
    const overlay = document.getElementById('intro-overlay');
    const video = document.getElementById('intro-video');
    const skipBtn = document.getElementById('skip-btn');
    const unmuteBtn = document.getElementById('unmute-btn');
    if (!overlay || !video) return;

    const closeOverlay = () => { try { video.pause(); } catch (e) { } overlay.style.display = 'none'; overlay.setAttribute('aria-hidden', 'true'); try { localStorage.setItem(INTRO_KEY, '1'); } catch (e) { } };
    skipBtn.addEventListener('click', closeOverlay);
    unmuteBtn.addEventListener('click', () => {
        try { video.muted = false; video.play().catch(() => { }); } catch (e) { } setTimeout(closeOverlay, 600);
    });
    video.addEventListener('ended', closeOverlay);

    const tryPlay = async () => {
        try {
            await video.play();
            setTimeout(() => { unmuteBtn.style.display = 'inline-block'; }, 500);
        } catch (e) {
            unmuteBtn.style.display = 'inline-block';
        }
    };
    document.addEventListener('DOMContentLoaded', tryPlay);
})();

/* Timer module */
(function () {
    const STORAGE_KEY = 'study_timer_state_v1';

    const el = {
        section: document.getElementById('studyTimerSection'),
        time: document.getElementById('timerTime'),
        mode: document.getElementById('timerMode'),
        btnStart: document.getElementById('timerStart'),
        btnPause: document.getElementById('timerPause'),
        btnReset: document.getElementById('timerReset'),
        presets: document.querySelectorAll('.timer-preset'),
        soundOpt: document.getElementById('timerSound'),
        vibrateOpt: document.getElementById('timerVibrate')
    };
    if (!el.section) return;

    // state
    let duration = 25 * 60; // seconds
    let remaining = duration;
    let timerId = null;
    let running = false;

    // simple beep (Web Audio)
    let audioCtx = null;
    function playBeep() {
        if (!el.soundOpt.checked) return;
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.type = 'sine';
            o.frequency.value = 880;
            g.gain.value = 0.08;
            o.connect(g); g.connect(audioCtx.destination);
            o.start();
            setTimeout(() => {
                o.stop();
            }, 300);
        } catch (e) { /* ignore */ }
    }

    function vibrate() {
        if (el.vibrateOpt.checked && navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    function formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function render() {
        el.time.textContent = formatTime(remaining);
    }

    function tick() {
        if (remaining <= 0) {
            stopTimer();
            playBeep();
            vibrate();
            el.section.classList.add('timer-done');
            // 視覚的に数秒ハイライト
            setTimeout(() => el.section.classList.remove('timer-done'), 3000);
            // Notification API（権限があれば）
            if (window.Notification && Notification.permission === 'granted') {
                try { new Notification('タイマー完了', { body: '時間になりました。休憩や次のタスクへ移ってください。' }); } catch (e) { }
            }
            return;
        }
        remaining--;
        render();
        persistState();
    }

    function startTimer() {
        if (running) return;
        running = true;
        el.btnStart.disabled = true;
        el.btnPause.disabled = false;
        // resume AudioContext on user gesture
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => { });
        timerId = setInterval(tick, 1000);
        persistState();
    }

    function pauseTimer() {
        if (!running) return;
        running = false;
        el.btnStart.disabled = false;
        el.btnPause.disabled = true;
        clearInterval(timerId); timerId = null;
        persistState();
    }

    function stopTimer() {
        running = false;
        clearInterval(timerId); timerId = null;
        el.btnStart.disabled = false;
        el.btnPause.disabled = true;
        persistState();
    }

    function resetTimer() {
        remaining = duration;
        render();
        stopTimer();
        persistState();
    }

    function setDurationFromMinutes(min, label) {
        duration = Math.max(1, Math.floor(min)) * 60;
        remaining = duration;
        el.mode.textContent = label || `${min}分`;
        render();
        persistState();
    }

    function persistState() {
        const state = {
            duration, remaining, running, timestamp: Date.now(), modeText: el.mode.textContent,
            sound: !!el.soundOpt.checked, vibrate: !!el.vibrateOpt.checked
        };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { }
    }

    function restoreState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const s = JSON.parse(raw);
            if (!s) return;
            duration = s.duration || duration;
            remaining = s.remaining ?? duration;
            el.mode.textContent = s.modeText || el.mode.textContent;
            el.soundOpt.checked = !!s.sound;
            el.vibrateOpt.checked = !!s.vibrate;
            render();
            if (s.running) {
                // If was running, resume but compensate for elapsed time
                const elapsed = Math.floor((Date.now() - (s.timestamp || Date.now())) / 1000);
                remaining = Math.max(0, (s.remaining ?? duration) - elapsed);
                if (remaining === 0) {
                    render();
                    return;
                }
                startTimer();
            }
        } catch (e) { /* ignore */ }
    }

    // event wiring
    el.btnStart.addEventListener('click', () => {
        // request Notification permission on first user action
        if (window.Notification && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => { });
        }
        startTimer();
    });
    el.btnPause.addEventListener('click', () => pauseTimer());
    el.btnReset.addEventListener('click', () => resetTimer());

    el.presets.forEach(btn => {
        btn.addEventListener('click', (ev) => {
            const min = Number(btn.dataset.min) || 25;
            const label = btn.textContent.trim();
            setDurationFromMinutes(min, label);
        });
    });

    // keyboard accessibility: space/enter on section toggles start/pause
    el.section.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); if (running) pauseTimer(); else startTimer(); }
        if (e.key === 'r' || e.key === 'R') { resetTimer(); }
    });

    // init
    render();
    restoreState();

    // expose for debugging (optional)
    window.__studyTimer = {
        setMinutes: (m) => setDurationFromMinutes(m, `${m}分`),
        getState: () => ({ duration, remaining, running })
    };
})();