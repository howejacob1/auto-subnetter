
/// requires
var ipaddr = require("ipaddr.js");
let BITS_IN_IP = 32;

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

initial_json = {"nodes":[{"name":"Myriel","group":1},{"name":"Napoleon","group":1},{"name":"Mlle.Baptistine","group":1},{"name":"Mme.Magloire","group":1},{"name":"CountessdeLo","group":1},{"name":"Geborand","group":1},{"name":"Champtercier","group":1},{"name":"Cravatte","group":1},{"name":"Count","group":1},{"name":"OldMan","group":1}],"links":[{"source":0,"target":1,"value":1},{"source":1,"target":2,"value":8},{"source":1,"target":3,"value":10},{"source":3,"target":4,"value":1},{"source":3,"target":5,"value":1},{"source":4,"target":6,"value":1},{"source":6,"target":7,"value":1},{"source":1,"target":4,"value":2},{"source":7,"target":8,"value":1},{"source":8,"target":9,"value":1},{"source":1,"target":9,"value":1},{"source":3,"target":9,"value":1}]};

function do_init_nodes(json) {
    // decorate a node with a count of its children
  nodes = json.nodes;
  links = json.links;
  update();
  force = force
	.nodes(nodes)
	.links(links);
    console.log("started");
  force.start();
}
do_init_nodes(initial_json);


/// utils
function is_empty(list) {
    return list.length === 0;
}

function is_undefined(thing) {
    return typeof thing === "undefined";
}


/// ip conversion utils



function str_ip_to_int_ip(str_ip) {
    let other_as_byte_array = ipaddr.parse(str_ip).toByteArray();
    let as_int = 0;
    let multiplier = 1;
    for (index = other_as_byte_array.length-1; index >= 0; index--) {
	as_int += multiplier*other_as_byte_array[index];
	multiplier *= 256;
    }
    return as_int;
}

function str_ip_to_int_ip_test() {
    return str_ip_to_int_ip("192.168.0.1");
}

// network byte order (big endian)
function int_ip_to_byte_array(int_ip, num_bytes) {
    let the_byte_array = [];
    for (let index = 0; index < num_bytes; index++) {
	the_byte_array.push(0);
    }
    for (let index = 0; index < num_bytes; index++) {
	the_byte_array[num_bytes - 1 - index] = int_ip & 255;
	int_ip = int_ip >>> 8;
    }
    return JSON.parse(JSON.stringify(the_byte_array));
}

function int_ip_to_byte_array_test() {
    return int_ip_to_byte_array(str_ip_to_int_ip("192.168.0.1"), 4);
}

// TODO: remove console.log
function int_ip_to_str_ip(int_ip) {
    return ipaddr.fromByteArray(int_ip_to_byte_array(int_ip, 4)).toString();
}

function int_ip_to_str_ip_test() {
    return int_ip_to_str_ip(str_ip_to_int_ip("192.168.0.1"), 4);
}

function set_int_ip(subnetspec, int_ip) {
    subnetspec.int_ip = int_ip;
    subnetspec.str_ip = int_ip_to_str_ip(int_ip);
}

function delete_array(array, index) {
    return [].concat(array.slice(0, index), array.slice(index + 1, array.length));
}

// 

/// main program functions

function find_closest_network(candidate_networks, target_network_bits) {
    let results = {};
    for (let index = 0; index < candidate_networks.length; index++) {
	let candidate = candidate_networks[index];
	if (candidate == null) {
	    continue;
	}
	if (candidate.network_bits == target_network_bits) {
	    results.closest_network = candidate;
	    results.index = index;
	    break;
	}
	if (candidate.network_bits < target_network_bits) {
	    if (is_undefined(results.closest_network) ||
		(candidate.network_bits > results.closest_network.network_bits)) {
		results.closest_network = candidate;
		results.index = index;
	    }
	}
    }
    return results;
}

function make_printable_network(network) {
    return int_ip_to_str_ip(network.int_ip) + "/" + network.network_bits;
}

function make_printable_list_of_networks(list_of_networks) {
    let cur_network;
    let as_strs = [];
    for (let index = 0; index < list_of_networks.length; index++) {
	cur_network = list_of_networks[index];
	if ((cur_network != null) && !(is_undefined(cur_network))) {
	    as_strs.push(make_printable_network(cur_network));
	}
    }
    return as_strs;
}


// now go through all the available subnets
// subnetspec: {ip_int: ip_as_int}
// returns two subnets,
function half_subnetspec(subnetspec) {
    let network_bits = subnetspec.network_bits + 1;
    first_subnet = {int_ip: subnetspec.int_ip,
		    network_bits: network_bits,
		    str_ip: int_ip_to_str_ip(subnetspec.int_ip)};
    int_ip_second_subnet = subnetspec.int_ip + Math.pow(2, 32-network_bits)
    second_subnet = {int_ip: int_ip_second_subnet,
		     str_ip: int_ip_to_str_ip(int_ip_second_subnet),
		     network_bits: network_bits};
    console.log("halfed subnet " + make_printable_network(subnetspec) + " into " + make_printable_network(first_subnet) + " and " + make_printable_network(second_subnet));
    return [first_subnet, second_subnet];
}

function allocate_ips(starting_int_ip, network_bits, num_hosts_list) {
    let starting_network = {};
    set_int_ip(starting_network, starting_int_ip);
    starting_network.network_bits = network_bits;
    let allocated_networks = [starting_network];
    // we're going to have an array of descriptions of what happened
    // so like if num_hosts_list is [100 150 39]
    // we make an array [{num_hosts: 100, index: 0}]
    let num_hosts_sorted_info = new Array(num_hosts_list.length);
    for (let index = 0; index < num_hosts_list.length; index++) {
	num_hosts_sorted_info[index]
	    = {"num_hosts": num_hosts_list[index], "index": index};
    }
    num_hosts_sorted_info.sort((function (num_hosts_info_1, num_hosts_info_2) {
	return num_hosts_info_1.num_hosts < num_hosts_info_2.num_hosts;
    }));

    console.log(num_hosts_sorted_info);
    // // we will make a list [1 0 2] for the order in which to process the host indexs
    // // 
    
    for (let index = 0; index < num_hosts_sorted_info.length; index++) {
	let num_hosts_info = num_hosts_sorted_info[index];
	let num_required_ips = num_hosts_info.num_hosts + 2; // add broadcast/network address
	// first find the next largest power of two that fits.
	let target_subnet_bits = Math.ceil(Math.log2(num_required_ips));
	let target_network_bits = BITS_IN_IP - target_subnet_bits;
	let target_subnet_num_ips = Math.pow(2, target_subnet_bits);
	console.log("searching for a /" + target_network_bits + " handling " + target_subnet_num_ips + " IPs for " + num_hosts_info.num_hosts + " hosts.");
	// to find the subnet we'd like out of all available subnets easily,
	// I first remove all networks below our size
	let network_chosen = false;
	let target_network;
	let target_network_index;
	let results;
	while (!network_chosen) {
	    console.log("working on these networks for a /" + target_network_bits + " at the beginning: " + make_printable_list_of_networks(allocated_networks));
	    
	    results = find_closest_network(allocated_networks, target_network_bits);
	    console.log("results: " + JSON.stringify(results));
	    target_network = results.closest_network;
	    target_network_index = results.index;
	    // this means that there is not even a valid close network.
	    if (is_undefined(target_network)) {
		return false;
	    }
	    if (target_network.network_bits == target_network_bits) {
		allocated_networks = delete_array(allocated_networks, target_network_index);
		console.log("found equal network.");
		network_chosen = true;
	    } else { // when network_bits is less than than target network bits
		// this network is too large. We have to divide it. 
		allocated_networks = delete_array(allocated_networks, target_network_index);
		allocated_networks = allocated_networks.concat(half_subnetspec(target_network));
		console.log(JSON.stringify(allocated_networks));
	    }
	}
	// target_network must be defined here, already checked
	// now we have the network we're going to use. add it to the
	num_hosts_info.target_network = target_network;
	console.log("allocated " + make_printable_network(target_network) + " to " + num_hosts_info.num_hosts + " hosts.");
	
    }
    console.log(num_hosts_sorted_info);	

    for (let index = 0; index < num_hosts_sorted_info.length; index++) {
	let num_hosts_info = num_hosts_sorted_info[index];
	str_ip = int_ip_to_str_ip(num_hosts_info.target_network.int_ip);
	console.log("allocated " + num_hosts_info.target_network.int_ip + " " + str_ip + "/" + num_hosts_info.target_network.network_bits + " for " + num_hosts_info.num_hosts + " hosts at index " + num_hosts_info.index + ".");
    }
    // 	console.log("subnet_num_ips: " + subnet_num_ips + "target_subnet_size: " + target_subnet_size);
    // 	// now find the next largest IP subnet that fits
    // }
    // if (is_empty(networks_available) && !is_empty(num_hosts_list)) {
    // 	console.log("not enough networks available");
    // }
    // return allocated_networks;
}

// TODO: rename
function allocate_ip_test() {
    let int_ip = str_ip_to_int_ip("192.168.1.0");
    
    // console.log("as integer: " + int_ip);
    // console.log("192.168.1.0");
    // console.log(int_ip_to_str_ip(int_ip + 256));
    // console.log("192.168.1.0 as byte array: " + JSON.stringify(int_ip_to_byte_array(int_ip, 4)));
    // console.log("192.168.1.0 + 256 as byte array: " + JSON.stringify(int_ip_to_byte_array(int_ip + 256, 4)));
    console.log(allocate_ips(int_ip, 24, [62, 62, 100]));
    // console.log()
    // console.log("as byte array: " + int_ip_to_byte_array_test());
    // console.log("as int: " + str_ip_to_int_ip_test());
    // console.log("here");
    // console.log("as str: " + int_ip_to_str_ip_test());
    // console.log("str->int->str: " + int_ip_to_str_ip(str_ip_to_int_ip("192.168.0.1")));
}

global.allocate_ip_test = allocate_ip_test;


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
