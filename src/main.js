import { Buffer } from 'buffer'
if (typeof global === 'undefined') {
    window.global = window
}
window.Buffer = Buffer
globalThis.Buffer = Buffer
global.Buffer = Buffer
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')