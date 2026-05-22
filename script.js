const periodFilter = document.getElementById("periodFilter");
const categoryFilter = document.getElementById("categoryFilter");

const revenueTotal = document.getElementById("revenueTotal");
const usersTotal = document.getElementById("usersTotal");
const ordersTotal = document.getElementById("ordersTotal");
const conversionRate = document.getElementById("conversionRate");

const revenueChange = document.getElementById("revenueChange");
const usersChange = document.getElementById("usersChange");
const ordersChange = document.getElementById("ordersChange");
const conversionChange = document.getElementById("conversionChange");

const lineChart = document.getElementById("lineChart");
const barChart = document.getElementById("barChart");
const salesTableBody = document.getElementById("salesTableBody");
const tableMessage = document.getElementById("tableMessage");
const emptyState = document.getElementById("emptyState");

const salesData = [
  {
    month: "Jan",
    period: "90 Days",
    category: "Software",
    revenue: 12400,
    users: 920,
    orders: 144,
    conversion: 4.8
  },
  {
    month: "Feb",
    period: "90 Days",
    category: "Hardware",
    revenue: 9800,
    users: 740,
    orders: 98,
    conversion: 3.9
  },
  {
    month: "Mar",
    period: "90 Days",
    category: "Services",
    revenue: 15200,
    users: 1100,
    orders: 166,
    conversion: 5.2
  },
  {
    month: "Apr",
    period: "90 Days",
    category: "Software",
    revenue: 18750,
    users: 1400,
    orders: 210,
    conversion: 5.7
  },
  {
    month: "May",
    period: "30 Days",
    category: "Hardware",
    revenue: 11300,
    users: 880,
    orders: 121,
    conversion: 4.1
  },
  {
    month: "Jun",
    period: "30 Days",
    category: "Services",
    revenue: 17100,
    users: 1320,
    orders: 198,
    conversion: 5.5
  },
  {
    month: "Jul",
    period: "30 Days",
    category: "Software",
    revenue: 22300,
    users: 1620,
    orders: 254,
    conversion: 6.1
  },
  {
    month: "Aug",
    period: "30 Days",
    category: "Hardware",
    revenue: 13900,
    users: 980,
    orders: 139,
    conversion: 4.6
  },
  {
    month: "Sep",
    period: "30 Days",
    category: "Services",
    revenue: 24600,
    users: 1740,
    orders: 290,
    conversion: 6.4
  }
];

periodFilter.addEventListener("change", function () {
  saveFilters();
  updateDashboard();
});

categoryFilter.addEventListener("change", function () {
  saveFilters();
  updateDashboard();
});

function saveFilters() {
  localStorage.setItem("analyticsPeriodFilter", periodFilter.value);
  localStorage.setItem("analyticsCategoryFilter", categoryFilter.value);
}

function loadFilters() {
  const savedPeriod = localStorage.getItem("analyticsPeriodFilter");
  const savedCategory = localStorage.getItem("analyticsCategoryFilter");

  if (savedPeriod) {
    periodFilter.value = savedPeriod;
  }

  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}

function getFilteredData() {
  const selectedPeriod = periodFilter.value;
  const selectedCategory = categoryFilter.value;

  return salesData.filter(function (item) {
    const matchesPeriod =
      selectedPeriod === "All" || item.period === selectedPeriod;

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesPeriod && matchesCategory;
  });
}

function updateDashboard() {
  const filteredData = getFilteredData();

  if (filteredData.length === 0) {
    emptyState.classList.add("show");
  } else {
    emptyState.classList.remove("show");
  }

  updateSummaryCards(filteredData);
  renderLineChart(filteredData);
  renderBarChart(filteredData);
  renderTable(filteredData);
}

function updateSummaryCards(data) {
  const totalRevenue = data.reduce(function (sum, item) {
    return sum + item.revenue;
  }, 0);

  const totalUsers = data.reduce(function (sum, item) {
    return sum + item.users;
  }, 0);

  const totalOrders = data.reduce(function (sum, item) {
    return sum + item.orders;
  }, 0);

  const avgConversion = data.length
    ? data.reduce(function (sum, item) {
        return sum + item.conversion;
      }, 0) / data.length
    : 0;

  revenueTotal.textContent = formatCurrency(totalRevenue);
  usersTotal.textContent = totalUsers.toLocaleString();
  ordersTotal.textContent = totalOrders.toLocaleString();
  conversionRate.textContent = `${avgConversion.toFixed(1)}%`;

  revenueChange.textContent = `${data.length} data points included`;
  usersChange.textContent = "Filtered visitor data";
  ordersChange.textContent = "Filtered order total";
  conversionChange.textContent = "Average conversion rate";
}

function renderLineChart(data) {
  lineChart.innerHTML = "";

  if (data.length === 0) {
    return;
  }

  const width = 300;
  const height = 130;
  const padding = 18;
  const maxRevenue = Math.max(...data.map(function (item) {
    return item.revenue;
  }));

  const points = data.map(function (item, index) {
    const x =
      data.length === 1
        ? width / 2
        : padding + (index * (width - padding * 2)) / (data.length - 1);

    const y =
      height -
      padding -
      (item.revenue / maxRevenue) * (height - padding * 2);

    return {
      x: x,
      y: y,
      label: item.month,
      revenue: item.revenue
    };
  });

  const linePoints = points.map(function (point) {
    return `${point.x},${point.y}`;
  }).join(" ");

  const areaPoints = `${padding},${height - padding} ${linePoints} ${width - padding},${height - padding}`;

  const area = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  area.setAttribute("points", areaPoints);
  area.setAttribute("class", "chart-area");
  lineChart.appendChild(area);

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", linePoints);
  polyline.setAttribute("class", "chart-line");
  lineChart.appendChild(polyline);

  points.forEach(function (point) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", 4);
    circle.setAttribute("class", "chart-dot");
    lineChart.appendChild(circle);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", point.x);
    label.setAttribute("y", height - 4);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "chart-label");
    label.textContent = point.label;
    lineChart.appendChild(label);
  });
}

function renderBarChart(data) {
  barChart.innerHTML = "";

  const categories = ["Software", "Hardware", "Services"];

  const totals = categories.map(function (category) {
    const totalOrders = data
      .filter(function (item) {
        return item.category === category;
      })
      .reduce(function (sum, item) {
        return sum + item.orders;
      }, 0);

    return {
      category: category,
      orders: totalOrders
    };
  });

  const maxOrders = Math.max(...totals.map(function (item) {
    return item.orders;
  }), 1);

  totals.forEach(function (item) {
    const row = document.createElement("div");
    row.className = "bar-row";

    const info = document.createElement("div");
    info.className = "bar-info";
    info.innerHTML = `<span>${item.category}</span><span>${item.orders} orders</span>`;

    const track = document.createElement("div");
    track.className = "bar-track";

    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = `${(item.orders / maxOrders) * 100}%`;

    track.appendChild(fill);
    row.appendChild(info);
    row.appendChild(track);
    barChart.appendChild(row);
  });
}

function renderTable(data) {
  salesTableBody.innerHTML = "";

  tableMessage.textContent = `${data.length} rows showing`;

  data.forEach(function (item) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.month}</td>
      <td>${item.category}</td>
      <td>${formatCurrency(item.revenue)}</td>
      <td>${item.users.toLocaleString()}</td>
      <td>${item.orders.toLocaleString()}</td>
      <td>${item.conversion}%</td>
    `;

    salesTableBody.appendChild(row);
  });
}

function formatCurrency(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

loadFilters();
updateDashboard();
