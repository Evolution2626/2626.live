
hashparams = getHashParams();

var team = hashparams["t"];
var eventid = hashparams["e"];
var matchnb = hashparams["m"];


var matchesreq = new XMLHttpRequest();

if (!team) team = 2626;
if (!eventid) eventid = '2019qcqc';
if (!matchnb) matchnb = 1;

resize();

matchnb = matchnb - 1;
matchesreq.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    matchesresp = JSON.parse(this.responseText);

    var sortedmatches = Enumerable.From(matchesresp)
    .Where(function (x) { return true})
    .OrderBy(function (x) {
      var addvalue = 0;
      switch (x.comp_level) {
        case "qm":
          addvalue = 0;
          break;
        case "ef":
          addvalue = 500;
          break;
        case "qf":
          addvalue = 1000;
          break;
        case "sf":
          addvalue = 1500;
          break;
        case "f":
          addvalue = 2000;
          break;
        default:
          addvalue = 0;
      }

      return (x.match_number + addvalue + (x.set_number * 20));
     })
    .OrderBy(function(x) { return x.event_key })
    .Select(function (x) { return x })
    .ToArray();

    matchesresp = sortedmatches;


    showVideo(matchesresp[matchnb].videos[0].key, matchesresp[0].key, matchnb+1);

    suggestVids(matchesresp);

  }
};
matchesreq.open('GET', 'https://www.thebluealliance.com/api/v3/team/frc' + team +'/event/' + eventid + '/matches?X-TBA-Auth-Key=wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze');
matchesreq.send();

var panelrequest = new XMLHttpRequest();
    panelrequest.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        teamsyp = JSON.parse(this.responseText);

        for (var i = teamsyp.length-1; i >=0 ; i--) {
          var lftmenu = document.getElementById('leftmenu');
          lftmenu.innerHTML += '<li class="mdl-menu__item" onclick="setHashParams([[\'e\', \'' + teamsyp[i] + '\']]); location.reload();">' + teamsyp[i] + '</li>';
        }

      }
    };
    panelrequest.open('GET', 'https://www.thebluealliance.com/api/v3/team/frc' + team + '/events/keys?X-TBA-Auth-Key=nPMen3xyCoAZEXFnyhx0SFae6fLNmpyohlQb74J9BaHojEp0jCg8AE8iBur9w8cF');
    panelrequest.send();

function suggestVids(matchesresp){

  var suggestedvids = document.getElementById('suggestedvids');
  suggestedvids.innerHTML = '';
  for (var i = 0; i < matchesresp.length; i++) {
    if (typeof matchesresp[i].videos[0] !== 'undefined') {
    var suggestedmvid = matchesresp[i].videos[0].key;
    var suggestedmid = i + 1;
    var sveventkey = matchesresp[i].event_key;
    var svtitle = matchesresp[i].key;
    var svrealtitle = svtitle.replace(sveventkey + '_', "");
    //suggestedvids.innerHTML += '<div class="mdl-cell mdl-cell--2-col"><p><a href="/archives?t=' + team + '&amp;e=' + eventid + '&amp;m=' + suggestedmid + '&amp;ap=1"><img src="https://i.ytimg.com/vi/' + suggestedmvid + '/hqdefault.jpg" alt="" width="100%" /></a></p><h4 style="text-align: center;">' + svrealtitle + '</h4></div>';

    suggestedvids.innerHTML += '<div class="video-playlist-item" style="position: relative; margin-bottom: 5px;" onclick="showVideo(&quot;' + suggestedmvid + '&quot;, &quot;' + svtitle + '&quot;, &quot;' + suggestedmid + '&quot;);"> <div class="video-playlist-item-image" style="background-image: url(&quot;https://i.ytimg.com/vi/' + suggestedmvid + '/hqdefault.jpg&quot;); width: 100%; height: 168px; background-position: center; background-size: 100%;"></div> <div class="video-playlist-item-details" style="position: absolute; bottom: 10px; left: 10px; right: 10px; margin: 0; padding: 0;"> <span class="video-playlist-item-details-title" style="display: block; font-size: 16px; font-weight: bold; color: #fff; text-shadow: 1px 1px 3px #000;">' + svrealtitle + '</span> <span class="video-playlist-item-details-description"></span> </div> </div>';
    }
  }

}

function showVideo(videokey, matchkey, matchid) {
  var mainvid = document.getElementById('mainvid');

  setHashParams([['m', matchid]]);

  mainvid.innerHTML = '<iframe width="100%" height="700px" src="https://www.youtube.com/embed/' + videokey + '?rel=0&amp;showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen id="ytplay"></iframe>';
  mainvid.innerHTML += '<p style="text-align: center;"><iframe width="100%" height="100px" src="https://frccards.com/match?m=' + matchkey + '" frameborder="0" scrolling="no" id="frccard"></iframe></p>';
  resize();
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
