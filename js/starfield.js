const starfield = document.getElementById("starfield");

for (let i = 0; i < 250; i++) {

    const star = document.createElement("div");

    star.className = "star";

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    star.style.width = star.style.height =
        (Math.random() * 3 + 1) + "px";

    star.style.animationDelay =
        (Math.random() * 5) + "s";

    star.style.animationDuration =
        (2 + Math.random() * 4) + "s";

    starfield.appendChild(star);

}