import { useEffect, useRef, useState } from 'react'
import { toNm } from '../constants.js'


export default function CreateChannelModal({ onMk, onCls }) {
  const [nm, setNm] = useState('')
  const [ds, setDs] = useState('')
  const [err, setErr] = useState('')
  const [ld, setLd] = useState(false)

  const inp = useRef()


  useEffect(() => {
    inp.current.focus()

    function kd(e) {
      if (e.key == 'Escape') {
        onCls()
      }
    }

    document.addEventListener('keydown', kd)

    return () => {
      document.removeEventListener('keydown', kd)
    }
  }, [onCls])


  let cn = toNm(nm)


  async function sub(e) {
    e.preventDefault()

    if (!cn || ld) return

    setLd(true)
    let r = await onMk(nm, ds)
    setLd(false)

    if (r.error) {
      setErr(r.error)
    }
    // console.log('created', r)
  }


  function bgDown(e) {
    if (e.target === e.currentTarget) {
      onCls()
    }
  }


  let fc = 'field with-prefix'
  if (err) fc = 'field with-prefix invalid'


  return (
    <div className="modal-scrim" onMouseDown={bgDown}>
      <form className="modal" onSubmit={sub}>

        <div className="modal-header">
          <h2>Create a channel</h2>
          <button type="button" className="modal-close" onClick={onCls}>
            <svg viewBox="0 0 20 20" width="20" height="20">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <label className="field-label" htmlFor="channel-name">Name</label>

          <div className={fc}>
            <span className="prefix">#</span>
            <input
              id="channel-name"
              ref={inp}
              value={nm}
              maxLength={80}
              placeholder="e.g. plan-budget"
              onChange={e => {
                setNm(e.target.value)
                setErr('')
              }}
            />
            <span className="char-count">{80 - nm.length}</span>
          </div>

          {err
            ? <p className="field-error">{err}</p>
            : <p className="field-help">
                {cn && cn !== nm && <>Will be created as <strong>#{cn}</strong>. </>}
                Channels are where conversations happen around a topic.
              </p>
          }

          <label className="field-label" htmlFor="channel-desc">
            Description <span className="optional">(optional)</span>
          </label>

          <div className="field">
            <input
              id="channel-desc"
              value={ds}
              maxLength={250}
              placeholder="What's this channel about?"
              onChange={e => setDs(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onCls}>Cancel</button>
          <button type="submit" className="btn primary" disabled={!cn || ld}>Create</button>
        </div>

      </form>
    </div>
  )
}
