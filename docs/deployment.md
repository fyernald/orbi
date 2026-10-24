# Deployment

Every merge into `main` is deployed to the VPS automatically. Nobody has to log in to the server.

## How it works

1. A pull request is merged into `main`.
2. GitHub Actions runs the CI checks (format, typecheck, tests, build).
3. If they pass, it builds a Docker image for the client and one for the server and uploads them to GitHub Container Registry (`ghcr.io/fyernald/orbi-client` and `orbi-server`).
4. It connects to the VPS with SSH, copies `deploy/compose.yml` and `deploy/Caddyfile`, downloads the new images, and restarts the containers.
5. It waits until the new containers are healthy. If they are not, the run turns red in the **Actions** tab.

On the VPS four containers run:

| Container  | What it does                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `caddy`    | Takes all web traffic, handles HTTPS, sends `/api/*` to the server and everything else to the client |
| `client`   | The Next.js app                                                                                      |
| `server`   | The Fastify API                                                                                      |
| `postgres` | The database. It is not reachable from the internet                                                  |

## One-time setup

You do this once. After that, deploys happen by themselves.

### 1. Prepare the VPS

Log in to the VPS as a user with `sudo` and run:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Create a user only for deploys and let it use Docker
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy

# Create the app folder
sudo -u deploy mkdir -p /home/deploy/orbi /home/deploy/.ssh
```

Open these ports in the firewall: `22` (SSH), `80` and `443` (TCP), and `443` (UDP).

Note: a user in the `docker` group has full control of the server, so keep its SSH key safe.

### 2. Create the production `.env`

Copy [deploy/.env.example](../deploy/.env.example) to `/home/deploy/orbi/.env` on the VPS and fill it in:

```bash
sudo -u deploy nano /home/deploy/orbi/.env
sudo chmod 600 /home/deploy/orbi/.env
```

- `DOMAIN`: your domain, for example `orbi.example.com`. Point its DNS **A record** to the VPS IP first. Until you have a domain, use `:80` and open `http://<vps-ip>` (no HTTPS).
- Use long random values for `POSTGRES_PASSWORD` and `BETTER_AUTH_SECRET`. The commands are in the file.

### 3. Create an SSH key for GitHub Actions

On your own computer (not the VPS):

```bash
ssh-keygen -t ed25519 -f orbi_deploy -N "" -C "github-actions-deploy"
```

This makes two files. Put the **public** key (`orbi_deploy.pub`) on the VPS:

```bash
# On the VPS: paste the content of orbi_deploy.pub into this file
sudo -u deploy nano /home/deploy/.ssh/authorized_keys
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

Check that it works from your computer: `ssh -i orbi_deploy deploy@<vps-ip>`.

Also save the VPS fingerprint, so GitHub can be sure it talks to the real server:

```bash
ssh-keyscan -p 22 <vps-ip>
```

### 4. Add the secrets to GitHub

In the repository go to **Settings > Environments > New environment** and name it `production`. Under **Deployment branches and tags**, allow only `main`. Then add these **environment secrets**:

| Secret            | Value                                                      |
| ----------------- | ---------------------------------------------------------- |
| `VPS_HOST`        | The VPS IP address or host name                            |
| `VPS_USER`        | `deploy`                                                   |
| `VPS_SSH_KEY`     | The full content of the **private** key file `orbi_deploy` |
| `VPS_KNOWN_HOSTS` | The output of the `ssh-keyscan` command                    |
| `VPS_PORT`        | Only if SSH does not use port 22                           |

After that, delete the private key file from your computer, or keep it in a password manager.

### 5. Turn on deploys

Go to **Settings > Secrets and variables > Actions > Variables** and add a repository variable `DEPLOY_ENABLED` with the value `true`.

To test it, open **Actions > CI > Run workflow**, choose `main`, and run it. When the run is green, open your domain.

## Everyday tasks

**Deploy again without a code change:** **Actions > CI > Run workflow** on `main`.

**Go back to an older version:** open an older green CI run in the **Actions** tab and click **Re-run jobs > Re-run all jobs**. It deploys the images of that commit again.

**See the logs:**

```bash
ssh deploy@<vps-ip>
cd orbi
docker compose ps
docker compose logs -f server
```

**Stop deploys for a while:** set the `DEPLOY_ENABLED` variable to `false`.
