const searchInput = document.querySelector('#searchInput');
const stageSelect = document.querySelector('#stageSelect');
const resultLine = document.querySelector('#resultLine');
const cards = [...document.querySelectorAll('.episode-card')];

function refreshCards() {
  const query = (searchInput?.value || '').trim().toLowerCase();
  const stage = stageSelect?.value || '全部';
  let count = 0;
  cards.forEach((card) => {
    const stageOk = stage === '全部' || card.dataset.stage === stage;
    const queryOk = !query || card.dataset.search.includes(query);
    const visible = stageOk && queryOk;
    card.classList.toggle('hidden', !visible);
    if (visible) count += 1;
  });
  if (resultLine) resultLine.textContent = `${count} / ${cards.length} 期`;
}

searchInput?.addEventListener('input', refreshCards);
stageSelect?.addEventListener('change', refreshCards);
refreshCards();
