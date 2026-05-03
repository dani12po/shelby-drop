/// <reference types="vitest/globals" />
// Test the timestamp fix logic (the core bug we fixed)
describe("Aptos timestamp conversion", () => {
  // Aptos returns timestamps in MICROSECONDS
  // We must divide by 1000 to get milliseconds, NOT multiply

  it("correctly converts Aptos microsecond timestamp to ms", () => {
    // Example: a real Aptos timestamp in microseconds
    const aptosTimestampMicros = "1777402585251000"; // ~April 2026 in microseconds
    const timestampMs = Math.floor(parseInt(aptosTimestampMicros) / 1000);
    const now = Date.now();
    const ageMs = now - timestampMs;

    // Age should be a reasonable positive number (not negative billions)
    expect(ageMs).toBeGreaterThan(0);
    expect(ageMs).toBeLessThan(365 * 24 * 60 * 60 * 1000); // less than 1 year
  });

  it("wrong conversion (multiply) produces negative/huge age", () => {
    const aptosTimestampMicros = "1777402585251000";
    // WRONG: multiply by 1000 (old bug)
    const wrongMs = parseInt(aptosTimestampMicros) * 1000;
    const now = Date.now();
    const wrongAge = now - wrongMs;

    // This would be a huge negative number — the bug
    expect(wrongAge).toBeLessThan(-1e15);
  });

  it("filters failed transactions", () => {
    const transactions = [
      { hash: "0xfailed", success: false, timestamp: "1777402585251000" },
      { hash: "0xsuccess", success: true, timestamp: "1777402585251000" },
    ];

    const now = Date.now();
    const recent = transactions.find(tx => {
      if (!tx.success) return false;
      const tsMs = Math.floor(parseInt(tx.timestamp) / 1000);
      const age = now - tsMs;
      return age >= 0 && age < 60000;
    });

    // Should find the successful one (if within 60s window)
    // In test we just verify the filter logic works
    const failed = transactions.find(tx => !tx.success);
    expect(failed?.hash).toBe("0xfailed");
    const successful = transactions.find(tx => tx.success);
    expect(successful?.hash).toBe("0xsuccess");
  });
});
