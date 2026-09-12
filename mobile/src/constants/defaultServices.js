// Development fallback only. Production service and price data comes from the admin API.
export const defaultServices = [
  { id: 'bali-puja', name: 'बलि पूजा', category: 'सेवा', options: [{ id: 'boka', name: 'बोका', price: 255 }, { id: 'haas', name: 'हाँस', price: 150 }] },
  { id: 'bajar-shulka', name: 'बजार शुल्क', category: 'शुल्क', price: 3000, options: [] },
  { id: 'gadi-puja', name: 'गाडी पूजा', category: 'सेवा', options: [{ id: 'motorcycle', name: 'मोटरसाइकल', price: 100 }, { id: 'city-safari', name: 'City सफारी', price: 150 }, { id: 'four-wheeler', name: 'चार पाङ्ग्रे', price: 200 }] },
  { id: 'tahara-shulka', name: 'टहरा शुल्क', category: 'शुल्क', price: 1005, options: [] },
  { id: 'other', name: 'अन्य', category: 'अन्य', price: null, options: [] }
];