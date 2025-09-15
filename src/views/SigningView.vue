<template>
  <div style="margin: 0 auto;">
    <h2>{{ t('signing.title') }}</h2>

    <el-form :label-width="t('common.label_width')" style="margin-bottom: 40px">
      <el-form-item :label="t('signing.select_chain')">
        <el-select v-model="selectedChain">
          <el-option label="Bitcoin" value="btc" />
        </el-select>
      </el-form-item>

      <SignerBtc
          v-if="selectedChain === 'btc'"
          ref="btcSignerRef"
          @signed="handleSigned"
      />

      <el-form-item>
        <el-button type="primary" @click="generateSignedTx">{{ t('signing.sign') }}</el-button>
      </el-form-item>
      <div ref="resultRef"></div>
      <el-form-item :label="t('signing.result')" v-if="signedTx" style="margin-top: 40px">
        <el-input type="textarea" :rows="5" v-model="signedTx" readonly />
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <el-button size="small" @click="copySignedTxToClipboard">{{ t('common.copy') }}</el-button>
          <span style="color: #409EFF; margin-left: 6px; min-width: 64px; display: inline-block;font-size: 13px">
            {{ resultCopyTip ? t('common.copy_success') : '\u00A0' }}
          </span>
        </div>
      </el-form-item>

      <el-form-item v-if="showJsonResult">
        <div style="width: 100%;">
          <div>
            <el-input
                type="textarea"
                :rows="10"
                v-model="jsonResult"
                readonly
                style="margin-bottom: 8px"
            />
          </div>
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px;">
            <el-button size="small" type="primary" @click="downloadJsonFile">{{ t('signing.download_json') }}</el-button>
            <el-button size="small" @click="copyJsonToClipboard">{{ t('common.copy') }}</el-button>
            <span style="color: #409EFF; margin-left: 6px; min-width: 64px; display: inline-block;font-size: 13px">
              {{ jsonCopyTip ? t('common.copy_success') : '\u00A0' }}
            </span>
          </div>
          <div style="margin-bottom: 12px;">
            <img :src="qrCodeUrl" v-if="qrCodeUrl" style="width: 220px; height: 220px; border: 1px solid #eee; background: #fff;"/>
          </div>
          <div v-if="qrCodeUrl">
            <el-button size="small" type="success" @click="downloadQRCode">{{ t('signing.download_qr') }}</el-button>
          </div>
        </div>
      </el-form-item>

    </el-form>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { ElMessage } from "element-plus"
import QRCode from 'qrcode'
import SignerBtc from '../components/SignerBtc.vue'
import { t } from '../locales'

const selectedChain = ref('btc')
const btcSignerRef = ref(null)

const signedTx = ref('')
const showJsonResult = ref(false)
const jsonResult = ref('')
const resultCopyTip = ref(false)
const jsonCopyTip = ref(false)
const qrCodeUrl = ref('')
const resultRef = ref(null)

function btcToSatoshi(btc) {
  const s = btc.toString().trim()
  if (!s.includes('.')) return parseInt(s, 10) * 1e8
  const [intPartRaw, fracRaw] = s.split('.')
  const intPart = intPartRaw === '' ? 0 : parseInt(intPartRaw, 10)
  const frac = (fracRaw + '00000000').slice(0, 8)
  return intPart * 1e8 + parseInt(frac, 10)
}

function satoshiToBtcString(sat) {
  let s = String(sat).padStart(9, '0')
  let btc = s.length > 8 ? s.slice(0, -8) + '.' + s.slice(-8) : '0.' + s.slice(-8)
  btc = btc.replace(/\.?0+$/, '')
  return btc
}

async function generateSignedTx() {
  try {
    if (selectedChain.value === 'btc' && btcSignerRef.value) {
      await btcSignerRef.value.signTransaction()
    }
  } catch (error) {
    ElMessage.error(t('signing.sign_fail') + ':' + error.message)
  }
}

async function handleSigned(result) {
  signedTx.value = result.signedTx
  jsonResult.value = JSON.stringify(result, null, 2)
  showJsonResult.value = true

  try {
    const url = await QRCode.toDataURL(jsonResult.value, {
      errorCorrectionLevel: 'M',
      color: {
        dark: "#378bdd",
      }
    })
    qrCodeUrl.value = url
  } catch (error) {
  }
  await nextTick()

  if (resultRef.value) {
    resultRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

function copySignedTxToClipboard() {
  navigator.clipboard.writeText(signedTx.value)
  resultCopyTip.value = true
  setTimeout(() => { resultCopyTip.value = false }, 2000)
}

function copyJsonToClipboard() {
  navigator.clipboard.writeText(jsonResult.value)
  jsonCopyTip.value = true
  setTimeout(() => { jsonCopyTip.value = false }, 2000)
}

function downloadJsonFile() {
  try {
    const data = JSON.parse(jsonResult.value)
    const chain = data.chain || selectedChain.value

    let filename = `${chain}_transaction.json`

    if (selectedChain.value === 'btc' && data.vin) {
      let sumSat = 0
      for (const input of data.vin) {
        const amtStr = String(input.amount).replace(/ BTC$/i, '').trim()
        sumSat += btcToSatoshi(amtStr)
      }
      const total = satoshiToBtcString(sumSat)
      filename = `${chain}_${total}.json`
    }

    const blob = new Blob([jsonResult.value], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (e) {
    ElMessage.error(t('signing.download_json_msg'))
  }
}

function downloadQRCode() {
  try {
    const data = JSON.parse(jsonResult.value)
    const chain = data.chain || selectedChain.value

    let filename = `${chain}_transaction.png`

    if (selectedChain.value === 'btc' && data.vin) {
      let sumSat = 0
      for (const input of data.vin) {
        const amtStr = String(input.amount).replace(/ BTC$/i, '').trim()
        sumSat += btcToSatoshi(amtStr)
      }
      const total = satoshiToBtcString(sumSat)
      filename = `${chain}_${total}.png`
    }

    const a = document.createElement('a')
    a.href = qrCodeUrl.value
    a.download = filename
    a.click()
  } catch (e) {
    ElMessage.error(t('signing.download_qr_fail'))
  }
}

</script>

<style scoped>
</style>
