// --- DEFAULT INITIAL DATA ---
const defaultCategories = [
  { id: 'cat_1', name: 'Salary', type: 'income', color: '#10b981', icon: 'fa-money-bill-wave' },
  { id: 'cat_2', name: 'Freelance', type: 'income', color: '#06b6d4', icon: 'fa-laptop-code' },
  { id: 'cat_3', name: 'Groceries', type: 'expense', color: '#f59e0b', icon: 'fa-cart-shopping' },
  { id: 'cat_4', name: 'Rent & Bills', type: 'expense', color: '#ef4444', icon: 'fa-house' },
  { id: 'cat_5', name: 'Dining Out', type: 'expense', color: '#ec4899', icon: 'fa-utensils' },
  { id: 'cat_6', name: 'Entertainment', type: 'expense', color: '#8b5cf6', icon: 'fa-film' },
  { id: 'cat_7', name: 'Transport', type: 'expense', color: '#3b82f6', icon: 'fa-car' }
];

const today = new Date();
const formatDateStr = (offsetMonths = 0, day = 15) => {
  const d = new Date(today.getFullYear(), today.getMonth() - offsetMonths, day);
  return d.toISOString().split('T')[0];
};

const defaultTransactions = [
  { id: 'tx_1', type: 'income', amount: 4200.00, date: formatDateStr(0, 1), category: 'Salary', description: 'Monthly Tech Salary' },
  { id: 'tx_2', type: 'expense', amount: 1200.00, date: formatDateStr(0, 2), category: 'Rent & Bills', description: 'Apartment Monthly Rent' },
  { id: 'tx_3', type: 'expense', amount: 145.50, date: formatDateStr(0, 5), category: 'Groceries', description: 'Supermarket supplies' },
  { id: 'tx_4', type: 'expense', amount: 65.00, date: formatDateStr(0, 8), category: 'Dining Out', description: 'Dinner with team' },
  { id: 'tx_5', type: 'income', amount: 650.00, date: formatDateStr(0, 12), category: 'Freelance', description: 'UI Design Landing Page' },
  { id: 'tx_6', type: 'expense', amount: 45.00, date: formatDateStr(0, 14), category: 'Entertainment', description: 'Movie tickets & snacks' },
  { id: 'tx_7', type: 'income', amount: 4200.00, date: formatDateStr(1, 1), category: 'Salary', description: 'Monthly Tech Salary' },
  { id: 'tx_8', type: 'expense', amount: 1200.00, date: formatDateStr(1, 2), category: 'Rent & Bills', description: 'Apartment Monthly Rent' },
  { id: 'tx_9', type: 'expense', amount: 210.30, date: formatDateStr(1, 10), category: 'Groceries', description: 'Monthly grocery run' },
  { id: 'tx_10', type: 'expense', amount: 80.00, date: formatDateStr(1, 18), category: 'Transport', description: 'Gas refill' }
];

// --- STATE MANAGEMENT ---
let categories = JSON.parse(localStorage.getItem('spendwise_categories')) || defaultCategories;
let transactions = JSON.parse(localStorage.getItem('spendwise_transactions')) || defaultTransactions;
let pendingDeleteId = null;

// Chart instances
let categoryChartInstance = null;
let trendChartInstance = null;

// --- INITIALIZATION ---
window.onload = function() {
  initTheme();
  populateCategoryDropdowns();
  renderTransactions();
  renderCategoryManagerList();
};

function saveToLocalStorage() {
  localStorage.setItem('spendwise_categories', JSON.stringify(categories));
  localStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
}

// --- THEME MANAGEMENT ---
function initTheme() {
  const savedTheme = localStorage.getItem('spendwise_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.getElementById('themeIcon').className = 'fa-solid fa-sun text-lg text-amber-400';
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('themeIcon').className = 'fa-solid fa-moon text-lg';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('spendwise_theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').className = isDark ? 'fa-solid fa-sun text-lg text-amber-400' : 'fa-solid fa-moon text-lg';
  updateCharts();
}

// --- TRANSACTION RENDERING & FILTERING ---
function renderTransactions() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const catFilter = document.getElementById('categoryFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(search);
    const matchesCat = catFilter === 'all' || tx.category === catFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    let matchesDate = true;
    if (startDate) matchesDate = matchesDate && tx.date >= startDate;
    if (endDate) matchesDate = matchesDate && tx.date <= endDate;

    return matchesSearch && matchesCat && matchesType && matchesDate;
  });

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById('transactionTableBody');
  const emptyState = document.getElementById('emptyState');
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filtered.forEach(tx => {
      const catObj = categories.find(c => c.name === tx.category) || { color: '#64748b', icon: 'fa-tag' };
      const isIncome = tx.type === 'income';

      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors";
      tr.innerHTML = `
        <td class="p-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">${tx.date}</td>
        <td class="p-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium" style="background-color: ${catObj.color}20; color: ${catObj.color}">
            <i class="fa-solid ${catObj.icon} mr-1.5 text-[10px]"></i> ${tx.category}
          </span>
        </td>
        <td class="p-4 font-medium text-slate-800 dark:text-slate-200">${tx.description}</td>
        <td class="p-4 whitespace-nowrap">
          <span class="inline-flex items-center text-[11px] font-semibold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}">
            <i class="fa-solid ${isIncome ? 'fa-arrow-down' : 'fa-arrow-up'} mr-1"></i> ${tx.type.toUpperCase()}
          </span>
        </td>
        <td class="p-4 text-right whitespace-nowrap font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}">
          ${isIncome ? '+' : '-'}$${parseFloat(tx.amount).toFixed(2)}
        </td>
        <td class="p-4 text-center whitespace-nowrap space-x-1">
          <button onclick="openEditModal('${tx.id}')" class="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button onclick="confirmDelete('${tx.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  updateSummaries(filtered);
  updateCharts();
  renderMonthlySummaries();
}

// --- QUICK PRESETS ---
function setPreset(preset) {
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.className = "preset-btn text-xs font-medium px-3 py-1.5 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900";
  });
  const activeBtn = document.getElementById(`preset-${preset}`);
  if (activeBtn) {
    activeBtn.className = "preset-btn text-xs font-medium px-3 py-1.5 rounded-lg transition-all bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100";
  }

  const startInput = document.getElementById('startDate');
  const endInput = document.getElementById('endDate');

  const now = new Date();
  if (preset === 'all') {
    startInput.value = '';
    endInput.value = '';
  } else if (preset === 'thisMonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    startInput.value = firstDay.toISOString().split('T')[0];
    endInput.value = lastDay.toISOString().split('T')[0];
  } else if (preset === 'lastMonth') {
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    startInput.value = firstDay.toISOString().split('T')[0];
    endInput.value = lastDay.toISOString().split('T')[0];
  }
  renderTransactions();
}

function clearPresetActive() {
  document.querySelectorAll('.preset-btn').forEach(b => {
    b.className = "preset-btn text-xs font-medium px-3 py-1.5 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900";
  });
}

// --- CALCULATIONS & SUMMARIES ---
function updateSummaries(filteredTx) {
  const incomeTx = filteredTx.filter(t => t.type === 'income');
  const expenseTx = filteredTx.filter(t => t.type === 'expense');

  const totalIncome = incomeTx.reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const totalExpense = expenseTx.reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;

  document.getElementById('totalBalance').innerText = `$${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('totalIncome').innerText = `$${totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('totalExpense').innerText = `$${totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

  document.getElementById('incomeCount').innerText = `${incomeTx.length} income record${incomeTx.length === 1 ? '' : 's'}`;
  document.getElementById('expenseCount').innerText = `${expenseTx.length} expense record${expenseTx.length === 1 ? '' : 's'}`;
}

// --- CHART.JS INTEGRATION ---
function updateCharts() {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // 1. CATEGORY BREAKDOWN (DOUGHNUT)
  const expenseTxs = transactions.filter(t => t.type === 'expense');
  const catTotals = {};
  expenseTxs.forEach(t => {
    catTotals[t.category] = (catTotals[t.category] || 0) + parseFloat(t.amount);
  });

  const catLabels = Object.keys(catTotals);
  const catData = Object.values(catTotals);
  const catColors = catLabels.map(l => {
    const found = categories.find(c => c.name === l);
    return found ? found.color : '#6366f1';
  });

  const ctxCategory = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInstance) categoryChartInstance.destroy();

  categoryChartInstance = new Chart(ctxCategory, {
    type: 'doughnut',
    data: {
      labels: catLabels.length ? catLabels : ['No Expenses'],
      datasets: [{
        data: catData.length ? catData : [1],
        backgroundColor: catColors.length ? catColors : ['#cbd5e1'],
        borderWidth: 2,
        borderColor: isDark ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { family: 'Inter', size: 11 }, boxWidth: 12 }
        }
      },
      cutout: '70%'
    }
  });

  // 2. MONTHLY OVERVIEW / TREND CHART (BAR CHART)
  const monthlyData = {};
  transactions.forEach(t => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { income: 0, expense: 0 };
    if (t.type === 'income') monthlyData[monthKey].income += parseFloat(t.amount);
    if (t.type === 'expense') monthlyData[monthKey].expense += parseFloat(t.amount);
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const incomeSeries = sortedMonths.map(m => monthlyData[m].income);
  const expenseSeries = sortedMonths.map(m => monthlyData[m].expense);
  const formattedMonthLabels = sortedMonths.map(m => {
    const [year, month] = m.split('-');
    const dateObj = new Date(year, month - 1);
    return dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
  });

  const ctxTrend = document.getElementById('trendChart').getContext('2d');
  if (trendChartInstance) trendChartInstance.destroy();

  trendChartInstance = new Chart(ctxTrend, {
    type: 'bar',
    data: {
      labels: formattedMonthLabels,
      datasets: [
        {
          label: 'Income',
          data: incomeSeries,
          backgroundColor: '#10b981',
          borderRadius: 6
        },
        {
          label: 'Expense',
          data: expenseSeries,
          backgroundColor: '#f43f5e',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textColor, font: { family: 'Inter', size: 11 }, boxWidth: 12 }
        }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: isDark ? '#334155' : '#f1f5f9' } }
      }
    }
  });
}

// --- MONTHLY SUMMARIES ACCORDION ---
function renderMonthlySummaries() {
  const container = document.getElementById('monthlySummaryContainer');
  container.innerHTML = '';

  const grouped = {};
  transactions.forEach(t => {
    const monthKey = t.date.substring(0, 7); // YYYY-MM
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(t);
  });

  const sortedMonths = Object.keys(grouped).sort().reverse();

  if (sortedMonths.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-400">No monthly summaries available.</p>';
    return;
  }

  sortedMonths.forEach(mKey => {
    const list = grouped[mKey];
    const income = list.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const expense = list.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);
    const savings = income - expense;

    // Top Expense Category
    const catMap = {};
    list.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + parseFloat(t.amount);
    });

    let topCategory = 'N/A';
    let topCatAmount = 0;
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (amt > topCatAmount) {
        topCatAmount = amt;
        topCategory = cat;
      }
    });

    const [year, month] = mKey.split('-');
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

    const item = document.createElement('div');
    item.className = "border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all bg-white/40 dark:bg-slate-800/40";
    item.innerHTML = `
      <button onclick="toggleAccordion('${mKey}')" class="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/80 transition-colors">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-xs font-bold">
            ${mKey}
          </div>
          <span class="font-semibold text-sm">${monthName}</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-xs font-medium ${savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}">
            Net: $${savings.toFixed(2)}
          </span>
          <i id="acc-icon-${mKey}" class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200"></i>
        </div>
      </button>
      
      <div id="acc-body-${mKey}" class="hidden p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span class="text-slate-400 block">Total Income</span>
          <span class="font-bold text-emerald-600 dark:text-emerald-400">$${income.toFixed(2)}</span>
        </div>
        <div>
          <span class="text-slate-400 block">Total Expenses</span>
          <span class="font-bold text-rose-600 dark:text-rose-400">$${expense.toFixed(2)}</span>
        </div>
        <div>
          <span class="text-slate-400 block">Net Savings</span>
          <span class="font-bold text-indigo-600 dark:text-indigo-400">$${savings.toFixed(2)}</span>
        </div>
        <div>
          <span class="text-slate-400 block">Top Category</span>
          <span class="font-semibold">${topCategory} ${topCatAmount > 0 ? `($${topCatAmount.toFixed(0)})` : ''}</span>
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

function toggleAccordion(mKey) {
  const body = document.getElementById(`acc-body-${mKey}`);
  const icon = document.getElementById(`acc-icon-${mKey}`);
  if (body.classList.contains('hidden')) {
    body.classList.remove('hidden');
    icon.classList.add('rotate-180');
  } else {
    body.classList.add('hidden');
    icon.classList.remove('rotate-180');
  }
}

// --- TRANSACTION MODAL & ACTIONS ---
function openTransactionModal(editId = null) {
  document.getElementById('transactionForm').reset();
  document.getElementById('editTxId').value = '';
  document.getElementById('txDate').value = new Date().toISOString().split('T')[0];
  selectType('expense');

  if (editId) {
    const tx = transactions.find(t => t.id === editId);
    if (tx) {
      document.getElementById('modalTitle').innerText = 'Edit Transaction';
      document.getElementById('editTxId').value = tx.id;
      document.getElementById('txAmount').value = tx.amount;
      document.getElementById('txDate').value = tx.date;
      document.getElementById('txDescription').value = tx.description;
      selectType(tx.type);
      document.getElementById('txCategory').value = tx.category;
    }
  } else {
    document.getElementById('modalTitle').innerText = 'Add Transaction';
  }

  document.getElementById('transactionModal').classList.remove('hidden');
}

function closeTransactionModal() {
  document.getElementById('transactionModal').classList.add('hidden');
}

function selectType(type) {
  document.getElementById('txType').value = type;
  const expenseBtn = document.getElementById('typeExpenseBtn');
  const incomeBtn = document.getElementById('typeIncomeBtn');

  if (type === 'expense') {
    expenseBtn.className = "py-2 text-xs font-semibold rounded-lg transition-all bg-rose-500 text-white shadow-sm";
    incomeBtn.className = "py-2 text-xs font-semibold rounded-lg transition-all text-slate-600 dark:text-slate-400";
  } else {
    incomeBtn.className = "py-2 text-xs font-semibold rounded-lg transition-all bg-emerald-500 text-white shadow-sm";
    expenseBtn.className = "py-2 text-xs font-semibold rounded-lg transition-all text-slate-600 dark:text-slate-400";
  }
  populateCategoryDropdowns(type);
}

function handleTransactionSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('editTxId').value;
  const type = document.getElementById('txType').value;
  const amount = parseFloat(document.getElementById('txAmount').value);
  const date = document.getElementById('txDate').value;
  const category = document.getElementById('txCategory').value;
  const description = document.getElementById('txDescription').value;

  if (id) {
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { id, type, amount, date, category, description };
    }
  } else {
    const newTx = {
      id: 'tx_' + Date.now(),
      type,
      amount,
      date,
      category,
      description
    };
    transactions.push(newTx);
  }

  saveToLocalStorage();
  renderTransactions();
  closeTransactionModal();
}

function openEditModal(id) {
  openTransactionModal(id);
}

function confirmDelete(id) {
  pendingDeleteId = id;
  document.getElementById('confirmDeleteBtn').onclick = () => {
    transactions = transactions.filter(t => t.id !== pendingDeleteId);
    saveToLocalStorage();
    renderTransactions();
    closeDeleteModal();
  };
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('deleteModal').classList.add('hidden');
}

// --- CATEGORY MANAGER ---
function openCategoryModal() {
  renderCategoryManagerList();
  document.getElementById('categoryModal').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('categoryModal').classList.add('hidden');
}

function populateCategoryDropdowns(typeFilter = null) {
  const txCatSelect = document.getElementById('txCategory');
  const filterCatSelect = document.getElementById('categoryFilter');

  const currentFilterVal = filterCatSelect.value;
  const currentTxVal = txCatSelect.value;

  filterCatSelect.innerHTML = '<option value="all">All Categories</option>';
  txCatSelect.innerHTML = '';

  categories.forEach(cat => {
    // Populate Filter Select
    const optFilter = document.createElement('option');
    optFilter.value = cat.name;
    optFilter.innerText = cat.name;
    filterCatSelect.appendChild(optFilter);

    // Populate Form Select
    if (!typeFilter || cat.type === typeFilter) {
      const optTx = document.createElement('option');
      optTx.value = cat.name;
      optTx.innerText = cat.name;
      txCatSelect.appendChild(optTx);
    }
  });

  filterCatSelect.value = currentFilterVal;
  if (currentTxVal) txCatSelect.value = currentTxVal;
}

function renderCategoryManagerList() {
  const container = document.getElementById('categoryListContainer');
  container.innerHTML = '';

  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs";
    item.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <span class="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs" style="background-color: ${cat.color}">
          <i class="fa-solid ${cat.icon}"></i>
        </span>
        <span class="font-medium">${cat.name}</span>
        <span class="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${cat.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}">${cat.type}</span>
      </div>
      <button onclick="deleteCategory('${cat.id}')" class="text-slate-400 hover:text-rose-600 transition-colors p-1">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    container.appendChild(item);
  });
}

function handleCategorySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('catName').value.trim();
  const type = document.getElementById('catType').value;
  const color = document.getElementById('catColor').value;
  const icon = document.getElementById('catIcon').value.trim() || 'fa-tag';

  if (!name) return;

  if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    alert('Category name already exists!');
    return;
  }

  const newCat = {
    id: 'cat_' + Date.now(),
    name,
    type,
    color,
    icon
  };

  categories.push(newCat);
  saveToLocalStorage();
  populateCategoryDropdowns();
  renderCategoryManagerList();
  renderTransactions();
  document.getElementById('categoryForm').reset();
}

function deleteCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  const isUsed = transactions.some(t => t.category === cat.name);
  if (isUsed) {
    alert(`Cannot delete category "${cat.name}" because transactions are using it.`);
    return;
  }

  categories = categories.filter(c => c.id !== id);
  saveToLocalStorage();
  populateCategoryDropdowns();
  renderCategoryManagerList();
  renderTransactions();
}

// --- DATA IMPORT / EXPORT ---
function openDataModal() {
  document.getElementById('dataModal').classList.remove('hidden');
}

function closeDataModal() {
  document.getElementById('dataModal').classList.add('hidden');
}

function exportToCSV() {
  const headers = ['ID', 'Type', 'Amount', 'Date', 'Category', 'Description'];
  const rows = transactions.map(t => [
    t.id,
    t.type,
    t.amount,
    t.date,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.description.replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SpendWise_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportToJSON() {
  const backupData = {
    categories,
    transactions
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `SpendWise_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importFromJSON() {
  const fileInput = document.getElementById('importFile');
  if (!fileInput.files.length) {
    alert('Please select a JSON file to import.');
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.categories && data.transactions) {
        categories = data.categories;
        transactions = data.transactions;
        saveToLocalStorage();
        populateCategoryDropdowns();
        renderCategoryManagerList();
        renderTransactions();
        closeDataModal();
        alert('Data restored successfully!');
      } else {
        alert('Invalid backup file structure.');
      }
    } catch (err) {
      alert('Error parsing JSON file.');
    }
  };

  reader.readAsText(file);
}