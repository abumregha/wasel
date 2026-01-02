// Global variables
let currentLang = 'ar';
let invoices = JSON.parse(localStorage.getItem('invoices')) || [];
let currentTheme = localStorage.getItem('theme') || 'blue';
let companyName = localStorage.getItem('companyName') || '';
let companyLogo = localStorage.getItem('companyLogo') || '';

// Generic logos (base64 placeholders, replace with actual)
const genericLogos = {
    logo1: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // Placeholder
    logo2: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    logo3: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    logo4: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    logo5: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
};

// DOM elements
const langToggle = document.getElementById('lang-toggle');
const customizeCompanyBtn = document.getElementById('customize-company');
const newInvoiceBtn = document.getElementById('new-invoice');
const exportImportBtn = document.getElementById('export-import');
const mainContent = document.getElementById('main-content');
const companyHeader = document.getElementById('company-header');
const companyNameDisplay = document.getElementById('company-name-display');
const companyLogoDisplay = document.getElementById('company-logo-display');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
    updateCompanyHeader();
    if (!companyName) {
        showCustomizeCompany();
    } else {
        showInvoiceForm();
    }
    registerSW();
    updateTexts();
});

// Language toggle
langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    updateTexts();
});

// Apply theme
function applyTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
}

// Update company header
function updateCompanyHeader() {
    if (companyName) {
        companyHeader.style.display = 'block';
        companyNameDisplay.textContent = companyName;
        companyNameDisplay.style.color = `var(--primary)`;
        if (companyLogo) {
            companyLogoDisplay.innerHTML = `<img src="${companyLogo}" alt="Logo" style="max-width: 100px; max-height: 50px;">`;
        } else {
            companyLogoDisplay.innerHTML = '';
        }
    } else {
        companyHeader.style.display = 'none';
    }
}

// Show customize company
function showCustomizeCompany() {
    mainContent.innerHTML = `
        <div class="invoice-form">
            <h2>تخصيص الشركة</h2>
            <div class="form-group">
                <label for="company-name">اسم الشركة</label>
                <input type="text" id="company-name" value="${companyName}" required>
            </div>
            <div class="form-group">
                <label>اختيار اللون</label>
                <select id="theme-select">
                    <option value="blue" ${currentTheme === 'blue' ? 'selected' : ''}>أزرق</option>
                    <option value="green" ${currentTheme === 'green' ? 'selected' : ''}>أخضر</option>
                    <option value="red" ${currentTheme === 'red' ? 'selected' : ''}>أحمر</option>
                    <option value="orange" ${currentTheme === 'orange' ? 'selected' : ''}>برتقالي</option>
                    <option value="purple" ${currentTheme === 'purple' ? 'selected' : ''}>بنفسجي</option>
                    <option value="black" ${currentTheme === 'black' ? 'selected' : ''}>أسود</option>
                </select>
            </div>
            <button id="save-company">حفظ</button>
        </div>
    `;
    document.getElementById('save-company').addEventListener('click', saveCompany);
}

// Show invoice form
function showInvoiceForm() {
    mainContent.innerHTML = `
        <form class="invoice-form" id="invoice-form">
            <h2>فاتورة جديدة</h2>
            <div class="form-group">
                <label>نوع الفاتورة</label>
                <select id="invoice-type">
                    <option value="مبدئية">مبدئية</option>
                    <option value="نهائية">نهائية</option>
                </select>
            </div>
            <div class="form-group">
                <label for="client-name">اسم العميل</label>
                <input type="text" id="client-name" required>
            </div>
            <div class="form-group">
                <label for="client-phone">رقم الهاتف</label>
                <input type="tel" id="client-phone">
            </div>
            <div class="form-group">
                <label for="client-address">العنوان</label>
                <textarea id="client-address"></textarea>
            </div>
            <div class="form-group">
                <label for="client-email">البريد الإلكتروني</label>
                <input type="email" id="client-email">
            </div>
            <h3>العناصر</h3>
            <table id="items-table">
                <thead>
                    <tr>
                        <th>اسم العنصر</th>
                        <th>السعر</th>
                        <th>الكمية</th>
                        <th>الإجمالي</th>
                        <th>إجراء</th>
                    </tr>
                </thead>
                <tbody id="items-tbody">
                    <tr class="item-row">
                        <td><input type="text" class="item-desc" placeholder="الوصف"></td>
                        <td><input type="number" class="item-price" step="0.01" placeholder="0.00"></td>
                        <td><input type="number" class="item-qty" min="1" placeholder="1"></td>
                        <td class="item-total">0.00</td>
                        <td><button type="button" class="remove-item">حذف</button></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">الإجمالي الكلي</td>
                        <td id="grand-total">0.00</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colspan="3">المدفوع</td>
                        <td><input type="number" id="paid" step="0.01" placeholder="0.00"></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colspan="3">المتبقي</td>
                        <td id="remaining">0.00</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <button type="button" id="add-item">إضافة عنصر</button>
            <div class="form-actions">
                <button type="button" id="download-pdf">تنزيل PDF</button>
            </div>
        </form>
    `;

    // Add item functionality
    document.getElementById('add-item').addEventListener('click', addItem);
    // Download PDF instead of save/preview
    const downloadBtn = document.getElementById('download-pdf');
    if (downloadBtn) downloadBtn.addEventListener('click', () => {
        // build invoice from form and download PDF
        const invoice = {
            id: generateInvoiceId(),
            date: new Date().toISOString(),
            type: document.getElementById('invoice-type').value,
            client: {
                name: document.getElementById('client-name').value,
                phone: document.getElementById('client-phone').value,
                address: document.getElementById('client-address').value,
                email: document.getElementById('client-email').value
            },
            items: Array.from(document.querySelectorAll('.item-row')).map(row => ({
                desc: row.querySelector('.item-desc').value,
                price: parseFloat(row.querySelector('.item-price').value) || 0,
                qty: parseFloat(row.querySelector('.item-qty').value) || 0,
                total: parseFloat(row.querySelector('.item-total').textContent) || 0
            })),
            grandTotal: parseFloat(document.getElementById('grand-total').textContent),
            paid: parseFloat(document.getElementById('paid').value) || 0,
            remaining: parseFloat(document.getElementById('remaining').textContent),
            theme: currentTheme,
            companyName,
            companyLogo
        };
        downloadPDFFromInvoice(invoice);
    });
    document.getElementById('paid').addEventListener('input', updateRemaining);
    document.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', removeItem));
    document.getElementById('items-tbody').addEventListener('input', updateTotals);
    updateTotals();
}

// Add item
function addItem() {
    const tbody = document.getElementById('items-tbody');
    const row = document.createElement('tr');
    row.className = 'item-row';
    row.innerHTML = `
        <td><input type="text" class="item-desc" placeholder="الوصف"></td>
        <td><input type="number" class="item-price" step="0.01" placeholder="0.00"></td>
        <td><input type="number" class="item-qty" min="1" placeholder="1"></td>
        <td class="item-total">0.00</td>
        <td><button type="button" class="remove-item">حذف</button></td>
    `;
    tbody.appendChild(row);
    row.querySelector('.remove-item').addEventListener('click', removeItem);
    updateTotals();
}

// Remove item
function removeItem(e) {
    e.target.closest('tr').remove();
    updateTotals();
}

// Update totals
function updateTotals() {
    const rows = document.querySelectorAll('.item-row');
    let grandTotal = 0;
    rows.forEach(row => {
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const total = price * qty;
        row.querySelector('.item-total').textContent = total.toFixed(2);
        grandTotal += total;
    });
    document.getElementById('grand-total').textContent = grandTotal.toFixed(2);
    updateRemaining();
}

// Update remaining
function updateRemaining() {
    const grandTotal = parseFloat(document.getElementById('grand-total').textContent) || 0;
    const paid = parseFloat(document.getElementById('paid').value) || 0;
    const remaining = grandTotal - paid;
    document.getElementById('remaining').textContent = remaining.toFixed(2);
}

// Save invoice
function saveInvoice(e) {
    e.preventDefault();
    
    const items = Array.from(document.querySelectorAll('.item-row')).map(row => ({
        desc: row.querySelector('.item-desc').value,
        price: parseFloat(row.querySelector('.item-price').value) || 0,
        qty: parseFloat(row.querySelector('.item-qty').value) || 0,
        total: parseFloat(row.querySelector('.item-total').textContent) || 0
    }));
    
    if (items.length === 0 || !items.some(i => i.desc && i.qty > 0)) {
        alert('الرجاء إضافة عناصر للفاتورة');
        return;
    }
    
    const invoice = {
        id: generateInvoiceId(),
        date: new Date().toISOString(),
        type: document.getElementById('invoice-type').value,
        client: {
            name: document.getElementById('client-name').value,
            phone: document.getElementById('client-phone').value,
            address: document.getElementById('client-address').value,
            email: document.getElementById('client-email').value
        },
        items: items,
        grandTotal: parseFloat(document.getElementById('grand-total').textContent),
        paid: parseFloat(document.getElementById('paid').value) || 0,
        remaining: parseFloat(document.getElementById('remaining').textContent),
        theme: currentTheme,
        companyName,
        companyLogo
    };
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    alert('تم حفظ الفاتورة');
    showInvoiceForm(); // Reset form
}

// Generate invoice ID
function generateInvoiceId() {
    const date = new Date();
    const yyyymmdd = date.getFullYear() + 
                     String(date.getMonth() + 1).padStart(2, '0') + 
                     String(date.getDate()).padStart(2, '0');
    const uuid = crypto.randomUUID().slice(0, 8);
    return `${yyyymmdd}-${uuid}`;
}

// Event listeners
if (customizeCompanyBtn) customizeCompanyBtn.addEventListener('click', showCustomizeCompany);
if (newInvoiceBtn) newInvoiceBtn.addEventListener('click', showInvoiceForm);

// Save company
function saveCompany() {
    const nameInput = document.getElementById('company-name');
    const themeSelect = document.getElementById('theme-select');
    
    if (!nameInput || !nameInput.value.trim()) {
        alert('الرجاء إدخال اسم الشركة');
        return;
    }
    
    companyName = nameInput.value;
    currentTheme = themeSelect ? themeSelect.value : 'blue';
    localStorage.setItem('companyName', companyName);
    localStorage.setItem('theme', currentTheme);
    applyTheme(currentTheme);
    updateCompanyHeader();
    alert('تم حفظ تخصيص الشركة');
    showInvoiceForm();
}

// Handle logo upload
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file && file.size <= 500 * 1024) { // 500KB max
        const reader = new FileReader();
        reader.onload = () => {
            companyLogo = reader.result;
            localStorage.setItem('companyLogo', companyLogo);
        };
        reader.readAsDataURL(file);
    } else {
        alert('حجم الملف يجب أن يكون أقل من 500KB');
    }
}

// Handle generic logo
function handleGenericLogo(e) {
    const selected = e.target.value;
    if (selected) {
        companyLogo = genericLogos[selected];
        localStorage.setItem('companyLogo', companyLogo);
    }
}

// Export/Import (only if element exists)
if (exportImportBtn) {
    exportImportBtn.addEventListener('click', () => {
        mainContent.innerHTML = `
            <div class="invoice-form">
                <h2>تصدير/استيراد</h2>
                <button id="export-json">تصدير JSON</button>
                <input type="file" id="import-json" accept=".json" style="display:none;">
                <button id="import-btn">استيراد JSON</button>
                <button id="export-pdf">تصدير آخر فاتورة PDF</button>
                <button id="print-invoice">طباعة آخر فاتورة</button>
                <button id="copy-text">نسخ نص آخر فاتورة</button>
            </div>
        `;
        const exportBtn = document.getElementById('export-json');
        const importBtn = document.getElementById('import-btn');
        const importInput = document.getElementById('import-json');
        const exportPdfBtn = document.getElementById('export-pdf');
        const printBtn = document.getElementById('print-invoice');
        const copyBtn = document.getElementById('copy-text');
        if (exportBtn) exportBtn.addEventListener('click', exportJSON);
        if (importBtn) importBtn.addEventListener('click', () => importInput && importInput.click());
        if (importInput) importInput.addEventListener('change', importJSON);
        if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportLastPDF);
        if (printBtn) printBtn.addEventListener('click', printLastInvoice);
        if (copyBtn) copyBtn.addEventListener('click', copyLastText);
    });
}

// Export JSON
function exportJSON() {
    const dataStr = JSON.stringify(invoices, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoices.json';
    link.click();
}

// Import JSON
function importJSON(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const imported = JSON.parse(reader.result);
            invoices = imported;
            localStorage.setItem('invoices', JSON.stringify(invoices));
            alert('تم الاستيراد بنجاح');
        } catch (err) {
            alert('خطأ في ملف JSON');
        }
    };
    reader.readAsText(file);
}

// Export PDF
function exportPDF() {
    // Get current form data
    const invoice = {
        id: generateInvoiceId(),
        date: new Date().toISOString(),
        type: document.getElementById('invoice-type').value,
        client: {
            name: document.getElementById('client-name').value,
            phone: document.getElementById('client-phone').value,
            address: document.getElementById('client-address').value,
            email: document.getElementById('client-email').value
        },
        items: Array.from(document.querySelectorAll('.item-row')).map(row => ({
            desc: row.querySelector('.item-desc').value,
            price: parseFloat(row.querySelector('.item-price').value) || 0,
            qty: parseFloat(row.querySelector('.item-qty').value) || 0,
            total: parseFloat(row.querySelector('.item-total').textContent) || 0
        })),
        grandTotal: parseFloat(document.getElementById('grand-total').textContent),
        paid: parseFloat(document.getElementById('paid').value) || 0,
        remaining: parseFloat(document.getElementById('remaining').textContent),
        theme: currentTheme,
        companyName,
        companyLogo
    };

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Apply theme colors
    doc.setFont('Noto Sans Arabic');
    doc.setFontSize(20);
    doc.text(companyName || 'شركة المدار', 20, 30);
    
    if (companyLogo) {
        doc.addImage(companyLogo, 'PNG', 150, 10, 40, 40);
    }
    
    doc.setFontSize(14);
    doc.text(`نوع الفاتورة: ${invoice.type}`, 20, 50);
    doc.text(`رقم الفاتورة: ${invoice.id}`, 20, 60);
    doc.text(`التاريخ: ${new Date(invoice.date).toLocaleDateString('ar')}`, 20, 70);
    doc.text(`العميل: ${invoice.client.name}`, 20, 80);
    doc.text(`الهاتف: ${invoice.client.phone}`, 20, 90);
    doc.text(`العنوان: ${invoice.client.address}`, 20, 100);
    doc.text(`البريد: ${invoice.client.email}`, 20, 110);
    
    // Items table
    doc.text('العناصر:', 20, 130);
    let y = 140;
    invoice.items.forEach(item => {
        doc.text(`${item.desc} - السعر: ${item.price} - الكمية: ${item.qty} - الإجمالي: ${item.total}`, 20, y);
        y += 10;
    });
    
    doc.text(`الإجمالي الكلي: ${invoice.grandTotal}`, 20, y + 10);
    doc.text(`المدفوع: ${invoice.paid}`, 20, y + 20);
    doc.text(`المتبقي: ${invoice.remaining}`, 20, y + 30);
    
    // Barcode
    JsBarcode("#barcode", invoice.id, {format: "CODE128"});
    const barcodeCanvas = document.getElementById('barcode');
    if (barcodeCanvas) {
        doc.addImage(barcodeCanvas.toDataURL(), 'PNG', 20, y + 40, 100, 30);
    }
    
    // Open PDF in new tab
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
}

// Preview PDF
function previewPDF() {
    const clientName = document.getElementById('client-name');
    if (!clientName || !clientName.value.trim()) {
        alert('الرجاء إدخال اسم العميل');
        return;
    }
    
    // Create temporary invoice object from form
    const invoice = {
        id: generateInvoiceId(),
        date: new Date().toISOString(),
        type: document.getElementById('invoice-type').value,
        client: {
            name: document.getElementById('client-name').value,
            phone: document.getElementById('client-phone').value,
            address: document.getElementById('client-address').value,
            email: document.getElementById('client-email').value
        },
        items: Array.from(document.querySelectorAll('.item-row')).map(row => ({
            desc: row.querySelector('.item-desc').value,
            price: parseFloat(row.querySelector('.item-price').value) || 0,
            qty: parseFloat(row.querySelector('.item-qty').value) || 0,
            total: parseFloat(row.querySelector('.item-total').textContent) || 0
        })),
        grandTotal: parseFloat(document.getElementById('grand-total').textContent),
        paid: parseFloat(document.getElementById('paid').value) || 0,
        remaining: parseFloat(document.getElementById('remaining').textContent),
        theme: currentTheme,
        companyName,
        companyLogo
    };
    generatePDFFromInvoice(invoice);
}

// Export last invoice as PDF
function exportLastPDF() {
    if (invoices.length === 0) return alert('لا توجد فواتير');
    const invoice = invoices[invoices.length - 1];
    generatePDFFromInvoice(invoice);
}

// Print last invoice
function printLastInvoice() {
    if (invoices.length === 0) return alert('لا توجد فواتير');
    window.print();
}

// Copy last invoice text
function copyLastText() {
    if (invoices.length === 0) return alert('لا توجد فواتير');
    const invoice = invoices[invoices.length - 1];
    const text = `فاتورة رقم: ${invoice.id}\nالعميل: ${invoice.client.name}\nالإجمالي: ${invoice.grandTotal}\nالمدفوع: ${invoice.paid}\nالمتبقي: ${invoice.remaining}`;
    navigator.clipboard.writeText(text);
    alert('تم نسخ نص الفاتورة');
}

// Generate PDF from saved invoice
function generatePDFFromInvoice(invoice) {
    // Create HTML content for PDF
    let itemsHtml = `
        <tr>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>اسم العنصر</strong></td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>السعر</strong></td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>الكمية</strong></td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>الإجمالي</strong></td>
        </tr>
    `;
    invoice.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${item.desc || ''}</td>
                <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${(item.price || 0).toFixed(2)}</td>
                <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${(item.qty || 0)}</td>
                <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${(item.total || 0).toFixed(2)}</td>
            </tr>
        `;
    });

    const element = document.createElement('div');
    element.innerHTML = `
        <div style="direction: rtl; font-family: 'Noto Sans Arabic', sans-serif; padding: 20px;">
            <h1 style="text-align: center; color: #007bff; margin: 0 0 20px 0;">${invoice.companyName || 'شركة المدار'}</h1>
            <p style="text-align: right; margin: 5px 0;"><strong>نوع الفاتورة:</strong> ${invoice.type}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>رقم الفاتورة:</strong> ${invoice.id}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar')}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>العميل:</strong> ${invoice.client.name}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>الهاتف:</strong> ${invoice.client.phone}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>العنوان:</strong> ${invoice.client.address}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>البريد:</strong> ${invoice.client.email}</p>
            <h3 style="text-align: right; margin: 15px 0 10px 0;">العناصر</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0;">
                ${itemsHtml}
            </table>
            <p style="text-align: right; margin: 5px 0; font-size: 18px;"><strong>الإجمالي الكلي:</strong> ${invoice.grandTotal.toFixed(2)}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>المدفوع:</strong> ${invoice.paid.toFixed(2)}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>المتبقي:</strong> ${invoice.remaining.toFixed(2)}</p>
        </div>
    `;
    
    const opt = {
        margin: 10,
        filename: `invoice-${invoice.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    try {
        html2pdf().set(opt).from(element).save();
    } catch (e) {
        console.error('PDF generation error:', e);
        alert('خطأ في إنشاء الفاتورة: ' + e.message);
    }
}

// Download PDF from invoice object
function downloadPDFFromInvoice(invoice) {
    // Create HTML content for PDF
    let itemsHtml = `
        <tr>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>اسم العنصر</strong></td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>السعر</strong></td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>الكمية</strong></td>
            <td style="text-align: center; padding: 8px; border: 1px solid #ddd;"><strong>الإجمالي</strong></td>
        </tr>
    `;
    invoice.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td style="text-align: right; padding: 8px; border: 1px solid #ddd;">${item.desc || ''}</td>
                <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${(item.price || 0).toFixed(2)}</td>
                <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${(item.qty || 0)}</td>
                <td style="text-align: center; padding: 8px; border: 1px solid #ddd;">${(item.total || 0).toFixed(2)}</td>
            </tr>
        `;
    });

    const element = document.createElement('div');
    element.innerHTML = `
        <div style="direction: rtl; font-family: 'Noto Sans Arabic', sans-serif; padding: 20px;">
            <h1 style="text-align: center; color: #007bff; margin: 0 0 20px 0;">${invoice.companyName || 'شركة المدار'}</h1>
            <p style="text-align: right; margin: 5px 0;"><strong>نوع الفاتورة:</strong> ${invoice.type}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>رقم الفاتورة:</strong> ${invoice.id}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar')}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>العميل:</strong> ${invoice.client.name}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>الهاتف:</strong> ${invoice.client.phone}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>العنوان:</strong> ${invoice.client.address}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>البريد:</strong> ${invoice.client.email}</p>
            <h3 style="text-align: right; margin: 15px 0 10px 0;">العناصر</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0;">
                ${itemsHtml}
            </table>
            <p style="text-align: right; margin: 5px 0; font-size: 18px;"><strong>الإجمالي الكلي:</strong> ${invoice.grandTotal.toFixed(2)}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>المدفوع:</strong> ${invoice.paid.toFixed(2)}</p>
            <p style="text-align: right; margin: 5px 0;"><strong>المتبقي:</strong> ${invoice.remaining.toFixed(2)}</p>
        </div>
    `;
    
    const opt = {
        margin: 10,
        filename: `invoice-${invoice.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    try {
        html2pdf().set(opt).from(element).save();
    } catch (e) {
        console.error('PDF generation error:', e);
        alert('خطأ في إنشاء الفاتورة: ' + e.message);
    }
}

// Register Service Worker
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
}

// Update texts (for language toggle)
function updateTexts() {
    const texts = {
        ar: {
            title: 'مولد الفواتير',
            customizeCompany: 'تخصيص الشركة',
            newInvoice: 'فاتورة جديدة',
            exportImport: 'تصدير/استيراد',
            createInvoice: 'فاتورة جديدة',
            clientName: 'اسم العميل',
            phone: 'رقم الهاتف',
            address: 'العنوان',
            email: 'البريد الإلكتروني',
            items: 'العناصر',
            addItem: 'إضافة عنصر',
            total: 'الإجمالي',
            save: 'حفظ الفاتورة'
        },
        en: {
            title: 'Invoice Generator',
            customizeCompany: 'Customize Company',
            newInvoice: 'New Invoice',
            exportImport: 'Export/Import',
            createInvoice: 'New Invoice',
            clientName: 'Client Name',
            phone: 'Phone',
            address: 'Address',
            email: 'Email',
            items: 'Items',
            addItem: 'Add Item',
            total: 'Total',
            save: 'Save Invoice'
        }
    };
    
    const t = texts[currentLang];
    const headerTitle = document.querySelector('h1');
    if (headerTitle) headerTitle.textContent = t.title;
    if (langToggle) langToggle.textContent = currentLang === 'ar' ? 'English' : 'العربية';
    if (customizeCompanyBtn) customizeCompanyBtn.textContent = t.customizeCompany;
    if (newInvoiceBtn) newInvoiceBtn.textContent = t.newInvoice;
    if (exportImportBtn) exportImportBtn.textContent = t.exportImport;
    
    // Update form if visible
    const form = document.getElementById('invoice-form');
    if (form) {
        form.querySelector('h2').textContent = t.createInvoice;
        // Add more updates...
    }
}