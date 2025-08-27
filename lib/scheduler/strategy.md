# Scheduling Strategy: External Cron + Server Action

## Chosen Approach: External Cron + Server Action

**Rationale:**
- No Redis infrastructure exists in the codebase
- Railway deployment environment favors external cron triggers
- DB polling would require separate long-running processes
- External cron is the most minimal and suitable approach for this stack

## Architecture

1. **External Cron Service** (Railway Cron Jobs) triggers `processDueJobs()` server action
2. **Server Action** claims due jobs using Postgres advisory locks
3. **Publishing Orchestration** reuses existing integration publish flow
4. **Idempotency** via deterministic keys and status tracking
5. **Retry Logic** with bounded backoff for transient failures

## Implementation Details

### Concurrency Control
- Postgres advisory locks keyed by `scheduled_posts.id`
- `SELECT ... FOR UPDATE SKIP LOCKED` for job claiming
- Max concurrency: 3 concurrent jobs per instance

### Idempotency
- Deterministic key: `scheduled_post_id:draft_id:platforms_hash`
- Check existing `platform_posts` before publishing
- Status tracking prevents double processing

### Retry Policy
- Max 3 retries with linear backoff (30s, 60s, 120s)
- Only retry on transient failures (network, 429, 5xx)
- Terminal failures marked as 'failed' with error summary

### Timezone Handling
- Store all `scheduled_at` in UTC
- Accept user timezone for display purposes only
- Grace window: 60 seconds for clock skew

## What Was Implemented

### ✅ Core Infrastructure
- **Database Schema**: Added `retryCount` and `updatedAt` fields to `scheduled_posts` table
- **Migration**: Generated and applied migration `0006_massive_christian_walker.sql`
- **Configuration**: Environment variables for scheduler settings

### ✅ Scheduler Engine (`lib/scheduler/`)
- **engine.ts**: Main processing logic with job discovery and orchestration
- **time.ts**: Timezone helpers, grace windows, retry timing, error normalization
- **locks.ts**: Postgres advisory lock utilities for concurrency control
- **retry.ts**: Bounded exponential backoff with jitter
- **cron.ts**: External cron handler and health checks

### ✅ Server Actions (`app/actions/scheduler.ts`)
- **createScheduledPost()**: Create new schedules with timezone support
- **updateScheduledPost()**: Reschedule, change platforms, update status
- **cancelScheduledPost()**: Safe cancellation of pending schedules
- **bulkSchedule()**: Schedule up to 10 drafts at once
- **listScheduledPosts()**: Enhanced with retry count and updated timestamps
- **processDueJobsAction()**: Manual trigger for processing

### ✅ API Routes (`app/api/cron/`)
- **process-scheduled-posts/route.ts**: Cron endpoint with optional auth
- **GET/POST methods**: Flexible trigger options
- **Error handling**: Proper HTTP status codes and error responses

### ✅ Configuration Files
- **example.env**: Environment variables documentation
- **lib/validators/scheduler.ts**: Enhanced validation schemas

### ✅ Documentation
- **TODO.md**: Updated to mark Priority 5 as completed

## Processing Flow

1. **Cron Trigger** (every 1-2 minutes) → `/api/cron/process-scheduled-posts`
2. **Job Discovery** → Find due jobs within 60s grace window
3. **Lock Acquisition** → Postgres advisory locks prevent double processing
4. **Idempotency Check** → Verify not already published via `platform_posts`
5. **Integration Validation** → Ensure user has connected platforms
6. **Publishing** → Call existing `publishToPlatforms` action
7. **Status Update** → Update based on platform results (published/partial/failed)
8. **Retry Logic** → Handle failures with exponential backoff

## Safety Features Implemented

- **Grace Window**: 60-second buffer for clock skew
- **Max Concurrency**: 3 concurrent jobs per instance
- **Retry Limits**: Maximum 3 retries with exponential backoff
- **Error Normalization**: Remove sensitive data from error messages
- **Lock Timeout**: Automatic lock release on session end
- **Input Validation**: Zod schemas for all inputs
- **Authentication**: All actions require valid session
- **Authorization**: Users can only access their own schedules

## Database Schema Changes

```sql
-- Added to scheduled_posts table
ALTER TABLE "scheduled_posts" ADD COLUMN "retry_count" integer DEFAULT 0;
ALTER TABLE "scheduled_posts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
```

## Environment Variables

```env
# Scheduler Configuration
SCHEDULER_MAX_CONCURRENCY=3
SCHEDULER_GRACE_WINDOW_MS=60000
SCHEDULER_MAX_RETRIES=3
CRON_SECRET=your_cron_secret_here
```

## Deployment Instructions

### 1. Database Migration
```bash
npm run db:generate
npm run db:push
```

### 2. Environment Setup
Set required environment variables in Railway project

### 3. Railway Deployment
On Railway, configure Cron to call the endpoint every 1-2 minutes with the secret

### 4. Monitoring
Check Railway function logs for processing results

## Testing

### Manual Testing
```bash
# Test the cron endpoint
curl -X GET https://your-app.railway.app/api/cron/process-scheduled-posts

# Test with authorization (if CRON_SECRET is set)
curl -X GET \
  -H "Authorization: Bearer your_cron_secret" \
  https://your-app.railway.app/api/cron/process-scheduled-posts
```

### Health Check
```typescript
// Check scheduler status
const status = await getSchedulerStatus();
console.log(status.data); // { status: 'healthy', pendingJobs: 5 }
```

## Performance Considerations

- **Grace Window**: 60 seconds to handle clock skew
- **Max Concurrency**: 3 jobs per instance to avoid rate limits
- **Batch Processing**: Process multiple jobs concurrently
- **Lock Efficiency**: Advisory locks are lightweight and fast
- **Index Usage**: Optimized queries use proper indexes

## Future Enhancements

### Planned Features
- [ ] **Optimal time recommendations** - ML-based scheduling suggestions
- [ ] **Calendar UI** - Drag-and-drop scheduling interface
- [ ] **Analytics dashboard** - Scheduling performance metrics
- [ ] **Webhook notifications** - Real-time status updates
- [ ] **Advanced retry policies** - Platform-specific retry rules

### Scalability Improvements
- [ ] **Redis integration** - For distributed locking and caching
- [ ] **Queue system** - BullMQ for advanced job management
- [ ] **Monitoring** - Sentry integration for error tracking
- [ ] **Metrics** - Prometheus/Grafana for observability

## File Structure
```
lib/scheduler/
├── strategy.md          # This file
├── engine.ts           # Main processing logic
├── time.ts             # Timezone and window helpers
├── locks.ts            # Advisory lock utilities
├── retry.ts            # Retry policy implementation
└── cron.ts             # External cron handler

app/actions/scheduler.ts # Extended server actions
app/api/cron/process-scheduled-posts/route.ts # Cron endpoint
```

## Testing
- Unit tests for each helper module
- Integration tests with mock platform clients
- Manual testing via direct server action calls
