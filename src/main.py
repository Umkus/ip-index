from netaddr import IPSet, IPRange
from mmdb_writer import MMDBWriter
import csv
import requests
import gzip
import shutil
import os
import maxminddb

current_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(current_dir, "..", "data")

writer = MMDBWriter(ip_version=6, ipv4_compatible=True)

tsv_file = f"{data_path}/ip2asn-combined.tsv"
mmdb_file = f"{data_path}/ip-index.mmdb"
asns_dcs_file = f"{data_path}/asns_dcs.csv"
nord_ips_file = f"{data_path}/ips_nord.csv"

m = maxminddb.open_database(mmdb_file)


def download(url, save_path):
    """
    Downloads a file from the given URL and saves it to the specified path.

    Parameters:
    url (str): The URL of the file to download.
    save_path (str): The path where the file should be saved.
    """
    # Create the directory if it doesn't exist
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    try:
        # Sending a GET request to the URL
        response = requests.get(url)

        # Check if the request was successful
        response.raise_for_status()

        # Writing the content to the specified file
        with open(save_path, "wb") as file:
            file.write(response.content)

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")


def download_and_unzip(url, compressed_file_path, uncompressed_file_path):
    # Download the file
    response = requests.get(url)
    with open(compressed_file_path, "wb") as f:
        f.write(response.content)

    # Unzip the file
    with gzip.open(compressed_file_path, "rb") as f_in:
        with open(uncompressed_file_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)


def get_networks(start_ip, end_ip):
    ip_range = IPRange(start_ip, end_ip)
    return IPSet(ip_range)


download_and_unzip(
    "https://iptoasn.com/data/ip2asn-combined.tsv.gz",
    f"{data_path}/ip2asn-combined.tsv.gz",
    f"{data_path}/ip2asn-combined.tsv",
)

download(
    "https://github.com/Umkus/nordvpn-ips/releases/download/ips/ips.csv",
    nord_ips_file,
)

with open(nord_ips_file, "r") as nord_file:
    nord_ips = {line.strip() for line in nord_file if line.strip()}

nord_asns = set()

for ip in nord_ips:
    try:
        record = m.get(ip)
        if record and "asn" in record:
            nord_asns.add(record["asn"])
    except Exception as e:
        print(f"Error retrieving ASN for IP {ip}: {e}")

with open(asns_dcs_file, "r") as asns_file:
    hosting_asns = {int(line.strip()) for line in asns_file if line.strip().isdigit()}

hosting_asns = hosting_asns.union(nord_asns)

with open(asns_dcs_file, "w") as asns_file:
    for asn in sorted(hosting_asns):
        asns_file.write(f"{asn}\n")

with open(tsv_file, "r") as tsvfile:
    reader = csv.DictReader(tsvfile, delimiter="\t")

    for rowR in reader:
        row = list(rowR.values())

        start_ip = row[0]
        end_ip = row[1]
        asn = int(row[2])
        country_code = row[3]
        asn_name = row[4]

        ipset = get_networks(start_ip, end_ip)

        record = {
            "asn": asn,
            "country": country_code,
            "asn_name": asn_name,
            "hosting": 1 if asn in hosting_asns else 0,
        }

        writer.insert_network(ipset, record)

writer.to_db_file(mmdb_file)
