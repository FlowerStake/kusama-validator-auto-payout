module.exports = {
  nodeWS: 'wss://kusama-rpc.polkadot.io',
  denom: 'KSM',
  decimalPlaces: 12,
  validator: '', //THE VALIDATOR STASH ADDRESS YOU ARE CLAIMING REWARDS
  password: '', //THE PASSWORD OF THE KEYSTORE ACCOUNT
  accountJSON: './keystores/account.json', //JSON ACCOUNT FILE EXPORTED FROM PolkadotJS Extension
  log: true,
}
