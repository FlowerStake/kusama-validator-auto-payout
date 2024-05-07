# Kusama Network validator auto payout

Claim and distribute validator staking rewards for your stakers automagically in Kusama Network Substrate blockchain.

Made with ❤️  from ColmenaLabs_SVQ! Adapted with all current changes to Kusama Network by Jimi Flowers (https://flowerstake.io)

## Install NodeJS, clone repo and install modules

Needs nodejs (>= v10.20.1), check https://nodejs.org/en/download/ to install for your platform.

Clone the repository and install the needed dependencies:

```
git clone https://github.com/FlowerStake/kusama-validator-auto-payout.git
cd kusama-validator-auto-payout
yarn
```

## Add KeyStore (JSON Account File)

Go to [Polkadot JS UI](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frockx-ksm.w3node.com%2Fpolka-public-ksm%2Fws#/accounts) and export the account you want to use to json format, then copy the json file/s in the `keystores` folder.

## Usage

Using parameters:

```
node autopayout.js -a keystores/account.json -p password -v validator_stash_address
```

Ask for password:

```
node autopayout.js -a keystores/account.json -v validator_stash_address
```

Or simply edit `config.js` with your data and run without any parameter (cron friendly):

```
node autopayout.js
```
Example output:

```
 Kusama Network auto payout

 - Check source at https://github.com/FlowerStake/kusama-validator-auto-payout

 - Made with love from ColmenaLabs_SVQ https://colmenalabs.org/

 - Adapted to Kusama Network by Jimi Flowers https://flowerstake.io/

 -> Validator stash address is CDo1enKQhb7EXYh91yfANuxRS7VdEfuHb8SxQRvw173jpPd
 -> Importing account CzHmfKgk9W5QBidVndsbhXQ2PvfUDu1YKuizqfDP7j3y
 -> Connecting to wss://testnet-rpc.kusama.tools
 -> Account CzHmfKgk9W5QBidVndsbhXQ2PvfUDu1YKuizqfDP7j3y free balance is 10.58 KSM
 -> Current era is 730
 -> Unclaimed eras: [720,729]
 -> Paying Eras: 720, 729
         Payout Success!

```


NOTE: Set `config.js` file permissions to `600` for better security.

TODO: It doesn't take in account ongoing elections yet!

## Using multiple validators

Use `validators` array in `config_multiple.js` to add the stash address and name of your validators, then:

```
node autopayout-validators.js
```
