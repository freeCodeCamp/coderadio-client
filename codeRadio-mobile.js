if (!!window.mobilecheck()) {
    const container = document.getElementById("container");
    container.innerHTML = `
    <div class="middle">
      <iframe
        src="https://coderadio-admin.freecodecamp.org/public/coderadio/embed"
        frameborder="0"
        allowtransparency="true"
        style="width: 100%; min-height: 120px; border: 0;">
      </iframe>
      <hr />
      <p id="listeners-num"></p>
    </div>`;

    //call api and update the listener numbber
    var xhr = new XMLHttpRequest();

    function reqListener() {
        var listenerNum = JSON.parse(this.response)[0].listeners.total;
        listenerMounter(listenerNum);
        setTimeout(callMaker, 20000);
    }

    function listenerMounter(number) {
        var d = document.getElementById("listeners-num");
        d.textContent = number + " coders listening right now";
    }

    function callMaker() {
        xhr.addEventListener("load", reqListener);
        xhr.open("GET", "/app/api/nowplaying");

        xhr.send();
    }

    callMaker();
}