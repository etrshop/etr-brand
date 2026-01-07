(() => {
  const STORAGE_KEY = "etr_cart_v1";

  const PRODUCTS = {
    jacket: {
      sku: "jacket",
      name: "Jacket — Black Chrome",
      price: 80,
      image: "assets/product-jacket.png",
      stripeLink: "https://buy.stripe.com/4gMbIT0WidVG9FOgqH5Rm09",
    },
    pants: {
      sku: "pants",
      name: "Pants — Black Chrome",
      price: 90,
      image: "assets/product-pants.png",
      stripeLink: "https://buy.stripe.com/bJecMX5cy4l6dW4gqH5Rm08",
    },
  };

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function formatMoney(n) {
    return `$${Number(n).toFixed(2)}`;
  }

  function cartCount(cart) {
    return cart.reduce((acc, it) => acc + (it.qty || 1), 0);
  }

  function cartTotal(cart) {
    return cart.reduce((acc, it) => acc + (it.price * (it.qty || 1)), 0);
  }

  function ensureUI() {
    const cartBtn = document.querySelector(".cartBtn");
    const cartDrawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("backdrop");
    const closeBtn = document.querySelector(".drawer__close");

    const hasDrawer = !!(cartDrawer && backdrop);

    function openCart() {
      if (!hasDrawer) return;
      cartDrawer.classList.add("is-open");
      backdrop.classList.add("is-on");
      cartDrawer.setAttribute("aria-hidden", "false");
      backdrop.setAttribute("aria-hidden", "false");
    }

    function closeCart() {
      if (!hasDrawer) return;
      cartDrawer.classList.remove("is-open");
      backdrop.classList.remove("is-on");
      cartDrawer.setAttribute("aria-hidden", "true");
      backdrop.setAttribute("aria-hidden", "true");
    }

    cartBtn?.addEventListener("click", openCart);
    closeBtn?.addEventListener("click", closeCart);
    backdrop?.addEventListener("click", closeCart);

    return { openCart, closeCart };
  }

  function renderCart() {
    const cart = loadCart();

    const countEl = document.querySelector(".cartCount");
    if (countEl) countEl.textContent = String(cartCount(cart));

    const itemsEl = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");

    if (totalEl) totalEl.textContent = formatMoney(cartTotal(cart));

    if (!itemsEl) return;

    itemsEl.innerHTML = "";
    if (!cart.length) {
      const empty = document.createElement("div");
      empty.style.color = "rgba(255,255,255,.65)";
      empty.style.fontSize = "13px";
      empty.textContent = "Carrinho vazio.";
      itemsEl.appendChild(empty);
      return;
    }

    cart.forEach((it, idx) => {
      const row = document.createElement("div");
      row.className = "cartItem";
      row.innerHTML = `
        <img src="${it.image}" alt="${it.name}">
        <div>
          <div class="cartItem__name">${it.name}</div>
          <div class="cartItem__meta">Size: ${it.size || "—"} · ${formatMoney(it.price)}</div>
        </div>
        <button class="cartItem__remove" type="button" aria-label="Remover">🗑</button>
      `;
      row.querySelector(".cartItem__remove").addEventListener("click", () => {
        const next = loadCart();
        next.splice(idx, 1);
        saveCart(next);
        renderCart();
      });
      itemsEl.appendChild(row);
    });
  }

  // ENTER page: click -> loader -> go to shop
  function initEnter() {
    const btn = document.getElementById("enterBtn");
    const loader = document.getElementById("loader");
    if (!btn || !loader) return;

    btn.addEventListener("click", () => {
      loader.classList.add("is-on");
      loader.setAttribute("aria-hidden", "false");
      setTimeout(() => {
        window.location.href = "shop.html";
      }, 1200);
    });
  }

  // Product page controller
  const ProductController = {
    init(cfg) {
      const ui = ensureUI();
      renderCart();

      let selectedSize = null;
      const selectedEl = document.getElementById(cfg.selectedSizeId);
      const hintEl = document.getElementById(cfg.hintId);

      // size buttons
      document.querySelectorAll("[data-size-group] .sizeBtn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll("[data-size-group] .sizeBtn").forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          selectedSize = btn.getAttribute("data-size");
          if (selectedEl) selectedEl.textContent = selectedSize;
          if (hintEl) hintEl.textContent = "";
        });
      });

      const addBtn = document.getElementById(cfg.addBtnId);
     addBtn?.addEventListener("click", () => {
  if (!selectedSize) {
    if (hintEl) hintEl.textContent = "Please select a size.";
    return;
  }

  const item = {
    sku: cfg.sku,
    name: cfg.name,
    price: cfg.price,
    image: cfg.image,
    size: selectedSize,
    qty: 1,
    stripeLink: cfg.stripeLink,
  };

  const cart = loadCart();
  cart.push(item);
  saveCart(cart);
  renderCart();

  ui?.openCart?.(); // ✅ AQUI, SÓ AQUI

  if (hintEl) hintEl.textContent = `Added (Size ${selectedSize}).`;
});

    }
  };

  // Checkout page controller
  const CheckoutController = {
    init() {
      const ui = ensureUI();
      renderCart();

      const cart = loadCart();
      const emptyEl = document.getElementById("checkoutEmpty");
      const contentEl = document.getElementById("checkoutContent");
      const itemsEl = document.getElementById("summaryItems");
      const totalEl = document.getElementById("summaryTotal");
      const payButtons = document.getElementById("payButtons");

      if (!cart.length) {
        emptyEl.style.display = "block";
        contentEl.classList.remove("is-on");
        return;
      }

      emptyEl.style.display = "none";
      contentEl.classList.add("is-on");

      itemsEl.innerHTML = "";
      cart.forEach(it => {
        const row = document.createElement("div");
        row.className = "summaryRow";
        row.innerHTML = `
          <div class="summaryRow__left">
            <div class="summaryRow__name">${it.name}</div>
            <div class="summaryRow__size">Size: ${it.size || "—"}</div>
          </div>
          <strong>${formatMoney(it.price)}</strong>
        `;
        itemsEl.appendChild(row);
      });

      totalEl.textContent = formatMoney(cartTotal(cart));

      // payment buttons
      payButtons.innerHTML = "";
      cart.forEach((it) => {
        const btn = document.createElement("a");
        btn.className = "ctaBtn";
        btn.href = it.stripeLink;
        btn.target = "_blank";
        btn.rel = "noopener";
        btn.textContent = `Pay ${it.name} (${formatMoney(it.price)})`;
        payButtons.appendChild(btn);
      });
    }
  };

  // Initialize on load
  document.addEventListener("DOMContentLoaded", () => {
    ensureUI();
    renderCart();
    initEnter();
  });

  // expose
  window.AppProductPage = ProductController;
  window.AppCheckout = CheckoutController;
})();


// ===== Jacket gallery (front/back) =====
(function initJacketGallery(){
  const track = document.querySelector(".gallery__track");
  if (!track) return; // só roda na página da jaqueta

  const left = document.querySelector(".gallery__nav--left");
  const right = document.querySelector(".gallery__nav--right");

  let index = 0; // 0 = frente, 1 = costas

  function render(){
    track.style.transform = `translateX(${-index * 100}%)`;
  }

  left?.addEventListener("click", () => {
    index = (index - 1 + 2) % 2;
    render();
  });

  right?.addEventListener("click", () => {
    index = (index + 1) % 2;
    render();
  });
})();


function initJacketGallery() {
  const gallery = document.querySelector('.gallery');
  if (!gallery) return;

  const images = gallery.querySelectorAll('.gallery__img');
  const prev = gallery.querySelector('.gallery__nav--left');
  const next = gallery.querySelector('.gallery__nav--right');

  if (!images.length || !prev || !next) return;

  let index = 0;

  function show(i) {
    images.forEach(img => img.classList.remove('is-active'));
    images[i].classList.add('is-active');
  }

  prev.addEventListener('click', () => {
    index = (index - 1 + images.length) % images.length;
    show(index);
  });

  next.addEventListener('click', () => {
    index = (index + images.length) % images.length;
    show(index);
  });
}


// =========================
// Gallery (front/back) - auto init
// =========================
(function initGalleries(){
  function setupGallery(gallery){
    const track = gallery.querySelector(".gallery__track");
    const btnL  = gallery.querySelector(".gallery__nav--left");
    const btnR  = gallery.querySelector(".gallery__nav--right");
    const slides = Array.from(track.querySelectorAll("img"));
    if (!track || slides.length < 2) return;

    let idx = 0;

    function render(){
      track.style.transform = `translateX(-${idx * 100}%)`;
    }

    btnL?.addEventListener("click", () => {
      idx = (idx - 1 + slides.length) % slides.length;
      render();
    });

    btnR?.addEventListener("click", () => {
      idx = (idx + 1) % slides.length;
      render();
    });

    // swipe (opcional, ajuda no mobile)
    let startX = null;
    gallery.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    gallery.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) idx = (idx + 1) % slides.length;
      else idx = (idx - 1 + slides.length) % slides.length;
      render();
    });

    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".gallery").forEach(setupGallery);
  });
})();


const cartDrawer = document.getElementById('cartDrawer');
const backdrop = document.getElementById('backdrop');

function openCart() {
  cartDrawer?.classList.add('is-open');
  backdrop?.classList.add('is-on');
}

function closeCart() {
  cartDrawer?.classList.remove('is-open');
  backdrop?.classList.remove('is-on');
}


// 🔥 BOTÃO DO CARRINHO NO TOPO (FUNCIONA EM TODAS AS PÁGINAS)
document.querySelectorAll('.cartBtn').forEach(btn => {
  btn.addEventListener('click', openCart);
});

document.querySelector('.drawer__close')?.addEventListener('click', closeCart);
backdrop?.addEventListener('click', closeCart);


document.addEventListener("DOMContentLoaded", () => {
  ensureUI();
  renderCart();
  initEnter();
});


initJacketGallery();


document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".lang__toggle");
  const menu = document.querySelector(".lang__menu");

  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
  });

  menu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
      menu.style.display = "none";
    });
  });
});
