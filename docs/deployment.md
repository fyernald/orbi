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

Run exactly **one** `server` container. Six things assume there is only one API process:

- the limit of 3 tutor replies at once per student is counted in memory ([decision 0003](decisions/03-tutor-chat.md)),
- each student's daily AI token budget is counted in memory (same decision),
- PDF uploads wait in a queue in memory: one read at a time per student and two on the whole server, each in its own worker thread (`src/pdf/worker-reader.ts`), stopped after 30 seconds or 256 MB,
- the API's request rate limit is counted in memory (`src/rate-limit.ts`): 200 requests a minute per session, or per address without one, and lower for PDF uploads (10), follow-up questions (20), and study answers (60),
- Better Auth's login rate limit is counted in memory,
- the server applies new migrations when it starts, and two starting at once would race.

To run more than one, move these limits to the database first (Better Auth: `rateLimit.storage: 'database'`) and run the migrations as a separate step.

Each container has a CPU and memory limit in `compose.yml` (the server: 2 CPUs and 1 GB, because it reads PDFs in worker threads; Postgres: 2 CPUs and 768 MB; the client: 1 CPU and 768 MB), so Orbi cannot starve the other projects on the VPS. A container that reaches its memory limit is restarted. Check how close they are with `docker stats --no-stream`, for example after a busy day, and change the limits in `compose.yml` if one stays near its limit.

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

## Error monitoring

Unexpected errors go to [Sentry](https://sentry.io), so we hear about them before a student reports them. It runs only in production, and only when a DSN is set.

| Where              | What is reported                                                                                                                 | Code                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| The API            | Every 500 answer, with its route (`POST /api/chats/:chatId/messages`), and errors the services log, such as a failed tutor reply | `src/error-reporter.ts`, started by `src/instrument.ts`, used by `error-handler.ts` and `index.ts` |
| The Next.js server | Errors while it renders a page                                                                                                   | `src/instrumentation.ts`                                                                           |
| The browser        | Errors in the page, with its path                                                                                                | `src/instrumentation-client.ts`                                                                    |

Sentry never gets cookies, headers, request bodies, query strings, IP addresses, the user, or anything the student wrote. AI errors are sent with their name only, failed queries without their values, and console lines and clicks are left out ([decision 0004](decisions/04-user-data.md), `lib/monitoring.ts` and `src/error-reporter.ts`).

### Set up (once)

1. Make an organisation on sentry.io and pick the **EU (Frankfurt)** data region. It cannot be changed later.
2. Make one project of the platform **Next.js** named `orbi`. The API and the client share it; the tags show which one an error came from.
3. In the project's **Settings > Security & Privacy**, turn on **Prevent Storing of IP Addresses** and leave the data scrubber on.
4. Copy the DSN from **Settings > Client Keys (DSN)** and put it in two places:
   - `SENTRY_DSN=` in `.env` on the VPS, for the API, then deploy again,
   - a repository variable `SENTRY_DSN` under **Settings > Secrets and variables > Actions > Variables**, for the client. It is put into the client image when it is built, so the next merge into `main` turns it on.

The DSN is not a secret: the browser has to know it to send reports.

### See the errors and the alerts

Open the `orbi` project in Sentry and go to **Issues**. Each issue shows the error, its stack, the route or page, and the release (the commit that was deployed, from `SENTRY_RELEASE` in `compose.yml`). The client's stacks are not mapped to the source yet, because the build does not upload source maps.

Sentry emails every member of the project for each new issue (its default alert rule). Add every team member to the project under **Settings > Teams** so the whole team gets them. The free plan keeps errors for 30 days.

### Performance

Sentry also traces a share of the traffic, to show what is slow. It is on whenever error reports are on.

- **The API**: each request, with its route, the database queries in it (the SQL without its values), and AI calls (model, tokens and time, never the prompt or the reply). `src/instrument.ts` starts Sentry before the rest of the server loads (`node --import` in the Dockerfile), so it can trace the database.
- **The browser**: page loads and navigations, the requests they make to `/api`, and Web Vitals (LCP, INP, CLS). Requests to `/api` carry the trace in their `sentry-trace` and `baggage` headers, so one trace shows the page and the API request behind it.
- **The Next.js server**: the pages it renders.

The health checks are never traced. Traces follow the same rules as errors: no query strings, the reset token masked, no user, IP address, headers, or bodies (`scrubSpan` in `src/error-reporter.ts` and `lib/monitoring.ts`).

The share is 0.2 (1 request in 5) by default, so it fits the free plan. To change it, set a number from 0 to 1:

- `SENTRY_TRACES_SAMPLE_RATE=` in `.env` on the VPS, for the API, then deploy again,
- a repository variable `SENTRY_TRACES_SAMPLE_RATE`, for the browser. It is put into the client image when it is built, like the DSN.

A request the browser traced is traced on the API too, whatever the API's share is.

To see the traces, open the `orbi` project in Sentry:

- **Insights > Backend** lists the API routes by how slow they are, and **Insights > Frontend** the pages,
- **Insights > Web Vitals** gives each page a score from LCP, INP and CLS,
- **Explore > Traces** shows single traces, from the page load to the database queries.

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

**2. Make the storage.** Orbi uses a private Backblaze B2 bucket called `orbi-backups`. Any storage rclone supports works, as long as it is not on this VPS. For B2:

- Make the bucket **Private**. Bucket names are shared by all B2 users, so a short name like `orbi` is usually taken.
- In the bucket's **Lifecycle Settings**, choose **Keep only the last version of the file**. Otherwise B2 only hides the old backups the script deletes, and keeps them.
- Make an **application key** for this bucket only, with **Read and Write**. Copy the keyID and the key; B2 shows the key only once.

**3. Add the rclone remotes.** As `orbi` (`su - orbi` from `root`), not as `root`, because cron runs the backup as `orbi`. Run `rclone config` and make two remotes:

- **`orbi-storage`:** type `b2`, with the keyID as `account` and the key as `key`.
- **`orbi-backup`:** type `crypt`, with remote `orbi-storage:orbi-backups/orbi` (the bucket name, then a folder), standard filename encryption, and directory names encrypted. For both passwords, answer `g` to make a random one. rclone encrypts each file before it leaves the VPS.

Keep both crypt passwords in the team's password manager. Without them nobody can read the backups, not even you.

Check that it works:

```bash
rclone listremotes
rclone config show orbi-backup | grep remote
echo test > /tmp/t && rclone copy /tmp/t orbi-backup: && rclone ls orbi-backup:
rclone delete orbi-backup: --include t
```

Always write the remote with the colon (`orbi-backup:`). Without it rclone looks for a local folder with that name.

**4. Settings.** These lines are in [deploy/.env.example](../deploy/.env.example). Copy them into `/home/orbi/orbi/.env`:

```bash
BACKUP_KEEP_DAYS=14
BACKUP_REMOTE=orbi-backup:
BACKUP_REMOTE_KEEP_DAYS=30
```

If `BACKUP_REMOTE` is empty, the backup stays only on the VPS and the log says so.

**5. Run it every night.** On this VPS `orbi` is not allowed to use `crontab`, so `root` adds the job to `/etc/cron.d/`. The `orbi` in the line makes cron run it as `orbi`, with its rclone remotes and Docker access. As `orbi`, make the folder:

```bash
mkdir -p ~/orbi/backups
```

Then as `root`:

```bash
cat > /etc/cron.d/orbi-backup <<'CRON'
# Nightly Orbi database backup (see "Backups" in docs/deployment.md)
30 3 * * * orbi cd /home/orbi/orbi && bash backup/backup.sh >> backups/backup.log 2>&1
CRON
chmod 644 /etc/cron.d/orbi-backup
systemctl is-active cron
```

It runs at 03:30 server time. The server uses CET, so that is 05:30 in Erbil. The backup file names use UTC. Keep the file name without a dot, because cron skips files in `/etc/cron.d/` with a dot in the name.

**6. Test it.** Make a backup by hand and restore it into an empty database (both are described below). To see cron run it without waiting for the night, add a job that runs every minute, check the log, and remove it again:

```bash
echo '* * * * * orbi cd /home/orbi/orbi && bash backup/backup.sh >> backups/backup.log 2>&1' > /etc/cron.d/orbibackuptest
# after a minute or two
tail /home/orbi/orbi/backups/backup.log
rm /etc/cron.d/orbibackuptest
```

The next morning, check that `backups/backup.log` shows a new backup with no `ERROR`.

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
