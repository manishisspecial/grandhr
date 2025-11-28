import { jsPDF } from 'jspdf';

// Make jsPDF available globally immediately
if (typeof window !== 'undefined') {
    window.jspdf = { jsPDF };
    console.log('jsPDF loaded and available on window');
}

// Company Management
let companies = [];
let currentCompany = null;

// Setup event listeners for automatic calculations
function setupCalculationListeners() {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
        const basicInput = document.getElementById('basicSalary');
        const specialAllowanceInput = document.getElementById('specialAllowance');
        
        if (basicInput) {
            basicInput.addEventListener('input', calculateHRA);
            basicInput.addEventListener('change', calculateHRA);
            basicInput.addEventListener('keyup', calculateHRA);
            basicInput.addEventListener('paste', () => setTimeout(calculateHRA, 10));
        }
        
        if (specialAllowanceInput) {
            specialAllowanceInput.addEventListener('input', calculateTotals);
            specialAllowanceInput.addEventListener('change', calculateTotals);
            specialAllowanceInput.addEventListener('keyup', calculateTotals);
            specialAllowanceInput.addEventListener('paste', () => setTimeout(calculateTotals, 10));
        }
    }, 100);
}

window.addEventListener('DOMContentLoaded', () => {
    loadCompaniesFromStorage();
    populateCompanySelect();
    setDefaultDates();
    
    // Set up event listeners for automatic calculations
    setupCalculationListeners();
    
    // Ensure all functions are available on window (re-assign to be sure)
    if (typeof window !== 'undefined') {
        window.calculateHRA = calculateHRA;
        window.calculateTotals = calculateTotals;
        window.generateSalarySlip = generateSalarySlip;
        window.previewSalarySlip = previewSalarySlip;
        window.clearForm = clearForm;
        window.downloadPDF = downloadPDF;
        window.closePreview = closePreview;
        window.showCompanyManager = showCompanyManager;
        window.closeCompanyManager = closeCompanyManager;
        window.saveCompany = saveCompany;
        window.cancelCompanyForm = cancelCompanyForm;
        window.loadCompanyTemplate = loadCompanyTemplate;
        window.editCompany = editCompany;
        window.deleteCompany = deleteCompany;
        window.handleLogoUpload = handleLogoUpload;
        window.removeLogo = removeLogo;
        if (typeof updateAmountInWords !== 'undefined') {
            window.updateAmountInWords = updateAmountInWords;
        }
    }
    
    // Initial calculations after a short delay to ensure all elements are ready
    setTimeout(() => {
        calculateHRA();
        calculateTotals();
    }, 200);
    
    // Debug: Check if functions are available
    console.log('Salary slip generator initialized. Functions available:', {
        generateSalarySlip: typeof window.generateSalarySlip,
        downloadPDF: typeof window.downloadPDF,
        previewSalarySlip: typeof window.previewSalarySlip,
        jsPDF: typeof window.jspdf
    });
});

function setDefaultDates() {
    const today = new Date();
    const payDate = document.getElementById('payDate');
    const payMonth = document.getElementById('payMonth');
    const payYear = document.getElementById('payYear');
    
    if (payDate && !payDate.value) {
        payDate.value = today.toISOString().split('T')[0];
    }
    
    if (payMonth) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        payMonth.value = monthNames[today.getMonth()];
    }
    
    if (payYear) {
        // Populate year dropdown with current year and 5 years back
        const currentYear = today.getFullYear();
        payYear.innerHTML = '';
        for (let i = 0; i <= 5; i++) {
            const year = currentYear - i;
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (i === 0) {
                option.selected = true;
            }
            payYear.appendChild(option);
        }
    }
}

function loadCompaniesFromStorage() {
    const stored = localStorage.getItem('salarySlipCompanies');
    if (stored) {
        companies = JSON.parse(stored);
    } else {
        // Add Abheepay as default company
        companies = [{
            name: 'Abheepay',
            address: 'Plot No-3, 2nd Floor, kh no.33/6 Amberhai, Sector-19, Dwarka, New Delhi-110075',
            email: '',
            phone: '',
            logo: 'Abheepay',
            logoImage: null
        }];
        saveCompaniesToStorage();
    }
}

function saveCompaniesToStorage() {
    localStorage.setItem('salarySlipCompanies', JSON.stringify(companies));
}

function populateCompanySelect() {
    const select = document.getElementById('companySelect');
    if (!select) return;
    
    while (select.options.length > 2) {
        select.remove(2);
    }
    
    companies.forEach((company, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = company.name;
        select.appendChild(option);
    });
}

function loadCompanyTemplate() {
    const select = document.getElementById('companySelect');
    const value = select.value;
    
    if (value === 'new') {
        showCompanyForm(true); // true = clear fields for new company
    } else if (value !== '') {
        currentCompany = companies[parseInt(value)];
        showCompanyForm(false); // false = don't clear, we'll fill with existing data
        fillCompanyFields(currentCompany);
    } else {
        // Hide form when no company is selected
        document.getElementById('companyForm').classList.add('hidden');
    }
}

function showCompanyForm(clearFields = true) {
    document.getElementById('companyForm').classList.remove('hidden');
    if (clearFields) {
        clearCompanyFields();
    }
}

function cancelCompanyForm() {
    document.getElementById('companyForm').classList.add('hidden');
    document.getElementById('companySelect').value = '';
    clearCompanyFields();
}

let currentLogoBase64 = null;

function clearCompanyFields() {
    document.getElementById('companyName').value = '';
    document.getElementById('companyAddress').value = '';
    document.getElementById('companyEmail').value = '';
    document.getElementById('companyPhone').value = '';
    document.getElementById('companyLogoUpload').value = '';
    currentLogoBase64 = null;
    document.getElementById('logoPreview').classList.add('hidden');
    document.getElementById('logoPreviewImg').src = '';
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        removeLogo();
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        event.target.value = '';
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        currentLogoBase64 = e.target.result;
        document.getElementById('logoPreviewImg').src = currentLogoBase64;
        document.getElementById('logoPreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    currentLogoBase64 = null;
    document.getElementById('companyLogoUpload').value = '';
    document.getElementById('logoPreview').classList.add('hidden');
    document.getElementById('logoPreviewImg').src = '';
}

function fillCompanyFields(company) {
    if (!company) return;
    document.getElementById('companyName').value = company.name || '';
    document.getElementById('companyAddress').value = company.address || '';
    document.getElementById('companyEmail').value = company.email || '';
    document.getElementById('companyPhone').value = company.phone || '';
    
    // Handle logo (can be base64 image or text)
    if (company.logoImage) {
        currentLogoBase64 = company.logoImage;
        document.getElementById('logoPreviewImg').src = currentLogoBase64;
        document.getElementById('logoPreview').classList.remove('hidden');
    } else if (company.logo) {
        // Legacy text logo
        currentLogoBase64 = null;
        document.getElementById('logoPreview').classList.add('hidden');
    } else {
        currentLogoBase64 = null;
        document.getElementById('logoPreview').classList.add('hidden');
    }
    document.getElementById('companyLogoUpload').value = '';
}

function saveCompany() {
    const name = document.getElementById('companyName').value.trim();
    if (!name) {
        alert('Please enter company name');
        return;
    }
    
    const company = {
        name: name,
        address: document.getElementById('companyAddress').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        phone: document.getElementById('companyPhone').value.trim(),
        logo: name.substring(0, 8).toUpperCase(), // Fallback text logo
        logoImage: currentLogoBase64 // Base64 image if uploaded
    };
    
    const select = document.getElementById('companySelect');
    const selectedIndex = select.value;
    
    if (selectedIndex !== 'new' && selectedIndex !== '') {
        companies[parseInt(selectedIndex)] = company;
    } else {
        companies.push(company);
    }
    
    saveCompaniesToStorage();
    populateCompanySelect();
    document.getElementById('companyForm').classList.add('hidden');
    select.value = companies.length - 1;
    currentCompany = company;
    fillCompanyFields(company);
    
    alert('Company saved successfully!');
}

function showCompanyManager() {
    const modal = document.getElementById('companyManagerModal');
    const list = document.getElementById('companyList');
    
    list.innerHTML = '';
    
    if (companies.length === 0) {
        list.innerHTML = '<p class="text-gray-600">No companies added yet. Add a new company to get started.</p>';
    } else {
        companies.forEach((company, index) => {
            const item = document.createElement('div');
            item.className = 'p-4 mb-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3';
            item.innerHTML = `
                <div class="flex-1">
                    <div class="font-semibold text-primary-600 mb-1">${company.name}</div>
                    <div class="text-sm text-gray-600">${company.address || 'No address'}</div>
                </div>
                <div class="flex gap-2">
                    <button class="btn-secondary text-sm px-4 py-2" onclick="editCompany(${index})">Edit</button>
                    <button class="btn-secondary text-sm px-4 py-2" onclick="deleteCompany(${index})">Delete</button>
                </div>
            `;
            list.appendChild(item);
        });
    }
    
    modal.classList.remove('hidden');
}

function closeCompanyManager() {
    document.getElementById('companyManagerModal').classList.add('hidden');
}

function editCompany(index) {
    const company = companies[index];
    document.getElementById('companySelect').value = index;
    currentCompany = company;
    fillCompanyFields(company);
    showCompanyForm();
    closeCompanyManager();
}

function deleteCompany(index) {
    if (confirm('Are you sure you want to delete this company?')) {
        companies.splice(index, 1);
        saveCompaniesToStorage();
        populateCompanySelect();
        showCompanyManager();
    }
}

// Calculate HRA as 50% of Basic, Other Allowance as HRA - 2000, PF as 12% of Basic, PF Employer Share as 13% of Basic
function calculateHRA() {
    const basicInput = document.getElementById('basicSalary');
    const hraInput = document.getElementById('hra');
    const otherAllowanceInput = document.getElementById('otherAllowance');
    const providentFundInput = document.getElementById('providentFund');
    const pfEmployerShareInput = document.getElementById('pfEmployerShare');
    
    if (!basicInput) return;
    
    const basic = parseFloat(basicInput.value) || 0;
    const hra = basic * 0.5;
    
    // Update HRA field
    if (hraInput) {
        hraInput.value = hra.toFixed(2);
    }
    
    // Calculate Other Allowance as HRA - 2000
    if (otherAllowanceInput) {
        const otherAllowance = Math.max(0, hra - 2000); // Ensure it doesn't go negative
        otherAllowanceInput.value = otherAllowance.toFixed(2);
    }
    
    // Calculate Provident Fund as 12% of Basic
    if (providentFundInput) {
        const pf = basic * 0.12;
        providentFundInput.value = pf.toFixed(2);
    }
    
    // Calculate PF Employer Share as 13% of Basic
    if (pfEmployerShareInput) {
        const pfEmployerShare = basic * 0.13;
        pfEmployerShareInput.value = pfEmployerShare.toFixed(2);
    }
    
    // Trigger gross earnings and deductions calculation after all fields are updated
    setTimeout(() => {
        calculateTotals();
    }, 0);
}

// Salary Calculations
function calculateTotals() {
    // Get all earning components
    const basicInput = document.getElementById('basicSalary');
    const hraInput = document.getElementById('hra');
    const otherAllowanceInput = document.getElementById('otherAllowance');
    const specialAllowanceInput = document.getElementById('specialAllowance');
    
    const basic = parseFloat(basicInput?.value) || 0;
    const hra = parseFloat(hraInput?.value) || 0;
    const otherAllowance = parseFloat(otherAllowanceInput?.value) || 0;
    const specialAllowance = parseFloat(specialAllowanceInput?.value) || 0;
    
    // Calculate Gross Earnings
    const grossEarnings = basic + hra + otherAllowance + specialAllowance;
    const grossEarningsInput = document.getElementById('grossEarnings');
    if (grossEarningsInput) {
        grossEarningsInput.value = grossEarnings.toFixed(2);
    }
    
    // Get deduction components
    const providentFundInput = document.getElementById('providentFund');
    const pfEmployerShareInput = document.getElementById('pfEmployerShare');
    
    const pf = parseFloat(providentFundInput?.value) || 0;
    const pfEmployerShare = parseFloat(pfEmployerShareInput?.value) || 0;
    
    // Calculate Total Deductions
    const totalDeductions = pf + pfEmployerShare;
    const totalDeductionsInput = document.getElementById('totalDeductions');
    if (totalDeductionsInput) {
        totalDeductionsInput.value = totalDeductions.toFixed(2);
    }
    
    // Calculate Net Payable
    const netPayable = grossEarnings - totalDeductions;
    const netPayableInput = document.getElementById('netPayable');
    if (netPayableInput) {
        netPayableInput.value = netPayable.toFixed(2);
    }
    
    // Update amount in words
    updateAmountInWords(netPayable);
}

// Update amount in words display
function updateAmountInWords(amount) {
    const wordsElement = document.getElementById('amountInWords');
    if (wordsElement && amount > 0) {
        const words = numberToWords(amount);
        wordsElement.innerHTML = `<span class="text-base">Rupees ${words}</span>`;
    } else if (wordsElement) {
        wordsElement.innerHTML = '<span class="text-sm">Enter salary details to see amount in words</span>';
    }
}

// Number to Words Converter
function numberToWords(amount) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
                  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
                  'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (amount === 0) return 'Zero';
    
    const num = Math.floor(amount);
    const paise = Math.round((amount - num) * 100);
    
    function convertHundreds(n) {
        let result = '';
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            result += ones[n] + ' ';
        }
        return result.trim();
    }
    
    function convert(n) {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return convertHundreds(n);
        if (n < 100000) {
            const thousands = Math.floor(n / 1000);
            const remainder = n % 1000;
            return convert(thousands) + ' Thousand ' + (remainder > 0 ? convert(remainder) : '');
        }
        if (n < 10000000) {
            const lakhs = Math.floor(n / 100000);
            const remainder = n % 100000;
            return convert(lakhs) + ' Lakh' + (lakhs > 1 ? 's' : '') + ' ' + (remainder > 0 ? convert(remainder) : '');
        }
        const crores = Math.floor(n / 10000000);
        const remainder = n % 10000000;
        return convert(crores) + ' Crore' + (crores > 1 ? 's' : '') + ' ' + (remainder > 0 ? convert(remainder) : '');
    }
    
    let words = convert(num);
    if (paise > 0) {
        words += ' and ' + convert(paise) + ' Paise';
    }
    return words + ' Only';
}

function formatCurrency(amount) {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = date.getFullYear();
    return `${String(day).padStart(2, '0')}-${monthNames[date.getMonth()]}-${String(year).slice(-2)}`;
}

function getFormData() {
    let company = currentCompany;
    if (!company) {
        company = {
            name: document.getElementById('companyName').value.trim(),
            address: document.getElementById('companyAddress').value.trim(),
            email: document.getElementById('companyEmail').value.trim(),
            phone: document.getElementById('companyPhone').value.trim(),
            logo: document.getElementById('companyLogo').value.trim()
        };
    }
    
    // Ensure company has logo data
    if (!company.logoImage && !company.logo) {
        company.logo = company.name.substring(0, 8).toUpperCase();
    }
    
    return {
        company: company,
        employee: {
            name: document.getElementById('employeeName').value.trim(),
            id: document.getElementById('employeeId').value.trim(),
            designation: document.getElementById('designation').value.trim(),
            dateOfJoining: document.getElementById('dateOfJoining').value,
            pan: document.getElementById('pan').value.trim().toUpperCase(),
            uan: document.getElementById('uan').value.trim(),
            bankName: document.getElementById('bankName').value.trim(),
            accountNumber: document.getElementById('accountNumber').value.trim(),
            ifscCode: document.getElementById('ifscCode').value.trim()
        },
        period: {
            payMonth: document.getElementById('payMonth').value,
            payYear: document.getElementById('payYear').value,
            payPeriod: `${document.getElementById('payMonth').value} ${document.getElementById('payYear').value}`,
            payDate: document.getElementById('payDate').value,
            paidDays: parseInt(document.getElementById('paidDays').value) || 31,
            lopDays: parseInt(document.getElementById('lopDays').value) || 0
        },
        earnings: {
            basic: parseFloat(document.getElementById('basicSalary').value) || 0,
            hra: parseFloat(document.getElementById('hra').value) || 0,
            otherAllowance: parseFloat(document.getElementById('otherAllowance').value) || 0,
            specialAllowance: parseFloat(document.getElementById('specialAllowance').value) || 0,
            gross: parseFloat(document.getElementById('grossEarnings').value) || 0
        },
        deductions: {
            pf: parseFloat(document.getElementById('providentFund').value) || 0,
            pfEmployerShare: parseFloat(document.getElementById('pfEmployerShare').value) || 0,
            total: parseFloat(document.getElementById('totalDeductions').value) || 0
        },
        netPayable: parseFloat(document.getElementById('netPayable').value) || 0
    };
}

function generateSalarySlipHTML(data) {
    const payDateFormatted = data.period.payDate ? formatDate(data.period.payDate) : '';
    
    return `
        <div class="space-y-6 text-sm">
            <!-- Company Header -->
            <div class="text-center pb-4 border-b-2 border-gray-800">
                ${data.company.logoImage ? 
                    `<div class="mb-3"><img src="${data.company.logoImage}" alt="Company Logo" class="max-h-16 mx-auto"></div>` : 
                    `<div class="text-2xl font-bold text-primary-600 mb-2">${data.company.logo || data.company.name || 'Company Name'}</div>`
                }
                <div class="text-2xl font-bold text-primary-600 mb-2">${data.company.name || 'Company Name'}</div>
                ${data.company.address ? `<div class="text-sm text-gray-700">${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
            </div>
            
            <!-- Employee Summary Section -->
            <div class="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
                <div class="font-bold text-lg mb-4 text-center uppercase">EMPLOYEE SUMMARY</div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div class="font-semibold mb-1">Employee Name</div>
                        <div class="text-gray-700">${data.employee.name || 'N/A'}</div>
                    </div>
                    <div>
                        <div class="font-semibold mb-1">Employee ID</div>
                        <div class="text-gray-700">${data.employee.id || 'N/A'}</div>
                    </div>
                    <div>
                        <div class="font-semibold mb-1">UAN Number</div>
                        <div class="text-gray-700">${data.employee.uan || 'N/A'}</div>
                    </div>
                    <div>
                        <div class="font-semibold mb-1">Pay Period</div>
                        <div class="text-gray-700">${data.period.payPeriod || 'N/A'}</div>
                    </div>
                    <div>
                        <div class="font-semibold mb-1">Pay Date</div>
                        <div class="text-gray-700">${payDateFormatted || 'N/A'}</div>
                    </div>
                    <div>
                        <div class="font-semibold mb-1">Total Net Pay</div>
                        <div class="text-lg font-bold text-green-700">${formatCurrency(data.netPayable)}</div>
                    </div>
                    <div>
                        <div class="font-semibold mb-1">Paid Days</div>
                        <div class="text-gray-700">${data.period.paidDays || 0}</div>
                    </div>
                    <div>
                        <div class="font-semibold mb-1">LOP Days</div>
                        <div class="text-gray-700">${data.period.lopDays || 0}</div>
                    </div>
                </div>
            </div>
            
            <!-- Earnings Section -->
            <div>
                <div class="font-bold text-lg mb-3 uppercase">EARNINGS</div>
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-primary-500 text-white">
                            <th class="p-3 text-left border border-gray-300">Description</th>
                            <th class="p-3 text-right border border-gray-300">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="p-3 border border-gray-300">Basic</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.basic)}</td>
                        </tr>
                        <tr>
                            <td class="p-3 border border-gray-300">House Rent Allowance</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.hra)}</td>
                        </tr>
                        <tr>
                            <td class="p-3 border border-gray-300">Other Allowance</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.otherAllowance)}</td>
                        </tr>
                        <tr>
                            <td class="p-3 border border-gray-300">Special Allowance</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.specialAllowance)}</td>
                        </tr>
                        <tr class="bg-gray-100 font-bold">
                            <td class="p-3 border border-gray-300">Gross Earnings</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.earnings.gross)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Deductions Section -->
            <div>
                <div class="font-bold text-lg mb-3 uppercase">DEDUCTIONS</div>
                <table class="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr class="bg-primary-500 text-white">
                            <th class="p-3 text-left border border-gray-300">Description</th>
                            <th class="p-3 text-right border border-gray-300">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="p-3 border border-gray-300">Provident Fund</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.deductions.pf)}</td>
                        </tr>
                        <tr>
                            <td class="p-3 border border-gray-300">PF Employer Share</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.deductions.pfEmployerShare)}</td>
                        </tr>
                        <tr class="bg-gray-100 font-bold">
                            <td class="p-3 border border-gray-300">Total Deductions</td>
                            <td class="p-3 text-right font-mono border border-gray-300">${formatCurrency(data.deductions.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Net Payable Section -->
            <div class="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                        <div class="font-bold text-lg mb-2">TOTAL NET PAYABLE</div>
                        <div class="text-2xl font-bold text-green-700 font-mono mb-2">${formatCurrency(data.netPayable)}</div>
                        <div class="text-sm italic text-green-800 font-semibold">
                            Rupees ${numberToWords(data.netPayable)}
                        </div>
                    </div>
                    <div class="text-sm space-y-1">
                        <div class="flex justify-between">
                            <span>Gross Earnings:</span>
                            <span class="font-mono">${formatCurrency(data.earnings.gross)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>- Total Deductions:</span>
                            <span class="font-mono">${formatCurrency(data.deductions.total)}</span>
                        </div>
                        <div class="flex justify-between border-t-2 border-green-400 pt-1 font-bold">
                            <span>= Total Net Payable:</span>
                            <span class="font-mono text-green-700">${formatCurrency(data.netPayable)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function previewSalarySlip() {
    console.log('previewSalarySlip called');
    try {
        const data = getFormData();
        
        if (!data.company.name) {
            alert('Please select or add a company');
            return;
        }
        if (!data.employee.name) {
            alert('Please enter employee name');
            return;
        }
        if (!data.employee.designation) {
            alert('Please enter designation');
            return;
        }
        if (data.earnings.gross === 0) {
            alert('Please enter salary details');
            return;
        }
        
        const html = generateSalarySlipHTML(data);
        const previewContent = document.getElementById('previewContent');
        const previewSection = document.getElementById('previewSection');
        
        if (!previewContent || !previewSection) {
            alert('Preview section not found. Please refresh the page.');
            return;
        }
        
        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
        const emptyPreview = document.getElementById('emptyPreview');
        if (emptyPreview) {
            emptyPreview.classList.add('hidden');
        }
        previewSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error in previewSalarySlip:', error);
        alert('Error generating preview: ' + error.message);
    }
}

// Make available immediately
if (typeof window !== 'undefined') {
    window.previewSalarySlip = previewSalarySlip;
}

function closePreview() {
    const previewSection = document.getElementById('previewSection');
    const emptyPreview = document.getElementById('emptyPreview');
    if (previewSection) {
        previewSection.classList.add('hidden');
    }
    if (emptyPreview) {
        emptyPreview.classList.remove('hidden');
    }
}

function generateSalarySlip() {
    console.log('generateSalarySlip called');
    try {
        if (typeof previewSalarySlip !== 'function') {
            alert('Preview function not available. Please refresh the page.');
            return;
        }
        previewSalarySlip();
        setTimeout(() => {
            if (typeof downloadPDF !== 'function') {
                alert('Download function not available. Please refresh the page.');
                return;
            }
            downloadPDF();
        }, 500);
    } catch (error) {
        console.error('Error generating salary slip:', error);
        alert('Error generating salary slip: ' + error.message);
    }
}

// Make available immediately
if (typeof window !== 'undefined') {
    window.generateSalarySlip = generateSalarySlip;
}

function downloadPDF() {
    console.log('downloadPDF called');
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF library not loaded. Please refresh the page.');
            console.error('jsPDF not available', { jspdf: window.jspdf });
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
    
    const data = getFormData();
    const margin = 15;
    const borderMargin = 10; // Border will be 10mm from page edges
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 7;
    
    // Draw border around entire salary slip
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(borderMargin, borderMargin, pageWidth - (borderMargin * 2), pageHeight - (borderMargin * 2));
    
    function addText(text, fontSize = 12, isBold = false, align = 'left', x = margin) {
        // Validate and sanitize inputs
        if (text === null || text === undefined) {
            text = '';
        }
        text = String(text);
        fontSize = Math.max(1, Math.min(72, Number(fontSize) || 12));
        x = Math.max(0, Number(x) || margin);
        align = ['left', 'center', 'right'].includes(align) ? align : 'left';
        
        // Skip if text is empty
        if (!text || text.trim().length === 0) {
            return;
        }
        
        try {
            doc.setFontSize(fontSize);
            doc.setFont('times', isBold ? 'bold' : 'normal');
            
            const lines = doc.splitTextToSize(text, contentWidth);
            
            if (yPos + (lines.length * lineHeight) > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            
            lines.forEach(line => {
                if (line && typeof line === 'string' && line.trim().length > 0) {
                    // For center alignment, x should be the center point
                    // For right alignment, x should be the right edge
                    // For left alignment, x is the left edge
                    let textX = x;
                    if (align === 'center') {
                        textX = pageWidth / 2;
                    } else if (align === 'right') {
                        textX = pageWidth - margin;
                    }
                    
                    // Ensure textX and yPos are valid numbers
                    textX = Number(textX);
                    const currentY = Number(yPos);
                    
                    if (isNaN(textX) || isNaN(currentY)) {
                        console.error('Invalid coordinates:', { textX, currentY, line });
                        return;
                    }
                    
                    doc.text(line, textX, currentY, { align: align });
                }
                yPos += lineHeight;
            });
        } catch (error) {
            console.error('Error in addText:', error, { text, fontSize, align, x });
            // Continue execution even if one text fails
        }
    }
    
    // Company Header with Logo - Positioned at top left
    let logoAdded = false;
    if (data.company.logoImage && typeof data.company.logoImage === 'string' && data.company.logoImage.length > 0) {
        try {
            // Validate logo image data URL
            if (!data.company.logoImage.startsWith('data:image/')) {
                throw new Error('Invalid image format');
            }
            
            // Add logo image to PDF at top left - smaller size
            const logoHeight = 15; // mm
            const logoWidth = 30; // mm
            const logoX = margin; // Left aligned
            const logoY = margin; // Top aligned
            
            // Extract image format from data URL
            let imgFormat = 'PNG';
            if (data.company.logoImage.includes('data:image/jpeg') || data.company.logoImage.includes('data:image/jpg')) {
                imgFormat = 'JPEG';
            } else if (data.company.logoImage.includes('data:image/png')) {
                imgFormat = 'PNG';
            } else {
                const formatMatch = data.company.logoImage.match(/data:image\/(\w+);/);
                if (formatMatch && formatMatch[1]) {
                    imgFormat = formatMatch[1].toUpperCase();
                }
            }
            
            const validFormats = ['PNG', 'JPEG', 'JPG'];
            if (!validFormats.includes(imgFormat)) {
                imgFormat = 'PNG';
            }
            
            const finalLogoX = Number(logoX) || margin;
            const finalLogoY = Number(logoY) || margin;
            const finalLogoWidth = Number(logoWidth) || 30;
            const finalLogoHeight = Number(logoHeight) || 15;
            
            try {
                doc.addImage(
                    data.company.logoImage, 
                    imgFormat, 
                    finalLogoX, 
                    finalLogoY, 
                    finalLogoWidth, 
                    finalLogoHeight
                );
                logoAdded = true;
            } catch (addImageError) {
                try {
                    doc.addImage(
                        data.company.logoImage, 
                        finalLogoX, 
                        finalLogoY, 
                        finalLogoWidth, 
                        finalLogoHeight
                    );
                    logoAdded = true;
                } catch (addImageError2) {
                    console.error('Failed to add logo:', addImageError2);
                }
            }
        } catch (e) {
            console.error('Error adding logo to PDF:', e);
        }
    }
    
    // Company Name and Address - Positioned parallel to logo (same Y position)
    const companyNameY = logoAdded ? margin + 5 : margin + 5;
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    const companyNameText = data.company.name || 'Company Name';
    const companyNameX = logoAdded ? margin + 35 : pageWidth / 2;
    doc.text(companyNameText, companyNameX, companyNameY, { align: logoAdded ? 'left' : 'center' });
    
    if (data.company.address) {
        doc.setFontSize(9);
        doc.setFont('times', 'normal');
        const addressY = companyNameY + 6;
        const addressLines = doc.splitTextToSize(data.company.address, logoAdded ? contentWidth - 35 : contentWidth);
        addressLines.forEach((line, index) => {
            doc.text(line, companyNameX, addressY + (index * 5), { align: logoAdded ? 'left' : 'center' });
        });
        yPos = Math.max(logoAdded ? margin + 15 : addressY + (addressLines.length * 5), addressY + (addressLines.length * 5)) + 3;
    } else {
        yPos = Math.max(logoAdded ? margin + 15 : companyNameY + 10, companyNameY + 10);
    }
    
    // Draw separator line
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    // Employee Summary Section - Match preview layout (2x4 grid)
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('EMPLOYEE SUMMARY', pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;
    
    // Draw background box for employee summary - adjusted for horizontal layout
    const summaryBoxHeight = 45; // Reduced height since labels and values are side by side
    const summaryBoxY = yPos;
    
    // Draw filled background box first
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, summaryBoxY, contentWidth, summaryBoxHeight, 'F');
    
    // Draw border
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, summaryBoxY, contentWidth, summaryBoxHeight, 'S');
    
    // Prepare summary data
    const summaryData = [
        ['Employee Name', data.employee.name || 'N/A'],
        ['Employee ID', data.employee.id || 'N/A'],
        ['UAN Number', data.employee.uan || 'N/A'],
        ['Pay Period', data.period.payPeriod || 'N/A'],
        ['Pay Date', data.period.payDate ? formatDate(data.period.payDate) : 'N/A'],
        ['Total Net Pay', formatCurrency(data.netPayable)],
        ['Paid Days', (data.period.paidDays || 0).toString()],
        ['LOP Days', (data.period.lopDays || 0).toString()]
    ];
    
    // Create 2x4 grid layout - horizontal alignment
    const colWidth = Number((contentWidth - 20) / 2);
    const rowHeight = 10; // Reduced since labels and values are on same line
    const startX1 = Number(margin + 10);
    const startX2 = Number(margin + 10 + colWidth + 10);
    const startY = Number(summaryBoxY + 8); // Reduced top padding
    
    // Validate calculated coordinates
    if (isNaN(startX1) || isNaN(startX2) || isNaN(startY) || isNaN(colWidth) || isNaN(rowHeight)) {
        console.error('Invalid calculated coordinates:', { startX1, startX2, startY, colWidth, rowHeight, margin, contentWidth, summaryBoxY });
    }
    
    // Draw text on top of the box - left-right alignment (label: value)
    summaryData.forEach(([label, value], index) => {
        const isNetPay = label === 'Total Net Pay';
        const row = Math.floor(index / 2);
        const col = index % 2;
        
        // Calculate positions - same Y for label and value (side by side)
        const xLabel = col === 0 ? startX1 : startX2;
        const xValue = xLabel + 50; // Value starts 50mm to the right of label
        const yPos = startY + (row * rowHeight);
        
        // Sanitize and validate text
        const labelText = String(label || '').replace(/[^\x20-\x7E]/g, '').trim();
        const valueText = String(value || 'N/A').replace(/[^\x20-\x7E]/g, '').trim();
        
        // Validate coordinates are numbers
        const xL = parseFloat(xLabel);
        const xV = parseFloat(xValue);
        const y = parseFloat(yPos);
        
        if (!isFinite(xL) || !isFinite(xV) || !isFinite(y)) {
            return; // Skip if coordinates are invalid
        }
        
        // Draw label and value side by side
        if (labelText) {
            doc.setFont('times', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(labelText + ':', xL, y);
        }
        
        // Draw value next to label
        if (valueText) {
            doc.setFont('times', isNetPay ? 'bold' : 'normal');
            doc.setFontSize(isNetPay ? 10 : 9);
            if (isNetPay) {
                doc.setTextColor(46, 125, 50);
            } else {
                doc.setTextColor(0, 0, 0);
            }
            doc.text(valueText, xV, y);
        }
        
        // Reset
        doc.setTextColor(0, 0, 0);
    });
    
    yPos = summaryBoxY + summaryBoxHeight + 8;
    
    // Earnings Section - Table format matching preview
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('EARNINGS', margin, yPos);
    yPos += 6;
    
    const earnings = [
        ['Basic', formatCurrency(data.earnings.basic)],
        ['House Rent Allowance', formatCurrency(data.earnings.hra)],
        ['Other Allowance', formatCurrency(data.earnings.otherAllowance)],
        ['Special Allowance', formatCurrency(data.earnings.specialAllowance)],
        ['Gross Earnings', formatCurrency(data.earnings.gross)]
    ];
    
    // Draw table header
    const tableStartY = yPos;
    doc.setFillColor(79, 70, 229); // primary-500 color
    doc.rect(margin, tableStartY - 5, contentWidth, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Description', margin + 3, tableStartY);
    doc.text('Amount (₹)', pageWidth - margin - 3, tableStartY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos = tableStartY + 8;
    
    // Draw table rows
    earnings.forEach(([label, amount], index) => {
        try {
            const isBold = index === earnings.length - 1;
            const rowY = yPos;
            
            // Draw row background if it's the last row (Gross Earnings)
            if (isBold) {
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, rowY - 4, contentWidth, 8, 'F');
            }
            
            // Draw borders
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, rowY - 4, pageWidth - margin, rowY - 4); // top border
            doc.line(margin, rowY + 4, pageWidth - margin, rowY + 4); // bottom border
            doc.line(margin, rowY - 4, margin, rowY + 4); // left border
            doc.line(pageWidth - margin, rowY - 4, pageWidth - margin, rowY + 4); // right border
            doc.line(margin + contentWidth * 0.6, rowY - 4, margin + contentWidth * 0.6, rowY + 4); // middle border
            
            // Label
            doc.setFont('times', isBold ? 'bold' : 'normal');
            doc.setFontSize(9);
            doc.text(String(label || ''), margin + 3, rowY);
            
            // Amount
            doc.text(String(amount || '0.00'), pageWidth - margin - 3, rowY, { align: 'right' });
            
            yPos += 8;
        } catch (error) {
            console.error('Error adding earnings row:', error, { label, amount, index });
        }
    });
    
    yPos += 8; // Add padding below EARNINGS section
    
    // Deductions Section - Table format matching preview
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('DEDUCTIONS', margin, yPos);
    yPos += 6;
    
    const deductions = [
        ['Provident Fund', formatCurrency(data.deductions.pf)],
        ['PF Employer Share', formatCurrency(data.deductions.pfEmployerShare)],
        ['Total Deductions', formatCurrency(data.deductions.total)]
    ];
    
    // Draw table header
    const deductionsTableStartY = yPos;
    doc.setFillColor(79, 70, 229); // primary-500 color
    doc.rect(margin, deductionsTableStartY - 5, contentWidth, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('times', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Description', margin + 3, deductionsTableStartY);
    doc.text('Amount (₹)', pageWidth - margin - 3, deductionsTableStartY, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    yPos = deductionsTableStartY + 8;
    
    // Draw table rows
    deductions.forEach(([label, amount], index) => {
        try {
            const isBold = index === deductions.length - 1;
            const rowY = yPos;
            
            // Draw row background if it's the last row (Total Deductions)
            if (isBold) {
                doc.setFillColor(240, 240, 240);
                doc.rect(margin, rowY - 4, contentWidth, 8, 'F');
            }
            
            // Draw borders
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, rowY - 4, pageWidth - margin, rowY - 4); // top border
            doc.line(margin, rowY + 4, pageWidth - margin, rowY + 4); // bottom border
            doc.line(margin, rowY - 4, margin, rowY + 4); // left border
            doc.line(pageWidth - margin, rowY - 4, pageWidth - margin, rowY + 4); // right border
            doc.line(margin + contentWidth * 0.6, rowY - 4, margin + contentWidth * 0.6, rowY + 4); // middle border
            
            // Label
            doc.setFont('times', isBold ? 'bold' : 'normal');
            doc.setFontSize(9);
            doc.text(String(label || ''), margin + 3, rowY);
            
            // Amount
            doc.text(String(amount || '0.00'), pageWidth - margin - 3, rowY, { align: 'right' });
            
            yPos += 8;
        } catch (error) {
            console.error('Error adding deductions row:', error, { label, amount, index });
        }
    });
    
    yPos += 8; // Add padding below DEDUCTIONS section
    
    // Total Net Payable Section - Match preview layout (2 columns)
    const netPayableBoxY = yPos;
    
    // Calculate required height based on content
    const netPayable = Number(data.netPayable) || 0;
    let netWords = '';
    try {
        netWords = `Rupees ${numberToWords(netPayable)}`;
    } catch (wordsError) {
        console.error('Error converting number to words:', wordsError);
        netWords = `Rupees ${netPayable}`;
    }
    const wordsLines = doc.splitTextToSize(netWords, contentWidth * 0.45);
    const wordsHeight = wordsLines.length * 4;
    const netPayableBoxHeight = 40 + wordsHeight; // Compact height
    
    try {
        // Draw green background box
        doc.setFillColor(232, 245, 233);
        doc.setDrawColor(200, 220, 200);
        doc.rect(margin, netPayableBoxY, contentWidth, netPayableBoxHeight, 'FD');
    } catch (rectError) {
        console.error('Error drawing rectangle:', rectError);
    }
    
    // Left column: Title, Amount, Words
    const leftColX = margin + 10;
    const leftColY = netPayableBoxY + 6;
    
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL NET PAYABLE', leftColX, leftColY);
    
    doc.setFontSize(16);
    doc.setTextColor(46, 125, 50);
    const netPayableText = String(formatCurrency(data.netPayable || 0));
    doc.text(netPayableText, leftColX, leftColY + 8);
    
    doc.setFontSize(8);
    doc.setFont('times', 'bold'); // Changed from italic to bold
    doc.setTextColor(46, 100, 50);
    wordsLines.forEach((line, index) => {
        const lineY = leftColY + 16 + (index * 4);
        if (line && typeof line === 'string') {
            doc.text(String(line), leftColX, lineY);
        }
    });
    
    // Right column: Calculation breakdown
    const rightColX = margin + contentWidth * 0.55;
    const rightColY = netPayableBoxY + 6;
    
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Gross Earnings
    doc.text('Gross Earnings:', rightColX, rightColY);
    const grossEarningsText = String(formatCurrency(data.earnings.gross || 0));
    doc.text(grossEarningsText, pageWidth - margin - 10, rightColY, { align: 'right' });
    
    // Total Deductions
    doc.text('- Total Deductions:', rightColX, rightColY + 7);
    const deductionsText = String(formatCurrency(data.deductions.total || 0));
    doc.text(deductionsText, pageWidth - margin - 10, rightColY + 7, { align: 'right' });
    
    // Draw divider line
    doc.setDrawColor(100, 200, 100);
    doc.line(rightColX, rightColY + 10, pageWidth - margin - 10, rightColY + 10);
    
    // Total Net Payable
    doc.setFont('times', 'bold');
    doc.text('= Total Net Payable:', rightColX, rightColY + 16);
    doc.setTextColor(46, 125, 50);
    const totalNetText = String(formatCurrency(data.netPayable || 0));
    doc.text(totalNetText, pageWidth - margin - 10, rightColY + 16, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    yPos = netPayableBoxY + netPayableBoxHeight + 3; // Reduced bottom padding further
    
    // Add note about software generation - reworded but same meaning
    yPos += 3;
    doc.setFontSize(8);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100);
    const noteText = 'Disclaimer: This document is system-generated and does not require manual signature or authorization.';
    doc.text(noteText, pageWidth / 2, yPos, { align: 'center' });
    
    const employeeName = data.employee.name.replace(/\s+/g, '_');
    const companyNameForFile = data.company.name.replace(/\s+/g, '_');
    const payPeriod = data.period.payPeriod.replace(/\s+/g, '_');
    const filename = `Salary_Slip_${companyNameForFile}_${employeeName}_${payPeriod}.pdf`;
    
    doc.save(filename);
    console.log('PDF saved successfully');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

// Make available immediately
if (typeof window !== 'undefined') {
    window.downloadPDF = downloadPDF;
}

function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.getElementById('employeeName').value = '';
        document.getElementById('employeeId').value = '';
        document.getElementById('designation').value = '';
        document.getElementById('dateOfJoining').value = '';
        document.getElementById('pan').value = '';
        document.getElementById('uan').value = '';
        document.getElementById('bankName').value = '';
        document.getElementById('accountNumber').value = '';
        document.getElementById('ifscCode').value = '';
        // Reset pay period to current month/year
        setDefaultDates();
        document.getElementById('paidDays').value = '31';
        document.getElementById('lopDays').value = '0';
        document.getElementById('basicSalary').value = '';
        document.getElementById('hra').value = '';
        document.getElementById('otherAllowance').value = '';
        document.getElementById('specialAllowance').value = '';
        document.getElementById('providentFund').value = '';
        document.getElementById('pfEmployerShare').value = '';
        closePreview();
        calculateHRA();
        calculateTotals();
    }
}

// Make available immediately
if (typeof window !== 'undefined') {
    window.clearForm = clearForm;
}

window.onclick = function(event) {
    const modal = document.getElementById('companyManagerModal');
    if (event.target === modal) {
        closeCompanyManager();
    }
}

// Make all functions globally accessible for inline onclick handlers
// This must be at the end after all functions are defined
// Use Object.assign to ensure they're available immediately
if (typeof window !== 'undefined') {
    Object.assign(window, {
        calculateHRA,
        calculateTotals,
        generateSalarySlip,
        previewSalarySlip,
        clearForm,
        downloadPDF,
        closePreview,
        showCompanyManager,
        closeCompanyManager,
        saveCompany,
        cancelCompanyForm,
        loadCompanyTemplate,
        editCompany,
        deleteCompany,
        handleLogoUpload,
        removeLogo,
        updateAmountInWords
    });
    
    // Also assign individually for compatibility
    window.calculateHRA = calculateHRA;
    window.calculateTotals = calculateTotals;
    window.generateSalarySlip = generateSalarySlip;
    window.previewSalarySlip = previewSalarySlip;
    window.clearForm = clearForm;
    window.downloadPDF = downloadPDF;
    window.closePreview = closePreview;
    window.showCompanyManager = showCompanyManager;
    window.closeCompanyManager = closeCompanyManager;
    window.saveCompany = saveCompany;
    window.cancelCompanyForm = cancelCompanyForm;
    window.loadCompanyTemplate = loadCompanyTemplate;
    window.editCompany = editCompany;
    window.deleteCompany = deleteCompany;
    window.handleLogoUpload = handleLogoUpload;
    window.removeLogo = removeLogo;
    window.updateAmountInWords = updateAmountInWords;
}

