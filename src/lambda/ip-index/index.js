const IpIndex = require('../../index');
const eu = require('./eu.json');

const ipIndex = new IpIndex('./ip-index.db');

async function handler(event) {
  const { ips } = (event.pathParameters || {});

  const data = ips.split(',').map((ip) => {
    const country = ipIndex.getCountry(ip);
    const isBlacklisted = ipIndex.isBlacklisted(ip);
    const isDatacenter = ipIndex.isDatacenter(ip);
    const isEu = eu.includes(country);
    const asn = ipIndex.getAsn(ip);

    return {
      isBlacklisted,
      isDatacenter,
      isEu,
      country,
      asn,
    };
  });

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
}

module.exports = { handler };
