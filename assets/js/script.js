'use strict';

/**
 * ✅ HEADER STICKY
 */
const header = document.querySelector("[data-header]");
window.addEventListener("scroll", function () {
  if (!header) return;
  window.scrollY >= 10 ? header.classList.add("active") : header.classList.remove("active");
});

/**
 * ✅ GO TO TOP
 */
const goTopBtn = document.querySelector("[data-go-top]");
window.addEventListener("scroll", function () {
  if (!goTopBtn) return;
  window.scrollY >= 50 ? goTopBtn.classList.add("active") : goTopBtn.classList.remove("active");
});

/**
 * ✅ ACTIVE MENU: chỉ sáng theo URL trang đang mở
 * Dropdown (href "#") KHÔNG đổi active
 */
(() => {
  const links = document.querySelectorAll(".hh3d-menu .hh3d-link");
  if (!links.length) return;

  const current = location.pathname.split("/").pop() || "index.html";

  links.forEach(l => l.classList.remove("is-active"));

  links.forEach(l => {
    const href = (l.getAttribute("href") || "").split("#")[0].trim();
    if (!href || href === "#") return;
    if (href === current) l.classList.add("is-active");
  });
})();

/**
 * ✅ HH3D CLICK DROPDOWN: chỉ mở/đóng dropdown (không làm sáng menu)
 */
(() => {
  const toggles = document.querySelectorAll(".hh3d-toggle");
  if (!toggles.length) return;

  toggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const parent = toggle.closest(".hh3d-dropdown");
      if (!parent) return;

      document.querySelectorAll(".hh3d-dropdown.active").forEach(item => {
        if (item !== parent) item.classList.remove("active");
      });

      parent.classList.toggle("active");
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".hh3d-dropdown")) {
      document.querySelectorAll(".hh3d-dropdown.active").forEach(item => item.classList.remove("active"));
    }
  });
})();

/**
 * ✅ SCHEDULE: chọn thứ (nếu có week-selector)
 */
(() => {
  const dayItems = document.querySelectorAll(".week-selector .day-item");
  if (!dayItems.length) return;

  dayItems.forEach(item => {
    item.addEventListener("click", () => {
      dayItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });
})();

/**
 * ✅ FILTER PAGES (genre/country/year):
 * - Đọc query param để set chip active
 * - Click chip -> chuyển URL theo param tương ứng (reload trang)
 */
(() => {
  const page = document.querySelector("[data-filter-page]");
  if (!page) return;

  const param = page.getAttribute("data-param"); // genre | country | year
  if (!param) return;

  const chips = document.querySelectorAll(".chip-row .chip");
  if (!chips.length) return;

  const titleTarget = document.querySelector("[data-selected-label]");

  const qs = new URLSearchParams(location.search);
  const currentValue = qs.get(param);

  // set active theo URL
  if (currentValue) {
    chips.forEach(c => {
      c.classList.toggle("active", c.dataset.value === currentValue);
    });

    const activeChip = Array.from(chips).find(c => c.dataset.value === currentValue);
    if (activeChip && titleTarget) titleTarget.textContent = activeChip.dataset.label || activeChip.textContent;
  }

  // click chip -> chuyển URL theo param
  chips.forEach(c => {
    c.addEventListener("click", () => {
      const url = new URL(location.href);
      url.searchParams.set(param, c.dataset.value);
      location.href = url.toString();
    });
  });
})();
/**
 * ✅ Smooth page change for menu links (chống nháy khi đổi trang)
 */
(() => {
  const isInternalHtml = (href) => {
    if (!href) return false;
    if (href === "#") return false;
    if (href.startsWith("http")) return false;
    return href.includes(".html");
  };

  const handleClick = (e) => {
    const a = e.currentTarget;
    const href = (a.getAttribute("href") || "").trim();
    if (!isInternalHtml(href)) return;

    // nếu user mở tab mới thì không chặn
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;

    e.preventDefault();
    document.body.classList.add("page-leave");

    // chuyển trang sau khi chạy animation
    setTimeout(() => {
      window.location.href = href;
    }, 180);
  };

  // Chỉ áp dụng cho các link menu thật sự đổi trang
  document.querySelectorAll(".hh3d-menu .hh3d-link").forEach(a => {
    a.addEventListener("click", handleClick);
  });

  // (Tuỳ chọn) áp dụng cho dropdown item nếu bạn muốn
  document.querySelectorAll(".hh3d-dropdown-menu a").forEach(a => {
    a.addEventListener("click", handleClick);
  });
})();

/**
 * Hàm cuộn danh sách phim (Carousel)
 * @param {string} direction - 'left' hoặc 'right'
 * @param {string} elementId - ID của danh sách cần cuộn (vd: 'upcoming-list', 'top-rated-list')
 */
function scrollList(direction, elementId) {
  // Nếu không truyền ID, mặc định lấy 'upcoming-list' (để tương thích code cũ nếu lỡ quên sửa)
  const listId = elementId || 'upcoming-list';
  const container = document.getElementById(listId);
  
  if (container) {
    const scrollAmount = 300; 
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  } else {
    console.warn(`Không tìm thấy phần tử có ID: ${listId}`);
  }
}

// Ví dụ đơn giản cho logic chuyển trang
const prevBtn = document.querySelector('.pagination-btn[aria-label="Trang trước"]');
const nextBtn = document.querySelector('.pagination-btn[aria-label="Trang sau"]');
const currentPageSpan = document.querySelector('.current-page');

let currentPage = 1;

nextBtn.addEventListener('click', () => {
    currentPage++;
    currentPageSpan.textContent = currentPage;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang khi sang trang mới
});

prevBtn.addEventListener('click', () => {
    if(currentPage > 1) {
        currentPage--;
        currentPageSpan.textContent = currentPage;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});


//



