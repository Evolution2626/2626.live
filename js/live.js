var tbaKey = "wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze"

fetch("https://www.thebluealliance.com/api/v3/team/frc2626/events?X-TBA-Auth-Key=" + tbaKey).then(function(response){
    response.json().then(function(data){
        eventListSorted = data;
        eventListSorted.sort(function(a,b){return new Date(a["start_date"]) - new Date(b["start_date"])});
        console.log(eventListSorted);

        let currentEvent = getCurrentEventFromSortedEventList(eventListSorted);
        loadSideBarFormCurrentEvent(currentEvent);
        loadMatchFromEvent(currentEvent["key"]);
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
            if (!nextOrCurrentEvent || new Date(event["end_date"]) >= new Date()) {
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
        return [["À été joué", dateToText(new Date(match["actual_time"]*1000))]]
    }

    let matchTimes = [];

    if (match["time"]) {
        matchTimes.push([["Est prévu à l'horaire", dateToText(new Date(match["time"]*1000))]]);
    }

    if (match["predicted_time"]) {
        matchTimes.push([["Devrait être joué", dateToText(new Date(match["predicted_time"]*1000))]]);
    }

    return matchTimes;


}

function loadMatchFromEvent(eventKey){
    fetch("https://www.thebluealliance.com/api/v3/team/frc2626/event/" + eventKey + "/matches/simple?X-TBA-Auth-Key=" + tbaKey).then(function(response){
    response.json().then(function(data){

        data.sort(function(a,b){return (new Date(a["time"]*1000) - new Date(b["time"]*1000))})

        console.log(data)
        if (data.length == 0) {
            document.getElementById("horaireMatchStatus").innerText = "L'horaire des matchs n'est pas encore disponible";
        }else{
            document.getElementById("horaireMatchStatus").innerText = "";
        }
        document.getElementById("horaireMatchs").innerHTML = "";

        for (let i = 0; i < data.length; i++) {
            const match = data[i];
            document.getElementById("horaireMatchs").innerHTML += "<h4>Match " + match["comp_level"] + match["set_number"] + "m" + match["match_number"] + " :</h4>";
            matchTimes = getMatchTimes(match);
            for (let j = 0; j < matchTimes.length; j++) {
                const matchTime = matchTimes[j];
                document.getElementById("horaireMatchs").innerHTML += "<p>" + matchTime[0] + ": " + matchTime[1] + "</p>";
            }
        }
    })
})
}

function loadLivestreamsForEvent(event){
    if (event["webcasts"] && event["webcasts"].length > 0) {
        let livestreamWidth = "100%";

        if (event["webcasts"].length >= 2){
            livestreamWidth = "50%";
        }

        document.getElementById("livestreamsDiv").innerHTML = "";
        for (let i = 0; i < event["webcasts"].length && i < 2; i++) {
            const webcast = event["webcasts"][i];

            if (webcast["type"] == "twitch") {
                document.getElementById("livestreamsDiv").innerHTML += '<iframe class="livestreamframe" src="https://player.twitch.tv/?channel=' + webcast["channel"] + '&parent=2626.live" allowfullscreen style="width: ' + livestreamWidth + ';">';
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