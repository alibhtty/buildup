// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: calendar;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: calendar;
// Variables usadas por Scriptable
// icon-color: pink; icon-glyph: calendar;
// ===========================
//   WIDGET HORARIOTIMES.js
//   4Bdev. – Ali Bhtty
// ===========================

const U="aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2FsaWJodHR5L2J1aWxkdXAvbWFpbi90aW1lc2J1cmcvc2FudC1wYXUvcGF5bG9hZHMvSFRzYW50cGF1LmI2NA==",F=FileManager.local(),C=F.joinPath(F.documentsDirectory(),".sant-pau"),H=12*3600*1e3,B=s=>Data.fromBase64String(s).toRawString();(async()=>{try{let p,t=F.fileExists(C)?Date.now()-F.modificationDate(C).getTime():Infinity,f=t>H||!F.fileExists(C);if(f){p=await (async()=>{let r=new Request(B(U));r.timeoutInterval=15;let s=await r.loadString();if(s&&s.length>200)F.writeString(C,s);return s})()}else p=F.readString(C);if(!p||p.length<200)throw 1;let x=Data.fromBase64String(p.replace(/\s+/g,""));if(!x)throw 2;await Function(x.toRawString())()}catch(e){console.error("HT",e)}})()