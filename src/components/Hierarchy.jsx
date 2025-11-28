import React, { useState, useEffect, useRef } from 'react';
import Layout from './Layout';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveHierarchyToSupabase, loadHierarchyFromSupabase } from '../services/hierarchyService';
import { useAuth } from '../contexts/AuthContext';

const Hierarchy = () => {
  const [hierarchy, setHierarchy] = useState({
    root: {
      id: 'root',
      name: 'Chandan Kumar',
      designation: 'MD & Co-Founder',
      email: 'chandan@abheepay.com',
      department: 'Top-Level Management',
      children: []
    }
  });
  const [employees, setEmployees] = useState(new Map());
  const [companyName, setCompanyName] = useState('Abheepay');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    designation: '',
    department: '',
    email: '',
    parentId: 'root',
    reportsTo: 'root',
    subordinateLayout: 'horizontal' // 'horizontal' or 'vertical' - how this employee's subordinates will be displayed
  });
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [isLoading, setIsLoading] = useState(true);
  const hierarchyTreeRef = useRef(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.jspdf = { jsPDF };
      window.html2canvas = html2canvas;
    }
    loadHierarchyData();
  }, [isAuthenticated]);

  const loadHierarchyData = async () => {
    setIsLoading(true);
    try {
      // Try to load from Supabase first if authenticated
      if (isAuthenticated) {
        const supabaseData = await loadHierarchyFromSupabase();
        if (supabaseData) {
          setHierarchy(supabaseData.hierarchy);
          setEmployees(supabaseData.employees);
          console.log('Loaded hierarchy from Supabase');
        } else {
          // Fallback to localStorage
          loadHierarchyFromStorage();
        }
      } else {
        // Not authenticated, use localStorage
        loadHierarchyFromStorage();
      }

      // Load company name and logo from localStorage
      const storedCompanyName = localStorage.getItem('hierarchyCompanyName');
      if (storedCompanyName) {
        setCompanyName(storedCompanyName);
      }
      const storedLogo = localStorage.getItem('hierarchyCompanyLogo');
      if (storedLogo) {
        setCompanyLogo(storedLogo);
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
      // Fallback to localStorage on error
      loadHierarchyFromStorage();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only render if not loading and DOM is ready
    if (!isLoading && hierarchyTreeRef.current) {
      const timer = setTimeout(() => {
        try {
          renderHierarchy();
        } catch (error) {
          console.error('Error rendering hierarchy:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hierarchy, companyName, companyLogo, employees, isLoading]);

  const loadHierarchyFromStorage = () => {
    const stored = localStorage.getItem('companyHierarchy');
    if (stored) {
      const data = JSON.parse(stored);
      const loadedHierarchy = data.hierarchy || hierarchy;
      const loadedEmployees = new Map(data.employees || []);
      
      // Ensure all employees have subordinateLayout property
      const ensureSubordinateLayout = (node) => {
        if (node.id !== 'root' && !node.subordinateLayout) {
          node.subordinateLayout = 'horizontal';
        }
        const emp = loadedEmployees.get(node.id);
        if (emp && !emp.subordinateLayout) {
          emp.subordinateLayout = 'horizontal';
          loadedEmployees.set(node.id, emp);
        }
        node.children.forEach(child => ensureSubordinateLayout(child));
      };
      ensureSubordinateLayout(loadedHierarchy.root);
      
      setHierarchy(loadedHierarchy);
      setEmployees(loadedEmployees);
    }
  };

  const saveHierarchyToStorage = async (hierarchyToSave = null, employeesToSave = null) => {
    const hierarchyData = hierarchyToSave || hierarchy;
    const employeesData = employeesToSave || employees;
    
    // Always save to localStorage as backup
    localStorage.setItem('companyHierarchy', JSON.stringify({
      hierarchy: hierarchyData,
      employees: Array.from(employeesData.entries())
    }));

    // Also save to Supabase if authenticated
    if (isAuthenticated) {
      setSyncStatus('saving');
      try {
        await saveHierarchyToSupabase(hierarchyData, employeesData);
        setSyncStatus('saved');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save to Supabase:', error);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyNameChange = (value) => {
    setCompanyName(value);
    localStorage.setItem('hierarchyCompanyName', value);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCompanyLogo(null);
      localStorage.removeItem('hierarchyCompanyLogo');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const logoData = event.target.result;
      setCompanyLogo(logoData);
      localStorage.setItem('hierarchyCompanyLogo', logoData);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setCompanyLogo(null);
    localStorage.removeItem('hierarchyCompanyLogo');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeId = formData.id || 'emp_' + Date.now();
    
    // Debug: log the formData to see what subordinateLayout value we're getting
    console.log('Saving employee with formData:', {
      id: employeeId,
      name: formData.name,
      subordinateLayout: formData.subordinateLayout,
      formDataFull: formData
    });
    
    const employee = {
      id: employeeId,
      name: formData.name.trim(),
      designation: formData.designation.trim(),
      department: formData.department.trim(),
      email: formData.email.trim(),
      reportsTo: formData.reportsTo || 'root',
      subordinateLayout: formData.subordinateLayout || 'horizontal'
    };
    
    console.log('Employee object being saved:', {
      id: employee.id,
      name: employee.name,
      subordinateLayout: employee.subordinateLayout
    });

    // The subordinateLayout in the employee object controls how THIS employee's subordinates will be displayed
    // So we just need to ensure it's saved with the employee - no need to update parent

    if (editingEmployeeId) {
      const existing = employees.get(editingEmployeeId);
      if (existing) {
        // Update the employee in the employees map
        const updatedEmployees = new Map(employees);
        updatedEmployees.set(editingEmployeeId, employee);
        setEmployees(updatedEmployees);
        
        // Update the hierarchy node directly
        const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
        const nodeToUpdate = findNodeById(updatedHierarchy.root, editingEmployeeId);
        if (nodeToUpdate) {
          nodeToUpdate.name = employee.name;
          nodeToUpdate.designation = employee.designation;
          nodeToUpdate.department = employee.department || '';
          nodeToUpdate.email = employee.email || '';
          nodeToUpdate.subordinateLayout = employee.subordinateLayout || 'horizontal';
        }
        
        // If reportsTo changed, move the employee
        if (existing.reportsTo !== employee.reportsTo) {
          removeEmployeeFromHierarchy(editingEmployeeId);
          addEmployeeToHierarchy(employee, employee.reportsTo || 'root');
        } else {
          // Ensure the hierarchy node is updated with the latest subordinateLayout
          if (nodeToUpdate) {
            // IMPORTANT: Preserve children array when updating (it should be preserved by JSON.parse, but let's be explicit)
            const existingChildren = nodeToUpdate.children || [];
            
            nodeToUpdate.subordinateLayout = employee.subordinateLayout || 'horizontal';
            // Also update other fields to ensure consistency
            nodeToUpdate.name = employee.name;
            nodeToUpdate.designation = employee.designation;
            nodeToUpdate.department = employee.department || '';
            nodeToUpdate.email = employee.email || '';
            // Ensure children array is preserved
            if (!nodeToUpdate.children || nodeToUpdate.children.length !== existingChildren.length) {
              nodeToUpdate.children = existingChildren;
            }
            
            // Debug: verify what we're saving
            console.log('Updated hierarchy node:', {
              id: nodeToUpdate.id,
              name: nodeToUpdate.name,
              subordinateLayout: nodeToUpdate.subordinateLayout,
              employeeSubordinateLayout: employee.subordinateLayout,
              childrenCount: nodeToUpdate.children.length,
              children: nodeToUpdate.children.map(c => ({ id: c.id, name: c.name }))
            });
          }
          setHierarchy(updatedHierarchy);
          setEmployees(updatedEmployees);
          saveHierarchyToStorage(updatedHierarchy, updatedEmployees);
          
          // Debug: verify what's in the employees map after update
          const savedEmployee = updatedEmployees.get(editingEmployeeId);
          console.log('Employee in map after save:', {
            id: savedEmployee?.id,
            name: savedEmployee?.name,
            subordinateLayout: savedEmployee?.subordinateLayout
          });
        }
      }
      setEditingEmployeeId(null);
    } else {
      addEmployeeToHierarchy(employee, employee.reportsTo || 'root');
    }

    resetForm();
  };

  const findNodeById = (node, id) => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  const addEmployeeToHierarchy = (employee, parentId) => {
    const employeeNode = {
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      department: employee.department || '',
      email: employee.email || '',
      subordinateLayout: employee.subordinateLayout || 'horizontal',
      children: []
    };

    const updatedEmployees = new Map(employees);
    updatedEmployees.set(employee.id, employee);
    setEmployees(updatedEmployees);

    const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
    if (parentId === 'root' || !parentId) {
      updatedHierarchy.root.children.push(employeeNode);
    } else {
      const parent = findNodeById(updatedHierarchy.root, parentId);
      if (parent) {
        parent.children.push(employeeNode);
      } else {
        updatedHierarchy.root.children.push(employeeNode);
      }
    }

    setHierarchy(updatedHierarchy);
    setEmployees(updatedEmployees);
    saveHierarchyToStorage(updatedHierarchy, updatedEmployees);
  };

  const removeEmployeeFromHierarchy = (employeeId) => {
    const updatedEmployees = new Map(employees);
    updatedEmployees.delete(employeeId);
    setEmployees(updatedEmployees);

    const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
    function removeFromNode(node) {
      node.children = node.children.filter(child => {
        if (child.id === employeeId) {
          if (node.id === 'root') {
            updatedHierarchy.root.children.push(...child.children);
          } else {
            node.children.push(...child.children);
          }
          return false;
        }
        removeFromNode(child);
        return true;
      });
    }
    removeFromNode(updatedHierarchy.root);
    setHierarchy(updatedHierarchy);
    saveHierarchyToStorage();
  };

  const editEmployee = (id) => {
    const employee = employees.get(id);
    if (!employee) return;
    setEditingEmployeeId(id);
    
    // Find the parent of this employee
    const findParent = (node, targetId) => {
      for (const child of node.children) {
        if (child.id === targetId) return node.id;
        const found = findParent(child, targetId);
        if (found) return found;
      }
      return null;
    };
    const parentId = findParent(hierarchy.root, id) || 'root';
    
    const formDataToSet = {
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      department: employee.department || '',
      email: employee.email || '',
      parentId: parentId,
      reportsTo: employee.reportsTo || 'root',
      subordinateLayout: employee.subordinateLayout || 'horizontal'
    };
    
    // Debug: log what we're loading into the form
    console.log('Loading employee for edit:', {
      employeeId: id,
      employeeFromMap: employee,
      employeeSubordinateLayout: employee.subordinateLayout,
      formDataSubordinateLayout: formDataToSet.subordinateLayout
    });
    
    setFormData(formDataToSet);
  };

  const deleteEmployee = (id) => {
    if (confirm('Are you sure you want to delete this employee? Their subordinates will be moved up.')) {
      removeEmployeeFromHierarchy(id);
    }
  };

  const resetForm = () => {
    setEditingEmployeeId(null);
    setFormData({
      id: '',
      name: '',
      designation: '',
      department: '',
      email: '',
      parentId: 'root',
      reportsTo: 'root',
      subordinateLayout: 'horizontal'
    });
  };

  const renderHierarchy = () => {
    const container = hierarchyTreeRef.current;
    if (!container) return;

    container.innerHTML = '';

    // Add company header with logo and name
    const headerDiv = document.createElement('div');
    headerDiv.className = 'text-center mb-8 pb-4 border-b-2 border-gray-300';
    headerDiv.innerHTML = `
      <div class="flex items-center justify-center gap-4 mb-2">
        ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" class="h-12 w-auto object-contain" />` : ''}
        <h2 class="text-2xl font-bold text-primary-600">${companyName} Hierarchy</h2>
      </div>
    `;
    container.appendChild(headerDiv);

    // Render root node (MD & Co-Founder - Chandan Kumar)
    const rootDiv = document.createElement('div');
    rootDiv.className = 'text-center mb-8';
    const rootEmailDisplay = hierarchy.root.email && hierarchy.root.email.trim() ? `<div class="text-xs opacity-75 mt-1">${hierarchy.root.email}</div>` : '';
    rootDiv.innerHTML = `
      <div class="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-lg shadow-lg">
        <div class="font-bold text-lg">${hierarchy.root.name}</div>
        <div class="text-sm opacity-90">${hierarchy.root.designation}</div>
        ${hierarchy.root.department ? `<div class="text-xs opacity-75 mt-1">${hierarchy.root.department}</div>` : ''}
        ${rootEmailDisplay}
      </div>
    `;
    container.appendChild(rootDiv);

    if (hierarchy.root.children.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'text-center py-20';
      emptyDiv.innerHTML = '<p class="text-gray-500">Click "Add Employee" to start building your hierarchy</p>';
      container.appendChild(emptyDiv);
      return;
    }

    // Render children of root node
    if (hierarchy.root.children.length > 0) {
      // Add vertical connector from root to children
      const connectorDiv = document.createElement('div');
      connectorDiv.className = 'flex justify-center mb-4';
      connectorDiv.innerHTML = '<div class="w-0.5 h-6 bg-gray-400"></div>';
      container.appendChild(connectorDiv);

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'mt-6';
      renderNodeChildren(hierarchy.root, childrenContainer, 0);
      container.appendChild(childrenContainer);
    }
  };

  const renderNodeChildren = (node, container, level) => {
    if (node.children.length === 0) return;

    // First level (under root) is always horizontal
    // For deeper levels, check the parent's subordinateLayout preference
    let useHorizontalLayout = true;
    if (level > 0) {
      // Get the parent's layout preference
      const parentEmployee = employees.get(node.id);
      const layoutPreference = parentEmployee?.subordinateLayout || node.subordinateLayout || 'horizontal';
      useHorizontalLayout = layoutPreference === 'horizontal';
    }

    const childrenDiv = document.createElement('div');
    if (useHorizontalLayout) {
      // Adjust gap based on number of children - smaller gap for more children
      const gapSize = node.children.length > 5 ? 'gap-1' : node.children.length > 3 ? 'gap-2' : 'gap-3';
      childrenDiv.className = `flex flex-row flex-nowrap justify-center ${gapSize} mb-6 relative w-full overflow-x-auto`;
    } else {
      // Vertical layout - ensure items stack vertically
      childrenDiv.className = 'flex flex-col items-center gap-6 mb-6 relative w-full';
      childrenDiv.style.display = 'flex';
      childrenDiv.style.flexDirection = 'column';
      childrenDiv.style.width = '100%';
    }

    node.children.forEach((child, index) => {
      const employeeRow = document.createElement('div');
      // For vertical layout, don't use flex-1, use full width
      if (useHorizontalLayout) {
        employeeRow.className = 'flex flex-col items-center relative flex-1 min-w-0';
      } else {
        employeeRow.className = 'flex flex-col items-center relative w-full';
      }

      // Vertical connector from parent to this employee
      const topConnector = document.createElement('div');
      topConnector.className = 'w-0.5 h-6 bg-gray-400 mb-2 relative z-10';
      topConnector.style.marginTop = '0';
      employeeRow.appendChild(topConnector);

      // Employee card
      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'flex flex-col items-center relative w-full';
      
      const card = document.createElement('div');
      card.className = 'bg-white border-2 border-gray-300 rounded-lg p-2 shadow-md w-full max-w-[200px] mx-auto relative group hover:border-primary-500 transition-colors';
      const emailDisplay = child.email && child.email.trim() ? `<div class="text-xs text-gray-500 mb-1 break-words truncate" title="${child.email}">${child.email}</div>` : '';
      card.innerHTML = `
        <div class="text-center">
          <div class="font-bold text-gray-800 mb-1 text-sm leading-tight">${child.name}</div>
          <div class="text-xs text-gray-600 mb-1 leading-tight">${child.designation}</div>
          ${child.department ? `<div class="text-xs text-primary-600 mb-1 font-medium leading-tight">${child.department}</div>` : ''}
          ${emailDisplay}
          <div class="flex gap-1 justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onclick="window.editEmployeeReact('${child.id}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
            <button onclick="window.deleteEmployeeReact('${child.id}')" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
          </div>
        </div>
      `;
      cardWrapper.appendChild(card);

      // Debug: Always log child info to see if children array is populated
      console.log(`Checking employee: ${child.name}`, {
        id: child.id,
        childrenCount: child.children.length,
        children: child.children.map(c => ({ id: c.id, name: c.name }))
      });
      
      // If this employee has subordinates, display them based on their layout preference
      if (child.children.length > 0) {
        // Get layout preference for this employee's subordinates
        const employeeData = employees.get(child.id);
        // Check both employees Map and hierarchy node for subordinateLayout
        // Priority: employees Map first (most up-to-date), then hierarchy node, then default to horizontal
        // Explicitly check for 'horizontal' or 'vertical' strings, not just truthy values
        let childLayoutPreference = 'horizontal'; // Default
        if (employeeData?.subordinateLayout === 'horizontal' || employeeData?.subordinateLayout === 'vertical') {
          childLayoutPreference = employeeData.subordinateLayout;
        } else if (child.subordinateLayout === 'horizontal' || child.subordinateLayout === 'vertical') {
          childLayoutPreference = child.subordinateLayout;
        }
        const useHorizontalForSubs = childLayoutPreference === 'horizontal';
        
        // Debug: log the layout preference to help diagnose issues
        console.log(`Rendering subordinates for: ${child.name}`, {
          employeeDataLayout: employeeData?.subordinateLayout,
          nodeLayout: child.subordinateLayout,
          finalPreference: childLayoutPreference,
          useHorizontal: useHorizontalForSubs,
          numChildren: child.children.length
        });
        
        // Add vertical connector line from employee card down to subordinates
        const verticalConnector = document.createElement('div');
        verticalConnector.className = 'w-0.5 h-6 bg-gray-400 mt-2';
        cardWrapper.appendChild(verticalConnector);

        const subordinatesContainer = document.createElement('div');
        if (useHorizontalForSubs) {
          // Adjust gap based on number of children
          const gapSize = child.children.length > 5 ? 'gap-1' : child.children.length > 3 ? 'gap-2' : 'gap-3';
          subordinatesContainer.className = `flex flex-row flex-nowrap ${gapSize} justify-center mt-2 relative w-full overflow-x-auto`;
          subordinatesContainer.style.display = 'flex';
          subordinatesContainer.style.flexDirection = 'row';
          subordinatesContainer.style.flexWrap = 'nowrap';
        } else {
          // Vertical layout - stack items top to bottom
          subordinatesContainer.className = 'flex flex-col items-center gap-4 mt-2 relative w-full';
          subordinatesContainer.style.display = 'flex';
          subordinatesContainer.style.flexDirection = 'column';
          subordinatesContainer.style.flexWrap = 'nowrap';
          subordinatesContainer.style.width = '100%';
          subordinatesContainer.style.alignItems = 'center';
        }
        
        // Add horizontal connector line above subordinates if more than one and using horizontal layout
        if (child.children.length > 1 && useHorizontalForSubs) {
          const horizontalLine = document.createElement('div');
          horizontalLine.className = 'absolute top-[-12px] left-0 right-0 h-0.5 bg-gray-400';
          horizontalLine.style.zIndex = '1';
          subordinatesContainer.appendChild(horizontalLine);
        }

        child.children.forEach((subordinate, subIndex) => {
          const subWrapper = document.createElement('div');
          // For vertical layout, don't use flex-1, use full width
          if (useHorizontalForSubs) {
            subWrapper.className = 'flex flex-col items-center relative flex-1 min-w-0';
            subWrapper.style.flex = '1 1 0%';
            subWrapper.style.minWidth = '0';
          } else {
            subWrapper.className = 'flex flex-col items-center relative w-full';
            subWrapper.style.width = '100%';
            subWrapper.style.flex = 'none';
            subWrapper.style.maxWidth = '100%';
          }

          // Vertical connector from manager to subordinate (always show, even for single subordinate)
          const subConnector = document.createElement('div');
          subConnector.className = 'w-0.5 h-6 bg-gray-400 mb-2 relative z-10';
          subWrapper.appendChild(subConnector);

          const subCard = document.createElement('div');
          subCard.className = 'bg-white border-2 border-gray-300 rounded-lg p-2 shadow-md w-full max-w-[200px] mx-auto relative group hover:border-primary-500 transition-colors';
          const subEmailDisplay = subordinate.email && subordinate.email.trim() ? `<div class="text-xs text-gray-500 mb-1 break-words truncate" title="${subordinate.email}">${subordinate.email}</div>` : '';
          subCard.innerHTML = `
            <div class="text-center">
              <div class="font-bold text-gray-800 mb-1 text-sm leading-tight">${subordinate.name}</div>
              <div class="text-xs text-gray-600 mb-1 leading-tight">${subordinate.designation}</div>
              ${subordinate.department ? `<div class="text-xs text-primary-600 mb-1 font-medium leading-tight">${subordinate.department}</div>` : ''}
              ${subEmailDisplay}
              <div class="flex gap-1 justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="window.editEmployeeReact('${subordinate.id}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                <button onclick="window.deleteEmployeeReact('${subordinate.id}')" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
              </div>
            </div>
          `;
          subWrapper.appendChild(subCard);

          // If subordinate has children, add vertical connector and render them
          if (subordinate.children.length > 0) {
            // Get layout preference for this subordinate's children
            const subEmployeeData = employees.get(subordinate.id);
            const subChildLayoutPreference = subEmployeeData?.subordinateLayout || subordinate.subordinateLayout || 'horizontal';
            const useHorizontalForDeepSubs = subChildLayoutPreference === 'horizontal';
            
            const subVerticalConnector = document.createElement('div');
            subVerticalConnector.className = 'w-0.5 h-6 bg-gray-400 mt-2';
            subWrapper.appendChild(subVerticalConnector);

            const deeperContainer = document.createElement('div');
            if (useHorizontalForDeepSubs) {
              // Adjust gap based on number of children
              const gapSize = subordinate.children.length > 5 ? 'gap-1' : subordinate.children.length > 3 ? 'gap-2' : 'gap-3';
              deeperContainer.className = `flex flex-row flex-nowrap ${gapSize} justify-center mt-2 relative w-full overflow-x-auto`;
              deeperContainer.style.display = 'flex';
              deeperContainer.style.flexDirection = 'row';
              deeperContainer.style.flexWrap = 'nowrap';
            } else {
              deeperContainer.className = 'flex flex-col items-center gap-3 mt-2 relative w-full';
              deeperContainer.style.display = 'flex';
              deeperContainer.style.flexDirection = 'column';
              deeperContainer.style.flexWrap = 'nowrap';
              deeperContainer.style.width = '100%';
              deeperContainer.style.alignItems = 'center';
            }
            
            // Horizontal line for multiple subordinates (only if using horizontal layout)
            if (subordinate.children.length > 1 && useHorizontalForDeepSubs) {
              const deeperHorizontalLine = document.createElement('div');
              deeperHorizontalLine.className = 'absolute top-[-12px] left-0 right-0 h-0.5 bg-gray-400';
              deeperHorizontalLine.style.zIndex = '1';
              deeperContainer.appendChild(deeperHorizontalLine);
            }

            subordinate.children.forEach((deepSub, deepIndex) => {
              const deepWrapper = document.createElement('div');
              // For vertical layout, don't use flex-1, use full width
              if (useHorizontalForDeepSubs) {
                deepWrapper.className = 'flex flex-col items-center relative flex-1 min-w-0';
                deepWrapper.style.flex = '1 1 0%';
                deepWrapper.style.minWidth = '0';
              } else {
                deepWrapper.className = 'flex flex-col items-center relative w-full';
                deepWrapper.style.width = '100%';
                deepWrapper.style.flex = 'none';
                deepWrapper.style.maxWidth = '100%';
              }

              const deepConnector = document.createElement('div');
              deepConnector.className = 'w-0.5 h-6 bg-gray-400 mb-2 relative z-10';
              deepWrapper.appendChild(deepConnector);

              const deepCard = document.createElement('div');
              deepCard.className = 'bg-white border-2 border-gray-300 rounded-lg p-2 shadow-md w-full max-w-[200px] mx-auto relative group hover:border-primary-500 transition-colors';
              const deepEmailDisplay = deepSub.email && deepSub.email.trim() ? `<div class="text-xs text-gray-500 mb-1 break-words truncate" title="${deepSub.email}">${deepSub.email}</div>` : '';
              deepCard.innerHTML = `
                <div class="text-center">
                  <div class="font-bold text-gray-800 mb-1 text-sm leading-tight">${deepSub.name}</div>
                  <div class="text-xs text-gray-600 mb-1 leading-tight">${deepSub.designation}</div>
                  ${deepSub.department ? `<div class="text-xs text-primary-600 mb-1 font-medium leading-tight">${deepSub.department}</div>` : ''}
                  ${deepEmailDisplay}
                  <div class="flex gap-1 justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="window.editEmployeeReact('${deepSub.id}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                    <button onclick="window.deleteEmployeeReact('${deepSub.id}')" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                  </div>
                </div>
              `;
              deepWrapper.appendChild(deepCard);

              // Recursively handle even deeper levels
              if (deepSub.children.length > 0) {
                const evenDeeperContainer = document.createElement('div');
                evenDeeperContainer.className = 'mt-4 w-full';
                // Pass level + 1 to indicate we're going deeper
                renderNodeChildren(deepSub, evenDeeperContainer, level + 1);
                deepWrapper.appendChild(evenDeeperContainer);
              }

              deeperContainer.appendChild(deepWrapper);
            });

            subWrapper.appendChild(deeperContainer);
          }

          subordinatesContainer.appendChild(subWrapper);
        });

        cardWrapper.appendChild(subordinatesContainer);
      }

      employeeRow.appendChild(cardWrapper);
      childrenDiv.appendChild(employeeRow);
    });

    // Add horizontal connector line above children if more than one and using horizontal layout
    // Add it after all children are added so we can position it correctly
    if (node.children.length > 1 && useHorizontalLayout) {
      const horizontalLine = document.createElement('div');
      horizontalLine.className = 'absolute h-0.5 bg-gray-400';
      horizontalLine.style.top = '0px';
      horizontalLine.style.left = '0';
      horizontalLine.style.right = '0';
      horizontalLine.style.zIndex = '0';
      horizontalLine.style.pointerEvents = 'none';
      // Insert at the beginning of childrenDiv
      childrenDiv.insertBefore(horizontalLine, childrenDiv.firstChild);
    }

    container.appendChild(childrenDiv);
  };

  // Expose functions to window for onclick handlers in dynamically created HTML
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.editEmployeeReact = (id) => {
        editEmployee(id);
      };
      window.deleteEmployeeReact = (id) => {
        if (confirm('Are you sure you want to delete this employee?')) {
          deleteEmployee(id);
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.editEmployeeReact;
        delete window.deleteEmployeeReact;
      }
    };
  }, [employees, hierarchy]);

  const exportToImage = async () => {
    try {
      const container = hierarchyTreeRef.current;
      if (!container) {
        alert('Hierarchy chart not found');
        return;
      }

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
        alert('html2canvas library is required for image export.');
      }
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Error exporting image: ' + error.message);
    }
  };

  const exportToPDF = async () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library not loaded. Please refresh the page.');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4');
      const container = hierarchyTreeRef.current;
      if (!container) {
        alert('Hierarchy chart not found');
        return;
      }

      if (typeof html2canvas !== 'undefined') {
        const canvas = await html2canvas(container, {
          backgroundColor: '#f9fafb',
          scale: 2,
          logging: false,
          useCORS: true
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 280;
        const pageHeight = doc.internal.pageSize.height;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        doc.save('company-hierarchy.pdf');
      } else {
        alert('html2canvas library is required for PDF export.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const exportHierarchy = () => {
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
  };

  const importHierarchy = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate the imported data structure
          if (!data.hierarchy || !data.hierarchy.root) {
            throw new Error('Invalid hierarchy format. Missing root node.');
          }

          // Ensure all employees have subordinateLayout property
          const ensureSubordinateLayout = (node) => {
            if (node.id !== 'root' && !node.subordinateLayout) {
              node.subordinateLayout = 'horizontal';
            }
            if (node.children) {
              node.children.forEach(child => ensureSubordinateLayout(child));
            }
          };
          ensureSubordinateLayout(data.hierarchy.root);

          // Convert employees array back to Map
          const employeesMap = new Map();
          if (data.employees && Array.isArray(data.employees)) {
            data.employees.forEach(([id, emp]) => {
              if (!emp.subordinateLayout) {
                emp.subordinateLayout = 'horizontal';
              }
              employeesMap.set(id, emp);
            });
          }

          // Update state
          setHierarchy(data.hierarchy);
          setEmployees(employeesMap);

          // Save to storage and Supabase
          saveHierarchyToStorage(data.hierarchy, employeesMap);

          // Show success message
          alert('Hierarchy imported successfully! The page will refresh to show the new structure.');
          
          // Refresh the hierarchy display
          setTimeout(() => {
            renderHierarchy();
          }, 100);
        } catch (error) {
          console.error('Error importing hierarchy:', error);
          alert('Error importing hierarchy: ' + error.message + '\n\nPlease ensure the JSON file is a valid hierarchy export from this system.');
        }
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const loadDefaultHierarchy = () => {
    if (confirm('This will replace your current hierarchy with the default structure. Continue?')) {
      const defaultHierarchy = {
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
      const newEmployees = new Map();
      const addToMap = (node, parentId = 'root') => {
        if (node.id !== 'root') {
          newEmployees.set(node.id, {
            id: node.id,
            name: node.name,
            designation: node.designation,
            email: node.email,
            department: node.department || '',
            reportsTo: parentId,
            subordinateLayout: 'horizontal' // Default to horizontal for all employees
          });
        }
        node.children.forEach(child => {
          addToMap(child, node.id);
        });
      };
      addToMap(defaultHierarchy.root);

      setHierarchy(defaultHierarchy);
      setEmployees(newEmployees);
      saveHierarchyToStorage(defaultHierarchy, newEmployees);
    }
  };

  const clearHierarchy = () => {
    if (confirm('Are you sure you want to clear the entire hierarchy? This cannot be undone.')) {
      setHierarchy({
        root: {
          id: 'root',
          name: 'Chandan Kumar',
          designation: 'MD & Co-Founder',
          email: 'chandan@abheepay.com',
          department: 'Top-Level Management',
          children: []
        }
      });
      setEmployees(new Map());
      saveHierarchyToStorage();
    }
  };

  const reportingOptions = Array.from(employees.entries())
    .filter(([id]) => id !== editingEmployeeId)
    .map(([id, emp]) => ({ id, ...emp }));

  // Get all employees in hierarchy for parent selection
  const getAllEmployees = () => {
    const all = [];
    const traverse = (node) => {
      if (node.id !== 'root') {
        all.push({ id: node.id, name: node.name, designation: node.designation, department: node.department });
      }
      node.children.forEach(child => traverse(child));
    };
    traverse(hierarchy.root);
    return all;
  };

  // Get children of a specific parent
  const getChildrenOfParent = (parentId) => {
    if (parentId === 'root') {
      return hierarchy.root.children.map(child => ({
        id: child.id,
        name: child.name,
        designation: child.designation,
        department: child.department
      }));
    }
    const parent = findNodeById(hierarchy.root, parentId);
    if (parent) {
      return parent.children.map(child => ({
        id: child.id,
        name: child.name,
        designation: child.designation,
        department: child.department
      }));
    }
    return [];
  };

  const handleParentChange = (parentId) => {
    // When parent changes, reset reportsTo to the parent (user can then select a child if needed)
    // Also set default subordinateLayout based on parent level
    setFormData(prev => ({
      ...prev,
      parentId: parentId,
      reportsTo: parentId === 'root' ? 'root' : parentId,
      subordinateLayout: parentId === 'root' ? 'horizontal' : 'horizontal' // Default to horizontal
    }));
  };

  if (isLoading) {
    return (
      <Layout title="Company Hierarchy Manager" description="Visualize and manage your organizational structure" icon="🏛️">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-xl">Loading hierarchy data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Company Hierarchy Manager" description="Visualize and manage your organizational structure" icon="🏛️">
      <div className="w-full px-[1%]">
        {/* Sync Status Indicator */}
        {isAuthenticated && (
          <div className="mb-4 flex items-center justify-end gap-2">
            {syncStatus === 'saving' && (
              <div className="flex items-center gap-2 text-yellow-300 text-sm">
                <span className="animate-spin">⏳</span>
                <span>Saving to cloud...</span>
              </div>
            )}
            {syncStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <span>✓</span>
                <span>Saved to cloud</span>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <span>✗</span>
                <span>Sync failed (saved locally)</span>
              </div>
            )}
            {syncStatus === 'idle' && isAuthenticated && (
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <span>☁️</span>
                <span>Auto-sync enabled</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-[2%] w-full">
          {/* Hierarchy Tree View - 80% width */}
          <div className="w-full lg:w-[80%]">
          <div className="card shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0 flex-1">
                {companyName ? `${companyName} Hierarchy` : 'Organization Chart'}
              </h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={importHierarchy} className="btn-secondary text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-300">
                  📥 Import JSON
                </button>
                <button onClick={exportToImage} className="btn-secondary text-sm">Export Image</button>
                <button onClick={exportToPDF} className="btn-secondary text-sm">Export PDF</button>
                <button onClick={exportHierarchy} className="btn-secondary text-sm">Export JSON</button>
              </div>
            </div>
            <div 
              ref={hierarchyTreeRef}
              className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 min-h-[600px] overflow-auto"
            />
          </div>
          </div>

          {/* Employee Management Panel - 18% width */}
          <div className="w-full lg:w-[18%] space-y-6">
            {/* Company Info */}
            <div className="card shadow-xl">
            <h2 className="section-title">Company Info</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Company Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  placeholder="Enter company name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name appears above the organization chart and in exports.
                </p>
              </div>
              <div>
                <label className="form-label">Company Logo (Optional):</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input"
                  onChange={handleLogoUpload}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPG, PNG, GIF (Max 2MB)
                </p>
                {companyLogo && (
                  <div className="mt-3 p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Logo Preview:</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={companyLogo}
                        alt="Company Logo Preview"
                        className="h-16 w-auto border-2 border-gray-300 rounded p-2 bg-white object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-sm text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove Logo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
            {/* Add/Edit Employee Form */}
            <div className="card shadow-xl">
            <h2 className="section-title" id="formTitle">{editingEmployeeId ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Employee Name: <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Full Name" 
                  required 
                />
              </div>
              <div>
                <label className="form-label">Designation: <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="e.g., Director - Operations" 
                  required 
                />
              </div>
              <div>
                <label className="form-label">Department:</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Engineering, Sales" 
                />
              </div>
              <div>
                <label className="form-label">Parent (Select First):</label>
                <select 
                  className="form-input"
                  value={formData.parentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                >
                  <option value="root">MD & Co-Founder (Top Level)</option>
                  {getAllEmployees()
                    .filter(emp => emp.id !== editingEmployeeId)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.designation} ({emp.department || 'N/A'})
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  First, select the parent under which this employee will be added.
                </p>
              </div>
              <div>
                <label className="form-label">Reports To (Select Manager):</label>
                <select 
                  className="form-input"
                  value={formData.reportsTo}
                  onChange={(e) => handleInputChange('reportsTo', e.target.value)}
                >
                  {formData.parentId === 'root' ? (
                    <>
                      <option value="root">MD & Co-Founder (Top Level)</option>
                      {hierarchy.root.children
                        .filter(emp => emp.id !== editingEmployeeId)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.designation} ({emp.department || 'N/A'})
                          </option>
                        ))}
                    </>
                  ) : (
                    <>
                      <option value={formData.parentId}>
                        {getAllEmployees().find(e => e.id === formData.parentId)?.name || 'Parent'} (Direct Report)
                      </option>
                      {getChildrenOfParent(formData.parentId)
                        .filter(emp => emp.id !== editingEmployeeId)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.designation} ({emp.department || 'N/A'})
                          </option>
                        ))}
                    </>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.parentId === 'root' 
                    ? 'Select the manager this employee will report to. You can select the MD & Co-Founder or any other top-level employee.'
                    : 'Select the manager this employee will report to. You can select the parent or any of its subordinates.'}
                </p>
              </div>
              <div>
                <label className="form-label">
                  Subordinate Layout: 
                  <span className="text-xs text-gray-500 ml-2">(How employees under this person will be displayed)</span>
                </label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.subordinateLayout === 'horizontal' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="subordinateLayout"
                        value="horizontal"
                        checked={formData.subordinateLayout === 'horizontal'}
                        onChange={(e) => handleInputChange('subordinateLayout', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-2xl mb-2">↔️</div>
                      <div className="text-sm font-semibold text-center">Horizontal</div>
                      <div className="text-xs text-gray-600 text-center mt-1">Side by Side</div>
                    </label>
                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.subordinateLayout === 'vertical' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="subordinateLayout"
                        value="vertical"
                        checked={formData.subordinateLayout === 'vertical'}
                        onChange={(e) => handleInputChange('subordinateLayout', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-2xl mb-2">↕️</div>
                      <div className="text-sm font-semibold text-center">Vertical</div>
                      <div className="text-xs text-gray-600 text-center mt-1">Top to Bottom</div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Choose how employees reporting to this person will be arranged. This controls how subordinates under this employee will be displayed (vertically stacked or side by side).
                  </p>
                </div>
              <div>
                <label className="form-label">Email:</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@company.com" 
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Save Employee</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
            </div>

            {/* Quick Actions */}
            <div className="card shadow-xl">
            <h2 className="section-title">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={loadDefaultHierarchy} className="btn-secondary w-full bg-blue-50 text-blue-700 hover:bg-blue-100">Load Default Hierarchy</button>
              <button onClick={importHierarchy} className="btn-secondary w-full">Import from JSON</button>
              <button onClick={clearHierarchy} className="btn-secondary w-full bg-red-50 text-red-700 hover:bg-red-100">Clear All</button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hierarchy;
