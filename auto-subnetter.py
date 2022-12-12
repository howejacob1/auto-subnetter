#!/usr/bin/python3
import ipaddress
from ipaddress import IPv4Address
import os
from math import floor, ceil, log, log2
BITS_IN_IP = 32


def main():
    print("")
    print("Enter in the provided IP range. Example: 192.168.0.0/24")
    ip_raw = input("> ")
    ip = ipaddress.ip_network(ip_raw)
    
    print("Enter in a list containing numbers of hosts.")
    print("Seperate using any delimiter. Examples: 323-232 100,20")
    num_hosts_list_raw = input("> ") + " " # hack: put delim at end to make code work
    cur_num_raw = ""
    num_hosts_list = []
    for index, char in enumerate(num_hosts_list_raw):
        if char.isdigit():
            cur_num_raw += char
        elif cur_num_raw != "":
            num_hosts_list.append(int(cur_num_raw))
            cur_num_raw = ""

    num_hosts_list.sort(reverse=True)

    # now we need to convert an IP to a list of bytes, then add 
    # read one integer at a time until a non-integer is encountered. Then, end this integer, add it to the list
    unallocated_networks = [ip]
    network_assignments = []
    for num_hosts in num_hosts_list:
        num_required_ips = num_hosts + 2 # broadcast * network addresses
        subnet_bits_required = ceil(log2(num_required_ips))
        network_bits = 32 - subnet_bits_required
        # now find closest subnet
        # find highest one that can fit
        network_found = False
        best_network = None
        while not network_found:
            for network in unallocated_networks:
                if network.prefixlen == network_bits:
                    network_assignments.append({"num_hosts": num_hosts, "network": network})
                    unallocated_networks.remove(network)
                    network_found = True
                    break
                elif network.prefixlen < network_bits: # network too big, must divide
                    if best_network is None:
                        best_network = network
                    elif best_network.prefixlen < network.prefixlen:
                        best_network = network
            if not network_found:
                if best_network is None:
                    raise BaseException(f"couldn't find a network to fit {num_hosts} hosts")
                # now we have a network that is too large. Divide it by two, redo the loop.
                else:
                    index = unallocated_networks.index(best_network)
                    unallocated_networks.pop(index)
                    for subnet in best_network.subnets():
                        unallocated_networks.insert(index, subnet)
                        index += 1
    for assignment in network_assignments:
        network = assignment["network"]
        num_hosts = assignment["num_hosts"]
        host_bits = 32-network.prefixlen
        first_ip_in_network = IPv4Address(network.network_address)

        print(f"Allocated network {network} for {num_hosts} hosts.")
        print(f"    Subnet mask: {network.netmask}")
        print(f"    Broadcast address: {network.broadcast_address}")
        print(f"    Number of IP addresses: {network.num_addresses}")
        print(f"    Host bits: {host_bits}")
        print(f"    First IP in network (invalid, reserved for network): {first_ip_in_network}")
        print(f"    First host IP in network: {first_ip_in_network + 1}")
        print(f"    Last host IP: {first_ip_in_network+network.num_addresses-2}")
        print(f"    Last IP: {first_ip_in_network+network.num_addresses-1}")
        print(f"    First IP of next network: {first_ip_in_network+network.num_addresses}")
        
    for network in unallocated_networks:
        print(f"Did not use network {network}.")

if __name__ == "__main__":
    main()
    if os.name == "nt":
        input("Press enter to exit.")

# For those of you who is working on the 4 bonuspoint subnet design program (Python)
# If you are working on this program, please make sure you implement the following regarding input of parameters.
# These parameters can be put either in a file (name of which becomes the parameters to the program, when you start it),
# or can be typed in, after the program starts. If the program starts without a file-name input parameter, then the program asks for it.
# 1st line, base subnet address: a.b.c.d/n
# 2nd line, subnet sizes in any order: n1, n2 n3 n4, n5   # number are separated either by a comma "," or space " ", or both
# If the program reads the parameters from a file, then any line starting with a hash "#" is considered a comment and ignored.
# Once you have completed your program, please set up a time with me to show me in my office.
# Thank you all and good luck.
# -PK
