# Base image
FROM node:20-alpine

# Set up working directory
# WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .
COPY .env ./

# Creates a "dist" folder with the production build
RUN npx prisma db push
RUN npm run build

# Expose the port on which the app will run
EXPOSE 3131

# Start the server using the production build
# CMD ["npm", "start"]
CMD ["node", "dist/main"]
