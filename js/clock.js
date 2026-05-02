document.addEventListener('DOMContentLoaded', () => {
  const hh = document.getElementById('eva-hh');
  const mm = document.getElementById('eva-mm');
  const ss = document.getElementById('eva-ss');
  const ampm = document.getElementById('eva-ampm');
  const dateEl = document.getElementById('eva-date');
  const zoneEl = document.getElementById('eva-zone');
  if (!hh || !mm || !ss || !ampm || !dateEl || !zoneEl) return;

  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    hh.textContent = pad(h);
    mm.textContent = pad(m);
    ss.textContent = pad(s);
    ampm.textContent = h < 12 ? 'AM' : 'PM';

    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    dateEl.textContent = `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${days[now.getDay()]}`;

    const mins = -now.getTimezoneOffset();
    const sign = mins >= 0 ? '+' : '-';
    const zh = pad(Math.floor(Math.abs(mins)/60));
    const zm = pad(Math.abs(mins)%60);
    zoneEl.textContent = `UTC${sign}${zh}:${zm} LOCAL`;
  }

  tick();
  setInterval(tick, 1000);
});
