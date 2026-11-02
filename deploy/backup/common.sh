# Shared by backup.sh and restore.sh. Not run by itself.
#
# Everything runs inside the postgres container, so the VPS needs no PostgreSQL tools.
# The container already knows POSTGRES_USER and POSTGRES_DB, so .env is never sourced
# (some of its values have spaces and < >, which a shell would try to run).

set -euo pipefail

# The folder with compose.yml and .env. On the VPS that is the folder above this one.
# To try the scripts on your own computer, run them with ORBI_DIR set to the repository root.
ORBI_DIR="${ORBI_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BACKUP_DIR="${BACKUP_DIR:-$ORBI_DIR/backups}"

log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die() {
	log "ERROR: $*" >&2
	exit 1
}

# The containers that use the database. On your own computer the app runs with pnpm,
# so set APP_SERVICES to empty there and stop pnpm dev yourself.
APP_SERVICES="${APP_SERVICES-server client}"

compose() { docker compose --project-directory "$ORBI_DIR" "$@"; }

# Stops or starts the app containers; with none listed, compose would act on postgres too
app_services() {
	[ -n "$APP_SERVICES" ] || return 0
	# shellcheck disable=SC2086 # the list is split on purpose
	compose "$1" $APP_SERVICES
}

# One setting from the environment or .env, or the default when it is missing or empty
env_value() {
	local value=${!1:-}
	[ -n "$value" ] || value=$(grep -E "^$1=" "$ORBI_DIR/.env" 2>/dev/null | tail -n 1 | cut -d= -f2- | tr -d '\r') || true
	printf '%s' "${value:-$2}"
}

# Runs a shell command in the postgres container; stdin is passed through
pg_sh() { compose exec -T postgres sh -c "$1"; }

# The name of the app's database, as the container knows it
# (stdin is closed, or docker would read the answer meant for a later prompt)
app_db() { pg_sh 'printf %s "$POSTGRES_DB"' </dev/null; }

# Runs the SQL from stdin against a database, with extra psql flags
psql_run() { pg_sh "psql -U \"\$POSTGRES_USER\" -d '$1' -v ON_ERROR_STOP=1 $2"; }

# Runs SQL and prints only the values. The maintenance database "postgres" is used to create,
# drop, and rename the others, because a database cannot be dropped while connected to it.
sql() { psql_run "$1" -qAtX <<<"$2"; }

# quiet when the database is not there
drop_db() {
	sql postgres "SET client_min_messages = warning; DROP DATABASE IF EXISTS \"$1\" WITH (FORCE);"
}

# Restores a dump into a new, empty database
restore_into() {
	local db=$1 file=$2
	[ -s "$file" ] || die "No backup at $file"
	drop_db "$db"
	sql postgres "CREATE DATABASE \"$db\";"
	pg_sh "pg_restore -U \"\$POSTGRES_USER\" -d '$db' --no-owner --exit-on-error" <"$file" \
		|| die "Could not restore $file into $db"
}

# The number of rows in every table, so you can see the data is there
count_rows() {
	psql_run "$1" -qX <<-'SQL'
		SELECT table_schema || '.' || table_name AS "table", (xpath('/row/c/text()',
			query_to_xml(format('SELECT count(*) AS c FROM %I.%I', table_schema, table_name), false, true, '')))[1]::text::bigint AS "rows"
		FROM information_schema.tables
		WHERE table_type = 'BASE TABLE' AND table_schema IN ('public', 'drizzle')
		ORDER BY 1;
	SQL
}
