/**
 * autopayout.js
 *  
 * Claim and distribute validator staking rewards for your stakers in Kusama Network
 *
 * https://github.com/jimiflowers/kusama-validator-auto-payout
 * 
 * Author: Mario Pino | @mariopino:matrix.org
 *
 * Adapted by: Jimi Flowers | @polkaflow:matrix.org
 *
 */

const BigNumber = require('bignumber.js');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const keyring = require('@polkadot/ui-keyring').default;
keyring.initKeyring({
  isDevelopment: false,
});
const fs = require('fs');
const prompts = require('prompts');
const yargs = require('yargs');
const config = require('./config_multi.js');

const argv = yargs
  .scriptName("autopayout.js")
  .option('account', {
    alias: 'a',
    description: 'Account json file path',
    type: 'string',
  })
  .option('password', {
      alias: 'p',
      description: 'Account password, or stdin if this is not set',
      type: 'string',
  })
  .option('log', {
    alias: 'l',
    description: 'log (append) to autopayout.log file',
    type: 'boolean',
  })
  .usage("node autopayout.js -c keystores/account.json -p password -v validator_stash_address")
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'V')
  .argv;

// Exported account json file param
const accountJSON = argv.account || config.accountJSON;

// Password param
let password = argv.password || "j4im3fl0";

// Logging to file param
const log = argv.log || config.log;

// Node websocket
const wsProvider = config.nodeWS;

const main = async () => {

  console.log("\n\x1b[45m\x1b[1m kusama validator auto payout \x1b[0m\n");
  console.log("\x1b[1m - Check source at https://github.com/FlowerStake/kusama-validator-auto-payout\x1b[0m");
  console.log("\x1b[32m\x1b[1m - Made with love from ColmenaLabs_SVQ https://colmenalabs.org/\x1b[0m\n");
  console.log("\x1b[32m\x1b[1m - Adapted to Kusama Network by Jimi Flowers https://flowerstake.io/\x1b[0m\n");

  let raw;
  try {
    raw = fs.readFileSync(accountJSON, { encoding: 'utf-8' });
  } catch(err) {
    console.log(`\x1b[31m\x1b[1mError! Can't open ${accountJSON}\x1b[0m\n`);
    process.exit(1);
  }

  const account = JSON.parse(raw);
  const address = account.address;
  
  // Prompt user to enter password
  if (!password) {
    const response = await prompts({
      type: 'password',
      name: 'password',
      message: `Enter password for ${address}:`
    });
    password = response.password;
  }

  if (password) {
    console.log(`\x1b[1m -> Importing account\x1b[0m`, address);
    const signer = keyring.restoreAccount(account, password); 
    signer.decodePkcs8(password);

    // Connect to node
    console.log(`\x1b[1m -> Connecting to\x1b[0m`, wsProvider);
    const provider = new WsProvider(wsProvider);
    const api = await ApiPromise.create({ provider });

    // Check account balance
    const accountBalance = await api.derive.balances.all(address);
    const availableBalance = accountBalance.availableBalance;
    if (availableBalance.eq(0)) {
      console.log(`\x1b[31m\x1b[1mError! Account ${address} doesn't have available funds\x1b[0m\n`);
      process.exit(1);
    }
    console.log(`\x1b[1m -> Account ${address} available balance is \x1b[0m\x1b[1;32m${availableBalance.toHuman()}\x1b[0m`);

    // Get session progress info
    const chainActiveEra = await api.query.staking.activeEra();
    const activeEra = JSON.parse(JSON.stringify(chainActiveEra)).index;
    console.log(`\x1b[1m -> Active era is \x1b[0m\x1b[1;32m${activeEra}\x1b[0m`);
    let transactions = [];
    let unclaimedRewards = {};

    for (let index = 0; index < config.validators.length; index++) {
      const validator_address = config.validators[index][0];
      const validator_name = config.validators[index][1];
      unclaimedRewards[validator_name] = [];
      let era = activeEra > 84 ? activeEra - 84 : 0;
      const stakingInfo = await api.derive.staking.account(validator_address);

      let active = 0;
      let procesed = 0;

      for (era; era < activeEra; era++) {
          overview = await api.query.staking.erasStakersOverview(era, validator_address);
          if (overview !== null && overview.isSome) {
             active = overview.unwrap().pageCount;
             if ( active ) {
                procesed = (await api.query.staking.claimedRewards(era, validator_address)).length
                   if ( procesed == 0 ) {
                      transactions.push(api.tx.staking.payoutStakers(validator_address, era));
                      unclaimedRewards[validator_name].push(era);
                   } // Else, it was already procesed
             }
          } // Else, it wasn't active in this era
      }

      console.log(`\n\x1b[1m -> Unclaimed eras for \x1b[44m\x1b[1;33m${validator_name}\x1b[0m\x1b[1m: \x1b[0m\x1b[1;33m${unclaimedRewards[validator_name].length}\x1b[0m\x1b[1;31m ${JSON.stringify(unclaimedRewards[validator_name])}\x1b[0m`);

    }

    for (let index = 0; index < config.validators.length; index++) {
         const validator_address = config.validators[index][0];
	 const validator_name = config.validators[index][1];
         const date = new Date();
         const year = date.getFullYear();
         const month = date.getMonth() + 1;
         const day = date.getDate();
         const hours = date.getHours();
         const minutes = date.getMinutes();
         const seconds = date.getSeconds();
         const date_string = year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds;
	 if (unclaimedRewards[validator_name].length > 0) {
            var nonce = await api.rpc.system.accountNextIndex(address);
            let blockHash = [];
            let extrinsicHash = [];
            let extrinsicStatus = null;
	    let totalEras = "";

	    for (let index = 0; index < unclaimedRewards.length; index++) {
	       totalEras += unclaimedRewards[index] + ",";
	    }

	    totalEras = totalEras.slice(0, -1);

	    console.log(`\x1b[1m -> Processing Payout for Eras: \x1b[0m\x1b[1;33m${totalEras}\x1b[0m`);

	    await api.tx.utility.batch(transactions)
	            .signAndSend(signer, ({status}) => {
        	        if (status.isInBlock) {
                	   console.log(`\x1b[1m -> Transaction included in block: ${status.asInBlock}:`);
	       		}
	    });

	    console.log(`\t\x1b[1;32mPayout Success!\x1b[0m\n`);

	 } else {

            console.log(`\n\x1b[1;33m\x1b[1mWarning! There are no unclaimed rewards for \x1b[0m\x1b[1;33m\x1b[41m${validator_name}!\x1b[0m\n`);

         }

    }

    process.exit(0);

  }

}

try {
  main();
} catch (error) {
  console.error(error);
}
