# Deployment

Every merge into `main` is deployed to the VPS automatically. Nobody has to log in to the server.

## How it works

1. A pull request is merged into `main`.
2. GitHub Actions runs the CI checks (format, typecheck, tests, build).
3. If they pass, it builds a Docker image for the client and one for the server and uploads them to GitHub Container Registry (`ghcr.io/fyernald/orbi-client` and `orbi-server`).
4. It connects to the VPS with SSH, copies `deploy/compose.yml`, downloads the new images, and restarts the containers.
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

### 2. Deploy user

On the VPS as `root`:

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG docker deploy
mkdir -p /home/deploy/orbi /home/deploy/.ssh
chown -R deploy:deploy /home/deploy/orbi /home/deploy/.ssh
```

Note: a user in the `docker` group has full control of the server, so keep its SSH key safe.

### 3. Production `.env`

Copy [deploy/.env.example](../deploy/.env.example) to `/home/deploy/orbi/.env` and fill it in. Use long random values for `POSTGRES_PASSWORD` and `BETTER_AUTH_SECRET` (the commands are in the file).

```bash
nano /home/deploy/orbi/.env
chown deploy:deploy /home/deploy/orbi/.env
chmod 600 /home/deploy/orbi/.env
```

### 4. nginx and HTTPS

Copy [deploy/nginx.conf](../deploy/nginx.conf) to `/etc/nginx/sites-available/orbi.study`, then:

```bash
ln -s /etc/nginx/sites-available/orbi.study /etc/nginx/sites-enabled/orbi.study
nginx -t && systemctl reload nginx
certbot --nginx -d orbi.study -d www.orbi.study
```

`nginx -t` checks the config before the reload, so a typo cannot take the other sites down. certbot gets a free HTTPS certificate and renews it by itself.

### 5. SSH key for GitHub Actions

On your own computer (not the VPS):

```bash
ssh-keygen -t ed25519 -f orbi_deploy -N "" -C "github-actions-deploy"
```

This makes two files. Put the content of the **public** key (`orbi_deploy.pub`) into `/home/deploy/.ssh/authorized_keys` on the VPS, then:

```bash
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
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
| `VPS_USER`        | `deploy`                                                   |
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
ssh deploy@<vps-ip>
cd orbi
docker compose ps
docker compose logs -f server
```

**Stop deploys for a while:** set the `DEPLOY_ENABLED` variable to `false`.
