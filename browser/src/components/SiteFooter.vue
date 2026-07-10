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
          <p class="text-xs text-white/40 leading-relaxed max-w-xs">
            ISO 80000 &amp; IEC 80000 — the international standards for quantities, units, and mathematical notation.
          </p>
        </div>

        <!-- Domains -->
        <div>
          <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Browse</h3>
          <ul class="space-y-2 text-xs">
            <li><a href="/quantities" class="text-white/50 hover:text-brand-300 transition-colors">Quantities and Units</a></li>
            <li><a href="/math" class="text-white/50 hover:text-brand-300 transition-colors">Mathematical Notation</a></li>
            <li><a href="/units" class="text-white/50 hover:text-brand-300 transition-colors">Units Database</a></li>
            <li><a href="/dimensions" class="text-white/50 hover:text-brand-300 transition-colors">Dimensions</a></li>
            <li><a href="/about" class="text-white/50 hover:text-brand-300 transition-colors">About the Standard</a></li>
            <li><a href="/reference" class="text-white/50 hover:text-brand-300 transition-colors">API &amp; Reference</a></li>
          </ul>
        </div>

        <!-- Linked Data -->
        <div>
          <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Linked Data</h3>
          <ul class="space-y-2 text-xs">
            <li><a href="https://unitsml.org" class="text-white/50 hover:text-brand-300 transition-colors" target="_blank" rel="noopener">UnitsML.org</a></li>
            <li><a href="https://unitsml.org/schemas/" class="text-white/50 hover:text-brand-300 transition-colors" target="_blank" rel="noopener">UnitsDB Schemas</a></li>
            <li><a href="/reference/urn-patterns" class="text-white/50 hover:text-brand-300 transition-colors">ISO-IEC URN identifiers</a></li>
            <li><a href="/ontology" class="text-white/50 hover:text-brand-300 transition-colors">JSON-LD + RDF/Turtle vocabulary</a></li>
          </ul>
        </div>

        <!-- Vocabulary preview -->
        <div>
          <h3 class="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-3">Vocabulary</h3>
          <div class="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] font-mono text-[10px] leading-relaxed text-white/40">
            <pre>@context: isq/ontologies/core
@type:   isq:Quantity
@id:     isq:{id}
dcterms: urn:iso:std:iso:80000:...</pre>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-[11px] text-white/25">Content copyright &copy; ISO and IEC. All rights reserved.</span>
        <span class="text-[11px] text-white/25">An information service of <a href="https://www.iso.org/committee/46202.html" target="_blank" rel="noopener" class="hover:text-white/50 transition-colors">ISO/TC&nbsp;12</a> &amp; <a href="https://www.iec.ch/dyn/www/f?p=103:7:528830564991517::::FSP_ORG_ID,FSP_LANG_ID:1215,25" target="_blank" rel="noopener" class="hover:text-white/50 transition-colors">IEC/TC&nbsp;25</a>, developed by Ribose.</span>
      </div>
    </div>
  </footer>
</template>
