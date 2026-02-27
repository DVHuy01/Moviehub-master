/* =========================
   SIDEBAR ACTIVE
========================= */
(function sidebarActive() {
  const links = document.querySelectorAll(".sidebar-link");
  if (!links.length) return;

  const current = location.pathname.split("/").pop() || "index.html";

  links.forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;

    const file = href.split("/").pop();
    if (file === current) {
      links.forEach(x => x.classList.remove("active"));
      a.classList.add("active");
    }
  });
})();


/* =========================
   PERSIST SIDEBAR SCROLL
   (run BEFORE scrollIntoView)
========================= */
(function persistSidebarScroll(){
  const nav = document.querySelector(".sidebar-nav");
  if (!nav) return;

  const KEY = "sidebarNavScrollTop";

  // Restore
  const saved = sessionStorage.getItem(KEY);
  if (saved !== null) nav.scrollTop = parseInt(saved, 10) || 0;

  // Save on scroll
  nav.addEventListener("scroll", () => {
    sessionStorage.setItem(KEY, String(nav.scrollTop));
  });

  // Save on click
  document.querySelectorAll(".sidebar-link").forEach(a => {
    a.addEventListener("click", () => {
      sessionStorage.setItem(KEY, String(nav.scrollTop));
    });
  });
})();


/* =========================
   Ensure active item visible
   (AFTER scroll restore)
========================= */
(function ensureActiveVisible(){
  const active = document.querySelector(".sidebar-link.active");
  const nav = document.querySelector(".sidebar-nav");
  if (!active || !nav) return;

  // Không dùng smooth để tránh giật
  active.scrollIntoView({ block: "nearest" });
})();


/* =========================
   CHARTS (NO FAKE DATA)
   Backend-ready: fetch JSON
========================= */
(function initCharts() {
  if (typeof window.Chart === "undefined") return;

  // ===== Helpers =====
  function safeDestroy(chart) {
    try { chart && chart.destroy(); } catch (_) {}
  }

  async function fetchJSON(url) {
    const res = await fetch(url, {
      headers: { "Accept": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
  }

  /**
   * Expected chart payload format from backend:
   * {
   *   "labels": ["01/02","02/02",...],
   *   "values": [12,15,...],
   *   "label": "Tên dataset" // optional
   * }
   *
   * For bar charts of category lists:
   * {
   *   "labels": ["Action","Drama",...],
   *   "values": [120,90,...],
   *   "label": "Tên dataset" // optional
   * }
   */

  // ====== USER STATISTICS (LINE) ======
  const userCanvas = document.getElementById("userStatisticsChart");
  if (userCanvas) {
    let userChart;

    const rangeEl = document.getElementById("userRange");
    const metricEl = document.getElementById("userMetric");

    async function renderUserChart() {
      const days = parseInt(rangeEl?.value || "30", 10);
      const metric = metricEl?.value || "new";

      // TODO: đổi endpoint theo backend của bạn
      const url = `/api/analytics/users?days=${days}&metric=${encodeURIComponent(metric)}`;

      try {
        const data = await fetchJSON(url);
        safeDestroy(userChart);

        userChart = new Chart(userCanvas, {
          type: "line",
          data: {
            labels: data.labels || [],
            datasets: [{
              label: data.label || (metric === "active" ? "Người dùng hoạt động" : "Người dùng mới"),
              data: data.values || [],
              tension: 0.35,
              fill: true,
              pointRadius: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
          }
        });
      } catch (err) {
        console.error("User chart error:", err);
      }
    }

    renderUserChart();
    rangeEl && rangeEl.addEventListener("change", renderUserChart);
    metricEl && metricEl.addEventListener("change", renderUserChart);
  }

  // ====== ENGAGEMENT (LINE) ======
  const engageCanvas = document.getElementById("engagementAnalyticsChart");
  if (engageCanvas) {
    let engageChart;

    const rangeEl = document.getElementById("engageRange");
    const metricEl = document.getElementById("engageMetric");

    async function renderEngageChart() {
      const days = parseInt(rangeEl?.value || "30", 10);
      const metric = metricEl?.value || "views";

      // TODO: đổi endpoint theo backend của bạn
      const url = `/api/analytics/engagement?days=${days}&metric=${encodeURIComponent(metric)}`;

      try {
        const data = await fetchJSON(url);
        safeDestroy(engageChart);

        engageChart = new Chart(engageCanvas, {
          type: "line",
          data: {
            labels: data.labels || [],
            datasets: [{
              label: data.label || metric,
              data: data.values || [],
              tension: 0.35,
              fill: true,
              pointRadius: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
          }
        });
      } catch (err) {
        console.error("Engagement chart error:", err);
      }
    }

    renderEngageChart();
    rangeEl && rangeEl.addEventListener("change", renderEngageChart);
    metricEl && metricEl.addEventListener("change", renderEngageChart);
  }

  // ====== SEARCH TRENDS (BAR) ======
  const trendCanvas = document.getElementById("searchTrendsChart");
  if (trendCanvas) {
    let trendChart;

    const rangeEl = document.getElementById("trendRange");
    const groupEl = document.getElementById("trendGroupBy");
    const inputEl = document.getElementById("searchInput");

    async function renderTrendChart() {
      const days = parseInt(rangeEl?.value || "30", 10);
      const group = groupEl?.value || "keyword";
      const q = (inputEl?.value || "").trim();

      // TODO: đổi endpoint theo backend của bạn
      const url = `/api/analytics/search-trends?days=${days}&group=${encodeURIComponent(group)}&q=${encodeURIComponent(q)}`;

      try {
        const data = await fetchJSON(url);
        safeDestroy(trendChart);

        trendChart = new Chart(trendCanvas, {
          type: "bar",
          data: {
            labels: data.labels || [],
            datasets: [{
              label: data.label || (group === "genre" ? "Lượt tìm theo thể loại" : "Lượt tìm theo keyword"),
              data: data.values || []
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
          }
        });
      } catch (err) {
        console.error("Search trends chart error:", err);
      }
    }

    renderTrendChart();
    rangeEl && rangeEl.addEventListener("change", renderTrendChart);
    groupEl && groupEl.addEventListener("change", renderTrendChart);
    inputEl && inputEl.addEventListener("input", renderTrendChart);
  }

  // ====== TOP GENRES (BAR) ======
  const topCanvas = document.getElementById("topGenresChart");
  if (topCanvas) {
    let topChart;

    const metricEl = document.getElementById("genreMetric");
    const topNEl = document.getElementById("topN");
    const inputEl = document.getElementById("searchInput");

    async function renderTopGenres() {
      const metric = metricEl?.value || "preference";
      const topN = parseInt(topNEl?.value || "10", 10);
      const q = (inputEl?.value || "").trim();

      // TODO: đổi endpoint theo backend của bạn
      const url = `/api/analytics/top-genres?metric=${encodeURIComponent(metric)}&top=${topN}&q=${encodeURIComponent(q)}`;

      try {
        const data = await fetchJSON(url);
        safeDestroy(topChart);

        topChart = new Chart(topCanvas, {
          type: "bar",
          data: {
            labels: data.labels || [],
            datasets: [{
              label: data.label || metric,
              data: data.values || []
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true } }
          }
        });
      } catch (err) {
        console.error("Top genres chart error:", err);
      }
    }

    renderTopGenres();
    metricEl && metricEl.addEventListener("change", renderTopGenres);
    topNEl && topNEl.addEventListener("change", renderTopGenres);
    inputEl && inputEl.addEventListener("input", renderTopGenres);
  }

})
();
