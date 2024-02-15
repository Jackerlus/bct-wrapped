$(window).on('load', function() {
    $("#loader-wrapper").fadeOut(700);
});

$('#button-submit').click(function() {
    const discord = $('#input-discord').val();
    console.log("Discord user received: " + discord)
    Promise.all([
        fetch('/bct-wrapped/getMatchStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ discord: discord })
        }),
        fetch('/bct-wrapped/getPercentileStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ discord: discord })
        }),
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        console.log(data);

        const matchData = data[0];
        const percentileData = data[1];

        const agent = findMostPlayedAgent(matchData);
        console.log("Most played agent: " + agent[0] + " played " + agent[1] + " times.");
        $('#stats-container').empty();
        generateBasics(matchData, agent);
        $('#button-next').click(function() {
            $('#button-next').remove();
            generateCombatStats(matchData, percentileData, agent[0]);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function findMostPlayedAgent(matchData) {
    const agentCounts = {};
    let mostPlayedAgent = ["", 0];
    matchData[0].forEach(match => {
        const agent = match.agent;
        if (agentCounts[agent]) {
            agentCounts[agent]++;
        } else {
            agentCounts[agent] = 1;
        }
    });

    for (const agent in agentCounts) {
        if (agentCounts[agent] > mostPlayedAgent[1]) {
            mostPlayedAgent[0] = agent;
            mostPlayedAgent[1] = agentCounts[agent];
        }
    };

    return mostPlayedAgent;
}

function generateBasics(matchData, mostPlayedAgent) {
    $('#basic-details').empty();
    $('#basic-details').append(`
        <img src="/img/${mostPlayedAgent[0]}_icon.png" class="m-2 max-w-50 border border-2 shadow-lg rounded-lg">
        <p class="m-1 font-medium">${matchData[0][0]["player_name"]}</p>
        <p class="m-1 font-medium">Seed ${matchData[0][0]["seed"]} &#8226; ${matchData[0][0]["team_name"]}</p>
        <button id="button-next" class="m-3 p-2 max-w-15 max-h-10 font-base uppercase border-orange-400 active:bg-orange-400 hover:bg-orange-400/80 shadow-lg border rounded-lg transition-all">
            Next
        </button>
    `);
    $('#basic-details').removeClass('opacity-0 invisible').addClass('opacity-100').hide().fadeIn();
}

function generateCombatStats(matchData, percentileData, mostPlayedAgentName) {
    console.log(percentileData);

    let kd_remark;
    if (percentileData[0][0]["kd"] >= 1) {
        kd_remark = "check them PC!";
    } else {
        kd_remark = "DM senk for kovaak's playlist ;)";
    }

    let acs_remark;
    if (percentileData[0][0]["acs_percentile"] >= 50) {
        acs_remark = "menace on the server";
    } else {
        acs_remark = "redemption arc incoming";
    }

    $('#stats-container').empty();
    $('#stats-container').append(`
        <h2 class="m-3 font-medium text-xl">Combat stats:</h2>
        <p class="m-1 font-medium">Your average K/D is ${percentileData[0][0]["kd"]} - top ${(100 - percentileData[0][0]["kd_percentile"]).toFixed(0)}%</p>
        <p class="text-sm">${kd_remark}</p>
        <br>
        <p class="m-1 font-medium">Your average ACS is ${percentileData[0][0]["acs"]} - top ${(100 - percentileData[0][0]["acs_percentile"]).toFixed(0)}%</p>
        <p class="text-sm">${acs_remark}</p>
        <br>
        <button id="button-next" class="m-3 p-2 max-w-15 max-h-10 font-base uppercase border-orange-400 active:bg-orange-400 hover:bg-orange-400/80 shadow-lg border rounded-lg transition-all">
            Next
        </button>
    `);
    $('#stats-container').removeClass('opacity-0 invisible').addClass('opacity-100').hide().fadeIn();
    $('#button-next').on('click', function() {

    });
}