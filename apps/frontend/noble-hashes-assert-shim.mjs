// Self-contained compatibility shim for @noble/hashes/_assert
// ethereum-cryptography expects: `import assert from "@noble/hashes/_assert"`
// with assert.bool, assert.bytes, assert.number, assert.exists
//
// This shim is FULLY SELF-CONTAINED — no imports from @noble/hashes at all
// to avoid circular alias resolution issues with webpack.

function anumber(n) {
  if (!Number.isSafeInteger(n) || n < 0) throw new Error(`positive integer expected, got ${n}`);
}

function abytes(b, ...lengths) {
  if (!(b instanceof Uint8Array)) throw new Error('Uint8Array expected');
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error(`Uint8Array expected of length ${lengths}, not of length=${b.length}`);
}

function aexists(instance, checkFinished = true) {
  if (instance.destroyed) throw new Error('Hash instance has been destroyed');
  if (checkFinished && instance.finished) throw new Error('Hash#digest() has already been called');
}

function aoutput(out, instance) {
  abytes(out);
  const min = instance.outputLen;
  if (out.length < min) {
    throw new Error(`digestInto() expects output buffer of length at least ${min}`);
  }
}

const assert = {
  bool(b) {
    if (typeof b !== 'boolean') throw new Error('boolean expected, got ' + typeof b);
  },
  bytes: abytes,
  number: anumber,
  exists: aexists,
  output: aoutput,
};

export default assert;
export { abytes, aexists, anumber, aoutput };
