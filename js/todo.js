document.addEventListener('DOMContentLoaded', () => {
  const KEY = 'lerns_todos';
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  if (!form || !input || !list) return;

  const read = () => JSON.parse(localStorage.getItem(KEY) || '[]');
  const write = (v) => localStorage.setItem(KEY, JSON.stringify(v));

  function render(){
    const todos = read();
    list.innerHTML = todos.map((t,i)=>`<li class="todo-item ${t.done?'done':''}"><label><input type="checkbox" data-i="${i}" ${t.done?'checked':''}><span>${t.text}</span></label><button data-del="${i}">×</button></li>`).join('');
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const todos = read();
    todos.push({text, done:false, createdAt:Date.now()});
    write(todos); input.value=''; render();
  });

  list.addEventListener('change', (e)=>{
    const cb = e.target.closest('input[type="checkbox"]');
    if (!cb) return;
    const i = Number(cb.dataset.i);
    const todos = read();
    todos[i].done = cb.checked;
    write(todos); render();
    if (cb.checked) {
      setTimeout(() => {
        const latest = read();
        if (latest[i] && latest[i].done) {
          latest.splice(i, 1);
          write(latest);
          render();
        }
      }, 500);
    }
  });

  list.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-del]');
    if (!btn) return;
    const i = Number(btn.dataset.del);
    const todos = read(); todos.splice(i,1); write(todos); render();
  });

  render();
});
