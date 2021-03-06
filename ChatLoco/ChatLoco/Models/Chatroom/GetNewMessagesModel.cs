﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatLoco.Models.Chatroom
{
    public class GetNewMessagesModel
    {
        public int ChatroomId { get; set; }
        public int UserId { get; set; }
        public List<int> ExistingMessageIds { get; set; }
        public int ParentChatroomId { get; set; }
    }
}