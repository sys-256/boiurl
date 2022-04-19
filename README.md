# boiurl
I made the core of this piece of shit in exactly 18 minutes lol (porting to TypeScript etc took like 20-ish minutes as well)

## Installation
### Native
```sh
npm run build
npm start
```
### Docker
```sh
docker run -d --restart=always --name=boiurl -p 8035:8035 -v $(pwd)/boiurl-data:/data sys256/boiurl:latest
```
