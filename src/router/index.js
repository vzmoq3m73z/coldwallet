import { createRouter, createWebHashHistory } from 'vue-router'
import MnemonicView from '../views/MnemonicView.vue'
import DerivationView from '../views/DerivationView.vue'
import SigningView from '../views/SigningView.vue'

const routes = [
    { path: '/', redirect: '/mnemonic' },
    { path: '/mnemonic', component: MnemonicView },
    { path: '/derivation', component: DerivationView },
    { path: '/signing', component: SigningView },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router