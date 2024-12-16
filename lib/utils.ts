import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as crypto from '@shardus/crypto-web'
import axios from 'axios'
import stringify from 'fast-stable-stringify'
import { ethers } from 'ethers'
import { Ratchet, getPublicKey, secpUtils } from '@thant-dev/ciphersuite'
import { orderBy, keys, update } from 'lodash'

const config = {
  archiver: {
    ip: '127.0.0.1',
    port: 4000,
  },
  proxy: {
    ip: 'test.liberdus.com',
    port: 443,
  },
  rpc_server: {
    ip: '127.0.0.1',
    port: 8545,
  },
  useEthereumAddress: true,
}

export type WalletEntry = {
  address: string
  keys: KeyPair
}

type KeyPair = {
  publicKey: Uint8Array | string
  privateKey: Uint8Array | string
}

export type WalletInfo = {
  handle: string
  entry: WalletEntry
}

let host: string
const defaultSeedNode = `${config.archiver.ip}:${config.archiver.port}`
console.log('defaultSeedNode', defaultSeedNode)
const storedSeedNode = localStorage.getItem('seednode')
const seedNodeHost = storedSeedNode || defaultSeedNode
const walletEntries: { [handle: string]: WalletEntry } = {}
const network = '0'.repeat(64)
const verboseLogs = false

export let currentUserName = ''

const LIB_RRC_METHODS = {
  SEND_TRANSACTION: 'lib_sendTransaction',
  GET_ACCOUNT: 'lib_getAccount',
  GET_TRANSACTION_RECEIPT: 'lib_getTransactionReceipt',
  GET_TRANSACTION_HISTORY: 'lib_getTransactionHistory',
  GET_MESSAGES: 'lib_getMessages',
  SUBSCRIBE: 'lib_subscribe',
  UNSUBSCRIBE: 'lib_unsubscribe',
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const initializeShardusCrypto = () => {
  console.log('initializeShardusCrypto')
  crypto.initialize('69fa4195670576c0160d660c3be36556ff8d504725be8a59b5a96509e0c994bc')
  console.log('crypto initialized')
}

const getCurrentSeedNode =  (host: string) => {
  return {
    ip: host.split(':')[0],
    port: parseInt(host.split(':')[1]),
  }
}

const hashVerificationCode = (code: string) => {
  return crypto.hash(code)
}

const updateHost = (newHost: string) => {
  host = newHost
}

const isServerActive = async () => {
  try {
    const res = await axios.get(getProxyUrl('/network/parameters'))
    const isActive = !!(res.status === 200)
    return isActive
  } catch (e) {
    return false
  }
}

const getProxyUrl = (url: string, option?: any) => {
  try {
    let ip, port
    if (!option) {
      ip = host.split(':')[0]
      port = host.split(':')[1]
    } else if (option) {
      ip = option.ip
      port = option.port
    }
    if (verboseLogs) {
      console.log('getProxyUrl', url, option, ip, port)
      console.log(ip, port)
    }
    if (ip === 'localhost' || ip === '127.0.0.1') {
      return `http://localhost:${port}${url}`
    }

    if (ip.includes('192.168.1')) {
      return `http://${ip}:${port}${url}`
    }
    return `http://${ip}:${port}${url}`
    // return `https://${config.proxy.ip}:${config.proxy.port}/rproxy/${ip}:${port}${url}`
  } catch (e) {
    return ''
  }
}

const getProxyUrlWithRandomHost = async function (url: string) {
  const randomHost = await getRandomHost()
  const { ip, port } = randomHost
  if (ip === 'localhost' || ip === '127.0.0.1') {
    return `http://localhost:${port}${url}`
  }
  if (ip.includes('192.168.1')) {
    return `http://${ip}:${port}${url}`
  }
  return `http://${ip}:${port}${url}`
  // return `https://${config.proxy.ip}:${config.proxy.port}/rproxy/${ip}:${port}${url}`
}

const getRandomHost = async () => {
  const ip = seedNodeHost.split(':')[0]
  const port = seedNodeHost.split(':')[1]
  const res = await axios.get(getProxyUrl('/nodelist', { ip, port }), {
    timeout: 10000,
  })
  const nodeList = res.data.nodeList
  const randIndex = Math.floor(Math.random() * nodeList.length)
  const randHost = nodeList[randIndex]
  if (!randHost) {
    throw new Error('Unable to get random host')
  }
  if (randHost.ip === '127.0.0.1' || randHost.ip === 'localhost') {
    randHost.ip = seedNodeHost.split(':')[0]
  }
  return randHost
}

const updateSeedNodeHostLocally = async (ip: string, port: string) => {
  const seedNodeHost = `${ip}:${port}`
  // eslint-disable-next-line no-undef
  localStorage.setItem('seednode', seedNodeHost)
}

const isSeedNodeOnline = async (ip: string, port: string) => {
  try {
    // const seedNodeHost = `${ip}:${port}`
    const res = await axios.get(getProxyUrl('/nodelist', { ip, port }), {
      timeout: 10000,
    })
    if (res.status === 200) {
      return true
    }
    return false
  } catch (e) {
    console.warn(e)
    return false
  }
}

const getSeedNode = async (ip: string, port: string) => {
  return {
    ip: seedNodeHost.split(':')[0],
    port: seedNodeHost.split(':')[1],
  }
}

const bytesToHex = (uint8Array: Uint8Array) => {
  return Array.from(uint8Array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const createAccount = (): WalletEntry => {
  let key = {
    address: '',
    keys: {
      publicKey: '',
      privateKey: '',
    },
  } as WalletEntry
  if (config.useEthereumAddress) {
    // Generate the key pair using @noble/secp256k1
    const privateKey = secpUtils.randomPrivateKey()

    // Derive Ethereum address if needed
    const uncompressedPublicKey = getPublicKey(privateKey, false) // false indicates uncompressed
    const uncompressedPublicKeyHex = ethers.hexlify(uncompressedPublicKey)
    console.log('uncompressedPublicKeyHex', uncompressedPublicKeyHex)
    const ethAddress = ethers.computeAddress(uncompressedPublicKeyHex)

    key.address = toShardusAddress(ethAddress)
    key.keys.publicKey = uncompressedPublicKey
    key.keys.privateKey = privateKey
  } else {
    const newAccount = crypto.generateKeys()
    key.address = newAccount.publicKey
    key.keys.publicKey = newAccount.publicKey
    key.keys.privateKey = newAccount.privateKey
  }
  // TODO: Remove the debug log in production
  console.log('createAccount', key)
  return key
}

export const getPrivateKeyHex = (sk: Uint8Array) => {
  if (config.useEthereumAddress) {
    return ethers.hexlify(sk)
  } else {
    return sk
  }
}

const toShardusAddress = (addressStr: string) => {
  //  change this: 0x665eab3be2472e83e3100b4233952a16eed20c76
  //  to this: 665eab3be2472e83e3100b4233952a16eed20c76000000000000000000000000
  return addressStr.slice(2).toLowerCase() + '0'.repeat(24)
}

const signObj = async (tx: object, source: WalletEntry) => {
  if (config.useEthereumAddress) {
    await signEthereumTx(tx, source)
  } else {
    crypto.signObj(tx, source.keys.privateKey as string, source.keys.publicKey as string)
  }
}

const signEthereumTx = async (tx: object, source: WalletEntry) => {
  console.log(`signEthereumTx`, source)
  if (source == null || source.keys == null) {
    throw new Error('Keys are required for signing')
  }

  // Convert the object to a string with BigInt support
  const message = crypto.hashObj(tx)

  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(getPrivateKeyHex(source.keys.privateKey as string))

    // Sign the message
    const signature = await wallet.signMessage(message)

    // Add signature to transaction
    tx.sign = {
      owner: source.address,
      sig: signature,
    }
  } catch (error: unknown) {
    throw new Error(`Failed to sign transaction: ${error instanceof Error ? error.message : error}`)
  }
}

export const saveWallet = (newWalletEntry: WalletInfo) => {
  console.log('\n\n saveWallet \n\n', newWalletEntry)
  try {
    currentUserName = newWalletEntry.handle
    let savedWallets = localStorage.getItem('wallets')
    if (savedWallets === null) {
      localStorage.setItem('wallets', crypto.safeStringify([newWalletEntry]))
      return
    }
    const existingWalletList = crypto.safeJsonParse(savedWallets) as WalletInfo[]
    let newWallet: WalletInfo[] =
      existingWalletList && existingWalletList.length > 0 ? [...existingWalletList] : []
    newWallet = newWallet.filter((w) => w.handle !== newWalletEntry.handle)
    newWallet = newWallet.concat(newWalletEntry)
    // .filter(w => w.handle !== newWalletEntry.handle)
    // .concat(newWalletEntry)
    localStorage.setItem('wallets', crypto.safeStringify(newWallet))
  } catch (e) {
    console.log(e)
    currentUserName = newWalletEntry.handle
    localStorage.setItem('wallets', crypto.safeStringify([newWalletEntry]))
  }
}

export const loadWallet = (username: string): WalletInfo | undefined => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('wallets')
    if (loadedEntries === null) {
      return undefined
    }
    const walletList = crypto.safeJsonParse(loadedEntries) as WalletInfo[]
    return walletList.find((w) => w.handle === username)
  } catch (e) {
    return undefined
  }
}

const loadLastMessage = (username: string) => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('lastMessage')
    const lastMessage = crypto.safeJsonParse(loadedEntries)
    return lastMessage[username]
  } catch (e) {
    return null
  }
}

const loadLastTx = (username: string) => {
  try {
    // eslint-disable-next-line no-undef
    const loadedEntries = localStorage.getItem('lastTx')
    const lastTx = crypto.safeJsonParse(loadedEntries)
    return lastTx[username]
  } catch (e) {
    return null
  }
}


const getInjectUrl = (): string => {
  return getProxyUrl('/inject')
}

const getAccountsUrl = (): string => {
  return getProxyUrl('/accounts')
}

const getAccountUrl = (id: string) => {
  return getProxyUrl(`/account/${id}`)
}

const getJSON = async (url: string) => {
  try {
    const response = await axios(url)
    if (response.data) {
      console.dir(crypto, { depth: null })
      return crypto.safeJsonParse(crypto.safeStringify(response.data))
    }
  } catch (err) {
    console.log(err)
    return err
  }
}

const postJSON = async (url: string, obj: unknown) => {
  const response = await axios.post(url, obj)
  return response.data
}

const injectTx = async (tx: unknown) => {
  try {
    const data = crypto.safeStringify(tx)
    const res = await makeJsonRpcRequest(LIB_RRC_METHODS.SEND_TRANSACTION, [data])
    return { result: res }
  } catch (err: unknown) {
    console.warn(err)
    return err.message
  }
}

const getAccountData = async (id: string) => {
  try {
    const accountData = await getJSON(getAccountUrl(id))
    return accountData
  } catch (err) {
    return err.message
  }
}

const getToll = async (friendId: string, yourId: string): Promise<bigint> => {
  try {
    const { toll } = await getJSON(getProxyUrl(`/account/${friendId}/${yourId}/toll`))
    return toll || BigInt(0)
  } catch (err) {
    return err.message
  }
}

export const getAddress = async (handle: string): Promise<string | null> => {
  if (handle.length === 64) return handle
  try {
      const randomUrl = await getProxyUrlWithRandomHost(`/address/${crypto.hash(handle)}`)
      const data = await getJSON(randomUrl)
      console.log('getAddress', randomUrl, data)
      const { address, error } = data
      if (error) {
        console.log(error)
        console.log(`Error while getting address for ${handle}`)
      } else if (address) {
        return address
      }
  } catch (e) {
    console.log('getAddress', e)
  }
  return null
}

const getAccountPublicKey = async (address: string): Promise<string | null> => {
  try {
    const account = await getAccountData(address)
    console.log(`getAccountPublicKey`, account)
    return account.account.publicKey
  } catch (e) {
    console.log(`Error while getting public key for ${address}`, e.message)
    return null
  }
}

const getTransactionHistory = async (address: string) => {
  try {
    const result = await makeJsonRpcRequest(LIB_RRC_METHODS.GET_TRANSACTION_HISTORY, [address])
    if (result.transactions === null) return []
    if (result.transactions.length === 0) return []
    const transactions = crypto.safeJsonParse(crypto.safeStringify(result.transactions))
    return transactions
  } catch (err) {
    console.log(err)
    return []
  }
}

const makeJsonRpcRequest = async (method: string, params: unknown[] = []) => {
  const requestBody = {
    jsonrpc: '2.0',
    method,
    params,
    id: 1,
  }

  try {
    // const url = getProxyUrl(``, { ip: config.rpc_server.ip, port: config.rpc_server.port })
    const url = `http://${config.rpc_server.ip}:${config.rpc_server.port}`
    const response = await axios.post(url, requestBody, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
    const responseData = response.data

    if (responseData.error) {
      console.error('makeJsonRpcRequest Error:', method, responseData.error)
      throw new Error(responseData.error)
    } else {
      console.log('makeJsonRpcRequest Result:', method, responseData.result)
      return responseData.result
    }
  } catch (error) {
    console.error('makeJsonRpcRequest Error:', method, error)
    throw new Error(error)
  }
}

const pollMessages = async (from: string, to: string, timestamp: number) => {
  try {
    const url = getProxyUrl(`/messages/${to}/${from}`)
    const { messages } = await getJSON(url)
    return messages
  } catch (err) {
    return err.message
  }
}

export const createWallet = (name: string): WalletEntry => {
  if (typeof walletEntries[name] !== 'undefined' && walletEntries[name] !== null) {
    console.log(`Wallet named '${name}' already exists.`)
    return walletEntries[name]
  } else {
    const account = createAccount()
    console.log(`Created wallet '${name}': '${account.address}'.`)
    return account
  }
}

export const importWallet = async (sk: string) : Promise<{ handle: string; entry: WalletEntry }>  => {
  let entry = {
    address: '',
    keys: {
      publicKey: '',
      privateKey: '',
    },
  } as WalletEntry
  if (config.useEthereumAddress) {
    // Convert the hex private key to a byte array supported by @noble/secp256k1
    const privateKey = Buffer.from(sk.slice(2), 'hex')

    // Validate the private key
    if (!secpUtils.isValidPrivateKey(privateKey)) {
      throw new Error('Invalid Ethereum private key')
    }
    const uncompressedPublicKey = getPublicKey(privateKey, false) // false indicates uncompressed
    const uncompressedPublicKeyHex = ethers.hexlify(uncompressedPublicKey)
    const ethAddress = ethers.computeAddress(uncompressedPublicKeyHex)
    entry.address = toShardusAddress(ethAddress)
    entry.keys.publicKey = uncompressedPublicKey
    entry.keys.privateKey = privateKey
  } else {
    entry.address = sk.slice(64)
    entry.keys.publicKey = entry.address
    entry.keys.privateKey = sk
  }
  let handle = await getHandle(entry.address)
  console.log('importWallet', handle, entry)
  if (handle === undefined || handle == null) {
    handle = 'Nousername'
  }
  // TODO: Remove the debug log in production
  console.log('importWallet', handle, entry)
  return {
    handle,
    entry,
  }
}

const listWallet = (name: string): void => {
  const wallet = walletEntries[name]
  if (typeof wallet !== 'undefined' && wallet !== null) {
    console.log(`${crypto.safeStringify(wallet, null, 2)}`)
  } else {
    console.log(`${crypto.safeStringify(walletEntries, null, 2)}`)
  }
}

export const registerAlias = async (handle: string, source: WalletEntry) => {
  const tx = {
    type: 'register',
    aliasHash: crypto.hash(handle),
    from: source.address,
    alias: handle,
    publicKey: ethers.hexlify(source.keys.publicKey).slice(2),
    timestamp: Date.now(),
  }
  await signObj(tx, source)
  console.log('register tx', tx)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const addFriend = async (tgt: string, keys: WalletEntry) => {
  console.log(tgt)
  const targetAddress = await getAddress(tgt)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt)
    return
  }
  const tx = {
    type: 'friend',
    network,
    alias: tgt,
    from: keys.address,
    to: targetAddress,
    amount: BigInt(1),
    timestamp: Date.now(),
  }
  await signObj(tx, keys)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const removeFriend = async (tgt: string, keys: WalletEntry) => {
  const targetAddress = await getAddress(tgt)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt)
    return
  }
  const tx = {
    type: 'remove_friend',
    network,
    alias: tgt,
    from: keys.address,
    to: targetAddress,
    amount: BigInt(1),
    timestamp: Date.now(),
  }
  await signObj(tx, keys)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const claimTokens = async (keys: WalletEntry) => {
  const tx = {
    type: 'claim_coins',
    network,
    srcAcc: keys.address,
    timestamp: Date.now(),
  }
  await signObj(tx, keys)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const setToll = async (toll: number, keys: WalletEntry) => {
  const tx = {
    type: 'toll',
    network,
    from: keys.address,
    toll: BigInt(toll),
    timestamp: Date.now(),
  }
  await signObj(tx, keys)
  console.log(tx)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const depositStake = async (nominee: string, stake: number, keys: WalletEntry) => {
  console.log(keys)
  const tx = {
    type: 'deposit_stake',
    nominator: keys.address,
    nominee,
    stake: BigInt(stake),
    timestamp: Date.now(),
  }
  console.log(tx)
  await signObj(tx, keys)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const withdrawStake = async (nominee: string, force: boolean, keys: WalletEntry) => {
  const tx = {
    type: 'withdraw_stake',
    nominator: keys.address,
    nominee,
    force,
    timestamp: Date.now(),
  }
  await signObj(tx, keys)
  console.log(tx)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const hashMessage = (message: object) => {
  if (typeof message !== 'object') {
    console.log('Message must be an object')
    return
  }
  return crypto.hashObj(message)
}

const sendMessage = async (payload: object, sourceAcc: WalletInfo, targetHandle: string) => {
  const source = sourceAcc.entry
  const targetAddress = await getAddress(targetHandle)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", targetHandle)
    return
  }
  const tollAmount = await getToll(targetAddress, source.address)
  const messageTimestamp = Date.now()
  const stringifiedPayload = crypto.safeStringify(payload)
  const tx = {
    type: 'message',
    network,
    from: source.address,
    to: targetAddress,
    chatId: crypto.hash([source.address, targetAddress].sort().join('')),
    message: stringifiedPayload,
    amount: tollAmount,
    timestamp: messageTimestamp,
  }
  console.log(`unsigned tx`, tx, source.keys)
  await signObj(tx, source)
  console.log(`signed message`, tx)
  console.log(`signed message`, crypto.safeStringify(tx))
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success === true) resolve({ success: true, pendingTx: tx })
      else resolve({ success: false, pendingTx: null })
    })
  })
}

const broadcastMessage = async (text: string, source: WalletEntry, recipients: string[]) => {
  const targetAccs = []
  const messages = []
  let requiredAmount = BigInt(0)
  for (let i = 0; i < recipients.length; i++) {
    console.log('RECIP: ', recipients[i])
    const tgtAddress = await getAddress(recipients[i])
    if (tgtAddress === undefined || tgtAddress === null) {
      console.log("Target account doesn't exist for: ", recipients[i])
      continue
    }
    targetAccs.push(tgtAddress)
    const message = stringify({
      body: text,
      timestamp: Date.now(),
      handle: source,
    })
    // const encryptedMsg = crypto.encrypt(
    //   message,
    //   crypto.convertSkToCurve(source.keys.privateKey),
    //   crypto.convertPkToCurve(tgtAddress)
    // )
    const encryptedMsg = message
    messages.push(encryptedMsg)
    requiredAmount += await getToll(tgtAddress, source.address)
  }
  const tx = {
    type: 'broadcast',
    network,
    messages: messages,
    srcAcc: source.address,
    tgtAccs: targetAccs,
    amount: requiredAmount,
    timestamp: Date.now(),
  }
  await signObj(tx, source)
  injectTx(tx).then((res) => {
    console.log(res)
  })
}

export const getHandle = async (address: string): Promise<string | null> => {
  if (host === undefined) {
    const randomHost = await getRandomHost()
    updateHost(`${randomHost.ip}:${randomHost.port}`)
    console.log('getHandle', host)
  }

  const url = getProxyUrl(`/account/${address}/alias`)
  const { handle } = await getJSON(url)
  console.log('getHandle', handle)
  return handle
}

const getMessages = async (srcEntry: WalletEntry, tgt: string, timestamp: number) => {
  const targetAddress = await getAddress(tgt)
  if (targetAddress === undefined || targetAddress === null) {
    console.log("Target account doesn't exist for: ", tgt)
    return
  }
  const messages = await pollMessages(srcEntry.address, targetAddress, timestamp)
  return messages
}

const queryAccount = async (handle: string) => {
  let address
  if (handle) address = await getAddress(handle)
  if (address === undefined || address === null) {
    console.log("Account doesn't exist for: ", handle)
    return
  }
  const accountData = await getAccountData(address)
  return accountData
}

const queryProposals = async () => {
  const { proposals } = await getJSON(getProxyUrl('/proposals'))
  return proposals
}

const queryDevProposals = async () => {
  const { devProposals } = await getJSON(getProxyUrl('/proposals/dev'))
  return devProposals
}

const queryLatestProposals = async () => {
  const { proposals } = await getJSON(getProxyUrl('/proposals/latest'))
  return proposals
}

const queryLatestDevProposals = async () => {
  const { devProposals } = await getJSON(getProxyUrl('/proposals/dev/latest'))
  return devProposals
}

const getProposalCount = async (): Promise<number> => {
  const { count } = await getJSON(getProxyUrl('/proposals/count'))
  return count ? count : 0
}

const getDevProposalCount = async (): Promise<number> => {
  const { count } = await getJSON(getProxyUrl('/proposals/dev/count'))
  return count ? count : 0
}

// utils.isTransferTx = (tx) => tx.type === "transfer";
// utils.isProposalTx = (tx) => tx.type === "proposal";
// utils.isDevProposalTx = (tx) => tx.type === "dev_proposal";
// utils.isVoteTx = (tx) => tx.type === "vote";
// utils.isDevVoteTx = (tx) => tx.type === "dev_vote";
// utils.isDevPaymentTx = (tx) => tx.type === "developer_payment";
// utils.isMessageTx = (tx) => tx.type === "message";
// utils.isRegisterTx = (tx) => tx.type === "register";
// // utils.isStakeTx = tx => tx.type === 'stake'
// // utils.isRemoveStakeTx = tx => tx.type === 'remove_stake'
// utils.isDepositStakeTx = (tx) => tx.type === "deposit_stake";
// utils.isWithdrawStakeTx = (tx) => tx.type === "withdraw_stake";
// utils.isRewardTx = (tx) => tx.type === "node_reward";
// utils.isSender = (tx, myAddress) => tx.from === myAddress;
// utils.getTransferType = (tx, myAddress) =>
//   utils.isSender(tx, myAddress) ? "send" : "receive";
// utils.getMessageType = (tx, myAddress) =>
//   utils.isSender(tx, myAddress) ? "send_message" : "receive_message";
// utils.filterByTxType = (txList, type) => {
//   if (type === "transfer") return filter(txList, utils.isTransferTx);
//   else if (type === "proposal") return filter(txList, utils.isProposalTx);
//   else if (type === "dev_proposal")
//     return filter(txList, utils.isDevProposalTx);
//   else if (type === "vote") return filter(txList, utils.isVoteTx);
//   else if (type === "dev_vote") return filter(txList, utils.isDevVoteTx);
//   else if (type === "developer_payment")
//     return filter(txList, utils.isDevPaymentTx);
//   else if (type === "message") return filter(txList, utils.isMessageTx);
//   else if (type === "register") return filter(txList, utils.isRegisterTx);
//   // else if (type === 'stake') return filter(txList, utils.isStakeTx)
//   // else if (type === 'remove_stake') return filter(txList, utils.isRemoveStakeTx)
//   else if (type === "deposit_stake")
//     return filter(txList, utils.isDepositStakeTx);
//   else if (type === "withdraw_stake")
//     return filter(txList, utils.isWithdrawStakeTx);
//   else if (type === "node_reward") return filter(txList, utils.isRewardTx);
// };

const sortByTimestamp = (list: unknown[], direction: string) => {
  if (direction === 'desc') {
    return orderBy(list, ['timestamp'], ['desc'])
  } else {
    return orderBy(list, ['timestamp'], ['asc'])
  }
}

function isIosSafari() {
  var ua = window.navigator.userAgent
  var iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  var webkit = !!ua.match(/WebKit/i)
  var iOSSafari = iOS && webkit && !ua.match(/CriOS/i)
  return iOSSafari
}

const queryParameters = async () => {
  const { parameters, error } = await getJSON(getProxyUrl('/network/parameters'))
  console.log('parameters', parameters)
  if (error) {
    return error
  } else {
    return parameters
  }
}

const queryNodeParameters = async () => {
  const { parameters, error } = await getJSON(getProxyUrl('/network/parameters/node'))
  if (error) {
    return error
  } else {
    return parameters
  }
}

const queryIssues = async () => {
  const { issues } = await getJSON(getProxyUrl('/issues'))
  return issues
}

const queryDevIssues = async () => {
  const { devIssues } = await getJSON(getProxyUrl('/issues/dev'))
  return devIssues
}

const queryLatestIssue = async () => {
  const { issue } = await getJSON(getProxyUrl('/issues/latest'))
  return issue
}

const queryLatestDevIssue = async () => {
  const { devIssue } = await getJSON(getProxyUrl('/issues/dev/latest'))
  return devIssue
}

const getIssueCount = async () => {
  const { count } = await getJSON(getProxyUrl('/issues/count'))
  return count ? count : 0
}

const getDevIssueCount = async () => {
  const { count } = await getJSON(getProxyUrl('/issues/dev/count'))
  // return res.data.devIssueCount
  return count ? count : 0
}

const iosCopyClipboard = (str: string) => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'

  el.contentEditable = true
  el.readOnly = false

  document.body.appendChild(el)
  const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  if (selected) {
    // If a selection existed before copying
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}

const createProposal = async function (source: WalletEntry, newParameters) {
  const issueCount = await getIssueCount()
  const proposalCount = await getProposalCount()

  if (issueCount >= 0 && proposalCount >= 0) {
    const proposalTx = {
      type: 'proposal',
      network,
      from: source.address,
      proposal: crypto.hash(`issue-${issueCount}-proposal-${proposalCount + 1}`),
      issue: crypto.hash(`issue-${issueCount}`),
      parameters: newParameters,
      description: newParameters.description || '',
      timestamp: Date.now(),
    }
    await signObj(proposalTx, source)
    return proposalTx
  } else {
    if (!issueCount) throw new Error('Unable to get issue count')
    else if (!proposalCount) throw new Error('Unable to get proposal count')
  }
}

const createDevProposal = async function (source: WalletEntry, proposal: any) {
  let paymentCount
  let delay

  if (proposal.paymentType === 'multiple') {
    paymentCount = proposal.paymentCount
    delay = proposal.delay
  } else {
    paymentCount = 1
    delay = 0
  }
  console.log(proposal.paymentType, paymentCount, delay)

  const issueCount = await getDevIssueCount()
  const proposalCount = await getDevProposalCount()

  const payments = new Array(paymentCount).fill(1).map((_, i) => ({
    amount: BigInt(1) / BigInt(paymentCount),
    delay: delay * i,
  }))
  console.log('Issue count:', issueCount)
  console.log('Proposal count:', proposalCount)
  if (issueCount >= 0 && proposalCount >= 0) {
    const tx = {
      type: 'dev_proposal',
      network,
      from: source.address,
      devIssue: crypto.hash(`dev-issue-${issueCount}`),
      devProposal: crypto.hash(`dev-issue-${issueCount}-dev-proposal-${proposalCount + 1}`),
      totalAmount: proposal.totalAmount,
      payments: payments,
      description: proposal.description,
      title: proposal.title,
      payAddress: source.address,
      timestamp: Date.now(),
    }
    await signObj(tx, source)
    return tx
  } else {
    if (!issueCount) throw new Error('Unable to get issue count')
    else if (!proposalCount && proposalCount !== 0) {
      throw new Error('Unable to get dev proposal count')
    }
  }
}

const createEmailTx = async (email: string, source: WalletEntry) => {
  const signedTx = {
    emailHash: crypto.hash(email),
    from: source.address,
  }
  await signObj(signedTx, source)
  const tx = {
    type: 'email',
    network,
    signedTx,
    email: email,
    timestamp: Date.now(),
  }
  return tx
}

const createVerifyTx = async (code: string, source: WalletEntry) => {
  const tx = {
    type: 'verify',
    network,
    from: source.address,
    code: code,
    timestamp: Date.now(),
  }
  await signObj(tx, source)
  return tx
}

const registerEmail = async (email: string, source: WalletEntry) => {
  const tx = await createEmailTx(email, source)
  return new Promise((resolve, reject) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

const verifyEmail = async (code: string, source: WalletEntry) => {
  const tx = await createVerifyTx(code, source)
  return new Promise((resolve, reject) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

const getDifferentParameter = async (newParameters: any, currentParameters: any) => {
  const obj = {}
  const excludeKeys = ['hash', 'id', 'timestamp']
  for (const key in newParameters) {
    if (excludeKeys.indexOf(key) >= 0) continue
    if (currentParameters[key] && currentParameters[key] !== newParameters[key]) {
      obj[key] = newParameters[key]
    }
  }
  return obj
}

const submitProposl = async (tx: unknown) => {
  return new Promise((resolve, reject) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

const createVote = async (source: WalletEntry, proposalNumber = 1, approve = true, amount = 50) => {
  const issueCount = await getIssueCount()
  // const proposalCount = await const getProposalCount()
  const tx = {
    type: 'vote',
    network,
    from: source.address,
    issue: crypto.hash(`issue-${issueCount}`),
    proposal: crypto.hash(`issue-${issueCount}-proposal-${proposalNumber}`),
    approve: approve,
    amount: BigInt(amount),
    timestamp: Date.now(),
  }
  await signObj(tx, source)
  return tx
}

const createDevVote = async (source: WalletEntry, proposalNumber = 1, amount = 50, approve = true) => {
  const devIssueCount = await getDevIssueCount()
  const tx = {
    type: 'dev_vote',
    network,
    from: source.address,
    devIssue: crypto.hash(`dev-issue-${devIssueCount}`),
    devProposal: crypto.hash(`dev-issue-${devIssueCount}-dev-proposal-${proposalNumber}`),
    amount: BigInt(amount),
    approve,
    timestamp: Date.now(),
  }
  await signObj(tx, source)
  return tx
}

const submitVote = async (tx: unknown) => {
  return new Promise((resolve, reject) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

const fallbackCopyTextToClipboard = (text: string) => {
  var textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}

export const copyTextToClipboard = (text: string) => {
  if (!navigator.clipboard) {
    console.log("Navigator.clipboard doesn't exist")
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!')
    },
    function (err) {
      console.error('Async: Could not copy text: ', err)
    }
  )
}

const copyToClipboard = (text: string) => {
  console.log(`is IOS Safari ${isIosSafari()}`)
  if (isIosSafari()) {
    iosCopyClipboard(text)
    return
  }
  return copyTextToClipboard(text)
}

const transferTokens = async (tgtHandle: string, amount: number, keys: WalletEntry) => {
  const targetAddress = await getAddress(tgtHandle)
  const parameters = await queryParameters()
  const tx = {
    type: 'transfer',
    from: keys.address,
    to: targetAddress,
    amount: BigInt(amount),
    timestamp: Date.now(),
    network,
    fee: parameters.current.transactionFee || BigInt(1),
  }
  await signObj(tx, keys)
  console.log(tx)
  return new Promise((resolve) => {
    injectTx(tx).then((res) => {
      console.log(res)
      if (res.result.success) resolve(true)
      else resolve(false)
    })
  })
}

const playSoundFile = (soundFile: string) => {
  // eslint-disable-next-line no-undef
  const audio = new Audio(soundFile)
  audio.play()
}

const updateBadge = (tabName: string, type: string) => {
  try {
    const badgeElementList = document.querySelectorAll('.tabbar__badge.notification')
    if (tabName === 'home') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[0].innerHTML || 0)
        badgeElementList[0].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[0].innerHTML = ''
      }
    } else if (tabName === 'message') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[1].innerHTML || 0)
        badgeElementList[1].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[1].innerHTML = ''
      }
    } else if (tabName === 'funding') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[2].innerHTML || 0)
        badgeElementList[2].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[2].innerHTML = ''
      }
    } else if (tabName === 'economy') {
      if (type === 'increase') {
        const currentBadgeCount = parseInt(badgeElementList[3].innerHTML || 0)
        badgeElementList[3].innerHTML = currentBadgeCount + 1
      } else if (type === 'reset') {
        badgeElementList[3].innerHTML = ''
      }
    }
  } catch (e) {}
}

const queryEncryptedChats = async (chatId: string) => {
  try {
    const res = await axios.get(getProxyUrl(`/messages/${chatId}`))
    console.log(res.data)
    return res.data.messages.map((m: string) => crypto.safeJsonParse(m))
  } catch (e) {
    return []
  }
}

const isInitiator = (myAddress: string, otherPersonAddress: string) => {
  console.log('isInitiator', myAddress, otherPersonAddress)
  if (!myAddress || !otherPersonAddress) throw new Error('Invalid address in isInitiator')
  if (myAddress.length === 0 || otherPersonAddress.length === 0)
    throw new Error('Invalid address length in isInitiator')
  const isInitiator = [myAddress, otherPersonAddress].sort()[0] === myAddress
  console.log(`isInitiator: ${isInitiator}`)
  return isInitiator
}

const calculateWholeCycleDuration = function (window: any, devWindow: any) {
  if (window.proposalWindow && devWindow.devApplyWindow) {
    return devWindow.devApplyWindow[1] - window.proposalWindow[0]
  } else {
    return 1000 * 60 * 7
  }
}

const isNodeOnline = async function () {
  try {
    const res = await axios.get(getProxyUrl('/issues/count'))
    if (res.status === 200) return true
  } catch (e) {
    console.warn(e.message)
    if (e.message === 'Network Error') return false
  }
}

const bytesArrayToHex = function (bytesArray: Uint8Array) {
  return bytesArray.reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
}

const aliasId = function (handle: string) {
  return crypto.hash(handle)
}
