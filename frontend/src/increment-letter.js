import { jsPDF } from 'jspdf';
window.jspdf = { jsPDF };

let companies = [];
let currentCompany = null;

window.addEventListener('DOMContentLoaded', () => {
    loadCompaniesFromStorage();
    populateCompanySelect();
    setDefaultDates();
});

function setDefaultDates() {
    const today = new Date();
    const incrementDate = document.getElementById('incrementDate');
    if (incrementDate && !incrementDate.value) {
        incrementDate.value = today.toISOString().split('T')[0];
    }
}

function loadCompaniesFromStorage() {
    const stored = localStorage.getItem('incrementLetterCompanies');
    if (stored) {
        companies = JSON.parse(stored);
    }
}

function saveCompaniesToStorage() {
    localStorage.setItem('incrementLetterCompanies', JSON.stringify(companies));
}

function populateCompanySelect() {
    const select = document.getElementById('companySelect');
    if (!select) return;
    while (select.options.length > 2) select.remove(2);
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
    document.getElementById('companyForm').classList.remove('hidden');
    clearCompanyFields();
}

function cancelCompanyForm() {
    document.getElementById('companyForm').classList.add('hidden');
    document.getElementById('companySelect').value = '';
    clearCompanyFields();
}

function clearCompanyFields() {
    document.getElementById('companyName').value = '';
    document.getElementById('companyAddress').value = '';
    document.getElementById('companyEmail').value = '';
    document.getElementById('companyPhone').value = '';
    document.getElementById('authorizedSignatory').value = '';
    document.getElementById('signatoryDesignation').value = '';
}

function fillCompanyFields(company) {
    if (!company) return;
    document.getElementById('companyName').value = company.name || '';
    document.getElementById('companyAddress').value = company.address || '';
    document.getElementById('companyEmail').value = company.email || '';
    document.getElementById('companyPhone').value = company.phone || '';
    document.getElementById('authorizedSignatory').value = company.signatory || '';
    document.getElementById('signatoryDesignation').value = company.designation || '';
}

function saveCompany() {
    const name = document.getElementById('companyName').value.trim();
    if (!name) {
        alert('Please enter company name');
        return;
    }
    const company = {
        name, address: document.getElementById('companyAddress').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        phone: document.getElementById('companyPhone').value.trim(),
        signatory: document.getElementById('authorizedSignatory').value.trim(),
        designation: document.getElementById('signatoryDesignation').value.trim()
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
        list.innerHTML = '<p class="text-gray-600">No companies added yet.</p>';
    } else {
        companies.forEach((company, index) => {
            const item = document.createElement('div');
            item.className = 'p-4 mb-3 bg-gray-50 rounded-lg flex justify-between items-center gap-3';
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

function calculateIncrement() {
    const current = parseFloat(document.getElementById('currentSalary').value) || 0;
    const newSalary = parseFloat(document.getElementById('newSalary').value) || 0;
    const incrementAmount = newSalary - current;
    const incrementPercentage = current > 0 ? ((incrementAmount / current) * 100).toFixed(2) : 0;
    document.getElementById('incrementAmount').value = incrementAmount > 0 ? incrementAmount : '';
    document.getElementById('incrementPercentage').value = incrementPercentage > 0 ? incrementPercentage + '%' : '';
}

function getFormData() {
    let company = currentCompany;
    if (!company) {
        company = {
            name: document.getElementById('companyName').value.trim(),
            address: document.getElementById('companyAddress').value.trim(),
            email: document.getElementById('companyEmail').value.trim(),
            phone: document.getElementById('companyPhone').value.trim(),
            signatory: document.getElementById('authorizedSignatory').value.trim(),
            designation: document.getElementById('signatoryDesignation').value.trim()
        };
    }
    return {
        company,
        employee: {
            name: document.getElementById('employeeName').value.trim(),
            id: document.getElementById('employeeId').value.trim(),
            designation: document.getElementById('employeeDesignation').value.trim(),
            department: document.getElementById('employeeDepartment').value.trim()
        },
        increment: {
            date: document.getElementById('incrementDate').value,
            currentSalary: document.getElementById('currentSalary').value,
            newSalary: document.getElementById('newSalary').value,
            incrementAmount: document.getElementById('incrementAmount').value,
            incrementPercentage: document.getElementById('incrementPercentage').value,
            reason: document.getElementById('incrementReason').value.trim()
        }
    };
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatCurrency(amount) {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function generateIncrementLetterHTML(data) {
    const incrementDate = formatDate(data.increment.date);
    const currentSalary = formatCurrency(data.increment.currentSalary);
    const newSalary = formatCurrency(data.increment.newSalary);
    const incrementAmount = formatCurrency(data.increment.incrementAmount);
    
    return `
        <div class="space-y-6 text-sm leading-relaxed">
            <h1 class="text-2xl font-bold text-center text-primary-600 mb-6">SALARY INCREMENT LETTER</h1>
            <div class="text-right space-y-1">
                <div class="font-bold">${data.company.name || 'Company Name'}</div>
                ${data.company.address ? `<div>${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
                ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ''}
                ${data.company.phone ? `<div>Phone: ${data.company.phone}</div>` : ''}
            </div>
            <div><strong>Date:</strong> ${incrementDate}</div>
            <div class="space-y-1">
                <strong>To,</strong><br>
                ${data.employee.name || 'Employee Name'}<br>
                ${data.employee.id ? `Employee ID: ${data.employee.id}<br>` : ''}
                ${data.employee.designation ? `Designation: ${data.employee.designation}<br>` : ''}
                ${data.employee.department ? `Department: ${data.employee.department}` : ''}
            </div>
            <div class="font-semibold text-primary-600 my-4">
                <strong>Subject: Salary Increment - ${data.employee.name || 'Employee'}</strong>
            </div>
            <div class="space-y-3">
                <p>Dear ${data.employee.name || 'Employee'},</p>
                <p>We are pleased to inform you that your salary has been revised effective from <strong>${incrementDate}</strong>.</p>
            </div>
            <div class="mt-6">
                <div class="font-semibold text-primary-600 mb-2">Salary Details:</div>
                <ul class="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Current Monthly Salary:</strong> ${currentSalary}</li>
                    <li><strong>New Monthly Salary:</strong> ${newSalary}</li>
                    <li><strong>Increment Amount:</strong> ${incrementAmount}</li>
                    <li><strong>Increment Percentage:</strong> ${data.increment.incrementPercentage || 'N/A'}</li>
                </ul>
            </div>
            ${data.increment.reason ? `<div class="mt-6"><p><strong>Reason:</strong> ${data.increment.reason}</p></div>` : ''}
            <div class="mt-6 space-y-3">
                <p>We appreciate your dedication and contribution to the organization. We look forward to your continued commitment and success.</p>
                <p>Please acknowledge receipt of this letter by signing and returning a copy.</p>
            </div>
            <div class="mt-8">
                <p><strong>Best regards,</strong></p>
                <p class="mt-4"><strong>${data.company.signatory || 'Authorized Signatory'}</strong></p>
                <p>${data.company.designation || 'Designation'}</p>
                <p>${data.company.name || 'Company Name'}</p>
            </div>
        </div>
    `;
}

function previewIncrementLetter() {
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
        if (!data.increment.currentSalary || !data.increment.newSalary) {
            alert('Please enter current and new salary');
            return;
        }
        const html = generateIncrementLetterHTML(data);
        const previewContent = document.getElementById('previewContent');
        const previewSection = document.getElementById('previewSection');
        const emptyPreview = document.getElementById('emptyPreview');
        if (!previewContent || !previewSection) return;
        previewContent.innerHTML = html;
        previewSection.classList.remove('hidden');
        if (emptyPreview) emptyPreview.classList.add('hidden');
    } catch (error) {
        console.error('Error generating preview:', error);
        alert('Error generating preview: ' + error.message);
    }
}

function closePreview() {
    const previewSection = document.getElementById('previewSection');
    const emptyPreview = document.getElementById('emptyPreview');
    if (previewSection) previewSection.classList.add('hidden');
    if (emptyPreview) emptyPreview.classList.remove('hidden');
}

function generateIncrementLetter() {
    setTimeout(() => { downloadPDF(); }, 500);
}

function downloadPDF() {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const data = getFormData();
        const margin = 20;
        let yPos = margin;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const lineHeight = 7;
        
        function addText(text, fontSize = 12, isBold = false, align = 'left') {
            doc.setFontSize(fontSize);
            doc.setFont('times', isBold ? 'bold' : 'normal');
            const maxWidth = pageWidth - (margin * 2);
            const lines = doc.splitTextToSize(text, maxWidth);
            if (yPos + (lines.length * lineHeight) > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }
            lines.forEach(line => {
                doc.text(line, margin, yPos, { align: align });
                yPos += lineHeight;
            });
        }
        
        // Draw border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        
        addText('SALARY INCREMENT LETTER', 18, true, 'center');
        yPos += 10;
        addText(data.company.name || 'Company Name', 14, true, 'right');
        if (data.company.address) addText(data.company.address, 10, false, 'right');
        if (data.company.email) addText(`Email: ${data.company.email}`, 10, false, 'right');
        if (data.company.phone) addText(`Phone: ${data.company.phone}`, 10, false, 'right');
        yPos += 5;
        addText(`Date: ${formatDate(data.increment.date)}`, 12, false, 'left');
        yPos += 5;
        addText('To,', 12, true);
        addText(data.employee.name || 'Employee Name', 12, true);
        if (data.employee.id) addText(`Employee ID: ${data.employee.id}`, 10);
        if (data.employee.designation) addText(`Designation: ${data.employee.designation}`, 10);
        if (data.employee.department) addText(`Department: ${data.employee.department}`, 10);
        yPos += 5;
        addText(`Subject: Salary Increment - ${data.employee.name || 'Employee'}`, 12, true);
        yPos += 5;
        addText(`Dear ${data.employee.name || 'Employee'},`, 12);
        yPos += 3;
        addText(`We are pleased to inform you that your salary has been revised effective from ${formatDate(data.increment.date)}.`, 11);
        yPos += 5;
        addText('Salary Details:', 12, true);
        addText(`   • Current Monthly Salary: ${formatCurrency(data.increment.currentSalary)}`, 11);
        addText(`   • New Monthly Salary: ${formatCurrency(data.increment.newSalary)}`, 11);
        addText(`   • Increment Amount: ${formatCurrency(data.increment.incrementAmount)}`, 11);
        addText(`   • Increment Percentage: ${data.increment.incrementPercentage || 'N/A'}`, 11);
        if (data.increment.reason) {
            yPos += 3;
            addText(`Reason: ${data.increment.reason}`, 11);
        }
        yPos += 5;
        addText('We appreciate your dedication and contribution to the organization. We look forward to your continued commitment and success.', 11);
        yPos += 3;
        addText('Please acknowledge receipt of this letter by signing and returning a copy.', 11);
        yPos += 5;
        addText('Best regards,', 12);
        yPos += 10;
        addText(data.company.signatory || 'Authorized Signatory', 12, true);
        addText(data.company.designation || 'Designation', 11);
        addText(data.company.name || 'Company Name', 11);
        yPos += 10;
        doc.setFontSize(8);
        doc.setFont('times', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('Disclaimer: This document is system-generated and does not require manual signature or authorization.', pageWidth / 2, yPos, { align: 'center' });
        
        const employeeName = data.employee.name.replace(/\s+/g, '_');
        const companyName = data.company.name.replace(/\s+/g, '_');
        const filename = `Increment_Letter_${companyName}_${employeeName}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

function clearForm() {
    if (confirm('Are you sure you want to clear all fields?')) {
        document.getElementById('employeeName').value = '';
        document.getElementById('employeeId').value = '';
        document.getElementById('employeeDesignation').value = '';
        document.getElementById('employeeDepartment').value = '';
        document.getElementById('incrementDate').value = '';
        document.getElementById('currentSalary').value = '';
        document.getElementById('newSalary').value = '';
        document.getElementById('incrementAmount').value = '';
        document.getElementById('incrementPercentage').value = '';
        document.getElementById('incrementReason').value = '';
        closePreview();
    }
}

if (typeof window !== 'undefined') {
    Object.assign(window, {
        loadCompanyTemplate, showCompanyForm, cancelCompanyForm, saveCompany,
        showCompanyManager, closeCompanyManager, editCompany, deleteCompany,
        calculateIncrement, previewIncrementLetter, closePreview, generateIncrementLetter, downloadPDF, clearForm
    });
}

