function Net() {
    this.sendData = function (_action, _data, _callback) {
        $.ajax({
            method: "POST",
            url: "",
            data: { action: _action, ..._data }
        }).done(function (data) {
            try {
                let d = JSON.parse(data);
                d.success = d.success == "true" ? true : false;
                if (!!_callback) _callback(d);
            }
            catch (e) {
                console.log('ERROR DATA', data);
                console.error("Error: " + e);
            }
        })
    }
    let recievedPlansza = -1;
    let playerID = -1;
    this.start = () => {
        _io.emit('getpair');
        _io.on('gamestart', function (data) {
            game.i(data.planszaid);
            game.start();
            $('#overlay').css('top', '100vh');
            $('#info').css('display', 'block');
            $('#time').css('display', 'block');
            setTimeout(() => $('#info').css('display', 'none'), 10000);
            game.playing = data.number == 0;
            $('#time').text('30s');
            let time = 30000;
            setInterval(() => {
                time -= 100;
                $('#time').text((time / 1000).toFixed(1) + 's' + (game.playing ? '[Twoja tura]' : '[Tura drugiego gracza]'));
                if (time <= 0) {
                    game.playing = !game.playing;
                    time = 30000;
                }
            }, 100);
            _io.on('updatestate', function (data) {
                game.ball.updatePos(data);
            })
        })
    }
    this.emit = function (t, d) {
        _io.emit(t, d);
    }
}