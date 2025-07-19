FROM node:20.15.0 as base

# Set working directory inside container
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

RUN npx prisma generate

# Set timezone
ENV TZ="Asia/Kolkata"
RUN date

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

CMD ["./start.sh"]
