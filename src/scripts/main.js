/* ==========================================================================
   БЛОК 1: ИМПОРТЫ И КОНФИГУРАЦИЯ ДАННЫХ
   ========================================================================== */
import fullCatalog from '../data/catalog.json';
// НОВОЕ: Подключаем базу объектов
import galleryItemsData from '../data/objects.json';
import newsData from '../data/news.json';

// 1. Берем именно те 3 товара, которые отлично смотрятся на главной
const catalogData = fullCatalog.filter(item =>
    item.id === 's2' || item.id === 's8' || item.id === 'mg10'
);

// 2. Принудительно раздаем им бейджи, даже если в catalog.json они не указаны!
catalogData.forEach(item => {
    if (item.id === 's2') item.badge = 'hit';
    if (item.id === 's8') item.badge = 'new';
    if (item.id === 'mg10') item.badge = 'sale';
});

const COLOR_MAP = { 'gray': '#bbb', 'red': '#a52a2a', 'brown': '#6d4c41', 'black': '#222', 'white': '#fff', 'yellow': '#f1c40f', 'orange': '#e67e22', 'onyx': 'linear-gradient(135deg, #f1c40f, #c0392b)', 'autumn': 'linear-gradient(135deg, #ecf0f1, #2c3e50)', 'ruby': 'linear-gradient(135deg, #f39c12, #795548)', 'jasper': 'linear-gradient(135deg, #e67e22, #5d4037)', 'amber': 'linear-gradient(135deg, #795548, #212121)' };
const COLOR_NAMES = { 'gray': 'Серый', 'red': 'Красный', 'brown': 'Коричневый', 'black': 'Черный', 'white': 'Белый', 'yellow': 'Желтый', 'orange': 'Оранжевый', 'onyx': 'Оникс', 'autumn': 'Осень', 'ruby': 'Рубин', 'jasper': 'Яшма', 'amber': 'Янтарь', 'mix': 'Микс' };

/* Комментарий: Настройки категорий для страницы Каталога */
const CATS_CONFIG = [
    { k: 'standart', t: 'Тротуарная плитка "СТАНДАРТ" Гладкая', groups: [{ id: '40', t: 'Толщина 40 мм' }, { id: '60', t: 'Толщина 60 мм' }, { id: '80', t: 'Толщина 80 мм' }] },
    { k: 'granit', t: 'Тротуарная плитка "СТАНДАРТ" С Гранитным фактурным слоем', groups: [{ id: '40', t: 'Толщина 40 мм' }, { id: '60', t: 'Толщина 60 мм' }, { id: '80', t: 'Толщина 80 мм' }] },
    { k: 'melange-sm', t: 'Тротуарная плитка "ПРЕМИУМ" Меланж Гладкая ', groups: [{ id: '40', t: 'Толщина 40 мм' }, { id: '60', t: 'Толщина 60 мм' }, { id: '80', t: 'Толщина 80 мм' }] },
    { k: 'melange-gr', t: 'Тротуарная плитка "ПРЕМИУМ" Меланж с Гранитным фактурным слоем', groups: [{ id: '40', t: 'Толщина 40 мм' }, { id: '60', t: 'Толщина 60 мм' }, { id: '80', t: 'Толщина 80 мм' }] },
    { k: 'road', t: 'Дорожные Элементы', groups: [{ id: 'dor-sm', t: 'Элементы Гладкие' }, { id: 'dor-gr', t: 'Элементы Гранитные' }] },
    { k: 'blocks', t: 'Стеновые Блоки', groups: [{ id: 'bl', t: 'Блоки (Серые)' }] }
];


/* ==========================================================================
   БЛОК 2: ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И УТИЛИТЫ
   ========================================================================== */
let cart = [];
const NO_PHOTO_SRC = 'assets/img/no-photo.jpg';

// Глобальная функция для обработки ошибок картинок (подставляет заглушку)
window.handleImgError = function (img) {
    if (img && !img.src.includes(NO_PHOTO_SRC)) {
        img.src = NO_PHOTO_SRC;
    }
};

window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? '✅ ' : (type === 'error' ? '⚠️ ' : 'ℹ️ ');
    toast.innerHTML = icon + message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* --- ФУНКЦИЯ КОПИРОВАНИЯ РЕКВИЗИТОВ С УВЕДОМЛЕНИЕМ --- */
window.copyText = function (element) {
    const parent = element.parentElement;
    const textToCopy = parent.textContent.replace(element.textContent, '').trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
        // Меняем иконку на галочку
        const originalText = element.textContent;
        element.textContent = '✅';
        element.style.opacity = '1';

        // Вызываем уведомление
        window.showToast(`Скопировано: <b>${textToCopy}</b>`);

        // Возвращаем исходную иконку через 1.5 сек
        setTimeout(() => {
            element.textContent = originalText;
            element.style.opacity = '';
        }, 1500);

    }).catch(err => {
        console.error('Ошибка при копировании: ', err);
        window.showToast('Ошибка копирования', 'error');
    });
};


/* ==========================================================================
   БЛОК 3: НАВИГАЦИЯ, МЕНЮ И МОДАЛЬНЫЕ ОКНА
   ========================================================================== */
window.toggleMobileMenu = function () {
    const nav = document.getElementById('mainNav');
    const btn = document.querySelector('.mobile-menu-btn');
    let overlay = document.querySelector('.mobile-menu-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', toggleMobileMenu);
    }
    if (!nav || !btn) return;
    const isActive = nav.classList.toggle('active');
    overlay.classList.toggle('active');
    btn.innerText = isActive ? '✕' : '☰';
    document.body.style.overflow = isActive ? 'hidden' : '';
};

function closeMobileMenu() {
    const nav = document.getElementById('mainNav');
    const btn = document.querySelector('.mobile-menu-btn');
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        if (btn) btn.innerText = '☰';
        document.body.style.overflow = '';
    }
}

function closeAllPopups() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));

    const qoModal = document.getElementById('quickOrderModal');
    if (qoModal) qoModal.remove();

    const lb = document.getElementById('lightbox-overlay') || document.getElementById('lightbox');
    if (lb && lb.classList.contains('active')) {
        lb.classList.remove('active');
        setTimeout(() => {
            lb.style.display = 'none';
        }, 300);
    }

    const d = document.getElementById('cartDrawer');
    const o = document.getElementById('cartOverlay');
    if (o) o.classList.remove('active');
    if (d) d.classList.remove('active');

    const s = document.getElementById('stickyCart');
    if (s) s.classList.remove('hidden-by-drawer');

    closeMobileMenu();

    const anyActive = document.querySelector('.modal.active, .cart-drawer.active');
    if (!anyActive) {
        document.body.style.overflow = '';
    }
}
window.closeAllPopups = closeAllPopups;

window.closeLightbox = function () { closeAllPopups(); };
window.closeNewsModal = function () { closeAllPopups(); };

window.openLightbox = function (src, caption) {
    const lb = document.getElementById('lightbox-overlay') || document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    if (img && lb) {
        img.src = src;
        if (cap) {
            cap.innerText = caption || '';
            cap.style.display = caption ? 'block' : 'none';
        }
        lb.style.display = 'flex';
        setTimeout(() => { lb.classList.add('active'); }, 10);
    }
};

window.openCert = function (el) {
    const img = (el.tagName === 'IMG') ? el : el.querySelector('img');
    if (img) {
        const card = el.closest('.news-card') || el.closest('.project-item') || el;
        let title = card.querySelector('.news-title')?.innerText ||
            card.querySelector('.project-title')?.innerText ||
            img.alt || '';
        openLightbox(img.src, title);
    }
};

/* --- АВТОНОМНЫЙ ЛАЙТБОКС ДЛЯ ФОТО КОНТАКТОВ (вынесен из DOMContentLoaded) --- */
window.openManagerPhoto = function (imgElement) {
    // Ищем существующий фон лайтбокса в DOM
    let overlay = document.getElementById('fast-lightbox');

    // Если фона нет — создаем его и настраиваем всю логику (выполнится один раз)
    if (!overlay) {
        // Создаем главный контейнер-фон
        overlay = document.createElement('div');
        overlay.id = 'fast-lightbox';

        // Задаем стили для затемнения на весь экран
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.cursor = 'zoom-out'; // Курсор-минус для закрытия
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';

        // Создаем тег для увеличенного изображения
        const img = document.createElement('img');
        img.id = 'fast-lightbox-img';

        // Задаем стили для картинки (размер, тень, анимация масштаба)
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.borderRadius = '12px';
        img.style.boxShadow = '0 15px 40px rgba(0,0,0,0.5)';
        img.style.objectFit = 'contain';
        img.style.transform = 'scale(0.9)';
        img.style.transition = 'transform 0.3s ease';

        // Добавляем элементы в структуру документа
        overlay.appendChild(img);
        document.body.appendChild(overlay);

        // Выносим логику закрытия в отдельную функцию для переиспользования
        const closeLightbox = function () {
            // Запускаем обратную анимацию исчезновения
            overlay.style.opacity = '0';
            img.style.transform = 'scale(0.9)';
            // Убираем блок из потока после завершения анимации
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        };

        // Назначаем закрытие по клику мыши (в любую область фона или фото)
        overlay.onclick = closeLightbox;

        // Назначаем глобальное закрытие по нажатию клавиши Esc
        document.addEventListener('keydown', function (e) {
            // Проверяем, что нажата именно Escape и лайтбокс сейчас видим
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                closeLightbox();
            }
        });
    }

    // Берем ссылку на картинку, по которой кликнули, и обновляем источник в лайтбоксе
    const imgElementToZoom = document.getElementById('fast-lightbox-img');
    imgElementToZoom.src = imgElement.src;

    // Показываем блок на экране
    overlay.style.display = 'flex';

    // Запускаем плавную анимацию появления с минимальной задержкой для срабатывания CSS transition
    setTimeout(() => {
        overlay.style.opacity = '1';
        imgElementToZoom.style.transform = 'scale(1)';
    }, 10);
};


/* ==========================================================================
   БЛОК 4: ГЕНЕРАЦИЯ КАТАЛОГА, ПОИСК И ФИЛЬТРЫ
   ========================================================================== */
window.setImg = (id, src) => {
    const img = document.getElementById('img-' + id);
    if (img) img.src = src;
};

function generatePriceHTML(prices) {
    let html = '';
    if (prices['mix']) {
        ['onyx', 'autumn', 'ruby', 'jasper', 'amber'].forEach(c => {
            html += `<div class="price-row"><span class="price-names">${COLOR_NAMES[c]}:</span><span class="price-val">${prices['mix']} ₽</span></div>`;
        });
    } else {
        ['gray', 'red', 'brown', 'black', 'white', 'yellow', 'orange'].forEach(c => {
            if (prices[c] !== undefined) {
                html += `<div class="price-row"><span class="price-names">${COLOR_NAMES[c]}:</span><span class="price-val">${prices[c]} ₽</span></div>`;
            }
        });
    }
    return html;
}

function renderFeaturedProducts() {
    const root = document.getElementById('featured-products-root');
    if (!root) return;

    root.innerHTML = '';

    catalogData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'prod-card animate-on-scroll';
        const basePath = `assets/img/catalog/${item.col}/${item.form}/`;
        const link = `catalog.html?id=${item.id}`;

        let dots = '<div class="pc-colors">';
        const colorsList = item.prices['mix'] ? ['onyx', 'autumn', 'ruby', 'jasper', 'amber'] : Object.keys(item.prices);

        colorsList.forEach(c => {
            dots += `<div class="color-dot" style="background:${COLOR_MAP[c]}" data-title="${COLOR_NAMES[c]}" onmouseover="setImg('${item.id}', '${basePath}${c}.png')"></div>`;
        });
        dots += '</div>';

        const defImg = item.prices['mix'] ? 'onyx' : 'gray';

        let badgeHtml = '';
        const b = item.badge ? item.badge.toLowerCase() : '';

        if (b === 'hit') {
            badgeHtml = `<div class="prod-badge badge-hit">ХИТ</div>`;
        } else if (b === 'new') {
            badgeHtml = `<div class="prod-badge badge-new">НОВИНКА</div>`;
        } else if (b === 'sale' || b === 'action' || b === 'promo') {
            badgeHtml = `<div class="prod-badge badge-sale">АКЦИЯ</div>`;
        }

        card.innerHTML = `
            ${badgeHtml}
            <div class="pc-head" onclick="openCert(this)" style="cursor:zoom-in;">
                <img src="${basePath}${defImg}.png" id="img-${item.id}" class="pc-img" onerror="window.handleImgError(this)" alt="${item.n}">
            </div>
            <div class="pc-body">
                <div class="pc-title" onclick="window.location.href='${link}'" style="cursor:pointer;">${item.n}</div>
                <table class="specs-table">
                    <tr><td>Размер:</td><td>${item.s}</td></tr>
                    <tr><td>На поддоне:</td><td>${item.q} ${item.u}</td></tr>
                </table>
                ${dots}
                <div class="price-list">${generatePriceHTML(item.prices)}</div>
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <a href="${link}" class="btn btn--outline-primary" style="text-align:center; padding: 12px 0; font-size: 12px; flex: 1;">Подробнее</a>
                    <button onclick="window.openQuickOrder('${item.id}')" class="btn btn--primary" style="text-align:center; padding: 12px 0; font-size: 12px; flex: 1;">В корзину</button>
                </div>
            </div>`;
        root.appendChild(card);
    });
}

// Функция загрузки и рендера отзывов
async function loadReviews() {
    const visibleContainer = document.getElementById('visible-reviews');
    const hiddenContainer = document.getElementById('hiddenReviews');

    // Если на странице нет блока отзывов, прерываем выполнение
    if (!visibleContainer || !hiddenContainer) return;

    try {
        const response = await fetch('./data/reviews.json');
        const reviews = await response.json();

        // Цветовые схемы для аватарок (как было в твоем оригинальном HTML)
        const colorSchemes = [
            { bg: '#f0f7fc', color: 'var(--primary-color)' }, // Синий
            { bg: '#fcf0fc', color: '#9b59b6' },             // Фиолетовый
            { bg: '#fdf2f2', color: '#e74c3c' }              // Красный
        ];

        let visibleHtml = '';
        let hiddenHtml = '';

        reviews.forEach((review, index) => {
            // Берем первую букву имени для аватарки
            const firstLetter = review.author.charAt(0).toUpperCase();
            // Чередуем цвета по кругу
            const colors = colorSchemes[index % colorSchemes.length];
            // Генерируем звезды (от 1 до 5)
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

            // Собираем карточку точь-в-точь как в твоем HTML
            const cardHtml = `
                <div class="review-card p-card">
                    <div class="review-header">
                        <div class="review-avatar" style="background:${colors.bg}; color:${colors.color};">${firstLetter}</div>
                        <div>
                            <strong style="font-size: 16px; display:block;">${review.author}</strong>
                            <div class="stars">${stars}</div>
                        </div>
                    </div>
                    <div class="review-content-wrap">
                        <p class="review-text">${review.text}</p>
                    </div>
                    <button class="review-toggle-btn js-toggle-text">Читать полностью</button>
                </div>
            `;

            // Первые 3 отзыва кидаем в видимый блок, остальные — в скрытый
            if (index < 3) {
                visibleHtml += cardHtml;
            } else {
                hiddenHtml += cardHtml;
            }
        });

        visibleContainer.innerHTML = visibleHtml;
        hiddenContainer.innerHTML = hiddenHtml;

    } catch (error) {
        console.error('Ошибка при загрузке отзывов:', error);
    }
}

window.renderCatalog = function () {
    const catalogRoot = document.getElementById('catalog-root');
    if (!catalogRoot) return;

    catalogRoot.innerHTML = '';

    // 1. Читаем текущее значение поиска
    const searchInput = document.getElementById('searchInput');
    const rawSearchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const terms = rawSearchTerm.split(/\s+/).filter(t => t.length > 0);

    // 2. Читаем текущую сортировку
    const sortSelect = document.getElementById('sortSelect');
    const sortMode = sortSelect ? sortSelect.value : 'default';

    let totalItemsFound = 0; // НОВОЕ: Счетчик найденных товаров

    CATS_CONFIG.forEach(c => {
        const wrapper = document.createElement('div');
        wrapper.className = 'category-wrapper catalog-category';
        wrapper.id = 'cat-' + c.k;
        wrapper.innerHTML = `<h2 class="category-title">${c.t}</h2>`;

        let categoryHasItems = false;

        c.groups.forEach(g => {
            // Базовый фильтр по категории
            let items = fullCatalog.filter(i => i.cat === c.k && i.grp === g.id);

            // ФИЛЬТРАЦИЯ ПО ПОИСКУ
            if (terms.length > 0) {
                items = items.filter(item => {
                    const lowerName = item.n.toLowerCase();
                    const cleanedName = window.cleanText(item.n);
                    const basicMatch = terms.every(term => lowerName.includes(term));
                    const fuzzyMatch = terms.every(term => {
                        const cleanTerm = window.cleanText(term);
                        return cleanedName.includes(cleanTerm);
                    });
                    return basicMatch || fuzzyMatch;
                });
            }

            if (items.length === 0) return;

            categoryHasItems = true;
            totalItemsFound += items.length; // НОВОЕ: Плюсуем найденные товары

            // СОРТИРОВКА (Дешевле / Дороже)
            items.sort((a, b) => {
                const getPrice = (p) => {
                    const prices = p.prices['mix'] ? [p.prices['mix']] : Object.values(p.prices);
                    return Math.min(...prices);
                };
                if (sortMode === 'price_asc') return getPrice(a) - getPrice(b);
                if (sortMode === 'price_desc') return getPrice(b) - getPrice(a);
                return 0; // default
            });

            const subHeader = document.createElement('div');
            subHeader.className = 'sub-header';
            subHeader.innerText = g.t;
            wrapper.appendChild(subHeader);

            const grid = document.createElement('div');
            grid.className = 'catalog-grid';

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'prod-card';
                const basePath = `assets/img/catalog/${item.col}/${item.form}/`;

                let badgeHtml = '';
                if (item.badge) {
                    let bTxt = item.badge.toLowerCase() === 'hit' ? 'ХИТ' : (item.badge.toLowerCase() === 'new' ? 'НОВИНКА' : 'АКЦИЯ');
                    let bCls = 'badge-' + item.badge.toLowerCase();
                    badgeHtml = `<div class="prod-badge ${bCls}">${bTxt}</div>`;
                }

                let dotsHtml = '<div class="pc-colors">';
                const displayColors = item.prices['mix']
                    ? ['onyx', 'autumn', 'ruby', 'jasper', 'amber']
                    : ['gray', 'red', 'brown', 'black', 'white', 'yellow', 'orange'].filter(clr => item.prices[clr] !== undefined);

                displayColors.forEach(clr => {
                    if (COLOR_MAP[clr]) {
                        dotsHtml += `<div class="color-dot" style="background:${COLOR_MAP[clr]}" data-title="${COLOR_NAMES[clr]}" onmouseover="window.setImg('${item.id}', '${basePath}${clr}.png')"></div>`;
                    }
                });
                dotsHtml += '</div>';

                const priceHtml = generatePriceHTML(item.prices);
                const safeName = item.n.replace(/"/g, '&quot;');
                const defaultImg = item.cat.includes('melange') ? 'onyx' : 'gray';

                card.innerHTML = `
                     ${badgeHtml}
                     <div class="pc-head" onclick="window.openLightbox(this.querySelector('img').src, '${safeName}')" style="cursor:zoom-in;">
                        <img src="${basePath}${defaultImg}.png" loading="lazy" decoding="async" id="img-${item.id}" class="pc-img" alt="${item.n}" onerror="window.handleImgError(this)">                    </div>
                    <div class="pc-body">
                    <div class="pc-title">${item.n}</div>
                        <table class="specs-table">
                            <tr><td>Размер:</td><td>${item.s}</td></tr>
                            <tr><td>На поддоне:</td><td>${item.q} ${item.u}</td></tr>
                            <tr><td>Вес поддона:</td><td>${item.w} кг</td></tr>
                        </table>
                    ${dotsHtml}
                    <div class="price-list">${priceHtml}</div>
<button class="btn btn--primary full-width" onclick="window.openQuickOrder('${item.id}')">В корзину</button>                    </div>
                `;
                grid.appendChild(card);
            });
            wrapper.appendChild(grid);
        });

        if (categoryHasItems) catalogRoot.appendChild(wrapper);
    });

    // НОВОЕ: ЕСЛИ НИЧЕГО НЕ НАЙДЕНО — ВЫВОДИМ ЗАГЛУШКУ
    if (totalItemsFound === 0) {
        catalogRoot.innerHTML = `
            <div style="text-align: center; padding: 80px 20px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); margin-top: 20px;">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.5" style="margin-bottom: 20px;">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3 style="font-size: 24px; color: #2c3e50; margin-bottom: 10px; font-weight: 800;">По вашему запросу ничего не найдено</h3>
                <p style="color: #666; margin-bottom: 30px; font-size: 16px;">Попробуйте изменить формулировку, например: <br>«Квадрат», «Бордюр» или «Меланж».</p>
                <button class="btn btn--primary" onclick="window.resetSearch()" style="padding: 15px 40px; font-size: 15px;">Сбросить поиск</button>
            </div>
        `;
    }
    window.initScrollAnimations();
};

// Железобетонная очистка: удаляет всё, кроме русских/английских букв и цифр (через Unicode)
window.cleanText = function (str) {
    if (!str) return '';
    return str.toLowerCase().replace(/[^\u0410-\u044F\u0401\u0451a-zA-Z0-9]/gi, '');
};

// 1. Логика живого поиска
window.handleSearch = function (val) {
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    const rawSearchTerm = val.toLowerCase().trim();
    const terms = rawSearchTerm.split(/\s+/).filter(t => t.length > 0);

    // Если поиск пуст - скрываем дропдаун и показываем весь каталог
    if (terms.length === 0) {
        dropdown.classList.remove('active');
        window.renderCatalog();
        return;
    }

    // Ищем совпадения
    const matches = fullCatalog.filter(item => {
        const lowerName = item.n.toLowerCase();
        const cleanedName = window.cleanText(item.n);

        // Строгое совпадение кусков текста
        const basicMatch = terms.every(term => lowerName.includes(term));

        // Умное совпадение (игнорируем точки, пробелы, дефисы)
        const fuzzyMatch = terms.every(term => {
            const cleanTerm = window.cleanText(term);
            return cleanedName.includes(cleanTerm);
        });

        return basicMatch || fuzzyMatch;
    });

    // Рисуем результаты в дропдауне
    if (matches.length > 0) {
        let html = '';
        matches.slice(0, 5).forEach(item => {
            const defaultImg = item.cat.includes('melange') ? 'onyx' : 'gray';
            const thumbPath = `assets/img/catalog/${item.col}/${item.form}/${defaultImg}.png`;
            html += `<div class="search-item" onclick="window.goToProduct('${item.id}', '${item.cat}')">
                <div class="search-item-name">${item.n}</div>
                <img src="${thumbPath}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;" onerror="window.handleImgError(this)">
            </div>`;
        });
        dropdown.innerHTML = html;
        dropdown.classList.add('active');
    } else {
        dropdown.classList.remove('active');
    }

    // Обязательно перерисовываем каталог, чтобы на странице остались только найденные карточки
    window.renderCatalog();
};

/* Комментарий: Функция для сброса поиска (вызывается по кнопке из заглушки) */
window.resetSearch = function () {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = ''; // Очищаем поле
    window.handleSearch(''); // Запускаем пустой поиск (возвращает весь каталог)
};

// 2. Переход к конкретному товару
window.goToProduct = function (itemId, catId) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const dropdown = document.getElementById('searchDropdown');
    if (dropdown) dropdown.classList.remove('active');

    window.renderCatalog();
    window.applyFilter(catId);

    setTimeout(() => {
        const element = document.getElementById('img-' + itemId);
        if (element) {
            const y = element.closest('.prod-card').getBoundingClientRect().top + window.pageYOffset - 240;
            window.scrollTo({ top: y, behavior: 'smooth' });

            const card = element.closest('.prod-card');
            card.style.transition = "box-shadow 0.5s";
            card.style.boxShadow = "0 0 0 4px var(--primary-color)";
            setTimeout(() => card.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.20)", 2000);
        }
    }, 100);
};

// 3. Логика переключения фильтров категорий
window.applyFilter = function (catId) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const filterBtn = document.querySelector(`.filter-btn[data-cat="${catId}"]`);
    if (filterBtn) filterBtn.classList.add('active');

    const allCats = document.querySelectorAll('.catalog-category');
    allCats.forEach(c => {
        c.style.display = (catId === 'all' || c.id === 'cat-' + catId) ? 'block' : 'none';
    });
};


/* ==========================================================================
   БЛОК 5: КОРЗИНА, КАЛЬКУЛЯТОР И ОФОРМЛЕНИЕ ЗАКАЗА
   ========================================================================== */
window.toggleCart = function () {
    const d = document.getElementById('cartDrawer');
    const o = document.getElementById('cartOverlay');
    const s = document.getElementById('stickyCart');
    if (d && o) {
        const isActive = d.classList.toggle('active');
        o.classList.toggle('active');
        document.body.style.overflow = isActive ? 'hidden' : '';
        if (s) isActive ? s.classList.add('hidden-by-drawer') : s.classList.remove('hidden-by-drawer');
    }
};

window.addToCart = function (productId, colorId = 'gray', quantity = 1) {
    const product = fullCatalog.find(item => item.id === productId);
    if (!product) { showToast('Товар не найден', 'error'); return; }

    const colorName = COLOR_NAMES[colorId] || 'Не указан';
    const price = product.prices[colorId] || product.prices['mix'] || 0;
    const thumb = `assets/img/catalog/${product.col}/${product.form}/${colorId}.png`;

    // ПРАВИЛЬНЫЙ РАСЧЕТ ВЕСА: Вес поддона делим на количество в поддоне
    const unitWeight = (parseFloat(product.w) || 0) / (parseFloat(product.q) || 1);

    const existingItem = cart.find(item => item.id === productId && item.color === colorName);

    if (existingItem) {
        existingItem.qty += quantity;
        existingItem.sum = existingItem.qty * price;
        existingItem.weight = unitWeight * existingItem.qty;
        existingItem.pallets = ((1 / (parseFloat(product.q) || 1)) * existingItem.qty).toFixed(2);
        showToast(`Количество "${product.n}" увеличено`, 'info');
    } else {
        cart.push({
            id: productId,
            name: product.n,
            color: colorName,
            price: price,
            sum: price * quantity,
            qty: quantity,
            unit: product.u || 'шт',
            thumb: thumb,
            weight: unitWeight * quantity,
            pallets: ((1 / (parseFloat(product.q) || 1)) * quantity).toFixed(2)
        });
        showToast(`Товар "${product.n}" добавлен в корзину`, 'success');
    }

    saveCart();
    const d = document.getElementById('cartDrawer');
    if (d && !d.classList.contains('active')) toggleCart();
};

function loadCart() {
    const s = localStorage.getItem('plittex_cart');
    if (s) { try { cart = JSON.parse(s); } catch (e) { cart = []; } }
    renderCart();
}

function saveCart() {
    localStorage.setItem('plittex_cart', JSON.stringify(cart));
    renderCart();

    // Добавляем класс анимации на синюю плавающую кнопку
    const stickyCart = document.getElementById('stickyCart');
    if (stickyCart) {
        stickyCart.classList.add('cart-bounce');
        setTimeout(() => stickyCart.classList.remove('cart-bounce'), 400);
    }
}

window.delCart = (i) => { cart.splice(i, 1); saveCart(); };
window.clearCart = () => { if (confirm('Очистить корзину?')) { cart = []; saveCart(); toggleCart(); } };

/* --- 1. УМНАЯ ОТРИСОВКА КОРЗИНЫ --- */
function renderCart() {
    const w = document.getElementById('cartItems');
    const s = document.getElementById('stickyCart');
    if (!w) return;

    let sum = 0, wgt = 0, qty = 0, fp = 0, pp = 0;
    w.innerHTML = '';

    if (cart.length === 0) {
        w.innerHTML = '<div style="text-align:center; padding:30px; color:#999;">Корзина пуста</div>';
        if (s) s.classList.remove('visible');
    } else {
        if (s) s.classList.add('visible');
    }

    cart.forEach((c, i) => {
        sum += c.sum; wgt += (c.weight || 0); qty += c.qty;
        let p = parseFloat(c.pallets) || 0;
        fp += Math.floor(p); if (p % 1 > 0.01) pp++;
        w.innerHTML += `
        <div class="cart-item">
            <img src="${c.thumb || NO_PHOTO_SRC}" class="ci-img" onerror="window.handleImgError(this)">
            <div class="ci-info">
                <div class="ci-name">${c.name}</div>
                <div class="ci-meta">Цвет: ${c.color || 'Стандарт'}</div>
                
                <div class="ci-qty-wrapper">
                    <button class="ci-qty-btn" onclick="window.changeCartQty(${i}, -1)">−</button>
                    <input type="text" class="ci-qty-input" value="${c.qty}" readonly>
                    <button class="ci-qty-btn" onclick="window.changeCartQty(${i}, 1)">+</button>
                </div>
            </div>
            <div class="ci-right">
                <button class="ci-del" onclick="window.delCart(${i})" title="Удалить товар">✕</button>
                <div style="text-align:right;">
                    <div class="ci-price">${c.sum.toLocaleString()} ₽</div>
                    <div class="ci-price-one">${c.price.toLocaleString()} ₽/${c.unit}</div>
                </div>
            </div>
        </div>`;
    });

    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; }

    setText('cartTotalSum', sum.toLocaleString() + ' ₽');
    setText('scTotal', sum.toLocaleString() + ' ₽');
    setText('scCount', cart.length);
    setText('cartHeaderQty', `(${cart.length})`);

    // Обновляем новую серую плашку статистики в боковой корзине
    setText('cartTotalQty', qty);
    setText('cartTotalWeight', Math.round(wgt).toLocaleString() + ' кг');
    setText('cartTotalPallets', `${fp} цел. + ${pp} неполн.`);

    const ord = document.getElementById('orderDataField');
    if (ord) ord.value = JSON.stringify(cart);
}

/* ==========================================
   ФУНКЦИЯ УМНОГО ИЗМЕНЕНИЯ КОЛИЧЕСТВА
   ========================================== */
/* ==========================================
   ФУНКЦИЯ УМНОГО ИЗМЕНЕНИЯ КОЛИЧЕСТВА
   ========================================== */
window.changeCartQty = function (index, step) {
    if (!cart[index]) return;

    cart[index].qty += step;
    if (cart[index].qty < 1) cart[index].qty = 1;

    cart[index].sum = cart[index].qty * cart[index].price;

    const product = fullCatalog.find(p => p.id === cart[index].id);
    if (product) {
        // ПРАВИЛЬНЫЙ ПЕРЕСЧЕТ ВЕСА
        const unitWeight = (parseFloat(product.w) || 0) / (parseFloat(product.q) || 1);
        cart[index].weight = unitWeight * cart[index].qty;
        cart[index].pallets = ((1 / (parseFloat(product.q) || 1)) * cart[index].qty).toFixed(2);
    }

    saveCart();
    renderCart(); // Мгновенно обновляем плашку статистики
};
// --- ЛОГИКА КАЛЬКУЛЯТОРА ---
let currentCalcProduct = null;

window.addToCartPrep = function (productId) {
    const product = fullCatalog.find(p => p.id === productId);
    if (!product) return;

    currentCalcProduct = product;

    const modal = document.getElementById('calcModal');
    const title = document.getElementById('calcProdTitle');
    const select = document.getElementById('calcColorSelect');
    const qtyInput = document.getElementById('calcQty');

    if (modal && title && select) {
        title.innerText = product.n;
        qtyInput.value = 1;

        // Заполняем список цветов
        let colors = product.prices['mix'] ? ['onyx', 'autumn', 'ruby', 'jasper', 'amber'] : Object.keys(product.prices);
        select.innerHTML = colors.map(c => `<option value="${c}">${COLOR_NAMES[c]}</option>`).join('');

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        window.updateCalcPreview(); // Считаем сразу при открытии
    }
};

window.updateCalcPreview = function () {
    if (!currentCalcProduct) return;

    const color = document.getElementById('calcColorSelect').value;
    const qty = parseFloat(document.getElementById('calcQty').value) || 0;
    const preview = document.getElementById('liveCalcPreview');

    const price = currentCalcProduct.prices[color] || currentCalcProduct.prices['mix'] || 0;
    const weightPerUnit = parseFloat(currentCalcProduct.w) || 0;
    const qtyInPallet = parseFloat(currentCalcProduct.q) || 1;

    const totalSum = Math.round(qty * price);
    const totalWeight = Math.round(qty * (weightPerUnit / qtyInPallet)); // Расчет веса от кол-ва

    document.getElementById('liveSum').innerText = totalSum.toLocaleString() + ' ₽';
    document.getElementById('liveWeight').innerText = totalWeight.toLocaleString() + ' кг';

    if (qty > 0) preview.style.display = 'flex';
};

window.confirmCalcAddToCart = function () {
    if (!currentCalcProduct) return;

    const color = document.getElementById('calcColorSelect').value;
    const qty = parseFloat(document.getElementById('calcQty').value) || 1;

    // Вызываем оригинальную функцию корзины, передавая ей нужные данные
    if (typeof window.addToCart === 'function') {
        window.addToCart(currentCalcProduct.id, color, qty);
    }

    window.closeAllPopups();
};

document.querySelectorAll('.js-close-calc').forEach(el => {
    el.onclick = () => {
        document.getElementById('calcModal').classList.remove('active');
        document.body.style.overflow = '';
    };
});

/* --- 2. УМНОЕ ОКНО ДОБАВЛЕНИЯ В ЗАКАЗ (БЕЗ ДУБЛЕЙ) --- */
window.openQuickOrder = function (productId) {
    const product = fullCatalog.find(p => p.id === productId);
    if (!product) return;

    const oldModal = document.getElementById('quickOrderModal');
    if (oldModal) oldModal.remove();

    const colorsList = product.prices['mix'] ? ['onyx', 'autumn', 'ruby', 'jasper', 'amber'] : Object.keys(product.prices);
    const defColor = colorsList[0];
    const basePath = `assets/img/catalog/${product.col}/${product.form}/`;

    const startPrice = product.prices[defColor] || product.prices['mix'];

    // ПРАВИЛЬНЫЙ СТАРТОВЫЙ ВЕС
    const unitWeight = (parseFloat(product.w) || 0) / (parseFloat(product.q) || 1);

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'quickOrderModal';

    modal.innerHTML = `
    <div class="modal-overlay" onclick="closeAllPopups()"></div>
    
    <div class="modal-container" style="max-width: 480px; padding: 0; border-radius: 16px; overflow: hidden;">
        <button class="modal-close" onclick="closeAllPopups()" style="top: 15px; right: 15px; background: #fff; border-radius: 50%; width: 32px; height: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">✕</button>
        
        <div style="background: #f8f9fa; padding: 25px 30px; border-bottom: 1px solid #eee; display: flex; gap: 20px; align-items: center;">
            <img id="qo-img" src="${basePath}${defColor}.png" onerror="window.handleImgError(this)" style="width: 110px; height: 110px; object-fit: contain; border-radius: 12px; background: #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.05); padding: 5px;">
            <div>
                <h4 style="margin: 0 0 5px; font-size: 18px; font-weight: 800; line-height: 1.2;">${product.n}</h4>
                <div style="font-size: 13px; color: #777; margin-bottom: 8px;">Размер: ${product.s}</div>
                <div id="qo-price-unit" style="font-size: 18px; font-weight: 900; color: var(--primary-color);">${startPrice} ₽ <span style="font-size:12px; color:#999; font-weight:600;">за ${product.u}</span></div>
            </div>
        </div>

        <div style="padding: 25px 30px;">
            <div style="margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px;">
                    <span style="font-size: 12px; color: #888; font-weight: 700; text-transform: uppercase;">Цвет: <span id="qo-color-name" style="color: #333;">${COLOR_NAMES[defColor]}</span></span>
                </div>
                
                <div class="pc-colors" id="qo-colors-container" data-selected-color="${defColor}" data-current-price="${startPrice}" data-weight="${unitWeight}">
                    ${colorsList.map(c => `
                        <div class="color-dot ${c === defColor ? 'active' : ''}" 
                             style="background:${COLOR_MAP[c]}; width: 38px; height: 38px; ${c === defColor ? 'box-shadow: 0 0 0 2px #333;' : ''}" 
                             data-color="${c}" 
                             data-price="${product.prices[c] || product.prices['mix']}"
                             data-name="${COLOR_NAMES[c]}"
                             data-img="${basePath}${c}.png"
                             onclick="window.selectQOColor(this)">
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; background: #fbfbfb; padding: 15px; border-radius: 12px; border: 1px solid #eee;">
                <div>
                    <div style="font-size: 11px; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Количество (${product.u}):</div>
                    <div style="display: flex; align-items: center; border: 1px solid #d5d5d5; border-radius: 8px; width: fit-content; overflow: hidden; background: #fff;">
                        <button onclick="window.changeQOQty(-1)" style="width: 36px; height: 36px; background: #f8f9fa; border: none; font-size: 18px; cursor: pointer; color: #555; display: flex; align-items: center; justify-content: center; padding: 0;">−</button>
                        <input type="number" id="qo-qty" value="" placeholder="1" inputmode="decimal" class="no-spinners" oninput="window.updateQOTotals()" style="width: 65px; height: 36px; border: none; border-left: 1px solid #d5d5d5; border-right: 1px solid #d5d5d5; text-align: left; padding-left: 12px; font-size: 16px; font-weight: 800; outline: none; color: #333;">                        
                        <button onclick="window.changeQOQty(1)" style="width: 36px; height: 36px; background: #f8f9fa; border: none; font-size: 18px; cursor: pointer; color: #555; display: flex; align-items: center; justify-content: center; padding: 0;">+</button>
                    </div>
                </div>
                
                <div style="text-align: right; flex-shrink: 0;">
                    <div style="font-size: 11px; color: #888; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Итого:</div>
                    <div id="qo-total-price" style="font-size: 22px; font-weight: 900; color: #333; line-height: 1;">${startPrice.toLocaleString()} ₽</div>
                    <div id="qo-total-weight" style="font-size: 12px; color: #999; margin-top: 6px;">Вес: ${Math.round(unitWeight).toLocaleString()} кг</div>
                </div>
            </div>

            <button onclick="window.confirmQOAdd('${product.id}')" class="btn btn--primary" style="width: 100%; padding: 16px; font-size: 15px; border-radius: 50px;">ДОБАВИТЬ В КОРЗИНУ</button>
        </div>
    </div>`;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const input = document.getElementById('qo-qty');
        if (input) input.focus();
    }, 100);
};

// --- ФУНКЦИЯ ЖИВОГО ПЕРЕСЧЕТА ИТОГОВ ---
window.updateQOTotals = function () {
    const input = document.getElementById('qo-qty');
    let qty = parseInt(input.value);

    // Если поле пустое (NaN), берем 1 для расчета цены, но в самом поле оставляем пустоту
    let calcQty = isNaN(qty) ? 1 : qty;
    if (calcQty < 0) calcQty = 0;

    const container = document.getElementById('qo-colors-container');
    const price = parseInt(container.dataset.currentPrice) || 0;
    const weightPerUnit = parseFloat(container.dataset.weight) || 0;

    document.getElementById('qo-total-price').innerText = (price * calcQty).toLocaleString() + ' ₽';
    if (weightPerUnit > 0) {
        document.getElementById('qo-total-weight').innerText = 'Вес: ' + Math.round(weightPerUnit * calcQty).toLocaleString() + ' кг';
    }
};

window.changeQOQty = function (step) {
    const input = document.getElementById('qo-qty');
    let val = parseInt(input.value);

    // Если поле было пустым, а человек нажал + или -, начинаем счет с нуля
    if (isNaN(val)) val = 0;

    val += step;
    if (val < 1) val = 1;
    input.value = val;

    window.updateQOTotals();
};

window.selectQOColor = function (dotEl) {
    document.querySelectorAll('#qo-colors-container .color-dot').forEach(d => d.style.boxShadow = '0 0 0 1px #ccc');
    dotEl.style.boxShadow = '0 0 0 2px #333';

    document.getElementById('qo-img').src = dotEl.dataset.img;
    document.getElementById('qo-color-name').innerText = dotEl.dataset.name;
    document.getElementById('qo-price-unit').innerHTML = `${dotEl.dataset.price} ₽ <span style="font-size:12px; color:#999; font-weight:600;">за ед.</span>`;

    const container = document.getElementById('qo-colors-container');
    container.dataset.selectedColor = dotEl.dataset.color;
    container.dataset.currentPrice = dotEl.dataset.price; // Сохраняем новую цену для формулы

    window.updateQOTotals(); // Сразу пересчитываем итог
};


window.confirmQOAdd = function (productId) {
    const selectedColor = document.getElementById('qo-colors-container').dataset.selectedColor;
    let qty = parseInt(document.getElementById('qo-qty').value);

    // Финальная защита: если при отправке поле пустое или 0, кидаем в корзину минимум 1 единицу
    if (isNaN(qty) || qty < 1) qty = 1;

    if (typeof window.addToCart === 'function') {
        window.addToCart(productId, selectedColor, qty);
    }
    window.closeAllPopups();
};

/* ==========================================================================
   БЛОК 6: АНИМАЦИИ И РОТАТОР КАРТИНОК
   ========================================================================== */
// 2. УНИВЕРСАЛЬНАЯ АНИМАЦИЯ ПОЯВЛЕНИЯ
window.initScrollAnimations = function () {
    // Скрипт следит только за базовыми классами-контейнерами
    const elementsToAnimate = document.querySelectorAll(`
            .feature-card:not(.observed), 
            .p-card:not(.observed), 
            .b-card:not(.observed), 
            .prod-card:not(.observed), 
            .news-card:not(.observed), 
            .cc-card:not(.observed),
            .animate-block:not(.observed)
        `);

    if (elementsToAnimate.length > 0 && typeof IntersectionObserver !== 'undefined') {
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        elementsToAnimate.forEach((el, index) => {
            el.classList.add('animate-on-scroll', 'observed');
            // Автоматическая задержка: карточки в ряду всплывают по очереди
            el.style.animationDelay = `${(index % 4) * 0.1}s`;
            scrollObserver.observe(el);
        });
    }
};

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const isDecimal = obj.getAttribute('data-decimal');

    const rawText = obj.innerText || '';
    const suffix = rawText.includes('+') ? '+' : (rawText.includes('%') ? '%' : '');

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentVal = easeOut * (end - start) + start;

        obj.innerText = (isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal).toLocaleString('ru-RU')) + suffix;

        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

const appearanceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-item').forEach((item, index) => {
                setTimeout(() => item.classList.add('is-visible'), index * 100);
            });
            if (entry.target.classList.contains('stats-container')) {
                setTimeout(() => {
                    entry.target.querySelectorAll('.count').forEach(c => animateValue(c, 0, parseFloat(c.dataset.target), 1500));
                }, 300);
            }
            if (entry.target.classList.contains('stat-number')) {
                const targetVal = parseFloat(entry.target.innerText.replace(/\s/g, '').replace(/\D/g, ''));
                if (!isNaN(targetVal)) animateValue(entry.target, 0, targetVal, 2000);
            }
            appearanceObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

const privatePhotos = [];
for (let i = 1; i <= 68; i++) privatePhotos.push(`assets/img/priv/priv${i}.jpg`);

const publicPhotos = [];
for (let i = 1; i <= 24; i++) publicPhotos.push(`assets/img/pub/pub${i}.jpg`);

const rotators = [
    { id: 'proj-img-1', pool: privatePhotos },
    { id: 'proj-img-2', pool: publicPhotos },
    { id: 'proj-img-3', pool: publicPhotos }
];

function rotateImages() {
    rotators.forEach(item => {
        const imgEl = document.getElementById(item.id);
        if (!imgEl) return;

        imgEl.classList.add('fade-out');

        setTimeout(() => {
            let newSrc;
            do {
                newSrc = item.pool[Math.floor(Math.random() * item.pool.length)];
            } while (newSrc === imgEl.getAttribute('src') && item.pool.length > 1);

            imgEl.src = newSrc;
            imgEl.onload = () => imgEl.classList.remove('fade-out');
            imgEl.onerror = () => imgEl.classList.remove('fade-out');
        }, 500);
    });
}


/* ==========================================================================
   БЛОК 7: ФОРМЫ (ОТПРАВКА AJAX)
   ========================================================================== */
function setupForm(id) {
    const f = document.getElementById(id);
    if (!f) return;
    f.onsubmit = e => {
        e.preventDefault();
        if (!navigator.onLine) { showToast('Нет интернета!', 'error'); return; }
        if (f.antispam && f.antispam.value !== "") return;
        const btn = f.querySelector('button[type="submit"]') || f.querySelector('button:last-of-type');
        const old = btn.innerText;
        btn.innerText = 'Отправка...';
        btn.disabled = true;
        fetch('send.php', { method: 'POST', body: new FormData(f) })
            .then(r => r.json()).then(d => {
                btn.innerText = old; btn.disabled = false;
                if (d.status === 'success') {
                    if (id === 'orderForm') { cart = []; saveCart(); }
                    window.location.href = "thanks.html";
                } else { showToast('Ошибка: ' + d.message, 'error'); }
            }).catch(() => {
                showToast('Сбой при отправке. Пожалуйста, позвоните нам.', 'error');
                btn.innerText = old; btn.disabled = false;
            });
    }
}


/* ==========================================================================
   БЛОК 8: ГЛОБАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ СТРАНИЦ (DOMContentLoaded)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // --- 8.1. БАЗОВАЯ ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ ---
    document.querySelectorAll('.news-img, .project-item img').forEach(img => {
        img.addEventListener('error', function () {
            window.handleImgError(this);
        });
    });

    loadCart();
    loadReviews();

    ['modalForm', 'orderForm', 'questionForm', 'consultationForm', 'reviewForm', 'partnerForm', 'consultForm', 'priceForm'].forEach(id => setupForm(id));

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllPopups(); });
    document.querySelectorAll('.js-close-modal, .modal-overlay, .cart-drawer__close, .cart-overlay, .js-close-news, .lightbox-close').forEach(el => el.onclick = closeAllPopups);

    const lb = document.getElementById('lightbox-overlay') || document.getElementById('lightbox');
    if (lb) {
        lb.onclick = (e) => {
            if (e.target === lb || e.target.tagName === 'IMG' || e.target.classList.contains('lightbox-close')) {
                closeAllPopups();
            }
        };
    }

    const stBtn = document.getElementById('scrollTopBtn');
    if (stBtn) stBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    window.addEventListener('scroll', () => {
        const h = document.querySelector('.header');
        if (h) window.scrollY > 10 ? h.classList.add('header--scrolled') : h.classList.remove('header--scrolled');
        if (stBtn) window.scrollY > 300 ? stBtn.classList.add('visible') : stBtn.classList.remove('visible');
    });

    document.querySelectorAll('input[type="tel"]').forEach(i => {
        if (window.IMask) IMask(i, { mask: '+{7} (000) 000-00-00' });
    });

    document.querySelectorAll('.js-open-modal').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const m = document.getElementById('callbackModal');
            if (m) {
                const subj = btn.dataset.subject || 'Заказ звонка';
                const subjInput = document.getElementById('modalSubjectField');
                if (subjInput) subjInput.value = subj;
                const h3 = m.querySelector('h3');
                if (h3) h3.innerText = subj;
                m.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };
    });


    // --- 8.2. ИНИЦИАЛИЗАЦИЯ КАТАЛОГА И ПОИСКА ---
    if (document.getElementById('catalog-root')) {
        window.renderCatalog();

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (productId) {
            const product = fullCatalog.find(p => p.id === productId);
            if (product) {
                setTimeout(() => {
                    window.goToProduct(product.id, product.cat);
                }, 300);
            }
        }
        else {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                const filterBtn = document.querySelector(`.filter-btn[data-cat="${hash}"]`);
                if (filterBtn) {
                    setTimeout(() => filterBtn.click(), 100);
                }
            }
        }
    }

    // НОВЫЙ СЛУШАТЕЛЬ ДЛЯ ССЫЛОК ИЗ ФУТЕРА (работает без перезагрузки страницы)
    window.addEventListener('hashchange', () => {
        if (document.getElementById('catalog-root')) {
            const hash = window.location.hash.replace('#', '');
            const targetCat = hash ? hash : 'all';
            const filterBtn = document.querySelector(`.filter-btn[data-cat="${targetCat}"]`);
            if (filterBtn) filterBtn.click();
        }
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            window.renderCatalog();
        });
    }

    document.querySelectorAll('.filter-btn[data-cat]').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-cat');
            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.value = '';

            window.renderCatalog();
            window.applyFilter(cat);

            if (cat === 'all') {
                window.history.replaceState(null, null, window.location.pathname + window.location.search);
            } else {
                window.history.replaceState(null, null, '#' + cat);
            }

            if (cat === 'all') {
                const controls = document.querySelector('.catalog-controls');
                if (controls) {
                    const y = controls.closest('.section-padding').getBoundingClientRect().top + window.pageYOffset - 5;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            } else {
                const target = document.getElementById('cat-' + cat);
                if (target) {
                    const y = target.getBoundingClientRect().top + window.pageYOffset - 240;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        });
    });

    const searchInputEl = document.getElementById('searchInput');
    if (searchInputEl) {
        searchInputEl.addEventListener('input', (e) => {
            window.handleSearch(e.target.value);
        });
        searchInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.target.value = '';
                window.handleSearch('');
            }
        });
    }

    if (document.getElementById('featured-products-root')) {
        renderFeaturedProducts();
    }


    // --- 8.3. ИНИЦИАЛИЗАЦИЯ АНИМАЦИЙ (Обозреватели) ---

    // Запускаем сразу для тех элементов, что уже есть в HTML
    window.initScrollAnimations();

    document.querySelectorAll('.stats-container, .grid-4, .stat-number').forEach(grid => {
        if (typeof appearanceObserver !== 'undefined') {
            appearanceObserver.observe(grid);
        }
    });

    const projectsSec = document.getElementById('projectsSection');
    let intervalId = null;

    if (projectsSec) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!intervalId) {
                        rotateImages();
                        intervalId = setInterval(rotateImages, 5000);
                    }
                } else {
                    if (intervalId) {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                }
            });
        }, { threshold: 0.1 });
        observer.observe(projectsSec);
    }


    // --- 8.4. ЛОГИКА СТРАНИЦЫ "О ЗАВОДЕ" (ОТЗЫВЫ, СЕРТИФИКАТЫ, FAQ) ---
    function initReviewsHeight() {
        document.querySelectorAll('.review-content-wrap').forEach(wrap => {
            if (wrap.offsetParent !== null) {
                const btn = wrap.nextElementSibling;
                if (btn && btn.classList.contains('js-toggle-text')) {
                    if (wrap.scrollHeight <= 95) {
                        wrap.classList.add('expanded');
                        btn.style.display = 'none';
                    } else {
                        btn.style.display = 'inline-block';
                    }
                }
            }
        });
    }

    initReviewsHeight();

    // Вешаем обработчик клика на весь документ
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('js-toggle-text')) {
            const wrap = e.target.previousElementSibling; // Находим блок с текстом
            wrap.classList.toggle('expanded'); // Разворачиваем/сворачиваем
            e.target.textContent = wrap.classList.contains('expanded') ? 'Скрыть' : 'Читать полностью';
        }
    });

    const btnToggleReviews = document.getElementById('btnToggleReviews');
    const hiddenReviewsBlock = document.getElementById('hiddenReviews');

    if (btnToggleReviews && hiddenReviewsBlock) {
        btnToggleReviews.onclick = function () {
            if (hiddenReviewsBlock.classList.contains('visible')) {
                hiddenReviewsBlock.classList.remove('visible');
                this.innerText = 'Показать все отзывы';
                const sectionTop = hiddenReviewsBlock.parentElement.offsetTop - 100;
                window.scrollTo({ top: sectionTop, behavior: 'smooth' });
            } else {
                hiddenReviewsBlock.classList.add('visible');
                this.innerText = 'Скрыть отзывы';
                setTimeout(initReviewsHeight, 50);
            }
        };
    }

    document.querySelectorAll('.js-open-review').forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const m = document.getElementById('reviewModal');
            if (m) {
                m.classList.add('active');
                document.body.style.overflow = 'hidden';

                const form = m.querySelector('form');
                if (form) form.reset();

                const star5 = m.querySelector('.star-rating input[value="5"]') || m.querySelector('.star-rating input');
                if (star5) {
                    star5.checked = true;
                }
            }
        };
    });

    const loadMoreBtn = document.getElementById('loadMoreCertBtn');
    const certItems = document.querySelectorAll('.cert-item');
    const LIMIT = 4;

    if (loadMoreBtn && certItems.length > LIMIT) {
        certItems.forEach((it, idx) => { if (idx >= LIMIT) it.style.display = 'none'; });

        loadMoreBtn.onclick = () => {
            const isHidden = Array.from(certItems).some((it, idx) => idx >= LIMIT && it.style.display === 'none');
            if (isHidden) {
                certItems.forEach(it => it.style.display = 'block');
                loadMoreBtn.innerText = 'Свернуть сертификаты';
            } else {
                certItems.forEach((it, idx) => { if (idx >= LIMIT) it.style.display = 'none'; });
                loadMoreBtn.innerText = 'Показать все сертификаты';
                document.querySelector('.cert-grid').scrollIntoView({ behavior: 'smooth' });
            }
        };
    }

    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isActive = item.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
            });

            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });


    // --- 8.5. СТРАНИЦА "ГАЛЕРЕЯ" (OBJECTS.HTML) ---
    if (document.getElementById('galleryContainer')) {

        function shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        const galleryContainer = document.getElementById('galleryContainer');
        const loadMoreGalBtn = document.getElementById('loadMoreBtn'); // переименовал константу локально, чтобы не конфликтовала с сертификатами
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const counterEl = document.getElementById('galleryCounter');

        const ITEMS_PER_PAGE = 15;
        let currentData = [];
        let itemsShown = 0;
        let currentFilter = 'all';

        window.updateCounter = function (total, visible) {
            if (counterEl) {
                counterEl.innerText = `Показано ${visible} из ${total} проектов`;
            }
        };

        window.renderGallery = (filter = 'all', isLoadMore = false) => {
            if (!isLoadMore) {
                currentFilter = filter;
                itemsShown = 0;
                galleryContainer.innerHTML = '';
                currentData = galleryItemsData.filter(item => filter === 'all' || item.cat === filter);
                if (filter === 'all') currentData = shuffleArray(currentData);
            }

            const start = itemsShown;
            const end = start + ITEMS_PER_PAGE;
            const itemsToRender = currentData.slice(start, end);

            let html = '';
            itemsToRender.forEach(item => {
                const safeTitle = item.title.replace(/"/g, '&quot;');
                html += `<div class="gallery-item show fade-in" onclick="window.openGalleryLightbox(this)" data-src="${item.src}" data-title="${safeTitle}" data-desc="${item.desc}">
                    <img src="${item.src}" loading="lazy" decoding="async" alt="${safeTitle}" onerror="window.handleImgError(this)">
                    <div class="gallery-overlay">
                        <div class="gal-title">${item.title}</div>
                        <div class="gal-desc">${item.desc}</div>
                    </div>
                </div>`;
            });

            if (isLoadMore) {
                galleryContainer.insertAdjacentHTML('beforeend', html);
            } else {
                galleryContainer.innerHTML = html;
            }

            itemsShown += itemsToRender.length;

            if (currentData.length > 0) {
                if (loadMoreContainer) loadMoreContainer.classList.add('visible');
                if (itemsShown < currentData.length) {
                    if (loadMoreGalBtn) loadMoreGalBtn.style.display = 'inline-block';
                    if (loadMoreGalBtn) loadMoreGalBtn.innerText = "Показать еще фото";
                    window.updateCounter(currentData.length, itemsShown);
                } else {
                    if (loadMoreGalBtn) loadMoreGalBtn.style.display = 'none';
                    window.updateCounter(currentData.length, itemsShown);
                }
            } else {
                if (loadMoreContainer) loadMoreContainer.classList.remove('visible');
            }
        };

        renderGallery();

        if (loadMoreGalBtn) {
            loadMoreGalBtn.addEventListener('click', () => {
                renderGallery(currentFilter, true);
            });
        }

        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.dataset.filter;
                renderGallery(filterValue, false);

                if (filterValue === 'all') {
                    window.history.replaceState(null, null, window.location.pathname + window.location.search);
                } else {
                    window.history.replaceState(null, null, '#' + filterValue);
                }

                const pageHeader = document.querySelector('.page-header');
                if (pageHeader) {
                    const scrollTarget = pageHeader.offsetTop + pageHeader.offsetHeight - 68;
                    if (window.scrollY > scrollTarget) window.scrollTo({ top: scrollTarget, behavior: "smooth" });
                }
            });
        });

        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${hash}"]`);
            if (filterBtn) setTimeout(() => filterBtn.click(), 100);
        }

        window.openGalleryLightbox = function (el) {
            const src = el.dataset.src;
            const title = el.dataset.title;
            const desc = el.dataset.desc;
            if (typeof window.openLightbox === 'function') {
                window.openLightbox(src, title + ' — ' + desc);
            }
        }
    }


    // --- 8.6. СТРАНИЦА "НОВОСТИ" (ГЕНЕРАЦИЯ, ФИЛЬТРЫ И DEEP LINKS) ---

    // 1. Умная сортировка: самые свежие новости сверху
    const sortedNewsData = [...newsData].sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('.');
        const [dayB, monthB, yearB] = b.date.split('.');
        return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
    });

    function renderNews() {
        const gridPage = document.getElementById('newsGridPage');
        const gridHome = document.getElementById('newsGridHome');

        if (!gridPage && !gridHome) return;

        // Добавляем data-id для прямых ссылок
        const buildCard = (item) => `
        <article class="news-card" data-cat="${item.category}" data-id="${item.id}">
            <div class="news-img-wrap" onclick="window.openCert(this)" style="cursor: zoom-in;">
                <span class="news-badge badge-${item.category}" ${item.badgeStyle ? `style="${item.badgeStyle}"` : ''}>${item.badgeText}</span>
                <img src="${item.img}" class="news-img" loading="lazy" decoding="async" alt="${item.title}" onerror="window.handleImgError(this)">            </div>
            <div class="news-content">
                <span class="news-date">${item.date}</span>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-excerpt">${item.excerpt}</p>
                <div class="hidden-full-text" style="display:none;">${item.body}</div>
                <button class="news-link js-read-news">Читать далее <span>→</span></button>
            </div>
        </article>
        `;

        if (gridPage) {
            gridPage.innerHTML = sortedNewsData.map(buildCard).join('');
        }

        if (gridHome) {
            gridHome.innerHTML = sortedNewsData.slice(0, 3).map(buildCard).join('');
        }
    }

    renderNews(); // Запуск сборки карточек
    if (typeof window.initScrollAnimations === 'function') {
        window.initScrollAnimations();
    }

    /* ==========================================================================
       2. ОТКРЫТИЕ НОВОСТЕЙ И КНОПКА "ПОДЕЛИТЬСЯ"
       ========================================================================== */
    document.body.addEventListener('click', function (e) {
        // Клик по кнопке "Читать далее"
        const btn = e.target.closest('.js-read-news');
        if (btn) {
            e.preventDefault();
            const card = btn.closest('.news-card');
            const modal = document.getElementById('newsModal');
            if (modal && card) {
                const newsId = card.dataset.id;
                document.getElementById('newsModalImg').src = card.querySelector('.news-img').src;
                document.getElementById('newsModalDate').innerText = card.querySelector('.news-date').innerText;
                document.getElementById('newsModalTitle').innerText = card.querySelector('.news-title').innerText;
                document.getElementById('newsModalBody').innerHTML = card.querySelector('.hidden-full-text').innerHTML;

                // Создаем кнопку "Поделиться" динамически, если ее еще нет
                let shareBtn = document.getElementById('newsShareBtn');
                if (!shareBtn) {
                    const modalBody = document.getElementById('newsModalBody');
                    modalBody.insertAdjacentHTML('afterend', `
                        <button id="newsShareBtn" class="btn btn--outline-primary" style="margin-top: 25px; display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; font-size: 14px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            Поделиться новостью
                        </button>
                    `);
                    shareBtn = document.getElementById('newsShareBtn');
                }

                // Настраиваем ссылку и меняем URL в адресной строке
                if (newsId && shareBtn) {
                    const shareUrl = window.location.origin + window.location.pathname + '?article=' + newsId;
                    shareBtn.dataset.link = shareUrl;
                    window.history.replaceState(null, null, '?article=' + newsId);
                }

                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        // Клик по новой кнопке "Поделиться новостью"
        const shareBtnClick = e.target.closest('#newsShareBtn');
        if (shareBtnClick) {
            e.preventDefault();
            navigator.clipboard.writeText(shareBtnClick.dataset.link).then(() => {
                window.showToast('Ссылка на новость скопирована!', 'success');
            }).catch(() => {
                window.showToast('Ошибка копирования', 'error');
            });
        }
    });

    // Очистка URL при закрытии модалок
    const originalClose = window.closeAllPopups;
    window.closeAllPopups = function () {
        if (originalClose) originalClose();
        if (window.location.search.includes('article=')) {
            window.history.replaceState(null, null, window.location.pathname);
        }
    };

    /* ==========================================================================
           3. ЧТЕНИЕ DEEP LINK ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
           ========================================================================== */
    const urlParamsNews = new URLSearchParams(window.location.search);
    const articleId = urlParamsNews.get('article');
    if (articleId) {
        setTimeout(() => {
            const card = document.querySelector(`.news-card[data-id="${articleId}"]`);
            if (card) {
                const readBtn = card.querySelector('.js-read-news');
                if (readBtn) readBtn.click();

                // Динамическое СЕО: меняем заголовок вкладки браузера
                const articleTitle = card.querySelector('.news-title').innerText;
                document.title = articleTitle + ' | ПЛИТТЕКС';
            }
        }, 300); // Небольшая задержка, чтобы карточки успели отрисоваться
    }

    /* ==========================================================================
       4. ЛОГИКА ФИЛЬТРОВ И АРХИВА НОВОСТЕЙ
       ========================================================================== */
    const newsGrid = document.querySelector('.news-grid');
    if (newsGrid && !document.getElementById('catalog-root') && !document.getElementById('galleryContainer')) {
        const allNews = Array.from(document.querySelectorAll('.news-card'));
        const filterBtns = document.querySelectorAll('.filter-btn');
        const loadMoreBtn = document.createElement('button');
        const ITEMS_PER_PAGE = 6;
        let isExpanded = false;
        let activeFilter = 'all';

        if (allNews.length > ITEMS_PER_PAGE) {
            loadMoreBtn.className = 'btn-load-dark';
            loadMoreBtn.innerText = 'Показать архив новостей';
            loadMoreBtn.style.marginTop = '40px';

            const btnContainer = document.createElement('div');
            btnContainer.style.textAlign = 'center';
            btnContainer.id = 'loadMoreContainer';
            btnContainer.appendChild(loadMoreBtn);
            newsGrid.parentNode.insertBefore(btnContainer, newsGrid.nextSibling);

            allNews.forEach((card, index) => {
                if (index >= ITEMS_PER_PAGE) card.classList.add('hidden');
            });

            loadMoreBtn.addEventListener('click', () => {
                if (!isExpanded) {
                    allNews.forEach(card => {
                        if (card.dataset.cat === activeFilter || activeFilter === 'all') {
                            card.classList.remove('hidden');
                            card.classList.add('fade-in');
                        }
                    });
                    loadMoreBtn.innerText = "Свернуть архив";
                    isExpanded = true;
                } else {
                    allNews.forEach((card, index) => {
                        if (index >= ITEMS_PER_PAGE) {
                            card.classList.add('hidden');
                            card.classList.remove('fade-in');
                        }
                    });
                    loadMoreBtn.innerText = "Показать архив новостей";
                    isExpanded = false;
                    const offset = 180;
                    const y = newsGrid.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            });
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                const btnContainer = document.getElementById('loadMoreContainer');

                if (activeFilter !== 'all') {
                    if (btnContainer) btnContainer.style.display = 'none';
                    allNews.forEach(card => {
                        if (card.dataset.filter === activeFilter || card.dataset.cat === activeFilter) {
                            card.classList.remove('hidden');
                            card.classList.add('fade-in');
                        } else {
                            card.classList.add('hidden');
                        }
                    });
                } else {
                    if (btnContainer) btnContainer.style.display = 'block';
                    allNews.forEach((card, index) => {
                        if (!isExpanded && index >= ITEMS_PER_PAGE) {
                            card.classList.add('hidden');
                        } else {
                            card.classList.remove('hidden');
                            card.classList.add('fade-in');
                        }
                    });
                }
            });
        });
    }

    /* ==========================================================================
      СИНХРОНИЗАЦИЯ КОРЗИНЫ МЕЖДУ ВКЛАДКАМИ (ИСПРАВЛЕНО)
      ========================================================================== */
    window.addEventListener('storage', (event) => {
        // 1. Проверяем правильный ключ 'plittex_cart'
        if (event.key === 'plittex_cart' && event.newValue) {
            try {
                // 2. Обновляем глобальную переменную cart
                cart = JSON.parse(event.newValue);

                // 3. Запускаем твою реальную функцию отрисовки
                if (typeof renderCart === 'function') {
                    renderCart();
                }

                console.log('Синхронизация корзины: данные обновлены из другой вкладки');
            } catch (e) {
                console.error('Ошибка при синхронизации вкладок:', e);
            }
        }
    });

}); // Закрытие глобального DOMContentLoaded