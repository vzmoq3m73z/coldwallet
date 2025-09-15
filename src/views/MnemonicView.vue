
<template>
  <div style="margin: 0 auto;">
    <h2> {{ t('mnemonic.title') }} </h2>

    <el-form :label-width="t('common.label_width')">
      <el-form-item :label="t('mnemonic.words')">
        <el-select v-model="selectedWordCount" :placeholder="t('mnemonic.select_words')">
          <el-option v-for="count in wordCounts" :key="count" :label="`${count} `+t('mnemonic.words_unit')" :value="count" />
        </el-select>
      </el-form-item>


      <el-form-item :label="t('mnemonic.generate_count')">
        <el-select v-model="selectedCount" :placeholder="t('mnemonic.generate_count_placeholder')">
          <el-option v-for="count in generateCounts" :key="count" :label="count" :value="count" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <div style="width: 100%; text-align: right;">
          <el-button type="primary" @click="generateMnemonic">{{t('mnemonic.generate')}}</el-button>
        </div>
      </el-form-item>

    </el-form>

    <div
        v-for="(mnemonic, index) in generatedMnemonics"
        :key="index"
        style="margin-bottom: 10px;"
    >
      <div style="display: flex;">
        <div style="flex: 1;">
          <h4 style="margin-bottom: 5px;">
            {{ t('mnemonic.mnemonic') }}{{ generatedMnemonics.length > 1 ? ` #${index + 1}` : '' }}:
          </h4>
          <el-input
              type="textarea"
              :rows="2"
              :value="mnemonic"
              readonly
          />
        </div>
        <div style="margin-left: 10px; align-self: flex-end;">
          <el-button type="primary" text @click="copySingleMnemonic(index)">{{ t('mnemonic.copy') }}</el-button>
        </div>
      </div>
    </div>

    <div v-if="generatedMnemonics.length" style="margin-top: 30px;margin-bottom:50px">
      <el-button type="primary" text @click="copyMnemonic">{{ t('mnemonic.copy_all') }}</el-button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as bip39 from 'bip39'
import { t } from '../locales'



const wordCounts = [12, 15, 18, 21, 24]
const generateCounts = [1, 10, 50, 100]
const selectedWordCount = ref(12)
const selectedCount = ref(1)
const generatedMnemonics = ref([])



function generateMnemonic() {
  generatedMnemonics.value = []

  const strengthBits = {
    12: 128,
    15: 160,
    18: 192,
    21: 224,
    24: 256
  }[selectedWordCount.value]

  for (let i = 0; i < selectedCount.value; i++) {
    const mnemonic = bip39.generateMnemonic(strengthBits)
    generatedMnemonics.value.push(mnemonic)
  }
}

function copyMnemonic() {
  const texts = generatedMnemonics.value.map((mnemonic, index) => {
    const prefix = generatedMnemonics.value.length > 1 ? ` #${index + 1}` : ''
    return `${t('mnemonic.mnemonic')}${prefix}:\n${mnemonic}`
  })

  const text = texts.join('\n\n')
  navigator.clipboard.writeText(text)
      .then(() => ElMessage.success(t('common.copy_success')))
      .catch(() => ElMessage.error(t('common.copy_fail')))
}

function copySingleMnemonic(index) {
  const text = generatedMnemonics.value[index]
  navigator.clipboard.writeText(text)
      .then(() => {
        const prefix = generatedMnemonics.value.length > 1 ? ` #${index + 1}` : ''
        ElMessage.success(`${t('mnemonic.mnemonic')}${prefix} ${t('common.copy_success')}`)
      })
      .catch(() => ElMessage.error(t('common.copy_fail')))
}

</script>

<style scoped>
.el-textarea__inner {
  font-family: monospace;
  font-size: 16px;
}
</style>