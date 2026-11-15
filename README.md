# react chat app

chat app made with react + express + socket.io. slack style ui.

## features
- type a message and hit send (or enter), it shows up above the box
- every message gets a random name from `["Alan", "Bob", "Carol", "Dean", "Elin"]`
- like button on the right of each message, click it and the count goes up
- emoji picker (uses emoji-mart, has search + categories)
- @mentions - type @ and pick someone from the list
- sidebar with channels, you can switch between them or make a new one with the + button
- realtime with socket.io, open 2 tabs to see messages/likes/new channels sync
- if the server isnt running it still works but only in that tab

## how to run

```
npm run install:all
npm start
```
then open http://localhost:4000

for dev you can run `npm run server` and `npm run client` in two terminals instead (client is on :5173)

note: nothing is saved, everything is in memory so restarting the server clears it
