document.addEventListener('DOMContentLoaded', () => {
    // Helper function to get initial data or load from localStorage
    function getInitialOrderList() {
        const storedList = localStorage.getItem('tasteOrderList');
        if (storedList) {
            try {
                return JSON.parse(storedList);
            } catch (e) {
                console.error("Error parsing stored data, using initial data.", e);
                // Fallback to initial data if parsing fails
                return initializeDefaultOrderList();
            }
        }
        return initializeDefaultOrderList();
    }

    function initializeDefaultOrderList() {
        const initialFruits = [
            { id: Date.now() + 1, name: 'Pineapple', quantity: '5pcs', category: 'Fruits' },
            { id: Date.now() + 2, name: 'Watermelon', quantity: '5kg', category: 'Fruits' },
            { id: Date.now() + 3, name: 'Avocado', quantity: '1kg', category: 'Fruits' },
            { id: Date.now() + 4, name: 'Mango ripe', quantity: '1kg', category: 'Fruits' },
            { id: Date.now() + 5, name: 'Mango green', quantity: '1kg', category: 'Fruits' },
            { id: Date.now() + 6, name: 'Lime', quantity: '3kg', category: 'Fruits' },
            { id: Date.now() + 7, name: 'Lemon', quantity: '2kg', category: 'Fruits' },
            { id: Date.now() + 8, name: 'Carrot', quantity: '3kg', category: 'Fruits' },
            { id: Date.now() + 9, name: 'Ginger', quantity: '1kg', category: 'Fruits' },
            { id: Date.now() + 10, name: 'Orange sunkis', quantity: '15kg', category: 'Fruits' },
            { id: Date.now() + 11, name: 'Dragon fruit', quantity: '1kg', category: 'Fruits' }
        ];

        const initialBaverages = [
            { id: Date.now() + 12, name: 'Fresh milk (Anchor)', quantity: '12box', category: 'Baverages' },
            { id: Date.now() + 13, name: 'Coke zero', quantity: '24 can', category: 'Baverages' },
            { id: Date.now() + 14, name: 'Tonic water', quantity: '24 can', category: 'Baverages' },
            { id: Date.now() + 15, name: 'Stonefish river Shiraz', quantity: '3btl', category: 'Baverages' },
            { id: Date.now() + 16, name: 'Acqua Panna (500ml)', quantity: '24bl', category: 'Baverages' },
            { id: Date.now() + 17, name: 'Gris Blanc', quantity: '2btl', category: 'Baverages' },
            { id: Date.now() + 18, name: 'Montes Cabernet Sauvignon', quantity: '2bt', category: 'Baverages' },
            { id: Date.now() + 19, name: 'Louis jadot Pinot noir (couvent Des Jacobins)', quantity: '1bt', category: 'Baverages' },
            { id: Date.now() + 20, name: 'Katnook Founder’s block', quantity: '2btl', category: 'Baverages' },
            { id: Date.now() + 21, name: 'Chateau haut boutisse', quantity: '2bt', category: 'Baverages' },
            { id: Date.now() + 22, name: 'Chavy chouet Bourgog Blanc', quantity: '2 btl', category: 'Baverages' }
        ];

        const combinedList = [...initialFruits, ...initialBaverages].sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem('tasteOrderList', JSON.stringify(combinedList)); // Save initial data
        return combinedList;
    }

    // --- Global Variables ---
    let orderList = getInitialOrderList();
    let editingItemId = null;

    // --- DOM Elements ---
    const itemNameInput = document.getElementById('itemName');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const itemCategorySelect = document.getElementById('itemCategory');
    const addItemBtn = document.getElementById('addItemBtn');
    const updateItemBtn = document.getElementById('updateItemBtn');
    const searchItemInput = document.getElementById('searchItem');
    const searchBtn = document.getElementById('searchBtn');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const fruitsTableBody = document.querySelector('#fruitsTable tbody');
    const baveragesTableBody = document.querySelector('#baveragesTable tbody');
    const printBtn = document.getElementById('printBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');

    // Date elements
    const displayDateElement = document.getElementById('displayDate');
    const orderDateInput = document.getElementById('orderDateInput'); // New date input

    // Determine current page
    const currentPage = window.location.pathname.split('/').pop();

    // --- Date Handling Functions ---
    function formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function initializeOrderDate() {
        // Try to load last selected date from localStorage
        const storedDate = localStorage.getItem('selectedOrderDate');
        let dateToUse;

        if (storedDate) {
            // Add 'T00:00:00' to ensure date parsing is consistent across browsers and timezones
            // This treats the stored YYYY-MM-DD string as a UTC date to avoid local timezone offsets
            dateToUse = new Date(storedDate + 'T00:00:00'); 
        } else {
            // Default to tomorrow's date if no date is stored
            dateToUse = new Date();
            dateToUse.setDate(dateToUse.getDate() + 1); // Set to tomorrow
        }

        // Set the input value if it exists on the page
        if (orderDateInput) {
            orderDateInput.value = dateToUse.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        // Update the display element
        if (displayDateElement) {
            displayDateElement.textContent = formatDate(dateToUse);
        }
        // Save the date to localStorage, ensuring it's always the current selected date
        localStorage.setItem('selectedOrderDate', dateToUse.toISOString().split('T')[0]);
    }

    function handleDateChange() {
        if (orderDateInput) {
            // Use the input's value directly, adding 'T00:00:00' for consistent parsing
            const selectedDate = new Date(orderDateInput.value + 'T00:00:00'); 
            if (displayDateElement) {
                displayDateElement.textContent = formatDate(selectedDate);
            }
            localStorage.setItem('selectedOrderDate', orderDateInput.value);
        }
    }

    // --- Core Rendering Function ---
    function renderOrderList(filter = '') {
        // Clear all relevant table bodies
        if (fruitsTableBody) fruitsTableBody.innerHTML = '';
        if (baveragesTableBody) baveragesTableBody.innerHTML = '';

        const currentFilter = filter.toLowerCase();

        const filteredList = orderList.filter(item =>
            item.name.toLowerCase().includes(currentFilter)
        ).sort((a, b) => a.name.localeCompare(b.name));

        filteredList.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td class="actions-cell">
                    <button class="edit-btn" data-id="${item.id}">Edit</button>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </td>
            `;

            // Append row to the correct table based on category and current page
            if (item.category === 'Fruits' && (currentPage === 'index.html' || currentPage === 'fruits.html')) {
                if (fruitsTableBody) fruitsTableBody.appendChild(row);
            } else if (item.category === 'Baverages' && (currentPage === 'index.html' || currentPage === 'beverages.html')) {
                if (baveragesTableBody) baveragesTableBody.appendChild(row);
            }
        });
    }

    // --- Data Persistence Helper ---
    function saveOrderList() {
        localStorage.setItem('tasteOrderList', JSON.stringify(orderList));
    }

    // --- CRUD Operations ---
    function addItem() {
        const name = itemNameInput.value.trim();
        const quantity = itemQuantityInput.value.trim();
        const category = itemCategorySelect.value;

        if (name && quantity) {
            const isDuplicate = orderList.some(item =>
                item.name.toLowerCase() === name.toLowerCase() && item.category === category
            );

            if (isDuplicate) {
                alert(`An item with the name "${name}" already exists in the "${category}" category.`);
                return;
            }

            const newItem = {
                id: Date.now(),
                name: name,
                quantity: quantity,
                category: category
            };
            orderList.push(newItem);
            orderList.sort((a, b) => a.name.localeCompare(b.name));
            saveOrderList();
            renderOrderList();
            itemNameInput.value = '';
            itemQuantityInput.value = '';
            itemCategorySelect.value = 'Fruits';
            itemNameInput.focus();
        } else {
            alert('Please enter both item name and quantity.');
        }
    }

    function deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            orderList = orderList.filter(item => item.id !== id);
            saveOrderList();
            renderOrderList(searchItemInput ? searchItemInput.value.trim() : ''); // Re-render with current search filter
        }
    }

    function editItem(id) {
        const itemToEdit = orderList.find(item => item.id === id);
        if (itemToEdit) {
            // Only set inputs if they exist on the current page (i.e., on index.html)
            if (itemNameInput && itemQuantityInput && itemCategorySelect) {
                itemNameInput.value = itemToEdit.name;
                itemQuantityInput.value = itemToEdit.quantity;
                itemCategorySelect.value = itemToEdit.category;
            }
            
            if (addItemBtn) addItemBtn.style.display = 'none';
            if (updateItemBtn) updateItemBtn.style.display = 'inline-block';
            editingItemId = id;
            if (itemNameInput) itemNameInput.focus();
            
            // If on a sub-page, alert and redirect to index.html for editing
            if (currentPage !== 'index.html') {
                alert("Please use the Main Dashboard to add or edit items.");
                setTimeout(() => { // Small delay for the alert to be seen
                    window.location.href = 'index.html';
                }, 100); 
            }
        }
    }

    function updateItem() {
        if (editingItemId !== null) {
            const name = itemNameInput.value.trim();
            const quantity = itemQuantityInput.value.trim();
            const category = itemCategorySelect.value;

            if (name && quantity) {
                const isDuplicate = orderList.some(item =>
                    item.id !== editingItemId &&
                    item.name.toLowerCase() === name.toLowerCase() &&
                    item.category === category
                );

                if (isDuplicate) {
                    alert(`An item with the name "${name}" already exists in the "${category}" category.`);
                    return;
                }

                orderList = orderList.map(item =>
                    item.id === editingItemId ? { ...item, name, quantity, category } : item
                );
                orderList.sort((a, b) => a.name.localeCompare(b.name));
                saveOrderList();
                renderOrderList();
                itemNameInput.value = '';
                itemQuantityInput.value = '';
                itemCategorySelect.value = 'Fruits';
                addItemBtn.style.display = 'inline-block';
                updateItemBtn.style.display = 'none';
                editingItemId = null;
                itemNameInput.focus();
            } else {
                alert('Please enter both item name and quantity.');
            }
        }
    }

    // --- Search Function ---
    function searchItems() {
        const searchTerm = searchItemInput ? searchItemInput.value.trim() : '';
        renderOrderList(searchTerm);
    }

    function clearSearch() {
        if (searchItemInput) {
            searchItemInput.value = '';
        }
        renderOrderList(); // Render all items without filter
    }

    function printOrderList() {
        window.print();
    }

    // --- Copy Text Functions (Uses selected date) ---
    function copyAllOrderText() {
        // Retrieve the selected date from localStorage
        const storedOrderDate = localStorage.getItem('selectedOrderDate');
        // Create a Date object from the stored string, adding 'T00:00:00' for reliable parsing
        const orderDate = new Date(storedOrderDate + 'T00:00:00');
        const orderDateFormatted = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
        let textToCopy = '';

        const commonHeader = `FROM:TASTE RESTAURANT\n`;
        const commonFooter = `Prepare By: koemhong\nThank You!\n==========================\n`;

        if (currentPage === 'index.html') {
            textToCopy += `${commonHeader}`;
            textToCopy += `Good morning dear boss & team, please help to order #Baverages & #Fruits for TASTE restaurant. @ "${orderDateFormatted}" !\n\n`;
            textToCopy += `==========================\n`;

            textToCopy += `F. #Fruits \n`;
            orderList.filter(item => item.category === 'Fruits')
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .forEach(item => { textToCopy += `- ${item.name} ${item.quantity}\n`; });
            textToCopy += `============== . Thanks you 🙏🏼\n`;
            textToCopy += `==========================\n\n`;

            textToCopy += `F. #Baverages \n`;
            orderList.filter(item => item.category === 'Baverages')
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .forEach(item => { textToCopy += `- ${item.name} ${item.quantity}\n`; });
            textToCopy += `==============\n`;
            textToCopy += `==========================\n`;
            textToCopy += commonFooter;

        } else if (currentPage === 'fruits.html') {
            textToCopy += `${commonHeader}`;
            textToCopy += `Good morning dear boss & team, please help to order #Fruits for TASTE restaurant. @ "${orderDateFormatted}" !\n\n`;
            textToCopy += `==========================\n`;
            textToCopy += `F. #Fruits \n`;
            orderList.filter(item => item.category === 'Fruits')
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .forEach(item => { textToCopy += `- ${item.name} ${item.quantity}\n`; });
            textToCopy += `============== . Thanks you 🙏🏼\n`;
            textToCopy += `==========================\n`;
            textToCopy += commonFooter;

        } else if (currentPage === 'beverages.html') {
            textToCopy += `${commonHeader}`;
            textToCopy += `Good morning dear boss & team, please help to order #Baverages for TASTE restaurant. @ "${orderDateFormatted}" !\n\n`;
            textToCopy += `==========================\n`;
            textToCopy += `F. #Baverages \n`;
            orderList.filter(item => item.category === 'Baverages')
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .forEach(item => { textToCopy += `- ${item.name} ${item.quantity}\n`; });
            textToCopy += `==============\n`;
            textToCopy += `==========================\n`;
            textToCopy += commonFooter;
        }

        navigator.clipboard.writeText(textToCopy)
            .then(() => { alert('Order list copied to clipboard!'); })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy text. Please try again or copy manually.');
            });
    }

    // --- Event Listeners ---

    // Date Input Listener (only on index.html, other pages are readonly)
    if (orderDateInput && currentPage === 'index.html') {
        orderDateInput.addEventListener('change', handleDateChange);
    }


    if (addItemBtn) addItemBtn.addEventListener('click', addItem);
    if (updateItemBtn) updateItemBtn.addEventListener('click', updateItem);

    if (searchBtn) searchBtn.addEventListener('click', searchItems);
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
    if (searchItemInput) {
        searchItemInput.addEventListener('input', searchItems);
        searchItemInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchItems();
            }
        });
    }

    if (printBtn) printBtn.addEventListener('click', printOrderList);
    if (copyTextBtn) copyTextBtn.addEventListener('click', copyAllOrderText);

    // Event delegation for edit and delete buttons on tables
    // These listeners are set on the table bodies themselves to handle dynamically added rows
    if (fruitsTableBody) {
        fruitsTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const id = parseFloat(event.target.dataset.id);
                deleteItem(id);
            } else if (event.target.classList.contains('edit-btn')) {
                const id = parseFloat(event.target.dataset.id);
                editItem(id);
            }
        });
    }

    if (baveragesTableBody) {
        baveragesTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const id = parseFloat(event.target.dataset.id);
                deleteItem(id);
            } else if (event.target.classList.contains('edit-btn')) {
                const id = parseFloat(event.target.dataset.id);
                editItem(id);
            }
        });
    }

    // Allow adding/updating on 'Enter' key press in item name/quantity inputs (only on index.html)
    if (itemNameInput && itemQuantityInput) {
        itemNameInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                if (editingItemId) {
                    updateItem();
                } else {
                    addItem();
                }
            }
        });
        itemQuantityInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                if (editingItemId) {
                    updateItem();
                } else {
                    addItem();
                }
            }
        });
    }

    // --- Initializations (Run when the DOM is fully loaded) ---
    initializeOrderDate(); // Set up the date input and display
    // Crucial: Render the item list initially
    renderOrderList(searchItemInput ? searchItemInput.value.trim() : ''); 
});