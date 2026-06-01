import { redis } from "@/lib/redis";

import { FraudCheckResult }
from "@/types/fraud";

const USER_WINDOW_SECONDS = 60;

const USER_LIMIT = 5;

const IP_LIMIT = 20;

export async function checkVelocity(
  userId: string,
  ip: string
): Promise<FraudCheckResult> {

  let riskScore = 0;

  const reasons: string[] = [];

  // USER VELOCITY
  const userVelocityKey =
    `velocity:user:${userId}`;

  const userCount =
    await redis.incr(
      userVelocityKey
    );

  if (userCount === 1) {

    await redis.expire(
      userVelocityKey,
      USER_WINDOW_SECONDS
    );
  }

  if (userCount > 3) {

    riskScore += 40;

    reasons.push(
      "High user payment velocity"
    );
  }

  // IP VELOCITY
  const ipVelocityKey =
    `velocity:ip:${ip}`;

  const ipCount =
    await redis.incr(
      ipVelocityKey
    );

  if (ipCount === 1) {

    await redis.expire(
      ipVelocityKey,
      USER_WINDOW_SECONDS
    );
  }

  if (ipCount > 10) {

    riskScore += 30;

    reasons.push(
      "High IP payment velocity"
    );
  }

  // BLOCK DECISION
  const blocked =
    userCount > USER_LIMIT
    || ipCount > IP_LIMIT;

  return {
    blocked,
    riskScore,
    reasons,
  };
}