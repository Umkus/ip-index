import IpIndex from '../../index';
import eu from './eu.json';

const ipIndex = new IpIndex('./ip-index.db');

export async function handler(event) {
  const { ip } = (event.pathParameters || {});
  const country = ipIndex.getCountry(ip);

  return {
    statusCode: 200,
    body: JSON.stringify({
      isBlacklisted: ipIndex.isBlacklisted(ip),
      isDatacenter: ipIndex.isDatacenter(ip),
      isEu: eu.includes(country),
      country,
      asn: ipIndex.getAsn(ip),
    }),
  };
}
