import { CountUp } from '/js/countUp.min.js';

$(window).on('load', function() {
    $("#loader-wrapper").fadeOut(700);
});

/*  NOTE: This below event handler triggers the wrapped event chain.
    Data is pulled via three different DB queries. Some of this returns redundant data:

    - GetMatchStats calls the GetPlayerWrappedMatches stored procedure.
        This selects match_player_data rows only where the given player was participating.
    - GetPercentileStats calls the GetPlayerWrappedPercentiles procedure.
        This selects key player stat averages across their played matches and works out a
        percentile for those stats compared to every other player.
    - GetMatchPlayerData calls the GetAllMatchPlayerData procedure.
        This procedure just selects all match_player_data rows. This was necessary because
        it was too complicated to get the specific percentiles and averages of the agent
        performance of a player compared to their peers via SQL only, so I opted to manipulate
        all the match_player_data rows in an object myself instead.

    Since the last one required all data be pulled anyway, it may be worth moving the other 2
    procedures into javascript also to keep things consistent.
*/

$('#button-submit').click(function() {
    const discord = $('#input-discord').val();
    console.log("Discord user received: " + discord)
    Promise.all([
        fetch('/bct-wrapped/GetMatchStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ discord: discord })
        }),
        fetch('/bct-wrapped/GetPercentileStats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ discord: discord })
        }),
        fetch('/bct-wrapped/GetMatchPlayerData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ discord: discord })
        })
    ])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(data => {
        console.log(data);

        const matchData = data[0];
        const percentileData = data[1];
        const matchPlayerData = data[2];

        const agent = findMostPlayedAgent(matchData);
        console.log("Most played agent: " + agent[0] + " played " + agent[1] + " times.");
        $('#stats-container').empty();

        
        
        generateBasics(matchData, agent);
        $('#button-next').click(function() {
            /* Every time we want to generate a new section we need to remove the button first
            so it can be created with the next generation function if necessary. */
            $('#button-next').remove();
            generateCombatStats(matchData, percentileData, matchPlayerData, agent);
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

// K/D and ACS stat reports
function generateCombatStats(matchData, percentileData, matchPlayerData, agent) {
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
        generateAssistStats(matchData, percentileData, matchPlayerData, agent);
    });
}

// Assist and ultimate cast stat reports
function generateAssistStats(matchData, percentileData, matchPlayerData, agent) {
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
        generateBestMatch(matchData, matchPlayerData, agent);
    });
}

// Best match performance report
function generateBestMatch(matchData, matchPlayerData, agent) {
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
    <h2 class="m-3 font-semibold text-xl text-align-center">Your best performance:</h2>
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

    <button id="button-next" class="m-5 p-2 max-w-15 max-h-10 font-base uppercase border-orange-400 active:bg-orange-400 hover:bg-orange-400/80 shadow-lg border rounded-lg transition-all">
        Next
    </button>

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

    $('#button-next').on('click', function() {
        $('#button-next').remove();
        console.log("Generating agent data");
        generateAgentPerformance(matchData, matchPlayerData, agent);
    });

}

// Most played agent performance (maybe change to just best agent performance altogether)
function generateAgentPerformance(matchData, matchPlayerData, agent) {
    console.log("Agent: " + agent[0]);
    const filteredData = matchPlayerData[0].filter(matchPlayer => matchPlayer.agent_name === agent[0]);

    // Calculate average acs for each player
    const playerAcs = {};
    filteredData.forEach(matchPlayer => {
        if (!playerAcs[matchPlayer.player_name]) {
            playerAcs[matchPlayer.player_name] = { totalAcs: 0, count: 0 };
        }
        playerAcs[matchPlayer.player_name].totalAcs += matchPlayer.acs;
        playerAcs[matchPlayer.player_name].count++;
    });

    // Calculate average acs and store in an array of key-value pairs
    const averageAcsArray = [];
    for (const player in playerAcs) {
        const averageAcs = playerAcs[player].totalAcs / playerAcs[player].count;
        averageAcsArray.push({ player, averageAcs });
    }

    // Sort the array by averageAcs in descending order
    averageAcsArray.sort((a, b) => b.averageAcs - a.averageAcs);
    console.log(averageAcsArray);

    // Find the index of the element with the given player_name
    const index = averageAcsArray.findIndex(element => element.player === matchData[0][0]["player_name"]);

    // Calculate percentile for the element
    const totalAgentPlayers = averageAcsArray.length;
    const percentile = ((index + 1) / totalAgentPlayers) * 100;

    console.log("Percentile for this player's agent performance: " + percentile + "%");

    let agent_acs_remark;
    if (percentile <= 10) {
        agent_acs_remark = `one of the greatest ${agent[0]}s of our time`;
    } else if (percentile > 10 && percentile <= 40) {
        agent_acs_remark = `promising talent in the ${agent[0]} department`;
    } else if (percentile > 40) {
        agent_acs_remark = "watch boaster's youtube videos and we'll get you to top 3 no cap";
    }

    $('#stats-container').empty();
    $('#stats-container').append(`
        <h2 class="m-3 font-semibold text-xl text-center">Performance on your most played agent:</h2>
        <div class="max-w-xs w-72 justify-items-center grid">
            <div class="justify-items-center grid">
                <p class="m-1 font-medium text-lg">Your ACS on ${agent[0]} is <span id="agent-acs-count"></span></p>
                <p><span id="agent-acs-num-count" class="text-orange-500"></span> out of <span id="total-agent-players-count" class="text-orange-500"></span> ${agent[0]} players</p>
                <p class="text-sm mb-3 mt-1">${agent_acs_remark}</p>
            </div>
        <p class="text-sm text-center mt-7 font-medium">That's all for your BCT 6 Wrapped. See you next tournament.</p>
        <p class="text-center text-xs mt-2">created by jackerlus</p>
        <p class="text-center text-xs mt-1">based on BCT Stats system developed by jackerlus and bayfish</p>
        </div>

    `);

    const countUpAgentACS = new CountUp('agent-acs-count', averageAcsArray[index]["averageAcs"], {"decimalPlaces": 0, "duration":3});
    console.log(countUpAgentACS);
    const countUpAgentACSNum = new CountUp('agent-acs-num-count', index + 1, {"prefix":"#", "decimalPlaces": 0, "duration":3});
    console.log(countUpAgentACSNum);
    // const countUpAgentACSPercentile = new CountUp('agent-acs-percentile-count', percentile, {"suffix":"%", "decimalPlaces": 0, "duration":3});
    // console.log(countUpAgentACSPercentile);
    const countUpTotalAgentPlayers = new CountUp('total-agent-players-count', averageAcsArray.length, {"decimalPlaces": 0, "duration":3});
    console.log(countUpTotalAgentPlayers);

    if (!countUpAgentACS.error && !countUpAgentACSNum.error && !countUpTotalAgentPlayers.error) {
        countUpAgentACS.start();
        countUpAgentACSNum.start();
        countUpTotalAgentPlayers.start();
        // countUpAgentACSPercentile.start();
    } else {
        console.error("countup error");
    }
}