# Mainnet Deployment Preparation Guide

Complete guide to preparing for Base Mainnet deployment.

⚠️ **WARNING**: Mainnet deployment involves REAL funds. Follow this guide carefully.

---

## 🎯 Prerequisites

Before even considering mainnet deployment:

### Technical Requirements

- [ ] **Testnet deployment successful**
  - All contracts deployed to Base Sepolia
  - All tests passing
  - VRF fulfillment working consistently
  - No critical bugs found

- [ ] **Comprehensive testing completed**
  - All 10 test scenarios from `TESTING_GUIDE.md` passed
  - Tested for at least 7 days on testnet
  - Multiple users tested the app
  - Edge cases covered

- [ ] **Security measures**
  - Code reviewed by at least 2 developers
  - Security audit completed (HIGHLY RECOMMENDED)
  - Emergency pause mechanism tested
  - Admin functions secured

- [ ] **Documentation complete**
  - User documentation written
  - API documentation ready
  - Support resources prepared
  - FAQ created

### Financial Requirements

- [ ] **Base Mainnet ETH**
  - 0.1-0.2 ETH for deployment gas
  - Additional ETH for testing
  - Reserve for emergency transactions

- [ ] **LINK tokens**
  - 5-10 LINK for VRF subscription
  - Monitor and refill as needed
  - Set up low-balance alerts

- [ ] **USDC for reward pools**
  - StreakManager: 500-1000 USDC
  - ReferralSystem: 200-500 USDC
  - DailyFreeFlip: 100-300 USDC
  - **Total**: 800-1800 USDC minimum

### Operational Requirements

- [ ] **Team ready**
  - At least 2 team members on standby
  - 24/7 monitoring for first 48 hours
  - Clear communication channels
  - Emergency response plan

- [ ] **Infrastructure**
  - Vercel production environment configured
  - Monitoring tools set up (optional: Sentry, Datadog)
  - Backup RPC endpoints configured
  - Status page ready (optional)

- [ ] **Legal & Compliance**
  - Terms of Service drafted
  - Privacy Policy created
  - Risk disclosures prepared
  - Regional restrictions understood

---

## 🔒 Security Checklist

### Code Security

- [ ] **Smart contracts audited**
  - Professional audit completed (recommended: Consensys Diligence, Trail of Bits, OpenZeppelin)
  - All critical/high issues resolved
  - Medium issues reviewed and addressed
  - Audit report published

- [ ] **Code review**
  - All contracts reviewed line-by-line
  - No hardcoded values (except constants)
  - No TODO comments in production code
  - Gas optimization reviewed

- [ ] **Access control**
  - Admin functions use `onlyOwner` modifier
  - VRF callback only callable by VRF Coordinator
  - No public mint/burn functions
  - Critical functions have proper guards

### Operational Security

- [ ] **Key management**
  - Deployer wallet is hardware wallet (Ledger/Trezor)
  - Private keys never stored in plain text
  - Multi-sig wallet for admin functions (recommended)
  - Backup recovery phrases secured

- [ ] **Contract upgradability**
  - Contracts are NOT upgradable (by design)
  - If upgradable, proxy patterns audited
  - Upgrade process documented and tested
  - Timelock on upgrades (if applicable)

- [ ] **Monitoring**
  - Contract event monitoring set up
  - Balance monitoring alerts configured
  - VRF fulfillment monitoring active
  - Unusual activity detection ready

### Emergency Procedures

- [ ] **Pause mechanism**
  - Emergency pause function tested
  - Clear criteria for when to pause
  - Team knows how to pause contracts
  - Communication plan for pause events

- [ ] **Incident response**
  - Incident response playbook created
  - Team roles defined
  - Communication templates prepared
  - Post-mortem process established

---

## 💰 Economics Planning

### Initial Funding

**Contracts to fund**:

1. **StreakManager** - Streak rewards
   - Day 7 rewards: 5 USDC × 100 users = 500 USDC
   - Day 14 rewards: 12 USDC × 50 users = 600 USDC
   - Day 30 rewards: 30 USDC × 20 users = 600 USDC
   - **Recommended initial**: 1000 USDC

2. **ReferralSystem** - Referral bonuses
   - Signup bonuses: 1 USDC × 200 users = 200 USDC
   - Bet earnings: Variable based on volume
   - **Recommended initial**: 500 USDC

3. **DailyFreeFlip** - Prize pool
   - Funded by 2% of platform fees
   - Initial seeding for first week
   - **Recommended initial**: 300 USDC

**Total Initial**: 1800 USDC

### Revenue Projections

**Conservative (Month 1)**:
- 100 DAU (Daily Active Users)
- 500 flips/day
- 5 USDC average bet
- Total volume: 2,500 USDC/day
- Platform fees (5%): 125 USDC/day
- Monthly revenue: ~3,750 USDC

**Moderate (Month 1)**:
- 500 DAU
- 2,000 flips/day
- 5 USDC average bet
- Total volume: 10,000 USDC/day
- Platform fees (5%): 500 USDC/day
- Monthly revenue: ~15,000 USDC

**Optimistic (Month 1)**:
- 1,000 DAU
- 5,000 flips/day
- 5 USDC average bet
- Total volume: 25,000 USDC/day
- Platform fees (5%): 1,250 USDC/day
- Monthly revenue: ~37,500 USDC

### Operating Costs

**Monthly Expenses**:
- LINK tokens for VRF: ~$50-100
- Vercel hosting: $20-50
- Monitoring tools: $0-100
- Support/Community: Variable
- **Total**: $70-250/month

### Break-Even Analysis

With 1800 USDC initial investment:
- Conservative: Break even in ~14 days
- Moderate: Break even in ~3 days
- Optimistic: Break even in ~1.5 days

---

## 🚀 Deployment Timeline

### Week -2: Final Preparation

- [ ] Complete security audit
- [ ] Fix all critical/high issues
- [ ] Final code review
- [ ] Document all findings
- [ ] Prepare legal documents

### Week -1: Infrastructure Setup

- [ ] Set up production Vercel project
- [ ] Configure environment variables
- [ ] Set up monitoring tools
- [ ] Create support channels
- [ ] Prepare launch materials

### Day -3: Pre-Deployment

- [ ] Get Base Mainnet ETH
- [ ] Create VRF subscription
- [ ] Fund VRF with LINK
- [ ] Get USDC for reward pools
- [ ] Final team meeting

### Day 0: Deployment Day

**Morning**:
- [ ] Final go/no-go decision
- [ ] Team on standby
- [ ] Run deployment script
- [ ] Verify all contracts
- [ ] Add VRF consumers

**Afternoon**:
- [ ] Fund reward pools
- [ ] Update Vercel env vars
- [ ] Deploy frontend
- [ ] Internal testing (small amounts)

**Evening**:
- [ ] Soft launch to small group
- [ ] Monitor closely
- [ ] Fix any issues immediately

### Day 1-2: Beta Testing

- [ ] Invite 10-20 beta users
- [ ] Monitor all transactions
- [ ] Gather feedback
- [ ] Fix minor issues
- [ ] Verify VRF working consistently

### Day 3-7: Limited Launch

- [ ] Gradual increase in users
- [ ] Marketing to crypto communities
- [ ] Monitor user behavior
- [ ] Optimize based on data
- [ ] Build social proof

### Week 2+: Full Launch

- [ ] Public announcement
- [ ] Full marketing push
- [ ] Community building
- [ ] Feature iteration
- [ ] Growth optimization

---

## 📊 Monitoring & Metrics

### Key Metrics to Track

**Technical**:
- [ ] VRF fulfillment rate
- [ ] Average VRF fulfillment time
- [ ] Gas costs per transaction
- [ ] Transaction success rate
- [ ] Contract balance changes

**Business**:
- [ ] Daily Active Users (DAU)
- [ ] Total flips created/completed
- [ ] Total volume (USDC)
- [ ] Platform fees collected
- [ ] User retention (D1, D7, D30)

**User Engagement**:
- [ ] Average bet size
- [ ] Flips per user
- [ ] Streak check-ins
- [ ] Referral signups
- [ ] Daily free flip participation

### Alerts to Configure

**Critical Alerts**:
- Contract balance below threshold
- VRF subscription LINK < 2 LINK
- Transaction failure rate > 5%
- Unusual large bets (whale alert)
- Security event detected

**Warning Alerts**:
- VRF fulfillment time > 2 minutes
- Gas prices spiking
- User complaints increasing
- Referral pool running low

---

## 🔍 Pre-Launch Testing Checklist

### Final Mainnet Testing (Small Amounts)

Before full launch, test with REAL but SMALL amounts:

- [ ] **Create flip** (1 USDC)
  - Transaction succeeds
  - USDC transferred correctly
  - Event emitted properly

- [ ] **Accept flip** (1 USDC)
  - Acceptance works
  - VRF request triggered
  - Both bets locked

- [ ] **VRF fulfillment**
  - Fulfillment < 2 minutes
  - Winner determined correctly
  - Payout calculated correctly (95%)

- [ ] **Claim winnings**
  - Winner can claim
  - USDC transferred correctly
  - Platform fee collected (5%)

- [ ] **Streak check-in**
  - Check-in works
  - Streak increments
  - Rewards claimable at milestones

- [ ] **Referral system**
  - Referral link generated
  - New user registers
  - Bonus credited correctly

- [ ] **Daily free flip**
  - Entry succeeds (no USDC cost)
  - VRF fulfillment works
  - Prize awarded correctly

- [ ] **Frontend integration**
  - All features work
  - Real-time updates display
  - Wallet connection smooth
  - Mobile responsive

---

## 🚨 Launch Risks & Mitigation

### Technical Risks

**Risk**: VRF fails to fulfill
- **Likelihood**: Low
- **Impact**: High
- **Mitigation**: Monitor LINK balance, have backup LINK ready, test thoroughly

**Risk**: Smart contract bug discovered
- **Likelihood**: Medium (if no audit)
- **Impact**: Critical
- **Mitigation**: Professional audit, thorough testing, pause mechanism

**Risk**: Gas price spike
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Use gas-optimized code, monitor gas prices, communicate with users

### Business Risks

**Risk**: Low user adoption
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Marketing plan, referral incentives, community building

**Risk**: Whale manipulation
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Bet limits, monitoring, community reporting

**Risk**: Regulatory scrutiny
- **Likelihood**: Low
- **Impact**: High
- **Mitigation**: Legal review, compliance measures, terms of service

### Operational Risks

**Risk**: Team unavailable during incident
- **Likelihood**: Low
- **Impact**: High
- **Mitigation**: 24/7 coverage first week, clear escalation, documented procedures

**Risk**: Infrastructure downtime
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**: Multiple RPC endpoints, Vercel SLA, status page

---

## 📞 Support & Resources

### During Launch

**Team Availability**:
- At least 2 developers on call
- Response time < 15 minutes for critical issues
- 24/7 coverage for first 48 hours

**Communication Channels**:
- Internal: Slack/Discord private channel
- Users: Public Discord/Telegram
- Status updates: Twitter/X
- Critical alerts: SMS/Phone

### External Resources

- **Base Network**: https://status.base.org
- **Chainlink VRF**: https://status.chain.link
- **Vercel Status**: https://www.vercel-status.com
- **BaseScan**: https://basescan.org

---

## ✅ Final Go/No-Go Checklist

Before running `./deploy-mainnet.sh`:

### Technical ✅
- [ ] All testnet tests passing
- [ ] Security audit complete (or risk accepted)
- [ ] Code frozen (no last-minute changes)
- [ ] Emergency procedures tested
- [ ] Monitoring configured

### Financial ✅
- [ ] Sufficient ETH for deployment (0.2+ ETH)
- [ ] VRF subscription funded (5+ LINK)
- [ ] Reward pools funded (1800+ USDC)
- [ ] Reserve funds available

### Operational ✅
- [ ] Team briefed and ready
- [ ] Support channels prepared
- [ ] Documentation published
- [ ] Marketing materials ready
- [ ] Legal documents finalized

### Final Approval ✅
- [ ] Technical lead approves
- [ ] Product lead approves
- [ ] Legal review complete (if applicable)
- [ ] All team members agree: GO FOR LAUNCH

---

## 🎉 Launch Day Checklist

On deployment day, follow this sequence:

1. [ ] Team meeting - Final go/no-go
2. [ ] Run `./deploy-mainnet.sh`
3. [ ] Verify all 4 contracts on BaseScan
4. [ ] Add VRF consumers immediately
5. [ ] Fund all reward pools
6. [ ] Update Vercel environment variables
7. [ ] Deploy frontend to production
8. [ ] Internal team testing (small amounts)
9. [ ] Invite 5-10 beta users
10. [ ] Monitor for 2 hours
11. [ ] Soft announcement to community
12. [ ] Continue monitoring 24/7

---

## 📝 Post-Deployment

### First 24 Hours

- [ ] Monitor every transaction
- [ ] Respond to user issues < 30 min
- [ ] Track all metrics
- [ ] Fix minor issues immediately
- [ ] Gather user feedback

### First Week

- [ ] Daily team sync
- [ ] Review metrics daily
- [ ] User interviews/surveys
- [ ] Optimize based on data
- [ ] Build community

### First Month

- [ ] Weekly metrics review
- [ ] Feature iteration
- [ ] Marketing campaigns
- [ ] Partnership outreach
- [ ] Plan v2 features

---

**Are you ready?** If all checklists are complete, proceed to mainnet deployment.

See `deploy-mainnet.sh` for deployment script.

**Good luck! 🚀**
