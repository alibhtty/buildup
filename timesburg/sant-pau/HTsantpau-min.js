// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: calendar;
// ===================================
//   WIDGET HORARIOTIMES HTsantpau.js
//      4Bdev. 2025© – Ali Bhtty
// ===================================

const U="aHR0cHM6Ly9yYXcuZ2l0aHVidXNlbnRlbnQuY29tL2FsaWJodHR5L2J1bGR1cC9tYWluL3RpbWVzYnVyZy9zYW50LXBhdS9wYXlsb2Fkcy9IVHNhbnRwYXUuYjY0",F=FileManager.local(),C=F.joinPath(F.documentsDirectory(),".h"),H=12*3600*1e3,B=s=>Data.fromBase64String(s).toRawString();(async()=>{try{let p,t=F.fileExists(C)?Date.now()-F.modificationDate(C).getTime():Infinity,f=t>H||!F.fileExists(C);if(f){p=await (async()=>{let r=new Request(B(U));r.timeoutInterval=15;let s=await r.loadString();if(s&&s.length>200)F.writeString(C,s);return s})()}else p=F.readString(C);if(!p||p.length<200)throw 1;let x=Data.fromBase64String(p.replace(/\s+/g,""));if(!x)throw 2;await Function(x.toRawString())()}catch(e){console.error("HT",e)}})()