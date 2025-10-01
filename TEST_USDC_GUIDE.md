# Getting Test USDC on Base Sepolia

Quick guide to getting test USDC for testing Flip Battle.

## 🪙 Method 1: Circle Faucet (Recommended)

Circle provides a faucet for Base Sepolia USDC.

### Steps:
1. Visit: https://faucet.circle.com/
2. Select **Base Sepolia** network
3. Connect your wallet
4. Request USDC (usually 10-100 USDC per request)
5. Wait for confirmation

**Note**: May have daily limits or require verification.

---

## 💱 Method 2: Swap ETH for USDC

Use a Base Sepolia DEX to swap test ETH for USDC.

### Option A: Uniswap (if available on Sepolia)
1. Visit Uniswap on Base Sepolia
2. Connect wallet
3. Swap ETH → USDC
4. Use small amounts (0.01-0.1 ETH)

### Option B: Base Sepolia DEX Aggregators
Check for DEX aggregators that support Base Sepolia:
- 1inch (if supported)
- ParaSwap (if supported)
- Matcha (if supported)

---

## 🔧 Method 3: Manual USDC Contract Interaction

If Base Sepolia USDC has a public mint function (test tokens often do):

### Steps:
1. Go to BaseScan: https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e
2. Click **"Write Contract"**
3. Connect your wallet
4. Look for a `mint()` or `faucet()` function
5. Call with your address and amount
6. Confirm transaction

**Note**: Not all USDC contracts on testnet have public mint functions.

---

## 🌉 Method 4: Bridge from Another Testnet

If you have USDC on another testnet:

1. Use a testnet bridge (if available)
2. Bridge USDC from Ethereum Sepolia → Base Sepolia
3. Or from another L2 testnet to Base Sepolia

**Popular Testnet Bridges**:
- Base official bridge: https://bridge.base.org/
- Superbridge: https://superbridge.app

---

## 🤝 Method 5: Ask in Discord

Base and Chainlink communities are helpful:

### Base Discord:
1. Join: https://discord.gg/buildonbase
2. Go to #faucet or #dev-support
3. Ask for Base Sepolia USDC
4. Provide your wallet address

### Chainlink Discord:
1. Join: https://discord.gg/chainlink
2. Go to #developer-support
3. Ask for help getting testnet USDC

---

## 📋 Base Sepolia USDC Contract

**Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

**Decimals**: 6 (1 USDC = 1,000,000)

**Add to Wallet**:
```
Token Address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
Symbol: USDC
Decimals: 6
```

---

## ✅ Verify You Have USDC

After getting USDC:

1. Check balance on BaseScan:
   - https://sepolia.basescan.org/address/[YOUR_ADDRESS]
   - Look for USDC token balance

2. Check in wallet:
   - Add token to MetaMask/Coinbase Wallet
   - Should show USDC balance

3. Test with frontend:
   - Connect wallet to Flip Battle
   - Should show USDC balance in stats

---

## 🎯 How Much USDC Do You Need?

For thorough testing:

- **Minimum**: 10 USDC (a few test flips)
- **Recommended**: 50 USDC (comprehensive testing)
- **Ideal**: 100+ USDC (stress testing, large bets)

Remember: This is **testnet USDC** - it has no real value!

---

## 🚨 Troubleshooting

### "Can't find Base Sepolia USDC faucet"
Try:
1. Circle faucet (recommended)
2. Ask in Discord
3. Check Base documentation for official faucets

### "Faucet says 'already claimed'"
- Wait 24 hours (most faucets have daily limits)
- Try from a different wallet
- Use swap method instead

### "Transaction failed when minting"
- Contract may not have public mint
- Try a different method
- Ask in Discord for help

### "Don't see USDC in wallet"
- Add token manually (address above)
- Check on BaseScan first
- May take a few seconds to appear

---

## 💡 Pro Tips

1. **Get USDC for both test wallets** (Wallet A and B)
2. **Get more than you think you need** (test multiple scenarios)
3. **Save some ETH** for gas fees
4. **Don't lose testnet private keys** (annoying to get new USDC)

---

## 🔗 Useful Links

- **Base Sepolia Faucet (ETH)**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- **Circle USDC Faucet**: https://faucet.circle.com/
- **BaseScan (Sepolia)**: https://sepolia.basescan.org
- **Base Discord**: https://discord.gg/buildonbase
- **Base Bridge**: https://bridge.base.org/

---

## 📞 Still Need Help?

If you can't get test USDC:

1. Check Base documentation: https://docs.base.org
2. Ask in Base Discord: https://discord.gg/buildonbase
3. Check Circle's official faucet documentation
4. Reach out to the Flip Battle team

Good luck! 🪙
