/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@rive-app/canvas-advanced/canvas_advanced.mjs":
/*!********************************************************************!*\
  !*** ./node_modules/@rive-app/canvas-advanced/canvas_advanced.mjs ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });

var Rive = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  
  return (
function(moduleArg = {}) {
  var moduleRtn;

var m = moduleArg, ba, ca, da = new Promise((a, b) => {
  ba = a;
  ca = b;
}), ea = "object" == typeof window, fa = "function" == typeof importScripts;
function ha() {
  function a(g) {
    const k = d;
    c = b = 0;
    d = new Map();
    k.forEach(p => {
      try {
        p(g);
      } catch (n) {
        console.error(n);
      }
    });
    this.nb();
    e && e.Pb();
  }
  let b = 0, c = 0, d = new Map(), e = null, f = null;
  this.requestAnimationFrame = function(g) {
    b ||= requestAnimationFrame(a.bind(this));
    const k = ++c;
    d.set(k, g);
    return k;
  };
  this.cancelAnimationFrame = function(g) {
    d.delete(g);
    b && 0 == d.size && (cancelAnimationFrame(b), b = 0);
  };
  this.Nb = function(g) {
    f && (document.body.remove(f), f = null);
    g || (f = document.createElement("div"), f.style.backgroundColor = "black", f.style.position = "fixed", f.style.right = 0, f.style.top = 0, f.style.color = "white", f.style.padding = "4px", f.innerHTML = "RIVE FPS", g = function(k) {
      f.innerHTML = "RIVE FPS " + k.toFixed(1);
    }, document.body.appendChild(f));
    e = new function() {
      let k = 0, p = 0;
      this.Pb = function() {
        var n = performance.now();
        p ? (++k, n -= p, 1000 < n && (g(1000 * k / n), k = p = 0)) : (p = n, k = 0);
      };
    }();
  };
  this.Kb = function() {
    f && (document.body.remove(f), f = null);
    e = null;
  };
  this.nb = function() {
  };
}
function ia(a) {
  console.assert(!0);
  const b = new Map();
  let c = -Infinity;
  this.push = function(d) {
    d = d + ((1 << a) - 1) >> a;
    b.has(d) && clearTimeout(b.get(d));
    b.set(d, setTimeout(function() {
      b.delete(d);
      0 == b.length ? c = -Infinity : d == c && (c = Math.max(...b.keys()), console.assert(c < d));
    }, 1000));
    c = Math.max(d, c);
    return c << a;
  };
}
const ja = m.onRuntimeInitialized;
m.onRuntimeInitialized = function() {
  ja && ja();
  let a = m.decodeAudio;
  m.decodeAudio = function(e, f) {
    e = a(e);
    f(e);
  };
  let b = m.decodeFont;
  m.decodeFont = function(e, f) {
    e = b(e);
    f(e);
  };
  const c = m.FileAssetLoader;
  m.ptrToAsset = e => {
    let f = m.ptrToFileAsset(e);
    return f.isImage ? m.ptrToImageAsset(e) : f.isFont ? m.ptrToFontAsset(e) : f.isAudio ? m.ptrToAudioAsset(e) : f;
  };
  m.CustomFileAssetLoader = c.extend("CustomFileAssetLoader", {__construct:function({loadContents:e}) {
    this.__parent.__construct.call(this);
    this.Db = e;
  }, loadContents:function(e, f) {
    e = m.ptrToAsset(e);
    return this.Db(e, f);
  },});
  m.CDNFileAssetLoader = c.extend("CDNFileAssetLoader", {__construct:function() {
    this.__parent.__construct.call(this);
  }, loadContents:function(e) {
    let f = m.ptrToAsset(e);
    e = f.cdnUuid;
    if ("" === e) {
      return !1;
    }
    (function(g, k) {
      var p = new XMLHttpRequest();
      p.responseType = "arraybuffer";
      p.onreadystatechange = function() {
        4 == p.readyState && 200 == p.status && k(p);
      };
      p.open("GET", g, !0);
      p.send(null);
    })(f.cdnBaseUrl + "/" + e, g => {
      f.decode(new Uint8Array(g.response));
    });
    return !0;
  },});
  m.FallbackFileAssetLoader = c.extend("FallbackFileAssetLoader", {__construct:function() {
    this.__parent.__construct.call(this);
    this.jb = [];
  }, addLoader:function(e) {
    this.jb.push(e);
  }, loadContents:function(e, f) {
    for (let g of this.jb) {
      if (g.loadContents(e, f)) {
        return !0;
      }
    }
    return !1;
  },});
  let d = m.computeAlignment;
  m.computeAlignment = function(e, f, g, k, p = 1.0) {
    return d.call(this, e, f, g, k, p);
  };
};
const ka = "createConicGradient createImageData createLinearGradient createPattern createRadialGradient getContextAttributes getImageData getLineDash getTransform isContextLost isPointInPath isPointInStroke measureText".split(" "), la = new function() {
  function a() {
    if (!b) {
      var l = document.createElement("canvas"), u = {alpha:1, depth:0, stencil:0, antialias:0, premultipliedAlpha:1, preserveDrawingBuffer:0, powerPreference:"high-performance", failIfMajorPerformanceCaveat:0, enableExtensionsByDefault:1, explicitSwapControl:1, renderViaOffscreenBackBuffer:1,};
      let q;
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        if (q = l.getContext("webgl", u), c = 1, !q) {
          return console.log("No WebGL support. Image mesh will not be drawn."), !1;
        }
      } else {
        if (q = l.getContext("webgl2", u)) {
          c = 2;
        } else {
          if (q = l.getContext("webgl", u)) {
            c = 1;
          } else {
            return console.log("No WebGL support. Image mesh will not be drawn."), !1;
          }
        }
      }
      q = new Proxy(q, {get(E, w) {
        if (E.isContextLost()) {
          if (p || (console.error("Cannot render the mesh because the GL Context was lost. Tried to invoke ", w), p = !0), "function" === typeof E[w]) {
            return function() {
            };
          }
        } else {
          return "function" === typeof E[w] ? function(...L) {
            return E[w].apply(E, L);
          } : E[w];
        }
      }, set(E, w, L) {
        if (E.isContextLost()) {
          p || (console.error("Cannot render the mesh because the GL Context was lost. Tried to set property " + w), p = !0);
        } else {
          return E[w] = L, !0;
        }
      },});
      d = Math.min(q.getParameter(q.MAX_RENDERBUFFER_SIZE), q.getParameter(q.MAX_TEXTURE_SIZE));
      function C(E, w, L) {
        w = q.createShader(w);
        q.shaderSource(w, L);
        q.compileShader(w);
        L = q.getShaderInfoLog(w);
        if (0 < (L || "").length) {
          throw L;
        }
        q.attachShader(E, w);
      }
      l = q.createProgram();
      C(l, q.VERTEX_SHADER, "attribute vec2 vertex;\n                attribute vec2 uv;\n                uniform vec4 mat;\n                uniform vec2 translate;\n                varying vec2 st;\n                void main() {\n                    st = uv;\n                    gl_Position = vec4(mat2(mat) * vertex + translate, 0, 1);\n                }");
      C(l, q.FRAGMENT_SHADER, "precision highp float;\n                uniform sampler2D image;\n                varying vec2 st;\n                void main() {\n                    gl_FragColor = texture2D(image, st);\n                }");
      q.bindAttribLocation(l, 0, "vertex");
      q.bindAttribLocation(l, 1, "uv");
      q.linkProgram(l);
      u = q.getProgramInfoLog(l);
      if (0 < (u || "").trim().length) {
        throw u;
      }
      e = q.getUniformLocation(l, "mat");
      f = q.getUniformLocation(l, "translate");
      q.useProgram(l);
      q.bindBuffer(q.ARRAY_BUFFER, q.createBuffer());
      q.enableVertexAttribArray(0);
      q.enableVertexAttribArray(1);
      q.bindBuffer(q.ELEMENT_ARRAY_BUFFER, q.createBuffer());
      q.uniform1i(q.getUniformLocation(l, "image"), 0);
      q.pixelStorei(q.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0);
      b = q;
    }
    return !0;
  }
  let b = null, c = 0, d = 0, e = null, f = null, g = 0, k = 0, p = !1;
  a();
  this.ac = function() {
    a();
    return d;
  };
  this.Jb = function(l) {
    b.deleteTexture && b.deleteTexture(l);
  };
  this.Ib = function(l) {
    if (!a()) {
      return null;
    }
    const u = b.createTexture();
    if (!u) {
      return null;
    }
    b.bindTexture(b.TEXTURE_2D, u);
    b.texImage2D(b.TEXTURE_2D, 0, b.RGBA, b.RGBA, b.UNSIGNED_BYTE, l);
    b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_S, b.CLAMP_TO_EDGE);
    b.texParameteri(b.TEXTURE_2D, b.TEXTURE_WRAP_T, b.CLAMP_TO_EDGE);
    b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MAG_FILTER, b.LINEAR);
    2 == c ? (b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.LINEAR_MIPMAP_LINEAR), b.generateMipmap(b.TEXTURE_2D)) : b.texParameteri(b.TEXTURE_2D, b.TEXTURE_MIN_FILTER, b.LINEAR);
    return u;
  };
  const n = new ia(8), t = new ia(8), x = new ia(10), y = new ia(10);
  this.Mb = function(l, u, q, C, E) {
    if (a()) {
      var w = n.push(l), L = t.push(u);
      if (b.canvas) {
        if (b.canvas.width != w || b.canvas.height != L) {
          b.canvas.width = w, b.canvas.height = L;
        }
        b.viewport(0, L - u, l, u);
        b.disable(b.SCISSOR_TEST);
        b.clearColor(0, 0, 0, 0);
        b.clear(b.COLOR_BUFFER_BIT);
        b.enable(b.SCISSOR_TEST);
        q.sort((H, aa) => aa.ub - H.ub);
        w = x.push(C);
        g != w && (b.bufferData(b.ARRAY_BUFFER, 8 * w, b.DYNAMIC_DRAW), g = w);
        w = 0;
        for (var R of q) {
          b.bufferSubData(b.ARRAY_BUFFER, w, R.Sa), w += 4 * R.Sa.length;
        }
        console.assert(w == 4 * C);
        for (var W of q) {
          b.bufferSubData(b.ARRAY_BUFFER, w, W.Ab), w += 4 * W.Ab.length;
        }
        console.assert(w == 8 * C);
        w = y.push(E);
        k != w && (b.bufferData(b.ELEMENT_ARRAY_BUFFER, 2 * w, b.DYNAMIC_DRAW), k = w);
        R = 0;
        for (var pa of q) {
          b.bufferSubData(b.ELEMENT_ARRAY_BUFFER, R, pa.indices), R += 2 * pa.indices.length;
        }
        console.assert(R == 2 * E);
        pa = 0;
        W = !0;
        w = R = 0;
        for (const H of q) {
          H.image.Ia != pa && (b.bindTexture(b.TEXTURE_2D, H.image.Ha || null), pa = H.image.Ia);
          H.fc ? (b.scissor(H.Ya, L - H.Za - H.ib, H.tc, H.ib), W = !0) : W && (b.scissor(0, L - u, l, u), W = !1);
          q = 2 / l;
          const aa = -2 / u;
          b.uniform4f(e, H.ga[0] * q * H.za, H.ga[1] * aa * H.Aa, H.ga[2] * q * H.za, H.ga[3] * aa * H.Aa);
          b.uniform2f(f, H.ga[4] * q * H.za + q * (H.Ya - H.bc * H.za) - 1, H.ga[5] * aa * H.Aa + aa * (H.Za - H.cc * H.Aa) + 1);
          b.vertexAttribPointer(0, 2, b.FLOAT, !1, 0, w);
          b.vertexAttribPointer(1, 2, b.FLOAT, !1, 0, w + 4 * C);
          b.drawElements(b.TRIANGLES, H.indices.length, b.UNSIGNED_SHORT, R);
          w += 4 * H.Sa.length;
          R += 2 * H.indices.length;
        }
        console.assert(w == 4 * C);
        console.assert(R == 2 * E);
      }
    }
  };
  this.canvas = function() {
    return a() && b.canvas;
  };
}(), ma = m.onRuntimeInitialized;
m.onRuntimeInitialized = function() {
  function a(r) {
    switch(r) {
      case n.srcOver:
        return "source-over";
      case n.screen:
        return "screen";
      case n.overlay:
        return "overlay";
      case n.darken:
        return "darken";
      case n.lighten:
        return "lighten";
      case n.colorDodge:
        return "color-dodge";
      case n.colorBurn:
        return "color-burn";
      case n.hardLight:
        return "hard-light";
      case n.softLight:
        return "soft-light";
      case n.difference:
        return "difference";
      case n.exclusion:
        return "exclusion";
      case n.multiply:
        return "multiply";
      case n.hue:
        return "hue";
      case n.saturation:
        return "saturation";
      case n.color:
        return "color";
      case n.luminosity:
        return "luminosity";
    }
  }
  function b(r) {
    return "rgba(" + ((16711680 & r) >>> 16) + "," + ((65280 & r) >>> 8) + "," + ((255 & r) >>> 0) + "," + ((4278190080 & r) >>> 24) / 255 + ")";
  }
  function c() {
    0 < L.length && (la.Mb(w.drawWidth(), w.drawHeight(), L, R, W), L = [], W = R = 0, w.reset(512, 512));
    for (const r of E) {
      for (const v of r.H) {
        v();
      }
      r.H = [];
    }
    E.clear();
  }
  ma && ma();
  var d = m.RenderPaintStyle;
  const e = m.RenderPath, f = m.RenderPaint, g = m.Renderer, k = m.StrokeCap, p = m.StrokeJoin, n = m.BlendMode, t = d.fill, x = d.stroke, y = m.FillRule.evenOdd;
  let l = 1;
  var u = m.RenderImage.extend("CanvasRenderImage", {__construct:function({ka:r, va:v} = {}) {
    this.__parent.__construct.call(this);
    this.Ia = l;
    l = l + 1 & 2147483647 || 1;
    this.ka = r;
    this.va = v;
  }, __destruct:function() {
    this.Ha && (la.Jb(this.Ha), URL.revokeObjectURL(this.Va));
    this.__parent.__destruct.call(this);
  }, decode:function(r) {
    var v = this;
    v.va && v.va(v);
    var F = new Image();
    v.Va = URL.createObjectURL(new Blob([r], {type:"image/png",}));
    F.onload = function() {
      v.Cb = F;
      v.Ha = la.Ib(F);
      v.size(F.width, F.height);
      v.ka && v.ka(v);
    };
    F.src = v.Va;
  },}), q = e.extend("CanvasRenderPath", {__construct:function() {
    this.__parent.__construct.call(this);
    this.T = new Path2D();
  }, rewind:function() {
    this.T = new Path2D();
  }, addPath:function(r, v, F, I, B, G, J) {
    var K = this.T, Z = K.addPath;
    r = r.T;
    const S = new DOMMatrix();
    S.a = v;
    S.b = F;
    S.c = I;
    S.d = B;
    S.e = G;
    S.f = J;
    Z.call(K, r, S);
  }, fillRule:function(r) {
    this.Ua = r;
  }, moveTo:function(r, v) {
    this.T.moveTo(r, v);
  }, lineTo:function(r, v) {
    this.T.lineTo(r, v);
  }, cubicTo:function(r, v, F, I, B, G) {
    this.T.bezierCurveTo(r, v, F, I, B, G);
  }, close:function() {
    this.T.closePath();
  },}), C = f.extend("CanvasRenderPaint", {color:function(r) {
    this.Wa = b(r);
  }, thickness:function(r) {
    this.Fb = r;
  }, join:function(r) {
    switch(r) {
      case p.miter:
        this.Ga = "miter";
        break;
      case p.round:
        this.Ga = "round";
        break;
      case p.bevel:
        this.Ga = "bevel";
    }
  }, cap:function(r) {
    switch(r) {
      case k.butt:
        this.Fa = "butt";
        break;
      case k.round:
        this.Fa = "round";
        break;
      case k.square:
        this.Fa = "square";
    }
  }, style:function(r) {
    this.Eb = r;
  }, blendMode:function(r) {
    this.Bb = a(r);
  }, clearGradient:function() {
    this.ia = null;
  }, linearGradient:function(r, v, F, I) {
    this.ia = {wb:r, xb:v, bb:F, cb:I, Pa:[],};
  }, radialGradient:function(r, v, F, I) {
    this.ia = {wb:r, xb:v, bb:F, cb:I, Pa:[], $b:!0,};
  }, addStop:function(r, v) {
    this.ia.Pa.push({color:r, stop:v,});
  }, completeGradient:function() {
  }, draw:function(r, v, F) {
    let I = this.Eb;
    var B = this.Wa, G = this.ia;
    r.globalCompositeOperation = this.Bb;
    if (null != G) {
      B = G.wb;
      var J = G.xb;
      const Z = G.bb;
      var K = G.cb;
      const S = G.Pa;
      G.$b ? (G = Z - B, K -= J, B = r.createRadialGradient(B, J, 0, B, J, Math.sqrt(G * G + K * K))) : B = r.createLinearGradient(B, J, Z, K);
      for (let Y = 0, T = S.length; Y < T; Y++) {
        J = S[Y], B.addColorStop(J.stop, b(J.color));
      }
      this.Wa = B;
      this.ia = null;
    }
    switch(I) {
      case x:
        r.strokeStyle = B;
        r.lineWidth = this.Fb;
        r.lineCap = this.Fa;
        r.lineJoin = this.Ga;
        r.stroke(v);
        break;
      case t:
        r.fillStyle = B, r.fill(v, F);
    }
  },});
  const E = new Set();
  let w = null, L = [], R = 0, W = 0;
  var pa = m.CanvasRenderer = g.extend("Renderer", {__construct:function(r) {
    this.__parent.__construct.call(this);
    this.S = [1, 0, 0, 1, 0, 0];
    this.B = r.getContext("2d");
    this.Ta = r;
    this.H = [];
  }, save:function() {
    this.S.push(...this.S.slice(this.S.length - 6));
    this.H.push(this.B.save.bind(this.B));
  }, restore:function() {
    const r = this.S.length - 6;
    if (6 > r) {
      throw "restore() called without matching save().";
    }
    this.S.splice(r);
    this.H.push(this.B.restore.bind(this.B));
  }, transform:function(r, v, F, I, B, G) {
    const J = this.S, K = J.length - 6;
    J.splice(K, 6, J[K] * r + J[K + 2] * v, J[K + 1] * r + J[K + 3] * v, J[K] * F + J[K + 2] * I, J[K + 1] * F + J[K + 3] * I, J[K] * B + J[K + 2] * G + J[K + 4], J[K + 1] * B + J[K + 3] * G + J[K + 5]);
    this.H.push(this.B.transform.bind(this.B, r, v, F, I, B, G));
  }, rotate:function(r) {
    const v = Math.sin(r);
    r = Math.cos(r);
    this.transform(r, v, -v, r, 0, 0);
  }, _drawPath:function(r, v) {
    this.H.push(v.draw.bind(v, this.B, r.T, r.Ua === y ? "evenodd" : "nonzero"));
  }, _drawRiveImage:function(r, v, F, I) {
    var B = r.Cb;
    if (B) {
      var G = this.B, J = a(F);
      this.H.push(function() {
        G.globalCompositeOperation = J;
        G.globalAlpha = I;
        G.drawImage(B, 0, 0);
        G.globalAlpha = 1;
      });
    }
  }, _getMatrix:function(r) {
    const v = this.S, F = v.length - 6;
    for (let I = 0; 6 > I; ++I) {
      r[I] = v[F + I];
    }
  }, _drawImageMesh:function(r, v, F, I, B, G, J, K, Z, S, Y) {
    v = this.B.canvas.width;
    var T = this.B.canvas.height;
    const Wb = S - K, Xb = Y - Z;
    K = Math.max(K, 0);
    Z = Math.max(Z, 0);
    S = Math.min(S, v);
    Y = Math.min(Y, T);
    const Da = S - K, Ea = Y - Z;
    console.assert(Da <= Math.min(Wb, v));
    console.assert(Ea <= Math.min(Xb, T));
    if (!(0 >= Da || 0 >= Ea)) {
      S = Da < Wb || Ea < Xb;
      v = Y = 1;
      var qa = Math.ceil(Da * Y), ra = Math.ceil(Ea * v);
      T = la.ac();
      qa > T && (Y *= T / qa, qa = T);
      ra > T && (v *= T / ra, ra = T);
      w || (w = new m.DynamicRectanizer(T), w.reset(512, 512));
      T = w.addRect(qa, ra);
      0 > T && (c(), E.add(this), T = w.addRect(qa, ra), console.assert(0 <= T));
      var Yb = T & 65535, Zb = T >> 16;
      L.push({ga:this.S.slice(this.S.length - 6), image:r, Ya:Yb, Za:Zb, bc:K, cc:Z, tc:qa, ib:ra, za:Y, Aa:v, Sa:new Float32Array(B), Ab:new Float32Array(G), indices:new Uint16Array(J), fc:S, ub:r.Ia << 1 | (S ? 1 : 0),});
      R += B.length;
      W += J.length;
      var xa = this.B, kd = a(F);
      this.H.push(function() {
        xa.save();
        xa.resetTransform();
        xa.globalCompositeOperation = kd;
        xa.globalAlpha = I;
        const $b = la.canvas();
        $b && xa.drawImage($b, Yb, Zb, qa, ra, K, Z, Da, Ea);
        xa.restore();
      });
    }
  }, _clipPath:function(r) {
    this.H.push(this.B.clip.bind(this.B, r.T, r.Ua === y ? "evenodd" : "nonzero"));
  }, clear:function() {
    E.add(this);
    this.H.push(this.B.clearRect.bind(this.B, 0, 0, this.Ta.width, this.Ta.height));
  }, flush:function() {
  }, translate:function(r, v) {
    this.transform(1, 0, 0, 1, r, v);
  },});
  m.makeRenderer = function(r) {
    const v = new pa(r), F = v.B;
    return new Proxy(v, {get(I, B) {
      if ("function" === typeof I[B]) {
        return function(...G) {
          return I[B].apply(I, G);
        };
      }
      if ("function" === typeof F[B]) {
        if (-1 < ka.indexOf(B)) {
          throw Error("RiveException: Method call to '" + B + "()' is not allowed, as the renderer cannot immediately pass through the return                 values of any canvas 2d context methods.");
        }
        return function(...G) {
          v.H.push(F[B].bind(F, ...G));
        };
      }
      return I[B];
    }, set(I, B, G) {
      if (B in F) {
        return v.H.push(() => {
          F[B] = G;
        }), !0;
      }
    },});
  };
  m.decodeImage = function(r, v) {
    (new u({ka:v})).decode(r);
  };
  m.renderFactory = {makeRenderPaint:function() {
    return new C();
  }, makeRenderPath:function() {
    return new q();
  }, makeRenderImage:function() {
    let r = aa;
    return new u({va:() => {
      r.total++;
    }, ka:() => {
      r.loaded++;
      if (r.loaded === r.total) {
        const v = r.ready;
        v && (v(), r.ready = null);
      }
    },});
  },};
  let H = m.load, aa = null;
  m.load = function(r, v, F = !0) {
    const I = new m.FallbackFileAssetLoader();
    void 0 !== v && I.addLoader(v);
    F && (v = new m.CDNFileAssetLoader(), I.addLoader(v));
    return new Promise(function(B) {
      let G = null;
      aa = {total:0, loaded:0, ready:function() {
        B(G);
      },};
      G = H(r, I);
      0 == aa.total && B(G);
    });
  };
  let ld = m.RendererWrapper.prototype.align;
  m.RendererWrapper.prototype.align = function(r, v, F, I, B = 1.0) {
    ld.call(this, r, v, F, I, B);
  };
  d = new ha();
  m.requestAnimationFrame = d.requestAnimationFrame.bind(d);
  m.cancelAnimationFrame = d.cancelAnimationFrame.bind(d);
  m.enableFPSCounter = d.Nb.bind(d);
  m.disableFPSCounter = d.Kb;
  d.nb = c;
  m.resolveAnimationFrame = c;
  m.cleanup = function() {
    w && w.delete();
  };
};
var na = Object.assign({}, m), oa = "./this.program", sa = "", ta, ua;
if (ea || fa) {
  fa ? sa = self.location.href : "undefined" != typeof document && document.currentScript && (sa = document.currentScript.src), _scriptName && (sa = _scriptName), sa.startsWith("blob:") ? sa = "" : sa = sa.substr(0, sa.replace(/[?#].*/, "").lastIndexOf("/") + 1), fa && (ua = a => {
    var b = new XMLHttpRequest();
    b.open("GET", a, !1);
    b.responseType = "arraybuffer";
    b.send(null);
    return new Uint8Array(b.response);
  }), ta = (a, b, c) => {
    if (va(a)) {
      var d = new XMLHttpRequest();
      d.open("GET", a, !0);
      d.responseType = "arraybuffer";
      d.onload = () => {
        200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
      };
      d.onerror = c;
      d.send(null);
    } else {
      fetch(a, {credentials:"same-origin"}).then(e => e.ok ? e.arrayBuffer() : Promise.reject(Error(e.status + " : " + e.url))).then(b, c);
    }
  };
}
var wa = m.print || console.log.bind(console), ya = m.printErr || console.error.bind(console);
Object.assign(m, na);
na = null;
m.thisProgram && (oa = m.thisProgram);
var za;
m.wasmBinary && (za = m.wasmBinary);
var Aa, Ba = !1, z, A, Ca, Fa, D, M, Ga, Ha;
function Ia() {
  var a = Aa.buffer;
  m.HEAP8 = z = new Int8Array(a);
  m.HEAP16 = Ca = new Int16Array(a);
  m.HEAPU8 = A = new Uint8Array(a);
  m.HEAPU16 = Fa = new Uint16Array(a);
  m.HEAP32 = D = new Int32Array(a);
  m.HEAPU32 = M = new Uint32Array(a);
  m.HEAPF32 = Ga = new Float32Array(a);
  m.HEAPF64 = Ha = new Float64Array(a);
}
var Ja = [], Ka = [], La = [];
function Ma() {
  var a = m.preRun.shift();
  Ja.unshift(a);
}
var Na = 0, Oa = null, Pa = null;
function Qa(a) {
  m.onAbort?.(a);
  a = "Aborted(" + a + ")";
  ya(a);
  Ba = !0;
  a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
  ca(a);
  throw a;
}
var Ra = a => a.startsWith("data:application/octet-stream;base64,"), va = a => a.startsWith("file://"), Sa;
function Ta(a) {
  if (a == Sa && za) {
    return new Uint8Array(za);
  }
  if (ua) {
    return ua(a);
  }
  throw "both async and sync fetching of the wasm failed";
}
function Ua(a) {
  return za ? Promise.resolve().then(() => Ta(a)) : new Promise((b, c) => {
    ta(a, d => b(new Uint8Array(d)), () => {
      try {
        b(Ta(a));
      } catch (d) {
        c(d);
      }
    });
  });
}
function Va(a, b, c) {
  return Ua(a).then(d => WebAssembly.instantiate(d, b)).then(c, d => {
    ya(`failed to asynchronously prepare wasm: ${d}`);
    Qa(d);
  });
}
function Wa(a, b) {
  var c = Sa;
  return za || "function" != typeof WebAssembly.instantiateStreaming || Ra(c) || va(c) || "function" != typeof fetch ? Va(c, a, b) : fetch(c, {credentials:"same-origin"}).then(d => WebAssembly.instantiateStreaming(d, a).then(b, function(e) {
    ya(`wasm streaming compile failed: ${e}`);
    ya("falling back to ArrayBuffer instantiation");
    return Va(c, a, b);
  }));
}
var Xa, Ya, bb = {464448:(a, b, c, d, e) => {
  if ("undefined" === typeof window || void 0 === (window.AudioContext || window.webkitAudioContext)) {
    return 0;
  }
  if ("undefined" === typeof window.h) {
    window.h = {ya:0};
    window.h.I = {};
    window.h.I.wa = a;
    window.h.I.capture = b;
    window.h.I.Ja = c;
    window.h.fa = {};
    window.h.fa.stopped = d;
    window.h.fa.vb = e;
    let f = window.h;
    f.D = [];
    f.rc = function(g) {
      for (var k = 0; k < f.D.length; ++k) {
        if (null == f.D[k]) {
          return f.D[k] = g, k;
        }
      }
      f.D.push(g);
      return f.D.length - 1;
    };
    f.zb = function(g) {
      for (f.D[g] = null; 0 < f.D.length;) {
        if (null == f.D[f.D.length - 1]) {
          f.D.pop();
        } else {
          break;
        }
      }
    };
    f.Oc = function(g) {
      for (var k = 0; k < f.D.length; ++k) {
        if (f.D[k] == g) {
          return f.zb(k);
        }
      }
    };
    f.pa = function(g) {
      return f.D[g];
    };
    f.Ra = ["touchend", "click"];
    f.unlock = function() {
      for (var g = 0; g < f.D.length; ++g) {
        var k = f.D[g];
        null != k && null != k.K && k.state === f.fa.vb && k.K.resume().then(() => {
          Za(k.ob);
        }, p => {
          console.error("Failed to resume audiocontext", p);
        });
      }
      f.Ra.map(function(p) {
        document.removeEventListener(p, f.unlock, !0);
      });
    };
    f.Ra.map(function(g) {
      document.addEventListener(g, f.unlock, !0);
    });
  }
  window.h.ya += 1;
  return 1;
}, 466626:() => {
  "undefined" !== typeof window.h && (window.h.Ra.map(function(a) {
    document.removeEventListener(a, window.h.unlock, !0);
  }), --window.h.ya, 0 === window.h.ya && delete window.h);
}, 466930:() => void 0 !== navigator.mediaDevices && void 0 !== navigator.mediaDevices.getUserMedia, 467034:() => {
  try {
    var a = new (window.AudioContext || window.webkitAudioContext)(), b = a.sampleRate;
    a.close();
    return b;
  } catch (c) {
    return 0;
  }
}, 467205:(a, b, c, d, e, f) => {
  if ("undefined" === typeof window.h) {
    return -1;
  }
  var g = {}, k = {};
  a == window.h.I.wa && 0 != c && (k.sampleRate = c);
  g.K = new (window.AudioContext || window.webkitAudioContext)(k);
  g.K.suspend();
  g.state = window.h.fa.stopped;
  c = 0;
  a != window.h.I.wa && (c = b);
  g.Y = g.K.createScriptProcessor(d, c, b);
  g.Y.onaudioprocess = function(p) {
    if (null == g.qa || 0 == g.qa.length) {
      g.qa = new Float32Array(Ga.buffer, e, d * b);
    }
    if (a == window.h.I.capture || a == window.h.I.Ja) {
      for (var n = 0; n < b; n += 1) {
        for (var t = p.inputBuffer.getChannelData(n), x = g.qa, y = 0; y < d; y += 1) {
          x[y * b + n] = t[y];
        }
      }
      $a(f, d, e);
    }
    if (a == window.h.I.wa || a == window.h.I.Ja) {
      for (ab(f, d, e), n = 0; n < p.outputBuffer.numberOfChannels; ++n) {
        for (t = p.outputBuffer.getChannelData(n), x = g.qa, y = 0; y < d; y += 1) {
          t[y] = x[y * b + n];
        }
      }
    } else {
      for (n = 0; n < p.outputBuffer.numberOfChannels; ++n) {
        p.outputBuffer.getChannelData(n).fill(0.0);
      }
    }
  };
  a != window.h.I.capture && a != window.h.I.Ja || navigator.mediaDevices.getUserMedia({audio:!0, video:!1}).then(function(p) {
    g.Ba = g.K.createMediaStreamSource(p);
    g.Ba.connect(g.Y);
    g.Y.connect(g.K.destination);
  }).catch(function(p) {
    console.log("Failed to get user media: " + p);
  });
  a == window.h.I.wa && g.Y.connect(g.K.destination);
  g.ob = f;
  return window.h.rc(g);
}, 470082:a => window.h.pa(a).K.sampleRate, 470155:a => {
  a = window.h.pa(a);
  void 0 !== a.Y && (a.Y.onaudioprocess = function() {
  }, a.Y.disconnect(), a.Y = void 0);
  void 0 !== a.Ba && (a.Ba.disconnect(), a.Ba = void 0);
  a.K.close();
  a.K = void 0;
  a.ob = void 0;
}, 470555:a => {
  window.h.zb(a);
}, 470605:a => {
  a = window.h.pa(a);
  a.K.resume();
  a.state = window.h.fa.vb;
}, 470744:a => {
  a = window.h.pa(a);
  a.K.suspend();
  a.state = window.h.fa.stopped;
}}, cb = a => {
  for (; 0 < a.length;) {
    a.shift()(m);
  }
};
function db() {
  var a = D[+eb >> 2];
  eb += 4;
  return a;
}
var fb = (a, b) => {
  for (var c = 0, d = a.length - 1; 0 <= d; d--) {
    var e = a[d];
    "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
  }
  if (b) {
    for (; c; c--) {
      a.unshift("..");
    }
  }
  return a;
}, gb = a => {
  var b = "/" === a.charAt(0), c = "/" === a.substr(-1);
  (a = fb(a.split("/").filter(d => !!d), !b).join("/")) || b || (a = ".");
  a && c && (a += "/");
  return (b ? "/" : "") + a;
}, hb = a => {
  var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
  a = b[0];
  b = b[1];
  if (!a && !b) {
    return ".";
  }
  b &&= b.substr(0, b.length - 1);
  return a + b;
}, ib = a => {
  if ("/" === a) {
    return "/";
  }
  a = gb(a);
  a = a.replace(/\/$/, "");
  var b = a.lastIndexOf("/");
  return -1 === b ? a : a.substr(b + 1);
}, jb = () => {
  if ("object" == typeof crypto && "function" == typeof crypto.getRandomValues) {
    return a => crypto.getRandomValues(a);
  }
  Qa("initRandomDevice");
}, kb = a => (kb = jb())(a), lb = (...a) => {
  for (var b = "", c = !1, d = a.length - 1; -1 <= d && !c; d--) {
    c = 0 <= d ? a[d] : "/";
    if ("string" != typeof c) {
      throw new TypeError("Arguments to path.resolve must be strings");
    }
    if (!c) {
      return "";
    }
    b = c + "/" + b;
    c = "/" === c.charAt(0);
  }
  b = fb(b.split("/").filter(e => !!e), !c).join("/");
  return (c ? "/" : "") + b || ".";
}, mb = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, nb = (a, b, c) => {
  var d = b + c;
  for (c = b; a[c] && !(c >= d);) {
    ++c;
  }
  if (16 < c - b && a.buffer && mb) {
    return mb.decode(a.subarray(b, c));
  }
  for (d = ""; b < c;) {
    var e = a[b++];
    if (e & 128) {
      var f = a[b++] & 63;
      if (192 == (e & 224)) {
        d += String.fromCharCode((e & 31) << 6 | f);
      } else {
        var g = a[b++] & 63;
        e = 224 == (e & 240) ? (e & 15) << 12 | f << 6 | g : (e & 7) << 18 | f << 12 | g << 6 | a[b++] & 63;
        65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
      }
    } else {
      d += String.fromCharCode(e);
    }
  }
  return d;
}, ob = [], pb = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    127 >= d ? b++ : 2047 >= d ? b += 2 : 55296 <= d && 57343 >= d ? (b += 4, ++c) : b += 3;
  }
  return b;
}, qb = (a, b, c, d) => {
  if (!(0 < d)) {
    return 0;
  }
  var e = c;
  d = c + d - 1;
  for (var f = 0; f < a.length; ++f) {
    var g = a.charCodeAt(f);
    if (55296 <= g && 57343 >= g) {
      var k = a.charCodeAt(++f);
      g = 65536 + ((g & 1023) << 10) | k & 1023;
    }
    if (127 >= g) {
      if (c >= d) {
        break;
      }
      b[c++] = g;
    } else {
      if (2047 >= g) {
        if (c + 1 >= d) {
          break;
        }
        b[c++] = 192 | g >> 6;
      } else {
        if (65535 >= g) {
          if (c + 2 >= d) {
            break;
          }
          b[c++] = 224 | g >> 12;
        } else {
          if (c + 3 >= d) {
            break;
          }
          b[c++] = 240 | g >> 18;
          b[c++] = 128 | g >> 12 & 63;
        }
        b[c++] = 128 | g >> 6 & 63;
      }
      b[c++] = 128 | g & 63;
    }
  }
  b[c] = 0;
  return c - e;
};
function rb(a, b) {
  var c = Array(pb(a) + 1);
  a = qb(a, c, 0, c.length);
  b && (c.length = a);
  return c;
}
var sb = [];
function tb(a, b) {
  sb[a] = {input:[], G:[], V:b};
  ub(a, vb);
}
var vb = {open(a) {
  var b = sb[a.node.xa];
  if (!b) {
    throw new N(43);
  }
  a.s = b;
  a.seekable = !1;
}, close(a) {
  a.s.V.oa(a.s);
}, oa(a) {
  a.s.V.oa(a.s);
}, read(a, b, c, d) {
  if (!a.s || !a.s.V.hb) {
    throw new N(60);
  }
  for (var e = 0, f = 0; f < d; f++) {
    try {
      var g = a.s.V.hb(a.s);
    } catch (k) {
      throw new N(29);
    }
    if (void 0 === g && 0 === e) {
      throw new N(6);
    }
    if (null === g || void 0 === g) {
      break;
    }
    e++;
    b[c + f] = g;
  }
  e && (a.node.timestamp = Date.now());
  return e;
}, write(a, b, c, d) {
  if (!a.s || !a.s.V.Ma) {
    throw new N(60);
  }
  try {
    for (var e = 0; e < d; e++) {
      a.s.V.Ma(a.s, b[c + e]);
    }
  } catch (f) {
    throw new N(29);
  }
  d && (a.node.timestamp = Date.now());
  return e;
},}, wb = {hb() {
  a: {
    if (!ob.length) {
      var a = null;
      "undefined" != typeof window && "function" == typeof window.prompt && (a = window.prompt("Input: "), null !== a && (a += "\n"));
      if (!a) {
        a = null;
        break a;
      }
      ob = rb(a, !0);
    }
    a = ob.shift();
  }
  return a;
}, Ma(a, b) {
  null === b || 10 === b ? (wa(nb(a.G, 0)), a.G = []) : 0 != b && a.G.push(b);
}, oa(a) {
  a.G && 0 < a.G.length && (wa(nb(a.G, 0)), a.G = []);
}, Xb() {
  return {zc:25856, Bc:5, yc:191, Ac:35387, xc:[3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]};
}, Yb() {
  return 0;
}, Zb() {
  return [24, 80];
},}, xb = {Ma(a, b) {
  null === b || 10 === b ? (ya(nb(a.G, 0)), a.G = []) : 0 != b && a.G.push(b);
}, oa(a) {
  a.G && 0 < a.G.length && (ya(nb(a.G, 0)), a.G = []);
},};
function yb(a, b) {
  var c = a.l ? a.l.length : 0;
  c >= b || (b = Math.max(b, c * (1048576 > c ? 2.0 : 1.125) >>> 0), 0 != c && (b = Math.max(b, 256)), c = a.l, a.l = new Uint8Array(b), 0 < a.v && a.l.set(c.subarray(0, a.v), 0));
}
var O = {N:null, U() {
  return O.createNode(null, "/", 16895, 0);
}, createNode(a, b, c, d) {
  if (24576 === (c & 61440) || 4096 === (c & 61440)) {
    throw new N(63);
  }
  O.N || (O.N = {dir:{node:{X:O.j.X, P:O.j.P, ja:O.j.ja, ta:O.j.ta, sb:O.j.sb, yb:O.j.yb, tb:O.j.tb, rb:O.j.rb, Ca:O.j.Ca}, stream:{aa:O.m.aa}}, file:{node:{X:O.j.X, P:O.j.P}, stream:{aa:O.m.aa, read:O.m.read, write:O.m.write, Xa:O.m.Xa, kb:O.m.kb, mb:O.m.mb}}, link:{node:{X:O.j.X, P:O.j.P, la:O.j.la}, stream:{}}, $a:{node:{X:O.j.X, P:O.j.P}, stream:zb}});
  c = Ab(a, b, c, d);
  16384 === (c.mode & 61440) ? (c.j = O.N.dir.node, c.m = O.N.dir.stream, c.l = {}) : 32768 === (c.mode & 61440) ? (c.j = O.N.file.node, c.m = O.N.file.stream, c.v = 0, c.l = null) : 40960 === (c.mode & 61440) ? (c.j = O.N.link.node, c.m = O.N.link.stream) : 8192 === (c.mode & 61440) && (c.j = O.N.$a.node, c.m = O.N.$a.stream);
  c.timestamp = Date.now();
  a && (a.l[b] = c, a.timestamp = c.timestamp);
  return c;
}, Fc(a) {
  return a.l ? a.l.subarray ? a.l.subarray(0, a.v) : new Uint8Array(a.l) : new Uint8Array(0);
}, j:{X(a) {
  var b = {};
  b.Dc = 8192 === (a.mode & 61440) ? a.id : 1;
  b.Hc = a.id;
  b.mode = a.mode;
  b.Kc = 1;
  b.uid = 0;
  b.Gc = 0;
  b.xa = a.xa;
  16384 === (a.mode & 61440) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.v : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
  b.vc = new Date(a.timestamp);
  b.Jc = new Date(a.timestamp);
  b.Cc = new Date(a.timestamp);
  b.Gb = 4096;
  b.wc = Math.ceil(b.size / b.Gb);
  return b;
}, P(a, b) {
  void 0 !== b.mode && (a.mode = b.mode);
  void 0 !== b.timestamp && (a.timestamp = b.timestamp);
  if (void 0 !== b.size && (b = b.size, a.v != b)) {
    if (0 == b) {
      a.l = null, a.v = 0;
    } else {
      var c = a.l;
      a.l = new Uint8Array(b);
      c && a.l.set(c.subarray(0, Math.min(b, a.v)));
      a.v = b;
    }
  }
}, ja() {
  throw Bb[44];
}, ta(a, b, c, d) {
  return O.createNode(a, b, c, d);
}, sb(a, b, c) {
  if (16384 === (a.mode & 61440)) {
    try {
      var d = Cb(b, c);
    } catch (f) {
    }
    if (d) {
      for (var e in d.l) {
        throw new N(55);
      }
    }
  }
  delete a.parent.l[a.name];
  a.parent.timestamp = Date.now();
  a.name = c;
  b.l[c] = a;
  b.timestamp = a.parent.timestamp;
}, yb(a, b) {
  delete a.l[b];
  a.timestamp = Date.now();
}, tb(a, b) {
  var c = Cb(a, b), d;
  for (d in c.l) {
    throw new N(55);
  }
  delete a.l[b];
  a.timestamp = Date.now();
}, rb(a) {
  var b = [".", ".."], c;
  for (c of Object.keys(a.l)) {
    b.push(c);
  }
  return b;
}, Ca(a, b, c) {
  a = O.createNode(a, b, 41471, 0);
  a.link = c;
  return a;
}, la(a) {
  if (40960 !== (a.mode & 61440)) {
    throw new N(28);
  }
  return a.link;
},}, m:{read(a, b, c, d, e) {
  var f = a.node.l;
  if (e >= a.node.v) {
    return 0;
  }
  a = Math.min(a.node.v - e, d);
  if (8 < a && f.subarray) {
    b.set(f.subarray(e, e + a), c);
  } else {
    for (d = 0; d < a; d++) {
      b[c + d] = f[e + d];
    }
  }
  return a;
}, write(a, b, c, d, e, f) {
  b.buffer === z.buffer && (f = !1);
  if (!d) {
    return 0;
  }
  a = a.node;
  a.timestamp = Date.now();
  if (b.subarray && (!a.l || a.l.subarray)) {
    if (f) {
      return a.l = b.subarray(c, c + d), a.v = d;
    }
    if (0 === a.v && 0 === e) {
      return a.l = b.slice(c, c + d), a.v = d;
    }
    if (e + d <= a.v) {
      return a.l.set(b.subarray(c, c + d), e), d;
    }
  }
  yb(a, e + d);
  if (a.l.subarray && b.subarray) {
    a.l.set(b.subarray(c, c + d), e);
  } else {
    for (f = 0; f < d; f++) {
      a.l[e + f] = b[c + f];
    }
  }
  a.v = Math.max(a.v, e + d);
  return d;
}, aa(a, b, c) {
  1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.v);
  if (0 > b) {
    throw new N(28);
  }
  return b;
}, Xa(a, b, c) {
  yb(a.node, b + c);
  a.node.v = Math.max(a.node.v, b + c);
}, kb(a, b, c, d, e) {
  if (32768 !== (a.node.mode & 61440)) {
    throw new N(43);
  }
  a = a.node.l;
  if (e & 2 || a.buffer !== z.buffer) {
    if (0 < c || c + b < a.length) {
      a.subarray ? a = a.subarray(c, c + b) : a = Array.prototype.slice.call(a, c, c + b);
    }
    c = !0;
    Qa();
    b = void 0;
    if (!b) {
      throw new N(48);
    }
    z.set(a, b);
  } else {
    c = !1, b = a.byteOffset;
  }
  return {o:b, uc:c};
}, mb(a, b, c, d) {
  O.m.write(a, b, 0, d, c, !1);
  return 0;
},},}, Db = (a, b) => {
  var c = 0;
  a && (c |= 365);
  b && (c |= 146);
  return c;
}, Eb = null, Fb = {}, Gb = [], Hb = 1, Ib = null, Jb = !0, N = class {
  constructor(a) {
    this.name = "ErrnoError";
    this.$ = a;
  }
}, Bb = {}, Kb = class {
  constructor() {
    this.h = {};
    this.node = null;
  }
  get flags() {
    return this.h.flags;
  }
  set flags(a) {
    this.h.flags = a;
  }
  get position() {
    return this.h.position;
  }
  set position(a) {
    this.h.position = a;
  }
}, Lb = class {
  constructor(a, b, c, d) {
    a ||= this;
    this.parent = a;
    this.U = a.U;
    this.ua = null;
    this.id = Hb++;
    this.name = b;
    this.mode = c;
    this.j = {};
    this.m = {};
    this.xa = d;
  }
  get read() {
    return 365 === (this.mode & 365);
  }
  set read(a) {
    a ? this.mode |= 365 : this.mode &= -366;
  }
  get write() {
    return 146 === (this.mode & 146);
  }
  set write(a) {
    a ? this.mode |= 146 : this.mode &= -147;
  }
};
function Mb(a, b = {}) {
  a = lb(a);
  if (!a) {
    return {path:"", node:null};
  }
  b = Object.assign({gb:!0, Oa:0}, b);
  if (8 < b.Oa) {
    throw new N(32);
  }
  a = a.split("/").filter(g => !!g);
  for (var c = Eb, d = "/", e = 0; e < a.length; e++) {
    var f = e === a.length - 1;
    if (f && b.parent) {
      break;
    }
    c = Cb(c, a[e]);
    d = gb(d + "/" + a[e]);
    c.ua && (!f || f && b.gb) && (c = c.ua.root);
    if (!f || b.fb) {
      for (f = 0; 40960 === (c.mode & 61440);) {
        if (c = Nb(d), d = lb(hb(d), c), c = Mb(d, {Oa:b.Oa + 1}).node, 40 < f++) {
          throw new N(32);
        }
      }
    }
  }
  return {path:d, node:c};
}
function Ob(a) {
  for (var b;;) {
    if (a === a.parent) {
      return a = a.U.lb, b ? "/" !== a[a.length - 1] ? `${a}/${b}` : a + b : a;
    }
    b = b ? `${a.name}/${b}` : a.name;
    a = a.parent;
  }
}
function Pb(a, b) {
  for (var c = 0, d = 0; d < b.length; d++) {
    c = (c << 5) - c + b.charCodeAt(d) | 0;
  }
  return (a + c >>> 0) % Ib.length;
}
function Cb(a, b) {
  var c = 16384 === (a.mode & 61440) ? (c = Qb(a, "x")) ? c : a.j.ja ? 0 : 2 : 54;
  if (c) {
    throw new N(c);
  }
  for (c = Ib[Pb(a.id, b)]; c; c = c.ec) {
    var d = c.name;
    if (c.parent.id === a.id && d === b) {
      return c;
    }
  }
  return a.j.ja(a, b);
}
function Ab(a, b, c, d) {
  a = new Lb(a, b, c, d);
  b = Pb(a.parent.id, a.name);
  a.ec = Ib[b];
  return Ib[b] = a;
}
function Rb(a) {
  var b = ["r", "w", "rw"][a & 3];
  a & 512 && (b += "w");
  return b;
}
function Qb(a, b) {
  if (Jb) {
    return 0;
  }
  if (!b.includes("r") || a.mode & 292) {
    if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73)) {
      return 2;
    }
  } else {
    return 2;
  }
  return 0;
}
function Sb(a, b) {
  try {
    return Cb(a, b), 20;
  } catch (c) {
  }
  return Qb(a, "wx");
}
function Tb(a) {
  a = Gb[a];
  if (!a) {
    throw new N(8);
  }
  return a;
}
function Ub(a, b = -1) {
  a = Object.assign(new Kb(), a);
  if (-1 == b) {
    a: {
      for (b = 0; 4096 >= b; b++) {
        if (!Gb[b]) {
          break a;
        }
      }
      throw new N(33);
    }
  }
  a.W = b;
  return Gb[b] = a;
}
function Vb(a, b = -1) {
  a = Ub(a, b);
  a.m?.Ec?.(a);
  return a;
}
var zb = {open(a) {
  a.m = Fb[a.node.xa].m;
  a.m.open?.(a);
}, aa() {
  throw new N(70);
},};
function ub(a, b) {
  Fb[a] = {m:b};
}
function ac(a, b) {
  var c = "/" === b;
  if (c && Eb) {
    throw new N(10);
  }
  if (!c && b) {
    var d = Mb(b, {gb:!1});
    b = d.path;
    d = d.node;
    if (d.ua) {
      throw new N(10);
    }
    if (16384 !== (d.mode & 61440)) {
      throw new N(54);
    }
  }
  b = {type:a, Mc:{}, lb:b, dc:[]};
  a = a.U(b);
  a.U = b;
  b.root = a;
  c ? Eb = a : d && (d.ua = b, d.U && d.U.dc.push(b));
}
function bc(a, b, c) {
  var d = Mb(a, {parent:!0}).node;
  a = ib(a);
  if (!a || "." === a || ".." === a) {
    throw new N(28);
  }
  var e = Sb(d, a);
  if (e) {
    throw new N(e);
  }
  if (!d.j.ta) {
    throw new N(63);
  }
  return d.j.ta(d, a, b, c);
}
function cc(a) {
  return bc(a, 16895, 0);
}
function dc(a, b, c) {
  "undefined" == typeof c && (c = b, b = 438);
  bc(a, b | 8192, c);
}
function ec(a, b) {
  if (!lb(a)) {
    throw new N(44);
  }
  var c = Mb(b, {parent:!0}).node;
  if (!c) {
    throw new N(44);
  }
  b = ib(b);
  var d = Sb(c, b);
  if (d) {
    throw new N(d);
  }
  if (!c.j.Ca) {
    throw new N(63);
  }
  c.j.Ca(c, b, a);
}
function Nb(a) {
  a = Mb(a).node;
  if (!a) {
    throw new N(44);
  }
  if (!a.j.la) {
    throw new N(28);
  }
  return lb(Ob(a.parent), a.j.la(a));
}
function fc(a, b, c) {
  if ("" === a) {
    throw new N(44);
  }
  if ("string" == typeof b) {
    var d = {r:0, "r+":2, w:577, "w+":578, a:1089, "a+":1090,}[b];
    if ("undefined" == typeof d) {
      throw Error(`Unknown file open mode: ${b}`);
    }
    b = d;
  }
  c = b & 64 ? ("undefined" == typeof c ? 438 : c) & 4095 | 32768 : 0;
  if ("object" == typeof a) {
    var e = a;
  } else {
    a = gb(a);
    try {
      e = Mb(a, {fb:!(b & 131072)}).node;
    } catch (f) {
    }
  }
  d = !1;
  if (b & 64) {
    if (e) {
      if (b & 128) {
        throw new N(20);
      }
    } else {
      e = bc(a, c, 0), d = !0;
    }
  }
  if (!e) {
    throw new N(44);
  }
  8192 === (e.mode & 61440) && (b &= -513);
  if (b & 65536 && 16384 !== (e.mode & 61440)) {
    throw new N(54);
  }
  if (!d && (c = e ? 40960 === (e.mode & 61440) ? 32 : 16384 === (e.mode & 61440) && ("r" !== Rb(b) || b & 512) ? 31 : Qb(e, Rb(b)) : 44)) {
    throw new N(c);
  }
  if (b & 512 && !d) {
    c = e;
    c = "string" == typeof c ? Mb(c, {fb:!0}).node : c;
    if (!c.j.P) {
      throw new N(63);
    }
    if (16384 === (c.mode & 61440)) {
      throw new N(31);
    }
    if (32768 !== (c.mode & 61440)) {
      throw new N(28);
    }
    if (d = Qb(c, "w")) {
      throw new N(d);
    }
    c.j.P(c, {size:0, timestamp:Date.now()});
  }
  b &= -131713;
  e = Ub({node:e, path:Ob(e), flags:b, seekable:!0, position:0, m:e.m, sc:[], error:!1});
  e.m.open && e.m.open(e);
  !m.logReadFiles || b & 1 || (gc ||= {}, a in gc || (gc[a] = 1));
  return e;
}
function hc(a, b, c) {
  if (null === a.W) {
    throw new N(8);
  }
  if (!a.seekable || !a.m.aa) {
    throw new N(70);
  }
  if (0 != c && 1 != c && 2 != c) {
    throw new N(28);
  }
  a.position = a.m.aa(a, b, c);
  a.sc = [];
}
var ic;
function jc(a, b, c) {
  a = gb("/dev/" + a);
  var d = Db(!!b, !!c);
  kc ||= 64;
  var e = kc++ << 8 | 0;
  ub(e, {open(f) {
    f.seekable = !1;
  }, close() {
    c?.buffer?.length && c(10);
  }, read(f, g, k, p) {
    for (var n = 0, t = 0; t < p; t++) {
      try {
        var x = b();
      } catch (y) {
        throw new N(29);
      }
      if (void 0 === x && 0 === n) {
        throw new N(6);
      }
      if (null === x || void 0 === x) {
        break;
      }
      n++;
      g[k + t] = x;
    }
    n && (f.node.timestamp = Date.now());
    return n;
  }, write(f, g, k, p) {
    for (var n = 0; n < p; n++) {
      try {
        c(g[k + n]);
      } catch (t) {
        throw new N(29);
      }
    }
    p && (f.node.timestamp = Date.now());
    return n;
  }});
  dc(a, d, e);
}
var kc, lc = {}, gc, eb = void 0, mc = (a, b) => Object.defineProperty(b, "name", {value:a}), nc = [], oc = [], P, pc = a => {
  if (!a) {
    throw new P("Cannot use deleted val. handle = " + a);
  }
  return oc[a];
}, qc = a => {
  switch(a) {
    case void 0:
      return 2;
    case null:
      return 4;
    case !0:
      return 6;
    case !1:
      return 8;
    default:
      const b = nc.pop() || oc.length;
      oc[b] = a;
      oc[b + 1] = 1;
      return b;
  }
}, rc = a => {
  var b = Error, c = mc(a, function(d) {
    this.name = a;
    this.message = d;
    d = Error(d).stack;
    void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""));
  });
  c.prototype = Object.create(b.prototype);
  c.prototype.constructor = c;
  c.prototype.toString = function() {
    return void 0 === this.message ? this.name : `${this.name}: ${this.message}`;
  };
  return c;
}, sc, tc, Q = a => {
  for (var b = ""; A[a];) {
    b += tc[A[a++]];
  }
  return b;
}, uc = [], vc = () => {
  for (; uc.length;) {
    var a = uc.pop();
    a.g.ea = !1;
    a["delete"]();
  }
}, wc, xc = {}, yc = (a, b) => {
  if (void 0 === b) {
    throw new P("ptr should not be undefined");
  }
  for (; a.C;) {
    b = a.ma(b), a = a.C;
  }
  return b;
}, zc = {}, Cc = a => {
  a = Ac(a);
  var b = Q(a);
  Bc(a);
  return b;
}, Dc = (a, b) => {
  var c = zc[a];
  if (void 0 === c) {
    throw a = `${b} has unknown type ${Cc(a)}`, new P(a);
  }
  return c;
}, Ec = () => {
}, Fc = !1, Gc = (a, b, c) => {
  if (b === c) {
    return a;
  }
  if (void 0 === c.C) {
    return null;
  }
  a = Gc(a, b, c.C);
  return null === a ? null : c.Lb(a);
}, Hc = {}, Ic = (a, b) => {
  b = yc(a, b);
  return xc[b];
}, Jc, Lc = (a, b) => {
  if (!b.u || !b.o) {
    throw new Jc("makeClassHandle requires ptr and ptrType");
  }
  if (!!b.J !== !!b.F) {
    throw new Jc("Both smartPtrType and smartPtr must be specified");
  }
  b.count = {value:1};
  return Kc(Object.create(a, {g:{value:b, writable:!0,},}));
}, Kc = a => {
  if ("undefined" === typeof FinalizationRegistry) {
    return Kc = b => b, a;
  }
  Fc = new FinalizationRegistry(b => {
    b = b.g;
    --b.count.value;
    0 === b.count.value && (b.F ? b.J.O(b.F) : b.u.i.O(b.o));
  });
  Kc = b => {
    var c = b.g;
    c.F && Fc.register(b, {g:c}, b);
    return b;
  };
  Ec = b => {
    Fc.unregister(b);
  };
  return Kc(a);
}, Mc = {}, Nc = a => {
  for (; a.length;) {
    var b = a.pop();
    a.pop()(b);
  }
};
function Oc(a) {
  return this.fromWireType(M[a >> 2]);
}
var Pc = {}, Qc = {}, U = (a, b, c) => {
  function d(k) {
    k = c(k);
    if (k.length !== a.length) {
      throw new Jc("Mismatched type converter count");
    }
    for (var p = 0; p < a.length; ++p) {
      Rc(a[p], k[p]);
    }
  }
  a.forEach(function(k) {
    Qc[k] = b;
  });
  var e = Array(b.length), f = [], g = 0;
  b.forEach((k, p) => {
    zc.hasOwnProperty(k) ? e[p] = zc[k] : (f.push(k), Pc.hasOwnProperty(k) || (Pc[k] = []), Pc[k].push(() => {
      e[p] = zc[k];
      ++g;
      g === f.length && d(e);
    }));
  });
  0 === f.length && d(e);
};
function Sc(a, b, c = {}) {
  var d = b.name;
  if (!a) {
    throw new P(`type "${d}" must have a positive integer typeid pointer`);
  }
  if (zc.hasOwnProperty(a)) {
    if (c.Vb) {
      return;
    }
    throw new P(`Cannot register type '${d}' twice`);
  }
  zc[a] = b;
  delete Qc[a];
  Pc.hasOwnProperty(a) && (b = Pc[a], delete Pc[a], b.forEach(e => e()));
}
function Rc(a, b, c = {}) {
  if (!("argPackAdvance" in b)) {
    throw new TypeError("registerType registeredInstance requires argPackAdvance");
  }
  return Sc(a, b, c);
}
var Tc = a => {
  throw new P(a.g.u.i.name + " instance already deleted");
};
function Uc() {
}
var Vc = (a, b, c) => {
  if (void 0 === a[b].A) {
    var d = a[b];
    a[b] = function(...e) {
      if (!a[b].A.hasOwnProperty(e.length)) {
        throw new P(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${a[b].A})!`);
      }
      return a[b].A[e.length].apply(this, e);
    };
    a[b].A = [];
    a[b].A[d.da] = d;
  }
}, Wc = (a, b, c) => {
  if (m.hasOwnProperty(a)) {
    if (void 0 === c || void 0 !== m[a].A && void 0 !== m[a].A[c]) {
      throw new P(`Cannot register public name '${a}' twice`);
    }
    Vc(m, a, a);
    if (m.hasOwnProperty(c)) {
      throw new P(`Cannot register multiple overloads of a function with the same number of arguments (${c})!`);
    }
    m[a].A[c] = b;
  } else {
    m[a] = b, void 0 !== c && (m[a].Lc = c);
  }
}, Xc = a => {
  if (void 0 === a) {
    return "_unknown";
  }
  a = a.replace(/[^a-zA-Z0-9_]/g, "$");
  var b = a.charCodeAt(0);
  return 48 <= b && 57 >= b ? `_${a}` : a;
};
function Yc(a, b, c, d, e, f, g, k) {
  this.name = a;
  this.constructor = b;
  this.M = c;
  this.O = d;
  this.C = e;
  this.Qb = f;
  this.ma = g;
  this.Lb = k;
  this.pb = [];
}
var Zc = (a, b, c) => {
  for (; b !== c;) {
    if (!b.ma) {
      throw new P(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);
    }
    a = b.ma(a);
    b = b.C;
  }
  return a;
};
function $c(a, b) {
  if (null === b) {
    if (this.La) {
      throw new P(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new P(`Cannot pass "${ad(b)}" as a ${this.name}`);
  }
  if (!b.g.o) {
    throw new P(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  return Zc(b.g.o, b.g.u.i, this.i);
}
function bd(a, b) {
  if (null === b) {
    if (this.La) {
      throw new P(`null is not a valid ${this.name}`);
    }
    if (this.sa) {
      var c = this.Na();
      null !== a && a.push(this.O, c);
      return c;
    }
    return 0;
  }
  if (!b || !b.g) {
    throw new P(`Cannot pass "${ad(b)}" as a ${this.name}`);
  }
  if (!b.g.o) {
    throw new P(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (!this.ra && b.g.u.ra) {
    throw new P(`Cannot convert argument of type ${b.g.J ? b.g.J.name : b.g.u.name} to parameter type ${this.name}`);
  }
  c = Zc(b.g.o, b.g.u.i, this.i);
  if (this.sa) {
    if (void 0 === b.g.F) {
      throw new P("Passing raw pointer to smart pointer is illegal");
    }
    switch(this.mc) {
      case 0:
        if (b.g.J === this) {
          c = b.g.F;
        } else {
          throw new P(`Cannot convert argument of type ${b.g.J ? b.g.J.name : b.g.u.name} to parameter type ${this.name}`);
        }
        break;
      case 1:
        c = b.g.F;
        break;
      case 2:
        if (b.g.J === this) {
          c = b.g.F;
        } else {
          var d = b.clone();
          c = this.ic(c, qc(() => d["delete"]()));
          null !== a && a.push(this.O, c);
        }
        break;
      default:
        throw new P("Unsupporting sharing policy");
    }
  }
  return c;
}
function cd(a, b) {
  if (null === b) {
    if (this.La) {
      throw new P(`null is not a valid ${this.name}`);
    }
    return 0;
  }
  if (!b.g) {
    throw new P(`Cannot pass "${ad(b)}" as a ${this.name}`);
  }
  if (!b.g.o) {
    throw new P(`Cannot pass deleted object as a pointer of type ${this.name}`);
  }
  if (b.g.u.ra) {
    throw new P(`Cannot convert argument of type ${b.g.u.name} to parameter type ${this.name}`);
  }
  return Zc(b.g.o, b.g.u.i, this.i);
}
function dd(a, b, c, d, e, f, g, k, p, n, t) {
  this.name = a;
  this.i = b;
  this.La = c;
  this.ra = d;
  this.sa = e;
  this.hc = f;
  this.mc = g;
  this.qb = k;
  this.Na = p;
  this.ic = n;
  this.O = t;
  e || void 0 !== b.C ? this.toWireType = bd : (this.toWireType = d ? $c : cd, this.L = null);
}
var ed = (a, b, c) => {
  if (!m.hasOwnProperty(a)) {
    throw new Jc("Replacing nonexistent public symbol");
  }
  void 0 !== m[a].A && void 0 !== c ? m[a].A[c] = b : (m[a] = b, m[a].da = c);
}, fd = [], gd, hd = a => {
  var b = fd[a];
  b || (a >= fd.length && (fd.length = a + 1), fd[a] = b = gd.get(a));
  return b;
}, jd = (a, b, c = []) => {
  a.includes("j") ? (a = a.replace(/p/g, "i"), b = (0,m["dynCall_" + a])(b, ...c)) : b = hd(b)(...c);
  return b;
}, md = (a, b) => (...c) => jd(a, b, c), V = (a, b) => {
  a = Q(a);
  var c = a.includes("j") ? md(a, b) : hd(b);
  if ("function" != typeof c) {
    throw new P(`unknown function pointer with signature ${a}: ${b}`);
  }
  return c;
}, nd, od = (a, b) => {
  function c(f) {
    e[f] || zc[f] || (Qc[f] ? Qc[f].forEach(c) : (d.push(f), e[f] = !0));
  }
  var d = [], e = {};
  b.forEach(c);
  throw new nd(`${a}: ` + d.map(Cc).join([", "]));
};
function pd(a) {
  for (var b = 1; b < a.length; ++b) {
    if (null !== a[b] && void 0 === a[b].L) {
      return !0;
    }
  }
  return !1;
}
function qd(a, b, c, d, e) {
  var f = b.length;
  if (2 > f) {
    throw new P("argTypes array size mismatch! Must at least get return value and 'this' types!");
  }
  var g = null !== b[1] && null !== c, k = pd(b), p = "void" !== b[0].name, n = f - 2, t = Array(n), x = [], y = [];
  return mc(a, function(...l) {
    if (l.length !== n) {
      throw new P(`function ${a} called with ${l.length} arguments, expected ${n}`);
    }
    y.length = 0;
    x.length = g ? 2 : 1;
    x[0] = e;
    if (g) {
      var u = b[1].toWireType(y, this);
      x[1] = u;
    }
    for (var q = 0; q < n; ++q) {
      t[q] = b[q + 2].toWireType(y, l[q]), x.push(t[q]);
    }
    l = d(...x);
    if (k) {
      Nc(y);
    } else {
      for (q = g ? 1 : 2; q < b.length; q++) {
        var C = 1 === q ? u : t[q - 2];
        null !== b[q].L && b[q].L(C);
      }
    }
    u = p ? b[0].fromWireType(l) : void 0;
    return u;
  });
}
var rd = (a, b) => {
  for (var c = [], d = 0; d < a; d++) {
    c.push(M[b + 4 * d >> 2]);
  }
  return c;
}, sd = a => {
  a = a.trim();
  const b = a.indexOf("(");
  return -1 !== b ? a.substr(0, b) : a;
}, td = (a, b, c) => {
  if (!(a instanceof Object)) {
    throw new P(`${c} with invalid "this": ${a}`);
  }
  if (!(a instanceof b.i.constructor)) {
    throw new P(`${c} incompatible with "this" of type ${a.constructor.name}`);
  }
  if (!a.g.o) {
    throw new P(`cannot call emscripten binding method ${c} on deleted object`);
  }
  return Zc(a.g.o, a.g.u.i, b.i);
}, ud = a => {
  9 < a && 0 === --oc[a + 1] && (oc[a] = void 0, nc.push(a));
}, vd = {name:"emscripten::val", fromWireType:a => {
  var b = pc(a);
  ud(a);
  return b;
}, toWireType:(a, b) => qc(b), argPackAdvance:8, readValueFromPointer:Oc, L:null,}, wd = (a, b, c) => {
  switch(b) {
    case 1:
      return c ? function(d) {
        return this.fromWireType(z[d]);
      } : function(d) {
        return this.fromWireType(A[d]);
      };
    case 2:
      return c ? function(d) {
        return this.fromWireType(Ca[d >> 1]);
      } : function(d) {
        return this.fromWireType(Fa[d >> 1]);
      };
    case 4:
      return c ? function(d) {
        return this.fromWireType(D[d >> 2]);
      } : function(d) {
        return this.fromWireType(M[d >> 2]);
      };
    default:
      throw new TypeError(`invalid integer width (${b}): ${a}`);
  }
}, ad = a => {
  if (null === a) {
    return "null";
  }
  var b = typeof a;
  return "object" === b || "array" === b || "function" === b ? a.toString() : "" + a;
}, xd = (a, b) => {
  switch(b) {
    case 4:
      return function(c) {
        return this.fromWireType(Ga[c >> 2]);
      };
    case 8:
      return function(c) {
        return this.fromWireType(Ha[c >> 3]);
      };
    default:
      throw new TypeError(`invalid float width (${b}): ${a}`);
  }
}, yd = (a, b, c) => {
  switch(b) {
    case 1:
      return c ? d => z[d] : d => A[d];
    case 2:
      return c ? d => Ca[d >> 1] : d => Fa[d >> 1];
    case 4:
      return c ? d => D[d >> 2] : d => M[d >> 2];
    default:
      throw new TypeError(`invalid integer width (${b}): ${a}`);
  }
}, zd = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Ad = (a, b) => {
  var c = a >> 1;
  for (var d = c + b / 2; !(c >= d) && Fa[c];) {
    ++c;
  }
  c <<= 1;
  if (32 < c - a && zd) {
    return zd.decode(A.subarray(a, c));
  }
  c = "";
  for (d = 0; !(d >= b / 2); ++d) {
    var e = Ca[a + 2 * d >> 1];
    if (0 == e) {
      break;
    }
    c += String.fromCharCode(e);
  }
  return c;
}, Bd = (a, b, c) => {
  c ??= 2147483647;
  if (2 > c) {
    return 0;
  }
  c -= 2;
  var d = b;
  c = c < 2 * a.length ? c / 2 : a.length;
  for (var e = 0; e < c; ++e) {
    Ca[b >> 1] = a.charCodeAt(e), b += 2;
  }
  Ca[b >> 1] = 0;
  return b - d;
}, Cd = a => 2 * a.length, Dd = (a, b) => {
  for (var c = 0, d = ""; !(c >= b / 4);) {
    var e = D[a + 4 * c >> 2];
    if (0 == e) {
      break;
    }
    ++c;
    65536 <= e ? (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023)) : d += String.fromCharCode(e);
  }
  return d;
}, Ed = (a, b, c) => {
  c ??= 2147483647;
  if (4 > c) {
    return 0;
  }
  var d = b;
  c = d + c - 4;
  for (var e = 0; e < a.length; ++e) {
    var f = a.charCodeAt(e);
    if (55296 <= f && 57343 >= f) {
      var g = a.charCodeAt(++e);
      f = 65536 + ((f & 1023) << 10) | g & 1023;
    }
    D[b >> 2] = f;
    b += 4;
    if (b + 4 > c) {
      break;
    }
  }
  D[b >> 2] = 0;
  return b - d;
}, Fd = a => {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c);
    55296 <= d && 57343 >= d && ++c;
    b += 4;
  }
  return b;
}, Gd = (a, b, c) => {
  var d = [];
  a = a.toWireType(d, c);
  d.length && (M[b >> 2] = qc(d));
  return a;
}, Hd = {}, Id = a => {
  var b = Hd[a];
  return void 0 === b ? Q(a) : b;
}, Jd = [], Kd = a => {
  var b = Jd.length;
  Jd.push(a);
  return b;
}, Ld = (a, b) => {
  for (var c = Array(a), d = 0; d < a; ++d) {
    c[d] = Dc(M[b + 4 * d >> 2], "parameter " + d);
  }
  return c;
}, Md = Reflect.construct, Nd = [], Od = {}, Qd = () => {
  if (!Pd) {
    var a = {USER:"web_user", LOGNAME:"web_user", PATH:"/", PWD:"/", HOME:"/home/web_user", LANG:("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _:oa || "./this.program"}, b;
    for (b in Od) {
      void 0 === Od[b] ? delete a[b] : a[b] = Od[b];
    }
    var c = [];
    for (b in a) {
      c.push(`${b}=${a[b]}`);
    }
    Pd = c;
  }
  return Pd;
}, Pd, Rd = a => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400), Sd = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Td = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Ud = (a, b, c, d) => {
  function e(l, u, q) {
    for (l = "number" == typeof l ? l.toString() : l || ""; l.length < u;) {
      l = q[0] + l;
    }
    return l;
  }
  function f(l, u) {
    return e(l, u, "0");
  }
  function g(l, u) {
    function q(E) {
      return 0 > E ? -1 : 0 < E ? 1 : 0;
    }
    var C;
    0 === (C = q(l.getFullYear() - u.getFullYear())) && 0 === (C = q(l.getMonth() - u.getMonth())) && (C = q(l.getDate() - u.getDate()));
    return C;
  }
  function k(l) {
    switch(l.getDay()) {
      case 0:
        return new Date(l.getFullYear() - 1, 11, 29);
      case 1:
        return l;
      case 2:
        return new Date(l.getFullYear(), 0, 3);
      case 3:
        return new Date(l.getFullYear(), 0, 2);
      case 4:
        return new Date(l.getFullYear(), 0, 1);
      case 5:
        return new Date(l.getFullYear() - 1, 11, 31);
      case 6:
        return new Date(l.getFullYear() - 1, 11, 30);
    }
  }
  function p(l) {
    var u = l.ba;
    for (l = new Date((new Date(l.ca + 1900, 0, 1)).getTime()); 0 < u;) {
      var q = l.getMonth(), C = (Rd(l.getFullYear()) ? Sd : Td)[q];
      if (u > C - l.getDate()) {
        u -= C - l.getDate() + 1, l.setDate(1), 11 > q ? l.setMonth(q + 1) : (l.setMonth(0), l.setFullYear(l.getFullYear() + 1));
      } else {
        l.setDate(l.getDate() + u);
        break;
      }
    }
    q = new Date(l.getFullYear() + 1, 0, 4);
    u = k(new Date(l.getFullYear(), 0, 4));
    q = k(q);
    return 0 >= g(u, l) ? 0 >= g(q, l) ? l.getFullYear() + 1 : l.getFullYear() : l.getFullYear() - 1;
  }
  var n = M[d + 40 >> 2];
  d = {pc:D[d >> 2], oc:D[d + 4 >> 2], Da:D[d + 8 >> 2], Qa:D[d + 12 >> 2], Ea:D[d + 16 >> 2], ca:D[d + 20 >> 2], R:D[d + 24 >> 2], ba:D[d + 28 >> 2], Nc:D[d + 32 >> 2], nc:D[d + 36 >> 2], qc:n ? n ? nb(A, n) : "" : ""};
  c = c ? nb(A, c) : "";
  n = {"%c":"%a %b %d %H:%M:%S %Y", "%D":"%m/%d/%y", "%F":"%Y-%m-%d", "%h":"%b", "%r":"%I:%M:%S %p", "%R":"%H:%M", "%T":"%H:%M:%S", "%x":"%m/%d/%y", "%X":"%H:%M:%S", "%Ec":"%c", "%EC":"%C", "%Ex":"%m/%d/%y", "%EX":"%H:%M:%S", "%Ey":"%y", "%EY":"%Y", "%Od":"%d", "%Oe":"%e", "%OH":"%H", "%OI":"%I", "%Om":"%m", "%OM":"%M", "%OS":"%S", "%Ou":"%u", "%OU":"%U", "%OV":"%V", "%Ow":"%w", "%OW":"%W", "%Oy":"%y",};
  for (var t in n) {
    c = c.replace(new RegExp(t, "g"), n[t]);
  }
  var x = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), y = "January February March April May June July August September October November December".split(" ");
  n = {"%a":l => x[l.R].substring(0, 3), "%A":l => x[l.R], "%b":l => y[l.Ea].substring(0, 3), "%B":l => y[l.Ea], "%C":l => f((l.ca + 1900) / 100 | 0, 2), "%d":l => f(l.Qa, 2), "%e":l => e(l.Qa, 2, " "), "%g":l => p(l).toString().substring(2), "%G":p, "%H":l => f(l.Da, 2), "%I":l => {
    l = l.Da;
    0 == l ? l = 12 : 12 < l && (l -= 12);
    return f(l, 2);
  }, "%j":l => {
    for (var u = 0, q = 0; q <= l.Ea - 1; u += (Rd(l.ca + 1900) ? Sd : Td)[q++]) {
    }
    return f(l.Qa + u, 3);
  }, "%m":l => f(l.Ea + 1, 2), "%M":l => f(l.oc, 2), "%n":() => "\n", "%p":l => 0 <= l.Da && 12 > l.Da ? "AM" : "PM", "%S":l => f(l.pc, 2), "%t":() => "\t", "%u":l => l.R || 7, "%U":l => f(Math.floor((l.ba + 7 - l.R) / 7), 2), "%V":l => {
    var u = Math.floor((l.ba + 7 - (l.R + 6) % 7) / 7);
    2 >= (l.R + 371 - l.ba - 2) % 7 && u++;
    if (u) {
      53 == u && (q = (l.R + 371 - l.ba) % 7, 4 == q || 3 == q && Rd(l.ca) || (u = 1));
    } else {
      u = 52;
      var q = (l.R + 7 - l.ba - 1) % 7;
      (4 == q || 5 == q && Rd(l.ca % 400 - 1)) && u++;
    }
    return f(u, 2);
  }, "%w":l => l.R, "%W":l => f(Math.floor((l.ba + 7 - (l.R + 6) % 7) / 7), 2), "%y":l => (l.ca + 1900).toString().substring(2), "%Y":l => l.ca + 1900, "%z":l => {
    l = l.nc;
    var u = 0 <= l;
    l = Math.abs(l) / 60;
    return (u ? "+" : "-") + String("0000" + (l / 60 * 100 + l % 60)).slice(-4);
  }, "%Z":l => l.qc, "%%":() => "%"};
  c = c.replace(/%%/g, "\x00\x00");
  for (t in n) {
    c.includes(t) && (c = c.replace(new RegExp(t, "g"), n[t](d)));
  }
  c = c.replace(/\0\0/g, "%");
  t = rb(c, !1);
  if (t.length > b) {
    return 0;
  }
  z.set(t, a);
  return t.length - 1;
};
[44].forEach(a => {
  Bb[a] = new N(a);
  Bb[a].stack = "<generic error, no stack>";
});
Ib = Array(4096);
ac(O, "/");
cc("/tmp");
cc("/home");
cc("/home/web_user");
(function() {
  cc("/dev");
  ub(259, {read:() => 0, write:(d, e, f, g) => g,});
  dc("/dev/null", 259);
  tb(1280, wb);
  tb(1536, xb);
  dc("/dev/tty", 1280);
  dc("/dev/tty1", 1536);
  var a = new Uint8Array(1024), b = 0, c = () => {
    0 === b && (b = kb(a).byteLength);
    return a[--b];
  };
  jc("random", c);
  jc("urandom", c);
  cc("/dev/shm");
  cc("/dev/shm/tmp");
})();
(function() {
  cc("/proc");
  var a = cc("/proc/self");
  cc("/proc/self/fd");
  ac({U() {
    var b = Ab(a, "fd", 16895, 73);
    b.j = {ja(c, d) {
      var e = Tb(+d);
      c = {parent:null, U:{lb:"fake"}, j:{la:() => e.path},};
      return c.parent = c;
    }};
    return b;
  }}, "/proc/self/fd");
})();
P = m.BindingError = class extends Error {
  constructor(a) {
    super(a);
    this.name = "BindingError";
  }
};
oc.push(0, 1, void 0, 1, null, 1, !0, 1, !1, 1,);
m.count_emval_handles = () => oc.length / 2 - 5 - nc.length;
sc = m.PureVirtualError = rc("PureVirtualError");
for (var Vd = Array(256), Wd = 0; 256 > Wd; ++Wd) {
  Vd[Wd] = String.fromCharCode(Wd);
}
tc = Vd;
m.getInheritedInstanceCount = () => Object.keys(xc).length;
m.getLiveInheritedInstances = () => {
  var a = [], b;
  for (b in xc) {
    xc.hasOwnProperty(b) && a.push(xc[b]);
  }
  return a;
};
m.flushPendingDeletes = vc;
m.setDelayFunction = a => {
  wc = a;
  uc.length && wc && wc(vc);
};
Jc = m.InternalError = class extends Error {
  constructor(a) {
    super(a);
    this.name = "InternalError";
  }
};
Object.assign(Uc.prototype, {isAliasOf:function(a) {
  if (!(this instanceof Uc && a instanceof Uc)) {
    return !1;
  }
  var b = this.g.u.i, c = this.g.o;
  a.g = a.g;
  var d = a.g.u.i;
  for (a = a.g.o; b.C;) {
    c = b.ma(c), b = b.C;
  }
  for (; d.C;) {
    a = d.ma(a), d = d.C;
  }
  return b === d && c === a;
}, clone:function() {
  this.g.o || Tc(this);
  if (this.g.ha) {
    return this.g.count.value += 1, this;
  }
  var a = Kc, b = Object, c = b.create, d = Object.getPrototypeOf(this), e = this.g;
  a = a(c.call(b, d, {g:{value:{count:e.count, ea:e.ea, ha:e.ha, o:e.o, u:e.u, F:e.F, J:e.J,},}}));
  a.g.count.value += 1;
  a.g.ea = !1;
  return a;
}, ["delete"]() {
  this.g.o || Tc(this);
  if (this.g.ea && !this.g.ha) {
    throw new P("Object already scheduled for deletion");
  }
  Ec(this);
  var a = this.g;
  --a.count.value;
  0 === a.count.value && (a.F ? a.J.O(a.F) : a.u.i.O(a.o));
  this.g.ha || (this.g.F = void 0, this.g.o = void 0);
}, isDeleted:function() {
  return !this.g.o;
}, deleteLater:function() {
  this.g.o || Tc(this);
  if (this.g.ea && !this.g.ha) {
    throw new P("Object already scheduled for deletion");
  }
  uc.push(this);
  1 === uc.length && wc && wc(vc);
  this.g.ea = !0;
  return this;
},});
Object.assign(dd.prototype, {Rb(a) {
  this.qb && (a = this.qb(a));
  return a;
}, ab(a) {
  this.O?.(a);
}, argPackAdvance:8, readValueFromPointer:Oc, fromWireType:function(a) {
  function b() {
    return this.sa ? Lc(this.i.M, {u:this.hc, o:c, J:this, F:a,}) : Lc(this.i.M, {u:this, o:a,});
  }
  var c = this.Rb(a);
  if (!c) {
    return this.ab(a), null;
  }
  var d = Ic(this.i, c);
  if (void 0 !== d) {
    if (0 === d.g.count.value) {
      return d.g.o = c, d.g.F = a, d.clone();
    }
    d = d.clone();
    this.ab(a);
    return d;
  }
  d = this.i.Qb(c);
  d = Hc[d];
  if (!d) {
    return b.call(this);
  }
  d = this.ra ? d.Hb : d.pointerType;
  var e = Gc(c, this.i, d.i);
  return null === e ? b.call(this) : this.sa ? Lc(d.i.M, {u:d, o:e, J:this, F:a,}) : Lc(d.i.M, {u:d, o:e,});
},});
nd = m.UnboundTypeError = rc("UnboundTypeError");
var Yd = {__syscall_fcntl64:function(a, b, c) {
  eb = c;
  try {
    var d = Tb(a);
    switch(b) {
      case 0:
        var e = db();
        if (0 > e) {
          break;
        }
        for (; Gb[e];) {
          e++;
        }
        return Vb(d, e).W;
      case 1:
      case 2:
        return 0;
      case 3:
        return d.flags;
      case 4:
        return e = db(), d.flags |= e, 0;
      case 12:
        return e = db(), Ca[e + 0 >> 1] = 2, 0;
      case 13:
      case 14:
        return 0;
    }
    return -28;
  } catch (f) {
    if ("undefined" == typeof lc || "ErrnoError" !== f.name) {
      throw f;
    }
    return -f.$;
  }
}, __syscall_ioctl:function(a, b, c) {
  eb = c;
  try {
    var d = Tb(a);
    switch(b) {
      case 21509:
        return d.s ? 0 : -59;
      case 21505:
        if (!d.s) {
          return -59;
        }
        if (d.s.V.Xb) {
          a = [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
          var e = db();
          D[e >> 2] = 25856;
          D[e + 4 >> 2] = 5;
          D[e + 8 >> 2] = 191;
          D[e + 12 >> 2] = 35387;
          for (var f = 0; 32 > f; f++) {
            z[e + f + 17] = a[f] || 0;
          }
        }
        return 0;
      case 21510:
      case 21511:
      case 21512:
        return d.s ? 0 : -59;
      case 21506:
      case 21507:
      case 21508:
        if (!d.s) {
          return -59;
        }
        if (d.s.V.Yb) {
          for (e = db(), a = [], f = 0; 32 > f; f++) {
            a.push(z[e + f + 17]);
          }
        }
        return 0;
      case 21519:
        if (!d.s) {
          return -59;
        }
        e = db();
        return D[e >> 2] = 0;
      case 21520:
        return d.s ? -28 : -59;
      case 21531:
        e = db();
        if (!d.m.Wb) {
          throw new N(59);
        }
        return d.m.Wb(d, b, e);
      case 21523:
        if (!d.s) {
          return -59;
        }
        d.s.V.Zb && (f = [24, 80], e = db(), Ca[e >> 1] = f[0], Ca[e + 2 >> 1] = f[1]);
        return 0;
      case 21524:
        return d.s ? 0 : -59;
      case 21515:
        return d.s ? 0 : -59;
      default:
        return -28;
    }
  } catch (g) {
    if ("undefined" == typeof lc || "ErrnoError" !== g.name) {
      throw g;
    }
    return -g.$;
  }
}, __syscall_openat:function(a, b, c, d) {
  eb = d;
  try {
    b = b ? nb(A, b) : "";
    var e = b;
    if ("/" === e.charAt(0)) {
      b = e;
    } else {
      var f = -100 === a ? "/" : Tb(a).path;
      if (0 == e.length) {
        throw new N(44);
      }
      b = gb(f + "/" + e);
    }
    var g = d ? db() : 0;
    return fc(b, c, g).W;
  } catch (k) {
    if ("undefined" == typeof lc || "ErrnoError" !== k.name) {
      throw k;
    }
    return -k.$;
  }
}, _abort_js:() => {
  Qa("");
}, _embind_create_inheriting_constructor:(a, b, c) => {
  a = Q(a);
  b = Dc(b, "wrapper");
  c = pc(c);
  var d = b.i, e = d.M, f = d.C.M, g = d.C.constructor;
  a = mc(a, function(...k) {
    d.C.pb.forEach(function(p) {
      if (this[p] === f[p]) {
        throw new sc(`Pure virtual function ${p} must be implemented in JavaScript`);
      }
    }.bind(this));
    Object.defineProperty(this, "__parent", {value:e});
    this.__construct(...k);
  });
  e.__construct = function(...k) {
    if (this === e) {
      throw new P("Pass correct 'this' to __construct");
    }
    k = g.implement(this, ...k);
    Ec(k);
    var p = k.g;
    k.notifyOnDestruction();
    p.ha = !0;
    Object.defineProperties(this, {g:{value:p}});
    Kc(this);
    k = p.o;
    k = yc(d, k);
    if (xc.hasOwnProperty(k)) {
      throw new P(`Tried to register registered instance: ${k}`);
    }
    xc[k] = this;
  };
  e.__destruct = function() {
    if (this === e) {
      throw new P("Pass correct 'this' to __destruct");
    }
    Ec(this);
    var k = this.g.o;
    k = yc(d, k);
    if (xc.hasOwnProperty(k)) {
      delete xc[k];
    } else {
      throw new P(`Tried to unregister unregistered instance: ${k}`);
    }
  };
  a.prototype = Object.create(e);
  Object.assign(a.prototype, c);
  return qc(a);
}, _embind_finalize_value_object:a => {
  var b = Mc[a];
  delete Mc[a];
  var c = b.Na, d = b.O, e = b.eb, f = e.map(g => g.Ub).concat(e.map(g => g.kc));
  U([a], f, g => {
    var k = {};
    e.forEach((p, n) => {
      var t = g[n], x = p.Sb, y = p.Tb, l = g[n + e.length], u = p.jc, q = p.lc;
      k[p.Ob] = {read:C => t.fromWireType(x(y, C)), write:(C, E) => {
        var w = [];
        u(q, C, l.toWireType(w, E));
        Nc(w);
      }};
    });
    return [{name:b.name, fromWireType:p => {
      var n = {}, t;
      for (t in k) {
        n[t] = k[t].read(p);
      }
      d(p);
      return n;
    }, toWireType:(p, n) => {
      for (var t in k) {
        if (!(t in n)) {
          throw new TypeError(`Missing field: "${t}"`);
        }
      }
      var x = c();
      for (t in k) {
        k[t].write(x, n[t]);
      }
      null !== p && p.push(d, x);
      return x;
    }, argPackAdvance:8, readValueFromPointer:Oc, L:d,}];
  });
}, _embind_register_bigint:() => {
}, _embind_register_bool:(a, b, c, d) => {
  b = Q(b);
  Rc(a, {name:b, fromWireType:function(e) {
    return !!e;
  }, toWireType:function(e, f) {
    return f ? c : d;
  }, argPackAdvance:8, readValueFromPointer:function(e) {
    return this.fromWireType(A[e]);
  }, L:null,});
}, _embind_register_class:(a, b, c, d, e, f, g, k, p, n, t, x, y) => {
  t = Q(t);
  f = V(e, f);
  k &&= V(g, k);
  n &&= V(p, n);
  y = V(x, y);
  var l = Xc(t);
  Wc(l, function() {
    od(`Cannot construct ${t} due to unbound types`, [d]);
  });
  U([a, b, c], d ? [d] : [], u => {
    u = u[0];
    if (d) {
      var q = u.i;
      var C = q.M;
    } else {
      C = Uc.prototype;
    }
    u = mc(t, function(...R) {
      if (Object.getPrototypeOf(this) !== E) {
        throw new P("Use 'new' to construct " + t);
      }
      if (void 0 === w.Z) {
        throw new P(t + " has no accessible constructor");
      }
      var W = w.Z[R.length];
      if (void 0 === W) {
        throw new P(`Tried to invoke ctor of ${t} with invalid number of parameters (${R.length}) - expected (${Object.keys(w.Z).toString()}) parameters instead!`);
      }
      return W.apply(this, R);
    });
    var E = Object.create(C, {constructor:{value:u},});
    u.prototype = E;
    var w = new Yc(t, u, E, y, q, f, k, n);
    if (w.C) {
      var L;
      (L = w.C).na ?? (L.na = []);
      w.C.na.push(w);
    }
    q = new dd(t, w, !0, !1, !1);
    L = new dd(t + "*", w, !1, !1, !1);
    C = new dd(t + " const*", w, !1, !0, !1);
    Hc[a] = {pointerType:L, Hb:C};
    ed(l, u);
    return [q, L, C];
  });
}, _embind_register_class_class_function:(a, b, c, d, e, f, g) => {
  var k = rd(c, d);
  b = Q(b);
  b = sd(b);
  f = V(e, f);
  U([], [a], p => {
    function n() {
      od(`Cannot call ${t} due to unbound types`, k);
    }
    p = p[0];
    var t = `${p.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    var x = p.i.constructor;
    void 0 === x[b] ? (n.da = c - 1, x[b] = n) : (Vc(x, b, t), x[b].A[c - 1] = n);
    U([], k, y => {
      y = qd(t, [y[0], null].concat(y.slice(1)), null, f, g);
      void 0 === x[b].A ? (y.da = c - 1, x[b] = y) : x[b].A[c - 1] = y;
      if (p.i.na) {
        for (const l of p.i.na) {
          l.constructor.hasOwnProperty(b) || (l.constructor[b] = y);
        }
      }
      return [];
    });
    return [];
  });
}, _embind_register_class_class_property:(a, b, c, d, e, f, g, k) => {
  b = Q(b);
  f = V(e, f);
  U([], [a], p => {
    p = p[0];
    var n = `${p.name}.${b}`, t = {get() {
      od(`Cannot access ${n} due to unbound types`, [c]);
    }, enumerable:!0, configurable:!0};
    t.set = k ? () => {
      od(`Cannot access ${n} due to unbound types`, [c]);
    } : () => {
      throw new P(`${n} is a read-only property`);
    };
    Object.defineProperty(p.i.constructor, b, t);
    U([], [c], x => {
      x = x[0];
      var y = {get() {
        return x.fromWireType(f(d));
      }, enumerable:!0};
      k && (k = V(g, k), y.set = l => {
        var u = [];
        k(d, x.toWireType(u, l));
        Nc(u);
      });
      Object.defineProperty(p.i.constructor, b, y);
      return [];
    });
    return [];
  });
}, _embind_register_class_constructor:(a, b, c, d, e, f) => {
  var g = rd(b, c);
  e = V(d, e);
  U([], [a], k => {
    k = k[0];
    var p = `constructor ${k.name}`;
    void 0 === k.i.Z && (k.i.Z = []);
    if (void 0 !== k.i.Z[b - 1]) {
      throw new P(`Cannot register multiple constructors with identical number of parameters (${b - 1}) for class '${k.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
    }
    k.i.Z[b - 1] = () => {
      od(`Cannot construct ${k.name} due to unbound types`, g);
    };
    U([], g, n => {
      n.splice(1, 0, null);
      k.i.Z[b - 1] = qd(p, n, null, e, f);
      return [];
    });
    return [];
  });
}, _embind_register_class_function:(a, b, c, d, e, f, g, k) => {
  var p = rd(c, d);
  b = Q(b);
  b = sd(b);
  f = V(e, f);
  U([], [a], n => {
    function t() {
      od(`Cannot call ${x} due to unbound types`, p);
    }
    n = n[0];
    var x = `${n.name}.${b}`;
    b.startsWith("@@") && (b = Symbol[b.substring(2)]);
    k && n.i.pb.push(b);
    var y = n.i.M, l = y[b];
    void 0 === l || void 0 === l.A && l.className !== n.name && l.da === c - 2 ? (t.da = c - 2, t.className = n.name, y[b] = t) : (Vc(y, b, x), y[b].A[c - 2] = t);
    U([], p, u => {
      u = qd(x, u, n, f, g);
      void 0 === y[b].A ? (u.da = c - 2, y[b] = u) : y[b].A[c - 2] = u;
      return [];
    });
    return [];
  });
}, _embind_register_class_property:(a, b, c, d, e, f, g, k, p, n) => {
  b = Q(b);
  e = V(d, e);
  U([], [a], t => {
    t = t[0];
    var x = `${t.name}.${b}`, y = {get() {
      od(`Cannot access ${x} due to unbound types`, [c, g]);
    }, enumerable:!0, configurable:!0};
    y.set = p ? () => od(`Cannot access ${x} due to unbound types`, [c, g]) : () => {
      throw new P(x + " is a read-only property");
    };
    Object.defineProperty(t.i.M, b, y);
    U([], p ? [c, g] : [c], l => {
      var u = l[0], q = {get() {
        var E = td(this, t, x + " getter");
        return u.fromWireType(e(f, E));
      }, enumerable:!0};
      if (p) {
        p = V(k, p);
        var C = l[1];
        q.set = function(E) {
          var w = td(this, t, x + " setter"), L = [];
          p(n, w, C.toWireType(L, E));
          Nc(L);
        };
      }
      Object.defineProperty(t.i.M, b, q);
      return [];
    });
    return [];
  });
}, _embind_register_emval:a => Rc(a, vd), _embind_register_enum:(a, b, c, d) => {
  function e() {
  }
  b = Q(b);
  e.values = {};
  Rc(a, {name:b, constructor:e, fromWireType:function(f) {
    return this.constructor.values[f];
  }, toWireType:(f, g) => g.value, argPackAdvance:8, readValueFromPointer:wd(b, c, d), L:null,});
  Wc(b, e);
}, _embind_register_enum_value:(a, b, c) => {
  var d = Dc(a, "enum");
  b = Q(b);
  a = d.constructor;
  d = Object.create(d.constructor.prototype, {value:{value:c}, constructor:{value:mc(`${d.name}_${b}`, function() {
  })},});
  a.values[c] = d;
  a[b] = d;
}, _embind_register_float:(a, b, c) => {
  b = Q(b);
  Rc(a, {name:b, fromWireType:d => d, toWireType:(d, e) => e, argPackAdvance:8, readValueFromPointer:xd(b, c), L:null,});
}, _embind_register_function:(a, b, c, d, e, f) => {
  var g = rd(b, c);
  a = Q(a);
  a = sd(a);
  e = V(d, e);
  Wc(a, function() {
    od(`Cannot call ${a} due to unbound types`, g);
  }, b - 1);
  U([], g, k => {
    ed(a, qd(a, [k[0], null].concat(k.slice(1)), null, e, f), b - 1);
    return [];
  });
}, _embind_register_integer:(a, b, c, d, e) => {
  b = Q(b);
  -1 === e && (e = 4294967295);
  e = k => k;
  if (0 === d) {
    var f = 32 - 8 * c;
    e = k => k << f >>> f;
  }
  var g = b.includes("unsigned") ? function(k, p) {
    return p >>> 0;
  } : function(k, p) {
    return p;
  };
  Rc(a, {name:b, fromWireType:e, toWireType:g, argPackAdvance:8, readValueFromPointer:yd(b, c, 0 !== d), L:null,});
}, _embind_register_memory_view:(a, b, c) => {
  function d(f) {
    return new e(z.buffer, M[f + 4 >> 2], M[f >> 2]);
  }
  var e = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,][b];
  c = Q(c);
  Rc(a, {name:c, fromWireType:d, argPackAdvance:8, readValueFromPointer:d,}, {Vb:!0,});
}, _embind_register_std_string:(a, b) => {
  b = Q(b);
  var c = "std::string" === b;
  Rc(a, {name:b, fromWireType:function(d) {
    var e = M[d >> 2], f = d + 4;
    if (c) {
      for (var g = f, k = 0; k <= e; ++k) {
        var p = f + k;
        if (k == e || 0 == A[p]) {
          g = g ? nb(A, g, p - g) : "";
          if (void 0 === n) {
            var n = g;
          } else {
            n += String.fromCharCode(0), n += g;
          }
          g = p + 1;
        }
      }
    } else {
      n = Array(e);
      for (k = 0; k < e; ++k) {
        n[k] = String.fromCharCode(A[f + k]);
      }
      n = n.join("");
    }
    Bc(d);
    return n;
  }, toWireType:function(d, e) {
    e instanceof ArrayBuffer && (e = new Uint8Array(e));
    var f = "string" == typeof e;
    if (!(f || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Int8Array)) {
      throw new P("Cannot pass non-string to std::string");
    }
    var g = c && f ? pb(e) : e.length;
    var k = Xd(4 + g + 1), p = k + 4;
    M[k >> 2] = g;
    if (c && f) {
      qb(e, A, p, g + 1);
    } else {
      if (f) {
        for (f = 0; f < g; ++f) {
          var n = e.charCodeAt(f);
          if (255 < n) {
            throw Bc(p), new P("String has UTF-16 code units that do not fit in 8 bits");
          }
          A[p + f] = n;
        }
      } else {
        for (f = 0; f < g; ++f) {
          A[p + f] = e[f];
        }
      }
    }
    null !== d && d.push(Bc, k);
    return k;
  }, argPackAdvance:8, readValueFromPointer:Oc, L(d) {
    Bc(d);
  },});
}, _embind_register_std_wstring:(a, b, c) => {
  c = Q(c);
  if (2 === b) {
    var d = Ad;
    var e = Bd;
    var f = Cd;
    var g = k => Fa[k >> 1];
  } else {
    4 === b && (d = Dd, e = Ed, f = Fd, g = k => M[k >> 2]);
  }
  Rc(a, {name:c, fromWireType:k => {
    for (var p = M[k >> 2], n, t = k + 4, x = 0; x <= p; ++x) {
      var y = k + 4 + x * b;
      if (x == p || 0 == g(y)) {
        t = d(t, y - t), void 0 === n ? n = t : (n += String.fromCharCode(0), n += t), t = y + b;
      }
    }
    Bc(k);
    return n;
  }, toWireType:(k, p) => {
    if ("string" != typeof p) {
      throw new P(`Cannot pass non-string to C++ string type ${c}`);
    }
    var n = f(p), t = Xd(4 + n + b);
    M[t >> 2] = n / b;
    e(p, t + 4, n + b);
    null !== k && k.push(Bc, t);
    return t;
  }, argPackAdvance:8, readValueFromPointer:Oc, L(k) {
    Bc(k);
  }});
}, _embind_register_value_object:(a, b, c, d, e, f) => {
  Mc[a] = {name:Q(b), Na:V(c, d), O:V(e, f), eb:[],};
}, _embind_register_value_object_field:(a, b, c, d, e, f, g, k, p, n) => {
  Mc[a].eb.push({Ob:Q(b), Ub:c, Sb:V(d, e), Tb:f, kc:g, jc:V(k, p), lc:n,});
}, _embind_register_void:(a, b) => {
  b = Q(b);
  Rc(a, {Ic:!0, name:b, argPackAdvance:0, fromWireType:() => {
  }, toWireType:() => {
  },});
}, _emscripten_get_now_is_monotonic:() => 1, _emscripten_memcpy_js:(a, b, c) => A.copyWithin(a, b, b + c), _emval_as:(a, b, c) => {
  a = pc(a);
  b = Dc(b, "emval::as");
  return Gd(b, c, a);
}, _emval_call_method:(a, b, c, d, e) => {
  a = Jd[a];
  b = pc(b);
  c = Id(c);
  return a(b, b[c], d, e);
}, _emval_decref:ud, _emval_get_method_caller:(a, b, c) => {
  var d = Ld(a, b), e = d.shift();
  a--;
  var f = Array(a);
  b = `methodCaller<(${d.map(g => g.name).join(", ")}) => ${e.name}>`;
  return Kd(mc(b, (g, k, p, n) => {
    for (var t = 0, x = 0; x < a; ++x) {
      f[x] = d[x].readValueFromPointer(n + t), t += d[x].argPackAdvance;
    }
    g = 1 === c ? Md(k, f) : k.apply(g, f);
    return Gd(e, p, g);
  }));
}, _emval_get_module_property:a => {
  a = Id(a);
  return qc(m[a]);
}, _emval_get_property:(a, b) => {
  a = pc(a);
  b = pc(b);
  return qc(a[b]);
}, _emval_incref:a => {
  9 < a && (oc[a + 1] += 1);
}, _emval_new_array:() => qc([]), _emval_new_cstring:a => qc(Id(a)), _emval_new_object:() => qc({}), _emval_run_destructors:a => {
  var b = pc(a);
  Nc(b);
  ud(a);
}, _emval_set_property:(a, b, c) => {
  a = pc(a);
  b = pc(b);
  c = pc(c);
  a[b] = c;
}, _emval_take_value:(a, b) => {
  a = Dc(a, "_emval_take_value");
  a = a.readValueFromPointer(b);
  return qc(a);
}, emscripten_asm_const_int:(a, b, c) => {
  Nd.length = 0;
  for (var d; d = A[b++];) {
    var e = 105 != d;
    e &= 112 != d;
    c += e && c % 8 ? 4 : 0;
    Nd.push(112 == d ? M[c >> 2] : 105 == d ? D[c >> 2] : Ha[c >> 3]);
    c += e ? 8 : 4;
  }
  return bb[a](...Nd);
}, emscripten_date_now:() => Date.now(), emscripten_get_now:() => performance.now(), emscripten_resize_heap:a => {
  var b = A.length;
  a >>>= 0;
  if (2147483648 < a) {
    return !1;
  }
  for (var c = 1; 4 >= c; c *= 2) {
    var d = b * (1 + 0.2 / c);
    d = Math.min(d, a + 100663296);
    var e = Math;
    d = Math.max(a, d);
    a: {
      e = (e.min.call(e, 2147483648, d + (65536 - d % 65536) % 65536) - Aa.buffer.byteLength + 65535) / 65536;
      try {
        Aa.grow(e);
        Ia();
        var f = 1;
        break a;
      } catch (g) {
      }
      f = void 0;
    }
    if (f) {
      return !0;
    }
  }
  return !1;
}, environ_get:(a, b) => {
  var c = 0;
  Qd().forEach((d, e) => {
    var f = b + c;
    e = M[a + 4 * e >> 2] = f;
    for (f = 0; f < d.length; ++f) {
      z[e++] = d.charCodeAt(f);
    }
    z[e] = 0;
    c += d.length + 1;
  });
  return 0;
}, environ_sizes_get:(a, b) => {
  var c = Qd();
  M[a >> 2] = c.length;
  var d = 0;
  c.forEach(e => d += e.length + 1);
  M[b >> 2] = d;
  return 0;
}, fd_close:function(a) {
  try {
    var b = Tb(a);
    if (null === b.W) {
      throw new N(8);
    }
    b.Ka && (b.Ka = null);
    try {
      b.m.close && b.m.close(b);
    } catch (c) {
      throw c;
    } finally {
      Gb[b.W] = null;
    }
    b.W = null;
    return 0;
  } catch (c) {
    if ("undefined" == typeof lc || "ErrnoError" !== c.name) {
      throw c;
    }
    return c.$;
  }
}, fd_read:function(a, b, c, d) {
  try {
    a: {
      var e = Tb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var k = M[a >> 2], p = M[a + 4 >> 2];
        a += 8;
        var n = e, t = f, x = z;
        if (0 > p || 0 > t) {
          throw new N(28);
        }
        if (null === n.W) {
          throw new N(8);
        }
        if (1 === (n.flags & 2097155)) {
          throw new N(8);
        }
        if (16384 === (n.node.mode & 61440)) {
          throw new N(31);
        }
        if (!n.m.read) {
          throw new N(28);
        }
        var y = "undefined" != typeof t;
        if (!y) {
          t = n.position;
        } else if (!n.seekable) {
          throw new N(70);
        }
        var l = n.m.read(n, x, k, p, t);
        y || (n.position += l);
        var u = l;
        if (0 > u) {
          var q = -1;
          break a;
        }
        b += u;
        if (u < p) {
          break;
        }
        "undefined" != typeof f && (f += u);
      }
      q = b;
    }
    M[d >> 2] = q;
    return 0;
  } catch (C) {
    if ("undefined" == typeof lc || "ErrnoError" !== C.name) {
      throw C;
    }
    return C.$;
  }
}, fd_seek:function(a, b, c, d, e) {
  b = c + 2097152 >>> 0 < 4194305 - !!b ? (b >>> 0) + 4294967296 * c : NaN;
  try {
    if (isNaN(b)) {
      return 61;
    }
    var f = Tb(a);
    hc(f, b, d);
    Ya = [f.position >>> 0, (Xa = f.position, 1.0 <= +Math.abs(Xa) ? 0.0 < Xa ? +Math.floor(Xa / 4294967296.0) >>> 0 : ~~+Math.ceil((Xa - +(~~Xa >>> 0)) / 4294967296.0) >>> 0 : 0)];
    D[e >> 2] = Ya[0];
    D[e + 4 >> 2] = Ya[1];
    f.Ka && 0 === b && 0 === d && (f.Ka = null);
    return 0;
  } catch (g) {
    if ("undefined" == typeof lc || "ErrnoError" !== g.name) {
      throw g;
    }
    return g.$;
  }
}, fd_write:function(a, b, c, d) {
  try {
    a: {
      var e = Tb(a);
      a = b;
      for (var f, g = b = 0; g < c; g++) {
        var k = M[a >> 2], p = M[a + 4 >> 2];
        a += 8;
        var n = e, t = k, x = p, y = f, l = z;
        if (0 > x || 0 > y) {
          throw new N(28);
        }
        if (null === n.W) {
          throw new N(8);
        }
        if (0 === (n.flags & 2097155)) {
          throw new N(8);
        }
        if (16384 === (n.node.mode & 61440)) {
          throw new N(31);
        }
        if (!n.m.write) {
          throw new N(28);
        }
        n.seekable && n.flags & 1024 && hc(n, 0, 2);
        var u = "undefined" != typeof y;
        if (!u) {
          y = n.position;
        } else if (!n.seekable) {
          throw new N(70);
        }
        var q = n.m.write(n, l, t, x, y, void 0);
        u || (n.position += q);
        var C = q;
        if (0 > C) {
          var E = -1;
          break a;
        }
        b += C;
        "undefined" != typeof f && (f += C);
      }
      E = b;
    }
    M[d >> 2] = E;
    return 0;
  } catch (w) {
    if ("undefined" == typeof lc || "ErrnoError" !== w.name) {
      throw w;
    }
    return w.$;
  }
}, strftime_l:(a, b, c, d) => Ud(a, b, c, d)}, X = function() {
  function a(c) {
    X = c.exports;
    Aa = X.memory;
    Ia();
    gd = X.__indirect_function_table;
    Ka.unshift(X.__wasm_call_ctors);
    Na--;
    m.monitorRunDependencies?.(Na);
    0 == Na && (null !== Oa && (clearInterval(Oa), Oa = null), Pa && (c = Pa, Pa = null, c()));
    return X;
  }
  var b = {env:Yd, wasi_snapshot_preview1:Yd,};
  Na++;
  m.monitorRunDependencies?.(Na);
  if (m.instantiateWasm) {
    try {
      return m.instantiateWasm(b, a);
    } catch (c) {
      ya(`Module.instantiateWasm callback failed with error: ${c}`), ca(c);
    }
  }
  Sa ||= Ra("canvas_advanced.wasm") ? "canvas_advanced.wasm" : m.locateFile ? m.locateFile("canvas_advanced.wasm", sa) : sa + "canvas_advanced.wasm";
  Wa(b, function(c) {
    a(c.instance);
  }).catch(ca);
  return {};
}(), Bc = a => (Bc = X.free)(a), Xd = a => (Xd = X.malloc)(a), Ac = a => (Ac = X.__getTypeName)(a), Za = m._ma_device__on_notification_unlocked = a => (Za = m._ma_device__on_notification_unlocked = X.ma_device__on_notification_unlocked)(a);
m._ma_malloc_emscripten = (a, b) => (m._ma_malloc_emscripten = X.ma_malloc_emscripten)(a, b);
m._ma_free_emscripten = (a, b) => (m._ma_free_emscripten = X.ma_free_emscripten)(a, b);
var $a = m._ma_device_process_pcm_frames_capture__webaudio = (a, b, c) => ($a = m._ma_device_process_pcm_frames_capture__webaudio = X.ma_device_process_pcm_frames_capture__webaudio)(a, b, c), ab = m._ma_device_process_pcm_frames_playback__webaudio = (a, b, c) => (ab = m._ma_device_process_pcm_frames_playback__webaudio = X.ma_device_process_pcm_frames_playback__webaudio)(a, b, c);
m.dynCall_iiji = (a, b, c, d, e) => (m.dynCall_iiji = X.dynCall_iiji)(a, b, c, d, e);
m.dynCall_jiji = (a, b, c, d, e) => (m.dynCall_jiji = X.dynCall_jiji)(a, b, c, d, e);
m.dynCall_iiiji = (a, b, c, d, e, f) => (m.dynCall_iiiji = X.dynCall_iiiji)(a, b, c, d, e, f);
m.dynCall_iij = (a, b, c, d) => (m.dynCall_iij = X.dynCall_iij)(a, b, c, d);
m.dynCall_jii = (a, b, c) => (m.dynCall_jii = X.dynCall_jii)(a, b, c);
m.dynCall_viijii = (a, b, c, d, e, f, g) => (m.dynCall_viijii = X.dynCall_viijii)(a, b, c, d, e, f, g);
m.dynCall_iiiiij = (a, b, c, d, e, f, g) => (m.dynCall_iiiiij = X.dynCall_iiiiij)(a, b, c, d, e, f, g);
m.dynCall_iiiiijj = (a, b, c, d, e, f, g, k, p) => (m.dynCall_iiiiijj = X.dynCall_iiiiijj)(a, b, c, d, e, f, g, k, p);
m.dynCall_iiiiiijj = (a, b, c, d, e, f, g, k, p, n) => (m.dynCall_iiiiiijj = X.dynCall_iiiiiijj)(a, b, c, d, e, f, g, k, p, n);
var Zd;
Pa = function $d() {
  Zd || ae();
  Zd || (Pa = $d);
};
function ae() {
  function a() {
    if (!Zd && (Zd = !0, m.calledRun = !0, !Ba)) {
      m.noFSInit || ic || (ic = !0, m.stdin = m.stdin, m.stdout = m.stdout, m.stderr = m.stderr, m.stdin ? jc("stdin", m.stdin) : ec("/dev/tty", "/dev/stdin"), m.stdout ? jc("stdout", null, m.stdout) : ec("/dev/tty", "/dev/stdout"), m.stderr ? jc("stderr", null, m.stderr) : ec("/dev/tty1", "/dev/stderr"), fc("/dev/stdin", 0), fc("/dev/stdout", 1), fc("/dev/stderr", 1));
      Jb = !1;
      cb(Ka);
      ba(m);
      if (m.onRuntimeInitialized) {
        m.onRuntimeInitialized();
      }
      if (m.postRun) {
        for ("function" == typeof m.postRun && (m.postRun = [m.postRun]); m.postRun.length;) {
          var b = m.postRun.shift();
          La.unshift(b);
        }
      }
      cb(La);
    }
  }
  if (!(0 < Na)) {
    if (m.preRun) {
      for ("function" == typeof m.preRun && (m.preRun = [m.preRun]); m.preRun.length;) {
        Ma();
      }
    }
    cb(Ja);
    0 < Na || (m.setStatus ? (m.setStatus("Running..."), setTimeout(function() {
      setTimeout(function() {
        m.setStatus("");
      }, 1);
      a();
    }, 1)) : a());
  }
}
if (m.preInit) {
  for ("function" == typeof m.preInit && (m.preInit = [m.preInit]); 0 < m.preInit.length;) {
    m.preInit.pop()();
  }
}
ae();
moduleRtn = da;



  return moduleRtn;
}
);
})();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Rive);


/***/ }),

/***/ "./src/rive-block/block.json":
/*!***********************************!*\
  !*** ./src/rive-block/block.json ***!
  \***********************************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"create-block/rive-block","version":"0.1.0","title":"Rive Block","category":"widgets","icon":"format-video","description":"Import and use your Rive assets to add animated graphics, epic hero sections, and interactive product demos to your website.","example":{},"attributes":{"height":{"type":"string","default":"auto"},"width":{"type":"string","default":"100%"},"riveFileUrl":{"type":"string"},"riveFileId":{"type":"number"},"enableAutoplay":{"type":"boolean","default":false},"respectReducedMotion":{"type":"boolean","default":true},"ariaLabel":{"type":"string","default":""},"ariaDescription":{"type":"string","default":""}},"supports":{"html":false,"position":{"sticky":true},"color":{"background":true,"text":false}},"textdomain":"rive-block","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","render":"file:./render.php","viewScript":"file:./view.js"}');

/***/ }),

/***/ "./src/rive-block/components/RiveCanvas.js":
/*!*************************************************!*\
  !*** ./src/rive-block/components/RiveCanvas.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ RiveCanvas)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_RiveRuntime__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/RiveRuntime */ "./src/rive-block/utils/RiveRuntime.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);
/**
 * RiveCanvas Component
 *
 * Wrapper component that handles Rive animation loading and display in the block editor.
 * Uses @rive-app/canvas-advanced for full control over Rive runtime.
 * Isolated component ensures proper cleanup when riveFileUrl changes.
 */






function RiveCanvas({
  riveFileUrl,
  width,
  height,
  enableAutoplay,
  respectReducedMotion,
  ariaLabel,
  ariaDescription
}) {
  const canvasRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const riveInstanceRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const riveFileRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const artboardRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const rendererRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const animationFrameIdRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const [loadError, setLoadError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);

  // Initialize Rive animation when canvas is ready
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!canvasRef.current || !riveFileUrl) return;
    let mounted = true;
    setIsLoading(true);
    setLoadError(null);
    (async () => {
      try {
        // Get Rive runtime instance
        const rive = await _utils_RiveRuntime__WEBPACK_IMPORTED_MODULE_3__.riveRuntime.awaitInstance();
        if (!mounted) return;

        // Fetch Rive file
        const response = await fetch(riveFileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch Rive file: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const fileBytes = new Uint8Array(arrayBuffer);

        // Load Rive file
        const file = await rive.load(fileBytes);
        riveFileRef.current = file;
        if (!mounted) return;

        // Get default artboard
        const artboard = file.defaultArtboard();
        artboardRef.current = artboard;

        // Create renderer
        const renderer = rive.makeRenderer(canvasRef.current, true);
        rendererRef.current = renderer;

        // Check user's motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Determine if autoplay should be enabled
        const shouldAutoplay = enableAutoplay && !(respectReducedMotion && prefersReducedMotion);

        // Try to create animation or state machine instance
        let animationInstance = null;
        if (artboard.animationCount() > 0) {
          const animation = artboard.animationByIndex(0);
          animationInstance = new rive.LinearAnimationInstance(animation, artboard);
        }
        riveInstanceRef.current = {
          rive,
          file,
          artboard,
          renderer,
          animation: animationInstance,
          shouldAutoplay
        };

        // Start render loop if autoplay is enabled
        if (shouldAutoplay && animationInstance) {
          startRenderLoop(rive);
        } else {
          // Just render one frame
          renderFrame(rive);
        }
        setIsLoading(false);
        setLoadError(null);
      } catch (error) {
        console.error('[Rive Block] Error loading Rive animation:', error);
        if (mounted) {
          setLoadError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Unable to load Rive animation. Please check the file and try again.', 'rive-block'));
          setIsLoading(false);
        }
      }
    })();

    // Cleanup function
    return () => {
      mounted = false;
      cleanup();
    };
  }, [riveFileUrl, enableAutoplay, respectReducedMotion]);

  /**
   * Start the render loop for animation
   */
  const startRenderLoop = rive => {
    let lastTime = 0;
    const draw = time => {
      if (!riveInstanceRef.current) return;
      const {
        artboard,
        renderer,
        animation
      } = riveInstanceRef.current;
      const elapsed = lastTime ? (time - lastTime) / 1000 : 0;
      lastTime = time;

      // Clear canvas
      renderer.clear();
      renderer.save();

      // Advance animation
      if (animation) {
        animation.advance(elapsed);
        animation.apply(1.0); // Full mix
      }

      // Advance artboard
      artboard.advance(elapsed);

      // Align to canvas
      renderer.align(rive.Fit.contain, rive.Alignment.center, {
        minX: 0,
        minY: 0,
        maxX: canvasRef.current.width,
        maxY: canvasRef.current.height
      }, artboard.bounds);

      // Draw artboard
      artboard.draw(renderer);
      renderer.restore();

      // Request next frame
      animationFrameIdRef.current = rive.requestAnimationFrame(draw);
    };
    animationFrameIdRef.current = rive.requestAnimationFrame(draw);
  };

  /**
   * Render a single frame (for static display)
   */
  const renderFrame = rive => {
    if (!riveInstanceRef.current) return;
    const {
      artboard,
      renderer
    } = riveInstanceRef.current;
    renderer.clear();
    renderer.save();

    // Align to canvas
    renderer.align(rive.Fit.contain, rive.Alignment.center, {
      minX: 0,
      minY: 0,
      maxX: canvasRef.current.width,
      maxY: canvasRef.current.height
    }, artboard.bounds);

    // Draw artboard
    artboard.draw(renderer);
    renderer.restore();
  };

  /**
   * Cleanup Rive resources
   */
  const cleanup = () => {
    // Cancel animation frame
    if (animationFrameIdRef.current && riveInstanceRef.current) {
      const {
        rive
      } = riveInstanceRef.current;
      rive.cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }

    // Delete Rive instances
    if (riveInstanceRef.current) {
      const {
        animation,
        renderer,
        artboard
      } = riveInstanceRef.current;
      if (animation) {
        animation.delete();
      }
      if (renderer) {
        renderer.delete();
      }
      if (artboard) {
        artboard.delete();
      }
    }

    // Unref file
    if (riveFileRef.current) {
      riveFileRef.current.unref();
      riveFileRef.current = null;
    }
    riveInstanceRef.current = null;
    artboardRef.current = null;
    rendererRef.current = null;
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
    style: {
      position: 'relative',
      width,
      height
    },
    children: [isLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Spinner, {})
    }), loadError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Notice, {
      status: "error",
      isDismissible: false,
      children: loadError
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("canvas", {
      ref: canvasRef,
      style: {
        width,
        height
      },
      role: ariaLabel ? 'img' : undefined,
      "aria-label": ariaLabel || undefined,
      "aria-description": ariaDescription || undefined
    })]
  });
}

/***/ }),

/***/ "./src/rive-block/edit.js":
/*!********************************!*\
  !*** ./src/rive-block/edit.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _editor_scss__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./editor.scss */ "./src/rive-block/editor.scss");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./block.json */ "./src/rive-block/block.json");
/* harmony import */ var _icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./icon */ "./src/rive-block/icon.js");
/* harmony import */ var _components_RiveCanvas__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/RiveCanvas */ "./src/rive-block/components/RiveCanvas.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);
/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 * @see https://www.w3.org/International/i18n-drafts/nav/about
 */


/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */



/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */


/**
 * Internal dependencies
 */




/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */

function Edit({
  attributes,
  setAttributes
}) {
  const {
    riveFileUrl,
    riveFileId,
    width = _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.width.default,
    height = _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.height.default,
    enableAutoplay = _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.enableAutoplay.default,
    respectReducedMotion = _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.respectReducedMotion.default,
    ariaLabel = _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.ariaLabel.default,
    ariaDescription = _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.ariaDescription.default
  } = attributes;

  // Handle Rive file selection from Media Library or Upload
  const onSelectRiveFile = media => {
    if (!media || !media.url) {
      setAttributes({
        riveFileUrl: undefined,
        riveFileId: undefined
      });
      return;
    }
    setAttributes({
      riveFileUrl: media.url,
      riveFileId: media.id
    });
  };

  // Show placeholder if no Rive file is selected
  if (!riveFileUrl) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)(),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaPlaceholder, {
        icon: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.BlockIcon, {
          icon: _icon__WEBPACK_IMPORTED_MODULE_5__["default"]
        }),
        onSelect: onSelectRiveFile,
        accept: ".riv",
        allowedTypes: ['application/octet-stream'],
        labels: {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Choose Rive Asset', 'rive-block'),
          instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Upload a Rive file or choose from your Media Library.', 'rive-block')
        }
      })
    });
  }

  // Show canvas with Rive animation when file is selected
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.InspectorControls, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToolsPanel, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Settings", "rive-block"),
        resetAll: () => {
          setAttributes({
            width: undefined,
            height: undefined
          });
        },
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToolsPanelItem, {
          hasValue: () => width !== undefined && width !== _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.width.default,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Width", "rive-block"),
          onDeselect: () => setAttributes({
            width: undefined
          }),
          isShownByDefault: true,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalUnitControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Width", "rive-block"),
            value: width,
            onChange: value => setAttributes({
              width: value || undefined
            }),
            units: [{
              value: 'px',
              label: 'px'
            }, {
              value: '%',
              label: '%'
            }, {
              value: 'em',
              label: 'em'
            }, {
              value: 'rem',
              label: 'rem'
            }, {
              value: 'vh',
              label: 'vh'
            }, {
              value: 'dvw',
              label: 'dvw'
            } // ← Din custom unit!
            ]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalToolsPanelItem, {
          hasValue: () => height !== undefined && height !== _block_json__WEBPACK_IMPORTED_MODULE_4__.attributes.height.default,
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Height", "rive-block"),
          onDeselect: () => setAttributes({
            height: undefined
          }),
          isShownByDefault: true,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.__experimentalUnitControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)("Height", "rive-block"),
            value: height,
            onChange: value => setAttributes({
              height: value || undefined
            }),
            units: [{
              value: 'px',
              label: 'px'
            }, {
              value: '%',
              label: '%'
            }, {
              value: 'em',
              label: 'em'
            }, {
              value: 'rem',
              label: 'rem'
            }, {
              value: 'vh',
              label: 'vh'
            }, {
              value: 'dvh',
              label: 'dvh'
            }]
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Rive File', 'rive-block'),
        initialOpen: false,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("strong", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Current file:', 'rive-block')
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          style: {
            wordBreak: 'break-all',
            fontSize: '12px',
            color: '#757575'
          },
          children: riveFileUrl
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUploadCheck, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.MediaUpload, {
            onSelect: onSelectRiveFile,
            allowedTypes: ['application/octet-stream'],
            value: riveFileId,
            render: ({
              open
            }) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
              onClick: open,
              variant: "secondary",
              __next40pxDefaultSize: true,
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Replace Rive File', 'rive-block')
            })
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility', 'rive-block'),
        initialOpen: false,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("strong", {
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Animation from Interactions', 'rive-block'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("br", {}), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('(Level AAA)', 'rive-block')]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Enable Autoplay', 'rive-block'),
          help: enableAutoplay ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Animation will start automatically. Consider accessibility: users with vestibular disorders may prefer animations that don\'t autoplay.', 'rive-block') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Animation will require user interaction to play. This is the recommended setting for WCAG AAA compliance.', 'rive-block'),
          checked: enableAutoplay,
          onChange: value => setAttributes({
            enableAutoplay: value
          })
        }), enableAutoplay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
          className: "rive-block-notice",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Notice, {
            status: "warning",
            isDismissible: false,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Autoplay may violate WCAG AAA 2.3.3 (Animation from Interactions). Consider if this animation is essential to the user experience.', 'rive-block')
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("strong", {
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Pause, Stop, Hide', 'rive-block'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("br", {}), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('(Level A)', 'rive-block')]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToggleControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Respect Reduced Motion Preference', 'rive-block'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Disable animation for users who have set "prefers-reduced-motion" in their system settings. Highly recommended for accessibility.', 'rive-block'),
          checked: respectReducedMotion,
          onChange: value => setAttributes({
            respectReducedMotion: value
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("p", {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("strong", {
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Non-text Content', 'rive-block'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("br", {}), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('(Level A)', 'rive-block')]
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('ARIA Label', 'rive-block'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessible name for screen readers. Describe what this animation represents (e.g., "Company logo animation").', 'rive-block'),
          value: ariaLabel,
          onChange: value => setAttributes({
            ariaLabel: value
          }),
          placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('e.g., Hero animation', 'rive-block')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.TextareaControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('ARIA Description', 'rive-block'),
          help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Detailed description of the animation for screen readers. Explain what happens in the animation.', 'rive-block'),
          value: ariaDescription,
          onChange: value => setAttributes({
            ariaDescription: value
          }),
          placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('e.g., An animated illustration showing...', 'rive-block'),
          rows: 3
        })]
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_1__.useBlockProps)(),
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_components_RiveCanvas__WEBPACK_IMPORTED_MODULE_6__["default"], {
        riveFileUrl: riveFileUrl,
        width: width,
        height: height,
        enableAutoplay: enableAutoplay,
        respectReducedMotion: respectReducedMotion,
        ariaLabel: ariaLabel,
        ariaDescription: ariaDescription
      })
    })]
  });
}

/***/ }),

/***/ "./src/rive-block/editor.scss":
/*!************************************!*\
  !*** ./src/rive-block/editor.scss ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/rive-block/icon.js":
/*!********************************!*\
  !*** ./src/rive-block/icon.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);

/**
 * Rive block icon
 *
 * Single source of truth for the Rive block icon.
 * Import this wherever the icon is needed.
 */

const riveIcon = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 150 150",
  children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("path", {
    fillRule: "evenodd",
    d: "M19.18,23.33a7.46,7.46,0,0,0,7.5,7.42H88.84c20.52-1.39,33.1,24.78,17.5,38.65q-6.87,5.88-17.5,5.87h-27a7.43,7.43,0,1,0,0,14.85c.94,0,30.07,0,29.83,0l26.87,42.66a7.92,7.92,0,0,0,7,3.87c6.85.23,10-6.88,6.25-12.37l-23.9-38c37.3-17.51,21.54-71.94-19.07-70.34H26.68A7.47,7.47,0,0,0,19.18,23.33Z",
    transform: "translate(0 -0.2)"
  })
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (riveIcon);

/***/ }),

/***/ "./src/rive-block/index.js":
/*!*********************************!*\
  !*** ./src/rive-block/index.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./style.scss */ "./src/rive-block/style.scss");
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./edit */ "./src/rive-block/edit.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./src/rive-block/block.json");
/* harmony import */ var _icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./icon */ "./src/rive-block/icon.js");
/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */


/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */


/**
 * Internal dependencies
 */




/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  /**
   * @see ./edit.js
   */
  icon: _icon__WEBPACK_IMPORTED_MODULE_4__["default"],
  edit: _edit__WEBPACK_IMPORTED_MODULE_2__["default"]
});

/***/ }),

/***/ "./src/rive-block/style.scss":
/*!***********************************!*\
  !*** ./src/rive-block/style.scss ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/rive-block/utils/RiveRuntime.js":
/*!*********************************************!*\
  !*** ./src/rive-block/utils/RiveRuntime.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   riveRuntime: () => (/* binding */ riveRuntime)
/* harmony export */ });
/* harmony import */ var _rive_app_canvas_advanced__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @rive-app/canvas-advanced */ "./node_modules/@rive-app/canvas-advanced/canvas_advanced.mjs");
/**
 * RiveRuntime - Singleton manager for Rive WASM runtime
 *
 * Ensures only one instance of the Rive runtime is loaded across the entire application.
 * Provides queue-based loading to handle multiple simultaneous requests.
 */


class RiveRuntimeManager {
  constructor() {
    this.runtime = null;
    this.isLoading = false;
    this.callbacks = [];
    // Use unpkg CDN for WASM file - works both in development and production
    this.wasmURL = 'https://unpkg.com/@rive-app/canvas-advanced@2.32.1/rive.wasm';
  }

  /**
   * Load the Rive runtime (singleton pattern)
   * @private
   */
  async loadRuntime() {
    try {
      this.runtime = await (0,_rive_app_canvas_advanced__WEBPACK_IMPORTED_MODULE_0__["default"])({
        locateFile: () => this.wasmURL
      });

      // Execute all queued callbacks
      while (this.callbacks.length > 0) {
        const callback = this.callbacks.shift();
        if (callback) {
          callback(this.runtime);
        }
      }
    } catch (error) {
      console.error('[Rive Block] Failed to load Rive runtime:', error);
      // Reject all queued callbacks
      while (this.callbacks.length > 0) {
        this.callbacks.shift();
      }
      throw error;
    }
  }

  /**
   * Get runtime instance via callback
   * @param {Function} callback - Callback that receives the runtime instance
   */
  getInstance(callback) {
    // If runtime already loaded, call immediately
    if (this.runtime) {
      callback(this.runtime);
      return;
    }

    // Add to queue
    this.callbacks.push(callback);

    // Start loading if not already loading
    if (!this.isLoading) {
      this.isLoading = true;
      this.loadRuntime();
    }
  }

  /**
   * Get runtime instance via Promise
   * @returns {Promise} Promise that resolves with the runtime instance
   */
  awaitInstance() {
    return new Promise((resolve, reject) => {
      if (this.runtime) {
        resolve(this.runtime);
        return;
      }
      this.getInstance(runtime => {
        if (runtime) {
          resolve(runtime);
        } else {
          reject(new Error('Failed to load Rive runtime'));
        }
      });
    });
  }

  /**
   * Manually set the WASM URL (useful for custom CDN or local hosting)
   * @param {string} url - URL to the rive.wasm file
   */
  setWasmUrl(url) {
    if (this.runtime) {
      console.warn('[Rive Block] Runtime already loaded. WASM URL change will not take effect.');
      return;
    }
    this.wasmURL = url;
  }
}

// Export singleton instance
const riveRuntime = new RiveRuntimeManager();

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "react/jsx-runtime":
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["ReactJSXRuntime"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"rive-block/index": 0,
/******/ 			"rive-block/style-index": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = globalThis["webpackChunkrive_block"] = globalThis["webpackChunkrive_block"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["rive-block/style-index"], () => (__webpack_require__("./src/rive-block/index.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map