(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
var width = 960,
    height = 500,
    selected_node, selected_target_node,
    selected_link, new_line,
    circlesg, linesg,
    should_drag = false,
    drawing_line = false,
    nodes = [],
    links = [],
    link_distance = 90;

var default_name = "new node"

var force = d3.layout.force()
    .charge(-340)
    .linkDistance(link_distance)
    .size([width, height]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.select(window)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)
    .on("keydown", keydown)
    .on("keyup", keyup);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("mousedown", mousedown);

// Arrow marker
svg.append("svg:defs").selectAll("marker")
  .data(["child"])
  .enter().append("svg:marker")
  .attr("id", String)
  .attr("markerUnits", "userSpaceOnUse")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", link_distance)
  .attr("refY", -1.1)
  .attr("markerWidth", 10)
  .attr("markerHeight", 10)
  .attr("orient", "auto")
  .append("svg:path")
  .attr("d", "M0,-5L10,0L0,5");


linesg = svg.append("g");
circlesg = svg.append("g");

initial_json = {"nodes":[{"name":"Myriel","group":1},{"name":"Napoleon","group":1},{"name":"Mlle.Baptistine","group":1},{"name":"Mme.Magloire","group":1},{"name":"CountessdeLo","group":1},{"name":"Geborand","group":1},{"name":"Champtercier","group":1},{"name":"Cravatte","group":1},{"name":"Count","group":1},{"name":"OldMan","group":1}],"links":[{"source":0,"target":1,"value":1},{"source":1,"target":2,"value":8},{"source":1,"target":3,"value":10},{"source":3,"target":4,"value":1},{"source":3,"target":5,"value":1},{"source":4,"target":6,"value":1},{"source":6,"target":7,"value":1},{"source":1,"target":4,"value":2},{"source":7,"target":8,"value":1},{"source":8,"target":9,"value":1},{"source":1,"target":9,"value":1},{"source":3,"target":9,"value":1}]}

function do_init_nodes(json) {
    // decorate a node with a count of its children
  nodes = json.nodes;
  links = json.links;
  update();
  force = force
	.nodes(nodes)
	.links(links);
  console.log("started")
  force.start();
}
do_init_nodes(initial_json);

function is_empty(list) {
    return list.length === 0
}

var ipaddr = require("ipaddr.js")

console.log(ipaddr)

// maybe have it be like this. Have available networks.
// then we can divide it by two.
// Always divide until we get to the smallest one before we
// run out. I think that's pretty good.

// 

// function split_ip(starting_ip, subnet_mask)

function str_ip_to_int_ip(str_ip) {
    let as_byte_array = ipaddr.parse(str_ip).toByteArray();
    console.log("byte array: " + as_byte_array)
    let as_int = 0;
    let multiplier = 1;
    for (index = as_byte_array.length-1; index >= 0; index--) {
	as_int += multiplier*as_byte_array[index];
	multiplier *= 256;
    }
    return as_int;
}

function str_ip_to_int_ip_test() {
    return str_ip_to_int_ip("192.168.0.1");
}

// network byte order (big endian)

function int_ip_to_byte_array(int_ip, num_bytes) {
    let byte_array = new Array(num_bytes);
    let index = 0;
    for (index = 0; index < num_bytes; index++) {
	byte_array[num_bytes - 1 - index] = int_ip & 255;
	int_ip >>= 8;
    }
    return byte_array;
}



function int_ip_to_byte_array_test() {
    return int_ip_to_byte_array(str_ip_to_int_ip("192.168.0.1"), 4)
}

function int_ip_to_str_ip(int_ip) {
    console.log("the byte array is " + int_ip_to_byte_array(int_ip, 4))
    return ipaddr.fromByteArray(int_ip_to_byte_array(int_ip, 4)).toString();
}

function int_ip_to_str_ip_test() {
    return int_ip_to_str_ip(str_ip_to_int_ip("192.168.0.1"), 4)
}

// now go through all the available subnets
// subnetspec: {ip_int: ip_as_int}
// returns two subnets,
function half_subnetspec(subnetspec) {
    subnet_bits = subnetspec.subnet_bits-1;
    first_subnet = {ip: subnetspec.ip,
		    subnet_bits: subnet_bits};
    second_subnet = {ip: subnetspec.ip + Math.pow(2, 32-subnet_bits),
		     subnet_bits: subnet_bits};
    return [first_subnet, second_subnet];
}

// function 
function allocate_ips(starting_ip, subnet_bits, num_hosts_list) {
    networks_available = [{ip: starting_ip,
			   subnet_bits: subnet_bits}]
    allocated_networks = []
    while ((num_hosts_list.length !== 0) && (networks_available.length !== 0)) {
	subnet_num_ips = num_hosts_list.pop() + 2 // add broadcast/network address
	// first find the next largest power of two that fits.
	// so, log_2()
	target_subnet_size = Math.pow(2, Math.ceil(Math.log2(subnet_num_ips)))
	console.log("subnet_num_ips: " + subnet_num_ips + "target_subnet_size: " + target_subnet_size)
	// now find the next largest IP subnet that fits
    }
    if (is_empty(networks_available) && !is_empty(num_hosts_list)) {
	console.log("not enough networks available")
    }
    return allocated_networks
}

function allocate_ip_test() {
    console.log(allocate_ips("192.168.1.0", "255.255.255.0", [63, 62, 100]))
    console.log("as byte array: " + int_ip_to_byte_array_test())
    console.log("as int: " + str_ip_to_int_ip_test())
    console.log("here")
    console.log("as str: " + int_ip_to_str_ip_test())
    console.log("str->int->str: " + int_ip_to_str_ip(str_ip_to_int_ip("192.168.0.1")))
}

global.allocate_ip_test = allocate_ip_test

function update() {
  var link = linesg.selectAll("line.link")
      .data(links)
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .classed("selected", function(d) { return d === selected_link; });
  link.enter().append("line")
    .attr("class", "link")
    .attr("marker-end", "url(#child)")
    .on("mousedown", line_mousedown);
  link.exit().remove();

  var node = circlesg.selectAll(".node")
    .data(nodes, function(d) {return d.name;})
    .classed("selected", function(d) { return d === selected_node; })
    .classed("selected_target", function(d) { return d === selected_target_node; })
  var nodeg = node.enter()
    .append("g")
    .attr("class", "node").call(force.drag)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  nodeg.append("circle")
    .attr("r", 10)
    .on("mousedown", node_mousedown)
    .on("mouseover", node_mouseover)
    .on("mouseout", node_mouseout);
  nodeg
    .append("svg:a")
    .attr("xlink:href", function (d) { return d.url || '#'; })
    .append("text")
    .attr("dx", 12)
    .attr("dy", ".35em")
    .text(function(d) {return d.name});
  node.exit().remove();

  force.on("tick", function(e) {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
}

// select target node for new node connection
function node_mouseover(d) {
  if (drawing_line && d !== selected_node) {
    // highlight and select target node
    selected_target_node = d;
  }
}

function node_mouseout(d) {
  if (drawing_line) {
    selected_target_node = null;
  }
}

// select node / start drag
function node_mousedown(d) {
  if (!drawing_line) {
    selected_node = d;
    selected_link = null;
  }
  if (!should_drag) {
    d3.event.stopPropagation();
    drawing_line = true;
  }
  d.fixed = true;
  force.stop()
  update();
}

// select line
function line_mousedown(d) {
  selected_link = d;
  selected_node = null;
  update();
}

// draw yellow "new connector" line
function mousemove() {
  if (drawing_line && !should_drag) {
    var m = d3.mouse(svg.node());
    var x = Math.max(0, Math.min(width, m[0]));
    var y = Math.max(0, Math.min(height, m[1]));
    // debounce - only start drawing line if it gets a bit big
    var dx = selected_node.x - x;
    var dy = selected_node.y - y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      // draw a line
      if (!new_line) {
        new_line = linesg.append("line").attr("class", "new_line");
      }
      new_line.attr("x1", function(d) { return selected_node.x; })
        .attr("y1", function(d) { return selected_node.y; })
        .attr("x2", function(d) { return x; })
        .attr("y2", function(d) { return y; });
    }
  }
  update();
}

// add a new disconnected node
function mousedown() {
  m = d3.mouse(svg.node())
  nodes.push({x: m[0], y: m[1], name: default_name + " " + nodes.length, group: 1});
  selected_link = null;
  force.stop();
  update();
  force.start();
}

// end node select / add new connected node
function mouseup() {
  drawing_line = false;
  if (new_line) {
    if (selected_target_node) {
      selected_target_node.fixed = false;
      var new_node = selected_target_node;
    } else {
      var m = d3.mouse(svg.node());
      var new_node = {x: m[0], y: m[1], name: default_name + " " + nodes.length, group: 1}
      nodes.push(new_node);
    }
    selected_node.fixed = false;
    links.push({source: selected_node, target: new_node})
    selected_node = selected_target_node = null;
    update();
    setTimeout(function () {
      new_line.remove();
      new_line = null;
      force.start();
    }, 300);
  }
}

function keyup() {
  switch (d3.event.keyCode) {
    case 16: { // shift
      should_drag = false;
      update();
      force.start();
    }
  }
}

// select for dragging node with shift; delete node with backspace
function keydown() {
  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: { // delete
      if (selected_node) { // deal with nodes
        var i = nodes.indexOf(selected_node);
        nodes.splice(i, 1);
        // find links to/from this node, and delete them too
        var new_links = [];
        links.forEach(function(l) {
          if (l.source !== selected_node && l.target !== selected_node) {
            new_links.push(l);
          }
        });
        links = new_links;
        selected_node = nodes.length ? nodes[i > 0 ? i - 1 : 0] : null;
      } else if (selected_link) { // deal with links
        var i = links.indexOf(selected_link);
        links.splice(i, 1);
        selected_link = links.length ? links[i > 0 ? i - 1 : 0] : null;
      }
      update();
      break;
    }
    case 16: { // shift
      should_drag = true;
      break;
    }
  }
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"ipaddr.js":2}],2:[function(require,module,exports){
(function (root) {
    'use strict';
    // A list of regular expressions that match arbitrary IPv4 addresses,
    // for which a number of weird notations exist.
    // Note that an address like 0010.0xa5.1.1 is considered legal.
    const ipv4Part = '(0?\\d+|0x[a-f0-9]+)';
    const ipv4Regexes = {
        fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, 'i'),
        twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, 'i'),
        longValue: new RegExp(`^${ipv4Part}$`, 'i')
    };

    // Regular Expression for checking Octal numbers
    const octalRegex = new RegExp(`^0[0-7]+$`, 'i');
    const hexRegex = new RegExp(`^0x[a-f0-9]+$`, 'i');

    const zoneIndex = '%[0-9a-z]{1,}';

    // IPv6-matching regular expressions.
    // For IPv6, the task is simpler: it is enough to match the colon-delimited
    // hexadecimal IPv6 and a transitional variant with dotted-decimal IPv4 at
    // the end.
    const ipv6Part = '(?:[0-9a-f]+::?)+';
    const ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndex, 'i'),
        'native': new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, 'i'),
        deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, 'i'),
        transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, 'i')
    };

    // Expand :: in an IPv6 address or address part consisting of `parts` groups.
    function expandIPv6 (string, parts) {
        // More than one '::' means invalid adddress
        if (string.indexOf('::') !== string.lastIndexOf('::')) {
            return null;
        }

        let colonCount = 0;
        let lastColon = -1;
        let zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0];
        let replacement, replacementCount;

        // Remove zone index and save it for later
        if (zoneId) {
            zoneId = zoneId.substring(1);
            string = string.replace(/%.+$/, '');
        }

        // How many parts do we already have?
        while ((lastColon = string.indexOf(':', lastColon + 1)) >= 0) {
            colonCount++;
        }

        // 0::0 is two parts more than ::
        if (string.substr(0, 2) === '::') {
            colonCount--;
        }

        if (string.substr(-2, 2) === '::') {
            colonCount--;
        }

        // The following loop would hang if colonCount > parts
        if (colonCount > parts) {
            return null;
        }

        // replacement = ':' + '0:' * (parts - colonCount)
        replacementCount = parts - colonCount;
        replacement = ':';
        while (replacementCount--) {
            replacement += '0:';
        }

        // Insert the missing zeroes
        string = string.replace('::', replacement);

        // Trim any garbage which may be hanging around if :: was at the edge in
        // the source strin
        if (string[0] === ':') {
            string = string.slice(1);
        }

        if (string[string.length - 1] === ':') {
            string = string.slice(0, -1);
        }

        parts = (function () {
            const ref = string.split(':');
            const results = [];

            for (let i = 0; i < ref.length; i++) {
                results.push(parseInt(ref[i], 16));
            }

            return results;
        })();

        return {
            parts: parts,
            zoneId: zoneId
        };
    }

    // A generic CIDR (Classless Inter-Domain Routing) RFC1518 range matcher.
    function matchCIDR (first, second, partSize, cidrBits) {
        if (first.length !== second.length) {
            throw new Error('ipaddr: cannot match CIDR for objects with different lengths');
        }

        let part = 0;
        let shift;

        while (cidrBits > 0) {
            shift = partSize - cidrBits;
            if (shift < 0) {
                shift = 0;
            }

            if (first[part] >> shift !== second[part] >> shift) {
                return false;
            }

            cidrBits -= partSize;
            part += 1;
        }

        return true;
    }

    function parseIntAuto (string) {
        // Hexadedimal base 16 (0x#)
        if (hexRegex.test(string)) {
            return parseInt(string, 16);
        }
        // While octal representation is discouraged by ECMAScript 3
        // and forbidden by ECMAScript 5, we silently allow it to
        // work only if the rest of the string has numbers less than 8.
        if (string[0] === '0' && !isNaN(parseInt(string[1], 10))) {
        if (octalRegex.test(string)) {
            return parseInt(string, 8);
        }
            throw new Error(`ipaddr: cannot parse ${string} as octal`);
        }
        // Always include the base 10 radix!
        return parseInt(string, 10);
    }

    function padPart (part, length) {
        while (part.length < length) {
            part = `0${part}`;
        }

        return part;
    }

    const ipaddr = {};

    // An IPv4 address (RFC791).
    ipaddr.IPv4 = (function () {
        // Constructs a new IPv4 address from an array of four octets
        // in network order (MSB first)
        // Verifies the input.
        function IPv4 (octets) {
            if (octets.length !== 4) {
                throw new Error('ipaddr: ipv4 octet count should be 4');
            }

            let i, octet;

            for (i = 0; i < octets.length; i++) {
                octet = octets[i];
                if (!((0 <= octet && octet <= 255))) {
                    throw new Error('ipaddr: ipv4 octet should fit in 8 bits');
                }
            }

            this.octets = octets;
        }

        // Special IPv4 address ranges.
        // See also https://en.wikipedia.org/wiki/Reserved_IP_addresses
        IPv4.prototype.SpecialRanges = {
            unspecified: [[new IPv4([0, 0, 0, 0]), 8]],
            broadcast: [[new IPv4([255, 255, 255, 255]), 32]],
            // RFC3171
            multicast: [[new IPv4([224, 0, 0, 0]), 4]],
            // RFC3927
            linkLocal: [[new IPv4([169, 254, 0, 0]), 16]],
            // RFC5735
            loopback: [[new IPv4([127, 0, 0, 0]), 8]],
            // RFC6598
            carrierGradeNat: [[new IPv4([100, 64, 0, 0]), 10]],
            // RFC1918
            'private': [
                [new IPv4([10, 0, 0, 0]), 8],
                [new IPv4([172, 16, 0, 0]), 12],
                [new IPv4([192, 168, 0, 0]), 16]
            ],
            // Reserved and testing-only ranges; RFCs 5735, 5737, 2544, 1700
            reserved: [
                [new IPv4([192, 0, 0, 0]), 24],
                [new IPv4([192, 0, 2, 0]), 24],
                [new IPv4([192, 88, 99, 0]), 24],
                [new IPv4([198, 51, 100, 0]), 24],
                [new IPv4([203, 0, 113, 0]), 24],
                [new IPv4([240, 0, 0, 0]), 4]
            ]
        };

        // The 'kind' method exists on both IPv4 and IPv6 classes.
        IPv4.prototype.kind = function () {
            return 'ipv4';
        };

        // Checks if this address matches other one within given CIDR range.
        IPv4.prototype.match = function (other, cidrRange) {
            let ref;
            if (cidrRange === undefined) {
                ref = other;
                other = ref[0];
                cidrRange = ref[1];
            }

            if (other.kind() !== 'ipv4') {
                throw new Error('ipaddr: cannot match ipv4 address with non-ipv4 one');
            }

            return matchCIDR(this.octets, other.octets, 8, cidrRange);
        };

        // returns a number of leading ones in IPv4 address, making sure that
        // the rest is a solid sequence of 0's (valid netmask)
        // returns either the CIDR length or null if mask is not valid
        IPv4.prototype.prefixLengthFromSubnetMask = function () {
            let cidr = 0;
            // non-zero encountered stop scanning for zeroes
            let stop = false;
            // number of zeroes in octet
            const zerotable = {
                0: 8,
                128: 7,
                192: 6,
                224: 5,
                240: 4,
                248: 3,
                252: 2,
                254: 1,
                255: 0
            };
            let i, octet, zeros;

            for (i = 3; i >= 0; i -= 1) {
                octet = this.octets[i];
                if (octet in zerotable) {
                    zeros = zerotable[octet];
                    if (stop && zeros !== 0) {
                        return null;
                    }

                    if (zeros !== 8) {
                        stop = true;
                    }

                    cidr += zeros;
                } else {
                    return null;
                }
            }

            return 32 - cidr;
        };

        // Checks if the address corresponds to one of the special ranges.
        IPv4.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        // Returns an array of byte-sized values in network order (MSB first)
        IPv4.prototype.toByteArray = function () {
            return this.octets.slice(0);
        };

        // Converts this IPv4 address to an IPv4-mapped IPv6 address.
        IPv4.prototype.toIPv4MappedAddress = function () {
            return ipaddr.IPv6.parse(`::ffff:${this.toString()}`);
        };

        // Symmetrical method strictly for aligning with the IPv6 methods.
        IPv4.prototype.toNormalizedString = function () {
            return this.toString();
        };

        // Returns the address in convenient, decimal-dotted format.
        IPv4.prototype.toString = function () {
            return this.octets.join('.');
        };

        return IPv4;
    })();

    // A utility function to return broadcast address given the IPv4 interface and prefix length in CIDR notation
    ipaddr.IPv4.broadcastAddressFromCIDR = function (string) {

        try {
            const cidr = this.parseCIDR(string);
            const ipInterfaceOctets = cidr[0].toByteArray();
            const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            const octets = [];
            let i = 0;
            while (i < 4) {
                // Broadcast address is bitwise OR between ip interface and inverted mask
                octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
                i++;
            }

            return new this(octets);
        } catch (e) {
            throw new Error('ipaddr: the address does not have IPv4 CIDR format');
        }
    };

    // Checks if a given string is formatted like IPv4 address.
    ipaddr.IPv4.isIPv4 = function (string) {
        return this.parser(string) !== null;
    };

    // Checks if a given string is a valid IPv4 address.
    ipaddr.IPv4.isValid = function (string) {
        try {
            new this(this.parser(string));
            return true;
        } catch (e) {
            return false;
        }
    };

    // Checks if a given string is a full four-part IPv4 Address.
    ipaddr.IPv4.isValidFourPartDecimal = function (string) {
        if (ipaddr.IPv4.isValid(string) && string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/)) {
            return true;
        } else {
            return false;
        }
    };

    // A utility function to return network address given the IPv4 interface and prefix length in CIDR notation
    ipaddr.IPv4.networkAddressFromCIDR = function (string) {
        let cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;

        try {
            cidr = this.parseCIDR(string);
            ipInterfaceOctets = cidr[0].toByteArray();
            subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            octets = [];
            i = 0;
            while (i < 4) {
                // Network address is bitwise AND between ip interface and mask
                octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
                i++;
            }

            return new this(octets);
        } catch (e) {
            throw new Error('ipaddr: the address does not have IPv4 CIDR format');
        }
    };

    // Tries to parse and validate a string with IPv4 address.
    // Throws an error if it fails.
    ipaddr.IPv4.parse = function (string) {
        const parts = this.parser(string);

        if (parts === null) {
            throw new Error('ipaddr: string is not formatted like an IPv4 Address');
        }

        return new this(parts);
    };

    // Parses the string as an IPv4 Address with CIDR Notation.
    ipaddr.IPv4.parseCIDR = function (string) {
        let match;

        if ((match = string.match(/^(.+)\/(\d+)$/))) {
            const maskLength = parseInt(match[2]);
            if (maskLength >= 0 && maskLength <= 32) {
                const parsed = [this.parse(match[1]), maskLength];
                Object.defineProperty(parsed, 'toString', {
                    value: function () {
                        return this.join('/');
                    }
                });
                return parsed;
            }
        }

        throw new Error('ipaddr: string is not formatted like an IPv4 CIDR range');
    };

    // Classful variants (like a.b, where a is an octet, and b is a 24-bit
    // value representing last three octets; this corresponds to a class C
    // address) are omitted due to classless nature of modern Internet.
    ipaddr.IPv4.parser = function (string) {
        let match, part, value;

        // parseInt recognizes all that octal & hexadecimal weirdness for us
        if ((match = string.match(ipv4Regexes.fourOctet))) {
            return (function () {
                const ref = match.slice(1, 6);
                const results = [];

                for (let i = 0; i < ref.length; i++) {
                    part = ref[i];
                    results.push(parseIntAuto(part));
                }

                return results;
            })();
        } else if ((match = string.match(ipv4Regexes.longValue))) {
            value = parseIntAuto(match[1]);
            if (value > 0xffffffff || value < 0) {
                throw new Error('ipaddr: address outside defined range');
            }

            return ((function () {
                const results = [];
                let shift;

                for (shift = 0; shift <= 24; shift += 8) {
                    results.push((value >> shift) & 0xff);
                }

                return results;
            })()).reverse();
        } else if ((match = string.match(ipv4Regexes.twoOctet))) {
            return (function () {
                const ref = match.slice(1, 4);
                const results = [];

                value = parseIntAuto(ref[1]);
                if (value > 0xffffff || value < 0) {
                    throw new Error('ipaddr: address outside defined range');
                }

                results.push(parseIntAuto(ref[0]));
                results.push((value >> 16) & 0xff);
                results.push((value >>  8) & 0xff);
                results.push( value        & 0xff);

                return results;
            })();
        } else if ((match = string.match(ipv4Regexes.threeOctet))) {
            return (function () {
                const ref = match.slice(1, 5);
                const results = [];

                value = parseIntAuto(ref[2]);
                if (value > 0xffff || value < 0) {
                    throw new Error('ipaddr: address outside defined range');
                }

                results.push(parseIntAuto(ref[0]));
                results.push(parseIntAuto(ref[1]));
                results.push((value >> 8) & 0xff);
                results.push( value       & 0xff);

                return results;
            })();
        } else {
            return null;
        }
    };

    // A utility function to return subnet mask in IPv4 format given the prefix length
    ipaddr.IPv4.subnetMaskFromPrefixLength = function (prefix) {
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 32) {
            throw new Error('ipaddr: invalid IPv4 prefix length');
        }

        const octets = [0, 0, 0, 0];
        let j = 0;
        const filledOctetCount = Math.floor(prefix / 8);

        while (j < filledOctetCount) {
            octets[j] = 255;
            j++;
        }

        if (filledOctetCount < 4) {
            octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - (prefix % 8);
        }

        return new this(octets);
    };

    // An IPv6 address (RFC2460)
    ipaddr.IPv6 = (function () {
        // Constructs an IPv6 address from an array of eight 16 - bit parts
        // or sixteen 8 - bit parts in network order(MSB first).
        // Throws an error if the input is invalid.
        function IPv6 (parts, zoneId) {
            let i, part;

            if (parts.length === 16) {
                this.parts = [];
                for (i = 0; i <= 14; i += 2) {
                    this.parts.push((parts[i] << 8) | parts[i + 1]);
                }
            } else if (parts.length === 8) {
                this.parts = parts;
            } else {
                throw new Error('ipaddr: ipv6 part count should be 8 or 16');
            }

            for (i = 0; i < this.parts.length; i++) {
                part = this.parts[i];
                if (!((0 <= part && part <= 0xffff))) {
                    throw new Error('ipaddr: ipv6 part should fit in 16 bits');
                }
            }

            if (zoneId) {
                this.zoneId = zoneId;
            }
        }

        // Special IPv6 ranges
        IPv6.prototype.SpecialRanges = {
            // RFC4291, here and after
            unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
            linkLocal: [new IPv6([0xfe80, 0, 0, 0, 0, 0, 0, 0]), 10],
            multicast: [new IPv6([0xff00, 0, 0, 0, 0, 0, 0, 0]), 8],
            loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
            uniqueLocal: [new IPv6([0xfc00, 0, 0, 0, 0, 0, 0, 0]), 7],
            ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 0xffff, 0, 0]), 96],
            // RFC6145
            rfc6145: [new IPv6([0, 0, 0, 0, 0xffff, 0, 0, 0]), 96],
            // RFC6052
            rfc6052: [new IPv6([0x64, 0xff9b, 0, 0, 0, 0, 0, 0]), 96],
            // RFC3056
            '6to4': [new IPv6([0x2002, 0, 0, 0, 0, 0, 0, 0]), 16],
            // RFC6052, RFC6146
            teredo: [new IPv6([0x2001, 0, 0, 0, 0, 0, 0, 0]), 32],
            // RFC4291
            reserved: [[new IPv6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]), 32]]
        };

        // Checks if this address is an IPv4-mapped IPv6 address.
        IPv6.prototype.isIPv4MappedAddress = function () {
            return this.range() === 'ipv4Mapped';
        };

        // The 'kind' method exists on both IPv4 and IPv6 classes.
        IPv6.prototype.kind = function () {
            return 'ipv6';
        };

        // Checks if this address matches other one within given CIDR range.
        IPv6.prototype.match = function (other, cidrRange) {
            let ref;

            if (cidrRange === undefined) {
                ref = other;
                other = ref[0];
                cidrRange = ref[1];
            }

            if (other.kind() !== 'ipv6') {
                throw new Error('ipaddr: cannot match ipv6 address with non-ipv6 one');
            }

            return matchCIDR(this.parts, other.parts, 16, cidrRange);
        };

        // returns a number of leading ones in IPv6 address, making sure that
        // the rest is a solid sequence of 0's (valid netmask)
        // returns either the CIDR length or null if mask is not valid
        IPv6.prototype.prefixLengthFromSubnetMask = function () {
            let cidr = 0;
            // non-zero encountered stop scanning for zeroes
            let stop = false;
            // number of zeroes in octet
            const zerotable = {
                0: 16,
                32768: 15,
                49152: 14,
                57344: 13,
                61440: 12,
                63488: 11,
                64512: 10,
                65024: 9,
                65280: 8,
                65408: 7,
                65472: 6,
                65504: 5,
                65520: 4,
                65528: 3,
                65532: 2,
                65534: 1,
                65535: 0
            };
            let part, zeros;

            for (let i = 7; i >= 0; i -= 1) {
                part = this.parts[i];
                if (part in zerotable) {
                    zeros = zerotable[part];
                    if (stop && zeros !== 0) {
                        return null;
                    }

                    if (zeros !== 16) {
                        stop = true;
                    }

                    cidr += zeros;
                } else {
                    return null;
                }
            }

            return 128 - cidr;
        };


        // Checks if the address corresponds to one of the special ranges.
        IPv6.prototype.range = function () {
            return ipaddr.subnetMatch(this, this.SpecialRanges);
        };

        // Returns an array of byte-sized values in network order (MSB first)
        IPv6.prototype.toByteArray = function () {
            let part;
            const bytes = [];
            const ref = this.parts;
            for (let i = 0; i < ref.length; i++) {
                part = ref[i];
                bytes.push(part >> 8);
                bytes.push(part & 0xff);
            }

            return bytes;
        };

        // Returns the address in expanded format with all zeroes included, like
        // 2001:0db8:0008:0066:0000:0000:0000:0001
        IPv6.prototype.toFixedLengthString = function () {
            const addr = ((function () {
                const results = [];
                for (let i = 0; i < this.parts.length; i++) {
                    results.push(padPart(this.parts[i].toString(16), 4));
                }

                return results;
            }).call(this)).join(':');

            let suffix = '';

            if (this.zoneId) {
                suffix = `%${this.zoneId}`;
            }

            return addr + suffix;
        };

        // Converts this address to IPv4 address if it is an IPv4-mapped IPv6 address.
        // Throws an error otherwise.
        IPv6.prototype.toIPv4Address = function () {
            if (!this.isIPv4MappedAddress()) {
                throw new Error('ipaddr: trying to convert a generic ipv6 address to ipv4');
            }

            const ref = this.parts.slice(-2);
            const high = ref[0];
            const low = ref[1];

            return new ipaddr.IPv4([high >> 8, high & 0xff, low >> 8, low & 0xff]);
        };

        // Returns the address in expanded format with all zeroes included, like
        // 2001:db8:8:66:0:0:0:1
        //
        // Deprecated: use toFixedLengthString() instead.
        IPv6.prototype.toNormalizedString = function () {
            const addr = ((function () {
                const results = [];

                for (let i = 0; i < this.parts.length; i++) {
                    results.push(this.parts[i].toString(16));
                }

                return results;
            }).call(this)).join(':');

            let suffix = '';

            if (this.zoneId) {
                suffix = `%${this.zoneId}`;
            }

            return addr + suffix;
        };

        // Returns the address in compact, human-readable format like
        // 2001:db8:8:66::1
        // in line with RFC 5952 (see https://tools.ietf.org/html/rfc5952#section-4)
        IPv6.prototype.toRFC5952String = function () {
            const regex = /((^|:)(0(:|$)){2,})/g;
            const string = this.toNormalizedString();
            let bestMatchIndex = 0;
            let bestMatchLength = -1;
            let match;

            while ((match = regex.exec(string))) {
                if (match[0].length > bestMatchLength) {
                    bestMatchIndex = match.index;
                    bestMatchLength = match[0].length;
                }
            }

            if (bestMatchLength < 0) {
                return string;
            }

            return `${string.substring(0, bestMatchIndex)}::${string.substring(bestMatchIndex + bestMatchLength)}`;
        };

        // Returns the address in compact, human-readable format like
        // 2001:db8:8:66::1
        //
        // Deprecated: use toRFC5952String() instead.
        IPv6.prototype.toString = function () {
            // Replace the first sequence of 1 or more '0' parts with '::'
            return this.toNormalizedString().replace(/((^|:)(0(:|$))+)/, '::');
        };

        return IPv6;

    })();

    // A utility function to return broadcast address given the IPv6 interface and prefix length in CIDR notation
    ipaddr.IPv6.broadcastAddressFromCIDR = function (string) {
        try {
            const cidr = this.parseCIDR(string);
            const ipInterfaceOctets = cidr[0].toByteArray();
            const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            const octets = [];
            let i = 0;
            while (i < 16) {
                // Broadcast address is bitwise OR between ip interface and inverted mask
                octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
                i++;
            }

            return new this(octets);
        } catch (e) {
            throw new Error(`ipaddr: the address does not have IPv6 CIDR format (${e})`);
        }
    };

    // Checks if a given string is formatted like IPv6 address.
    ipaddr.IPv6.isIPv6 = function (string) {
        return this.parser(string) !== null;
    };

    // Checks to see if string is a valid IPv6 Address
    ipaddr.IPv6.isValid = function (string) {

        // Since IPv6.isValid is always called first, this shortcut
        // provides a substantial performance gain.
        if (typeof string === 'string' && string.indexOf(':') === -1) {
            return false;
        }

        try {
            const addr = this.parser(string);
            new this(addr.parts, addr.zoneId);
            return true;
        } catch (e) {
            return false;
        }
    };

    // A utility function to return network address given the IPv6 interface and prefix length in CIDR notation
    ipaddr.IPv6.networkAddressFromCIDR = function (string) {
        let cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;

        try {
            cidr = this.parseCIDR(string);
            ipInterfaceOctets = cidr[0].toByteArray();
            subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
            octets = [];
            i = 0;
            while (i < 16) {
                // Network address is bitwise AND between ip interface and mask
                octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
                i++;
            }

            return new this(octets);
        } catch (e) {
            throw new Error(`ipaddr: the address does not have IPv6 CIDR format (${e})`);
        }
    };

    // Tries to parse and validate a string with IPv6 address.
    // Throws an error if it fails.
    ipaddr.IPv6.parse = function (string) {
        const addr = this.parser(string);

        if (addr.parts === null) {
            throw new Error('ipaddr: string is not formatted like an IPv6 Address');
        }

        return new this(addr.parts, addr.zoneId);
    };

    ipaddr.IPv6.parseCIDR = function (string) {
        let maskLength, match, parsed;

        if ((match = string.match(/^(.+)\/(\d+)$/))) {
            maskLength = parseInt(match[2]);
            if (maskLength >= 0 && maskLength <= 128) {
                parsed = [this.parse(match[1]), maskLength];
                Object.defineProperty(parsed, 'toString', {
                    value: function () {
                        return this.join('/');
                    }
                });
                return parsed;
            }
        }

        throw new Error('ipaddr: string is not formatted like an IPv6 CIDR range');
    };

    // Parse an IPv6 address.
    ipaddr.IPv6.parser = function (string) {
        let addr, i, match, octet, octets, zoneId;

        if ((match = string.match(ipv6Regexes.deprecatedTransitional))) {
            return this.parser(`::ffff:${match[1]}`);
        }
        if (ipv6Regexes.native.test(string)) {
            return expandIPv6(string, 8);
        }
        if ((match = string.match(ipv6Regexes.transitional))) {
            zoneId = match[6] || '';
            addr = expandIPv6(match[1].slice(0, -1) + zoneId, 6);
            if (addr.parts) {
                octets = [
                    parseInt(match[2]),
                    parseInt(match[3]),
                    parseInt(match[4]),
                    parseInt(match[5])
                ];
                for (i = 0; i < octets.length; i++) {
                    octet = octets[i];
                    if (!((0 <= octet && octet <= 255))) {
                        return null;
                    }
                }

                addr.parts.push(octets[0] << 8 | octets[1]);
                addr.parts.push(octets[2] << 8 | octets[3]);
                return {
                    parts: addr.parts,
                    zoneId: addr.zoneId
                };
            }
        }

        return null;
    };

    // A utility function to return subnet mask in IPv6 format given the prefix length
    ipaddr.IPv6.subnetMaskFromPrefixLength = function (prefix) {
        prefix = parseInt(prefix);
        if (prefix < 0 || prefix > 128) {
            throw new Error('ipaddr: invalid IPv6 prefix length');
        }

        const octets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let j = 0;
        const filledOctetCount = Math.floor(prefix / 8);

        while (j < filledOctetCount) {
            octets[j] = 255;
            j++;
        }

        if (filledOctetCount < 16) {
            octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - (prefix % 8);
        }

        return new this(octets);
    };

    // Try to parse an array in network order (MSB first) for IPv4 and IPv6
    ipaddr.fromByteArray = function (bytes) {
        const length = bytes.length;

        if (length === 4) {
            return new ipaddr.IPv4(bytes);
        } else if (length === 16) {
            return new ipaddr.IPv6(bytes);
        } else {
            throw new Error('ipaddr: the binary input is neither an IPv6 nor IPv4 address');
        }
    };

    // Checks if the address is valid IP address
    ipaddr.isValid = function (string) {
        return ipaddr.IPv6.isValid(string) || ipaddr.IPv4.isValid(string);
    };


    // Attempts to parse an IP Address, first through IPv6 then IPv4.
    // Throws an error if it could not be parsed.
    ipaddr.parse = function (string) {
        if (ipaddr.IPv6.isValid(string)) {
            return ipaddr.IPv6.parse(string);
        } else if (ipaddr.IPv4.isValid(string)) {
            return ipaddr.IPv4.parse(string);
        } else {
            throw new Error('ipaddr: the address has neither IPv6 nor IPv4 format');
        }
    };

    // Attempt to parse CIDR notation, first through IPv6 then IPv4.
    // Throws an error if it could not be parsed.
    ipaddr.parseCIDR = function (string) {
        try {
            return ipaddr.IPv6.parseCIDR(string);
        } catch (e) {
            try {
                return ipaddr.IPv4.parseCIDR(string);
            } catch (e2) {
                throw new Error('ipaddr: the address has neither IPv6 nor IPv4 CIDR format');
            }
        }
    };

    // Parse an address and return plain IPv4 address if it is an IPv4-mapped address
    ipaddr.process = function (string) {
        const addr = this.parse(string);

        if (addr.kind() === 'ipv6' && addr.isIPv4MappedAddress()) {
            return addr.toIPv4Address();
        } else {
            return addr;
        }
    };

    // An utility function to ease named range matching. See examples below.
    // rangeList can contain both IPv4 and IPv6 subnet entries and will not throw errors
    // on matching IPv4 addresses to IPv6 ranges or vice versa.
    ipaddr.subnetMatch = function (address, rangeList, defaultName) {
        let i, rangeName, rangeSubnets, subnet;

        if (defaultName === undefined || defaultName === null) {
            defaultName = 'unicast';
        }

        for (rangeName in rangeList) {
            if (Object.prototype.hasOwnProperty.call(rangeList, rangeName)) {
                rangeSubnets = rangeList[rangeName];
                // ECMA5 Array.isArray isn't available everywhere
                if (rangeSubnets[0] && !(rangeSubnets[0] instanceof Array)) {
                    rangeSubnets = [rangeSubnets];
                }

                for (i = 0; i < rangeSubnets.length; i++) {
                    subnet = rangeSubnets[i];
                    if (address.kind() === subnet[0].kind() && address.match.apply(address, subnet)) {
                        return rangeName;
                    }
                }
            }
        }

        return defaultName;
    };

    // Export for both the CommonJS and browser-like environment
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ipaddr;

    } else {
        root.ipaddr = ipaddr;
    }

}(this));

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmb3JjZS5qcyIsIm5vZGVfbW9kdWxlcy9pcGFkZHIuanMvbGliL2lwYWRkci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgd2lkdGggPSA5NjAsXG4gICAgaGVpZ2h0ID0gNTAwLFxuICAgIHNlbGVjdGVkX25vZGUsIHNlbGVjdGVkX3RhcmdldF9ub2RlLFxuICAgIHNlbGVjdGVkX2xpbmssIG5ld19saW5lLFxuICAgIGNpcmNsZXNnLCBsaW5lc2csXG4gICAgc2hvdWxkX2RyYWcgPSBmYWxzZSxcbiAgICBkcmF3aW5nX2xpbmUgPSBmYWxzZSxcbiAgICBub2RlcyA9IFtdLFxuICAgIGxpbmtzID0gW10sXG4gICAgbGlua19kaXN0YW5jZSA9IDkwO1xuXG52YXIgZGVmYXVsdF9uYW1lID0gXCJuZXcgbm9kZVwiXG5cbnZhciBmb3JjZSA9IGQzLmxheW91dC5mb3JjZSgpXG4gICAgLmNoYXJnZSgtMzQwKVxuICAgIC5saW5rRGlzdGFuY2UobGlua19kaXN0YW5jZSlcbiAgICAuc2l6ZShbd2lkdGgsIGhlaWdodF0pO1xuXG52YXIgc3ZnID0gZDMuc2VsZWN0KFwiI2NoYXJ0XCIpLmFwcGVuZChcInN2Z1wiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuZDMuc2VsZWN0KHdpbmRvdylcbiAgICAub24oXCJtb3VzZW1vdmVcIiwgbW91c2Vtb3ZlKVxuICAgIC5vbihcIm1vdXNldXBcIiwgbW91c2V1cClcbiAgICAub24oXCJrZXlkb3duXCIsIGtleWRvd24pXG4gICAgLm9uKFwia2V5dXBcIiwga2V5dXApO1xuXG5zdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgIC5vbihcIm1vdXNlZG93blwiLCBtb3VzZWRvd24pO1xuXG4vLyBBcnJvdyBtYXJrZXJcbnN2Zy5hcHBlbmQoXCJzdmc6ZGVmc1wiKS5zZWxlY3RBbGwoXCJtYXJrZXJcIilcbiAgLmRhdGEoW1wiY2hpbGRcIl0pXG4gIC5lbnRlcigpLmFwcGVuZChcInN2ZzptYXJrZXJcIilcbiAgLmF0dHIoXCJpZFwiLCBTdHJpbmcpXG4gIC5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKVxuICAuYXR0cihcInZpZXdCb3hcIiwgXCIwIC01IDEwIDEwXCIpXG4gIC5hdHRyKFwicmVmWFwiLCBsaW5rX2Rpc3RhbmNlKVxuICAuYXR0cihcInJlZllcIiwgLTEuMSlcbiAgLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMClcbiAgLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTApXG4gIC5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKVxuICAuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgLmF0dHIoXCJkXCIsIFwiTTAsLTVMMTAsMEwwLDVcIik7XG5cblxubGluZXNnID0gc3ZnLmFwcGVuZChcImdcIik7XG5jaXJjbGVzZyA9IHN2Zy5hcHBlbmQoXCJnXCIpO1xuXG5pbml0aWFsX2pzb24gPSB7XCJub2Rlc1wiOlt7XCJuYW1lXCI6XCJNeXJpZWxcIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiTmFwb2xlb25cIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiTWxsZS5CYXB0aXN0aW5lXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIk1tZS5NYWdsb2lyZVwiLFwiZ3JvdXBcIjoxfSx7XCJuYW1lXCI6XCJDb3VudGVzc2RlTG9cIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiR2Vib3JhbmRcIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiQ2hhbXB0ZXJjaWVyXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIkNyYXZhdHRlXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIkNvdW50XCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIk9sZE1hblwiLFwiZ3JvdXBcIjoxfV0sXCJsaW5rc1wiOlt7XCJzb3VyY2VcIjowLFwidGFyZ2V0XCI6MSxcInZhbHVlXCI6MX0se1wic291cmNlXCI6MSxcInRhcmdldFwiOjIsXCJ2YWx1ZVwiOjh9LHtcInNvdXJjZVwiOjEsXCJ0YXJnZXRcIjozLFwidmFsdWVcIjoxMH0se1wic291cmNlXCI6MyxcInRhcmdldFwiOjQsXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjMsXCJ0YXJnZXRcIjo1LFwidmFsdWVcIjoxfSx7XCJzb3VyY2VcIjo0LFwidGFyZ2V0XCI6NixcInZhbHVlXCI6MX0se1wic291cmNlXCI6NixcInRhcmdldFwiOjcsXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjEsXCJ0YXJnZXRcIjo0LFwidmFsdWVcIjoyfSx7XCJzb3VyY2VcIjo3LFwidGFyZ2V0XCI6OCxcInZhbHVlXCI6MX0se1wic291cmNlXCI6OCxcInRhcmdldFwiOjksXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjEsXCJ0YXJnZXRcIjo5LFwidmFsdWVcIjoxfSx7XCJzb3VyY2VcIjozLFwidGFyZ2V0XCI6OSxcInZhbHVlXCI6MX1dfVxuXG5mdW5jdGlvbiBkb19pbml0X25vZGVzKGpzb24pIHtcbiAgICAvLyBkZWNvcmF0ZSBhIG5vZGUgd2l0aCBhIGNvdW50IG9mIGl0cyBjaGlsZHJlblxuICBub2RlcyA9IGpzb24ubm9kZXM7XG4gIGxpbmtzID0ganNvbi5saW5rcztcbiAgdXBkYXRlKCk7XG4gIGZvcmNlID0gZm9yY2Vcblx0Lm5vZGVzKG5vZGVzKVxuXHQubGlua3MobGlua3MpO1xuICBjb25zb2xlLmxvZyhcInN0YXJ0ZWRcIilcbiAgZm9yY2Uuc3RhcnQoKTtcbn1cbmRvX2luaXRfbm9kZXMoaW5pdGlhbF9qc29uKTtcblxuZnVuY3Rpb24gaXNfZW1wdHkobGlzdCkge1xuICAgIHJldHVybiBsaXN0Lmxlbmd0aCA9PT0gMFxufVxuXG52YXIgaXBhZGRyID0gcmVxdWlyZShcImlwYWRkci5qc1wiKVxuXG5jb25zb2xlLmxvZyhpcGFkZHIpXG5cbi8vIG1heWJlIGhhdmUgaXQgYmUgbGlrZSB0aGlzLiBIYXZlIGF2YWlsYWJsZSBuZXR3b3Jrcy5cbi8vIHRoZW4gd2UgY2FuIGRpdmlkZSBpdCBieSB0d28uXG4vLyBBbHdheXMgZGl2aWRlIHVudGlsIHdlIGdldCB0byB0aGUgc21hbGxlc3Qgb25lIGJlZm9yZSB3ZVxuLy8gcnVuIG91dC4gSSB0aGluayB0aGF0J3MgcHJldHR5IGdvb2QuXG5cbi8vIFxuXG4vLyBmdW5jdGlvbiBzcGxpdF9pcChzdGFydGluZ19pcCwgc3VibmV0X21hc2spXG5cbmZ1bmN0aW9uIHN0cl9pcF90b19pbnRfaXAoc3RyX2lwKSB7XG4gICAgbGV0IGFzX2J5dGVfYXJyYXkgPSBpcGFkZHIucGFyc2Uoc3RyX2lwKS50b0J5dGVBcnJheSgpO1xuICAgIGNvbnNvbGUubG9nKFwiYnl0ZSBhcnJheTogXCIgKyBhc19ieXRlX2FycmF5KVxuICAgIGxldCBhc19pbnQgPSAwO1xuICAgIGxldCBtdWx0aXBsaWVyID0gMTtcbiAgICBmb3IgKGluZGV4ID0gYXNfYnl0ZV9hcnJheS5sZW5ndGgtMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuXHRhc19pbnQgKz0gbXVsdGlwbGllciphc19ieXRlX2FycmF5W2luZGV4XTtcblx0bXVsdGlwbGllciAqPSAyNTY7XG4gICAgfVxuICAgIHJldHVybiBhc19pbnQ7XG59XG5cbmZ1bmN0aW9uIHN0cl9pcF90b19pbnRfaXBfdGVzdCgpIHtcbiAgICByZXR1cm4gc3RyX2lwX3RvX2ludF9pcChcIjE5Mi4xNjguMC4xXCIpO1xufVxuXG4vLyBuZXR3b3JrIGJ5dGUgb3JkZXIgKGJpZyBlbmRpYW4pXG5cbmZ1bmN0aW9uIGludF9pcF90b19ieXRlX2FycmF5KGludF9pcCwgbnVtX2J5dGVzKSB7XG4gICAgbGV0IGJ5dGVfYXJyYXkgPSBuZXcgQXJyYXkobnVtX2J5dGVzKTtcbiAgICBsZXQgaW5kZXggPSAwO1xuICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IG51bV9ieXRlczsgaW5kZXgrKykge1xuXHRieXRlX2FycmF5W251bV9ieXRlcyAtIDEgLSBpbmRleF0gPSBpbnRfaXAgJiAyNTU7XG5cdGludF9pcCA+Pj0gODtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVfYXJyYXk7XG59XG5cblxuXG5mdW5jdGlvbiBpbnRfaXBfdG9fYnl0ZV9hcnJheV90ZXN0KCkge1xuICAgIHJldHVybiBpbnRfaXBfdG9fYnl0ZV9hcnJheShzdHJfaXBfdG9faW50X2lwKFwiMTkyLjE2OC4wLjFcIiksIDQpXG59XG5cbmZ1bmN0aW9uIGludF9pcF90b19zdHJfaXAoaW50X2lwKSB7XG4gICAgY29uc29sZS5sb2coXCJ0aGUgYnl0ZSBhcnJheSBpcyBcIiArIGludF9pcF90b19ieXRlX2FycmF5KGludF9pcCwgNCkpXG4gICAgcmV0dXJuIGlwYWRkci5mcm9tQnl0ZUFycmF5KGludF9pcF90b19ieXRlX2FycmF5KGludF9pcCwgNCkpLnRvU3RyaW5nKCk7XG59XG5cbmZ1bmN0aW9uIGludF9pcF90b19zdHJfaXBfdGVzdCgpIHtcbiAgICByZXR1cm4gaW50X2lwX3RvX3N0cl9pcChzdHJfaXBfdG9faW50X2lwKFwiMTkyLjE2OC4wLjFcIiksIDQpXG59XG5cbi8vIG5vdyBnbyB0aHJvdWdoIGFsbCB0aGUgYXZhaWxhYmxlIHN1Ym5ldHNcbi8vIHN1Ym5ldHNwZWM6IHtpcF9pbnQ6IGlwX2FzX2ludH1cbi8vIHJldHVybnMgdHdvIHN1Ym5ldHMsXG5mdW5jdGlvbiBoYWxmX3N1Ym5ldHNwZWMoc3VibmV0c3BlYykge1xuICAgIHN1Ym5ldF9iaXRzID0gc3VibmV0c3BlYy5zdWJuZXRfYml0cy0xO1xuICAgIGZpcnN0X3N1Ym5ldCA9IHtpcDogc3VibmV0c3BlYy5pcCxcblx0XHQgICAgc3VibmV0X2JpdHM6IHN1Ym5ldF9iaXRzfTtcbiAgICBzZWNvbmRfc3VibmV0ID0ge2lwOiBzdWJuZXRzcGVjLmlwICsgTWF0aC5wb3coMiwgMzItc3VibmV0X2JpdHMpLFxuXHRcdCAgICAgc3VibmV0X2JpdHM6IHN1Ym5ldF9iaXRzfTtcbiAgICByZXR1cm4gW2ZpcnN0X3N1Ym5ldCwgc2Vjb25kX3N1Ym5ldF07XG59XG5cbi8vIGZ1bmN0aW9uIFxuZnVuY3Rpb24gYWxsb2NhdGVfaXBzKHN0YXJ0aW5nX2lwLCBzdWJuZXRfYml0cywgbnVtX2hvc3RzX2xpc3QpIHtcbiAgICBuZXR3b3Jrc19hdmFpbGFibGUgPSBbe2lwOiBzdGFydGluZ19pcCxcblx0XHRcdCAgIHN1Ym5ldF9iaXRzOiBzdWJuZXRfYml0c31dXG4gICAgYWxsb2NhdGVkX25ldHdvcmtzID0gW11cbiAgICB3aGlsZSAoKG51bV9ob3N0c19saXN0Lmxlbmd0aCAhPT0gMCkgJiYgKG5ldHdvcmtzX2F2YWlsYWJsZS5sZW5ndGggIT09IDApKSB7XG5cdHN1Ym5ldF9udW1faXBzID0gbnVtX2hvc3RzX2xpc3QucG9wKCkgKyAyIC8vIGFkZCBicm9hZGNhc3QvbmV0d29yayBhZGRyZXNzXG5cdC8vIGZpcnN0IGZpbmQgdGhlIG5leHQgbGFyZ2VzdCBwb3dlciBvZiB0d28gdGhhdCBmaXRzLlxuXHQvLyBzbywgbG9nXzIoKVxuXHR0YXJnZXRfc3VibmV0X3NpemUgPSBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2cyKHN1Ym5ldF9udW1faXBzKSkpXG5cdGNvbnNvbGUubG9nKFwic3VibmV0X251bV9pcHM6IFwiICsgc3VibmV0X251bV9pcHMgKyBcInRhcmdldF9zdWJuZXRfc2l6ZTogXCIgKyB0YXJnZXRfc3VibmV0X3NpemUpXG5cdC8vIG5vdyBmaW5kIHRoZSBuZXh0IGxhcmdlc3QgSVAgc3VibmV0IHRoYXQgZml0c1xuICAgIH1cbiAgICBpZiAoaXNfZW1wdHkobmV0d29ya3NfYXZhaWxhYmxlKSAmJiAhaXNfZW1wdHkobnVtX2hvc3RzX2xpc3QpKSB7XG5cdGNvbnNvbGUubG9nKFwibm90IGVub3VnaCBuZXR3b3JrcyBhdmFpbGFibGVcIilcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jYXRlZF9uZXR3b3Jrc1xufVxuXG5mdW5jdGlvbiBhbGxvY2F0ZV9pcF90ZXN0KCkge1xuICAgIGNvbnNvbGUubG9nKGFsbG9jYXRlX2lwcyhcIjE5Mi4xNjguMS4wXCIsIFwiMjU1LjI1NS4yNTUuMFwiLCBbNjMsIDYyLCAxMDBdKSlcbiAgICBjb25zb2xlLmxvZyhcImFzIGJ5dGUgYXJyYXk6IFwiICsgaW50X2lwX3RvX2J5dGVfYXJyYXlfdGVzdCgpKVxuICAgIGNvbnNvbGUubG9nKFwiYXMgaW50OiBcIiArIHN0cl9pcF90b19pbnRfaXBfdGVzdCgpKVxuICAgIGNvbnNvbGUubG9nKFwiaGVyZVwiKVxuICAgIGNvbnNvbGUubG9nKFwiYXMgc3RyOiBcIiArIGludF9pcF90b19zdHJfaXBfdGVzdCgpKVxuICAgIGNvbnNvbGUubG9nKFwic3RyLT5pbnQtPnN0cjogXCIgKyBpbnRfaXBfdG9fc3RyX2lwKHN0cl9pcF90b19pbnRfaXAoXCIxOTIuMTY4LjAuMVwiKSkpXG59XG5cbmdsb2JhbC5hbGxvY2F0ZV9pcF90ZXN0ID0gYWxsb2NhdGVfaXBfdGVzdFxuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIHZhciBsaW5rID0gbGluZXNnLnNlbGVjdEFsbChcImxpbmUubGlua1wiKVxuICAgICAgLmRhdGEobGlua3MpXG4gICAgICAuYXR0cihcIngxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLng7IH0pXG4gICAgICAuYXR0cihcInkxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG4gICAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lng7IH0pXG4gICAgICAuYXR0cihcInkyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lnk7IH0pXG4gICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQgPT09IHNlbGVjdGVkX2xpbms7IH0pO1xuICBsaW5rLmVudGVyKCkuYXBwZW5kKFwibGluZVwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5rXCIpXG4gICAgLmF0dHIoXCJtYXJrZXItZW5kXCIsIFwidXJsKCNjaGlsZClcIilcbiAgICAub24oXCJtb3VzZWRvd25cIiwgbGluZV9tb3VzZWRvd24pO1xuICBsaW5rLmV4aXQoKS5yZW1vdmUoKTtcblxuICB2YXIgbm9kZSA9IGNpcmNsZXNnLnNlbGVjdEFsbChcIi5ub2RlXCIpXG4gICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5uYW1lO30pXG4gICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkID09PSBzZWxlY3RlZF9ub2RlOyB9KVxuICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRfdGFyZ2V0XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQgPT09IHNlbGVjdGVkX3RhcmdldF9ub2RlOyB9KVxuICB2YXIgbm9kZWcgPSBub2RlLmVudGVyKClcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlXCIpLmNhbGwoZm9yY2UuZHJhZylcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBkLnggKyBcIixcIiArIGQueSArIFwiKVwiO1xuICAgIH0pO1xuICBub2RlZy5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAuYXR0cihcInJcIiwgMTApXG4gICAgLm9uKFwibW91c2Vkb3duXCIsIG5vZGVfbW91c2Vkb3duKVxuICAgIC5vbihcIm1vdXNlb3ZlclwiLCBub2RlX21vdXNlb3ZlcilcbiAgICAub24oXCJtb3VzZW91dFwiLCBub2RlX21vdXNlb3V0KTtcbiAgbm9kZWdcbiAgICAuYXBwZW5kKFwic3ZnOmFcIilcbiAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudXJsIHx8ICcjJzsgfSlcbiAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgIC5hdHRyKFwiZHhcIiwgMTIpXG4gICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXG4gICAgLnRleHQoZnVuY3Rpb24oZCkge3JldHVybiBkLm5hbWV9KTtcbiAgbm9kZS5leGl0KCkucmVtb3ZlKCk7XG5cbiAgZm9yY2Uub24oXCJ0aWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBsaW5rLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS54OyB9KVxuICAgICAgICAuYXR0cihcInkxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG4gICAgICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueDsgfSlcbiAgICAgICAgLmF0dHIoXCJ5MlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC55OyB9KTtcbiAgICBub2RlLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBkLnggKyBcIixcIiArIGQueSArIFwiKVwiOyB9KTtcbiAgfSk7XG59XG5cbi8vIHNlbGVjdCB0YXJnZXQgbm9kZSBmb3IgbmV3IG5vZGUgY29ubmVjdGlvblxuZnVuY3Rpb24gbm9kZV9tb3VzZW92ZXIoZCkge1xuICBpZiAoZHJhd2luZ19saW5lICYmIGQgIT09IHNlbGVjdGVkX25vZGUpIHtcbiAgICAvLyBoaWdobGlnaHQgYW5kIHNlbGVjdCB0YXJnZXQgbm9kZVxuICAgIHNlbGVjdGVkX3RhcmdldF9ub2RlID0gZDtcbiAgfVxufVxuXG5mdW5jdGlvbiBub2RlX21vdXNlb3V0KGQpIHtcbiAgaWYgKGRyYXdpbmdfbGluZSkge1xuICAgIHNlbGVjdGVkX3RhcmdldF9ub2RlID0gbnVsbDtcbiAgfVxufVxuXG4vLyBzZWxlY3Qgbm9kZSAvIHN0YXJ0IGRyYWdcbmZ1bmN0aW9uIG5vZGVfbW91c2Vkb3duKGQpIHtcbiAgaWYgKCFkcmF3aW5nX2xpbmUpIHtcbiAgICBzZWxlY3RlZF9ub2RlID0gZDtcbiAgICBzZWxlY3RlZF9saW5rID0gbnVsbDtcbiAgfVxuICBpZiAoIXNob3VsZF9kcmFnKSB7XG4gICAgZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZHJhd2luZ19saW5lID0gdHJ1ZTtcbiAgfVxuICBkLmZpeGVkID0gdHJ1ZTtcbiAgZm9yY2Uuc3RvcCgpXG4gIHVwZGF0ZSgpO1xufVxuXG4vLyBzZWxlY3QgbGluZVxuZnVuY3Rpb24gbGluZV9tb3VzZWRvd24oZCkge1xuICBzZWxlY3RlZF9saW5rID0gZDtcbiAgc2VsZWN0ZWRfbm9kZSA9IG51bGw7XG4gIHVwZGF0ZSgpO1xufVxuXG4vLyBkcmF3IHllbGxvdyBcIm5ldyBjb25uZWN0b3JcIiBsaW5lXG5mdW5jdGlvbiBtb3VzZW1vdmUoKSB7XG4gIGlmIChkcmF3aW5nX2xpbmUgJiYgIXNob3VsZF9kcmFnKSB7XG4gICAgdmFyIG0gPSBkMy5tb3VzZShzdmcubm9kZSgpKTtcbiAgICB2YXIgeCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHdpZHRoLCBtWzBdKSk7XG4gICAgdmFyIHkgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihoZWlnaHQsIG1bMV0pKTtcbiAgICAvLyBkZWJvdW5jZSAtIG9ubHkgc3RhcnQgZHJhd2luZyBsaW5lIGlmIGl0IGdldHMgYSBiaXQgYmlnXG4gICAgdmFyIGR4ID0gc2VsZWN0ZWRfbm9kZS54IC0geDtcbiAgICB2YXIgZHkgPSBzZWxlY3RlZF9ub2RlLnkgLSB5O1xuICAgIGlmIChNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpID4gMTApIHtcbiAgICAgIC8vIGRyYXcgYSBsaW5lXG4gICAgICBpZiAoIW5ld19saW5lKSB7XG4gICAgICAgIG5ld19saW5lID0gbGluZXNnLmFwcGVuZChcImxpbmVcIikuYXR0cihcImNsYXNzXCIsIFwibmV3X2xpbmVcIik7XG4gICAgICB9XG4gICAgICBuZXdfbGluZS5hdHRyKFwieDFcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gc2VsZWN0ZWRfbm9kZS54OyB9KVxuICAgICAgICAuYXR0cihcInkxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHNlbGVjdGVkX25vZGUueTsgfSlcbiAgICAgICAgLmF0dHIoXCJ4MlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB4OyB9KVxuICAgICAgICAuYXR0cihcInkyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHk7IH0pO1xuICAgIH1cbiAgfVxuICB1cGRhdGUoKTtcbn1cblxuLy8gYWRkIGEgbmV3IGRpc2Nvbm5lY3RlZCBub2RlXG5mdW5jdGlvbiBtb3VzZWRvd24oKSB7XG4gIG0gPSBkMy5tb3VzZShzdmcubm9kZSgpKVxuICBub2Rlcy5wdXNoKHt4OiBtWzBdLCB5OiBtWzFdLCBuYW1lOiBkZWZhdWx0X25hbWUgKyBcIiBcIiArIG5vZGVzLmxlbmd0aCwgZ3JvdXA6IDF9KTtcbiAgc2VsZWN0ZWRfbGluayA9IG51bGw7XG4gIGZvcmNlLnN0b3AoKTtcbiAgdXBkYXRlKCk7XG4gIGZvcmNlLnN0YXJ0KCk7XG59XG5cbi8vIGVuZCBub2RlIHNlbGVjdCAvIGFkZCBuZXcgY29ubmVjdGVkIG5vZGVcbmZ1bmN0aW9uIG1vdXNldXAoKSB7XG4gIGRyYXdpbmdfbGluZSA9IGZhbHNlO1xuICBpZiAobmV3X2xpbmUpIHtcbiAgICBpZiAoc2VsZWN0ZWRfdGFyZ2V0X25vZGUpIHtcbiAgICAgIHNlbGVjdGVkX3RhcmdldF9ub2RlLmZpeGVkID0gZmFsc2U7XG4gICAgICB2YXIgbmV3X25vZGUgPSBzZWxlY3RlZF90YXJnZXRfbm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG0gPSBkMy5tb3VzZShzdmcubm9kZSgpKTtcbiAgICAgIHZhciBuZXdfbm9kZSA9IHt4OiBtWzBdLCB5OiBtWzFdLCBuYW1lOiBkZWZhdWx0X25hbWUgKyBcIiBcIiArIG5vZGVzLmxlbmd0aCwgZ3JvdXA6IDF9XG4gICAgICBub2Rlcy5wdXNoKG5ld19ub2RlKTtcbiAgICB9XG4gICAgc2VsZWN0ZWRfbm9kZS5maXhlZCA9IGZhbHNlO1xuICAgIGxpbmtzLnB1c2goe3NvdXJjZTogc2VsZWN0ZWRfbm9kZSwgdGFyZ2V0OiBuZXdfbm9kZX0pXG4gICAgc2VsZWN0ZWRfbm9kZSA9IHNlbGVjdGVkX3RhcmdldF9ub2RlID0gbnVsbDtcbiAgICB1cGRhdGUoKTtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIG5ld19saW5lLnJlbW92ZSgpO1xuICAgICAgbmV3X2xpbmUgPSBudWxsO1xuICAgICAgZm9yY2Uuc3RhcnQoKTtcbiAgICB9LCAzMDApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGtleXVwKCkge1xuICBzd2l0Y2ggKGQzLmV2ZW50LmtleUNvZGUpIHtcbiAgICBjYXNlIDE2OiB7IC8vIHNoaWZ0XG4gICAgICBzaG91bGRfZHJhZyA9IGZhbHNlO1xuICAgICAgdXBkYXRlKCk7XG4gICAgICBmb3JjZS5zdGFydCgpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBzZWxlY3QgZm9yIGRyYWdnaW5nIG5vZGUgd2l0aCBzaGlmdDsgZGVsZXRlIG5vZGUgd2l0aCBiYWNrc3BhY2VcbmZ1bmN0aW9uIGtleWRvd24oKSB7XG4gIHN3aXRjaCAoZDMuZXZlbnQua2V5Q29kZSkge1xuICAgIGNhc2UgODogLy8gYmFja3NwYWNlXG4gICAgY2FzZSA0NjogeyAvLyBkZWxldGVcbiAgICAgIGlmIChzZWxlY3RlZF9ub2RlKSB7IC8vIGRlYWwgd2l0aCBub2Rlc1xuICAgICAgICB2YXIgaSA9IG5vZGVzLmluZGV4T2Yoc2VsZWN0ZWRfbm9kZSk7XG4gICAgICAgIG5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgLy8gZmluZCBsaW5rcyB0by9mcm9tIHRoaXMgbm9kZSwgYW5kIGRlbGV0ZSB0aGVtIHRvb1xuICAgICAgICB2YXIgbmV3X2xpbmtzID0gW107XG4gICAgICAgIGxpbmtzLmZvckVhY2goZnVuY3Rpb24obCkge1xuICAgICAgICAgIGlmIChsLnNvdXJjZSAhPT0gc2VsZWN0ZWRfbm9kZSAmJiBsLnRhcmdldCAhPT0gc2VsZWN0ZWRfbm9kZSkge1xuICAgICAgICAgICAgbmV3X2xpbmtzLnB1c2gobCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbGlua3MgPSBuZXdfbGlua3M7XG4gICAgICAgIHNlbGVjdGVkX25vZGUgPSBub2Rlcy5sZW5ndGggPyBub2Rlc1tpID4gMCA/IGkgLSAxIDogMF0gOiBudWxsO1xuICAgICAgfSBlbHNlIGlmIChzZWxlY3RlZF9saW5rKSB7IC8vIGRlYWwgd2l0aCBsaW5rc1xuICAgICAgICB2YXIgaSA9IGxpbmtzLmluZGV4T2Yoc2VsZWN0ZWRfbGluayk7XG4gICAgICAgIGxpbmtzLnNwbGljZShpLCAxKTtcbiAgICAgICAgc2VsZWN0ZWRfbGluayA9IGxpbmtzLmxlbmd0aCA/IGxpbmtzW2kgPiAwID8gaSAtIDEgOiAwXSA6IG51bGw7XG4gICAgICB9XG4gICAgICB1cGRhdGUoKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlIDE2OiB7IC8vIHNoaWZ0XG4gICAgICBzaG91bGRfZHJhZyA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiIsIihmdW5jdGlvbiAocm9vdCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBBIGxpc3Qgb2YgcmVndWxhciBleHByZXNzaW9ucyB0aGF0IG1hdGNoIGFyYml0cmFyeSBJUHY0IGFkZHJlc3NlcyxcbiAgICAvLyBmb3Igd2hpY2ggYSBudW1iZXIgb2Ygd2VpcmQgbm90YXRpb25zIGV4aXN0LlxuICAgIC8vIE5vdGUgdGhhdCBhbiBhZGRyZXNzIGxpa2UgMDAxMC4weGE1LjEuMSBpcyBjb25zaWRlcmVkIGxlZ2FsLlxuICAgIGNvbnN0IGlwdjRQYXJ0ID0gJygwP1xcXFxkK3wweFthLWYwLTldKyknO1xuICAgIGNvbnN0IGlwdjRSZWdleGVzID0ge1xuICAgICAgICBmb3VyT2N0ZXQ6IG5ldyBSZWdFeHAoYF4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fSRgLCAnaScpLFxuICAgICAgICB0aHJlZU9jdGV0OiBuZXcgUmVnRXhwKGBeJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fSRgLCAnaScpLFxuICAgICAgICB0d29PY3RldDogbmV3IFJlZ0V4cChgXiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fSRgLCAnaScpLFxuICAgICAgICBsb25nVmFsdWU6IG5ldyBSZWdFeHAoYF4ke2lwdjRQYXJ0fSRgLCAnaScpXG4gICAgfTtcblxuICAgIC8vIFJlZ3VsYXIgRXhwcmVzc2lvbiBmb3IgY2hlY2tpbmcgT2N0YWwgbnVtYmVyc1xuICAgIGNvbnN0IG9jdGFsUmVnZXggPSBuZXcgUmVnRXhwKGBeMFswLTddKyRgLCAnaScpO1xuICAgIGNvbnN0IGhleFJlZ2V4ID0gbmV3IFJlZ0V4cChgXjB4W2EtZjAtOV0rJGAsICdpJyk7XG5cbiAgICBjb25zdCB6b25lSW5kZXggPSAnJVswLTlhLXpdezEsfSc7XG5cbiAgICAvLyBJUHY2LW1hdGNoaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG4gICAgLy8gRm9yIElQdjYsIHRoZSB0YXNrIGlzIHNpbXBsZXI6IGl0IGlzIGVub3VnaCB0byBtYXRjaCB0aGUgY29sb24tZGVsaW1pdGVkXG4gICAgLy8gaGV4YWRlY2ltYWwgSVB2NiBhbmQgYSB0cmFuc2l0aW9uYWwgdmFyaWFudCB3aXRoIGRvdHRlZC1kZWNpbWFsIElQdjQgYXRcbiAgICAvLyB0aGUgZW5kLlxuICAgIGNvbnN0IGlwdjZQYXJ0ID0gJyg/OlswLTlhLWZdKzo6PykrJztcbiAgICBjb25zdCBpcHY2UmVnZXhlcyA9IHtcbiAgICAgICAgem9uZUluZGV4OiBuZXcgUmVnRXhwKHpvbmVJbmRleCwgJ2knKSxcbiAgICAgICAgJ25hdGl2ZSc6IG5ldyBSZWdFeHAoYF4oOjopPygke2lwdjZQYXJ0fSk/KFswLTlhLWZdKyk/KDo6KT8oJHt6b25lSW5kZXh9KT8kYCwgJ2knKSxcbiAgICAgICAgZGVwcmVjYXRlZFRyYW5zaXRpb25hbDogbmV3IFJlZ0V4cChgXig/Ojo6KSgke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fSgke3pvbmVJbmRleH0pPykkYCwgJ2knKSxcbiAgICAgICAgdHJhbnNpdGlvbmFsOiBuZXcgUmVnRXhwKGBeKCg/OiR7aXB2NlBhcnR9KXwoPzo6OikoPzoke2lwdjZQYXJ0fSk/KSR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9KCR7em9uZUluZGV4fSk/JGAsICdpJylcbiAgICB9O1xuXG4gICAgLy8gRXhwYW5kIDo6IGluIGFuIElQdjYgYWRkcmVzcyBvciBhZGRyZXNzIHBhcnQgY29uc2lzdGluZyBvZiBgcGFydHNgIGdyb3Vwcy5cbiAgICBmdW5jdGlvbiBleHBhbmRJUHY2IChzdHJpbmcsIHBhcnRzKSB7XG4gICAgICAgIC8vIE1vcmUgdGhhbiBvbmUgJzo6JyBtZWFucyBpbnZhbGlkIGFkZGRyZXNzXG4gICAgICAgIGlmIChzdHJpbmcuaW5kZXhPZignOjonKSAhPT0gc3RyaW5nLmxhc3RJbmRleE9mKCc6OicpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb2xvbkNvdW50ID0gMDtcbiAgICAgICAgbGV0IGxhc3RDb2xvbiA9IC0xO1xuICAgICAgICBsZXQgem9uZUlkID0gKHN0cmluZy5tYXRjaChpcHY2UmVnZXhlcy56b25lSW5kZXgpIHx8IFtdKVswXTtcbiAgICAgICAgbGV0IHJlcGxhY2VtZW50LCByZXBsYWNlbWVudENvdW50O1xuXG4gICAgICAgIC8vIFJlbW92ZSB6b25lIGluZGV4IGFuZCBzYXZlIGl0IGZvciBsYXRlclxuICAgICAgICBpZiAoem9uZUlkKSB7XG4gICAgICAgICAgICB6b25lSWQgPSB6b25lSWQuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyUuKyQvLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIb3cgbWFueSBwYXJ0cyBkbyB3ZSBhbHJlYWR5IGhhdmU/XG4gICAgICAgIHdoaWxlICgobGFzdENvbG9uID0gc3RyaW5nLmluZGV4T2YoJzonLCBsYXN0Q29sb24gKyAxKSkgPj0gMCkge1xuICAgICAgICAgICAgY29sb25Db3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gMDo6MCBpcyB0d28gcGFydHMgbW9yZSB0aGFuIDo6XG4gICAgICAgIGlmIChzdHJpbmcuc3Vic3RyKDAsIDIpID09PSAnOjonKSB7XG4gICAgICAgICAgICBjb2xvbkNvdW50LS07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RyaW5nLnN1YnN0cigtMiwgMikgPT09ICc6OicpIHtcbiAgICAgICAgICAgIGNvbG9uQ291bnQtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgbG9vcCB3b3VsZCBoYW5nIGlmIGNvbG9uQ291bnQgPiBwYXJ0c1xuICAgICAgICBpZiAoY29sb25Db3VudCA+IHBhcnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlcGxhY2VtZW50ID0gJzonICsgJzA6JyAqIChwYXJ0cyAtIGNvbG9uQ291bnQpXG4gICAgICAgIHJlcGxhY2VtZW50Q291bnQgPSBwYXJ0cyAtIGNvbG9uQ291bnQ7XG4gICAgICAgIHJlcGxhY2VtZW50ID0gJzonO1xuICAgICAgICB3aGlsZSAocmVwbGFjZW1lbnRDb3VudC0tKSB7XG4gICAgICAgICAgICByZXBsYWNlbWVudCArPSAnMDonO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5zZXJ0IHRoZSBtaXNzaW5nIHplcm9lc1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgnOjonLCByZXBsYWNlbWVudCk7XG5cbiAgICAgICAgLy8gVHJpbSBhbnkgZ2FyYmFnZSB3aGljaCBtYXkgYmUgaGFuZ2luZyBhcm91bmQgaWYgOjogd2FzIGF0IHRoZSBlZGdlIGluXG4gICAgICAgIC8vIHRoZSBzb3VyY2Ugc3RyaW5cbiAgICAgICAgaWYgKHN0cmluZ1swXSA9PT0gJzonKSB7XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3RyaW5nW3N0cmluZy5sZW5ndGggLSAxXSA9PT0gJzonKSB7XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc2xpY2UoMCwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFydHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgcmVmID0gc3RyaW5nLnNwbGl0KCc6Jyk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhcnNlSW50KHJlZltpXSwgMTYpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBhcnRzOiBwYXJ0cyxcbiAgICAgICAgICAgIHpvbmVJZDogem9uZUlkXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQSBnZW5lcmljIENJRFIgKENsYXNzbGVzcyBJbnRlci1Eb21haW4gUm91dGluZykgUkZDMTUxOCByYW5nZSBtYXRjaGVyLlxuICAgIGZ1bmN0aW9uIG1hdGNoQ0lEUiAoZmlyc3QsIHNlY29uZCwgcGFydFNpemUsIGNpZHJCaXRzKSB7XG4gICAgICAgIGlmIChmaXJzdC5sZW5ndGggIT09IHNlY29uZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBjYW5ub3QgbWF0Y2ggQ0lEUiBmb3Igb2JqZWN0cyB3aXRoIGRpZmZlcmVudCBsZW5ndGhzJyk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFydCA9IDA7XG4gICAgICAgIGxldCBzaGlmdDtcblxuICAgICAgICB3aGlsZSAoY2lkckJpdHMgPiAwKSB7XG4gICAgICAgICAgICBzaGlmdCA9IHBhcnRTaXplIC0gY2lkckJpdHM7XG4gICAgICAgICAgICBpZiAoc2hpZnQgPCAwKSB7XG4gICAgICAgICAgICAgICAgc2hpZnQgPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmlyc3RbcGFydF0gPj4gc2hpZnQgIT09IHNlY29uZFtwYXJ0XSA+PiBzaGlmdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2lkckJpdHMgLT0gcGFydFNpemU7XG4gICAgICAgICAgICBwYXJ0ICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZUludEF1dG8gKHN0cmluZykge1xuICAgICAgICAvLyBIZXhhZGVkaW1hbCBiYXNlIDE2ICgweCMpXG4gICAgICAgIGlmIChoZXhSZWdleC50ZXN0KHN0cmluZykpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChzdHJpbmcsIDE2KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXaGlsZSBvY3RhbCByZXByZXNlbnRhdGlvbiBpcyBkaXNjb3VyYWdlZCBieSBFQ01BU2NyaXB0IDNcbiAgICAgICAgLy8gYW5kIGZvcmJpZGRlbiBieSBFQ01BU2NyaXB0IDUsIHdlIHNpbGVudGx5IGFsbG93IGl0IHRvXG4gICAgICAgIC8vIHdvcmsgb25seSBpZiB0aGUgcmVzdCBvZiB0aGUgc3RyaW5nIGhhcyBudW1iZXJzIGxlc3MgdGhhbiA4LlxuICAgICAgICBpZiAoc3RyaW5nWzBdID09PSAnMCcgJiYgIWlzTmFOKHBhcnNlSW50KHN0cmluZ1sxXSwgMTApKSkge1xuICAgICAgICBpZiAob2N0YWxSZWdleC50ZXN0KHN0cmluZykpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChzdHJpbmcsIDgpO1xuICAgICAgICB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlwYWRkcjogY2Fubm90IHBhcnNlICR7c3RyaW5nfSBhcyBvY3RhbGApO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFsd2F5cyBpbmNsdWRlIHRoZSBiYXNlIDEwIHJhZGl4IVxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyaW5nLCAxMCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFkUGFydCAocGFydCwgbGVuZ3RoKSB7XG4gICAgICAgIHdoaWxlIChwYXJ0Lmxlbmd0aCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcGFydCA9IGAwJHtwYXJ0fWA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFydDtcbiAgICB9XG5cbiAgICBjb25zdCBpcGFkZHIgPSB7fTtcblxuICAgIC8vIEFuIElQdjQgYWRkcmVzcyAoUkZDNzkxKS5cbiAgICBpcGFkZHIuSVB2NCA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIENvbnN0cnVjdHMgYSBuZXcgSVB2NCBhZGRyZXNzIGZyb20gYW4gYXJyYXkgb2YgZm91ciBvY3RldHNcbiAgICAgICAgLy8gaW4gbmV0d29yayBvcmRlciAoTVNCIGZpcnN0KVxuICAgICAgICAvLyBWZXJpZmllcyB0aGUgaW5wdXQuXG4gICAgICAgIGZ1bmN0aW9uIElQdjQgKG9jdGV0cykge1xuICAgICAgICAgICAgaWYgKG9jdGV0cy5sZW5ndGggIT09IDQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogaXB2NCBvY3RldCBjb3VudCBzaG91bGQgYmUgNCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgaSwgb2N0ZXQ7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBvY3RldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvY3RldCA9IG9jdGV0c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoISgoMCA8PSBvY3RldCAmJiBvY3RldCA8PSAyNTUpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogaXB2NCBvY3RldCBzaG91bGQgZml0IGluIDggYml0cycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vY3RldHMgPSBvY3RldHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGVjaWFsIElQdjQgYWRkcmVzcyByYW5nZXMuXG4gICAgICAgIC8vIFNlZSBhbHNvIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1Jlc2VydmVkX0lQX2FkZHJlc3Nlc1xuICAgICAgICBJUHY0LnByb3RvdHlwZS5TcGVjaWFsUmFuZ2VzID0ge1xuICAgICAgICAgICAgdW5zcGVjaWZpZWQ6IFtbbmV3IElQdjQoWzAsIDAsIDAsIDBdKSwgOF1dLFxuICAgICAgICAgICAgYnJvYWRjYXN0OiBbW25ldyBJUHY0KFsyNTUsIDI1NSwgMjU1LCAyNTVdKSwgMzJdXSxcbiAgICAgICAgICAgIC8vIFJGQzMxNzFcbiAgICAgICAgICAgIG11bHRpY2FzdDogW1tuZXcgSVB2NChbMjI0LCAwLCAwLCAwXSksIDRdXSxcbiAgICAgICAgICAgIC8vIFJGQzM5MjdcbiAgICAgICAgICAgIGxpbmtMb2NhbDogW1tuZXcgSVB2NChbMTY5LCAyNTQsIDAsIDBdKSwgMTZdXSxcbiAgICAgICAgICAgIC8vIFJGQzU3MzVcbiAgICAgICAgICAgIGxvb3BiYWNrOiBbW25ldyBJUHY0KFsxMjcsIDAsIDAsIDBdKSwgOF1dLFxuICAgICAgICAgICAgLy8gUkZDNjU5OFxuICAgICAgICAgICAgY2FycmllckdyYWRlTmF0OiBbW25ldyBJUHY0KFsxMDAsIDY0LCAwLCAwXSksIDEwXV0sXG4gICAgICAgICAgICAvLyBSRkMxOTE4XG4gICAgICAgICAgICAncHJpdmF0ZSc6IFtcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzEwLCAwLCAwLCAwXSksIDhdLFxuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMTcyLCAxNiwgMCwgMF0pLCAxMl0sXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsxOTIsIDE2OCwgMCwgMF0pLCAxNl1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAvLyBSZXNlcnZlZCBhbmQgdGVzdGluZy1vbmx5IHJhbmdlczsgUkZDcyA1NzM1LCA1NzM3LCAyNTQ0LCAxNzAwXG4gICAgICAgICAgICByZXNlcnZlZDogW1xuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMTkyLCAwLCAwLCAwXSksIDI0XSxcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzE5MiwgMCwgMiwgMF0pLCAyNF0sXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsxOTIsIDg4LCA5OSwgMF0pLCAyNF0sXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsxOTgsIDUxLCAxMDAsIDBdKSwgMjRdLFxuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMjAzLCAwLCAxMTMsIDBdKSwgMjRdLFxuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMjQwLCAwLCAwLCAwXSksIDRdXG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGhlICdraW5kJyBtZXRob2QgZXhpc3RzIG9uIGJvdGggSVB2NCBhbmQgSVB2NiBjbGFzc2VzLlxuICAgICAgICBJUHY0LnByb3RvdHlwZS5raW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICdpcHY0JztcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDaGVja3MgaWYgdGhpcyBhZGRyZXNzIG1hdGNoZXMgb3RoZXIgb25lIHdpdGhpbiBnaXZlbiBDSURSIHJhbmdlLlxuICAgICAgICBJUHY0LnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uIChvdGhlciwgY2lkclJhbmdlKSB7XG4gICAgICAgICAgICBsZXQgcmVmO1xuICAgICAgICAgICAgaWYgKGNpZHJSYW5nZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVmID0gb3RoZXI7XG4gICAgICAgICAgICAgICAgb3RoZXIgPSByZWZbMF07XG4gICAgICAgICAgICAgICAgY2lkclJhbmdlID0gcmVmWzFdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3RoZXIua2luZCgpICE9PSAnaXB2NCcpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogY2Fubm90IG1hdGNoIGlwdjQgYWRkcmVzcyB3aXRoIG5vbi1pcHY0IG9uZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hDSURSKHRoaXMub2N0ZXRzLCBvdGhlci5vY3RldHMsIDgsIGNpZHJSYW5nZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gcmV0dXJucyBhIG51bWJlciBvZiBsZWFkaW5nIG9uZXMgaW4gSVB2NCBhZGRyZXNzLCBtYWtpbmcgc3VyZSB0aGF0XG4gICAgICAgIC8vIHRoZSByZXN0IGlzIGEgc29saWQgc2VxdWVuY2Ugb2YgMCdzICh2YWxpZCBuZXRtYXNrKVxuICAgICAgICAvLyByZXR1cm5zIGVpdGhlciB0aGUgQ0lEUiBsZW5ndGggb3IgbnVsbCBpZiBtYXNrIGlzIG5vdCB2YWxpZFxuICAgICAgICBJUHY0LnByb3RvdHlwZS5wcmVmaXhMZW5ndGhGcm9tU3VibmV0TWFzayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBjaWRyID0gMDtcbiAgICAgICAgICAgIC8vIG5vbi16ZXJvIGVuY291bnRlcmVkIHN0b3Agc2Nhbm5pbmcgZm9yIHplcm9lc1xuICAgICAgICAgICAgbGV0IHN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIG51bWJlciBvZiB6ZXJvZXMgaW4gb2N0ZXRcbiAgICAgICAgICAgIGNvbnN0IHplcm90YWJsZSA9IHtcbiAgICAgICAgICAgICAgICAwOiA4LFxuICAgICAgICAgICAgICAgIDEyODogNyxcbiAgICAgICAgICAgICAgICAxOTI6IDYsXG4gICAgICAgICAgICAgICAgMjI0OiA1LFxuICAgICAgICAgICAgICAgIDI0MDogNCxcbiAgICAgICAgICAgICAgICAyNDg6IDMsXG4gICAgICAgICAgICAgICAgMjUyOiAyLFxuICAgICAgICAgICAgICAgIDI1NDogMSxcbiAgICAgICAgICAgICAgICAyNTU6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgaSwgb2N0ZXQsIHplcm9zO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAzOyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgICAgIG9jdGV0ID0gdGhpcy5vY3RldHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKG9jdGV0IGluIHplcm90YWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB6ZXJvcyA9IHplcm90YWJsZVtvY3RldF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdG9wICYmIHplcm9zICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh6ZXJvcyAhPT0gOCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjaWRyICs9IHplcm9zO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDMyIC0gY2lkcjtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDaGVja3MgaWYgdGhlIGFkZHJlc3MgY29ycmVzcG9uZHMgdG8gb25lIG9mIHRoZSBzcGVjaWFsIHJhbmdlcy5cbiAgICAgICAgSVB2NC5wcm90b3R5cGUucmFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBhZGRyLnN1Ym5ldE1hdGNoKHRoaXMsIHRoaXMuU3BlY2lhbFJhbmdlcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmV0dXJucyBhbiBhcnJheSBvZiBieXRlLXNpemVkIHZhbHVlcyBpbiBuZXR3b3JrIG9yZGVyIChNU0IgZmlyc3QpXG4gICAgICAgIElQdjQucHJvdG90eXBlLnRvQnl0ZUFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2N0ZXRzLnNsaWNlKDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbnZlcnRzIHRoaXMgSVB2NCBhZGRyZXNzIHRvIGFuIElQdjQtbWFwcGVkIElQdjYgYWRkcmVzcy5cbiAgICAgICAgSVB2NC5wcm90b3R5cGUudG9JUHY0TWFwcGVkQWRkcmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpcGFkZHIuSVB2Ni5wYXJzZShgOjpmZmZmOiR7dGhpcy50b1N0cmluZygpfWApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFN5bW1ldHJpY2FsIG1ldGhvZCBzdHJpY3RseSBmb3IgYWxpZ25pbmcgd2l0aCB0aGUgSVB2NiBtZXRob2RzLlxuICAgICAgICBJUHY0LnByb3RvdHlwZS50b05vcm1hbGl6ZWRTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybnMgdGhlIGFkZHJlc3MgaW4gY29udmVuaWVudCwgZGVjaW1hbC1kb3R0ZWQgZm9ybWF0LlxuICAgICAgICBJUHY0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9jdGV0cy5qb2luKCcuJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIElQdjQ7XG4gICAgfSkoKTtcblxuICAgIC8vIEEgdXRpbGl0eSBmdW5jdGlvbiB0byByZXR1cm4gYnJvYWRjYXN0IGFkZHJlc3MgZ2l2ZW4gdGhlIElQdjQgaW50ZXJmYWNlIGFuZCBwcmVmaXggbGVuZ3RoIGluIENJRFIgbm90YXRpb25cbiAgICBpcGFkZHIuSVB2NC5icm9hZGNhc3RBZGRyZXNzRnJvbUNJRFIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNpZHIgPSB0aGlzLnBhcnNlQ0lEUihzdHJpbmcpO1xuICAgICAgICAgICAgY29uc3QgaXBJbnRlcmZhY2VPY3RldHMgPSBjaWRyWzBdLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBjb25zdCBzdWJuZXRNYXNrT2N0ZXRzID0gdGhpcy5zdWJuZXRNYXNrRnJvbVByZWZpeExlbmd0aChjaWRyWzFdKS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgY29uc3Qgb2N0ZXRzID0gW107XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IDQpIHtcbiAgICAgICAgICAgICAgICAvLyBCcm9hZGNhc3QgYWRkcmVzcyBpcyBiaXR3aXNlIE9SIGJldHdlZW4gaXAgaW50ZXJmYWNlIGFuZCBpbnZlcnRlZCBtYXNrXG4gICAgICAgICAgICAgICAgb2N0ZXRzLnB1c2gocGFyc2VJbnQoaXBJbnRlcmZhY2VPY3RldHNbaV0sIDEwKSB8IHBhcnNlSW50KHN1Ym5ldE1hc2tPY3RldHNbaV0sIDEwKSBeIDI1NSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob2N0ZXRzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHRoZSBhZGRyZXNzIGRvZXMgbm90IGhhdmUgSVB2NCBDSURSIGZvcm1hdCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENoZWNrcyBpZiBhIGdpdmVuIHN0cmluZyBpcyBmb3JtYXR0ZWQgbGlrZSBJUHY0IGFkZHJlc3MuXG4gICAgaXBhZGRyLklQdjQuaXNJUHY0ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZXIoc3RyaW5nKSAhPT0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQ2hlY2tzIGlmIGEgZ2l2ZW4gc3RyaW5nIGlzIGEgdmFsaWQgSVB2NCBhZGRyZXNzLlxuICAgIGlwYWRkci5JUHY0LmlzVmFsaWQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBuZXcgdGhpcyh0aGlzLnBhcnNlcihzdHJpbmcpKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ2hlY2tzIGlmIGEgZ2l2ZW4gc3RyaW5nIGlzIGEgZnVsbCBmb3VyLXBhcnQgSVB2NCBBZGRyZXNzLlxuICAgIGlwYWRkci5JUHY0LmlzVmFsaWRGb3VyUGFydERlY2ltYWwgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGlmIChpcGFkZHIuSVB2NC5pc1ZhbGlkKHN0cmluZykgJiYgc3RyaW5nLm1hdGNoKC9eKDB8WzEtOV1cXGQqKShcXC4oMHxbMS05XVxcZCopKXszfSQvKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIHJldHVybiBuZXR3b3JrIGFkZHJlc3MgZ2l2ZW4gdGhlIElQdjQgaW50ZXJmYWNlIGFuZCBwcmVmaXggbGVuZ3RoIGluIENJRFIgbm90YXRpb25cbiAgICBpcGFkZHIuSVB2NC5uZXR3b3JrQWRkcmVzc0Zyb21DSURSID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBsZXQgY2lkciwgaSwgaXBJbnRlcmZhY2VPY3RldHMsIG9jdGV0cywgc3VibmV0TWFza09jdGV0cztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2lkciA9IHRoaXMucGFyc2VDSURSKHN0cmluZyk7XG4gICAgICAgICAgICBpcEludGVyZmFjZU9jdGV0cyA9IGNpZHJbMF0udG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIHN1Ym5ldE1hc2tPY3RldHMgPSB0aGlzLnN1Ym5ldE1hc2tGcm9tUHJlZml4TGVuZ3RoKGNpZHJbMV0pLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBvY3RldHMgPSBbXTtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCA0KSB7XG4gICAgICAgICAgICAgICAgLy8gTmV0d29yayBhZGRyZXNzIGlzIGJpdHdpc2UgQU5EIGJldHdlZW4gaXAgaW50ZXJmYWNlIGFuZCBtYXNrXG4gICAgICAgICAgICAgICAgb2N0ZXRzLnB1c2gocGFyc2VJbnQoaXBJbnRlcmZhY2VPY3RldHNbaV0sIDEwKSAmIHBhcnNlSW50KHN1Ym5ldE1hc2tPY3RldHNbaV0sIDEwKSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob2N0ZXRzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHRoZSBhZGRyZXNzIGRvZXMgbm90IGhhdmUgSVB2NCBDSURSIGZvcm1hdCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRyaWVzIHRvIHBhcnNlIGFuZCB2YWxpZGF0ZSBhIHN0cmluZyB3aXRoIElQdjQgYWRkcmVzcy5cbiAgICAvLyBUaHJvd3MgYW4gZXJyb3IgaWYgaXQgZmFpbHMuXG4gICAgaXBhZGRyLklQdjQucGFyc2UgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy5wYXJzZXIoc3RyaW5nKTtcblxuICAgICAgICBpZiAocGFydHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBzdHJpbmcgaXMgbm90IGZvcm1hdHRlZCBsaWtlIGFuIElQdjQgQWRkcmVzcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKHBhcnRzKTtcbiAgICB9O1xuXG4gICAgLy8gUGFyc2VzIHRoZSBzdHJpbmcgYXMgYW4gSVB2NCBBZGRyZXNzIHdpdGggQ0lEUiBOb3RhdGlvbi5cbiAgICBpcGFkZHIuSVB2NC5wYXJzZUNJRFIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGxldCBtYXRjaDtcblxuICAgICAgICBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKC9eKC4rKVxcLyhcXGQrKSQvKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hc2tMZW5ndGggPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICBpZiAobWFza0xlbmd0aCA+PSAwICYmIG1hc2tMZW5ndGggPD0gMzIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBbdGhpcy5wYXJzZShtYXRjaFsxXSksIG1hc2tMZW5ndGhdO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJzZWQsICd0b1N0cmluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4oJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogc3RyaW5nIGlzIG5vdCBmb3JtYXR0ZWQgbGlrZSBhbiBJUHY0IENJRFIgcmFuZ2UnKTtcbiAgICB9O1xuXG4gICAgLy8gQ2xhc3NmdWwgdmFyaWFudHMgKGxpa2UgYS5iLCB3aGVyZSBhIGlzIGFuIG9jdGV0LCBhbmQgYiBpcyBhIDI0LWJpdFxuICAgIC8vIHZhbHVlIHJlcHJlc2VudGluZyBsYXN0IHRocmVlIG9jdGV0czsgdGhpcyBjb3JyZXNwb25kcyB0byBhIGNsYXNzIENcbiAgICAvLyBhZGRyZXNzKSBhcmUgb21pdHRlZCBkdWUgdG8gY2xhc3NsZXNzIG5hdHVyZSBvZiBtb2Rlcm4gSW50ZXJuZXQuXG4gICAgaXBhZGRyLklQdjQucGFyc2VyID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBsZXQgbWF0Y2gsIHBhcnQsIHZhbHVlO1xuXG4gICAgICAgIC8vIHBhcnNlSW50IHJlY29nbml6ZXMgYWxsIHRoYXQgb2N0YWwgJiBoZXhhZGVjaW1hbCB3ZWlyZG5lc3MgZm9yIHVzXG4gICAgICAgIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goaXB2NFJlZ2V4ZXMuZm91ck9jdGV0KSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IG1hdGNoLnNsaWNlKDEsIDYpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnQgPSByZWZbaV07XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwYXJzZUludEF1dG8ocGFydCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfSBlbHNlIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goaXB2NFJlZ2V4ZXMubG9uZ1ZhbHVlKSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnRBdXRvKG1hdGNoWzFdKTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IDB4ZmZmZmZmZmYgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGFkZHJlc3Mgb3V0c2lkZSBkZWZpbmVkIHJhbmdlJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgbGV0IHNoaWZ0O1xuXG4gICAgICAgICAgICAgICAgZm9yIChzaGlmdCA9IDA7IHNoaWZ0IDw9IDI0OyBzaGlmdCArPSA4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCgodmFsdWUgPj4gc2hpZnQpICYgMHhmZik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9KSgpKS5yZXZlcnNlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKGlwdjRSZWdleGVzLnR3b09jdGV0KSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IG1hdGNoLnNsaWNlKDEsIDQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnRBdXRvKHJlZlsxXSk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID4gMHhmZmZmZmYgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBhZGRyZXNzIG91dHNpZGUgZGVmaW5lZCByYW5nZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwYXJzZUludEF1dG8ocmVmWzBdKSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCh2YWx1ZSA+PiAxNikgJiAweGZmKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goKHZhbHVlID4+ICA4KSAmIDB4ZmYpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCggdmFsdWUgICAgICAgICYgMHhmZik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKGlwdjRSZWdleGVzLnRocmVlT2N0ZXQpKSkge1xuICAgICAgICAgICAgcmV0dXJuIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gbWF0Y2guc2xpY2UoMSwgNSk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludEF1dG8ocmVmWzJdKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPiAweGZmZmYgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBhZGRyZXNzIG91dHNpZGUgZGVmaW5lZCByYW5nZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwYXJzZUludEF1dG8ocmVmWzBdKSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhcnNlSW50QXV0byhyZWZbMV0pKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goKHZhbHVlID4+IDgpICYgMHhmZik7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCB2YWx1ZSAgICAgICAmIDB4ZmYpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIHJldHVybiBzdWJuZXQgbWFzayBpbiBJUHY0IGZvcm1hdCBnaXZlbiB0aGUgcHJlZml4IGxlbmd0aFxuICAgIGlwYWRkci5JUHY0LnN1Ym5ldE1hc2tGcm9tUHJlZml4TGVuZ3RoID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgICAgICBwcmVmaXggPSBwYXJzZUludChwcmVmaXgpO1xuICAgICAgICBpZiAocHJlZml4IDwgMCB8fCBwcmVmaXggPiAzMikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGludmFsaWQgSVB2NCBwcmVmaXggbGVuZ3RoJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvY3RldHMgPSBbMCwgMCwgMCwgMF07XG4gICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgY29uc3QgZmlsbGVkT2N0ZXRDb3VudCA9IE1hdGguZmxvb3IocHJlZml4IC8gOCk7XG5cbiAgICAgICAgd2hpbGUgKGogPCBmaWxsZWRPY3RldENvdW50KSB7XG4gICAgICAgICAgICBvY3RldHNbal0gPSAyNTU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsbGVkT2N0ZXRDb3VudCA8IDQpIHtcbiAgICAgICAgICAgIG9jdGV0c1tmaWxsZWRPY3RldENvdW50XSA9IE1hdGgucG93KDIsIHByZWZpeCAlIDgpIC0gMSA8PCA4IC0gKHByZWZpeCAlIDgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9jdGV0cyk7XG4gICAgfTtcblxuICAgIC8vIEFuIElQdjYgYWRkcmVzcyAoUkZDMjQ2MClcbiAgICBpcGFkZHIuSVB2NiA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIENvbnN0cnVjdHMgYW4gSVB2NiBhZGRyZXNzIGZyb20gYW4gYXJyYXkgb2YgZWlnaHQgMTYgLSBiaXQgcGFydHNcbiAgICAgICAgLy8gb3Igc2l4dGVlbiA4IC0gYml0IHBhcnRzIGluIG5ldHdvcmsgb3JkZXIoTVNCIGZpcnN0KS5cbiAgICAgICAgLy8gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBpbnB1dCBpcyBpbnZhbGlkLlxuICAgICAgICBmdW5jdGlvbiBJUHY2IChwYXJ0cywgem9uZUlkKSB7XG4gICAgICAgICAgICBsZXQgaSwgcGFydDtcblxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMTYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRzID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8PSAxNDsgaSArPSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFydHMucHVzaCgocGFydHNbaV0gPDwgOCkgfCBwYXJ0c1tpICsgMV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFydHMubGVuZ3RoID09PSA4KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0cyA9IHBhcnRzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogaXB2NiBwYXJ0IGNvdW50IHNob3VsZCBiZSA4IG9yIDE2Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKCEoKDAgPD0gcGFydCAmJiBwYXJ0IDw9IDB4ZmZmZikpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBpcHY2IHBhcnQgc2hvdWxkIGZpdCBpbiAxNiBiaXRzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoem9uZUlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy56b25lSWQgPSB6b25lSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGVjaWFsIElQdjYgcmFuZ2VzXG4gICAgICAgIElQdjYucHJvdG90eXBlLlNwZWNpYWxSYW5nZXMgPSB7XG4gICAgICAgICAgICAvLyBSRkM0MjkxLCBoZXJlIGFuZCBhZnRlclxuICAgICAgICAgICAgdW5zcGVjaWZpZWQ6IFtuZXcgSVB2NihbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0pLCAxMjhdLFxuICAgICAgICAgICAgbGlua0xvY2FsOiBbbmV3IElQdjYoWzB4ZmU4MCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0pLCAxMF0sXG4gICAgICAgICAgICBtdWx0aWNhc3Q6IFtuZXcgSVB2NihbMHhmZjAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSksIDhdLFxuICAgICAgICAgICAgbG9vcGJhY2s6IFtuZXcgSVB2NihbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMV0pLCAxMjhdLFxuICAgICAgICAgICAgdW5pcXVlTG9jYWw6IFtuZXcgSVB2NihbMHhmYzAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSksIDddLFxuICAgICAgICAgICAgaXB2NE1hcHBlZDogW25ldyBJUHY2KFswLCAwLCAwLCAwLCAwLCAweGZmZmYsIDAsIDBdKSwgOTZdLFxuICAgICAgICAgICAgLy8gUkZDNjE0NVxuICAgICAgICAgICAgcmZjNjE0NTogW25ldyBJUHY2KFswLCAwLCAwLCAwLCAweGZmZmYsIDAsIDAsIDBdKSwgOTZdLFxuICAgICAgICAgICAgLy8gUkZDNjA1MlxuICAgICAgICAgICAgcmZjNjA1MjogW25ldyBJUHY2KFsweDY0LCAweGZmOWIsIDAsIDAsIDAsIDAsIDAsIDBdKSwgOTZdLFxuICAgICAgICAgICAgLy8gUkZDMzA1NlxuICAgICAgICAgICAgJzZ0bzQnOiBbbmV3IElQdjYoWzB4MjAwMiwgMCwgMCwgMCwgMCwgMCwgMCwgMF0pLCAxNl0sXG4gICAgICAgICAgICAvLyBSRkM2MDUyLCBSRkM2MTQ2XG4gICAgICAgICAgICB0ZXJlZG86IFtuZXcgSVB2NihbMHgyMDAxLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSksIDMyXSxcbiAgICAgICAgICAgIC8vIFJGQzQyOTFcbiAgICAgICAgICAgIHJlc2VydmVkOiBbW25ldyBJUHY2KFsweDIwMDEsIDB4ZGI4LCAwLCAwLCAwLCAwLCAwLCAwXSksIDMyXV1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDaGVja3MgaWYgdGhpcyBhZGRyZXNzIGlzIGFuIElQdjQtbWFwcGVkIElQdjYgYWRkcmVzcy5cbiAgICAgICAgSVB2Ni5wcm90b3R5cGUuaXNJUHY0TWFwcGVkQWRkcmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJhbmdlKCkgPT09ICdpcHY0TWFwcGVkJztcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUaGUgJ2tpbmQnIG1ldGhvZCBleGlzdHMgb24gYm90aCBJUHY0IGFuZCBJUHY2IGNsYXNzZXMuXG4gICAgICAgIElQdjYucHJvdG90eXBlLmtpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2lwdjYnO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENoZWNrcyBpZiB0aGlzIGFkZHJlc3MgbWF0Y2hlcyBvdGhlciBvbmUgd2l0aGluIGdpdmVuIENJRFIgcmFuZ2UuXG4gICAgICAgIElQdjYucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24gKG90aGVyLCBjaWRyUmFuZ2UpIHtcbiAgICAgICAgICAgIGxldCByZWY7XG5cbiAgICAgICAgICAgIGlmIChjaWRyUmFuZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlZiA9IG90aGVyO1xuICAgICAgICAgICAgICAgIG90aGVyID0gcmVmWzBdO1xuICAgICAgICAgICAgICAgIGNpZHJSYW5nZSA9IHJlZlsxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG90aGVyLmtpbmQoKSAhPT0gJ2lwdjYnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGNhbm5vdCBtYXRjaCBpcHY2IGFkZHJlc3Mgd2l0aCBub24taXB2NiBvbmUnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoQ0lEUih0aGlzLnBhcnRzLCBvdGhlci5wYXJ0cywgMTYsIGNpZHJSYW5nZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gcmV0dXJucyBhIG51bWJlciBvZiBsZWFkaW5nIG9uZXMgaW4gSVB2NiBhZGRyZXNzLCBtYWtpbmcgc3VyZSB0aGF0XG4gICAgICAgIC8vIHRoZSByZXN0IGlzIGEgc29saWQgc2VxdWVuY2Ugb2YgMCdzICh2YWxpZCBuZXRtYXNrKVxuICAgICAgICAvLyByZXR1cm5zIGVpdGhlciB0aGUgQ0lEUiBsZW5ndGggb3IgbnVsbCBpZiBtYXNrIGlzIG5vdCB2YWxpZFxuICAgICAgICBJUHY2LnByb3RvdHlwZS5wcmVmaXhMZW5ndGhGcm9tU3VibmV0TWFzayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBjaWRyID0gMDtcbiAgICAgICAgICAgIC8vIG5vbi16ZXJvIGVuY291bnRlcmVkIHN0b3Agc2Nhbm5pbmcgZm9yIHplcm9lc1xuICAgICAgICAgICAgbGV0IHN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIG51bWJlciBvZiB6ZXJvZXMgaW4gb2N0ZXRcbiAgICAgICAgICAgIGNvbnN0IHplcm90YWJsZSA9IHtcbiAgICAgICAgICAgICAgICAwOiAxNixcbiAgICAgICAgICAgICAgICAzMjc2ODogMTUsXG4gICAgICAgICAgICAgICAgNDkxNTI6IDE0LFxuICAgICAgICAgICAgICAgIDU3MzQ0OiAxMyxcbiAgICAgICAgICAgICAgICA2MTQ0MDogMTIsXG4gICAgICAgICAgICAgICAgNjM0ODg6IDExLFxuICAgICAgICAgICAgICAgIDY0NTEyOiAxMCxcbiAgICAgICAgICAgICAgICA2NTAyNDogOSxcbiAgICAgICAgICAgICAgICA2NTI4MDogOCxcbiAgICAgICAgICAgICAgICA2NTQwODogNyxcbiAgICAgICAgICAgICAgICA2NTQ3MjogNixcbiAgICAgICAgICAgICAgICA2NTUwNDogNSxcbiAgICAgICAgICAgICAgICA2NTUyMDogNCxcbiAgICAgICAgICAgICAgICA2NTUyODogMyxcbiAgICAgICAgICAgICAgICA2NTUzMjogMixcbiAgICAgICAgICAgICAgICA2NTUzNDogMSxcbiAgICAgICAgICAgICAgICA2NTUzNTogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBwYXJ0LCB6ZXJvcztcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDc7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgcGFydCA9IHRoaXMucGFydHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKHBhcnQgaW4gemVyb3RhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHplcm9zID0gemVyb3RhYmxlW3BhcnRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcCAmJiB6ZXJvcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoemVyb3MgIT09IDE2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNpZHIgKz0gemVyb3M7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gMTI4IC0gY2lkcjtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIC8vIENoZWNrcyBpZiB0aGUgYWRkcmVzcyBjb3JyZXNwb25kcyB0byBvbmUgb2YgdGhlIHNwZWNpYWwgcmFuZ2VzLlxuICAgICAgICBJUHY2LnByb3RvdHlwZS5yYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpcGFkZHIuc3VibmV0TWF0Y2godGhpcywgdGhpcy5TcGVjaWFsUmFuZ2VzKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGJ5dGUtc2l6ZWQgdmFsdWVzIGluIG5ldHdvcmsgb3JkZXIgKE1TQiBmaXJzdClcbiAgICAgICAgSVB2Ni5wcm90b3R5cGUudG9CeXRlQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgcGFydDtcbiAgICAgICAgICAgIGNvbnN0IGJ5dGVzID0gW107XG4gICAgICAgICAgICBjb25zdCByZWYgPSB0aGlzLnBhcnRzO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWYubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwYXJ0ID0gcmVmW2ldO1xuICAgICAgICAgICAgICAgIGJ5dGVzLnB1c2gocGFydCA+PiA4KTtcbiAgICAgICAgICAgICAgICBieXRlcy5wdXNoKHBhcnQgJiAweGZmKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGJ5dGVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybnMgdGhlIGFkZHJlc3MgaW4gZXhwYW5kZWQgZm9ybWF0IHdpdGggYWxsIHplcm9lcyBpbmNsdWRlZCwgbGlrZVxuICAgICAgICAvLyAyMDAxOjBkYjg6MDAwODowMDY2OjAwMDA6MDAwMDowMDAwOjAwMDFcbiAgICAgICAgSVB2Ni5wcm90b3R5cGUudG9GaXhlZExlbmd0aFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFkZHIgPSAoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwYWRQYXJ0KHRoaXMucGFydHNbaV0udG9TdHJpbmcoMTYpLCA0KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9KS5jYWxsKHRoaXMpKS5qb2luKCc6Jyk7XG5cbiAgICAgICAgICAgIGxldCBzdWZmaXggPSAnJztcblxuICAgICAgICAgICAgaWYgKHRoaXMuem9uZUlkKSB7XG4gICAgICAgICAgICAgICAgc3VmZml4ID0gYCUke3RoaXMuem9uZUlkfWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhZGRyICsgc3VmZml4O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbnZlcnRzIHRoaXMgYWRkcmVzcyB0byBJUHY0IGFkZHJlc3MgaWYgaXQgaXMgYW4gSVB2NC1tYXBwZWQgSVB2NiBhZGRyZXNzLlxuICAgICAgICAvLyBUaHJvd3MgYW4gZXJyb3Igb3RoZXJ3aXNlLlxuICAgICAgICBJUHY2LnByb3RvdHlwZS50b0lQdjRBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzSVB2NE1hcHBlZEFkZHJlc3MoKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiB0cnlpbmcgdG8gY29udmVydCBhIGdlbmVyaWMgaXB2NiBhZGRyZXNzIHRvIGlwdjQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmVmID0gdGhpcy5wYXJ0cy5zbGljZSgtMik7XG4gICAgICAgICAgICBjb25zdCBoaWdoID0gcmVmWzBdO1xuICAgICAgICAgICAgY29uc3QgbG93ID0gcmVmWzFdO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IGlwYWRkci5JUHY0KFtoaWdoID4+IDgsIGhpZ2ggJiAweGZmLCBsb3cgPj4gOCwgbG93ICYgMHhmZl0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybnMgdGhlIGFkZHJlc3MgaW4gZXhwYW5kZWQgZm9ybWF0IHdpdGggYWxsIHplcm9lcyBpbmNsdWRlZCwgbGlrZVxuICAgICAgICAvLyAyMDAxOmRiODo4OjY2OjA6MDowOjFcbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGVwcmVjYXRlZDogdXNlIHRvRml4ZWRMZW5ndGhTdHJpbmcoKSBpbnN0ZWFkLlxuICAgICAgICBJUHY2LnByb3RvdHlwZS50b05vcm1hbGl6ZWRTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyID0gKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLnBhcnRzW2ldLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9KS5jYWxsKHRoaXMpKS5qb2luKCc6Jyk7XG5cbiAgICAgICAgICAgIGxldCBzdWZmaXggPSAnJztcblxuICAgICAgICAgICAgaWYgKHRoaXMuem9uZUlkKSB7XG4gICAgICAgICAgICAgICAgc3VmZml4ID0gYCUke3RoaXMuem9uZUlkfWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhZGRyICsgc3VmZml4O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybnMgdGhlIGFkZHJlc3MgaW4gY29tcGFjdCwgaHVtYW4tcmVhZGFibGUgZm9ybWF0IGxpa2VcbiAgICAgICAgLy8gMjAwMTpkYjg6ODo2Njo6MVxuICAgICAgICAvLyBpbiBsaW5lIHdpdGggUkZDIDU5NTIgKHNlZSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNTk1MiNzZWN0aW9uLTQpXG4gICAgICAgIElQdjYucHJvdG90eXBlLnRvUkZDNTk1MlN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gLygoXnw6KSgwKDp8JCkpezIsfSkvZztcbiAgICAgICAgICAgIGNvbnN0IHN0cmluZyA9IHRoaXMudG9Ob3JtYWxpemVkU3RyaW5nKCk7XG4gICAgICAgICAgICBsZXQgYmVzdE1hdGNoSW5kZXggPSAwO1xuICAgICAgICAgICAgbGV0IGJlc3RNYXRjaExlbmd0aCA9IC0xO1xuICAgICAgICAgICAgbGV0IG1hdGNoO1xuXG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gcmVnZXguZXhlYyhzdHJpbmcpKSkge1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaFswXS5sZW5ndGggPiBiZXN0TWF0Y2hMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoSW5kZXggPSBtYXRjaC5pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoTGVuZ3RoID0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGJlc3RNYXRjaExlbmd0aCA8IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYCR7c3RyaW5nLnN1YnN0cmluZygwLCBiZXN0TWF0Y2hJbmRleCl9Ojoke3N0cmluZy5zdWJzdHJpbmcoYmVzdE1hdGNoSW5kZXggKyBiZXN0TWF0Y2hMZW5ndGgpfWA7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmV0dXJucyB0aGUgYWRkcmVzcyBpbiBjb21wYWN0LCBodW1hbi1yZWFkYWJsZSBmb3JtYXQgbGlrZVxuICAgICAgICAvLyAyMDAxOmRiODo4OjY2OjoxXG4gICAgICAgIC8vXG4gICAgICAgIC8vIERlcHJlY2F0ZWQ6IHVzZSB0b1JGQzU5NTJTdHJpbmcoKSBpbnN0ZWFkLlxuICAgICAgICBJUHY2LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIGZpcnN0IHNlcXVlbmNlIG9mIDEgb3IgbW9yZSAnMCcgcGFydHMgd2l0aCAnOjonXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b05vcm1hbGl6ZWRTdHJpbmcoKS5yZXBsYWNlKC8oKF58OikoMCg6fCQpKSspLywgJzo6Jyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIElQdjY7XG5cbiAgICB9KSgpO1xuXG4gICAgLy8gQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIHJldHVybiBicm9hZGNhc3QgYWRkcmVzcyBnaXZlbiB0aGUgSVB2NiBpbnRlcmZhY2UgYW5kIHByZWZpeCBsZW5ndGggaW4gQ0lEUiBub3RhdGlvblxuICAgIGlwYWRkci5JUHY2LmJyb2FkY2FzdEFkZHJlc3NGcm9tQ0lEUiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNpZHIgPSB0aGlzLnBhcnNlQ0lEUihzdHJpbmcpO1xuICAgICAgICAgICAgY29uc3QgaXBJbnRlcmZhY2VPY3RldHMgPSBjaWRyWzBdLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBjb25zdCBzdWJuZXRNYXNrT2N0ZXRzID0gdGhpcy5zdWJuZXRNYXNrRnJvbVByZWZpeExlbmd0aChjaWRyWzFdKS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgY29uc3Qgb2N0ZXRzID0gW107XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IDE2KSB7XG4gICAgICAgICAgICAgICAgLy8gQnJvYWRjYXN0IGFkZHJlc3MgaXMgYml0d2lzZSBPUiBiZXR3ZWVuIGlwIGludGVyZmFjZSBhbmQgaW52ZXJ0ZWQgbWFza1xuICAgICAgICAgICAgICAgIG9jdGV0cy5wdXNoKHBhcnNlSW50KGlwSW50ZXJmYWNlT2N0ZXRzW2ldLCAxMCkgfCBwYXJzZUludChzdWJuZXRNYXNrT2N0ZXRzW2ldLCAxMCkgXiAyNTUpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9jdGV0cyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaXBhZGRyOiB0aGUgYWRkcmVzcyBkb2VzIG5vdCBoYXZlIElQdjYgQ0lEUiBmb3JtYXQgKCR7ZX0pYCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ2hlY2tzIGlmIGEgZ2l2ZW4gc3RyaW5nIGlzIGZvcm1hdHRlZCBsaWtlIElQdjYgYWRkcmVzcy5cbiAgICBpcGFkZHIuSVB2Ni5pc0lQdjYgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlcihzdHJpbmcpICE9PSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBDaGVja3MgdG8gc2VlIGlmIHN0cmluZyBpcyBhIHZhbGlkIElQdjYgQWRkcmVzc1xuICAgIGlwYWRkci5JUHY2LmlzVmFsaWQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG5cbiAgICAgICAgLy8gU2luY2UgSVB2Ni5pc1ZhbGlkIGlzIGFsd2F5cyBjYWxsZWQgZmlyc3QsIHRoaXMgc2hvcnRjdXRcbiAgICAgICAgLy8gcHJvdmlkZXMgYSBzdWJzdGFudGlhbCBwZXJmb3JtYW5jZSBnYWluLlxuICAgICAgICBpZiAodHlwZW9mIHN0cmluZyA9PT0gJ3N0cmluZycgJiYgc3RyaW5nLmluZGV4T2YoJzonKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyID0gdGhpcy5wYXJzZXIoc3RyaW5nKTtcbiAgICAgICAgICAgIG5ldyB0aGlzKGFkZHIucGFydHMsIGFkZHIuem9uZUlkKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIHJldHVybiBuZXR3b3JrIGFkZHJlc3MgZ2l2ZW4gdGhlIElQdjYgaW50ZXJmYWNlIGFuZCBwcmVmaXggbGVuZ3RoIGluIENJRFIgbm90YXRpb25cbiAgICBpcGFkZHIuSVB2Ni5uZXR3b3JrQWRkcmVzc0Zyb21DSURSID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBsZXQgY2lkciwgaSwgaXBJbnRlcmZhY2VPY3RldHMsIG9jdGV0cywgc3VibmV0TWFza09jdGV0cztcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY2lkciA9IHRoaXMucGFyc2VDSURSKHN0cmluZyk7XG4gICAgICAgICAgICBpcEludGVyZmFjZU9jdGV0cyA9IGNpZHJbMF0udG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIHN1Ym5ldE1hc2tPY3RldHMgPSB0aGlzLnN1Ym5ldE1hc2tGcm9tUHJlZml4TGVuZ3RoKGNpZHJbMV0pLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBvY3RldHMgPSBbXTtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCAxNikge1xuICAgICAgICAgICAgICAgIC8vIE5ldHdvcmsgYWRkcmVzcyBpcyBiaXR3aXNlIEFORCBiZXR3ZWVuIGlwIGludGVyZmFjZSBhbmQgbWFza1xuICAgICAgICAgICAgICAgIG9jdGV0cy5wdXNoKHBhcnNlSW50KGlwSW50ZXJmYWNlT2N0ZXRzW2ldLCAxMCkgJiBwYXJzZUludChzdWJuZXRNYXNrT2N0ZXRzW2ldLCAxMCkpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9jdGV0cyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaXBhZGRyOiB0aGUgYWRkcmVzcyBkb2VzIG5vdCBoYXZlIElQdjYgQ0lEUiBmb3JtYXQgKCR7ZX0pYCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVHJpZXMgdG8gcGFyc2UgYW5kIHZhbGlkYXRlIGEgc3RyaW5nIHdpdGggSVB2NiBhZGRyZXNzLlxuICAgIC8vIFRocm93cyBhbiBlcnJvciBpZiBpdCBmYWlscy5cbiAgICBpcGFkZHIuSVB2Ni5wYXJzZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgYWRkciA9IHRoaXMucGFyc2VyKHN0cmluZyk7XG5cbiAgICAgICAgaWYgKGFkZHIucGFydHMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBzdHJpbmcgaXMgbm90IGZvcm1hdHRlZCBsaWtlIGFuIElQdjYgQWRkcmVzcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKGFkZHIucGFydHMsIGFkZHIuem9uZUlkKTtcbiAgICB9O1xuXG4gICAgaXBhZGRyLklQdjYucGFyc2VDSURSID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBsZXQgbWFza0xlbmd0aCwgbWF0Y2gsIHBhcnNlZDtcblxuICAgICAgICBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKC9eKC4rKVxcLyhcXGQrKSQvKSkpIHtcbiAgICAgICAgICAgIG1hc2tMZW5ndGggPSBwYXJzZUludChtYXRjaFsyXSk7XG4gICAgICAgICAgICBpZiAobWFza0xlbmd0aCA+PSAwICYmIG1hc2tMZW5ndGggPD0gMTI4KSB7XG4gICAgICAgICAgICAgICAgcGFyc2VkID0gW3RoaXMucGFyc2UobWF0Y2hbMV0pLCBtYXNrTGVuZ3RoXTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFyc2VkLCAndG9TdHJpbmcnLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHN0cmluZyBpcyBub3QgZm9ybWF0dGVkIGxpa2UgYW4gSVB2NiBDSURSIHJhbmdlJyk7XG4gICAgfTtcblxuICAgIC8vIFBhcnNlIGFuIElQdjYgYWRkcmVzcy5cbiAgICBpcGFkZHIuSVB2Ni5wYXJzZXIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGxldCBhZGRyLCBpLCBtYXRjaCwgb2N0ZXQsIG9jdGV0cywgem9uZUlkO1xuXG4gICAgICAgIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goaXB2NlJlZ2V4ZXMuZGVwcmVjYXRlZFRyYW5zaXRpb25hbCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZXIoYDo6ZmZmZjoke21hdGNoWzFdfWApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpcHY2UmVnZXhlcy5uYXRpdmUudGVzdChzdHJpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhwYW5kSVB2NihzdHJpbmcsIDgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goaXB2NlJlZ2V4ZXMudHJhbnNpdGlvbmFsKSkpIHtcbiAgICAgICAgICAgIHpvbmVJZCA9IG1hdGNoWzZdIHx8ICcnO1xuICAgICAgICAgICAgYWRkciA9IGV4cGFuZElQdjYobWF0Y2hbMV0uc2xpY2UoMCwgLTEpICsgem9uZUlkLCA2KTtcbiAgICAgICAgICAgIGlmIChhZGRyLnBhcnRzKSB7XG4gICAgICAgICAgICAgICAgb2N0ZXRzID0gW1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChtYXRjaFsyXSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoWzNdKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2hbNF0pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChtYXRjaFs1XSlcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBvY3RldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgb2N0ZXQgPSBvY3RldHNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghKCgwIDw9IG9jdGV0ICYmIG9jdGV0IDw9IDI1NSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFkZHIucGFydHMucHVzaChvY3RldHNbMF0gPDwgOCB8IG9jdGV0c1sxXSk7XG4gICAgICAgICAgICAgICAgYWRkci5wYXJ0cy5wdXNoKG9jdGV0c1syXSA8PCA4IHwgb2N0ZXRzWzNdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0czogYWRkci5wYXJ0cyxcbiAgICAgICAgICAgICAgICAgICAgem9uZUlkOiBhZGRyLnpvbmVJZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIHJldHVybiBzdWJuZXQgbWFzayBpbiBJUHY2IGZvcm1hdCBnaXZlbiB0aGUgcHJlZml4IGxlbmd0aFxuICAgIGlwYWRkci5JUHY2LnN1Ym5ldE1hc2tGcm9tUHJlZml4TGVuZ3RoID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgICAgICBwcmVmaXggPSBwYXJzZUludChwcmVmaXgpO1xuICAgICAgICBpZiAocHJlZml4IDwgMCB8fCBwcmVmaXggPiAxMjgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBpbnZhbGlkIElQdjYgcHJlZml4IGxlbmd0aCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb2N0ZXRzID0gWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdO1xuICAgICAgICBsZXQgaiA9IDA7XG4gICAgICAgIGNvbnN0IGZpbGxlZE9jdGV0Q291bnQgPSBNYXRoLmZsb29yKHByZWZpeCAvIDgpO1xuXG4gICAgICAgIHdoaWxlIChqIDwgZmlsbGVkT2N0ZXRDb3VudCkge1xuICAgICAgICAgICAgb2N0ZXRzW2pdID0gMjU1O1xuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGxlZE9jdGV0Q291bnQgPCAxNikge1xuICAgICAgICAgICAgb2N0ZXRzW2ZpbGxlZE9jdGV0Q291bnRdID0gTWF0aC5wb3coMiwgcHJlZml4ICUgOCkgLSAxIDw8IDggLSAocHJlZml4ICUgOCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IHRoaXMob2N0ZXRzKTtcbiAgICB9O1xuXG4gICAgLy8gVHJ5IHRvIHBhcnNlIGFuIGFycmF5IGluIG5ldHdvcmsgb3JkZXIgKE1TQiBmaXJzdCkgZm9yIElQdjQgYW5kIElQdjZcbiAgICBpcGFkZHIuZnJvbUJ5dGVBcnJheSA9IGZ1bmN0aW9uIChieXRlcykge1xuICAgICAgICBjb25zdCBsZW5ndGggPSBieXRlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBpcGFkZHIuSVB2NChieXRlcyk7XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoID09PSAxNikge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBpcGFkZHIuSVB2NihieXRlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogdGhlIGJpbmFyeSBpbnB1dCBpcyBuZWl0aGVyIGFuIElQdjYgbm9yIElQdjQgYWRkcmVzcycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENoZWNrcyBpZiB0aGUgYWRkcmVzcyBpcyB2YWxpZCBJUCBhZGRyZXNzXG4gICAgaXBhZGRyLmlzVmFsaWQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBpcGFkZHIuSVB2Ni5pc1ZhbGlkKHN0cmluZykgfHwgaXBhZGRyLklQdjQuaXNWYWxpZChzdHJpbmcpO1xuICAgIH07XG5cblxuICAgIC8vIEF0dGVtcHRzIHRvIHBhcnNlIGFuIElQIEFkZHJlc3MsIGZpcnN0IHRocm91Z2ggSVB2NiB0aGVuIElQdjQuXG4gICAgLy8gVGhyb3dzIGFuIGVycm9yIGlmIGl0IGNvdWxkIG5vdCBiZSBwYXJzZWQuXG4gICAgaXBhZGRyLnBhcnNlID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBpZiAoaXBhZGRyLklQdjYuaXNWYWxpZChzdHJpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBhZGRyLklQdjYucGFyc2Uoc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIGlmIChpcGFkZHIuSVB2NC5pc1ZhbGlkKHN0cmluZykpIHtcbiAgICAgICAgICAgIHJldHVybiBpcGFkZHIuSVB2NC5wYXJzZShzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHRoZSBhZGRyZXNzIGhhcyBuZWl0aGVyIElQdjYgbm9yIElQdjQgZm9ybWF0Jyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQXR0ZW1wdCB0byBwYXJzZSBDSURSIG5vdGF0aW9uLCBmaXJzdCB0aHJvdWdoIElQdjYgdGhlbiBJUHY0LlxuICAgIC8vIFRocm93cyBhbiBlcnJvciBpZiBpdCBjb3VsZCBub3QgYmUgcGFyc2VkLlxuICAgIGlwYWRkci5wYXJzZUNJRFIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gaXBhZGRyLklQdjYucGFyc2VDSURSKHN0cmluZyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlwYWRkci5JUHY0LnBhcnNlQ0lEUihzdHJpbmcpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZTIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogdGhlIGFkZHJlc3MgaGFzIG5laXRoZXIgSVB2NiBub3IgSVB2NCBDSURSIGZvcm1hdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFBhcnNlIGFuIGFkZHJlc3MgYW5kIHJldHVybiBwbGFpbiBJUHY0IGFkZHJlc3MgaWYgaXQgaXMgYW4gSVB2NC1tYXBwZWQgYWRkcmVzc1xuICAgIGlwYWRkci5wcm9jZXNzID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBjb25zdCBhZGRyID0gdGhpcy5wYXJzZShzdHJpbmcpO1xuXG4gICAgICAgIGlmIChhZGRyLmtpbmQoKSA9PT0gJ2lwdjYnICYmIGFkZHIuaXNJUHY0TWFwcGVkQWRkcmVzcygpKSB7XG4gICAgICAgICAgICByZXR1cm4gYWRkci50b0lQdjRBZGRyZXNzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYWRkcjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBbiB1dGlsaXR5IGZ1bmN0aW9uIHRvIGVhc2UgbmFtZWQgcmFuZ2UgbWF0Y2hpbmcuIFNlZSBleGFtcGxlcyBiZWxvdy5cbiAgICAvLyByYW5nZUxpc3QgY2FuIGNvbnRhaW4gYm90aCBJUHY0IGFuZCBJUHY2IHN1Ym5ldCBlbnRyaWVzIGFuZCB3aWxsIG5vdCB0aHJvdyBlcnJvcnNcbiAgICAvLyBvbiBtYXRjaGluZyBJUHY0IGFkZHJlc3NlcyB0byBJUHY2IHJhbmdlcyBvciB2aWNlIHZlcnNhLlxuICAgIGlwYWRkci5zdWJuZXRNYXRjaCA9IGZ1bmN0aW9uIChhZGRyZXNzLCByYW5nZUxpc3QsIGRlZmF1bHROYW1lKSB7XG4gICAgICAgIGxldCBpLCByYW5nZU5hbWUsIHJhbmdlU3VibmV0cywgc3VibmV0O1xuXG4gICAgICAgIGlmIChkZWZhdWx0TmFtZSA9PT0gdW5kZWZpbmVkIHx8IGRlZmF1bHROYW1lID09PSBudWxsKSB7XG4gICAgICAgICAgICBkZWZhdWx0TmFtZSA9ICd1bmljYXN0JztcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAocmFuZ2VOYW1lIGluIHJhbmdlTGlzdCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChyYW5nZUxpc3QsIHJhbmdlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN1Ym5ldHMgPSByYW5nZUxpc3RbcmFuZ2VOYW1lXTtcbiAgICAgICAgICAgICAgICAvLyBFQ01BNSBBcnJheS5pc0FycmF5IGlzbid0IGF2YWlsYWJsZSBldmVyeXdoZXJlXG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlU3VibmV0c1swXSAmJiAhKHJhbmdlU3VibmV0c1swXSBpbnN0YW5jZW9mIEFycmF5KSkge1xuICAgICAgICAgICAgICAgICAgICByYW5nZVN1Ym5ldHMgPSBbcmFuZ2VTdWJuZXRzXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcmFuZ2VTdWJuZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1Ym5ldCA9IHJhbmdlU3VibmV0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkZHJlc3Mua2luZCgpID09PSBzdWJuZXRbMF0ua2luZCgpICYmIGFkZHJlc3MubWF0Y2guYXBwbHkoYWRkcmVzcywgc3VibmV0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJhbmdlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZWZhdWx0TmFtZTtcbiAgICB9O1xuXG4gICAgLy8gRXhwb3J0IGZvciBib3RoIHRoZSBDb21tb25KUyBhbmQgYnJvd3Nlci1saWtlIGVudmlyb25tZW50XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gaXBhZGRyO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC5pcGFkZHIgPSBpcGFkZHI7XG4gICAgfVxuXG59KHRoaXMpKTtcbiJdfQ==
