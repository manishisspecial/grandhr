import { jsPDF } from 'jspdf';
window.jspdf = { jsPDF };

let companies = [];
let currentCompany = null;

window.addEventListener('DOMContentLoaded', () => {
    loadCompaniesFromStorage();
    populateCompanySelect();
    setDefaultDates();
    setupTerminationReasonHandler();
});

function setDefaultDates() {
    const today = new Date();
    const letterDate = document.getElementById('letterDate');
    const terminationDate = document.getElementById('terminationDate');
    if (letterDate && !letterDate.value) {
        letterDate.value = today.toISOString().split('T')[0];
    }
    if (terminationDate && !terminationDate.value) {
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 30);
        terminationDate.value = futureDate.toISOString().split('T')[0];
    }
}

function setupTerminationReasonHandler() {
    const reasonSelect = document.getElementById('terminationReason');
    const otherReasonDiv = document.getElementById('otherReasonDiv');
    if (reasonSelect && otherReasonDiv) {
        reasonSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherReasonDiv.classList.remove('hidden');
            } else {
                otherReasonDiv.classList.add('hidden');
                document.getElementById('otherReason').value = '';
            }
        });
    }
}

function loadCompaniesFromStorage() {
    const stored = localStorage.getItem('terminationLetterCompanies');
    if (stored) {
        companies = JSON.parse(stored);
    }
}

function saveCompaniesToStorage() {
    localStorage.setItem('terminationLetterCompanies', JSON.stringify(companies));
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
    const terminationReason = document.getElementById('terminationReason').value;
    const finalReason = terminationReason === 'Other' 
        ? document.getElementById('otherReason').value.trim() 
        : terminationReason;
    
    return {
        company,
        employee: {
            name: document.getElementById('employeeName').value.trim(),
            id: document.getElementById('employeeId').value.trim(),
            designation: document.getElementById('employeeDesignation').value.trim(),
            department: document.getElementById('employeeDepartment').value.trim()
        },
        termination: {
            joiningDate: document.getElementById('joiningDate').value,
            terminationDate: document.getElementById('terminationDate').value,
            letterDate: document.getElementById('letterDate').value,
            reason: finalReason,
            noticePeriod: document.getElementById('noticePeriod').value.trim() || '30 days'
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

function generateTerminationLetterHTML(data) {
    const letterDate = formatDate(data.termination.letterDate);
    const terminationDate = formatDate(data.termination.terminationDate);
    const joiningDate = formatDate(data.termination.joiningDate);
    
    return `
        <div class="space-y-6 text-sm leading-relaxed">
            <h1 class="text-2xl font-bold text-center text-primary-600 mb-6">TERMINATION LETTER</h1>
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
                <strong>Subject: Termination of Employment - ${data.employee.name || 'Employee'}</strong>
            </div>
            <div class="space-y-3">
                <p>Dear ${data.employee.name || 'Employee'},</p>
                <p>This letter serves as formal notice of termination of your employment with ${data.company.name || 'our company'}.</p>
            </div>
            <div class="mt-6">
                <div class="font-semibold text-primary-600 mb-2">Termination Details:</div>
                <ul class="list-disc list-inside space-y-1 ml-4">
                    ${joiningDate ? `<li><strong>Date of Joining:</strong> ${joiningDate}</li>` : ''}
                    <li><strong>Termination Date:</strong> ${terminationDate}</li>
                    <li><strong>Notice Period:</strong> ${data.termination.noticePeriod}</li>
                    <li><strong>Reason:</strong> ${data.termination.reason || 'N/A'}</li>
                </ul>
            </div>
            <div class="mt-6 space-y-3">
                <p>Your employment will be terminated effective ${terminationDate}. You are required to serve the notice period of ${data.termination.noticePeriod} as per your employment agreement.</p>
                <p>Please return all company property, including but not limited to access cards, laptops, and any other company assets, before your last working day.</p>
                <p>We wish you the best in your future endeavors.</p>
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

function previewTerminationLetter() {
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
        if (!data.termination.terminationDate) {
            alert('Please enter termination date');
            return;
        }
        if (!data.termination.reason) {
            alert('Please select or specify termination reason');
            return;
        }
        const html = generateTerminationLetterHTML(data);
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

function generateTerminationLetter() {
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
        
        addText('TERMINATION LETTER', 18, true, 'center');
        yPos += 10;
        addText(data.company.name || 'Company Name', 14, true, 'right');
        if (data.company.address) addText(data.company.address, 10, false, 'right');
        if (data.company.email) addText(`Email: ${data.company.email}`, 10, false, 'right');
        if (data.company.phone) addText(`Phone: ${data.company.phone}`, 10, false, 'right');
        yPos += 5;
        addText(`Date: ${formatDate(data.termination.letterDate)}`, 12, false, 'left');
        yPos += 5;
        addText('To,', 12, true);
        addText(data.employee.name || 'Employee Name', 12, true);
        if (data.employee.id) addText(`Employee ID: ${data.employee.id}`, 10);
        if (data.employee.designation) addText(`Designation: ${data.employee.designation}`, 10);
        if (data.employee.department) addText(`Department: ${data.employee.department}`, 10);
        yPos += 5;
        addText(`Subject: Termination of Employment - ${data.employee.name || 'Employee'}`, 12, true);
        yPos += 5;
        addText(`Dear ${data.employee.name || 'Employee'},`, 12);
        yPos += 3;
        addText(`This letter serves as formal notice of termination of your employment with ${data.company.name || 'our company'}.`, 11);
        yPos += 5;
        addText('Termination Details:', 12, true);
        if (data.termination.joiningDate) {
            addText(`   • Date of Joining: ${formatDate(data.termination.joiningDate)}`, 11);
        }
        addText(`   • Termination Date: ${formatDate(data.termination.terminationDate)}`, 11);
        addText(`   • Notice Period: ${data.termination.noticePeriod}`, 11);
        addText(`   • Reason: ${data.termination.reason || 'N/A'}`, 11);
        yPos += 5;
        addText(`Your employment will be terminated effective ${formatDate(data.termination.terminationDate)}. You are required to serve the notice period of ${data.termination.noticePeriod} as per your employment agreement.`, 11);
        yPos += 3;
        addText('Please return all company property, including but not limited to access cards, laptops, and any other company assets, before your last working day.', 11);
        yPos += 3;
        addText('We wish you the best in your future endeavors.', 11);
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
        const filename = `Termination_Letter_${companyName}_${employeeName}_${new Date().toISOString().split('T')[0]}.pdf`;
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
        document.getElementById('terminationDate').value = '';
        document.getElementById('letterDate').value = '';
        document.getElementById('terminationReason').value = '';
        document.getElementById('otherReason').value = '';
        document.getElementById('otherReasonDiv').classList.add('hidden');
        document.getElementById('noticePeriod').value = '30 days';
        closePreview();
    }
}

if (typeof window !== 'undefined') {
    Object.assign(window, {
        loadCompanyTemplate, showCompanyForm, cancelCompanyForm, saveCompany,
        showCompanyManager, closeCompanyManager, editCompany, deleteCompany,
        previewTerminationLetter, closePreview, generateTerminationLetter, downloadPDF, clearForm
    });
}

