function Ui() {

    $('#search').click(function () {
        $('.block').empty().append($('<h4>').text('Czekanie na drugiego gracza'));
        net.start();
    })
}