export const usrs = ["Alan", "Bob", "Carol", "Dean", "Elin"]


// avatar colors
export const clrs = {
  Alan: '#1264A3',
  Bob: '#2BAC76',
  Carol: '#E01E5A',
  Dean: '#E8912D',
  Elin: '#7C3085'
}


// same list is in server/index.js, keep them in sync!!
export const defChs = [
  {
    id: 'poland-office',
    name: 'poland-office',
    description: 'Updates and chatter from the Poland office'
  },
  {
    id: 'introductions',
    name: 'introductions',
    description: 'This channel is for company wide chatter'
  },
  {
    id: 'india-office',
    name: 'india-office',
    description: 'Updates and chatter from the India office'
  },
]


export const me = {
  name: 'Guest User',
  title: 'Team member'
}


// "Design Team" -> "design-team"
export function toNm(s) {
  let n = String(s || '')
  n = n.toLowerCase()
  n = n.trim()
  n = n.replace(/\s+/g, '-')
  n = n.replace(/[^a-z0-9\-_]/g, '')
  n = n.replace(/-+/g, '-')
  n = n.slice(0, 80)
  return n
}


export function rndUsr() {
  let i = Math.floor(Math.random() * usrs.length)
  return usrs[i]
}
