export interface FraudCheckResult {
  blocked: boolean;

  riskScore: number;

  reasons: string[];
}