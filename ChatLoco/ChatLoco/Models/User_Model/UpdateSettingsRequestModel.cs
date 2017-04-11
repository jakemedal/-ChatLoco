﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ChatLoco.Models.Request_Model;


namespace ChatLoco.Models.User_Model
{
    public class UpdateSettingsRequestModel : RequestModel
    {
        public UserSettingsModel Settings { get; set; }
        public string Username { get; set; }
    }
}