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
        $('#stats-container').empty();
        $('#stats-container').append(`
            <div class="basic-details grid justify-items-center">
                <img src="/img/Astra_icon.png" class="max-w-50 border border-2 shadow-lg rounded-lg">
                <p class="m-1 font-medium">${data[0][0]["player_name"]}</p>
                <p class="m-1 font-medium">Seed ${data[0][0]["seed"]} &#8226; ${data[0][0]["team_name"]}</p>
                <p class="m-1 font-medium"></p>
            </div>
        `);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});