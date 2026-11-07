#!/usr/bin/env bash
# Restores a backup made by backup.sh.
#   bash backup/restore.sh --check <file>   restores into a throwaway database, shows the rows, and drops it
#   bash backup/restore.sh <file>           replaces the app's database with the backup
# Steps and when to use which: "Backups" in docs/deployment.md.

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

usage() { die "Use: restore.sh [--check] <backup file>"; }

check() {
	local file=$1 db=orbi_restore_check
	log "Restoring $file into the empty database $db"
	restore_into "$db" "$file"
	count_rows "$db"
	drop_db "$db"
	log "The backup restores. $db is dropped again; the app's database was not touched."
}

confirm() {
	local db=$1 answer
	printf 'This replaces the database "%s" with the backup. The app is down for a moment.\n' "$db"
	read -r -p "Type the database name to go on: " answer || true
	[ "$answer" = "$db" ]
}

# The backup goes into a new database first, so a broken file never touches the live data.
# The live database is kept under another name until you drop it.
replace() {
	local file=$1 db
	db=$(app_db)
	local restored="${db}_restore" before="${db}_before_$(date -u +%Y%m%d%H%M%S)"

	log "Restoring $file into $restored"
	restore_into "$restored" "$file"
	count_rows "$restored"
	if ! confirm "$db"; then
		drop_db "$restored"
		die "Stopped. Nothing was changed."
	fi

	# a database cannot be renamed while the server is connected to it
	log "Stopping the app"
	app_services stop
	sql postgres "ALTER DATABASE \"$db\" RENAME TO \"$before\";"
	sql postgres "ALTER DATABASE \"$restored\" RENAME TO \"$db\";"
	# the server applies any newer migrations when it starts
	log "Starting the app"
	app_services start

	log "Restored. The old database is kept as $before. When the app works, drop it with:"
	log "  docker compose exec postgres sh -c 'dropdb -U \"\$POSTGRES_USER\" $before'"
}

main() {
	case "${1:-}" in
	--check)
		[ $# -eq 2 ] || usage
		check "$2"
		;;
	-* | '') usage ;;
	*)
		[ $# -eq 1 ] || usage
		replace "$1"
		;;
	esac
}

main "$@"
