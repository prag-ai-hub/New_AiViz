# Coding standards — aiviz-backend

## File-size budget (enforced by ruff + reviewer eyes)

| Type | Max lines |
|------|-----------|
| Service | 150 |
| View | 80 |
| Serializer | 80 |
| Selector | 60 |
| Repository | 120 |
| Task | 100 |
| Model | 120 |

Split aggressively. Five 80-line files beat one 400-line file.

## No god files

Never:

- `utils.py`, `helpers.py`, `services.py`, `views.py` containing 20 unrelated things.

Always:

- `services/generate_ai_response.py`
- `services/award_xp.py`
- `selectors/get_user_sessions.py`
- `repositories/save_streaming_messages.py`

One purpose, one file. The filename is the function name in snake_case.

## Naming

| Kind | Naming |
|------|--------|
| Model | `PascalCase` singular (`Session`, `XPEvent`) |
| Service function | `snake_case` verb (`generate_ai_response`) |
| Selector function | `get_*` or `list_*` |
| Repository function | imperative (`save_messages`, `record_quota_use`) |
| Constants | `UPPER_SNAKE` |
| Celery task | `*_task` (`generate_video_task`) |

## Where logic lives

| Logic | Where |
|-------|-------|
| Validation of request shape | DRF serializer |
| Business validation | service |
| DB read | selector |
| DB write (single row) | service via `Model.objects.update()` |
| DB write (multi-row or transactional) | repository |
| External API call | `infrastructure/<provider>/` adapter, invoked by service |
| Async work | task (Celery) — services dispatch tasks, never await them inline |

## Don'ts

- ❌ Calling external SDKs (OpenAI, Razorpay, Replicate) directly inside a view.
- ❌ Importing `models` inside `views.py` and writing queryset filters in the view.
- ❌ Catching `Exception` broadly. Catch the specific class.
- ❌ Touching another app's models directly. Go through that app's service/selector.
- ❌ Adding business logic in `signals/`. Signals are subscribers that *delegate* to services.

## Linting / formatting

```bash
ruff check .
ruff format .
mypy .                     # gradual; tighten over time
```

Config in `pyproject.toml`. Pre-commit hook recommended.
