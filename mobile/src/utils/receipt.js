import NepaliDate from 'nepali-date-converter';

export function getReceiptDetails(date = new Date()) {
  const nepaliDateObj = new NepaliDate(date);
  const nepaliDate = nepaliDateObj.format('YYYY/MM/DD', 'np');
  const nepaliYear = nepaliDateObj.getYear();
  const nepaliMonth = String(nepaliDateObj.getMonth() + 1).padStart(2, '0');
  const nepaliDay = String(nepaliDateObj.getDate()).padStart(2, '0');
  const dateKeyCompact = `${nepaliYear}${nepaliMonth}${nepaliDay}`;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const timeCompact = `${hours}${minutes}${seconds}`;

  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return { dateKey, dateKeyCompact, nepaliDate, time, timeCompact };
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
    transaction.counterName ? `काउन्टर: ${transaction.counterName}` : '',
    transaction.deviceId ? `उपकरण: ${transaction.deviceId}` : '',
    `सेवा: ${transaction.serviceName}`,
    transaction.userName ? `सञ्चालक: ${transaction.userName}` : '',
    transaction.itemName ? `वस्तु: ${transaction.itemName}` : '',
    `रकम: रु ${transaction.amount}`,
    '------------------------------',
    'श्री संसारी माई माताको कृपा सधैँ तपाईँमाथि रहोस्।'
  ].filter(Boolean).join('\n');
}