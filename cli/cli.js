// - Grab the <div> that will be the location of our HTTP Request
// - Response output 
const target = document.getElementById("response");

// - Send the request

const uri = 'http://localhost/generator/api/';
let response = "";


const req = new XMLHttpRequest();

req.onload = function() {
    target.innerHTML = this.responseText;
    console.log("HTTP response: " + this.responseText);
}

req.open("GET", "http://127.0.0.1/generator/api");
req.send();

/*
fetch('http://localhost/generator/api/')
    .then(res => res.json())
    .then(data => {
        target.innerHTML = data;
        console.log('Response: ', data);
    })
    .catch(error => console.error('Error: ', error));

*/