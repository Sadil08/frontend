"use client";

import React from 'react';

/**
 * WALLET_DISABLED: ReferralSection is temporarily disabled.
 * 
 * When re-enabling the referral system:
 * 1. Restore the original component that displays the user's referral code
 * 2. Restore the copy-to-clipboard functionality
 * 3. Restore the referral program information display
 * 4. Re-enable referral bonus processing in WalletService.debit()
 * 
 * Original component displayed:
 * - User's referral code with copy button
 * - Information about the referral program
 * - How much commission the referred user earns
 */
const ReferralSection: React.FC = () => {
    // WALLET_DISABLED: Return null to hide the referral section
    return null;
};

export default ReferralSection;
