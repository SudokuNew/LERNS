document.addEventListener('DOMContentLoaded', () => {
    const tabs = Array.from(document.querySelectorAll('.icon-tab'));
    if (!tabs.length) return;

    // 初期パネルマッピング
    const panelsByTabId = {};
    tabs.forEach(t => {
        const pid = t.getAttribute('aria-controls');
        if (pid) panelsByTabId[t.id] = document.getElementById(pid);
    });

    // 汎用 open/close modal
    window.openModal = (id) => {
        const m = document.getElementById(id);
        if (!m) return;
        m.setAttribute('aria-hidden', 'false');
        m.style.display = 'flex';
        const first = m.querySelector('input, select, button, textarea');
        if (first) first.focus();
    };
    window.closeModal = (id) => {
        const m = document.getElementById(id);
        if (!m) return;
        m.setAttribute('aria-hidden', 'true');
        m.style.display = 'none';
    };

    // タブの有効化
    function activateTab(tab) {
        tabs.forEach(t => {
            const sel = (t === tab);
            t.setAttribute('aria-selected', sel ? 'true' : 'false');
            t.tabIndex = sel ? 0 : -1;
            const pid = t.getAttribute('aria-controls');
            if (pid) {
                const panel = document.getElementById(pid);
                if (panel) panel.hidden = !sel;
            }
        });

        // フック：data-action に従って既存の UI を表示
        const action = tab.dataset.action;
        if (action === 'log') {
            openModal('log-time-modal');
        } else if (action === 'schedule') {
            // PDF ビューを表示（panel とは別で既存 pdfViewer を表示）
            document.getElementById('pdfViewer').style.display = 'block';
            // 隠す他パネル/要素があれば処理する
            document.getElementById('videoPlayer').style.display = 'none';
        } else if (action === 'video') {
            document.getElementById('videoPlayer').style.display = 'block';
            document.getElementById('pdfViewer').style.display = 'none';
        }
    }

    tabs.forEach(t => t.addEventListener('click', () => activateTab(t)));

    // キーボードナビ（左右 / Home / End）
    const tablist = document.querySelector('.icon-tabs');
    tablist && tablist.addEventListener('keydown', (e) => {
        const idx = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
        if (idx < 0) return;
        let next = null;
        if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
        if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); activateTab(tabs[next]); }
    });

    // モーダル閉じるボタンのデリゲート
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="close-modal"]');
        if (btn) {
            const modal = btn.closest('.modal');
            if (modal) closeModal(modal.id);
        }
    });

    // 初期タブを有効化
    const initial = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    initial && activateTab(initial);

    // ビデオ再生ボタン（必要に応じて）
    const btnPlayVideo = document.getElementById('btn-play-video');
    if (btnPlayVideo) {
        btnPlayVideo.addEventListener('click', () => {
            const src = document.getElementById('videoSelect').value;
            const iframe = document.getElementById('videoFrame');
            iframe.src = 'https://www.youtube.com/embed/' + src + '?rel=0&autoplay=1';
        });
    }

    // 保存ボタンの簡易挙動（例：localStorage に保存してトータル更新）
    const saveBtn = document.getElementById('save-time');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const mins = parseInt(document.getElementById('study-minutes').value, 10) || 0;
            const totalEl = document.getElementById('total-time');
            // 簡易保存
            const prev = parseInt(localStorage.getItem('totalMins') || '0', 10);
            localStorage.setItem('totalMins', String(prev + mins));
            totalEl.textContent = '合計学習時間: ' + (prev + mins) + ' 分';
            closeModal('log-time-modal');
        });
    }
});