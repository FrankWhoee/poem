# poem
Get a random poem everyday.

Go read some poems now!
[https://frankwhoee.com/poem/](https://frankwhoee.com/poem/)

### Motivation
I wanted to read more poems, but there wasn't really a single book that had all of the Western poetry canon.
### Overview
However, it existed in the form of poetrydb, but it returned JSONs, not suitable for human consumption, so this entirely clientside web app just pulls a random poem from poetrydb and formats it so that it is human readable. For some bonus points, I added poem tracking so you won't get the same poem more than once, and it keeps track of how many poems you've read so you can brag to your friends how well read you are, and finally in Wordle fashion, you only get a poem a day as to not overwhelm yourself.

### Trip Ups
I at first used cookies instead of local storage, turns out cookies are cleared when you restart the browser on the phone.

### Future work
1. ~~Make the share poem button return a link instead of copying the entire poem~~
2. Make everyone see the same poem, to encourage discussion, but this would require a backend (more complexity?? 😱)
