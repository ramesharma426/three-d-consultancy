export const company = {
  name: '3D Engineering Consultancy',
  tagline: 'Precision Engineering & Design Consultancy',
  location: 'Hetauda, Makwanpur District, Bagmati Province, Nepal',
  phone: '+977-98XXXXXXXX',
  phoneHref: 'tel:+97798XXXXXXXX',
  whatsappHref: 'https://wa.me/97798XXXXXXXX',
  email: 'info@example.com',
  address: 'Hetauda-XX, Makwanpur, Nepal (placeholder — confirm exact ward/street)',
  mapCoordinates: { lat: 27.4328334, lng: 85.0400641 },
  formspreeAction: 'https://formspree.io/f/PLACEHOLDER_ID',
  year: new Date().getFullYear(),
};

export type Company = typeof company;
