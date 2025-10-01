# 🚀 Flip Battle - Quick Start Guide

Get Flip Battle deployed in under 2 hours.

---

## 📋 What You Need (5 minutes)

### Required
- [ ] Wallet with Base Sepolia ETH (0.1+ ETH)
  - Get from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
- [ ] WalletConnect Project ID
  - Get from: https://cloud.walletconnect.com

### For Deployment
- [ ] Chainlink VRF Subscription (with 2+ LINK)
  - Create at: https://vrf.chain.link
- [ ] BaseScan API Key
  - Get from: https://basescan.org/myapikey
- [ ] Wallet Private Key (export from MetaMask)

---

## ⚡ Deploy in 3 Commands

### 1. Deploy Smart Contracts (5 minutes)

```bash
cd contracts
./deploy-sepolia.sh
```

**Enter when prompted**:
- Private key (hidden input)
- VRF Subscription ID
- BaseScan API key

**Save the output**: Contract addresses!

### 2. Add VRF Consumers (2 minutes)

Go to https://vrf.chain.link and add:
- FlipBattle address
- DailyFreeFlip address

### 3. Deploy Frontend (3 minutes)

Update Vercel environment variables:
```bash
NEXT_PUBLIC_FLIP_BATTLE_ADDRESS=0x...
NEXT_PUBLIC_STREAK_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REFERRAL_SYSTEM_ADDRESS=0x...
NEXT_PUBLIC_DAILY_FREE_FLIP_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

Then deploy:
```bash
cd apps/web
vercel --prod
```

---

## ✅ You're Live!

Visit your Vercel URL and start flipping! 🪙

---

## 🧪 Quick Test (5 minutes)

1. **Connect wallet** to your deployed app
2. **Get test USDC**: See `TEST_USDC_GUIDE.md`
3. **Create a flip** (1 USDC, choose opponent)
4. **Accept the flip** (switch wallet)
5. **Wait 60 seconds** for VRF result
6. **Check winner** and verify payout

**All working?** ✅ Congrats! You're ready to launch!

---

## 📚 Need More Details?

- **Full Deployment**: `DEPLOYMENT_CHECKLIST.md`
- **Testing**: `TESTING_GUIDE.md`
- **Mainnet**: `MAINNET_PREPARATION.md`
- **Security**: `SECURITY_AUDIT_CHECKLIST.md`

---

## 🆘 Quick Troubleshooting

**"Deployment failed"**
- Check you have Base Sepolia ETH
- Verify VRF subscription exists
- Ensure private key is correct (no 0x prefix)

**"VRF not fulfilling"**
- Check LINK balance in subscription
- Verify consumers added correctly
- Wait up to 2 minutes

**"Can't get test USDC"**
- Try Circle faucet: https://faucet.circle.com/
- Ask in Base Discord: https://discord.gg/buildonbase
- See `TEST_USDC_GUIDE.md` for more options

---

## 🎉 That's It!

You've deployed a production-ready dApp in under 2 hours.

**Next**: Test thoroughly, then deploy to mainnet with `./deploy-mainnet.sh`

**Good luck!** 🚀
