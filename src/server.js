import http from 'http';
import url from 'url';
import { getIpInfo } from './index.js';

http.createServer(async (req, res) => {
  const fields = {
    asn: true,
    subnet: true,
    hosting: true,
    description: true,
    subnetsNum: true,
    handle: true,
    subnets: false,
    start: false,
    end: false,
  };

  const {
    searchParams,
    pathname,
  } = new url.URL(`http://localhost${req.url}`);

  if (pathname !== '/') {
    res.writeHead(204);
    res.end();
    return false;
  }

  const ips = searchParams.get('ip') || req.socket.remoteAddress;
  const requestedFields = (searchParams.get('fields') || '').split(',').filter((i) => i);

  console.log(requestedFields);

  if (requestedFields.length) {
    Object.keys(fields).forEach((field) => {
      fields[field] = requestedFields.includes(field);
    });
  }

  console.log(fields);

  if (!ips) {
    res.writeHead(400, {
      'Content-Type': 'application/json',
    });

    res.write(JSON.stringify({
      error: 'The "ip" query parameter is not provided'
    }));
  } else {
    res.writeHead(200, {
      'Content-Type': 'application/json',
    });

    const ip = ips.split(',')[0];
    const resData = getIpInfo(ip).map((dataItem) => {
      const filteredDataItem = {};

      Object.keys(dataItem).forEach((key) => {
        if (fields[key]) {
          filteredDataItem[key] = dataItem[key];
        }
      });

      return filteredDataItem;
    });

    resData.fields = fields;

    res.write(JSON.stringify(resData));
  }

  res.end();
})
  .listen(4000, '0.0.0.0');
