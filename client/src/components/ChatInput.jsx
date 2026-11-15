import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clrs, usrs } from '../constants.js'

const EmojiPicker = lazy(() => import('./EmojiPicker.jsx'))


// looks for "@something" right before the cursor
function fndMn(v, c) {
  let bf = v.slice(0, c)
  let m = /(^|\s)@(\w*)$/.exec(bf)

  if (!m) return null

  return {
    st: c - m[2].length - 1,
    q: m[2]
  }
}


export default function ChatInput({ onSnd, ch }) {
  const [txt, setTxt] = useState('')
  const [emj, setEmj] = useState(false)
  const [mn, setMn] = useState(null)
  const [act, setAct] = useState(0)

  const inp = useRef(null)
  const wrp = useRef(null)
  const pos = useRef(null)


  // had a bug where cursor jumped to the end after inserting stuff, this fixes it
  useLayoutEffect(() => {
    if (pos.current === null) return

    inp.current.focus()
    inp.current.setSelectionRange(pos.current, pos.current)
    pos.current = null
  }, [txt])


  let sug = []
  if (mn) {
    let q = mn.q.toLowerCase()
    sug = usrs.filter(u => u.toLowerCase().startsWith(q))
  }


  function cls() {
    setEmj(false)
    setMn(null)
  }


  useEffect(() => {
    function out(e) {
      if (wrp.current && !wrp.current.contains(e.target)) {
        cls()
      }
    }

    // need this on document bc the emoji picker eats the key events
    function esc(e) {
      if (e.key === 'Escape') {
        cls()
      }
    }

    document.addEventListener('mousedown', out)
    document.addEventListener('keydown', esc)

    return () => {
      document.removeEventListener('mousedown', out)
      document.removeEventListener('keydown', esc)
    }
  }, [])


  function chk(v, c) {
    let m = fndMn(v, c)
    setMn(m)
    setAct(0)
    if (m) {
      setEmj(false)
    }
  }


  function ins(s, frm) {
    let e = inp.current.selectionStart
    if (e === null || e === undefined) e = txt.length

    let st = frm
    if (st === null || st === undefined) st = e

    pos.current = st + s.length

    let nw = txt.slice(0, st) + s + txt.slice(e)
    setTxt(nw)
  }


  function pck(u) {
    ins('@' + u + ' ', mn.st)
    setMn(null)
  }


  // the @ button in the toolbar
  function atBtn() {
    let c = inp.current.selectionStart
    if (c === null || c === undefined) c = txt.length

    let s = '@'
    if (c > 0 && !/\s/.test(txt[c - 1])) {
      s = ' @'
    }

    ins(s)
    setMn({ st: c + s.length - 1, q: '' })
    setAct(0)
    setEmj(false)
  }


  function snd() {
    let m = txt.trim()
    if (!m) return

    onSnd(m)
    setTxt('')
    cls()

    if (inp.current) {
      inp.current.focus()
    }
  }


  function kd(e) {
    if (mn && sug.length) {
      let n = sug.length

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        return setAct(a => (a + 1) % n)
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        return setAct(a => (a - 1 + n) % n)
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        return pck(sug[act])
      }
    }

    if (e.key === 'Escape') {
      return cls()
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      snd()
    }
  }


  function onChg(e) {
    let v = e.target.value
    setTxt(v)
    chk(v, e.target.selectionStart)
  }


  function onEmjBtn() {
    setEmj(!emj)
    setMn(null)
  }


  function onEmj(em) {
    ins(em)
    setEmj(false)
  }


  return (
    <div className="composer" ref={wrp}>

      {mn && sug.length > 0 &&
        <ul className="popover mentions" role="listbox">
          <li className="popover-title">People</li>

          {sug.map((u, i) => {
            let on = i === act

            return (
              <li
                key={u}
                role="option"
                aria-selected={on}
                className={on ? 'active' : ''}
                onMouseEnter={() => setAct(i)}
                onMouseDown={e => {
                  e.preventDefault()
                  pck(u)
                }}
              >
                <span className="avatar sm" style={{ '--c': clrs[u] }}>
                  {u.slice(0, 2).toUpperCase()}
                </span>
                <span className="mention-name">{u}</span>
              </li>
            )
          })}
        </ul>
      }

      {emj && (
        <div className="emoji-popover">
          <Suspense fallback={<div className="emoji-loading">Loading emoji…</div>}>
            <EmojiPicker onSel={onEmj} />
          </Suspense>
        </div>
      )}

      <div className="composer-box">
        <input
          ref={inp}
          value={txt}
          placeholder={'Message #' + ch}
          onChange={onChg}
          onKeyDown={kd}
          onClick={e => chk(txt, e.target.selectionStart)}
          autoFocus
        />

        <div className="composer-toolbar">
          <div className="tools">
            <button
              type="button"
              className={emj ? 'tool on' : 'tool'}
              title="Emoji"
              onClick={onEmjBtn}
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="10" r="7.5" />
                <path d="M6.8 11.8a3.8 3.8 0 0 0 6.4 0" strokeLinecap="round" />
                <circle cx="7.5" cy="8.2" r="0.8" fill="currentColor" stroke="none" />
                <circle cx="12.5" cy="8.2" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </button>

            <button
              type="button"
              className="tool at"
              onClick={atBtn}
              title="Mention someone"
            >
              @
            </button>
          </div>

          <button
            type="button"
            className="send-btn"
            onClick={snd}
            disabled={!txt.trim()}
            title="Send"
          >
            <svg viewBox="0 0 20 20" width="16" height="16">
              <path d="M2.5 9.4 17 3l-3.4 14-4.1-4.3L6 15.2V11.8l8.2-6.6-9.4 5.3-2.3-1.1Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <div className="composer-hint">
        <strong>Enter</strong> to send · <strong>@</strong> to mention
      </div>
    </div>
  )
}
