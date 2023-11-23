import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Address4, Address6 } from 'ip-address'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const asns = {}

readFileSync(`${__dirname}/../data/asns.csv`).toString().split(/\s+/).forEach((item, index) => {
  if (!index) {
    return undefined
  }

  const [asn, handle, description] = item.split(',')

  asns[asn] = {
    handle,
    description: (description || '').trim().replace(/"/g, ''),
  }
})

const dcAsns = {}
readFileSync(`${__dirname}/../data/asns_dcs.csv`).toString().split(/\s+/)
  .forEach((asn) => {
    dcAsns[asn] = true
  })

const asnCidrs = {}
const rangesIndexed = {}

function getPosition(subnet, start) {
  const part = subnet.split(/[:\.]/)[start]
  const isIpV6 = subnet.includes(':')

  return parseInt(part, isIpV6 ? 16 : 10)
}

readFileSync(`${__dirname}/../data/asns_cidrs_2.csv`).toString()
  .split(/\s+/)
  .filter((i) => i)
  .forEach((item, index) => {
    if (!index || !item) {
      return null
    }

    const [asn, cidr, first, last, country] = item.split(',')

    const rangeIndex = getPosition(cidr, 0)

    if (!rangesIndexed[rangeIndex]) {
      rangesIndexed[rangeIndex] = []
    }

    const rangeIndex2 = getPosition(cidr, 1)

    if (!rangesIndexed[rangeIndex][rangeIndex2]) {
      rangesIndexed[rangeIndex][rangeIndex2] = []
    }

    const range = {
      start: BigInt(first),
      end: BigInt(last),
      subnet: cidr,
      asn: +asn,
      hosting: !!dcAsns[asn],
      country,
    }

    if (!asnCidrs[asn]) {
      asnCidrs[asn] = []
    }

    asnCidrs[asn].push(cidr)

    if (asns[asn]) {
      asns[asn].subnetsNum = (asns[asn].subnetsNum || 0) + 1
    }

    rangesIndexed[rangeIndex][rangeIndex2].push(range)
  })

function ipToInt(ip) {
  let addr
  if (ip.includes(':')) {
    addr = new Address6(ip)
  } else {
    addr = new Address4(ip)
  }

  return addr.bigInteger()
}

export function getAsnInfo(asn) {
  if (!asns[asn]) {
    return null
  }

  return { ...asns[asn], subnets: asnCidrs[asn] || [] }
}

function getAsns(ip) {
  const ipPosition1 = getPosition(ip, 0)
  let ipPosition2 = getPosition(ip, 1)
  const ipInt = ipToInt(ip)

  if (!rangesIndexed[ipPosition1]) {
    return []
  }

  if (!rangesIndexed[ipPosition1][ipPosition2]) {
    const availableKeys = Object.keys(rangesIndexed[ipPosition1])
    ipPosition2 = availableKeys.reverse().find((key) => key <= ipPosition2)

    if (!rangesIndexed[ipPosition1][ipPosition2]) {
      return []
    }
  }

  const filtered = rangesIndexed[ipPosition1][ipPosition2]
    .filter((range) => range && range.start <= ipInt && range.end >= ipInt)

  return filtered
    .map((match) => ({ ...match, ...asns[match.asn] }))
}


export function getIpInfo(ip) {
  return {
    asns: getAsns(ip)
  }
}