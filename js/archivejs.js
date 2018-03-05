var query_string = location.search;
query_string = query_string.replace('?', '&');
var parsed_qs = parse_query_string(query_string);
var team = parsed_qs.t;
var eventid = parsed_qs.e;
var matchnb = parsed_qs.m;
var autoplay = parsed_qs.ap;

var matchesreq = new XMLHttpRequest();

if (!team) team = 2626;
if (!eventid) eventid = '2018qcmo';
if (!matchnb) matchnb = 1;
if (!autoplay) autoplay = 0;

matchnb = matchnb - 1;
matchesreq.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    matchesresp = JSON.parse(this.responseText);

    var mainvid = document.getElementById('mainvid');
    //var embededvideo = matchesresp[matchnb].videos[0].key;
    if (typeof matchesresp[matchnb] === 'undefined') {
      mainvid.innerHTML = "<p>Ce match n'existe pas!</p>";
    } else {
      if (typeof matchesresp[matchnb].videos[0] === 'undefined') {
        mainvid.innerHTML = '<p>Il n\'y a aucune vid&eacute;o de disponible pour ce match. <a href="https://www.thebluealliance.com/suggest/match/video?match_key=' + matchesresp[matchnb].key + '" target="_blank" rel="noopener">En proposer une</a></p>';
        } else {
      mainvid.innerHTML = '<iframe width="100%" height="500" src="https://www.youtube.com/embed/' + matchesresp[matchnb].videos[0].key + '?rel=0&amp;showinfo=0&amp;autoplay=' + autoplay + '" frameborder="0" allowfullscreen></iframe>';
    }
    }

    var suggestedvids = document.getElementById('suggestedvids');
    for (var i = 0; i < matchesresp.length; i++) {
      if (typeof matchesresp[i].videos[0] !== 'undefined') {
      var suggestedmvid = matchesresp[i].videos[0].key;
      var suggestedmid = i + 1;
      var sveventkey = matchesresp[i].event_key;
      var svtitle = matchesresp[i].key;
      var svrealtitle = svtitle.replace(sveventkey + '_', "");
      suggestedvids.innerHTML += '<div class="mdl-cell mdl-cell--2-col"><p><a href="/archives?t=' + team + '&amp;e=' + eventid + '&amp;m=' + suggestedmid + '&amp;ap=1"><img src="https://i.ytimg.com/vi/' + suggestedmvid + '/hqdefault.jpg" alt="" width="100%" /></a></p><h4 style="text-align: center;">' + svrealtitle + '</h4></div>';
      }
    }
  }
};
matchesreq.open('GET', 'https://www.thebluealliance.com/api/v3/team/frc' + team +'/event/' + eventid + '/matches?X-TBA-Auth-Key=wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze');
matchesreq.send();

function parse_query_string(query) {
  var vars = query.split("&");
  var query_string = {};
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
      // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
      query_string[pair[0]] = arr;
      // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
  return query_string;
}
