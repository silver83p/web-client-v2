import * as secp from "./libs/noble-secp256k1.js";
import keccak from "./libs/keccak256.js";
import blake from "./libs/blake2b.js";
import { safeStringify, safeJsonParse } from "./libs/stringify-fastest.js";

const myHashKey = hex2bin(
  "69fa4195670576c0160d660c3be36556ff8d504725be8a59b5a96509e0c994bc"
);

const networkAddress = '0'.repeat(64);

const LIB_RRC_METHODS = {
  SEND_TRANSACTION: "lib_sendTransaction",
  GET_ACCOUNT: "lib_getAccount",
  GET_TRANSACTION_RECEIPT: "lib_getTransactionReceipt",
  GET_TRANSACTION_HISTORY: "lib_getTransactionHistory",
  GET_MESSAGES: "lib_getMessages",
  SUBSCRIBE: "lib_subscribe",
  UNSUBSCRIBE: "lib_unsubscribe",
};

async function getAddress(username) {
  // Get random gateway
  const randomGateway =
    network.gateways[Math.floor(Math.random() * network.gateways.length)];
  const usernameBytes = utf82bin(username);
  const usernameHash = blake.blake2bHex(usernameBytes, myHashKey, 32);
  try {
    const response = await fetch(
      `http://${randomGateway.host}:${randomGateway.port}/address/${usernameHash}`
    );
    const data = await response.json();
    return data.address;
  } catch (error) {
    console.error("Error getting address:", error);
    return null; // Assume available if request fails
  }
}

async function getAccountData(address) {
  // Get random gateway
  const randomGateway =
    network.gateways[Math.floor(Math.random() * network.gateways.length)];
  try {
    const response = await fetch(
      `http://${randomGateway.host}:${randomGateway.port}/account/${address}`
    );
    const data = await response.json();
    if (data.account) {
      const account = safeJsonParse(safeStringify(data.account));
      console.log("account", account);
      return account;
    }
    return data.account;
  } catch (error) {
    console.error("Error getting account:", error);
    return null; // Assume available if request fails
  }
}

async function handleUsernameAvailability(username) {
  // Get existing wallets
  const { netid } = network;
  const existingWallets = JSON.parse(
    localStorage.getItem("wallets") || '{"netids":{}}'
  );
  const netidWallets = existingWallets.netids[netid];

  // Check if username exists in local wallet
  if (netidWallets?.usernames?.[username]) {
    const address = await getAddress(username);
    console.log("address", address);
    if (!address) {
      return {
        taken: false,
        localWallet: true,
        error:
          "Username wallet is found in local wallet, but the account does not exist on the network",
      };
    }

    if (
      address !==
      toShardusAddress(netidWallets.usernames[username].keys.address)
    ) {
      return {
        taken: true,
        localWallet: true,
        error:
          "Username wallet is found in local wallet, but the local address does not match the network address",
      };
    }
    return {
      taken: true,
      localWallet: true,
    };
  }

  // Check if username exists on network
  // If we get an address back, username is taken
  const address = await getAddress(username);
  if (address) {
    return {
      taken: true,
      localWallet: false,
    };
  } else {
    return {
      taken: false,
      localWallet: false,
    };
  }
}

async function handleSignIn(username, privateKey) {
  const { netid } = network;
  // Get existing wallets or create new structure
  const existingWallets = JSON.parse(
    localStorage.getItem("wallets") || '{"netids":{}}'
  );

  console.log("existingWallets", existingWallets);

  // Ensure netid and usernames objects exist
  if (!existingWallets.netids[netid]) {
    existingWallets.netids[netid] = { usernames: {} };
  }

  let myWallet;

  // Check if username already exists
  if (existingWallets.netids[netid].usernames[username]) {
    // Use existing wallet
    myWallet = existingWallets.netids[netid].usernames[username];
    console.log("myWallet", myWallet);
    initializeAccountState(myWallet.keys.address);
    await updateAccountStateData(myWallet.keys.address);
    return { success: true, existingWallet: true };
  } else if (privateKey) {
    // Use imported private key
    const keys = deriveKeys(hex2bin(privateKey));
    const { addressHex, publicKeyHex, privateKeyHex } = keys;
    myWallet = {
      netid,
      username,
      keys: {
        address: toEthereumAddress(addressHex),
        public: publicKeyHex,
        secret: privateKeyHex,
      },
    };
    console.log("myWallet", myWallet);
  } else {
    // Generate new key pair using secp256k1
    const privateKey = secp.utils.randomPrivateKey();
    const keys = deriveKeys(privateKey);
    if (!keys) {
      return {
        success: false,
        error: "Error generating keys. Please try again.",
      };
    }
    const { addressHex, publicKeyHex, privateKeyHex } = keys;
    // Create new wallet entry
    myWallet = {
      netid,
      username,
      keys: {
        address: toEthereumAddress(addressHex),
        public: publicKeyHex,
        secret: privateKeyHex,
      },
    };
    console.log("myWallet", myWallet);
  }
  const res = await submitRegisterAlias(username, myWallet.keys);
  console.log("response", res);

  if (!res || res.error || !res.result.success) {
    return {
      success: false,
      error: !res ? "Unknown error" : res.error ? res.error : res.result.error,
    };
  }

  // Check if username exists on network
  const { success: isAccountCreated, address } =
    await checkAccountCreation(username);
  if (isAccountCreated) {
    if (address === toShardusAddress(myWallet.keys.address)) {
      existingWallets.netids[netid].usernames[username] = myWallet;
      localStorage.setItem("wallets", JSON.stringify(existingWallets));
      initializeAccountState(myWallet.keys.address);
      await updateAccountStateData(myWallet.keys.address);
      return { success: true, existingWallet: false };
    } else {
      return {
        success: false,
        error:
          "Account creation failed with the specified username. Please try again.",
      };
    }
  } else {
    return {
      success: false,
      error: "Error creating account. Please try again.",
    };
  }
}

const handleImportAccount = async (pk) => {
  const privateKey = hex2bin(pk);
  const keys = deriveKeys(privateKey);
  if (!keys) {
    return {
      success: false,
      error: "Failed to import private key. Please try again.",
    };
  }
  const { addressHex, publicKeyHex, privateKeyHex } = keys;
  const account = await getAccountData(toShardusAddress(addressHex));
  console.log("account", account);
  if (!account || !account.alias) {
    return {
      success: true,
      newAccount: true,
    };
  }

  const username = account.alias;
  const { netid } = network;
  // Get existing wallets or create new structure
  const existingWallets = JSON.parse(
    localStorage.getItem("wallets") || '{"netids":{}}'
  );

  console.log("existingWallets", existingWallets);

  // Ensure netid and usernames objects exist
  if (!existingWallets.netids[netid]) {
    existingWallets.netids[netid] = { usernames: {} };
  }

  const myWallet = {
    netid,
    username,
    keys: {
      address: toEthereumAddress(addressHex),
      public: publicKeyHex,
      secret: privateKeyHex,
    },
  };

  existingWallets.netids[netid].usernames[username] = myWallet;
  localStorage.setItem("wallets", JSON.stringify(existingWallets));
  initializeAccountState(myWallet.keys.address);
  await updateAccountStateData(myWallet.keys.address);
  return { success: true, newAccount: false };
};

const deriveKeys = (privateKey) => {
  try {
    const privateKeyHex = bin2hex(privateKey); // Array.from(privateKey).map(b => b.toString(16).padStart(2, '0')).join('');

    // Generate uncompressed and compressed public key using secp256k1
    // Uncompressed is hashed to produce address; compressed is uses for storing to save space
    const publicKey = secp.getPublicKey(privateKey, false); // setting second arg to false for uncompressed
    const publicKeyHex = bin2hex(publicKey); // Array.from(publicKey).map(b => b.toString(16).padStart(2, '0')).join('');

    console.log("publicKeyHex", publicKeyHex);

    // Generate compressed public key
    const compressedPublicKey = secp.getPublicKey(privateKey, true); // setting second arg to true for compressed
    const compressedPublicKeyHex = bin2hex(compressedPublicKey);
    console.log("compressedPublicKeyHex", compressedPublicKeyHex);

    // Generate address from public key (take last 40 chars of keccak256 hash)
    const address = keccak(publicKey.slice(1)).slice(-20);
    const addressHex = bin2hex(address); // Array.from(address).map(b => b.toString(16).padStart(2, '0')).join('');

    return { addressHex, publicKeyHex, privateKeyHex };
  } catch (error) {
    console.error("Failed to derive keys", error);
    return null;
  }
};

const updateAccountStateData = async (address) => {
  console.log("updateAccountStateData", address);

  if (state.getState().currentAddress && !state.getState().wallet.keys) {
    initializeAccountState(address);
  }
  const account = await getAccountData(toShardusAddress(address));
  const networkParams = await getAccountData(networkAddress);
  console.log("networkParams", networkParams);
  state.updateState({
    wallet: {
      balance: account.data.balance,
      assets: [
        {
          id: "liberdus",
          name: "Liberdus",
          symbol: "LIB",
          img: "images/lib.png",
          chainid: 2220,
          contract: "",
          price: 0.032,
          balance: account.data.balance,
          addresses: [
            {
              address,
              balance: 0,
              history: [],
            },
          ],
        },
      ],
      keys: state.getState().wallet.keys,
    },
    networkParams
  });
};

const initializeAccountState = async (address) => {
  console.log("initializeAccountState", address);
  // Get existing wallets
  const { netid } = network;
  const existingWallets = JSON.parse(
    localStorage.getItem("wallets") || '{"netids":{}}'
  );
  const netidWallets = existingWallets.netids[netid];

  if (!netidWallets) return;

  const myWallet = Object.values(netidWallets.usernames).find(
    (wallet) => wallet.keys.address === address
  );

  const username = myWallet.username;
  state.updateState({
    currentAddress: myWallet.keys.address,
    account: {
      name: username,
    },
    wallet: {
      keys: {
        [myWallet.keys.address]: {
          public: myWallet.keys.public,
          secret: myWallet.keys.secret,
          type: "secp256k1",
        },
      },
    },
  });
};

const checkAccountCreation = async (username) => {
  console.log("checkAccountCreation", username);
  let retries = 0;
  const maxRetries = 20;
  let created = false;
  let address = null;

  while (retries < maxRetries) {
    address = await getAddress(username);
    console.log(retries, address);
    if (address === undefined || address === null) {
      created = false;
    } else {
      created = true;
    }
    if (created) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    retries++;
  }

  return {
    success: created,
    address,
  };
};

const toShardusAddress = (addressStr) => {
  //  change this: 0x665eab3be2472e83e3100b4233952a16eed20c76
  //  to this: 665eab3be2472e83e3100b4233952a16eed20c76000000000000000000000000
  return addressStr.slice(2).toLowerCase() + "0".repeat(24);
};

export const toEthereumAddress = (addressStr) => {
  //  change this: 665eab3be2472e83e3100b4233952a16eed20c76000000000000000000000000
  //  to this: 0x665eab3be2472e83e3100b4233952a16eed20c76
  return "0x" + addressStr.slice(0, 40);
};

async function submitRegisterAlias(alias, keys) {
  const aliasBytes = utf82bin(alias);
  const aliasHash = blake.blake2bHex(aliasBytes, myHashKey, 32);
  const tx = {
    type: "register",
    aliasHash: aliasHash,
    from: toShardusAddress(keys.address),
    alias: alias,
    publicKey: keys.public,
    timestamp: Date.now(),
  };
  console.log("tx", tx);
  const res = await injectTx(tx, keys);
  return res;
}

async function injectTx(tx, keys) {
  const txid = await signObj(tx, keys); // add the sign obj to tx
  // Get random gateway
  const randomGateway =
    network.gateways[Math.floor(Math.random() * network.gateways.length)];
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tx: safeStringify(tx) }),
    // mode: 'no-cors',
  };
  console.log("options", options);
  try {
    const response = await fetch(
      `http://${randomGateway.host}:${randomGateway.port}/inject`,
      options
    );
    console.log("response", response);
    const data = await response.json();
    data.txid = txid;
    console.log("response", data);
    return data;
  } catch (error) {
    console.error("Error injecting tx:", error, tx);
    return error; // Assume available if request fails
  }
}

async function signObj(tx, keys) {
  console.log("keys", keys);
  const jstr = safeStringify(tx);
  console.log("jstr", jstr);
  const jstrBytes = utf82bin(jstr);
  const txHash = blake.blake2bHex(jstrBytes, myHashKey, 32);
  console.log("txHash", txHash);
  const message = ethHashMessage(txHash);
  console.log("txidHashHex", bin2hex(message));
  const sig = await secp.signAsync(message, hex2bin(keys.secret));
  console.log("sig", sig);
  const r = sig.r.toString(16).padStart(64, "0");
  const s = sig.s.toString(16).padStart(64, "0");
  // Convert recovery to hex and append (27 + recovery)
  const v = (27 + sig.recovery).toString(16).padStart(2, "0");
  // Concatenate everything with 0x prefix
  const flatSignature = `0x${r}${s}${v}`;
  console.log("flatsig", flatSignature);
  tx.sign = {
    owner: tx.from,
    sig: flatSignature,
  };
  console.log("sign", tx.sign);
}

function bin2hex(bin) {
  return Array.from(bin)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function hex2bin(hex) {
  return new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}
function utf82bin(str) {
  return blake.utf8ToBytes(str);
}

// Based on what ethers.js is doing in the following code
// hashMessage() https://github.com/ethers-io/ethers.js/blob/22c081e1cd617b43d267fd4b29cd92ada5fc7e43/src.ts/hash/message.ts#L35
// concat() https://github.com/ethers-io/ethers.js/blob/22c081e1cd617b43d267fd4b29cd92ada5fc7e43/src.ts/utils/data.ts#L116
// MessagePrefix https://github.com/ethers-io/ethers.js/blob/22c081e1cd617b43d267fd4b29cd92ada5fc7e43/src.ts/constants/strings.ts#L16
// input message can be string or binary; output is binary; binary means Uint8Array
function ethHashMessage(message) {
  if (typeof message === "string") {
    message = utf82bin(message);
  }
  const MessagePrefix = "\x19Ethereum Signed Message:\n";
  const str =
    // "0x" +
    bin2hex(utf82bin(MessagePrefix)) +
    bin2hex(utf82bin(String(message.length))) +
    bin2hex(message);
  // return keccak(utf82bin(str));
  return keccak(hex2bin(str));
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 7) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = now.getFullYear();

    return currentYear === year ? `${month} ${day}` : `${month} ${day} ${year}`;
  } else if (days > 0) {
    return days === 1 ? "Yesterday" : `${days} days ago`;
  } else {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

async function handleTransferTransaction(targetAddress, amount) {
  const keys = state.getState().wallet.keys[state.getState().currentAddress];
  console.log("keys", keys);
  const fee = state.getState().networkParams.current.transactionFee
  const tx = {
    type: "transfer",
    from: toShardusAddress(state.getState().currentAddress),
    to: targetAddress,
    amount: BigInt(amount),
    timestamp: Date.now(),
    network,
    fee,
  }
  console.log("tx", tx);
  const res = await injectTx(tx, keys);
  if (!res || res.error || !res.result.success) {
    return {
      success: false,
      error: !res ? "Unknown error" : res.error ? res.error : res.result.error,
    };
  }

  // Check balance change
  const { success, result, error } = await checkBalanceChange(
    state.getState().currentAddress);
  console.log("checkBalanceChange", success, result, error);
  return { success, error, result };
}

async function checkBalanceChange(address) {
  console.log("checkBalanceChange", address);
  let retries = 0;
  const maxRetries = 20;
  let success = false;
  let result = null;

  // Get initial balance from current state
  const beforeBalance = state.getState().wallet.balance;
  let afterBalance = beforeBalance;

  while (retries < maxRetries) {
    // Fetch latest account data
    const account = await getAccountData(toShardusAddress(address));
    console.log("Balance check attempt", retries, account);

    if (account && account.data) {
      afterBalance = account.data.balance;
    }

    // Check if balance has changed
    if (afterBalance !== beforeBalance) {
      success = true;
      result = "The coin is sent successfully!";
      break;
    }

    // Wait before next retry
    await new Promise((resolve) => setTimeout(resolve, 500));
    retries++;
  }

  return {
    success,
    result,
    error: !success ? "The account balance has not changed!" : null,
  };
}

async function verifyUser(username) {
  // Check if username exists on network
  // If we get an address back, username is taken
  const address = await getAddress(username);
  if (address) {
    return {
      isUserFound: true,
      address: address,
    };
  }
  return {
    isUserFound: false,
  };
}

async function makeJsonRpcRequest(method, params = []) {
  const { rpc_server } = network;

  const requestBody = {
    jsonrpc: "2.0",
    method,
    params,
    id: 1,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  };

  try {
    const response = await fetch(
      `http://${rpc_server.host}:${rpc_server.port}`,
      options
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error("RPC Error:", method, data.error);
      throw new Error(data.error.message || "Unknown RPC error");
    }

    console.log("RPC Result:", method, data.result);
    return data.result;
  } catch (error) {
    console.error("RPC Request failed:", method, error);
    throw new Error(`RPC Request Error: ${error.message}`);
  }
}

window.AppActions = {
  handleSignIn,
  handleUsernameAvailability,
  handleImportAccount,
  verifyUser,
  handleTransferTransaction,
};

window.AppUtils = {
  formatTime,
  toShardusAddress,
  toEthereumAddress,
  updateAccountStateData,
};
