const IpIndex = require('../../index');

const ipIndex = new IpIndex('./ip-index.db');

async function handler(event) {
  const { ip } = (event.pathParameters || { ip: event.requestContext.identity.sourceIp });

  const data = ip.split(',').map((item) => {
    const country = ipIndex.getCountry(item);
    const isBlacklisted = ipIndex.isBlacklisted(item);
    const isDatacenter = ipIndex.isDatacenter(item);
    const isEu = ipIndex.isEU(item);
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
    headers: {
      'X-Requested-With': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,x-requested-with',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
    },
    statusCode: 200,
    body: JSON.stringify(data),
  };
}

module.exports = { handler };
