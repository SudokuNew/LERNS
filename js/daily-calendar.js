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

    const render = (date) => {
        monthEl.textContent = `${date.getMonth() + 1}月`;
        dayEl.textContent = `${date.getDate()}`;
        weekdayEl.textContent = weekdays[date.getDay()];
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
        const now = getJstNow();
        const day = now.getDate();
        let c = 0;
        const run = () => {
            if (c >= Math.min(day, 12)) {
                render(now);
                cover.style.display = 'none';
                wrap.classList.remove('is-opening', 'fast');
                return;
            }
            wrap.classList.add('is-opening', 'fast');
            setTimeout(() => {
                wrap.classList.remove('is-opening', 'fast');
                c += 1;
                setTimeout(run, 35);
            }, 120);
        };
        run();
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
