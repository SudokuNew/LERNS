/**
 * timer.js — ポモドーロ / タイマー / ストップウォッチ 統合モジュール
 * LERNS プロジェクト用
 *
 * functions.js のタイマー関連コードをすべてこちらに移行してください。
 * functions.js から以下のブロックを削除してください：
 *   - ポモドーロタイマー（円形）のコード全体（// ===== ポモドーロタイマー～末尾まで）
 */

document.addEventListener('DOMContentLoaded', () => {

    // =====================================================================
    // 定数
    // =====================================================================

    const CIRC = 2 * Math.PI * 90; // r=90 の円周長

    // =====================================================================
    // ユーティリティ
    // =====================================================================

    function fmt(totalSec) {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function setRing(el, ratio) {
        if (!el) return;
        el.style.strokeDasharray  = CIRC;
        el.style.strokeDashoffset = CIRC * (1 - Math.max(0, Math.min(1, ratio)));
    }

    function setRingColor(el, ratio) {
        if (!el) return;
        if (ratio > 0.6)      el.style.stroke = '#4caf50';
        else if (ratio > 0.3) el.style.stroke = 'orange';
        else                  el.style.stroke = '#e53935';
    }

    // =====================================================================
    // スライドカルーセル
    // =====================================================================

    const track     = document.getElementById('timer-track');
    const tabs      = Array.from(document.querySelectorAll('.timer-tab'));
    const dots      = Array.from(document.querySelectorAll('.timer-dot'));
    const pillInd   = document.getElementById('timer-pill-ind');
    const pillTrack = document.getElementById('timer-pill-track');

    let currentMode = 0;

    function slideTo(idx, smooth = true) {
        currentMode = idx;
        if (track) {
            track.style.transition = smooth
                ? 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none';
            track.style.transform = `translateX(${-idx * 100}%)`;
        }
        tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('on',     i === idx));

        // ピルインジケーター位置
        if (pillInd && pillTrack) {
            const tabEls = pillTrack.querySelectorAll('.timer-tab');
            const active = tabEls[idx];
            if (active) {
                pillInd.style.left  = active.offsetLeft  + 'px';
                pillInd.style.width = active.offsetWidth + 'px';
            }
        }
    }

    tabs.forEach(t => t.addEventListener('click', () => slideTo(+t.dataset.idx)));
    dots.forEach(d => d.addEventListener('click', () => slideTo(+d.dataset.idx)));

    // スワイプ対応（iPhone）
    let swipeX0 = null, swipeY0 = null;
    const viewport = document.getElementById('timer-viewport');
    if (viewport) {
        viewport.addEventListener('touchstart', e => {
            swipeX0 = e.touches[0].clientX;
            swipeY0 = e.touches[0].clientY;
        }, { passive: true });

        viewport.addEventListener('touchend', e => {
            if (swipeX0 === null) return;
            const dx = e.changedTouches[0].clientX - swipeX0;
            const dy = e.changedTouches[0].clientY - swipeY0;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                if (dx < 0 && currentMode < 2) slideTo(currentMode + 1);
                else if (dx > 0 && currentMode > 0) slideTo(currentMode - 1);
            }
            swipeX0 = swipeY0 = null;
        });
    }

    // 初期位置（アニメなし）
    setTimeout(() => slideTo(0, false), 50);

    // =====================================================================
    // ポモドーロタイマー
    // =====================================================================

    const POMO_WORK  = 25 * 60;
    const POMO_BREAK =  5 * 60;

    let pTotal   = POMO_WORK;
    let pRem     = POMO_WORK;
    let pRun     = false;
    let pItv     = null;
    let pSession = 1;
    let pIsBreak = false;

    const pRing    = document.getElementById('pomo-ring');
    const pTimeEl  = document.getElementById('pomo-time');
    const pPhaseEl = document.getElementById('pomo-phase');
    const pStartBtn = document.getElementById('pomo-start');
    const pPauseBtn = document.getElementById('pomo-pause');
    const pResetBtn = document.getElementById('pomo-reset');

    function pUpdate() {
        if (pTimeEl)  pTimeEl.textContent = fmt(pRem);
        const ratio = pRem / pTotal;
        setRing(pRing, ratio);
        setRingColor(pRing, ratio);
    }

    function pFinish() {
        clearInterval(pItv);
        pRun = false;
        if (pStartBtn) pStartBtn.disabled = false;
        if (pPauseBtn) pPauseBtn.disabled = true;

        if (!pIsBreak) {
            // 休憩へ
            pIsBreak = true;
            pTotal = POMO_BREAK;
            pRem   = POMO_BREAK;
            if (pPhaseEl) pPhaseEl.textContent = `休憩中 — セッション ${pSession}/4`;
        } else {
            // 次の集中へ
            pIsBreak = false;
            pSession = pSession < 4 ? pSession + 1 : 1;
            pTotal = POMO_WORK;
            pRem   = POMO_WORK;
            if (pPhaseEl) pPhaseEl.textContent = `集中セッション ${pSession}/4`;
        }
        pUpdate();

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(pIsBreak ? '休憩終了！' : 'ポモドーロ終了！', {
                body: pIsBreak ? '次の集中セッションへ' : '5分間休憩しましょう'
            });
        }
    }

    pStartBtn?.addEventListener('click', () => {
        if (pRun) return;
        pRun = true;
        if (pStartBtn) pStartBtn.disabled = true;
        if (pPauseBtn) pPauseBtn.disabled = false;
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        pItv = setInterval(() => { pRem--; pUpdate(); if (pRem <= 0) pFinish(); }, 1000);
    });

    pPauseBtn?.addEventListener('click', () => {
        clearInterval(pItv);
        pRun = false;
        if (pStartBtn) pStartBtn.disabled = false;
        if (pPauseBtn) pPauseBtn.disabled = true;
    });

    pResetBtn?.addEventListener('click', () => {
        clearInterval(pItv);
        pRun = false;
        pIsBreak = false;
        pSession = 1;
        pTotal = POMO_WORK;
        pRem   = POMO_WORK;
        pUpdate();
        if (pPhaseEl) pPhaseEl.textContent = `集中セッション 1/4`;
        if (pStartBtn) pStartBtn.disabled = false;
        if (pPauseBtn) pPauseBtn.disabled = true;
    });

    pUpdate();

    // =====================================================================
    // カスタムタイマー
    // =====================================================================

    let cTotal  = 10 * 60;
    let cRem    = 10 * 60;
    let cRun    = false;
    let cItv    = null;

    const cRing      = document.getElementById('ctimer-ring');
    const cTimeEl    = document.getElementById('ctimer-time');
    const cMmInput   = document.getElementById('ctimer-mm');
    const cSsInput   = document.getElementById('ctimer-ss');
    const cInputArea = document.getElementById('ctimer-inputs');
    const cStartBtn  = document.getElementById('ctimer-start');
    const cPauseBtn  = document.getElementById('ctimer-pause');
    const cResetBtn  = document.getElementById('ctimer-reset');

    function cReadInput() {
        const m = Math.max(0, parseInt(cMmInput?.value) || 0);
        const s = Math.max(0, Math.min(59, parseInt(cSsInput?.value) || 0));
        cTotal = (m * 60 + s) || 60;
        cRem   = cTotal;
    }

    function cUpdate() {
        if (cTimeEl) cTimeEl.textContent = fmt(cRem);
        setRing(cRing, cRem / cTotal);
    }

    [cMmInput, cSsInput].forEach(el => {
        el?.addEventListener('change', () => { if (!cRun) { cReadInput(); cUpdate(); } });
    });

    cStartBtn?.addEventListener('click', () => {
        if (cRun) return;
        cReadInput();
        cUpdate();
        cRun = true;
        if (cStartBtn) cStartBtn.disabled = true;
        if (cPauseBtn) cPauseBtn.disabled = false;
        if (cInputArea) cInputArea.style.opacity = '0.4';
        cItv = setInterval(() => {
            cRem--;
            cUpdate();
            if (cRem <= 0) {
                clearInterval(cItv);
                cRun = false;
                if (cStartBtn) cStartBtn.disabled = false;
                if (cPauseBtn) cPauseBtn.disabled = true;
                if (cInputArea) cInputArea.style.opacity = '1';
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('タイマー終了！', { body: '設定した時間が経過しました' });
                }
            }
        }, 1000);
    });

    cPauseBtn?.addEventListener('click', () => {
        clearInterval(cItv);
        cRun = false;
        if (cStartBtn) cStartBtn.disabled = false;
        if (cPauseBtn) cPauseBtn.disabled = true;
    });

    cResetBtn?.addEventListener('click', () => {
        clearInterval(cItv);
        cRun = false;
        cReadInput();
        cUpdate();
        if (cStartBtn) cStartBtn.disabled = false;
        if (cPauseBtn) cPauseBtn.disabled = true;
        if (cInputArea) cInputArea.style.opacity = '1';
    });

    cUpdate();

    // =====================================================================
    // ストップウォッチ
    // =====================================================================

    let swMs       = 0;
    let swRun      = false;
    let swItv      = null;
    let swLapStart = 0;
    let swLaps     = [];
    let swLapN     = 1;

    const swRing    = document.getElementById('sw-ring');
    const swTimeEl  = document.getElementById('sw-time');
    const swMsEl    = document.getElementById('sw-ms');
    const swLapsEl  = document.getElementById('sw-laps');
    const swStartBtn = document.getElementById('sw-start');
    const swLapBtn   = document.getElementById('sw-lap');
    const swResetBtn = document.getElementById('sw-reset');

    function swUpdate() {
        const mins = Math.floor(swMs / 6000);
        const secs = Math.floor((swMs % 6000) / 100);
        const cs   = swMs % 100;
        if (swTimeEl) swTimeEl.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        if (swMsEl)   swMsEl.textContent   = '.' + String(cs).padStart(2, '0');
        // リングは60秒で1周
        const secCycle = (swMs / 100) % 60;
        setRing(swRing, secCycle / 60);
    }

    swStartBtn?.addEventListener('click', () => {
        if (swRun) return;
        swRun = true;
        if (swStartBtn) swStartBtn.disabled = true;
        if (swLapBtn)   swLapBtn.disabled   = false;
        swItv = setInterval(() => { swMs++; swUpdate(); }, 10);
    });

    swLapBtn?.addEventListener('click', () => {
        const lapMs = swMs - swLapStart;
        const lm = Math.floor(lapMs / 6000);
        const ls = Math.floor((lapMs % 6000) / 100);
        const lc = lapMs % 100;
        const lapStr = String(lm).padStart(2,'0') + ':' + String(ls).padStart(2,'0') + '.' + String(lc).padStart(2,'0');
        swLaps.unshift({ n: swLapN++, t: lapStr });
        swLapStart = swMs;

        if (swLapsEl) {
            swLapsEl.innerHTML = swLaps.slice(0, 5).map(l =>
                `<div class="sw-lap-row"><span>Lap ${l.n}</span><span>${l.t}</span></div>`
            ).join('');
        }
    });

    swResetBtn?.addEventListener('click', () => {
        clearInterval(swItv);
        swRun = false;
        swMs = swLapStart = 0;
        swLaps = [];
        swLapN = 1;
        swUpdate();
        if (swLapsEl)   swLapsEl.innerHTML = '';
        if (swStartBtn) swStartBtn.disabled = false;
        if (swLapBtn)   swLapBtn.disabled   = true;
    });

    setRing(swRing, 0);
    swUpdate();
});
