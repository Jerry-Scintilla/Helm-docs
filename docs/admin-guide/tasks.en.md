# Background Tasks

Helm uses **Celery + Redis** to run background tasks, primarily for scheduled ESI data sync and custom plugin task execution.

## Task History

Go to **Admin Panel → Task History** (`/admin/tasks`) to view execution records for all background tasks:

| Column | Description |
|--------|-------------|
| Task Name | Full Celery task path, e.g. `app.tasks.sync_character` |
| Started At | Timestamp when the task began executing |
| Finished At | Timestamp when the task completed |
| Status | `success` / `failure` / `running` |
| Result | Task return value or error message summary |

## Built-in ESI Sync Tasks

Helm includes the following scheduled ESI sync tasks:

| Task | Default Interval | Description |
|------|-----------------|-------------|
| `sync_character_info` | 1 hour | Sync character basic info |
| `sync_character_skills` | 1 hour | Sync skills |
| `sync_character_assets` | 6 hours | Sync assets |
| `sync_character_wallet` | 30 minutes | Sync wallet journal |
| `sync_character_mail` | 30 minutes | Sync mail |
| `sync_character_notifications` | 30 minutes | Sync notifications |
| `sync_corporation_members` | 1 hour | Sync corporation members |
| `sync_corporation_assets` | 6 hours | Sync corporation assets |

These tasks run in **Buckets**: each bucket contains a group of characters and fetches ESI data in bulk to avoid exceeding CCP's rate limits.

## Bucket Configuration

Helm assigns characters to different buckets, and each bucket triggers one ESI refresh per configured interval. Bucket size is controlled by `ESI_REFRESH_BUCKET_SIZE` in `.env` (default: 50).

## Manually Trigger a Task

Administrators can manually trigger a specific task via API (without waiting for the next scheduled interval):

```bash
# Immediately sync a specific character's data
curl -X POST http://your-helm/api/v1/admin/tasks/sync-character \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"character_id": 123456789}'
```

## Plugin Tasks

Celery tasks registered by enabled plugins also appear in the task history. Task names typically follow the `{plugin_name}.{task_name}` format.

!!! important "Worker Restart"
    When a new plugin registers Celery tasks, you must **restart the Celery Worker** for the tasks to take effect:

    ```bash
    celery -A app.tasks.celery_app worker --loglevel=info
    ```

## Worker Status Monitoring

Use Celery's Flower tool to monitor worker status in real time (requires separate installation):

```bash
pip install flower
celery -A app.tasks.celery_app flower --port=5555
# → http://localhost:5555
```

Or check queue backlog via Redis CLI:

```bash
redis-cli llen celery
```

## FAQ

**Q: A task is stuck in `running` status?**

A: The worker may have crashed. Check whether the worker process is running and restart it — task status will update automatically.

**Q: ESI data hasn't been updated in a long time?**

A: Check the following:
1. Is the Celery Worker running?
2. Is the Redis connection healthy?
3. Are ESI tokens expired? (Users may need to re-authorize via SSO)
4. Is the CCP ESI service up? (Check the [ESI status page](https://esi.evetech.net/status.json))
