import http from 'http';
import url from 'url';
import { getIpInfo } from './index.js';

http.createServer(async (req, res) => {
  const { searchParams } = new url.URL(`http://localhost${req.url}`);
  const ip = searchParams.get('ip') || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const withGeolocations = searchParams.has('withGeolocations') || false

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  res.write(JSON.stringify(getIpInfo(ip, withGeolocations), (key, value) => {
    if (typeof value === "bigint") {
      return value.toString()
    }

    return value;
  }));
  res.end();
})
  .listen(4000, '0.0.0.0');
