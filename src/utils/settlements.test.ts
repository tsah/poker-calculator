import { describe, it, expect } from "vitest";
import { calculateSettlements } from "./settlements";
import { type Player } from "./types/settlement";

describe("calculateSettlements", () => {
  it("should handle simple game with no house fee", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 100, cashOut: 80 },
      { id: 2, name: "B", buyIn: 100, cashOut: 120 },
    ];

    const settlements = calculateSettlements(players, 0);
    expect(settlements).toHaveLength(1);
    expect(settlements[0]).toEqual({
      from: "A",
      to: "B",
      amount: 20,
      breakdown: [{ amount: 20, reason: "game_balance" }],
    });
  });

  it("should handle game with house player and fee", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 30, cashOut: 0, isHouse: true },
      { id: 2, name: "B", buyIn: 30, cashOut: 60 },
    ];

    const settlements = calculateSettlements(players, 10);
    expect(settlements).toHaveLength(1);
    expect(settlements[0]).toEqual({
      from: "A",
      to: "B",
      amount: 20,
      breakdown: [
        { amount: 30, reason: "game_balance" },
        { amount: -10, reason: "house_fee" },
      ],
    });
  });

  it("should handle multiple regular players with house fee", () => {
    const players: Player[] = [
      { id: 1, name: "House", buyIn: 0, cashOut: 0, isHouse: true },
      { id: 2, name: "A", buyIn: 100, cashOut: 80 },
      { id: 3, name: "B", buyIn: 100, cashOut: 120 },
    ];

    const settlements = calculateSettlements(players, 10);
    const result = settlements.sort((a, b) =>
      a.from === b.from
        ? a.to.localeCompare(b.to)
        : a.from.localeCompare(b.from),
    );

    expect(settlements).toHaveLength(3);
    expect(result).toEqual([
      {
        from: "A",
        to: "B",
        amount: 20,
        breakdown: [{ amount: 20, reason: "game_balance" }],
      },
      {
        from: "A",
        to: "House",
        amount: 10,
        breakdown: [{ amount: 10, reason: "house_fee" }],
      },
      {
        from: "B",
        to: "House",
        amount: 10,
        breakdown: [{ amount: 10, reason: "house_fee" }],
      },
    ]);
  });

  it("should handle multiple house players", () => {
    const players: Player[] = [
      { id: 1, name: "House1", buyIn: 0, cashOut: 0, isHouse: true },
      { id: 2, name: "House2", buyIn: 0, cashOut: 0, isHouse: true },
      { id: 3, name: "A", buyIn: 100, cashOut: 80 },
      { id: 4, name: "B", buyIn: 100, cashOut: 120 },
    ];

    const settlements = calculateSettlements(players, 10);
    const result = settlements.sort((a, b) =>
      a.from === b.from
        ? a.to.localeCompare(b.to)
        : a.from.localeCompare(b.from),
    );

    expect(settlements).toHaveLength(5);
    expect(result).toEqual([
      {
        from: "A",
        to: "B",
        amount: 20,
        breakdown: [{ amount: 20, reason: "game_balance" }],
      },
      {
        from: "A",
        to: "House1",
        amount: 5,
        breakdown: [{ amount: 5, reason: "house_fee" }],
      },
      {
        from: "A",
        to: "House2",
        amount: 5,
        breakdown: [{ amount: 5, reason: "house_fee" }],
      },
      {
        from: "B",
        to: "House1",
        amount: 5,
        breakdown: [{ amount: 5, reason: "house_fee" }],
      },
      {
        from: "B",
        to: "House2",
        amount: 5,
        breakdown: [{ amount: 5, reason: "house_fee" }],
      },
    ]);
  });

  it("should handle game balance equal to opposite house fee", () => {
    const players: Player[] = [
      { id: 1, name: "House", buyIn: 100, cashOut: 90, isHouse: true },
      { id: 2, name: "A", buyIn: 100, cashOut: 110 },
    ];

    // A wins 10 from House in game balance
    // A pays 10 to House in house fee
    // Net result should be no settlements
    const settlements = calculateSettlements(players, 10);
    expect(settlements).toHaveLength(0);
  });
});
