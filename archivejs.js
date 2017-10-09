var url_string = location.href;
var url = new URL(url_string);
var team = url.searchParams.get("t");
var eventid = url.searchParams.get("e");
var matchnb = url.searchParams.get("m");

var matchesreq = new XMLHttpRequest();

if (!team) team = 2626;
if (!eventid) eventid = '2017qcmo';
if (!matchnb) matchnb = 1;

matchnb = matchnb - 1;
matchesreq.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    matchesresp = JSON.parse(this.responseText);

    var mainvid = document.getElementById('mainvid');
    //var embededvideo = matchesresp[matchnb].videos[0].key;
    if (typeof matchesresp[matchnb] === 'undefined') {
      mainvid.innerHTML += "<p>Ce match n'existe pas!</p>";
    } else {
      mainvid.innerHTML += '<iframe width="100%" height="500" src="https://www.youtube.com/embed/' + matchesresp[matchnb].videos[0].key + '?rel=0&amp;showinfo=0&amp;autoplay=0" frameborder="0" allowfullscreen></iframe>';
    }

    var suggestedvids = document.getElementById('suggestedvids');
    for (var i = 0; i < matchesresp.length; i++) {
      var suggestedmvid = matchesresp[i].videos[0].key;
      var suggestedmid = i + 1;
      var sveventkey = matchesresp[i].event_key;
      var svtitle = matchesresp[i].key;
      var svrealtitle = svtitle.replace(sveventkey + '_', "");
      suggestedvids.innerHTML += '<div class="mdl-cell mdl-cell--2-col"><p><a href="/archives?t=' + team + '&amp;e=' + eventid + '&amp;m=' + suggestedmid + '&amp;ap=1"><img src="https://i.ytimg.com/vi/' + suggestedmvid + '/hqdefault.jpg" alt="" width="100%" /></a></p><h4 style="text-align: center;">' + svrealtitle + '</h4></div>';
    }
  }
};
matchesreq.open('GET', 'https://www.thebluealliance.com/api/v3/team/frc' + team +'/event/' + eventid + '/matches?X-TBA-Auth-Key=wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze');
matchesreq.send();
