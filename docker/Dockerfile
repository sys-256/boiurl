# Import nodejs
FROM node:17-alpine3.15

# Create the required folders
RUN mkdir -p /app

# Copy the files to the correct folders
COPY build/index.js package.json /app/

# Change the working directory
WORKDIR /app

# Install the OS dependencies
RUN apk update; apk add --no-cache gcc g++ make python3

# Install the node dependencies
RUN npm i --omit=dev

# Remove OS dependencies
RUN apk del --purge gcc g++ make python3

# Start the server
EXPOSE 8035
CMD ["node", "."]