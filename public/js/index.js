$(window).on('load', function() {
    $("#loader-wrapper").fadeOut(700);
});

$('#button-submit').click(function() {
    const discord = $('#input-discord').val();
    console.log("Discord user received: " + discord)
    fetch('/bct-wrapped/getPlayerStats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ discord: discord })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Handle the response data here

        const agentCounts = {};
        let mostPlayedAgent = ["", 0];
        data[0].forEach(match => {
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
        console.log("Most played agent: " + mostPlayedAgent[0] + " played " + mostPlayedAgent[1] + " times.");


        $('#stats-container').empty();
        $('#stats-container').append(`
            <div class="basic-details grid opacity-0 invisible justify-items-center">
                <img src="/img/${mostPlayedAgent[0]}_icon.png" class="max-w-50 border border-2 shadow-lg rounded-lg">
                <p class="m-1 font-medium">${data[0][0]["player_name"]}</p>
                <p class="m-1 font-medium">Seed ${data[0][0]["seed"]} &#8226; ${data[0][0]["team_name"]}</p>
            </div>
        `);
        $('.basic-details').removeClass('opacity-0 invisible').addClass('opacity-100').hide().fadeIn();
    })
    .catch(error => {
        console.error('Error:', error);
    });
});