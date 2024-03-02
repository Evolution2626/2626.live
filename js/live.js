var tbaKey = "wZjnIpA1EB2hq82k6hsmGHAGcsuqHJHrjLOeWp6MJTPuviWiUyipqLZsfa9kE3Ze"

fetch("https://www.thebluealliance.com/api/v3/team/frc2626/events?X-TBA-Auth-Key=" + tbaKey).then(function(response){
    response.json().then(function(data){
        eventListSorted = data;
        eventListSorted.sort(function(a,b){return new Date(a["start_date"]) - new Date(b["start_date"])});
        console.log(eventListSorted);

        let currentEvent = getCurrentEventFromSortedEventList(eventListSorted);

        if (!currentEvent){
            noCurrentEvent()
        }else{
        
            loadSideBarFormCurrentEvent(currentEvent);

            loadMatchFromEvent(currentEvent["key"]);

            var sidebarEventLoop = setInterval(function(){ loadMatchFromEvent(currentEvent["key"]) }, 70000)

            loadLivestreamsForEvent(currentEvent);
        }
    })
})

function noCurrentEvent(){
    document.getElementById("livestreamsDiv").innerHTML = '<h2 style="text-align: center;">Nous ne sommes pas présentement en compétition.</h2>'
    document.getElementById("livestreamsDiv").innerHTML += '<h3 style="text-align: center;"><a href="/archives">Cliquez ici pour revisionner nos matchs.</a></h2>'
}


function daysBetweenDates(d1, d2){
    return (Math.abs(d1.getTime() - d2.getTime()) / (1000*60*60*24))
}

function getCurrentEventFromSortedEventList(sortedEventList){

    nextOrCurrentEvent = null;

    for (let i = 0; i < sortedEventList.length; i++) {
        const event = sortedEventList[i];
        
        if (daysBetweenDates(new Date(), new Date(event["start_date"])) <= 14) {
            if (!nextOrCurrentEvent || new Date(nextOrCurrentEvent["end_date"]) >= new Date() || new Date(event["start_date"]) <= new Date()) {
                if (event["key"] != "2022cmptx") { //quick fix pour le championship de houston en 2022. Va peut-être causé probleme si on est sur einstein ;)
                    nextOrCurrentEvent = event;
                }
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
        return dateToText(new Date(match["predicted_time"]*1000));
    }

    if (match["time"]) {
        return dateToText(new Date(match["time"]*1000));
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


    fetch("https://www.thebluealliance.com/api/v3/team/frc2626/event/" + eventKey + "/status?X-TBA-Auth-Key=" + tbaKey).then(function(response){
        response.json().then(function(data){
            let statusStr = generateStatusStringFromTeamAtEventStatus(data);
            document.getElementById("competitionStatusStr").innerHTML = statusStr;
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
                if(webcast["channel"] == "firstinspires23") webcast["channel"] = "firstinspires25";
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
        dateText += d.toLocaleDateString("fr-CA", { month: 'long', day: 'numeric'}) + " à ";
    }

    dateText += d.getHours() + ":" + ('0' + d.getMinutes()).slice(-2);

    return dateText;

}

function generateStatusStringFromTeamAtEventStatus(status) {
    let statusString = "Nous sommes en attente du début de l'événement.";

    if (!status) {
        return statusString;
    }

    let qualStatusString = "";
    let playoffStatusString = "";
    if (status["qual"] && status["qual"]["ranking"]) {
        let qualStatusStringSuffix = "au <b>rang " + status["qual"]["ranking"]["rank"] + "/" + status["qual"]["num_teams"] + "</b>";
        if (status["qual"]["ranking"]["record"]) {
            qualStatusStringSuffix += " avec une fiche de <b>" + status["qual"]["ranking"]["record"]["wins"] + "-" + status["qual"]["ranking"]["record"]["losses"] + "-" + status["qual"]["ranking"]["record"]["ties"] + "</b>";
        }
        qualStatusStringSuffix += " en ronde de qualification. ";
        if (status["playoff"] || status["status"] == "completed") {
            qualStatusString = "Nous étions " + qualStatusStringSuffix;
        }else{
            qualStatusString = "Nous sommes " + qualStatusStringSuffix;
        }
    }

    if (status["playoff"]){
        let playoffAlliancePickString = "";
        if (status["alliance"]){
            if (status["alliance"]["pick"] == 0) {
                playoffAlliancePickString = "comme <b>capitaine";
            }else{
                playoffAlliancePickString = "comme <b>choix #" + status["alliance"]["pick"];
            }
            if (status["alliance"]["backup"] && status["alliance"]["backup"]["in"] == "frc2626") {
                playoffAlliancePickString = "comme <b>robot de backup";
            }
            playoffAlliancePickString += "</b> de <b>l'" + status["alliance"]["name"] + "</b>";
            if (status["playoff"]["status"] == "won" || status["playoff"]["status"] == "eliminated") {
                playoffStatusString = "Nous avons été en séries éliminatoires " + playoffAlliancePickString + ".";
            }else{
                playoffStatusString = "Nous sommes présentement en " + getSetNameFromKey(status["playoff"]["level"]) + " " + playoffAlliancePickString + ".";
            }
        }

        if (status["playoff"]["status"] == "won"){
            playoffStatusString += " Nous avons <b>gagné l'événement</b>.";
        } else if (status["playoff"]["status"] == "eliminated"){
            playoffStatusString += " Nous avons <b>été éliminés en " + getSetNameFromKey(status["playoff"]["level"]) + "</b>";
        }

        if (status["playoff"]["record"]) {
            playoffStatusString += " avec une fiche de <b>" + status["playoff"]["record"]["wins"] + "-" + status["playoff"]["record"]["losses"] + "-" + status["playoff"]["record"]["ties"] + "</b> en séries.";
        }
    }

    if (qualStatusString != "" || playoffStatusString != "") {
        statusString = qualStatusString + " " + playoffStatusString;
    }

    return statusString;
    
}

function getSetNameFromKey(setKey){
    switch (setKey) {
        case "ef":
            return "huitièmes de finale"
            break;
        case "qf":
            return "quart de finale"
            break;
        case "sf":
            return "demi-finale"
            break;
        case "f":
            return "finale"
            break;
    
        default:
            return "qualification";
            break;
    }
}
