const cartContainer = document.querySelector('.cart-items')
const emptyCart = document.querySelector('.empty')
const cartList = document.querySelector('.cart-list')

function loadItems(data) {
    const itemsContainer = document.querySelector('.items');

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('item');
        
        itemDiv.innerHTML = `
            <div class="image-container"  data-thumbnail="${item.image.thumbnail}">
            <picture>
                <source srcset="${item.image.desktop}" media="(min-width: 1024px)">
                <source srcset="${item.image.tablet}" media="(min-width: 768px)">
                <img src="${item.image.mobile}" alt="${item.name}">
            </picture>
                <div class="add-btn flex">
                    <div class="default-state flex">
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20">
                        <g fill="#C73B0F" clip-path="url(#a)">
                            <path d="M6.583 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.334 18.75a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM3.446 1.752a.625.625 0 0 0-.613-.502h-2.5V2.5h1.988l2.4 11.998a.625.625 0 0 0 .612.502h11.25v-1.25H5.847l-.5-2.5h11.238a.625.625 0 0 0 .61-.49l1.417-6.385h-1.28L16.083 10H5.096l-1.65-8.248Z"/>
                            <path d="M11.584 3.75v-2.5h-1.25v2.5h-2.5V5h2.5v2.5h1.25V5h2.5V3.75h-2.5Z"/>
                        </g>
                        </svg>
                        <p>Add to Cart</p>
                    </div>
                    <div class="active-state flex">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
                        <span>1</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
                    </div>
                </div>
            </div>
            <div class="item-info">
                <p class="small">${item.category}</p>
                <p>${item.name}</p>
                <p>$${item.price.toFixed(2)}</p>
            </div>
        `;


        itemsContainer.appendChild(itemDiv);

        const imageCon = itemDiv.querySelector('.image-container');
        imageCon.dataset.itemName = item.name;
        imageCon.dataset.itemPrice = item.price.toFixed(2);
        const activeState = imageCon.querySelector('.active-state');
        const defaultState = imageCon.querySelector('.default-state');
        const minusIcon = activeState.querySelector('svg:first-child');
        const plusIcon = activeState.querySelector('svg:last-child');
        const itemQuantity = activeState.querySelector('span');
        
        let quantity = 1
    
        defaultState.addEventListener('click', () => {
            imageCon.classList.add('active');
            quantity = 1;
            itemQuantity.textContent = quantity;
            addToCart(item.name, item.price, quantity);
        });
        
        minusIcon.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                itemQuantity.textContent = quantity;
                updateCartItemQuantity(item.name, quantity);
            }
        });

        plusIcon.addEventListener('click', () => {
            quantity++;
            itemQuantity.textContent = quantity;
            updateCartItemQuantity(item.name, quantity);
        });
    });
}

function updateCartItemQuantity(itemName, newQuantity) {
    const cartItem = cartContainer.querySelector(`[data-item-name="${itemName}"]`);
    if (cartItem) {
        const quantityElement = cartItem.querySelector('.quantity');
        const priceElement = cartItem.querySelector('.price');
        const amountElement = cartItem.querySelector('.amount');
        
        const price = parseFloat(priceElement.textContent);
        
        quantityElement.textContent = `${newQuantity}x`;
        amountElement.textContent = (price * newQuantity).toFixed(2);
        
        updateCartTotal();
        updateCartItemCount();
    }
}


// fetch external JSON data
fetch('data.json')
    .then(response => response.json())
    .then(data => loadItems(data))
    .catch(error => console.error('Error loading JSON:', error));


function addToCart(itemName, itemPrice, number) {
    const existingItem = Array.from(cartContainer.children).find(item => 
        item.querySelector('.bold').textContent === itemName
    );

    if (existingItem) {
        const quantityElement = existingItem.querySelector('.quantity');
        const amountElement = existingItem.querySelector('.amount');
        const currentQuantity = parseInt(quantityElement.textContent);
        const newQuantity = currentQuantity + number;
        
        quantityElement.textContent = `${newQuantity}x`;
        amountElement.textContent = (itemPrice * newQuantity).toFixed(2);
    } else {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item', 'flex');
        cartItem.dataset.itemName = itemName;
        
        cartItem.innerHTML = `
            <div class="name small flex">
                <p class="bold">${itemName}</p>
                <div class="details flex">
                    <p class="quantity">${number}x</p>
                    <p>@$<span class="price">${itemPrice.toFixed(2)}</span></p>
                    <p>$<span class="amount">${(itemPrice * number).toFixed(2)}</span></p>
                </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="10" height="10" fill="none" viewBox="0 0 10 10">
                <path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
            </svg>
        `;

        cartContainer.appendChild(cartItem);

        // delete icon
        cartItem.querySelector('.icon').addEventListener('click', () => {
            cartItem.remove(); 
            if (cartContainer.children.length === 0) {
                cartList.classList.add('hide');
                emptyCart.classList.remove('hide');
            }
            resetButtonState(cartItem);
            updateCartTotal();
            updateCartItemCount();
        });
    }

    // show cart and hide empty message div
    cartList.classList.remove('hide');
    emptyCart.classList.add('hide');

    updateCartTotal();
    updateCartItemCount();
}

// reset button state
function resetButtonState(cartItem) {
    const itemName = cartItem.querySelector('.bold').textContent;
    const imageContainer = document.querySelector(`.image-container[data-item-name="${itemName}"]`);
    
    if (imageContainer) {
        imageContainer.classList.remove('active');
    }
}

function updateCartTotal() {
    const totalElement = document.querySelector('.total p span');
    const cartItems = cartContainer.querySelectorAll('.cart-item');
    
    let total = 0;
    cartItems.forEach(item => {
        const amount = parseFloat(item.querySelector('.amount').textContent);
        total += amount;
    });
    
    totalElement.textContent = total.toFixed(2);
}

function updateCartItemCount() {
    const cartCountElement = document.querySelector('.cart h1 span');
    const cartItems = cartContainer.querySelectorAll('.cart-item');
    
    let totalCount = 0;
    cartItems.forEach(item => {
        const quantity = parseInt(item.querySelector('.quantity').textContent);
        totalCount += quantity;
    });
    
    cartCountElement.textContent = `${totalCount}`;
}

// modal elements
const modalOverlay = document.getElementById('modal-overlay');
const modalCartItems = document.querySelector('.modal-cart-items');
const modalTotalAmount = document.querySelector('.modal-total-amount');
const startNewOrderBtn = document.getElementById('start-new-order');
const confirmOrderBtn = document.getElementById('confirm-order');

// show modal function
function showModal() {
    modalCartItems.innerHTML = '';      // clears previous items
    
    // copy cart items and append to modal
    const cartItems = document.querySelectorAll('.cart-item');
    cartItems.forEach(item => {
        const modalItem = document.createElement('div');
        modalItem.classList.add('modal-cart-item');
        
        const itemName = item.querySelector('.bold').textContent;
        const itemQuantity = item.querySelector('.quantity').textContent;
        const itemPrice = item.querySelector('.price').textContent;
        const itemAmount = item.querySelector('.amount').textContent;
        
        // finds the corresponding image container to get the thumbnail
        const imageContainer = document.querySelector(`.image-container[data-item-name="${itemName}"]`);
        const thumbnailSrc = imageContainer ? imageContainer.dataset.thumbnail : './assets/images/image-baklava-thumbnail.jpg';
        
        modalItem.innerHTML = `
            <img src="${thumbnailSrc}" alt="${itemName}">
            <div class="name">
                <p class="bold">${itemName}</p>
                <div class="details flex">
                    <p class="quantity">${itemQuantity}</p>
                    <p>@ $<span class="price">${itemPrice}</span></p>
                </div>
            </div>
            <p>$<span class="amount">${itemAmount}</span></p>
        `;
        
        modalCartItems.appendChild(modalItem);
    });
    
    // Update total amount
    const totalAmount = document.querySelector('.total p span').textContent;
    modalTotalAmount.textContent = totalAmount;
    
    // Show modal
    modalOverlay.classList.remove('hidden');
}

// hide modal function
function hideModal() {
    modalOverlay.classList.add('hidden');
}

// start new order function
function startNewOrder() {

    cartContainer.innerHTML = '';

    updateCartTotal();
    updateCartItemCount();

    cartList.classList.add('hide');
    emptyCart.classList.remove('hide');

    const activeItems = document.querySelectorAll('.image-container.active');
    activeItems.forEach(item => {
        item.classList.remove('active');
    });

    hideModal();
}

confirmOrderBtn.addEventListener('click', showModal);
startNewOrderBtn.addEventListener('click', startNewOrder);

// close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        hideModal();
    }
});