import { CountUp } from '/js/countUp.min.js';

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
        <img src="/img/${mostPlayedAgent[0]}_icon.png" class="m-2 w-[60%] border border-2 shadow-lg rounded-lg">
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
    let kd = percentileData[0][0]["kd"];
    if (kd >= 1.3) {
        kd_remark = "okay buddy, you can toggle off now"
    } else if (kd >= 1 && kd < 1.3) {
        kd_remark = "check them PC!";
    } else {
        kd_remark = "DM senk for kovaak's playlist ;)";
    }

    let acs_remark;
    let acs = percentileData[0][0]["acs"];
    if (acs >= 230) {
        acs_remark = "certified BCT terrorist";
    } else if (acs < 230 && acs >= 200) {
        acs_remark = "ol' reliable";
    } else {
        acs_remark = "redemption arc incoming"
    }

    $('#stats-container').empty();
    $('#stats-container').append(`
        <h2 class="m-3 font-medium text-xl">Combat stats:</h2>
        <p class="m-1 font-medium text-lg">Your average K/D is <span id="kd-count" class="text-orange-500"></span></p>
        <p>Top <span id="kd-percentile-count" class="text-orange-500"></span></p>
        <p class="text-sm">${kd_remark}</p>
        <br>
        <p class="m-1 font-medium text-lg">Your average ACS is <span id="acs-count" class="text-orange-500"></span></p>
        <p>Top <span id="acs-percentile-count" class="text-orange-500"></span></p>
        <p class="text-sm">${acs_remark}</p>
        <br>
        <button id="button-next" class="m-3 p-2 max-w-15 max-h-10 font-base uppercase border-orange-400 active:bg-orange-400 hover:bg-orange-400/80 shadow-lg border rounded-lg transition-all">
            Next
        </button>
    `);
    $('#stats-container').removeClass('opacity-0 invisible').addClass('opacity-100').hide().fadeIn();

    // countup.js instantiations
    const countUpKD = new CountUp('kd-count', percentileData[0][0]["kd"], {"decimalPlaces": 2, "duration":3});
    const countUpKDPercentile = new CountUp('kd-percentile-count', (100 - percentileData[0][0]["kd_percentile"]).toFixed(0), {"decimalPlaces": 0, "suffix":"%", "duration":3});
    const countUpACS = new CountUp('acs-count', percentileData[0][0]["acs"], {"decimalPlaces": 0, "duration":3});
    const countUpACSPercentile = new CountUp('acs-percentile-count', (100 - percentileData[0][0]["acs_percentile"]).toFixed(0), {"decimalPlaces": 0, "suffix":"%", "duration":3});
    if (!countUpKD.error || !countUpKDPercentile || !countUpACS || countUpACSPercentile) {
        countUpKD.start();
        countUpKDPercentile.start();
        countUpACS.start();
        countUpACSPercentile.start();
    } else {
        console.error("countup error");
    }

    $('#button-next').on('click', function() {
        $('#button-next').remove();
        generateAssistStats(matchData, percentileData);
    });
}

function generateAssistStats(matchData, percentileData) {
    let assists_remark;
    let assists_percentile = percentileData[0][0]["assists_percentile"];
    if (assists_percentile >= 80) {
        assists_remark = "teamwork straight outta haikyuu";
    } else if (assists_percentile < 80 && assists_percentile >= 50) {
        assists_remark = "W teammate";
    } else if (assists_percentile < 50) {
        assists_remark = "L teammate";
    }

    $('#stats-container').empty();
    $('#stats-container').append(`
        <h2 class="m-3 font-medium text-xl">Assists:</h2>
        <p class="m-1 font-medium text-lg">Your assists per match is <span id="assists-count" class="text-orange-500"></span></p>
        <p>Top <span id="assists-percentile-count" class="text-orange-500"></span</p>
        <p class="m-1 text-sm">${assists_remark}</p>
        <br>
        <button id="button-next" class="m-3 p-2 max-w-15 max-h-10 font-base uppercase border-orange-400 active:bg-orange-400 hover:bg-orange-400/80 shadow-lg border rounded-lg transition-all">
            Next
        </button>
    `);

    const countUpAssists = new CountUp('assists-count', percentileData[0][0]["assists"], {"decimalPlaces": 1, "duration":3});
    const countUpAssistsPercentile = new CountUp('assists-percentile-count', (100 - percentileData[0][0]["assists_percentile"]).toFixed(0), {"decimalPlaces": 0, "suffix":"%", "duration":3});
    if (!countUpAssists.error || !countUpAssistsPercentile) {
        countUpAssists.start();
        countUpAssistsPercentile.start();
    } else {
        console.error("countup error");
    }

    $('#button-next').on('click', function() {
        $('#button-next').remove();
        generateBestMatch(matchData);
    });
}

function generateBestMatch(matchData) {
    let bestACS = [0, 0];
    let matchCount = 0;
    matchData[0].forEach(match => {
        if (match["acs"] > bestACS) {
            bestACS[0] = matchCount;
            bestACS[1] = match["acs"];
        }
    });

    $('#stats-container').empty();
    $('#stats-container').append(`
        <h2 class="m-3 font-medium text-xl">Your best performance:</h2>
        <p class="m-1 font-medium text-lg">Enemy team was ${matchData[0][bestACS[0]]["enemy_team_name"]}</p>
        <p class="m-1 font-medium text-lg">Map was ${matchData[0][bestACS[0]]["map"]}</p>
        <p class="m-1 font-medium text-lg">You were playing ${matchData[0][bestACS[0]]["agent"]}</p>
        <p class="m-1 font-medium text-lg">Your ACS was ${matchData[0][bestACS[0]]["acs"]}</p>
        <p class="m-1 font-medium text-lg">Your K/D/A was ${matchData[0][bestACS[0]]["kills"]}/${matchData[0][bestACS[0]]["deaths"]}/${matchData[0][bestACS[0]]["assists"]}</p>
        <p class="m-1 font-medium text-lg">Your damage delta was ${matchData[0][bestACS[0]]["dd"]}</p>
    `);
}
