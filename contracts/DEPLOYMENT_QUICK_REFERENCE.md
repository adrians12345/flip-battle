# Quick Deployment Reference

## 🚀 Deploy to Base Sepolia (Quick Steps)

### 1. Prerequisites
- [ ] Base Sepolia ETH in wallet
- [ ] VRF subscription created at https://vrf.chain.link
- [ ] VRF subscription funded with 2+ LINK
- [ ] BaseScan API key from https://basescan.org/myapikey

### 2. Configure .env
```bash
cd contracts
nano .env  # or vim .env
```

Fill in:
```bash
PRIVATE_KEY=your_private_key_without_0x
VRF_SUBSCRIPTION_ID=12345
BASESCAN_API_KEY=ABC123XYZ
```

### 3. Deploy
```bash
make deploy-sepolia
```

### 4. Add VRF Consumers
Go to https://vrf.chain.link and add:
- FlipBattle address
- DailyFreeFlip address

### 5. Update Frontend
```bash
cd ../apps/web
nano .env.local  # Add contract addresses
```

### 6. Test
```bash
bun run dev
# Open http://localhost:3000
# Create a flip!
```

## 📝 Important Addresses

### Base Sepolia Network
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Block Explorer: https://sepolia.basescan.org

### Chainlink VRF (Base Sepolia)
- VRF Coordinator: 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE
- Key Hash: 0x...
- Dashboard: https://vrf.chain.link

### Base Sepolia Tokens
- USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
- LINK: Get from https://faucets.chain.link/base-sepolia

## 🔍 Verify Deployment

Check each contract on BaseScan:
```
https://sepolia.basescan.org/address/[YOUR_CONTRACT_ADDRESS]
```

Should see:
- ✅ Green checkmark (verified)
- ✅ Source code visible
- ✅ Read/Write tabs

## 🧪 Test Checklist

- [ ] Create flip challenge
- [ ] Accept flip challenge  
- [ ] Wait for VRF result (30-60s)
- [ ] Check streak system
- [ ] Test referral link
- [ ] Try daily free flip

## 🚨 Common Issues

**"Insufficient funds"** → Get ETH from faucet  
**"VRF not found"** → Check subscription ID  
**"Consumer not added"** → Add contract to VRF subscription  
**"Verification failed"** → Check BaseScan API key  

## 📞 Help

- VRF Docs: https://docs.chain.link/vrf
- Base Docs: https://docs.base.org
- Discord: https://discord.gg/buildonbase
