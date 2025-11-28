import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
window.jspdf = { jsPDF };
window.html2canvas = html2canvas;

// Hierarchy Data Structure
let hierarchy = {
    root: {
        id: 'root',
        name: 'MD & Co-Founder',
        designation: 'MD & Co-Founder',
        email: '',
        department: '',
        children: []
    }
};

let employees = new Map();
let editingEmployeeId = null;

// Load hierarchy from localStorage
window.addEventListener('DOMContentLoaded', () => {
    loadHierarchyFromStorage();
    renderHierarchy();
    populateReportingToSelect();
});

function loadHierarchyFromStorage() {
    const stored = localStorage.getItem('companyHierarchy');
    if (stored) {
        const data = JSON.parse(stored);
        hierarchy = data.hierarchy || hierarchy;
        employees = new Map(data.employees || []);
    }
}

function saveHierarchyToStorage() {
    localStorage.setItem('companyHierarchy', JSON.stringify({
        hierarchy,
        employees: Array.from(employees.entries())
    }));
}

function populateReportingToSelect() {
    const select = document.getElementById('reportingTo');
    if (!select) return;
    
    // Clear existing options except first two
    while (select.options.length > 2) {
        select.remove(2);
    }
    
    // Add all employees
    employees.forEach((emp, id) => {
        if (id !== editingEmployeeId) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${emp.name} - ${emp.designation}`;
            select.appendChild(option);
        }
    });
}

function addEmployeeToHierarchy(employee, parentId) {
    const employeeNode = {
        id: employee.id,
        name: employee.name,
        designation: employee.designation,
        department: employee.department || '',
        email: employee.email || '',
        children: []
    };
    
    employees.set(employee.id, employee);
    
    if (parentId === 'root' || !parentId) {
        hierarchy.root.children.push(employeeNode);
    } else {
        const parent = findNodeById(hierarchy.root, parentId);
        if (parent) {
            parent.children.push(employeeNode);
        } else {
            hierarchy.root.children.push(employeeNode);
        }
    }
    
    saveHierarchyToStorage();
    renderHierarchy();
    populateReportingToSelect();
}

function findNodeById(node, id) {
    if (node.id === id) return node;
    for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
    }
    return null;
}

function removeEmployeeFromHierarchy(employeeId) {
    // Remove from employees map
    employees.delete(employeeId);
    
    // Remove from hierarchy tree
    function removeFromNode(node) {
        node.children = node.children.filter(child => {
            if (child.id === employeeId) {
                // Move children to parent
                if (node.id === 'root') {
                    hierarchy.root.children.push(...child.children);
                } else {
                    node.children.push(...child.children);
                }
                return false;
            }
            removeFromNode(child);
            return true;
        });
    }
    
    removeFromNode(hierarchy.root);
    saveHierarchyToStorage();
    renderHierarchy();
    populateReportingToSelect();
}

function renderHierarchy() {
    const container = document.getElementById('hierarchyTree');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (hierarchy.root.children.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-20">Click "Add Employee" to start building your hierarchy</p>';
        return;
    }
    
    // Render root
    const rootDiv = document.createElement('div');
    rootDiv.className = 'text-center mb-8';
    rootDiv.innerHTML = `
        <div class="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-lg shadow-lg">
            <div class="font-bold text-lg">${hierarchy.root.name}</div>
            <div class="text-sm opacity-90">${hierarchy.root.designation}</div>
        </div>
    `;
    container.appendChild(rootDiv);
    
    // Render children
    if (hierarchy.root.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'mt-6';
        renderNodeChildren(hierarchy.root, childrenContainer, 0);
        container.appendChild(childrenContainer);
    }
}

function renderNodeChildren(node, container, level) {
    if (node.children.length === 0) return;
    
    const childrenDiv = document.createElement('div');
    childrenDiv.className = 'flex flex-wrap justify-center gap-6 mb-8 relative';
    
    // Add horizontal connector line from parent
    if (node.id !== 'root') {
        const horizontalLine = document.createElement('div');
        horizontalLine.className = 'absolute top-0 left-0 right-0 h-0.5 bg-gray-400';
        horizontalLine.style.top = '-20px';
        childrenDiv.appendChild(horizontalLine);
    }
    
    node.children.forEach((child, index) => {
        const childWrapper = document.createElement('div');
        childWrapper.className = 'flex flex-col items-center relative';
        
        // Vertical connector line from parent
        const verticalConnector = document.createElement('div');
        verticalConnector.className = 'absolute w-0.5 bg-gray-400';
        verticalConnector.style.top = '-20px';
        verticalConnector.style.height = '20px';
        verticalConnector.style.left = '50%';
        verticalConnector.style.transform = 'translateX(-50%)';
        childWrapper.appendChild(verticalConnector);
        
        // Horizontal connector line to children
        if (child.children.length > 0) {
            const horizontalConnector = document.createElement('div');
            horizontalConnector.className = 'absolute w-full h-0.5 bg-gray-400';
            horizontalConnector.style.top = '100%';
            horizontalConnector.style.marginTop = '8px';
            horizontalConnector.style.left = '50%';
            horizontalConnector.style.width = 'calc(100% + 48px)';
            horizontalConnector.style.transform = 'translateX(-50%)';
            childWrapper.appendChild(horizontalConnector);
        }
        
        // Employee card
        const card = document.createElement('div');
        card.className = 'bg-white border-2 border-gray-300 rounded-lg p-4 shadow-md min-w-[220px] max-w-[220px] relative group hover:border-primary-500 hover:shadow-lg transition-all';
        card.innerHTML = `
            <div class="text-center">
                <div class="font-bold text-gray-800 mb-1 text-base">${child.name}</div>
                <div class="text-sm text-gray-600 mb-1">${child.designation}</div>
                ${child.department ? `<div class="text-xs text-primary-600 mb-2 font-medium">${child.department}</div>` : ''}
                <div class="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    <button onclick="editEmployee('${child.id}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                    <button onclick="deleteEmployee('${child.id}')" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                </div>
            </div>
        `;
        childWrapper.appendChild(card);
        
        // Render children recursively
        if (child.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'mt-6 w-full';
            renderNodeChildren(child, childrenContainer, level + 1);
            childWrapper.appendChild(childrenContainer);
        }
        
        childrenDiv.appendChild(childWrapper);
    });
    
    container.appendChild(childrenDiv);
}

// Form handling
document.getElementById('employeeForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value || 'emp_' + Date.now();
    const employee = {
        id: employeeId,
        name: document.getElementById('employeeName').value.trim(),
        designation: document.getElementById('employeeDesignation').value.trim(),
        department: document.getElementById('employeeDepartment').value.trim(),
        email: document.getElementById('employeeEmail').value.trim(),
        reportsTo: document.getElementById('reportingTo').value
    };
    
    if (editingEmployeeId) {
        // Update existing
        const existing = employees.get(editingEmployeeId);
        if (existing) {
            // Remove from old position
            removeEmployeeFromHierarchy(editingEmployeeId);
            // Add to new position
            addEmployeeToHierarchy(employee, employee.reportsTo || 'root');
        }
        editingEmployeeId = null;
    } else {
        // Add new
        addEmployeeToHierarchy(employee, employee.reportsTo || 'root');
    }
    
    resetForm();
});

function editEmployee(id) {
    const employee = employees.get(id);
    if (!employee) return;
    
    editingEmployeeId = id;
    document.getElementById('employeeId').value = id;
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeeDesignation').value = employee.designation;
    document.getElementById('employeeDepartment').value = employee.department || '';
    document.getElementById('employeeEmail').value = employee.email || '';
    document.getElementById('reportingTo').value = employee.reportsTo || 'root';
    document.getElementById('formTitle').textContent = 'Edit Employee';
    
    populateReportingToSelect();
    document.getElementById('employeeForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee? Their subordinates will be moved up.')) {
        removeEmployeeFromHierarchy(id);
    }
}

function resetForm() {
    editingEmployeeId = null;
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('formTitle').textContent = 'Add Employee';
    populateReportingToSelect();
}

function loadDefaultHierarchy() {
    if (confirm('This will replace your current hierarchy with the default structure. Continue?')) {
        hierarchy = {
            root: {
                id: 'root',
                name: 'Chandan Kumar',
                designation: 'MD & Co-Founder',
                email: 'chandan@abheepay.com',
                department: 'Top-Level Management',
                children: [
                    {
                        id: 'dir_ops',
                        name: 'Ganga Yadav',
                        designation: 'Director – Operations',
                        email: 'ganga@abheepay.com',
                        department: 'Operations',
                        children: [
                            {
                                id: 'ops_mgr',
                                name: 'Rajinder Kumar',
                                designation: 'Operations Manager',
                                email: '',
                                department: 'Operations',
                                children: [
                                    {
                                        id: 'asst_mgr_ops',
                                        name: 'Saurabh Gautam',
                                        designation: 'Asst. Manager – Ops',
                                        email: '',
                                        department: 'Operations',
                                        children: [
                                            {
                                                id: 'ops_exec1',
                                                name: 'Shivani',
                                                designation: 'Operations Executive',
                                                email: '',
                                                department: 'Operations',
                                                children: []
                                            },
                                            {
                                                id: 'ops_exec2',
                                                name: 'Rakhi Rathore',
                                                designation: 'Operations Executive',
                                                email: '',
                                                department: 'Operations',
                                                children: []
                                            },
                                            {
                                                id: 'ops_exec3',
                                                name: 'Akansha Srivastava',
                                                designation: 'Operations Executive',
                                                email: '',
                                                department: 'Operations',
                                                children: []
                                            },
                                            {
                                                id: 'ops_exec4',
                                                name: 'Tanu Kumari',
                                                designation: 'Operations Executive',
                                                email: '',
                                                department: 'Operations',
                                                children: [
                                                    {
                                                        id: 'sr_exec_ops',
                                                        name: 'Rakesh Kumar Jha',
                                                        designation: 'Senior Executive – Operations',
                                                        email: '',
                                                        department: 'Operations',
                                                        children: [
                                                            {
                                                                id: 'rel_exec',
                                                                name: 'Raju Kumar',
                                                                designation: 'Relationship Executive',
                                                                email: '',
                                                                department: 'Operations',
                                                                children: [
                                                                    {
                                                                        id: 'office_boy',
                                                                        name: 'Vinod Sain',
                                                                        designation: 'Office Boy',
                                                                        email: '',
                                                                        department: 'Operations',
                                                                        children: []
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'dir_accounts',
                        name: 'Akash Kumar',
                        designation: 'Director – Accounts',
                        email: 'akash@abheepay.com',
                        department: 'Accounts',
                        children: [
                            {
                                id: 'accounts_exec1',
                                name: 'Riya Kumari',
                                designation: 'Accounts Executive',
                                email: '',
                                department: 'Accounts',
                                children: []
                            },
                            {
                                id: 'accounts_exec2',
                                name: 'Anupam Kumar Singh',
                                designation: 'Accounts Executive',
                                email: '',
                                department: 'Accounts',
                                children: []
                            },
                            {
                                id: 'accounts_exec3',
                                name: 'Neerajpal Singh',
                                designation: 'Accounts Executive',
                                email: '',
                                department: 'Accounts',
                                children: []
                            }
                        ]
                    },
                    {
                        id: 'cro',
                        name: 'Prahlad Aryans',
                        designation: 'Chief Revenue Officer',
                        email: '',
                        department: 'Sales',
                        children: [
                            {
                                id: 'business_head_sales',
                                name: 'Amarpal Singh Gill',
                                designation: 'Business Head – Sales',
                                email: '',
                                department: 'Sales',
                                children: [
                                    {
                                        id: 'asm1',
                                        name: 'Kamlesh B. Rathod',
                                        designation: 'ASM (Sales)',
                                        email: '',
                                        department: 'Sales',
                                        children: []
                                    },
                                    {
                                        id: 'asm2',
                                        name: 'Ameen Khan',
                                        designation: 'ASM (Sales)',
                                        email: '',
                                        department: 'Sales',
                                        children: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'it_mgr',
                        name: 'Md Abdullah',
                        designation: 'IT Manager',
                        email: '',
                        department: 'IT',
                        children: [
                            {
                                id: 'asst_mgr_mis',
                                name: 'Ashu Gautam',
                                designation: 'Assistant Manager – MIS',
                                email: '',
                                department: 'IT',
                                children: [
                                    {
                                        id: 'sr_mis_exec',
                                        name: 'Manoj Singh',
                                        designation: 'Sr. MIS Executive',
                                        email: '',
                                        department: 'IT',
                                        children: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'sr_mgr_hr',
                        name: 'Manish Kumar Shah',
                        designation: 'Senior Manager – HR',
                        email: '',
                        department: 'HR',
                        children: []
                    }
                ]
            }
        };
        
        // Rebuild employees map
        employees = new Map();
        function addToMap(node) {
            if (node.id !== 'root') {
                employees.set(node.id, {
                    id: node.id,
                    name: node.name,
                    designation: node.designation,
                    email: node.email,
                    department: node.department || '',
                    reportsTo: 'root' // Will be updated based on parent
                });
            }
            node.children.forEach(child => {
                if (child.id !== 'root') {
                    employees.set(child.id, {
                        id: child.id,
                        name: child.name,
                        designation: child.designation,
                        email: child.email,
                        department: child.department || '',
                        reportsTo: node.id === 'root' ? 'root' : node.id
                    });
                }
                addToMap(child);
            });
        }
        addToMap(hierarchy.root);
        
        saveHierarchyToStorage();
        renderHierarchy();
        populateReportingToSelect();
    }
}

function clearHierarchy() {
    if (confirm('Are you sure you want to clear the entire hierarchy? This cannot be undone.')) {
        hierarchy = {
            root: {
                id: 'root',
                name: 'MD & Co-Founder',
                designation: 'MD & Co-Founder',
                email: '',
                department: '',
                children: []
            }
        };
        employees = new Map();
        saveHierarchyToStorage();
        renderHierarchy();
        populateReportingToSelect();
    }
}

function exportHierarchy() {
    const data = {
        hierarchy,
        employees: Array.from(employees.entries()),
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company-hierarchy.json';
    a.click();
    URL.revokeObjectURL(url);
}

async function exportToImage() {
    try {
        const container = document.getElementById('hierarchyTree');
        if (!container) {
            alert('Hierarchy chart not found');
            return;
        }
        
        // Use html2canvas library if available, otherwise use dom-to-image
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(container, {
                backgroundColor: '#f9fafb',
                scale: 2,
                logging: false,
                useCORS: true
            });
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'company-hierarchy.png';
            a.click();
        } else {
            // Fallback: try dom-to-image
            if (typeof domtoimage !== 'undefined') {
                const dataUrl = await domtoimage.toPng(container, {
                    bgcolor: '#f9fafb',
                    quality: 1.0,
                    width: container.scrollWidth,
                    height: container.scrollHeight
                });
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'company-hierarchy.png';
                a.click();
            } else {
                // Manual screenshot using canvas
                alert('Image export requires html2canvas or dom-to-image library. Please install one of them.');
            }
        }
    } catch (error) {
        console.error('Error exporting image:', error);
        alert('Error exporting image: ' + error.message);
    }
}

function exportToPDF() {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
        
        const container = document.getElementById('hierarchyTree');
        if (!container) {
            alert('Hierarchy chart not found');
            return;
        }
        
        // Try to get image first
        const exportImage = async () => {
            try {
                let imgData;
                if (typeof html2canvas !== 'undefined') {
                    const canvas = await html2canvas(container, {
                        backgroundColor: '#f9fafb',
                        scale: 2,
                        logging: false,
                        useCORS: true
                    });
                    imgData = canvas.toDataURL('image/png');
                } else if (typeof domtoimage !== 'undefined') {
                    imgData = await domtoimage.toPng(container, {
                        bgcolor: '#f9fafb',
                        quality: 1.0
                    });
                } else {
                    // Fallback: render text-based hierarchy
                    renderHierarchyToPDF(doc);
                    return;
                }
                
                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const imgWidth = pageWidth - 20;
                const imgHeight = (container.scrollHeight / container.scrollWidth) * imgWidth;
                
                if (imgHeight > pageHeight - 20) {
                    // Multiple pages
                    const totalPages = Math.ceil(imgHeight / (pageHeight - 20));
                    let yPos = 10;
                    let sourceY = 0;
                    
                    for (let i = 0; i < totalPages; i++) {
                        if (i > 0) doc.addPage();
                        const sourceHeight = Math.min(pageHeight - 20, container.scrollHeight - sourceY);
                        doc.addImage(imgData, 'PNG', 10, yPos, imgWidth, sourceHeight, undefined, 'FAST', 0);
                        sourceY += sourceHeight;
                    }
                } else {
                    doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                }
                
                doc.save('company-hierarchy.pdf');
            } catch (error) {
                console.error('Error exporting PDF:', error);
                renderHierarchyToPDF(doc);
            }
        };
        
        exportImage();
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

function renderHierarchyToPDF(doc) {
    const margin = 15;
    let yPos = margin;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 8;
    
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text('Company Organizational Hierarchy', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    function addNodeToPDF(node, indent = 0) {
        if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }
        
        doc.setFontSize(12);
        doc.setFont('times', node.id === 'root' ? 'bold' : 'normal');
        
        const indentStr = '  '.repeat(indent);
        const name = node.id === 'root' ? node.name : node.name;
        const designation = node.designation || '';
        const department = node.department || '';
        
        doc.text(`${indentStr}${name}`, margin + (indent * 10), yPos);
        yPos += lineHeight;
        
        if (designation) {
            doc.setFontSize(10);
            doc.setFont('times', 'italic');
            doc.text(`${indentStr}  - ${designation}`, margin + (indent * 10), yPos);
            yPos += lineHeight;
        }
        
        if (department) {
            doc.setFontSize(9);
            doc.setFont('times', 'normal');
            doc.text(`${indentStr}  Department: ${department}`, margin + (indent * 10), yPos);
            yPos += lineHeight;
        }
        
        yPos += 3;
        
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                addNodeToPDF(child, indent + 1);
            });
        }
    }
    
    addNodeToPDF(hierarchy.root, 0);
    doc.save('company-hierarchy.pdf');
}

function importHierarchy() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    hierarchy = data.hierarchy || hierarchy;
                    employees = new Map(data.employees || []);
                    saveHierarchyToStorage();
                    renderHierarchy();
                    populateReportingToSelect();
                    alert('Hierarchy imported successfully!');
                } catch (error) {
                    alert('Error importing hierarchy: ' + error.message);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Make functions globally accessible
if (typeof window !== 'undefined') {
    Object.assign(window, {
        editEmployee,
        deleteEmployee,
        resetForm,
        loadDefaultHierarchy,
        clearHierarchy,
        exportHierarchy,
        exportToImage,
        exportToPDF,
        importHierarchy
    });
}

