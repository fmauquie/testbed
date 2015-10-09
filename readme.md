Testbed
=======

Allows quick testing of some code.

To run, execute `node server.js` and point your browser to http://localhost:9000/.

Features:
- ACE editor
- Automatic running
- Basic matching between the code output and a reference
- Diff with the output
- Coloration of the error in the ACE editor when the code raises an exception
- Simple localstorage save to allow reloading of the last code chunk

This is a quick hack.

There is no build system and I copied the libs in the repo (beuark).
Also the structure and lib versions look a little old because I started from some stuff I made somewhere else some time ago.

Test it: https://fmauquie.github.io/testbed/app/
