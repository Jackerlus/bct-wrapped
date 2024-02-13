$(window).on('load', function() {
    $("#loader-wrapper").fadeOut(700);
});

// Example using fetch API
fetch('http://jacklewis.me/bct-wrapped/getAllPlayers', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ /* if you need to pass any data */ })
})
.then(response => response.json())
.then(data => {
    console.log(data); // Handle the response data here
    for (let player of data[0]) {
        $('#list-players').append(`<li>${player.username}</li>`);
    }
})
.catch(error => {
    console.error('Error:', error);
});
