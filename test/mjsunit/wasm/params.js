// Copyright 2015 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Flags: --expose-wasm

load("test/mjsunit/wasm/wasm-constants.js");
load("test/mjsunit/wasm/wasm-module-builder.js");

function runSelect2(select, which, a, b) {
  assertEquals(which == 0 ? a : b, select(a, b));
}

function testSelect2(type) {
  for (var which = 0; which < 2; which++) {
    print("type = " + type + ", which = " + which);

    var builder = new WasmModuleBuilder();

    builder.addFunction("select", makeSig_r_xx(type, type))
      .addBody([kExprGetLocal, which])
      .exportFunc()

    var select = builder.instantiate().exports.select;

    runSelect2(select, which, 99, 97);
    runSelect2(select, which, -99, -97);

    if (type != kAstF32) {
      runSelect2(select, which, 0x80000000 | 0, 0x7fffffff | 0);
      runSelect2(select, which, 0x80000001 | 0, 0x7ffffffe | 0);
      runSelect2(select, which, 0xffffffff | 0, 0xfffffffe | 0);
      runSelect2(select, which, -2147483647, 2147483646);
      runSelect2(select, which, -2147483646, 2147483645);
      runSelect2(select, which, -2147483648, 2147483647);
    }

    if (type != kAstI32 && type != kAstI64) {
      runSelect2(select, which, -1.25, 5.25);
      runSelect2(select, which, Infinity, -Infinity);
    }
  }
}


testSelect2(kAstI32);
testSelect2(kAstF32);
testSelect2(kAstF64);


function runSelect10(select, which, a, b) {
  var x = -1;

  var result = [
    select(a, b, x, x, x, x, x, x, x, x),
    select(x, a, b, x, x, x, x, x, x, x),
    select(x, x, a, b, x, x, x, x, x, x),
    select(x, x, x, a, b, x, x, x, x, x),
    select(x, x, x, x, a, b, x, x, x, x),
    select(x, x, x, x, x, a, b, x, x, x),
    select(x, x, x, x, x, x, a, b, x, x),
    select(x, x, x, x, x, x, x, a, b, x),
    select(x, x, x, x, x, x, x, x, a, b),
    select(x, x, x, x, x, x, x, x, x, a)
  ];

  for (var i = 0; i < 10; i++) {
     if (which == i) assertEquals(a, result[i]);
     else if (which == i+1) assertEquals(b, result[i]);
     else assertEquals(x, result[i]);
  }
}

function testSelect10(t) {
  var kBodySize = 2;
  var kNameOffset = kHeaderSize + 29 + kBodySize + 1;

  for (var which = 0; which < 10; which++) {
    print("type = " + t + ", which = " + which);

    var builder = new WasmModuleBuilder();
    builder.addFunction("select", makeSig([t,t,t,t,t,t,t,t,t,t], [t]))
      .addBody([kExprGetLocal, which])
      .exportFunc();

    var select = builder.instantiate().exports.select;

    assertEquals("function", typeof select);
    runSelect10(select, which, 99, 97);
    runSelect10(select, which, -99, -97);

    if (t != kAstF32) {
      runSelect10(select, which, 0x80000000 | 0, 0x7fffffff | 0);
      runSelect10(select, which, 0x80000001 | 0, 0x7ffffffe | 0);
      runSelect10(select, which, 0xffffffff | 0, 0xfffffffe | 0);
      runSelect10(select, which, -2147483647, 2147483646);
      runSelect10(select, which, -2147483646, 2147483645);
      runSelect10(select, which, -2147483648, 2147483647);
    }

    if (t != kAstI32 && t != kAstI64) {
      runSelect10(select, which, -1.25, 5.25);
      runSelect10(select, which, Infinity, -Infinity);
    }
  }
}


testSelect10(kAstI32);
testSelect10(kAstF32);
testSelect10(kAstF64);
