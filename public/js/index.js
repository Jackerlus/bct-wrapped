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
        $('#list-players').append(`<li>Data received</li>`);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});