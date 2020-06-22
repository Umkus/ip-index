# Getting all obviously named ASNs
SELECT count(distinct name)
FROM asns
WHERE LOWER(name) REGEXP (SELECT GROUP_CONCAT(pattern SEPARATOR '|') FROM patterns WHERE type IN ('bad', 'company'))
  AND LOWER(name) NOT REGEXP (SELECT GROUP_CONCAT(pattern SEPARATOR '|') FROM patterns WHERE type IN ('good'));

# Checkin an IP
select *
from ranges
where cidr = '212.92.115.7';

select *
from asns
where cidr = '212.92.112.0/21';

select (INET_ATON(SUBSTRING_INDEX(@cidr, '/', 1)) & 0x00FF0000) >> 16;

# Get a list of all ASNs with bad IPs
explain extended
select count(DISTINCT asns.name)
from ranges r
         INNER JOIN asns ON
        asns.first_octet = r.first_octet AND
        asns.second_octet = r.second_octet AND
        r.ip_from BETWEEN asns.ip_from AND asns.ip_to
WHERE LOWER(asns.name) NOT REGEXP (SELECT GROUP_CONCAT(pattern SEPARATOR '|') FROM patterns WHERE type IN ('good'))
;

set @cidr := '212.92.112.5';
select @cidr;

SELECT INET_ATON(SUBSTRING_INDEX(@cidr, '/', 1)) & 0xffffffff ^ ((0x1 << (32 - SUBSTRING_INDEX(IF(INSTR(@cidr, '/') > 0, @cidr, CONCAT(@cidr, '/32')), '/', -1))) - 1);

select (INET_ATON(SUBSTRING_INDEX(@cidr, '/', 1)) & 0xFF000000) >> 24;

SELECT INET_ATON(SUBSTRING_INDEX(@cidr, '/', 1) & 0xFF000000) >> 24;

select SUBSTRING_INDEX('212.92.112.0/31', '/', 1);

select (INET_ATON('212.92.112.0') & 0xFF000000) >> 24;