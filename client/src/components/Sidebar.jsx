import { useState } from 'react'
import { me } from '../constants.js'


export default function Sidebar(p) {
  let chs = p.chs
  let cur = p.cur
  let unr = p.unr
  let con = p.con
  let onSel = p.onSel
  let onAdd = p.onAdd
  let opn = p.opn
  let onCls = p.onCls

  const [cl, setCl] = useState(false)


  let ini = me.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)


  return (
    <>
      {/* dark overlay for mobile */}
      <div className={opn ? 'sidebar-scrim show' : 'sidebar-scrim'} onClick={onCls}></div>

      <aside className={opn ? 'sidebar open' : 'sidebar'}>
        <div className="profile">
          <div className="profile-avatar">
            {ini}
            <span
              className={con ? 'presence on' : 'presence'}
              title={con ? 'Active' : 'Away'}
            ></span>
          </div>

          <div className="profile-text">
            <div className="profile-name">{me.name}</div>
            <div className="profile-title">{me.title}</div>
          </div>
        </div>

        <nav className="sidebar-scroll">
          <div className="section-header">
            <button className="section-toggle" onClick={() => setCl(!cl)}>
              <svg className={cl ? 'caret closed' : 'caret'} viewBox="0 0 20 20" width="12" height="12">
                <path d="M5 7.5 10 13l5-5.5H5Z" fill="currentColor" />
              </svg>
              Conversations
            </button>

            <button className="section-add" onClick={onAdd} title="Create a channel">
              <svg viewBox="0 0 20 20" width="16" height="16">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {!cl &&
            <ul className="channel-list">
              {chs.map(c => {
                let k = 'channel-item'
                if (c.id === cur) k += ' active'
                if (unr[c.id]) k += ' unread'

                return (
                  <li key={c.id}>
                    <button className={k} onClick={() => onSel(c.id)}>
                      <span className="hash">#</span>
                      <span className="channel-name">{c.name}</span>
                    </button>
                  </li>
                )
              })}

              <li>
                <button className="channel-item add" onClick={onAdd}>
                  <span className="add-icon">+</span>
                  <span className="channel-name">Add channels</span>
                </button>
              </li>
            </ul>
          }
        </nav>
      </aside>
    </>
  )
}
