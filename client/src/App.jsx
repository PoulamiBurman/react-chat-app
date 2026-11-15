import { useEffect, useState } from 'react'
import useChat from './useChat.js'
import Sidebar from './components/Sidebar.jsx'
import MessageList from './components/MessageList.jsx'
import ChatInput from './components/ChatInput.jsx'
import CreateChannelModal from './components/CreateChannelModal.jsx'
import { rndUsr, usrs } from './constants.js'


function App() {
  const { chs, msgs, con, onl, send, like, mkCh } = useChat()

  const [cur, setCur] = useState('introductions')
  const [mnu, setMnu] = useState(false)
  const [mdl, setMdl] = useState(false)

  // how many msgs we've seen per channel (for bold unread)
  const [sn, setSn] = useState({})


  let ch = chs.find(c => c.id === cur)
  if (!ch) ch = chs[0]

  let ms = msgs[ch.id] || []


  useEffect(() => {
    setSn(p => {
      let cp = { ...p }

      // first time we see a channel count everything as read
      for (let k in msgs) {
        if (cp[k] === undefined) {
          cp[k] = msgs[k].length
        }
      }

      cp[ch.id] = ms.length
      return cp
    })
  }, [msgs, ch.id, ms.length])


  let unr = {}
  for (let i = 0; i < chs.length; i++) {
    let c = chs[i]
    let n = 0
    if (msgs[c.id]) n = msgs[c.id].length
    unr[c.id] = sn[c.id] !== undefined && n > sn[c.id]
  }


  function opn(id) {
    setCur(id)
    setMnu(false)
  }


  async function onMk(nm, ds) {
    let r = await mkCh(nm, ds)
    if (r.channel) {
      setMdl(false)
      opn(r.channel.id)
    }
    return r
  }


  function onSnd(t) {
    let rnd = Math.random().toString(36).slice(2, 8)
    let id = Date.now() + '-' + rnd

    send({
      id: id,
      channel: ch.id,
      user: rndUsr(),
      text: t,
      time: Date.now(),
      likes: 0
    })
  }


  let ttl = onl + ' online · ' + usrs.length + ' members'


  return (
    <div className="app">
      <header className="top-bar">
        <button className="menu-btn" onClick={() => setMnu(true)}>
          <svg viewBox="0 0 20 20" width="20" height="20">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <span className="app-name">Orbit Chat</span>
      </header>

      <div className="workspace">
        <Sidebar
          chs={chs}
          cur={ch.id}
          unr={unr}
          con={con}
          onSel={opn}
          onAdd={() => setMdl(true)}
          opn={mnu}
          onCls={() => setMnu(false)}
        />

        <main className="channel">
          <header className="channel-header">
            <div className="channel-title">
              <h1># {ch.name}</h1>
              {ch.description ? <p>{ch.description}</p> : null}
            </div>

            <div className="members" title={ttl}>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7.5" cy="7" r="3" />
                <path d="M2 16.5c.6-2.8 2.8-4.5 5.5-4.5s4.9 1.7 5.5 4.5" strokeLinecap="round" />
                <path d="M13 4.2a3 3 0 0 1 0 5.6M15 12.4c1.5.6 2.6 2 3 4.1" strokeLinecap="round" />
              </svg>
              <span>{onl} | {usrs.length}</span>
            </div>
          </header>

          {/* key = channel id so scroll + input reset when switching */}
          <MessageList
            key={ch.id}
            ms={ms}
            ch={ch}
            onLk={id => like(ch.id, id)}
          />

          <ChatInput
            key={'input-' + ch.id}
            onSnd={onSnd}
            ch={ch.name}
          />
        </main>
      </div>

      {mdl && (
        <CreateChannelModal
          onMk={onMk}
          onCls={() => setMdl(false)}
        />
      )}
    </div>
  )
}

export default App
