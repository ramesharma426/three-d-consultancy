export const company = {
  name: '3D Engineering Consultancy',
  tagline: 'Precision Engineering & Design Consultancy',
  taglineNe: 'यथार्थ इन्जिनियरिङ र डिजाइन परामर्श',
  location: 'Hetauda, Makwanpur District, Bagmati Province, Nepal',
  phone: '+977-986-2426259',
  phoneHref: 'tel:+9779862426259',
  whatsappHref: 'https://wa.me/9779862426259',
  email: '3dengineeringconsultancy2019@gmail.com',
  address: 'Nagarpalika Road, Hetauda, Nepal, 44100',
  mapCoordinates: { lat: 27.4328334, lng: 85.0400641 },
  year: new Date().getFullYear(),
  // The site is served from a custom domain (see public/CNAME), which
  // GitHub Pages serves at the domain root, so this stays ''. Only set this
  // back to '/<repo-name>' if the custom domain is ever removed and the
  // site falls back to the default <user>.github.io/<repo-name>/ URL.
  basePath: '',
  siteUrl: 'https://engconsultancy3d.com.np',
};

export type Company = typeof company;
