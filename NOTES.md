# Development Notes

## Database set up
`POSTGRES_USER` - Environment variable used to start a PostgreSQL database in Docker, defines the main administrator. This user will have full control over the database.

`POSTGRES_PASSWORD` - Environment variable sets the administrators password for PostgreSQL. The authentification is set up *locally*, thus would only require password when connecting from a different host.

`POSTGRESS_DB` - Optional environment variable used to define a different name for default database that is created. 

*Note:* if `POSTGRES_PASSWORD` or `POSTGRES_DB` changed in compose file, must delete pre-exisiting volumes for fresh init.
    `docker compose down -v`

## Docker Notes
**Running** - Container's main process has started & not crashed

**Healthy** - Application within container is actively passing user-defined functional test (healthcheck)