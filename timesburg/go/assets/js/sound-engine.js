const Sound = (() => {
  let ctx, buffers = {}, unlocked = false;
  let ready = false; // indica si los buffers ya están listos

  async function load(name, url) {
    ctx ||= new (window.AudioContext || webkitAudioContext)();
    const b = await (await fetch(url)).arrayBuffer();
    buffers[name] = await ctx.decodeAudioData(b);
  }

  async function init() {
    if (ready) return;
    if (!unlocked) {
      unlocked = true;
      ctx ||= new (window.AudioContext || webkitAudioContext)();
    }
    await load("click", "./assets/icons/clic.wav");
    await load("appear", "./assets/icons/in.wav");
    await load("disappear", "./assets/icons/out.wav");
    ready = true;
  }

  async function play(name, vol = 0.15) {
    if (!ready) await init(); // espera a que se carguen los sonidos
    if (!buffers[name]) return;
    if (ctx.state === "suspended") await ctx.resume();
    const g = ctx.createGain();
    g.gain.value = vol;
    const s = ctx.createBufferSource();
    s.buffer = buffers[name];
    s.connect(g).connect(ctx.destination);
    s.start();
  }

  // desbloqueo inicial al primer click (opcional)
  document.addEventListener("pointerdown", init, { once: true });

  return { play, init };
})();



/* const Sound = (() => {
  let ctx, buffers={}, unlocked=false;

  async function load(name,url){
    ctx ||= new (window.AudioContext||webkitAudioContext)();
    const b = await (await fetch(url)).arrayBuffer();
    buffers[name] = await ctx.decodeAudioData(b);
  }

  async function init(){
    if (unlocked) return;
    unlocked=true;
    await load("click","./assets/icons/clic.wav");
    await load("appear","./assets/icons/in.wav");
    await load("disappear","./assets/icons/out.wav");
  }

  function play(name,vol=.15){
    if (!buffers[name]) return;
    if (ctx.state==="suspended") ctx.resume();
    const g = ctx.createGain();
    g.gain.value=vol;
    const s = ctx.createBufferSource();
    s.buffer=buffers[name];
    s.connect(g).connect(ctx.destination);
    s.start();
  }

  document.addEventListener("pointerdown",init,{once:true});

  return { play, init };
})();
 */