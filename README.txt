json-server --watch db.json --static .

ssh -R final-project:80:localhost:3000 serveo.net

npx localtunnel --port 3000

 .\cloudflared.exe tunnel --url http://localhost:3000