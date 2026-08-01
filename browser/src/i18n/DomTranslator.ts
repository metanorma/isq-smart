import { ENG } from './Language'
import type { Language } from './Language'
import type { MessageLookup } from './MessageLookup'
import type { TextMatcher } from './TextMatcher'


export class DomTranslator {
  constructor(
    private readonly lookup: MessageLookup,
    private readonly textMatcher: TextMatcher,
  ) {}

  translate(root: HTMLElement, lang: Language): void {
    this.translateDataI18n(root, lang)
    if (lang !== ENG) {
      this.translateTextNodes(root, lang)
    }
  }

  private translateDataI18n(root: HTMLElement, lang: Language): void {
    const elements = root.querySelectorAll<HTMLElement>('[data-i18n]')
    elements.forEach((el) => {
      const key = el.dataset.i18n
      if (!key) return
      const translated = this.lookup.resolve(lang, key)
      if (translated === key) return
      if (el.dataset.i18nHtml !== undefined) {
        el.innerHTML = translated
      } else {
        el.textContent = translated
      }
    })

    root.querySelectorAll<HTMLElement>('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder
      if (!key) return
      const translated = this.lookup.resolve(lang, key)
      if (translated !== key) el.setAttribute('placeholder', translated)
    })
  }

  private translateTextNodes(root: HTMLElement, lang: Language): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node: Text) {
        const text = node.textContent?.trim()
        if (!text || text.length < 2) return NodeFilter.FILTER_REJECT
        const parent = node.parentElement
        if (!parent) return NodeFilter.FILTER_REJECT
        const closest = parent.closest('script, style, code, pre, kbd, input, textarea')
        if (closest) return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      },
    })

    const nodes: Text[] = []
    while (walker.nextNode()) {
      nodes.push(walker.currentNode as Text)
    }

    for (const node of nodes) {
      const original = node.textContent
      if (!original) continue
      const translated = this.textMatcher.translateText(original, lang)
      if (translated) {
        node.textContent = translated
      }
    }
  }
}
