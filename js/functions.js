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

/* Pomodoro 自動サイクル拡張 */
(function () {
    // 要素
    const pomPhaseEl = document.getElementById('pomPhase');
    const pomCountEl = document.getElementById('pomCount');
    const cfgWork = document.getElementById('cfgWork');
    const cfgShort = document.getElementById('cfgShort');
    const cfgLong = document.getElementById('cfgLong');
    const cfgInterval = document.getElementById('cfgInterval');
    const cfgAutoNext = document.getElementById('cfgAutoNext');

    if (!pomPhaseEl || !pomCountEl) {
        // 必要な要素がなければ何もしない
        return;
    }

    // 現在のフェーズ列挙
    const PHASE = { WORK: 'work', SHORT: 'short', LONG: 'long' };

    // state 拡張
    let pomState = {
        phase: PHASE.WORK,
        cycleCount: 0,        // 作業フェーズが完了した回数（サイクルカウンタ）
        completedCycles: 0,   // 完了した作業回数の累積（任意）
        config: {
            work: Number(cfgWork?.value) || 25,
            short: Number(cfgShort?.value) || 5,
            long: Number(cfgLong?.value) || 15,
            interval: Number(cfgInterval?.value) || 4,
            autoNext: !!(cfgAutoNext?.checked)
        }
    };

    const STORAGE_KEY_POM = 'study_pom_state_v1';

    // ユーティリティ：現在のフェーズに応じた分数を返す
    function minutesForPhase(phase) {
        if (phase === PHASE.WORK) return pomState.config.work;
        if (phase === PHASE.SHORT) return pomState.config.short;
        return pomState.config.long;
    }

    // フェーズ表示更新
    function renderPomMeta() {
        pomPhaseEl.textContent = `フェーズ: ${pomState.phase === PHASE.WORK ? '作業' : pomState.phase === PHASE.SHORT ? '短休憩' : '長休憩'}`;
        pomCountEl.textContent = `サイクル: ${pomState.cycleCount}`;
    }

    // 設定変更時の反映
    function applySettingsToTimer() {
        pomState.config.work = Math.max(1, Number(cfgWork.value) || 25);
        pomState.config.short = Math.max(1, Number(cfgShort.value) || 5);
        pomState.config.long = Math.max(1, Number(cfgLong.value) || 15);
        pomState.config.interval = Math.max(1, Number(cfgInterval.value) || 4);
        pomState.config.autoNext = !!cfgAutoNext.checked;

        // 現在のフェーズの duration を更新（remaining を相対保つ場合は調整可）
        duration = minutesForPhase(pomState.phase) * 60;
        remaining = Math.min(remaining, duration);
        render();
        persistAll();
    }

    // フェーズ遷移（自動サイクルロジック）
    function advancePhaseOnFinish() {
        if (pomState.phase === PHASE.WORK) {
            pomState.cycleCount += 1;
            pomState.completedCycles += 1;
            // long break 判定
            if (pomState.cycleCount % pomState.config.interval === 0) {
                pomState.phase = PHASE.LONG;
            } else {
                pomState.phase = PHASE.SHORT;
            }
        } else {
            // 休憩が終わったら作業に戻る
            pomState.phase = PHASE.WORK;
        }

        // 新しいフェーズの長さをセット
        duration = minutesForPhase(pomState.phase) * 60;
        remaining = duration;
        renderPomMeta();
        render(); // タイマー表示を更新
        persistAll();

        // 自動で次に進むかどうか
        if (pomState.config.autoNext) {
            // 少し待ってから自動開始（視覚的区切りをつける）
            setTimeout(() => {
                startTimer(); // startTimer は既存タイマーモジュールで定義されている関数
            }, 800);
        } else {
            // 自動開始しない場合は一旦停止してユーザー操作を待つ
            stopTimer();
        }
    }

    // 永続化（既存 persistState と合わせる）
    function persistAll() {
        try {
            const st = {
                pom: pomState,
                timer: { duration, remaining, running, timestamp: Date.now() }
            };
            localStorage.setItem(STORAGE_KEY_POM, JSON.stringify(st));
        } catch (e) { /* ignore */ }
    }

    // 復元
    function restoreAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_POM);
            if (!raw) return;
            const s = JSON.parse(raw);
            if (!s) return;
            if (s.pom) {
                pomState = Object.assign(pomState, s.pom);
            }
            if (s.timer) {
                duration = s.timer.duration || duration;
                remaining = s.timer.remaining ?? duration;
                // running は復元と時間差考慮で resume するロジックを既存 restoreState に合わせて行う
                if (s.timer.running) {
                    const elapsed = Math.floor((Date.now() - (s.timer.timestamp || Date.now())) / 1000);
                    remaining = Math.max(0, (s.timer.remaining ?? duration) - elapsed);
                    if (remaining > 0) startTimer();
                }
            }
            renderPomMeta();
            render();
        } catch (e) { /* ignore */ }
    }

    // タイマー完了時のハンドラ差し替え（既存 tick 内の完了処理を置換または呼び出す）
    // 既存の tick または完了処理で下記を呼ぶようにしてください:
    //   onTimerFinished(); 
    function onTimerFinished() {
        // 既存の完了動作（音、振動、通知）は既存コードに任せる
        // ここではフェーズ遷移を行う
        advancePhaseOnFinish();
    }

    // イベント：設定要素に変化があれば反映
    [cfgWork, cfgShort, cfgLong, cfgInterval, cfgAutoNext].forEach(el => {
        if (!el) return;
        el.addEventListener('change', () => applySettingsToTimer());
    });

    // 初期復元
    restoreAll();

    // expose for debugging
    window.__pom = {
        state: () => pomState,
        nextPhase: () => advancePhaseOnFinish(),
        applySettings: () => applySettingsToTimer()
    };

    // 注意: onTimerFinished を使うには既存タイマーモジュールの完了ルートで onTimerFinished() を呼ぶように統合してください。
})();