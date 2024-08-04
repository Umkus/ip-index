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
const asnRangesIndexed = {}
const geolocationRanges = []

function getPosition(subnet, start) {
  const part = subnet.split(/[:\.]/)[start]
  const isIpV6 = subnet.includes(':')

  return parseInt(part, isIpV6 ? 16 : 10)
}

readFileSync(`${__dirname}/../data/asns_cidrs_2.csv`).toString()
  .split(/\s+/)
  .filter(Boolean)
  .forEach((item, index) => {
    const [asn, cidr, first, last, country] = item.split(',')

    const rangeIndex = getPosition(cidr, 0)

    if (!asnRangesIndexed[rangeIndex]) {
      asnRangesIndexed[rangeIndex] = []
    }

    const rangeIndex2 = getPosition(cidr, 1)

    if (!asnRangesIndexed[rangeIndex][rangeIndex2]) {
      asnRangesIndexed[rangeIndex][rangeIndex2] = []
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

    asnRangesIndexed[rangeIndex][rangeIndex2].push(range)
  })

readFileSync(`${__dirname}/../data/geolocations.csv`).toString()
  .split(/\s+/)
  .filter(Boolean)
  .forEach((item) => {
    const [start, end, latitude, longitue, accuracy] = item.split(',')

    const startB = BigInt(start)
    const endB = BigInt(end)

    const range = {
      start: startB,
      end: endB,
      latitude,
      longitue,
      accuracy
    }

    geolocationRanges.push(range) 
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

  if (!asnRangesIndexed[ipPosition1]) {
    return []
  }

  if (!asnRangesIndexed[ipPosition1][ipPosition2]) {
    const availableKeys = Object.keys(asnRangesIndexed[ipPosition1])
    ipPosition2 = availableKeys.reverse().find((key) => key <= ipPosition2)

    if (!asnRangesIndexed[ipPosition1][ipPosition2]) {
      return []
    }
  }

  const filtered = asnRangesIndexed[ipPosition1][ipPosition2]
    .filter((range) => range && range.start <= ipInt && range.end >= ipInt)

  return filtered
    .map((match) => ({ ...match, ...asns[match.asn] }))
}

function getGeolocations(ip) {
  const ipInt = ipToInt(ip)

  const validRanges = []
  const binarySearch = (arr, val, startIdx = 0, endIdx = arr.length - 1) => {
    if (startIdx > endIdx) return
  
    const midIdx = Math.floor((startIdx + endIdx) / 2)
    const mid = arr[midIdx]
    
    if (val >= mid.start && val <= mid.end) {
      validRanges.push(mid)
      // Store and continue to search
    }

    if (startIdx === endIdx) return

    if (val < mid.start) { // It may only be in lower
      binarySearch(arr, val, startIdx, midIdx - 1)
    } else { // It may be in both because ranges can overlap
      binarySearch(arr, val, startIdx, midIdx - 1)
      binarySearch(arr, val, midIdx + 1, endIdx)
    }
  }
  binarySearch(geolocationRanges, ipInt)

  // Sort by accuracy DESC, then by range length DESC
  return validRanges.sort((a, b) => {
    const aNum = a.accuracy
    const bNum = b.accuracy
  
    if (aNum < bNum) {
      return -1
    } else if (aNum > bNum) {
      return 1
    } else {
      const a2Num = a.end - a.start
      const b2Num = b.end - b.start

      if (a2Num < b2Num) {
        return -1
      } else if (a2Num > b2Num) {
        return 1
      } else {
        return 0
      }
    }
  })
}


export function getIpInfo(ip, withGeolocations = false) {
  let res

  console.time("fetch")
  const asns = getAsns(ip)
  if (withGeolocations) {
    const geolocations = getGeolocations(ip)
    res = { asns, geolocations }
  } else {
    res = asns
  }
  console.timeEnd("fetch")

  return res
}