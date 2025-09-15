<template>
  <div>
    <el-form-item :label="t('signing.fee')">
      <el-input-number v-model="btcFeeRate" :min="1" />
      <span style="margin-left: 20px;color: #888888"> (sat/vByte)</span>
    </el-form-item>

    <el-divider style="margin-top: 30px">{{ t('signing.inputs') }}</el-divider>

    <div
        v-for="(input, index) in inputs"
        :key="'input-' + index"
        style="margin-bottom: 10px; border: 1px solid #ccc; padding: 10px; border-radius: 4px; font-size: 13px;"
    >
      <div style="font-weight: bold; margin-bottom: 8px;">{{ t('signing.input') }} #{{ index + 1 }}</div>
      <el-form-item :label="t('signing.address')" size="small">
        <el-input v-model="input.address" size="small" :placeholder="t('signing.address_placeholder')" />
      </el-form-item>
      <el-form-item :label="t('signing.private_key')" size="small">
        <el-input v-model="input.wif" size="small" />
      </el-form-item>
      <el-form-item label="TXID" size="small">
        <el-input v-model="input.txid" size="small" />
      </el-form-item>
      <el-form-item label="VOUT" size="small">
        <el-input-number v-model="input.vout" :min="0" size="small" />
      </el-form-item>
      <el-form-item :label="t('signing.amount') + ' (BTC)'" size="small">
        <el-input v-model="input.amount" :placeholder="t('signing.enter_amount') + ' (BTC)'" size="small" type="number"/>
      </el-form-item>

      <div style="text-align: right;">
        <el-button type="danger" size="small" @click="removeInput(index)">{{ t('signing.delete_input') }}</el-button>
      </div>
    </div>

    <el-button type="success" size="small" @click="addInput">{{ t('signing.add_input') }}</el-button>

    <el-divider style="margin-top: 30px">{{ t('signing.outputs') }}</el-divider>

    <div
        v-for="(output, index) in outputs"
        :key="'output-' + index"
        style="margin-bottom: 10px; border: 1px solid #ccc; padding: 10px; border-radius: 4px; font-size: 13px;"
    >
      <div style="font-weight: bold; margin-bottom: 8px;">{{ t('signing.output') }} #{{ index + 1 }}</div>
      <el-form-item :label="t('signing.address')" size="small">
        <el-input v-model="output.address" size="small" />
      </el-form-item>
      <el-form-item :label="t('signing.amount') + ' (BTC)'" size="small">
        <el-input v-model="output.amount" :placeholder="t('signing.enter_amount') + ' (BTC)'" size="small" type="number"/>
      </el-form-item>

      <div style="text-align: right;">
        <el-button type="danger" size="small" @click="removeOutput(index)">{{ t('signing.delete_output') }}</el-button>
      </div>
    </div>

    <el-button type="warning" size="small" @click="addOutput">{{ t('signing.add_output') }}</el-button>

    <div style="height: 30px"></div>

    <el-form-item :label="t('signing.change_address')">
      <el-input v-model="changeAddress" :placeholder="t('signing.change_placeholder')" />
    </el-form-item>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as bitcoin from 'bitcoinjs-lib'
import { ElMessage, ElMessageBox } from "element-plus"
import * as ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import { Buffer } from 'buffer'
import { CURVE, Point, schnorr } from '@noble/secp256k1'
import { t } from '../locales'

const ECPair = ECPairFactory.ECPairFactory(ecc)
bitcoin.initEccLib(ecc)

const emit = defineEmits(['signed'])

const btcFeeRate = ref(10)

const inputs = ref([
  {
    address: '',
    wif: '',
    txid: '',
    vout: 0,
    amount: 0
  }
])

const outputs = ref([
  {
    address: '',
    amount: 0
  }
])

const changeAddress = ref('')

function btcToSatoshi(btc) {
  const s = btc.toString().trim()
  if (!s.includes('.')) return parseInt(s, 10) * 1e8
  const [intPartRaw, fracRaw] = s.split('.')
  const intPart = intPartRaw === '' ? 0 : parseInt(intPartRaw, 10)
  const frac = (fracRaw + '00000000').slice(0, 8)
  return intPart * 1e8 + parseInt(frac, 10)
}

function getNetwork() {
  return bitcoin.networks.bitcoin
}

function estimateTxSize(inputCount, outputCount) {
  return 10 + inputCount * 68 + outputCount * 34
}

function detectAddressType(address) {
  if (!address) return 'Unknown'
  if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) return 'BIP44'
  if (address.startsWith('3') || address.startsWith('2')) return 'BIP49'
  if (address.startsWith('bc1q') || address.startsWith('tb1q')) return 'BIP84'
  if (address.startsWith('bc1p') || address.startsWith('tb1p')) return 'BIP86'
  return 'Unknown'
}

function toXOnly(pubkey) {
  if (!Buffer.isBuffer(pubkey)) pubkey = Buffer.from(pubkey)
  if (pubkey.length !== 33) throw new Error(t('signing.pubkey_length_33'))
  if (pubkey[0] !== 0x02 && pubkey[0] !== 0x03) throw new Error(t('signing.not_compressed'))

  const xOnly = pubkey.slice(1, 33)
  if (xOnly.length !== 32) throw new Error(t('signing.slice_32'))
  if (!Buffer.isBuffer(xOnly)) throw new Error(t('signing.xonly_not_buffer'))
  return xOnly
}

function ensureEvenYPrivateKey(privKey) {
  const P = Point.fromPrivateKey(privKey)

  if ((P.y & 1n) === 1n) {
    const d = BigInt('0x' + Buffer.from(privKey).toString('hex'))
    const newD = CURVE.n - d
    const newPriv = Buffer.from(newD.toString(16).padStart(64, '0'), 'hex')
    return newPriv
  }
  return privKey
}

function isAddressNetworkMatch(address, network) {
  try {
    if (address.startsWith('1') || address.startsWith('3') || address.startsWith('m') || address.startsWith('n') || address.startsWith('2')) {
      const { version } = bitcoin.address.fromBase58Check(address)
      if (network === bitcoin.networks.bitcoin) {
        return version === 0x00 || version === 0x05
      } else {
        return version === 0x6f || version === 0xc4
      }
    }

    if (address.startsWith('bc1') || address.startsWith('tb1')) {
      const { prefix } = bitcoin.address.fromBech32(address)
      if (network === bitcoin.networks.bitcoin) {
        return prefix === 'bc'
      } else {
        return prefix === 'tb'
      }
    }

    return false
  } catch (e) {
    return false
  }
}

const addInput = () => {
  inputs.value.push({
    address: '',
    wif: '',
    txid: '',
    vout: 0,
    amount: 0
  })
}

const removeInput = (index) => {
  if (inputs.value.length <= 1) {
    ElMessage.warning(t('signing.inputs_1'))
    return
  }
  inputs.value.splice(index, 1)
}

const addOutput = () => {
  outputs.value.push({
    address: '',
    amount: 0
  })
}

const removeOutput = (index) => {
  outputs.value.splice(index, 1)
}

async function signTransaction() {
  const network = getNetwork()
  const psbt = new bitcoin.Psbt({ network })

  let totalInput = 0
  let totalOutput = 0

  try {

    const signingData = []

    for (const input of inputs.value) {
      if (!input.address || !input.wif || !input.txid || input.amount <= 0) {
        ElMessage.error(t('signing.inputs_info_required'))
        return
      }

      if (!isAddressNetworkMatch(input.address, network)) {
        await ElMessageBox.alert(
            `${t('signing.network_mismatch_choose')}<br/>${t('signing.input_address')}: <strong>${input.address}</strong><br/>${t('signing.not_belongs_to')}:<strong>${t('signing.mainnet')}</strong>`,
             t('signing.network_not_match'),
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: t('signing.know'),
              type: 'warning',
            }
        )
        return
      }

      const keyPair = ECPair.fromWIF(input.wif, network)

      let privateKey = keyPair.privateKey
      const publicKey = Buffer.from(keyPair.publicKey)
      if (!privateKey) throw new Error(t('signing.private_key_invalid'))

      const addrType = detectAddressType(input.address)

      let payment
      let xOnlyPubkey = null

      if (addrType !== 'BIP86') {
        privateKey = Buffer.from(privateKey)
      }

      if (addrType === 'BIP86') {
        privateKey = ensureEvenYPrivateKey(privateKey)
        xOnlyPubkey = await schnorr.getPublicKey(privateKey)
        xOnlyPubkey = Buffer.from(xOnlyPubkey)
        payment = bitcoin.payments.p2tr({
          internalPubkey: xOnlyPubkey,
          network
        })
      } else if (addrType === 'BIP84') {
        payment = bitcoin.payments.p2wpkh({ pubkey: publicKey, network })
      } else {
        await ElMessageBox.alert(
            `${t('signing.not_supported_address_bip')}<br/>${t('signing.input_address')}:<strong>${input.address}</strong>`,
            t('signing.not_supported_address'),
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: t('signing.know'),
              type: 'warning',
            }
        )
        return
      }

      const generatedAddress = payment.address
      if (input.address !== generatedAddress) {
        throw new Error(`${t('signing.address_mismatch')}: ${t('signing.input_address')} ${input.address}，${t('signing.private_key_address')} ${generatedAddress}`)
      }

      let script = payment.output
      const value = btcToSatoshi(input.amount)

      signingData.push({
        privateKey: privateKey,
        xOnlyPubkey
      })

      if (addrType === 'BIP86') {
        psbt.addInput({
          hash: input.txid,
          index: input.vout,
          witnessUtxo: {
            script,
            value
          },
          tapInternalKey: xOnlyPubkey
        })
      } else if (addrType === 'BIP84') {
        script = Buffer.from(script)
        psbt.addInput({
          hash: input.txid,
          index: input.vout,
          witnessUtxo: {
            script: payment.output,
            value
          }
        })
      }

      totalInput += value
    }


    for (const output of outputs.value) {
      if (!output.address || !output.amount || output.amount <= 0) {
        throw new Error(t('signing.outputs_info_required'))
      }

      const value = btcToSatoshi(output.amount)
      psbt.addOutput({
        address: output.address,
        value
      })
      totalOutput += value
    }

    const estimatedSize = estimateTxSize(inputs.value.length, outputs.value.length + 1)
    const fee = btcFeeRate.value * estimatedSize

    const change = totalInput - totalOutput - fee

    if (change < 0) {
      throw new Error(t('signing.not_pay_fee'))
    }

    if (change > 0 && changeAddress.value) {
      psbt.addOutput({
        address: changeAddress.value,
        value: change
      })
    }

    for (let i = 0; i < inputs.value.length; i++) {
      const input = inputs.value[i]
      const { privateKey, xOnlyPubkey } = signingData[i]
      const addrType = detectAddressType(input.address)

      if (addrType === 'BIP86') {
        const sighash = psbt.__CACHE.__TX.hashForWitnessV1(
            i,
            psbt.data.inputs.map(i => i.witnessUtxo.script),
            psbt.data.inputs.map(i => i.witnessUtxo.value),
            bitcoin.Transaction.SIGHASH_DEFAULT
        )

        const tweak = bitcoin.crypto.taggedHash('TapTweak', xOnlyPubkey)

        let tweakedPriv = ecc.privateAdd(privateKey, tweak)
        if (!tweakedPriv) throw new Error(t('signing.tweak_fail'))
        if (!Buffer.isBuffer(tweakedPriv)) tweakedPriv = Buffer.from(tweakedPriv)
        if (tweakedPriv.length !== 32) throw new Error(t('signing.tweak_fail_length_32'))

        const tweakedPub = await schnorr.getPublicKey(tweakedPriv)

        const keyPair = ECPair.fromWIF(input.wif, network)
        const pubkey = toXOnly(keyPair.publicKey)
        const p2tr = bitcoin.payments.p2tr({ internalPubkey: pubkey, network })

        if (p2tr.address !== input.address) {
          throw new Error(t('signing.address_prikey_mismatch'))
        }

        const sig = await schnorr.sign(sighash, tweakedPriv)
        const finalSig = Buffer.from(sig)
        psbt.data.inputs[i].tapKeySig = finalSig
      } else {
        const keyPair = ECPair.fromWIF(input.wif, network)
        const fixedKeyPair = {
          publicKey: Buffer.from(keyPair.publicKey),
          sign: (hash) => Buffer.from(keyPair.sign(hash))
        }
        psbt.signInput(i, fixedKeyPair)
      }

      psbt.finalizeInput(i)
    }

    const tx = psbt.extractTransaction().toHex()

    const chain = 'btc'
    const vin = inputs.value.map(input => ({
      address: input.address,
      amount: parseFloat(input.amount).toFixed(8) + ' BTC'
    }))
    const vout = outputs.value.map(output => ({
      address: output.address,
      amount: parseFloat(output.amount).toFixed(8) + ' BTC'
    }))
    if (changeAddress.value && change > 0) {
      vout.push({
        address: changeAddress.value,
        amount: (change / 1e8).toFixed(8) + ' BTC'
      })
    }
    const totalFee = ((totalInput - totalOutput - (change > 0 ? change : 0)) / 1e8).toFixed(8) + ' BTC'

    const result = {
      chain,
      vin,
      vout,
      fee: totalFee,
      signedTx: tx
    }

    emit('signed', result)

  } catch (error) {
    ElMessage.error(t('signing.sign_fail') + ': ' + error.message)
  }
}

defineExpose({
  signTransaction
})
</script>
