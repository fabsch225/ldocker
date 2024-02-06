FROM node:ubuntu

ARG ARCH=x86-64-bmi2

ENV API_TOKEN=
ENV PORT=

RUN apt-get update
RUN apt-get install -y \
  build-essential \
  make \
  net-tools \
  wget 
RUN sudo apt-key del 7fa2af80
RUN wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-wsl-ubuntu.pin
RUN sudo mv cuda-wsl-ubuntu.pin /etc/apt/preferences.d/cuda-repository-pin-600 
RUN wget https://developer.download.nvidia.com/compute/cuda/12.2.2/local_installers/cuda-repo-wsl-ubuntu-12-2-local_12.2.2-1_amd64.deb 
RUN sudo dpkg -i cuda-repo-wsl-ubuntu-12-2-local_12.2.2-1_amd64.debet 
RUN sudo cp /var/cuda-repo-wsl-ubuntu-12-2-local/cuda-*-keyring.gpg /usr/share/keyrings/ 
RUN sudo apt-get update 
RUN sudo apt-get -y install cuda 
RUN git clone -b release/0.30 --recurse-submodules https://github.com/LeelaChessZero/lc0.git 
RUN sudo apt-get install -y ninja-build 
RUN sudo apt-get install -y meson 
WORKDIR /lc0 
RUN ./build.sh
RUN sudo ln -sfn /lc0/build/release/lc0 /usr/bin/lc0
WORKDIR /
RUN wget https://storage.lczero.org/files/networks-contrib/t1-512x15x8h-distilled-swa-3395000.pb.gz

RUN sudo apt-get install -y npm

WORKDIR /app
COPY ./node_modules /app/node_modules
COPY ./index.mjs /app/index.mjs
COPY ./package-lock.json /app/package-lock.json
COPY ./package.json /app/package.json
RUN npm ci

EXPOSE $PORT

ENTRYPOINT ["npm", "start"]