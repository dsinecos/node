// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';
const common = require('../common');

const assert = require('assert');

if (common.isWindows) {
  // uid/gid functions are POSIX only
  assert.strictEqual(process.getuid, undefined);
  assert.strictEqual(process.setuid, undefined);
  assert.strictEqual(process.getgid, undefined);
  assert.strictEqual(process.setgid, undefined);
  return;
}

assert.throws(() => {
  process.setuid({});
}, /^TypeError: setuid argument must be a number or a string$/);

assert.throws(() => {
  process.setuid('fhqwhgadshgnsdhjsdbkhsdabkfabkveybvf');
}, /^Error: setuid user id does not exist$/);

// If we're not running as super user...
if (process.getuid() !== 0) {
  // Should not throw.
  process.getgid();
  process.getuid();

  assert.throws(
    () => { process.setgid('nobody'); },
    /^Error: (?:EPERM, .+|setgid group id does not exist)$/
  );

  assert.throws(
    () => { process.setuid('nobody'); },
    /^Error: (?:EPERM, .+|setuid user id does not exist)$/
  );
  return;
}

// If we are running as super user...
const oldgid = process.getgid();
try {
  process.setgid('nobody');
} catch (err) {
  if (err.message !== 'setgid group id does not exist') {
    throw err;
  } else {
    process.setgid('nogroup');
  }
}
const newgid = process.getgid();
assert.notStrictEqual(newgid, oldgid);

const olduid = process.getuid();
process.setuid('nobody');
const newuid = process.getuid();
assert.notStrictEqual(newuid, olduid);
