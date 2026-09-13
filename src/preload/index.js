import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  platform: process.platform,
  fetchSchedule: (url) => ipcRenderer.invoke('schedule:fetch', url)
})
