# Build static assets (webpack → dist/)
FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

# Serve dist/ with nginx
FROM nginx:1.27-alpine

COPY docker/nginx-default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
