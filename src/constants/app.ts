import { ROUTES as ROUTES_CONST } from '@/routes/routes.constants'
export const ROUTES = ROUTES_CONST

export const APP_NAME = 'Risco360'
export const APP_DESCRIPTION = 'Sistema de Gestão de Riscos Ocupacionais'
export const APP_VERSION = '1.0.0-beta'

export const BOTTOM_NAV_ITEMS = [
  { label: 'Dashboard',     href: ROUTES.dashboard,     icon: 'LayoutDashboard' },
  { label: 'Empresas',      href: ROUTES.empresas,      icon: 'Building2' },
  { label: 'Levantamentos', href: ROUTES.levantamentos, icon: 'ClipboardList' },
  { label: 'Setores',       href: ROUTES.setores,       icon: 'Layers' },
  { label: 'Relatórios',    href: ROUTES.relatorios,    icon: 'FileText' },
] as const

export const DRAWER_NAV_ITEMS = [
  { label: 'Dashboard',        href: ROUTES.dashboard,         icon: 'LayoutDashboard' },
  { label: 'Levantamentos',    href: ROUTES.levantamentos,     icon: 'ClipboardList' },
  { label: 'Biblioteca Técnica', href: ROUTES.biblioteca,      icon: 'BookOpen' },
  { label: 'Configurações',    href: ROUTES.configuracoes,     icon: 'Settings' },
] as const

const ALL_NAV_ITEMS = [...BOTTOM_NAV_ITEMS, ...DRAWER_NAV_ITEMS] as const
const seen = new Set<string>()
export const NAV_ITEMS = ALL_NAV_ITEMS.filter((item) => {
  if (seen.has(item.label)) return false
  seen.add(item.label)
  return true
})

export const STEPS = [
  { id: 'identificacao',                label: 'Identificação da empresa e setor',                      number: 1 },
  { id: 'caracteristicas-fisicas',      label: 'Características físicas do local',                      number: 2 },
  { id: 'iluminacao-ventilacao',        label: 'Iluminação, ventilação e conforto',                     number: 3 },
  { id: 'seguranca-equipamentos',       label: 'Segurança, GES, mobiliários, máquinas e equipamentos',  number: 4 },
  { id: 'epis-epcs-evidencias',         label: 'EPIs, EPCs e evidências',                              number: 5 },
  { id: 'medicoes',                     label: 'Medições quantitativas pontuais',                       number: 6 },
  { id: 'perigos-riscos-aep',           label: 'Perigos, riscos, medidas de controle e AEP',            number: 7 },
  { id: 'revisao-conclusao',            label: 'Revisão e conclusão do setor',                         number: 8 },
] as const

export const STEP_WEIGHTS: Record<number, number> = {
  1: 10,
  2: 10,
  3: 10,
  4: 10,
  5: 10,
  6: 15,
  7: 20,
  8: 15,
}
