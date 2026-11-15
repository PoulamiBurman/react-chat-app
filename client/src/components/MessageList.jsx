import { useEffect, useRef } from 'react'
import Message from './Message.jsx'


export default function MessageList({ ms, onLk, ch }) {
  const btm = useRef()


  useEffect(() => {
    if (btm.current) {
      btm.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [ms.length])


  let ds = ch.description || 'Send a message to get the conversation started.'


  return (
    <section className="thread" aria-live="polite">
      <div className="thread-intro">
        <h2># {ch.name}</h2>
        <p>
          This is the very beginning of the <strong>#{ch.name}</strong> channel. {ds}
        </p>
      </div>

      {ms.length > 0 && (
        <div className="day-divider">
          <span>Today</span>
        </div>
      )}

      {ms.map((m, i) => {
        // group msgs from same person if within 5 mins
        let p = ms[i - 1]
        let cmp = p && p.user === m.user && (m.time - p.time) < 300000

        return (
          <Message
            key={m.id}
            m={m}
            onLk={onLk}
            cmp={cmp}
          />
        )
      })}

      <div ref={btm}></div>
    </section>
  )
}
