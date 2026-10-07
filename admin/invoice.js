(() => {
  const $ = (id) => document.getElementById(id);
  const items = $('items');
  const sym = { USD: '$', EUR: '€' };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function addItem(desc = '', qty = 1, rate = 0) {
    const row = document.createElement('div');
    row.className = 'invoice-item';
    row.innerHTML =
      '<input class="desc" placeholder="Service description">' +
      '<input class="qty" type="number" min="1" value="' + qty + '">' +
      '<input class="rate" type="number" min="0" step="0.01" value="' + rate + '">' +
      '<button type="button" class="secondary remove" aria-label="Remove service">×</button>';
    row.querySelector('.desc').value = desc;
    items.appendChild(row);
  }

  function today(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  function money(n) {
    const currency = $('currency').value;
    return (sym[currency] || '$') + Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function build() {
    let subtotal = 0;
    $('pItems').innerHTML = '';

    items.querySelectorAll('.invoice-item').forEach((row) => {
      const description = row.querySelector('.desc').value.trim();
      const qty = Number(row.querySelector('.qty').value || 0);
      const rate = Number(row.querySelector('.rate').value || 0);
      const total = qty * rate;
      subtotal += total;

      if (description) {
        $('pItems').insertAdjacentHTML(
          'beforeend',
          '<tr><td>' + esc(description) + '</td><td>' + qty + '</td><td>' +
          money(rate) + '</td><td>' + money(total) + '</td></tr>'
        );
      }
    });

    const tax = subtotal * Number($('taxRate').value || 0) / 100;
    const total = subtotal + tax;

    $('pNumber').textContent = $('invoiceNumber').value;
    $('pStatus').textContent = $('invoiceStatus').value;
    $('pIssue').textContent = $('issueDate').value;
    $('pDue').textContent = $('dueDate').value;
    $('pSeller').textContent = $('sellerName').value || 'Vicki Lawrence';
    $('pSellerEmail').textContent = $('sellerEmail').value;
    $('pSellerAddress').textContent = $('sellerAddress').value;
    $('pClient').textContent = $('clientName').value || 'Client Name';
    $('pClientEmail').textContent = $('clientEmail').value;
    $('pClientAddress').textContent = $('clientAddress').value;
    $('pSubtotal').textContent = money(subtotal);
    $('pTax').textContent = money(tax);
    $('pTotal').textContent = money(total);
    $('pPayment').textContent = $('paymentInstructions').value;

    return { subtotal, tax, total };
  }

  $('addItem').addEventListener('click', () => addItem());

  items.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove')) {
      event.target.closest('.invoice-item')?.remove();
      build();
    }
  });

  $('generate').addEventListener('click', () => {
    build();
    $('saveStatus').textContent = 'Invoice preview updated. Issue only after official approval.';
  });

  $('print').addEventListener('click', () => {
    build();
    window.print();
  });

  $('downloadPdf').addEventListener('click', async () => {
    build();
    if (!window.html2pdf) {
      alert('PDF exporter is unavailable. Use Print / Save PDF.');
      return;
    }

    const safe = ($('invoiceNumber').value || 'invoice').replace(/[^a-z0-9_-]/gi, '-');
    await window.html2pdf().set({
      margin: 0.35,
      filename: safe + '.pdf',
      image: { type: 'jpeg', quality: 0.96 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    }).from(document.getElementById('invoicePreview')).save();
  });

  $('email').addEventListener('click', () => {
    build();
    const to = encodeURIComponent($('clientEmail').value || '');
    const subject = encodeURIComponent(
      'Invoice ' + $('invoiceNumber').value + ' — Vicki Lawrence special request'
    );
    const body = encodeURIComponent(
      'Hello ' + ($('clientName').value || '') + '\n\n' +
      'Please find your invoice ' + $('invoiceNumber').value + '.\n' +
      'Total due: ' + $('pTotal').textContent + '\n' +
      'Due date: ' + $('dueDate').value + '\n\n' +
      'Please use the payment instructions on the invoice.'
    );
    window.location.href = 'mailto:' + to + '?subject=' + subject + '&body=' + body;
  });

  $('currency').addEventListener('change', build);
  $('taxRate').addEventListener('input', build);
  $('invoiceStatus').addEventListener('change', build);

  $('invoiceNumber').value = 'VL-INV-' + String(Date.now()).slice(-6);
  $('issueDate').value = today();
  $('dueDate').value = today(7);
  addItem('Video Shoutout', 1, 0);
  build();
})();