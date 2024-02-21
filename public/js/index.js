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

// Gets agent most played by the player
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
        kd_remark = "we'll make a BCT legend out of you yet";
    } else {
        kd_remark = "DM senk for kovaak's playlist ;)";
    }

    let acs_remark;
    let acs = percentileData[0][0]["acs"];
    if (acs >= 230) {
        acs_remark = "certified BCT terrorist";
    } else if (acs < 230 && acs >= 190) {
        acs_remark = "ol' reliable";
    } else {
        acs_remark = "don't worry, the vibes impact is most important"
    }

    $('#stats-container').empty();
    $('#stats-container').append(`
        <h2 class="m-3 font-semibold text-xl">Combat stats:</h2>
        <p class="m-1 font-medium text-lg">Your average K/D is <span id="kd-count" class="text-orange-500"></span></p>
        <p>Top <span id="kd-percentile-count" class="text-orange-500"></span></p>
        <p class="text-sm mb-3">${kd_remark}</p>

        <p class="m-1 font-medium text-lg">Your average ACS is <span id="acs-count" class="text-orange-500"></span></p>
        <p>Top <span id="acs-percentile-count" class="text-orange-500"></span></p>
        <p class="text-sm mb-3">${acs_remark}</p>

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
    if (!countUpKD.error && !countUpKDPercentile.error && !countUpACS.error && !countUpACSPercentile.error) {
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

    let ults_remark;
    let ults_percentile = percentileData[0][0]["x_casts_percentile"];
    if (ults_percentile >= 75) {
        ults_remark = "industrial ult orb farmer";
    } else if (ults_percentile < 75 && ults_percentile >= 50) {
        ults_remark = "you dabble in the occasional ult";
    } else if (ults_percentile < 50) {
        ults_remark = "X key looking brand new";
    }

    $('#stats-container').empty();
    $('#stats-container').append(`
        <h2 class="m-3 font-semibold text-xl">Assists and Ultimates:</h2>
        <p class="m-1 font-medium text-lg">Your assists per match is <span id="assists-count" class="text-orange-500"></span></p>
        <p>Top <span id="assists-percentile-count" class="text-orange-500"></span</p>
        <p class="m-1 mb-3 text-sm">${assists_remark}</p>
        
        <p class="m-1 font-medium text-lg">Your ults per match is <span id="ults-count" class="text-orange-500"></span></p>
        <p>Top <span id="ults-percentile-count" class="text-orange-500"></span</p>
        <p class="m-1 mb-3 text-sm">${ults_remark}</p>

        <button id="button-next" class="m-3 p-2 max-w-15 max-h-10 font-base uppercase border-orange-400 active:bg-orange-400 hover:bg-orange-400/80 shadow-lg border rounded-lg transition-all">
            Next
        </button>
    `);

    const countUpAssists = new CountUp('assists-count', percentileData[0][0]["assists"], {"decimalPlaces": 1, "duration":3});
    const countUpAssistsPercentile = new CountUp('assists-percentile-count', (100 - percentileData[0][0]["assists_percentile"]).toFixed(0), {"decimalPlaces": 0, "suffix":"%", "duration":3});
    if (!countUpAssists.error && !countUpAssistsPercentile.error) {
        countUpAssists.start();
        countUpAssistsPercentile.start();
    } else {
        console.error("countup error");
    }

    const countUpUlts = new CountUp('ults-count', percentileData[0][0]["x_casts"], {"decimalPlaces": 1, "duration":3});
    const countUpUltsPercentile = new CountUp('ults-percentile-count', (100 - percentileData[0][0]["x_casts_percentile"]).toFixed(0), {"decimalPlaces": 0, "suffix":"%", "duration":3});
    if (!countUpUlts.error && !countUpUltsPercentile.error) {
        countUpUlts.start();
        countUpUltsPercentile.start();
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
        if (match["acs"] > bestACS[1]) {
            bestACS[0] = matchCount;
            bestACS[1] = match["acs"];
        }
        matchCount++;
    });

    $('#stats-container').empty();
    $('#stats-container').append(`
    <h2 class="m-3 font-medium text-2xl text-align-center">Your best performance:</h2>
    <div class="relative">
        <div class="absolute inset-0 z-0 bg-cover bg-center rounded-lg"
             style="background-image: url('img/${matchData[0][bestACS[0]]["map_name"]}.png'); filter: blur(3px);">
        </div>
        <div class="relative z-10 p-3">
            <div class="best-match-stats max-w-xs w-72">
                <p class="best-match-text font-bold text-xl text-center">vs. ${matchData[0][bestACS[0]]["enemy_team_name"]}</p>
                <p class="best-match-text m-2 text-md font-semibold text-center text-black">${matchData[0][bestACS[0]]["map_name"]}</p>
                <img src="/img/${matchData[0][bestACS[0]]["agent"]}_icon.png" class="w-32 float-left rounded-xl">
                <div class="float-right">
                    <p class="best-match-text m-1 font-semibold text-lg text-white">ACS: <span id="acs-count"></span></p>
                    <p class="best-match-text m-1 font-semibold text text-lg text-white">KDA: <span id="kills-count"></span>/<span id="deaths-count"></span>/<span id="assists-count"></span></p>
                    <p class="best-match-text m-1 font-semibold text text-lg text-white">DDΔ: <span id="dd-count"></span></p>
                    <p class="best-match-text m-1 font-semibold text text-lg text-white">ADR: <span id="adr-count"></span></p>
                </div>
            </div>
        </div>
    </div>
    `);

    const countUpACS = new CountUp('acs-count', matchData[0][bestACS[0]]["acs"], {"decimalPlaces": 0, "duration":3});
    const countUpKills = new CountUp('kills-count', matchData[0][bestACS[0]]["kills"], {"decimalPlaces": 0, "duration":3});
    const countUpDeaths = new CountUp('deaths-count', matchData[0][bestACS[0]]["deaths"], {"decimalPlaces": 0, "duration":3});
    const countUpAssists = new CountUp('assists-count', matchData[0][bestACS[0]]["assists"], {"decimalPlaces": 0, "duration":3});
    const countUpDD = new CountUp('dd-count', matchData[0][bestACS[0]]["dd"], {"decimalPlaces": 0, "duration":3});
    const countUpADR = new CountUp('adr-count', matchData[0][bestACS[0]]["adr"], {"decimalPlaces": 0, "duration":3});
    if (!countUpACS.error && !countUpKills.error && !countUpDeaths.error && !countUpAssists.error && !countUpDD.error && !countUpADR.error) {
        countUpACS.start();
        countUpKills.start();
        countUpDeaths.start();
        countUpAssists.start();
        countUpDD.start();
        countUpADR.start();
    } else {
        console.error("countup error");
    }
}
