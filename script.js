const STORAGE_KEY = "restaurantAnalyticsOrders";

const sampleOrders = [
  { id: 1, date: "2026-05-19", item: "Classic Burger", category: "Burgers", type: "Pickup", price: 10.99, quantity: 6 },
  { id: 2, date: "2026-05-19", item: "Taco Trio", category: "Tacos", type: "Delivery", price: 11.99, quantity: 4 },
  { id: 3, date: "2026-05-20", item: "Chicken Rice Bowl", category: "Bowls", type: "Pickup", price: 11.49, quantity: 5 },
  { id: 4, date: "2026-05-20", item: "Loaded Fries", category: "Sides", type: "Dine-In", price: 5.49, quantity: 7 },
  { id: 5, date: "2026-05-21", item: "Fresh Lemonade", category: "Drinks", type: "Pickup", price: 3.49, quantity: 10 },
  { id: 6, date: "2026-05-21", item: "Chocolate Lava Cake", category: "Desserts", type: "Delivery", price: 6.49, quantity: 3 },
  { id: 7, date: "2026-05-22", item: "Classic Burger", category: "Burgers", type: "Pickup", price: 10.99, quantity: 8 },
  { id: 8, date: "2026-05-22", item: "Veggie Bowl", category: "Bowls", type: "Dine-In", price: 9.99, quantity: 4 },
  { id: 9, date: "2026-05-23", item: "Family Taco Combo", category: "Combos", type: "Delivery", price: 17.99, quantity: 3 },
  { id: 10, date: "2026-05-23", item: "Spicy Chicken Sandwich", category: "Burgers", type: "Pickup", price: 10.99, quantity: 5 },
  { id: 11, date: "2026-05-24", item: "Churro Bites", category: "Desserts", type: "Dine-In", price: 4.99, quantity: 6 },
  { id: 12, date: "2026-05-24", item: "Taco Trio", category: "Tacos", type: "Pickup", price: 11.99, quantity: 7 },
  { id: 13, date: "2026-05-25", item: "Loaded Fries", category: "Sides", type: "Delivery", price: 5.49, quantity: 9 },
  { id: 14, date: "2026-05-25", item: "Classic Burger", category: "Burgers", type: "Pickup", price: 10.99, quantity: 9 }
];

let orders = loadOrders();

const csvInput = document.getElementById("csvInput");
const downloadTemplateButton = document.getElementById("downloadTemplateButton");
const exportButton = document.getElementById("exportButton");
const resetButton = document.getElementById("resetButton");

const dateFilter = document.getElementById("dateFilter");
const categoryFilter = document.getElementById("categoryFilter");
const orderTypeFilter = document.getElementById("orderTypeFilter");
const searchInput = document.getElementById("searchInput");

const totalRevenue = document.getElementById("totalRevenue");
const totalOrders = document.getElementById("totalOrders");
const averageOrder = document.getElementById("averageOrder");
const bestSeller = document.getElementById("bestSeller");

const revenueChart = document.getElementById("revenueChart");
const categoryChart = document.getElementById("categoryChart");
const bestSellerList = document.getElementById("bestSellerList");
const ordersTableBody = document.getElementById("ordersTableBody");
const recordCountText = document.getElementById("recordCountText");

const orderForm = document.getElementById("orderForm");
const dateInput = document.getElementById("dateInput");
const itemInput = document.getElementById("itemInput");
const categoryInput = document.getElementById("categoryInput");
const typeInput = document.getElementById("typeInput");
const priceInput = document.getElementById("priceInput");
const quantityInput = document.getElementById("quantityInput");

const toast = document.getElementById("toast");

setTodayAsDefaultDate();
renderDashboard();

dateFilter.addEventListener("change", renderDashboard);
categoryFilter.addEventListener("change", renderDashboard);
orderTypeFilter.addEventListener("change", renderDashboard);
searchInput.addEventListener("input", renderDashboard);

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newOrder = {
    id: Date.now(),
    date: dateInput.value,
    item: itemInput.value.trim(),
    category: categoryInput.value,
    type: typeInput.value,
    price: Number(priceInput.value),
    quantity: Number(quantityInput.value)
  };

  orders.unshift(newOrder);
  saveOrders();

  orderForm.reset();
  setTodayAsDefaultDate();

  renderDashboard();
  showToast("Order added to dashboard.");
});

csvInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const csvText = reader.result;
    const importedOrders = parseCSV(csvText);

    if (importedOrders.length === 0) {
      showToast("No valid rows found in CSV.");
      csvInput.value = "";
      return;
    }

    orders = [...importedOrders, ...orders];
    saveOrders();
    renderDashboard();

    showToast(`${importedOrders.length} CSV order records imported.`);
    csvInput.value = "";
  };

  reader.readAsText(file);
});

downloadTemplateButton.addEventListener("click", downloadCSVTemplate);
exportButton.addEventListener("click", exportCurrentData);

resetButton.addEventListener("click", () => {
  const confirmed = confirm("Reset dashboard back to demo restaurant data?");

  if (!confirmed) {
    return;
  }

  orders = [...sampleOrders];
  saveOrders();
  renderDashboard();
  showToast("Demo data restored.");
});

ordersTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const orderId = Number(button.dataset.id);

  orders = orders.filter((order) => order.id !== orderId);
  saveOrders();
  renderDashboard();

  showToast("Order deleted.");
});

function renderDashboard() {
  updateCategoryFilter();
  const filteredOrders = getFilteredOrders();

  renderStats(filteredOrders);
  renderRevenueChart(filteredOrders);
  renderCategoryChart(filteredOrders);
  renderBestSellers(filteredOrders);
  renderTable(filteredOrders);
}

function renderStats(filteredOrders) {
  const revenue = filteredOrders.reduce((sum, order) => {
    return sum + order.price * order.quantity;
  }, 0);

  const orderCount = filteredOrders.length;
  const average = orderCount > 0 ? revenue / orderCount : 0;

  const topItem = getTopItems(filteredOrders)[0];

  totalRevenue.textContent = formatMoney(revenue);
  totalOrders.textContent = orderCount;
  averageOrder.textContent = formatMoney(average);
  bestSeller.textContent = topItem ? topItem.item : "None";
}

function renderRevenueChart(filteredOrders) {
  const revenueByDate = {};

  filteredOrders.forEach((order) => {
    if (!revenueByDate[order.date]) {
      revenueByDate[order.date] = 0;
    }

    revenueByDate[order.date] += order.price * order.quantity;
  });

  const chartData = Object.entries(revenueByDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-10);

  revenueChart.innerHTML = "";

  if (chartData.length === 0) {
    revenueChart.innerHTML = `<div class="empty-state">No revenue data to show.</div>`;
    return;
  }

  const maxRevenue = Math.max(...chartData.map((item) => item[1]));

  chartData.forEach(([date, revenue]) => {
    const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

    const barItem = document.createElement("div");
    barItem.className = "bar-item";

    barItem.innerHTML = `
      <div class="bar-value">${formatMoney(revenue)}</div>
      <div class="bar" style="height: ${height}%"></div>
      <div class="bar-label">${formatShortDate(date)}</div>
    `;

    revenueChart.appendChild(barItem);
  });
}

function renderCategoryChart(filteredOrders) {
  const categoryTotals = {};

  filteredOrders.forEach((order) => {
    if (!categoryTotals[order.category]) {
      categoryTotals[order.category] = 0;
    }

    categoryTotals[order.category] += order.quantity;
  });

  const chartData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  categoryChart.innerHTML = "";

  if (chartData.length === 0) {
    categoryChart.innerHTML = `<div class="empty-state">No category data to show.</div>`;
    return;
  }

  const maxQuantity = Math.max(...chartData.map((item) => item[1]));

  chartData.forEach(([category, quantity]) => {
    const width = maxQuantity > 0 ? (quantity / maxQuantity) * 100 : 0;

    const row = document.createElement("div");
    row.className = "horizontal-row";

    row.innerHTML = `
      <div class="horizontal-row-top">
        <span>${escapeHTML(category)}</span>
        <span>${quantity} sold</span>
      </div>

      <div class="horizontal-track">
        <div class="horizontal-fill" style="width: ${width}%"></div>
      </div>
    `;

    categoryChart.appendChild(row);
  });
}

function renderBestSellers(filteredOrders) {
  const topItems = getTopItems(filteredOrders).slice(0, 6);

  bestSellerList.innerHTML = "";

  if (topItems.length === 0) {
    bestSellerList.innerHTML = `<div class="empty-state">No best sellers yet.</div>`;
    return;
  }

  topItems.forEach((item, index) => {
    const bestItem = document.createElement("div");
    bestItem.className = "best-item";

    bestItem.innerHTML = `
      <div>
        <strong>${index + 1}. ${escapeHTML(item.item)}</strong>
        <small>${item.quantity} sold • ${formatMoney(item.revenue)}</small>
      </div>

      <span>${escapeHTML(item.category)}</span>
    `;

    bestSellerList.appendChild(bestItem);
  });
}

function renderTable(filteredOrders) {
  ordersTableBody.innerHTML = "";

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  recordCountText.textContent = `${filteredOrders.length} records`;

  if (sortedOrders.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">No orders match your filters.</div>
        </td>
      </tr>
    `;
    return;
  }

  sortedOrders.slice(0, 12).forEach((order) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHTML(order.date)}</td>
      <td>${escapeHTML(order.item)}</td>
      <td>${escapeHTML(order.category)}</td>
      <td>${escapeHTML(order.type)}</td>
      <td>${order.quantity}</td>
      <td>${formatMoney(order.price * order.quantity)}</td>
      <td>
        <button class="delete-button" data-id="${order.id}" type="button">
          Delete
        </button>
      </td>
    `;

    ordersTableBody.appendChild(row);
  });
}

function getFilteredOrders() {
  const selectedDateRange = dateFilter.value;
  const selectedCategory = categoryFilter.value;
  const selectedType = orderTypeFilter.value;
  const searchTerm = searchInput.value.toLowerCase().trim();

  return orders.filter((order) => {
    const matchesDate = isWithinDateRange(order.date, selectedDateRange);
    const matchesCategory = selectedCategory === "all" || order.category === selectedCategory;
    const matchesType = selectedType === "all" || order.type === selectedType;

    const matchesSearch = `
      ${order.item}
      ${order.category}
      ${order.type}
      ${order.date}
    `.toLowerCase().includes(searchTerm);

    return matchesDate && matchesCategory && matchesType && matchesSearch;
  });
}

function isWithinDateRange(dateString, range) {
  if (range === "all") {
    return true;
  }

  const orderDate = new Date(dateString);
  const today = new Date();
  const rangeDays = Number(range);
  const cutoffDate = new Date();

  cutoffDate.setDate(today.getDate() - rangeDays);

  return orderDate >= cutoffDate;
}

function getTopItems(filteredOrders) {
  const itemMap = {};

  filteredOrders.forEach((order) => {
    if (!itemMap[order.item]) {
      itemMap[order.item] = {
        item: order.item,
        category: order.category,
        quantity: 0,
        revenue: 0
      };
    }

    itemMap[order.item].quantity += order.quantity;
    itemMap[order.item].revenue += order.price * order.quantity;
  });

  return Object.values(itemMap).sort((a, b) => {
    return b.quantity - a.quantity;
  });
}

function updateCategoryFilter() {
  const currentValue = categoryFilter.value;
  const categories = [...new Set(orders.map((order) => order.category))].sort();

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  if (categories.includes(currentValue)) {
    categoryFilter.value = currentValue;
  }
}

function parseCSV(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCSVLine(lines[0]).map((header) => header.toLowerCase().trim());

  const requiredHeaders = ["date", "item", "category", "type", "price", "quantity"];

  const hasRequiredHeaders = requiredHeaders.every((header) => headers.includes(header));

  if (!hasRequiredHeaders) {
    showToast("CSV missing required headers.");
    return [];
  }

  const imported = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : "";
    });

    const price = Number(row.price);
    const quantity = Number(row.quantity);

    if (!row.date || !row.item || !row.category || !row.type || Number.isNaN(price) || Number.isNaN(quantity)) {
      continue;
    }

    imported.push({
      id: Date.now() + i,
      date: row.date,
      item: row.item,
      category: row.category,
      type: row.type,
      price: price,
      quantity: quantity
    });
  }

  return imported;
}

function splitCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const character = line[i];

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  result.push(current);

  return result;
}

function downloadCSVTemplate() {
  const csvContent =
    "date,item,category,type,price,quantity\n" +
    "2026-05-25,Classic Burger,Burgers,Pickup,10.99,2\n" +
    "2026-05-25,Taco Trio,Tacos,Delivery,11.99,1\n" +
    "2026-05-25,Fresh Lemonade,Drinks,Dine-In,3.49,3";

  downloadFile("restaurant-orders-template.csv", csvContent, "text/csv");
}

function exportCurrentData() {
  const csvRows = [
    "date,item,category,type,price,quantity"
  ];

  orders.forEach((order) => {
    csvRows.push([
      order.date,
      order.item,
      order.category,
      order.type,
      order.price,
      order.quantity
    ].join(","));
  });

  downloadFile("restaurant-analytics-export.csv", csvRows.join("\n"), "text/csv");
  showToast("Dashboard data exported.");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function loadOrders() {
  const savedOrders = localStorage.getItem(STORAGE_KEY);

  if (!savedOrders) {
    return [...sampleOrders];
  }

  try {
    return JSON.parse(savedOrders);
  } catch (error) {
    console.error("Could not load saved orders:", error);
    return [...sampleOrders];
  }
}

function setTodayAsDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;
}

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function formatShortDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
