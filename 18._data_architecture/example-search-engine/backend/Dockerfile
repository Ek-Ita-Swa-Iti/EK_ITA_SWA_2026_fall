FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install

# Download the embedding model while the image is built, so the backend
# doesn't have to fetch ~120 MB the first time it starts.
COPY src/persistence/embeddingModel.js ./src/persistence/
RUN node src/persistence/embeddingModel.js

COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
