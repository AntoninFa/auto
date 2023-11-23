# https://www.jenkins.io/doc/tutorials/build-a-node-js-and-react-app-with-npm
# https://www.jenkins.io/doc/book/installing/docker
# https://manpages.debian.org/bullseye/apt/apt-get.8.en.html

ARG JENKINS_VERSION=2.428-jdk21

FROM jenkins/jenkins:${JENKINS_VERSION}

USER root

RUN <<EOF
set -ex

apt-get update --yes
apt-get upgrade --yes

# https://packages.debian.org/bookworm/lsb-release
apt-get install --no-install-recommends --yes --show-progress lsb-release=12.0-1

# GPG-Schluessel fuer Docker hinzufuegen
curl -fsSLo /usr/share/keyrings/docker-archive-keyring.asc https://download.docker.com/linux/debian/gpg

# Docker-Repository hinzufuegen
# https://docs.docker.com/engine/install/debian
# https://www.howtoforge.de/anleitung/so-installierst-du-docker-unter-debian-11
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.asc] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

# https://docs.docker.com/engine/install/debian/#install-from-a-package
# https://download.docker.com/linux/debian/dists/bookworm/pool/stable/amd64
# dpkg -l
# apt-cache policy docker-ce-cli
apt-get update --yes
apt-get install --no-install-recommends --yes --show-progress docker-ce-cli=5:24.0.5-1~debian.12~bookworm
apt-get upgrade --yes

# https://unix.stackexchange.com/questions/217369/clear-apt-get-list
apt-get autoremove --yes
apt-get clean
rm -rf /var/lib/apt/lists/*
EOF

USER jenkins
# https://plugins.jenkins.io/blueocean
# https://plugins.jenkins.io/docker-workflow
RUN jenkins-plugin-cli --plugins "blueocean:1.27.8 docker-workflow:563.vd5d2e5c4007f"