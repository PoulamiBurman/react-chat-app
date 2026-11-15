import Picker from '@emoji-mart/react'


// data is big so only load it when picker opens
async function getDt() {
  let r = await import('@emoji-mart/data')
  return r.default
}


export default function EmojiPicker(p) {

  function pk(e) {
    p.onSel(e.native)
  }

  return (
    <Picker
      data={getDt}
      onEmojiSelect={pk}
      theme="light"
      set="native"
      previewPosition="bottom"
      skinTonePosition="search"
      searchPosition="sticky"
      navPosition="top"
      perLine={9}
      maxFrequentRows={2}
      autoFocus
    />
  )
}
