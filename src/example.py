import maxminddb
import os


current_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(current_dir, '..', 'data')

m = maxminddb.open_database(f"{data_path}/ip-index.mmdb")
r = m.get('1.1.1.1')
assert r == {'asn': 13335, 'country': 'US', 'asn_name': 'CLOUDFLARENET', 'hosting': 1}
print(r)
