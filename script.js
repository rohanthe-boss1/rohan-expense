// ইন্ট্রো পেজ ও মেইন অ্যাপ এলিমেন্ট
const introPage = document.getElementById('intro-page');
const mainApp = document.getElementById('main-app');
const startAppBtn = document.getElementById('start-app-btn');

startAppBtn.addEventListener('click', () => {
    introPage.style.display = 'none';
    mainApp.style.display = 'block';
});

// নেভিগেশন ট্যাব ও সেকশন
const tabCurrentBtn = document.getElementById('tab-current-btn');
const tabOldBtn = document.getElementById('tab-old-btn');
const tabNewBtn = document.getElementById('tab-new-btn');
const resumeOldBtn = document.getElementById('resume-old-btn');

const currentAccountSection = document.getElementById('current-account-section');
const oldAccountSection = document.getElementById('old-account-section');

// বর্তমান হিসাব ট্যাব
tabCurrentBtn.addEventListener('click', () => {
    tabCurrentBtn.classList.add('active');
    tabOldBtn.classList.remove('active');
    currentAccountSection.style.display = 'grid';
    oldAccountSection.style.display = 'none';
});

// পুরাতন হিসাব ট্যাব
tabOldBtn.addEventListener('click', () => {
    tabOldBtn.classList.add('active');
    tabCurrentBtn.classList.remove('active');
    currentAccountSection.style.display = 'none';
    oldAccountSection.style.display = 'block';
    populateArchiveMonthDropdown();
});

// বাম পাশের ইনপুট ফিল্ডগুলো
const inTotal = document.getElementById('in-total');
const inRent = document.getElementById('in-rent');
const inWifi = document.getElementById('in-wifi');
const inCurrent = document.getElementById('in-current');
const inFoodBudget = document.getElementById('in-food-budget');
const inOtherExpense = document.getElementById('in-other-expense');

const leftInputs = [inTotal, inRent, inWifi, inCurrent, inFoodBudget, inOtherExpense];

const outHandMoney = document.getElementById('out-hand-money');
const totalDeductedText = document.getElementById('total-deducted-text');
const handBox = document.getElementById('hand-box');

// ডান পাশের খাবারের হিসাবের এলিমেন্টগুলো
const selectedDateInput = document.getElementById('selected-date');
const formattedDateDisplay = document.getElementById('formatted-date-display');
const fTotalBudget = document.getElementById('f-total-budget');
const fTotalSpent = document.getElementById('f-total-spent');
const fRemaining = document.getElementById('f-remaining');
const fPredictionDays = document.getElementById('f-prediction-days');
const fLeftCard = document.getElementById('f-left-card');
const fDailyAvg = document.getElementById('f-daily-avg');

const lunchCost = document.getElementById('lunch-cost');
const dinnerCost = document.getElementById('dinner-cost');
const breakfastCost = document.getElementById('breakfast-cost');
const calcFoodBtn = document.getElementById('calc-food-btn');
const saveStatusMsg = document.getElementById('save-status-msg');

// নাম্বার ইনপুট লক
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('wheel', (e) => {
        e.preventDefault();
    }, { passive: false });
});

// LocalStorage ডাটা
let budgetData = JSON.parse(localStorage.getItem('rohan_budget_data')) || {
    total: '', rent: '', wifi: '', current: '', foodBudget: '', otherExpense: ''
};

let foodHistory = JSON.parse(localStorage.getItem('rohan_food_history')) || {};
let archivedMonths = JSON.parse(localStorage.getItem('rohan_archived_months')) || {};
let backupCurrentData = JSON.parse(localStorage.getItem('rohan_backup_current')) || null;

// ব্যাকআপ থাকলে "পুরাতন হিসাব চালিয়ে যান" বাটন শো করবে
function checkResumeAvailability() {
    if (backupCurrentData) {
        resumeOldBtn.style.display = 'inline-block';
    } else {
        resumeOldBtn.style.display = 'none';
    }
}
checkResumeAvailability();

function getLocalDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

if (!selectedDateInput.value) {
    selectedDateInput.value = getLocalDateString();
}

function updateDateDisplay(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        formattedDateDisplay.textContent = `তারিখ: ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
}

inTotal.value = budgetData.total || '';
inRent.value = budgetData.rent || '';
inWifi.value = budgetData.wifi || '';
inCurrent.value = budgetData.current || '';
inFoodBudget.value = budgetData.foodBudget || '';
inOtherExpense.value = budgetData.otherExpense || '';

function loadDateData(dateStr) {
    if (!foodHistory[dateStr]) {
        foodHistory[dateStr] = { lunch: '', dinner: '', breakfast: '' };
    }
    lunchCost.value = foodHistory[dateStr].lunch !== undefined ? foodHistory[dateStr].lunch : '';
    dinnerCost.value = foodHistory[dateStr].dinner !== undefined ? foodHistory[dateStr].dinner : '';
    breakfastCost.value = foodHistory[dateStr].breakfast !== undefined ? foodHistory[dateStr].breakfast : '';
    updateDateDisplay(dateStr);
}

loadDateData(selectedDateInput.value);

selectedDateInput.addEventListener('change', () => {
    loadDateData(selectedDateInput.value);
    saveStatusMsg.textContent = 'ℹ️ খরচ লিখে "হিসাব করুন" বাটনে চাপ দিলে সেভ হবে';
    saveStatusMsg.classList.remove('saved');
});

leftInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        budgetData = {
            total: inTotal.value, rent: inRent.value, wifi: inWifi.value,
            current: inCurrent.value, foodBudget: inFoodBudget.value, otherExpense: inOtherExpense.value
        };
        localStorage.setItem('rohan_budget_data', JSON.stringify(budgetData));
        calculateAll();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index < leftInputs.length - 1) leftInputs[index + 1].focus();
            else lunchCost.focus();
        }
    });
});

lunchCost.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); dinnerCost.focus(); } });
dinnerCost.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); breakfastCost.focus(); } });
breakfastCost.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveAndCalculateFood(); breakfastCost.blur(); } });

function saveAndCalculateFood() {
    const currentDate = selectedDateInput.value;
    if (!currentDate) { alert('দয়া করে একটি তারিখ নির্বাচন করুন!'); return; }

    if (!foodHistory[currentDate]) foodHistory[currentDate] = { lunch: '', dinner: '', breakfast: '' };

    foodHistory[currentDate].lunch = lunchCost.value;
    foodHistory[currentDate].dinner = dinnerCost.value;
    foodHistory[currentDate].breakfast = breakfastCost.value;

    localStorage.setItem('rohan_food_history', JSON.stringify(foodHistory));
    calculateAll();

    const parts = currentDate.split('-');
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    saveStatusMsg.textContent = `✅ ${formatted} তারিখের হিসাব স্থায়ীভাবে সেভ হয়েছে!`;
    saveStatusMsg.classList.add('saved');
}

calcFoodBtn.addEventListener('click', saveAndCalculateFood);

function calculateAll() {
    const total = parseFloat(budgetData.total) || 0;
    const rent = parseFloat(budgetData.rent) || 0;
    const wifi = parseFloat(budgetData.wifi) || 0;
    const current = parseFloat(budgetData.current) || 0;
    const foodBudget = parseFloat(budgetData.foodBudget) || 0;
    const otherExpense = parseFloat(budgetData.otherExpense) || 0;

    let totalBreakfastAllDays = 0;
    Object.keys(foodHistory).forEach(date => {
        totalBreakfastAllDays += parseFloat(foodHistory[date].breakfast) || 0;
    });

    const totalDeducted = rent + wifi + current + foodBudget + otherExpense + totalBreakfastAllDays;
    const handRemaining = total - totalDeducted;

    outHandMoney.textContent = `৳ ${handRemaining}`;
    totalDeductedText.textContent = `মোট বাদ গেছে: ৳ ${totalDeducted}`;

    if (handRemaining < 0) handBox.classList.add('danger');
    else handBox.classList.remove('danger');

    let totalFoodSpentAllDays = 0;
    let daysRecordedCount = 0;

    Object.keys(foodHistory).forEach(date => {
        const l = parseFloat(foodHistory[date].lunch) || 0;
        const d = parseFloat(foodHistory[date].dinner) || 0;
        const dayTotal = l + d;
        if (dayTotal > 0) {
            totalFoodSpentAllDays += dayTotal;
            daysRecordedCount++;
        }
    });

    const foodRemaining = foodBudget - totalFoodSpentAllDays;
    const effectiveDays = daysRecordedCount > 0 ? daysRecordedCount : 1;
    const dailyAvg = Math.round(totalFoodSpentAllDays / effectiveDays);

    let daysLeft = 0;
    if (dailyAvg > 0 && foodRemaining > 0) daysLeft = (foodRemaining / dailyAvg).toFixed(1);
    else if (foodRemaining <= 0) daysLeft = 0;
    else daysLeft = '∞';

    fTotalBudget.textContent = `৳ ${foodBudget}`;
    fTotalSpent.textContent = `৳ ${totalFoodSpentAllDays}`;
    fRemaining.textContent = `৳ ${foodRemaining}`;
    fPredictionDays.textContent = `${daysLeft} দিন`;
    fDailyAvg.textContent = `৳ ${dailyAvg} / দিন`;

    if (foodRemaining < 0) fLeftCard.classList.add('over-budget');
    else fLeftCard.classList.remove('over-budget');
}

// ==========================================
// নতুন হিসাব শুরু ও ব্যাকআপ তৈরি করা
// ==========================================
tabNewBtn.addEventListener('click', () => {
    const defaultMonthName = new Date().toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
    const monthName = prompt('বর্তমান হিসাবটি পুরাতন হিসাবে সেভ রাখতে এই মাসের নাম লিখুন (যেমন: নভেম্বর ২০২৬):', defaultMonthName);
    
    if (monthName === null) return;

    const cleanName = monthName.trim() || defaultMonthName;

    // ১. ব্যাকআপ সেভ করা যাতে ভুল হলে ফিরিয়ে আনা যায়
    backupCurrentData = {
        budget: { ...budgetData },
        foods: JSON.parse(JSON.stringify(foodHistory))
    };
    localStorage.setItem('rohan_backup_current', JSON.stringify(backupCurrentData));

    // ২. আর্কাইভে সেভ করা
    archivedMonths[cleanName] = {
        savedAt: new Date().toLocaleDateString('bn-BD'),
        ...backupCurrentData
    };
    localStorage.setItem('rohan_archived_months', JSON.stringify(archivedMonths));

    // ৩. নতুন মাসের জন্য খালি করা
    budgetData = { total: '', rent: '', wifi: '', current: '', foodBudget: '', otherExpense: '' };
    foodHistory = {};

    localStorage.removeItem('rohan_budget_data');
    localStorage.removeItem('rohan_food_history');

    leftInputs.forEach(inp => inp.value = '');
    selectedDateInput.value = getLocalDateString();
    loadDateData(selectedDateInput.value);
    
    saveStatusMsg.textContent = `✅ "${cleanName}" পুরাতন হিসাবে সেভ হয়েছে!`;
    saveStatusMsg.classList.add('saved');
    
    checkResumeAvailability();
    tabCurrentBtn.click();
    calculateAll();
});

// ==========================================
// "পুরাতন হিসাব চালিয়ে যান" (আগের হিসাব ফিরিয়ে আনার লজিক)
// ==========================================
resumeOldBtn.addEventListener('click', () => {
    if (confirm('আপনি কি আপনার আগের রানিং হিসাবটি আবার ফিরিয়ে আনতে চান?')) {
        if (backupCurrentData) {
            budgetData = { ...backupCurrentData.budget };
            foodHistory = JSON.parse(JSON.stringify(backupCurrentData.foods));

            localStorage.setItem('rohan_budget_data', JSON.stringify(budgetData));
            localStorage.setItem('rohan_food_history', JSON.stringify(foodHistory));

            inTotal.value = budgetData.total || '';
            inRent.value = budgetData.rent || '';
            inWifi.value = budgetData.wifi || '';
            inCurrent.value = budgetData.current || '';
            inFoodBudget.value = budgetData.foodBudget || '';
            inOtherExpense.value = budgetData.otherExpense || '';

            loadDateData(selectedDateInput.value);
            calculateAll();
            alert('সফলভাবে আপনার আগের হিসাব ফিরিয়ে আনা হয়েছে!');
        }
    }
});

// ==========================================
// পুরাতন হিসাব ফিল্টার ও প্রদর্শনের লজিক
// ==========================================
const archiveMonthSelect = document.getElementById('archive-month-select');
const archiveStartDate = document.getElementById('archive-start-date');
const archiveEndDate = document.getElementById('archive-end-date');
const searchArchiveBtn = document.getElementById('search-archive-btn');
const archiveResultContainer = document.getElementById('archive-result-container');

function populateArchiveMonthDropdown() {
    archiveMonthSelect.innerHTML = '<option value="">-- মাস বেছে নিন --</option>';
    const months = Object.keys(archivedMonths);

    months.forEach(mName => {
        const opt = document.createElement('option');
        opt.value = mName;
        opt.textContent = mName;
        archiveMonthSelect.appendChild(opt);
    });
}

function searchArchiveData() {
    const selectedMonth = archiveMonthSelect.value;
    const sDate = archiveStartDate.value;
    const eDate = archiveEndDate.value;

    if (!selectedMonth && (!sDate || !eDate)) {
        alert('দয়া করে হয় একটি মাস সিলেক্ট করুন, অথবা নির্দিষ্ট তারিখের রেঞ্জ (শুরু ও শেষ তারিখ) দিন!');
        return;
    }

    let targetBudget = { total: 0, rent: 0, wifi: 0, current: 0, foodBudget: 0, otherExpense: 0 };
    let filteredFoods = {};

    if (selectedMonth && archivedMonths[selectedMonth]) {
        targetBudget = archivedMonths[selectedMonth].budget;
        filteredFoods = archivedMonths[selectedMonth].foods;
    }

    // যদি তারিখের রেঞ্জ দেওয়া থাকে, তবে ফিল্টার করবে
    if (sDate && eDate) {
        // যদি মাস সিলেক্ট না করা থাকে, তবে সব আর্কাইভ থেকে ওই তারিখের ডাটা খুঁজবে
        let poolFoods = {};
        if (selectedMonth && archivedMonths[selectedMonth]) {
            poolFoods = archivedMonths[selectedMonth].foods;
        } else {
            Object.keys(archivedMonths).forEach(m => {
                Object.assign(poolFoods, archivedMonths[m].foods);
            });
        }

        Object.keys(poolFoods).forEach(dKey => {
            if (dKey >= sDate && dKey <= eDate) {
                filteredFoods[dKey] = poolFoods[dKey];
            }
        });
    }

    renderArchiveResult(selectedMonth ? selectedMonth : `${sDate} হতে ${eDate}`, targetBudget, filteredFoods);
}

function renderArchiveResult(titleStr, bData, fData) {
    let totalLunchDinner = 0;
    let totalBreakfast = 0;
    let tableRowsHtml = '';

    const sortedDates = Object.keys(fData).sort();
    sortedDates.forEach(dateKey => {
        const l = parseFloat(fData[dateKey].lunch) || 0;
        const d = parseFloat(fData[dateKey].dinner) || 0;
        const br = parseFloat(fData[dateKey].breakfast) || 0;
        if (l > 0 || d > 0 || br > 0) {
            totalLunchDinner += (l + d);
            totalBreakfast += br;
            const p = dateKey.split('-');
            const fDate = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dateKey;
            tableRowsHtml += `
                <tr>
                    <td>${fDate}</td>
                    <td>৳ ${l}</td>
                    <td>৳ ${d}</td>
                    <td>৳ ${br}</td>
                    <td><strong>৳ ${l + d + br}</strong></td>
                </tr>
            `;
        }
    });

    const totalMoney = parseFloat(bData.total) || 0;
    const rent = parseFloat(bData.rent) || 0;
    const wifi = parseFloat(bData.wifi) || 0;
    const current = parseFloat(bData.current) || 0;
    const foodBudget = parseFloat(bData.foodBudget) || 0;
    const otherExp = parseFloat(bData.otherExpense) || 0;
    const handLeft = totalMoney - (rent + wifi + current + foodBudget + otherExp + totalBreakfast);
    const foodLeft = foodBudget - totalLunchDinner;

    archiveResultContainer.innerHTML = `
        <h3 style="color:#38bdf8; margin-bottom:12px;">📊 ফলাফল: ${titleStr}</h3>

        <div class="archive-grid">
            <div class="arc-stat"><span>মোট টাকা</span><h4>৳ ${totalMoney}</h4></div>
            <div class="arc-stat"><span>বাসা ভাড়া</span><h4>৳ ${rent}</h4></div>
            <div class="arc-stat"><span>WiFi ও কারেন্ট</span><h4>৳ ${wifi + current}</h4></div>
            <div class="arc-stat"><span>অন্যান্য খরচ</span><h4>৳ ${otherExp}</h4></div>
            <div class="arc-stat"><span>খাবারের বাজেট</span><h4>৳ ${foodBudget}</h4></div>
            <div class="arc-stat" style="border-color:#f59e0b;"><span>খাবারে মোট খরচ</span><h4>৳ ${totalLunchDinner}</h4></div>
            <div class="arc-stat" style="border-color:#22c55e;"><span>খাবারের বাকি ছিল</span><h4>৳ ${foodLeft}</h4></div>
            <div class="arc-stat" style="border-color:#ec4899;"><span>নাস্তা/অন্যান্য খরচ</span><h4>৳ ${totalBreakfast}</h4></div>
            <div class="arc-stat" style="border-color:#10b981;"><span>হাতে অবশিষ্ট ছিল</span><h4>৳ ${handLeft}</h4></div>
        </div>

        <h4 style="color:#cbd5e1; margin-top:16px; margin-bottom:8px;">🍛 নির্দিষ্ট সময়ের খরচের বিস্তারিত তালিকা:</h4>
        ${tableRowsHtml ? `
            <div style="overflow-x:auto;">
                <table class="archive-daily-table">
                    <thead>
                        <tr>
                            <th>তারিখ</th>
                            <th>দুপুর</th>
                            <th>রাত</th>
                            <th>নাস্তা/অন্যান্য</th>
                            <th>মোট</th>
                        </tr>
                    </thead>
                    <tbody>${tableRowsHtml}</tbody>
                </table>
            </div>
        ` : '<p style="color:#94a3b8; font-size:0.9rem;">এই সময়ের মধ্যে কোনো খাবারের খরচ এন্ট্রি করা হয়নি।</p>'}
    `;
}

searchArchiveBtn.addEventListener('click', searchArchiveData);

// পেজ ওপেন হলেই হিসাব দেখানো
calculateAll();