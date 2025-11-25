export enum SettlementReason {
  HOUSE_FEE = "house_fee",
  GAME_BALANCE = "game_balance",
  SHARED_EXPENSE = "shared_expense"
}

export interface SettlementBreakdown {
  amount: number;
  reason: SettlementReason;
}

export interface BaseSettlement {
  from: string;
  to: string;
  amount: number;
  reason: SettlementReason;
}

export interface CombinedSettlement {
  from: string;
  to: string;
  amount: number;
  breakdown: SettlementBreakdown[];
}

export interface Player {
  id: number;
  name: string;
  buyIn: number;
  cashOut: number;
  isHouse?: boolean;
  expenses?: number;
}

export interface UnaccountedMoney {
  amount: number;
  type: 'missing' | 'excess' | 'balanced';
  description: string;
}

export interface SettlementResult {
  settlements: CombinedSettlement[];
  unaccountedMoney: UnaccountedMoney;
}
