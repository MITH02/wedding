import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const html = await readFile('dist/index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (value.startsWith('#')) assert(ids.includes(value.slice(1)), `Missing anchor ${value}`);
  else if (!/^https?:/.test(value)) await access(`dist/${value.replace(/^\//, '')}`);
}
const css = await readFile('dist/assets/fonts.css', 'utf8');
for (const [, file] of css.matchAll(/url\(\.\/([^)]*)\)/g)) await access(`dist/assets/${file}`);
const calendar = await readFile('dist/assets/wedding-celebrations.ics', 'utf8');
const eventTimes = [...calendar.matchAll(/DTSTART:(\d{8}T\d{6}Z)/g)].map(match => match[1]);
assert.deepEqual(eventTimes, ['20261209T073000Z','20261209T140000Z','20261210T043000Z','20261210T070000Z','20261210T073000Z']);
assert.equal((calendar.match(/BEGIN:VEVENT/g) || []).length, 5);
const pageTimes = [...html.matchAll(/<time[^>]*datetime="([^"]+)"/g)].map(match => new Date(match[1]).toISOString().replace(/[-:]/g, '').replace('.000', ''));
assert.deepEqual(pageTimes, eventTimes, 'Website and calendar event times must agree');
const fields = new Map();
function field(id) {
  if (!fields.has(id)) fields.set(id, { textContent: '', value: '', hidden: true, classList: {add(){},remove(){}}, addEventListener(name,fn){this[name]=fn;}, focus(){}, select(){} });
  return fields.get(id);
}
const nav = {clipboard: {writeText: async text => { nav.copied = text; }}};
const context = {document:{getElementById:field}, window:{location:{href:'https://example.vercel.app/#celebrations'}}, navigator:nav, setInterval(){},setTimeout(){},clearTimeout(){},Date};
const script = await readFile('app.js', 'utf8');
runInNewContext(script, context);
runInNewContext("updateCountdown(Date.parse('2026-12-09T12:30:00+05:30'))", context);
assert.deepEqual(['days','hours','minutes','seconds'].map(id=>field(id).textContent),['01','00','00','00']);
runInNewContext("updateCountdown(Date.parse('2026-12-11T12:30:00+05:30'))", context);
assert.equal(field('days').textContent, '00');
assert(field('countdown-message').textContent.startsWith('Celebrating'));
await field('share-button').click();
assert.equal(nav.copied, 'https://example.vercel.app/');
nav.clipboard = null;
await field('share-button').click();
assert.equal(field('share-fallback').hidden, false);
assert.equal(field('share-url').value, 'https://example.vercel.app/');
nav.share = async () => { const error = new Error('Cancelled'); error.name = 'AbortError'; throw error; };
field('share-fallback').hidden = true;
await field('share-button').click();
assert.equal(field('share-fallback').hidden, true, 'Cancel native share without opening fallback');
const themeScript = await readFile('theme.js', 'utf8');
function themeHarness({ saved = null, systemDark = false, blockedStorage = false } = {}) {
  const root = { dataset: {} };
  const events = {};
  const attributes = {};
  let toggleClick;
  let writtenTheme;
  let ready = false;
  const button = {setAttribute(key, value){ attributes[key] = value; }, addEventListener(name, fn){ toggleClick = fn; }};
  const label = {};
  const preference = {matches:systemDark, addEventListener(name, fn){ events.system = fn; }};
  const document = {documentElement:root, querySelector(){return {setAttribute(){}};}, getElementById(id){return ready ? (id === 'theme-toggle' ? button : label) : null;}, addEventListener(name, fn){ events.ready = fn; }};
  const window = {matchMedia(){return preference;}, addEventListener(name,fn){events[name] = fn;}, localStorage:{getItem(){if(blockedStorage) throw new Error('Blocked'); return saved;}, setItem(key,value){if(blockedStorage) throw new Error('Blocked'); writtenTheme = value;}}};
  runInNewContext(themeScript, {document,window});
  ready = true;
  events.ready();
  return {root, events, attributes, label, click(){toggleClick();}, get saved(){return writtenTheme;}};
}
const automatic = themeHarness({systemDark:true});
assert.equal(automatic.root.dataset.theme, 'dark');
assert.equal(automatic.attributes['aria-label'], 'Switch to light mode');
automatic.events.system({matches:false});
assert.equal(automatic.root.dataset.theme, 'light');
automatic.click();
assert.equal(automatic.saved, 'dark');
assert.equal(automatic.attributes['aria-pressed'], 'true');
automatic.events.system({matches:false});
assert.equal(automatic.root.dataset.theme, 'dark', 'Explicit preference overrides system changes');
const remembered = themeHarness({saved:'light',systemDark:true});
assert.equal(remembered.root.dataset.theme,'light');
remembered.events.storage({key:'wedding-theme',newValue:'dark'});
assert.equal(remembered.root.dataset.theme,'dark');
const unavailable = themeHarness({blockedStorage:true});
unavailable.click();
assert.equal(unavailable.root.dataset.theme,'dark', 'Toggle works without local storage');
assert.equal(themeHarness({saved:'invalid',systemDark:true}).root.dataset.theme,'dark');
const musicScript = await readFile('music.js', 'utf8');
function musicHarness(blocked = false) {
  const events = {};
  const audioEvents = {};
  const attributes = {};
  const label = {};
  let click;
  const audio = { paused:true, blocked, calls:0,
    async play(){this.calls++; if(this.blocked) throw new Error('Autoplay blocked'); this.paused=false; audioEvents.play?.();},
    pause(){this.paused=true; audioEvents.pause?.();},
    addEventListener(name,fn){audioEvents[name]=fn;}
  };
  const button = {dataset:{}, setAttribute(key,value){attributes[key]=value;}, addEventListener(name,fn){click=fn;}};
  const document = {getElementById(id){return id==='wedding-music' ? audio : id==='music-toggle' ? button : label;}, addEventListener(name,fn){events[name]=fn;}};
  runInNewContext(musicScript,{document});
  return {audio,button,label,attributes,events,audioEvents,click(){click();}};
}
const settleMusic = () => new Promise(resolve => setTimeout(resolve,0));
const music = musicHarness();
await settleMusic();
assert.equal(music.audio.paused,false,'Music defaults to playing when allowed');
assert.equal(music.audio.volume,0.35);
assert.equal(music.label.textContent,'Mute music');
music.click();
assert.equal(music.audio.paused,true);
music.events.pointerdown({});
await settleMusic();
assert.equal(music.audio.paused,true,'Other taps must respect an explicit mute');
music.click();
await settleMusic();
assert.equal(music.audio.paused,false,'Guest can resume music');
const blockedMusic = musicHarness(true);
await settleMusic();
assert.equal(blockedMusic.label.textContent,'Play music','Do not claim playback when blocked');
blockedMusic.audio.blocked=false;
blockedMusic.events.pointerdown({});
await settleMusic();
assert.equal(blockedMusic.audio.paused,false,'First interaction retries blocked autoplay');
blockedMusic.audioEvents.error();
assert.equal(blockedMusic.button.disabled,true);
assert.equal(blockedMusic.label.textContent,'Music unavailable');
console.log('Passed: assets, calendar, countdown, sharing, themes, music autoplay, blocked-autoplay recovery, mute/resume and audio-error handling.');
