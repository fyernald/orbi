#!/usr/bin/env bash
# Backs up the database to backups/orbi-<date>.dump and copies it off the server.
# cron runs it every night (see "Backups" in docs/deployment.md); you can also run it by hand:
#   bash backup/backup.sh

source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

KEEP_DAYS=$(env_value BACKUP_KEEP_DAYS 14)
REMOTE=$(env_value BACKUP_REMOTE '')
REMOTE_KEEP_DAYS=$(env_value BACKUP_REMOTE_KEEP_DAYS 30)

# pg_dump's own format is compressed and lets pg_restore check the file
dump() {
	local file=$1
	pg_sh 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' >"$file" \
		|| die "pg_dump failed"
	pg_sh 'pg_restore --list >/dev/null' <"$file" || die "The new backup cannot be read"
}

remove_old() {
	log "Deleting backups on this server older than $KEEP_DAYS days"
	find "$BACKUP_DIR" -maxdepth 1 -name 'orbi-*.dump' -mtime "+$KEEP_DAYS" -print -delete
}

copy_off_server() {
	local file=$1
	if [ -z "$REMOTE" ]; then
		log "WARNING: BACKUP_REMOTE is not set in .env, so the backup is only on this server"
		return
	fi
	command -v rclone >/dev/null || die "rclone is not installed"
	log "Copying to $REMOTE"
	rclone copy "$file" "$REMOTE"
	log "Deleting backups in $REMOTE older than $REMOTE_KEEP_DAYS days"
	rclone delete "$REMOTE" --min-age "${REMOTE_KEEP_DAYS}d" --include 'orbi-*.dump'
}

main() {
	mkdir -p "$BACKUP_DIR"
	chmod 700 "$BACKUP_DIR"
	local file="$BACKUP_DIR/orbi-$(date -u +%Y-%m-%dT%H%M%SZ).dump"

	log "Backing up to $file"
	# a failed dump never looks like a real backup
	trap "rm -f '$file.part'" EXIT
	dump "$file.part"
	mv "$file.part" "$file"
	chmod 600 "$file"
	log "Done: $(du -h "$file" | cut -f1)"

	remove_old
	copy_off_server "$file"
}

main "$@"
