// lib/redis.ts
import Redis from 'ioredis';

const redisClientFactory = () => {
  // Lấy URL cấu hình từ file .env.local, nếu không có sẽ tự động chạy ở localhost cổng 6379
  return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
};

type RedisClientSingleton = ReturnType<typeof redisClientFactory>;

const globalForRedis = globalThis as unknown as {
  redis: RedisClientSingleton | undefined;
};

// Kiểm tra nếu đã có instance Redis kết nối rồi thì dùng lại, chưa có thì mới tạo mới
export const redis = globalForRedis.redis ?? redisClientFactory();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;