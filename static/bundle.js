(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
function allocate_ips(starting_ip, starting_ip_subnet_mask, num_hosts_list) {
    networks_available = [{ip: starting_ip,
			   subnet_mask: starting_ip_subnet_mask}]
    allocated_networks = []
    while ((num_hosts_list.length !== 0) && (networks_available.length !== 0)) {
	subnet_size = num_hosts_list.pop() + 2 // add broadcast/network address
	// first find the next largest power of two that fits.
	// so, log_2()
	target_subnet_size = Math.pow(2, Math.ceil(Math.log2(subnet_size)))
	console.log("subnet_size: " + subnet_size + "target_subnet_size: " + target_subnet_size)
    }
    if (is_empty(networks_available) && !is_empty(num_hosts_list)) {
	console.log("not enough networks available")
    }
    return allocated_networks
}

function allocate_ip_test() {
    allocate_ips("192.168.1.0", "255.255.255.0", [63, 62, 100])
}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmb3JjZS5qcyIsIm5vZGVfbW9kdWxlcy9pcGFkZHIuanMvbGliL2lwYWRkci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ2YXIgd2lkdGggPSA5NjAsXG4gICAgaGVpZ2h0ID0gNTAwLFxuICAgIHNlbGVjdGVkX25vZGUsIHNlbGVjdGVkX3RhcmdldF9ub2RlLFxuICAgIHNlbGVjdGVkX2xpbmssIG5ld19saW5lLFxuICAgIGNpcmNsZXNnLCBsaW5lc2csXG4gICAgc2hvdWxkX2RyYWcgPSBmYWxzZSxcbiAgICBkcmF3aW5nX2xpbmUgPSBmYWxzZSxcbiAgICBub2RlcyA9IFtdLFxuICAgIGxpbmtzID0gW10sXG4gICAgbGlua19kaXN0YW5jZSA9IDkwO1xuXG52YXIgZGVmYXVsdF9uYW1lID0gXCJuZXcgbm9kZVwiXG5cbnZhciBmb3JjZSA9IGQzLmxheW91dC5mb3JjZSgpXG4gICAgLmNoYXJnZSgtMzQwKVxuICAgIC5saW5rRGlzdGFuY2UobGlua19kaXN0YW5jZSlcbiAgICAuc2l6ZShbd2lkdGgsIGhlaWdodF0pO1xuXG52YXIgc3ZnID0gZDMuc2VsZWN0KFwiI2NoYXJ0XCIpLmFwcGVuZChcInN2Z1wiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuZDMuc2VsZWN0KHdpbmRvdylcbiAgICAub24oXCJtb3VzZW1vdmVcIiwgbW91c2Vtb3ZlKVxuICAgIC5vbihcIm1vdXNldXBcIiwgbW91c2V1cClcbiAgICAub24oXCJrZXlkb3duXCIsIGtleWRvd24pXG4gICAgLm9uKFwia2V5dXBcIiwga2V5dXApO1xuXG5zdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgIC5vbihcIm1vdXNlZG93blwiLCBtb3VzZWRvd24pO1xuXG4vLyBBcnJvdyBtYXJrZXJcbnN2Zy5hcHBlbmQoXCJzdmc6ZGVmc1wiKS5zZWxlY3RBbGwoXCJtYXJrZXJcIilcbiAgLmRhdGEoW1wiY2hpbGRcIl0pXG4gIC5lbnRlcigpLmFwcGVuZChcInN2ZzptYXJrZXJcIilcbiAgLmF0dHIoXCJpZFwiLCBTdHJpbmcpXG4gIC5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKVxuICAuYXR0cihcInZpZXdCb3hcIiwgXCIwIC01IDEwIDEwXCIpXG4gIC5hdHRyKFwicmVmWFwiLCBsaW5rX2Rpc3RhbmNlKVxuICAuYXR0cihcInJlZllcIiwgLTEuMSlcbiAgLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMClcbiAgLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTApXG4gIC5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKVxuICAuYXBwZW5kKFwic3ZnOnBhdGhcIilcbiAgLmF0dHIoXCJkXCIsIFwiTTAsLTVMMTAsMEwwLDVcIik7XG5cblxubGluZXNnID0gc3ZnLmFwcGVuZChcImdcIik7XG5jaXJjbGVzZyA9IHN2Zy5hcHBlbmQoXCJnXCIpO1xuXG5pbml0aWFsX2pzb24gPSB7XCJub2Rlc1wiOlt7XCJuYW1lXCI6XCJNeXJpZWxcIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiTmFwb2xlb25cIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiTWxsZS5CYXB0aXN0aW5lXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIk1tZS5NYWdsb2lyZVwiLFwiZ3JvdXBcIjoxfSx7XCJuYW1lXCI6XCJDb3VudGVzc2RlTG9cIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiR2Vib3JhbmRcIixcImdyb3VwXCI6MX0se1wibmFtZVwiOlwiQ2hhbXB0ZXJjaWVyXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIkNyYXZhdHRlXCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIkNvdW50XCIsXCJncm91cFwiOjF9LHtcIm5hbWVcIjpcIk9sZE1hblwiLFwiZ3JvdXBcIjoxfV0sXCJsaW5rc1wiOlt7XCJzb3VyY2VcIjowLFwidGFyZ2V0XCI6MSxcInZhbHVlXCI6MX0se1wic291cmNlXCI6MSxcInRhcmdldFwiOjIsXCJ2YWx1ZVwiOjh9LHtcInNvdXJjZVwiOjEsXCJ0YXJnZXRcIjozLFwidmFsdWVcIjoxMH0se1wic291cmNlXCI6MyxcInRhcmdldFwiOjQsXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjMsXCJ0YXJnZXRcIjo1LFwidmFsdWVcIjoxfSx7XCJzb3VyY2VcIjo0LFwidGFyZ2V0XCI6NixcInZhbHVlXCI6MX0se1wic291cmNlXCI6NixcInRhcmdldFwiOjcsXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjEsXCJ0YXJnZXRcIjo0LFwidmFsdWVcIjoyfSx7XCJzb3VyY2VcIjo3LFwidGFyZ2V0XCI6OCxcInZhbHVlXCI6MX0se1wic291cmNlXCI6OCxcInRhcmdldFwiOjksXCJ2YWx1ZVwiOjF9LHtcInNvdXJjZVwiOjEsXCJ0YXJnZXRcIjo5LFwidmFsdWVcIjoxfSx7XCJzb3VyY2VcIjozLFwidGFyZ2V0XCI6OSxcInZhbHVlXCI6MX1dfVxuXG5mdW5jdGlvbiBkb19pbml0X25vZGVzKGpzb24pIHtcbiAgICAvLyBkZWNvcmF0ZSBhIG5vZGUgd2l0aCBhIGNvdW50IG9mIGl0cyBjaGlsZHJlblxuICBub2RlcyA9IGpzb24ubm9kZXM7XG4gIGxpbmtzID0ganNvbi5saW5rcztcbiAgdXBkYXRlKCk7XG4gIGZvcmNlID0gZm9yY2Vcblx0Lm5vZGVzKG5vZGVzKVxuXHQubGlua3MobGlua3MpO1xuICBjb25zb2xlLmxvZyhcInN0YXJ0ZWRcIilcbiAgZm9yY2Uuc3RhcnQoKTtcbn1cbmRvX2luaXRfbm9kZXMoaW5pdGlhbF9qc29uKTtcblxuZnVuY3Rpb24gaXNfZW1wdHkobGlzdCkge1xuICAgIHJldHVybiBsaXN0Lmxlbmd0aCA9PT0gMFxufVxuXG52YXIgaXBhZGRyID0gcmVxdWlyZShcImlwYWRkci5qc1wiKVxuXG5jb25zb2xlLmxvZyhpcGFkZHIpXG5cbi8vIG1heWJlIGhhdmUgaXQgYmUgbGlrZSB0aGlzLiBIYXZlIGF2YWlsYWJsZSBuZXR3b3Jrcy5cbi8vIHRoZW4gd2UgY2FuIGRpdmlkZSBpdCBieSB0d28uXG4vLyBBbHdheXMgZGl2aWRlIHVudGlsIHdlIGdldCB0byB0aGUgc21hbGxlc3Qgb25lIGJlZm9yZSB3ZVxuLy8gcnVuIG91dC4gSSB0aGluayB0aGF0J3MgcHJldHR5IGdvb2QuIFxuZnVuY3Rpb24gYWxsb2NhdGVfaXBzKHN0YXJ0aW5nX2lwLCBzdGFydGluZ19pcF9zdWJuZXRfbWFzaywgbnVtX2hvc3RzX2xpc3QpIHtcbiAgICBuZXR3b3Jrc19hdmFpbGFibGUgPSBbe2lwOiBzdGFydGluZ19pcCxcblx0XHRcdCAgIHN1Ym5ldF9tYXNrOiBzdGFydGluZ19pcF9zdWJuZXRfbWFza31dXG4gICAgYWxsb2NhdGVkX25ldHdvcmtzID0gW11cbiAgICB3aGlsZSAoKG51bV9ob3N0c19saXN0Lmxlbmd0aCAhPT0gMCkgJiYgKG5ldHdvcmtzX2F2YWlsYWJsZS5sZW5ndGggIT09IDApKSB7XG5cdHN1Ym5ldF9zaXplID0gbnVtX2hvc3RzX2xpc3QucG9wKCkgKyAyIC8vIGFkZCBicm9hZGNhc3QvbmV0d29yayBhZGRyZXNzXG5cdC8vIGZpcnN0IGZpbmQgdGhlIG5leHQgbGFyZ2VzdCBwb3dlciBvZiB0d28gdGhhdCBmaXRzLlxuXHQvLyBzbywgbG9nXzIoKVxuXHR0YXJnZXRfc3VibmV0X3NpemUgPSBNYXRoLnBvdygyLCBNYXRoLmNlaWwoTWF0aC5sb2cyKHN1Ym5ldF9zaXplKSkpXG5cdGNvbnNvbGUubG9nKFwic3VibmV0X3NpemU6IFwiICsgc3VibmV0X3NpemUgKyBcInRhcmdldF9zdWJuZXRfc2l6ZTogXCIgKyB0YXJnZXRfc3VibmV0X3NpemUpXG4gICAgfVxuICAgIGlmIChpc19lbXB0eShuZXR3b3Jrc19hdmFpbGFibGUpICYmICFpc19lbXB0eShudW1faG9zdHNfbGlzdCkpIHtcblx0Y29uc29sZS5sb2coXCJub3QgZW5vdWdoIG5ldHdvcmtzIGF2YWlsYWJsZVwiKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NhdGVkX25ldHdvcmtzXG59XG5cbmZ1bmN0aW9uIGFsbG9jYXRlX2lwX3Rlc3QoKSB7XG4gICAgYWxsb2NhdGVfaXBzKFwiMTkyLjE2OC4xLjBcIiwgXCIyNTUuMjU1LjI1NS4wXCIsIFs2MywgNjIsIDEwMF0pXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgdmFyIGxpbmsgPSBsaW5lc2cuc2VsZWN0QWxsKFwibGluZS5saW5rXCIpXG4gICAgICAuZGF0YShsaW5rcylcbiAgICAgIC5hdHRyKFwieDFcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueDsgfSlcbiAgICAgIC5hdHRyKFwieTFcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueTsgfSlcbiAgICAgIC5hdHRyKFwieDJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueDsgfSlcbiAgICAgIC5hdHRyKFwieTJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueTsgfSlcbiAgICAgIC5jbGFzc2VkKFwic2VsZWN0ZWRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZCA9PT0gc2VsZWN0ZWRfbGluazsgfSk7XG4gIGxpbmsuZW50ZXIoKS5hcHBlbmQoXCJsaW5lXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmtcIilcbiAgICAuYXR0cihcIm1hcmtlci1lbmRcIiwgXCJ1cmwoI2NoaWxkKVwiKVxuICAgIC5vbihcIm1vdXNlZG93blwiLCBsaW5lX21vdXNlZG93bik7XG4gIGxpbmsuZXhpdCgpLnJlbW92ZSgpO1xuXG4gIHZhciBub2RlID0gY2lyY2xlc2cuc2VsZWN0QWxsKFwiLm5vZGVcIilcbiAgICAuZGF0YShub2RlcywgZnVuY3Rpb24oZCkge3JldHVybiBkLm5hbWU7fSlcbiAgICAuY2xhc3NlZChcInNlbGVjdGVkXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQgPT09IHNlbGVjdGVkX25vZGU7IH0pXG4gICAgLmNsYXNzZWQoXCJzZWxlY3RlZF90YXJnZXRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZCA9PT0gc2VsZWN0ZWRfdGFyZ2V0X25vZGU7IH0pXG4gIHZhciBub2RlZyA9IG5vZGUuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGVcIikuY2FsbChmb3JjZS5kcmFnKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIGQueCArIFwiLFwiICsgZC55ICsgXCIpXCI7XG4gICAgfSk7XG4gIG5vZGVnLmFwcGVuZChcImNpcmNsZVwiKVxuICAgIC5hdHRyKFwiclwiLCAxMClcbiAgICAub24oXCJtb3VzZWRvd25cIiwgbm9kZV9tb3VzZWRvd24pXG4gICAgLm9uKFwibW91c2VvdmVyXCIsIG5vZGVfbW91c2VvdmVyKVxuICAgIC5vbihcIm1vdXNlb3V0XCIsIG5vZGVfbW91c2VvdXQpO1xuICBub2RlZ1xuICAgIC5hcHBlbmQoXCJzdmc6YVwiKVxuICAgIC5hdHRyKFwieGxpbms6aHJlZlwiLCBmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC51cmwgfHwgJyMnOyB9KVxuICAgIC5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgLmF0dHIoXCJkeFwiLCAxMilcbiAgICAuYXR0cihcImR5XCIsIFwiLjM1ZW1cIilcbiAgICAudGV4dChmdW5jdGlvbihkKSB7cmV0dXJuIGQubmFtZX0pO1xuICBub2RlLmV4aXQoKS5yZW1vdmUoKTtcblxuICBmb3JjZS5vbihcInRpY2tcIiwgZnVuY3Rpb24oZSkge1xuICAgIGxpbmsuYXR0cihcIngxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLng7IH0pXG4gICAgICAgIC5hdHRyKFwieTFcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueTsgfSlcbiAgICAgICAgLmF0dHIoXCJ4MlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC54OyB9KVxuICAgICAgICAuYXR0cihcInkyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lnk7IH0pO1xuICAgIG5vZGUuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIGQueCArIFwiLFwiICsgZC55ICsgXCIpXCI7IH0pO1xuICB9KTtcbn1cblxuLy8gc2VsZWN0IHRhcmdldCBub2RlIGZvciBuZXcgbm9kZSBjb25uZWN0aW9uXG5mdW5jdGlvbiBub2RlX21vdXNlb3ZlcihkKSB7XG4gIGlmIChkcmF3aW5nX2xpbmUgJiYgZCAhPT0gc2VsZWN0ZWRfbm9kZSkge1xuICAgIC8vIGhpZ2hsaWdodCBhbmQgc2VsZWN0IHRhcmdldCBub2RlXG4gICAgc2VsZWN0ZWRfdGFyZ2V0X25vZGUgPSBkO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vZGVfbW91c2VvdXQoZCkge1xuICBpZiAoZHJhd2luZ19saW5lKSB7XG4gICAgc2VsZWN0ZWRfdGFyZ2V0X25vZGUgPSBudWxsO1xuICB9XG59XG5cbi8vIHNlbGVjdCBub2RlIC8gc3RhcnQgZHJhZ1xuZnVuY3Rpb24gbm9kZV9tb3VzZWRvd24oZCkge1xuICBpZiAoIWRyYXdpbmdfbGluZSkge1xuICAgIHNlbGVjdGVkX25vZGUgPSBkO1xuICAgIHNlbGVjdGVkX2xpbmsgPSBudWxsO1xuICB9XG4gIGlmICghc2hvdWxkX2RyYWcpIHtcbiAgICBkMy5ldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBkcmF3aW5nX2xpbmUgPSB0cnVlO1xuICB9XG4gIGQuZml4ZWQgPSB0cnVlO1xuICBmb3JjZS5zdG9wKClcbiAgdXBkYXRlKCk7XG59XG5cbi8vIHNlbGVjdCBsaW5lXG5mdW5jdGlvbiBsaW5lX21vdXNlZG93bihkKSB7XG4gIHNlbGVjdGVkX2xpbmsgPSBkO1xuICBzZWxlY3RlZF9ub2RlID0gbnVsbDtcbiAgdXBkYXRlKCk7XG59XG5cbi8vIGRyYXcgeWVsbG93IFwibmV3IGNvbm5lY3RvclwiIGxpbmVcbmZ1bmN0aW9uIG1vdXNlbW92ZSgpIHtcbiAgaWYgKGRyYXdpbmdfbGluZSAmJiAhc2hvdWxkX2RyYWcpIHtcbiAgICB2YXIgbSA9IGQzLm1vdXNlKHN2Zy5ub2RlKCkpO1xuICAgIHZhciB4ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4od2lkdGgsIG1bMF0pKTtcbiAgICB2YXIgeSA9IE1hdGgubWF4KDAsIE1hdGgubWluKGhlaWdodCwgbVsxXSkpO1xuICAgIC8vIGRlYm91bmNlIC0gb25seSBzdGFydCBkcmF3aW5nIGxpbmUgaWYgaXQgZ2V0cyBhIGJpdCBiaWdcbiAgICB2YXIgZHggPSBzZWxlY3RlZF9ub2RlLnggLSB4O1xuICAgIHZhciBkeSA9IHNlbGVjdGVkX25vZGUueSAtIHk7XG4gICAgaWYgKE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSkgPiAxMCkge1xuICAgICAgLy8gZHJhdyBhIGxpbmVcbiAgICAgIGlmICghbmV3X2xpbmUpIHtcbiAgICAgICAgbmV3X2xpbmUgPSBsaW5lc2cuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJuZXdfbGluZVwiKTtcbiAgICAgIH1cbiAgICAgIG5ld19saW5lLmF0dHIoXCJ4MVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBzZWxlY3RlZF9ub2RlLng7IH0pXG4gICAgICAgIC5hdHRyKFwieTFcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gc2VsZWN0ZWRfbm9kZS55OyB9KVxuICAgICAgICAuYXR0cihcIngyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHg7IH0pXG4gICAgICAgIC5hdHRyKFwieTJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4geTsgfSk7XG4gICAgfVxuICB9XG4gIHVwZGF0ZSgpO1xufVxuXG4vLyBhZGQgYSBuZXcgZGlzY29ubmVjdGVkIG5vZGVcbmZ1bmN0aW9uIG1vdXNlZG93bigpIHtcbiAgbSA9IGQzLm1vdXNlKHN2Zy5ub2RlKCkpXG4gIG5vZGVzLnB1c2goe3g6IG1bMF0sIHk6IG1bMV0sIG5hbWU6IGRlZmF1bHRfbmFtZSArIFwiIFwiICsgbm9kZXMubGVuZ3RoLCBncm91cDogMX0pO1xuICBzZWxlY3RlZF9saW5rID0gbnVsbDtcbiAgZm9yY2Uuc3RvcCgpO1xuICB1cGRhdGUoKTtcbiAgZm9yY2Uuc3RhcnQoKTtcbn1cblxuLy8gZW5kIG5vZGUgc2VsZWN0IC8gYWRkIG5ldyBjb25uZWN0ZWQgbm9kZVxuZnVuY3Rpb24gbW91c2V1cCgpIHtcbiAgZHJhd2luZ19saW5lID0gZmFsc2U7XG4gIGlmIChuZXdfbGluZSkge1xuICAgIGlmIChzZWxlY3RlZF90YXJnZXRfbm9kZSkge1xuICAgICAgc2VsZWN0ZWRfdGFyZ2V0X25vZGUuZml4ZWQgPSBmYWxzZTtcbiAgICAgIHZhciBuZXdfbm9kZSA9IHNlbGVjdGVkX3RhcmdldF9ub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbSA9IGQzLm1vdXNlKHN2Zy5ub2RlKCkpO1xuICAgICAgdmFyIG5ld19ub2RlID0ge3g6IG1bMF0sIHk6IG1bMV0sIG5hbWU6IGRlZmF1bHRfbmFtZSArIFwiIFwiICsgbm9kZXMubGVuZ3RoLCBncm91cDogMX1cbiAgICAgIG5vZGVzLnB1c2gobmV3X25vZGUpO1xuICAgIH1cbiAgICBzZWxlY3RlZF9ub2RlLmZpeGVkID0gZmFsc2U7XG4gICAgbGlua3MucHVzaCh7c291cmNlOiBzZWxlY3RlZF9ub2RlLCB0YXJnZXQ6IG5ld19ub2RlfSlcbiAgICBzZWxlY3RlZF9ub2RlID0gc2VsZWN0ZWRfdGFyZ2V0X25vZGUgPSBudWxsO1xuICAgIHVwZGF0ZSgpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgbmV3X2xpbmUucmVtb3ZlKCk7XG4gICAgICBuZXdfbGluZSA9IG51bGw7XG4gICAgICBmb3JjZS5zdGFydCgpO1xuICAgIH0sIDMwMCk7XG4gIH1cbn1cblxuZnVuY3Rpb24ga2V5dXAoKSB7XG4gIHN3aXRjaCAoZDMuZXZlbnQua2V5Q29kZSkge1xuICAgIGNhc2UgMTY6IHsgLy8gc2hpZnRcbiAgICAgIHNob3VsZF9kcmFnID0gZmFsc2U7XG4gICAgICB1cGRhdGUoKTtcbiAgICAgIGZvcmNlLnN0YXJ0KCk7XG4gICAgfVxuICB9XG59XG5cbi8vIHNlbGVjdCBmb3IgZHJhZ2dpbmcgbm9kZSB3aXRoIHNoaWZ0OyBkZWxldGUgbm9kZSB3aXRoIGJhY2tzcGFjZVxuZnVuY3Rpb24ga2V5ZG93bigpIHtcbiAgc3dpdGNoIChkMy5ldmVudC5rZXlDb2RlKSB7XG4gICAgY2FzZSA4OiAvLyBiYWNrc3BhY2VcbiAgICBjYXNlIDQ2OiB7IC8vIGRlbGV0ZVxuICAgICAgaWYgKHNlbGVjdGVkX25vZGUpIHsgLy8gZGVhbCB3aXRoIG5vZGVzXG4gICAgICAgIHZhciBpID0gbm9kZXMuaW5kZXhPZihzZWxlY3RlZF9ub2RlKTtcbiAgICAgICAgbm9kZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAvLyBmaW5kIGxpbmtzIHRvL2Zyb20gdGhpcyBub2RlLCBhbmQgZGVsZXRlIHRoZW0gdG9vXG4gICAgICAgIHZhciBuZXdfbGlua3MgPSBbXTtcbiAgICAgICAgbGlua3MuZm9yRWFjaChmdW5jdGlvbihsKSB7XG4gICAgICAgICAgaWYgKGwuc291cmNlICE9PSBzZWxlY3RlZF9ub2RlICYmIGwudGFyZ2V0ICE9PSBzZWxlY3RlZF9ub2RlKSB7XG4gICAgICAgICAgICBuZXdfbGlua3MucHVzaChsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBsaW5rcyA9IG5ld19saW5rcztcbiAgICAgICAgc2VsZWN0ZWRfbm9kZSA9IG5vZGVzLmxlbmd0aCA/IG5vZGVzW2kgPiAwID8gaSAtIDEgOiAwXSA6IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHNlbGVjdGVkX2xpbmspIHsgLy8gZGVhbCB3aXRoIGxpbmtzXG4gICAgICAgIHZhciBpID0gbGlua3MuaW5kZXhPZihzZWxlY3RlZF9saW5rKTtcbiAgICAgICAgbGlua3Muc3BsaWNlKGksIDEpO1xuICAgICAgICBzZWxlY3RlZF9saW5rID0gbGlua3MubGVuZ3RoID8gbGlua3NbaSA+IDAgPyBpIC0gMSA6IDBdIDogbnVsbDtcbiAgICAgIH1cbiAgICAgIHVwZGF0ZSgpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNhc2UgMTY6IHsgLy8gc2hpZnRcbiAgICAgIHNob3VsZF9kcmFnID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIiwiKGZ1bmN0aW9uIChyb290KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIEEgbGlzdCBvZiByZWd1bGFyIGV4cHJlc3Npb25zIHRoYXQgbWF0Y2ggYXJiaXRyYXJ5IElQdjQgYWRkcmVzc2VzLFxuICAgIC8vIGZvciB3aGljaCBhIG51bWJlciBvZiB3ZWlyZCBub3RhdGlvbnMgZXhpc3QuXG4gICAgLy8gTm90ZSB0aGF0IGFuIGFkZHJlc3MgbGlrZSAwMDEwLjB4YTUuMS4xIGlzIGNvbnNpZGVyZWQgbGVnYWwuXG4gICAgY29uc3QgaXB2NFBhcnQgPSAnKDA/XFxcXGQrfDB4W2EtZjAtOV0rKSc7XG4gICAgY29uc3QgaXB2NFJlZ2V4ZXMgPSB7XG4gICAgICAgIGZvdXJPY3RldDogbmV3IFJlZ0V4cChgXiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9JGAsICdpJyksXG4gICAgICAgIHRocmVlT2N0ZXQ6IG5ldyBSZWdFeHAoYF4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9JGAsICdpJyksXG4gICAgICAgIHR3b09jdGV0OiBuZXcgUmVnRXhwKGBeJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9JGAsICdpJyksXG4gICAgICAgIGxvbmdWYWx1ZTogbmV3IFJlZ0V4cChgXiR7aXB2NFBhcnR9JGAsICdpJylcbiAgICB9O1xuXG4gICAgLy8gUmVndWxhciBFeHByZXNzaW9uIGZvciBjaGVja2luZyBPY3RhbCBudW1iZXJzXG4gICAgY29uc3Qgb2N0YWxSZWdleCA9IG5ldyBSZWdFeHAoYF4wWzAtN10rJGAsICdpJyk7XG4gICAgY29uc3QgaGV4UmVnZXggPSBuZXcgUmVnRXhwKGBeMHhbYS1mMC05XSskYCwgJ2knKTtcblxuICAgIGNvbnN0IHpvbmVJbmRleCA9ICclWzAtOWEtel17MSx9JztcblxuICAgIC8vIElQdjYtbWF0Y2hpbmcgcmVndWxhciBleHByZXNzaW9ucy5cbiAgICAvLyBGb3IgSVB2NiwgdGhlIHRhc2sgaXMgc2ltcGxlcjogaXQgaXMgZW5vdWdoIHRvIG1hdGNoIHRoZSBjb2xvbi1kZWxpbWl0ZWRcbiAgICAvLyBoZXhhZGVjaW1hbCBJUHY2IGFuZCBhIHRyYW5zaXRpb25hbCB2YXJpYW50IHdpdGggZG90dGVkLWRlY2ltYWwgSVB2NCBhdFxuICAgIC8vIHRoZSBlbmQuXG4gICAgY29uc3QgaXB2NlBhcnQgPSAnKD86WzAtOWEtZl0rOjo/KSsnO1xuICAgIGNvbnN0IGlwdjZSZWdleGVzID0ge1xuICAgICAgICB6b25lSW5kZXg6IG5ldyBSZWdFeHAoem9uZUluZGV4LCAnaScpLFxuICAgICAgICAnbmF0aXZlJzogbmV3IFJlZ0V4cChgXig6Oik/KCR7aXB2NlBhcnR9KT8oWzAtOWEtZl0rKT8oOjopPygke3pvbmVJbmRleH0pPyRgLCAnaScpLFxuICAgICAgICBkZXByZWNhdGVkVHJhbnNpdGlvbmFsOiBuZXcgUmVnRXhwKGBeKD86OjopKCR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9KCR7em9uZUluZGV4fSk/KSRgLCAnaScpLFxuICAgICAgICB0cmFuc2l0aW9uYWw6IG5ldyBSZWdFeHAoYF4oKD86JHtpcHY2UGFydH0pfCg/Ojo6KSg/OiR7aXB2NlBhcnR9KT8pJHtpcHY0UGFydH1cXFxcLiR7aXB2NFBhcnR9XFxcXC4ke2lwdjRQYXJ0fVxcXFwuJHtpcHY0UGFydH0oJHt6b25lSW5kZXh9KT8kYCwgJ2knKVxuICAgIH07XG5cbiAgICAvLyBFeHBhbmQgOjogaW4gYW4gSVB2NiBhZGRyZXNzIG9yIGFkZHJlc3MgcGFydCBjb25zaXN0aW5nIG9mIGBwYXJ0c2AgZ3JvdXBzLlxuICAgIGZ1bmN0aW9uIGV4cGFuZElQdjYgKHN0cmluZywgcGFydHMpIHtcbiAgICAgICAgLy8gTW9yZSB0aGFuIG9uZSAnOjonIG1lYW5zIGludmFsaWQgYWRkZHJlc3NcbiAgICAgICAgaWYgKHN0cmluZy5pbmRleE9mKCc6OicpICE9PSBzdHJpbmcubGFzdEluZGV4T2YoJzo6JykpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbG9uQ291bnQgPSAwO1xuICAgICAgICBsZXQgbGFzdENvbG9uID0gLTE7XG4gICAgICAgIGxldCB6b25lSWQgPSAoc3RyaW5nLm1hdGNoKGlwdjZSZWdleGVzLnpvbmVJbmRleCkgfHwgW10pWzBdO1xuICAgICAgICBsZXQgcmVwbGFjZW1lbnQsIHJlcGxhY2VtZW50Q291bnQ7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHpvbmUgaW5kZXggYW5kIHNhdmUgaXQgZm9yIGxhdGVyXG4gICAgICAgIGlmICh6b25lSWQpIHtcbiAgICAgICAgICAgIHpvbmVJZCA9IHpvbmVJZC5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvJS4rJC8sICcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhvdyBtYW55IHBhcnRzIGRvIHdlIGFscmVhZHkgaGF2ZT9cbiAgICAgICAgd2hpbGUgKChsYXN0Q29sb24gPSBzdHJpbmcuaW5kZXhPZignOicsIGxhc3RDb2xvbiArIDEpKSA+PSAwKSB7XG4gICAgICAgICAgICBjb2xvbkNvdW50Kys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAwOjowIGlzIHR3byBwYXJ0cyBtb3JlIHRoYW4gOjpcbiAgICAgICAgaWYgKHN0cmluZy5zdWJzdHIoMCwgMikgPT09ICc6OicpIHtcbiAgICAgICAgICAgIGNvbG9uQ291bnQtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdHJpbmcuc3Vic3RyKC0yLCAyKSA9PT0gJzo6Jykge1xuICAgICAgICAgICAgY29sb25Db3VudC0tO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBsb29wIHdvdWxkIGhhbmcgaWYgY29sb25Db3VudCA+IHBhcnRzXG4gICAgICAgIGlmIChjb2xvbkNvdW50ID4gcGFydHMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVwbGFjZW1lbnQgPSAnOicgKyAnMDonICogKHBhcnRzIC0gY29sb25Db3VudClcbiAgICAgICAgcmVwbGFjZW1lbnRDb3VudCA9IHBhcnRzIC0gY29sb25Db3VudDtcbiAgICAgICAgcmVwbGFjZW1lbnQgPSAnOic7XG4gICAgICAgIHdoaWxlIChyZXBsYWNlbWVudENvdW50LS0pIHtcbiAgICAgICAgICAgIHJlcGxhY2VtZW50ICs9ICcwOic7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJbnNlcnQgdGhlIG1pc3NpbmcgemVyb2VzXG4gICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKCc6OicsIHJlcGxhY2VtZW50KTtcblxuICAgICAgICAvLyBUcmltIGFueSBnYXJiYWdlIHdoaWNoIG1heSBiZSBoYW5naW5nIGFyb3VuZCBpZiA6OiB3YXMgYXQgdGhlIGVkZ2UgaW5cbiAgICAgICAgLy8gdGhlIHNvdXJjZSBzdHJpblxuICAgICAgICBpZiAoc3RyaW5nWzBdID09PSAnOicpIHtcbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zbGljZSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSAnOicpIHtcbiAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zbGljZSgwLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICBwYXJ0cyA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCByZWYgPSBzdHJpbmcuc3BsaXQoJzonKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWYubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGFyc2VJbnQocmVmW2ldLCAxNikpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSkoKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGFydHM6IHBhcnRzLFxuICAgICAgICAgICAgem9uZUlkOiB6b25lSWRcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBBIGdlbmVyaWMgQ0lEUiAoQ2xhc3NsZXNzIEludGVyLURvbWFpbiBSb3V0aW5nKSBSRkMxNTE4IHJhbmdlIG1hdGNoZXIuXG4gICAgZnVuY3Rpb24gbWF0Y2hDSURSIChmaXJzdCwgc2Vjb25kLCBwYXJ0U2l6ZSwgY2lkckJpdHMpIHtcbiAgICAgICAgaWYgKGZpcnN0Lmxlbmd0aCAhPT0gc2Vjb25kLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGNhbm5vdCBtYXRjaCBDSURSIGZvciBvYmplY3RzIHdpdGggZGlmZmVyZW50IGxlbmd0aHMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJ0ID0gMDtcbiAgICAgICAgbGV0IHNoaWZ0O1xuXG4gICAgICAgIHdoaWxlIChjaWRyQml0cyA+IDApIHtcbiAgICAgICAgICAgIHNoaWZ0ID0gcGFydFNpemUgLSBjaWRyQml0cztcbiAgICAgICAgICAgIGlmIChzaGlmdCA8IDApIHtcbiAgICAgICAgICAgICAgICBzaGlmdCA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaXJzdFtwYXJ0XSA+PiBzaGlmdCAhPT0gc2Vjb25kW3BhcnRdID4+IHNoaWZ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaWRyQml0cyAtPSBwYXJ0U2l6ZTtcbiAgICAgICAgICAgIHBhcnQgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlSW50QXV0byAoc3RyaW5nKSB7XG4gICAgICAgIC8vIEhleGFkZWRpbWFsIGJhc2UgMTYgKDB4IylcbiAgICAgICAgaWYgKGhleFJlZ2V4LnRlc3Qoc3RyaW5nKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0cmluZywgMTYpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdoaWxlIG9jdGFsIHJlcHJlc2VudGF0aW9uIGlzIGRpc2NvdXJhZ2VkIGJ5IEVDTUFTY3JpcHQgM1xuICAgICAgICAvLyBhbmQgZm9yYmlkZGVuIGJ5IEVDTUFTY3JpcHQgNSwgd2Ugc2lsZW50bHkgYWxsb3cgaXQgdG9cbiAgICAgICAgLy8gd29yayBvbmx5IGlmIHRoZSByZXN0IG9mIHRoZSBzdHJpbmcgaGFzIG51bWJlcnMgbGVzcyB0aGFuIDguXG4gICAgICAgIGlmIChzdHJpbmdbMF0gPT09ICcwJyAmJiAhaXNOYU4ocGFyc2VJbnQoc3RyaW5nWzFdLCAxMCkpKSB7XG4gICAgICAgIGlmIChvY3RhbFJlZ2V4LnRlc3Qoc3RyaW5nKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHN0cmluZywgOCk7XG4gICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgaXBhZGRyOiBjYW5ub3QgcGFyc2UgJHtzdHJpbmd9IGFzIG9jdGFsYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQWx3YXlzIGluY2x1ZGUgdGhlIGJhc2UgMTAgcmFkaXghXG4gICAgICAgIHJldHVybiBwYXJzZUludChzdHJpbmcsIDEwKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWRQYXJ0IChwYXJ0LCBsZW5ndGgpIHtcbiAgICAgICAgd2hpbGUgKHBhcnQubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBwYXJ0ID0gYDAke3BhcnR9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJ0O1xuICAgIH1cblxuICAgIGNvbnN0IGlwYWRkciA9IHt9O1xuXG4gICAgLy8gQW4gSVB2NCBhZGRyZXNzIChSRkM3OTEpLlxuICAgIGlwYWRkci5JUHY0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ29uc3RydWN0cyBhIG5ldyBJUHY0IGFkZHJlc3MgZnJvbSBhbiBhcnJheSBvZiBmb3VyIG9jdGV0c1xuICAgICAgICAvLyBpbiBuZXR3b3JrIG9yZGVyIChNU0IgZmlyc3QpXG4gICAgICAgIC8vIFZlcmlmaWVzIHRoZSBpbnB1dC5cbiAgICAgICAgZnVuY3Rpb24gSVB2NCAob2N0ZXRzKSB7XG4gICAgICAgICAgICBpZiAob2N0ZXRzLmxlbmd0aCAhPT0gNCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBpcHY0IG9jdGV0IGNvdW50IHNob3VsZCBiZSA0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBpLCBvY3RldDtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG9jdGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG9jdGV0ID0gb2N0ZXRzW2ldO1xuICAgICAgICAgICAgICAgIGlmICghKCgwIDw9IG9jdGV0ICYmIG9jdGV0IDw9IDI1NSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBpcHY0IG9jdGV0IHNob3VsZCBmaXQgaW4gOCBiaXRzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm9jdGV0cyA9IG9jdGV0cztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwZWNpYWwgSVB2NCBhZGRyZXNzIHJhbmdlcy5cbiAgICAgICAgLy8gU2VlIGFsc28gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVzZXJ2ZWRfSVBfYWRkcmVzc2VzXG4gICAgICAgIElQdjQucHJvdG90eXBlLlNwZWNpYWxSYW5nZXMgPSB7XG4gICAgICAgICAgICB1bnNwZWNpZmllZDogW1tuZXcgSVB2NChbMCwgMCwgMCwgMF0pLCA4XV0sXG4gICAgICAgICAgICBicm9hZGNhc3Q6IFtbbmV3IElQdjQoWzI1NSwgMjU1LCAyNTUsIDI1NV0pLCAzMl1dLFxuICAgICAgICAgICAgLy8gUkZDMzE3MVxuICAgICAgICAgICAgbXVsdGljYXN0OiBbW25ldyBJUHY0KFsyMjQsIDAsIDAsIDBdKSwgNF1dLFxuICAgICAgICAgICAgLy8gUkZDMzkyN1xuICAgICAgICAgICAgbGlua0xvY2FsOiBbW25ldyBJUHY0KFsxNjksIDI1NCwgMCwgMF0pLCAxNl1dLFxuICAgICAgICAgICAgLy8gUkZDNTczNVxuICAgICAgICAgICAgbG9vcGJhY2s6IFtbbmV3IElQdjQoWzEyNywgMCwgMCwgMF0pLCA4XV0sXG4gICAgICAgICAgICAvLyBSRkM2NTk4XG4gICAgICAgICAgICBjYXJyaWVyR3JhZGVOYXQ6IFtbbmV3IElQdjQoWzEwMCwgNjQsIDAsIDBdKSwgMTBdXSxcbiAgICAgICAgICAgIC8vIFJGQzE5MThcbiAgICAgICAgICAgICdwcml2YXRlJzogW1xuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMTAsIDAsIDAsIDBdKSwgOF0sXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsxNzIsIDE2LCAwLCAwXSksIDEyXSxcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzE5MiwgMTY4LCAwLCAwXSksIDE2XVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIC8vIFJlc2VydmVkIGFuZCB0ZXN0aW5nLW9ubHkgcmFuZ2VzOyBSRkNzIDU3MzUsIDU3MzcsIDI1NDQsIDE3MDBcbiAgICAgICAgICAgIHJlc2VydmVkOiBbXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsxOTIsIDAsIDAsIDBdKSwgMjRdLFxuICAgICAgICAgICAgICAgIFtuZXcgSVB2NChbMTkyLCAwLCAyLCAwXSksIDI0XSxcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzE5MiwgODgsIDk5LCAwXSksIDI0XSxcbiAgICAgICAgICAgICAgICBbbmV3IElQdjQoWzE5OCwgNTEsIDEwMCwgMF0pLCAyNF0sXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsyMDMsIDAsIDExMywgMF0pLCAyNF0sXG4gICAgICAgICAgICAgICAgW25ldyBJUHY0KFsyNDAsIDAsIDAsIDBdKSwgNF1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUaGUgJ2tpbmQnIG1ldGhvZCBleGlzdHMgb24gYm90aCBJUHY0IGFuZCBJUHY2IGNsYXNzZXMuXG4gICAgICAgIElQdjQucHJvdG90eXBlLmtpbmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2lwdjQnO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENoZWNrcyBpZiB0aGlzIGFkZHJlc3MgbWF0Y2hlcyBvdGhlciBvbmUgd2l0aGluIGdpdmVuIENJRFIgcmFuZ2UuXG4gICAgICAgIElQdjQucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24gKG90aGVyLCBjaWRyUmFuZ2UpIHtcbiAgICAgICAgICAgIGxldCByZWY7XG4gICAgICAgICAgICBpZiAoY2lkclJhbmdlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZWYgPSBvdGhlcjtcbiAgICAgICAgICAgICAgICBvdGhlciA9IHJlZlswXTtcbiAgICAgICAgICAgICAgICBjaWRyUmFuZ2UgPSByZWZbMV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvdGhlci5raW5kKCkgIT09ICdpcHY0Jykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBjYW5ub3QgbWF0Y2ggaXB2NCBhZGRyZXNzIHdpdGggbm9uLWlwdjQgb25lJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtYXRjaENJRFIodGhpcy5vY3RldHMsIG90aGVyLm9jdGV0cywgOCwgY2lkclJhbmdlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyByZXR1cm5zIGEgbnVtYmVyIG9mIGxlYWRpbmcgb25lcyBpbiBJUHY0IGFkZHJlc3MsIG1ha2luZyBzdXJlIHRoYXRcbiAgICAgICAgLy8gdGhlIHJlc3QgaXMgYSBzb2xpZCBzZXF1ZW5jZSBvZiAwJ3MgKHZhbGlkIG5ldG1hc2spXG4gICAgICAgIC8vIHJldHVybnMgZWl0aGVyIHRoZSBDSURSIGxlbmd0aCBvciBudWxsIGlmIG1hc2sgaXMgbm90IHZhbGlkXG4gICAgICAgIElQdjQucHJvdG90eXBlLnByZWZpeExlbmd0aEZyb21TdWJuZXRNYXNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGNpZHIgPSAwO1xuICAgICAgICAgICAgLy8gbm9uLXplcm8gZW5jb3VudGVyZWQgc3RvcCBzY2FubmluZyBmb3IgemVyb2VzXG4gICAgICAgICAgICBsZXQgc3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gbnVtYmVyIG9mIHplcm9lcyBpbiBvY3RldFxuICAgICAgICAgICAgY29uc3QgemVyb3RhYmxlID0ge1xuICAgICAgICAgICAgICAgIDA6IDgsXG4gICAgICAgICAgICAgICAgMTI4OiA3LFxuICAgICAgICAgICAgICAgIDE5MjogNixcbiAgICAgICAgICAgICAgICAyMjQ6IDUsXG4gICAgICAgICAgICAgICAgMjQwOiA0LFxuICAgICAgICAgICAgICAgIDI0ODogMyxcbiAgICAgICAgICAgICAgICAyNTI6IDIsXG4gICAgICAgICAgICAgICAgMjU0OiAxLFxuICAgICAgICAgICAgICAgIDI1NTogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGxldCBpLCBvY3RldCwgemVyb3M7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDM7IGkgPj0gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgb2N0ZXQgPSB0aGlzLm9jdGV0c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAob2N0ZXQgaW4gemVyb3RhYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHplcm9zID0gemVyb3RhYmxlW29jdGV0XTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3AgJiYgemVyb3MgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHplcm9zICE9PSA4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNpZHIgKz0gemVyb3M7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gMzIgLSBjaWRyO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENoZWNrcyBpZiB0aGUgYWRkcmVzcyBjb3JyZXNwb25kcyB0byBvbmUgb2YgdGhlIHNwZWNpYWwgcmFuZ2VzLlxuICAgICAgICBJUHY0LnByb3RvdHlwZS5yYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpcGFkZHIuc3VibmV0TWF0Y2godGhpcywgdGhpcy5TcGVjaWFsUmFuZ2VzKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGJ5dGUtc2l6ZWQgdmFsdWVzIGluIG5ldHdvcmsgb3JkZXIgKE1TQiBmaXJzdClcbiAgICAgICAgSVB2NC5wcm90b3R5cGUudG9CeXRlQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5vY3RldHMuc2xpY2UoMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29udmVydHMgdGhpcyBJUHY0IGFkZHJlc3MgdG8gYW4gSVB2NC1tYXBwZWQgSVB2NiBhZGRyZXNzLlxuICAgICAgICBJUHY0LnByb3RvdHlwZS50b0lQdjRNYXBwZWRBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGlwYWRkci5JUHY2LnBhcnNlKGA6OmZmZmY6JHt0aGlzLnRvU3RyaW5nKCl9YCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gU3ltbWV0cmljYWwgbWV0aG9kIHN0cmljdGx5IGZvciBhbGlnbmluZyB3aXRoIHRoZSBJUHY2IG1ldGhvZHMuXG4gICAgICAgIElQdjQucHJvdG90eXBlLnRvTm9ybWFsaXplZFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmV0dXJucyB0aGUgYWRkcmVzcyBpbiBjb252ZW5pZW50LCBkZWNpbWFsLWRvdHRlZCBmb3JtYXQuXG4gICAgICAgIElQdjQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2N0ZXRzLmpvaW4oJy4nKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gSVB2NDtcbiAgICB9KSgpO1xuXG4gICAgLy8gQSB1dGlsaXR5IGZ1bmN0aW9uIHRvIHJldHVybiBicm9hZGNhc3QgYWRkcmVzcyBnaXZlbiB0aGUgSVB2NCBpbnRlcmZhY2UgYW5kIHByZWZpeCBsZW5ndGggaW4gQ0lEUiBub3RhdGlvblxuICAgIGlwYWRkci5JUHY0LmJyb2FkY2FzdEFkZHJlc3NGcm9tQ0lEUiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2lkciA9IHRoaXMucGFyc2VDSURSKHN0cmluZyk7XG4gICAgICAgICAgICBjb25zdCBpcEludGVyZmFjZU9jdGV0cyA9IGNpZHJbMF0udG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGNvbnN0IHN1Ym5ldE1hc2tPY3RldHMgPSB0aGlzLnN1Ym5ldE1hc2tGcm9tUHJlZml4TGVuZ3RoKGNpZHJbMV0pLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBjb25zdCBvY3RldHMgPSBbXTtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpIDwgNCkge1xuICAgICAgICAgICAgICAgIC8vIEJyb2FkY2FzdCBhZGRyZXNzIGlzIGJpdHdpc2UgT1IgYmV0d2VlbiBpcCBpbnRlcmZhY2UgYW5kIGludmVydGVkIG1hc2tcbiAgICAgICAgICAgICAgICBvY3RldHMucHVzaChwYXJzZUludChpcEludGVyZmFjZU9jdGV0c1tpXSwgMTApIHwgcGFyc2VJbnQoc3VibmV0TWFza09jdGV0c1tpXSwgMTApIF4gMjU1KTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvY3RldHMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogdGhlIGFkZHJlc3MgZG9lcyBub3QgaGF2ZSBJUHY0IENJRFIgZm9ybWF0Jyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ2hlY2tzIGlmIGEgZ2l2ZW4gc3RyaW5nIGlzIGZvcm1hdHRlZCBsaWtlIElQdjQgYWRkcmVzcy5cbiAgICBpcGFkZHIuSVB2NC5pc0lQdjQgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlcihzdHJpbmcpICE9PSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBDaGVja3MgaWYgYSBnaXZlbiBzdHJpbmcgaXMgYSB2YWxpZCBJUHY0IGFkZHJlc3MuXG4gICAgaXBhZGRyLklQdjQuaXNWYWxpZCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIG5ldyB0aGlzKHRoaXMucGFyc2VyKHN0cmluZykpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDaGVja3MgaWYgYSBnaXZlbiBzdHJpbmcgaXMgYSBmdWxsIGZvdXItcGFydCBJUHY0IEFkZHJlc3MuXG4gICAgaXBhZGRyLklQdjQuaXNWYWxpZEZvdXJQYXJ0RGVjaW1hbCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgaWYgKGlwYWRkci5JUHY0LmlzVmFsaWQoc3RyaW5nKSAmJiBzdHJpbmcubWF0Y2goL14oMHxbMS05XVxcZCopKFxcLigwfFsxLTldXFxkKikpezN9JC8pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBIHV0aWxpdHkgZnVuY3Rpb24gdG8gcmV0dXJuIG5ldHdvcmsgYWRkcmVzcyBnaXZlbiB0aGUgSVB2NCBpbnRlcmZhY2UgYW5kIHByZWZpeCBsZW5ndGggaW4gQ0lEUiBub3RhdGlvblxuICAgIGlwYWRkci5JUHY0Lm5ldHdvcmtBZGRyZXNzRnJvbUNJRFIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGxldCBjaWRyLCBpLCBpcEludGVyZmFjZU9jdGV0cywgb2N0ZXRzLCBzdWJuZXRNYXNrT2N0ZXRzO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjaWRyID0gdGhpcy5wYXJzZUNJRFIoc3RyaW5nKTtcbiAgICAgICAgICAgIGlwSW50ZXJmYWNlT2N0ZXRzID0gY2lkclswXS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgc3VibmV0TWFza09jdGV0cyA9IHRoaXMuc3VibmV0TWFza0Zyb21QcmVmaXhMZW5ndGgoY2lkclsxXSkudG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIG9jdGV0cyA9IFtdO1xuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IDQpIHtcbiAgICAgICAgICAgICAgICAvLyBOZXR3b3JrIGFkZHJlc3MgaXMgYml0d2lzZSBBTkQgYmV0d2VlbiBpcCBpbnRlcmZhY2UgYW5kIG1hc2tcbiAgICAgICAgICAgICAgICBvY3RldHMucHVzaChwYXJzZUludChpcEludGVyZmFjZU9jdGV0c1tpXSwgMTApICYgcGFyc2VJbnQoc3VibmV0TWFza09jdGV0c1tpXSwgMTApKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgdGhpcyhvY3RldHMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogdGhlIGFkZHJlc3MgZG9lcyBub3QgaGF2ZSBJUHY0IENJRFIgZm9ybWF0Jyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVHJpZXMgdG8gcGFyc2UgYW5kIHZhbGlkYXRlIGEgc3RyaW5nIHdpdGggSVB2NCBhZGRyZXNzLlxuICAgIC8vIFRocm93cyBhbiBlcnJvciBpZiBpdCBmYWlscy5cbiAgICBpcGFkZHIuSVB2NC5wYXJzZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLnBhcnNlcihzdHJpbmcpO1xuXG4gICAgICAgIGlmIChwYXJ0cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHN0cmluZyBpcyBub3QgZm9ybWF0dGVkIGxpa2UgYW4gSVB2NCBBZGRyZXNzJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IHRoaXMocGFydHMpO1xuICAgIH07XG5cbiAgICAvLyBQYXJzZXMgdGhlIHN0cmluZyBhcyBhbiBJUHY0IEFkZHJlc3Mgd2l0aCBDSURSIE5vdGF0aW9uLlxuICAgIGlwYWRkci5JUHY0LnBhcnNlQ0lEUiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgbGV0IG1hdGNoO1xuXG4gICAgICAgIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goL14oLispXFwvKFxcZCspJC8pKSkge1xuICAgICAgICAgICAgY29uc3QgbWFza0xlbmd0aCA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgIGlmIChtYXNrTGVuZ3RoID49IDAgJiYgbWFza0xlbmd0aCA8PSAzMikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IFt0aGlzLnBhcnNlKG1hdGNoWzFdKSwgbWFza0xlbmd0aF07XG4gICAgICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBhcnNlZCwgJ3RvU3RyaW5nJywge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuam9pbignLycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBzdHJpbmcgaXMgbm90IGZvcm1hdHRlZCBsaWtlIGFuIElQdjQgQ0lEUiByYW5nZScpO1xuICAgIH07XG5cbiAgICAvLyBDbGFzc2Z1bCB2YXJpYW50cyAobGlrZSBhLmIsIHdoZXJlIGEgaXMgYW4gb2N0ZXQsIGFuZCBiIGlzIGEgMjQtYml0XG4gICAgLy8gdmFsdWUgcmVwcmVzZW50aW5nIGxhc3QgdGhyZWUgb2N0ZXRzOyB0aGlzIGNvcnJlc3BvbmRzIHRvIGEgY2xhc3MgQ1xuICAgIC8vIGFkZHJlc3MpIGFyZSBvbWl0dGVkIGR1ZSB0byBjbGFzc2xlc3MgbmF0dXJlIG9mIG1vZGVybiBJbnRlcm5ldC5cbiAgICBpcGFkZHIuSVB2NC5wYXJzZXIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGxldCBtYXRjaCwgcGFydCwgdmFsdWU7XG5cbiAgICAgICAgLy8gcGFyc2VJbnQgcmVjb2duaXplcyBhbGwgdGhhdCBvY3RhbCAmIGhleGFkZWNpbWFsIHdlaXJkbmVzcyBmb3IgdXNcbiAgICAgICAgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaChpcHY0UmVnZXhlcy5mb3VyT2N0ZXQpKSkge1xuICAgICAgICAgICAgcmV0dXJuIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gbWF0Y2guc2xpY2UoMSwgNik7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWYubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydCA9IHJlZltpXTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhcnNlSW50QXV0byhwYXJ0KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9IGVsc2UgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaChpcHY0UmVnZXhlcy5sb25nVmFsdWUpKSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludEF1dG8obWF0Y2hbMV0pO1xuICAgICAgICAgICAgaWYgKHZhbHVlID4gMHhmZmZmZmZmZiB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogYWRkcmVzcyBvdXRzaWRlIGRlZmluZWQgcmFuZ2UnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICBsZXQgc2hpZnQ7XG5cbiAgICAgICAgICAgICAgICBmb3IgKHNoaWZ0ID0gMDsgc2hpZnQgPD0gMjQ7IHNoaWZ0ICs9IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCh2YWx1ZSA+PiBzaGlmdCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pKCkpLnJldmVyc2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goaXB2NFJlZ2V4ZXMudHdvT2N0ZXQpKSkge1xuICAgICAgICAgICAgcmV0dXJuIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gbWF0Y2guc2xpY2UoMSwgNCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludEF1dG8ocmVmWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPiAweGZmZmZmZiB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGFkZHJlc3Mgb3V0c2lkZSBkZWZpbmVkIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhcnNlSW50QXV0byhyZWZbMF0pKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goKHZhbHVlID4+IDE2KSAmIDB4ZmYpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCgodmFsdWUgPj4gIDgpICYgMHhmZik7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCB2YWx1ZSAgICAgICAgJiAweGZmKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfSBlbHNlIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goaXB2NFJlZ2V4ZXMudGhyZWVPY3RldCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWYgPSBtYXRjaC5zbGljZSgxLCA1KTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50QXV0byhyZWZbMl0pO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA+IDB4ZmZmZiB8fCB2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGFkZHJlc3Mgb3V0c2lkZSBkZWZpbmVkIHJhbmdlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhcnNlSW50QXV0byhyZWZbMF0pKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocGFyc2VJbnRBdXRvKHJlZlsxXSkpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCgodmFsdWUgPj4gOCkgJiAweGZmKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIHZhbHVlICAgICAgICYgMHhmZik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBIHV0aWxpdHkgZnVuY3Rpb24gdG8gcmV0dXJuIHN1Ym5ldCBtYXNrIGluIElQdjQgZm9ybWF0IGdpdmVuIHRoZSBwcmVmaXggbGVuZ3RoXG4gICAgaXBhZGRyLklQdjQuc3VibmV0TWFza0Zyb21QcmVmaXhMZW5ndGggPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgICAgIHByZWZpeCA9IHBhcnNlSW50KHByZWZpeCk7XG4gICAgICAgIGlmIChwcmVmaXggPCAwIHx8IHByZWZpeCA+IDMyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogaW52YWxpZCBJUHY0IHByZWZpeCBsZW5ndGgnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9jdGV0cyA9IFswLCAwLCAwLCAwXTtcbiAgICAgICAgbGV0IGogPSAwO1xuICAgICAgICBjb25zdCBmaWxsZWRPY3RldENvdW50ID0gTWF0aC5mbG9vcihwcmVmaXggLyA4KTtcblxuICAgICAgICB3aGlsZSAoaiA8IGZpbGxlZE9jdGV0Q291bnQpIHtcbiAgICAgICAgICAgIG9jdGV0c1tqXSA9IDI1NTtcbiAgICAgICAgICAgIGorKztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxsZWRPY3RldENvdW50IDwgNCkge1xuICAgICAgICAgICAgb2N0ZXRzW2ZpbGxlZE9jdGV0Q291bnRdID0gTWF0aC5wb3coMiwgcHJlZml4ICUgOCkgLSAxIDw8IDggLSAocHJlZml4ICUgOCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IHRoaXMob2N0ZXRzKTtcbiAgICB9O1xuXG4gICAgLy8gQW4gSVB2NiBhZGRyZXNzIChSRkMyNDYwKVxuICAgIGlwYWRkci5JUHY2ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gQ29uc3RydWN0cyBhbiBJUHY2IGFkZHJlc3MgZnJvbSBhbiBhcnJheSBvZiBlaWdodCAxNiAtIGJpdCBwYXJ0c1xuICAgICAgICAvLyBvciBzaXh0ZWVuIDggLSBiaXQgcGFydHMgaW4gbmV0d29yayBvcmRlcihNU0IgZmlyc3QpLlxuICAgICAgICAvLyBUaHJvd3MgYW4gZXJyb3IgaWYgdGhlIGlucHV0IGlzIGludmFsaWQuXG4gICAgICAgIGZ1bmN0aW9uIElQdjYgKHBhcnRzLCB6b25lSWQpIHtcbiAgICAgICAgICAgIGxldCBpLCBwYXJ0O1xuXG4gICAgICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAxNikge1xuICAgICAgICAgICAgICAgIHRoaXMucGFydHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDw9IDE0OyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0cy5wdXNoKChwYXJ0c1tpXSA8PCA4KSB8IHBhcnRzW2kgKyAxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJ0cy5sZW5ndGggPT09IDgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnRzID0gcGFydHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiBpcHY2IHBhcnQgY291bnQgc2hvdWxkIGJlIDggb3IgMTYnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMucGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoISgoMCA8PSBwYXJ0ICYmIHBhcnQgPD0gMHhmZmZmKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGlwdjYgcGFydCBzaG91bGQgZml0IGluIDE2IGJpdHMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh6b25lSWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmVJZCA9IHpvbmVJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNwZWNpYWwgSVB2NiByYW5nZXNcbiAgICAgICAgSVB2Ni5wcm90b3R5cGUuU3BlY2lhbFJhbmdlcyA9IHtcbiAgICAgICAgICAgIC8vIFJGQzQyOTEsIGhlcmUgYW5kIGFmdGVyXG4gICAgICAgICAgICB1bnNwZWNpZmllZDogW25ldyBJUHY2KFswLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSksIDEyOF0sXG4gICAgICAgICAgICBsaW5rTG9jYWw6IFtuZXcgSVB2NihbMHhmZTgwLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSksIDEwXSxcbiAgICAgICAgICAgIG11bHRpY2FzdDogW25ldyBJUHY2KFsweGZmMDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKSwgOF0sXG4gICAgICAgICAgICBsb29wYmFjazogW25ldyBJUHY2KFswLCAwLCAwLCAwLCAwLCAwLCAwLCAxXSksIDEyOF0sXG4gICAgICAgICAgICB1bmlxdWVMb2NhbDogW25ldyBJUHY2KFsweGZjMDAsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKSwgN10sXG4gICAgICAgICAgICBpcHY0TWFwcGVkOiBbbmV3IElQdjYoWzAsIDAsIDAsIDAsIDAsIDB4ZmZmZiwgMCwgMF0pLCA5Nl0sXG4gICAgICAgICAgICAvLyBSRkM2MTQ1XG4gICAgICAgICAgICByZmM2MTQ1OiBbbmV3IElQdjYoWzAsIDAsIDAsIDAsIDB4ZmZmZiwgMCwgMCwgMF0pLCA5Nl0sXG4gICAgICAgICAgICAvLyBSRkM2MDUyXG4gICAgICAgICAgICByZmM2MDUyOiBbbmV3IElQdjYoWzB4NjQsIDB4ZmY5YiwgMCwgMCwgMCwgMCwgMCwgMF0pLCA5Nl0sXG4gICAgICAgICAgICAvLyBSRkMzMDU2XG4gICAgICAgICAgICAnNnRvNCc6IFtuZXcgSVB2NihbMHgyMDAyLCAwLCAwLCAwLCAwLCAwLCAwLCAwXSksIDE2XSxcbiAgICAgICAgICAgIC8vIFJGQzYwNTIsIFJGQzYxNDZcbiAgICAgICAgICAgIHRlcmVkbzogW25ldyBJUHY2KFsweDIwMDEsIDAsIDAsIDAsIDAsIDAsIDAsIDBdKSwgMzJdLFxuICAgICAgICAgICAgLy8gUkZDNDI5MVxuICAgICAgICAgICAgcmVzZXJ2ZWQ6IFtbbmV3IElQdjYoWzB4MjAwMSwgMHhkYjgsIDAsIDAsIDAsIDAsIDAsIDBdKSwgMzJdXVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENoZWNrcyBpZiB0aGlzIGFkZHJlc3MgaXMgYW4gSVB2NC1tYXBwZWQgSVB2NiBhZGRyZXNzLlxuICAgICAgICBJUHY2LnByb3RvdHlwZS5pc0lQdjRNYXBwZWRBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmFuZ2UoKSA9PT0gJ2lwdjRNYXBwZWQnO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRoZSAna2luZCcgbWV0aG9kIGV4aXN0cyBvbiBib3RoIElQdjQgYW5kIElQdjYgY2xhc3Nlcy5cbiAgICAgICAgSVB2Ni5wcm90b3R5cGUua2luZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAnaXB2Nic7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2hlY2tzIGlmIHRoaXMgYWRkcmVzcyBtYXRjaGVzIG90aGVyIG9uZSB3aXRoaW4gZ2l2ZW4gQ0lEUiByYW5nZS5cbiAgICAgICAgSVB2Ni5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbiAob3RoZXIsIGNpZHJSYW5nZSkge1xuICAgICAgICAgICAgbGV0IHJlZjtcblxuICAgICAgICAgICAgaWYgKGNpZHJSYW5nZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmVmID0gb3RoZXI7XG4gICAgICAgICAgICAgICAgb3RoZXIgPSByZWZbMF07XG4gICAgICAgICAgICAgICAgY2lkclJhbmdlID0gcmVmWzFdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3RoZXIua2luZCgpICE9PSAnaXB2NicpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogY2Fubm90IG1hdGNoIGlwdjYgYWRkcmVzcyB3aXRoIG5vbi1pcHY2IG9uZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hDSURSKHRoaXMucGFydHMsIG90aGVyLnBhcnRzLCAxNiwgY2lkclJhbmdlKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyByZXR1cm5zIGEgbnVtYmVyIG9mIGxlYWRpbmcgb25lcyBpbiBJUHY2IGFkZHJlc3MsIG1ha2luZyBzdXJlIHRoYXRcbiAgICAgICAgLy8gdGhlIHJlc3QgaXMgYSBzb2xpZCBzZXF1ZW5jZSBvZiAwJ3MgKHZhbGlkIG5ldG1hc2spXG4gICAgICAgIC8vIHJldHVybnMgZWl0aGVyIHRoZSBDSURSIGxlbmd0aCBvciBudWxsIGlmIG1hc2sgaXMgbm90IHZhbGlkXG4gICAgICAgIElQdjYucHJvdG90eXBlLnByZWZpeExlbmd0aEZyb21TdWJuZXRNYXNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGNpZHIgPSAwO1xuICAgICAgICAgICAgLy8gbm9uLXplcm8gZW5jb3VudGVyZWQgc3RvcCBzY2FubmluZyBmb3IgemVyb2VzXG4gICAgICAgICAgICBsZXQgc3RvcCA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gbnVtYmVyIG9mIHplcm9lcyBpbiBvY3RldFxuICAgICAgICAgICAgY29uc3QgemVyb3RhYmxlID0ge1xuICAgICAgICAgICAgICAgIDA6IDE2LFxuICAgICAgICAgICAgICAgIDMyNzY4OiAxNSxcbiAgICAgICAgICAgICAgICA0OTE1MjogMTQsXG4gICAgICAgICAgICAgICAgNTczNDQ6IDEzLFxuICAgICAgICAgICAgICAgIDYxNDQwOiAxMixcbiAgICAgICAgICAgICAgICA2MzQ4ODogMTEsXG4gICAgICAgICAgICAgICAgNjQ1MTI6IDEwLFxuICAgICAgICAgICAgICAgIDY1MDI0OiA5LFxuICAgICAgICAgICAgICAgIDY1MjgwOiA4LFxuICAgICAgICAgICAgICAgIDY1NDA4OiA3LFxuICAgICAgICAgICAgICAgIDY1NDcyOiA2LFxuICAgICAgICAgICAgICAgIDY1NTA0OiA1LFxuICAgICAgICAgICAgICAgIDY1NTIwOiA0LFxuICAgICAgICAgICAgICAgIDY1NTI4OiAzLFxuICAgICAgICAgICAgICAgIDY1NTMyOiAyLFxuICAgICAgICAgICAgICAgIDY1NTM0OiAxLFxuICAgICAgICAgICAgICAgIDY1NTM1OiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbGV0IHBhcnQsIHplcm9zO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gNzsgaSA+PSAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgICAgICBwYXJ0ID0gdGhpcy5wYXJ0c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAocGFydCBpbiB6ZXJvdGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgemVyb3MgPSB6ZXJvdGFibGVbcGFydF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdG9wICYmIHplcm9zICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh6ZXJvcyAhPT0gMTYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY2lkciArPSB6ZXJvcztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAxMjggLSBjaWRyO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgLy8gQ2hlY2tzIGlmIHRoZSBhZGRyZXNzIGNvcnJlc3BvbmRzIHRvIG9uZSBvZiB0aGUgc3BlY2lhbCByYW5nZXMuXG4gICAgICAgIElQdjYucHJvdG90eXBlLnJhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGlwYWRkci5zdWJuZXRNYXRjaCh0aGlzLCB0aGlzLlNwZWNpYWxSYW5nZXMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFJldHVybnMgYW4gYXJyYXkgb2YgYnl0ZS1zaXplZCB2YWx1ZXMgaW4gbmV0d29yayBvcmRlciAoTVNCIGZpcnN0KVxuICAgICAgICBJUHY2LnByb3RvdHlwZS50b0J5dGVBcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCBwYXJ0O1xuICAgICAgICAgICAgY29uc3QgYnl0ZXMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRoaXMucGFydHM7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlZi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHBhcnQgPSByZWZbaV07XG4gICAgICAgICAgICAgICAgYnl0ZXMucHVzaChwYXJ0ID4+IDgpO1xuICAgICAgICAgICAgICAgIGJ5dGVzLnB1c2gocGFydCAmIDB4ZmYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYnl0ZXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmV0dXJucyB0aGUgYWRkcmVzcyBpbiBleHBhbmRlZCBmb3JtYXQgd2l0aCBhbGwgemVyb2VzIGluY2x1ZGVkLCBsaWtlXG4gICAgICAgIC8vIDIwMDE6MGRiODowMDA4OjAwNjY6MDAwMDowMDAwOjAwMDA6MDAwMVxuICAgICAgICBJUHY2LnByb3RvdHlwZS50b0ZpeGVkTGVuZ3RoU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgYWRkciA9ICgoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHBhZFBhcnQodGhpcy5wYXJ0c1tpXS50b1N0cmluZygxNiksIDQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pLmNhbGwodGhpcykpLmpvaW4oJzonKTtcblxuICAgICAgICAgICAgbGV0IHN1ZmZpeCA9ICcnO1xuXG4gICAgICAgICAgICBpZiAodGhpcy56b25lSWQpIHtcbiAgICAgICAgICAgICAgICBzdWZmaXggPSBgJSR7dGhpcy56b25lSWR9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFkZHIgKyBzdWZmaXg7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ29udmVydHMgdGhpcyBhZGRyZXNzIHRvIElQdjQgYWRkcmVzcyBpZiBpdCBpcyBhbiBJUHY0LW1hcHBlZCBJUHY2IGFkZHJlc3MuXG4gICAgICAgIC8vIFRocm93cyBhbiBlcnJvciBvdGhlcndpc2UuXG4gICAgICAgIElQdjYucHJvdG90eXBlLnRvSVB2NEFkZHJlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNJUHY0TWFwcGVkQWRkcmVzcygpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHRyeWluZyB0byBjb252ZXJ0IGEgZ2VuZXJpYyBpcHY2IGFkZHJlc3MgdG8gaXB2NCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZWYgPSB0aGlzLnBhcnRzLnNsaWNlKC0yKTtcbiAgICAgICAgICAgIGNvbnN0IGhpZ2ggPSByZWZbMF07XG4gICAgICAgICAgICBjb25zdCBsb3cgPSByZWZbMV07XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgaXBhZGRyLklQdjQoW2hpZ2ggPj4gOCwgaGlnaCAmIDB4ZmYsIGxvdyA+PiA4LCBsb3cgJiAweGZmXSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmV0dXJucyB0aGUgYWRkcmVzcyBpbiBleHBhbmRlZCBmb3JtYXQgd2l0aCBhbGwgemVyb2VzIGluY2x1ZGVkLCBsaWtlXG4gICAgICAgIC8vIDIwMDE6ZGI4Ojg6NjY6MDowOjA6MVxuICAgICAgICAvL1xuICAgICAgICAvLyBEZXByZWNhdGVkOiB1c2UgdG9GaXhlZExlbmd0aFN0cmluZygpIGluc3RlYWQuXG4gICAgICAgIElQdjYucHJvdG90eXBlLnRvTm9ybWFsaXplZFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGFkZHIgPSAoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMucGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMucGFydHNbaV0udG9TdHJpbmcoMTYpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH0pLmNhbGwodGhpcykpLmpvaW4oJzonKTtcblxuICAgICAgICAgICAgbGV0IHN1ZmZpeCA9ICcnO1xuXG4gICAgICAgICAgICBpZiAodGhpcy56b25lSWQpIHtcbiAgICAgICAgICAgICAgICBzdWZmaXggPSBgJSR7dGhpcy56b25lSWR9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFkZHIgKyBzdWZmaXg7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmV0dXJucyB0aGUgYWRkcmVzcyBpbiBjb21wYWN0LCBodW1hbi1yZWFkYWJsZSBmb3JtYXQgbGlrZVxuICAgICAgICAvLyAyMDAxOmRiODo4OjY2OjoxXG4gICAgICAgIC8vIGluIGxpbmUgd2l0aCBSRkMgNTk1MiAoc2VlIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM1OTUyI3NlY3Rpb24tNClcbiAgICAgICAgSVB2Ni5wcm90b3R5cGUudG9SRkM1OTUyU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSAvKChefDopKDAoOnwkKSl7Mix9KS9nO1xuICAgICAgICAgICAgY29uc3Qgc3RyaW5nID0gdGhpcy50b05vcm1hbGl6ZWRTdHJpbmcoKTtcbiAgICAgICAgICAgIGxldCBiZXN0TWF0Y2hJbmRleCA9IDA7XG4gICAgICAgICAgICBsZXQgYmVzdE1hdGNoTGVuZ3RoID0gLTE7XG4gICAgICAgICAgICBsZXQgbWF0Y2g7XG5cbiAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSByZWdleC5leGVjKHN0cmluZykpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoWzBdLmxlbmd0aCA+IGJlc3RNYXRjaExlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2hJbmRleCA9IG1hdGNoLmluZGV4O1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2hMZW5ndGggPSBtYXRjaFswXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYmVzdE1hdGNoTGVuZ3RoIDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBgJHtzdHJpbmcuc3Vic3RyaW5nKDAsIGJlc3RNYXRjaEluZGV4KX06OiR7c3RyaW5nLnN1YnN0cmluZyhiZXN0TWF0Y2hJbmRleCArIGJlc3RNYXRjaExlbmd0aCl9YDtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZXR1cm5zIHRoZSBhZGRyZXNzIGluIGNvbXBhY3QsIGh1bWFuLXJlYWRhYmxlIGZvcm1hdCBsaWtlXG4gICAgICAgIC8vIDIwMDE6ZGI4Ojg6NjY6OjFcbiAgICAgICAgLy9cbiAgICAgICAgLy8gRGVwcmVjYXRlZDogdXNlIHRvUkZDNTk1MlN0cmluZygpIGluc3RlYWQuXG4gICAgICAgIElQdjYucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gUmVwbGFjZSB0aGUgZmlyc3Qgc2VxdWVuY2Ugb2YgMSBvciBtb3JlICcwJyBwYXJ0cyB3aXRoICc6OidcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvTm9ybWFsaXplZFN0cmluZygpLnJlcGxhY2UoLygoXnw6KSgwKDp8JCkpKykvLCAnOjonKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gSVB2NjtcblxuICAgIH0pKCk7XG5cbiAgICAvLyBBIHV0aWxpdHkgZnVuY3Rpb24gdG8gcmV0dXJuIGJyb2FkY2FzdCBhZGRyZXNzIGdpdmVuIHRoZSBJUHY2IGludGVyZmFjZSBhbmQgcHJlZml4IGxlbmd0aCBpbiBDSURSIG5vdGF0aW9uXG4gICAgaXBhZGRyLklQdjYuYnJvYWRjYXN0QWRkcmVzc0Zyb21DSURSID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2lkciA9IHRoaXMucGFyc2VDSURSKHN0cmluZyk7XG4gICAgICAgICAgICBjb25zdCBpcEludGVyZmFjZU9jdGV0cyA9IGNpZHJbMF0udG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIGNvbnN0IHN1Ym5ldE1hc2tPY3RldHMgPSB0aGlzLnN1Ym5ldE1hc2tGcm9tUHJlZml4TGVuZ3RoKGNpZHJbMV0pLnRvQnl0ZUFycmF5KCk7XG4gICAgICAgICAgICBjb25zdCBvY3RldHMgPSBbXTtcbiAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChpIDwgMTYpIHtcbiAgICAgICAgICAgICAgICAvLyBCcm9hZGNhc3QgYWRkcmVzcyBpcyBiaXR3aXNlIE9SIGJldHdlZW4gaXAgaW50ZXJmYWNlIGFuZCBpbnZlcnRlZCBtYXNrXG4gICAgICAgICAgICAgICAgb2N0ZXRzLnB1c2gocGFyc2VJbnQoaXBJbnRlcmZhY2VPY3RldHNbaV0sIDEwKSB8IHBhcnNlSW50KHN1Ym5ldE1hc2tPY3RldHNbaV0sIDEwKSBeIDI1NSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob2N0ZXRzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpcGFkZHI6IHRoZSBhZGRyZXNzIGRvZXMgbm90IGhhdmUgSVB2NiBDSURSIGZvcm1hdCAoJHtlfSlgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDaGVja3MgaWYgYSBnaXZlbiBzdHJpbmcgaXMgZm9ybWF0dGVkIGxpa2UgSVB2NiBhZGRyZXNzLlxuICAgIGlwYWRkci5JUHY2LmlzSVB2NiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VyKHN0cmluZykgIT09IG51bGw7XG4gICAgfTtcblxuICAgIC8vIENoZWNrcyB0byBzZWUgaWYgc3RyaW5nIGlzIGEgdmFsaWQgSVB2NiBBZGRyZXNzXG4gICAgaXBhZGRyLklQdjYuaXNWYWxpZCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcblxuICAgICAgICAvLyBTaW5jZSBJUHY2LmlzVmFsaWQgaXMgYWx3YXlzIGNhbGxlZCBmaXJzdCwgdGhpcyBzaG9ydGN1dFxuICAgICAgICAvLyBwcm92aWRlcyBhIHN1YnN0YW50aWFsIHBlcmZvcm1hbmNlIGdhaW4uXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyaW5nID09PSAnc3RyaW5nJyAmJiBzdHJpbmcuaW5kZXhPZignOicpID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGFkZHIgPSB0aGlzLnBhcnNlcihzdHJpbmcpO1xuICAgICAgICAgICAgbmV3IHRoaXMoYWRkci5wYXJ0cywgYWRkci56b25lSWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBIHV0aWxpdHkgZnVuY3Rpb24gdG8gcmV0dXJuIG5ldHdvcmsgYWRkcmVzcyBnaXZlbiB0aGUgSVB2NiBpbnRlcmZhY2UgYW5kIHByZWZpeCBsZW5ndGggaW4gQ0lEUiBub3RhdGlvblxuICAgIGlwYWRkci5JUHY2Lm5ldHdvcmtBZGRyZXNzRnJvbUNJRFIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGxldCBjaWRyLCBpLCBpcEludGVyZmFjZU9jdGV0cywgb2N0ZXRzLCBzdWJuZXRNYXNrT2N0ZXRzO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjaWRyID0gdGhpcy5wYXJzZUNJRFIoc3RyaW5nKTtcbiAgICAgICAgICAgIGlwSW50ZXJmYWNlT2N0ZXRzID0gY2lkclswXS50b0J5dGVBcnJheSgpO1xuICAgICAgICAgICAgc3VibmV0TWFza09jdGV0cyA9IHRoaXMuc3VibmV0TWFza0Zyb21QcmVmaXhMZW5ndGgoY2lkclsxXSkudG9CeXRlQXJyYXkoKTtcbiAgICAgICAgICAgIG9jdGV0cyA9IFtdO1xuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoaSA8IDE2KSB7XG4gICAgICAgICAgICAgICAgLy8gTmV0d29yayBhZGRyZXNzIGlzIGJpdHdpc2UgQU5EIGJldHdlZW4gaXAgaW50ZXJmYWNlIGFuZCBtYXNrXG4gICAgICAgICAgICAgICAgb2N0ZXRzLnB1c2gocGFyc2VJbnQoaXBJbnRlcmZhY2VPY3RldHNbaV0sIDEwKSAmIHBhcnNlSW50KHN1Ym5ldE1hc2tPY3RldHNbaV0sIDEwKSk7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMob2N0ZXRzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpcGFkZHI6IHRoZSBhZGRyZXNzIGRvZXMgbm90IGhhdmUgSVB2NiBDSURSIGZvcm1hdCAoJHtlfSlgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUcmllcyB0byBwYXJzZSBhbmQgdmFsaWRhdGUgYSBzdHJpbmcgd2l0aCBJUHY2IGFkZHJlc3MuXG4gICAgLy8gVGhyb3dzIGFuIGVycm9yIGlmIGl0IGZhaWxzLlxuICAgIGlwYWRkci5JUHY2LnBhcnNlID0gZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICBjb25zdCBhZGRyID0gdGhpcy5wYXJzZXIoc3RyaW5nKTtcblxuICAgICAgICBpZiAoYWRkci5wYXJ0cyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IHN0cmluZyBpcyBub3QgZm9ybWF0dGVkIGxpa2UgYW4gSVB2NiBBZGRyZXNzJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYWRkci5wYXJ0cywgYWRkci56b25lSWQpO1xuICAgIH07XG5cbiAgICBpcGFkZHIuSVB2Ni5wYXJzZUNJRFIgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGxldCBtYXNrTGVuZ3RoLCBtYXRjaCwgcGFyc2VkO1xuXG4gICAgICAgIGlmICgobWF0Y2ggPSBzdHJpbmcubWF0Y2goL14oLispXFwvKFxcZCspJC8pKSkge1xuICAgICAgICAgICAgbWFza0xlbmd0aCA9IHBhcnNlSW50KG1hdGNoWzJdKTtcbiAgICAgICAgICAgIGlmIChtYXNrTGVuZ3RoID49IDAgJiYgbWFza0xlbmd0aCA8PSAxMjgpIHtcbiAgICAgICAgICAgICAgICBwYXJzZWQgPSBbdGhpcy5wYXJzZShtYXRjaFsxXSksIG1hc2tMZW5ndGhdO1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwYXJzZWQsICd0b1N0cmluZycsIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmpvaW4oJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogc3RyaW5nIGlzIG5vdCBmb3JtYXR0ZWQgbGlrZSBhbiBJUHY2IENJRFIgcmFuZ2UnKTtcbiAgICB9O1xuXG4gICAgLy8gUGFyc2UgYW4gSVB2NiBhZGRyZXNzLlxuICAgIGlwYWRkci5JUHY2LnBhcnNlciA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgbGV0IGFkZHIsIGksIG1hdGNoLCBvY3RldCwgb2N0ZXRzLCB6b25lSWQ7XG5cbiAgICAgICAgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaChpcHY2UmVnZXhlcy5kZXByZWNhdGVkVHJhbnNpdGlvbmFsKSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlcihgOjpmZmZmOiR7bWF0Y2hbMV19YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlwdjZSZWdleGVzLm5hdGl2ZS50ZXN0KHN0cmluZykpIHtcbiAgICAgICAgICAgIHJldHVybiBleHBhbmRJUHY2KHN0cmluZywgOCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChtYXRjaCA9IHN0cmluZy5tYXRjaChpcHY2UmVnZXhlcy50cmFuc2l0aW9uYWwpKSkge1xuICAgICAgICAgICAgem9uZUlkID0gbWF0Y2hbNl0gfHwgJyc7XG4gICAgICAgICAgICBhZGRyID0gZXhwYW5kSVB2NihtYXRjaFsxXS5zbGljZSgwLCAtMSkgKyB6b25lSWQsIDYpO1xuICAgICAgICAgICAgaWYgKGFkZHIucGFydHMpIHtcbiAgICAgICAgICAgICAgICBvY3RldHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoWzJdKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQobWF0Y2hbM10pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChtYXRjaFs0XSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KG1hdGNoWzVdKVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG9jdGV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBvY3RldCA9IG9jdGV0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoKDAgPD0gb2N0ZXQgJiYgb2N0ZXQgPD0gMjU1KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYWRkci5wYXJ0cy5wdXNoKG9jdGV0c1swXSA8PCA4IHwgb2N0ZXRzWzFdKTtcbiAgICAgICAgICAgICAgICBhZGRyLnBhcnRzLnB1c2gob2N0ZXRzWzJdIDw8IDggfCBvY3RldHNbM10pO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRzOiBhZGRyLnBhcnRzLFxuICAgICAgICAgICAgICAgICAgICB6b25lSWQ6IGFkZHIuem9uZUlkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBIHV0aWxpdHkgZnVuY3Rpb24gdG8gcmV0dXJuIHN1Ym5ldCBtYXNrIGluIElQdjYgZm9ybWF0IGdpdmVuIHRoZSBwcmVmaXggbGVuZ3RoXG4gICAgaXBhZGRyLklQdjYuc3VibmV0TWFza0Zyb21QcmVmaXhMZW5ndGggPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgICAgIHByZWZpeCA9IHBhcnNlSW50KHByZWZpeCk7XG4gICAgICAgIGlmIChwcmVmaXggPCAwIHx8IHByZWZpeCA+IDEyOCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpcGFkZHI6IGludmFsaWQgSVB2NiBwcmVmaXggbGVuZ3RoJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvY3RldHMgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgY29uc3QgZmlsbGVkT2N0ZXRDb3VudCA9IE1hdGguZmxvb3IocHJlZml4IC8gOCk7XG5cbiAgICAgICAgd2hpbGUgKGogPCBmaWxsZWRPY3RldENvdW50KSB7XG4gICAgICAgICAgICBvY3RldHNbal0gPSAyNTU7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmlsbGVkT2N0ZXRDb3VudCA8IDE2KSB7XG4gICAgICAgICAgICBvY3RldHNbZmlsbGVkT2N0ZXRDb3VudF0gPSBNYXRoLnBvdygyLCBwcmVmaXggJSA4KSAtIDEgPDwgOCAtIChwcmVmaXggJSA4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhvY3RldHMpO1xuICAgIH07XG5cbiAgICAvLyBUcnkgdG8gcGFyc2UgYW4gYXJyYXkgaW4gbmV0d29yayBvcmRlciAoTVNCIGZpcnN0KSBmb3IgSVB2NCBhbmQgSVB2NlxuICAgIGlwYWRkci5mcm9tQnl0ZUFycmF5ID0gZnVuY3Rpb24gKGJ5dGVzKSB7XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGJ5dGVzLmxlbmd0aDtcblxuICAgICAgICBpZiAobGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGlwYWRkci5JUHY0KGJ5dGVzKTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPT09IDE2KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGlwYWRkci5JUHY2KGJ5dGVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiB0aGUgYmluYXJ5IGlucHV0IGlzIG5laXRoZXIgYW4gSVB2NiBub3IgSVB2NCBhZGRyZXNzJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQ2hlY2tzIGlmIHRoZSBhZGRyZXNzIGlzIHZhbGlkIElQIGFkZHJlc3NcbiAgICBpcGFkZHIuaXNWYWxpZCA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGlwYWRkci5JUHY2LmlzVmFsaWQoc3RyaW5nKSB8fCBpcGFkZHIuSVB2NC5pc1ZhbGlkKHN0cmluZyk7XG4gICAgfTtcblxuXG4gICAgLy8gQXR0ZW1wdHMgdG8gcGFyc2UgYW4gSVAgQWRkcmVzcywgZmlyc3QgdGhyb3VnaCBJUHY2IHRoZW4gSVB2NC5cbiAgICAvLyBUaHJvd3MgYW4gZXJyb3IgaWYgaXQgY291bGQgbm90IGJlIHBhcnNlZC5cbiAgICBpcGFkZHIucGFyc2UgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGlmIChpcGFkZHIuSVB2Ni5pc1ZhbGlkKHN0cmluZykpIHtcbiAgICAgICAgICAgIHJldHVybiBpcGFkZHIuSVB2Ni5wYXJzZShzdHJpbmcpO1xuICAgICAgICB9IGVsc2UgaWYgKGlwYWRkci5JUHY0LmlzVmFsaWQoc3RyaW5nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlwYWRkci5JUHY0LnBhcnNlKHN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lwYWRkcjogdGhlIGFkZHJlc3MgaGFzIG5laXRoZXIgSVB2NiBub3IgSVB2NCBmb3JtYXQnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBBdHRlbXB0IHRvIHBhcnNlIENJRFIgbm90YXRpb24sIGZpcnN0IHRocm91Z2ggSVB2NiB0aGVuIElQdjQuXG4gICAgLy8gVGhyb3dzIGFuIGVycm9yIGlmIGl0IGNvdWxkIG5vdCBiZSBwYXJzZWQuXG4gICAgaXBhZGRyLnBhcnNlQ0lEUiA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBpcGFkZHIuSVB2Ni5wYXJzZUNJRFIoc3RyaW5nKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXBhZGRyLklQdjQucGFyc2VDSURSKHN0cmluZyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlMikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaXBhZGRyOiB0aGUgYWRkcmVzcyBoYXMgbmVpdGhlciBJUHY2IG5vciBJUHY0IENJRFIgZm9ybWF0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUGFyc2UgYW4gYWRkcmVzcyBhbmQgcmV0dXJuIHBsYWluIElQdjQgYWRkcmVzcyBpZiBpdCBpcyBhbiBJUHY0LW1hcHBlZCBhZGRyZXNzXG4gICAgaXBhZGRyLnByb2Nlc3MgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGFkZHIgPSB0aGlzLnBhcnNlKHN0cmluZyk7XG5cbiAgICAgICAgaWYgKGFkZHIua2luZCgpID09PSAnaXB2NicgJiYgYWRkci5pc0lQdjRNYXBwZWRBZGRyZXNzKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBhZGRyLnRvSVB2NEFkZHJlc3MoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBhZGRyO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEFuIHV0aWxpdHkgZnVuY3Rpb24gdG8gZWFzZSBuYW1lZCByYW5nZSBtYXRjaGluZy4gU2VlIGV4YW1wbGVzIGJlbG93LlxuICAgIC8vIHJhbmdlTGlzdCBjYW4gY29udGFpbiBib3RoIElQdjQgYW5kIElQdjYgc3VibmV0IGVudHJpZXMgYW5kIHdpbGwgbm90IHRocm93IGVycm9yc1xuICAgIC8vIG9uIG1hdGNoaW5nIElQdjQgYWRkcmVzc2VzIHRvIElQdjYgcmFuZ2VzIG9yIHZpY2UgdmVyc2EuXG4gICAgaXBhZGRyLnN1Ym5ldE1hdGNoID0gZnVuY3Rpb24gKGFkZHJlc3MsIHJhbmdlTGlzdCwgZGVmYXVsdE5hbWUpIHtcbiAgICAgICAgbGV0IGksIHJhbmdlTmFtZSwgcmFuZ2VTdWJuZXRzLCBzdWJuZXQ7XG5cbiAgICAgICAgaWYgKGRlZmF1bHROYW1lID09PSB1bmRlZmluZWQgfHwgZGVmYXVsdE5hbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGRlZmF1bHROYW1lID0gJ3VuaWNhc3QnO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChyYW5nZU5hbWUgaW4gcmFuZ2VMaXN0KSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHJhbmdlTGlzdCwgcmFuZ2VOYW1lKSkge1xuICAgICAgICAgICAgICAgIHJhbmdlU3VibmV0cyA9IHJhbmdlTGlzdFtyYW5nZU5hbWVdO1xuICAgICAgICAgICAgICAgIC8vIEVDTUE1IEFycmF5LmlzQXJyYXkgaXNuJ3QgYXZhaWxhYmxlIGV2ZXJ5d2hlcmVcbiAgICAgICAgICAgICAgICBpZiAocmFuZ2VTdWJuZXRzWzBdICYmICEocmFuZ2VTdWJuZXRzWzBdIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlU3VibmV0cyA9IFtyYW5nZVN1Ym5ldHNdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCByYW5nZVN1Ym5ldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3VibmV0ID0gcmFuZ2VTdWJuZXRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYWRkcmVzcy5raW5kKCkgPT09IHN1Ym5ldFswXS5raW5kKCkgJiYgYWRkcmVzcy5tYXRjaC5hcHBseShhZGRyZXNzLCBzdWJuZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmFuZ2VOYW1lO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRlZmF1bHROYW1lO1xuICAgIH07XG5cbiAgICAvLyBFeHBvcnQgZm9yIGJvdGggdGhlIENvbW1vbkpTIGFuZCBicm93c2VyLWxpa2UgZW52aXJvbm1lbnRcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBpcGFkZHI7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LmlwYWRkciA9IGlwYWRkcjtcbiAgICB9XG5cbn0odGhpcykpO1xuIl19
