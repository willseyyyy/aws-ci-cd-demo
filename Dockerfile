FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy app source
COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
