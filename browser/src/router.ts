import { type RouteRecordRaw, createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('./pages/index.vue') },
  { path: '/quantities', component: () => import('./pages/domain.vue') },
  { path: '/quantities/part-:part', component: () => import('./pages/part.vue'), props: true },
  { path: '/quantities/part-:part/:id', component: () => import('./pages/entry.vue'), props: true },
  { path: '/math', component: () => import('./pages/domain.vue') },
  { path: '/math/part-:part', component: () => import('./pages/part.vue'), props: true },
  { path: '/math/part-:part/:id', component: () => import('./pages/entry.vue'), props: true },
  { path: '/units', component: () => import('./pages/units.vue') },
  { path: '/units/:slug', component: () => import('./pages/unit.vue') },
  { path: '/dimensions', component: () => import('./pages/dimensions.vue') },
  { path: '/dimensions/:part', component: () => import('./pages/dimension-detail.vue'), props: true },
  { path: '/about', component: () => import('./pages/about.vue') },
  { path: '/documents/part-:part', component: () => import('./pages/document-part.vue'), props: true },
  { path: '/reference', component: () => import('./pages/reference.vue') },
  { path: '/reference/urn-patterns', component: () => import('./pages/urn-patterns.vue') },
  { path: '/documents', component: () => import('./pages/documents.vue') },
  { path: '/documents/:id', component: () => import('./pages/document-detail.vue'), props: true },
  { path: '/documents/:partKey/sections', component: () => import('./pages/document-sections.vue'), props: true },
  { path: '/documents/:partKey/sections/:sectionId', component: () => import('./pages/document-section-detail.vue'), props: true },
  {
    path: '/ontology',
    component: () => import('./layouts/OntologyLayout.vue'),
    children: [
      { path: '', component: () => import('./pages/ontology.vue') },
      { path: ':slug', component: () => import('./pages/ontology-detail.vue'), props: true },
    ],
  },

  // Legacy redirects
  { path: '/about/part-:part', redirect: to => `/documents/part-${to.params.part}` },
  { path: '/part-2', redirect: '/math' },
  { path: '/part-2/:id', redirect: '/math' },
  { path: '/part-3', redirect: '/quantities/part-3' },
  { path: '/part-4', redirect: '/quantities/part-4' },
  { path: '/part-5', redirect: '/quantities/part-5' },
  { path: '/part-6', redirect: '/quantities/part-6' },
  { path: '/part-7', redirect: '/quantities/part-7' },
  { path: '/part-8', redirect: '/quantities/part-8' },
  { path: '/part-9', redirect: '/quantities/part-9' },
  { path: '/part-10', redirect: '/quantities/part-10' },
  { path: '/part-11', redirect: '/quantities' },
  { path: '/part-12', redirect: '/quantities/part-12' },
  { path: '/part-13', redirect: '/quantities/part-13' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export { router, routes }
