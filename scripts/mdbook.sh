#!/usr/bin/env bash

set -euo pipefail

MDBOOK_VERSION="0.4.52"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL_DIR="${PROJECT_ROOT}/.tools/mdbook-${MDBOOK_VERSION}"
MDBOOK_BIN="${INSTALL_DIR}/mdbook"

if [[ ! -x "${MDBOOK_BIN}" ]]; then
    case "$(uname -s)" in
        Darwin) platform="apple-darwin" ;;
        Linux) platform="unknown-linux-gnu" ;;
        *)
            echo "Unsupported operating system: $(uname -s)" >&2
            echo "Install mdBook ${MDBOOK_VERSION} manually, then run mdbook from the project root." >&2
            exit 1
            ;;
    esac

    case "$(uname -m)" in
        arm64|aarch64) architecture="aarch64" ;;
        x86_64|amd64) architecture="x86_64" ;;
        *)
            echo "Unsupported CPU architecture: $(uname -m)" >&2
            echo "Install mdBook ${MDBOOK_VERSION} manually, then run mdbook from the project root." >&2
            exit 1
            ;;
    esac

    archive="mdbook-v${MDBOOK_VERSION}-${architecture}-${platform}.tar.gz"
    download_url="https://github.com/rust-lang/mdBook/releases/download/v${MDBOOK_VERSION}/${archive}"
    temporary_dir="$(mktemp -d)"
    trap 'rm -rf "${temporary_dir}"' EXIT

    echo "Downloading mdBook ${MDBOOK_VERSION} for ${architecture}-${platform}..."
    curl --fail --location --silent --show-error \
        "${download_url}" \
        --output "${temporary_dir}/${archive}"
    tar -xzf "${temporary_dir}/${archive}" -C "${temporary_dir}"
    mkdir -p "${INSTALL_DIR}"
    install -m 0755 "${temporary_dir}/mdbook" "${MDBOOK_BIN}"
fi

cd "${PROJECT_ROOT}"
exec "${MDBOOK_BIN}" "$@"
