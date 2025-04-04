## Introduction

This is a file browsing web app, inspired by terminal file managers like [lf](https://github.com/gokcehan/lf) and [yazi](https://github.com/sxyazi/yazi).

### Features

- Multi-column layout
- Remembers previously visited locations
- View images and videos (streaming or thumbnail preview)

### Architecture

The application is composed of a frontend and a backend, all packaged together in a single pip package. Once deployed, users can browse files on the machine where the backend is running. The architecture supports various scenarios:

- Remote Browsing: Host the app on a remote server, allowing access via public IP, internal network, or SSH port forwarding.
- Local Hosting: Alternatively, the app can be run on a local machine.

## Install

Tested Python version:

- 3.12

```
pip install filenav
```

## Run

```sh
filenav --host 127.0.0.1 --port 1234
```

or if you want to listen on unix socket:

```sh
filenav --uds /tmp/vis.sock
```

## Usage

- The path can be controlled by either:
  - editing the path in the top bar
  - clicking any file or directory using mouse
  - pressing arrow keys or common vim key bindings

## Development

```sh
git clone https://github.com/tianze0926/filenav.git
cd filenav
PROJECT_DIR=$(pwd)
```

> The following instruction uses conda, adapt if you use other environment management tools.

### Prepare Environment

```sh
cd $PROJECT_DIR/backend
conda env create -f environment.yml -n filenav
conda activate filenav
cd $PROJECT_DIR/frontend
# npm would be already installed with conda from backend env
npm install
npm run build # backend relies on frontend dist
```

### Run Backend

```sh
cd $PROJECT_DIR/backend/filenav
fastapi dev main.py --port 50052
```

### (Optional) Generate Client Code

> This step is optional. Only required if backend api is changed.

```sh
cd $PROJECT_DIR/frontend
npm run generate-client
```

### Run Frontend

```sh
cd $PROJECT_DIR/frontend
npm run dev
```
