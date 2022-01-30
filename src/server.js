import http from 'http';
import url from 'url';
import { getIpInfo } from './index.js';

http.createServer(async (req, res) => {
  const { searchParams } = new url.URL(`http://localhost${req.url}`);
  const ip = searchParams.get('ip') || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  res.write(JSON.stringify(getIpInfo(ip)));
  res.end();
})
  .listen(4000, '0.0.0.0');
