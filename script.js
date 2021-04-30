//var API_KEY = "12A1D1DE83F9932934EDD6DF2BA00463";
var API_KEY = "";
var lookup = [];
var idslength = 0;

// # userid name uniqueid connected ping loss state
var text = `#    809 "❣г๏zเt๏❣" [U:1:172149372]   29:11      100    0 active #    810 "[ARG] Elver Gachica TRADEIT.GG" [U:1:411922788] 26:00  100    0 active #    819 "pontofrio2"               [U:1:162676685]     06:56       73    0 active #    820 "Gost9"             [U:1:908530649]     02:27      131    0 active #    811 "guilherme_nunes01" [U:1:100333969]     23:10       56    0 active #    821 "Egg.exe"           [U:1:115470465]     01:16       63    0 active #    816 "ＴΞｓｓΞＲ"  [U:1:98267072]      17:40      106    0 active #    785 "fuckus cuntus"     [U:1:891308439]     55:05       67    0 active #    815 "teminatorr79"      [U:1:430865125]     20:19       98    0 active #    787 "P O T A T 0 E"     [U:1:479985360]     50:04       47    0 active #    798 "(ElPeña)"         [U:1:893323848]     44:23       77    0 active #    784 "PowerGuidO CSGOEmpire.com" [U:1:491171849] 55:27   63    0 active #    789 "Avash"       [U:1:44002738]    49:54       76    0 active #    757 "Blyatman"          [U:1:413787685]      1:33:55   104    0 active #    788 "dvsilva2006"     [U:1:1004176048]     50:04       47    0 active`;

// prompt doesnt retain line breaks
var input = prompt("Input value from status on console", text);
console.log("input", input);

var all_data = input
  .split(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g)
  .filter((e) => e.trim().length > 0);

console.log("all_data", all_data);
all_data.forEach((elem, index) => {
  if (elem.length >= 15) {
    var isSteamId3 = elem.includes("[U:1:");
    if (isSteamId3) {
      var rawid = elem;
      rawid = rawid.replace(/\[U:1:/g, "");
      rawid = rawid.replace(/]/g, "");
      var id64 = getId(rawid);

      lookup[id64] = {
        name: all_data[index - 1]
      };
    }
  }
  console.log("skipped", elem);
});
console.log("lookup", lookup);
//throw new Error("stop");

function addRow(link, vac, profile, level, personaname) {
  //console.log(link);
  //console.log(vac);
  //console.log(profile);
  //console.log(level);

  var table = document.getElementById("dataTable");

  var rowCount = table.rows.length;
  var row = table.insertRow(rowCount);

  var cell1 = row.insertCell(0);
  cell1.appendChild(link);

  var cell2 = row.insertCell(1);
  cell2.appendChild(vac);

  var cell3 = row.insertCell(2);
  cell3.appendChild(profile);

  var cell4 = row.insertCell(3);
  cell4.appendChild(level);

  var cell5 = row.insertCell(4);
  var elem = document.createElement("span");
  elem.innerHTML = personaname;
  cell5.appendChild(elem);
}

function byLevel(x, y) {
  if (parseInt(x.Level.innerHTML) < parseInt(y.Level.innerHTML)) {
    return -1;
  }
  if (parseInt(x.Level.innerHTML) > parseInt(y.Level.innerHTML)) {
    return 1;
  }
  return 0;
}

var tableData = [];
function orderThing() {
  for (var key in lookup) {
    // check if the property/key is defined in the object itself, not in parent
    if (lookup.hasOwnProperty(key)) {
      tableData.push(lookup[key]);
    }
  }
  console.log(tableData);
  tableData.sort(byLevel);
  console.log(tableData);
}

function fillTable2() {
  tableData.forEach(function (element) {
    addRow(
      element.Link,
      element.VAC,
      element.Profile,
      element.Level,
      element.Personaname
    );
  });
}

function fillTable() {
  console.log(lookup);
  for (var key in lookup) {
    // check if the property/key is defined in the object itself, not in parent
    if (lookup.hasOwnProperty(key)) {
      //console.log(key, lookup[key]);
      addRow(
        lookup[key].Link,
        lookup[key].VAC,
        lookup[key].Profile,
        lookup[key].Level
      );
    }
  }
}

// Javascript does not work well with integers greater than 53 bits precision... So we need
// to do our maths using strings.
function getDigit(x, digitIndex) {
  return digitIndex >= x.length ? "0" : x.charAt(x.length - digitIndex - 1);
}

function prefixZeros(strint, zeroCount) {
  var result = strint;
  for (var i = 0; i < zeroCount; i++) {
    result = "0" + result;
  }
  return result;
}

//Only works for positive numbers, which is fine in our use case.
function add(x, y) {
  var maxLength = Math.max(x.length, y.length);
  var result = "";
  var borrow = 0;
  var leadingZeros = 0;

  for (var i = 0; i < maxLength; i++) {
    var lhs = Number(getDigit(x, i));
    var rhs = Number(getDigit(y, i));
    var digit = lhs + rhs + borrow;
    borrow = 0;

    while (digit >= 10) {
      digit -= 10;
      borrow++;
    }

    if (digit === 0) {
      leadingZeros++;
    } else {
      result = String(digit) + prefixZeros(result, leadingZeros);
      leadingZeros = 0;
    }
  }

  if (borrow > 0) {
    result = String(borrow) + result;
  }

  return result;
}

function getId(miniProfileId) {
  var steam64identifier = "76561197960265728";
  return add(steam64identifier, miniProfileId);
}

var completed_bans = 0;
function onBansData(xmlHttp) {
  console.log(xmlHttp);
  if (xmlHttp.readyState == XMLHttpRequest.DONE) {
    completed_bans++;
    if (xmlHttp.status == 200) {
      var data = JSON.parse(xmlHttp.responseText);
      // setup lookup
      data.players.forEach(function (player) {
        var playerEl = lookup[player.SteamId];
        //console.log(player);
        var span = document.createElement("span");

        var inner = "";
        if (player.NumberOfVACBans || player.NumberOfGameBans) {
          if (player.NumberOfGameBans) {
            inner +=
              "<div>" + player.NumberOfGameBans + " Game bans</div>";
          }
          if (player.NumberOfVACBans) {
            inner +=
              '<div style="color:red;">' +
              player.NumberOfVACBans +
              " VAC bans</div>";
          }
          inner += "<div>" + player.DaysSinceLastBan + " days ago</div>";
          span.innerHTML = inner;
        } else {
          span.innerHTML = "<div>n/a</div>";
        }

        var anchor = document.createElement("a");
        anchor.href =
          "https://steamcommunity.com/profiles/" + player.SteamId;
        anchor.innerHTML = lookup[player.SteamId]["name"];

        var PlayerEntry = lookup[player.SteamId];
        PlayerEntry["Link"] = anchor;
        PlayerEntry["VAC"] = span;
      });
    } else {
      console.log("onBansData error: " + xmlHttp.readyState);
    }
    console.log("bans");
    console.log(completed_bans);
    checkIfDone();
  }
}

var completed_sum = 0;
function onSummaryData(xmlHttp) {
  console.log(xmlHttp);
  if (xmlHttp.readyState === XMLHttpRequest.DONE) {
    completed_sum++;
    if (xmlHttp.status === 200) {
      var data = JSON.parse(xmlHttp.responseText);
      console.log(data);
      //var playerEl = lookup[player.SteamId];
      data.response.players.forEach(function (player) {
        var span = document.createElement("span");
        var inner = "";
        if (player.communityvisibilitystate !== 3) {
          span.innerHTML = "hidden";
        } else {
          span.innerHTML = "n/a";
        }

        var PlayerEntry = lookup[player.steamid];
        PlayerEntry["Profile"] = span;
        PlayerEntry["Personaname"] = player.personaname;
      }, this);
    } else {
      console.log("onSummaryData error: " + xmlHttp.readyState);
    }
    checkIfDone();
  }
}

function checkIfDone() {
  if (
    completed_levels >= idslength &&
    completed_bans > 0 &&
    completed_sum > 0
  ) {
    //fillTable();
    orderThing();
    fillTable2();
    console.log("ending execution.");
    throw new Error();
  }
}

var completed_levels = 0;
function onSteamlevelData(xmlHttp, id) {
  console.log(xmlHttp);
  if (xmlHttp.readyState == XMLHttpRequest.DONE) {
    completed_levels++;
    if (xmlHttp.status == 200) {
      var data = JSON.parse(xmlHttp.responseText);
      //console.log(data);
      var span = document.createElement("span");
      span.innerHTML = data.response.player_level;
      var PlayerEntry = lookup[id];
      PlayerEntry["Level"] = span;
    } else {
      console.log("onSteamlevelData error: " + xmlHttp.readyState);
    }
    console.log("levels");
    console.log(completed_levels);
    console.log(idslength);
    checkIfDone();
  }
}

function makePlayerBansRequest(ids) {
  var xmlHttp = new XMLHttpRequest();
  //API only allows 100 steam ids at once.
  var endpointRoot =
    "https://stark-woodland-93683.herokuapp.com/https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=" +
    API_KEY +
    "&steamids=";
  var endpoint = endpointRoot + ids.join(",");
  xmlHttp.open("GET", endpoint, true);
  xmlHttp.onreadystatechange = function () {
    if (document.readyState == "complete") {
      onBansData(xmlHttp);
    } else {
      console.log("makePlayerBansRequest: " + xmlHttp.readyState);
    }
  };
  xmlHttp.send();
}

function makePlayerSummariesRequest(ids) {
  var xmlHttp = new XMLHttpRequest();
  //API only allows 100 steam ids at once.
  var endpointRoot =
    "https://stark-woodland-93683.herokuapp.com/https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" +
    API_KEY +
    "&steamids=";
  var endpoint = endpointRoot + ids.join(",");
  xmlHttp.open("GET", endpoint, true);
  xmlHttp.onreadystatechange = function () {
    if (document.readyState == "complete") {
      onSummaryData(xmlHttp);
    } else {
      console.log("makePlayerBansRequest: " + xmlHttp.readyState);
    }
  };
  xmlHttp.send();
}

function makePlayerSteamlevelRequest(ids) {
  console.log(ids);
  ids.forEach(function (id, index) {
    var xmlHttp = new XMLHttpRequest();
    //API only allows 1 steam id at once.
    var endpointRoot =
      "https://stark-woodland-93683.herokuapp.com/https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=" +
      API_KEY +
      "&steamid=";
    var endpoint = endpointRoot + id;
    xmlHttp.open("GET", endpoint, true);
    xmlHttp.onreadystatechange = function () {
      if (document.readyState == "complete") {
        onSteamlevelData(xmlHttp, id); // Another callback here
      } else {
        console.log("makePlayerSteamlevelRequest: " + xmlHttp.readyState);
      }
    };
    xmlHttp.send();
  });
}

var ids = Object.keys(lookup);
idslength = ids.length;
makePlayerBansRequest(ids);
makePlayerSummariesRequest(ids);
makePlayerSteamlevelRequest(ids);
