
<template>
  <div style="margin: 0 auto;">
    <h2> {{ t('derivation.title') }} </h2>

    <el-form :label-width="t('common.label_width')">
      <el-form-item :label="t('derivation.mnemonic')">
        <el-input type="textarea" v-model="mnemonic" :rows="3" :placeholder="t('derivation.enter_mnemonic')" />
      </el-form-item>

      <el-form-item :label="t('derivation.passphrase')">
        <el-input v-model="passphrase" :placeholder="t('derivation.optional')" />
      </el-form-item>

      <el-form-item :label="t('derivation.select_chain')">
        <el-select v-model="selectedChain" :placeholder="t('derivation.select_chain')" >
          <el-option label="Bitcoin" value="btc" />
          <el-option label="Ethereum" value="eth" />
          <el-option label="Tron" value="tron" />
          <el-option label="Solana" value="sol" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('derivation.address_format')">
        <el-select v-model="addressFormat" :disabled="selectedChain !== 'btc'">
          <el-option
              v-for="item in addressFormats"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('derivation.type')" v-if="selectedChain === 'btc'">
        <el-select v-model="addressType">
          <el-option :label="t('derivation.external_address')" value="external" />
          <el-option :label="t('derivation.change_address')"  value="change" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('derivation.account')" v-if="selectedChain !== 'sol'">
        <el-input-number v-model="account" :min="0" />
      </el-form-item>

      <el-row :gutter="20" style="width: 100%;">
        <el-col :span="12">
          <el-form-item :label="startIndexLabel">
            <el-input-number v-model="startIndex" :min="0" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item :label="t('derivation.count')">
            <el-input-number v-model="count" :min="1" :max="1000" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="t('derivation.derive_path')">
        <div style="font-family: monospace;">{{ derivedPathPreview }}/i</div>
      </el-form-item>

      <el-form-item :label="t('derivation.hide_private_key')">
        <el-checkbox v-model="hidePrivateKey">
        </el-checkbox>
      </el-form-item>
    </el-form>

    <div style="display: flex; justify-content: right; align-items: center; margin-bottom: 20px;">
      <el-button type="primary" @click="deriveAddresses">{{ t('derivation.derive') }}</el-button>
    </div>


    <div v-if="derivedAddresses.length" style="margin-bottom: 50px">

      <div
          v-for="item in derivedAddresses"
          :key="item.path"
          style="margin-bottom: 10px; padding: 10px; border: 1px solid #ccc; border-radius: 4px;font-size: 14px"
      >
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div>{{ t('derivation.path') }}: ({{ item.label }}) {{ item.path }}</div>
            <div>{{ t('derivation.address') }}: {{ item.address }}</div>
            <div v-if="item.wif">{{ t('derivation.private_key') }}: <span style="word-break: break-all;">{{ item.wif }}</span>
            </div>
          </div>
          <div style="margin-left: 10px;">
            <el-button type="primary" text @click="copySingleAddress(item)">{{ t('common.copy') }}</el-button>
          </div>
        </div>
      </div>

      <div style="text-align: left; margin-top: 20px;">
        <el-button type="primary" text @click="copyAllAddresses">{{ t('common.copy_all') }}</el-button>
        <span style="color: #409EFF; margin-left: 10px; min-width: 64px; display: inline-block;font-size: 13px">
            {{ resultCopyTip ? t('common.copy_success') : '\u00A0' }}
          </span>
      </div>

    </div>


  </div>
</template>

<script setup>
import { watch } from 'vue'
import { ref, computed } from 'vue'
import * as bip39 from 'bip39'
import { ethers } from 'ethers'
import { TronWeb } from 'tronweb'
import * as solanaWeb3 from '@solana/web3.js'
import { derivePath as ed25519DerivePath } from 'ed25519-hd-key'
import bs58 from 'bs58'
import { t } from '../locales'

import * as bitcoin from 'bitcoinjs-lib'
import { BIP32Factory } from 'bip32'
import * as ecc from 'tiny-secp256k1'
import {ElMessage} from "element-plus";
import * as ECPairFactory from "ecpair";
bitcoin.initEccLib(ecc)
const bip32 = BIP32Factory(ecc)
const ECPair = ECPairFactory.ECPairFactory(ecc)


const mnemonic = ref('')
const passphrase = ref('')
const selectedChain = ref('btc')
const account = ref(0)
const addressType = ref('external')
const startIndex = ref(0)
const count = ref(5)
const derivedAddresses = ref([])
const addressFormats = [
  { label: 'BIP44（Legacy）', value: 'BIP44' },
  { label: 'BIP49（Nested SegWit）', value: 'BIP49' },
  { label: 'BIP84（Native SegWit）', value: 'BIP84' },
  { label: 'BIP86（Taproot）', value: 'BIP86' }
]
const addressFormat = ref('BIP86')
const resultCopyTip = ref(false)
const hidePrivateKey = ref(false)



const wordlistMap = {
  english: bip39.wordlists.english,
  chinese_simplified: bip39.wordlists.chinese_simplified,
  chinese_traditional: bip39.wordlists.chinese_traditional,
  japanese: bip39.wordlists.japanese,
  korean: bip39.wordlists.korean,
  french: bip39.wordlists.french,
  italian: bip39.wordlists.italian,
  spanish: bip39.wordlists.spanish,
  czech: bip39.wordlists.czech,
  portuguese: bip39.wordlists.portuguese
}


watch(selectedChain, (newVal) => {
  if (newVal !== 'btc') {
    addressType.value = 'external'
  }
})
watch(selectedChain, (newVal) => {
  if (newVal !== 'btc') {
    addressType.value = 'external'
    addressFormat.value = 'BIP44'
  }
  else{
    addressFormat.value = 'BIP86'
  }
})


const startIndexLabel = computed(() =>
    selectedChain.value === 'sol' ? t('derivation.start_account') : t('derivation.start_index')
)

const derivedPathPreview = computed(() => {
  const purposeMap = {
    BIP44: "44'",
    BIP49: "49'",
    BIP84: "84'",
    BIP86: "86'"
  }

  const purpose = selectedChain.value === 'btc'
      ? `m/${purposeMap[addressFormat.value]}`
      : "m/44'"

  const coinType = {
    btc: "0'",
    eth: "60'",
    tron: "195'",
    sol: "501'"
  }[selectedChain.value]

  const change = selectedChain.value === 'btc'
      ? (addressType.value === 'change' ? '1' : '0')
      : '0'

  return `${purpose}/${coinType}/${account.value}'/${change}`
})



function validateMnemonic(mnemonicText) {
  const words = mnemonicText.trim().split(/\s+/)
  if (words.length < 12) return { isValid: false, language: null, wordlist: null }

  for (const [lang, wordlist] of Object.entries(wordlistMap)) {
    if (bip39.validateMnemonic(mnemonicText, wordlist)) {
      return { isValid: true, language: lang, wordlist }
    }
  }

  return { isValid: false, language: null, wordlist: null }
}


async function deriveAddresses() {

  derivedAddresses.value = []

  mnemonic.value = mnemonic.value.trim().replace(/\s+/g, ' ');

  if(!mnemonic.value) {
    ElMessage.warning(t('derivation.mnemonic_required'))
    return
  }

  const validation = validateMnemonic(mnemonic.value)
  if (!validation.isValid) {
    ElMessage.warning(t('derivation.invalid_mnemonic'))
    return
  }

  if(count.value > 1000){
    ElMessage.warning(t('derivation.exceeds_limit'))
    return
  }

  const seed = await bip39.mnemonicToSeed(mnemonic.value, passphrase.value, validation.wordlist)
  const start = startIndex.value
  const end = start + count.value
  const coinType = selectedChain.value


  if (coinType === 'btc') {
    const network = bitcoin.networks.bitcoin

    const purposeMap = {
      BIP44: "44'",
      BIP49: "49'",
      BIP84: "84'",
      BIP86: "86'"
    }

    const purpose = purposeMap[addressFormat.value]
    const root = bip32.fromSeed(seed, network)
    const accountPath = `m/${purpose}/0'/${account.value}'`
    const accountNode = root.derivePath(accountPath)
    const change = addressType.value === 'change' ? 1 : 0

    for (let i = start; i < end; i++) {
      const child = accountNode.derive(change).derive(i)
      let address = ''
      let wif = child.toWIF()

      if (addressFormat.value === 'BIP44') {
        const p2pkh = bitcoin.payments.p2pkh({ pubkey: Buffer.from(child.publicKey), network })
        address = p2pkh.address
      } else if (addressFormat.value === 'BIP49') {
        const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(child.publicKey), network })
        const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network })
        address = p2sh.address
      } else if (addressFormat.value === 'BIP84') {
        const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: Buffer.from(child.publicKey), network })
        address = p2wpkh.address
      } else if (addressFormat.value === 'BIP86') {
        const xOnlyPubkey =  Buffer.from(child.publicKey.slice(1, 33))
        const payment = bitcoin.payments.p2tr({
          internalPubkey: xOnlyPubkey,
          network
        })
        address = payment.address
        wif = ECPair.fromPrivateKey(child.privateKey, {
          network,
          compressed: true
        }).toWIF()
      }

      const addressData = {
        path: `${accountPath}/${change}/${i}`,
        label: 'BTC',
        address
      }

      if (!hidePrivateKey.value) {
        addressData.wif = wif
      }

      derivedAddresses.value.push(addressData)
    }
  }


  else if (coinType === 'eth') {
    const root = bip32.fromSeed(seed)

    for (let i = start; i < end; i++) {
      const path = `${derivedPathPreview.value}/${i}`
      const child = root.derivePath(path)
      const wallet = new ethers.Wallet(Buffer.from(child.privateKey).toString('hex'))

      const addressData = {
        path,
        label: 'ETH',
        address: wallet.address
      }

      if (!hidePrivateKey.value) {
        addressData.wif = wallet.privateKey
      }

      derivedAddresses.value.push(addressData)
    }
  }

  else if (coinType === 'tron') {
    const root = bip32.fromSeed(seed)
    for (let i = start; i < end; i++) {
      const path = `${derivedPathPreview.value}/${i}`
      const child = root.derivePath(path)

      const priv = child.privateKey;
      const privHex = Buffer.from(priv).toString('hex');
      const address = TronWeb.address.fromPrivateKey(privHex);

      const addressData = {
        path,
        label: 'TRX',
        address
      }

      if (!hidePrivateKey.value) {
        addressData.wif = privHex
      }

      derivedAddresses.value.push(addressData)
    }
  }

  else if (coinType === 'sol') {
    const startAccount = startIndex.value
    const endAccount = startAccount + count.value

    for (let i = startAccount; i < endAccount; i++) {
      const path = `m/44'/501'/${i}'/0'`

      const { key } = ed25519DerivePath(path, seed.toString('hex'))
      const keypair = solanaWeb3.Keypair.fromSeed(key)
      const address = keypair.publicKey.toBase58()
      const base58SecretKey = bs58.encode(keypair.secretKey)

      const addressData = {
        path,
        label: 'SOL',
        address
      }

      if (!hidePrivateKey.value) {
        addressData.wif = base58SecretKey
      }

      derivedAddresses.value.push(addressData)
    }
  }
}


function copyAllAddresses() {
  if (derivedAddresses.value.length === 0) return

  const text = derivedAddresses.value.map(item => {
    let result = `${t('derivation.path')}: (${item.label}) ${item.path}
${t('derivation.address')}: ${item.address}`

    if (item.wif) {
      result += `
${t('derivation.private_key')}: ${item.wif}`
    }

    return result
  }).join('\n\n')

  navigator.clipboard.writeText(text).then(() => {
    resultCopyTip.value = true
    setTimeout(() => { resultCopyTip.value = false }, 2000)
  }).catch(() => {
    ElMessage.error(t('common.copy_fail'))
  })
}

function copySingleAddress(item) {
  let text = `${t('derivation.path')}: (${item.label}) ${item.path}
${t('derivation.address')}: ${item.address}`

  if (item.wif) {
    text += `
${t('derivation.private_key')}: ${item.wif}`
  }

  navigator.clipboard.writeText(text)
    .then(() => ElMessage.success(`${item.label} ${t('common.copy_success')}`))
    .catch(() => ElMessage.error(t('common.copy_fail')))
}




</script>

<style scoped>
</style>