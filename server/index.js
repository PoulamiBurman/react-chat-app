import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const prt = process.env.PORT || 4000

const ap = express()
ap.use(cors())

const srv = createServer(ap)

const io = new Server(srv, {
  cors: {
    origin: '*'
  }
})


// no db, everything is in memory (gone when server restarts)
let chs = [
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

let msgs = {}

for (let i = 0; i < chs.length; i++) {
  msgs[chs[i].id] = []
}


function slg(s) {
  let r = String(s || '')
  r = r.toLowerCase()
  r = r.trim()
  r = r.replace(/\s+/g, '-')
  r = r.replace(/[^a-z0-9\-_]/g, '')
  r = r.replace(/-+/g, '-')
  r = r.slice(0, 80)
  return r
}


io.on('connection', sk => {
  // console.log('user connected', sk.id)

  sk.emit('init', {
    channels: chs,
    messages: msgs
  })

  io.emit('presence', io.engine.clientsCount)


  sk.on('disconnect', () => {
    io.emit('presence', io.engine.clientsCount)
  })


  sk.on('chat:send', m => {
    if (!m) return
    if (typeof m.text != 'string') return
    if (!m.text.trim()) return
    if (!msgs[m.channel]) return

    let nm = {
      id: String(m.id),
      channel: m.channel,
      user: String(m.user),
      text: m.text.slice(0, 4000),
      time: Number(m.time) || Date.now(),
      likes: 0
    }

    msgs[m.channel].push(nm)

    // dont let it grow forever
    if (msgs[m.channel].length > 200) {
      msgs[m.channel].shift()
    }

    io.emit('chat:message', nm)
  })


  sk.on('chat:like', (d = {}) => {
    let ls = msgs[d.channel]
    if (!ls) return

    let m = ls.find(x => x.id === d.id)
    if (!m) return

    m.likes++

    io.emit('chat:liked', {
      channel: d.channel,
      id: d.id,
      likes: m.likes
    })
  })


  sk.on('channel:create', (d = {}, cb = () => {}) => {
    let nm = slg(d.name)

    if (!nm) {
      return cb({ error: 'Please enter a channel name.' })
    }

    let ex = chs.find(c => c.id === nm)
    if (ex) {
      return cb({ error: `#${nm} already exists.` })
    }

    let ds = String(d.description || '')
    ds = ds.trim()
    ds = ds.slice(0, 250)

    let ch = {
      id: nm,
      name: nm,
      description: ds
    }

    chs.push(ch)
    msgs[nm] = []

    io.emit('channel:created', ch)
    cb({ channel: ch })
  })
})


ap.get('/health', (rq, rs) => {
  rs.json({ ok: true })
})


// serve react build if it exists
let dir = path.dirname(fileURLToPath(import.meta.url))
let dst = path.join(dir, '../client/dist')

if (existsSync(dst)) {
  ap.use(express.static(dst))

  ap.get('*', (rq, rs) => {
    rs.sendFile(path.join(dst, 'index.html'))
  })
}


srv.listen(prt, () => {
  console.log('server running on http://localhost:' + prt)
})
