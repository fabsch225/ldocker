FROM ubuntu

ENV API_TOKEN=
ENV PORT=

RUN apt-get update
RUN apt-get install -y \
  build-essential \
  make \
  net-tools \
  wget 
RUN apt-key del 7fa2af80
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-wsl-ubuntu.pin
RUN mv cuda-wsl-ubuntu.pin /etc/apt/preferences.d/cuda-repository-pin-600 
RUN wget https://developer.download.nvidia.com/compute/cuda/12.2.2/local_installers/cuda-repo-wsl-ubuntu-12-2-local_12.2.2-1_amd64.deb 
RUN dpkg -i cuda-repo-wsl-ubuntu-12-2-local_12.2.2-1_amd64.deb
RUN cp /var/cuda-repo-wsl-ubuntu-12-2-local/cuda-*-keyring.gpg /usr/share/keyrings/ 
RUN apt-get update 
RUN apt-get -y install cuda 
RUN apt-get install -y git 
RUN git clone -b release/0.30 --recurse-submodules https://github.com/LeelaChessZero/lc0.git 
RUN apt-get install -y ninja-build 
RUN apt-get install -y meson 
WORKDIR /lc0 
RUN ./build.sh
RUN ln -sfn /lc0/build/release/lc0 /usr/bin/lc0
WORKDIR /lc0/build/release
RUN wget https://storage.lczero.org/files/networks-contrib/t1-512x15x8h-distilled-swa-3395000.pb.gz
RUN wget https://storage.lczero.org/files/networks-contrib/t1-256x10-distilled-swa-2432500.pb.gz
RUN wget https://github.com/dkappe/leela-chess-weights/files/4432261/tinygyal-8.pb.gz
RUN apt-get install -y npm

WORKDIR /app
COPY ./node_modules /app/node_modules
COPY ./index.mjs /app/index.mjs
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json /app/package.json
RUN npm ci

EXPOSE $PORT

ENTRYPOINT ["npm", "start"]