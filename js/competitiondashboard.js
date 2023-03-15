var tbaKey = "wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze"

var teamKey = "frc2626"

fetch("https://www.thebluealliance.com/api/v3/team/" + teamKey + "/events/simple?X-TBA-Auth-Key=" + tbaKey).then(function(response){
    response.json().then(function(data){
        eventListSorted = data;
        eventListSorted.sort(function(a,b){return new Date(a["start_date"]) - new Date(b["start_date"])});
        console.log(eventListSorted);

        let currentEvent = getCurrentEventFromSortedEventList(eventListSorted);

        loadMatchFromEvent(currentEvent["key"])

        var loadEventLoop = setInterval(function(){ loadMatchFromEvent(currentEvent["key"]) }, 70000)
    })
})

function getCurrentEventFromSortedEventList(sortedEventList){

    nextOrCurrentEvent = null;

    for (let i = 0; i < sortedEventList.length; i++) {
        const event = sortedEventList[i];
        
        if (daysBetweenDates(new Date(), new Date(event["start_date"])) <= 14) {
            if (!nextOrCurrentEvent || new Date(event["start_date"]) <= new Date()) {
                nextOrCurrentEvent = event;
            }
        }
    }

    return nextOrCurrentEvent;
}

function loadMatchFromEvent(eventKey){
    fetch("https://www.thebluealliance.com/api/v3/team/" + teamKey + "/event/" + eventKey + "/matches/simple?X-TBA-Auth-Key=" + tbaKey).then(function(response){
        response.json().then(function(data){

            data.sort(function(a,b){return (new Date(a["time"]*1000) - new Date(b["time"]*1000))})

            updateNextMatchMessage(data);

            document.getElementById("matchTableBody").innerHTML = "";

            for (let i = 0; i < data.length; i++) {
                const match = data[i];
                document.getElementById("matchTableBody").innerHTML += generateRowForMatch(match);
            }
            
        })
    })
}

function updateNextMatchMessage(sortedMatches){
    let nextMatch = getNextMatch(sortedMatches);
    if (nextMatch) {
        let couleurBumper = "rouge";
        if (nextMatch["alliances"]["blue"]["team_keys"].includes(teamKey)) {
            couleurBumper = "bleu";
        }

        let nextMatchStr = 'Notre prochain match: ' + getMatchName(nextMatch) + ' ' + getMatchTimes(nextMatch) + '. Couleur de bumper: <span class="couleurBumper ' + couleurBumper + '">' + couleurBumper + '</span>.';
        document.getElementById("nextMatchMessageText").innerHTML = nextMatchStr;
    }
}

function getNextMatch(sortedMatches){
    for (let i = 0; i < sortedMatches.length; i++) {
        const match = sortedMatches[i];
        if (true || match["alliances"]["blue"]["score"] == -1 || match["alliances"]["red"]["score"] == -1) {
            return match;
        }
    }
    return null;
}

function daysBetweenDates(d1, d2){
    return (Math.abs(d1.getTime() - d2.getTime()) / (1000*60*60*24))
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

    if (match["alliances"]["red"]["team_keys"].includes(teamKey)) {
        alliance = "red";
        redAllianceAttributes += " current-team";
    }else {
        alliance = "blue";
        blueAllianceAttributes += " current-team";
    }

    let redTeams = match["alliances"]["red"]["team_keys"];
    let blueTeams = match["alliances"]["blue"]["team_keys"];

    if (match["alliances"]["blue"]["score"] == -1 || match["alliances"]["red"]["score"] == -1) {
        return '<tr><td>' + getMatchName(match) + '<span class="allianceSquare ' + alliance + '"></span></td><td class="red">' + redTeams[0].substring(3) + '</td><td class="red">' + redTeams[1].substring(3) + '</td><td class="red">' + redTeams[2].substring(3) + '</td><td class="blue">' + blueTeams[0].substring(3) + '</td><td class="blue">' + blueTeams[1].substring(3) + '</td><td class="blue">' + blueTeams[2].substring(3) + '</td><td colspan="2">' + getMatchTimes(match) + '</td></tr>';
    }

    return '<tr><td>' + getMatchName(match) + '<span class="allianceSquare ' + alliance + '"></span></td><td class="red">' + redTeams[0].substring(3) + '</td><td class="red">' + redTeams[1].substring(3) + '</td><td class="red">' + redTeams[2].substring(3) + '</td><td class="blue">' + blueTeams[0].substring(3) + '</td><td class="blue">' + blueTeams[1].substring(3) + '</td><td class="blue">' + blueTeams[2].substring(3) + '</td><td class="red' + redAllianceAttributes +'">' + match["alliances"]["red"]["score"] + '</td><td class="blue' + blueAllianceAttributes +'">' + match["alliances"]["blue"]["score"] + '</td></tr>'

}

function getMatchName(match){
    if (match["comp_level"] == "qm") {
        return "Match " + match["match_number"];
    }

    return match["comp_level"] + match["set_number"] + "m" + match["match_number"];
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

function dateToText(d){
    let dateText = "";

    if ((new Date()).getDate() != d.getDate()) {
        dateText += "Le " + d.toLocaleDateString("fr-CA", { month: 'long', day: 'numeric'}) + " ";
    }

    dateText += "à " + d.getHours() + ":" + ('0' + d.getMinutes()).slice(-2);

    return dateText;

}