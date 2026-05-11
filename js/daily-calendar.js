(() => {
    const wrap = document.getElementById('daily-calendar');
    if (!wrap) return;

    const cover = document.getElementById('dc-cover');
    const monthEl = document.getElementById('dc-month');
    const dayEl = document.getElementById('dc-day');
    const weekdayEl = document.getElementById('dc-weekday');

    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const getJstNow = () => {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        return new Date(utc + 9 * 60 * 60000);
    };

    const seasonByMonth = (m) => {
        if (m >= 3 && m <= 5) return 'spring';
        if (m >= 6 && m <= 8) return 'summer';
        if (m >= 9 && m <= 11) return 'autumn';
        return 'winter';
    };

    const render = (date) => {
        const month = date.getMonth() + 1;
        monthEl.textContent = `${month}月`;
        dayEl.textContent = `${date.getDate()}`;
        weekdayEl.textContent = weekdays[date.getDay()];
        wrap.dataset.season = seasonByMonth(month);
    };

    const flipPage = () => {
        wrap.classList.remove('is-flipping');
        requestAnimationFrame(() => {
            wrap.classList.add('is-flipping');
            setTimeout(() => {
                render(getJstNow());
                wrap.classList.remove('is-flipping');
            }, 360);
        });
    };

    const openingAnimation = () => {
        wrap.classList.add('is-opening');
        setTimeout(() => {
            wrap.classList.remove('is-opening');
            cover.style.display = 'none';
        }, 620);
    };

    const scheduleNextFlip = () => {
        const now = getJstNow();
        const next = new Date(now);
        next.setHours(24, 0, 1, 0);
        const wait = next.getTime() - now.getTime();
        setTimeout(() => {
            flipPage();
            scheduleNextFlip();
        }, wait);
    };

    render(getJstNow());
    openingAnimation();
    scheduleNextFlip();
})();
