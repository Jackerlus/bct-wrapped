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
        for (let match of data[0]) {
            $('#stats-container').append(`<div class="match"><h3>Match:</h3>`);
            
            for (let key of Object.keys(match)) {
                $('#stats-container').append(`<p>${key}: ${match[key]}</p>`);
            }
            $('#stats-container').append(`</div><br>`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});