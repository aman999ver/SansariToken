import * as Print from 'expo-print';
import { formatTokenReceipt } from '../../utils/receipt';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

function receiptHtml(transaction) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: 58mm auto; margin: 0; }
    body { width: 54mm; margin: 0 auto; padding: 3mm 0; color: #000; font-family: sans-serif; font-size: 11pt; text-align: center; }
    .header { font-weight: 700; font-size: 12pt; line-height: 1.35; }
    .rule { border-top: 1px dashed #000; margin: 3mm 0; }
    .details { text-align: left; line-height: 1.55; }
    .footer { font-weight: 700; font-size: 10pt; line-height: 1.4; }
  </style></head><body>
    <div class="header">${escapeHtml(transaction.templeName)}<br>रंगेली नगरपालिका-७, मोरङ<br>सहयोगार्थ रसिद</div>
    <div class="rule"></div>
    <div class="details">मिति: ${escapeHtml(transaction.nepaliDate)}<br>टोकन नं: ${escapeHtml(transaction.tokenNumber)}<br>समय: ${escapeHtml(transaction.tokenTime)}<br>सेवा: ${escapeHtml(transaction.serviceName)}${transaction.itemName ? `<br>वस्तु: ${escapeHtml(transaction.itemName)}` : ''}<br>रकम: रु ${escapeHtml(transaction.amount)}</div>
    <div class="rule"></div>
    <div class="footer">श्री संसारी माई माताको कृपा सधैँ तपाईँमाथि रहोस्।</div>
  </body></html>`;
}

export class AndroidPrintService {
  async initializePrinter() { return true; }
  async isPrinterReady() { return true; }
  async printToken(transaction) {
    await Print.printAsync({ html: receiptHtml(transaction) });
    return { printed: true, content: formatTokenReceipt(transaction) };
  }
  async testPrint() {
    await Print.printAsync({ html: '<html><body style="text-align:center"><h2>Printer Test</h2><p>श्री संसारी माई मन्दिर</p></body></html>' });
    return { printed: true };
  }
}

export const printerService = new AndroidPrintService();