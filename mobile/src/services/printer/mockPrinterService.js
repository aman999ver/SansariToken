import { formatTokenReceipt } from '../../utils/receipt';

export class MockPrinterService {
  async initializePrinter() { return true; }
  async isPrinterReady() { return true; }
  async printToken(transaction) {
    console.log('[MockPrinterService] print receipt:\n' + formatTokenReceipt(transaction));
    return { printed: true, content: formatTokenReceipt(transaction) };
  }
  async testPrint() { console.log('[MockPrinterService] test print'); return { printed: true }; }
}

export const printerService = new MockPrinterService();