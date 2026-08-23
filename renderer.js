// Renderer patch with smart import integration
let smartImportItems = [];
const KARAR_IMPORT_ENGINE = window.KararImportEngine;

const SMART_IMPORT_SECTIONS = KARAR_IMPORT_ENGINE?.sections || {
  iddianame: 'I. İddianame Özeti',
  savunma: 'II. Sanık Savunması',
  tanik: 'III. Tanık Beyanları',
  rapor: 'IV. Adli Raporların Değerlendirilmesi',
  hukuki: 'V. Hukuki Gerekçe',
  hukum: 'VI. Hüküm'
};
