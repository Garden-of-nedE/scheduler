# Development Notes

## Database
`POSTGRES_USER` - Environment variable used to start a PostgreSQL database in Docker, defines the main administrator. This user will have full control over the database.

`POSTGRES_PASSWORD` - Environment variable sets the administrators password for PostgreSQL. The authentification is set up *locally*, thus would only require password when connecting from a different host.

`POSTGRESS_DB` - Optional environment variable used to define a different name for default database that is created. 

*Note:* if `POSTGRES_PASSWORD` or `POSTGRES_DB` changed in compose file, must delete pre-exisiting volumes for fresh init.
    `docker compose down -v`

Persistance test involved creating a table within a healthy container. Followed by stopping the volume, and restarting it. This test showcased that any data hosed in the volume will persist after disconnecting; and ensures that the volume is mounted properly.

## Docker Notes
**Running** - Container's main process has started & not crashed

**Healthy** - Application within container is actively passing user-defined functional test (healthcheck)

## Backend
`pool_pre_ping = True` - pings the DB before resusing a pooled connection, provides clean reconnect if Postgres restarts or connection is stale.

`get_db()` - generator uses the `yield` FastAPI dependency, that routes session connection and prevents open DB connections from leaking.

`cascade = "all, delete-orphan"` - all data related to a deleted account will be removed.