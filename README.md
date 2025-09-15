# Cold Wallet - Offline Cryptocurrency Tool

[中文版本](#中文版本) | **English Version**

A secure, offline cryptocurrency wallet tool for mnemonic generation, address derivation, and transaction signing. Built with Vue.js for maximum security and ease of use.

## 🌐 Online Demo

Try it now: **<a href="https://www.coldkey.xyz" target="_blank">https://www.coldkey.xyz</a>**

## ✨ Features

- **🔐 Completely Offline**: No network requests, all operations run locally in your browser
- **🎲 Mnemonic Generation**: Generate secure BIP39 mnemonic phrases (English)
- **🔗 Multi-Chain Address Derivation**: Support for Bitcoin, Ethereum, Tron, and Solana
- **✍️ Bitcoin Transaction Signing**: Full support for BTC transaction creation and signing
- **🌍 Bilingual Support**: English and Simplified Chinese interfaces
- **🛡️ Security First**: Open source, client-side only, no data transmission

## 🚀 Supported Cryptocurrencies

### 📖 Open Source Version (This Repository)

| Chain | Address Generation | Transaction Signing | Standards |
|-------|-------------------|-------------------|-----------|
| **Bitcoin** | ✅ | ✅ | BIP44, BIP49, BIP84, BIP86 |
| **Ethereum** | ✅ | ❌ | BIP44 |
| **Tron** | ✅ | ❌ | BIP44 |
| **Solana** | ✅ | ❌ | BIP44 |

### 💎 Complete Version (Commercial)

| Chain | Address Generation | Transaction Signing | Standards |
|-------|-------------------|-------------------|-----------|
| **Bitcoin** | ✅ | ✅ | BIP44, BIP49, BIP84, BIP86 |
| **Ethereum** | ✅ | ✅ | BIP44 |
| **Tron** | ✅ | ✅ | BIP44 |
| **Solana** | ✅ | ✅ | BIP44 |
| **BNB Smart Chain** | ✅ | ✅ | BIP44 |
| **Polygon** | ✅ | ✅ | BIP44 |
| **Avalanche C-Chain** | ✅ | ✅ | BIP44 |
| **Arbitrum One** | ✅ | ✅ | BIP44 |
| **Optimism** | ✅ | ✅ | BIP44 |
| **Base** | ✅ | ✅ | BIP44 |
| **zkSync Era** | ✅ | ✅ | BIP44 |

### 🌍 Additional Features Comparison

| Feature | Open Source | Complete Version |
|---------|-------------|------------------|
| **Mnemonic Languages** | English only | 10 languages |
| **Address Export** | Copy only | Excel download |
| **File Verification** | ❌ | Anti-tampering verification |
| **Internationalization** | 2 languages (EN/ZH) | 10 languages |
| **Offline Package** | Build required | Standalone HTML |

## 🛠️ Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/coldwallet.git
cd coldwallet

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 💻 Usage

### 1. Mnemonic Generation
- Select word count (12, 15, 18, 21, or 24 words)
- Choose generation quantity (1-100)
- Generate secure English mnemonic phrases

### 2. Address Derivation
- Enter your mnemonic phrase
- Select blockchain (BTC/ETH/TRX/SOL)
- Configure derivation parameters
- Generate addresses with private keys

### 3. Bitcoin Transaction Signing
- Import UTXOs and private keys
- Set transaction outputs
- Configure mining fees
- Generate signed transactions

## 🔒 Security Features

- **Air-gapped Operation**: Designed to work completely offline
- **No Data Storage**: Nothing is saved to servers or local storage
- **Client-side Cryptography**: All operations performed in browser
- **Open Source**: Full transparency, audit the code yourself

## 🏗️ Technical Stack

- **Frontend**: Vue.js 3 + Element Plus
- **Cryptography**:
  - bitcoinjs-lib (Bitcoin operations)
  - ethers.js (Ethereum operations)
  - @solana/web3.js (Solana operations)
  - bip39 (Mnemonic handling)
- **Build Tool**: Vite

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For questions, suggestions, or security reports, please contact:

**Email**: [vzmoq3m73z@gmail.com](mailto:vzmoq3m73z@gmail.com)

### 💼 Commercial Services

Need additional features or customizations? Contact us for:
- **🗄️ Pure Offline Version**: Standalone HTML package for air-gapped environments
- **⚡ Custom Features**: Additional blockchain support, advanced signing capabilities
- **🏢 Enterprise Solutions**: White-label versions, API integrations, custom branding
- **🔧 Technical Support**: Implementation assistance, security audits, training
- **🌐 Online Companion Tool**: Professional blockchain query and broadcast service

#### 🌐 Cold Wallet Online (Companion Service)

A professional online companion tool that works seamlessly with the offline version:

**🔍 Blockchain Query Services**:
- **Balance Checker**: Multi-chain balance queries for all supported networks
- **Transaction Lookup**: Comprehensive transaction history and status tracking
- **Fee Estimation**: Real-time gas/fee estimation for optimal transaction costs
- **Block Explorer**: Latest block information and network status
- **Nonce Management**: Automatic nonce tracking for Ethereum-based chains

**📡 Broadcast Services**:
- **Secure Broadcasting**: Push signed transactions to blockchain networks
- **Multi-Network Support**: Bitcoin, Ethereum, Tron, BNB, Polygon, and more
- **Status Monitoring**: Real-time transaction confirmation tracking
- **Error Handling**: Detailed failure analysis and retry mechanisms

**🔄 Workflow Integration**:
1. **Offline**: Generate addresses and sign transactions securely
2. **Online**: Query chain data and broadcast transactions

This two-part system ensures maximum security while maintaining full functionality.

## ⚠️ Disclaimer

This tool is provided "as is" without warranty. Always verify generated addresses and transactions before use. For large amounts, please test with small amounts first. The developers are not responsible for any loss of funds.

---

# 中文版本

一个安全的离线加密货币钱包工具，用于助记词生成、地址派生和交易签名。基于 Vue.js 构建，确保最高安全性和易用性。

## 🌐 在线体验

立即尝试：**<a href="https://www.coldkey.xyz" target="_blank">https://www.coldkey.xyz</a>**

## ✨ 功能特性

- **🔐 完全离线**：无网络请求，所有操作在浏览器本地运行
- **🎲 助记词生成**：生成安全的 BIP39 助记词（英文）
- **🔗 多链地址派生**：支持比特币、以太坊、波场和 Solana
- **✍️ 比特币交易签名**：完整支持 BTC 交易创建和签名
- **🌍 双语支持**：英文和简体中文界面
- **🛡️ 安全优先**：开源、纯客户端、无数据传输

## 🚀 支持的加密货币

### 📖 开源版本（本仓库）

| 区块链 | 地址生成 | 交易签名 | 支持标准 |
|-------|---------|---------|----------|
| **比特币** | ✅ | ✅ | BIP44, BIP49, BIP84, BIP86 |
| **以太坊** | ✅ | ❌ | BIP44 |
| **波场** | ✅ | ❌ | BIP44 |
| **Solana** | ✅ | ❌ | BIP44 |

### 💎 完整版本（商业版）

| 区块链 | 地址生成 | 交易签名 | 支持标准 |
|-------|---------|---------|----------|
| **比特币** | ✅ | ✅ | BIP44, BIP49, BIP84, BIP86 |
| **以太坊** | ✅ | ✅ | BIP44 |
| **波场** | ✅ | ✅ | BIP44 |
| **Solana** | ✅ | ✅ | BIP44 |
| **币安智能链** | ✅ | ✅ | BIP44 |
| **Polygon** | ✅ | ✅ | BIP44 |
| **Avalanche C链** | ✅ | ✅ | BIP44 |
| **Arbitrum One** | ✅ | ✅ | BIP44 |
| **Optimism** | ✅ | ✅ | BIP44 |
| **Base** | ✅ | ✅ | BIP44 |
| **zkSync Era** | ✅ | ✅ | BIP44 |

### 🌍 功能对比

| 功能特性 | 开源版本 | 完整版本 |
|---------|---------|---------|
| **助记词语言** | 仅英文 | 10种语言 |
| **地址导出** | 仅复制 | Excel下载 |
| **文件校验** | ❌ | 防篡改校验 |
| **国际化支持** | 2种语言（中/英） | 10种语言 |
| **离线打包** | 需要构建 | 独立HTML文件 |

## 🛠️ 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/coldwallet.git
cd coldwallet

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 💻 使用方法

### 1. 助记词生成
- 选择词数（12、15、18、21 或 24 个词）
- 选择生成数量（1-100）
- 生成安全的英文助记词

### 2. 地址派生
- 输入助记词
- 选择区块链（BTC/ETH/TRX/SOL）
- 配置派生参数
- 生成地址和私钥

### 3. 比特币交易签名
- 导入 UTXO 和私钥
- 设置交易输出
- 配置矿工费
- 生成签名交易

## 🔒 安全特性

- **气隙操作**：设计为完全离线工作
- **无数据存储**：不保存任何数据到服务器或本地
- **客户端加密**：所有操作在浏览器中执行
- **开源透明**：完全开源，可自行审计代码

## 🏗️ 技术栈

- **前端**：Vue.js 3 + Element Plus
- **加密库**：
  - bitcoinjs-lib（比特币操作）
  - ethers.js（以太坊操作）
  - @solana/web3.js（Solana 操作）
  - bip39（助记词处理）
- **构建工具**：Vite

## 📝 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件。

## 📧 联系方式

如有问题、建议或安全报告，请联系：

**邮箱**：[vzmoq3m73z@gmail.com](mailto:vzmoq3m73z@gmail.com)

### 💼 商业服务

需要更多功能或定制化服务？请联系我们获取：
- **🗄️ 纯离线版本**：独立HTML打包文件，适用于完全断网环境
- **⚡ 定制功能**：更多区块链支持、高级签名功能
- **🏢 企业解决方案**：白标定制、API集成、品牌定制
- **🔧 技术支持**：实施协助、安全审计、技术培训
- **🌐 在线配套工具**：专业的区块链查询和广播服务

#### 🌐 冷钱包在线端（配套服务）

专业的在线配套工具，与离线版本无缝配合使用：

**🔍 区块链查询服务**：
- **余额查询**：多链余额查询，支持所有主流网络
- **交易查询**：全面的交易历史和状态跟踪
- **手续费估算**：实时gas/手续费估算，优化交易成本
- **区块浏览**：最新区块信息和网络状态
- **Nonce管理**：以太坊系列链的自动nonce跟踪

**📡 广播服务**：
- **安全广播**：将签名交易推送到区块链网络
- **多网络支持**：比特币、以太坊、波场、币安链、Polygon等
- **状态监控**：实时交易确认跟踪
- **错误处理**：详细的失败分析和重试机制

**🔄 工作流集成**：
1. **离线端**：安全地生成地址和签名交易
2. **在线端**：查询链上数据和广播交易

这种双端系统在保证最高安全性的同时提供完整功能。

## ⚠️ 免责声明

本工具按"原样"提供，不提供任何保证。使用前请始终验证生成的地址和交易。对于大额资金，请先用小额测试。开发者不对任何资金损失负责。