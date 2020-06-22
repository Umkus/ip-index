# Getting all obviously named ASNs
SELECT DISTINCT name
FROM asns
WHERE LOWER(name) REGEXP (SELECT GROUP_CONCAT(pattern SEPARATOR '|') FROM patterns WHERE type IN ('bad', 'company'))
  AND LOWER(name) NOT REGEXP (SELECT GROUP_CONCAT(pattern SEPARATOR '|') FROM patterns WHERE type IN ('good'))
limit 10;


# Checkin an IP
select *
from ranges
where INET_ATON('212.92.115.7') BETWEEN ip_from AND ip_to;

