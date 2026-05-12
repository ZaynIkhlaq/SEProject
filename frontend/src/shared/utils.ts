// Utility functions for formatting and common operations

export const formatBudgetTier = (tier: string): string => {
  const tierMap: Record<string, string> = {
    'TIER_10K_50K': 'PKR 10k–50k',
    'TIER_50K_200K': 'PKR 50k–200k',
    'TIER_200K_PLUS': 'PKR 200k+',
  };
  return tierMap[tier] || tier;
};
