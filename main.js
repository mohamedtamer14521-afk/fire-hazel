/**
 * HAZEL // JAVASCRIPT FOUNDATION & LUXURY COMMERCE ARCHITECTURE
 * Egyptian Streetwear Brand • @fire_hazel1 • Cairo Flagship Atelier
 * Production-Ready Supabase-Powered CMS & Storefront Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileDrawer();
  initCairoClock();
  initFormInteractions();
  initCartDrawer();
  initDynamicSiteSettings();
  initDynamicProducts();
  initSearchModal();
  initConciergeDrawer();
  initProductDetailModal();
});

/**
 * Sticky Header Scroll State & Apple Blur Dynamics
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  const handleScroll = () => {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollPos > 20) {
      header.classList.add('is-scrolled', 'header-scrolled');
    } else {
      header.classList.remove('is-scrolled', 'header-scrolled');
    }
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileDrawer() {
  const menuTrigger = document.querySelector('.mobile-menu-trigger');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.mobile-drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-nav-link');

  if (!menuTrigger || !drawer || !overlay) return;

  function openDrawer() {
    menuTrigger.classList.add('is-active');
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    menuTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    menuTrigger.classList.remove('is-active');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    menuTrigger.setAttribute('aria-expanded', 'false');
  }

  menuTrigger.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener('click', closeDrawer);
  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });
}

/**
 * Real-time Cairo Timezone Clock
 */
function initCairoClock() {
  const clockElements = document.querySelectorAll('.cairo-live-clock');
  if (!clockElements.length) return;

  function updateClock() {
    try {
      const now = new Date();
      const options = {
        timeZone: 'Africa/Cairo',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const cairoTimeString = new Intl.DateTimeFormat('en-GB', options).format(now);
      clockElements.forEach(el => {
        el.textContent = `CAIRO LOCAL: ${cairoTimeString}`;
      });
    } catch (e) {
      console.warn('Timezone calculation fallback', e);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Newsletter & Placeholder Form Feedback
 */
function initFormInteractions() {
  const forms = document.querySelectorAll('.drop-alert-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.drop-alert-input');
      const submitBtn = form.querySelector('.drop-alert-submit');
      
      if (input && input.value) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'ACCESS GRANTED';
        input.value = '';
        input.disabled = true;
        submitBtn.disabled = true;
        setTimeout(() => {
          submitBtn.textContent = originalText;
          input.disabled = false;
          submitBtn.disabled = false;
        }, 3500);
      }
    });
  });
}

/**
 * ==========================================================================
 * LIVE SITE SETTINGS CMS LOADER (SUPABASE CLOUD & LOCAL PREVIEW)
 * ==========================================================================
 */
async function initDynamicSiteSettings() {
  let settings = null;

  // 1. Try fetching live from Supabase site_settings table
  if (window.HazelSupabase && typeof window.HazelSupabase.isSupabaseConfigured === 'function' && window.HazelSupabase.isSupabaseConfigured()) {
    try {
      settings = await window.HazelSupabase.fetchSiteSettingsFromCloud();
    } catch (e) {
      console.warn('Error fetching site_settings from cloud', e);
    }
  }

  // 2. Fallback to LocalStorage
  if (!settings) {
    try {
      const local = localStorage.getItem('hazel_site_settings');
      if (local) settings = JSON.parse(local);
    } catch (e) {}
  }

  if (!settings) return;

  // 3. Update Ticker Text
  if (settings.ticker_text) {
    document.querySelectorAll('.ticker-text').forEach(el => {
      el.textContent = settings.ticker_text;
    });
  }

  // 4. Update Hero Main Headline & Subheadline
  if (settings.hero_headline) {
    const heroH1 = document.querySelector('.hero-editorial-col .display-hero') || document.querySelector('#hero .display-hero');
    if (heroH1) {
      const lines = settings.hero_headline.split('\n').filter(Boolean);
      if (lines.length > 1) {
        const lastLine = lines.pop();
        heroH1.innerHTML = `${lines.map(l => `${escapeHtml(l)}<br>`).join('')}<span style="color: var(--green-accent);">${escapeHtml(lastLine)}</span>`;
      } else {
        heroH1.innerHTML = escapeHtml(settings.hero_headline) + '<br><span style="color: var(--green-accent);">NO COMPROMISE.</span>';
      }
    }
  }

  if (settings.hero_subheadline) {
    const heroLead = document.querySelector('.hero-editorial-col .body-lead') || document.querySelector('#hero .body-lead');
    if (heroLead) {
      heroLead.textContent = settings.hero_subheadline;
    }
    const manifestoBody = document.getElementById('manifesto-body');
    if (manifestoBody) {
      manifestoBody.textContent = settings.hero_subheadline;
    }
  }

  // 5. Update Showroom Address
  if (settings.showroom_address) {
    const addressBox = document.querySelector('.store-meta-grid .store-meta-val');
    if (addressBox) {
      addressBox.innerHTML = `${escapeHtml(settings.showroom_address)}<br><span style="font-family: var(--font-sans); font-size: 0.875rem; color: #2ED573;">زهراء المعادي شارع الخمسين بجوار عز المنوفي</span>`;
    }
    document.querySelectorAll('.footer-meta-line').forEach(el => {
      if (el.innerHTML.includes('SHOWROOM:')) {
        el.innerHTML = `<strong>SHOWROOM:</strong> ${escapeHtml(settings.showroom_address)}`;
      }
    });
    const mapBtn = document.getElementById('btn-google-maps');
    if (mapBtn) {
      mapBtn.href = `https://maps.google.com/?q=${encodeURIComponent(settings.showroom_address)}`;
    }
  }

  // 6. Update Showroom Hours
  if (settings.showroom_hours) {
    document.querySelectorAll('.store-meta-val').forEach(el => {
      if (el.textContent.includes('CAI') || el.textContent.includes('14:00')) {
        el.textContent = settings.showroom_hours;
      }
    });
    document.querySelectorAll('.footer-meta-line').forEach(el => {
      if (el.innerHTML.includes('HOURS:')) {
        el.innerHTML = `<strong>HOURS:</strong> ${escapeHtml(settings.showroom_hours)}`;
      }
    });
  }

  // 7. Update Customer Inquiry Hotline
  if (settings.whatsapp_number) {
    const cleanNumber = settings.whatsapp_number.replace(/[^0-9]/g, '');
    const hotlineLink = document.querySelector('.store-meta-item .store-meta-val a');
    if (hotlineLink) {
      hotlineLink.href = `tel:+${cleanNumber}`;
      hotlineLink.textContent = `+${cleanNumber}`;
    }
    const floatingWhatsApp = document.querySelector('.floating-whatsapp-link');
    if (floatingWhatsApp) {
      floatingWhatsApp.href = `https://wa.me/${cleanNumber}?text=Hello%20HAZEL%20Team%2C%20I%20have%20an%20inquiry%20%2F%20complaint%20regarding%20my%20order.`;
    }
  }

  // 8. Update Developer Credit & Hotline
  if (settings.developer_credit || settings.developer_phone) {
    const devTag = document.querySelector('.developer-credit-tag');
    if (devTag) {
      const cred = settings.developer_credit || 'DEVELOPED BY MOHAMED TAMER';
      const phone = settings.developer_phone || '+201129333453';
      devTag.innerHTML = `
        <span>${escapeHtml(cred)}</span>
        <span class="dev-sep">//</span>
        <span>FOR INFO CALL US <a href="tel:${escapeHtml(phone)}" class="dev-phone-link">${escapeHtml(phone)}</a></span>
      `;
    }
  }

  // 9. Render Dynamic Showroom Media Gallery
  if (Array.isArray(settings.showroom_gallery) && settings.showroom_gallery.length > 0) {
    renderShowroomGallery(settings.showroom_gallery);
  }
}

/**
 * Render Interactive Flagship Showroom Gallery & Switcher
 */
function renderShowroomGallery(galleryImages) {
  const mainImg = document.getElementById('main-showroom-img');
  const strip = document.getElementById('showroom-thumbnails-strip');
  if (!mainImg || !strip) return;

  const validImages = galleryImages.filter(url => url && typeof url === 'string' && url.trim().length > 0);
  if (validImages.length === 0) return;

  mainImg.src = validImages[0];

  if (validImages.length > 1) {
    strip.style.display = 'flex';
    strip.innerHTML = validImages.map((imgUrl, idx) => `
      <button type="button" class="showroom-thumb-btn ${idx === 0 ? 'is-active' : ''}" data-url="${escapeHtml(imgUrl)}" aria-label="View Showroom Image ${idx + 1}">
        <img src="${escapeHtml(imgUrl)}" alt="Showroom View ${idx + 1}" loading="lazy">
      </button>
    `).join('');

    strip.querySelectorAll('.showroom-thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        strip.querySelectorAll('.showroom-thumb-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const url = btn.dataset.url;
        if (url && mainImg) {
          mainImg.style.opacity = '0.3';
          mainImg.style.transition = 'opacity 200ms ease';
          setTimeout(() => {
            mainImg.src = url;
            mainImg.style.opacity = '1';
          }, 150);
        }
      });
    });
  } else {
    strip.style.display = 'none';
  }
}

/**
 * ==========================================================================
 * CART STATE & SLIDE-OVER DRAWER ARCHITECTURE (APPLE-GRADE LUXURY COMMERCE)
 * ==========================================================================
 */
const CART_STORAGE_KEY = 'hazel_cart_items_v1';
const CAIRO_HOTLINE_NUMBER = '201282350233';
const FREE_SHIPPING_THRESHOLD = 3000;
const STANDARD_SHIPPING_FEE = 50;

let cartState = [];

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      cartState = JSON.parse(saved);
      if (!Array.isArray(cartState)) cartState = [];
    } else {
      cartState = [];
    }
  } catch (err) {
    console.warn('Could not read cart from localStorage', err);
    cartState = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  } catch (err) {
    console.warn('Could not save cart to localStorage', err);
  }
  renderCart();
}

/**
 * Slide-Over Cart Drawer Controller
 */
function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  const headerBagBtn = document.getElementById('header-bag-btn');
  const drawerCloseBtn = document.getElementById('cart-drawer-close');
  const emptyShopBtn = document.getElementById('btn-empty-shop');
  const whatsappBtn = document.getElementById('btn-whatsapp-order');
  const toggleGuestBtn = document.getElementById('btn-toggle-guest-checkout');
  const guestForm = document.getElementById('guest-checkout-form');
  const cancelGuestBtn = document.getElementById('btn-cancel-checkout');
  const orderSuccessCard = document.getElementById('order-success-card');
  const closeSuccessBtn = document.getElementById('btn-close-success');
  const itemsList = document.getElementById('cart-items-list');

  loadCart();
  renderCart();

  window.openCartDrawer = function() {
    if (!drawer || !overlay) return;
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  window.closeCartDrawer = function() {
    if (!drawer || !overlay) return;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  if (headerBagBtn) {
    headerBagBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openCartDrawer();
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', () => {
      window.closeCartDrawer();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      window.closeCartDrawer();
    });
  }

  if (emptyShopBtn) {
    emptyShopBtn.addEventListener('click', () => {
      window.closeCartDrawer();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      window.closeCartDrawer();
    }
  });

  // Toggle Direct Guest Checkout Form
  if (toggleGuestBtn && guestForm) {
    toggleGuestBtn.addEventListener('click', () => {
      guestForm.style.display = 'flex';
      toggleGuestBtn.parentElement.style.display = 'none';
      const drawerBody = document.getElementById('cart-drawer-body');
      if (drawerBody) {
        setTimeout(() => {
          drawerBody.scrollTo({ top: drawerBody.scrollHeight, behavior: 'smooth' });
        }, 100);
      }
    });
  }

  if (cancelGuestBtn && guestForm && toggleGuestBtn) {
    cancelGuestBtn.addEventListener('click', () => {
      guestForm.style.display = 'none';
      toggleGuestBtn.parentElement.style.display = 'flex';
    });
  }

  // Guest Checkout Form Submission
  if (guestForm) {
    guestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('checkout-name');
      const phoneInput = document.getElementById('checkout-phone');
      const selectedPayment = guestForm.querySelector('input[name="payment-method"]:checked')?.value || 'COD';

      const customerName = nameInput ? nameInput.value.trim() : '';
      const customerPhone = phoneInput ? phoneInput.value.trim() : '';

      guestForm.style.display = 'none';
      const summaryBlock = document.querySelector('.cart-summary-block');
      if (summaryBlock) summaryBlock.style.display = 'none';

      if (orderSuccessCard) {
        orderSuccessCard.style.display = 'flex';
        const desc = orderSuccessCard.querySelector('.success-desc');
        if (desc) {
          desc.textContent = `Thank you ${customerName || 'valued customer'}. Your order of ${calculateSubtotal().toLocaleString()} EGP via ${selectedPayment} has been registered. Our Cairo atelier concierge will contact you at ${customerPhone} shortly.`;
        }
      }

      cartState = [];
      saveCart();
    });
  }

  if (closeSuccessBtn && orderSuccessCard && guestForm && toggleGuestBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      orderSuccessCard.style.display = 'none';
      guestForm.reset();
      guestForm.style.display = 'none';
      toggleGuestBtn.parentElement.style.display = 'flex';
      const summaryBlock = document.querySelector('.cart-summary-block');
      if (summaryBlock) summaryBlock.style.display = 'flex';
      window.closeCartDrawer();
    });
  }

  // Dynamic Item List Event Delegation (Qty +/- and Remove)
  if (itemsList) {
    itemsList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.cart-item-remove-btn');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        const size = removeBtn.dataset.size;
        removeItemFromCart(id, size);
        return;
      }

      const minusBtn = e.target.closest('.btn-qty-minus');
      if (minusBtn) {
        const id = minusBtn.dataset.id;
        const size = minusBtn.dataset.size;
        updateItemQuantity(id, size, -1);
        return;
      }

      const plusBtn = e.target.closest('.btn-qty-plus');
      if (plusBtn) {
        const id = plusBtn.dataset.id;
        const size = plusBtn.dataset.size;
        updateItemQuantity(id, size, 1);
        return;
      }
    });
  }

  // WhatsApp Instant Order Generator
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cartState.length === 0) {
        alert('Your shopping bag is currently empty. Please select a piece to continue.');
        return;
      }

      const subtotal = calculateSubtotal();
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 'FREE (PROMO)' : `${STANDARD_SHIPPING_FEE} EGP`;
      const grandTotal = subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE);

      let itemsText = cartState.map((item, idx) => {
        return `${idx + 1}. *${item.title}*\n   • Size: ${item.size}\n   • Qty: ${item.quantity}\n   • Unit Price: ${item.price.toLocaleString()} EGP\n   • Line Total: ${(item.price * item.quantity).toLocaleString()} EGP`;
      }).join('\n\n');

      const message = `*HAZEL STREETWEAR — CAIRO ORDER INQUIRY*\n` +
        `════════════════════════════\n\n` +
        `*ORDERED PIECES:*\n\n${itemsText}\n\n` +
        `════════════════════════════\n` +
        `*Subtotal:* ${subtotal.toLocaleString()} EGP\n` +
        `*Cairo Delivery:* ${shipping}\n` +
        `*Grand Total:* ${grandTotal.toLocaleString()} EGP\n` +
        `════════════════════════════\n\n` +
        `*Location:* Cairo Flagship Dispatch, Egypt\n` +
        `Please confirm availability & dispatch timeline.`;

      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${CAIRO_HOTLINE_NUMBER}?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}

/**
 * Cart Calculations & State Mutators
 */
function calculateSubtotal() {
  return cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateTotalItems() {
  return cartState.reduce((sum, item) => sum + item.quantity, 0);
}

function addItemToCart(product) {
  const existing = cartState.find(item => item.id === product.id && item.size === product.size);
  if (existing) {
    existing.quantity += (product.quantity || 1);
  } else {
    cartState.push({
      id: product.id,
      title: product.title,
      price: product.price,
      size: product.size,
      image: product.image,
      quantity: product.quantity || 1
    });
  }
  saveCart();
  if (window.openCartDrawer) {
    window.openCartDrawer();
  }
}

function updateItemQuantity(id, size, delta) {
  const itemIndex = cartState.findIndex(item => item.id === id && item.size === size);
  if (itemIndex > -1) {
    cartState[itemIndex].quantity += delta;
    if (cartState[itemIndex].quantity <= 0) {
      cartState.splice(itemIndex, 1);
    }
    saveCart();
  }
}

function removeItemFromCart(id, size) {
  cartState = cartState.filter(item => !(item.id === id && item.size === size));
  saveCart();
}

/**
 * Render Cart State across Header & Drawer DOM
 */
function renderCart() {
  const totalCount = calculateTotalItems();
  const subtotal = calculateSubtotal();

  const headerBadge = document.getElementById('cart-count-badge');
  const drawerCount = document.getElementById('cart-drawer-count');

  if (headerBadge) {
    headerBadge.textContent = totalCount;
    headerBadge.style.transform = 'scale(1.3)';
    setTimeout(() => {
      headerBadge.style.transform = 'scale(1)';
    }, 200);
  }

  if (drawerCount) {
    drawerCount.textContent = `[ ${totalCount} ]`;
  }

  // Free Cairo Delivery Tier Progress
  const progressFill = document.getElementById('delivery-progress-fill');
  const tierText = document.getElementById('delivery-tier-text');
  
  if (progressFill && tierText) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      progressFill.style.width = '100%';
      tierText.innerHTML = '🎉 <strong>FREE Cairo Metropolitan Delivery Unlocked!</strong>';
    } else if (subtotal > 0) {
      const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      progressFill.style.width = `${percentage}%`;
      tierText.innerHTML = `⚡ Add <strong>${remaining.toLocaleString()} EGP</strong> more for FREE Cairo Delivery`;
    } else {
      progressFill.style.width = '0%';
      tierText.innerHTML = `⚡ Add <strong>${FREE_SHIPPING_THRESHOLD.toLocaleString()} EGP</strong> for FREE Cairo Delivery`;
    }
  }

  // Summary Figures
  const subtotalVal = document.getElementById('cart-subtotal-val');
  const shippingVal = document.getElementById('cart-shipping-val');
  const totalVal = document.getElementById('cart-total-val');

  const shippingCost = (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) ? 0 : STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shippingCost;

  if (subtotalVal) subtotalVal.textContent = `${subtotal.toLocaleString()} EGP`;
  if (shippingVal) {
    if (subtotal === 0) {
      shippingVal.textContent = '0 EGP';
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      shippingVal.innerHTML = '<span style="color: #2ED573; font-weight: 700;">FREE (PROMO)</span>';
    } else {
      shippingVal.textContent = `${STANDARD_SHIPPING_FEE} EGP`;
    }
  }
  if (totalVal) totalVal.textContent = `${grandTotal.toLocaleString()} EGP`;

  // Empty State vs Items List Visibility
  const emptyState = document.getElementById('cart-empty-state');
  const itemsList = document.getElementById('cart-items-list');
  const actionsStack = document.getElementById('cart-actions-stack');
  const summaryBlock = document.querySelector('.cart-summary-block');

  if (cartState.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (itemsList) {
      itemsList.style.display = 'none';
      itemsList.innerHTML = '';
    }
    if (actionsStack) actionsStack.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (itemsList) {
      itemsList.style.display = 'flex';
      
      itemsList.innerHTML = cartState.map(item => `
        <div class="cart-item-card" data-id="${item.id}" data-size="${item.size}">
          <div class="cart-item-thumb-wrapper">
            <img src="${item.image}" alt="${item.title}" class="cart-item-thumb" loading="lazy">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-top">
              <h4 class="cart-item-title">${item.title}</h4>
              <button type="button" class="cart-item-remove-btn" aria-label="Remove item" data-id="${item.id}" data-size="${item.size}" title="Remove">
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
            <div class="cart-item-meta-row">
              <span>SIZE:</span>
              <span class="cart-item-size-pill">${item.size}</span>
              <span>•</span>
              <span>${item.price.toLocaleString()} EGP</span>
            </div>
            <div class="cart-item-bottom">
              <span class="cart-item-price">${(item.price * item.quantity).toLocaleString()} EGP</span>
              <div class="cart-item-qty-control">
                <button type="button" class="cart-qty-btn btn-qty-minus" data-id="${item.id}" data-size="${item.size}" aria-label="Decrease quantity">−</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button type="button" class="cart-qty-btn btn-qty-plus" data-id="${item.id}" data-size="${item.size}" aria-label="Increase quantity">+</button>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
    if (actionsStack) actionsStack.style.display = 'flex';
    if (summaryBlock) summaryBlock.style.display = 'flex';
  }
}

/**
 * ==========================================================================
 * DYNAMIC PRODUCT CATALOG ARCHITECTURE (SUPABASE CLOUD + MULTI-IMAGE SUPPORT)
 * ==========================================================================
 */
const DEFAULT_PRODUCTS = [
  {
    id: "prod-01",
    title: "PERTEX BALACLAVA PUFFER JACKET",
    category: "Outerwear",
    tag: "[ HEAVY INSULATION // TECHNICAL NYLON ]",
    price: 3850,
    status: "LOW STOCK / DROP 004",
    statusType: "badge-warning",
    primaryImage: "./assets/products/puffer-front.jpg",
    secondaryImage: "./assets/products/puffer-back.jpg",
    images: [
      "./assets/products/puffer-front.jpg",
      "./assets/products/puffer-back.jpg"
    ],
    sizes: ["S", "M", "L", "XL"],
    inStock: true
  },
  {
    id: "prod-02",
    title: "GRADIENT MOHAIR ARROW SWEATER",
    category: "Knitwear",
    tag: "[ 450 GSM BRUSHED MOHAIR BLEND ]",
    price: 2450,
    status: "EXCLUSIVE ALLOCATION",
    statusType: "badge-exclusive",
    primaryImage: "./assets/products/knit-front.jpg",
    secondaryImage: "./assets/products/knit-back.jpg",
    images: [
      "./assets/products/knit-front.jpg",
      "./assets/products/knit-back.jpg"
    ],
    sizes: ["M", "L", "XL"],
    inStock: true
  },
  {
    id: "prod-03",
    title: "TECHNICAL UMBRO ARCHIVE TRACKSUIT",
    category: "Sets & Tracksuits",
    tag: "[ WATER-REPELLENT NYLON SET ]",
    price: 2950,
    status: "LIMITED DROP",
    statusType: "badge-limited",
    primaryImage: "./assets/products/tracksuit.jpg",
    secondaryImage: "./assets/hero-campaign.jpg",
    images: [
      "./assets/products/tracksuit.jpg",
      "./assets/hero-campaign.jpg"
    ],
    sizes: ["S", "M", "L"],
    inStock: true
  },
  {
    id: "prod-04",
    title: "GOTHIC APPLIQUÉ HEAVYWEIGHT DENIM",
    category: "Bottoms & Denim",
    tag: "[ 14 OZ RAW BLACK DENIM // EMBROIDERED ]",
    price: 2250,
    status: "RESTOCK COMPLETED",
    statusType: "badge-restock",
    primaryImage: "./assets/products/denim-detail.jpg",
    secondaryImage: "./assets/capsules/capsule-cargo.jpg",
    images: [
      "./assets/products/denim-detail.jpg",
      "./assets/capsules/capsule-cargo.jpg"
    ],
    sizes: ["30", "32", "34", "36"],
    inStock: true
  },
  {
    id: "prod-05",
    title: "TACTICAL HARDWARE CHEST RIG & BALACLAVA",
    category: "Accessories & Bags",
    tag: "[ CORDURA 1000D NYLON // CUSTOM HARDWARE ]",
    price: 1450,
    status: "DROP 004 // ACTIVE",
    statusType: "badge-warning",
    primaryImage: "./assets/capsules/capsule-accessories.jpg",
    secondaryImage: "./assets/capsules/capsule-accessories.jpg",
    images: [
      "./assets/capsules/capsule-accessories.jpg"
    ],
    sizes: ["ONE SIZE"],
    inStock: true
  }
];

/**
 * Helper to extract all valid images from product record
 */
function getProductImages(product) {
  if (!product) return ['./assets/products/puffer-front.jpg'];
  let list = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    list = product.images.filter(url => url && typeof url === 'string' && url.trim().length > 0);
  }
  if (list.length === 0) {
    if (product.primaryImage && typeof product.primaryImage === 'string' && product.primaryImage.trim().length > 0) {
      list.push(product.primaryImage.trim());
    }
    if (product.secondaryImage && typeof product.secondaryImage === 'string' && product.secondaryImage.trim().length > 0) {
      list.push(product.secondaryImage.trim());
    }
  }
  if (list.length === 0) {
    list.push('./assets/products/puffer-front.jpg');
  }
  return list;
}

async function initDynamicProducts() {
  const container = document.querySelector('.product-grid-capsule');
  if (!container) return;

  let products = null;

  // 1. Try fetching live from Supabase Cloud
  if (window.HazelSupabase && typeof window.HazelSupabase.isSupabaseConfigured === 'function' && window.HazelSupabase.isSupabaseConfigured()) {
    try {
      const cloudData = await window.HazelSupabase.fetchProductsFromCloud();
      if (cloudData && cloudData.length > 0) {
        products = cloudData;
      }
    } catch (e) {
      console.warn('Supabase products fetch failed; trying local storage/files', e);
    }
  }

  // 2. Try localStorage custom products (from Admin preview)
  if (!products) {
    try {
      const custom = localStorage.getItem('hazel_custom_products');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          products = parsed;
        }
      }
    } catch (e) {}
  }

  // 3. Try data/products.json
  if (!products) {
    try {
      const response = await fetch('./data/products.json');
      if (response.ok) {
        products = await response.json();
      }
    } catch (e) {
      console.info('Fetch from data/products.json bypassed; using built-in catalog data.');
    }
  }

  // 4. Fallback to default array
  if (!products || !Array.isArray(products) || products.length === 0) {
    products = DEFAULT_PRODUCTS;
  }

  // 5. Save reference for search modal & render product cards dynamically
  window.__HAZEL_ACTIVE_PRODUCTS__ = products;
  renderProductGrid(container, products);

  // 6. Initialize Micro-Interactions (Carousels, Quick Add, Quick View Modal)
  initProductInteractions();

  // 7. Initialize Capsule Click Sync & Collection Filter Bar
  initCapsuleSync();
}

/**
 * Render Product Grid with Multi-Image Mini Slider & Hover Support
 */
function renderProductGrid(container, products) {
  const activeProducts = products.filter(p => p.inStock !== false);

  if (activeProducts.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <p class="body-lead" style="color: var(--text-muted);">ALL DROP 004 ALLOCATIONS CURRENTLY CLAIMED.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = activeProducts.map(product => {
    const images = getProductImages(product);
    const hasMultiple = images.length > 1;
    const badgeClass = product.statusType || 'badge-warning';
    const statusText = product.status || 'DROP 004 // ACTIVE';
    const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L'];

    return `
      <article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="product-card-visual" data-current-index="0" data-total-images="${images.length}">
          
          <!-- Status Badge -->
          <div class="product-card-badges">
            <span class="product-status-badge ${escapeHtml(badgeClass)}">${escapeHtml(statusText)}</span>
          </div>

          <!-- Wishlist Trigger -->
          <button type="button" class="product-wishlist-btn" aria-label="Add ${escapeHtml(product.title)} to Wishlist" title="Save to Wishlist">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-width="1.8"/>
            </svg>
          </button>

          <!-- Multi-Image Carousel Track -->
          <div class="product-card-carousel">
            <div class="card-carousel-track" style="transform: translateX(0%);">
              ${images.map((imgUrl, idx) => `
                <div class="card-carousel-slide ${idx === 0 ? 'is-active' : ''}">
                  <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.title)} - View ${idx + 1}" class="product-img-primary" loading="lazy" width="600" height="800">
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Carousel Next/Prev Arrows (Hover & Mobile) -->
          ${hasMultiple ? `
            <button type="button" class="card-carousel-arrow arrow-prev" aria-label="Previous Image" title="Previous Image">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button type="button" class="card-carousel-arrow arrow-next" aria-label="Next Image" title="Next Image">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          ` : ''}

          <!-- Carousel Pagination Dots -->
          ${hasMultiple ? `
            <div class="card-carousel-dots" role="tablist" aria-label="Image gallery dots">
              ${images.map((_, idx) => `
                <button type="button" class="card-dot ${idx === 0 ? 'is-active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
              `).join('')}
            </div>
          ` : ''}

          <!-- Quick Add / Size Selector Overlay Pill -->
          <div class="product-quick-add-pill" aria-label="Quick Add to Bag">
            <div class="size-selector-group" role="radiogroup" aria-label="Select Size for ${escapeHtml(product.title)}">
              ${sizes.map((size, idx) => `
                <button type="button" class="size-pill-btn ${idx === 0 ? 'is-active' : ''}" data-size="${escapeHtml(size)}" aria-label="Size ${escapeHtml(size)}">${escapeHtml(size)}</button>
              `).join('')}
            </div>
            <button type="button" class="btn-quick-add" aria-label="Add ${escapeHtml(product.title)} to Bag">
              <span>+ BAG</span>
            </button>
          </div>

        </div>

        <!-- Editorial Info Block -->
        <div class="product-card-info">
          <div class="product-card-meta-tag">${escapeHtml(product.tag || '[ 100% HEAVYWEIGHT TEXTILE ]')}</div>
          <div class="product-card-title-row">
            <h3 class="product-card-title">
              <a href="#product-detail-modal" class="product-card-link">${escapeHtml(product.title)}</a>
            </h3>
            <span class="product-card-price">${Number(product.price).toLocaleString()} EGP</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Slide Card Carousel to a specific index
 */
function setCardSlide(cardVisual, index) {
  const track = cardVisual.querySelector('.card-carousel-track');
  const dots = cardVisual.querySelectorAll('.card-dot');
  const slides = cardVisual.querySelectorAll('.card-carousel-slide');
  const total = slides.length;
  if (!track || total === 0) return;

  const validIndex = ((index % total) + total) % total;
  cardVisual.dataset.currentIndex = validIndex;
  track.style.transform = `translateX(-${validIndex * 100}%)`;

  dots.forEach((d, i) => {
    if (i === validIndex) {
      d.classList.add('is-active');
    } else {
      d.classList.remove('is-active');
    }
  });
}

function slideCard(cardVisual, delta) {
  const currentIndex = parseInt(cardVisual.dataset.currentIndex || '0', 10);
  setCardSlide(cardVisual, currentIndex + delta);
}

/**
 * Product Card Editorial Micro-Interactions (Multi-Image Slider, Size Selection, Quick Add, Modal Trigger)
 */
function initProductInteractions() {
  const productCards = document.querySelectorAll('.product-card');

  productCards.forEach(card => {
    const productId = card.dataset.productId || 'prod-unknown';
    const visual = card.querySelector('.product-card-visual');
    const titleEl = card.querySelector('.product-card-title');
    const title = titleEl ? titleEl.textContent.trim() : 'HAZEL GARMENT';
    const priceEl = card.querySelector('.product-card-price');
    let price = 0;
    if (priceEl) {
      const parsed = parseInt(priceEl.textContent.replace(/[^0-9]/g, ''), 10);
      price = isNaN(parsed) ? 2500 : parsed;
    }

    // 1. Multi-Image Carousel Arrow Buttons
    const prevBtn = card.querySelector('.card-carousel-arrow.arrow-prev');
    const nextBtn = card.querySelector('.card-carousel-arrow.arrow-next');

    if (prevBtn && visual) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        slideCard(visual, -1);
      });
    }

    if (nextBtn && visual) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        slideCard(visual, 1);
      });
    }

    // 2. Multi-Image Carousel Pagination Dots
    const dots = card.querySelectorAll('.card-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIdx = parseInt(dot.dataset.index, 10);
        if (visual && !isNaN(targetIdx)) {
          setCardSlide(visual, targetIdx);
        }
      });
    });

    // 3. Desktop Hover Secondary Preview (if has multiple images)
    if (visual) {
      const totalImages = parseInt(visual.dataset.totalImages || '1', 10);
      if (totalImages > 1) {
        card.addEventListener('mouseenter', () => {
          const current = parseInt(visual.dataset.currentIndex || '0', 10);
          if (current === 0) {
            setCardSlide(visual, 1);
          }
        });

        card.addEventListener('mouseleave', () => {
          setCardSlide(visual, 0);
        });
      }
    }

    // 4. Mobile Touch Swipe on Product Card Visual
    if (visual) {
      let touchStartX = 0;
      let touchStartY = 0;
      let isSwiping = false;

      visual.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          isSwiping = false;
        }
      }, { passive: true });

      visual.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
          const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
          if (deltaX > 10 && deltaX > deltaY) {
            isSwiping = true;
          }
        }
      }, { passive: true });

      visual.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
            if (deltaX < 0) {
              slideCard(visual, 1); // Swipe left -> next image
            } else {
              slideCard(visual, -1); // Swipe right -> prev image
            }
          }
        }
      }, { passive: true });
    }

    // 5. Size Pill Selection
    const sizeBtns = card.querySelectorAll('.size-pill-btn');
    sizeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        sizeBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // 6. Direct Quick Add To Bag
    const addBtn = card.querySelector('.btn-quick-add');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedSize = card.querySelector('.size-pill-btn.is-active')?.dataset.size || 'M';
        const activeImg = card.querySelector('.card-carousel-slide.is-active img') || card.querySelector('.product-img-primary');
        const imageSrc = activeImg ? activeImg.getAttribute('src') : './assets/products/puffer-front.jpg';
        const originalText = addBtn.innerHTML;
        
        addBtn.classList.add('is-added');
        addBtn.innerHTML = '<span>ADDED ✓</span>';

        addItemToCart({
          id: productId,
          title: title,
          price: price,
          size: selectedSize,
          image: imageSrc,
          quantity: 1
        });

        setTimeout(() => {
          addBtn.classList.remove('is-added');
          addBtn.innerHTML = originalText;
        }, 1800);
      });
    }

    // 7. Wishlist Heart Toggle
    const wishlistBtn = card.querySelector('.product-wishlist-btn');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        wishlistBtn.classList.toggle('is-active');
      });
    }

    // 8. Card Click -> Open Editorial Quick View Modal
    card.addEventListener('click', (e) => {
      // Exclude clicks on interactive sub-elements
      if (e.target.closest('.btn-quick-add') ||
          e.target.closest('.size-pill-btn') ||
          e.target.closest('.product-wishlist-btn') ||
          e.target.closest('.card-carousel-arrow') ||
          e.target.closest('.card-dot')) {
        return;
      }

      e.preventDefault();
      const allProducts = window.__HAZEL_ACTIVE_PRODUCTS__ || DEFAULT_PRODUCTS;
      const targetProduct = allProducts.find(p => String(p.id) === String(productId));
      if (targetProduct) {
        openProductDetailModal(targetProduct);
      }
    });
  });
}

/**
 * ==========================================================================
 * COLLECTION CATEGORY FILTER & CAPSULE SYNC CONTROLLER
 * ==========================================================================
 */
let currentCollectionCategory = 'all';

function filterCollectionByCategory(targetCategory, shouldScroll = false) {
  currentCollectionCategory = targetCategory || 'all';
  const container = document.querySelector('.product-grid-capsule');
  const countBadge = document.getElementById('collection-filter-count');
  const pills = document.querySelectorAll('#collection-filter-pills .filter-pill');

  // 1. Update pills active state
  pills.forEach(pill => {
    const pillFilter = pill.dataset.filter || 'all';
    if (pillFilter.toLowerCase() === currentCollectionCategory.toLowerCase()) {
      pill.classList.add('is-active');
    } else {
      pill.classList.remove('is-active');
    }
  });

  const catalog = window.__HAZEL_ACTIVE_PRODUCTS__ || DEFAULT_PRODUCTS;
  const activeProducts = catalog.filter(p => p.inStock !== false);
  let filtered = activeProducts;

  if (currentCollectionCategory !== 'all') {
    const target = currentCollectionCategory.toLowerCase();
    filtered = activeProducts.filter(item => {
      const cat = (item.category || '').toLowerCase();
      const tag = (item.tag || '').toLowerCase();
      const title = (item.title || '').toLowerCase();

      if (target === 'outerwear') {
        return cat.includes('outerwear') || title.includes('puffer') || title.includes('jacket') || title.includes('fleece') || tag.includes('fleece');
      }
      if (target === 'bottoms') {
        return cat.includes('bottom') || cat.includes('denim') || cat.includes('cargo') || cat.includes('workwear') || title.includes('denim') || title.includes('cargo') || title.includes('pant');
      }
      if (target === 'accessories') {
        return cat.includes('accessor') || cat.includes('bag') || cat.includes('hardware') || title.includes('bag') || title.includes('hardware') || title.includes('balaclava') || tag.includes('cordura');
      }
      if (target === 'knitwear') {
        return cat.includes('knit') || title.includes('mohair') || title.includes('sweater');
      }
      if (target === 'sets') {
        return cat.includes('set') || title.includes('tracksuit');
      }

      return cat.includes(target) || tag.includes(target) || title.includes(target);
    });
  }

  // 2. Update Count Badge
  if (countBadge) {
    if (currentCollectionCategory === 'all') {
      countBadge.innerHTML = `<span>SHOWING ALL ${activeProducts.length} SILHOUETTES</span>`;
    } else {
      countBadge.innerHTML = `<span>SHOWING ${filtered.length} OF ${activeProducts.length} [${escapeHtml(currentCollectionCategory.toUpperCase())}]</span>`;
    }
  }

  // 3. Render filtered items
  if (container) {
    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
          <p style="font-family: var(--font-mono); font-size: 0.875rem; color: var(--text-muted); text-transform: uppercase;">
            NO SILHOUETTES FOUND IN [${escapeHtml(currentCollectionCategory.toUpperCase())}]
          </p>
          <button type="button" class="btn-primary" style="margin-top: 1rem; padding: 0.6rem 1.5rem;" onclick="filterCollectionByCategory('all', false)">
            VIEW ALL SILHOUETTES
          </button>
        </div>
      `;
    } else {
      container.innerHTML = filtered.map(product => {
        const images = getProductImages(product);
        const hasMultiple = images.length > 1;
        const badgeClass = product.statusType || 'badge-warning';
        const statusText = product.status || 'DROP 004 // ACTIVE';
        const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L'];

        return `
          <article class="product-card" data-product-id="${escapeHtml(product.id)}">
            <div class="product-card-visual" data-current-index="0" data-total-images="${images.length}">
              
              <!-- Status Badge -->
              <div class="product-card-badges">
                <span class="product-status-badge ${escapeHtml(badgeClass)}">${escapeHtml(statusText)}</span>
              </div>

              <!-- Wishlist Trigger -->
              <button type="button" class="product-wishlist-btn" aria-label="Add ${escapeHtml(product.title)} to Wishlist" title="Save to Wishlist">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke-width="1.8"/>
                </svg>
              </button>

              <!-- Multi-Image Carousel Track -->
              <div class="product-card-carousel">
                <div class="card-carousel-track" style="transform: translateX(0%);">
                  ${images.map((imgUrl, idx) => `
                    <div class="card-carousel-slide ${idx === 0 ? 'is-active' : ''}">
                      <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.title)} - View ${idx + 1}" class="product-img-primary" loading="lazy" width="600" height="800">
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Carousel Next/Prev Arrows (Hover & Mobile) -->
              ${hasMultiple ? `
                <button type="button" class="card-carousel-arrow arrow-prev" aria-label="Previous Image" title="Previous Image">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button type="button" class="card-carousel-arrow arrow-next" aria-label="Next Image" title="Next Image">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              ` : ''}

              <!-- Carousel Pagination Dots -->
              ${hasMultiple ? `
                <div class="card-carousel-dots" role="tablist" aria-label="Image gallery dots">
                  ${images.map((_, idx) => `
                    <button type="button" class="card-dot ${idx === 0 ? 'is-active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></button>
                  `).join('')}
                </div>
              ` : ''}

              <!-- Quick Add / Size Selector Overlay Pill -->
              <div class="product-quick-add-pill" aria-label="Quick Add to Bag">
                <div class="size-selector-group" role="radiogroup" aria-label="Select Size for ${escapeHtml(product.title)}">
                  ${sizes.map((size, idx) => `
                    <button type="button" class="size-pill-btn ${idx === 0 ? 'is-active' : ''}" data-size="${escapeHtml(size)}" aria-label="Size ${escapeHtml(size)}">${escapeHtml(size)}</button>
                  `).join('')}
                </div>
                <button type="button" class="btn-quick-add" aria-label="Add ${escapeHtml(product.title)} to Bag">
                  <span>+ BAG</span>
                </button>
              </div>

            </div>

            <!-- Editorial Info Block -->
            <div class="product-card-info">
              <div class="product-card-meta-tag">${escapeHtml(product.tag || '[ 100% HEAVYWEIGHT TEXTILE ]')}</div>
              <div class="product-card-title-row">
                <h3 class="product-card-title">
                  <a href="#product-detail-modal" class="product-card-link">${escapeHtml(product.title)}</a>
                </h3>
                <span class="product-card-price">${Number(product.price).toLocaleString()} EGP</span>
              </div>
            </div>
          </article>
        `;
      }).join('');
    }

    initProductInteractions();
  }

  // 4. Smooth scroll to collection grid if requested
  if (shouldScroll) {
    const targetEl = document.getElementById('new-drop') || document.getElementById('collection-filter-bar');
    if (targetEl) {
      const headerOffset = 80;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}

window.filterCollectionByCategory = filterCollectionByCategory;

function initCapsuleSync() {
  // 1. Filter Pills Row in Section 2
  const collectionPills = document.querySelectorAll('#collection-filter-pills .filter-pill');
  collectionPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = pill.dataset.filter || 'all';
      filterCollectionByCategory(filter, false);
    });
  });

  // 2. Section 4 Capsule Cards Click Handling
  const capsuleCards = document.querySelectorAll('.lookbook-card[data-capsule-category], .capsule-card');
  capsuleCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const category = card.dataset.capsuleCategory || 'all';
      filterCollectionByCategory(category, true);
    });
  });
}

/**
 * ==========================================================================
 * PRODUCT DETAIL QUICK-VIEW MODAL CONTROLLER (#product-detail-modal)
 * ==========================================================================
 */
let currentModalProduct = null;
let currentModalImageIndex = 0;
let modalImages = [];
let selectedModalSize = 'M';

function initProductDetailModal() {
  const overlay = document.getElementById('product-detail-modal-overlay');
  const modal = document.getElementById('product-detail-modal');
  const closeBtn = document.getElementById('product-detail-modal-close');
  const prevBtn = document.getElementById('modal-gallery-prev');
  const nextBtn = document.getElementById('modal-gallery-next');
  const addBagBtn = document.getElementById('modal-btn-add-bag');
  const whatsappBtn = document.getElementById('modal-btn-whatsapp');
  const mainImgWrap = document.getElementById('modal-main-img-wrap');

  if (!overlay || !modal) return;

  // Close handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductDetailModal);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeProductDetailModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeProductDetailModal();
    }
  });

  // Next / Prev Gallery Navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stepModalGallery(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stepModalGallery(1);
    });
  }

  // Mobile Touch Swipe on Modal Main Image
  if (mainImgWrap) {
    let touchStartX = 0;
    let touchStartY = 0;

    mainImgWrap.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    mainImgWrap.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
          if (deltaX < 0) {
            stepModalGallery(1); // Swipe left -> next image
          } else {
            stepModalGallery(-1); // Swipe right -> prev image
          }
        }
      }
    }, { passive: true });
  }

  // Modal "+ ADD TO BAG" Action
  if (addBagBtn) {
    addBagBtn.addEventListener('click', () => {
      if (!currentModalProduct) return;
      const originalText = addBagBtn.innerHTML;
      addBagBtn.innerHTML = '<span>ADDED ✓</span>';
      addBagBtn.style.background = '#2ED573';
      addBagBtn.style.borderColor = '#2ED573';
      addBagBtn.style.color = '#071911';

      addItemToCart({
        id: currentModalProduct.id,
        title: currentModalProduct.title,
        price: Number(currentModalProduct.price) || 2500,
        size: selectedModalSize || 'M',
        image: modalImages[0] || currentModalProduct.primaryImage || './assets/products/puffer-front.jpg',
        quantity: 1
      });

      setTimeout(() => {
        addBagBtn.innerHTML = originalText;
        addBagBtn.style.background = '';
        addBagBtn.style.borderColor = '';
        addBagBtn.style.color = '';
        closeProductDetailModal();
      }, 450);
    });
  }

  // Modal "ORDER VIA WHATSAPP CONCIERGE" Action
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      if (!currentModalProduct) return;
      const priceFormatted = Number(currentModalProduct.price).toLocaleString();
      const message = `*HAZEL STREETWEAR — PRODUCT INQUIRY*\n` +
        `════════════════════════════\n` +
        `*Piece:* ${currentModalProduct.title}\n` +
        `*Category:* ${currentModalProduct.category || 'Atelier Garment'}\n` +
        `*Selected Size:* ${selectedModalSize}\n` +
        `*Price:* ${priceFormatted} EGP\n` +
        `*Textile Spec:* ${currentModalProduct.tag || 'Heavyweight Textile'}\n` +
        `════════════════════════════\n` +
        `Please confirm availability and dispatch timeline for Cairo delivery.`;

      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${CAIRO_HOTLINE_NUMBER}?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}

/**
 * Open Product Quick-View Modal
 */
function openProductDetailModal(product) {
  const overlay = document.getElementById('product-detail-modal-overlay');
  if (!overlay || !product) return;

  currentModalProduct = product;
  modalImages = getProductImages(product);
  currentModalImageIndex = 0;

  // 1. Populate Editorial Meta & Titles
  const titleEl = document.getElementById('modal-product-title');
  const priceEl = document.getElementById('modal-product-price');
  const specEl = document.getElementById('modal-product-spec');
  const catEl = document.getElementById('modal-product-category');
  const badgeEl = document.getElementById('modal-product-badge');
  const selectedSizeLabel = document.getElementById('modal-selected-size-label');
  const sizePillsContainer = document.getElementById('modal-size-pills');

  if (titleEl) titleEl.textContent = product.title;
  if (priceEl) priceEl.textContent = `${Number(product.price).toLocaleString()} EGP`;
  if (specEl) specEl.textContent = product.tag || '[ 100% HEAVYWEIGHT TEXTILE ]';
  if (catEl) catEl.textContent = `[ ${(product.category || 'GARMENT').toUpperCase()} ]`;
  if (badgeEl) {
    badgeEl.textContent = product.status || 'DROP 004 // ACTIVE';
    badgeEl.className = `badge-tag ${product.statusType === 'badge-warning' ? 'tag-live' : 'tag-live'}`;
  }

  // 2. Populate Sizes
  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
  selectedModalSize = sizes[0] || 'M';
  if (selectedSizeLabel) selectedSizeLabel.textContent = `SIZE: ${selectedModalSize}`;

  if (sizePillsContainer) {
    sizePillsContainer.innerHTML = sizes.map((sz, idx) => `
      <button type="button" class="modal-size-pill ${idx === 0 ? 'is-active' : ''}" data-size="${escapeHtml(sz)}">
        ${escapeHtml(sz)}
      </button>
    `).join('');

    sizePillsContainer.querySelectorAll('.modal-size-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        sizePillsContainer.querySelectorAll('.modal-size-pill').forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        selectedModalSize = pill.dataset.size;
        if (selectedSizeLabel) selectedSizeLabel.textContent = `SIZE: ${selectedModalSize}`;
      });
    });
  }

  // 3. Render Modal Gallery Preview & Thumbnails
  renderModalGallery();

  // 4. Open Modal & Lock Scroll
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  overlay.setAttribute('aria-hidden', 'false');
}

/**
 * Render Gallery View & Thumbnails inside Quick-View Modal
 */
function renderModalGallery() {
  const mainImg = document.getElementById('modal-main-img');
  const counterEl = document.getElementById('modal-img-counter');
  const strip = document.getElementById('modal-thumbnails-strip');
  const prevBtn = document.getElementById('modal-gallery-prev');
  const nextBtn = document.getElementById('modal-gallery-next');

  if (modalImages.length === 0) return;

  const currentUrl = modalImages[currentModalImageIndex];
  if (mainImg) {
    mainImg.style.opacity = '0.3';
    mainImg.style.transition = 'opacity 150ms ease';
    setTimeout(() => {
      mainImg.src = currentUrl;
      mainImg.style.opacity = '1';
    }, 100);
  }

  if (counterEl) {
    const padCurrent = String(currentModalImageIndex + 1).padStart(2, '0');
    const padTotal = String(modalImages.length).padStart(2, '0');
    counterEl.textContent = `[ ${padCurrent} / ${padTotal} ]`;
  }

  // Arrows visibility
  if (prevBtn && nextBtn) {
    if (modalImages.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }
  }

  // Thumbnails Strip
  if (strip) {
    if (modalImages.length > 1) {
      strip.style.display = 'flex';
      strip.innerHTML = modalImages.map((url, idx) => `
        <button type="button" class="modal-thumb-btn ${idx === currentModalImageIndex ? 'is-active' : ''}" data-index="${idx}" aria-label="View garment photo ${idx + 1}">
          <img src="${escapeHtml(url)}" alt="Thumbnail ${idx + 1}" loading="lazy">
        </button>
      `).join('');

      strip.querySelectorAll('.modal-thumb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index, 10);
          if (!isNaN(idx)) {
            currentModalImageIndex = idx;
            renderModalGallery();
          }
        });
      });
    } else {
      strip.style.display = 'none';
    }
  }
}

function stepModalGallery(delta) {
  if (modalImages.length <= 1) return;
  currentModalImageIndex = (currentModalImageIndex + delta + modalImages.length) % modalImages.length;
  renderModalGallery();
}

function closeProductDetailModal() {
  const overlay = document.getElementById('product-detail-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
  overlay.setAttribute('aria-hidden', 'true');
}

/**
 * ==========================================================================
 * LIVE SEARCH MODAL OVERLAY (APPLE-GRADE REAL-TIME FILTERING)
 * ==========================================================================
 */
function initSearchModal() {
  const overlay = document.getElementById('search-modal-overlay');
  const modal = document.getElementById('search-modal');
  const triggerBtn = document.getElementById('header-search-btn');
  const closeBtn = document.getElementById('search-modal-close');
  const searchInput = document.getElementById('live-search-input');
  const clearBtn = document.getElementById('btn-search-clear');
  const filterPills = document.querySelectorAll('#search-filter-pills .filter-pill');
  const resultsContainer = document.getElementById('search-results-container');

  if (!overlay || !modal || !triggerBtn) return;

  let activeCategory = 'all';

  function openSearch() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    overlay.setAttribute('aria-hidden', 'false');
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
        searchInput.select();
      }, 100);
    }
    renderSearchResults();
  }

  function closeSearch() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    overlay.setAttribute('aria-hidden', 'true');
    if (searchInput) {
      searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
    }
  }

  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSearch);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeSearch();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeSearch();
    }
  });

  // Filter Pills Selection
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      activeCategory = pill.dataset.filter || 'all';
      renderSearchResults();
    });
  });

  // Search Input Real-time Filtering
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'inline-block' : 'none';
      }
      renderSearchResults();
    });
  }

  if (clearBtn && searchInput) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      searchInput.focus();
      renderSearchResults();
    });
  }

  function getCatalogProducts() {
    if (window.__HAZEL_ACTIVE_PRODUCTS__ && Array.isArray(window.__HAZEL_ACTIVE_PRODUCTS__)) {
      return window.__HAZEL_ACTIVE_PRODUCTS__;
    }
    return DEFAULT_PRODUCTS;
  }

  function renderSearchResults() {
    if (!resultsContainer) return;

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const allProducts = getCatalogProducts();

    const filtered = allProducts.filter(item => {
      if (item.inStock === false) return false;
      
      if (activeCategory !== 'all') {
        const cat = (item.category || '').toLowerCase();
        const tag = (item.tag || '').toLowerCase();
        const title = (item.title || '').toLowerCase();
        const target = activeCategory.toLowerCase();

        const matchCat = cat.includes(target) || tag.includes(target) || title.includes(target);
        if (!matchCat) return false;
      }

      if (!query) return true;

      const titleMatch = (item.title || '').toLowerCase().includes(query);
      const tagMatch = (item.tag || '').toLowerCase().includes(query);
      const catMatch = (item.category || '').toLowerCase().includes(query);
      const priceMatch = String(item.price || '').includes(query);

      return titleMatch || tagMatch || catMatch || priceMatch;
    });

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <p style="font-family: var(--font-mono); font-size: 0.8125rem; color: var(--text-muted); text-transform: uppercase;">
            NO SILHOUETTES FOUND MATCHING "${escapeHtml(query || activeCategory)}"
          </p>
          <span style="font-family: var(--font-mono); font-size: 0.6875rem; color: #2ED573; margin-top: 6px; display: block;">
            TRY SEARCHING "PUFFER", "SWEATER", "TRACKSUIT", "DENIM"
          </span>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = filtered.map(item => {
      const defaultSize = (item.sizes && item.sizes.length > 0) ? item.sizes[0] : 'M';
      const itemImages = getProductImages(item);
      return `
        <div class="search-result-row" data-id="${escapeHtml(item.id)}">
          <div class="search-result-left" style="cursor: pointer;">
            <img src="${escapeHtml(itemImages[0])}" alt="${escapeHtml(item.title)}" class="search-result-thumb" loading="lazy">
            <div>
              <h4 class="search-result-title">${escapeHtml(item.title)}</h4>
              <div class="search-result-tag">${escapeHtml(item.tag || '[ 100% HEAVYWEIGHT TEXTILE ]')}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <span class="search-result-price">${Number(item.price).toLocaleString()} EGP</span>
            <button type="button" class="btn btn-primary btn-sm btn-search-add" 
                    data-id="${escapeHtml(item.id)}" 
                    data-title="${escapeHtml(item.title)}"
                    data-price="${item.price}"
                    data-image="${escapeHtml(itemImages[0])}"
                    data-size="${escapeHtml(defaultSize)}"
                    style="padding: 6px 12px; font-size: 0.6875rem;">
              + BAG
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach row click -> open Quick View Modal
    resultsContainer.querySelectorAll('.search-result-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-search-add')) return;
        const id = row.dataset.id;
        const target = allProducts.find(p => String(p.id) === String(id));
        if (target) {
          closeSearch();
          setTimeout(() => {
            openProductDetailModal(target);
          }, 200);
        }
      });
    });

    // Attach "+ BAG" handlers inside search result rows
    resultsContainer.querySelectorAll('.btn-search-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const title = btn.dataset.title;
        const price = Number(btn.dataset.price) || 2500;
        const image = btn.dataset.image;
        const size = btn.dataset.size || 'M';

        btn.textContent = 'ADDED ✓';
        btn.style.background = '#2ED573';
        btn.style.borderColor = '#2ED573';

        addItemToCart({
          id: id,
          title: title,
          price: price,
          size: size,
          image: image,
          quantity: 1
        });

        setTimeout(() => {
          closeSearch();
          if (window.openCartDrawer) {
            window.openCartDrawer();
          }
        }, 400);
      });
    });
  }
}

/**
 * ==========================================================================
 * VIP CLIENT CONCIERGE & ATELIER DRAWER
 * ==========================================================================
 */
function initConciergeDrawer() {
  const overlay = document.getElementById('concierge-drawer-overlay');
  const drawer = document.getElementById('concierge-drawer');
  const triggerBtn = document.getElementById('header-account-btn');
  const closeBtn = document.getElementById('concierge-drawer-close');
  const trackInput = document.getElementById('track-order-input');
  const trackBtn = document.getElementById('btn-track-whatsapp');

  if (!overlay || !drawer || !triggerBtn) return;

  function openConcierge() {
    overlay.classList.add('is-open');
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeConcierge() {
    overlay.classList.remove('is-open');
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    overlay.setAttribute('aria-hidden', 'true');
  }

  triggerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openConcierge();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeConcierge);
  }

  overlay.addEventListener('click', closeConcierge);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeConcierge();
    }
  });

  // Track Order via WhatsApp
  function triggerTrackOrder() {
    const query = trackInput ? trackInput.value.trim() : '';
    const message = query 
      ? `Hello HAZEL Cairo Atelier Concierge, I would like to track the dispatch status for Order / Phone: ${query}.`
      : `Hello HAZEL Cairo Atelier Concierge, I would like to track my order dispatch status.`;

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CAIRO_HOTLINE_NUMBER}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  }

  if (trackBtn) {
    trackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerTrackOrder();
    });
  }

  if (trackInput) {
    trackInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerTrackOrder();
      }
    });
  }
}
