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
    const POMO_CIRC = 2 * Math.PI * 80;

    let pTotal   = POMO_WORK;
    let pRem     = POMO_WORK;
    let pRun     = false;
    let pItv     = null;
    let pSession = 1;
    let pIsBreak = false;
    let pLastTick = 0;

    const nRing = document.getElementById('n-ring-fg');
    const nTime = document.getElementById('n-time');
    const nStartBtn = document.getElementById('n-start');
    const nPauseBtn = document.getElementById('n-pause');
    const nResetBtn = document.getElementById('n-reset');

    const eTime = document.getElementById('e-time');
    const eCharge = document.getElementById('e-charge');
    const eChargeV = document.getElementById('e-charge-v');
    const eDot = document.getElementById('e-dot');
    const eStatus = document.getElementById('e-status');
    const eStartBtn = document.getElementById('e-start');
    const ePauseBtn = document.getElementById('e-pause');
    const eResetBtn = document.getElementById('e-reset');
    const pPhaseEl = document.getElementById('pomo-phase');

    function setActiveStatus(label, dotColor) {
        if (eStatus) eStatus.textContent = label;
        if (eDot) {
            eDot.style.background = dotColor;
            eDot.style.boxShadow = `0 0 6px ${dotColor}`;
        }
    }

    function pUpdate() {
        const ratio = pRem / pTotal;
        const t = fmt(pRem);
        if (nTime) nTime.textContent = t;
        if (nRing) {
            nRing.style.strokeDasharray = POMO_CIRC;
            nRing.style.strokeDashoffset = POMO_CIRC * (1 - ratio);
            nRing.style.stroke = ratio > 0.6 ? '#4caf50' : ratio > 0.3 ? 'orange' : '#e53935';
        }
        if (eTime) {
            eTime.textContent = t;
            if (ratio < 0.3) {
                eTime.style.color = '#ff2200';
                eTime.style.textShadow = '0 0 10px rgba(255,34,0,0.9),0 0 30px rgba(255,34,0,0.4)';
            } else {
                eTime.style.color = '#ff6600';
                eTime.style.textShadow = '0 0 10px rgba(255,102,0,0.8),0 0 30px rgba(255,102,0,0.3)';
            }
        }
        const pct = Math.round(ratio * 100);
        if (eCharge) eCharge.style.width = pct + '%';
        if (eChargeV) eChargeV.textContent = pct + '%';
    }

    function pToggleButtons(running) {
        if (nStartBtn) nStartBtn.disabled = running;
        if (nPauseBtn) nPauseBtn.disabled = !running;
        if (eStartBtn) eStartBtn.disabled = running;
        if (ePauseBtn) ePauseBtn.disabled = !running;
    }

    function pFinish() {
        clearInterval(pItv);
        pRun = false;
        pLastTick = 0;
        pToggleButtons(false);

        if (!pIsBreak) {
            pIsBreak = true;
            pTotal = POMO_BREAK;
            pRem   = POMO_BREAK;
            if (pPhaseEl) pPhaseEl.textContent = `休憩中 — セッション ${pSession}/4`;
        } else {
            pIsBreak = false;
            pSession = pSession < 4 ? pSession + 1 : 1;
            pTotal = POMO_WORK;
            pRem   = POMO_WORK;
            if (pPhaseEl) pPhaseEl.textContent = `集中セッション ${pSession}/4`;
        }
        pUpdate();
        setActiveStatus('[ HOLD ] — OPERATION SUSPENDED', '#ff6600');
    }

    function pStart() {
        if (pRun) return;
        pRun = true;
        pToggleButtons(true);
        setActiveStatus('[ ACTIVE ] — OPERATION IN PROGRESS', '#00ff88');
        if ('Notification' in window && Notification.permission !== 'granted') Notification.requestPermission();
        pLastTick = Date.now();
        pItv = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - pLastTick) / 1000);
            if (diff > 0) { pRem -= diff; pLastTick += diff * 1000; pUpdate(); if (pRem <= 0) pFinish(); }
        }, 250);
    }

    function pPause() {
        clearInterval(pItv);
        pRun = false;
        pLastTick = 0;
        pToggleButtons(false);
        setActiveStatus('[ HOLD ] — OPERATION SUSPENDED', '#ff6600');
    }

    function pReset() {
        clearInterval(pItv);
        pRun = false;
        pLastTick = 0;
        pIsBreak = false;
        pSession = 1;
        pTotal = POMO_WORK;
        pRem   = POMO_WORK;
        if (pPhaseEl) pPhaseEl.textContent = `集中セッション 1/4`;
        pToggleButtons(false);
        setActiveStatus('[ STANDBY ] — AWAITING EXECUTIVE ORDER', '#ff6600');
        pUpdate();
    }

    nStartBtn?.addEventListener('click', pStart);
    nPauseBtn?.addEventListener('click', pPause);
    nResetBtn?.addEventListener('click', pReset);
    eStartBtn?.addEventListener('click', pStart);
    ePauseBtn?.addEventListener('click', pPause);
    eResetBtn?.addEventListener('click', pReset);

    document.getElementById('btn-normal')?.addEventListener('click', () => {
        document.getElementById('theme-normal')?.classList.add('active');
        document.getElementById('theme-eva')?.classList.remove('active');
        document.getElementById('btn-normal')?.classList.add('on');
        document.getElementById('btn-normal')?.classList.remove('eva-on');
        document.getElementById('btn-eva')?.classList.remove('on', 'eva-on');
    });

    document.getElementById('btn-eva')?.addEventListener('click', () => {
        document.getElementById('theme-eva')?.classList.add('active');
        document.getElementById('theme-normal')?.classList.remove('active');
        document.getElementById('btn-eva')?.classList.add('eva-on');
        document.getElementById('btn-eva')?.classList.remove('on');
        document.getElementById('btn-normal')?.classList.remove('on', 'eva-on');
    });

    pUpdate();

// =====================================================================
    // カスタムタイマー
    // =====================================================================

    let cTotal  = 10 * 60;
    let cRem    = 10 * 60;
    let cRun    = false;
    let cItv    = null;
    let cLastTick = 0;

    const cRing = document.getElementById('c-ring-fg');
    const cTimeEl = document.getElementById('c-time');
    const ceTime = document.getElementById('ce-time');
    const ceCharge = document.getElementById('ce-charge');
    const ceChargeV = document.getElementById('ce-charge-v');
    const ceDot = document.getElementById('ce-dot');
    const ceStatus = document.getElementById('ce-status');
    const cMmInput   = document.getElementById('ctimer-mm');
    const cSsInput   = document.getElementById('ctimer-ss');
    const cInputArea = document.getElementById('ctimer-inputs');
    const cStartBtn = document.getElementById('ctimer-start');
    const cPauseBtn = document.getElementById('ctimer-pause');
    const cResetBtn = document.getElementById('ctimer-reset');
    const ceStartBtn = document.getElementById('ce-start');
    const cePauseBtn = document.getElementById('ce-pause');
    const ceResetBtn = document.getElementById('ce-reset');
    const ceMmInput = document.getElementById('ce-mm');
    const ceSsInput = document.getElementById('ce-ss');

    function cReadInput() {
        const m = Math.max(0, parseInt(cMmInput?.value ?? ceMmInput?.value) || 0);
        const s = Math.max(0, Math.min(59, parseInt(cSsInput?.value ?? ceSsInput?.value) || 0));
        if (cMmInput) cMmInput.value = String(m); if (ceMmInput) ceMmInput.value = String(m);
        const sv = String(s).padStart(2,'0'); if (cSsInput) cSsInput.value = sv; if (ceSsInput) ceSsInput.value = sv;
        cTotal = (m * 60 + s) || 60;
        cRem   = cTotal;
    }

    function cUpdate() {
        const ratio = cRem / cTotal;
        const t = fmt(cRem);
        if (cTimeEl) cTimeEl.textContent = t;
        if (ceTime) ceTime.textContent = t;
        if (cRing) { cRing.style.strokeDasharray = POMO_CIRC; cRing.style.strokeDashoffset = POMO_CIRC * (1-ratio); }
        if (ceCharge) ceCharge.style.width = Math.round(ratio*100) + '%';
        if (ceChargeV) ceChargeV.textContent = Math.round(ratio*100) + '%';
    }

    [cMmInput, cSsInput, ceMmInput, ceSsInput].forEach(el => {
        el?.addEventListener('change', () => { if (!cRun) { cReadInput(); cUpdate(); } });
    });

    function cStart(){
        if (cRun) return;
        cReadInput();
        cUpdate();
        cRun = true;
        if (cStartBtn) cStartBtn.disabled = true;
        if (cPauseBtn) cPauseBtn.disabled = false;
        if (cInputArea) cInputArea.style.opacity = '0.4';
        cLastTick = Date.now();
        cItv = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - cLastTick) / 1000);
            if (diff <= 0) return;
            cRem -= diff;
            cLastTick += diff * 1000;
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
    }

    function cPause(){
        clearInterval(cItv);
        cRun = false;
        cLastTick = 0;
        if (cStartBtn) cStartBtn.disabled = false;
        if (cPauseBtn) cPauseBtn.disabled = true;
    }

    function cReset(){
        clearInterval(cItv);
        cRun = false;
        cLastTick = 0;
        cReadInput();
        cUpdate();
        if (cStartBtn) cStartBtn.disabled = false;
        if (cPauseBtn) cPauseBtn.disabled = true;
        if (cInputArea) cInputArea.style.opacity = '1';
    }

    cStartBtn?.addEventListener('click', cStart); ceStartBtn?.addEventListener('click', cStart);
    cPauseBtn?.addEventListener('click', cPause); cePauseBtn?.addEventListener('click', cPause);
    cResetBtn?.addEventListener('click', cReset); ceResetBtn?.addEventListener('click', cReset);
    document.getElementById('btn-c-normal')?.addEventListener('click',()=>{document.getElementById('theme-c-normal')?.classList.add('active');document.getElementById('theme-c-eva')?.classList.remove('active');document.getElementById('btn-c-normal')?.classList.add('on');document.getElementById('btn-c-eva')?.classList.remove('eva-on');});
    document.getElementById('btn-c-eva')?.addEventListener('click',()=>{document.getElementById('theme-c-eva')?.classList.add('active');document.getElementById('theme-c-normal')?.classList.remove('active');document.getElementById('btn-c-eva')?.classList.add('eva-on');document.getElementById('btn-c-normal')?.classList.remove('on');});

    cUpdate();

    // =====================================================================
    // ストップウォッチ
    // =====================================================================

    let swMs       = 0;
    let swRun      = false;
    let swItv      = null;
    let swStartAt = 0;
    let swElapsedBase = 0;
    let swLapStart = 0;
    let swLaps     = [];
    let swLapN     = 1;

    const swRing = document.getElementById('sw-ring-fg');
    const swTimeEl  = document.getElementById('sw-time');
    const swMsEl    = document.getElementById('sw-ms');
    const swLapsEl  = document.getElementById('sw-laps');
    const swStartBtn = document.getElementById('sw-start');
    const swLapBtn   = document.getElementById('sw-lap');
    const swResetBtn = document.getElementById('sw-reset');
    const sweTimeEl = document.getElementById('swe-time');
    const sweMsEl = document.getElementById('swe-ms');
    const sweStartBtn = document.getElementById('swe-start');
    const sweLapBtn = document.getElementById('swe-lap');
    const sweResetBtn = document.getElementById('swe-reset');
    const sweLapsEl = document.getElementById('swe-laps');
    const sweDot = document.getElementById('swe-dot');
    const sweStatus = document.getElementById('swe-status');

    function swUpdate() {
        if (swRun) swMs = swElapsedBase + Math.floor((Date.now() - swStartAt) / 10);
        const mins = Math.floor(swMs / 6000);
        const secs = Math.floor((swMs % 6000) / 100);
        const cs   = swMs % 100;
        if (swTimeEl) swTimeEl.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        if (swMsEl) swMsEl.textContent = '.' + String(cs).padStart(2, '0');
        if (sweTimeEl) sweTimeEl.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        if (sweMsEl) sweMsEl.textContent = '.' + String(cs).padStart(2, '0');
        // リングは60秒で1周
        const secCycle = (swMs / 100) % 60;
        setRing(swRing, secCycle / 60);
    }

    function swStart(){
        if (swRun) return;
        swRun = true;
        if (swStartBtn) swStartBtn.disabled = true;
        if (swLapBtn)   swLapBtn.disabled   = false;
        swStartAt = Date.now();
        swItv = setInterval(swUpdate, 50);
        if (sweStatus) sweStatus.textContent='[ ACTIVE ] — TRACKING'; if (sweDot){sweDot.style.background='#00ff88';sweDot.style.boxShadow='0 0 6px #00ff88';}
        if (sweStartBtn) sweStartBtn.disabled = true; if (sweLapBtn) sweLapBtn.disabled = false;
    }

    function swLap(){
        const lapMs = swMs - swLapStart;
        const lm = Math.floor(lapMs / 6000);
        const ls = Math.floor((lapMs % 6000) / 100);
        const lc = lapMs % 100;
        const lapStr = String(lm).padStart(2,'0') + ':' + String(ls).padStart(2,'0') + '.' + String(lc).padStart(2,'0');
        swLaps.unshift({ n: swLapN++, t: lapStr });
        swLapStart = swMs;

        if (swLapsEl) {
            const html = swLaps.slice(0, 5).map(l => `<div class="sw-lap-row"><span>Lap ${l.n}</span><span>${l.t}</span></div>`).join('');
            swLapsEl.innerHTML = html; if (sweLapsEl) sweLapsEl.innerHTML = html;
        }
    }

    function swReset(){
        clearInterval(swItv);
        if (swRun) swElapsedBase = swMs;
        swRun = false;
        swMs = swLapStart = 0;
        swStartAt = 0;
        swElapsedBase = 0;
        swLaps = [];
        swLapN = 1;
        swUpdate();
        if (swLapsEl)   swLapsEl.innerHTML = '';
        if (swStartBtn) swStartBtn.disabled = false;
        if (swLapBtn)   swLapBtn.disabled   = true;
        if (sweStatus) sweStatus.textContent='[ STANDBY ] — READY FOR TRACKING'; if (sweDot){sweDot.style.background='#ff6600';sweDot.style.boxShadow='0 0 6px #ff6600';}
        if (sweStartBtn) sweStartBtn.disabled = false; if (sweLapBtn) sweLapBtn.disabled = true; if (sweLapsEl) sweLapsEl.innerHTML='';
    }

    swStartBtn?.addEventListener('click', swStart); sweStartBtn?.addEventListener('click', swStart);
    swLapBtn?.addEventListener('click', swLap); sweLapBtn?.addEventListener('click', swLap);
    swResetBtn?.addEventListener('click', swReset); sweResetBtn?.addEventListener('click', swReset);
    document.getElementById('btn-sw-normal')?.addEventListener('click',()=>{document.getElementById('theme-sw-normal')?.classList.add('active');document.getElementById('theme-sw-eva')?.classList.remove('active');document.getElementById('btn-sw-normal')?.classList.add('on');document.getElementById('btn-sw-eva')?.classList.remove('eva-on');});
    document.getElementById('btn-sw-eva')?.addEventListener('click',()=>{document.getElementById('theme-sw-eva')?.classList.add('active');document.getElementById('theme-sw-normal')?.classList.remove('active');document.getElementById('btn-sw-eva')?.classList.add('eva-on');document.getElementById('btn-sw-normal')?.classList.remove('on');});

    setRing(swRing, 0);
    swUpdate();

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            if (pRun) { pUpdate(); }
            if (cRun) { cUpdate(); }
            if (swRun) { swUpdate(); }
        }
    });

});
