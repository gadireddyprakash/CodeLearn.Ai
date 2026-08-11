# 🚀 API Performance Load Test Report

> **Executed On:** 11/8/2026, 9:42:21 am  
> **Target Endpoint:** `http://localhost:5000/api/health`  
> **Virtual Users:** `100 concurrent VUs`  
> **Duration:** `60 seconds`  

---

## 📊 Performance Metrics Summary

| Metric | Result | Target / SLA | Status |
|---|---|---|---|
| **SLA Status** | ❌ **FAIL** | Avg < 250ms & Success >= 99% | 🔴 Failed |
| **Total Requests** | `79826` | N/A | ℹ️ |
| **Success Rate** | `0.25%` | `>= 99.0%` | 🔴 |
| **Throughput (RPS)** | `1327.8 req/sec` | N/A | ℹ️ |
| **Average Latency** | `75.0 ms` | `<= 250 ms` | 🟢 |
| **Median (p50) Latency** | `75.8 ms` | N/A | ℹ️ |
| **95th Percentile** | `93.6 ms` | `<= 500 ms` | 🟢 |
| **99th Percentile** | `147.6 ms` | `<= 1000 ms` | 🟢 |

---

## 📈 Response Latency Distribution

```
  [Fastest]   0.7 ms
  [50% (p50)]  75.8 ms (Median)
  [90% (p90)]  86.6 ms
  [95% (p95)]  93.6 ms
  [99% (p99)]  147.6 ms
  [Slowest]   204.5 ms
```

---

## 🚫 Error Analytics

The following failures were recorded during the load simulation:

| Error Type / HTTP Status | Occurrences | Percentage of Total |
|---|---|---|
| `HTTP_429` | 79627 | 99.75% |


---

## 💡 Performance Recommendations

1. **Keep-Alive Configuration**: Ensure that both frontends and API servers utilize HTTP Keep-Alive properly to reduce TCP handshake overhead. Under high concurrency, setting Keep-Alive saves significant CPU resources.
2. **Database Connection Pool Optimization**: Check Mongoose connection pool parameters. In Express apps, a default pool size of 5 may create database query queues. Consider increasing pool size:
   ```js
   mongoose.connect(URI, { maxPoolSize: 50 });
   ```
3. **Caching Strategy**: Implement local memory caching (like `memory-cache` or Redis) on static, frequently queried routes like `/api/health` or `/api/problems`.
4. **Rate Limiting Settings**: Review rate-limiting limits. The current limits may reject users under normal peaks, returning `HTTP 429` errors. Align limits with standard business projections.
