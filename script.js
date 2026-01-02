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
                <button type="button" id="preview-pdf">معاينة</button>
                <button type="button" id="download-pdf">تنزيل PDF</button>
            </div>
        </form>
    `;

    // Add item functionality
    document.getElementById('add-item').addEventListener('click', addItem);
    
    // Build invoice object function
    function buildInvoice() {
        return {
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
    }
    
    // Preview button
    const previewBtn = document.getElementById('preview-pdf');
    if (previewBtn) previewBtn.addEventListener('click', () => {
        const invoice = buildInvoice();
        generatePDFFromInvoice(invoice);
    });
    
    // Download PDF button
    const downloadBtn = document.getElementById('download-pdf');
    if (downloadBtn) downloadBtn.addEventListener('click', () => {
        const invoice = buildInvoice();
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

// Generate PDF from saved invoice (Preview)
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

    // Create element and add to DOM
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.innerHTML = `
        <div style="direction: rtl; font-family: 'Noto Sans Arabic', Arial, sans-serif; padding: 20px; background: white; color: black;">
            <h1 style="text-align: center; color: #007bff; margin: 0 0 20px 0; font-size: 24px;">${invoice.companyName || 'شركة المدار'}</h1>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>نوع الفاتورة:</strong> ${invoice.type}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>رقم الفاتورة:</strong> ${invoice.id}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar')}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>العميل:</strong> ${invoice.client.name}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>الهاتف:</strong> ${invoice.client.phone}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>العنوان:</strong> ${invoice.client.address}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>البريد:</strong> ${invoice.client.email}</p>
            <h3 style="text-align: right; margin: 15px 0 10px 0; font-size: 16px;">العناصر</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0; font-size: 13px;">
                ${itemsHtml}
            </table>
            <p style="text-align: right; margin: 8px 0; font-size: 16px;"><strong>الإجمالي الكلي:</strong> ${invoice.grandTotal.toFixed(2)}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>المدفوع:</strong> ${invoice.paid.toFixed(2)}</p>
            <p style="text-align: right; margin: 8px 0; font-size: 14px;"><strong>المتبقي:</strong> ${invoice.remaining.toFixed(2)}</p>
        </div>
    `;
    document.body.appendChild(element);
    
    const opt = {
        margin: 10,
        filename: `invoice-${invoice.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    try {
        html2pdf().set(opt).from(element).output('dataurlstring').then(pdfUrl => {
            document.body.removeChild(element);
            window.open(pdfUrl);
        }).catch(err => {
            document.body.removeChild(element);
            console.error('PDF preview error:', err);
            alert('خطأ في معاينة الفاتورة: ' + err.message);
        });
    } catch (e) {
        document.body.removeChild(element);
        console.error('PDF preview error:', e);
        alert('خطأ في معاينة الفاتورة: ' + e.message);
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

// Generate PDF from saved invoice (Preview)
function generatePDFFromInvoice(invoice) {
    const printWindow = window.open('', '', 'height=600,width=800');
    let itemsHtml = ``;
    invoice.items.forEach(item => {
        itemsHtml += `<tr>
            <td style="border: 1px solid #000; padding: 8px; text-align: right;">${item.desc || ''}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(item.price || 0).toFixed(2)}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(item.qty || 0)}</td>
            <td style="border: 1px solid #000; padding: 8px; text-align: center;">${(item.total || 0).toFixed(2)}</td>
        </tr>`;
    });

    const printContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
<style>body{font-family:'Noto Sans Arabic',Arial,sans-serif;direction:rtl;padding:20px;background:#fff}h1{text-align:center;margin-bottom:20px;color:#007bff;font-size:28px}p{margin:8px 0;font-size:14px;text-align:right}h3{text-align:right;margin:15px 0 10px 0;font-size:18px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#007bff;color:#fff;padding:10px;border:1px solid #000;text-align:center;font-size:14px}td{border:1px solid #000;padding:8px}.summary{margin-top:20px}.summary-total{font-size:16px;font-weight:bold;margin-top:10px}@media print{body{padding:0}}</style></head>
<body><h1>${invoice.companyName || 'شركة المدار'}</h1>
<p><strong>نوع الفاتورة:</strong> ${invoice.type}</p>
<p><strong>رقم الفاتورة:</strong> ${invoice.id}</p>
<p><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar')}</p>
<p><strong>العميل:</strong> ${invoice.client.name}</p>
<p><strong>الهاتف:</strong> ${invoice.client.phone}</p>
<p><strong>العنوان:</strong> ${invoice.client.address}</p>
<p><strong>البريد:</strong> ${invoice.client.email}</p>
<h3>العناصر</h3>
<table><thead><tr><th>اسم العنصر</th><th>السعر</th><th>الكمية</th><th>الإجمالي</th></tr></thead>
<tbody>${itemsHtml}</tbody></table>
<div class="summary"><p class="summary-total"><strong>الإجمالي الكلي:</strong> ${invoice.grandTotal.toFixed(2)}</p>
<p><strong>المدفوع:</strong> ${invoice.paid.toFixed(2)}</p>
<p><strong>المتبقي:</strong> ${invoice.remaining.toFixed(2)}</p></div>
<script>window.print();</script></body></html>`;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// Download PDF from invoice object
function downloadPDFFromInvoice(invoice) {
    let itemsHtml = ``;
    invoice.items.forEach(item => {
        itemsHtml += `<tr>
            <td style="border:1px solid #000;padding:8px;text-align:right;">${item.desc || ''}</td>
            <td style="border:1px solid #000;padding:8px;text-align:center;">${(item.price || 0).toFixed(2)}</td>
            <td style="border:1px solid #000;padding:8px;text-align:center;">${(item.qty || 0)}</td>
            <td style="border:1px solid #000;padding:8px;text-align:center;">${(item.total || 0).toFixed(2)}</td>
        </tr>`;
    });

    const htmlString = `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
<style>body{font-family:'Noto Sans Arabic',Arial,sans-serif;direction:rtl;padding:20px;background:#fff;color:#000}h1{text-align:center;margin-bottom:20px;color:#007bff;font-size:28px}p{margin:8px 0;font-size:14px;text-align:right}h3{text-align:right;margin:15px 0 10px 0;font-size:18px}table{width:100%;border-collapse:collapse;margin:20px 0}th{background:#007bff;color:#fff;padding:10px;border:1px solid #000;text-align:center;font-size:14px}td{border:1px solid #000;padding:8px}.summary{margin-top:20px}.summary-total{font-size:16px;font-weight:bold}</style></head>
<body><h1>${invoice.companyName || 'شركة المدار'}</h1>
<p><strong>نوع الفاتورة:</strong> ${invoice.type}</p>
<p><strong>رقم الفاتورة:</strong> ${invoice.id}</p>
<p><strong>التاريخ:</strong> ${new Date(invoice.date).toLocaleDateString('ar')}</p>
<p><strong>العميل:</strong> ${invoice.client.name}</p>
<p><strong>الهاتف:</strong> ${invoice.client.phone}</p>
<p><strong>العنوان:</strong> ${invoice.client.address}</p>
<p><strong>البريد:</strong> ${invoice.client.email}</p>
<h3>العناصر</h3>
<table><thead><tr><th>اسم العنصر</th><th>السعر</th><th>الكمية</th><th>الإجمالي</th></tr></thead>
<tbody>${itemsHtml}</tbody></table>
<div class="summary"><p class="summary-total"><strong>الإجمالي الكلي:</strong> ${invoice.grandTotal.toFixed(2)}</p>
<p><strong>المدفوع:</strong> ${invoice.paid.toFixed(2)}</p>
<p><strong>المتبقي:</strong> ${invoice.remaining.toFixed(2)}</p></div></body></html>`;
    
    try {
        const opt = {margin:10,filename:`invoice-${invoice.id}.pdf`,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,logging:false,useCORS:true,allowTaint:true,backgroundColor:'#ffffff'},jsPDF:{orientation:'portrait',unit:'mm',format:'a4'}};
        html2pdf().set(opt).from(htmlString).save();
    } catch (e) {
        alert('خطأ: ' + e.message);
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
}