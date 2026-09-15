import NepaliDate from 'nepali-date-converter';

export function getReceiptDetails(date = new Date()) {
  const nepaliDate = new NepaliDate(date).format('YYYY/MM/DD', 'np');
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return { dateKey, nepaliDate, time };
}

export function formatTokenReceipt(transaction) {
  return [
    'श्री संसारी माई मन्दिर व्यवस्थापन समिति',
    'रंगेली नगरपालिका-७, मोरङ',
    'सहयोगार्थ रसिद',
    '------------------------------',
    `मिति: ${transaction.nepaliDate}`,
    `रसिद नं: ${transaction.receiptNumber || transaction.tokenNumber}`,
    `समय: ${transaction.tokenTime}`,
    `सेवा: ${transaction.serviceName}`,
    transaction.userName ? `प्रयोगकर्ता: ${transaction.userName}` : '',
    transaction.itemName ? `वस्तु: ${transaction.itemName}` : '',
    `रकम: रु ${transaction.amount}`,
    '------------------------------',
    'श्री संसारी माई माताको कृपा सधैँ तपाईँमाथि रहोस्।'
  ].filter(Boolean).join('\n');
}