document.addEventListener("DOMContentLoaded", function() {
    var envelope = document.getElementById("envelope");

    envelope.addEventListener("click", function() {
        envelope.classList.add("open");
        envelope.classList.remove("close");
    });
});
