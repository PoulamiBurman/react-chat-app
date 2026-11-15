import { useEffect, useRef, useState } from 'react'
import { clrs, usrs } from '../constants.js'


const rx = new RegExp(`(@(?:${usrs.join('|')})\\b)`, 'g')


function fmt(t) {
  let d = new Date(t)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}


export default function Message({ m, onLk, cmp }) {
  let id = m.id
  let u = m.user
  let txt = m.text
  let tm = m.time
  let lk = m.likes

  const [bmp, setBmp] = useState(false)
  const prv = useRef(lk)


  // little pop animation when likes go up
  useEffect(() => {
    if (lk > prv.current) {
      setBmp(true)
      prv.current = lk

      let t = setTimeout(() => {
        setBmp(false)
      }, 250)

      return () => clearTimeout(t)
    }

    prv.current = lk
  }, [lk])


  // split keeps the matched mentions at odd indexes
  let pts = txt.split(rx).map((p, i) => {
    if (i % 2 == 1) {
      return <span key={i} className="mention">{p}</span>
    }
    return p
  })


  let cl = 'message'
  if (cmp) cl = 'message compact'

  let lkCl = 'like '
  if (lk > 0) lkCl = 'like liked'

  let clr = clrs[u] || '#616061'


  return (
    <article className={cl}>
      <div className="gutter">
        {cmp
          ? <time className="hover-time">{fmt(tm).replace(/\s?[AP]M$/i, '')}</time>
          : <div className="avatar" style={{ '--c': clr }}>{u.slice(0, 2).toUpperCase()}</div>
        }
      </div>

      <div className="message-content">
        {!cmp &&
          <div className="message-meta">
            <span className="author">{u}</span>
            <time>{fmt(tm)}</time>
          </div>
        }
        <p className="text">{pts}</p>
      </div>

      <button
        className={lkCl}
        onClick={() => onLk(id)}
        aria-label={'Like message from ' + u}
        title="Like"
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path d="M7 10v11H3V10h4Zm2 11V10l4.6-7.3a1.8 1.8 0 0 1 3.3 1.3L16 9h4.6a2 2 0 0 1 2 2.4l-1.6 8A2 2 0 0 1 19 21H9Z" fill="currentColor" />
        </svg>
        <span className={bmp ? 'count bump' : 'count'}>{lk}</span>
      </button>
    </article>
  )
}
