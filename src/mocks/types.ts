// Records are heterogeneous at the storage boundary; feature hooks retain their domain types.
export type MockRecord = Record<string, any>;
export type MockDatabase = Record<string, MockRecord | MockRecord[]>;
