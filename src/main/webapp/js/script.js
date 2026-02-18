$(function () {
    let header = $('.header');
    let panel = $('.panel');
    let pageCount;
    let pageSize = 3;
    let pageNumber;
    let professionList = ["WARRIOR", "ROGUE", "SORCERER", "CLERIC", "PALADIN", "NAZGUL", "WARLOCK", "DRUID"];
    let raceList = ["HUMAN", "DWARF", "ELF", "GIANT", "ORC", "TROLL", "HOBBIT"];
    let bannedList = ["true", "false"];

    $.get('', {}, function () {
        header.css({display: 'flex'});
        panel.css({display: 'flex'});
        clearTable();
        getPlayers();
        getPagesCount();
        createButtonClick();
    });

    let createButtonClick = function () {
        $('.create-button').on('click', function () {
            let name = $('.create-label-name').children().val();
            let title = $('.create-label-title').children().val();
            let race = $('.create-label-race').children().val();
            let profession = $('.create-label-profession').children().val();
            let level = $('.create-label-level').children().val();
            let birthdate = new Date($('.create-label-birthdate').children().val());
            let banned = $('.create-label-banned').children().val();

            if (name === "" || title === "" || race === "" || profession === "" || isNaN(birthdate.getTime()) || level === "") {
                alert("Not all parameters are specified.");
                return;
            }
            if (birthdate.getFullYear() < 2000 || birthdate.getFullYear() > 3000) {
                alert("The year of birth must be between 2000 and 3000.");
                return;
            }
            if (level > 100) {
                alert("The player's level cannot be greater than 100.");
                return;
            }

            console.log(JSON.stringify({name: name, title: title, race: race, profession: profession, level: level, birthday: birthdate.getTime(), banned: banned}),);
            $.ajax({
                url: 'rest/players',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({name: name, title: title, race: race, profession: profession, level: level, birthday: birthdate.getTime(), banned: banned}),
                success: function() {
                    clearTable();
                    getPlayers();
                    getPagesCount();
                }
            });
        });

    }

    let deleteButtonClick = function () {
        $('.delete-button').on('click', function () {
            let indexLine = $(this).closest('td').parent().index();
            let idPlayer = $('.panel').find('tr').eq(indexLine).children().eq(0).html();
            $.ajax({
                url: `rest/players/${idPlayer}`,
                type: 'DELETE',
                success: function() {
                    clearTable();
                    getPlayers();
                    getPagesCount();
                }
            });
        });
    }

    let saveButtonClick = function () {
        $('.save-button-img').on('click', function () {
            let indexLine = $(this).closest('td').parent().index();
            let idPlayer = $('.panel').find('tr').eq(indexLine).children().eq(0).html();
            let line = panel.find('tr').eq(indexLine);
            let name = line.find('.playerName').children().val();
            let title = line.find('.playerTitle').children().val();
            let race = line.find('.playerRace').children().val();
            let profession = line.find('.playerProfession').children().val();
            let banned = line.find('.playerBanned').children().val();

            $.ajax({
                url: `rest/players/${idPlayer}`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({name: name, title: title, race: race, profession: profession, banned: banned}),
                success: function() {
                    clearTable();
                    getPlayers();
                    getPagesCount();
                }
            });
        })
    }

    let editButtonClick = function () {
        $('.edit-button-img').on('click', function () {
            let indexLine = $(this).closest('td').parent().index();
            changeLine(indexLine);
        });
    }

    let changeLine = function (indexLine) {
        let line = panel.find('tr').eq(indexLine);
        changeCellOfPanel(line.find('.playerName'));
        changeCellOfPanel(line.find('.playerTitle'));
        changeCellOfPanel(line.find('.playerRace'));
        changeCellOfPanel(line.find('.playerProfession'));
        changeCellOfPanel(line.find('.playerBanned'));
        line.find('.save-button-img').show();
        line.find('.edit-button-img').hide();
    }

    let changeCellOfPanel = function (element) {
        let elementValue = element.html();
        element.html("");
        if (element.attr('class') === "playerProfession") {
            changeCellProfession(element, elementValue);
        } else if (element.attr('class') === "playerRace") {
            changeCellRace(element, elementValue);
        } else if (element.attr('class') === "playerBanned") {
            changeCellBanned(element, elementValue);
        } else {
            element.html("").append(`<input type="text" value="${elementValue}">`);
        }
    }

    let changeCellProfession = function (element, elementValue) {
        let elementSelect = element.append(`<select>${elementValue}</select>`).children();

        for (let i = 0; i < professionList.length; i++) {
            if (elementValue === professionList[i]) {
                elementSelect.append(`<option selected>${professionList[i]}</option>`);
            } else {
                elementSelect.append(`<option>${professionList[i]}</option>`);
            }
        }
    };
    let changeCellRace = function (element, elementValue) {
        let elementSelect = element.append(`<select></select>`).children();
        for (let i = 0; i < raceList.length; i++) {
            if (elementValue === raceList[i]) {
                elementSelect.append(`<option selected>${raceList[i]}</option>`);
            } else {
                elementSelect.append(`<option>${raceList[i]}</option>`);
            }
        }
    };

    let changeCellBanned = function (element, elementValue) {
        let elementSelect = element.append(`<select></select>`).children();
        for (let i = 0; i < bannedList.length; i++) {
            if (elementValue === bannedList[i]) {
                elementSelect.append(`<option selected>${bannedList[i]}</option>`);
            } else {
                elementSelect.append(`<option>${bannedList[i]}</option>`);
            }
        }
    };

    let getPagesCount = function () {
        $.get('rest/players/count', {}, function (response) {
            $('.page-button').remove();
            pageCount = response/pageSize;
            if (response % pageSize > 0) {
                pageCount++;
            }
            for (let i = 1; i <= pageCount; i++) {
                $('.pages').append('<button class="page-Button" id="page-'+ i +'">' + i + '</button>');
            }
            if (pageNumber) {
                $(`#page-${pageNumber}`).addClass('selected-page');
            } else {
                $('#page-1').addClass('selected-page');
            }
            pageButtonClick();
        });
    }

    let pageButtonClick = function () {
        $('.page-Button').on("click", function () {
            pageNumber = $(this).index() - 1;
            $('.selected-page').removeClass('selected-page');
            $(this).addClass('selected-page');
            clearTable();
            getPlayers();
        });
    }

    $('.count').on( "change", function() {
        pageSize = $('.count').val();
        pageNumber = 0;
        clearTable();
        getPlayers();
        getPagesCount();
    } );

    let getPlayers = function () {
        $.get('rest/players', {pageSize:pageSize, pageNumber:pageNumber}, function (response) {
            //$('.table-line').remove();
            for (let i in response) {
                panel.append(getPlayerElement(response[i]));
            }
            deleteButtonClick();
            editButtonClick();
            saveButtonClick();
        });
    }

    let getPlayerElement = function (player) {
        let playerElement = $('<tr class="table-line"></tr>');
        let birthDay = new Date(player.birthday);
        playerElement.append('<td class="playerId">' + player.id + '</td>');
        playerElement.append('<td class="playerName">' + player.name + '</td>');
        playerElement.append('<td class="playerTitle">' + player.title + '</td>');
        playerElement.append('<td class="playerRace">' + player.race + '</td>');
        playerElement.append('<td class="playerProfession">' + player.profession + '</td>');
        playerElement.append('<td class="playerLevel">' + player.level + '</td>');
        playerElement.append('<td class="playerBirthday">' + formatDate(birthDay) + '</td>');
        playerElement.append('<td class="playerBanned">' + player.banned + '</td>');
        playerElement.append('<td class="edit-button"><img class="edit-button-img" src="/img/edit.png" alt="">' +
            '<img class="save-button-img" src="/img/save.png" alt="" hidden="hidden"></td>');
        playerElement.append('<td><img class="delete-button" src="/img/delete.png" alt=""></td>');

        return playerElement;
    }

    let clearTable = function () {
        $('.table-line').remove();
    }

    function formatDate(date) {

        let dd = date.getDate();
        if (dd < 10) dd = '0' + dd;

        let mm = date.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;

        let yy = date.getFullYear();

        return dd + '/' + mm + '/' + yy;
    }
});
