import {
  SettlementReason,
  BaseSettlement,
  CombinedSettlement,
  Player,
} from "./types/settlement";

// Helper function to create a consistent key for settlements
function getSettlementKey(from: string, to: string): string {
  return [from, to].sort().join("-");
}

// Step 1: Group base settlements by key
function groupSettlementsByKey(
  settlements: BaseSettlement[],
): Record<string, BaseSettlement[]> {
  return settlements.reduce(
    (acc, settlement) => {
      const key = getSettlementKey(settlement.from, settlement.to);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(settlement);
      return acc;
    },
    {} as Record<string, BaseSettlement[]>,
  );
}

export function combineSettlements(
  settlements: BaseSettlement[],
): CombinedSettlement[] {
  const grouped = groupSettlementsByKey(settlements);
  return Object.values(grouped)
    .map((group) => {
      const first = group[0];
      const fromFirst = first.from;

      // Get net amount considering direction of transfers
      const amount = group.reduce((sum, s) => {
        if (s.from === fromFirst) {
          return sum + s.amount;
        } else {
          return sum - s.amount;
        }
      }, 0);

      // Determine final direction based on net amount
      const [from, to] =
        amount >= 0 ? [fromFirst, first.to] : [first.to, fromFirst];

      return {
        from,
        to,
        amount: Math.abs(amount),
        breakdown: group.map((s) => ({
          amount: s.from === from ? s.amount : -s.amount,
          reason: s.reason,
        })),
      };
    })
    .filter((settlement) => Math.abs(settlement.amount) > 0.01);
}

export function calculateSettlements(
  players: Player[],
  houseFee: number,
): CombinedSettlement[] {
  const allSettlements: BaseSettlement[] = [];
  const housePlayers = players.filter((p) => p.isHouse);
  const regularPlayers = players.filter((p) => !p.isHouse);

  // Calculate game balance settlements first
  const balances = players.map((player) => ({
    name: player.name,
    balance: player.cashOut - player.buyIn,
  }));

  // Calculate game balance settlements
  const debtors = balances
    .filter((b) => b.balance < 0)
    .sort((a, b) => a.balance - b.balance);
  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (amount > 0) {
      allSettlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(amount.toFixed(2)),
        reason: SettlementReason.GAME_BALANCE,
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) debtorIndex++;
    if (Math.abs(creditor.balance) < 0.01) creditorIndex++;
  }

  // Add house fee settlements
  if (housePlayers.length > 0 && houseFee > 0) {
    regularPlayers.forEach((player) => {
      const feePerHousePlayer = houseFee / housePlayers.length;
      housePlayers.forEach((housePlayer) => {
        allSettlements.push({
          from: player.name,
          to: housePlayer.name,
          amount: Number(feePerHousePlayer.toFixed(2)),
          reason: SettlementReason.HOUSE_FEE,
        });
      });
    });

  }
  const result = combineSettlements(allSettlements);
  return result;
}
