
hashparams = getHashParams();

var team = hashparams["t"];
var eventid = hashparams["e"];
var matchkey = hashparams["m"];


if (!team) team = 2626;

resize();

var panelrequest = new XMLHttpRequest();
panelrequest.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    teamsyp = JSON.parse(this.responseText);

    var lftmenu = document.getElementById('leftmenu');
    for (var i = teamsyp.length-1; i >=0 ; i--) {
      lftmenu.innerHTML += '<li class="mdl-menu__item" onclick="resetHash(); setHashParams([[\'e\', \'' + teamsyp[i]["key"] + '\']]); location.reload();">' + teamsyp[i]["key"] + '</li>';
    }

    if (!eventid) eventid = getLatestEvent(teamsyp)["key"];

    getEventMatches();
  }
};
panelrequest.open('GET', 'https://www.thebluealliance.com/api/v3/team/frc' + team + '/events/simple?X-TBA-Auth-Key=wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze');
panelrequest.send();

function getEventMatches() {
  var matchesreq = new XMLHttpRequest();
  matchesreq.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      matchesresp = JSON.parse(this.responseText);
  
      matchesresp.sort(function(a,b){return (new Date(a["time"]*1000) - new Date(b["time"]*1000))})
  
      if (!matchkey) matchkey = matchesresp[0].key;
  
  
      showVideo(getMatchByKey(matchesresp, matchkey).videos[0].key, getMatchByKey(matchesresp, matchkey).key);
  
      suggestVids(matchesresp);
  
    }
  };
  matchesreq.open('GET', 'https://www.thebluealliance.com/api/v3/team/frc' + team +'/event/' + eventid + '/matches?X-TBA-Auth-Key=wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze');
  matchesreq.send();
}

function getLatestEvent(events) {
  events.sort(function(a,b) {return new Date(a["start_date"]) - new Date(b["start_date"])})
  let latestEvent = null;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (!latestEvent || new Date(event["start_date"]) < new Date()) {
      if (event["key"] != "2020qcmo"){
        latestEvent = event;
      }
    }
  }
  return latestEvent;
}

function getMatchByKey(matches, key){
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match["key"] == key) {
      return match;
    }
  }
  return null;
}

function suggestVids(matchesresp){

  var suggestedvids = document.getElementById('suggestedvids');
  suggestedvids.innerHTML = '';
  for (var i = 0; i < matchesresp.length; i++) {
    if (typeof matchesresp[i].videos[0] !== 'undefined') {
    var suggestedmvid = matchesresp[i].videos[0].key;
    var sveventkey = matchesresp[i].event_key;
    var svtitle = matchesresp[i].key;
    var svrealtitle = svtitle.replace(sveventkey + '_', "");
    //suggestedvids.innerHTML += '<div class="mdl-cell mdl-cell--2-col"><p><a href="/archives?t=' + team + '&amp;e=' + eventid + '&amp;m=' + suggestedmid + '&amp;ap=1"><img src="https://i.ytimg.com/vi/' + suggestedmvid + '/hqdefault.jpg" alt="" width="100%" /></a></p><h4 style="text-align: center;">' + svrealtitle + '</h4></div>';

    suggestedvids.innerHTML += '<div class="video-playlist-item" style="position: relative; margin-bottom: 5px;" onclick="showVideo(&quot;' + suggestedmvid + '&quot;, &quot;' + svtitle + '&quot;);"> <div class="video-playlist-item-image" style="background-image: url(&quot;https://i.ytimg.com/vi/' + suggestedmvid + '/hqdefault.jpg&quot;); width: 100%; height: 168px; background-position: center; background-size: 100%;"></div> <div class="video-playlist-item-details" style="position: absolute; bottom: 10px; left: 10px; right: 10px; margin: 0; padding: 0;"> <span class="video-playlist-item-details-title" style="display: block; font-size: 16px; font-weight: bold; color: #fff; text-shadow: 1px 1px 3px #000;">' + svrealtitle + '</span> <span class="video-playlist-item-details-description"></span> </div> </div>';
    }
  }

}

function showVideo(videokey, matchkey) {
  var mainvid = document.getElementById('mainvid');

  setHashParams([['m', matchkey]]);

  mainvid.innerHTML = '<iframe width="100%" height="700px" src="https://www.youtube.com/embed/' + videokey + '?rel=0&amp;showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen id="ytplay"></iframe>';
  mainvid.innerHTML += '<p style="text-align: center;"><iframe width="100%" height="100px" src="https://frccards.com/match?m=' + matchkey + '" frameborder="0" scrolling="no" id="frccard"></iframe></p>';
  resize();
}

function resetHash(){
  window.location.hash = "";
}

function setHashParams(newhash){

  var hash = window.location.hash.substr(1);
  var ghp = [];
  var i = 0;
  hash.split('&').reduce(function (voidd, item) {
      var parts = item.split('=');
      if (parts[0]) {
        ghp[i] = []
        ghp[i][0] = parts[0];
        ghp[i][1] = parts[1];
        i++;
      }
  }, {});

  for (var n = 0; n < newhash.length; n++) {
    var foundmatch = false;
    for (var o = 0; o < ghp.length; o++) {
      if (newhash[n][0] == ghp[o][0]) {
        ghp[o][1] = newhash[n][1];
        foundmatch = true;
      }
    }
    if (!foundmatch) {
      ghp.push(newhash[n]);
    }
  }
  var hashText = "";
  for (var i = 0; i < ghp.length; i++) {
    if (i>0) { hashText += '&' }
    hashText += ghp[i][0] + "=" + ghp[i][1];
  }
  location.hash = hashText;

}



function getHashParams() {
  var hash = window.location.hash.substr(1);

  var gethashparams = hash.split('&').reduce(function (result, item) {
      var parts = item.split('=');
      result[parts[0]] = parts[1];
      return result;
  }, {});

  return gethashparams;
}


window.addEventListener('resize', resize);
function resize(){
  var windowHeight = window.innerHeight;
  console.log(windowHeight);
  var rsv = document.getElementById('suggestedvids');
  var ryt = document.getElementById('ytplay');
  var rfrcc = document.getElementById('frccard');

  if (rsv) { rsv.style.height = (((windowHeight-64)/874) * 800) + "px"; }
  if (ryt) { ryt.height = (((windowHeight-64)/874) * 700) + "px"; }
  if (rfrcc) { rfrcc.height = (((windowHeight-64)/874) * 100) + "px"; }

}
