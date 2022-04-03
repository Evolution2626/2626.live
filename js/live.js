var tbaKey = "wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze"

fetch("https://www.thebluealliance.com/api/v3/team/frc2626/events?X-TBA-Auth-Key=" + tbaKey).then(function(response){
    response.json().then(function(data){
        eventListSorted = data;
        eventListSorted.sort(function(a,b){return new Date(a["start_date"]) - new Date(b["start_date"])});
        console.log(eventListSorted);

        let currentEvent = getCurrentEventFromSortedEventList(eventListSorted);
        
        loadSideBarFormCurrentEvent(currentEvent);

        loadMatchFromEvent(currentEvent["key"]);

        var sidebarEventLoop = setInterval(function(){ loadMatchFromEvent(currentEvent["key"]) }, 70000)

        loadLivestreamsForEvent(currentEvent);
    })
})


function daysBetweenDates(d1, d2){
    return (Math.abs(d1.getTime() - d2.getTime()) / (1000*60*60*24))
}

function getCurrentEventFromSortedEventList(sortedEventList){

    nextOrCurrentEvent = null;

    for (let i = 0; i < sortedEventList.length; i++) {
        const event = sortedEventList[i];
        
        if (daysBetweenDates(new Date(), new Date(event["start_date"])) <= 14) {
            if (!nextOrCurrentEvent || new Date(nextOrCurrentEvent["end_date"]) <= new Date() || new Date(event["start_date"]) <= new Date()) {
                nextOrCurrentEvent = event;
            }
        }
    }

    return nextOrCurrentEvent;
}

function loadSideBarFormCurrentEvent(currentEvent){
    if (currentEvent) {
        document.getElementById("currentEventName").innerText = currentEvent["name"];
    }
}

function getMatchTimes(match){

    if (match["actual_time"]) {
        return "À été joué " + dateToText(new Date(match["actual_time"]*1000));
    }

    if (match["predicted_time"] && match["predicted_time"] > 0) {
        return "Devrait être joué " + dateToText(new Date(match["predicted_time"]*1000));
    }

    if (match["time"]) {
        return "Est prévu à l'horaire " + dateToText(new Date(match["time"]*1000));
    }

    return "";


}

function loadMatchFromEvent(eventKey){
    fetch("https://www.thebluealliance.com/api/v3/team/frc2626/event/" + eventKey + "/matches?X-TBA-Auth-Key=" + tbaKey).then(function(response){
    response.json().then(function(data){

        data.sort(function(a,b){return (new Date(a["time"]*1000) - new Date(b["time"]*1000))})

        console.log(data)
        if (data.length == 0) {
            document.getElementById("horaireMatchStatus").innerText = "L'horaire des matchs n'est pas encore disponible";
        }else{
            document.getElementById("horaireMatchStatus").innerText = "";
            document.getElementById("horaireMatchs").style.display = '';
        }
        
        document.getElementById("eventVideosButton").href = "/archives#e=" + eventKey;

        document.getElementById("matchTableBody").innerHTML = "";

        for (let i = 0; i < data.length; i++) {
            const match = data[i];
            document.getElementById("matchTableBody").innerHTML += generateRowForMatch(match);
        }
    })
})
}


function generateRowForMatch(match){
    let alliance = "";

    let blueAllianceAttributes = "";
    let redAllianceAttributes = "";

    if (match["winning_alliance"] == "blue") {
        blueAllianceAttributes += " winner";
    }

    if (match["winning_alliance"] == "red") {
        redAllianceAttributes += " winner";
    }

    if (match["alliances"]["red"]["team_keys"].includes("frc2626")) {
        alliance = "red";
        redAllianceAttributes += " current-team";
    }else {
        alliance = "blue";
        blueAllianceAttributes += " current-team";
    }

    let videoButton = "";

    if (match["videos"].length > 0) {
        videoButton = '<a href="/archives#m=' + match["key"] + '"><span class="material-icons">play_circle</span></a>'
    }

    if (match["alliances"]["blue"]["score"] == -1 || match["alliances"]["red"]["score"] == -1) {
        return '<tr>' + videoButton + '<td></td><td>' + getMatchName(match) + '<span class="allianceSquare ' + alliance + '"></span></td><td colspan="2">' + getMatchTimes(match) + '</td></tr>';
    }

    return '<tr><td>' + videoButton + '</td><td>' + getMatchName(match) + '<span class="allianceSquare ' + alliance + '"></span></td><td class="red' + redAllianceAttributes +'">' + match["alliances"]["red"]["score"] + '</td><td class="blue' + blueAllianceAttributes +'">' + match["alliances"]["blue"]["score"] + '</td></tr>'

}

function getMatchName(match){
    if (match["comp_level"] == "qm") {
        return "Match " + match["match_number"];
    }

    return match["comp_level"] + match["set_number"] + "m" + match["match_number"];
}

function loadLivestreamsForEvent(event){
    if (event["webcasts"] && event["webcasts"].length > 0) {
        let livestreamWidth = "100%";
        let livestreamHeight = "100%";

        if (event["webcasts"].length >= 2){
            let windowWidth = document.getElementById("livestreamsDiv").offsetWidth;
            let windowHeight = document.getElementById("livestreamsDiv").offsetHeight;
            console.log(windowWidth)
            console.log(windowHeight)
            if (((16/9) * (windowHeight/2)) < (windowWidth/2)) {
                livestreamWidth = "50%";
                console.log((16/9) * windowHeight)
            }else{
                livestreamHeight = "50%";
            }
        }

        document.getElementById("livestreamsDiv").innerHTML = "";
        for (let i = 0; i < event["webcasts"].length && i < 2; i++) {
            const webcast = event["webcasts"][i];

            if (webcast["type"] == "twitch") {
                document.getElementById("livestreamsDiv").innerHTML += '<iframe class="livestreamframe" src="https://player.twitch.tv/?channel=' + webcast["channel"] + '&parent=2626.live" allowfullscreen style="width: ' + livestreamWidth + '; height: ' + livestreamHeight + ';">';
            }
        }
    } else {
        document.getElementById("livestreamsDiv").innerHTML = '<h3 style="text-align: center;">La diffusion en direct de cet événement n\'est pas encore disponible.</h3>';
    }
}

function dateToText(d){
    let dateText = "";

    if ((new Date()).getDate() != d.getDate()) {
        dateText += "Le " + d.toLocaleDateString("fr-CA", { month: 'long', day: 'numeric'}) + " ";
    }

    dateText += "à " + d.getHours() + ":" + d.getMinutes();

    return dateText;

}