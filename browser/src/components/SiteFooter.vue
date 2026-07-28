<script setup lang="ts">
import { asset } from '../lib/asset'
</script>

<template>
  <footer class="mt-auto relative bg-brand-950">
    <div class="h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <img :src="asset('/img/logo-iso.svg')" alt="ISO" class="h-6 w-auto rounded opacity-90" />
            <span class="text-white/30 text-xs">+</span>
            <img :src="asset('/img/logo-iec.svg')" alt="IEC" class="h-6 w-auto rounded opacity-90" />
          </div>
          <p class="text-xs text-white/40 leading-relaxed max-w-xs" data-i18n="footer.brand_desc">
            ISO 80000 &amp; IEC 80000 — the international standards for quantities, units, and mathematical notation.
          </p>
        </div>

        <!-- Domains -->
        <div>
          <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3" data-i18n="footer.browse">Browse</h3>
          <ul class="space-y-2 text-xs">
            <li><a :href="asset('/quantities')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.quantities_units">Quantities and Units</a></li>
            <li><a :href="asset('/math')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.math_notation">Mathematical Notation</a></li>
            <li><a :href="asset('/units')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.units_db">Units Database</a></li>
            <li><a :href="asset('/dimensions')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.dimensions">Dimensions</a></li>
            <li><a :href="asset('/about')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.about_standard">About the Standard</a></li>
            <li><a :href="asset('/reference')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.api_reference">API &amp; Reference</a></li>
          </ul>
        </div>

        <!-- Linked Data -->
        <div>
          <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3" data-i18n="footer.linked_data">Linked Data</h3>
          <ul class="space-y-2 text-xs">
            <li><a href="https://unitsml.org" class="text-white/50 hover:text-brand-300 transition-colors" target="_blank" rel="noopener">UnitsML.org</a></li>
            <li><a href="https://unitsml.org/schemas/" class="text-white/50 hover:text-brand-300 transition-colors" target="_blank" rel="noopener">UnitsDB Schemas</a></li>
            <li><a :href="asset('/reference/urn-patterns')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.urn_identifiers">ISO-IEC URN identifiers</a></li>
            <li><a :href="asset('/ontology')" class="text-white/50 hover:text-brand-300 transition-colors" data-i18n="footer.jsonld_rdf">JSON-LD + RDF/Turtle vocabulary</a></li>
          </ul>
        </div>

        <!-- Vocabulary preview -->
        <div>
          <h3 class="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3" data-i18n="footer.vocabulary">Vocabulary</h3>
          <div class="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] font-mono text-xs leading-relaxed text-white/40">
            <pre>@context: isq/ontologies/core
@type:   isq:Quantity
@id:     isq:{id}
dcterms: urn:iso:std:iso:80000:...</pre>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-xs text-white/25"><span data-i18n="label.copyright">Content copyright © ISO and IEC. All rights reserved.</span></span>
        <span class="text-xs text-white/25" data-i18n="footer.info_service">An information service of <a href="https://www.iso.org/committee/46202.html" target="_blank" rel="noopener" class="hover:text-white/50 transition-colors">ISO/TC&nbsp;12</a> &amp; <a href="https://www.iec.ch/dyn/www/f?p=103:7:528830564991517::::FSP_ORG_ID,FSP_LANG_ID:1215,25" target="_blank" rel="noopener" class="hover:text-white/50 transition-colors">IEC/TC&nbsp;25</a>, developed by Ribose.</span>
      </div>
    </div>
  </footer>
</template>
