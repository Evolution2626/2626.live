var query_string = location.search;
query_string = query_string.replace('?', '&');
var parsed_qs = parse_query_string(query_string);
var team = parsed_qs.t;
var eventid = parsed_qs.e;
var matchnb = parsed_qs.m;
var year = parsed_qs.y;
var autoplay = parsed_qs.ap;

if (!matchnb) matchnb = 1;
if (!eventid) eventid = 0;
if (!year) year = 0;

//if (!eventid) eventid = "2017qcmo"; //temp

matchnb = matchnb - 1;

var matchesurl = '';
var suggestedstring = 'Watch other videos.'; //This is the default text

if (!team || team == 0){
  team = 0;
//if no team is specified
  if (!eventid || eventid == 0) {
  }else{
    //if an event is specified without a specific team

    matchesurl = 'https://www.thebluealliance.com/api/v3/event/' + eventid + '/matches?X-TBA-Auth-Key=nPMen3xyCoAZEXFnyhx0SFae6fLNmpyohlQb74J9BaHojEp0jCg8AE8iBur9w8cF';
    suggestedstring = 'Watch other videos from ' + eventid;

  }
}else{
  if (!eventid || eventid == 0) {
    //if a team is specified but no event is specified
    if (!year || year == 0) year = 2017;

    matchesurl = 'https://www.thebluealliance.com/api/v3/team/frc' + team + '/matches/' + year + '?X-TBA-Auth-Key=nPMen3xyCoAZEXFnyhx0SFae6fLNmpyohlQb74J9BaHojEp0jCg8AE8iBur9w8cF';
    suggestedstring = 'Watch other videos from team ' + team + ' in ' + year;

  }else {
    //if a team and an event are specified

    matchesurl = 'https://www.thebluealliance.com/api/v3/team/frc' + team + '/event/' + eventid + '/matches?X-TBA-Auth-Key=nPMen3xyCoAZEXFnyhx0SFae6fLNmpyohlQb74J9BaHojEp0jCg8AE8iBur9w8cF';
    suggestedstring = 'Watch other videos from team ' + team + ' at ' + eventid;

  }
}


var matchesreq = new XMLHttpRequest();
matchesreq.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    matchesresp = JSON.parse(this.responseText);

    var mainvid = document.getElementById('mainvid');
    //var embededvideo = matchesresp[matchnb].videos[0].key;
    if (typeof matchesresp[matchnb] === 'undefined') {
      mainvid.innerHTML = "<p>This match does not exist!</p>";
    } else {
      if (typeof matchesresp[matchnb].videos[0] === 'undefined') {
        mainvid.innerHTML = '<p>There is no video for this match. <a href="https://www.thebluealliance.com/suggest/match/video?match_key=' + matchesresp[matchnb].key + '" target="_blank" rel="noopener">Suggest a video</a></p>';
        } else {
      mainvid.innerHTML = '<iframe width="100%" height="500" src="https://www.youtube.com/embed/' + matchesresp[matchnb].videos[0].key + '?rel=0&amp;showinfo=0&amp;autoplay=' + autoplay + '" frameborder="0" allowfullscreen></iframe>';
    }
    }

    var suggestedvids = document.getElementById('suggestedvids');
    for (var i = 0; i < matchesresp.length; i++) {
      if (i == 0) {
        var suggestedstr = document.getElementById('suggeststring');
        suggestedstr.innerHTML = "" + suggestedstring;
      }
      if (typeof matchesresp[i].videos[0] !== 'undefined') {
      var suggestedmvid = matchesresp[i].videos[0].key;
      var suggestedmid = i + 1;
      var sveventkey = matchesresp[i].event_key;
      var svtitle = matchesresp[i].key;
      var svrealtitle = svtitle.replace(sveventkey + '_', "");
      suggestedvids.innerHTML += '<div class="mdl-cell mdl-cell--2-col"><p><a href="player.html?t=' + team + '&amp;e=' + eventid + '&amp;m=' + suggestedmid + '&amp;y=' + year + '&amp;ap=1"><img src="https://i.ytimg.com/vi/' + suggestedmvid + '/hqdefault.jpg" alt="" width="100%" /></a></p><h4 style="text-align: center;">' + svrealtitle + '</h4></div>';
      }
    }
  }
};
matchesreq.open('GET', matchesurl);
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
