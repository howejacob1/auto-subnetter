(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){

/// requires
var ipaddr = require("ipaddr.js")


/// force graph initialization stuff
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


/// utils
function is_empty(list) {
    return list.length === 0
}


/// ip conversion utils

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

// TODO: remove console.log
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


/// main program functions

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
// TODO: rename
function allocate_ip_test() {
    console.log(allocate_ips("192.168.1.0", "255.255.255.0", [63, 62, 100]))
    console.log("as byte array: " + int_ip_to_byte_array_test())
    console.log("as int: " + str_ip_to_int_ip_test())
    console.log("here")
    console.log("as str: " + int_ip_to_str_ip_test())
    console.log("str->int->str: " + int_ip_to_str_ip(str_ip_to_int_ip("192.168.0.1")))
}

global.allocate_ip_test = allocate_ip_test


/// force graph updating functions

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


/// force graph user input

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmb3JjZS5qcyIsIm5vZGVfbW9kdWxlcy9pcGFkZHIuanMvbGliL2lwYWRkci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbldBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXGZcbi8vLyByZXF1aXJlc1xudmFyIGlwYWRkciA9IHJlcXVpcmUoXCJpcGFkZHIuanNcIilcblxuXGZcbi8vLyBmb3JjZSBncmFwaCBpbml0aWFsaXphdGlvbiBzdHVmZlxudmFyIHdpZHRoID0gOTYwLFxuICAgIGhlaWdodCA9IDUwMCxcbiAgICBzZWxlY3RlZF9ub2RlLCBzZWxlY3RlZF90YXJnZXRfbm9kZSxcbiAgICBzZWxlY3RlZF9saW5rLCBuZXdfbGluZSxcbiAgICBjaXJjbGVzZywgbGluZXNnLFxuICAgIHNob3VsZF9kcmFnID0gZmFsc2UsXG4gICAgZHJhd2luZ19saW5lID0gZmFsc2UsXG4gICAgbm9kZXMgPSBbXSxcbiAgICBsaW5rcyA9IFtdLFxuICAgIGxpbmtfZGlzdGFuY2UgPSA5MDtcblxudmFyIGRlZmF1bHRfbmFtZSA9IFwibmV3IG5vZGVcIlxuXG52YXIgZm9yY2UgPSBkMy5sYXlvdXQuZm9yY2UoKVxuICAgIC5jaGFyZ2UoLTM0MClcbiAgICAubGlua0Rpc3RhbmNlKGxpbmtfZGlzdGFuY2UpXG4gICAgLnNpemUoW3dpZHRoLCBoZWlnaHRdKTtcblxudmFyIHN2ZyA9IGQzLnNlbGVjdChcIiNjaGFydFwiKS5hcHBlbmQoXCJzdmdcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cbmQzLnNlbGVjdCh3aW5kb3cpXG4gICAgLm9uKFwibW91c2Vtb3ZlXCIsIG1vdXNlbW92ZSlcbiAgICAub24oXCJtb3VzZXVwXCIsIG1vdXNldXApXG4gICAgLm9uKFwia2V5ZG93blwiLCBrZXlkb3duKVxuICAgIC5vbihcImtleXVwXCIsIGtleXVwKTtcblxuc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAub24oXCJtb3VzZWRvd25cIiwgbW91c2Vkb3duKTtcblxuLy8gQXJyb3cgbWFya2VyXG5zdmcuYXBwZW5kKFwic3ZnOmRlZnNcIikuc2VsZWN0QWxsKFwibWFya2VyXCIpXG4gIC5kYXRhKFtcImNoaWxkXCJdKVxuICAuZW50ZXIoKS5hcHBlbmQoXCJzdmc6bWFya2VyXCIpXG4gIC5hdHRyKFwiaWRcIiwgU3RyaW5nKVxuICAuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIilcbiAgLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAtNSAxMCAxMFwiKVxuICAuYXR0cihcInJlZlhcIiwgbGlua19kaXN0YW5jZSlcbiAgLmF0dHIoXCJyZWZZXCIsIC0xLjEpXG4gIC5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTApXG4gIC5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDEwKVxuICAuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIilcbiAgLmFwcGVuZChcInN2ZzpwYXRoXCIpXG4gIC5hdHRyKFwiZFwiLCBcIk0wLC01TDEwLDBMMCw1XCIpO1xuXG5cbmxpbmVzZyA9IHN2Zy5hcHBlbmQoXCJnXCIpO1xuY2lyY2xlc2cgPSBzdmcuYXBwZW5kKFwiZ1wiKTtcblxuaW5pdGlhbF9qc29uID0ge1wibm9kZXNcIjpbe1wibmFtZVwiOlwiTXlyaWVsXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIk5hcG9sZW9uXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIk1sbGUuQmFwdGlzdGluZVwiLFwiZ3JvdXBcIjoxfSx7XCJuYW1lXCI6XCJNbWUuTWFnbG9pcmVcIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiQ291bnRlc3NkZUxvXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIkdlYm9yYW5kXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIkNoYW1wdGVyY2llclwiLFwiZ3JvdXBcIjoxfSx7XCJuYW1lXCI6XCJDcmF2YXR0ZVwiLFwiZ3JvdXBcIjoxfSx7XCJuYW1lXCI6XCJDb3VudFwiLFwiZ3JvdXBcIjoxfSx7XCJuYW1lXCI6XCJPbGRNYW5cIixcImdyb3VwXCI6MX1dLFwibGlua3NcIjpbe1wic291cmNlXCI6MCxcInRhcmdldFwiOjEsXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjEsXCJ0YXJnZXRcIjoyLFwidmFsdWVcIjo4fSx7XCJzb3VyY2VcIjoxLFwidGFyZ2V0XCI6MyxcInZhbHVlXCI6MTB9LHtcInNvdXJjZVwiOjMsXCJ0YXJnZXRcIjo0LFwidmFsdWVcIjoxfSx7XCJzb3VyY2VcIjozLFwidGFyZ2V0XCI6NSxcInZhbHVlXCI6MX0se1wic291cmNlXCI6NCxcInRhcmdldFwiOjYsXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjYsXCJ0YXJnZXRcIjo3LFwidmFsdWVcIjoxfSx7XCJzb3VyY2VcIjoxLFwidGFyZ2V0XCI6NCxcInZhbHVlXCI6Mn0se1wic291cmNlXCI6NyxcInRhcmdldFwiOjgsXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjgsXCJ0YXJnZXRcIjo5LFwidmFsdWVcIjoxfSx7XCJzb3VyY2VcIjoxLFwidGFyZ2V0XCI6OSxcInZhbHVlXCI6MX0se1wic291cmNlXCI6MyxcInRhcmdldFwiOjksXCJ2YWx1ZVwiOjF9XX1cblxuZnVuY3Rpb24gZG9faW5pdF9ub2Rlcyhqc29uKSB7XG4gICAgLy8gZGVjb3JhdGUgYSBub2RlIHdpdGggYSBjb3VudCBvZiBpdHMgY2hpbGRyZW5cbiAgbm9kZXMgPSBqc29uLm5vZGVzO1xuICBsaW5rcyA9IGpzb24ubGlua3M7XG4gIHVwZGF0ZSgpO1xuICBmb3JjZSA9IGZvcmNlXG5cdC5ub2Rlcyhub2Rlcylcblx0LmxpbmtzKGxpbmtzKTtcbiAgY29uc29sZS5sb2coXCJzdGFydGVkXCIpXG4gIGZvcmNlLnN0YXJ0KCk7XG59XG5kb19pbml0X25vZGVzKGluaXRpYWxfanNvbik7XG5cblxmXG4vLy8gdXRpbHNcbmZ1bmN0aW9uIGlzX2VtcHR5KGxpc3QpIHtcbiAgICByZXR1cm4gbGlzdC5sZW5ndGggPT09IDBcbn1cblxuXGZcbi8vLyBpcCBjb252ZXJzaW9uIHV0aWxzXG5cbmZ1bmN0aW9uIHN0cl9pcF90b19pbnRfaXAoc3RyX2lwKSB7XG4gICAgbGV0IGFzX2J5dGVfYXJyYXkgPSBpcGFkZHIucGFyc2Uoc3RyX2lwKS50b0J5dGVBcnJheSgpO1xuICAgIGNvbnNvbGUubG9nKFwiYnl0ZSBhcnJheTogXCIgKyBhc19ieXRlX2FycmF5KVxuICAgIGxldCBhc19pbnQgPSAwO1xuICAgIGxldCBtdWx0aXBsaWVyID0gMTtcbiAgICBmb3IgKGluZGV4ID0gYXNfYnl0ZV9hcnJheS5sZW5ndGgtMTsgaW5kZXggPj0gMDsgaW5kZXgtLSkge1xuXHRhc19pbnQgKz0gbXVsdGlwbGllciphc19ieXRlX2FycmF5W2luZGV4XTtcblx0bXVsdGlwbGllciAqPSAyNTY7XG4gICAgfVxuICAgIHJldHVybiBhc19pbnQ7XG59XG5cbmZ1bmN0aW9uIHN0cl9pcF90b19pbnRfaXBfdGVzdCgpIHtcbiAgICByZXR1cm4gc3RyX2lwX3RvX2ludF9pcChcIjE5Mi4xNjguMC4xXCIpO1xufVxuXG4vLyBuZXR3b3JrIGJ5dGUgb3JkZXIgKGJpZyBlbmRpYW4pXG5mdW5jdGlvbiBpbnRfaXBfdG9fYnl0ZV9hcnJheShpbnRfaXAsIG51bV9ieXRlcykge1xuICAgIGxldCBieXRlX2FycmF5ID0gbmV3IEFycmF5KG51bV9ieXRlcyk7XG4gICAgbGV0IGluZGV4ID0gMDtcbiAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBudW1fYnl0ZXM7IGluZGV4KyspIHtcblx0Ynl0ZV9hcnJheVtudW1fYnl0ZXMgLSAxIC0gaW5kZXhdID0gaW50X2lwICYgMjU1O1xuXHRpbnRfaXAgPj49IDg7XG4gICAgfVxuICAgIHJldHVybiBieXRlX2FycmF5O1xufVxuXG5mdW5jdGlvbiBpbnRfaXBfdG9fYnl0ZV9hcnJheV90ZXN0KCkge1xuICAgIHJldHVybiBpbnRfaXBfdG9fYnl0ZV9hcnJheShzdHJfaXBfdG9faW50X2lwKFwiMTkyLjE2OC4wLjFcIiksIDQpXG59XG5cbi8vIFRPRE86IHJlbW92ZSBjb25zb2xlLmxvZ1xuZnVuY3Rpb24gaW50X2lwX3RvX3N0cl9pcChpbnRfaXApIHtcbiAgICBjb25zb2xlLmxvZyhcInRoZSBieXRlIGFycmF5IGlzIFwiICsgaW50X2lwX3RvX2J5dGVfYXJyYXkoaW50X2lwLCA0KSlcbiAgICByZXR1cm4gaXBhZGRyLmZyb21CeXRlQXJyYXkoaW50X2lwX3RvX2J5dGVfYXJyYXkoaW50X2lwLCA0KSkudG9TdHJpbmcoKTtcbn1cblxuZnVuY3Rpb24gaW50X2lwX3RvX3N0cl9pcF90ZXN0KCkge1xuICAgIHJldHVybiBpbnRfaXBfdG9fc3RyX2lwKHN0cl9pcF90b19pbnRfaXAoXCIxOTIuMTY4LjAuMVwiKSwgNClcbn1cblxuLy8gbm93IGdvIHRocm91Z2ggYWxsIHRoZSBhdmFpbGFibGUgc3VibmV0c1xuLy8gc3VibmV0c3BlYzoge2lwX2ludDogaXBfYXNfaW50fVxuLy8gcmV0dXJucyB0d28gc3VibmV0cyxcbmZ1bmN0aW9uIGhhbGZfc3VibmV0c3BlYyhzdWJuZXRzcGVjKSB7XG4gICAgc3VibmV0X2JpdHMgPSBzdWJuZXRzcGVjLnN1Ym5ldF9iaXRzLTE7XG4gICAgZmlyc3Rfc3VibmV0ID0ge2lwOiBzdWJuZXRzcGVjLmlwLFxuXHRcdCAgICBzdWJuZXRfYml0czogc3VibmV0X2JpdHN9O1xuICAgIHNlY29uZF9zdWJuZXQgPSB7aXA6IHN1Ym5ldHNwZWMuaXAgKyBNYXRoLnBvdygyLCAzMi1zdWJuZXRfYml0cyksXG5cdFx0ICAgICBzdWJuZXRfYml0czogc3VibmV0X2JpdHN9O1xuICAgIHJldHVybiBbZmlyc3Rfc3VibmV0LCBzZWNvbmRfc3VibmV0XTtcbn1cblxuXGZcbi8vLyBtYWluIHByb2dyYW0gZnVuY3Rpb25zXG5cbi8vIGZ1bmN0aW9uIFxuZnVuY3Rpb24gYWxsb2NhdGVfaXBzKHN0YXJ0aW5nX2lwLCBzdWJuZXRfYml0cywgbnVtX2hvc3RzX2xpc3QpIHtcbiAgICBuZXR3b3Jrc19hdmFpbGFibGUgPSBbe2lwOiBzdGFydGluZ19pcCxcblx0XHRcdCAgIHN1Ym5ldF9iaXRzOiBzdWJuZXRfYml0c31dXG4gICAgYWxsb2NhdGVkX25ldHdvcmtzID0gW11cbiAgICB3aGlsZSAoKG51bV9ob3N0c19saXN0Lmxlbmd0aCAhPT0gMCkgJiYgKG5ldHdvcmtzX2F2YWlsYWJsZS5sZW5ndGggIT09IDApKSB7XG5cdHN1Ym5ldF9udW1faXBzID0gbnVtX2hvc3RzX2xpc3QucG9wKCkgKyAyIC8vIGFkZCBicm9hZGNhc3QvbmV0d29yayBhZGRyZXNzXG5cdC8vIGZpcnN0IGZpbmQgdGhlIG5leHQgbGFyZ2VzdCBwb3dlciBvZiB0d28gdGhhdCBmaXRzLlxuXHQvLyBzbywgbG9nXzIoKVxuXHR0YXJnZXRfc3VibmV0X3NpemUgPSBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2cyKHN1Ym5ldF9udW1faXBzKSkpXG5cdGNvbnNvbGUubG9nKFwic3VibmV0X251bV9pcHM6IFwiICsgc3VibmV0X251bV9pcHMgKyBcInRhcmdldF9zdWJuZXRfc2l6ZTogXCIgKyB0YXJnZXRfc3VibmV0X3NpemUpXG5cdC8vIG5vdyBmaW5kIHRoZSBuZXh0IGxhcmdlc3QgSVAgc3VibmV0IHRoYXQgZml0c1xuICAgIH1cbiAgICBpZiAoaXNfZW1wdHkobmV0d29ya3NfYXZhaWxhYmxlKSAmJiAhaXNfZW1wdHkobnVtX2hvc3RzX2xpc3QpKSB7XG5cdGNvbnNvbGUubG9nKFwibm90IGVub3VnaCBuZXR3b3JrcyBhdmFpbGFibGVcIilcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jYXRlZF9uZXR3b3Jrc1xufVxuLy8gVE9ETzogcmVuYW1lXG5mdW5jdGlvbiBhbGxvY2F0ZV9pcF90ZXN0KCkge1xuICAgIGNvbnNvbGUubG9nKGFsbG9jYXRlX2lwcyhcIjE5Mi4xNjguMS4wXCIsIFwiMjU1LjI1NS4yNTUuMFwiLCBbNjMsIDYyLCAxMDBdKSlcbiAgICBjb25zb2xlLmxvZyhcImFzIGJ5dGUgYXJyYXk6IFwiICsgaW50X2lwX3RvX2J5dGVfYXJyYXlfdGVzdCgpKVxuICAgIGNvbnNvbGUubG9nKFwiYXMgaW50OiBcIiArIHN0cl9pcF90b19pbnRfaXBfdGVzdCgpKVxuICAgIGNvbnNvbGUubG9nKFwiaGVyZVwiKVxuICAgIGNvbnNvbGUubG9nKFwiYXMgc3RyOiBcIiArIGludF9pcF90b19zdHJfaXBfdGVzdCgpKVxuICAgIGNvbnNvbGUubG9nKFwic3RyLT5pbnQtPnN0cjogXCIgKyBpbnRfaXBfdG9fc3RyX2lwKHN0cl9pcF90b19pbnRfaXAoXCIxOTIuMTY4LjAuMVwiKSkpXG59XG5cbmdsb2JhbC5hbGxvY2F0ZV9pcF90ZXN0ID0gYWxsb2NhdGVfaXBfdGVzdFxuXG5cZlxuLy8vIGZvcmNlIGdyYXBoIHVwZGF0aW5nIGZ1bmN0aW9uc1xuXG5mdW5jdGlvbiB1cGRhdGUoKSB7XG4gIHZhciBsaW5rID0gbGluZXNnLnNlbGVjdEFsbChcImxpbmUubGlua1wiKVxuICAgICAgLmRhdGEobGlua3MpXG4gICAgICAuYXR0cihcIngxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLng7IH0pXG4gICAgICAuYXR0cihcInkxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG4gICAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lng7IH0pXG4gICAgICAuYXR0cihcInkyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lnk7IH0pXG4gICAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQgPT09IHNlbGVjdGVkX2xpbms7IH0pO1xuICBsaW5rLmVudGVyKCkuYXBwZW5kKFwibGluZVwiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5rXCIpXG4gICAgLmF0dHIoXCJtYXJrZXItZW5kXCIsIFwidXJsKCNjaGlsZClcIilcbiAgICAub24oXCJtb3VzZWRvd25cIiwgbGluZV9tb3VzZWRvd24pO1xuICBsaW5rLmV4aXQoKS5yZW1vdmUoKTtcblxuICB2YXIgbm9kZSA9IGNpcmNsZXNnLnNlbGVjdEFsbChcIi5ub2RlXCIpXG4gICAgLmRhdGEobm9kZXMsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5uYW1lO30pXG4gICAgLmNsYXNzZWQoXCJzZWxlY3RlZFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkID09PSBzZWxlY3RlZF9ub2RlOyB9KVxuICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRfdGFyZ2V0XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQgPT09IHNlbGVjdGVkX3RhcmdldF9ub2RlOyB9KVxuICB2YXIgbm9kZWcgPSBub2RlLmVudGVyKClcbiAgICAuYXBwZW5kKFwiZ1wiKVxuICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlXCIpLmNhbGwoZm9yY2UuZHJhZylcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBkLnggKyBcIixcIiArIGQueSArIFwiKVwiO1xuICAgIH0pO1xuICBub2RlZy5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAuYXR0cihcInJcIiwgMTApXG4gICAgLm9uKFwibW91c2Vkb3duXCIsIG5vZGVfbW91c2Vkb3duKVxuICAgIC5vbihcIm1vdXNlb3ZlclwiLCBub2RlX21vdXNlb3ZlcilcbiAgICAub24oXCJtb3VzZW91dFwiLCBub2RlX21vdXNlb3V0KTtcbiAgbm9kZWdcbiAgICAuYXBwZW5kKFwic3ZnOmFcIilcbiAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQudXJsIHx8ICcjJzsgfSlcbiAgICAuYXBwZW5kKFwidGV4dFwiKVxuICAgIC5hdHRyKFwiZHhcIiwgMTIpXG4gICAgLmF0dHIoXCJkeVwiLCBcIi4zNWVtXCIpXG4gICAgLnRleHQoZnVuY3Rpb24oZCkge3JldHVybiBkLm5hbWV9KTtcbiAgbm9kZS5leGl0KCkucmVtb3ZlKCk7XG5cbiAgZm9yY2Uub24oXCJ0aWNrXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBsaW5rLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS54OyB9KVxuICAgICAgICAuYXR0cihcInkxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG4gICAgICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueDsgfSlcbiAgICAgICAgLmF0dHIoXCJ5MlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC55OyB9KTtcbiAgICBub2RlLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyBkLnggKyBcIixcIiArIGQueSArIFwiKVwiOyB9KTtcbiAgfSk7XG59XG5cblxmXG4vLy8gZm9yY2UgZ3JhcGggdXNlciBpbnB1dFxuXG4vLyBzZWxlY3QgdGFyZ2V0IG5vZGUgZm9yIG5ldyBub2RlIGNvbm5lY3Rpb25cbmZ1bmN0aW9uIG5vZGVfbW91c2VvdmVyKGQpIHtcbiAgaWYgKGRyYXdpbmdfbGluZSAmJiBkICE9PSBzZWxlY3RlZF9ub2RlKSB7XG4gICAgLy8gaGlnaGxpZ2h0IGFuZCBzZWxlY3QgdGFyZ2V0IG5vZGVcbiAgICBzZWxlY3RlZF90YXJnZXRfbm9kZSA9IGQ7XG4gIH1cbn1cblxuZnVuY3Rpb24gbm9kZV9tb3VzZW91dChkKSB7XG4gIGlmIChkcmF3aW5nX2xpbmUpIHtcbiAgICBzZWxlY3RlZF90YXJnZXRfbm9kZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gc2VsZWN0IG5vZGUgLyBzdGFydCBkcmFnXG5mdW5jdGlvbiBub2RlX21vdXNlZG93bihkKSB7XG4gIGlmICghZHJhd2luZ19saW5lKSB7XG4gICAgc2VsZWN0ZWRfbm9kZSA9IGQ7XG4gICAgc2VsZWN0ZWRfbGluayA9IG51bGw7XG4gIH1cbiAgaWYgKCFzaG91bGRfZHJhZykge1xuICAgIGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGRyYXdpbmdfbGluZSA9IHRydWU7XG4gIH1cbiAgZC5maXhlZCA9IHRydWU7XG4gIGZvcmNlLnN0b3AoKVxuICB1cGRhdGUoKTtcbn1cblxuLy8gc2VsZWN0IGxpbmVcbmZ1bmN0aW9uIGxpbmVfbW91c2Vkb3duKGQpIHtcbiAgc2VsZWN0ZWRfbGluayA9IGQ7XG4gIHNlbGVjdGVkX25vZGUgPSBudWxsO1xuICB1cGRhdGUoKTtcbn1cblxuLy8gZHJhdyB5ZWxsb3cgXCJuZXcgY29ubmVjdG9yXCIgbGluZVxuZnVuY3Rpb24gbW91c2Vtb3ZlKCkge1xuICBpZiAoZHJhd2luZ19saW5lICYmICFzaG91bGRfZHJhZykge1xuICAgIHZhciBtID0gZDMubW91c2Uoc3ZnLm5vZGUoKSk7XG4gICAgdmFyIHggPSBNYXRoLm1heCgwLCBNYXRoLm1pbih3aWR0aCwgbVswXSkpO1xuICAgIHZhciB5ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oaGVpZ2h0LCBtWzFdKSk7XG4gICAgLy8gZGVib3VuY2UgLSBvbmx5IHN0YXJ0IGRyYXdpbmcgbGluZSBpZiBpdCBnZXRzIGEgYml0IGJpZ1xuICAgIHZhciBkeCA9IHNlbGVjdGVkX25vZGUueCAtIHg7XG4gICAgdmFyIGR5ID0gc2VsZWN0ZWRfbm9kZS55IC0geTtcbiAgICBpZiAoTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSA+IDEwKSB7XG4gICAgICAvLyBkcmF3IGEgbGluZVxuICAgICAgaWYgKCFuZXdfbGluZSkge1xuICAgICAgICBuZXdfbGluZSA9IGxpbmVzZy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm5ld19saW5lXCIpO1xuICAgICAgfVxuICAgICAgbmV3X2xpbmUuYXR0cihcIngxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHNlbGVjdGVkX25vZGUueDsgfSlcbiAgICAgICAgLmF0dHIoXCJ5MVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBzZWxlY3RlZF9ub2RlLnk7IH0pXG4gICAgICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4geDsgfSlcbiAgICAgICAgLmF0dHIoXCJ5MlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB5OyB9KTtcbiAgICB9XG4gIH1cbiAgdXBkYXRlKCk7XG59XG5cbi8vIGFkZCBhIG5ldyBkaXNjb25uZWN0ZWQgbm9kZVxuZnVuY3Rpb24gbW91c2Vkb3duKCkge1xuICBtID0gZDMubW91c2Uoc3ZnLm5vZGUoKSlcbiAgbm9kZXMucHVzaCh7eDogbVswXSwgeTogbVsxXSwgbmFtZTogZGVmYXVsdF9uYW1lICsgXCIgXCIgKyBub2Rlcy5sZW5ndGgsIGdyb3VwOiAxfSk7XG4gIHNlbGVjdGVkX2xpbmsgPSBudWxsO1xuICBmb3JjZS5zdG9wKCk7XG4gIHVwZGF0ZSgpO1xuICBmb3JjZS5zdGFydCgpO1xufVxuXG4vLyBlbmQgbm9kZSBzZWxlY3QgLyBhZGQgbmV3IGNvbm5lY3RlZCBub2RlXG5mdW5jdGlvbiBtb3VzZXVwKCkge1xuICBkcmF3aW5nX2xpbmUgPSBmYWxzZTtcbiAgaWYgKG5ld19saW5lKSB7XG4gICAgaWYgKHNlbGVjdGVkX3RhcmdldF9ub2RlKSB7XG4gICAgICBzZWxlY3RlZF90YXJnZXRfbm9kZS5maXhlZCA9IGZhbHNlO1xuICAgICAgdmFyIG5ld19ub2RlID0gc2VsZWN0ZWRfdGFyZ2V0X25vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBtID0gZDMubW91c2Uoc3ZnLm5vZGUoKSk7XG4gICAgICB2YXIgbmV3X25vZGUgPSB7eDogbVswXSwgeTogbVsxXSwgbmFtZTogZGVmYXVsdF9uYW1lICsgXCIgXCIgKyBub2Rlcy5sZW5ndGgsIGdyb3VwOiAxfVxuICAgICAgbm9kZXMucHVzaChuZXdfbm9kZSk7XG4gICAgfVxuICAgIHNlbGVjdGVkX25vZGUuZml4ZWQgPSBmYWxzZTtcbiAgICBsaW5rcy5wdXNoKHtzb3VyY2U6IHNlbGVjdGVkX25vZGUsIHRhcmdldDogbmV3X25vZGV9KVxuICAgIHNlbGVjdGVkX25vZGUgPSBzZWxlY3RlZF90YXJnZXRfbm9kZSA9IG51bGw7XG4gICAgdXBkYXRlKCk7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBuZXdfbGluZS5yZW1vdmUoKTtcbiAgICAgIG5ld19saW5lID0gbnVsbDtcbiAgICAgIGZvcmNlLnN0YXJ0KCk7XG4gICAgfSwgMzAwKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBrZXl1cCgpIHtcbiAgc3dpdGNoIChkMy5ldmVudC5rZXlDb2RlKSB7XG4gICAgY2FzZSAxNjogeyAvLyBzaGlmdFxuICAgICAgc2hvdWxkX2RyYWcgPSBmYWxzZTtcbiAgICAgIHVwZGF0ZSgpO1xuICAgICAgZm9yY2Uuc3RhcnQoKTtcbiAgICB9XG4gIH1cbn1cblxuLy8gc2VsZWN0IGZvciBkcmFnZ2luZyBub2RlIHdpdGggc2hpZnQ7IGRlbGV0ZSBub2RlIHdpdGggYmFja3NwYWNlXG5mdW5jdGlvbiBrZXlkb3duKCkge1xuICBzd2l0Y2ggKGQzLmV2ZW50LmtleUNvZGUpIHtcbiAgICBjYXNlIDg6IC8vIGJhY2tzcGFjZVxuICAgIGNhc2UgNDY6IHsgLy8gZGVsZXRlXG4gICAgICBpZiAoc2VsZWN0ZWRfbm9kZSkgeyAvLyBkZWFsIHdpdGggbm9kZXNcbiAgICAgICAgdmFyIGkgPSBub2Rlcy5pbmRleE9mKHNlbGVjdGVkX25vZGUpO1xuICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIC8vIGZpbmQgbGlua3MgdG8vZnJvbSB0aGlzIG5vZGUsIGFuZCBkZWxldGUgdGhlbSB0b29cbiAgICAgICAgdmFyIG5ld19saW5rcyA9IFtdO1xuICAgICAgICBsaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGwpIHtcbiAgICAgICAgICBpZiAobC5zb3VyY2UgIT09IHNlbGVjdGVkX25vZGUgJiYgbC50YXJnZXQgIT09IHNlbGVjdGVkX25vZGUpIHtcbiAgICAgICAgICAgIG5ld19saW5rcy5wdXNoKGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGxpbmtzID0gbmV3X2xpbmtzO1xuICAgICAgICBzZWxlY3RlZF9ub2RlID0gbm9kZXMubGVuZ3RoID8gbm9kZXNbaSA+IDAgPyBpIC0gMSA6IDBdIDogbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZWN0ZWRfbGluaykgeyAvLyBkZWFsIHdpdGggbGlua3NcbiAgICAgICAgdmFyIGkgPSBsaW5rcy5pbmRleE9mKHNlbGVjdGVkX2xpbmspO1xuICAgICAgICBsaW5rcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIHNlbGVjdGVkX2xpbmsgPSBsaW5rcy5sZW5ndGggPyBsaW5rc1tpID4gMCA/IGkgLSAxIDogMF0gOiBudWxsO1xuICAgICAgfVxuICAgICAgdXBkYXRlKCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSAxNjogeyAvLyBzaGlmdFxuICAgICAgc2hvdWxkX2RyYWcgPSB0cnVlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59XG4iLCIoZnVuY3Rpb24gKHJvb3QpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gQSBsaXN0IG9mIHJlZ3VsYXIgZXhwcmVzc2lvbnMgdGhhdCBtYXRjaCBhcmJpdHJhcnkgSVB2NCBhZGRyZXNzZXMsXG4gICAgLy8gZm9yIHdoaWNoIGEgbnVtYmVyIG9mIHdlaXJkIG5vdGF0aW9ucyBleGlzdC5cbiAgICAvLyBOb3RlIHRoYXQgYW4gYWRkcmVzcyBsaWtlIDAwMTAuMHhhNS4xLjEgaXMgY29uc2lkZXJlZCBsZWdhbC5cbiAgICBjb25zdCBpcHY0UGFydCA9ICcoMD9cXFxcZCt8MHhbYS1mMC05XSspJztcbiAgICBjb25zdCBpcHY0UmVnZXhlcyA9IHtcbiAgICAgICAgZm91ck9jdGV0OiBuZXcgUmVnRXhwKGBeJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH0kYCwgJ2knKSxcbiAgICAgICAgdGhyZWVPY3RldDogbmV3IFJlZ0V4cChgXiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH0kYCwgJ2knKSxcbiAgICAgICAgdHdvT2N0ZXQ6IG5ldyBSZWdFeHAoYF4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH0kYCwgJ2knKSxcbiAgICAgICAgbG9uZ1ZhbHVlOiBuZXcgUmVnRXhwKGBeJHtpcHY0UGFydH0kYCwgJ2knKVxuICAgIH07XG5cbiAgICAvLyBSZWd1bGFyIEV4cHJlc3Npb24gZm9yIGNoZWNraW5nIE9jdGFsIG51bWJlcnNcbiAgICBjb25zdCBvY3RhbFJlZ2V4ID0gbmV3IFJlZ0V4cChgXjBbMC03XSskYCwgJ2knKTtcbiAgICBjb25zdCBoZXhSZWdleCA9IG5ldyBSZWdFeHAoYF4weFthLWYwLTldKyRgLCAnaScpO1xuXG4gICAgY29uc3Qgem9uZUluZGV4ID0gJyVbMC05YS16XXsxLH0nO1xuXG4gICAgLy8gSVB2Ni1tYXRjaGluZyByZWd1bGFyIGV4cHJlc3Npb25zLlxuICAgIC8vIEZvciBJUHY2LCB0aGUgdGFzayBpcyBzaW1wbGVyOiBpdCBpcyBlbm91Z2ggdG8gbWF0Y2ggdGhlIGNvbG9uLWRlbGltaXRlZFxuICAgIC8vIGhleGFkZWNpbWFsIElQdjYgYW5kIGEgdHJhbnNpdGlvbmFsIHZhcmlhbnQgd2l0aCBkb3R0ZWQtZGVjaW1hbCBJUHY0IGF0XG4gICAgLy8gdGhlIGVuZC5cbiAgICBjb25zdCBpcHY2UGFydCA9ICcoPzpbMC05YS1mXSs6Oj8pKyc7XG4gICAgY29uc3QgaXB2NlJlZ2V4ZXMgPSB7XG4gICAgICAgIHpvbmVJbmRleDogbmV3IFJlZ0V4cCh6b25lSW5kZXgsICdpJyksXG4gICAgICAgICduYXRpdmUnOiBuZXcgUmVnRXhwKGBeKDo6KT8oJHtpcHY2UGFydH0pPyhbMC05YS1mXSspPyg6Oik/KCR7em9uZUluZGV4fSk/JGAsICdpJyksXG4gICAgICAgIGRlcHJlY2F0ZWRUcmFuc2l0aW9uYWw6IG5ldyBSZWdFeHAoYF4oPzo6OikoJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH0oJHt6b25lSW5kZXh9KT8pJGAsICdpJyksXG4gICAgICAgIHRyYW5zaXRpb25hbDogbmV3IFJlZ0V4cChgXigoPzoke2lwdjZQYXJ0fSl8KD86OjopKD86JHtpcHY2UGFydH0pPykke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fSgke3pvbmVJbmRleH0pPyRgLCAnaScpXG4gICAgfTtcblxuICAgIC8vIEV4cGFuZCA6OiBpbiBhbiBJUHY2IGFkZHJlc3Mgb3IgYWRkcmVzcyBwYXJ0IGNvbnNpc3Rpbmcgb2YgYHBhcnRzYCBncm91cHMuXG4gICAgZnVuY3Rpb24gZXhwYW5kSVB2NiAoc3RyaW5nLCBwYXJ0cykge1xuICAgICAgICAvLyBNb3JlIHRoYW4gb25lICc6OicgbWVhbnMgaW52YWxpZCBhZGRkcmVzc1xuICAgICAgICBpZiAoc3RyaW5nLmluZGV4T2YoJzo6JykgIT09IHN0cmluZy5sYXN0SW5kZXhPZignOjonKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY29sb25Db3VudCA9IDA7XG4gICAgICAgIGxldCBsYXN0Q29sb24gPSAtMTtcbiAgICAgICAgbGV0IHpvbmVJZCA9IChzdHJpbmcubWF0Y2goaXB2NlJlZ2V4ZXMuem9uZUluZGV4KSB8fCBbXSlbMF07XG4gICAgICAgIGxldCByZXBsYWNlbWVudCwgcmVwbGFjZW1lbnRDb3VudDtcblxuICAgICAgICAvLyBSZW1vdmUgem9uZSBpbmRleCBhbmQgc2F2ZSBpdCBmb3IgbGF0ZXJcbiAgICAgICAgaWYgKHpvbmVJZCkge1xuICAgICAgICAgICAgem9uZUlkID0gem9uZUlkLnN1YnN0cmluZygxKTtcbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC8lLiskLywgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSG93IG1hbnkgcGFydHMgZG8gd2UgYWxyZWFkeSBoYXZlP1xuICAgICAgICB3aGlsZSAoKGxhc3RDb2xvbiA9IHN0cmluZy5pbmRleE9mKCc6JywgbGFzdENvbG9uICsgMSkpID49IDApIHtcbiAgICAgICAgICAgIGNvbG9uQ291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIDA6OjAgaXMgdHdvIHBhcnRzIG1vcmUgdGhhbiA6OlxuICAgICAgICBpZiAoc3RyaW5nLnN1YnN0cigwLCAyKSA9PT0gJzo6Jykge1xuICAgICAgICAgICAgY29sb25Db3VudC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0cmluZy5zdWJzdHIoLTIsIDIpID09PSAnOjonKSB7XG4gICAgICAgICAgICBjb2xvbkNvdW50LS07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGxvb3Agd291bGQgaGFuZyBpZiBjb2xvbkNvdW50ID4gcGFydHNcbiAgICAgICAgaWYgKGNvbG9uQ291bnQgPiBwYXJ0cykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXBsYWNlbWVudCA9ICc6JyArICcwOicgKiAocGFydHMgLSBjb2xvbkNvdW50KVxuICAgICAgICByZXBsYWNlbWVudENvdW50ID0gcGFydHMgLSBjb2xvbkNvdW50O1xuICAgICAgICByZXBsYWNlbWVudCA9ICc6JztcbiAgICAgICAgd2hpbGUgKHJlcGxhY2VtZW50Q291bnQtLSkge1xuICAgICAgICAgICAgcmVwbGFjZW1lbnQgKz0gJzA6JztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEluc2VydCB0aGUgbWlzc2luZyB6ZXJvZXNcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoJzo6JywgcmVwbGFjZW1lbnQpO1xuXG4gICAgICAgIC8vIFRyaW0gYW55IGdhcmJhZ2Ugd2hpY2ggbWF5IGJlIGhhbmdpbmcgYXJvdW5kIGlmIDo6IHdhcyBhdCB0aGUgZWRnZSBpblxuICAgICAgICAvLyB0aGUgc291cmNlIHN0cmluXG4gICAgICAgIGlmIChzdHJpbmdbMF0gPT09ICc6Jykge1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHN0cmluZ1tzdHJpbmcubGVuZ3RoIC0gMV0gPT09ICc6Jykge1xuICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcnRzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHN0cmluZy5zcGxpdCgnOicpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlZi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwYXJzZUludChyZWZbaV0sIDE2KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KSgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwYXJ0czogcGFydHMsXG4gICAgICAgICAgICB6b25lSWQ6IHpvbmVJZFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIEEgZ2VuZXJpYyBDSURSIChDbGFzc2xlc3MgSW50ZXItRG9tYWluIFJvdXRpbmcpIFJGQzE1MTggcmFuZ2UgbWF0Y2hlci5cbiAgICBmdW5jdGlvbiBtYXRjaENJRFIgKGZpcnN0LCBzZWNvbmQsIHBhcnRTaXplLCBjaWRyQml0cykge1xuICAgICAgICBpZiAoZmlyc3QubGVuZ3RoICE9PSBzZWNvbmQubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogY2Fubm90IG1hdGNoIENJRFIgZm9yIG9iamVjdHMgd2l0aCBkaWZmZXJlbnQgbGVuZ3RocycpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhcnQgPSAwO1xuICAgICAgICBsZXQgc2hpZnQ7XG5cbiAgICAgICAgd2hpbGUgKGNpZHJCaXRzID4gMCkge1xuICAgICAgICAgICAgc2hpZnQgPSBwYXJ0U2l6ZSAtIGNpZHJCaXRzO1xuICAgICAgICAgICAgaWYgKHNoaWZ0IDwgMCkge1xuICAgICAgICAgICAgICAgIHNoaWZ0ID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGZpcnN0W3BhcnRdID4+IHNoaWZ0ICE9PSBzZWNvbmRbcGFydF0gPj4gc2hpZnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNpZHJCaXRzIC09IHBhcnRTaXplO1xuICAgICAgICAgICAgcGFydCArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VJbnRBdXRvIChzdHJpbmcpIHtcbiAgICAgICAgLy8gSGV4YWRlZGltYWwgYmFzZSAxNiAoMHgjKVxuICAgICAgICBpZiAoaGV4UmVnZXgudGVzdChzdHJpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyaW5nLCAxNik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2hpbGUgb2N0YWwgcmVwcmVzZW50YXRpb24gaXMgZGlzY291cmFnZWQgYnkgRUNNQVNjcmlwdCAzXG4gICAgICAgIC8vIGFuZCBmb3JiaWRkZW4gYnkgRUNNQVNjcmlwdCA1LCB3ZSBzaWxlbnRseSBhbGxvdyBpdCB0b1xuICAgICAgICAvLyB3b3JrIG9ubHkgaWYgdGhlIHJlc3Qgb2YgdGhlIHN0cmluZyBoYXMgbnVtYmVycyBsZXNzIHRoYW4gOC5cbiAgICAgICAgaWYgKHN0cmluZ1swXSA9PT0gJzAnICYmICFpc05hTihwYXJzZUludChzdHJpbmdbMV0sIDEwKSkpIHtcbiAgICAgICAgaWYgKG9jdGFsUmVnZXgudGVzdChzdHJpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyaW5nLCA4KTtcbiAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpcGFkZHI6IGNhbm5vdCBwYXJzZSAke3N0cmluZ30gYXMgb2N0YWxgKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBBbHdheXMgaW5jbHVkZSB0aGUgYmFzZSAxMCByYWRpeCFcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0cmluZywgMTApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhZFBhcnQgKHBhcnQsIGxlbmd0aCkge1xuICAgICAgICB3aGlsZSAocGFydC5sZW5ndGggPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIHBhcnQgPSBgMCR7cGFydH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnQ7XG4gICAgfVxuXG4gICAgY29uc3QgaXBhZGRyID0ge307XG5cbiAgICAvLyBBbiBJUHY0IGFkZHJlc3MgKFJGQzc5MSkuXG4gICAgaXBhZGRyLklQdjQgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBDb25zdHJ1Y3RzIGEgbmV3IElQdjQgYWRkcmVzcyBmcm9tIGFuIGFycmF5IG9mIGZvdXIgb2N0ZXRzXG4gICAgICAgIC8vIGluIG5ldHdvcmsgb3JkZXIgKE1TQiBmaXJzdClcbiAgICAgICAgLy8gVmVyaWZpZXMgdGhlIGlucHV0LlxuICAgICAgICBmdW5jdGlvbiBJUHY0IChvY3RldHMpIHtcbiAgICAgICAgICAgIGlmIChvY3RldHMubGVuZ3RoICE9PSA0KSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGlwdjQgb2N0ZXQgY291bnQgc2hvdWxkIGJlIDQnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGksIG9jdGV0O1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2N0ZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb2N0ZXQgPSBvY3RldHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKCEoKDAgPD0gb2N0ZXQgJiYgb2N0ZXQgPD0gMjU1KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGlwdjQgb2N0ZXQgc2hvdWxkIGZpdCBpbiA4IGJpdHMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub2N0ZXRzID0gb2N0ZXRzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3BlY2lhbCBJUHY0IGFkZHJlc3MgcmFuZ2VzLlxuICAgICAgICAvLyBTZWUgYWxzbyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9SZXNlcnZlZF9JUF9hZGRyZXNzZXNcbiAgICAgICAgSVB2NC5wcm90b3R5cGUuU3BlY2lhbFJhbmdlcyA9IHtcbiAgICAgICAgICAgIHVuc3BlY2lmaWVkOiBbW25ldyBJUHY0KFswLCAwLCAwLCAwXSksIDhdXSxcbiAgICAgICAgICAgIGJyb2FkY2FzdDogW1tuZXcgSVB2NChbMjU1LCAyNTUsIDI1NSwgMjU1XSksIDMyXV0sXG4gICAgICAgICAgICAvLyBSRkMzMTcxXG4gICAgICAgICAgICBtdWx0aWNhc3Q6IFtbbmV3IElQdjQoWzIyNCwgMCwgMCwgMF0pLCA0XV0sXG4gICAgICAgICAgICAvLyBSRkMzOTI3XG4gICAgICAgICAgICBsaW5rTG9jYWw6IFtbbmV3IElQdjQoWzE2OSwgMjU0LCAwLCAwXSksIDE2XV0sXG4gICAgICAgICAgICAvLyBSRkM1NzM1XG4gICAgICAgICAgICBsb29wYmFjazogW1tuZXcgSVB2NChbMTI3LCAwLCAwLCAwXSksIDhdXSxcbiAgICAgICAgICAgIC8vIFJGQzY1OThcbiAgICAgICAgICAgIGNhcnJpZXJHcmFkZU5hdDogW1tuZXcgSVB2NChbMTAwLCA2NCwgMCwgMF0pLCAxMF1dLFxuICAgICAgICAgICAgLy8gUkZDMTkxOFxuICAgICAgICAgICAgJ3ByaXZhdGUnOiBbXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsxMCwgMCwgMCwgMF0pLCA4XSxcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzE3MiwgMTYsIDAsIDBdKSwgMTJdLFxuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMTkyLCAxNjgsIDAsIDBdKSwgMTZdXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgLy8gUmVzZXJ2ZWQgYW5kIHRlc3Rpbmctb25seSByYW5nZXM7IFJGQ3MgNTczNSwgNTczNywgMjU0NCwgMTcwMFxuICAgICAgICAgICAgcmVzZXJ2ZWQ6IFtcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzE5MiwgMCwgMCwgMF0pLCAyNF0sXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsxOTIsIDAsIDIsIDBdKSwgMjRdLFxuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMTkyLCA4OCwgOTksIDBdKSwgMjRdLFxuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMTk4LCA1MSwgMTAwLCAwXSksIDI0XSxcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzIwMywgMCwgMTEzLCAwXSksIDI0XSxcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzI0MCwgMCwgMCwgMF0pLCA0XVxuICAgICAgICAgICAgXVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRoZSAna2luZCcgbWV0aG9kIGV4aXN0cyBvbiBib3RoIElQdjQgYW5kIElQdjYgY2xhc3Nlcy5cbiAgICAgICAgSVB2NC5wcm90b3R5cGUua2luZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAnaXB2NCc7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2hlY2tzIGlmIHRoaXMgYWRkcmVzcyBtYXRjaGVzIG90aGVyIG9uZSB3aXRoaW4gZ2l2ZW4gQ0lEUiByYW5nZS5cbiAgICAgICAgSVB2NC5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbiAob3RoZXIsIGNpZHJSYW5nZSkge1xuICAgICAgICAgICAgbGV0IHJlZjtcbiAgICAgICAgICAgIGlmIChjaWRyUmFuZ2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJlZiA9IG90aGVyO1xuICAgICAgICAgICAgICAgIG90aGVyID0gcmVmWzBdO1xuICAgICAgICAgICAgICAgIGNpZHJSYW5nZSA9IHJlZlsxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG90aGVyLmtpbmQoKSAhPT0gJ2lwdjQnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGNhbm5vdCBtYXRjaCBpcHY0IGFkZHJlc3Mgd2l0aCBub24taXB2NCBvbmUnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoQ0lEUih0aGlzLm9jdGV0cywgb3RoZXIub2N0ZXRzLCA4LCBjaWRyUmFuZ2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHJldHVybnMgYSBudW1iZXIgb2YgbGVhZGluZyBvbmVzIGluIElQdjQgYWRkcmVzcywgbWFraW5nIHN1cmUgdGhhdFxuICAgICAgICAvLyB0aGUgcmVzdCBpcyBhIHNvbGlkIHNlcXVlbmNlIG9mIDAncyAodmFsaWQgbmV0bWFzaylcbiAgICAgICAgLy8gcmV0dXJucyBlaXRoZXIgdGhlIENJRFIgbGVuZ3RoIG9yIG51bGwgaWYgbWFzayBpcyBub3QgdmFsaWRcbiAgICAgICAgSVB2NC5wcm90b3R5cGUucHJlZml4TGVuZ3RoRnJvbVN1Ym5ldE1hc2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgY2lkciA9IDA7XG4gICAgICAgICAgICAvLyBub24temVybyBlbmNvdW50ZXJlZCBzdG9wIHNjYW5uaW5nIGZvciB6ZXJvZXNcbiAgICAgICAgICAgIGxldCBzdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBudW1iZXIgb2YgemVyb2VzIGluIG9jdGV0XG4gICAgICAgICAgICBjb25zdCB6ZXJvdGFibGUgPSB7XG4gICAgICAgICAgICAgICAgMDogOCxcbiAgICAgICAgICAgICAgICAxMjg6IDcsXG4gICAgICAgICAgICAgICAgMTkyOiA2LFxuICAgICAgICAgICAgICAgIDIyNDogNSxcbiAgICAgICAgICAgICAgICAyNDA6IDQsXG4gICAgICAgICAgICAgICAgMjQ4OiAzLFxuICAgICAgICAgICAgICAgIDI1MjogMixcbiAgICAgICAgICAgICAgICAyNTQ6IDEsXG4gICAgICAgICAgICAgICAgMjU1OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IGksIG9jdGV0LCB6ZXJvcztcblxuICAgICAgICAgICAgZm9yIChpID0gMzsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgICAgICBvY3RldCA9IHRoaXMub2N0ZXRzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChvY3RldCBpbiB6ZXJvdGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgemVyb3MgPSB6ZXJvdGFibGVbb2N0ZXRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcCAmJiB6ZXJvcyAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoemVyb3MgIT09IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2lkciArPSB6ZXJvcztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAzMiAtIGNpZHI7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2hlY2tzIGlmIHRoZSBhZGRyZXNzIGNvcnJlc3BvbmRzIHRvIG9uZSBvZiB0aGUgc3BlY2lhbCByYW5nZXMuXG4gICAgICAgIElQdjQucHJvdG90eXBlLnJhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGlwYWRkci5zdWJuZXRNYXRjaCh0aGlzLCB0aGlzLlNwZWNpYWxSYW5nZXMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybnMgYW4gYXJyYXkgb2YgYnl0ZS1zaXplZCB2YWx1ZXMgaW4gbmV0d29yayBvcmRlciAoTVNCIGZpcnN0KVxuICAgICAgICBJUHY0LnByb3RvdHlwZS50b0J5dGVBcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9jdGV0cy5zbGljZSgwKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb252ZXJ0cyB0aGlzIElQdjQgYWRkcmVzcyB0byBhbiBJUHY0LW1hcHBlZCBJUHY2IGFkZHJlc3MuXG4gICAgICAgIElQdjQucHJvdG90eXBlLnRvSVB2NE1hcHBlZEFkZHJlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBhZGRyLklQdjYucGFyc2UoYDo6ZmZmZjoke3RoaXMudG9TdHJpbmcoKX1gKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBTeW1tZXRyaWNhbCBtZXRob2Qgc3RyaWN0bHkgZm9yIGFsaWduaW5nIHdpdGggdGhlIElQdjYgbWV0aG9kcy5cbiAgICAgICAgSVB2NC5wcm90b3R5cGUudG9Ob3JtYWxpemVkU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXR1cm5zIHRoZSBhZGRyZXNzIGluIGNvbnZlbmllbnQsIGRlY2ltYWwtZG90dGVkIGZvcm1hdC5cbiAgICAgICAgSVB2NC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vY3RldHMuam9pbignLicpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBJUHY0O1xuICAgIH0pKCk7XG5cbiAgICAvLyBBIHV0aWxpdHkgZnVuY3Rpb24gdG8gcmV0dXJuIGJyb2FkY2FzdCBhZGRyZXNzIGdpdmVuIHRoZSBJUHY0IGludGVyZmFjZSBhbmQgcHJlZml4IGxlbmd0aCBpbiBDSURSIG5vdGF0aW9uXG4gICAgaXBhZGRyLklQdjQuYnJvYWRjYXN0QWRkcmVzc0Zyb21DSURSID0gZnVuY3Rpb24gKHN0cmluZykge1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjaWRyID0gdGhpcy5wYXJzZUNJRFIoc3RyaW5nKTtcbiAgICAgICAgICAgIGNvbnN0IGlwSW50ZXJmYWNlT2N0ZXRzID0gY2lkclswXS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgY29uc3Qgc3VibmV0TWFza09jdGV0cyA9IHRoaXMuc3VibmV0TWFza0Zyb21QcmVmaXhMZW5ndGgoY2lkclsxXSkudG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGNvbnN0IG9jdGV0cyA9IFtdO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCA0KSB7XG4gICAgICAgICAgICAgICAgLy8gQnJvYWRjYXN0IGFkZHJlc3MgaXMgYml0d2lzZSBPUiBiZXR3ZWVuIGlwIGludGVyZmFjZSBhbmQgaW52ZXJ0ZWQgbWFza1xuICAgICAgICAgICAgICAgIG9jdGV0cy5wdXNoKHBhcnNlSW50KGlwSW50ZXJmYWNlT2N0ZXRzW2ldLCAxMCkgfCBwYXJzZUludChzdWJuZXRNYXNrT2N0ZXRzW2ldLCAxMCkgXiAyNTUpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9jdGV0cyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiB0aGUgYWRkcmVzcyBkb2VzIG5vdCBoYXZlIElQdjQgQ0lEUiBmb3JtYXQnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDaGVja3MgaWYgYSBnaXZlbiBzdHJpbmcgaXMgZm9ybWF0dGVkIGxpa2UgSVB2NCBhZGRyZXNzLlxuICAgIGlwYWRkci5JUHY0LmlzSVB2NCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VyKHN0cmluZykgIT09IG51bGw7XG4gICAgfTtcblxuICAgIC8vIENoZWNrcyBpZiBhIGdpdmVuIHN0cmluZyBpcyBhIHZhbGlkIElQdjQgYWRkcmVzcy5cbiAgICBpcGFkZHIuSVB2NC5pc1ZhbGlkID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbmV3IHRoaXModGhpcy5wYXJzZXIoc3RyaW5nKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENoZWNrcyBpZiBhIGdpdmVuIHN0cmluZyBpcyBhIGZ1bGwgZm91ci1wYXJ0IElQdjQgQWRkcmVzcy5cbiAgICBpcGFkZHIuSVB2NC5pc1ZhbGlkRm91clBhcnREZWNpbWFsID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBpZiAoaXBhZGRyLklQdjQuaXNWYWxpZChzdHJpbmcpICYmIHN0cmluZy5tYXRjaCgvXigwfFsxLTldXFxkKikoXFwuKDB8WzEtOV1cXGQqKSl7M30kLykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEEgdXRpbGl0eSBmdW5jdGlvbiB0byByZXR1cm4gbmV0d29yayBhZGRyZXNzIGdpdmVuIHRoZSBJUHY0IGludGVyZmFjZSBhbmQgcHJlZml4IGxlbmd0aCBpbiBDSURSIG5vdGF0aW9uXG4gICAgaXBhZGRyLklQdjQubmV0d29ya0FkZHJlc3NGcm9tQ0lEUiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgbGV0IGNpZHIsIGksIGlwSW50ZXJmYWNlT2N0ZXRzLCBvY3RldHMsIHN1Ym5ldE1hc2tPY3RldHM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNpZHIgPSB0aGlzLnBhcnNlQ0lEUihzdHJpbmcpO1xuICAgICAgICAgICAgaXBJbnRlcmZhY2VPY3RldHMgPSBjaWRyWzBdLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBzdWJuZXRNYXNrT2N0ZXRzID0gdGhpcy5zdWJuZXRNYXNrRnJvbVByZWZpeExlbmd0aChjaWRyWzFdKS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgb2N0ZXRzID0gW107XG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpIDwgNCkge1xuICAgICAgICAgICAgICAgIC8vIE5ldHdvcmsgYWRkcmVzcyBpcyBiaXR3aXNlIEFORCBiZXR3ZWVuIGlwIGludGVyZmFjZSBhbmQgbWFza1xuICAgICAgICAgICAgICAgIG9jdGV0cy5wdXNoKHBhcnNlSW50KGlwSW50ZXJmYWNlT2N0ZXRzW2ldLCAxMCkgJiBwYXJzZUludChzdWJuZXRNYXNrT2N0ZXRzW2ldLCAxMCkpO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9jdGV0cyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiB0aGUgYWRkcmVzcyBkb2VzIG5vdCBoYXZlIElQdjQgQ0lEUiBmb3JtYXQnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUcmllcyB0byBwYXJzZSBhbmQgdmFsaWRhdGUgYSBzdHJpbmcgd2l0aCBJUHY0IGFkZHJlc3MuXG4gICAgLy8gVGhyb3dzIGFuIGVycm9yIGlmIGl0IGZhaWxzLlxuICAgIGlwYWRkci5JUHY0LnBhcnNlID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMucGFyc2VyKHN0cmluZyk7XG5cbiAgICAgICAgaWYgKHBhcnRzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogc3RyaW5nIGlzIG5vdCBmb3JtYXR0ZWQgbGlrZSBhbiBJUHY0IEFkZHJlc3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhwYXJ0cyk7XG4gICAgfTtcblxuICAgIC8vIFBhcnNlcyB0aGUgc3RyaW5nIGFzIGFuIElQdjQgQWRkcmVzcyB3aXRoIENJRFIgTm90YXRpb24uXG4gICAgaXBhZGRyLklQdjQucGFyc2VDSURSID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBsZXQgbWF0Y2g7XG5cbiAgICAgICAgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaCgvXiguKylcXC8oXFxkKykkLykpKSB7XG4gICAgICAgICAgICBjb25zdCBtYXNrTGVuZ3RoID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuICAgICAgICAgICAgaWYgKG1hc2tMZW5ndGggPj0gMCAmJiBtYXNrTGVuZ3RoIDw9IDMyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFyc2VkID0gW3RoaXMucGFyc2UobWF0Y2hbMV0pLCBtYXNrTGVuZ3RoXTtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocGFyc2VkLCAndG9TdHJpbmcnLCB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5qb2luKCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHN0cmluZyBpcyBub3QgZm9ybWF0dGVkIGxpa2UgYW4gSVB2NCBDSURSIHJhbmdlJyk7XG4gICAgfTtcblxuICAgIC8vIENsYXNzZnVsIHZhcmlhbnRzIChsaWtlIGEuYiwgd2hlcmUgYSBpcyBhbiBvY3RldCwgYW5kIGIgaXMgYSAyNC1iaXRcbiAgICAvLyB2YWx1ZSByZXByZXNlbnRpbmcgbGFzdCB0aHJlZSBvY3RldHM7IHRoaXMgY29ycmVzcG9uZHMgdG8gYSBjbGFzcyBDXG4gICAgLy8gYWRkcmVzcykgYXJlIG9taXR0ZWQgZHVlIHRvIGNsYXNzbGVzcyBuYXR1cmUgb2YgbW9kZXJuIEludGVybmV0LlxuICAgIGlwYWRkci5JUHY0LnBhcnNlciA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgbGV0IG1hdGNoLCBwYXJ0LCB2YWx1ZTtcblxuICAgICAgICAvLyBwYXJzZUludCByZWNvZ25pemVzIGFsbCB0aGF0IG9jdGFsICYgaGV4YWRlY2ltYWwgd2VpcmRuZXNzIGZvciB1c1xuICAgICAgICBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKGlwdjRSZWdleGVzLmZvdXJPY3RldCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBtYXRjaC5zbGljZSgxLCA2KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlZi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBwYXJ0ID0gcmVmW2ldO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGFyc2VJbnRBdXRvKHBhcnQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKGlwdjRSZWdleGVzLmxvbmdWYWx1ZSkpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50QXV0byhtYXRjaFsxXSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgPiAweGZmZmZmZmZmIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBhZGRyZXNzIG91dHNpZGUgZGVmaW5lZCByYW5nZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBzaGlmdDtcblxuICAgICAgICAgICAgICAgIGZvciAoc2hpZnQgPSAwOyBzaGlmdCA8PSAyNDsgc2hpZnQgKz0gOCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goKHZhbHVlID4+IHNoaWZ0KSAmIDB4ZmYpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSkoKSkucmV2ZXJzZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaChpcHY0UmVnZXhlcy50d29PY3RldCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBtYXRjaC5zbGljZSgxLCA0KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50QXV0byhyZWZbMV0pO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA+IDB4ZmZmZmZmIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogYWRkcmVzcyBvdXRzaWRlIGRlZmluZWQgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGFyc2VJbnRBdXRvKHJlZlswXSkpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCgodmFsdWUgPj4gMTYpICYgMHhmZik7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCh2YWx1ZSA+PiAgOCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIHZhbHVlICAgICAgICAmIDB4ZmYpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9IGVsc2UgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaChpcHY0UmVnZXhlcy50aHJlZU9jdGV0KSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlZiA9IG1hdGNoLnNsaWNlKDEsIDUpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnRBdXRvKHJlZlsyXSk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID4gMHhmZmZmIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogYWRkcmVzcyBvdXRzaWRlIGRlZmluZWQgcmFuZ2UnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGFyc2VJbnRBdXRvKHJlZlswXSkpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChwYXJzZUludEF1dG8ocmVmWzFdKSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCh2YWx1ZSA+PiA4KSAmIDB4ZmYpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCggdmFsdWUgICAgICAgJiAweGZmKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEEgdXRpbGl0eSBmdW5jdGlvbiB0byByZXR1cm4gc3VibmV0IG1hc2sgaW4gSVB2NCBmb3JtYXQgZ2l2ZW4gdGhlIHByZWZpeCBsZW5ndGhcbiAgICBpcGFkZHIuSVB2NC5zdWJuZXRNYXNrRnJvbVByZWZpeExlbmd0aCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgcHJlZml4ID0gcGFyc2VJbnQocHJlZml4KTtcbiAgICAgICAgaWYgKHByZWZpeCA8IDAgfHwgcHJlZml4ID4gMzIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBpbnZhbGlkIElQdjQgcHJlZml4IGxlbmd0aCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb2N0ZXRzID0gWzAsIDAsIDAsIDBdO1xuICAgICAgICBsZXQgaiA9IDA7XG4gICAgICAgIGNvbnN0IGZpbGxlZE9jdGV0Q291bnQgPSBNYXRoLmZsb29yKHByZWZpeCAvIDgpO1xuXG4gICAgICAgIHdoaWxlIChqIDwgZmlsbGVkT2N0ZXRDb3VudCkge1xuICAgICAgICAgICAgb2N0ZXRzW2pdID0gMjU1O1xuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGxlZE9jdGV0Q291bnQgPCA0KSB7XG4gICAgICAgICAgICBvY3RldHNbZmlsbGVkT2N0ZXRDb3VudF0gPSBNYXRoLnBvdygyLCBwcmVmaXggJSA4KSAtIDEgPDwgOCAtIChwcmVmaXggJSA4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhvY3RldHMpO1xuICAgIH07XG5cbiAgICAvLyBBbiBJUHY2IGFkZHJlc3MgKFJGQzI0NjApXG4gICAgaXBhZGRyLklQdjYgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBDb25zdHJ1Y3RzIGFuIElQdjYgYWRkcmVzcyBmcm9tIGFuIGFycmF5IG9mIGVpZ2h0IDE2IC0gYml0IHBhcnRzXG4gICAgICAgIC8vIG9yIHNpeHRlZW4gOCAtIGJpdCBwYXJ0cyBpbiBuZXR3b3JrIG9yZGVyKE1TQiBmaXJzdCkuXG4gICAgICAgIC8vIFRocm93cyBhbiBlcnJvciBpZiB0aGUgaW5wdXQgaXMgaW52YWxpZC5cbiAgICAgICAgZnVuY3Rpb24gSVB2NiAocGFydHMsIHpvbmVJZCkge1xuICAgICAgICAgICAgbGV0IGksIHBhcnQ7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0cyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gMTQ7IGkgKz0gMikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRzLnB1c2goKHBhcnRzW2ldIDw8IDgpIHwgcGFydHNbaSArIDFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzLmxlbmd0aCA9PT0gOCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydHMgPSBwYXJ0cztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGlwdjYgcGFydCBjb3VudCBzaG91bGQgYmUgOCBvciAxNicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBhcnQgPSB0aGlzLnBhcnRzW2ldO1xuICAgICAgICAgICAgICAgIGlmICghKCgwIDw9IHBhcnQgJiYgcGFydCA8PSAweGZmZmYpKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogaXB2NiBwYXJ0IHNob3VsZCBmaXQgaW4gMTYgYml0cycpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHpvbmVJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZUlkID0gem9uZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3BlY2lhbCBJUHY2IHJhbmdlc1xuICAgICAgICBJUHY2LnByb3RvdHlwZS5TcGVjaWFsUmFuZ2VzID0ge1xuICAgICAgICAgICAgLy8gUkZDNDI5MSwgaGVyZSBhbmQgYWZ0ZXJcbiAgICAgICAgICAgIHVuc3BlY2lmaWVkOiBbbmV3IElQdjYoWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKSwgMTI4XSxcbiAgICAgICAgICAgIGxpbmtMb2NhbDogW25ldyBJUHY2KFsweGZlODAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKSwgMTBdLFxuICAgICAgICAgICAgbXVsdGljYXN0OiBbbmV3IElQdjYoWzB4ZmYwMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0pLCA4XSxcbiAgICAgICAgICAgIGxvb3BiYWNrOiBbbmV3IElQdjYoWzAsIDAsIDAsIDAsIDAsIDAsIDAsIDFdKSwgMTI4XSxcbiAgICAgICAgICAgIHVuaXF1ZUxvY2FsOiBbbmV3IElQdjYoWzB4ZmMwMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF0pLCA3XSxcbiAgICAgICAgICAgIGlwdjRNYXBwZWQ6IFtuZXcgSVB2NihbMCwgMCwgMCwgMCwgMCwgMHhmZmZmLCAwLCAwXSksIDk2XSxcbiAgICAgICAgICAgIC8vIFJGQzYxNDVcbiAgICAgICAgICAgIHJmYzYxNDU6IFtuZXcgSVB2NihbMCwgMCwgMCwgMCwgMHhmZmZmLCAwLCAwLCAwXSksIDk2XSxcbiAgICAgICAgICAgIC8vIFJGQzYwNTJcbiAgICAgICAgICAgIHJmYzYwNTI6IFtuZXcgSVB2NihbMHg2NCwgMHhmZjliLCAwLCAwLCAwLCAwLCAwLCAwXSksIDk2XSxcbiAgICAgICAgICAgIC8vIFJGQzMwNTZcbiAgICAgICAgICAgICc2dG80JzogW25ldyBJUHY2KFsweDIwMDIsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKSwgMTZdLFxuICAgICAgICAgICAgLy8gUkZDNjA1MiwgUkZDNjE0NlxuICAgICAgICAgICAgdGVyZWRvOiBbbmV3IElQdjYoWzB4MjAwMSwgMCwgMCwgMCwgMCwgMCwgMCwgMF0pLCAzMl0sXG4gICAgICAgICAgICAvLyBSRkM0MjkxXG4gICAgICAgICAgICByZXNlcnZlZDogW1tuZXcgSVB2NihbMHgyMDAxLCAweGRiOCwgMCwgMCwgMCwgMCwgMCwgMF0pLCAzMl1dXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2hlY2tzIGlmIHRoaXMgYWRkcmVzcyBpcyBhbiBJUHY0LW1hcHBlZCBJUHY2IGFkZHJlc3MuXG4gICAgICAgIElQdjYucHJvdG90eXBlLmlzSVB2NE1hcHBlZEFkZHJlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yYW5nZSgpID09PSAnaXB2NE1hcHBlZCc7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVGhlICdraW5kJyBtZXRob2QgZXhpc3RzIG9uIGJvdGggSVB2NCBhbmQgSVB2NiBjbGFzc2VzLlxuICAgICAgICBJUHY2LnByb3RvdHlwZS5raW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICdpcHY2JztcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDaGVja3MgaWYgdGhpcyBhZGRyZXNzIG1hdGNoZXMgb3RoZXIgb25lIHdpdGhpbiBnaXZlbiBDSURSIHJhbmdlLlxuICAgICAgICBJUHY2LnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uIChvdGhlciwgY2lkclJhbmdlKSB7XG4gICAgICAgICAgICBsZXQgcmVmO1xuXG4gICAgICAgICAgICBpZiAoY2lkclJhbmdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZWYgPSBvdGhlcjtcbiAgICAgICAgICAgICAgICBvdGhlciA9IHJlZlswXTtcbiAgICAgICAgICAgICAgICBjaWRyUmFuZ2UgPSByZWZbMV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvdGhlci5raW5kKCkgIT09ICdpcHY2Jykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBjYW5ub3QgbWF0Y2ggaXB2NiBhZGRyZXNzIHdpdGggbm9uLWlwdjYgb25lJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtYXRjaENJRFIodGhpcy5wYXJ0cywgb3RoZXIucGFydHMsIDE2LCBjaWRyUmFuZ2UpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIHJldHVybnMgYSBudW1iZXIgb2YgbGVhZGluZyBvbmVzIGluIElQdjYgYWRkcmVzcywgbWFraW5nIHN1cmUgdGhhdFxuICAgICAgICAvLyB0aGUgcmVzdCBpcyBhIHNvbGlkIHNlcXVlbmNlIG9mIDAncyAodmFsaWQgbmV0bWFzaylcbiAgICAgICAgLy8gcmV0dXJucyBlaXRoZXIgdGhlIENJRFIgbGVuZ3RoIG9yIG51bGwgaWYgbWFzayBpcyBub3QgdmFsaWRcbiAgICAgICAgSVB2Ni5wcm90b3R5cGUucHJlZml4TGVuZ3RoRnJvbVN1Ym5ldE1hc2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgY2lkciA9IDA7XG4gICAgICAgICAgICAvLyBub24temVybyBlbmNvdW50ZXJlZCBzdG9wIHNjYW5uaW5nIGZvciB6ZXJvZXNcbiAgICAgICAgICAgIGxldCBzdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBudW1iZXIgb2YgemVyb2VzIGluIG9jdGV0XG4gICAgICAgICAgICBjb25zdCB6ZXJvdGFibGUgPSB7XG4gICAgICAgICAgICAgICAgMDogMTYsXG4gICAgICAgICAgICAgICAgMzI3Njg6IDE1LFxuICAgICAgICAgICAgICAgIDQ5MTUyOiAxNCxcbiAgICAgICAgICAgICAgICA1NzM0NDogMTMsXG4gICAgICAgICAgICAgICAgNjE0NDA6IDEyLFxuICAgICAgICAgICAgICAgIDYzNDg4OiAxMSxcbiAgICAgICAgICAgICAgICA2NDUxMjogMTAsXG4gICAgICAgICAgICAgICAgNjUwMjQ6IDksXG4gICAgICAgICAgICAgICAgNjUyODA6IDgsXG4gICAgICAgICAgICAgICAgNjU0MDg6IDcsXG4gICAgICAgICAgICAgICAgNjU0NzI6IDYsXG4gICAgICAgICAgICAgICAgNjU1MDQ6IDUsXG4gICAgICAgICAgICAgICAgNjU1MjA6IDQsXG4gICAgICAgICAgICAgICAgNjU1Mjg6IDMsXG4gICAgICAgICAgICAgICAgNjU1MzI6IDIsXG4gICAgICAgICAgICAgICAgNjU1MzQ6IDEsXG4gICAgICAgICAgICAgICAgNjU1MzU6IDBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgcGFydCwgemVyb3M7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSA3OyBpID49IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgICAgIHBhcnQgPSB0aGlzLnBhcnRzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChwYXJ0IGluIHplcm90YWJsZSkge1xuICAgICAgICAgICAgICAgICAgICB6ZXJvcyA9IHplcm90YWJsZVtwYXJ0XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3AgJiYgemVyb3MgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHplcm9zICE9PSAxNikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjaWRyICs9IHplcm9zO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDEyOCAtIGNpZHI7XG4gICAgICAgIH07XG5cblxuICAgICAgICAvLyBDaGVja3MgaWYgdGhlIGFkZHJlc3MgY29ycmVzcG9uZHMgdG8gb25lIG9mIHRoZSBzcGVjaWFsIHJhbmdlcy5cbiAgICAgICAgSVB2Ni5wcm90b3R5cGUucmFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBhZGRyLnN1Ym5ldE1hdGNoKHRoaXMsIHRoaXMuU3BlY2lhbFJhbmdlcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmV0dXJucyBhbiBhcnJheSBvZiBieXRlLXNpemVkIHZhbHVlcyBpbiBuZXR3b3JrIG9yZGVyIChNU0IgZmlyc3QpXG4gICAgICAgIElQdjYucHJvdG90eXBlLnRvQnl0ZUFycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHBhcnQ7XG4gICAgICAgICAgICBjb25zdCBieXRlcyA9IFtdO1xuICAgICAgICAgICAgY29uc3QgcmVmID0gdGhpcy5wYXJ0cztcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgcGFydCA9IHJlZltpXTtcbiAgICAgICAgICAgICAgICBieXRlcy5wdXNoKHBhcnQgPj4gOCk7XG4gICAgICAgICAgICAgICAgYnl0ZXMucHVzaChwYXJ0ICYgMHhmZik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBieXRlcztcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXR1cm5zIHRoZSBhZGRyZXNzIGluIGV4cGFuZGVkIGZvcm1hdCB3aXRoIGFsbCB6ZXJvZXMgaW5jbHVkZWQsIGxpa2VcbiAgICAgICAgLy8gMjAwMTowZGI4OjAwMDg6MDA2NjowMDAwOjAwMDA6MDAwMDowMDAxXG4gICAgICAgIElQdjYucHJvdG90eXBlLnRvRml4ZWRMZW5ndGhTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyID0gKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGFkUGFydCh0aGlzLnBhcnRzW2ldLnRvU3RyaW5nKDE2KSwgNCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSkuY2FsbCh0aGlzKSkuam9pbignOicpO1xuXG4gICAgICAgICAgICBsZXQgc3VmZml4ID0gJyc7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnpvbmVJZCkge1xuICAgICAgICAgICAgICAgIHN1ZmZpeCA9IGAlJHt0aGlzLnpvbmVJZH1gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYWRkciArIHN1ZmZpeDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb252ZXJ0cyB0aGlzIGFkZHJlc3MgdG8gSVB2NCBhZGRyZXNzIGlmIGl0IGlzIGFuIElQdjQtbWFwcGVkIElQdjYgYWRkcmVzcy5cbiAgICAgICAgLy8gVGhyb3dzIGFuIGVycm9yIG90aGVyd2lzZS5cbiAgICAgICAgSVB2Ni5wcm90b3R5cGUudG9JUHY0QWRkcmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0lQdjRNYXBwZWRBZGRyZXNzKCkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogdHJ5aW5nIHRvIGNvbnZlcnQgYSBnZW5lcmljIGlwdjYgYWRkcmVzcyB0byBpcHY0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRoaXMucGFydHMuc2xpY2UoLTIpO1xuICAgICAgICAgICAgY29uc3QgaGlnaCA9IHJlZlswXTtcbiAgICAgICAgICAgIGNvbnN0IGxvdyA9IHJlZlsxXTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBpcGFkZHIuSVB2NChbaGlnaCA+PiA4LCBoaWdoICYgMHhmZiwgbG93ID4+IDgsIGxvdyAmIDB4ZmZdKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXR1cm5zIHRoZSBhZGRyZXNzIGluIGV4cGFuZGVkIGZvcm1hdCB3aXRoIGFsbCB6ZXJvZXMgaW5jbHVkZWQsIGxpa2VcbiAgICAgICAgLy8gMjAwMTpkYjg6ODo2NjowOjA6MDoxXG4gICAgICAgIC8vXG4gICAgICAgIC8vIERlcHJlY2F0ZWQ6IHVzZSB0b0ZpeGVkTGVuZ3RoU3RyaW5nKCkgaW5zdGVhZC5cbiAgICAgICAgSVB2Ni5wcm90b3R5cGUudG9Ob3JtYWxpemVkU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgYWRkciA9ICgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy5wYXJ0c1tpXS50b1N0cmluZygxNikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSkuY2FsbCh0aGlzKSkuam9pbignOicpO1xuXG4gICAgICAgICAgICBsZXQgc3VmZml4ID0gJyc7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnpvbmVJZCkge1xuICAgICAgICAgICAgICAgIHN1ZmZpeCA9IGAlJHt0aGlzLnpvbmVJZH1gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYWRkciArIHN1ZmZpeDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXR1cm5zIHRoZSBhZGRyZXNzIGluIGNvbXBhY3QsIGh1bWFuLXJlYWRhYmxlIGZvcm1hdCBsaWtlXG4gICAgICAgIC8vIDIwMDE6ZGI4Ojg6NjY6OjFcbiAgICAgICAgLy8gaW4gbGluZSB3aXRoIFJGQyA1OTUyIChzZWUgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzU5NTIjc2VjdGlvbi00KVxuICAgICAgICBJUHY2LnByb3RvdHlwZS50b1JGQzU5NTJTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCByZWdleCA9IC8oKF58OikoMCg6fCQpKXsyLH0pL2c7XG4gICAgICAgICAgICBjb25zdCBzdHJpbmcgPSB0aGlzLnRvTm9ybWFsaXplZFN0cmluZygpO1xuICAgICAgICAgICAgbGV0IGJlc3RNYXRjaEluZGV4ID0gMDtcbiAgICAgICAgICAgIGxldCBiZXN0TWF0Y2hMZW5ndGggPSAtMTtcbiAgICAgICAgICAgIGxldCBtYXRjaDtcblxuICAgICAgICAgICAgd2hpbGUgKChtYXRjaCA9IHJlZ2V4LmV4ZWMoc3RyaW5nKSkpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hbMF0ubGVuZ3RoID4gYmVzdE1hdGNoTGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaEluZGV4ID0gbWF0Y2guaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGJlc3RNYXRjaExlbmd0aCA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChiZXN0TWF0Y2hMZW5ndGggPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGAke3N0cmluZy5zdWJzdHJpbmcoMCwgYmVzdE1hdGNoSW5kZXgpfTo6JHtzdHJpbmcuc3Vic3RyaW5nKGJlc3RNYXRjaEluZGV4ICsgYmVzdE1hdGNoTGVuZ3RoKX1gO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybnMgdGhlIGFkZHJlc3MgaW4gY29tcGFjdCwgaHVtYW4tcmVhZGFibGUgZm9ybWF0IGxpa2VcbiAgICAgICAgLy8gMjAwMTpkYjg6ODo2Njo6MVxuICAgICAgICAvL1xuICAgICAgICAvLyBEZXByZWNhdGVkOiB1c2UgdG9SRkM1OTUyU3RyaW5nKCkgaW5zdGVhZC5cbiAgICAgICAgSVB2Ni5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBmaXJzdCBzZXF1ZW5jZSBvZiAxIG9yIG1vcmUgJzAnIHBhcnRzIHdpdGggJzo6J1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9Ob3JtYWxpemVkU3RyaW5nKCkucmVwbGFjZSgvKChefDopKDAoOnwkKSkrKS8sICc6OicpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBJUHY2O1xuXG4gICAgfSkoKTtcblxuICAgIC8vIEEgdXRpbGl0eSBmdW5jdGlvbiB0byByZXR1cm4gYnJvYWRjYXN0IGFkZHJlc3MgZ2l2ZW4gdGhlIElQdjYgaW50ZXJmYWNlIGFuZCBwcmVmaXggbGVuZ3RoIGluIENJRFIgbm90YXRpb25cbiAgICBpcGFkZHIuSVB2Ni5icm9hZGNhc3RBZGRyZXNzRnJvbUNJRFIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBjaWRyID0gdGhpcy5wYXJzZUNJRFIoc3RyaW5nKTtcbiAgICAgICAgICAgIGNvbnN0IGlwSW50ZXJmYWNlT2N0ZXRzID0gY2lkclswXS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgY29uc3Qgc3VibmV0TWFza09jdGV0cyA9IHRoaXMuc3VibmV0TWFza0Zyb21QcmVmaXhMZW5ndGgoY2lkclsxXSkudG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGNvbnN0IG9jdGV0cyA9IFtdO1xuICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGkgPCAxNikge1xuICAgICAgICAgICAgICAgIC8vIEJyb2FkY2FzdCBhZGRyZXNzIGlzIGJpdHdpc2UgT1IgYmV0d2VlbiBpcCBpbnRlcmZhY2UgYW5kIGludmVydGVkIG1hc2tcbiAgICAgICAgICAgICAgICBvY3RldHMucHVzaChwYXJzZUludChpcEludGVyZmFjZU9jdGV0c1tpXSwgMTApIHwgcGFyc2VJbnQoc3VibmV0TWFza09jdGV0c1tpXSwgMTApIF4gMjU1KTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvY3RldHMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlwYWRkcjogdGhlIGFkZHJlc3MgZG9lcyBub3QgaGF2ZSBJUHY2IENJRFIgZm9ybWF0ICgke2V9KWApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENoZWNrcyBpZiBhIGdpdmVuIHN0cmluZyBpcyBmb3JtYXR0ZWQgbGlrZSBJUHY2IGFkZHJlc3MuXG4gICAgaXBhZGRyLklQdjYuaXNJUHY2ID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXJzZXIoc3RyaW5nKSAhPT0gbnVsbDtcbiAgICB9O1xuXG4gICAgLy8gQ2hlY2tzIHRvIHNlZSBpZiBzdHJpbmcgaXMgYSB2YWxpZCBJUHY2IEFkZHJlc3NcbiAgICBpcGFkZHIuSVB2Ni5pc1ZhbGlkID0gZnVuY3Rpb24gKHN0cmluZykge1xuXG4gICAgICAgIC8vIFNpbmNlIElQdjYuaXNWYWxpZCBpcyBhbHdheXMgY2FsbGVkIGZpcnN0LCB0aGlzIHNob3J0Y3V0XG4gICAgICAgIC8vIHByb3ZpZGVzIGEgc3Vic3RhbnRpYWwgcGVyZm9ybWFuY2UgZ2Fpbi5cbiAgICAgICAgaWYgKHR5cGVvZiBzdHJpbmcgPT09ICdzdHJpbmcnICYmIHN0cmluZy5pbmRleE9mKCc6JykgPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYWRkciA9IHRoaXMucGFyc2VyKHN0cmluZyk7XG4gICAgICAgICAgICBuZXcgdGhpcyhhZGRyLnBhcnRzLCBhZGRyLnpvbmVJZCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEEgdXRpbGl0eSBmdW5jdGlvbiB0byByZXR1cm4gbmV0d29yayBhZGRyZXNzIGdpdmVuIHRoZSBJUHY2IGludGVyZmFjZSBhbmQgcHJlZml4IGxlbmd0aCBpbiBDSURSIG5vdGF0aW9uXG4gICAgaXBhZGRyLklQdjYubmV0d29ya0FkZHJlc3NGcm9tQ0lEUiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgbGV0IGNpZHIsIGksIGlwSW50ZXJmYWNlT2N0ZXRzLCBvY3RldHMsIHN1Ym5ldE1hc2tPY3RldHM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNpZHIgPSB0aGlzLnBhcnNlQ0lEUihzdHJpbmcpO1xuICAgICAgICAgICAgaXBJbnRlcmZhY2VPY3RldHMgPSBjaWRyWzBdLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBzdWJuZXRNYXNrT2N0ZXRzID0gdGhpcy5zdWJuZXRNYXNrRnJvbVByZWZpeExlbmd0aChjaWRyWzFdKS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgb2N0ZXRzID0gW107XG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpIDwgMTYpIHtcbiAgICAgICAgICAgICAgICAvLyBOZXR3b3JrIGFkZHJlc3MgaXMgYml0d2lzZSBBTkQgYmV0d2VlbiBpcCBpbnRlcmZhY2UgYW5kIG1hc2tcbiAgICAgICAgICAgICAgICBvY3RldHMucHVzaChwYXJzZUludChpcEludGVyZmFjZU9jdGV0c1tpXSwgMTApICYgcGFyc2VJbnQoc3VibmV0TWFza09jdGV0c1tpXSwgMTApKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvY3RldHMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGlwYWRkcjogdGhlIGFkZHJlc3MgZG9lcyBub3QgaGF2ZSBJUHY2IENJRFIgZm9ybWF0ICgke2V9KWApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRyaWVzIHRvIHBhcnNlIGFuZCB2YWxpZGF0ZSBhIHN0cmluZyB3aXRoIElQdjYgYWRkcmVzcy5cbiAgICAvLyBUaHJvd3MgYW4gZXJyb3IgaWYgaXQgZmFpbHMuXG4gICAgaXBhZGRyLklQdjYucGFyc2UgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGFkZHIgPSB0aGlzLnBhcnNlcihzdHJpbmcpO1xuXG4gICAgICAgIGlmIChhZGRyLnBhcnRzID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogc3RyaW5nIGlzIG5vdCBmb3JtYXR0ZWQgbGlrZSBhbiBJUHY2IEFkZHJlc3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhhZGRyLnBhcnRzLCBhZGRyLnpvbmVJZCk7XG4gICAgfTtcblxuICAgIGlwYWRkci5JUHY2LnBhcnNlQ0lEUiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgbGV0IG1hc2tMZW5ndGgsIG1hdGNoLCBwYXJzZWQ7XG5cbiAgICAgICAgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaCgvXiguKylcXC8oXFxkKykkLykpKSB7XG4gICAgICAgICAgICBtYXNrTGVuZ3RoID0gcGFyc2VJbnQobWF0Y2hbMl0pO1xuICAgICAgICAgICAgaWYgKG1hc2tMZW5ndGggPj0gMCAmJiBtYXNrTGVuZ3RoIDw9IDEyOCkge1xuICAgICAgICAgICAgICAgIHBhcnNlZCA9IFt0aGlzLnBhcnNlKG1hdGNoWzFdKSwgbWFza0xlbmd0aF07XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcnNlZCwgJ3RvU3RyaW5nJywge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuam9pbignLycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBzdHJpbmcgaXMgbm90IGZvcm1hdHRlZCBsaWtlIGFuIElQdjYgQ0lEUiByYW5nZScpO1xuICAgIH07XG5cbiAgICAvLyBQYXJzZSBhbiBJUHY2IGFkZHJlc3MuXG4gICAgaXBhZGRyLklQdjYucGFyc2VyID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBsZXQgYWRkciwgaSwgbWF0Y2gsIG9jdGV0LCBvY3RldHMsIHpvbmVJZDtcblxuICAgICAgICBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKGlwdjZSZWdleGVzLmRlcHJlY2F0ZWRUcmFuc2l0aW9uYWwpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VyKGA6OmZmZmY6JHttYXRjaFsxXX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXB2NlJlZ2V4ZXMubmF0aXZlLnRlc3Qoc3RyaW5nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGV4cGFuZElQdjYoc3RyaW5nLCA4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKG1hdGNoID0gc3RyaW5nLm1hdGNoKGlwdjZSZWdleGVzLnRyYW5zaXRpb25hbCkpKSB7XG4gICAgICAgICAgICB6b25lSWQgPSBtYXRjaFs2XSB8fCAnJztcbiAgICAgICAgICAgIGFkZHIgPSBleHBhbmRJUHY2KG1hdGNoWzFdLnNsaWNlKDAsIC0xKSArIHpvbmVJZCwgNik7XG4gICAgICAgICAgICBpZiAoYWRkci5wYXJ0cykge1xuICAgICAgICAgICAgICAgIG9jdGV0cyA9IFtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2hbMl0pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoWzRdKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2hbNV0pXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2N0ZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIG9jdGV0ID0gb2N0ZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoISgoMCA8PSBvY3RldCAmJiBvY3RldCA8PSAyNTUpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBhZGRyLnBhcnRzLnB1c2gob2N0ZXRzWzBdIDw8IDggfCBvY3RldHNbMV0pO1xuICAgICAgICAgICAgICAgIGFkZHIucGFydHMucHVzaChvY3RldHNbMl0gPDwgOCB8IG9jdGV0c1szXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydHM6IGFkZHIucGFydHMsXG4gICAgICAgICAgICAgICAgICAgIHpvbmVJZDogYWRkci56b25lSWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIC8vIEEgdXRpbGl0eSBmdW5jdGlvbiB0byByZXR1cm4gc3VibmV0IG1hc2sgaW4gSVB2NiBmb3JtYXQgZ2l2ZW4gdGhlIHByZWZpeCBsZW5ndGhcbiAgICBpcGFkZHIuSVB2Ni5zdWJuZXRNYXNrRnJvbVByZWZpeExlbmd0aCA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgcHJlZml4ID0gcGFyc2VJbnQocHJlZml4KTtcbiAgICAgICAgaWYgKHByZWZpeCA8IDAgfHwgcHJlZml4ID4gMTI4KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogaW52YWxpZCBJUHY2IHByZWZpeCBsZW5ndGgnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9jdGV0cyA9IFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXTtcbiAgICAgICAgbGV0IGogPSAwO1xuICAgICAgICBjb25zdCBmaWxsZWRPY3RldENvdW50ID0gTWF0aC5mbG9vcihwcmVmaXggLyA4KTtcblxuICAgICAgICB3aGlsZSAoaiA8IGZpbGxlZE9jdGV0Q291bnQpIHtcbiAgICAgICAgICAgIG9jdGV0c1tqXSA9IDI1NTtcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxsZWRPY3RldENvdW50IDwgMTYpIHtcbiAgICAgICAgICAgIG9jdGV0c1tmaWxsZWRPY3RldENvdW50XSA9IE1hdGgucG93KDIsIHByZWZpeCAlIDgpIC0gMSA8PCA4IC0gKHByZWZpeCAlIDgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzKG9jdGV0cyk7XG4gICAgfTtcblxuICAgIC8vIFRyeSB0byBwYXJzZSBhbiBhcnJheSBpbiBuZXR3b3JrIG9yZGVyIChNU0IgZmlyc3QpIGZvciBJUHY0IGFuZCBJUHY2XG4gICAgaXBhZGRyLmZyb21CeXRlQXJyYXkgPSBmdW5jdGlvbiAoYnl0ZXMpIHtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gYnl0ZXMubGVuZ3RoO1xuXG4gICAgICAgIGlmIChsZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgaXBhZGRyLklQdjQoYnl0ZXMpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gMTYpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgaXBhZGRyLklQdjYoYnl0ZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHRoZSBiaW5hcnkgaW5wdXQgaXMgbmVpdGhlciBhbiBJUHY2IG5vciBJUHY0IGFkZHJlc3MnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDaGVja3MgaWYgdGhlIGFkZHJlc3MgaXMgdmFsaWQgSVAgYWRkcmVzc1xuICAgIGlwYWRkci5pc1ZhbGlkID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICByZXR1cm4gaXBhZGRyLklQdjYuaXNWYWxpZChzdHJpbmcpIHx8IGlwYWRkci5JUHY0LmlzVmFsaWQoc3RyaW5nKTtcbiAgICB9O1xuXG5cbiAgICAvLyBBdHRlbXB0cyB0byBwYXJzZSBhbiBJUCBBZGRyZXNzLCBmaXJzdCB0aHJvdWdoIElQdjYgdGhlbiBJUHY0LlxuICAgIC8vIFRocm93cyBhbiBlcnJvciBpZiBpdCBjb3VsZCBub3QgYmUgcGFyc2VkLlxuICAgIGlwYWRkci5wYXJzZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgaWYgKGlwYWRkci5JUHY2LmlzVmFsaWQoc3RyaW5nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlwYWRkci5JUHY2LnBhcnNlKHN0cmluZyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXBhZGRyLklQdjQuaXNWYWxpZChzdHJpbmcpKSB7XG4gICAgICAgICAgICByZXR1cm4gaXBhZGRyLklQdjQucGFyc2Uoc3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiB0aGUgYWRkcmVzcyBoYXMgbmVpdGhlciBJUHY2IG5vciBJUHY0IGZvcm1hdCcpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEF0dGVtcHQgdG8gcGFyc2UgQ0lEUiBub3RhdGlvbiwgZmlyc3QgdGhyb3VnaCBJUHY2IHRoZW4gSVB2NC5cbiAgICAvLyBUaHJvd3MgYW4gZXJyb3IgaWYgaXQgY291bGQgbm90IGJlIHBhcnNlZC5cbiAgICBpcGFkZHIucGFyc2VDSURSID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGlwYWRkci5JUHY2LnBhcnNlQ0lEUihzdHJpbmcpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpcGFkZHIuSVB2NC5wYXJzZUNJRFIoc3RyaW5nKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUyKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHRoZSBhZGRyZXNzIGhhcyBuZWl0aGVyIElQdjYgbm9yIElQdjQgQ0lEUiBmb3JtYXQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBQYXJzZSBhbiBhZGRyZXNzIGFuZCByZXR1cm4gcGxhaW4gSVB2NCBhZGRyZXNzIGlmIGl0IGlzIGFuIElQdjQtbWFwcGVkIGFkZHJlc3NcbiAgICBpcGFkZHIucHJvY2VzcyA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgYWRkciA9IHRoaXMucGFyc2Uoc3RyaW5nKTtcblxuICAgICAgICBpZiAoYWRkci5raW5kKCkgPT09ICdpcHY2JyAmJiBhZGRyLmlzSVB2NE1hcHBlZEFkZHJlc3MoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGFkZHIudG9JUHY0QWRkcmVzcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGFkZHI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQW4gdXRpbGl0eSBmdW5jdGlvbiB0byBlYXNlIG5hbWVkIHJhbmdlIG1hdGNoaW5nLiBTZWUgZXhhbXBsZXMgYmVsb3cuXG4gICAgLy8gcmFuZ2VMaXN0IGNhbiBjb250YWluIGJvdGggSVB2NCBhbmQgSVB2NiBzdWJuZXQgZW50cmllcyBhbmQgd2lsbCBub3QgdGhyb3cgZXJyb3JzXG4gICAgLy8gb24gbWF0Y2hpbmcgSVB2NCBhZGRyZXNzZXMgdG8gSVB2NiByYW5nZXMgb3IgdmljZSB2ZXJzYS5cbiAgICBpcGFkZHIuc3VibmV0TWF0Y2ggPSBmdW5jdGlvbiAoYWRkcmVzcywgcmFuZ2VMaXN0LCBkZWZhdWx0TmFtZSkge1xuICAgICAgICBsZXQgaSwgcmFuZ2VOYW1lLCByYW5nZVN1Ym5ldHMsIHN1Ym5ldDtcblxuICAgICAgICBpZiAoZGVmYXVsdE5hbWUgPT09IHVuZGVmaW5lZCB8fCBkZWZhdWx0TmFtZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgZGVmYXVsdE5hbWUgPSAndW5pY2FzdCc7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHJhbmdlTmFtZSBpbiByYW5nZUxpc3QpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmFuZ2VMaXN0LCByYW5nZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdWJuZXRzID0gcmFuZ2VMaXN0W3JhbmdlTmFtZV07XG4gICAgICAgICAgICAgICAgLy8gRUNNQTUgQXJyYXkuaXNBcnJheSBpc24ndCBhdmFpbGFibGUgZXZlcnl3aGVyZVxuICAgICAgICAgICAgICAgIGlmIChyYW5nZVN1Ym5ldHNbMF0gJiYgIShyYW5nZVN1Ym5ldHNbMF0gaW5zdGFuY2VvZiBBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2VTdWJuZXRzID0gW3JhbmdlU3VibmV0c107XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHJhbmdlU3VibmV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBzdWJuZXQgPSByYW5nZVN1Ym5ldHNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzLmtpbmQoKSA9PT0gc3VibmV0WzBdLmtpbmQoKSAmJiBhZGRyZXNzLm1hdGNoLmFwcGx5KGFkZHJlc3MsIHN1Ym5ldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByYW5nZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmYXVsdE5hbWU7XG4gICAgfTtcblxuICAgIC8vIEV4cG9ydCBmb3IgYm90aCB0aGUgQ29tbW9uSlMgYW5kIGJyb3dzZXItbGlrZSBlbnZpcm9ubWVudFxuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGlwYWRkcjtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QuaXBhZGRyID0gaXBhZGRyO1xuICAgIH1cblxufSh0aGlzKSk7XG4iXX0=
