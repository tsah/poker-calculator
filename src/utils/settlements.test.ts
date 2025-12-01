import { describe, it, expect } from "vitest";
import { calculateSettlements, calculateGross } from "./settlements";
import { type Player } from "./types/settlement";

describe("calculateSettlements", () => {
  it("should handle simple game with no house fee", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 100, cashOut: 80 },
      { id: 2, name: "B", buyIn: 100, cashOut: 120 },
    ];

    const result = calculateSettlements(players, 0);
    expect(result.settlements).toHaveLength(1);
    expect(result.settlements[0]).toEqual({
      from: "A",
      to: "B",
      amount: 20,
      breakdown: [{ amount: 20, reason: "game_balance" }],
    });
    expect(result.unaccountedMoney.type).toBe('balanced');
  });

  it("should handle game with house player and fee", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 30, cashOut: 0, isHouse: true },
      { id: 2, name: "B", buyIn: 30, cashOut: 60 },
    ];

    const result = calculateSettlements(players, 10);
    expect(result.settlements).toHaveLength(1);
    expect(result.settlements[0]).toEqual({
      from: "A",
      to: "B",
      amount: 20,
      breakdown: [
        { amount: 30, reason: "game_balance" },
        { amount: -10, reason: "house_fee" },
      ],
    });
    expect(result.unaccountedMoney.type).toBe('balanced');
  });

  it("should handle multiple regular players with house fee", () => {
    const players: Player[] = [
      { id: 1, name: "House", buyIn: 0, cashOut: 0, isHouse: true },
      { id: 2, name: "A", buyIn: 100, cashOut: 80 },
      { id: 3, name: "B", buyIn: 100, cashOut: 120 },
    ];

    const result = calculateSettlements(players, 10);
    const sortedSettlements = result.settlements.sort((a, b) =>
      a.from === b.from
        ? a.to.localeCompare(b.to)
        : a.from.localeCompare(b.from),
    );

    expect(result.settlements).toHaveLength(3);
    expect(sortedSettlements).toEqual([
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

    const result = calculateSettlements(players, 10);
    const sortedSettlements = result.settlements.sort((a, b) =>
      a.from === b.from
        ? a.to.localeCompare(b.to)
        : a.from.localeCompare(b.from),
    );

    expect(result.settlements).toHaveLength(5);
    expect(sortedSettlements).toEqual([
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
    // Net result is 0, but show details
    const result = calculateSettlements(players, 10);
    expect(result.settlements).toHaveLength(1);
    expect(result.settlements[0]).toEqual({
      from: "House",
      to: "A",
      amount: 0,
      breakdown: [
        { amount: 10, reason: "game_balance" },
        { amount: -10, reason: "house_fee" },
      ],
    });
    expect(result.unaccountedMoney.type).toBe('balanced');
  });

  it("should return empty settlements when there is excess money", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 100, cashOut: 150 },
      { id: 2, name: "B", buyIn: 100, cashOut: 100 },
    ];

    const result = calculateSettlements(players, 0);
    expect(result.settlements).toHaveLength(0);
    expect(result.unaccountedMoney.type).toBe('excess');
    expect(result.unaccountedMoney.amount).toBe(50);
    expect(result.unaccountedMoney.description).toBe('יש עודף של ₪50.00 שלא ניתן לחלק');
  });

  it("should return empty settlements when there is missing money", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 100, cashOut: 50 },
      { id: 2, name: "B", buyIn: 100, cashOut: 100 },
    ];

    const result = calculateSettlements(players, 0);
    expect(result.settlements).toHaveLength(0);
    expect(result.unaccountedMoney.type).toBe('missing');
    expect(result.unaccountedMoney.amount).toBe(50);
    expect(result.unaccountedMoney.description).toBe('חסרים ₪50.00 כדי לאזן את החשבונות');
  });
});

describe("calculateGross", () => {
  it("should calculate gross for simple game", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 100, cashOut: 80 },
      { id: 2, name: "B", buyIn: 100, cashOut: 120 },
    ];

    const result = calculateGross(players, 0);
    expect(result.get("A")).toBe(-20);
    expect(result.get("B")).toBe(20);
  });

  it("should include house fee in gross", () => {
    const players: Player[] = [
      { id: 1, name: "House", buyIn: 0, cashOut: 0, isHouse: true },
      { id: 2, name: "A", buyIn: 100, cashOut: 110 },
    ];

    const result = calculateGross(players, 10);
    expect(result.get("House")).toBe(10);
    expect(result.get("A")).toBe(0); // 10 - 10 = 0
  });

  it("should include shared expenses in gross", () => {
    const players: Player[] = [
      { id: 1, name: "A", buyIn: 100, cashOut: 100, expenses: 30 },
      { id: 2, name: "B", buyIn: 100, cashOut: 100 },
    ];

    const result = calculateGross(players, 0);
    expect(result.get("A")).toBe(15); // receives 15 from B
    expect(result.get("B")).toBe(-15); // pays 15 to A
  });
});
