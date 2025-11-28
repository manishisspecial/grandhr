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
    const letterDate = document.getElementById('letterDate');
    if (letterDate && !letterDate.value) {
        letterDate.value = today.toISOString().split('T')[0];
    }
}

function loadCompaniesFromStorage() {
    const stored = localStorage.getItem('relievingLetterCompanies');
    if (stored) {
        companies = JSON.parse(stored);
    }
}

function saveCompaniesToStorage() {
    localStorage.setItem('relievingLetterCompanies', JSON.stringify(companies));
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

function calculateTenure(joiningDate, relievingDate) {
    if (!joiningDate || !relievingDate) return '';
    const join = new Date(joiningDate);
    const relieve = new Date(relievingDate);
    const diffTime = Math.abs(relieve - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    let tenure = '';
    if (years > 0) tenure += years + ' year' + (years > 1 ? 's' : '') + ' ';
    if (months > 0) tenure += months + ' month' + (months > 1 ? 's' : '') + ' ';
    if (days > 0 || tenure === '') tenure += days + ' day' + (days !== 1 ? 's' : '');
    return tenure.trim();
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
        employment: {
            joiningDate: document.getElementById('joiningDate').value,
            relievingDate: document.getElementById('relievingDate').value,
            letterDate: document.getElementById('letterDate').value,
            reasonForLeaving: document.getElementById('reasonForLeaving').value.trim()
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

function generateRelievingLetterHTML(data) {
    const letterDate = formatDate(data.employment.letterDate);
    const joiningDate = formatDate(data.employment.joiningDate);
    const relievingDate = formatDate(data.employment.relievingDate);
    const tenure = calculateTenure(data.employment.joiningDate, data.employment.relievingDate);
    
    return `
        <div class="space-y-6 text-sm leading-relaxed">
            <h1 class="text-2xl font-bold text-center text-primary-600 mb-6">RELIEVING LETTER</h1>
            <div class="text-right space-y-1">
                <div class="font-bold">${data.company.name || 'Company Name'}</div>
                ${data.company.address ? `<div>${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
                ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ''}
                ${data.company.phone ? `<div>Phone: ${data.company.phone}</div>` : ''}
            </div>
            <div><strong>Date:</strong> ${letterDate}</div>
            <div class="space-y-1">
                <strong>To,</strong><br>
                ${data.employee.name || 'Employee Name'}<br>
                ${data.employee.id ? `Employee ID: ${data.employee.id}<br>` : ''}
                ${data.employee.designation ? `Designation: ${data.employee.designation}<br>` : ''}
                ${data.employee.department ? `Department: ${data.employee.department}` : ''}
            </div>
            <div class="font-semibold text-primary-600 my-4">
                <strong>Subject: Relieving Letter - ${data.employee.name || 'Employee'}</strong>
            </div>
            <div class="space-y-3">
                <p>Dear ${data.employee.name || 'Employee'},</p>
                <p>This is to certify that <strong>${data.employee.name || 'Employee Name'}</strong> (Employee ID: ${data.employee.id || 'N/A'}) was employed with ${data.company.name || 'our company'} as <strong>${data.employee.designation || 'Designation'}</strong> ${data.employee.department ? `in the ${data.employee.department} department` : ''}.</p>
            </div>
            <div class="mt-6">
                <div class="font-semibold text-primary-600 mb-2">Employment Details:</div>
                <ul class="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Date of Joining:</strong> ${joiningDate}</li>
                    <li><strong>Date of Relieving:</strong> ${relievingDate}</li>
                    <li><strong>Total Tenure:</strong> ${tenure || 'N/A'}</li>
                </ul>
            </div>
            <div class="mt-6 space-y-3">
                <p>During the tenure of employment, ${data.employee.name || 'the employee'} has performed duties assigned and has been relieved from services on ${relievingDate}.</p>
                <p>We wish ${data.employee.name || 'the employee'} all the best for future endeavors.</p>
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

function previewRelievingLetter() {
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
        if (!data.employment.joiningDate || !data.employment.relievingDate) {
            alert('Please enter joining and relieving dates');
            return;
        }
        const html = generateRelievingLetterHTML(data);
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

function generateRelievingLetter() {
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
        
        addText('RELIEVING LETTER', 18, true, 'center');
        yPos += 10;
        addText(data.company.name || 'Company Name', 14, true, 'right');
        if (data.company.address) addText(data.company.address, 10, false, 'right');
        if (data.company.email) addText(`Email: ${data.company.email}`, 10, false, 'right');
        if (data.company.phone) addText(`Phone: ${data.company.phone}`, 10, false, 'right');
        yPos += 5;
        addText(`Date: ${formatDate(data.employment.letterDate)}`, 12, false, 'left');
        yPos += 5;
        addText('To,', 12, true);
        addText(data.employee.name || 'Employee Name', 12, true);
        if (data.employee.id) addText(`Employee ID: ${data.employee.id}`, 10);
        if (data.employee.designation) addText(`Designation: ${data.employee.designation}`, 10);
        if (data.employee.department) addText(`Department: ${data.employee.department}`, 10);
        yPos += 5;
        addText(`Subject: Relieving Letter - ${data.employee.name || 'Employee'}`, 12, true);
        yPos += 5;
        addText(`Dear ${data.employee.name || 'Employee'},`, 12);
        yPos += 3;
        addText(`This is to certify that ${data.employee.name || 'Employee Name'} (Employee ID: ${data.employee.id || 'N/A'}) was employed with ${data.company.name || 'our company'} as ${data.employee.designation || 'Designation'} ${data.employee.department ? `in the ${data.employee.department} department` : ''}.`, 11);
        yPos += 5;
        addText('Employment Details:', 12, true);
        addText(`   • Date of Joining: ${formatDate(data.employment.joiningDate)}`, 11);
        addText(`   • Date of Relieving: ${formatDate(data.employment.relievingDate)}`, 11);
        const tenure = calculateTenure(data.employment.joiningDate, data.employment.relievingDate);
        addText(`   • Total Tenure: ${tenure || 'N/A'}`, 11);
        yPos += 5;
        addText(`During the tenure of employment, ${data.employee.name || 'the employee'} has performed duties assigned and has been relieved from services on ${formatDate(data.employment.relievingDate)}.`, 11);
        yPos += 3;
        addText(`We wish ${data.employee.name || 'the employee'} all the best for future endeavors.`, 11);
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
        const filename = `Relieving_Letter_${companyName}_${employeeName}_${new Date().toISOString().split('T')[0]}.pdf`;
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
        document.getElementById('joiningDate').value = '';
        document.getElementById('relievingDate').value = '';
        document.getElementById('letterDate').value = '';
        document.getElementById('reasonForLeaving').value = '';
        closePreview();
    }
}

if (typeof window !== 'undefined') {
    Object.assign(window, {
        loadCompanyTemplate, showCompanyForm, cancelCompanyForm, saveCompany,
        showCompanyManager, closeCompanyManager, editCompany, deleteCompany,
        previewRelievingLetter, closePreview, generateRelievingLetter, downloadPDF, clearForm
    });
}

