
<template>

  <el-container style="height: 100vh; display: flex; flex-direction: column;">

    <el-header height="64px" style="background-color: #317cc6; padding: 0 20px;">
      <el-row justify="center" align="middle" style="height: 100%;">

        <el-col :xs="24" :sm="20" :md="20" :lg="18" :xl="18">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; flex: 1;">
              <div style="color: white; font-size: 20px; font-weight: bold; margin-right: 30px; white-space: nowrap;">
                {{ t('app.title') }}
              </div>
              <el-menu
                  mode="horizontal"
                  router
                  :default-active="route.path"
                  background-color="transparent"
                  text-color="#ffffff"
                  active-text-color="#f1d884"
                  style="flex: 1"
              >
                <el-menu-item index="/mnemonic">{{ t('app.mnemonic') }}</el-menu-item>
                <el-menu-item index="/derivation">{{ t('app.derivation') }}</el-menu-item>
                <el-menu-item index="/signing">{{ t('app.signing') }}</el-menu-item>
              </el-menu>
            </div>
            
            <div style="margin-left: 20px;">
              <el-select
                v-model="currentLocale"
                @change="handleLocaleChange"
                style="width: 120px;"
                size="small"
              >
                <el-option
                  v-for="lang in availableLocales"
                  :key="lang.code"
                  :label="lang.name"
                  :value="lang.code"
                />
              </el-select>
            </div>
          </div>
        </el-col>

      </el-row>

    </el-header>

    <el-main style="flex: 1; overflow-y: auto; padding: 0 20px">

      <el-row justify="center">
        <el-col :xs="24" :sm="20" :md="20" :lg="18" :xl="18">
          <router-view />
        </el-col>
      </el-row>

    </el-main>

  </el-container>

</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { locale, setLocale, t, getAvailableLocales } from './locales'

const route = useRoute()

const availableLocales = getAvailableLocales()

const currentLocale = ref(locale.value)

function handleLocaleChange(newLocale) {
  setLocale(newLocale)
  currentLocale.value = newLocale
}

watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})
</script>

<style scoped>

</style>
