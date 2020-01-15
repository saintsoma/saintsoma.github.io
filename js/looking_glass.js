const IP_SDN_CONTOLLER_IP = "203.255.250.35";
const IP_SDN_CONTOLLER_PORT = 8180;
const NODE_REGIONS = [
    { name: '서울', node_id:'P1-Seoul', region: 'SE' },
    { name: '대전', node_id:'P2-Daejeon', region: 'DJ' },
    { name: '판교', node_id:'P3-Pangyo', region: 'PG' },
    { name: '수원', node_id:'P3-Pangyo', region: 'SW' },
    { name: '광주', node_id:'P4-Gwangju', region: 'GJ' },
    { name: '대구', node_id:'P5-Daegu', region: 'DG' },
    { name: '부산', node_id:'P5-Daegu', region: 'BS' }
]
var selectedNodeId = "";
var selectedRegion = "";
function callIpSdnAPI(method, url, data, _success, _error) {
    var newUrl = "http://" + IP_SDN_CONTOLLER_IP + ":" + IP_SDN_CONTOLLER_PORT + url;
    let option = {
        crossDomain: true,
        type: method,
        url: newUrl,
        data, data,
        success: function(data, textStatus, jqXHR){
            _success(data);
        },
        error: function(jqXHR, textStatus, errorThrown){ 
            console.log(errorThrown);
            _error(errorThrown);
        }
    };
    $.ajax(option);
}

function setNode(nodeId, region, nodeName) {
    selectedNodeId = nodeId;
    selectedRegion = region;
    $("#node_id").text(nodeName);
}

function doExecute() {
    var st = $(":input:radio[name=execute_type]:checked").val();
    var dst = $("#dst").val();
    if(selectedNodeId && selectedRegion && dst) {
        if(st === "ping") {
            ping(selectedNodeId, selectedRegion, dst);
        } else if(st === "traceroute") {
            traceRoute(selectedNodeId, selectedRegion, dst);
        } else if(st === "BGP") {
            bgp(selectedNodeId, selectedRegion, dst);
        }    
    } else {
        alert("입력 값이 충분하지 않습니다. 모든 항목을 입력했는지 확인 해 보세요.");
    }
}

function getIpSdnNodes() {
    callIpSdnAPI("GET", "/1.0/topology", "", data => {
        var listHtml = '';
        for(let i = 0;i < data.network_topology.topology.node.length;i++) {
           var node = data.network_topology.topology.node[i];
           listHtml += '<a href="javascript:setNode(\''+ node.node_id +'\')" class="dropdown-item">'+ node.node_id +'</a>';  
        }
        $("#ip_sdn_nodes").html(listHtml);
    }, error => {
        console.log(error);
        alert("IP SDN 토폴로지 조회 실패." + error.message ? error.message:error);
    });

    // var listHtml = '';
    // for(let i = 0;i < NODE_REGIONS.length;i++) {
    //     var node = NODE_REGIONS[i];
    //     listHtml += '<a href="javascript:setNode(\''+ node.node_id +'\', \''+ node.region +'\', \''+ node.name +'\')" class="dropdown-item">'+ node.name +'</a>';  
    // }
    // $("#ip_sdn_nodes").html(listHtml);
}

function ping(node, region, dst) {
    $("#execute_result").html("");
    callIpSdnAPI("GET", "/1.0/LG/ping/node/" + node + "/region/" + region + "/destination/" + dst, "", data => {
        if("error" in data) {
            $("#execute_result").html(data.error);
        } else {
            let html = "";
            for(let i = 0;i < data.ping.length;i++) {
                html  += data.ping[i] + "<br/>"
            }
            $("#execute_result").html(html);
        }
        
    }, error => {
        console.log(error);
        alert("IP SDN Ping 실패." + error.message ? error.message:error);
    });
}

function traceRoute(node, region, dst) {
    $("#execute_result").html("");
    callIpSdnAPI("GET", "/1.0/LG/traceroute/node/" + node + "/region/" + region + "/destination/" + dst, "", data => {
        if("error" in data) {
            $("#execute_result").html(data.error);
        } else {
            let html = "";
            for(let i = 0;i < data.traceroute.length;i++) {
                html  += data.traceroute[i] + "<br/>"
            }
            $("#execute_result").html(html);
        }
    }, error => {
        console.log(error);
        alert("IP SDN Trace Route 실패." + error.message ? error.message:error);
    });
}

function bgp(node, region, dst) {
    $("#execute_result").html("");
    callIpSdnAPI("GET", "/1.0/LG/BGP/node/" + node + "/region/" + region + "/destination/" + dst, "", data => {
        if("error" in data) {
            $("#execute_result").html(data.error);
        } else {
            let html = "";
            for(let i = 0;i < data.data.length;i++) {
                html  += data.data[i] + "<br/>"
            }
            $("#execute_result").html(html);
        }
    }, error => {
        console.log(error);
        alert("BGP Path 실패." + error.message ? error.message:error);
    });
}

function bgpStatus(node, region, callback) {
    callIpSdnAPI("GET", "/1.0/LG/BGP/node/" + node + "/region/" + region + "/destination/" + dst, "", data => {
        callback(data);
    }, error => {
        console.log(error);
        alert("BGP Path 실패." + error.message ? error.message:error);
    });
}

function showTime() {
    var today = new Date();
    var hh = today.getHours();
    var mi = today.getMinutes();
    var ss = today.getSeconds();
    $("#timeLabel").html(hh + ":" + mi + ":" + ss);
}

function startClock() {
    showTime();
    setInterval(showTime, 1000);
}

$( document ).ready(function() {
    startClock();
    getIpSdnNodes();
} );