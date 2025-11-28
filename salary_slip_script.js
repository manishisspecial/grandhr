// Company Management
let companies = [];
let currentCompany = null;

// Load companies from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCompaniesFromStorage();
    populateCompanySelect();
    setDefaultDates();
    calculateTotals();
});

function setDefaultDates() {
    const today = new Date();
    const salaryYear = document.getElementById('salaryYear');
    const salaryMonth = document.getElementById('salaryMonth');
    
    if (salaryYear && !salaryYear.value) {
        salaryYear.value = today.getFullYear();
    }
    
    if (salaryMonth) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        salaryMonth.value = monthNames[today.getMonth()];
    }
}

function loadCompaniesFromStorage() {
    const stored = localStorage.getItem('salarySlipCompanies');
    if (stored) {
        companies = JSON.parse(stored);
    }
}

function saveCompaniesToStorage() {
    localStorage.setItem('salarySlipCompanies', JSON.stringify(companies));
}

function populateCompanySelect() {
    const select = document.getElementById('companySelect');
    if (!select) return;
    
    // Clear existing options except first two
    while (select.options.length > 2) {
        select.remove(2);
    }
    
    // Add companies
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
        showCompanyForm();
    } else if (value !== '') {
        currentCompany = companies[parseInt(value)];
        fillCompanyFields(currentCompany);
    }
}

function showCompanyForm() {
    document.getElementById('companyForm').style.display = 'block';
    clearCompanyFields();
}

function cancelCompanyForm() {
    document.getElementById('companyForm').style.display = 'none';
    document.getElementById('companySelect').value = '';
    clearCompanyFields();
}

function clearCompanyFields() {
    document.getElementById('companyName').value = '';
    document.getElementById('companyAddress').value = '';
    document.getElementById('companyEmail').value = '';
    document.getElementById('companyPhone').value = '';
    document.getElementById('companyLogo').value = '';
}

function fillCompanyFields(company) {
    if (!company) return;
    document.getElementById('companyName').value = company.name || '';
    document.getElementById('companyAddress').value = company.address || '';
    document.getElementById('companyEmail').value = company.email || '';
    document.getElementById('companyPhone').value = company.phone || '';
    document.getElementById('companyLogo').value = company.logo || '';
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
        logo: document.getElementById('companyLogo').value.trim()
    };
    
    // Check if editing existing company
    const select = document.getElementById('companySelect');
    const selectedIndex = select.value;
    
    if (selectedIndex !== 'new' && selectedIndex !== '') {
        companies[parseInt(selectedIndex)] = company;
    } else {
        companies.push(company);
    }
    
    saveCompaniesToStorage();
    populateCompanySelect();
    document.getElementById('companyForm').style.display = 'none';
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
        list.innerHTML = '<p>No companies added yet. Add a new company to get started.</p>';
    } else {
        companies.forEach((company, index) => {
            const item = document.createElement('div');
            item.className = 'company-item';
            item.innerHTML = `
                <div class="company-item-info">
                    <div class="company-item-name">${company.name}</div>
                    <div style="font-size: 0.85em; color: #666;">${company.address || 'No address'}</div>
                </div>
                <div class="company-item-actions">
                    <button class="btn-secondary btn-small" onclick="editCompany(${index})">Edit</button>
                    <button class="btn-secondary btn-small" onclick="deleteCompany(${index})">Delete</button>
                </div>
            `;
            list.appendChild(item);
        });
    }
    
    modal.style.display = 'block';
}

function closeCompanyManager() {
    document.getElementById('companyManagerModal').style.display = 'none';
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

// Salary Calculations
function calculateTotals() {
    // Calculate Gross Salary
    const basic = parseFloat(document.getElementById('basicSalary').value) || 0;
    const hra = parseFloat(document.getElementById('hra').value) || 0;
    const conveyance = parseFloat(document.getElementById('conveyanceAllowance').value) || 0;
    const otherAllowances = parseFloat(document.getElementById('otherAllowances').value) || 0;
    
    const grossSalary = basic + hra + conveyance + otherAllowances;
    document.getElementById('grossSalary').value = grossSalary.toFixed(2);
    
    // Calculate Total Deductions
    const pf = parseFloat(document.getElementById('providentFund').value) || 0;
    const professionalTax = parseFloat(document.getElementById('professionalTax').value) || 0;
    const incomeTax = parseFloat(document.getElementById('incomeTax').value) || 0;
    const otherDeductions = parseFloat(document.getElementById('otherDeductions').value) || 0;
    
    const totalDeductions = pf + professionalTax + incomeTax + otherDeductions;
    document.getElementById('totalDeductions').value = totalDeductions.toFixed(2);
    
    // Calculate Net Payable
    const netPayable = grossSalary - totalDeductions;
    document.getElementById('netPayable').value = netPayable.toFixed(2);
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

// Get Form Data
function getFormData() {
    // Get company data
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
    
    return {
        company: company,
        employee: {
            name: document.getElementById('employeeName').value.trim(),
            id: document.getElementById('employeeId').value.trim(),
            designation: document.getElementById('designation').value.trim(),
            dateOfJoining: document.getElementById('dateOfJoining').value,
            pan: document.getElementById('pan').value.trim().toUpperCase(),
            bankName: document.getElementById('bankName').value.trim(),
            accountNumber: document.getElementById('accountNumber').value.trim(),
            ifscCode: document.getElementById('ifscCode').value.trim()
        },
        period: {
            month: document.getElementById('salaryMonth').value,
            year: document.getElementById('salaryYear').value,
            daysInMonth: parseInt(document.getElementById('daysInMonth').value) || 31,
            effectiveWorkDays: parseInt(document.getElementById('effectiveWorkDays').value) || 25
        },
        earnings: {
            basic: parseFloat(document.getElementById('basicSalary').value) || 0,
            hra: parseFloat(document.getElementById('hra').value) || 0,
            conveyance: parseFloat(document.getElementById('conveyanceAllowance').value) || 0,
            other: parseFloat(document.getElementById('otherAllowances').value) || 0,
            gross: parseFloat(document.getElementById('grossSalary').value) || 0
        },
        deductions: {
            pf: parseFloat(document.getElementById('providentFund').value) || 0,
            professionalTax: parseFloat(document.getElementById('professionalTax').value) || 0,
            incomeTax: parseFloat(document.getElementById('incomeTax').value) || 0,
            other: parseFloat(document.getElementById('otherDeductions').value) || 0,
            total: parseFloat(document.getElementById('totalDeductions').value) || 0
        },
        netPayable: parseFloat(document.getElementById('netPayable').value) || 0
    };
}

// Generate Salary Slip HTML
function generateSalarySlipHTML(data) {
    const netPayableWords = numberToWords(data.netPayable);
    
    return `
        <div class="salary-slip">
            <div class="salary-slip-header">
                <div class="company-logo">${data.company.logo || data.company.name.substring(0, 8).toUpperCase()}</div>
                <div class="company-info">
                    <div class="company-name">${data.company.name || 'Company Name'}</div>
                    ${data.company.address ? `<div>${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
                </div>
            </div>
            
            <div class="salary-slip-title">SALARY SLIP FOR ${data.period.month.toUpperCase()} ${data.period.year}</div>
            
            <div class="salary-slip-content">
                <div class="employee-details">
                    <div class="section-title">Employee Details</div>
                    <div class="detail-row">
                        <span class="detail-label">Employee Name:</span>
                        <span class="detail-value">${data.employee.name || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Designation:</span>
                        <span class="detail-value">${data.employee.designation || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Employee ID:</span>
                        <span class="detail-value">${data.employee.id || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date of Joining:</span>
                        <span class="detail-value">${formatDate(data.employee.dateOfJoining) || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">PAN:</span>
                        <span class="detail-value">${data.employee.pan || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Bank Name:</span>
                        <span class="detail-value">${data.employee.bankName || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Account No.:</span>
                        <span class="detail-value">${data.employee.accountNumber || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">IFSC Code:</span>
                        <span class="detail-value">${data.employee.ifscCode || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Days in Month:</span>
                        <span class="detail-value">${data.period.daysInMonth}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Effective Work Days:</span>
                        <span class="detail-value">${data.period.effectiveWorkDays}</span>
                    </div>
                </div>
                
                <div class="salary-details">
                    <div class="section-title">Salary Details</div>
                    <div class="earnings-section">
                        <table class="earnings-table">
                            <thead>
                                <tr>
                                    <th>Earnings</th>
                                    <th style="text-align: right;">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Basic Salary</td>
                                    <td class="amount">${formatCurrency(data.earnings.basic)}</td>
                                </tr>
                                <tr>
                                    <td>House Rent Allowance (HRA)</td>
                                    <td class="amount">${formatCurrency(data.earnings.hra)}</td>
                                </tr>
                                <tr>
                                    <td>Conveyance Allowance</td>
                                    <td class="amount">${formatCurrency(data.earnings.conveyance)}</td>
                                </tr>
                                <tr>
                                    <td>Other Allowances</td>
                                    <td class="amount">${formatCurrency(data.earnings.other)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Gross Salary</strong></td>
                                    <td class="amount"><strong>${formatCurrency(data.earnings.gross)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="deductions-section">
                        <table class="deductions-table">
                            <thead>
                                <tr>
                                    <th>Deductions</th>
                                    <th style="text-align: right;">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Provident Fund</td>
                                    <td class="amount">${formatCurrency(data.deductions.pf)}</td>
                                </tr>
                                <tr>
                                    <td>Professional Tax</td>
                                    <td class="amount">${formatCurrency(data.deductions.professionalTax)}</td>
                                </tr>
                                <tr>
                                    <td>Income Tax (TDS)</td>
                                    <td class="amount">${formatCurrency(data.deductions.incomeTax)}</td>
                                </tr>
                                <tr>
                                    <td>Other Deductions</td>
                                    <td class="amount">${formatCurrency(data.deductions.other)}</td>
                                </tr>
                                <tr>
                                    <td><strong>Total Deductions</strong></td>
                                    <td class="amount"><strong>${formatCurrency(data.deductions.total)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="net-payable">
                <div class="net-payable-label">Net Payable (₹)</div>
                <div class="net-payable-amount">${formatCurrency(data.netPayable)}</div>
                <div class="net-payable-words">Rupees ${netPayableWords}</div>
            </div>
            
            <div class="clauses-section">
                <div class="section-title">Important Clauses & Declarations</div>
                <div class="clause-item">This is an electronically generated salary slip and does not require a physical signature or stamp.</div>
                <div class="clause-item">This salary slip is valid for all official, financial, and verification purposes.</div>
                <div class="clause-item">Salary and deductions comply with the Payment of Wages Act, 1936, and other applicable labor laws.</div>
                <div class="clause-item">The employee confirms receipt of the salary for the stated month with no dues pending.</div>
                <div class="clause-item">Future statutory deductions (PF, ESI, TDS) will comply with relevant acts (Employees' Provident Fund and Miscellaneous Provisions Act, 1952, and Income Tax Act, 1961).</div>
                <div class="clause-item">Any salary discrepancy must be reported to HR/Accounts within 7 working days of issuance.</div>
                <div class="clause-item">The salary slip is confidential and should not be shared with third parties without company authorization.</div>
                <div class="clause-item">(This is a system-generated slip and does not require manual authentication.)</div>
            </div>
            
            <div class="authorized-by">
                <strong>Authorized By:</strong> ${data.company.name || 'Company Name'}
            </div>
        </div>
    `;
}

function previewSalarySlip() {
    const data = getFormData();
    
    // Validation
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
    document.getElementById('previewContent').innerHTML = html;
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

function closePreview() {
    document.getElementById('previewSection').style.display = 'none';
}

function generateSalarySlip() {
    previewSalarySlip();
    setTimeout(() => {
        downloadPDF();
    }, 500);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const data = getFormData();
    const margin = 15;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 7;
    
    // Helper function to add text
    function addText(text, fontSize = 12, isBold = false, align = 'left', x = margin) {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, contentWidth);
        
        if (yPos + (lines.length * lineHeight) > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
        
        lines.forEach(line => {
            doc.text(line, x, yPos, { align: align });
            yPos += lineHeight;
        });
    }
    
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(data.company.logo || data.company.name.substring(0, 8).toUpperCase(), margin, yPos);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const companyNameLines = doc.splitTextToSize(data.company.name, contentWidth / 2);
    let companyY = yPos;
    companyNameLines.forEach(line => {
        doc.text(line, pageWidth - margin, companyY, { align: 'right' });
        companyY += 5;
    });
    
    doc.setFont('helvetica', 'normal');
    if (data.company.address) {
        const addressLines = doc.splitTextToSize(data.company.address, contentWidth / 2);
        addressLines.forEach(line => {
            doc.text(line, pageWidth - margin, companyY, { align: 'right' });
            companyY += 5;
        });
    }
    
    yPos = companyY + 5;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    // Title
    addText(`SALARY SLIP FOR ${data.period.month.toUpperCase()} ${data.period.year}`, 14, true, 'center', pageWidth / 2);
    yPos += 5;
    
    // Employee Details and Salary Details side by side
    const col1X = margin;
    const col2X = pageWidth / 2 + 5;
    const colWidth = (pageWidth - margin * 2 - 5) / 2;
    
    // Left Column - Employee Details
    let leftY = yPos;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Details', col1X, leftY);
    leftY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const employeeDetails = [
        ['Employee Name:', data.employee.name || 'N/A'],
        ['Designation:', data.employee.designation || 'N/A'],
        ['Employee ID:', data.employee.id || 'N/A'],
        ['Date of Joining:', formatDate(data.employee.dateOfJoining) || 'N/A'],
        ['PAN:', data.employee.pan || 'N/A'],
        ['Bank Name:', data.employee.bankName || 'N/A'],
        ['Account No.:', data.employee.accountNumber || 'N/A'],
        ['IFSC Code:', data.employee.ifscCode || 'N/A'],
        ['Days in Month:', data.period.daysInMonth.toString()],
        ['Effective Work Days:', data.period.effectiveWorkDays.toString()]
    ];
    
    employeeDetails.forEach(([label, value]) => {
        doc.text(label, col1X, leftY);
        doc.text(value, col1X + 60, leftY);
        leftY += 6;
    });
    
    // Right Column - Earnings
    let rightY = yPos;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Earnings', col2X, rightY);
    rightY += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const earnings = [
        ['Basic Salary', formatCurrency(data.earnings.basic)],
        ['HRA', formatCurrency(data.earnings.hra)],
        ['Conveyance Allowance', formatCurrency(data.earnings.conveyance)],
        ['Other Allowances', formatCurrency(data.earnings.other)],
        ['Gross Salary', formatCurrency(data.earnings.gross)]
    ];
    
    earnings.forEach(([label, amount], index) => {
        const isBold = index === earnings.length - 1;
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(label, col2X, rightY);
        doc.text(amount, col2X + 50, rightY, { align: 'right' });
        rightY += 6;
    });
    
    yPos = Math.max(leftY, rightY) + 5;
    
    // Deductions
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Deductions', col2X, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const deductions = [
        ['Provident Fund', formatCurrency(data.deductions.pf)],
        ['Professional Tax', formatCurrency(data.deductions.professionalTax)],
        ['Income Tax (TDS)', formatCurrency(data.deductions.incomeTax)],
        ['Other Deductions', formatCurrency(data.deductions.other)],
        ['Total Deductions', formatCurrency(data.deductions.total)]
    ];
    
    deductions.forEach(([label, amount], index) => {
        const isBold = index === deductions.length - 1;
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(label, col2X, yPos);
        doc.text(amount, col2X + 50, yPos, { align: 'right' });
        yPos += 6;
    });
    
    yPos += 5;
    
    // Net Payable
    doc.setFillColor(232, 245, 233);
    doc.rect(margin, yPos - 5, contentWidth, 20, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Payable (₹)', margin + 5, yPos);
    
    doc.setFontSize(16);
    doc.setTextColor(46, 125, 50);
    doc.text(formatCurrency(data.netPayable), margin + 5, yPos + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'italic');
    const netWords = `Rupees ${numberToWords(data.netPayable)}`;
    const wordsLines = doc.splitTextToSize(netWords, contentWidth - 10);
    wordsLines.forEach((line, index) => {
        doc.text(line, margin + 5, yPos + 16 + (index * 5));
    });
    
    yPos += 25;
    
    // Clauses
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Clauses & Declarations', margin, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const clauses = [
        'This is an electronically generated salary slip and does not require a physical signature or stamp.',
        'This salary slip is valid for all official, financial, and verification purposes.',
        'Salary and deductions comply with the Payment of Wages Act, 1936, and other applicable labor laws.',
        'The employee confirms receipt of the salary for the stated month with no dues pending.',
        'Future statutory deductions (PF, ESI, TDS) will comply with relevant acts.',
        'Any salary discrepancy must be reported to HR/Accounts within 7 working days of issuance.',
        'The salary slip is confidential and should not be shared with third parties without company authorization.',
        '(This is a system-generated slip and does not require manual authentication.)'
    ];
    
    clauses.forEach(clause => {
        const lines = doc.splitTextToSize('• ' + clause, contentWidth);
        lines.forEach(line => {
            if (yPos > pageHeight - margin - 10) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(line, margin + 5, yPos);
            yPos += 5;
        });
        yPos += 2;
    });
    
    // Authorized By
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Authorized By: ${data.company.name}`, pageWidth - margin, yPos, { align: 'right' });
    
    // Generate filename
    const employeeName = data.employee.name.replace(/\s+/g, '_');
    const companyName = data.company.name.replace(/\s+/g, '_');
    const month = data.period.month.substring(0, 3);
    const filename = `Salary_Slip_${companyName}_${employeeName}_${month}_${data.period.year}.pdf`;
    
    doc.save(filename);
}

function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.getElementById('employeeName').value = '';
        document.getElementById('employeeId').value = '';
        document.getElementById('designation').value = '';
        document.getElementById('dateOfJoining').value = '';
        document.getElementById('pan').value = '';
        document.getElementById('bankName').value = '';
        document.getElementById('accountNumber').value = '';
        document.getElementById('ifscCode').value = '';
        document.getElementById('basicSalary').value = '';
        document.getElementById('hra').value = '';
        document.getElementById('conveyanceAllowance').value = '';
        document.getElementById('otherAllowances').value = '';
        document.getElementById('providentFund').value = '0';
        document.getElementById('professionalTax').value = '0';
        document.getElementById('incomeTax').value = '0';
        document.getElementById('otherDeductions').value = '0';
        document.getElementById('effectiveWorkDays').value = '25';
        closePreview();
        calculateTotals();
        setDefaultDates();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('companyManagerModal');
    if (event.target === modal) {
        closeCompanyManager();
    }
}

