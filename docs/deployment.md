# Deployment

Every merge into `main` is deployed to the VPS automatically. Nobody has to log in to the server.

## How it works

1. A pull request is merged into `main`.
2. GitHub Actions runs the CI checks (format, typecheck, tests, build).
3. If they pass, it builds a Docker image for the client and one for the server and uploads them to GitHub Container Registry (`ghcr.io/fyernald/orbi-client` and `orbi-server`).
4. It connects to the VPS with SSH, copies `deploy/compose.yml` and the backup scripts, downloads the new images, and restarts the containers.
5. It waits until the new containers are healthy. If they are not, the run turns red in the **Actions** tab.

The VPS also hosts other projects, so Orbi shares the existing nginx web server:

| Part       | What it does                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| nginx      | Already on the VPS. Handles HTTPS for `orbi.study`, sends `/api/*` to the server and the rest to the client |
| `client`   | The Next.js app, on `127.0.0.1:3100`                                                                        |
| `server`   | The Fastify API, on `127.0.0.1:3101`                                                                        |
| `postgres` | The database. It is not reachable from outside the containers                                               |

## One-time setup

You do this once. After that, deploys happen by themselves.

### 1. DNS

In Namecheap, under **Domain List > orbi.study > Manage > Advanced DNS**, add two **A records** that point `@` and `www` to the VPS IP.

### 2. A user for Orbi

On the VPS as `root`:

```bash
adduser --disabled-password --gecos "" orbi
usermod -aG docker orbi
mkdir -p /home/orbi/orbi /home/orbi/.ssh
chown -R orbi:orbi /home/orbi/orbi /home/orbi/.ssh
```

Note: a user in the `docker` group has full control of the server, so keep its SSH key safe.

### 3. Production `.env`

Copy [deploy/.env.example](../deploy/.env.example) to `/home/orbi/orbi/.env` and fill it in. Use long random values for `POSTGRES_PASSWORD` and `BETTER_AUTH_SECRET` (the commands are in the file).

```bash
nano /home/orbi/orbi/.env
chown orbi:orbi /home/orbi/orbi/.env
chmod 600 /home/orbi/orbi/.env
```

### 4. nginx and HTTPS

Copy [deploy/nginx.conf](../deploy/nginx.conf) to `/etc/nginx/sites-available/orbi.study`, then:

```bash
ln -s /etc/nginx/sites-available/orbi.study /etc/nginx/sites-enabled/orbi.study
nginx -t && systemctl reload nginx
certbot --nginx -d orbi.study -d www.orbi.study
```

`nginx -t` checks the config before the reload, so a typo cannot take the other sites down. certbot gets a free HTTPS certificate and renews it by itself.

Deploys do not copy `nginx.conf`. When it changes in the repo, copy the changed lines into `/etc/nginx/sites-available/orbi.study` by hand (keep the HTTPS lines certbot added) and run `nginx -t && systemctl reload nginx`.

### 5. SSH key for GitHub Actions

On your own computer (not the VPS):

```bash
ssh-keygen -t ed25519 -f orbi_deploy -N "" -C "github-actions-deploy"
```

This makes two files. Put the content of the **public** key (`orbi_deploy.pub`) into `/home/orbi/.ssh/authorized_keys` on the VPS, then:

```bash
chown orbi:orbi /home/orbi/.ssh/authorized_keys
chmod 600 /home/orbi/.ssh/authorized_keys
```

Get the VPS fingerprint, so GitHub can be sure it talks to the real server:

```bash
ssh-keyscan -p 22 <vps-ip>
```

### 6. GitHub secrets

In the repository go to **Settings > Environments > New environment** and name it `production`. Under **Deployment branches and tags**, allow only `main`. Then add these **environment secrets**:

| Secret            | Value                                                      |
| ----------------- | ---------------------------------------------------------- |
| `VPS_HOST`        | The VPS IP address                                         |
| `VPS_USER`        | `orbi`                                                     |
| `VPS_SSH_KEY`     | The full content of the **private** key file `orbi_deploy` |
| `VPS_KNOWN_HOSTS` | The output of the `ssh-keyscan` command                    |
| `VPS_PORT`        | Only if SSH does not use port 22                           |

After that, delete the private key file from your computer, or keep it in a password manager.

### 7. Turn on deploys

Go to **Settings > Secrets and variables > Actions > Variables** and add a repository variable `DEPLOY_ENABLED` with the value `true`.

To test it, open **Actions > CI > Run workflow**, choose `main`, and run it. When the run is green, open https://orbi.study.

## Everyday tasks

**Deploy again without a code change:** **Actions > CI > Run workflow** on `main`.

**Go back to an older version:** open an older green CI run in the **Actions** tab and click **Re-run jobs > Re-run all jobs**. It deploys that commit again.

**See the logs:**

```bash
ssh orbi@<vps-ip>
cd orbi
docker compose ps
docker compose logs -f server
```

Each service keeps at most 3 log files of 10 MB (set in `deploy/compose.yml`), so older lines are deleted. Errors are logged without the student's notes or chat: AI errors keep the error name, status code, and the provider's message, and failed queries keep the query without its values (see `apps/server/src/log.ts`).

**Stop deploys for a while:** set the `DEPLOY_ENABLED` variable to `false`.

## Backups

Every night cron runs [deploy/backup/backup.sh](../deploy/backup/backup.sh) on the VPS. Here is what it does:

1. It saves the database with `pg_dump` to `/home/orbi/orbi/backups/orbi-<date>.dump`.
2. It checks that the new file can be read.
3. It deletes backups on the VPS that are older than `BACKUP_KEEP_DAYS` (14 days by default).
4. It copies the new backup off the server with [rclone](https://rclone.org/) to `BACKUP_REMOTE`.
5. It deletes copies there that are older than `BACKUP_REMOTE_KEEP_DAYS` (30 days by default).

Deploys copy the scripts to `/home/orbi/orbi/backup/`. The commands run inside the `postgres` container, so the VPS needs no PostgreSQL tools. A backup holds the students' notes and chats, so the off-server copy is encrypted.

### Set up (once)

**1. Install rclone.** As `root`:

```bash
apt install rclone
```

**2. Add the off-server storage.** As `orbi`, run `rclone config` and make two remotes:

- **`orbi-storage`:** where the files go. This can be any storage rclone supports, for example a Backblaze B2 or other S3 bucket, or `sftp` to another machine. Use storage that is not on this VPS.
- **`orbi-backup`:** type `crypt`, with remote `orbi-storage:orbi` and a long random password. rclone encrypts each file before it leaves the VPS.

Keep the crypt password in the team's password manager. Without it nobody can read the backups, not even you.

**3. Settings.** These lines are in [deploy/.env.example](../deploy/.env.example). Copy them into `/home/orbi/orbi/.env`:

```bash
BACKUP_KEEP_DAYS=14
BACKUP_REMOTE=orbi-backup:
BACKUP_REMOTE_KEEP_DAYS=30
```

If `BACKUP_REMOTE` is empty, the backup stays only on the VPS and the log says so.

**4. Run it every night.** As `orbi`, make the folder and open the crontab:

```bash
mkdir -p ~/orbi/backups
crontab -e
```

Add this line. It runs at 03:30 server time:

```
30 3 * * * cd /home/orbi/orbi && bash backup/backup.sh >> backups/backup.log 2>&1
```

**5. Test it.** Make a backup by hand and restore it into an empty database (both are described below). Then check the next morning that `backups/backup.log` shows a backup with no `ERROR`.

### Make a backup by hand

Do this before anything risky, such as a big migration or a database change by hand:

```bash
ssh orbi@<vps-ip>
cd orbi
bash backup/backup.sh
```

To see the backups:

```bash
ls -lh backups/
rclone ls orbi-backup:
tail backups/backup.log
```

### Check that a backup restores

This restores a backup into a new, empty database called `orbi_restore_check` and prints how many rows each table has. Then it drops that database again. The app's database is not touched and the app keeps running, so you can run it any time:

```bash
bash backup/restore.sh --check backups/orbi-2026-11-02T033000Z.dump
```

### Restore a backup

This replaces the app's database with the backup:

```bash
bash backup/restore.sh backups/orbi-2026-11-02T033000Z.dump
```

Here is what it does:

1. It restores the backup into a new database first and shows the row counts. A broken file never touches the live data.
2. It asks you to type the database name before going on.
3. It stops the app for a few seconds and swaps the databases.
4. It starts the app again. The server applies any migrations that are newer than the backup.

The old database is kept as `orbi_before_<date>`. When the app works, drop the old database with the command the script prints.

**Use an off-server copy** (for example after losing the VPS). Set up the new VPS with the steps above and let a deploy start the app. Then copy the backup back and restore it:

```bash
rclone ls orbi-backup:
rclone copy orbi-backup:orbi-2026-11-02T033000Z.dump backups/
bash backup/restore.sh backups/orbi-2026-11-02T033000Z.dump
```

### Try it on your own computer

Use the local database from `docker-compose.yml`. From the repository root, in Git Bash:

```bash
ORBI_DIR=$PWD bash deploy/backup/backup.sh
ORBI_DIR=$PWD bash deploy/backup/restore.sh --check backups/<file>
```

For a full restore, stop `pnpm dev` first and add `APP_SERVICES=`, because the app runs outside Docker there. The `backups/` folder is ignored by git.
