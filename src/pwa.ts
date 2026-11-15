type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>}
let installer:InstallEvent|null=null
export let registration:ServiceWorkerRegistration|undefined
export let offlineReady=false
export let pwaError=''
const notify=()=>window.dispatchEvent(new Event('lifeos-pwa'))
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installer=event as InstallEvent;notify()})
window.addEventListener('appinstalled',()=>{installer=null;notify()})
export const canInstall=()=>!!installer
export async function installApp(){if(!installer)return;const prompt=installer;await prompt.prompt();await prompt.userChoice;installer=null;notify()}
export function startOffline(){if(!('serviceWorker' in navigator))return
 if(import.meta.env.DEV){void navigator.serviceWorker.getRegistrations().then(async registrations=>{for(const reg of registrations)if(reg.active?.scriptURL===location.origin+'/sw.js')await reg.unregister()}).catch(()=>{});return}
 navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{registration=reg;offlineReady=!!reg.active;notify();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='activated')offlineReady=true;notify()})});navigator.serviceWorker.ready.then(()=>{offlineReady=true;notify()})}).catch(()=>{pwaError='Offline setup failed. Keep the server running and reload to retry.';notify()})
}
