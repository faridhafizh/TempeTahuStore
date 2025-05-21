document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------------------
    // 0. VARIABEL GLOBAL & FUNGSI UTILITAS
    // -----------------------------------------------------------------------------
    let cart = []; // Variabel utama untuk keranjang belanja

    // Fungsi untuk menampilkan notifikasi sederhana
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`; // Tambahkan kelas 'error' jika type='error'
        notification.textContent = message;
        document.body.appendChild(notification);

        // Styling dasar (lebih baik definisikan di CSS)
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 20px';
        notification.style.backgroundColor = type === 'success' ? 'var(--success-color, green)' : 'var(--error-color, red)';
        notification.style.color = 'white';
        notification.style.borderRadius = 'var(--border-radius, 5px)';
        notification.style.boxShadow = 'var(--box-shadow, 0 2px 10px rgba(0,0,0,0.1))';
        notification.style.zIndex = '2000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-in-out';

        setTimeout(() => { notification.style.opacity = '1'; }, 10); // Fade in
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => { notification.remove(); }, 500); // Hapus setelah fade out
        }, 3000);
    }

    // -----------------------------------------------------------------------------
    // 1. FUNGSI UMUM UI (Tidak terkait langsung dengan fungsionalitas utama)
    // -----------------------------------------------------------------------------

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('header nav');
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            menuToggle.classList.toggle('is-active'); // Untuk animasi hamburger icon jika ada
        });
    }

    // Update Copyright Year
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------
    // 2. SISTEM KERANJANG (CART)
    // -----------------------------------------------------------------------------
    const cartCountElement = document.querySelector('.cart-count'); // Di header
    const cartItemsContainer = document.getElementById('cart-items-container'); // Di cart.html
    const cartSubtotalPriceElement = document.getElementById('cart-subtotal-price'); // Di cart.html
    const cartTotalPriceElement = document.getElementById('cart-total-price'); // Di cart.html
    const emptyCartMessageElement = document.getElementById('empty-cart-message'); // Di cart.html
    const cartSummaryElement = document.getElementById('cart-summary'); // Di cart.html
    const checkoutButton = document.getElementById('checkout-button'); // Di cart.html

    // Muat keranjang dari localStorage
    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem('tempeTahuKitaCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
    }

    // Simpan keranjang ke localStorage
    function saveCartToLocalStorage() {
        localStorage.setItem('tempeTahuKitaCart', JSON.stringify(cart));
    }

    // Update jumlah item di ikon keranjang header
    function updateCartCountHeader() {
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems;
        }
    }

    // Tambah item ke keranjang
    function addToCart(productId, productName, productPrice, productImage) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id: productId, name: productName, price: parseFloat(productPrice), image: productImage, quantity: 1 });
        }
        saveCartToLocalStorage();
        updateCartDisplay(); // Ini akan memanggil updateCartCountHeader dan renderCartItems jika di halaman keranjang
        showNotification(`${productName} ditambahkan ke keranjang!`);
        console.log('Cart updated:', cart);
    }

    // Hapus item dari keranjang
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCartToLocalStorage();
        updateCartDisplay();
        showNotification('Item dihapus dari keranjang.', 'error');
    }

    // Update kuantitas item di keranjang
    function updateQuantity(productId, newQuantity) {
        const item = cart.find(i => i.id === productId);
        if (item) {
            newQuantity = parseInt(newQuantity);
            if (newQuantity <= 0) {
                removeFromCart(productId); // Hapus jika kuantitas 0 atau kurang
            } else {
                item.quantity = newQuantity;
                saveCartToLocalStorage();
                updateCartDisplay();
            }
        }
    }

    // Render item keranjang di halaman cart.html
    function renderCartPageItems() {
        // Hanya berjalan jika elemen-elemen halaman keranjang ada
        if (!cartItemsContainer || !cartSubtotalPriceElement || !cartTotalPriceElement || !emptyCartMessageElement || !cartSummaryElement || !checkoutButton) {
            return;
        }

        cartItemsContainer.innerHTML = ''; // Kosongkan kontainer item
        let subtotal = 0;

        if (cart.length === 0) {
            emptyCartMessageElement.style.display = 'block';
            cartSummaryElement.style.display = 'none';
            checkoutButton.classList.add('disabled');
            checkoutButton.disabled = true;
        } else {
            emptyCartMessageElement.style.display = 'none';
            cartSummaryElement.style.display = 'block';
            checkoutButton.classList.remove('disabled');
            checkoutButton.disabled = false;

            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>Harga: Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}" style="width: 50px; text-align: center;">
                        <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <p class="cart-item-subtotal">Subtotal: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    <button class="remove-item-btn" data-id="${item.id}" aria-label="Hapus item">×</button>
                `;
                cartItemsContainer.appendChild(itemElement);
                subtotal += item.price * item.quantity;
            });
        }

        cartSubtotalPriceElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        cartTotalPriceElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`; // Asumsi belum ada ongkir/diskon

        addCartPageItemEventListeners(); // Tambahkan event listener ke tombol +/-/hapus yang baru dirender
    }

    // Tambahkan event listener untuk kontrol item di halaman keranjang
    function addCartPageItemEventListeners() {
        // Pastikan hanya berjalan jika cartItemsContainer ada (berarti di halaman keranjang)
        if (!cartItemsContainer) return;

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            // Hindari duplikasi event listener
            button.replaceWith(button.cloneNode(true)); // Cara sederhana untuk menghapus listener lama
            cartItemsContainer.querySelector(`[data-id='${button.dataset.id}'].remove-item-btn`).addEventListener('click', (e) => removeFromCart(e.target.dataset.id));
        });
        cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
            button.replaceWith(button.cloneNode(true));
            cartItemsContainer.querySelector(`[data-id='${button.dataset.id}'].increase-quantity`).addEventListener('click', (e) => {
                const item = cart.find(i => i.id === e.target.dataset.id);
                if (item) updateQuantity(item.id, item.quantity + 1);
            });
        });
        cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
            button.replaceWith(button.cloneNode(true));
            cartItemsContainer.querySelector(`[data-id='${button.dataset.id}'].decrease-quantity`).addEventListener('click', (e) => {
                const item = cart.find(i => i.id === e.target.dataset.id);
                if (item) updateQuantity(item.id, item.quantity - 1);
            });
        });
        cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.replaceWith(input.cloneNode(true));
            cartItemsContainer.querySelector(`[data-id='${input.dataset.id}'].quantity-input`).addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity >= 0) { // Biarkan 0 untuk dihapus oleh updateQuantity
                    updateQuantity(e.target.dataset.id, newQuantity);
                } else {
                    // Reset jika invalid, atau biarkan updateQuantity yang handle
                    const item = cart.find(i => i.id === e.target.dataset.id);
                    if(item) e.target.value = item.quantity;
                }
            });
        });
    }

    // Fungsi gabungan untuk update semua tampilan keranjang
    function updateCartDisplay() {
        updateCartCountHeader();
        // Hanya render item keranjang jika kita berada di halaman keranjang
        if (window.location.pathname.includes('cart.html') || cartItemsContainer) {
            renderCartPageItems();
        }
        // Jika di halaman checkout, update juga summary checkout
        if (window.location.pathname.includes('checkout.html') || document.getElementById('checkout-order-items')) {
            renderCheckoutSummary();
        }
    }

    // Event listener untuk tombol "Add to Cart" (menggunakan event delegation)
    document.addEventListener('click', function(event) {
        if (event.target.matches('.add-to-cart-btn')) {
            const button = event.target;
            addToCart(
                button.dataset.id,
                button.dataset.name,
                button.dataset.price,
                button.dataset.image
            );
        }
    });

    // -----------------------------------------------------------------------------
    // 3. LOGIKA SPESIFIK HALAMAN PRODUK (FILTER & PENCARIAN)
    // -----------------------------------------------------------------------------
    const productListContainer = document.getElementById('product-list-container');
    const filterCategory = document.getElementById('filter-category');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button'); // Jika ada tombol search eksplisit
    const noProductMessage = document.getElementById('no-product-message');
    let allProductsCache = []; // Cache untuk menyimpan semua elemen produk awal

    function initProductFiltering() {
        if (productListContainer) {
            // Simpan semua elemen produk awal ke cache
            allProductsCache = Array.from(productListContainer.querySelectorAll('.product-card'));

            if (filterCategory) {
                filterCategory.addEventListener('change', filterAndSearchProducts);
            }
            if (searchInput) {
                searchInput.addEventListener('keyup', (event) => {
                    // Filter secara real-time atau saat enter/panjang tertentu
                    if (event.key === "Enter" || searchInput.value.length === 0 || searchInput.value.length > 2) {
                        filterAndSearchProducts();
                    }
                });
            }
            if (searchButton) { // Jika menggunakan tombol search
                searchButton.addEventListener('click', filterAndSearchProducts);
            }
            filterAndSearchProducts(); // Panggil sekali saat load untuk inisialisasi tampilan
        }
    }

    function filterAndSearchProducts() {
        if (!productListContainer || allProductsCache.length === 0) return;

        const selectedCategory = filterCategory ? filterCategory.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let visibleProductsCount = 0;

        allProductsCache.forEach(card => {
            const productCategory = card.dataset.category || 'all'; // Ambil kategori dari data-attribute
            const productName = (card.querySelector('h3')?.textContent || '').toLowerCase(); // Ambil nama produk

            const categoryMatch = (selectedCategory === 'all' || productCategory === selectedCategory);
            const searchMatch = (searchTerm === '' || productName.includes(searchTerm));

            if (categoryMatch && searchMatch) {
                card.style.display = ''; // Atau 'block', 'flex', sesuai layout asli
                visibleProductsCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (noProductMessage) {
            noProductMessage.style.display = visibleProductsCount === 0 ? 'block' : 'none';
        }
    }

    // -----------------------------------------------------------------------------
    // 4. LOGIKA SPESIFIK HALAMAN CHECKOUT
    // -----------------------------------------------------------------------------
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutOrderItemsContainer = document.getElementById('checkout-order-items');
    const checkoutSubtotalElement = document.getElementById('checkout-subtotal');
    const checkoutTotalElement = document.getElementById('checkout-total');
    const checkoutLayoutElement = document.getElementById('checkout-layout'); // Kontainer utama form & summary
    const checkoutSuccessMessageElement = document.getElementById('checkout-success-message');
    const orderNumberSuccessElement = document.getElementById('order-number-success');

    function renderCheckoutSummary() {
        if (!checkoutOrderItemsContainer || !checkoutSubtotalElement || !checkoutTotalElement) return;

        checkoutOrderItemsContainer.innerHTML = '';
        let subtotal = 0;

        if (cart.length === 0) {
            checkoutOrderItemsContainer.innerHTML = '<p>Keranjang Anda kosong. Silakan tambahkan produk terlebih dahulu.</p>';
            // Disable form atau redirect mungkin?
            if (checkoutForm) {
                const formInputs = checkoutForm.querySelectorAll('input, textarea, button');
                formInputs.forEach(input => input.disabled = true);
            }
        } else {
            if (checkoutForm) {
                 const formInputs = checkoutForm.querySelectorAll('input, textarea, button');
                formInputs.forEach(input => input.disabled = false);
            }
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('checkout-item'); // Style this class in CSS
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; margin-right:10px;">
                    <div class="item-info" style="flex-grow:1;">
                        ${item.name}
                        <span style="display:block; font-size:0.9em; color:grey;">Qty: ${item.quantity}</span>
                    </div>
                    <div class="item-price" style="font-weight:bold;">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
                `;
                checkoutOrderItemsContainer.appendChild(itemElement);
                subtotal += item.price * item.quantity;
            });
        }

        checkoutSubtotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        checkoutTotalElement.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`; // Asumsi belum ada ongkir/biaya lain
    }

    if (checkoutForm) {
        // renderCheckoutSummary(); // Dipanggil oleh updateCartDisplay saat load cart

        checkoutForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Selalu cegah default submission dulu
            event.stopPropagation();

            if (!this.checkValidity()) {
                showNotification('Mohon periksa kembali data Anda, ada field yang belum terisi dengan benar.', 'error');
            } else {
                // Form valid, proses pesanan
                const orderNumber = `TTK-${Date.now().toString().slice(-6)}`;
                if (orderNumberSuccessElement) orderNumberSuccessElement.textContent = orderNumber;

                // Kosongkan keranjang
                cart = [];
                saveCartToLocalStorage();
                updateCartDisplay(); // Update header & halaman lain jika dinavigasi

                // Tampilkan pesan sukses, sembunyikan form/summary
                if (checkoutLayoutElement) checkoutLayoutElement.style.display = 'none';
                if (checkoutSuccessMessageElement) checkoutSuccessMessageElement.style.display = 'block';

                showNotification('Pesanan berhasil dibuat! Terima kasih.', 'success');
                window.scrollTo(0, 0); // Scroll ke atas untuk melihat pesan sukses
            }
            this.classList.add('was-validated'); // Untuk styling Bootstrap validation
        });
    }

    // -----------------------------------------------------------------------------
    // 5. LOGIKA SPESIFIK HALAMAN KONTAK
    // -----------------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const contactFormSuccessMessage = document.getElementById('contact-form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();

            if (!this.checkValidity()) {
                showNotification('Mohon lengkapi semua field yang wajib diisi.', 'error');
            } else {
                // Simulasi pengiriman form
                console.log('Pesan kontak dikirim:', {
                    name: this.contactName.value,
                    email: this.contactEmail.value,
                    subject: this.contactSubject.value,
                    message: this.contactMessage.value
                });

                this.reset(); // Kosongkan form
                this.classList.remove('was-validated'); // Hapus status validasi
                if (contactFormSuccessMessage) contactFormSuccessMessage.style.display = 'block';

                // Sembunyikan pesan sukses setelah beberapa detik
                setTimeout(() => {
                    if (contactFormSuccessMessage) contactFormSuccessMessage.style.display = 'none';
                }, 5000);

                showNotification('Pesan Anda telah berhasil dikirim!', 'success');
            }
            this.classList.add('was-validated');
        });
    }

    // -----------------------------------------------------------------------------
    // 6. VALIDASI FORM UMUM (jika ada form lain yang butuh ini)
    // -----------------------------------------------------------------------------
    const formsToValidate = document.querySelectorAll('.needs-validation');
    formsToValidate.forEach(form => {
        // Hindari menambahkan listener ke form yang sudah ditangani (checkout, contact)
        if (form.id !== 'checkout-form' && form.id !== 'contact-form') {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                    showNotification('Mohon isi semua field yang wajib diisi dengan benar.', 'error');
                }
                form.classList.add('was-validated');
            }, false);
        }
    });

    // -----------------------------------------------------------------------------
    // 7. INISIALISASI AKHIR
    // -----------------------------------------------------------------------------
    loadCartFromLocalStorage(); // Muat keranjang dari localStorage saat halaman dimuat
    updateCartDisplay();        // Update tampilan keranjang (header & halaman keranjang/checkout jika aktif)
    initProductFiltering();     // Inisialisasi filter produk jika di halaman produk

    console.log('Script.js loaded and initialized.');
});