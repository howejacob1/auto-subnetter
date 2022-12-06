#!/usr/bin/python3
import ipaddress
from math import floor, ceil, log, log2
BITS_IN_IP = 32

def main():
    ip_raw = input("Enter in the provided IP range. Example: 192.168.0.0/24: ")
    ip = ipaddress.ip_network(ip_raw)
    unallocated_networks = [ip]
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
    print(num_hosts_list)
    network_assignments = []
    for num_hosts in num_hosts_list:
        num_required_ips = num_hosts + 2 # broadcast * network addresses
        subnet_bits_required = ceil(log2(num_required_ips))
        network_bits = 32 - subnet_bits_required
        print(f"{num_hosts} hosts needs {subnet_bits_required} subnet bits or /{network_bits}")
        
if __name__ == "__main__":
    main()

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
