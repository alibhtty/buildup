if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let i=Promise.resolve();return r[e]||(i=new Promise((async i=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=i}else importScripts(e),i()}))),i.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},i=(i,r)=>{Promise.all(i.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(i)};self.define=(i,s,a)=>{r[i]||(r[i]=Promise.resolve().then((()=>{let r={};const c={uri:location.origin+i.slice(1)};return Promise.all(s.map((i=>{switch(i){case"exports":return r;case"module":return c;default:return e(i)}}))).then((e=>{const i=a(...e);return r.default||(r.default=i),r}))})))}}define("./service-worker.js",["./workbox-543be79b"],(function(e){"use strict";self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"assets/Framework7Icons-Regular.a42aa071.woff2",revision:"4a39aba9fb8a2f831fa437780e1a058a"},{url:"assets/Framework7Icons-Regular.eba1e821.woff",revision:"d03b787b6492fa2b0141c43fb7e56689"},{url:"assets/index.63d8eeb0.js",revision:"0d3f3616d9413599be594f9abf6db977"},{url:"assets/index.ec7624a1.css",revision:"ed41df78160e2bb77c2bdb5ea45a1245"},{url:"assets/material-icons.007b0812.woff",revision:"e638a36a512bd6e2156d4f6239ac82ac"},{url:"assets/material-icons.0c2c69ba.woff2",revision:"711d2f5ad280152c452254fb15d127af"},{url:"assets/menu-bubble.5439ce4c.svg",revision:"6e645ef0d2f897a070958219661cf224"},{url:"assets/vendor.d35e1705.js",revision:"7129cf789f39b8cca1fb63e28a7b82d7"},{url:"icons/128x128.png",revision:"55cfad33862b9577ad273c931b455c54"},{url:"icons/144x144.png",revision:"fdc126b98f2641dd5f95f169f435ed8a"},{url:"icons/152x152.png",revision:"f8a10da53b10178a88ebd87c3ef1d4c2"},{url:"icons/192x192.png",revision:"64f97f1c8bc282a39132c840076b06ed"},{url:"icons/256x256.png",revision:"21c544235be965f28fd09af1faa3fe0b"},{url:"icons/512x512.png",revision:"3d847af504d03e1d178ba5bfeb17f3f6"},{url:"icons/apple-touch-icon.png",revision:"21c544235be965f28fd09af1faa3fe0b"},{url:"icons/favicon.png",revision:"55cfad33862b9577ad273c931b455c54"},{url:"images/burgers/big-tasty.png",revision:"4f6a563048b18c61e05784902295d758"},{url:"images/burgers/bigmac-bacon.png",revision:"62da6c5ce02a07a3413c477a08abe386"},{url:"images/burgers/bigmac.png",revision:"dc5c827f65b4034fa4b07b00cbc74a90"},{url:"images/burgers/cheeseburger.png",revision:"58bd2e12fa919f5a44f2cc0bd9891dd2"},{url:"images/burgers/chicken-premier.png",revision:"8c1bab23be3eb602c7397216236af258"},{url:"images/burgers/chickenburger.png",revision:"d5bfceb72a49d5a76029051d66596d87"},{url:"images/burgers/double-cheeseburger.png",revision:"a5ae5208b245fdc86d490bf42b36f1fc"},{url:"images/burgers/filet-o-fish.png",revision:"1438f17f1e3cf35b2071e9d7a8c48f34"},{url:"images/desserts/apple-pie.png",revision:"73b083cb50e063b17c2093ae965a8393"},{url:"images/desserts/chocolate-donut.png",revision:"1d9459e7cb9c1793bf64a93ed225cd94"},{url:"images/desserts/cinnamon-bun.png",revision:"13cfd5bb10838a90cba44afebca3ec17"},{url:"images/desserts/raspberry-pie.png",revision:"dc3fc6cc325a956cd8531cc6f3342ab3"},{url:"images/desserts/vanilla-donut.png",revision:"38ae42c89f3ddbd3ebda0113dcbe39e2"},{url:"images/drinks/7up.png",revision:"8d90c2c2467d51e6f41087ea80161c71"},{url:"images/drinks/aqua.png",revision:"baa1819b95ff7a1feff314db9c753313"},{url:"images/drinks/mirinda.png",revision:"b59b40adfb2c2b83c95f25af9d6d529b"},{url:"images/drinks/pepsi.png",revision:"65faf87717a76234bcb45136b8f223c2"},{url:"images/pattern.png",revision:"4ea896fc222f3522c421f68513b75ebd"},{url:"images/pizza/diablo.png",revision:"f8dde19bbb385893f2f03db9a96f9c35"},{url:"images/pizza/margherita.png",revision:"e677b388cfac36cf37c7bbc9b8ccbaf4"},{url:"images/pizza/mix.png",revision:"cba75483d059325762b8a3e8f62dc96a"},{url:"images/pizza/pepperoni.png",revision:"ed7f34a1b20c6086381da06d5fb55604"},{url:"images/slide-1.jpg",revision:"38d3e7cc00d8970f7973ab0bf4c150b0"},{url:"images/slide-2.jpg",revision:"45ec3865a490833207686ae4d74cdb25"},{url:"images/slide-3.jpg",revision:"872b7f68f19840b440a267eb4531c3ca"},{url:"index.html",revision:"f852dc838167d77c26aca45249ff15da"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]})}));
//# sourceMappingURL=service-worker.js.map
