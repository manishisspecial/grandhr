import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { formatDate, formatCurrency } from '../utils/pdfUtils';
import { jsPDF } from 'jspdf';

const AppointmentLetter = () => {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCompanyManager, setShowCompanyManager] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const [formData, setFormData] = useState({
    company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' },
    employee: { name: '', address: '', email: '', phone: '' },
    appointment: { position: '', department: '', appointmentDate: '', joiningDate: '', workLocation: '' },
    compensation: { monthlySalary: '', annualSalary: '', probationPeriod: '3 months' }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.jspdf = { jsPDF };
    }
    const stored = localStorage.getItem('appointmentLetterCompanies');
    if (stored) {
      setCompanies(JSON.parse(stored));
    }
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 15);
    setFormData(prev => ({
      ...prev,
      appointment: { ...prev.appointment, appointmentDate: today.toISOString().split('T')[0], joiningDate: futureDate.toISOString().split('T')[0] }
    }));
  }, []);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleCompanySelect = (value) => {
    if (value === 'new') {
      setShowCompanyForm(true);
      setCurrentCompany(null);
      setFormData(prev => ({ ...prev, company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' } }));
    } else if (value !== '') {
      const company = companies[parseInt(value)];
      setCurrentCompany(company);
      setFormData(prev => ({ ...prev, company: { ...company } }));
      setShowCompanyForm(true);
    } else {
      setShowCompanyForm(false);
    }
  };

  const saveCompany = () => {
    const name = formData.company.name.trim();
    if (!name) {
      alert('Please enter company name');
      return;
    }
    const company = {
      name, address: formData.company.address.trim(), email: formData.company.email.trim(),
      phone: formData.company.phone.trim(), signatory: formData.company.signatory.trim(),
      designation: formData.company.designation.trim()
    };
    let updatedCompanies;
    if (currentCompany && companies.findIndex(c => c.name === currentCompany.name) !== -1) {
      updatedCompanies = companies.map(c => c.name === currentCompany.name ? company : c);
    } else {
      updatedCompanies = [...companies, company];
    }
    setCompanies(updatedCompanies);
    localStorage.setItem('appointmentLetterCompanies', JSON.stringify(updatedCompanies));
    setCurrentCompany(company);
    setShowCompanyForm(false);
    alert('Company saved successfully!');
  };

  const generatePreview = () => {
    const data = { ...formData, company: currentCompany || formData.company };
    if (!data.company.name) {
      alert('Please select or add a company');
      return;
    }
    if (!data.employee.name) {
      alert('Please enter employee name');
      return;
    }
    if (!data.appointment.position) {
      alert('Please enter position');
      return;
    }
    const html = generateAppointmentLetterHTML(data);
    setPreviewContent(html);
    setPreviewVisible(true);
  };

  const generateAppointmentLetterHTML = (data) => {
    const appointmentDate = formatDate(data.appointment.appointmentDate);
    const joiningDate = formatDate(data.appointment.joiningDate);
    const monthlySalary = formatCurrency(data.compensation.monthlySalary);
    const annualSalary = formatCurrency(data.compensation.annualSalary);
    return `
      <div class="space-y-6 text-sm leading-relaxed">
        <h1 class="text-2xl font-bold text-center text-primary-600 mb-6">APPOINTMENT LETTER</h1>
        <div class="text-right space-y-1">
          <div class="font-bold">${data.company.name || 'Company Name'}</div>
          ${data.company.address ? `<div>${data.company.address.replace(/\n/g, '<br>')}</div>` : ''}
          ${data.company.email ? `<div>Email: ${data.company.email}</div>` : ''}
          ${data.company.phone ? `<div>Phone: ${data.company.phone}</div>` : ''}
        </div>
        <div><strong>Date:</strong> ${appointmentDate}</div>
        <div class="space-y-1">
          <strong>To,</strong><br>
          ${data.employee.name || 'Employee Name'}<br>
          ${data.employee.address ? data.employee.address.replace(/\n/g, '<br>') : ''}<br>
          ${data.employee.email ? `Email: ${data.employee.email}<br>` : ''}
          ${data.employee.phone ? `Phone: ${data.employee.phone}` : ''}
        </div>
        <div class="font-semibold text-primary-600 my-4">
          <strong>Subject: Appointment Letter - ${data.appointment.position || 'Position'}</strong>
        </div>
        <div class="space-y-3">
          <p>Dear ${data.employee.name || 'Employee'},</p>
          <p>We are pleased to inform you that you have been appointed to the position of <strong>${data.appointment.position || 'Position'}</strong> 
          ${data.appointment.department ? `in our ${data.appointment.department} department` : ''} at 
          <strong>${data.company.name || 'our company'}</strong>.</p>
        </div>
        <div class="mt-6">
          <div class="font-semibold text-primary-600 mb-2">1. Appointment Details:</div>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li><strong>Designation:</strong> ${data.appointment.position || 'N/A'}</li>
            <li><strong>Department:</strong> ${data.appointment.department || 'N/A'}</li>
            <li><strong>Joining Date:</strong> ${joiningDate}</li>
            <li><strong>Work Location:</strong> ${data.appointment.workLocation || 'As per company policy'}</li>
          </ul>
        </div>
        <div class="mt-6">
          <div class="font-semibold text-primary-600 mb-2">2. Compensation:</div>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li><strong>Monthly Salary:</strong> ${monthlySalary}</li>
            ${data.compensation.annualSalary ? `<li><strong>Annual Salary:</strong> ${annualSalary}</li>` : ''}
            <li><strong>Probation Period:</strong> ${data.compensation.probationPeriod}</li>
          </ul>
        </div>
        <div class="mt-6 space-y-3">
          <p>Your appointment is subject to the company's policies and procedures. We look forward to your valuable contribution to our organization.</p>
          <p>Please confirm your acceptance of this appointment by signing and returning a copy of this letter.</p>
        </div>
        <div class="mt-8">
          <p><strong>Best regards,</strong></p>
          <p class="mt-4"><strong>${data.company.signatory || 'Authorized Signatory'}</strong></p>
          <p>${data.company.designation || 'Designation'}</p>
          <p>${data.company.name || 'Company Name'}</p>
        </div>
      </div>
    `;
  };

  const downloadPDF = () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library not loaded. Please refresh the page.');
        return;
      }
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      const data = { ...formData, company: currentCompany || formData.company };
      const margin = 20;
      let yPos = margin;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
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

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      addText('APPOINTMENT LETTER', 18, true, 'center');
      yPos += 10;
      addText(data.company.name || 'Company Name', 14, true, 'right');
      if (data.company.address) addText(data.company.address, 10, false, 'right');
      if (data.company.email) addText(`Email: ${data.company.email}`, 10, false, 'right');
      if (data.company.phone) addText(`Phone: ${data.company.phone}`, 10, false, 'right');
      yPos += 5;
      addText(`Date: ${formatDate(data.appointment.appointmentDate)}`, 12, false, 'left');
      yPos += 5;
      addText('To,', 12, true);
      addText(data.employee.name || 'Employee Name', 12, true);
      if (data.employee.address) addText(data.employee.address, 10);
      if (data.employee.email) addText(`Email: ${data.employee.email}`, 10);
      if (data.employee.phone) addText(`Phone: ${data.employee.phone}`, 10);
      yPos += 5;
      addText(`Subject: Appointment Letter - ${data.appointment.position || 'Position'}`, 12, true);
      yPos += 5;
      addText(`Dear ${data.employee.name || 'Employee'},`, 12);
      yPos += 3;
      addText(`We are pleased to inform you that you have been appointed to the position of ${data.appointment.position || 'Position'} ${data.appointment.department ? `in our ${data.appointment.department} department` : ''} at ${data.company.name || 'our company'}.`, 11);
      yPos += 5;
      addText('1. Appointment Details:', 12, true);
      addText(`   • Designation: ${data.appointment.position || 'N/A'}`, 11);
      addText(`   • Department: ${data.appointment.department || 'N/A'}`, 11);
      addText(`   • Joining Date: ${formatDate(data.appointment.joiningDate)}`, 11);
      addText(`   • Work Location: ${data.appointment.workLocation || 'As per company policy'}`, 11);
      yPos += 5;
      addText('2. Compensation:', 12, true);
      addText(`   • Monthly Salary: ${formatCurrency(data.compensation.monthlySalary)}`, 11);
      if (data.compensation.annualSalary) {
        addText(`   • Annual Salary: ${formatCurrency(data.compensation.annualSalary)}`, 11);
      }
      addText(`   • Probation Period: ${data.compensation.probationPeriod}`, 11);
      yPos += 5;
      addText('Your appointment is subject to the company\'s policies and procedures. We look forward to your valuable contribution to our organization.', 11);
      yPos += 3;
      addText('Please confirm your acceptance of this appointment by signing and returning a copy of this letter.', 11);
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

      const employeeName = (data.employee.name || 'Employee').replace(/\s+/g, '_');
      const companyName = (data.company.name || 'Company').replace(/\s+/g, '_');
      const filename = `Appointment_Letter_${companyName}_${employeeName}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const clearForm = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        company: { name: '', address: '', email: '', phone: '', signatory: '', designation: '' },
        employee: { name: '', address: '', email: '', phone: '' },
        appointment: { position: '', department: '', appointmentDate: '', joiningDate: '', workLocation: '' },
        compensation: { monthlySalary: '', annualSalary: '', probationPeriod: '3 months' }
      });
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 15);
      setFormData(prev => ({
        ...prev,
        appointment: { ...prev.appointment, appointmentDate: today.toISOString().split('T')[0], joiningDate: futureDate.toISOString().split('T')[0] }
      }));
      setPreviewVisible(false);
    }
  };

  return (
    <Layout title="Appointment Letter Generator" description="Generate professional appointment letters for multiple companies" icon="📋">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Company Selection */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏢</span>
              <h2 className="section-title mb-0 flex-1">Company Selection</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Select Company:</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select 
                    className="form-input flex-1"
                    value={companies.findIndex(c => c.name === currentCompany?.name) >= 0 ? companies.findIndex(c => c.name === currentCompany?.name) : ''}
                    onChange={(e) => handleCompanySelect(e.target.value)}
                  >
                    <option value="">-- Select Company --</option>
                    <option value="new">+ Add New Company</option>
                    {companies.map((company, index) => (
                      <option key={index} value={index}>{company.name}</option>
                    ))}
                  </select>
                  <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => setShowCompanyManager(true)}>Manage</button>
                </div>
              </div>
              {showCompanyForm && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-primary-200">
                  <h3 className="text-lg font-bold text-primary-600">Add/Edit Company</h3>
                  <div><label className="form-label">Company Name:</label>
                    <input type="text" className="form-input" value={formData.company.name} onChange={(e) => handleInputChange('company', 'name', e.target.value)} placeholder="Company Name" /></div>
                  <div><label className="form-label">Address:</label>
                    <textarea rows="3" className="form-input" value={formData.company.address} onChange={(e) => handleInputChange('company', 'address', e.target.value)} placeholder="Full address" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="form-label">Email:</label>
                      <input type="email" className="form-input" value={formData.company.email} onChange={(e) => handleInputChange('company', 'email', e.target.value)} placeholder="hr@company.com" /></div>
                    <div><label className="form-label">Phone:</label>
                      <input type="text" className="form-input" value={formData.company.phone} onChange={(e) => handleInputChange('company', 'phone', e.target.value)} placeholder="+91-XXXXXXXXXX" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="form-label">Signatory Name:</label>
                      <input type="text" className="form-input" value={formData.company.signatory} onChange={(e) => handleInputChange('company', 'signatory', e.target.value)} placeholder="HR Manager" /></div>
                    <div><label className="form-label">Signatory Designation:</label>
                      <input type="text" className="form-input" value={formData.company.designation} onChange={(e) => handleInputChange('company', 'designation', e.target.value)} placeholder="HR Manager" /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary flex-1" onClick={saveCompany}>Save</button>
                    <button type="button" className="btn-secondary flex-1" onClick={() => setShowCompanyForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Information */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="section-title mb-0 flex-1">Employee Information</h2>
            </div>
            <div className="space-y-4">
              <div><label className="form-label">Employee Name: <span className="text-red-500">*</span></label>
                <input type="text" className="form-input" value={formData.employee.name} onChange={(e) => handleInputChange('employee', 'name', e.target.value)} placeholder="Full Name" required /></div>
              <div><label className="form-label">Address:</label>
                <textarea rows="3" className="form-input" value={formData.employee.address} onChange={(e) => handleInputChange('employee', 'address', e.target.value)} placeholder="Full address" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Email:</label>
                  <input type="email" className="form-input" value={formData.employee.email} onChange={(e) => handleInputChange('employee', 'email', e.target.value)} placeholder="email@example.com" /></div>
                <div><label className="form-label">Phone:</label>
                  <input type="text" className="form-input" value={formData.employee.phone} onChange={(e) => handleInputChange('employee', 'phone', e.target.value)} placeholder="+91-XXXXXXXXXX" /></div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📅</span>
              <h2 className="section-title mb-0 flex-1">Appointment Details</h2>
            </div>
            <div className="space-y-4">
              <div><label className="form-label">Position/Designation: <span className="text-red-500">*</span></label>
                <input type="text" className="form-input" value={formData.appointment.position} onChange={(e) => handleInputChange('appointment', 'position', e.target.value)} placeholder="e.g., Full Stack Developer" required /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Department:</label>
                  <input type="text" className="form-input" value={formData.appointment.department} onChange={(e) => handleInputChange('appointment', 'department', e.target.value)} placeholder="e.g., Engineering" /></div>
                <div><label className="form-label">Appointment Date: <span className="text-red-500">*</span></label>
                  <input type="date" className="form-input" value={formData.appointment.appointmentDate} onChange={(e) => handleInputChange('appointment', 'appointmentDate', e.target.value)} required /></div>
              </div>
              <div><label className="form-label">Joining Date: <span className="text-red-500">*</span></label>
                <input type="date" className="form-input" value={formData.appointment.joiningDate} onChange={(e) => handleInputChange('appointment', 'joiningDate', e.target.value)} required /></div>
              <div><label className="form-label">Work Location:</label>
                <input type="text" className="form-input" value={formData.appointment.workLocation} onChange={(e) => handleInputChange('appointment', 'workLocation', e.target.value)} placeholder="City, State" /></div>
            </div>
          </div>

          {/* Compensation */}
          <div className="card shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💰</span>
              <h2 className="section-title mb-0 flex-1">Compensation</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Monthly Salary (₹): <span className="text-red-500">*</span></label>
                  <input type="number" className="form-input" value={formData.compensation.monthlySalary} onChange={(e) => handleInputChange('compensation', 'monthlySalary', e.target.value)} placeholder="e.g., 50000" required /></div>
                <div><label className="form-label">Annual Salary (₹):</label>
                  <input type="number" className="form-input" value={formData.compensation.annualSalary} onChange={(e) => handleInputChange('compensation', 'annualSalary', e.target.value)} placeholder="e.g., 600000" /></div>
              </div>
              <div><label className="form-label">Probation Period:</label>
                <input type="text" className="form-input" value={formData.compensation.probationPeriod} onChange={(e) => handleInputChange('compensation', 'probationPeriod', e.target.value)} placeholder="e.g., 3 months" /></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" className="btn-primary flex-1 text-lg py-4" onClick={generatePreview}>Generate Letter</button>
            <button type="button" className="btn-secondary flex-1 py-4" onClick={() => setPreviewVisible(false)}>Preview</button>
            <button type="button" className="btn-secondary flex-1 py-4" onClick={clearForm}>Clear</button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:sticky lg:top-6 h-fit">
          {previewVisible ? (
            <div className="card shadow-2xl">
              <h2 className="section-title mb-4">Preview</h2>
              <div className="preview-content bg-white p-6 rounded-lg border-2 border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto" dangerouslySetInnerHTML={{ __html: previewContent }} />
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="button" className="btn-primary flex-1" onClick={downloadPDF}>Download PDF</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setPreviewVisible(false)}>Close</button>
              </div>
            </div>
          ) : (
            <div className="card shadow-xl bg-white/80 text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">Preview Will Appear Here</h3>
              <p className="text-gray-500">Fill the form and click "Preview"</p>
            </div>
          )}
        </div>
      </div>

      {/* Company Manager Modal */}
      {showCompanyManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => setShowCompanyManager(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Manage Companies</h2>
              <button onClick={() => setShowCompanyManager(false)} className="text-gray-500 hover:text-gray-700 text-3xl font-bold">&times;</button>
            </div>
            <div className="p-6">
              {companies.length === 0 ? (
                <p className="text-gray-600">No companies added yet.</p>
              ) : (
                <div className="space-y-3">
                  {companies.map((company, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-primary-600">{company.name}</div>
                        <div className="text-sm text-gray-600">{company.address || 'No address'}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary text-sm px-4 py-2" onClick={() => { setCurrentCompany(company); handleCompanySelect(index.toString()); setShowCompanyManager(false); }}>Edit</button>
                        <button className="btn-secondary text-sm px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100" onClick={() => {
                          if (confirm('Are you sure you want to delete this company?')) {
                            const updated = companies.filter((_, i) => i !== index);
                            setCompanies(updated);
                            localStorage.setItem('appointmentLetterCompanies', JSON.stringify(updated));
                            if (currentCompany?.name === company.name) {
                              setCurrentCompany(null);
                            }
                          }
                        }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AppointmentLetter;
