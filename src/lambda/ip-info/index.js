import IpInfo from '../../index';
import eu from './eu.json';

const bl = new IpInfo('./ipinfo.db');

export async function handler(event) {
  const { ip } = (event.pathParameters || {});
  const country = bl.getCountry(ip);

  return {
    statusCode: 200,
    body: JSON.stringify({
      isBlacklisted: bl.isBlacklisted(ip),
      isDatacenter: bl.isDatacenter(ip),
      isEu: eu.includes(country),
      country,
    }),
  };
}
