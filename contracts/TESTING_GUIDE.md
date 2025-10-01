# Testnet Testing Guide

Comprehensive testing scenarios for Flip Battle on Base Sepolia.

## 🧪 Testing Overview

After deployment, you should test all core functionality to ensure everything works before mainnet deployment.

### Test Wallets Setup

For comprehensive testing, you'll need **2 wallets**:
- **Wallet A**: Primary test wallet (creator)
- **Wallet B**: Secondary test wallet (opponent)

Both wallets need:
- Base Sepolia ETH (for gas)
- Test USDC (for betting)

---

## 📋 Test Scenarios

### 🎲 Scenario 1: Basic Flip Challenge

**Objective**: Create and complete a basic flip challenge

**Steps**:
1. **Connect Wallet A** to frontend
2. **Create Challenge**:
   - Opponent: Wallet B address
   - Bet: 1 USDC (minimum)
   - Choice: Heads
3. **Verify on BaseScan**:
   - Check FlipCreated event emitted
   - Verify USDC transferred from Wallet A
4. **Switch to Wallet B**
5. **Accept Challenge**:
   - Navigate to Games page
   - Find pending challenge
   - Click "Accept"
6. **Wait for VRF**:
   - Wait 30-60 seconds
   - Refresh page
7. **Verify Result**:
   - Check winner determined correctly
   - Verify USDC payout to winner
   - Check FlipResolved event

**Expected Results**:
- ✅ Challenge created successfully
- ✅ USDC locked in contract
- ✅ Challenge accepted successfully
- ✅ VRF request fulfilled
- ✅ Winner receives 95% of pot (1.9 USDC)
- ✅ Platform receives 5% fee (0.1 USDC)

---

### 🔥 Scenario 2: Daily Streak System

**Objective**: Test streak check-ins and rewards

**Steps**:
1. **Connect Wallet A**
2. **Navigate to Streaks tab**
3. **First Check-In**:
   - Click "Check In Today"
   - Verify transaction succeeds
   - Verify streak = 1
4. **Second Check-In (Same Day)**:
   - Try to check in again
   - Should fail (already checked in)
5. **Test 7-Day Milestone** (requires time manipulation or waiting):
   - Check in daily for 7 days
   - On day 7, claim reward button appears
   - Claim 5 USDC reward
   - Verify USDC received

**Expected Results**:
- ✅ First check-in succeeds
- ✅ Duplicate check-in fails
- ✅ Streak counter increments daily
- ✅ Milestone rewards claimable
- ✅ USDC rewards received correctly

**Milestone Rewards**:
- Day 7: 5 USDC
- Day 14: 12 USDC
- Day 30: 30 USDC
- Day 60: 75 USDC
- Day 90: 150 USDC

---

### 👥 Scenario 3: Referral System

**Objective**: Test referral tracking and earnings

**Steps**:
1. **Get Referral Link**:
   - Connect Wallet A
   - Navigate to Referrals tab
   - Copy referral link
2. **Register with Referral**:
   - Open referral link in new browser
   - Connect Wallet B
   - Should register Wallet B as referral of Wallet A
3. **Create Flip as Referral**:
   - Wallet B creates a 10 USDC flip
   - Wallet B accepts their own flip (or find opponent)
4. **Check Referrer Earnings**:
   - Switch to Wallet A
   - Check Referrals tab
   - Should show:
     - 1 USDC signup bonus
     - 5% of Wallet B's 10 USDC bet (0.5 USDC)
     - Total: 1.5 USDC earnings
5. **Claim Earnings**:
   - Click "Claim Earnings"
   - Verify USDC received

**Expected Results**:
- ✅ Referral link generated correctly
- ✅ Wallet B registered as referral
- ✅ 1 USDC signup bonus tracked
- ✅ 5% of bets tracked (0.5 USDC)
- ✅ Earnings claimable
- ✅ USDC transferred correctly

---

### 🎁 Scenario 4: Daily Free Flip

**Objective**: Test free daily flip lottery

**Steps**:
1. **Connect Wallet A**
2. **Navigate to Daily Free tab**
3. **Check Prize Pool**:
   - Should show available prize pool
   - Funded by 2% of platform fees
4. **Enter Daily Flip**:
   - Choose Heads or Tails
   - Click "Enter Daily Flip"
   - Should be free (no USDC required)
5. **Wait for Result**:
   - Wait 30-60 seconds for VRF
   - Refresh page
6. **Check Result**:
   - If won: Prize amount added to balance
   - If lost: No USDC lost
7. **Try Second Entry**:
   - Try to enter again same day
   - Should fail (already played today)

**Expected Results**:
- ✅ Prize pool displayed correctly
- ✅ Free entry succeeds (no gas except ETH)
- ✅ VRF result received
- ✅ Winner receives prize
- ✅ Can't play twice in same day
- ✅ Can play again next day

---

### ❌ Scenario 5: Cancel Challenge

**Objective**: Test challenge cancellation

**Steps**:
1. **Create Challenge**:
   - Wallet A creates challenge
   - Opponent: Wallet B
   - Bet: 5 USDC
2. **Cancel Challenge**:
   - Before Wallet B accepts
   - Wallet A clicks "Cancel"
3. **Verify Refund**:
   - Check USDC refunded to Wallet A
   - Check FlipCancelled event

**Expected Results**:
- ✅ Challenge cancelled successfully
- ✅ USDC refunded to creator
- ✅ Challenge status = Cancelled
- ✅ Can't accept cancelled challenge

---

### ⏰ Scenario 6: Challenge Expiration

**Objective**: Test automatic challenge expiration

**Steps**:
1. **Create Challenge**:
   - Wallet A creates challenge
   - Bet: 1 USDC
2. **Wait 24 Hours**:
   - Don't accept the challenge
   - Wait for expiration (24 hours)
3. **Try to Accept Expired**:
   - Wallet B tries to accept
   - Should fail (expired)
4. **Cancel Expired**:
   - Wallet A cancels expired challenge
   - Gets USDC refund

**Expected Results**:
- ✅ Challenge expires after 24 hours
- ✅ Can't accept expired challenge
- ✅ Creator can cancel and get refund
- ✅ FlipExpired event emitted

---

### 💰 Scenario 7: Large Bet

**Objective**: Test with larger bet amounts

**Steps**:
1. **Create Large Challenge**:
   - Wallet A creates challenge
   - Bet: 100 USDC
   - Opponent: Wallet B
2. **Accept and Complete**:
   - Wallet B accepts
   - Wait for VRF result
3. **Verify Payouts**:
   - Winner receives: 190 USDC (95%)
   - Platform receives: 10 USDC (5%)

**Expected Results**:
- ✅ Large amounts handled correctly
- ✅ Percentage calculations accurate
- ✅ No overflow errors
- ✅ Correct USDC transfers

---

### 🔗 Scenario 8: VRF Failure Recovery

**Objective**: Test VRF failure scenarios

**Steps**:
1. **Create Challenge with Insufficient LINK**:
   - Ensure VRF subscription has < 1 LINK
   - Create and accept challenge
   - VRF request will fail
2. **Check Status**:
   - Challenge stuck in Active state
3. **Recovery**:
   - Fund VRF subscription with LINK
   - Retry VRF fulfillment (may require manual intervention)

**Expected Results**:
- ✅ Contract doesn't break on VRF failure
- ✅ Funds remain safe in contract
- ✅ Can recover by funding subscription

---

### 📊 Scenario 9: Statistics Tracking

**Objective**: Verify user statistics accuracy

**Steps**:
1. **Initial State**:
   - Check Wallet A statistics
   - Games Played: 0
   - Games Won: 0
   - Total Wagered: 0
   - Net Profit: 0
2. **Play 5 Games**:
   - Win 3 games
   - Lose 2 games
   - Track each game result
3. **Verify Final Stats**:
   - Games Played: 5
   - Games Won: 3
   - Win Rate: 60%
   - Total Wagered: Sum of all bets
   - Net Profit: Calculated correctly

**Expected Results**:
- ✅ All statistics tracked accurately
- ✅ Win rate calculated correctly
- ✅ Profit/loss calculations accurate
- ✅ Real-time updates working

---

### 🎮 Scenario 10: Farcaster Integration

**Objective**: Test Farcaster features

**Steps**:
1. **Profile Display**:
   - Connect wallet with Farcaster account
   - Verify username and avatar displayed
2. **Share to Warpcast**:
   - Complete a flip challenge
   - Click "Share" button
   - Verify Warpcast compose opens
   - Post cast with result
3. **Auto-Cast Notifications**:
   - Enable auto-cast
   - Create/complete games
   - Verify toast notifications appear

**Expected Results**:
- ✅ Farcaster profiles load correctly
- ✅ Share button works
- ✅ Warpcast compose pre-filled
- ✅ Auto-cast notifications appear
- ✅ Fallback to address if no profile

---

## 🔍 Manual Verification Checklist

### On BaseScan

For each deployed contract, verify:

**FlipBattle**:
- [ ] Contract verified (green checkmark)
- [ ] Read minimumBet() returns 1000000
- [ ] Read platformFee() returns 5
- [ ] VRF coordinator set correctly
- [ ] USDC token set correctly

**StreakManager**:
- [ ] Contract verified
- [ ] Read streakRewards(7) returns 5000000
- [ ] Read streakRewards(90) returns 150000000
- [ ] USDC token set correctly

**ReferralSystem**:
- [ ] Contract verified
- [ ] Read REFERRAL_BONUS() returns 1000000
- [ ] Read REFERRAL_PERCENTAGE() returns 5
- [ ] FlipBattle address set correctly

**DailyFreeFlip**:
- [ ] Contract verified
- [ ] Read isActive() returns true
- [ ] VRF coordinator set correctly
- [ ] Prize pool funded

### On Chainlink VRF Dashboard

- [ ] Subscription active
- [ ] Balance > 2 LINK
- [ ] 2 consumers added (FlipBattle, DailyFreeFlip)
- [ ] Recent requests showing
- [ ] All requests fulfilled successfully

### On Frontend

- [ ] Homepage loads correctly
- [ ] Wallet connection works
- [ ] All tabs functional (Flip, Daily, Streaks, Referrals)
- [ ] Games list page works
- [ ] Profile page works
- [ ] Live event feed updates
- [ ] Toast notifications appear
- [ ] Mobile responsive
- [ ] No console errors

---

## 🐛 Common Issues & Solutions

### Issue: "Insufficient USDC balance"
**Check**:
- Wallet has test USDC
- USDC approval granted
- Allowance >= bet amount

**Fix**: Approve more USDC or get test tokens

### Issue: "VRF request not fulfilled"
**Check**:
- VRF subscription has LINK
- Consumers added correctly
- Network not congested

**Fix**: Wait longer, check VRF dashboard, fund subscription

### Issue: "Transaction reverted"
**Check**:
- Gas limit sufficient
- Contract not paused
- Input parameters valid
- State requirements met (e.g., not already checked in today)

**Fix**: Check error message, verify inputs, check contract state

### Issue: "Can't accept challenge"
**Check**:
- Challenge not already accepted
- Challenge not expired
- Not the creator trying to accept
- Sufficient USDC balance

**Fix**: Verify challenge state on BaseScan

---

## 📝 Test Results Template

Use this template to record test results:

```
=== Flip Battle Testnet Testing ===
Date: _____________
Tester: _____________
Network: Base Sepolia

Contract Addresses:
- FlipBattle: 0x_______________
- StreakManager: 0x_______________
- ReferralSystem: 0x_______________
- DailyFreeFlip: 0x_______________

Test Wallet A: 0x_______________
Test Wallet B: 0x_______________

Test Results:
[ ] Scenario 1: Basic Flip Challenge - PASS/FAIL
[ ] Scenario 2: Daily Streak System - PASS/FAIL
[ ] Scenario 3: Referral System - PASS/FAIL
[ ] Scenario 4: Daily Free Flip - PASS/FAIL
[ ] Scenario 5: Cancel Challenge - PASS/FAIL
[ ] Scenario 6: Challenge Expiration - PASS/FAIL
[ ] Scenario 7: Large Bet - PASS/FAIL
[ ] Scenario 8: VRF Failure Recovery - PASS/FAIL
[ ] Scenario 9: Statistics Tracking - PASS/FAIL
[ ] Scenario 10: Farcaster Integration - PASS/FAIL

Issues Found:
1. _______________
2. _______________
3. _______________

Notes:
_______________
_______________
_______________

Overall Status: READY FOR MAINNET / NEEDS FIXES
```

---

## ✅ Ready for Mainnet Criteria

Your testnet deployment is ready for mainnet when:

- ✅ All 10 test scenarios pass
- ✅ No critical bugs found
- ✅ VRF working consistently
- ✅ All contract functions working
- ✅ Statistics tracking accurately
- ✅ Frontend fully functional
- ✅ Mobile experience good
- ✅ Gas costs reasonable
- ✅ No security concerns
- ✅ Team confident in code

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **Document any issues** found and fixed
2. **Review gas costs** and optimize if needed
3. **Update documentation** with lessons learned
4. **Prepare mainnet deployment** (Phase 16)
5. **Security audit** (recommended for mainnet)
6. **Deploy to Base Mainnet** (Phase 17)

Good luck with testing! 🎲
