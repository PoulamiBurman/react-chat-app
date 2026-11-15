import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { defChs, toNm } from './constants.js'


// all the socket stuff lives here
// if server is down it just works locally (only in this tab)
export default function useChat() {

  const [chs, setChs] = useState(defChs)

  const [msgs, setMsgs] = useState(() => {
    let o = {}
    for (let i = 0; i < defChs.length; i++) {
      o[defChs[i].id] = []
    }
    return o
  })

  const [con, setCon] = useState(false)
  const [onl, setOnl] = useState(1)
  const sk = useRef(null)


  useEffect(() => {
    const s = io({ reconnectionDelayMax: 5000 })
    sk.current = s

    s.on('connect', () => {
      setCon(true)
    })

    s.on('disconnect', () => {
      setCon(false)
    })

    s.on('connect_error', () => {
      setCon(false)
    })

    s.on('init', d => {
      setChs(d.channels)
      setMsgs(d.messages)
    })

    s.on('presence', n => {
      setOnl(n)
    })

    s.on('channel:created', ch => {
      setChs(p => {
        let ex = p.find(c => c.id === ch.id)
        if (ex) return p
        return [...p, ch]
      })

      setMsgs(p => {
        let ls = p[ch.id] || []
        return { ...p, [ch.id]: ls }
      })
    })

    s.on('chat:message', m => {
      setMsgs(p => {
        let ls = p[m.channel] || []

        // already have it
        let dup = ls.some(x => x.id === m.id)
        if (dup) return p

        return { ...p, [m.channel]: [...ls, m] }
      })
    })

    s.on('chat:liked', d => {
      let c = d.channel
      let id = d.id
      let lk = d.likes

      setMsgs(p => {
        let old = p[c] || []
        let ls = old.map(x => {
          if (x.id === id) {
            return { ...x, likes: lk }
          }
          return x
        })
        return { ...p, [c]: ls }
      })
    })

    return () => {
      s.disconnect()
    }
  }, [])


  const send = useCallback((m) => {
    if (con) {
      sk.current.emit('chat:send', m)
      return
    }

    setMsgs(p => {
      let ls = p[m.channel] || []
      return { ...p, [m.channel]: [...ls, m] }
    })
  }, [con])


  const like = useCallback((c, id) => {
    if (con) {
      return sk.current.emit('chat:like', { channel: c, id: id })
    }

    // offline
    setMsgs(p => {
      let ls = p[c].map(x => {
        if (x.id === id) {
          return { ...x, likes: x.likes + 1 }
        }
        return x
      })
      return { ...p, [c]: ls }
    })
  }, [con])


  // returns promise -> {channel} or {error}
  const mkCh = useCallback((nm, ds) => {
    return new Promise(res => {
      if (con) {
        sk.current.emit('channel:create', { name: nm, description: ds }, res)
        return
      }

      let id = toNm(nm)

      if (!id) {
        return res({ error: 'Please enter a channel name.' })
      }

      let ex = chs.some(c => c.id == id)
      if (ex) {
        return res({ error: `#${id} already exists.` })
      }

      let ch = {
        id: id,
        name: id,
        description: ds.trim()
      }

      setChs(p => [...p, ch])
      setMsgs(p => ({ ...p, [id]: [] }))

      res({ channel: ch })
    })
  }, [con, chs])


  let o = 1
  if (con) o = onl

  return {
    chs: chs,
    msgs: msgs,
    con: con,
    onl: o,
    send: send,
    like: like,
    mkCh: mkCh
  }
}
