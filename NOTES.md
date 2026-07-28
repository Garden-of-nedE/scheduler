# Development Notes

## Design Choices
### Docker
A single docker container is utilised to compose the App and Postgres backend. Building using docker to ensure that project is functional across various operating systems (Windows & Mac), whilst ensuring that any dependencies for the project are self-contained. Minimise bloating local system memory with various libraries.

### FastAPI & SQLAlchemy Backend
Project eventually will allow different computer systems (Windows & Mac) to communicate via the internet, utilising REST API. Framework only requires a single declaration for parameter types in standard Python via Pydantic library. Interactive API docs, via Swagger UI, allows for local testing to be conducted easily.  `OAuth2` built-in tool allows the frontend to authenticate with the backend, for security.

### Vite Frontend
I was looking for a tool that that was simple and required very little configuration, as this is my first proper frontend project. Vite allowed me to focus on learning React and JavaScript instead of build tools. Vite is also able to run my app quickly, allowing me to tweak and test on a more regular basis.

### Alembic Migrations
Replaces ad-hoc `Base.metadata.create_all()` schema management (which can only create new tables, never alter existing ones) with proper, version-tracked migrations. `env.py` reads the database URL from `app.config.settings` rather than duplicating it in `alembic.ini`, so there's a single source of truth for the connection string. Going forward, schema changes follow: edit `model.py` &rarr; `alembic revision --autogenerate -m "..."` &rarr; review the generated file &rarr; `alembic upgrade head`. Autogenerate output is not blindly trusted; reviewing the generated migration file before applying it is necessary, since autogenerate can misinterpret certain changes (e.g. treating a column rename as a drop-and-add pair).

## Build Stages
1. Functional Postgres within Docker &rarr; Confirm that Docker networking works before moving forward
2. Database models &rarr; Define tables in SQLAlchemy before routing
3. Full vertical slice for Authentication &rarr; Ensure Auth from end-to-end is established, heavily relied on for project
4. Fully CRUD one table &rarr; Ensure that contents of ONE table is fully CRUD'd before moving on. Schema &rarr; router &rarr; test
5. CRUD other tables
6. Frontend set up &rarr; Final touches once API is established

## Miscellaneous Notes
### Database
`POSTGRES_USER` &mdash; Environment variable used to start a PostgreSQL database in Docker, defines the main administrator. This user will have full control over the database.

`POSTGRES_PASSWORD` &mdash; Environment variable sets the administrators password for PostgreSQL. The authentification is set up *locally*, thus would only require password when connecting from a different host.

`POSTGRESS_DB` &mdash; Optional environment variable used to define a different name for default database that is created. 

*Note:* if `POSTGRES_PASSWORD` or `POSTGRES_DB` changed in compose file, must delete pre-exisiting volumes for fresh init.
    `docker compose down -v`

Persistance test involved creating a table within a healthy container. Followed by stopping the volume, and restarting it. This test showcased that any data hosed in the volume will persist after disconnecting; and ensures that the volume is mounted properly.

### Docker
**Running** &mdash; Container's main process has started & not crashed

**Healthy** &mdash; Application within container is actively passing user-defined functional test (healthcheck)

### Backend
`pool_pre_ping = True` &mdash; pings the DB before resusing a pooled connection, provides clean reconnect if Postgres restarts or connection is stale.

`get_db()` &mdash; generator uses the `yield` FastAPI dependency, that routes session connection and prevents open DB connections from leaking.

`cascade = "all, delete-orphan"` &mdash; all data related to a deleted account will be removed.

### models.py
`Course` is a global feature to allow for users to compare timetables.

### Swagger
**Authorization Process**

Sends request behind the scenes to `POST /api/auth/login` with provided form data. On success, Swagger automatically stores the returned `access_token` and attaches it as `Bearer` header to every subsequent requrest made from the UI. On failure, `401` occurs.

Test: `GET /api/auth/me` &rarr; Entire auth chain works end-to=end, if user is returned or a code `200 OK` is returned.

`204 No Content` &rarr; expected return value on successful deletion of data entry.

### schemas.py
`TimetableEntryUpdate` &rarr; deliberately makes every field optional for easier partial updates. Does not force the user to resend unchanged details. Inheriting from `TimetableEntryBase`, where fields are *required*, makes create validate strictly whilst updates are flexible.

`_get_entry_or_404` filters on **both** `id` & `user_id` to prevent one user from editing or deleteing the timetable of another.

`Assessment.completed` defaults to `False` ensures that the frontend checkbox remains empty upon creation of the task. This status should only every be **updated**, rather than chosen on task creation.

Recurring assessments: `skip_date` stretch the series of tasks across more calendar weeks, rather than reducing the total quiz count.

### Calendar
Spent time investigating what looked like a data-matching bug in calendarUtils.js, but the root cause was simply testing against the wrong date. The event existed and the function worked correctly, I just queried a date that didn't match. Lesson: before assuming a filtering/matching function is broken, confirm that the actual values being compared line up as expected. A 'no results' output is often correct behaviour for mismatched inputs, not necessarily a bug.

## Noteable Lesson Log
### Backend — CORS error masking a missing middleware block
**Symptom:** Login request showed a `200` status in Network tab, but the browser console reported a CORS error and the frontend never received the response data.

**Cause:** `main.py` was missing its `CORSMiddleware` registration - likely dropped during an earlier edit when the `timetable` router was added. The backend had genuinely processed the request correctly; the browser simply refused to hand the repsonse to JavaScript without the `Access-Control-Allow-Origin` header.

**Fix:** Re-added teh `CORSMiddleware` block to `main.py`, explicitly allowing `http://localhost5174`

**Lesson:** A `200` code in the Network tab does not mean the frontend actually received usable data, CORS blocks happen *after* a successful server response, at the browser's own security layer. When CORS errors appear despite a healthy status code, check the *whole* `main.py` file for missing middleware rather than assuming the request itself failed. This exact pattern (CORS error masking a different root cause) recurred later with a genuine `404` on an unregistered router.

### Backend — 500 on Assessment update from nullable-field validation gap
**Symptom:** Updating an assessment through `PUT /api/assessment/{id}` interminttently returned a `500 Internal Server Error`, with no obvious pattern at first.

**Cause:** `AssessmentUpdate`'s fields were declared as `Optional[X] = None`, which Pydantic reads two different ways at once: "this field doesn't have to be sent" and "this field's value is allowed to null". A client explicitly sending a field as `null` (rather than omitting it) passed validation, then hit a database `NOT NULL` constraint or unguarded comparison against a `None` value further down the route.

**Fix:** Added an explicit guard in the `PUT` route that rejects `null` for any field that's genuinely non-nullable at the database level, before the update proceeds. Applied the same fix retroactively to the Timetable router's update route, since it had the identical structural gap.

**Lesson:** `Optional[X] = None` in Pydantic fuses "not required in the request" with "nullable value". Any `Update` schema needs a deliberate decision, enforced in the route, about which fields may legitimately be set to `null` verses which should only ever be *omitted* if unchanged.

### Frontend — Blank page traced to a typo, not the Vite version
**Symptom:** The app rendered a completely blank page with no visible error, and the browser console showed `Cannot read properties of undefined (reading 'VITE_API_URL')`. The same error persisted across several unrelated fixes, including pinning Vite to an older version.

**Casue:** `client.js` had `import.meta.evn` instead of `import.meta.env`, a simple typo. `evn` resolved to `undefined`, so accessing `.VITE_API_URL` on it threw. The Vite-version theory was a plausible-sounding but incorrect guess.

**Fix:** Corrected the typo. No tooling/versioning changes were actually necessary.

**Lesson:** When one exact error message survives multiple different fixes, go straight to the file and line number names in the traceback and read it character by character, rather than reasoning about broader systematic causes (tool versions, config) first. The traceback was pointing at the answer from the very first error.

### Frontend — CORS error masking an unregistered route (recurrence of the above)
**Symptom:** After adding the Enrollments router, creating an enrollment through the UI failed with a CORS error in the console.

**Cause:** The route was genuinely a `404` — `enrollments.router` had never been included in `main.py`. As with the earlier CORS incident, a request that never matches a real route doesn't reliably get CORS headers attached to its error response, so the browser reports it as a CORS block rather than a clean 404.

**Fix:** Added the missing `app.include_router(enrollments.router)` call.

**Lesson:** Confirmed this is a recurring pattern, not a one-off: any time a CORS error appears right after adding a new router or endpoint, check route registration in `main.py` (`from app.routers import ...` and `app.include_router(...)`) before assuming it's a genuine CORS configuration problem.

### Frontend — Logged-out students unable to add classes, traced to a typo, not JWT
**Symptom:** After logging out and back in as a different/same student, the enrolled courses appeared correctly in dropdowns, but submitting a Timetable entry or Assessment against them failed with "not enrolled," even though the course was visibly listed.

**Cause:** The `<option>` elements' `value` attribute was accidentally built by concatenating `course_code` and `course_name` together (e.g. `"soft5432 software"`) instead of using `course_code` alone. The dropdown's visible *label* was correct, but the actual submitted *value* was a different, malformed string; so the backend's enrollment check correctly failed to find a match, because the string genuinely didn't correspond to any real course code.

**Fix:** Corrected the `<option value={...}>` to use only `course_code`, separately from the human-readable label text between the tags.

**Lesson:** A `<select>`'s visible label and its submitted `value` are two separate things — always double-check what's actually being submitted (via the Network tab's request payload), not just what's displayed, when a dropdown "looks right" but produces unexpected server-side results.

### Frontend — Timetable week-grid alignment (hour labels + entry positioning)
**Symptom:** Two related issues while building the custom weekly time-grid: 
1. hour labels ("7 AM", "8 AM", etc.) were clipped at the top/bottom edge of the grid, and 
2. class entries rendered visually below where they should start relative to their hour markers.

**Cause 1:** The grid's rendered height exactly matched the last hour mark's position, leaving no room for label text to render without being clipped by the container.

**Cause 2, found via temporary debug gridlines drawn at the exact computed coordinates:** `HEADER_HEIGHT` was being added to the entry's `top` calculation twice — once directly in the entry's own positioning formula, and a second time from a leftover `padding-top` elsewhere in the day-body's CSS that effectively duplicated the same offset. An additional 2px of unaccounted-for padding compounded the discrepancy further.

**Fix:** Extended `DAY_START_MIN`/`DAY_END_MIN` by an hour on each end and sliced them to obtained the desired hour labels. Removed the duplicate `HEADER_HEIGHT` application and the extra 2px padding, leaving exactly one place where the header offset is added to each entry's position.

**Lesson:** When a value like `HEADER_HEIGHT` needs to be applied consistently, it's just as easy to accidentally apply it *twice* (once in JS math, once again via CSS padding meant to achieve the same visual effect) as it is to forget it entirely. Both produce a fixed consistent-looking offset that's easy to misdiagnose as "off by some mysterious amount" rather than "the same adjustment applied from two different places." When alignment bugs are hard to pin down from visual scrutiny alone, temporary debug markers (a colored line drawn at the exact pixel coordinate the code calculates) turn a vague "looks slightly off" into a precise, comparable measurement. This same technique resolved the Calendar's week-view alignment issue too.

### Frontend — Week-grid column collapse from missing `min-width: 0`
**Symptom:** Wrapping the Timetable week-grid in a scrollable container caused all seven day-columns to collapse into a single full-width column instead of displaying side by side, despite `.week-grid` correctly having `display: flex` and every `.week-grid-day` correctly having `flex: 1`.

**Cause:** Flex items have an implicit default `min-width: auto`, meaning they won't shrink below their content's natural width even when `flex: 1` says they should be able to. Combined with `overflow-x: hidden` on the new scrolling wrapper, this produced inconsistent width distribution across the flex children.

**Fix:** Added `min-width: 0` to `.week-grid-day`, removing the implicit content-based floor and letting `flex: 1` distribute width purely proportionally as intended.

**Lesson:** Any time flex children with `flex: 1` don't distribute space as expected, especially inside a container with `overflow` set, check for a missing `min-width: 0` on the children first. This is a well-known, common flexbox gotcha, not a sign the flex setup itself is fundamentally wrong.

### Frontend — Calendar month/week matching failed silently: timezone conversion, not a logic bug
**Symptom:** A confirmed-existing event didn't appear on its correct date in either the month or week calendar view, despite `calendarUtils.js` having already been verified correct against direct console tests.

**Cause:** `toDateString()` used `date.toISOString().slice(0, 10)`, but `toISOString()` always converts to UTC first. Dates constructed in local time (as every date in this app is) could shift to the previous or next calendar day once converted to UTC, depending on the local timezone offset and time of day. Causing the computed date string to mismatch the stored `event_date`/`due_date` even though
both nominally represented "the same day."

**Fix:** Rewrote `toDateString()` to build the string from the date's local components (`getFullYear()`, `getMonth()`, `getDate()`) instead of going through `toISOString()`, avoiding any UTC conversion entirely.

**Lesson:** `toISOString()` is timezone-converting, not timezone-neutral. Safe for values that are genuinely meant to represent an exact instant, but the wrong tool for comparing plain calendar dates (which were never timezone-aware to begin with, since they came from `<input type="date">`). Building date strings from local getters avoids this entire class of off-by-one-day bug.

### Backend — Recurring assessments route drifted out of sync with schema renames
**Symptom:** `POST /api/assessments/recurring` returned various errors over several iterations (`AttributeError`, malformed JSON from a manual test payload, a `500` from calling `.date()` on a plain `date` object) while being revisited after earlier `Assessment` field renames (`due_date` &rarr; split into `date`/`deadline`, `title` &rarr; `task_name`).

**Cause:** The route had been written before those renames and was never updated to match — it referenced fields (`due_date`, `title`) that no longer existed on the current schema, and mixed `datetime`/`date` types inconsistently once `RecurrenceCreate.first_due_date` was changed from `datetime` to `date`.

**Fix:** Rewrote the route field-by-field against the current schema, removed the redundant `get_or_create_course` call in favor of the same plain enrollment check used by the single-item create route (per the enrollment-gated design decision), and corrected the `skip_dates` comparison to compare two `date` objects directly rather than calling `.date()` on an object that no longer had that method.

**Lesson:** When a shared field gets renamed or re-typed, every route that constructs or reads that field needs to be re-checked — a `grep` across the codebase for the old name is more reliable than trying to remember every call site. A route that isn't exercised regularly (like this one, revisited only occasionally) is exactly where this kind of drift goes unnoticed longest.

### Backend/Frontend — Event `date` field collided with the Python `date` type
**Symptom:** `EventUpdate`'s `date` field, correctly declared as `Optional[date] = None` in the source file (confirmed both locally and by viewing the file directly inside the running container), behaved at runtime as if typed `NoneType`, rejecting any real date value with `"Input should be None."` Restarting and even fully rebuilding the container did not fix it.

**Cause:** Never fully confirmed. Ruled out: stale file content, a duplicate class definition, a missing import, and the isolated Pydantic/Optional mechanism itself (tested in a minimal standalone script and found to work correctly). The most likely explanation is some form of name shadowing between the field name `date` and the imported `datetime.date` type, though the exact mechanism was never pinned down.

**Fix:** Renamed the field from `date` to `event_date` across the model, schema, router, and frontend form. This resolved the issue immediately.

**Lesson:** Naming a field identically to a built-in type it's annotated with (`date: date`) is legal Python but a real, if rare, risk — even when every conventional diagnostic (file content, duplicate definitions, isolated reproduction) comes back clean, the collision itself can still be the cause. Sidestepping a stubborn bug by renaming away from a risky pattern is a legitimate resolution, even without a fully confirmed root cause — not every bug needs to be root-caused to be correctly fixed.

Timetable grid UI resulted in quite a time consuming issue, in which the `hourMarks` were being cut off by the horizontal borders of the table and misaligned class blocks. The `hourMarks` issue was somewhat resolved by extending the `DAY_START_MIN` and `DAY_END_MIN` constants and splicing the before the component is mapped into the table. The misaligned class blocks were off by 30px, which was due to unexpectedly doubling the `HEADER_HEIGHT` within the `week-grid-day` component, as well as not accounting for 2px padding. 

### Backend — Alembic's first migratin surfaced real orphaned data
**Symptom:** Setting up Alembic and generating a bseline migration against eht existsing database, `alembic upgrade head` failed partway through with an `IntegrityError`: insert or update on table "assessments" violates foreign key constaint "assessments_user_id_fkey". A specific `user_id` referenced by an assessment row didn't exist in the `users` table.

**Cause:** Multiple manual `DROP TABLE`/recreate cycles during development (used in place of proper migrations) had, at some point, dropped and recreated `users` without cleaning up dependent rows in `assessments`, `enrollments`, `events` and `timetable_entries`. Those tables had never properly *enforced* foreign key constsinta on `user_id` until this migration tried to add one. So the orphaned rows had been silently sitting in the databse the whole time, invisible to any query that didn't specifically go looking for them.

**Fix:** Queried each affecte table for rows whose `user_id` didn't match any real row in `users` [`WHERE user_id NOT IN (SELECT id FROM users)`], confirmed the row counts looked like accumulated test-account debris, rather than anything meaningful. Deleted the orphaned rows table by table, then re-ran `alembic upgrade head`, which completed successfully once every remaining row had a valid reference.

**Lesson:** Without real, enforced foreign key constraints, a database can silently accumulate orphaned data indefinitely; nothing fails, nothing warns you. The rows sit there disconnected until something finally checks it. THis is a concrete, first-hand example of why the constraints (and Alembic migrations that properly manage them) matter beyond just "best practice". The very first real migration caught and forced a fix for corruption that had been invisible the entire project so far. Also confirmed that ad-hoc `DROP TABLE`/recreate cycles, however convenient during early development, aren't a substiture for migrations even before "real" users exists; the data-integrity gap they create is real regardless of who the data belongs to.

### Backend — `create_all()` silently coexisiting with Alembic caused confusing state
**Symptom:** After a full databse volume wipe, `alembic upgrade head` appeared to do nothing, and `alembic current` showed no tracked revision at all. Despite teh application's tables clerly existing and the app working normally.

**Cause:** `Base.metadata.create_all()` was still present in `main.py`, running on every backend startup adn silently recreating all tables before Alembic ever got a chance to manage them; completely bypassing Alembic's version tracking, since `create_all()` has no awareness of migrations.

**Fix:** Removed `Base.metadata.create_all()` from `main.py` entirely. Reset the schema to empty and let `alembic upgrade head` build it from scratch as the sole schema authority.

**Lesson:** Once Alembic is adopted, `create_all()` must be removed, not just left "harmlessly" alongside it. The two mechanisms silently fight for control over the schema. `create_all()` always wins by running first on every startup, making it appear as if Alembic is broken when it's actually just never getting the change to act.