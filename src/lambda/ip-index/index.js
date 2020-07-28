const IpIndex = require('../../index');
const eu = require('./eu.json');

const ipIndex = new IpIndex('./ip-index.db');

async function handler(event) {
  const { ip } = (event.pathParameters || {});

  const data = ip.split(',').map((item) => {
    const country = ipIndex.getCountry(item);
    const isBlacklisted = ipIndex.isBlacklisted(item);
    const isDatacenter = ipIndex.isDatacenter(item);
    const isEu = eu.includes(country);
    const asn = ipIndex.getAsn(item);

    return {
      ip: item,
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
