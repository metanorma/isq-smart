export interface Presentation {
  slug: string
  title: string
  venue: string
  date: string
  summary: string
  slides: string
  pdf: string
  pdfSize: string
  i18nKey?: string
}

export const presentations: Presentation[] = [
  {
    slug: 'isq-tc12',
    title: 'ISQ in SMART',
    venue: 'ISO/TC 12',
    date: 'November 2026',
    summary: 'The International System of Quantities as an information service — the dataset, the SMART ontology, the measurement hierarchy, and the measurement intake contract.',
    slides: '/deck/isq-tc12.html',
    pdf: '/deck/isq-tc12.pdf',
    pdfSize: '14 MB',
  },
]
