# Development Notes

## Design Choices
### Docker
A single docker container is utilised to compose the App and Postgres backend. Building using docker to ensure that project is functional across various operating systems (Windows & Mac), whilst ensuring that any dependencies for the project are self-contained. Minimise bloating local system memory with various libraries.

### Flask Backend
Project eventually will allow different computer systems (Windows & Mac) to communicate via the internet, utilising REST API. Framework only requires a single declaration for parameter types in standard Python via Pydantic library. Interactive API docs, via Swagger UI, allows for local testing to be conducted easily.  `OAuth2` built-in tool allows the frontend to authenticate with the backend, for security.

## Build Stages
1. Functional Postgres within Docker &rarr; Confirm that Docker networking works before moving forward.
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

Snends request behind the scenes to `POST /api/auth/login` with provided form data. On success, Swagger automatically stores the returned `access_token` and attaches it as `Bearer` header to every subsequent requrest made from the UI. On failure, `401` occurs.

Test: `GET /api/auth/me` &rarr; Entire auth chain works end-to=end, if user is returned or a code `200 OK` is returned.

### schemas.py
`TimetableEntryUpdate` &rarr; deliberately makes every field optional for easier partial updates. Does not force the user to resend unchanged details. Inheriting from `TimetableEntryBase`, where fields are *required*, makes create validate strictly whilst updates are flexible.

`_get_entry_or_404` filters on **both** `id` & `user_id` to prevent one user from editing or deleteing the timetable of another.

## Revisit Points
Course deletion policy, duplicate-request handling logic at a later stage.

Course creation &rarr; `course_name` is currently not a required field of `TimetableEntry`; made a pragmatic choise to add `course_name` to `TimetableEntryCreate` so that TimetableEntry CRUD can be completed. (16/07)\
A separate Course router will be created to list/create courses independently *before* submitting a timetable entry. \
Current implementation: get or create pattern will first check for existing Course before creating it. \
Attached limitation &rarr; theoretical race condition if two requests for same course code occurs, need to include a database level `ON CONFLICT DO NOTHING` constraint. 