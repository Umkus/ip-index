CREATE TABLE IF NOT EXISTS asns
(
    ip_from INT(10) UNSIGNED,
    ip_to   INT(10) UNSIGNED,
    cidr    VARCHAR(18),
    asn     VARCHAR(10),
    name    VARCHAR(256),
    INDEX idx_ip_from (ip_from),
    INDEX idx_ip_to (ip_to),
    INDEX idx_ip_from_to (ip_from, ip_to),
    INDEX idx_name (name)
) ENGINE = MyISAM
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin;

CREATE TABLE IF NOT EXISTS patterns
(
    pattern varchar(64),
    type    varchar(16),
    INDEX idx_pattern (pattern)
) ENGINE = MyISAM
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin;

CREATE TABLE IF NOT EXISTS ranges
(
    ip_from INT(10) UNSIGNED as (INET_ATON(
                                         SUBSTRING_INDEX(IF(INSTR(cidr, '/') > 0, cidr, CONCAT(cidr, '/32')), '/', 1)) &
                                 0xffffffff ^ ((0x1 << (32 - SUBSTRING_INDEX(
                                         IF(INSTR(cidr, '/') > 0, cidr, CONCAT(cidr, '/32')), '/', -1))) - 1)),
    ip_to   INT(10) UNSIGNED as (INET_ATON(
                                         SUBSTRING_INDEX(IF(INSTR(cidr, '/') > 0, cidr, CONCAT(cidr, '/32')), '/', 1)) |
                                 ((0x100000000 >>
                                   SUBSTRING_INDEX(IF(INSTR(cidr, '/') > 0, cidr, CONCAT(cidr, '/32')), '/', -1)) - 1)),
    cidr    VARCHAR(18),
    name    VARCHAR(64),
    UNIQUE INDEX idx_cidr_uniq (cidr),
    INDEX idx_ip_from (ip_from),
    INDEX idx_ip_to (ip_to),
    INDEX idx_ip_from_to (ip_from, ip_to),
    INDEX idx_name (name)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_bin;

LOAD DATA LOCAL INFILE '/data/patterns/bad.csv'
    INTO TABLE patterns
    FIELDS TERMINATED BY ','
    OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    (pattern, type)
    SET type = 'bad';

LOAD DATA LOCAL INFILE '/data/patterns/good.csv'
    INTO TABLE patterns
    FIELDS TERMINATED BY ','
    OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    (pattern, type)
    SET type = 'good';

LOAD DATA LOCAL INFILE '/data/patterns/companies.csv'
    INTO TABLE patterns
    FIELDS TERMINATED BY ','
    OPTIONALLY ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    (pattern, type)
    SET type = 'company';

LOAD DATA LOCAL INFILE '/data/IP2LOCATION-LITE-ASN.CSV'     INTO TABLE asns    FIELDS TERMINATED BY ','    OPTIONALLY ENCLOSED BY '"'    LINES TERMINATED BY '\n';

LOAD DATA LOCAL INFILE '/data/sets/stopforumspam_365d.ipset' INTO TABLE ranges FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' (cidr, name)
    set name = 'stopforumspam_365d';

LOAD DATA LOCAL INFILE '/data/sets/firehol_anonymous.netset' INTO TABLE ranges FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' (cidr, name)
    set name = 'firehol_anonymous';

LOAD DATA LOCAL INFILE '/data/sets/alienvault_reputation.ipset' INTO TABLE ranges FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n' (cidr, name)
    set name = 'alienvault_reputation';

