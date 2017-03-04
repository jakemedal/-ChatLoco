﻿
var ChatroomObject = function () {

    var _AllMessages = [];
    var _AllMessagesIds = [];

    var _MessagesContainer = null;
    var _UsersContainer = null;
    var _SubChatroomsList = null;

    var _ChatroomName = null;
    var _ChatroomId = null;
    var _UserHandle = null;
    var _UserId = null;
    var _ParentChatroomId = null;
    var _PrivateChatroomRequestForm = null;
    var _UserHandleContainer = null;

    var _ParentChatroomButton = null;
    var _CreateSubChatroomsContainer = null;

    var _PrivateChatroomRequestDialog = null;

    var _GetNewMessagesInterval = null;
    var _GetChatroomInformationInterval = null;

    var Destroy = function () {
        if (_GetChatroomInformationInterval != null) {
            clearInterval(_GetChatroomInformationInterval);
        }

        if (_GetNewMessagesInterval != null) {
            clearInterval(_GetNewMessagesInterval);
        }
    }

    var init = function () {
        Destroy();

        _AllMessages = [];
        _AllMessagesIds = [];

        _MessagesContainer = $("#MessagesContainer");
        _UsersContainer = $("#UsersContainer");
        _SubChatroomsList = $("#SubChatroomsList");

        _ChatroomName = $("#ChatroomName")[0].value;
        _ChatroomId = $("#ChatroomId")[0].value;
        _UserHandle = $("#UserHandle")[0].value;
        _UserId = $("#UserId")[0].value;
        _ParentChatroomId = $("#ParentChatroomId")[0].value;
        _PrivateChatroomRequestForm = $("#private-chatroom-request-form")[0];
        _UserHandleContainer = $("#user-handle-container");

        _ParentChatroomButton = $("#ParentChatroomButton");
        _CreateSubChatroomsContainer = $("#CreateSubChatroomContainer");

        _PrivateChatroomRequestDialog = $("#private-chatroom-dialog");

        GetNewMessages();
        _GetNewMessagesInterval = setInterval(GetNewMessages, 1000);

        GetChatroomInformation();
        _GetChatroomInformationInterval = setInterval(GetChatroomInformation, 5000);

        $("#ComposeForm").on("submit", SendComposedMessage);
        $("#CreateSubChatroomForm").on("submit", CreateSubChatroom);
        $("#ParentChatroomButton").on("click", ChatroomClicked);
        $("#SubChatroomsList").on("click", ChatroomClicked);
        $("#private-chatroom-request-form").on("submit", ChatroomRequestFormSubmit);
    }

    function ChatroomClicked(e) {
        e.preventDefault();

        var $element = document.elementFromPoint(e.clientX, e.clientY);
        var $newChatroomId = $element.value;

        if (typeof $newChatroomId == 'undefined') {
            return;
        }

        _PrivateChatroomRequestForm.elements.userHandle.value = AccountHandler.GetUser().UserHandle;
        _PrivateChatroomRequestForm.elements.newChatroomId.value = $newChatroomId;

        var $buttons = [{
            text: "Chat!",
            click: ChatroomRequestFormSubmit
        }];

        _PrivateChatroomRequestDialog.dialog({
            title: "Requesting to join " + $element.textContent,
            modal: true,
            buttons: $buttons
        });

    }

    function ChatroomRequestFormSubmit(e) {
        if (e) {
            e.preventDefault();
        }

        _PrivateChatroomRequestDialog.dialog("close");
        var $userHandle = _PrivateChatroomRequestForm.elements.userHandle.value;
        _PrivateChatroomRequestForm.elements.userHandle.value = "";

        var $newChatroomId = _PrivateChatroomRequestForm.elements.newChatroomId.value;

        OpenChat($newChatroomId, $userHandle);
    }

    function OpenChat($newChatroomId, $userHandle) {
        NotificationHandler.ShowLoading();

        var $model = {
            UserId: _UserId,
            ChatroomId: $newChatroomId,
            ParentChatroomId: _ParentChatroomId,
            CurrentChatroomId: _ChatroomId,
            UserHandle: $userHandle
        };

        $.ajax({
            type: "POST",
            url: '/Chatroom/JoinChatroom',
            data: JSON.stringify($model),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                if (ErrorHandler.DisplayErrors(data)) {
                    return;
                }

                _AllMessages = [];
                _AllMessagesIds = [];
                _ChatroomId = data.Id;

                $("#ChatroomNameDisplay").html(data.Name);

                _MessagesContainer.html("");

                AccountHandler.GetUser().UserHandle = data.UserHandle;

                _UserHandleContainer.html(data.UserHandle);

                if (_ChatroomId == _ParentChatroomId) {
                    _ParentChatroomButton.removeClass("btn btn-primary").addClass("btn btn-primary");
                    _CreateSubChatroomsContainer.show();
                }
                else {
                    _ParentChatroomButton.removeClass("btn btn-primary").addClass("btn btn-secondary");
                    _CreateSubChatroomsContainer.hide();
                }

                GetChatroomInformation();
                GetNewMessages();

                NotificationHandler.HideLoading();
            },
            error: function (e) { }
        });
    }

    function GetChatroomInformation(e) {
        var $model = {
            ChatroomId: _ChatroomId,
            UserId: _UserId,
            ParentChatroomId: _ParentChatroomId
        };

        $.ajax({
            type: "POST",
            url: '/Chatroom/GetChatroomInformation',
            data: JSON.stringify($model),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {

                if (ErrorHandler.DisplayErrors(data)) {
                    return;
                }

                _UsersContainer.html("");
                for (var i = 0; i < data.UsersInformation.length; i++) {
                    var $user = data.UsersInformation[i];
                    var $username = data.UsersInformation[i].Username;
                    _UsersContainer.append("<p>" + $username + "</p>");
                }

                _SubChatroomsList.html("<br/>");
                for (var i = 0; i < data.PrivateChatroomsInformation.length; i++) {
                    var $subChatroomName = data.PrivateChatroomsInformation[i].Name;
                    var $subChatroomId = data.PrivateChatroomsInformation[i].Id;
                    var $buttonType = 'secondary';
                    if ($subChatroomId === _ChatroomId) {
                        $buttonType = 'primary';
                    }
                    _SubChatroomsList.append('<p><button value="' + $subChatroomId + '" type="button" class="btn btn-' + $buttonType + '">' + $subChatroomName + '</button></p>');
                }

            },
            error: function (data) { }
        });
    }

    function CreateSubChatroom(e) {
        e.preventDefault();

        NotificationHandler.ShowLoading();

        var $form = this;

        var $subChatroomName = $form[0].value;

        var $model = {
            ChatroomName: $subChatroomName,
            UserId: _UserId,
            ParentChatroomId: _ParentChatroomId
        };

        $.ajax({
            type: "POST",
            url: '/Chatroom/CreateChatroom',
            data: $model,
            success: function (data) {

                if (ErrorHandler.DisplayErrors(data)) {
                    return;
                }

                var $responseMessage = "";

                $responseMessage = "<p>Chatroom " + data.ChatroomName + " created successfully.</p>";
                GetChatroomInformation();

                var $subChatroomDialog = $('#SubChatroomDialog');

                $subChatroomDialog.html("").append($responseMessage);
                $subChatroomDialog.dialog({
                    modal: true,
                    buttons: {
                        Ok: function () {
                            $(this).dialog("close");
                        }
                    }
                });

                $form[0].value = "";

                NotificationHandler.HideLoading();
            },
            error: function () { }
        });
    }

    function SendComposedMessage(e) {
        e.preventDefault();

        var $form = this;

        var $message = $form[0].value;

        var $model = {
            Message: $message,
            ChatroomId: _ChatroomId,
            UserId: _UserId,
            ParentChatroomId: _ParentChatroomId
        };

        $.ajax({
            type: "POST",
            url: '/Chatroom/ComposeMessage',
            data: $model,
            success: function (data) {

                if (ErrorHandler.DisplayErrors(data)) {
                    return;
                }

                $form[0].value = "";
            },
            error: function () {
            }
        });

    }

    function GetChatroomId() {
        return _ChatroomId;
    }

    function GetParentChatroomId() {
        return _ParentChatroomId;
    }

    function GetNewMessages() {
        var $model = {
            ChatroomId: _ChatroomId,
            UserId: _UserId,
            ExistingMessageIds: _AllMessagesIds,
            ParentChatroomId: _ParentChatroomId
        };

        $.ajax({
            type: "POST",
            url: '/Chatroom/GetNewMessages',
            data: JSON.stringify($model),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                for (var i = 0; i < data.MessagesInformation.length; i++) {
                    var $newMessage = data.MessagesInformation[i].FormattedMessage;

                    _MessagesContainer.append("<p>" + $newMessage + "</p>");

                    _AllMessages.push($newMessage);
                    _AllMessagesIds.push(data.MessagesInformation[i].Id);
                }
                if (data.MessagesInformation.length != 0) {
                    _MessagesContainer.scrollTop(_MessagesContainer[0].scrollHeight);
                }
            },
            error: function (data) {
            }
        });
    }

    return {
        init: init,
        Destroy: Destroy,
        GetChatroomId: GetChatroomId,
        GetParentChatroomId: GetParentChatroomId
    }
}

var ChatroomHandler = new ChatroomObject();
