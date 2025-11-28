// Company Management
let companies = [];
let currentCompany = null;

// Load companies from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCompaniesFromStorage();
    populateCompanySelect();
    setDefaultDates();
});

function setDefaultDates() {
    const today = new Date();
    const offerDate = document.getElementById('offerDate');
    const joiningDate = document.getElementById('joiningDate');
    
    if (offerDate && !offerDate.value) {
        offerDate.value = today.toISOString().split('T')[0];
    }
    
    if (joiningDate && !joiningDate.value) {
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + 15);
        joiningDate.value = futureDate.toISOString().split('T')[0];
    }
}

function loadCompaniesFromStorage() {
    const stored = localStorage.getItem('offerLetterCompanies');
    if (stored) {
        companies = JSON.parse(stored);
    }
}

function saveCompaniesToStorage() {
    localStorage.setItem('offerLetterCompanies', JSON.stringify(companies));
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
    document.getElementById('companyWebsite').value = '';
    document.getElementById('authorizedSignatory').value = '';
    document.getElementById('signatoryDesignation').value = '';
}

function fillCompanyFields(company) {
    if (!company) return;
    document.getElementById('companyName').value = company.name || '';
    document.getElementById('companyAddress').value = company.address || '';
    document.getElementById('companyEmail').value = company.email || '';
    document.getElementById('companyPhone').value = company.phone || '';
    document.getElementById('companyWebsite').value = company.website || '';
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
        name: name,
        address: document.getElementById('companyAddress').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        phone: document.getElementById('companyPhone').value.trim(),
        website: document.getElementById('companyWebsite').value.trim(),
        signatory: document.getElementById('authorizedSignatory').value.trim(),
        designation: document.getElementById('signatoryDesignation').value.trim()
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

// Offer Letter Generation
function getFormData() {
    // Get company data (from form or selected company)
    let company = currentCompany;
    if (!company) {
        company = {
            name: document.getElementById('companyName').value.trim(),
            address: document.getElementById('companyAddress').value.trim(),
            email: document.getElementById('companyEmail').value.trim(),
            phone: document.getElementById('companyPhone').value.trim(),
            website: document.getElementById('companyWebsite').value.trim(),
            signatory: document.getElementById('authorizedSignatory').value.trim(),
            designation: document.getElementById('signatoryDesignation').value.trim()
        };
    }
    
    return {
        company: company,
        candidate: {
            name: document.getElementById('candidateName').value.trim(),
            address: document.getElementById('candidateAddress').value.trim(),
            email: document.getElementById('candidateEmail').value.trim(),
            phone: document.getElementById('candidatePhone').value.trim()
        },
        job: {
            position: document.getElementById('position').value.trim(),
            department: document.getElementById('department').value.trim(),
            joiningDate: document.getElementById('joiningDate').value,
            workLocation: document.getElementById('workLocation').value.trim()
        },
        compensation: {
            annualSalary: document.getElementById('salary').value,
            monthlySalary: document.getElementById('monthlySalary').value,
            probationPeriod: document.getElementById('probationPeriod').value.trim() || '3 months',
            benefits: document.getElementById('benefits').value.trim()
        },
        terms: {
            workingHours: document.getElementById('workingHours').value.trim() || '9:00 AM to 6:00 PM',
            noticePeriod: document.getElementById('noticePeriod').value.trim() || '30 days',
            offerDate: document.getElementById('offerDate').value,
            validityPeriod: document.getElementById('validityPeriod').value.trim() || '15 days',
            additionalTerms: document.getElementById('additionalTerms').value.trim()
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
    if (!amount) return '0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

function generateOfferLetterHTML(data) {
    const offerDate = formatDate(data.terms.offerDate);
    const joiningDate = formatDate(data.job.joiningDate);
    const monthlySalary = formatCurrency(data.compensation.monthlySalary);
    const annualSalary = formatCurrency(data.compensation.annualSalary);
    
    return `
        <div class="offer-letter">
            <h1>OFFER LETTER</h1>
            
            <div class="company-header">
                <strong>${data.company.name || 'Company Name'}</strong><br>
                ${data.company.address ? data.company.address.replace(/\n/g, '<br>') : ''}<br>
                ${data.company.email ? `Email: ${data.company.email}` : ''}<br>
                ${data.company.phone ? `Phone: ${data.company.phone}` : ''}<br>
                ${data.company.website ? `Website: ${data.company.website}` : ''}
            </div>
            
            <div class="date">
                <strong>Date:</strong> ${offerDate}
            </div>
            
            <div class="candidate-address">
                <strong>To,</strong><br>
                ${data.candidate.name || 'Candidate Name'}<br>
                ${data.candidate.address ? data.candidate.address.replace(/\n/g, '<br>') : ''}<br>
                ${data.candidate.email ? `Email: ${data.candidate.email}` : ''}<br>
                ${data.candidate.phone ? `Phone: ${data.candidate.phone}` : ''}
            </div>
            
            <div class="subject">
                <strong>Subject: Offer of Employment - ${data.job.position || 'Position'}</strong>
            </div>
            
            <div class="content">
                <p>Dear ${data.candidate.name || 'Candidate'},</p>
                
                <p>We are pleased to offer you the position of <strong>${data.job.position || 'Position'}</strong> 
                ${data.job.department ? `in our ${data.job.department} department` : ''} at 
                <strong>${data.company.name || 'our company'}</strong>. We believe your skills and experience 
                will be a valuable addition to our team.</p>
            </div>
            
            <div class="section">
                <div class="section-title">1. Position & Joining Details:</div>
                <ul>
                    <li><strong>Designation:</strong> ${data.job.position || 'N/A'}</li>
                    <li><strong>Department:</strong> ${data.job.department || 'N/A'}</li>
                    <li><strong>Joining Date:</strong> ${joiningDate}</li>
                    <li><strong>Work Location:</strong> ${data.job.workLocation || 'As per company policy'}</li>
                </ul>
            </div>
            
            <div class="section">
                <div class="section-title">2. Compensation Package:</div>
                <ul>
                    <li><strong>Annual Salary:</strong> ${annualSalary}</li>
                    <li><strong>Monthly Salary:</strong> ${monthlySalary}</li>
                    <li><strong>Probation Period:</strong> ${data.compensation.probationPeriod}</li>
                    ${data.compensation.benefits ? `<li><strong>Benefits:</strong> ${data.compensation.benefits}</li>` : ''}
                </ul>
            </div>
            
            <div class="section">
                <div class="section-title">3. Terms & Conditions:</div>
                <ul>
                    <li><strong>Working Hours:</strong> ${data.terms.workingHours}</li>
                    <li><strong>Notice Period:</strong> ${data.terms.noticePeriod}</li>
                    <li>This offer is valid for <strong>${data.terms.validityPeriod}</strong> from the date of this letter.</li>
                    <li>Your employment will be subject to the company's policies and procedures.</li>
                    ${data.terms.additionalTerms ? `<li>${data.terms.additionalTerms}</li>` : ''}
                </ul>
            </div>
            
            <div class="content">
                <p>We look forward to welcoming you to our team. Please confirm your acceptance of this offer by 
                signing and returning a copy of this letter within the validity period.</p>
                
                <p>If you have any questions or need clarification on any aspect of this offer, please feel free 
                to contact us.</p>
                
                <p>We are excited about the possibility of you joining our organization and contributing to our 
                continued success.</p>
            </div>
            
            <div class="content">
                <p>Best regards,</p>
            </div>
            
            <div class="signature-section">
                <div class="signature-box">
                    <div class="signature-line">
                        <strong>${data.company.signatory || 'Authorized Signatory'}</strong><br>
                        ${data.company.designation || 'Designation'}<br>
                        ${data.company.name || 'Company Name'}
                    </div>
                </div>
                <div class="signature-box">
                    <div class="signature-line">
                        <strong>Candidate Signature</strong><br>
                        Date: _______________
                    </div>
                </div>
            </div>
        </div>
    `;
}

function previewOfferLetter() {
    const data = getFormData();
    
    // Validation
    if (!data.company.name) {
        alert('Please select or add a company');
        return;
    }
    if (!data.candidate.name) {
        alert('Please enter candidate name');
        return;
    }
    if (!data.job.position) {
        alert('Please enter position');
        return;
    }
    
    const html = generateOfferLetterHTML(data);
    document.getElementById('previewContent').innerHTML = html;
    document.getElementById('previewSection').style.display = 'block';
    document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });
}

function closePreview() {
    document.getElementById('previewSection').style.display = 'none';
}

function generateOfferLetter() {
    previewOfferLetter();
    setTimeout(() => {
        downloadPDF();
    }, 500);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const data = getFormData();
    const previewContent = document.getElementById('previewContent');
    
    // Get the HTML content
    const htmlContent = previewContent.innerHTML;
    
    // Create a temporary div to hold the content for PDF generation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.width = '210mm';
    tempDiv.style.padding = '20mm';
    tempDiv.style.fontSize = '12pt';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(tempDiv);
    
    // Use html2canvas alternative - simple text-based PDF
    const margin = 20;
    let yPos = margin;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 7;
    
    // Helper function to add text with word wrap
    function addText(text, fontSize = 12, isBold = false, align = 'left') {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const maxWidth = doc.internal.pageSize.width - (margin * 2);
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
    
    // Generate PDF content
    addText('OFFER LETTER', 18, true, 'center');
    yPos += 10;
    
    addText(data.company.name || 'Company Name', 14, true, 'right');
    if (data.company.address) {
        addText(data.company.address, 10, false, 'right');
    }
    if (data.company.email) addText(`Email: ${data.company.email}`, 10, false, 'right');
    if (data.company.phone) addText(`Phone: ${data.company.phone}`, 10, false, 'right');
    if (data.company.website) addText(`Website: ${data.company.website}`, 10, false, 'right');
    
    yPos += 5;
    addText(`Date: ${formatDate(data.terms.offerDate)}`, 12, false, 'left');
    yPos += 5;
    
    addText('To,', 12, true);
    addText(data.candidate.name || 'Candidate Name', 12, true);
    if (data.candidate.address) addText(data.candidate.address, 10);
    if (data.candidate.email) addText(`Email: ${data.candidate.email}`, 10);
    if (data.candidate.phone) addText(`Phone: ${data.candidate.phone}`, 10);
    
    yPos += 5;
    addText(`Subject: Offer of Employment - ${data.job.position || 'Position'}`, 12, true);
    yPos += 5;
    
    addText(`Dear ${data.candidate.name || 'Candidate'},`, 12);
    yPos += 3;
    
    addText(`We are pleased to offer you the position of ${data.job.position || 'Position'} ${data.job.department ? `in our ${data.job.department} department` : ''} at ${data.company.name || 'our company'}. We believe your skills and experience will be a valuable addition to our team.`, 11);
    yPos += 5;
    
    addText('1. Position & Joining Details:', 12, true);
    addText(`   • Designation: ${data.job.position || 'N/A'}`, 11);
    addText(`   • Department: ${data.job.department || 'N/A'}`, 11);
    addText(`   • Joining Date: ${formatDate(data.job.joiningDate)}`, 11);
    addText(`   • Work Location: ${data.job.workLocation || 'As per company policy'}`, 11);
    yPos += 5;
    
    addText('2. Compensation Package:', 12, true);
    addText(`   • Annual Salary: ${formatCurrency(data.compensation.annualSalary)}`, 11);
    addText(`   • Monthly Salary: ${formatCurrency(data.compensation.monthlySalary)}`, 11);
    addText(`   • Probation Period: ${data.compensation.probationPeriod}`, 11);
    if (data.compensation.benefits) {
        addText(`   • Benefits: ${data.compensation.benefits}`, 11);
    }
    yPos += 5;
    
    addText('3. Terms & Conditions:', 12, true);
    addText(`   • Working Hours: ${data.terms.workingHours}`, 11);
    addText(`   • Notice Period: ${data.terms.noticePeriod}`, 11);
    addText(`   • This offer is valid for ${data.terms.validityPeriod} from the date of this letter.`, 11);
    addText(`   • Your employment will be subject to the company's policies and procedures.`, 11);
    if (data.terms.additionalTerms) {
        addText(`   • ${data.terms.additionalTerms}`, 11);
    }
    yPos += 5;
    
    addText('We look forward to welcoming you to our team. Please confirm your acceptance of this offer by signing and returning a copy of this letter within the validity period.', 11);
    yPos += 3;
    addText('If you have any questions or need clarification on any aspect of this offer, please feel free to contact us.', 11);
    yPos += 3;
    addText('We are excited about the possibility of you joining our organization and contributing to our continued success.', 11);
    yPos += 5;
    
    addText('Best regards,', 12);
    yPos += 10;
    
    // Signature section
    const signatureY = yPos;
    addText(data.company.signatory || 'Authorized Signatory', 12, true);
    addText(data.company.designation || 'Designation', 11);
    addText(data.company.name || 'Company Name', 11);
    
    yPos = signatureY;
    doc.text('Candidate Signature', doc.internal.pageSize.width - margin, yPos, { align: 'right' });
    yPos += lineHeight;
    doc.text('Date: _______________', doc.internal.pageSize.width - margin, yPos, { align: 'right' });
    
    // Generate filename
    const candidateName = data.candidate.name.replace(/\s+/g, '_');
    const companyName = data.company.name.replace(/\s+/g, '_');
    const filename = `Offer_Letter_${companyName}_${candidateName}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    doc.save(filename);
    
    // Remove temporary div
    document.body.removeChild(tempDiv);
}

function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        document.getElementById('candidateName').value = '';
        document.getElementById('candidateAddress').value = '';
        document.getElementById('candidateEmail').value = '';
        document.getElementById('candidatePhone').value = '';
        document.getElementById('position').value = '';
        document.getElementById('department').value = '';
        document.getElementById('joiningDate').value = '';
        document.getElementById('workLocation').value = '';
        document.getElementById('salary').value = '';
        document.getElementById('monthlySalary').value = '';
        document.getElementById('probationPeriod').value = '3 months';
        document.getElementById('benefits').value = '';
        document.getElementById('workingHours').value = '9:00 AM to 6:00 PM';
        document.getElementById('noticePeriod').value = '30 days';
        document.getElementById('offerDate').value = '';
        document.getElementById('validityPeriod').value = '15 days';
        document.getElementById('additionalTerms').value = '';
        closePreview();
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

