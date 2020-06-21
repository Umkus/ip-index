# Getting all obviously named ASNs
SELECT DISTINCT name
FROM asn
WHERE name REGEXP (SELECT GROUP_CONCAT(pattern SEPARATOR '|') FROM patterns WHERE type IN ('bad', 'company'))
  AND name NOT REGEXP (SELECT GROUP_CONCAT(pattern SEPARATOR '|') FROM patterns WHERE type IN ('good'));


LOAD DATA INFILE '../blocklist-ipsets/' INTO TABLE ipCompare_tbl
    FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY ';'
    IGNORE 1 LINES
    (@ipstart, @ipend, id)
    SET ipStart = INET_ATON(@ipstart), ipEnd = INET_ATON(@ipend);

select INET_ATON('1.0.130.29');

select *
from ranges
where INET_ATON('1.0.130.29') BETWEEN ip_from AND ip_to;

