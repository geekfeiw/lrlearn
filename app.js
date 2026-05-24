const state = {
  query: "",
  stage: "全部",
  tag: "全部"
};

let episodes = [];
let guide = {};

const $ = (selector) => document.querySelector(selector);

const escapeHTML = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const listItems = (items = []) => items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");

const unique = (items) => [...new Set(items.filter(Boolean))];

const renderEpisodeLinks = (text = "") => escapeHTML(text).replace(
  /\b(\d{2})\b/g,
  (number) => `<a class="episode-link" href="#episode-${number}" data-open="${number}" aria-label="打开追色手记 ${number}">${number}</a>`
);

function renderHero() {
  const heroImages = episodes.filter((item) => item.images?.length).slice(0, 18);
  $("#heroCollage").innerHTML = heroImages.map((item) => (
    `<img src="${item.images[0]}" alt="">`
  )).join("");

  $("#heroStats").innerHTML = [
    ["62", "视频学习资料"],
    [unique(episodes.map((item) => item.stage)).length, "进阶阶段"],
    [guide.recipes?.length || 0, "风格配方"],
    [guide.training?.length || 0, "周训练计划"]
  ].map(([value, label]) => (
    `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`
  )).join("");
}

function renderOverview() {
  $("#overviewGrid").innerHTML = (guide.overview || []).map((item) => (
    `<article class="overview-item">
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.text)}</p>
    </article>`
  )).join("");
}

function renderRoadmap() {
  $("#roadmapGrid").innerHTML = (guide.roadmap || []).map((item, index) => (
    `<article class="roadmap-item" data-index="${String(index + 1).padStart(2, "0")}">
      <h3>${escapeHTML(item.stage)}</h3>
      <p>${escapeHTML(item.goal)}</p>
      <span class="mini-label">${escapeHTML(item.must)}</span>
      <div class="episode-number-links">${renderEpisodeLinks(item.episodes)}</div>
    </article>`
  )).join("");
}

function renderRecipes() {
  $("#recipeGrid").innerHTML = (guide.recipes || []).map((item) => (
    `<article class="recipe-card">
      <div>
        <h3>${escapeHTML(item.style)}</h3>
        <p>${escapeHTML(item.tone)}</p>
        <p>${escapeHTML(item.color)}</p>
      </div>
      <div class="episode-list">${renderEpisodeLinks(item.episodes)}</div>
    </article>`
  )).join("");
}

function renderTrouble() {
  $("#troubleGrid").innerHTML = (guide.troubleshooting || []).map((item) => (
    `<article class="trouble-card">
      <h3>${escapeHTML(item.problem)}</h3>
      <p>${escapeHTML(item.reason)}</p>
      <span class="mini-label">${escapeHTML(item.fix)}</span>
    </article>`
  )).join("");
}

function renderTraining() {
  $("#trainingGrid").innerHTML = (guide.training || []).map((item) => (
    `<article class="training-card">
      <h3>${escapeHTML(item.week)} · ${escapeHTML(item.topic)}</h3>
      <p>${escapeHTML(item.task)}</p>
      <span class="mini-label">${escapeHTML(item.acceptance)}</span>
    </article>`
  )).join("");
}

function renderPrinciples() {
  $("#principleList").innerHTML = listItems(guide.principles || []);
}

function setupFilters() {
  const stages = ["全部", ...unique(episodes.map((item) => item.stage))];
  $("#stageTabs").innerHTML = stages.map((stage) => (
    `<button type="button" data-stage="${escapeHTML(stage)}" aria-pressed="${stage === state.stage}">${escapeHTML(stage)}</button>`
  )).join("");

  const tags = ["全部", ...unique(episodes.map((item) => item.tag)).sort((a, b) => a.localeCompare(b, "zh-CN"))];
  $("#tagSelect").innerHTML = tags.map((tag) => (
    `<option value="${escapeHTML(tag)}">${escapeHTML(tag)}</option>`
  )).join("");
}

function getFilteredEpisodes() {
  const query = state.query.trim().toLowerCase();
  return episodes.filter((item) => {
    const stageOk = state.stage === "全部" || item.stage === state.stage;
    const tagOk = state.tag === "全部" || item.tag === state.tag;
    const haystack = [
      item.number,
      item.title,
      item.subtitle,
      item.tag,
      item.stage,
      ...(item.goals || []),
      ...(item.workflow || [])
    ].join(" ").toLowerCase();
    const queryOk = !query || haystack.includes(query);
    return stageOk && tagOk && queryOk;
  });
}

function renderEpisodes() {
  const items = getFilteredEpisodes();
  $("#resultLine").textContent = `${items.length} / ${episodes.length} 期`;
  $("#episodeGrid").innerHTML = items.map((item) => (
    `<article class="episode-card">
      <img loading="lazy" src="${item.thumb || item.images?.[0] || ""}" alt="${escapeHTML(item.title)}">
      <div class="episode-body">
        <div class="episode-meta">
          <a class="chip episode-link" href="#episode-${item.number}" data-open="${item.number}">追色手记 ${item.number}</a>
          <span class="chip">${escapeHTML(item.stage)}</span>
          <span class="chip">${escapeHTML(item.tag)}</span>
        </div>
        <h3>${escapeHTML(item.subtitle || item.title)}</h3>
        <p>${escapeHTML(item.summary)}</p>
        <button type="button" data-open="${item.number}">打开学习卡</button>
      </div>
    </article>`
  )).join("");
}

function openEpisode(number) {
  const item = episodes.find((episode) => episode.number === number);
  if (!item) return;

  const gallery = (item.images || []).map((src, index) => (
    `<img loading="lazy" src="${src}" alt="追色手记 ${item.number} 参考图 ${index + 1}">`
  )).join("");

  const keyShots = (item.keyShots || []).slice(0, 8).map((shot) => (
    `<div class="key-shot">
      <strong>${escapeHTML(shot.caption)}</strong>
      <span>${escapeHTML(shot.note)}</span>
    </div>`
  )).join("");

  $("#detailContent").innerHTML = `
    <header class="detail-hero" style="background-image: url('${item.images?.[0] || item.thumb || ""}')">
      <div>
        <div class="detail-meta">
          <a class="chip episode-link" href="#episode-${item.number}" data-open="${item.number}">追色手记 ${item.number}</a>
          <span class="chip">${escapeHTML(item.stage)}</span>
          <span class="chip">${escapeHTML(item.tag)}</span>
        </div>
        <h2 id="detailTitle">${escapeHTML(item.subtitle || item.title)}</h2>
      </div>
    </header>
    <div class="detail-body">
      <section class="detail-section">
        <h3>学习目标</h3>
        <ul class="detail-list">${listItems(item.goals)}</ul>
      </section>
      <section class="detail-section">
        <h3>实操流程</h3>
        <div class="workflow-list">${(item.workflow || []).map((text) => `<p>${escapeHTML(text)}</p>`).join("")}</div>
      </section>
      <section class="detail-section">
        <h3>作品参考图</h3>
        <div class="gallery">${gallery}</div>
      </section>
      <section class="detail-section">
        <h3>关键截图要点</h3>
        <div class="key-grid">${keyShots}</div>
      </section>
      <section class="detail-section">
        <h3>练习任务</h3>
        <ul class="detail-list">${listItems(item.practice)}</ul>
      </section>
      <a class="video-link" href="${item.videoUrl}" target="_blank" rel="noreferrer">打开原视频</a>
    </div>`;

  $("#detailPanel").hidden = false;
  document.body.classList.add("body-lock");
  history.replaceState(null, "", `#episode-${item.number}`);
}

function closeEpisode() {
  $("#detailPanel").hidden = true;
  document.body.classList.remove("body-lock");
  if (location.hash.startsWith("#episode-")) {
    history.replaceState(null, "", "#episodes");
  }
}

function bindEvents() {
  $("#searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    renderEpisodes();
  });

  $("#tagSelect").addEventListener("change", (event) => {
    state.tag = event.target.value;
    renderEpisodes();
  });

  $("#stageTabs").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-stage]");
    if (!button) return;
    state.stage = button.dataset.stage;
    setupFilters();
    $("#tagSelect").value = state.tag;
    renderEpisodes();
  });

  document.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open]");
    if (!opener) return;
    event.preventDefault();
    openEpisode(opener.dataset.open);
  });

  $("#detailPanel").addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) closeEpisode();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#detailPanel").hidden) closeEpisode();
  });
}

async function boot() {
  const [episodesRes, guideRes] = await Promise.all([
    fetch("data/episodes.json"),
    fetch("data/guide.json")
  ]);
  episodes = await episodesRes.json();
  guide = await guideRes.json();

  setupFilters();
  renderHero();
  renderOverview();
  renderRoadmap();
  renderRecipes();
  renderTrouble();
  renderTraining();
  renderPrinciples();
  renderEpisodes();
  bindEvents();

  const match = location.hash.match(/^#episode-(\d{2})$/);
  if (match) openEpisode(match[1]);
}

boot();
